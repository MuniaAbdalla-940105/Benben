# Runbook: local development, CI, deploys and rollback

Owner: devops. Decisions behind this: ADR-002 §3, §4, §15 and ADR-005. Keep this file current whenever a workflow or script in `tools/ci/` changes.

## 1. Run locally

Prerequisites: Node 22 (`.nvmrc`), pnpm 10 (`corepack enable` picks the version from `package.json`), Docker running. Deno 2.1.x only if you work on Edge Functions.

```bash
corepack enable
pnpm install
pnpm db:start        # supabase start (pinned CLI) + writes apps/*/.env.local with the URL and publishable key
pnpm dev             # customer PWA  http://localhost:5173
pnpm dev:admin       # staff admin   http://localhost:5174
```

`pnpm db:start` applies every migration in `supabase/migrations/` and both seeds to a fresh local database. Studio is at http://127.0.0.1:54323. Stop with `pnpm db:stop`.

| Task | Command |
|---|---|
| Fresh database (all migrations + seed) | `pnpm db:reset` |
| Regenerate DB types after a schema change | `pnpm db:types` (writes `packages/db-types/src/database.ts`; commit it) |
| pgTAP tests | `pnpm db:test` |
| Edge Function tests | `pnpm functions:test` (needs Deno) |
| Serve functions locally | `pnpm exec supabase functions serve` (reads `supabase/functions/.env`, written by `pnpm db:start` with `APP_ENV=local`; see `.env.example`) |
| Everything CI runs for the apps | `pnpm ci:app` |
| Everything CI runs for the database | `pnpm ci:db` (stack must be running) |
| Prove each check can fail | `pnpm ci:selftest` or `bash tools/ci/selftest/run.sh <node|db> [case]` |
| Playwright smoke | `pnpm build && pnpm e2e` (`pnpm exec playwright install chromium` once) |

Troubleshooting:
- **Image pulls slow or refused** (proxies, corporate networks): the CLI retries and falls back to another registry. Run `pnpm db:start` again; it resumes.
- **Port in use:** another Supabase project is running. `pnpm exec supabase stop --all` (or `--project-id <id>`).
- **Broken local data:** `pnpm db:reset` rebuilds from migrations; there is nothing else to preserve locally.

## 2. Adding a migration (every story with data)

1. `pnpm exec supabase migration new st###_<what>`, then rename it to the ADR-002 §3 pattern `<yyyymmddhhmmss>_st###_<what>.sql` if needed (CI check 2 enforces the pattern).
2. Write the up SQL. Rules: `enable row level security` on every table (public and private); `revoke execute ... from public, anon, authenticated` on every function, then grant explicitly; client-callable functions go in `tools/ci/rpc-allowlist.txt` as their exact signature (`public.name(argtypes)`) with the story ID; never `svc_*` (ADR-007).
3. Write `supabase/migrations-down/<same name without .sql>.down.sql`: it must reverse the migration exactly.
4. `pnpm db:reset && pnpm db:types`, add pgTAP tests in `supabase/tests/`, then `pnpm ci:db`.
5. Never edit a migration that is already on `main`. Add a new one (check 3 fails otherwise).

## 3. CI (pull requests into `main`)

`.github/workflows/ci.yml` runs on every PR into `main` and on demand (Actions → CI → Run workflow). Branch protection requires the job **`CI passed`**, which fails if any job below fails.

