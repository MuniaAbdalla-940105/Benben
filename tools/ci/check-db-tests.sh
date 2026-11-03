#!/usr/bin/env bash
# CI check 4: pgTAP tests in supabase/tests (RLS and function tests).
source "$(dirname "$0")/lib.sh"
log "Check 4: supabase test db"
supabase test db --local || fail "pgTAP tests failed"
pass "pgTAP tests"
