# NARCOTRACE — full project

- `narcotrace-frontend/`  React + TypeScript + Vite + Tailwind app (13 languages, camera scan, Form 6, evidence, custody)
    cd narcotrace-frontend && npm install && npm run dev
- `narcotrace-backend/`   FastAPI starter (auth, evidence sync, custody chain, FORM-6 PDF, dashboard)
    cd narcotrace-backend && pip install -r requirements.txt
    export JWT_SECRET=...  DATA_KEY_HEX=$(python -c "import os;print(os.urandom(32).hex())")
    uvicorn app.main:app --reload     # docs at http://localhost:8000/docs
- `narcotrace-synthetic-dataset/`  10,000 synthetic colour-reaction images (train/val/test + manifest.csv).
    Synthetic only: do not quote its accuracy as field accuracy.

Notes: the frontend currently uses mock data + localStorage and is not yet connected to the backend.
The whole-site live translation only works inside the Claude preview; elsewhere only the static keys translate.

## Offline translations (all 12 Indian languages)
1. Open the Claude preview, pick any non-English language, click the download icon next to the language selector.
   It translates every UI string into all 12 languages and downloads `translations.json`.
2. Put that file at `narcotrace-frontend/src/i18n/translations.json`, then `npm run dev` / `npm run build`.
   The app now translates fully offline; no Claude connection needed.
Re-run `python3 scripts/extract-strings.py` after adding new UI text to refresh `src/i18n/catalogue.json`.
