# Task prompt: ST-001 → devops (owner), helpers solution-architect, qa-engineer, security

## 1. Role and seniority
You are a staff DevOps / platform engineer with 12 years of experience building CI/CD for small product teams on GitHub Actions. You have run Supabase in production for 4 years (CLI, migrations, pgTAP, Edge Functions, branching) and set up pnpm monorepos with Vite. You are known for fast, boring, reproducible pipelines that block bad merges, and for keeping secrets out of bundles. (Staff level because this pipeline guards money and identity code for every later story.)

## 2. Context
- Product: BEN-BEN, an auction-first real-estate platform for Egypt (`docs/PRD.md` §1).
- Story: **ST-001, Repo, CI pipeline and Supabase staging project** (risk: medium). The first story of sprint 1 (2026-11-02 → 2026-11-15). Every other story builds on it.
- Decisions: ADR-001 (React + Supabase, PWA first, mocks), **ADR-002 §3, §4 and §15** (monorepo layout, environments, the exact CI checks, env vars and secrets: follow them precisely), ADR-004.
- Merge policy (`CLAUDE.md`): this session never merges. The stakeholder verifies; the orchestrator merges after "accepted".

## 3. Task
Build what ADR-002 §15 "ST-001" specifies:
1. **pnpm monorepo** with Node 22 LTS: `apps/web` and `apps/admin` (React 19 + Vite + TS strict + Tailwind using `docs/design/tailwind-theme.js` and `docs/design/tokens.css`, each showing a minimal BEN-BEN placeholder page with the logo from `docs/design/brand/logo/`), plus `packages/db-types`, `packages/shared` and `packages/ui` (stubs), `supabase/` (config, empty first migration that only creates the `private` schema and `private.runtime_env`, `migrations-down/`, `tests/` with one pgTAP smoke test, `seed.sql`, `seed/staging.sql`), `tools/ci/` and `e2e/`. Pin the Supabase CLI in `package.json`.
2. **CI (GitHub Actions)** on every PR into `main`, with all 9 required checks from ADR-002 §15 (lint, typecheck, Vitest; migrations on a fresh DB plus seed; up→down→up for changed migrations; `supabase test db`; `supabase db lint`; `check-rls.sql` with the RPC allow-list; types freshness; bundle secret scan; `deno test` for functions). Each must be able to fail the PR.
3. **Deploy on merge to `main`**: `supabase db push` to staging, functions deploy (with the prod-forbidden list enforced), set `private.runtime_env`, run the staging seed, build and deploy both apps to a static host with stable staging URLs. Also a **preview deploy per PR** for `apps/web`, so the stakeholder can verify every story.
4. `README.md`: setup in a few commands from a fresh clone (`pnpm i`, `supabase start`, `pnpm dev`), and how CI and deploys work.
5. An ADR `docs/decisions/ADR-005-staging-hosting-and-region.md` recording the Supabase region and plan and the frontend host.

## 4. Inputs (read first)
- `backlog/stories/ST-001.md` (acceptance criteria), `docs/decisions/ADR-002-architecture.md` §3, §4, §14, §15, `ADR-001`, `ADR-004`
- `CLAUDE.md` (branch and commit rules, guardrails), `.claude/agents/devops.md`
- `docs/design/tailwind-theme.js`, `docs/design/tokens.css`, `docs/design/brand/logo/`

## 5. Constraints
- **Branch:** `st-001-repo-ci-staging` only. Commits follow the Conventional Commits rules in `CLAUDE.md`, each ending with `Refs: ST-001`.
- **Secrets:** never in Git or chat. The service-role key never reaches a browser bundle.
- **Stakeholder-owned inputs:** the Supabase staging project and its access come from the stakeholder (`SUPABASE_ACCESS_TOKEN`, `STAGING_PROJECT_REF`, `SUPABASE_DB_PASSWORD`, as environment variables in this session and as GitHub Actions secrets), and so does the frontend host. If they are missing:
  - build and verify everything that runs locally and in CI first;
  - write the deploy workflow so it skips cleanly with a clear message when the secrets are absent;
  - ask the stakeholder once, with a short checklist, for: the project (proposal: Frankfurt `eu-central-1`, Pro plan), the secrets, and the host (proposal: Cloudflare Pages, Vercel or Netlify; recommend one with reasons);
  - never invent or mock a staging URL.
- **Docker** may not be available in this cloud container. If `supabase start` cannot run here, say so, rely on CI (GitHub-hosted runners have Docker) for the database checks, and show the CI run as evidence.
- Out of scope: any auth, wallet or auction feature code (later stories); the load test (ST-012).

## 6. Acceptance criteria
Copy them from `backlog/stories/ST-001.md`, plus these technical ones:
- A PR with a deliberately failing test, a stale types file, a broken migration, a table without RLS, or a `service_role` string in the bundle fails CI. Prove each one on a throwaway branch or in a CI matrix test, then remove it.
- CI on a clean PR is green in under 10 minutes.

## 7. Deliverables
- Code and config on `st-001-repo-ci-staging`; `README.md`; `ADR-005`.
- One PR into `main` titled `ST-001 Repo, CI pipeline and Supabase staging project`. The body has:
  - the story link;
  - the acceptance criteria as a checklist;
  - how to verify (commands, CI run links, staging and preview URLs or "pending stakeholder secrets");
  - test evidence;
  - the security review result.
- Story file updated: status, History (session link, branch, PR), QA evidence, Review notes.

## 8. Self-check before reporting done
- [ ] Every acceptance criterion is met and verified, or explicitly blocked on a stakeholder input.
- [ ] All 9 CI checks exist and each was shown to fail on a bad input.
- [ ] The bundle scan passes; no secret in Git.
- [ ] The `solution-architect` review and the `security` review were run, and their findings are fixed or logged.
- [ ] `qa-engineer` ran the test plan in the story.
- [ ] Do not merge. Tell the stakeholder the PR link and exactly what to check.
