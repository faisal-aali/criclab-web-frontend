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

## Two surfaces: marketing site and workspace

The repo serves a public **marketing site** at the root and the **application
workspace** under `/app`. They share one design system but not one chrome.

| Surface | Routes | Shell |
|---------|--------|-------|
| Marketing | `/`, `/features`, `/how-it-works`, `/record`, `/pricing`, `/about`, `/careers`, `/testimonials`, `/resources`, `/faq`, `/contact`, `/privacy`, `/terms` | `components/site/MarketingLayout` (floating header over a dark hero + full footer) |
| Workspace | `/app`, `/app/processing/:jobId`, `/app/results/:deliveryId`, `/app/ball-flight[...]`, `/app/train`, `/app/history` | `components/Layout` (dark sidebar shell) |

Pre-`/app` links (`/results/:id`, `/train`, …) redirect in `App.tsx`. Keep those
redirects when adding routes — they are the only thing holding old bookmarks.

## Design system (read before writing any UI)

One system, defined in three places. Do not style outside it:

1. `src/index.css` — Tailwind v4 `@theme` tokens (`night`, `charcoal`, `pitch`,
   `pitch-soft`, `lime`, `lime-deep`, `seam`, `chalk`, `mist`, `ok/warn/bad`) and
   utilities (`.bg-stadium`, `.bg-pitch-gradient`, `.bg-chalk-gradient`,
   `.glass`, `.glass-light`, `.card-sheen`, `.lift`, `.reveal`, `.field`,
   `.field-dark`, `.text-gradient-lime`, `.sweep-on-hover`).
2. `src/components/site/ui.tsx` — `Button`, `Card`, `Chip`, `Container`,
   `Eyebrow`, `Section`, `SectionHeading`, `Stat`, `CountUp`, `Reveal`,
   `Accordion`.
3. `src/components/site/visuals.tsx` — the cricket visual language, drawn as SVG
   rather than photographed: `StadiumAtmosphere`, `SeamBall`, `TrajectoryArc`,
   `BowlerSkeleton`, `MetricBars`, `PitchFloor`, `PhotoFrame`.
4. `public/backdrops/` — generated section backdrop plates (`stadium-night`,
   `pitch-perspective`, `nets`, `bokeh`, `turf`, `mesh-light`, `grain`). Drawn by
   `scripts/generate-backdrops.py`; see `public/backdrops/README.md` for how to
   replace them with real photography.

Depth and motion primitives: `Backdrop`, `Parallax`, `TiltCard`, `Marquee`,
`ScrollProgress`, `WordReveal`, `ProgressRing`, `SectionSeam`.

Rules that keep it coherent:

- **Step through the tones, do not flip between two.** `Section` takes
  `plain | light | warm | mid | pitch | dark | night`. A long page that only
  alternates chalk and night reads as a stack of stripes; the intermediate
  surfaces let it step. Never two identical tones adjacent, and aim for at least
  five distinct tones on a full page.
- **Background images always go through `Backdrop`.** Never set a plate as a bare
  background. `Backdrop` pairs it with a scrim, adds grain and applies parallax —
  the scrim is what guarantees text contrast never depends on the image. The
  section must be `relative` and its `Container` needs `className="relative"` so
  content sits above the plate. Three-plus plated sections per page is the
  target.
- **Everything reveals.** Wrap section content in `Reveal` with staggered
  `delay`. Motion is CSS + IntersectionObserver; there is no animation library
  and adding one needs a reason.
- **`Chip` is a dark-surface component.** Its palette is unreadable on light
  sections.
- **`PhotoFrame` is the photography slot.** It renders a drawn fallback when
  `src` is absent or fails, so no screen depends on stock imagery existing.
- Respect `prefers-reduced-motion` — the primitives already do; anything bespoke
  must too. `Parallax`, `TiltCard` and `WordReveal` also no-op on touch or when
  the API is unavailable.
- **IntersectionObserver thresholds must be `0`, never a fraction.** A fractional
  threshold is unreachable for any element taller than `viewport ÷ threshold`, so
  on a short window a tall section never reveals and the page renders blank. Use
  `{ threshold: 0, rootMargin: "0px 0px -40px 0px" }`.
- **Position `PhotoFrame` with its `position` prop, not `className`.** Tailwind
  resolves competing position utilities by stylesheet order, not attribute order,
  so passing `absolute` alongside the component's own `relative` silently loses
  and the frame stays in flow.

## Frontend screens (workspace)

- **Action (upload) → Processing → Results**
- **Ball flight** (stump calibration → poll → overlay + pitch map)
- **Train** (catalog library)
- **History**

Results: overlay player, metric cards, image-plane trajectory path (Action), DrillShelf YouTube iframes from **catalog IDs returned by the API** only.

Pace band (`delivery_type`), throwing screen (`action_legality`), capture rate (`timebase`), and `speed_consistency` are displayed as backend strings/status — never computed in the browser. If `status !== 'ok'` or `verdict` is null, show `—` / “not assessable”.

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

## Privacy rule — never expose how the analysis works

Public copy and workspace copy describe **what the user gets**, never how it is
produced. Do not name or imply backend technologies, APIs, databases, model
names, pipelines, algorithms, libraries, servers, or internal processing stages.
This includes job stage labels: show "Following the ball", not the internal
stage key. Say "CricLab measures / tracks / reports".

Field names inside API payloads are not user-visible text and are exempt; any
string that reaches the screen is not.

## Anti-patterns (do not introduce)

- Using the LLM (or inventing values) as the motion engine in the UI
- Merging stump (Ball flight) speed into a side-on Action results view as the headline
- Claiming radar-grade speed without the backend labeling it as validated
- Fat React components that reimplement backend metrics
- Talking to MongoDB or Ollama from the browser
- Reintroducing Notera (notes/PWA) or Next.js-as-frontend assumptions
- Styling a page outside the design system, or adding a one-off colour
- Naming internals in any user-visible string
- Merging backend source into this repo (keep the split)

## MVP UI checklist

1. Upload bowling video (+ player profile / height)
2. Show job progress stages
3. Results: overlay, ok metrics only, AI notes, PDF download, Cloudinary URL when present
4. Ball flight: stump calibration UI → results
5. Train + History pages
