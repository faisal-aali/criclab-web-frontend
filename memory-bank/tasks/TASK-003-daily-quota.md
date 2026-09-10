# TASK-003 — Daily quota expected start UI

**Feature:** FEAT-031 Daily video quota  
**Status:** Done  
**Priority:** P1

## Goal

Show when a queued clip will start, update that time from the job poll, and let the owner remove a clip that has not started.

## Acceptance criteria

- [x] `Job` includes `expected_start_at` / `scheduled_date` / `cancelled`
- [x] Processing pages and header indicator show expected start while queued/claimed; remaining `eta_seconds` once running
- [x] Remove from queue while `status === queued`
- [x] Copy does not name internals (no quota/worker jargon)

## Notes

Expected time is formatted locally via `formatExpectedAt`. The API stores UTC.
