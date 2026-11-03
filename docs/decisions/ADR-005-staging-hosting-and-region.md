# ADR-005: Staging environment: Supabase plan and region, frontend host, and pipeline inputs

- Status: **proposed, pending stakeholder** (revised 2026-11-03 after the ST-001 security and architecture review). The pipeline is built and runs; nothing is deployed until the stakeholder creates the accounts below and adds the secrets.
- Date: 2026-11-03
- Author: devops (ST-001)
- Builds on: ADR-001 (stack), ADR-002 §4 (environments) and §15 (CI, deploy, env vars, secrets), ADR-004
- PRD sections: 8.2 (security), 8.4 (non-functional). Open questions: Q-06 (data residency), Q-44 (plan), Q-74 (seed areas)
- Story: `backlog/stories/ST-001.md`

## 1. Context

ST-001 needs a staging environment that every story is validated on: a Supabase project that receives migrations only from CI after a stakeholder merge, and a static host that gives `apps/web` and `apps/admin` stable staging URLs plus a preview URL for every pull request. The stakeholder owns the accounts and the billing. Staging holds synthetic data only.

## 2. Decision (proposed)

### 2.1 Supabase staging project

| | Proposal | Why |
|---|---|---|
| Region | **`eu-central-1` (Frankfurt)** | Supabase has no region in Egypt (ADR-002 §16 R2). Frankfurt is among the closest Supabase regions to Cairo (round trip typically well under 100 ms; ST-012 measures it) and is where ADR-002 §4 and §14 already plan the load-test generators. Check the region list when creating the project: if a closer region exists by then, prefer it and update this ADR. |
| Plan | **Pro** (organisation plan; verify the current price on supabase.com/pricing) | Free projects pause after a week without activity, which breaks "validate on staging" between sprints. Pro adds daily backups, higher Realtime quotas (needed for the ST-012 load test, ADR-002 §16 R1) and a spend cap. Keep the spend cap **on** for staging, and turn it off only for the ST-012 run with stakeholder approval. |
| Project name | `benben-staging`, in an organisation that will **not** hold production | Lets the access token used by CI be scoped to staging only. Production is a separate project, decided with counsel before the pilot (Q-06, ADR-002 §16 R2). |
| Data | Synthetic only: `supabase/seed/staging.sql` | CLAUDE.md guardrail, ST-001 AC. `tools/ci/check-seed-synthetic.sh` blocks real-looking emails and phone numbers. |
| Schema changes | Only `.github/workflows/deploy-staging.yml` (`supabase db push`) after a merge to `main` | ADR-002 §4. No dashboard edits. |

### 2.2 Frontend host: **Cloudflare Pages** (recommended)

Both apps are static Vite builds, so any static host works. Options considered:

| | Cloudflare Pages | Vercel | Netlify |
|---|---|---|---|
| Deploy model we use | Direct upload of `dist/` from our CI (`wrangler pages deploy`) | Git integration or CLI | Git integration or CLI |
| Commercial use on the free plan | Yes | No (Hobby is non-commercial; Pro is billed per member) | Yes, with bandwidth and build-minute caps |
| Stable staging URL | `https://<project>.pages.dev` (production branch `main`) | `<project>.vercel.app` | `<site>.netlify.app` |
| Preview per PR | Branch alias `https://<branch>.<project>.pages.dev` | Yes | Yes |
| Edge near Egypt | Cloudflare lists a Cairo data centre | Global edge; check the region list for Egypt | Global CDN; check the PoP list for Egypt |
| Protect admin staging later | Cloudflare Access (free tier) in front of the admin project | Password protection on paid plans | Password protection on paid plans |

**Recommendation: Cloudflare Pages**, because:
1. **The build stays in our CI.** We build, run the bundle secret scan (check 8) and only then upload `dist/`. The host never sees the repository or any secret, and there are no host build minutes to run out of.
2. **Free plan allows commercial use**, with no per-seat cost for a team of agents and stakeholders.
3. **Stable staging URLs plus a stable alias per branch**, which fits "one story = one branch = one PR".
4. **Latency in Egypt:** Cloudflare lists a data centre in Cairo, so static assets are served in-country.
5. **Admin staging can sit behind Cloudflare Access** later with no code change.

Cons and mitigations: preview URLs are public (synthetic data only; Access can be added). Cloudflare now steers new projects towards Workers static assets; our `dist/` upload moves there with a one-line change if Pages is ever retired.

Resulting URLs (they exist only after the first deploy; nothing is live yet):
- web staging: `https://benben-web-staging.pages.dev`
- admin staging: `https://benben-admin-staging.pages.dev`
- PR preview (web): `https://pr-<number>.benben-web-preview.pages.dev`, posted as a PR comment by `.github/workflows/preview-deploy.yml`.

## 3. What the stakeholder must provide

