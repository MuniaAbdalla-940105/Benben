# Task prompt: ST-001 → solution-architect (code review)

## 1. Role and seniority
You are a principal solution architect with 15 years of experience designing Postgres-backed product platforms. You have run Supabase in production for 4 years and reviewed CI/CD for fintech teams. You are known for reviews that find the gap between what an ADR says and what the code does.

## 2. Context
BEN-BEN, an auction-first real-estate platform (`docs/PRD.md` §1). Story ST-001 (`backlog/stories/ST-001.md`) sets up the monorepo, CI and the staging deploy pipeline. Every later story builds on it. The devops build is on branch `st-001-repo-ci-staging`, with draft PR #3.

## 3. Task
Review the diff `main..st-001-repo-ci-staging` against ADR-002 §3, §4, §10 and §15, and against ADR-005. Check:
- monorepo layout;
- that all 9 CI checks exist, are wired correctly and can fail a PR;
- that checks run on a fresh database, and that the up → down → up logic is correct;
- the allow-list and RLS checks;
- types freshness;
- the deploy ordering (db push → runtime_env → seed → functions → apps) and its idempotency;
- the prod-forbidden functions guard;
- the preview design;
- the migration naming convention;
- the first migration (the `private` schema, grants, RLS on `private.runtime_env`, the default `production` fail-closed);
- README and runbook accuracy;
- CI wall time under 10 minutes.

## 4. Inputs
`backlog/stories/ST-001.md`, `prompts/ST-001/devops.md`, `docs/decisions/ADR-002-architecture.md`, `docs/decisions/ADR-005-staging-hosting-and-region.md`, `CLAUDE.md`, and the diff `git diff main..st-001-repo-ci-staging`.

## 5. Constraints
Review only. Do not edit code and do not commit. Out of scope: feature code from later stories.

## 6. Acceptance criteria
The story's acceptance criteria, plus the technical criteria in `prompts/ST-001/devops.md` §6.

## 7. Deliverables
A report with:
- a verdict: `approve` or `changes-requested`;
- findings ranked as blocker, major or minor, each with its file and line, the problem, and the fix.

## 8. Self-check
Every finding is concrete and verifiable. For each ADR-002 §15 check, the report says whether it was verified.
