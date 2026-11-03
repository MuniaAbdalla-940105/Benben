# ADR-005: Staging environment: Supabase plan and region, frontend host, and pipeline inputs

- Status: **proposed, pending stakeholder.** The pipeline is built and runs; nothing is deployed until the stakeholder creates the accounts below and adds the secrets.
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
- PR preview (web): `https://<branch-alias>.benben-web-staging.pages.dev`, posted as a PR comment by `.github/workflows/preview.yml`.

## 3. What the stakeholder must provide

Repository settings are at GitHub → Settings → Secrets and variables → Actions, and Settings → Environments.

| Name | Kind | Where | Value / how to get it |
|---|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | secret | Environment **`staging`** | supabase.com → Account → Access tokens. Prefer a token scoped to the staging organisation or project. |
| `SUPABASE_DB_PASSWORD` | secret | Environment **`staging`** | The database password chosen when creating `benben-staging`. |
| `STAGING_PROJECT_REF` | variable (or secret) | Repository | The 20-character project ref (Project Settings → General). Not sensitive: it is part of the public API URL. Workflows accept it as a variable or a secret. |
| `STAGING_SUPABASE_ANON_KEY` | variable | Repository | Project Settings → API keys → the **publishable** key (`sb_publishable_…`) or the legacy `anon` key. Public by design. Never the secret or service-role key: check 8 fails the deploy if one is used. |
| `CLOUDFLARE_API_TOKEN` | secret | Repository | Cloudflare dashboard → My Profile → API Tokens → custom token with **Account › Cloudflare Pages › Edit** on the BEN-BEN account only. |
| `CLOUDFLARE_ACCOUNT_ID` | variable (or secret) | Repository | Cloudflare dashboard → Workers & Pages → Account ID. |

Also:
- **Environment `staging`:** add a deployment branch rule "`main` only". The database password and access token are then readable only by the deploy and rollback workflows on `main`, never by a pull-request branch.
- **Branch protection on `main`:** require the status check **`CI passed`** (from `.github/workflows/ci.yml`) and require pull requests. This makes every CI check block merges (ST-001 AC 2).
- The Cloudflare token and the anon key are repository-level because PR previews run on PR branches. Pull requests from forks get no secrets, so their preview is skipped.

The service-role key is **not** a GitHub secret: Supabase provides it to Edge Functions automatically (ADR-002 §15), and CI never needs it. The Vault secrets (`pii_key`, `pii_pepper`, `reserve_key`, `cron_secret`) are generated inside the staging database by the deploy job (`tools/ci/sql/ensure-vault-secrets.sql`) and are never in Git, CI logs or GitHub.

Until these exist, `deploy-staging.yml` and `preview.yml` run a preflight that lists the missing names in the run summary and skip every deploy job. The runs stay green, and no staging URL is claimed.

## 4. Consequences

- Staging deploys start on the first merge to `main` after the inputs above exist. A manual run (Actions → Deploy staging → Run workflow) deploys the current `main` without a new merge.
- PR previews use the **staging** Supabase project. A PR's own migrations are not on staging until it is merged, so stories with schema changes are verified locally or on staging after merge. Supabase Branching (a database per PR) would remove this gap at extra cost; revisit if it slows validation.
- Production (a separate project and Pages projects, with release approval) is a later story. `tools/ci/deploy-functions.sh production` already removes and blocks the prod-forbidden functions (`mock-gateway`, `dev-sms-inbox`).
- Region and data residency for **production** stay open (Q-06, ADR-002 §16 R2). Staging in Frankfurt is fine because it holds synthetic data only.
