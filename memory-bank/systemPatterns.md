# System Patterns — Cric-Lab (Frontend)

> **Most important Memory Bank file for this UI repo.** Read before writing React code.
> Full CV / pipeline / PDF rules live in `../criclab-video-service/memory-bank/systemPatterns.md`. Website API contract: `../criclab-web-backend/memory-bank/systemPatterns.md`.

## Architecture rule #1

**Computer vision + physics produce measurements. The LLM coaches; it never measures.**

The UI never invents km/h, angles, or drill YouTube IDs. Display what the API returns. If a metric is missing or `status !== 'ok'`, show `—` / unavailable — do not fabricate a number.

## Two film modes (do not merge their numbers)

| Mode | Route | Camera | Truth |
|------|--------|--------|--------|
| **Action** | `/app/action` | Side-on full-body | Mechanics from pose. Ball km/h only when backend status is ok. |
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
| Workspace | `/app`, … | `components/Layout` (sidebar shell; follows site light/dark theme) |

**Bowling-first marketing:** Batting feature copy is **commented out** in source on
Features, How It Works, and About so public pages stay bowling-first. Each block is tagged
`TODO: For Future`. Full inventory is in **Deferred batting marketing copy** below (local
changes; not committed/pushed as of 3 Sep 2026). Do not uncomment until batting analysis
ships in the video pipeline.

Light/dark is a first-class preference (`src/theme/ThemeProvider.tsx`). A sun/moon
control lives in the marketing header, auth header, and workspace header. Preference
is `localStorage` key `criclab-theme` (`light` | `dark` | `system`). Do not invent a
second theme mechanism or hardcode a night-only shell that ignores `html.dark`.

Pre-`/app` links (`/results/:id`, `/train`, …) redirect in `App.tsx`. Keep those
redirects when adding routes — they are the only thing holding old bookmarks.

## Deferred batting marketing copy (commented in source)

> **Status:** Batting is **out of scope for v1** (`productBrief.md`). Approved copy for a
> future batting launch is **commented out** in three marketing pages — **not committed or
> pushed** as of 3 Sep 2026. Uncomment when batting ships; do not delete or rewrite from
> scratch.

Each commented block is marked in source with **`// TODO: For Future`** (TS/JS arrays) or
**`{/* TODO: For Future */}`** (JSX). Search the repo for that string to find every deferred
block quickly. When restoring, remove the TODO line and uncomment the block beneath it.

### Where it was commented out (batting)

| File | Location | What was hidden |
|------|----------|-----------------|
| `src/pages/site/FeaturesPage.tsx` | `MEASURE` array (~L76–81) | Feature card — **tag:** `Batting` · **title:** Batting analysis · **body:** trigger movement, backlift, front-foot stride, bat path through the line, head position at contact · bat SVG icon |
| `src/pages/site/FeaturesPage.tsx` | `MEASURED_WORDS` ticker (~L130) | Word `'Bat path'` |
| `src/pages/site/FeaturesPage.tsx` | Hero chips (~L213) | `<Chip tone="lime">Batting</Chip>` |
| `src/pages/site/HowItWorksPage.tsx` | FAQ array (~L186–189) | **Q:** What about batting clips? · **A:** Batting is covered too — film square of the wicket; shot broken into trigger movement, backlift, stride, bat path, head position at contact |
| `src/pages/site/AboutPage.tsx` | `MILESTONES` timeline entry (~L150–154) | **year:** 2025 · **title:** Batting joins bowling · **body:** trigger movement, backlift, front-foot stride, bat path, head position at contact — same single clip, square of the wicket |

### Other deferred marketing blocks (same TODO marker)

These are also commented out with `TODO: For Future` — not batting, but held back for the same
“restore later” workflow:

