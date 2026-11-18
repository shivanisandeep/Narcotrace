# NarcoTrace backend starter

    pip install -r requirements.txt
    export JWT_SECRET=...  DATA_KEY_HEX=$(python -c "import os;print(os.urandom(32).hex())")
    uvicorn app.main:app --reload      # docs at http://localhost:8000/docs

Endpoints: POST /auth/login, POST /sync/evidence, POST /evidence/{id}/custody,
GET /evidence/{id}/verify, GET /evidence/{id}/form6.pdf, GET /dashboard/summary

Tested here: custody.py (chain + tamper detection), AES-GCM, FORM-6 PDF.
NOT yet run: main.py (FastAPI/SQLAlchemy weren't installable offline) - expect small fixes on first run.
Seed an officer yourself (passlib hash) before logging in.
