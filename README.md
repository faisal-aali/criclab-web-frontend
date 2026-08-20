# Cric-Lab Frontend

Vite + React + TypeScript UI for the AI cricket bowling laboratory: upload → processing → metrics → overlay video → PDF.

Sibling backend: `../criclab-backend` (FastAPI on port 8000).

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS 4
- React Router

## Prerequisites

- Node 20+
- Backend running at http://127.0.0.1:8000 (see `criclab-backend`)

## Quick start

```bash
cd criclab-frontend
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` → FastAPI.

## Environment

Copy `.env.example` → `.env` if you need to override defaults:

| Variable | Purpose |
|----------|---------|
| `VITE_BACKEND_URL` | Dev proxy target (default `http://127.0.0.1:8000`) |
| `VITE_API_BASE` | API prefix for fetch. Leave unset in local dev (`/api` + proxy). Set to the absolute backend URL for split production deploys. |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on :5173 |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Oxlint |

## Screens

Action upload → Processing → Results · Ball flight · Train · History

All writes go through the FastAPI backend. React does not talk to MongoDB or Ollama directly.

## Architecture

Read `memory-bank/` before extending UI. Metric cards must gate on `metricReady` (`value != null` AND `status === 'ok'`).
