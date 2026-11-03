#!/usr/bin/env bash
# CI check 2: every migration applies on a fresh database, then the seed (ADR-002 §15).
# Also enforces the migration file naming rule <timestamp>_<story|bug>_<name>.sql (ADR-002 §3).
source "$(dirname "$0")/lib.sh"

log "Check 2: migration file names"
bad=0
for f in supabase/migrations/*.sql; do
  [ -e "$f" ] || continue
  name="$(basename "$f")"
  if ! [[ "$name" =~ ^[0-9]{14}_(st|bug)[0-9]{3}_[a-z0-9_]+\.sql$ ]]; then
    echo "  bad name: $name (expected <yyyymmddhhmmss>_st###_<what>.sql or _bug###_)"
    bad=1
  fi
done
[ "$bad" = 0 ] || fail "Migration file names do not follow ADR-002 §3"
pass "migration names"

log "Check 2: supabase db reset (fresh database, all migrations, then seed)"
supabase db reset --local || fail "Migrations or seed failed on a fresh database (see output above)"

env="$(db_psql -Atc 'select env from private.runtime_env where id')"
[ "$env" = "local" ] || fail "Seed did not mark the database as local (private.runtime_env = '${env}')"
pass "all migrations and the seed applied on a fresh database"
