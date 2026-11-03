#!/usr/bin/env bash
# CI check 6: RLS on every table and the RPC allow-list (tools/ci/check-rls.sql).
source "$(dirname "$0")/lib.sh"
require_local_db

allowlist="$(sed -e 's/#.*//' -e 's/[[:space:]]//g' tools/ci/rpc-allowlist.txt | grep -v '^$' | paste -sd, - || true)"
log "Check 6: RLS and RPC allow-list (${allowlist:-empty allow-list})"
# set_config and the DO block run in one session, so the setting is visible to the check.
{ printf "select set_config('ci.rpc_allowlist', '%s', false);\n" "$allowlist"; cat tools/ci/check-rls.sql; } \
  | db_psql -At -f - || fail "RLS / RPC allow-list check failed (details above)"
pass "RLS and RPC allow-list"