| File | Location | What was hidden |
|------|----------|-----------------|
| `src/pages/site/FeaturesPage.tsx` | Ball tracking showcase (~L363+) | Full `<Section tone="warm">` — “Follow the ball from the hand to the pitch point” visual + metrics demo |
| `src/pages/site/RecordVideoPage.tsx` | Framing section (~L611+) | Full `<Section tone="dark">` — elevation framing diagram, ball-flight camera diagram, `FLIGHT_NOTES` cards |
| `src/pages/site/AboutPage.tsx` | `MILESTONES` const + timeline UI (~L134–166, ~L456–511) | Full “How we got here” milestone rail — `MILESTONES` array and `<Section tone="night">` timeline section |

### Shared batting vocabulary (restore as-is)

- **Phases:** trigger movement, backlift, front-foot stride, bat path (through the line), head position at contact
- **Filming:** square of the wicket; whole stance and stride in frame; same phone / single clip
- **Positioning:** batting as a peer feature to bowling, not a separate product

### Still live on the site (not commented)

These mention batting but were **left active** on purpose:

| File | Content | Intent |
|------|---------|--------|
| `FaqPage.tsx` | Quick answer “Batting or fielding?” → “Not yet. Bowling first…” | Scope honesty |
| `FaqPage.tsx` | Full FAQ “Can I analyse batting or fielding too?” → batting is next, not shipped | Roadmap tease |
| `TestimonialsPage.tsx` | Batter / wicketkeeper-batter quotes and “Batters” filter | Social proof placeholder |
| `FeaturesPage.tsx` | `'Head at contact'` still in `MEASURED_WORDS` ticker | Bowling-adjacent — decide later if tightening bowling-only messaging |
| `AboutPage.tsx` | Vision copy: “batting and bowling figures” | Generic cricket context, not a product claim |

### Agent rules

- Do **not** uncomment batting blocks until batting analysis exists in the video pipeline and API.
- Do **not** delete commented blocks — they are the approved copy for launch.
- Preserve **`TODO: For Future`** on any new deferred marketing blocks; use the same marker style (line comment vs JSX comment).
- New marketing copy must sell **bowling + ball flight only** until this section is retired.
- When batting ships: uncomment all rows in **Where it was commented out (batting)**, remove the TODO lines, then update `productBrief.md` out-of-scope list.

## Sidebar chrome and access — JSON

Player and admin sidebars are not hardcoded in the layout components. Labels,
order, mobile tabs, and visibility live in two files:

- Workspace (sidebar, mobile bottom tabs, account-menu extras):
  `src/config/nav.workspace.json`
- Admin sidebar: `src/config/nav.admin.json`
- Marketing site header (Home, Features, …): `src/config/nav.site-header.json`
- Marketing site footer (Product, Company, … columns): `src/config/nav.site-footer.json`

Helpers in `src/config/nav.ts` filter `hidden !== true`. Icon SVGs stay in
`src/config/navIcons.tsx` (JSON cannot hold JSX); the `icon` field is a key.

`hidden: true` is both chrome and access: the link disappears, and
`RequireVisibleWorkspacePage` / `RequireVisibleAdminPage` /
`RequireVisibleSiteHeaderPage` redirect to the first visible item in that file
(workspace → `/` if none remain; admin → `/app/action`; site header → `/`).
Marketing pages not listed in `nav.site-header.json` (careers, FAQ, legal, …)
are outside that guard’s JSON and stay reachable. `childPrefixes` belong to the
same page — hide Action and `/app/processing` + `/app/results` are blocked;
hide Analyses and `/admin/reports/*` is blocked. Action lives at `/app/action`
(`end: true`); `/app` redirects there. `/app/settings` is not in the JSON and
stays reachable. Do not add a `NAV` array back to `Layout.tsx`,
`AdminLayout.tsx`, `SiteHeader.tsx`, or `SiteFooter.tsx`.

Footer `hidden: true` only removes the link from footer columns; it does not
block the route (unlike header/workspace/admin). Pages such as careers and FAQ
are footer-only and never appear in `nav.site-header.json`.

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

While a job is queued or claimed, show `expected_start_at` (local datetime). Once it is running, show remaining `eta_seconds`. Queued clips can be removed from the queue. Do not invent a start time in the browser.

