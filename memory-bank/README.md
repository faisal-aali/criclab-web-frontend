# Memory Bank — Cric-Lab (Frontend)

Structured source of truth the AI reads first for the **Cric-Lab Vite + React frontend**.

Sibling backend repo: `../criclab-backend` (FastAPI + CV pipeline + its own memory-bank with full pipeline rules).

## Layout

```text
memory-bank/
├── productBrief.md      # What Cric-Lab is — users, features, success
├── techContext.md       # Vite+React stack + API client contract
├── systemPatterns.md    # UI rules — MOST IMPORTANT FILE for this repo
├── roadmap.md           # Features FEAT-001 …
├── tasks/               # Frontend-relevant tasks
└── agent-rules/         # How the agent should behave
```

## Core files

| File | Role |
|------|------|
| `productBrief.md` | Cricket bowling lab: upload → analyze → metrics → PDF |
| `techContext.md` | Vite React FE, API client, env/proxy to FastAPI |
| `systemPatterns.md` | Truth contract for metrics UI; screens; no direct Mongo/Ollama |
| `roadmap.md` | MVP bowling workflow + phased expansion |

## Why this exists

Vague prompts force guessing. The Memory Bank encodes product intent and UI rules so the agent behaves like a teammate who already knows Cric-Lab.

**Key lesson:** context changes output more than prompts.

## How to use

1. Ask: `Read all memory bank files.` — understanding before coding
2. Implement from a task under `tasks/` while obeying `systemPatterns.md`
3. Pipeline / CV / PDF internals live in `criclab-backend` — do not reimplement them in React

## Not Notera / SpinLab product code

This folder previously described **Notera**. It now describes **Cric-Lab only**. UX inspiration comes from SpinLab AI; domain is cricket bowling.
