# TASK-004 — Audit: async states, dead links, polling

**Status:** Done
**Date:** 10 Sep 2026

Part of one cross-system audit (web, API, worker, Expo app). Marketing blocks
and nav entries marked `For Future` were left as they are.

## Fixed

| File | Problem | Fix |
|---|---|---|
| `pages/TrainPage.tsx` | `loading = items.length === 0 && !error` never ended on an empty catalogue | `loaded` flag from `.finally`; distinct "library is empty" card |
| `pages/HistoryPage.tsx` | "No deliveries yet" rendered while the request was in flight | skeleton until loaded |
| `pages/BallFlightResultsPage.tsx` | `session.error` never rendered; zero deliveries looked like one | error banner + "No ball found" card |
| `pages/admin/AdminUsersPage.tsx` | list and detail `.catch` → empty / endless skeleton | error banner; detail panel shows the error with Close |
| `pages/admin/AdminAnalysesPage.tsx`, `AdminPlayerHistoryPage.tsx`, `AdminNotificationsPage.tsx` | failures shown as empty | error banners (history, recipient search) |
| `pages/app/AccountSettingsPage.tsx`, `components/app/NotificationBell.tsx` | same | error text in the panel |
| `components/app/AssistantWidget.tsx`, `pages/admin/AdminDashboardPage.tsx` | live links to nav-hidden `/app/support`, `/admin/tickets` bounced users | rendered only when the target is visible (`TileLink`) |
| `components/app/ProcessingJobs.tsx` | 2 s poll in every hidden tab | pauses on `document.hidden`, refreshes on show |
| `.env.example` | shipped `VITE_API_BASE=http://127.0.0.1:8000` under a "production" comment | commented, with a real example |
| `components/Logo.tsx` | never imported | removed |

Verified from a clean copy of the tree: `tsc --noEmit` clean, `oxlint` only
pre-existing fast-refresh warnings, `vite build` OK.

## Blockers / not changed

- `node_modules/` is owned by root on the dev Mac; `npm ci` fails (EACCES).
  `mp4box`, `@tailwindcss/vite`, `@vitejs/plugin-react` are missing from that
  tree, so `tsc` reports "Cannot find module 'mp4box'" until it is reinstalled
  as the user. Builds for this task ran from a scratch copy.
- `.env.local` (untracked, ignored) contains a Vercel OIDC token — rotate it.
- `vercel.json` has no `/api` rewrite; the production build (EC2 + PM2 behind a
  proxy that strips `/api`) is the real path.
- `tsconfig.app.json` is not strict; enabling `strictNullChecks` is a larger
  change than this pass.
- Marketing links to `/pricing` and `/contact` (hidden) redirect to `/`; the
  contact form and newsletter box are presentation-only stubs — all marked
  `For Future` by the product.
