# Roadmap — Cric-Lab

High-level features. Detail lives in `tasks/`.

| ID | Feature | Status | Summary |
|----|---------|--------|---------|
| FEAT-001 | Project foundation | Done | Vite React FE + FastAPI BE + MongoDB + storage folders |
| FEAT-002 | Video upload & jobs | Done | Upload bowling video, job status API, processing UI |
| FEAT-003 | Video pipeline | Done | OpenCV extract + metadata |
| FEAT-004 | **Pose estimation** | Done | MediaPipe BlazePose 33-landmark track (measurement engine) |
| FEAT-005 | **Action/release detection** | Done | Throwing side (profile arm wins) + leave-hand release + action phases |
| FEAT-006 | Calibration | Done (basic) | Scale from pose body height or provided reference |
| FEAT-007 | **Biomechanics metrics** | Done | Leave-hand arm speed, joint angles, timing, rotation proxies, scores from ok metrics only |
| FEAT-008 | **Slow-mo overlay video** | Done | SpinLab HUD: colour frames + 2×2 tiles + BFC/FFC/MER/REL/FT timeline |
| FEAT-009 | **Cloudinary hosting** | Done | Upload processed video + PDF; return shareable URLs |
| FEAT-010 | Results dashboard | Done | Cloudinary video + URL, metric cards, score rings, AI sections, pace band / throwing screen |
| FEAT-011 | AI agent (Gemma) | Done | Coaching from metrics JSON; catalog-only drill IDs via `gemma3:4b` |
| FEAT-012 | **SpinLab-style PDF** | Done | Event stills + tiles, sequencing, charts, tables, AI notes + drill URLs |
| FEAT-013 | History & compare | Done (basic) | History list + compare delta in agent report |
| FEAT-014 | Ball tracking (Action) | Done | In-air flight lock; headline ball speed when the path leaves the hand |
| FEAT-014b | **Ball flight (stumps)** | Done | Behind-bowler + both wickets; pitch-plane speed/line/length UI |
| FEAT-015 | Coaching memory | Planned | Embeddings via `nomic-embed-text` + semantic search |
| FEAT-016 | Validation | Planned | Radar / ground-truth checks; multi-view for true rotation speed |
| FEAT-018 | **Capture-rate recovery** | Done | Results show measured fps when the file understated slow-mo |
| FEAT-019 | **Delivery type & throwing screen** | Done | Pace band + ICC 15° screening cards; `—` unless backend status is ok |
| FEAT-017 | Train / drills | Done | Closed YouTube catalog + DrillShelf + `/train` library |

## Change log

- Initial greenfield build under `CricLabMLReview` with working upload → analysis → PDF path
- Replaced Notera Memory Bank with Cric-Lab product context
- **SpinLab-parity rebuild:** switched the measurement engine from ball tracking
  to MediaPipe **pose**; added slow-motion overlay video, **Cloudinary** upload
  (video + PDF URLs), a 6-page SpinLab-style PDF, and robust/honest biomechanics
  metrics. Backend now runs on the **Python 3.12** venv (`criclab-web-backend/.venv312`).
- Fixed pinched hero/logo typography (relaxed letter-spacing + line-height).
- **18 Aug 2026:** Two film modes (Action vs Ball flight). Gemma coaches and
  picks drills from `criclab-web-backend/app/coaching/drills.json` only. Action arm speed is
  leave-hand, not cocking peak. Missing ball speed no longer scores from arm
  speed. FEAT-016 (radar validation) remains Planned — stump speed is pitch-plane,
  not a gun.
- **24 Aug 2026 (audit):** Results now shows pace band, ICC 15° screening, capture
  rate, and ball-vs-arm consistency from the metrics JSON. Compare is same-player
  ball speed only. Ball-flight length rejects off-pitch bounces instead of clipping.
- **26 Aug 2026:** Full frontend redesign. Added a public marketing site (Home,
  Features, How It Works, Record a Video, Pricing, About, Careers, Testimonials,
  Resources, FAQ, Contact, Privacy, Terms) at the root and moved the workspace
  under `/app`, both on one CricLab design system — floodlit-night palette,
  drawn cricket visual language (SVG, no stock photography dependency), scroll
  reveals and animated statistics with no animation dependency. The workspace was
  rebuilt on a dark sidebar shell to match. Routes are code-split per page.
  All user-visible copy was audited so nothing names how the analysis works.
- **27 Aug 2026:** Second design pass. Added generated backdrop plates
  (`public/backdrops/`, drawn by `scripts/generate-backdrops.py`) used through a
  new `Backdrop` primitive that pairs each plate with a scrim, grain and
  parallax. `Section` grew from four tones to seven so pages step between
  surfaces rather than flipping. New motion primitives: `Parallax`, `TiltCard`,
  `Marquee`, `ScrollProgress`, `WordReveal`, `ProgressRing`, `SectionSeam`, plus
  `ring-glow`, `shimmer-text` and several ambient keyframes. Every marketing page
  now runs 5-9 distinct tones with 4-5 plated sections.
- **26 Aug 2026:** Authentication landed. Public marketing routes, five auth
  screens on the CricLab design system, `/app` behind route guards, an in-memory
  access token with a persisted rotating refresh token, a notification centre in
  the app shell, and an account settings page (profile, password, active
  devices). Support, coaching and the assistant UIs are not built.
- **27 Aug 2026 (TASK-011):** Support, coaching and the assistant UIs built —
  `SupportPage`/`TicketPage`, `CoachingPage`, and a floating `AssistantWidget`
  mounted at the app root. New API clients: `support.ts`, `coaching.ts`,
  `assistant.ts`; `auth.ts` gained `authFetchBlob` for authenticated file
  downloads. Same pass also fixed a workspace-wide dark-mode bug found while
  verifying these pages — see "Workspace theming" in systemPatterns.md.
