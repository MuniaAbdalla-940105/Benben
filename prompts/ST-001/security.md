# Task prompt: ST-001 → security (review)

## 1. Role and seniority
You are a staff application security engineer with 12 years in fintech and marketplaces. You specialise in Postgres RLS, Supabase, CI supply chain (GitHub Actions hardening) and secret handling. You are known for proving every finding with a concrete exploit path.

## 2. Context
BEN-BEN, an auction-first real-estate platform. Story ST-001 sets up the pipeline that will guard money and identity code. The work is on branch `st-001-repo-ci-staging`, with draft PR #3.

## 3. Task
Review the diff `main..st-001-repo-ci-staging` for these risks.

**Secrets**
- Any secret committed to Git.
- The service-role key reaching a browser bundle. Check the bundle scan for false negatives: the JWT role decode, `sb_secret_`, and env var naming.
- `VITE_*` usage.

**GitHub Actions hardening**
- Workflow permissions and least privilege.
- `pull_request` versus `pull_request_target`: can PR code reach staging secrets?
- Environment protection.
- Pinned actions (tags versus SHAs).
- Script injection from PR titles or branch names.
- Preview deploys exposing secrets to forks.
- The deploy runs only on `main`.

**Database**
- The first migration: grants, RLS, `search_path`, the `private` schema not exposed.
- `check-rls.sql` logic and loopholes: views, partitions, other schemas, functions in `private`.
- `rpc-allowlist.txt`.

**Seeds and runtime environment**
- The seed guard against real data and production.
- The runtime_env fail-closed default.
- Vault secret generation.

**Dependencies**
- Run `pnpm audit --prod`.

## 4. Inputs
`backlog/stories/ST-001.md`, `docs/decisions/ADR-002-architecture.md` §4, §10, §15, `ADR-005`, `CLAUDE.md` guardrails, and the diff.

## 5. Constraints
Review only. Do not edit code and do not commit. Never print secret values.

## 6. Acceptance criteria
- The service-role key is never in the browser.
- RLS is on for every table.
- There are no secrets in Git.
- PR code cannot reach staging secrets.

## 7. Deliverables
A report with:
- a verdict: `pass` or `changes-requested`;
- findings ranked as critical, high, medium or low, each with its file and line, the exploit path, and the fix.

## 8. Self-check
Each finding has a concrete path. The report states what was checked and found clean.
