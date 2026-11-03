#!/usr/bin/env bash
# CI check 9: Edge Function tests (deno test supabase/functions), plus deno lint.
# Deno is pinned to the version inside the Supabase edge runtime (see DENO_VERSION in .github/workflows/ci.yml).
source "$(dirname "$0")/lib.sh"
command -v deno >/dev/null 2>&1 || fail "deno is not installed (https://docs.deno.com/runtime/getting_started/installation/)"
log "Check 9: deno lint + deno test supabase/functions ($(deno --version | head -1))"
deno lint --config supabase/functions/deno.json supabase/functions || fail "deno lint failed"
deno test --config supabase/functions/deno.json --allow-env --allow-net=localhost supabase/functions \
  || fail "Edge Function tests failed"
pass "Edge Function tests"
