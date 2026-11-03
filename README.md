# Benben

Real-estate platform for Egypt: Flash 24H auctions, rentals, a listings marketplace, buyer requests and investment properties. The app is Arabic-first (RTL) and also in English.

- Product requirements: [`docs/PRD.md`](docs/PRD.md)
- How the project is built (an AI delivery framework with React + Supabase): [`CLAUDE.md`](CLAUDE.md), with diagrams in [`docs/framework/framework-diagrams.html`](docs/framework/framework-diagrams.html)
- Backlog: [`backlog/BACKLOG.md`](backlog/BACKLOG.md)
- Architecture: [`docs/decisions/`](docs/decisions/) (ADR-002 for the system, ADR-005 for staging)
- Operations: [`docs/runbook.md`](docs/runbook.md) (local setup, CI, deploys, rollback)

## Quick start

Needs Node 22, Docker, and pnpm through corepack.

```bash
corepack enable
pnpm install
pnpm db:start   # local Supabase (pinned CLI): all migrations + synthetic seed; writes apps/*/.env.local
pnpm dev        # customer PWA on http://localhost:5173  (pnpm dev:admin: staff admin on :5174)
```

No dashboard steps: the schema comes from `supabase/migrations/`, the data from `supabase/seed.sql` and `supabase/seed/staging.sql`.

## Repository layout

```
apps/web            customer PWA (React 19, Vite, TypeScript strict, Tailwind with the BEN-BEN tokens)
apps/admin          staff dashboard (same stack, separate build and URL)
packages/db-types   generated Supabase types (pnpm db:types; CI fails if stale)
packages/shared     shared client code (env, later money, digits, time sync)
packages/ui         design system: tokens and Tailwind preset now, components from ST-003
supabase/           config.toml, migrations/, migrations-down/, functions/, tests/ (pgTAP), seeds
tools/ci            the CI check scripts (the workflows only call these) and the self-test
e2e/                Playwright specs
```

## Interfaces for other packages (BV1-B1)

- **Routes:** add yours to `apps/web/src/routes.ts` (path, tab, label key, lazy `load`). Never edit the shell. Add your strings to `apps/web/src/i18n/messages.ts` (Arabic and English).
- **UI kit:** `@benben/ui` exports Button, TextField, PhoneField, OtpInput, Card, ListRow, Badge, LivePill, Skeleton, EmptyState, Icon, ToastProvider/useToast. Add components there as you need them.
- **Shared:** `@benben/shared` exports `formatEGP`/`parseEGPInput` (piasters), `localizeDigits`, `normalizeEgyptPhone`, `toErrorCode`, `newIdempotencyKey`, `serverNow`.
- **Tables:** `profiles` (`kyc_tier` T0/T1/T2), `user_roles`, `areas`, `compounds`, `properties` (minimal), `app_settings`, `audit_logs`, `kyc_submissions`. Types: `import type { Database } from '@benben/db-types'`.
- **Server helpers:** `private.has_role(role)`, `private.is_admin()` in RLS policies; `private.audit(...)` for the audit log; `public.admin_decide_kyc` and `public.kyc_submit`.
- **Local login:** phone `+201000000501`, code from the dev inbox button (non-prod), or `123456` for the test numbers in `supabase/config.toml`. The seeded KYC admin is `+201000000099`.

## CI and deploys

- **Every pull request into `main`** runs `.github/workflows/ci.yml`: lint, typecheck, Vitest, a fresh-database migration + seed check, up→down→up for new migrations, pgTAP, `supabase db lint`, RLS and RPC allow-list, generated-types freshness, a browser-bundle secret scan, Edge Function tests, and a Playwright smoke test. The single required status is **`CI passed`**. The same checks run locally with `pnpm ci:app` and `pnpm ci:db`.
- **`.github/workflows/ci-selftest.yml`** proves every check fails on a bad input (on demand, and when the checks change).
- **Every PR** also gets a preview of `apps/web`, linked in a PR comment: `preview.yml` builds it with no secrets, and `preview-deploy.yml` (from `main`) validates and uploads it to the separate `benben-web-preview` Pages project.
- **Merge to `main`** (only after stakeholder acceptance) runs `.github/workflows/deploy-staging.yml`, in this order: check the target is the project named `benben-staging`, `db push` the migrations, mark `runtime_env` as staging, run the seed files (Vault secrets, then the synthetic staging seed), set `APP_ENV=staging` and the mock providers, deploy the Edge Functions and smoke-test them, then build, scan and deploy both apps to their stable staging URLs, and run Playwright against staging.
- Deploys and previews **skip with a clear message** until the stakeholder provides the staging project and the host. See [ADR-005](docs/decisions/ADR-005-staging-hosting-and-region.md) §3 for the exact secrets.

## Workflow

1. Run `/kickoff` in Claude Code to get PRD questions, the backlog, a sprint plan, the design and data contracts.
2. Once the stakeholder approves, run `/run-story ST-###` for each story.
3. Validate on staging: `/feedback ST-### accepted` or `/feedback ST-### <comments>`.
4. Every two weeks, run `/sprint close` and then `/sprint plan`.
