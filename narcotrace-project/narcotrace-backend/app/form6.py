"""Auto-fill a FORM-6 style Test Memo PDF.
IMPORTANT: layout/wording below is a PLACEHOLDER. Replace the field list with the exact
official FORM-6 text from the NDPS (Seizure, Storage, Sampling & Disposal) Rules, 2022,
and get it checked by your guide / a legal expert before demoing it as 'official'."""
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def build_form6(ev: dict, chain_ok: bool) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    y = h - 25 * mm
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(w / 2, y, "FORM-6  -  TEST MEMO")
    y -= 6 * mm
    c.setFont("Helvetica", 8)
    c.drawCentredString(w / 2, y, "[Draft - replace with official wording of Rule 13(2), NDPS Rules 2022]")
    y -= 12 * mm
    rows = [
        ("Evidence ID", ev["id"]), ("Case ID", ev["case_id"]),
        ("Officer", f'{ev["officer_name"]} ({ev["officer_id"]})'),
        ("Date/time of test", ev["captured_at"]), ("Place", f'{ev["location"]} ({ev["lat"]:.5f}, {ev["lng"]:.5f})'),
        ("Sample description", ev["sample_type"]), ("Test kit", ev["test_kit_id"]),
        ("Observed reaction colour", ev["reaction_color"]),
        ("Preliminary result", f'{ev["verdict"].upper()} - {ev["substance"]} (presumptive only)'),
        ("AI assist", f'{ev["model_version"]}, confidence {ev["confidence"]:.1f}%'),
        ("Photo SHA-256", ev["image_sha256"][:32] + "..."),
        ("Custody chain integrity", "VERIFIED" if chain_ok else "BROKEN - DO NOT RELY"),
    ]
    c.setFont("Helvetica", 10)
    for k, v in rows:
        c.setFont("Helvetica-Bold", 10); c.drawString(20 * mm, y, f"{k}:")
        c.setFont("Helvetica", 10); c.drawString(70 * mm, y, str(v)[:75])
        y -= 8 * mm
    y -= 10 * mm
    c.drawString(20 * mm, y, "Officer signature: ____________________     Witness: ____________________")
    y -= 14 * mm
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(20 * mm, y, "Presumptive field test only. Confirmatory analysis by an FSL is required.")
    c.showPage(); c.save()
    return buf.getvalue()