Results: overlay player, metric cards, image-plane trajectory path (Action), DrillShelf YouTube iframes from **catalog IDs returned by the API** only.

Pace band (`delivery_type`), throwing screen (`action_legality`), capture rate (`timebase`), and `speed_consistency` are displayed as backend strings/status — never computed in the browser. If `status !== 'ok'` or `verdict` is null, show `—` / “not assessable”.

Poll job status; never block the UI on long CV work without progress.

All writes go through FastAPI; React does not talk to MongoDB, S3 IAM, or Ollama directly.

## Object storage (S3 + CloudFront)

The browser PUTs originals to S3 with a short-lived presigned URL from `GET /videos/upload-params`, then POSTs `source_key`. Playback and PDF links are CloudFront signed GET URLs the website API mints on read — treat them as opaque; do not rewrite or append query params. If a `<video>` 403s after expiry, refetch the delivery. No AWS secrets in this repo. Finished originals are archived server-side; do not name storage class or Glacier in UI copy.

## The assistant: streaming and Markdown

- **`Markdown.tsx` is hand-rolled on purpose, not a missing dependency.** The
  assistant's output subset is fixed and small (headings, lists, bold, inline
  code, links, callouts) — see the backend's `SYSTEM_PROMPT`. Every token is
  parsed into a specific React element; raw HTML in the source text is never
  interpreted, so there is no `dangerouslySetInnerHTML`-shaped hole for a
  crafted answer to open. A general Markdown library plus a sanitizer would
  cover more syntax than the assistant ever produces, for more surface area,
  not less.
- **A markdown link's `href` is only ever one of a fixed set of internal
  routes** (see `PAGE_LINKS` on the backend) — rendered via `<Link>`, not a
  full page navigation, and anything not `/`-prefixed opens in a new tab
  (`target="_blank" rel="noopener noreferrer"`) rather than being trusted as
  internal.
- **`askStream()` in `api/assistant.ts` always has a non-streaming fallback**,
  used when the initial connection fails, when the response isn't OK, and
  when a per-read timeout (`READ_TIMEOUT_MS`, currently 20s) fires with
  nothing received yet. Once *something* has streamed, a later stall just
  ends the turn with what arrived rather than re-issuing the question — a
  fresh call after partial content would risk showing the answer twice.
- **A streamed response can be split across `TextDecoder`/NDJSON boundaries
  in ways a non-streamed test never exercises.** Test the actual chunked
  output (`curl -N`), not just the final assembled text, before trusting a
  streaming code path — see the backend TASK-012 for four link-formatting
  bugs that only appeared once real chunk boundaries were observed.

## Admin panel — a third surface, not a mode of the workspace

`AdminLayout.tsx` is its own shell (sidebar + topbar), deliberately not built
on the user workspace's `Layout.tsx` — the spec calls for the admin
experience to be "completely separate from the normal user experience," and
sharing chrome would put "Users" / "Disable account" one click from a
player's own delivery review. The actual boundary is `RequireAdmin` (frontend
guard, hides UI) plus every backend route depending on `AdminUser`
(enforces it) — not this file. Sidebar items come from
`src/config/nav.admin.json`, same `hidden` contract as the player workspace.
Written dark-first with no `dark:` variants, same convention as the workspace
(see "Workspace theming" below) — this is authenticated-app chrome, not
marketing chrome, and inherits that surface's theming rule, not the
marketing site's.

Wired in `App.tsx` at `/admin`, `/admin/users`, `/admin/analyses`,
`/admin/coaching`, `/admin/tickets`, `/admin/notifications`. The only way an
admin finds it from the workspace is the AccountMenu "Admin panel" link,
shown only when `user.role === 'admin'`. `AssistantWidget` returns null on
`/admin/*` so the player-facing assistant is not sitting on staff tools.

No charting library: `components/admin/charts.tsx` hand-rolls a line+area
trend, a donut, and a horizontal bar list — three shapes, all in brand
colours, not worth a dependency.

