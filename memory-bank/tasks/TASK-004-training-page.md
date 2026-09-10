# TASK-004 — Training Page (frontend)

## Goal

Add an `/app/training` page that shows the user's Action delivery trends, recurring focus areas, AI coaching summary, and matched drill videos.

## Done

- `src/api/training.ts` — typed `training.profile()` and `training.plan({ refresh })` via `authFetch`.
- `src/pages/app/TrainingPage.tsx` — trend charts (ball speed, arm speed, release height, release time), recurring-focus chips, AI coaching panel, `DrillShelf` recommendations, and low-sample empty state.
- `src/config/navIcons.tsx` — added `training` SVG icon.
- `src/config/nav.workspace.json` — added `Training` workspace entry.
- `src/App.tsx` — added `/app/training` route (inside `RequireVerified`), plus `/training` redirect.

## Verification

- `npm run build` / `tsc --noEmit`.
- Manual check: trends render only when `status === ok`, focus areas count correctly, `DrillShelf` displays from API recommendations, low-sample state shows when N < 3.

## Notes

- Follows workspace dark-first convention (`on-night` header, no `dark:` variants on app chrome).
- No internals named in UI copy.
- Charts are hand-rolled SVG (no new dependency).
