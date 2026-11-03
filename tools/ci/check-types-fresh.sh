#!/usr/bin/env bash
# CI check 7: the committed generated types match the schema after all migrations (ADR-002 §15).
source "$(dirname "$0")/lib.sh"
require_local_db
log "Check 7: generated types are up to date"
fresh="$(mktemp)"
trap 'rm -f "$fresh"' EXIT
supabase gen types --lang typescript --local --schema public 2>/dev/null > "$fresh" \
  || fail "supabase gen types failed"
if ! diff -u packages/db-types/src/database.ts "$fresh"; then
  fail "packages/db-types/src/database.ts is stale. Run: pnpm db:reset && pnpm db:types, then commit it."
fi
pass "generated types are fresh"
