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
| FEAT-009 | **S3 + CloudFront hosting** | Done | Presigned PUT originals; signed GET overlay/PDF |
| FEAT-010 | Results dashboard | Done | Overlay video + URL, metric cards, score rings, AI sections, pace band / throwing screen |
| FEAT-011 | AI agent (Gemma) | Done | Coaching from metrics JSON; catalog-only drill IDs via `gemma3:4b` |
| FEAT-012 | **SpinLab-style PDF** | Done | Event stills + tiles, sequencing, charts, tables, AI notes + drill URLs |
| FEAT-013 | History & compare | Done (basic) | History list + compare delta in agent report |
| FEAT-014 | Ball tracking (Action) | Done | In-air flight lock; headline ball speed when the path leaves the hand |
| FEAT-014b | **Ball flight (stumps)** | Done | Behind-bowler + both wickets; pitch-plane speed/line/length UI |
| FEAT-015 | Coaching memory | In progress (deterministic MVP) | `/app/training` page with Action trend charts + AI plan. Semantic embeddings deferred. |
| FEAT-016 | Validation | Planned | Radar / ground-truth checks; multi-view for true rotation speed |
| FEAT-018 | **Capture-rate recovery** | Done | Results show measured fps when the file understated slow-mo |
| FEAT-019 | **Delivery type & throwing screen** | Done | Pace band + ICC 15° screening cards; `—` unless backend status is ok |
| FEAT-017 | Train / drills | Done | Closed YouTube catalog + DrillShelf + `/train` library |
| FEAT-031 | **Daily video quota** | Done | Processing page shows expected start; cancel queued clips |
| FEAT-034 | **Action clip gates** | Done | 120/240 fps, landscape 1080p, ≤10 s, ≤100 MB, MP4/MOV before upload |
| FEAT-035 | **Action in-app trim** | Done | Lossless mp4box sample copy on Action upload (always offered when duration is readable) |

## Change log

- **4 Sep 2026 (FEAT-035):** Action upload always offers in-browser trim when duration is readable (not only when size/duration fail). mp4box sample copy, no re-encode. 4K still fails the 100 MB cap if a few seconds is already too heavy.
- **4 Sep 2026 (FEAT-034):** Action upload requires tagged 120/240 fps, landscape 1080p, ≤10 s, ≤100 MB, MP4/MOV. Ball flight unchanged.
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
- **27 Aug 2026 (dark-mode sweep):** Follow-up pass after a user report that
  dark mode was "wasted and wrong" on the homepage. Traced to a sitewide bug,
  not a one-off: every marketing page had light-only literal colors
  (`text-ink`, `text-pitch`, solid `bg-white`) with no `dark:` counterpart —
  112 + 44 + 17 instances fixed across all 12 marketing pages. Also fixed the
  pricing page's "Most popular" card, whose thin gradient border was bleeding
  across the whole card face because the card's own glass background is only
  6% opaque. Verified with a computed-style contrast probe (not screenshots,
  which can render blank at non-zero scroll in this environment) across all 16
  marketing + workspace routes — zero contrast failures. Also added: a
  sitewide toast system and confirm-dialog primitive (`ToastProvider`,
  `ConfirmProvider`), wired to sign-out-everywhere, ending a device session,
  and cancelling a coaching booking; a "Clear conversation" control on the
  assistant widget; and a full reschedule flow for coaching bookings
  (`BookingPanel` gained a `reschedule` mode) — three gaps the original
  TASK-011 spec asked for but that were missed the first time.
- **27 Aug 2026:** Video-analysis ETA, chatbot overhaul (icon, streaming,
  markdown rendering, formatting), and an admin panel. **Done**: `src/lib/eta.ts`
  + ETA display in both processing pages; new AI-sparkle launcher icon on
  `AssistantWidget`; a hand-rolled `Markdown` renderer (`src/components/app/Markdown.tsx`);
  `src/api/assistant.ts` `askStream()`; `src/api/client.ts`'s `request()` now
  goes through `authFetch`. Admin panel: `src/api/admin.ts`, `AdminLayout` +
  `charts.tsx`, all six pages (Dashboard, Users, Analyses, Coaching, Support,
  Notifications), `/admin/*` routes behind `RequireAdmin`, and an AccountMenu
  entry shown only when `user.role === 'admin'`. The assistant is hidden on
  `/admin/*`. Deferred: coach profile CRUD UI, booking calendar view.
- **2 Sep 2026 (TASK-003 / FEAT-031):** Processing pages and the header ring
  show when a queued clip is expected to start. Owners can remove a clip that
  has not started yet.

- **10 Sep 2026 (TASK-004, audit):** Cross-system audit pass. Every async
  screen now tells "loading", "empty" and "failed" apart: the drill library
  no longer sits on its skeleton when the catalogue is empty (loading ends
  when the request settles, not when items arrive); History shows a
  skeleton instead of "No deliveries yet" while the list loads; a ball-flight
  session with no tracked ball, or a failed one, says so instead of three
  `—` cards. Failed requests that were rendered as empty tables (admin
  users/analyses/player history/broadcast history/recipient search, account
  sessions, the notification list) now show the error, and the admin user
  detail panel no longer spins forever on a failure. In-app links to pages
  hidden `For Future` (assistant → `/app/support`, dashboard → `/admin/tickets`)
  render only when the target is visible. The global `/jobs/active` poll
  pauses while the tab is hidden and refreshes when it is shown. Removed the
  unused `components/Logo.tsx`; `.env.example` no longer ships a loopback
  `VITE_API_BASE`. Blockers recorded in TASK-004: root-owned `node_modules`
  (builds run from a copy), a Vercel OIDC token in the untracked `.env.local`.
