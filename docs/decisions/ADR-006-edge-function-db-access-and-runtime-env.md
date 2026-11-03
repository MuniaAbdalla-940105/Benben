# ADR-006: How Edge Functions call the database and learn the runtime environment

- Status: **accepted by solution-architect** (no stack change; stakeholder informed through the ST-001 review report)
- Date: 2026-11-03
- Author: solution-architect (ST-001 review, risk 5)
- Amends: ADR-002 §2 ("writes through `private` functions with the service role") and §4 (`private.runtime_env`)
- Affects contracts: `DATA_MODEL.md` §1 and §5, `ST-004.md`, `ST-005.md`, `ST-007.md` (and every later contract with an Edge Function)

## 1. Context

Two gaps came up in the ST-001 review:

1. **Edge Functions cannot reach `private`.** ADR-002 §2 says Edge Functions "write through `private` functions with the service role". The ST-004, ST-005 and ST-007 contracts follow that, for example `private.create_payment_intent` and `private.process_payment_event`. But `private` is not in the PostgREST exposed schemas (ADR-002 §10, `supabase/config.toml` `[api].schemas`), and `service_role` has no `USAGE` on it (ST-001 migration). So `supabase.rpc()` can never call a `private` function, whatever the key.
2. **Dev-only Edge Functions must fail closed in production.** This applies to `mock-gateway` (ST-007) and `dev-sms-inbox` (ST-004). ADR-002 §4 makes `private.runtime_env` the environment marker, with a missing row meaning `production`. Edge Functions could not read that marker, for the reason in point 1.

The deploy guard (`tools/ci/deploy-functions.sh`) keeps these functions out of production by name. A runtime check is the second, independent layer. `mock-gateway` credits wallets with fake money, so a single layer is not enough.

## 2. Options

**Database access from Edge Functions**
- (a) Expose `private` to PostgREST. Rejected: it removes the main reason `private` exists.
- (b) Connect directly to Postgres from Edge Functions with `SUPABASE_DB_URL`. Rejected: this adds a second DB access path with its own driver, pooling and role (`postgres`), and gives no generated types.
- (c) Use **`public.svc_*` wrapper functions that only `service_role` can execute**. Chosen.

**Runtime environment in Edge Functions**
- (a) DB only: `public.svc_runtime_env()`.
- (b) Function secret `APP_ENV` only, set by the deploy.
- (c) **Both, and they must agree.** Chosen.

## 3. Decision

### 3.1 Edge Function → database: `public.svc_*` wrappers

- Every `private` function that an Edge Function calls gets a wrapper `public.svc_<name>`.
  - Same arguments and the same return type.
  - `SECURITY DEFINER`, `SET search_path = ''`.
  - The body is a single call to the `private` function. No logic lives in the wrapper.
- Grants for each wrapper:
  ```sql
  revoke execute on function public.svc_<name>(...) from public, anon, authenticated;
  grant  execute on function public.svc_<name>(...) to service_role;
  ```
- `svc_*` functions are **never** added to `tools/ci/rpc-allowlist.txt`. CI check 6 then proves that `anon` and `authenticated` cannot execute them.
- Edge Functions call them with the service-role client: `admin.rpc('svc_<name>', {...})`. This is typed by `supabase gen types`.
- Plain table reads and writes from Edge Functions (for example the insert into `public.payment_webhook_events`) use the service-role client on `public` tables as before.
- The frontend never calls `svc_*`. The calls would fail with `42501` anyway. A lint rule that rejects `.rpc('svc_` under `apps/` is recommended (devops, any story).

### 3.2 Runtime environment: database is authoritative, `APP_ENV` must agree

- **Database.** ST-001 owns `private.runtime_env`. ST-004 adds:
  - `private.env() returns text`: returns `coalesce((select env from private.runtime_env where id), 'production')`;
  - `public.svc_runtime_env() returns text`: the `svc_` wrapper of `private.env()`, executable by `service_role` only.
- **Function secret `APP_ENV`** (`local` | `staging` | `production`). Who sets it:
  - the staging deploy sets `APP_ENV=staging`;
  - local `supabase functions serve` gets `APP_ENV=local`;
  - production sets `APP_ENV=production`, or leaves it unset. Unset is treated as `production`.
- **Guard** `requireNonProduction(admin)` in `supabase/functions/_shared/env.ts`. It is the first statement of every dev-only Edge Function:
  1. `appEnv = parseAppEnv(Deno.env.get('APP_ENV'))`. A missing or unknown value becomes `production`, the same rule as `packages/shared/src/env.ts`.
  2. `dbEnv = await admin.rpc('svc_runtime_env')`. An RPC error counts as `production`.
  3. The call is allowed only if `appEnv === dbEnv` and `dbEnv !== 'production'`. Otherwise the function returns HTTP 403 with `{ ok: false, error_code: 'NOT_ALLOWED_IN_ENV' }`. On a mismatch it also logs `ENV_MISMATCH` with both values.
  4. There is no caching. Dev-only functions get little traffic, and a fresh read means a change to `runtime_env` takes effect at once.
- **Dev-only SQL functions** (for example `dev_fund_wallet`, `dev_seed_bidders`) keep using `private.env()` directly (ST-004 §2.1).

## 4. Consequences

- **Good**
  - `private` stays unexposed. There is one DB access path for Edge Functions, and it is typed and checked by CI.
  - A dev-only function in production needs **three** independent mistakes before it can act: the deploy guard, the secret and the DB marker.
- **Cost**
  - One thin wrapper per Edge-Function-facing `private` function, which is boilerplate.
  - `svc_*` names appear in the generated types used by the frontend. That is harmless because only the grant controls access.
  - One extra RPC per dev-only request.
- **Devops work (ST-001 pipeline)**
  - Add `APP_ENV=staging` to the `supabase secrets set` step of `.github/workflows/deploy-staging.yml`.
  - Give local `supabase functions serve` `APP_ENV=local`, for example through a git-ignored `supabase/functions/.env` written by `tools/dev/write-local-env.sh`, plus a committed `.env.example`.
  - Add `APP_ENV` to the function secrets list in ADR-005 §3 and in the runbook.
- **Contract follow-up.** Contracts that name `private.*` calls from Edge Functions are read with this rule. The Edge Function calls `public.svc_<same name>`. The contracts touched in this change are ST-004 and ST-007. ST-005 (`kyc_mark_submitted`, `kyc_apply_result`) and later contracts follow the `DATA_MODEL.md` §1 convention without being edited one by one.
