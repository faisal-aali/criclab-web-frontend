# System Patterns — Cric-Lab (Frontend)

> **Most important Memory Bank file for this UI repo.** Read before writing React code.
> Full CV / pipeline / PDF / Cloudinary rules live in `../criclab-web-backend/memory-bank/systemPatterns.md`.

## Architecture rule #1

**Computer vision + physics produce measurements. The LLM coaches; it never measures.**

The UI never invents km/h, angles, or drill YouTube IDs. Display what the API returns. If a metric is missing or `status !== 'ok'`, show `—` / unavailable — do not fabricate a number.

## Two film modes (do not merge their numbers)

| Mode | Route | Camera | Truth |
|------|--------|--------|--------|
| **Action** | `/` | Side-on full-body | Mechanics from pose. Ball km/h only when backend status is ok. |
| **Ball flight** | `/ball-flight` | Behind non-striker + both stumps | Pitch-plane speed / line / length. Separate job — never paste onto Action. |

## Truth contract (UI)

- Metric cards gate on `metricReady` in `src/api/client.ts`: `value != null` AND `status === 'ok'`
- Prefer failing a metric (show unavailable + note) over inventing a precise number
- Label physical metrics as **estimated** when the API says so
- Overlay video, PDF, and cards all consume the **same** metrics JSON from the delivery/job payload

## Frontend screens

- **Action (upload) → Processing → Results**
- **Ball flight** (stump calibration → poll → overlay + pitch map)
- **Train** (catalog library)
- **History**

Results: overlay player, metric cards, image-plane trajectory path (Action), DrillShelf YouTube iframes from **catalog IDs returned by the API** only.

Poll job status; never block the UI on long CV work without progress.

All writes go through FastAPI; React does not talk to MongoDB or Ollama directly.

## API / env coupling

1. Dev proxy in `vite.config.ts`: `/api` → `VITE_BACKEND_URL` (default `http://127.0.0.1:8000`)
2. `VITE_API_BASE` for fetch (default `/api`)
3. Backend CORS must allow this origin (`CORS_ORIGINS` on the backend)
4. Relative artifact URLs (`/artifacts/...`) are prefixed by `assetUrl()`

## Pipeline (pointer only)

Upload → pose → metrics → overlay → Cloudinary → Gemma narrative → PDF → MongoDB happens **in criclab-web-backend**. Do not duplicate stages in React. When adding a new metric:

1. Backend extends metrics JSON (sibling repo)
2. Frontend adds a card / chart that respects `metricReady`
3. Do not compute biomechanics in the browser

## Anti-patterns (do not introduce)

- Using the LLM (or inventing values) as the motion engine in the UI
- Merging stump (Ball flight) speed into a side-on Action results view as the headline
- Claiming radar-grade speed without the backend labeling it as validated
- Fat React components that reimplement backend metrics
- Talking to MongoDB or Ollama from the browser
- Reintroducing Notera (notes/PWA) or Next.js-as-frontend assumptions
- Merging backend source into this repo (keep the split)

## MVP UI checklist

1. Upload bowling video (+ player profile / height)
2. Show job progress stages
3. Results: overlay, ok metrics only, AI notes, PDF download, Cloudinary URL when present
4. Ball flight: stump calibration UI → results
5. Train + History pages
