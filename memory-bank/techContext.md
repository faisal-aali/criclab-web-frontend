# Tech Context — Cric-Lab (Frontend)

Sibling website API: `../criclab-web-backend` (FastAPI + MongoDB + auth). Video CV: `../criclab-video-service`. This repo is the Vite + React UI only.

## Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | **Vite + React + TypeScript** | Upload, processing UI, metrics, video overlays, PDF download |
| Styling | Tailwind CSS 4 | Clean SpinLab-like analysis UI |
| Routing | React Router | Action, Ball flight, Train, Processing, Results, History |
| API | `src/api/client.ts` | Typed fetch client to FastAPI |

## High-level data flow

```text
Vite React (upload)
  → FastAPI /videos + /balltrack + /coaching   [criclab-web-backend]
    → job poll → DeliveryResult JSON
      → Results page (overlay, metric cards, AI notes, PDF)
```

## Repo layout (this frontend)

```text
criclab-web-frontend/
├── src/
│   ├── pages/            # Upload, BallFlight, Processing, Results, Train, History
│   ├── components/       # MetricCard, DrillShelf, Layout, Logo
│   ├── api/              # Typed client to FastAPI (client.ts)
│   ├── App.tsx
│   └── index.css
├── public/
├── memory-bank/          # this folder
├── package.json
├── vite.config.ts        # /api proxy → VITE_BACKEND_URL (default :8000)
└── .env.example
```

## API client contract

- `API_BASE = import.meta.env.VITE_API_BASE ?? '/api'`
- Dev: Vite proxies `/api` → backend (strip `/api` prefix)
- Prod (split deploy): set `VITE_API_BASE` to the absolute backend URL
- `metricReady(m)` — true only when `m.value != null` AND `m.status === 'ok'`
- `assetUrl(path)` — prefixes relative artifact paths with `API_BASE`
- Job poll may include `expected_start_at` (queued) and `eta_seconds` (running)

## Local setup

```bash
# website API + video worker (sibling repos)
cd ../criclab-web-backend && uvicorn app.main:app --reload --port 8000
cd ../criclab-video-service && python -m app.worker

# frontend
cd criclab-web-frontend && npm install && npm run dev
```

Open http://localhost:5173.

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_BACKEND_URL` | Dev proxy target (default `http://127.0.0.1:8000`) |
| `VITE_API_BASE` | Leave unset for local `/api` proxy; absolute URL for split prod |

## Constraints

- Frontend is **Vite + React**, not Next.js
- React does **not** talk to MongoDB or Ollama directly — only FastAPI
- Do not reimplement pose/metrics/PDF logic in the browser
- Pipeline internals: see `criclab-video-service/memory-bank/systemPatterns.md`
