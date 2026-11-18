from datetime import datetime
from sqlalchemy import String, Float, Integer, Boolean, DateTime, ForeignKey, JSON, LargeBinary
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Officer(Base):
    __tablename__ = "officers"
    officer_id: Mapped[str] = mapped_column(String(20), primary_key=True)  # OFF-1042
    name: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(20), default="field_officer")
    zone: Mapped[str] = mapped_column(String(80), default="")
    password_hash: Mapped[str] = mapped_column(String(100))


class Evidence(Base):  # mirrors EvidenceRecord in src/types/index.ts
    __tablename__ = "evidence"
    id: Mapped[str] = mapped_column(String(20), primary_key=True)  # NT-2026-00142 (generated on device)
    case_id: Mapped[str] = mapped_column(String(40), index=True)
    officer_id: Mapped[str] = mapped_column(ForeignKey("officers.officer_id"))
    test_kit_id: Mapped[str] = mapped_column(String(30))
    sample_type: Mapped[str] = mapped_column(String(100))
    verdict: Mapped[str] = mapped_column(String(15))  # positive|negative|inconclusive
    substance: Mapped[str] = mapped_column(String(80))
    confidence: Mapped[float] = mapped_column(Float)
    reaction_color: Mapped[str] = mapped_column(String(40))
    model_version: Mapped[str] = mapped_column(String(30))
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    location: Mapped[str] = mapped_column(String(120), default="")
    temperature_c: Mapped[float] = mapped_column(Float, nullable=True)
    lighting_lux: Mapped[float] = mapped_column(Float, nullable=True)
    device_id: Mapped[str] = mapped_column(String(40))
    image_sha256: Mapped[str] = mapped_column(String(64))  # hash of the ORIGINAL photo bytes, made on device
    image_enc: Mapped[bytes] = mapped_column(LargeBinary)  # AES-GCM encrypted photo
    extra: Mapped[dict] = mapped_column(JSON, default=dict)  # inconclusive reasons etc.
    custody: Mapped[list["CustodyEvent"]] = relationship(order_by="CustodyEvent.seq", back_populates="evidence")


class CustodyEvent(Base):
    __tablename__ = "custody_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    evidence_id: Mapped[str] = mapped_column(ForeignKey("evidence.id"), index=True)
    seq: Mapped[int] = mapped_column(Integer)
    payload: Mapped[dict] = mapped_column(JSON)  # label, timestamp, actor, location, gpsVerified
    prev_hash: Mapped[str] = mapped_column(String(64))
    hash: Mapped[str] = mapped_column(String(64))
    evidence: Mapped[Evidence] = relationship(back_populates="custody")
