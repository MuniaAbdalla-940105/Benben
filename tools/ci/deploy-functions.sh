#!/usr/bin/env bash
# Deploy Edge Functions to an environment's project.
#   usage: deploy-functions.sh <staging|production> [--dry-run]
#   env:   SUPABASE_ACCESS_TOKEN, PROJECT_REF
#          PRODUCTION_FUNCTIONS_FILE (default tools/ci/functions-production.txt; override for the self-test)
#
# staging:    every function in supabase/functions (except _shared and other _* folders).
# production: only the functions listed in tools/ci/functions-production.txt. The deploy FAILS (it does not
#             skip) if that list names a prod-forbidden function (tools/ci/prod-forbidden-functions.txt) or a
#             function that does not exist. This guard is the deploy-time layer of ADR-007's three layers.
source "$(dirname "$0")/lib.sh"

target="${1:?usage: deploy-functions.sh <staging|production> [--dry-run]}"
dry_run="${2:-}"
case "$target" in staging|production) ;; *) fail "unknown target environment: $target" ;; esac

strip() { sed -e 's/#.*//' -e 's/[[:space:]]//g' "$1" | grep -v '^$' || true; }
mapfile -t forbidden < <(strip tools/ci/prod-forbidden-functions.txt)
mapfile -t existing < <(find supabase/functions -mindepth 2 -maxdepth 2 -name index.ts \
  | awk -F/ '{print $3}' | grep -v '^_' | sort)

if [ "$target" = staging ]; then
  deploy=("${existing[@]}")
else
  mapfile -t deploy < <(strip "${PRODUCTION_FUNCTIONS_FILE:-tools/ci/functions-production.txt}")
  for fn in "${deploy[@]}"; do
    if printf '%s\n' "${forbidden[@]}" | grep -qx "$fn"; then
      fail "prod-forbidden function '$fn' is in the production deploy list. Refusing to deploy."
    fi
    printf '%s\n' "${existing[@]}" | grep -qx "$fn" || fail "production list names '$fn', which is not in supabase/functions"
  done
fi

log "Deploying ${#deploy[@]} function(s) to ${target}: ${deploy[*]:-none}"
[ "${#deploy[@]}" -gt 0 ] || exit 0
if [ "$dry_run" = "--dry-run" ]; then
  printf '%s\n' "${deploy[@]}"
  exit 0
fi
: "${PROJECT_REF:?PROJECT_REF is required}"
supabase functions deploy "${deploy[@]}" --project-ref "$PROJECT_REF" --use-api
