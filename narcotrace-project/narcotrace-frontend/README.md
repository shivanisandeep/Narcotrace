# VIGIL — AI-Powered Forensic Narcotics Field Testing & Evidence Management

Frontend prototype for SIH 2026, Problem Statement SIH26231. React + TypeScript + Vite + Tailwind CSS v4 + Recharts + React Router. All data is mock/demo data persisted to localStorage — there is no backend.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. Log in with any Officer ID (device auth is simulated).

## Build

```bash
npm run build
npm run preview
```

## Demo flow

Login -> Dashboard -> Start new test -> Case ID / kit -> Capture (real camera or upload fallback) -> Calibration -> AI analysis animation -> Result -> Save evidence -> Evidence details (SHA-256 hash) -> Chain of custody -> Evidence history -> Offline sync center -> Command center (charts + live field map) -> Security center -> Profile.

## Structure

```
src/
  components/layout/   AppShell, Sidebar, MobileBottomNav, TopBar, RequireAuth
  components/ui/       Button, StatusBadge, StatCard, ConfidenceMeter, AlertCard, Feedback (toast/empty state)
  components/evidence/ EvidenceCard, EvidenceTable, ChainOfCustodyTimeline, SecurityCard,
                        ChartCard, MapPanel, SyncQueue, CameraScanner, CalibrationPanel,
                        AnalysisProgress, ResultCard
  pages/                Login, Dashboard, NewTest, EvidenceDetails, ChainOfCustody,
                        EvidenceHistory, OfflineSync, CommandCenter, Alerts, Security, Profile
  lib/                  store.tsx (app state), mock-data.ts, nav.ts, utils.ts, use-online.ts
  types/                shared TypeScript types
```

All evidence records, officer identity, and alerts are demo/mock data (see `src/lib/mock-data.ts`).