## API / env coupling

1. Dev proxy in `vite.config.ts`: `/api` → `VITE_BACKEND_URL` (default `http://127.0.0.1:8000`)
2. `VITE_API_BASE` for fetch (default `/api`)
3. Backend CORS must allow this origin (`CORS_ORIGINS` on the backend)
4. Relative artifact URLs (`/artifacts/...`) are prefixed by `assetUrl()`

## Pipeline (pointer only)

Upload hits **criclab-web-backend** (queue). Pose → metrics → overlay → Gemma notes → PDF happens in **criclab-video-service**. Do not duplicate stages in React. When adding a new metric:

1. Video service extends metrics JSON
2. Frontend adds a card / chart that respects `metricReady`
3. Do not compute biomechanics in the browser

## Authentication in the UI

- **Public** — `/`, `/features`, `/how-it-works`, `/record`, `/pricing`, `/about`,
  `/careers`, `/testimonials`, `/resources`, `/faq`, `/contact`, `/privacy`,
  `/terms`, plus `/login`, `/signup`, `/forgot-password`, `/reset-password`,
  `/verify-email`.
- **Protected** — everything under `/app`, behind `RequireAuth`. Anything that
  creates data also sits behind `RequireVerified`. `/app/settings` is the
  exception: reachable while unverified, so an account can be managed.
- **The access token never touches storage.** It lives in memory in
  `src/api/auth.ts`; only the refresh token is persisted. A short-lived bearer
  token in `localStorage` is exactly what an XSS wants.
- **One in-flight refresh.** Concurrent 401s await the same promise — otherwise
  the first rotation invalidates the token the others are retrying with.
- **`status` is three-valued** (`loading`/`authenticated`/`anonymous`). Guards
  must tell "still checking" from "signed out", or every reload flashes the
  sign-in page.
- **Guards are UX, not security.** The API refuses unauthorised data
  independently; the guard only decides what to render.
- Poll counts, not lists: the notification badge polls `unread-count` and pauses
  while the tab is hidden; the list loads when the panel opens.
- **Protected, added TASK-011** — `/app/support`, `/app/support/:ticketId`
  outside `RequireVerified` (someone who cannot get verified still needs a way
  to report it); `/app/coaching` inside it (booking creates data and sends
  mail). The assistant widget is mounted outside `<Suspense>` at the app root so
  it is reachable even while a route chunk is still loading.

## Workspace theming — dark-first, remapped for light

`Layout.tsx` and everything under `src/pages/app/` are written **once**, in
dark-first tokens (`text-chalk`, `bg-charcoal`, `bg-white/5`,
`border-white/10`) and **never with a `dark:` variant**. Light mode is produced
entirely by `.app-shell` in `index.css` remapping those CSS custom properties
under `html.light`.

This is the opposite convention from the marketing site (`src/pages/site/`),
which is light-first with `dark:` overrides — the two surfaces are themed in
mirror-image ways, and copying one page's convention onto the other silently
inverts it. A `dark:` pair added to workspace markup is applied *on top of* an
already-remapped token: `bg-chalk dark:bg-night` paints a dark surface under
dark text once the remap has already turned `--color-chalk` dark, and
`text-ink` puts near-black text on it. This is exactly what shipped and had to
be found and rewritten — see TASK-011 for the full account.

Two consequences that are easy to reintroduce by accident:

- **A plain CSS class (not a Tailwind utility) needs an explicit `html.dark`
  counterpart, not a `dark:` call-site pair.** `.glass-light`,
  `.bg-chalk-gradient` and `.bg-chalk-warm` are defined once in `index.css`;
  Tailwind's `dark:` variant only wins by specificity against *utility*
  classes, so a `dark:bg-something` sitting next to one of these in markup does
  nothing — stylesheet order decides, and these plain classes are emitted after
  the utilities. Give each its own `html.dark .the-class { … }` rule beside its
  light definition instead.
