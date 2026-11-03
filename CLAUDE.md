# BEN-BEN: rules for every Claude session

Auction-first real-estate app for Egypt (`docs/PRD.md`; never edit it). The active plan is **Basic v1** (`backlog/BASIC-V1.md`, ADR-006). The full framework (kickoff, sprints, prompt template, metrics) is in `docs/framework/FRAMEWORK-FULL.md`. Read it only when you need it.

## Stack and layout
- React 19, TS, Vite, Tailwind (`docs/design/tailwind-theme.js`, `tokens.css`), TanStack Query, React Router, Vitest, Playwright. Supabase (Postgres, Auth, Storage, Realtime, Edge Functions).
- `apps/web` (PWA), `apps/admin`, `packages/{ui,shared,db-types}`, `supabase/` (migrations + down scripts, functions, pgTAP, seeds), `tools/`, `e2e/`. Setup and CI: `README.md`.
- Decisions: `docs/decisions/ADR-001…007`. Data contracts: `docs/design/contracts/`. Screens: `docs/design/screens/`.

## Roles and merging
- **Stakeholder** (human): decides scope, answers questions, verifies on staging.
- **Orchestrator** session: plans, writes prompts, starts one session per package, reports. It builds no feature code. **It never starts the next step or merges without the stakeholder's explicit go** (stakeholder, 2026-11-03).
- **Package / story session:** works only on its own branch and opens one PR into `main`. **Never merges.**

## Branches and commits
- Branches: `st-###-<what>`, `bv1-b#-<what>`, `bug-###-<what>`, `sprint-<n>/<what>`. Never `fix`, `wip`, `update` or random suffixes.
- Commits: `<type>(<scope>): <imperative summary ≤72>`, where the type is one of feat, fix, docs, design, test, refactor, chore, ci, db, sec. The body says why. The last line is `Refs: <ID>`. One logical change per commit.

## Guardrails (never cut)
- RLS on every table. The service-role key never reaches the browser.
- Money, bids and status changes only through server-side functions; idempotent; money as `bigint` piasters.
- Schema changes only as migrations in Git. Synthetic data only. Secrets never in Git or chat.
- Every bug fix adds a regression test.

## Token rules (stakeholder, 2026-11-03)
- **No sub-agents** in package sessions: write the code yourself. The only exception is the security review where the package says so.
- **Models:** Sonnet for all work. Haiku for docs and status edits. Opus only for the security review of B2 (wallet) and B3 (auctions).
- Read only your prompt, its contract and the files you change. Use Grep, not whole-file reads of large docs. Do not open the PRD or the design docs unless the prompt points to a section.
- No screenshots unless something looks broken. Do not re-run checks that already passed. Reports: the PR link and a short verify checklist.
- Packages run **one at a time**.
