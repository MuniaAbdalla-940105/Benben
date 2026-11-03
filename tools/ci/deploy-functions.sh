#!/usr/bin/env bash
# Deploy every Edge Function in supabase/functions to the given environment's project.
#   usage: deploy-functions.sh <staging|production> [--dry-run]
#   env:   SUPABASE_ACCESS_TOKEN, PROJECT_REF
# Production never receives the functions in tools/ci/prod-forbidden-functions.txt (ADR-002 §4): they
# are removed from the list, and the deploy fails if one is still present after filtering.
source "$(dirname "$0")/lib.sh"

target="${1:?usage: deploy-functions.sh <staging|production> [--dry-run]}"
dry_run="${2:-}"
case "$target" in staging|production) ;; *) fail "unknown target environment: $target" ;; esac

mapfile -t forbidden < <(sed -e 's/#.*//' -e 's/[[:space:]]//g' tools/ci/prod-forbidden-functions.txt | grep -v '^$')
mapfile -t all < <(find supabase/functions -mindepth 2 -maxdepth 2 -name index.ts \
  | awk -F/ '{print $3}' | grep -v '^_' | sort)

deploy=()
for fn in "${all[@]}"; do
  if [ "$target" = production ] && printf '%s\n' "${forbidden[@]}" | grep -qx "$fn"; then
    echo "  skipping $fn (prod-forbidden)"
    continue
  fi
  deploy+=("$fn")
done

# Guard: independent of the filter above, so an edit to the loop cannot ship a forbidden function.
assert_no_forbidden() {
  local fn
  [ "$target" = production ] || return 0
  for fn in "$@"; do
    if printf '%s\n' "${forbidden[@]}" | grep -qx "$fn"; then
      fail "prod-forbidden function '$fn' is in the production deploy list"
    fi
  done
}
assert_no_forbidden "${deploy[@]}"

log "Deploying ${#deploy[@]} function(s) to ${target}: ${deploy[*]:-none}"
[ "${#deploy[@]}" -gt 0 ] || exit 0
if [ "$dry_run" = "--dry-run" ]; then
  printf '%s\n' "${deploy[@]}"
  exit 0
fi
: "${PROJECT_REF:?PROJECT_REF is required}"
supabase functions deploy "${deploy[@]}" --project-ref "$PROJECT_REF" --use-api
