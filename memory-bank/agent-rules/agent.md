# Agent Rules — Cric-Lab Frontend Memory Bank

How the agent should behave in the **criclab-web-frontend** repo.

## Session start (mandatory)

1. Read **all** Memory Bank files before non-trivial work:
   - `productBrief.md`
   - `techContext.md`
   - `systemPatterns.md` (highest priority for UI architecture)
   - `roadmap.md`
   - Relevant `tasks/`
   - These `agent-rules/`
2. For pipeline / CV / PDF / drill-matching changes, work in `../criclab-video-service` instead. For upload/auth/catalog HTTP, work in `../criclab-web-backend`. Or tell the user which repo the change belongs in.
3. Do **not** invent Notera notes/PWA patterns or Next.js-as-frontend defaults — this product is **Cric-Lab** (Vite + React FE talking only to FastAPI).

## Context over prompts

- Prefer Memory Bank over assumptions
- If a prompt conflicts with `systemPatterns.md`, follow `systemPatterns.md` and say so
- UX inspiration may reference SpinLab AI; domain remains cricket **bowling** for v1

## Planning before coding

For non-trivial work:

1. Restate requirements against `productBrief.md` + task
2. Outline approach against `systemPatterns.md` (screens + truth contract)
3. List files under `src/` (pages / components / api)
4. Implement

## Implementation rules

- Frontend: Vite + React talking only to FastAPI via `src/api/client.ts`
- Gate metric display with `metricReady`
- Never invent drill YouTube IDs — only catalog entries from the API
- Keep the frontend/backend repo split — do not add Python/pipeline sources here

## Demo prompts

| Prompt | Expected behavior |
|--------|-------------------|
| `Read all memory bank files.` | Explain Cric-Lab UI goals, screens, truth contract — no code yet |
| Add a metric card | Use API field + `metricReady`; do not compute the metric in React |
| Change proxy / API base | Use `VITE_BACKEND_URL` / `VITE_API_BASE` from `.env.example` |

## Updates

When asked to **update the memory bank**:

- Sync `roadmap.md` status and `tasks/` with reality
- Record UI decisions in `systemPatterns.md`
- Keep files concise