| # | Check | Job | Script |
|---|---|---|---|
| 1 | ESLint, `tsc` (all packages), Vitest | `app` | `pnpm lint`, `pnpm typecheck`, `pnpm test` |
| 8 | Build both apps, scan `dist/` for `service_role`, `sb_secret_…`, `sbp_…`, Postgres URLs with a password, CI secret names and JWTs with role `service_role` (prints only a short prefix); Vite configs must keep `envPrefix: 'VITE_'` and never `loadEnv(…, '')` | `app` | `tools/ci/check-bundle-secrets.sh` |
| – | Seed files hold synthetic data only | `app` | `tools/ci/check-seed-synthetic.sh` |
| 2 | Fresh database: all migrations, then the seed; migration names; seed idempotent (all seed files run twice more, row counts must not change); staging seed refuses to run without a `runtime_env` row | `db` | `tools/ci/check-migrations-fresh.sh` |
| 4 | pgTAP (`supabase test db`) | `db` | `tools/ci/check-db-tests.sh` |
| 5 | `supabase db lint`, fail on warning | `db` | `tools/ci/check-db-lint.sh` |
| 6 | In every non-system schema: RLS on every table; every view `security_invoker=true`; no matview or foreign table readable by `anon`/`authenticated`; no function executable by them unless its exact signature is allow-listed (`schema.name(argtypes)`, never `svc_*`); `private` not in `[api].schemas` | `db` | `tools/ci/check-rls.sh` + `check-rls.sql` + `rpc-allowlist.txt` |
| 7 | Generated types match the schema | `db` | `tools/ci/check-types-fresh.sh` |
| 3 | Migrations added in the PR: up → down → up gives the same schema, and down returns exactly to the base schema; merged migrations are immutable (deleting one is allowed only by the rollback procedure, §5) | `db` | `tools/ci/check-down-migrations.sh` |
| 9 | `deno lint` + `deno test supabase/functions` (Deno 2.1.4 = the edge runtime's Deno) | `functions` | `tools/ci/check-functions.sh` |
| – | Playwright smoke against the built web app | `e2e` | `pnpm e2e` |

`.github/workflows/ci-selftest.yml` (on demand, and on PRs that change `tools/ci/**` or the workflows) injects one bad input per case and asserts the matching check fails for the right reason, then shows the clean tree passes. Cases: lint error, type error, failing Vitest test, service-role JWT / `sb_secret_` key / literal `service_role` in the bundle, failing deno test, real-looking seed data, prod-forbidden function filtering, broken migration, badly named migration, failing pgTAP test, db lint warning, table without RLS (public and private), anon-executable public function, stale types, missing / non-reversible / incomplete down script, edited merged migration.

## 4. Deploys

### Staging (on merge to `main`)

`.github/workflows/deploy-staging.yml` runs on every push to `main` (that is, after the orchestrator merges a stakeholder-accepted PR) and on demand. Order:

1. **Preflight:** checks which inputs exist (ADR-005 §3). Missing ones are listed by name in the run summary and the deploy jobs are skipped.
2. **Supabase:** refuse unless the ref belongs to the project named `benben-staging`; `supabase link`; `db push --dry-run` (logged), `db push`; set `private.runtime_env = 'staging'` (never over `production`, and fails unless the result is `staging`); run every `supabase/seed/*.sql` in name order (`00_vault_secrets.sql` creates missing Vault secrets inside the database, then `staging.sql`); set the function settings `APP_ENV=staging` (ADR-007) and the `mock` provider selectors; deploy every Edge Function (`tools/ci/deploy-functions.sh staging`); smoke-test `/functions/v1/health`.
3. **Frontend:** build `apps/web` and `apps/admin` against staging with the publishable key, scan the bundle again, upload to Cloudflare Pages (`benben-web-staging`, `benben-admin-staging`, branch `main`).
4. **Playwright** against the web staging URL.

To redeploy without a merge: Actions → Deploy staging → Run workflow (branch `main`).

### PR previews

Two workflows, so pull-request code never sees a token (review H1):
1. `.github/workflows/preview.yml` (on the PR, **no secrets**): builds `apps/web` with the public repository variables, scans it, uploads `dist/` as the artifact `web-preview-dist`.
2. `.github/workflows/preview-deploy.yml` (`workflow_run`, runs from `main`, environment `preview`): resolves the PR number and head SHA from the run and the GitHub API, skips forks, validates and re-scans the artifact (`tools/ci/check-untrusted-dist.sh`), uploads it with the pinned wrangler to the separate Pages project `benben-web-preview` as branch `pr-<number>`, and posts the URL as a PR comment.

The preview reads from staging; the PR's own migrations are not on staging until merge.

### Production

Not set up yet (later story, stakeholder approves each release). `tools/ci/deploy-functions.sh production` deploys only the functions listed in `tools/ci/functions-production.txt` and **fails** if that list names `mock-gateway`, `dev-sms-inbox` or anything else in `tools/ci/prod-forbidden-functions.txt`.

## 5. Rolling back

### A migration on staging

Preferred: **roll forward.** Write a new migration that fixes or reverts the change, open a PR, merge after acceptance. It is reviewed and tested like any change, and the history stays linear.

When staging is blocked and a forward fix will take too long:

1. Actions → **Roll back a staging migration** → Run workflow, with the version (the 14-digit prefix) and the confirmation text `roll back staging`. It only accepts the **newest** migration applied on staging. It runs the matching `supabase/migrations-down/<version>_*.down.sql` and marks the version `reverted` in the migration history (`supabase migration repair`).
2. Open a PR that, in one change: deletes `supabase/migrations/<version>_*.sql`, deletes its `supabase/migrations-down/<version>_*.down.sql`, and adds `<version>  # <story/bug>, <date>, <reason>` to `supabase/migrations-reverted.txt`. CI check 3 allows deleting a merged migration only when all three are present. Otherwise the next deploy applies it again. A replacement migration, if any, gets a new, newer timestamp.
3. Note the rollback in the story file under `## History`.

Roll back several migrations by repeating step 1 from the newest down. Down scripts are tested in CI (check 3), but data written since the migration may be lost when a down drops a table: on staging that is synthetic and the seed restores it.

Locally there is nothing to roll back: edit the migration and `pnpm db:reset`, or apply the down script with `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/migrations-down/<file>.down.sql`.

### Edge Functions

Revert the change on `main` through a PR; the deploy redeploys the previous code. In an emergency, check out the last good commit locally and run `PROJECT_REF=<ref> bash tools/ci/deploy-functions.sh staging` with `SUPABASE_ACCESS_TOKEN` set.

### Frontend

Cloudflare dashboard → Workers & Pages → `benben-web-staging` (or `-admin-`) → Deployments → previous deployment → **Rollback**. It is instant. Then revert the change on `main` through a PR.

## 6. Secrets and environment variables

The full list, where each one lives and who provides it: ADR-005 §3. Rules:
- Browser bundles get `VITE_*` variables only: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable), `VITE_APP_ENV`, later `VITE_MOCK_GATEWAY_URL`. Check 8 blocks anything else.
- The service-role key never appears in CI, `.env` files or bundles; Edge Functions receive it from Supabase.
- `.env.local` files are git-ignored; `pnpm db:start` writes them with local values.
- Edge Function settings: `APP_ENV` (`local` | `staging` | `production`; ADR-007, must agree with `private.runtime_env`; unset counts as production), `PAYMENTS_PROVIDER`, `KYC_PROVIDER`, `SMS_PROVIDER`. Staging gets them from the deploy job; locally from `supabase/functions/.env`.
