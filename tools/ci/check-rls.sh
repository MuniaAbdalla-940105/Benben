#!/usr/bin/env bash
# CI check 6: RLS, views, matviews/foreign tables and the RPC allow-list (tools/ci/check-rls.sql), and
# schema `private` is never exposed through the Data API ([api].schemas in supabase/config.toml).
#   RPC_ALLOWLIST_FILE / SUPABASE_CONFIG_FILE override the inputs (used by the self-test).
source "$(dirname "$0")/lib.sh"
require_local_db

allowlist_file="${RPC_ALLOWLIST_FILE:-tools/ci/rpc-allowlist.txt}"
config_file="${SUPABASE_CONFIG_FILE:-supabase/config.toml}"

log "Check 6: [api].schemas does not expose private"
api_schemas="$(awk '/^\[/{sec=$0} sec=="[api]" && /^schemas[[:space:]]*=/{print; exit}' "$config_file")"
[ -n "$api_schemas" ] || fail "$config_file: [api] schemas line not found"
if echo "$api_schemas" | grep -q -E '"private"'; then
  fail "$config_file exposes schema private through the Data API: $api_schemas"
fi
pass "private is not in [api].schemas ($api_schemas)"

log "Check 6: allow-list format ($allowlist_file)"
# schema.name(argtype,argtype) with spaces removed; arg types may contain [], ", digits, dots.
signature_re='^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*\([][a-z0-9_.,"]*\)$'
entries=()
lineno=0
while IFS= read -r line || [ -n "$line" ]; do
  lineno=$((lineno + 1))
  entry="$(printf '%s' "$line" | sed -e 's/#.*//' -e 's/[[:space:]]//g')"
  [ -n "$entry" ] || continue
  if ! [[ "$entry" =~ $signature_re ]]; then
    fail "$allowlist_file:$lineno: '$line' is not <schema>.<function>(<argtype>,...) e.g. public.place_bid(uuid,bigint)"
  fi
  if [[ "$entry" =~ \.svc_ ]]; then
    fail "$allowlist_file:$lineno: svc_* functions are service-role only and must never be allow-listed (ADR-007)"
  fi
  entries+=("$entry")
done < "$allowlist_file"
allowlist="$(IFS=';'; echo "${entries[*]:-}")"
pass "allow-list format (${#entries[@]} entries)"

log "Check 6: RLS, views, matviews/foreign tables and the RPC allow-list"
# set_config and the DO block run in one session, so the setting is visible to the check.
{ printf "select set_config('ci.rpc_allowlist', '%s', false);\n" "$allowlist"; cat tools/ci/check-rls.sql; } \
  | db_psql -At -f - || fail "RLS / view / RPC allow-list check failed (details above)"
pass "RLS, views and RPC allow-list"
