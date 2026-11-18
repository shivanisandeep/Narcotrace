"""NarcoTrace backend (FastAPI). Run:  uvicorn app.main:app --reload
Set DATABASE_URL (postgresql+psycopg://...) ; falls back to local SQLite for dev."""
import base64, os
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import Session

from . import custody as ch, security as sec
from .models import Base, Officer, Evidence, CustodyEvent
from .form6 import build_form6

engine = create_engine(os.environ.get("DATABASE_URL", "sqlite:///./narcotrace.db"))
Base.metadata.create_all(engine)
app = FastAPI(title="NarcoTrace API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])


def db():
    with Session(engine) as s:
        yield s


def me(authorization: str = Header(...)) -> dict:
    try:
        return sec.read_token(authorization.removeprefix("Bearer "))
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


class LoginIn(BaseModel):
    officer_id: str
    password: str


@app.post("/auth/login")
def login(body: LoginIn, s: Session = Depends(db)):
    o = s.get(Officer, body.officer_id)
    if not o or not sec.pwd.verify(body.password, o.password_hash):
        raise HTTPException(401, "Bad credentials")
    return {"token": sec.make_token(o.officer_id, o.role), "name": o.name, "role": o.role}


class CustodyIn(BaseModel):
    payload: dict      # label, timestamp, actor, location, gpsVerified
    prev_hash: str
    hash: str          # computed ON DEVICE; server recomputes and compares


class EvidenceIn(BaseModel):
    id: str; case_id: str; test_kit_id: str; sample_type: str
    verdict: str; substance: str; confidence: float; reaction_color: str; model_version: str
    captured_at: datetime; lat: float; lng: float; location: str = ""
    temperature_c: float | None = None; lighting_lux: float | None = None
    device_id: str; image_sha256: str; image_b64: str
    custody: list[CustodyIn]; extra: dict = {}


@app.post("/sync/evidence", status_code=201)
def sync_evidence(body: EvidenceIn, user=Depends(me), s: Session = Depends(db)):
    """Called by the offline queue. Idempotent: re-sending the same id is a safe no-op."""
    if user["role"] != "field_officer":
        raise HTTPException(403, "Only field officers can upload")
    if s.get(Evidence, body.id):
        return {"status": "already_synced"}
    img = base64.b64decode(body.image_b64)
    if ch.sha256_hex(img) != body.image_sha256:
        raise HTTPException(422, "Image hash mismatch - photo altered or corrupted in transit")
    ok, bad = ch.verify_chain([c.model_dump() for c in body.custody])
    if not ok:
        raise HTTPException(422, f"Custody chain broken at event {bad}")
    ev = Evidence(
        id=body.id, case_id=body.case_id, officer_id=user["sub"], test_kit_id=body.test_kit_id,
        sample_type=body.sample_type, verdict=body.verdict, substance=body.substance,
        confidence=body.confidence, reaction_color=body.reaction_color, model_version=body.model_version,
        captured_at=body.captured_at, lat=body.lat, lng=body.lng, location=body.location,
        temperature_c=body.temperature_c, lighting_lux=body.lighting_lux, device_id=body.device_id,
        image_sha256=body.image_sha256, image_enc=sec.encrypt(img), extra=body.extra,
    )
    s.add(ev)
    for i, c in enumerate(body.custody):
        s.add(CustodyEvent(evidence_id=body.id, seq=i, payload=c.payload, prev_hash=c.prev_hash, hash=c.hash))
    s.commit()
    return {"status": "synced"}


class TransferIn(BaseModel):
    label: str; actor: str; location: str = ""


@app.post("/evidence/{eid}/custody")
def add_custody(eid: str, body: TransferIn, user=Depends(me), s: Session = Depends(db)):
    """Server-side append (e.g. 'Laboratory Received'); server links the new hash itself."""
    last = s.scalars(select(CustodyEvent).where(CustodyEvent.evidence_id == eid)
                     .order_by(CustodyEvent.seq.desc())).first()
    if not last:
        raise HTTPException(404, "Unknown evidence")
    payload = {**body.model_dump(), "timestamp": datetime.utcnow().isoformat() + "Z", "by": user["sub"]}
    s.add(CustodyEvent(evidence_id=eid, seq=last.seq + 1, payload=payload,
                       prev_hash=last.hash, hash=ch.link_hash(last.hash, payload)))
    s.commit()
    return {"ok": True}


@app.get("/evidence/{eid}/verify")
def verify(eid: str, user=Depends(me), s: Session = Depends(db)):
    evs = s.scalars(select(CustodyEvent).where(CustodyEvent.evidence_id == eid).order_by(CustodyEvent.seq)).all()
    ok, bad = ch.verify_chain([{"payload": e.payload, "prev_hash": e.prev_hash, "hash": e.hash} for e in evs])
    ev = s.get(Evidence, eid)
    img_ok = ev is not None and ch.sha256_hex(sec.decrypt(ev.image_enc)) == ev.image_sha256
    return {"chain_ok": ok, "broken_at": bad, "image_ok": img_ok}


@app.get("/evidence/{eid}/form6.pdf")
def form6(eid: str, user=Depends(me), s: Session = Depends(db)):
    ev = s.get(Evidence, eid)
    if not ev:
        raise HTTPException(404)
    evs = s.scalars(select(CustodyEvent).where(CustodyEvent.evidence_id == eid).order_by(CustodyEvent.seq)).all()
    ok, _ = ch.verify_chain([{"payload": e.payload, "prev_hash": e.prev_hash, "hash": e.hash} for e in evs])
    off = s.get(Officer, ev.officer_id)
    d = {c.name: getattr(ev, c.name) for c in ev.__table__.columns}
    d.update(officer_name=off.name if off else ev.officer_id, captured_at=ev.captured_at.isoformat())
    return Response(build_form6(d, ok), media_type="application/pdf")


@app.get("/dashboard/summary")
def summary(user=Depends(me), s: Session = Depends(db)):
    if user["role"] not in ("zonal_admin", "lab", "prosecutor"):
        raise HTTPException(403)
    by_verdict = dict(s.execute(select(Evidence.verdict, func.count()).group_by(Evidence.verdict)).all())
    hotspots = [{"lat": r[0], "lng": r[1], "n": r[2]} for r in s.execute(
        select(func.round(Evidence.lat, 2), func.round(Evidence.lng, 2), func.count())
        .where(Evidence.verdict == "positive").group_by(func.round(Evidence.lat, 2), func.round(Evidence.lng, 2))).all()]
    return {"by_verdict": by_verdict, "hotspots": hotspots}