Repository settings are at GitHub → Settings → Secrets and variables → Actions, and Settings → Environments. Revised after the ST-001 security review (H1, M1, M5).

**Environments** (Settings → Environments):

| Environment | Deployment branches | Required reviewers | Secrets in it |
|---|---|---|---|
| `staging` | **`main` only** | the stakeholder (approves each staging deploy and rollback run) | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `CLOUDFLARE_API_TOKEN` |
| `preview` | **`main` only** (the preview-deploy workflow runs from `main`) | none | `CLOUDFLARE_API_TOKEN` (may be a separate token) |

**Secrets and variables:**

| Name | Kind | Where | Value / how to get it |
|---|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | secret | environment `staging` | supabase.com → Account → Access tokens. Prefer a token scoped to the staging organisation or project. |
| `SUPABASE_DB_PASSWORD` | secret | environment `staging` | The database password chosen when creating `benben-staging`. |
| `CLOUDFLARE_API_TOKEN` | secret | environments `staging` **and** `preview` (never repository level) | Cloudflare → My Profile → API Tokens → custom token with **Account › Cloudflare Pages › Edit** on the BEN-BEN account only. |
| `STAGING_PROJECT_REF` | variable | repository | The 20-character project ref. Not sensitive: it is part of the public API URL. The deploy also checks that this ref belongs to a project **named `benben-staging`** before writing anything (M5). |
| `STAGING_SUPABASE_ANON_KEY` | variable | repository | The **publishable** key (`sb_publishable_…`) or the legacy `anon` key. Public by design. Never the secret or service-role key: check 8 fails the build if one is used. |
| `CLOUDFLARE_ACCOUNT_ID` | variable | repository | Cloudflare → Workers & Pages → Account ID. |

**Edge Function settings** (set by the deploy job with `supabase secrets set`; nothing to add by hand): `APP_ENV=staging` (ADR-007; must agree with `private.runtime_env`), `PAYMENTS_PROVIDER=mock`, `KYC_PROVIDER=mock`, `SMS_PROVIDER=mock`. Locally, `pnpm db:start` writes `APP_ENV=local` to the git-ignored `supabase/functions/.env`. Real provider secrets (`PAYMENTS_HMAC_SECRET`, `SEND_SMS_HOOK_SECRET`, …) arrive with their stories.

**Branch protection on `main`** (Settings → Branches):
- require a pull request before merging, and **require review from Code Owners** (`.github/CODEOWNERS` covers `.github/**`, `tools/ci/**`, `supabase/migrations/**`, `supabase/migrations-down/**`, `supabase/migrations-reverted.txt`, `supabase/config.toml`);
- require the status check **`CI passed`** (from `.github/workflows/ci.yml`);
- **require branches to be up to date before merging** (review A3: two PRs that each add a migration are then re-checked in order).

**Pages projects:** `benben-web-staging` and `benben-admin-staging` (stable staging URLs) and **`benben-web-preview`** (PR previews only, so a preview can never replace staging). All three are created on first deploy.

The service-role key is **not** a GitHub secret: Supabase provides it to Edge Functions automatically (ADR-002 §15), and CI never needs it. The Vault secrets (`pii_key`, `pii_pepper`, `reserve_key`, `cron_secret`) are generated inside the database by `supabase/seed/00_vault_secrets.sql`, locally, in CI and on staging, and are never in Git, CI logs or GitHub.

**How previews stay safe (review H1).** `preview.yml` runs the pull request's code with **no secrets** and uploads `apps/web/dist` as an artifact. `preview-deploy.yml` runs from `main` (a `workflow_run` trigger) in the `preview` environment. It takes the PR number and head SHA from the run and the GitHub API, never from the artifact; deploys same-repository PRs only; validates and re-scans the artifact; and uploads it with the pinned wrangler to `benben-web-preview` under the branch `pr-<number>`. The deploy, rollback and preview-deploy jobs all run only on `refs/heads/main` (M1).

Until these exist, `deploy-staging.yml` and `preview-deploy.yml` report the missing names in the run summary and skip their deploy steps. The runs stay green, and no staging URL is claimed.

## 4. Consequences

- Staging deploys start on the first merge to `main` after the inputs above exist. A manual run (Actions → Deploy staging → Run workflow) deploys the current `main` without a new merge.
- PR previews use the **staging** Supabase project. A PR's own migrations are not on staging until it is merged, so stories with schema changes are verified locally or on staging after merge. Supabase Branching (a database per PR) would remove this gap at extra cost; revisit if it slows validation.
- Production (a separate project and Pages projects, with release approval) is a later story. `tools/ci/deploy-functions.sh production` already removes and blocks the prod-forbidden functions (`mock-gateway`, `dev-sms-inbox`).
- Region and data residency for **production** stay open (Q-06, ADR-002 §16 R2). Staging in Frankfurt is fine because it holds synthetic data only.