- **A surface meant to stay dark in both themes** (a header over a floodlit
  photo, a video frame) should carry the `on-night` class, which restores the
  dark token values for that subtree only, rather than being left unstyled and
  accidentally inheriting the light remap.

**The marketing site (`src/pages/site/`) had the mirror-image bug**, found and
fixed in the same pass: dozens of elements across every marketing page wrote a
light-only text or background color literally (`text-ink`, `text-pitch`, solid
`bg-white`) with no `dark:` counterpart at all — not an inverted pairing like
the workspace bug, just a missing one. The parent `Section` correctly flips its
own background and default text colour between themes, but a child that
re-asserts its own explicit color class overrides that default and does not
follow it. This was not one section — it was systemic across the whole site
(112 `text-ink`, 44 `text-pitch`, and 17 solid `bg-white` instances fixed).
The fix, and the rule to hold the line going forward:

- Any literal `text-ink[/N]` needs `dark:text-chalk[/N]` beside it.
- Any literal `text-pitch[/N]` needs `dark:text-lime[/N]` beside it — `pitch`
  is the light-mode brand green, `lime` is its dark-mode counterpart; this is
  the same substitution the shared `Eyebrow` component already made correctly.
- A **solid, opaque** `bg-white` (a real card background, not a translucent
  `bg-white/NN` glass overlay — those are intentionally theme-agnostic and
  correct as-is) needs a dark counterpart or it renders as a bright floating
  box on a night background. The established idiom is `dark:bg-white/6` (or
  `!bg-charcoal` when it needs to be forced opaque — see the pricing card note
  below), matching how the shared `Card` component's light tone already
  handles it.
- A boolean-driven ternary (`dark ? 'text-chalk' : 'text-ink'`, keyed off a
  per-component `tone` prop rather than the CSS `dark:` variant) is legitimate
  *only* when something else keeps `tone` synced to the actual page theme. If
  it isn't — as in `TestimonialsPage`'s `Attribution`/quote-card ternaries,
  which used a component-level `light`/`dark` prop but were never told when the
  *site* theme changed — the same bug applies: pair the literal branch with its
  own `dark:` class too (`'text-ink dark:text-chalk'`), don't assume the prop
  makes it exempt.

**Verification note:** screenshots taken at a non-zero scroll position in the
Browser pane can render blank (a pane bug, not a real rendering issue) — do not
trust a blank screenshot as evidence of a blank page. A `getComputedStyle`-based
contrast probe injected via `javascript_tool` is reliable where scrolled
screenshots are not; forcing `document.documentElement.classList` to `dark` and
`.reveal` elements to `.is-visible` before running it lets one script audit a
route without waiting on the real toggle or scroll animations.

**A card with a solid-color gradient border needs an opaque backdrop, not just
a slimmer gradient.** The pricing page's "Most popular" plan card wraps a
`Card` in an outer `div` with a `bg-gradient-to-b` and a few pixels of padding,
so only a thin rim shows. But `Card`'s own `.glass` background is deliberately
translucent (6% white) for glassmorphism — placed a few pixels from a vivid
lime gradient instead of the plain page background it normally sits on, that
6% wasn't enough to stop the gradient bleeding through the whole card face
instead of staying a rim. Toning down the gradient's opacity did not fix this;
the actual fix was forcing the inner card opaque (`!bg-charcoal`) so only the
padding gap shows colour.

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
- Talking to MongoDB, S3 IAM, or Ollama from the browser
- Putting `S3_*` / `AWS_*` / `CLOUDFRONT_*` secrets in Vite env
- Appending query params onto CloudFront signed URLs
- Reintroducing Notera (notes/PWA) or Next.js-as-frontend assumptions
- Styling a page outside the design system, or adding a one-off colour
- Naming internals in any user-visible string
- Merging backend source into this repo (keep the split)

## MVP UI checklist

1. Upload bowling video (+ player profile / height)
2. Show job progress stages
3. Results: overlay, ok metrics only, AI notes, PDF download, CloudFront signed URL when present
4. Ball flight: stump calibration UI → results
5. Train + History pages
