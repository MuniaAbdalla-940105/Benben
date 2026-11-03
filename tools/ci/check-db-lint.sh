#!/usr/bin/env bash
# CI check 5: plpgsql_check lint of every schema we own, failing on warnings (ADR-002 §15).
source "$(dirname "$0")/lib.sh"
log "Check 5: supabase db lint (level warning, fail on warning)"
supabase db lint --local --schema public,private --level warning --fail-on warning \
  || fail "supabase db lint reported warnings or errors"
pass "db lint"
