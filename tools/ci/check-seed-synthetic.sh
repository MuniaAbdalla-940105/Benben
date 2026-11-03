#!/usr/bin/env bash
# Guard for "seed data contains no real personal data" (ST-001; CLAUDE.md guardrails).
# Fails when a seed file contains an email outside example.com/.org/.net or *.test, or an Egyptian
# mobile number outside the reserved test range +20 100 000 0xxx (01000000xxx).
source "$(dirname "$0")/lib.sh"
log "Seed guard: synthetic data only in supabase/seed.sql and supabase/seed/"
files=(supabase/seed.sql supabase/seed/*.sql)
bad=0

emails="$(grep -n -o -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' "${files[@]}" \
  | grep -v -E '@(example\.(com|org|net)|[A-Za-z0-9.-]+\.test)$' || true)"
if [ -n "$emails" ]; then echo "$emails" | sed 's/^/  real-looking email: /'; bad=1; fi

# Egyptian mobiles: 01[0125]xxxxxxxx, optionally as +20 / 0020 / 20 with or without the leading 0.
phones="$(grep -n -o -E '(\+?20|0020)?0?1[0125][0-9]{8}' "${files[@]}" \
  | grep -v -E ':(\+?20|0020)?0?1000000[0-9]{3}$' || true)"
if [ -n "$phones" ]; then echo "$phones" | sed 's/^/  real-looking phone: /'; bad=1; fi

[ "$bad" = 0 ] || fail "Seed files must hold synthetic data only (see supabase/seed/staging.sql header)."
pass "seed files look synthetic"
