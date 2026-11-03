#!/usr/bin/env bash
# Writes apps/web/.env.local and apps/admin/.env.local from the running local Supabase stack, so a fresh
# clone needs no manual copy-paste (ST-001 AC 1), and supabase/functions/.env with APP_ENV=local for
# `supabase functions serve` (ADR-006). Only the URL and the publishable (anon) key are written;
# the service-role / secret key is never put in a browser env file. .env.local is git-ignored.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

status="$(pnpm exec supabase status -o env 2>/dev/null)" || { echo "Local Supabase is not running (pnpm db:start)" >&2; exit 1; }
get() { printf '%s\n' "$status" | sed -n "s/^$1=\"\{0,1\}\([^\"]*\)\"\{0,1\}$/\1/p" | head -1; }

url="$(get API_URL)"
key="$(get PUBLISHABLE_KEY)"; [ -n "$key" ] || key="$(get ANON_KEY)"
[ -n "$url" ] && [ -n "$key" ] || { echo "Could not read API_URL / publishable key from supabase status" >&2; exit 1; }
case "$key" in sb_secret_*) echo "Refusing to write a secret key to a browser env file" >&2; exit 1 ;; esac

for app in web admin; do
  cat > "apps/$app/.env.local" <<ENV
# Written by tools/dev/write-local-env.sh from \`supabase status\`. Local stack only; git-ignored.
VITE_SUPABASE_URL=$url
VITE_SUPABASE_ANON_KEY=$key
VITE_APP_ENV=local
ENV
  echo "wrote apps/$app/.env.local"
done

cat > supabase/functions/.env <<'ENV'
# Written by tools/dev/write-local-env.sh. Read by `supabase functions serve` (local only; git-ignored).
# APP_ENV must agree with private.runtime_env (ADR-006): local here, staging on staging.
APP_ENV=local
PAYMENTS_PROVIDER=mock
KYC_PROVIDER=mock
SMS_PROVIDER=mock
ENV
echo "wrote supabase/functions/.env"
