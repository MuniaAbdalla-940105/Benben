#!/usr/bin/env bash
# CI check 2: every migration applies on a fresh database, then the seed (ADR-002 §15). Also:
#   - migration file names follow <timestamp>_<story|bug>_<name>.sql (ADR-002 §3);
#   - the seed is idempotent: all seed files run twice more and no row count may change (review A2);
#   - the staging seed fails closed: with no private.runtime_env row it must refuse to run (review A8).
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

log "Check 2: supabase db reset (fresh database, all migrations, then the seed)"
supabase db reset --local || fail "Migrations or seed failed on a fresh database (see output above)"

env="$(db_psql -Atc 'select env from private.runtime_env where id')"
[ "$env" = "local" ] || fail "Seed did not mark the database as local (private.runtime_env = '${env}')"
pass "all migrations and the seed applied on a fresh database"

# Same files and order as [db.seed] sql_paths in config.toml and as the staging deploy.
seed_files=(supabase/seed.sql)
while IFS= read -r f; do seed_files+=("$f"); done < <(ls supabase/seed/*.sql | sort)

row_counts() {
  db_psql -At -f - <<'SQL'
select format('select %L || '' '' || count(*) from %I.%I', n.nspname || '.' || c.relname, n.nspname, c.relname)
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
 where c.relkind in ('r', 'p') and n.nspname in ('public', 'private', 'vault', 'auth', 'storage')
 order by 1
\gexec
SQL
}

log "Check 2: seed idempotency (${seed_files[*]} run twice more)"
before="$(mktemp)"; after="$(mktemp)"
trap 'rm -f "$before" "$after"' EXIT
row_counts > "$before"
for round in 2 3; do
  cat "${seed_files[@]}" | db_psql -f - >/dev/null || fail "Seed failed when run again (round ${round}); seeds must be idempotent"
  row_counts > "$after"
  if ! diff -u "$before" "$after"; then
    fail "Seed is not idempotent: row counts changed on round ${round} (diff above)"
  fi
done
pass "seed is idempotent (row counts unchanged after two more runs)"

log "Check 2: staging seed refuses to run when runtime_env is missing (fails closed)"
guard_log="$(mktemp)"
if { echo 'begin; delete from private.runtime_env;'; cat supabase/seed/staging.sql; echo 'rollback;'; } \
     | db_psql -f - >"$guard_log" 2>&1; then
  cat "$guard_log"; rm -f "$guard_log"
  fail "supabase/seed/staging.sql ran on a database without a runtime_env row; it must refuse (missing row = production)"
fi
grep -q 'refused' "$guard_log" || { cat "$guard_log"; rm -f "$guard_log"; fail "staging seed failed, but not with its production guard"; }
rm -f "$guard_log"
[ "$(db_psql -Atc 'select env from private.runtime_env where id')" = local ] || fail "guard test changed runtime_env"
pass "staging seed fails closed"
