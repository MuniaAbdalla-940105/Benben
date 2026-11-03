#!/usr/bin/env bash
# Decides which deploy jobs can run, from which secrets/variables are present (names only; values are
# never printed). Missing inputs make the deploy SKIP with a clear message instead of failing, so CI stays
# green until the stakeholder provides the staging project and the frontend host (ADR-005).
#
#   usage: deploy-preflight.sh staging   (PR previews check their own inputs in preview-deploy.yml)
#   writes: supabase=true|false and frontend=true|false to $GITHUB_OUTPUT, a summary to $GITHUB_STEP_SUMMARY
set -euo pipefail

mode="${1:?usage: deploy-preflight.sh staging}"
out="${GITHUB_OUTPUT:-/dev/null}"
summary="${GITHUB_STEP_SUMMARY:-/dev/stdout}"

missing_names() { local n; for n in "$@"; do [ -n "${!n:-}" ] || printf '%s ' "$n"; done; }

case "$mode" in
  staging) supabase_needs=(SUPABASE_ACCESS_TOKEN STAGING_PROJECT_REF SUPABASE_DB_PASSWORD) ;;
  *) echo "unknown mode $mode" >&2; exit 2 ;;
esac
frontend_needs=(CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID STAGING_SUPABASE_ANON_KEY)

sb_missing="$(missing_names "${supabase_needs[@]}")"
fe_missing="$(missing_names "${frontend_needs[@]}")"

supabase=false; frontend=false
[ -z "$sb_missing" ] && supabase=true
[ -z "$sb_missing" ] && [ -z "$fe_missing" ] && frontend=true

if [ -n "${STAGING_PROJECT_REF:-}" ] && ! [[ "$STAGING_PROJECT_REF" =~ ^[a-z0-9]{20}$ ]]; then
  echo "::error::STAGING_PROJECT_REF does not look like a Supabase project ref (20 lowercase letters/digits)"
  exit 1
fi

echo "supabase=$supabase" >> "$out"
echo "frontend=$frontend" >> "$out"

{
  echo "### Deploy preflight (${mode})"
  echo
  echo "| part | status | missing (names only) |"
  echo "|---|---|---|"
  if [ "$mode" = staging ]; then
    echo "| Supabase staging (db push, functions, runtime_env, seed) | $([ "$supabase" = true ] && echo will deploy || echo '**skipped**') | ${sb_missing:-none} |"
  fi
  echo "| Frontend ($([ "$mode" = staging ] && echo 'apps/web + apps/admin' || echo 'apps/web preview')) | $([ "$frontend" = true ] && echo will deploy || echo '**skipped**') | ${sb_missing}${fe_missing:-}$([ -z "$sb_missing$fe_missing" ] && echo none) |"
  if [ "$supabase" != true ] || [ "$frontend" != true ]; then
    echo
    echo "Skipped parts are waiting for stakeholder inputs. See docs/decisions/ADR-005-staging-hosting-and-region.md"
    echo "(\"What the stakeholder must provide\") and docs/runbook.md. No staging URL exists until then."
  fi
} >> "$summary"

[ "$supabase" = true ] || echo "::notice::Supabase deploy skipped: missing ${sb_missing}(see ADR-005)"
[ "$frontend" = true ] || echo "::notice::Frontend deploy skipped: missing ${sb_missing}${fe_missing}(see ADR-005)"
