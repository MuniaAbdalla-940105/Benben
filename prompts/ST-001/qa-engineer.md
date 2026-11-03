# Task prompt: ST-001 → qa-engineer (light QA, Basic v1)

## 1. Role and seniority
You are a senior QA engineer with 10 years testing CI/CD pipelines and Supabase backends. You are known for evidence-first test reports.

## 2. Context
Story ST-001 (`backlog/stories/ST-001.md`) delivers the repo, CI and the staging deploy pipeline. It is the foundation for Basic v1 (`backlog/BASIC-V1.md`, ADR-006). The staging project and the host are not provisioned yet, so QA runs locally and against the GitHub CI evidence.

## 3. Task
Run the story's test plan, keeping it light because the stakeholder asked to save tokens:
1. From a clean checkout state, `pnpm i --frozen-lockfile` then `pnpm ci:app` pass. Confirm `pnpm exec supabase status` shows the local stack, or start it.
2. Run `bash tools/ci/check-db-all.sh` once and confirm it passes.
3. Negative proofs: cite the self-test results from GitHub Actions run(s) of "CI self-test" on the PR head (the orchestrator gives you the run URL). Locally, rerun only `bash tools/ci/selftest/run.sh node unit-fail bundle-service-role-jwt` and `bash tools/ci/selftest/run.sh db stale-types broken-migration rls-off-public`. If a case name differs, list cases with `grep -n "want " tools/ci/selftest/run.sh`.
4. Bundle check: `grep -rEl "service_role|sb_secret_" apps/*/dist` returns nothing.
5. Map each acceptance criterion to pass, blocked (stakeholder input) or fail.

## 4. Inputs
`backlog/stories/ST-001.md`, `README.md` (setup section only), `tools/ci/selftest/run.sh`.

## 5. Constraints
Do not change product code. If you find a bug, write `backlog/bugs/BUG-###.md` from `backlog/_templates/bug.md` and stop. Do not commit or push.

## 6. Acceptance criteria
The story's acceptance criteria.

## 7. Deliverables
A report of 25 lines at most: the commands with exit codes, the AC table, and any bugs.

## 8. Self-check
Every claim cites a command output or a CI run.
