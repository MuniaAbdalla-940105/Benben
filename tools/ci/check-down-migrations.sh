#!/usr/bin/env bash
# CI check 3: for migrations added in this PR, apply up -> down -> up and prove each down script
# exactly reverses its migration (ADR-002 §3, §15).
#
#   BASE_REF   the branch the PR merges into (default origin/main). Added = in the working tree but not in
#              BASE_REF; this includes untracked files, so it works the same locally.
#
# Rules enforced:
#   a. Merged migrations are immutable: modifying, renaming or deleting one fails (staging never re-runs it).
#   b. Added migrations must be newer than every migration on the base branch (db push applies in order).
#   c. Each added migration has supabase/migrations-down/<same name without .sql>.down.sql.
#   d. full schema == schema after down + up again, and schema after down == schema before the migrations.
#
# Expects the local stack to be running with all migrations applied (check 2 leaves it so).
# Leaves the database at the base version unless CHECK_DOWN_RESTORE=1.
source "$(dirname "$0")/lib.sh"

BASE_REF="${BASE_REF:-origin/main}"
require_local_db

log "Check 3: migrations added relative to ${BASE_REF}"
if ! git rev-parse --verify --quiet "${BASE_REF}^{commit}" >/dev/null; then
  fail "Base ref ${BASE_REF} not found. In CI checkout needs fetch-depth: 0; locally run: git fetch origin main"
fi
merge_base="$(git merge-base "$BASE_REF" HEAD)"

# a. immutability
changed_existing="$(git diff --name-only --diff-filter=MDR "$merge_base" -- 'supabase/migrations/*.sql' || true)"
if [ -n "$changed_existing" ]; then
  echo "$changed_existing" | sed 's/^/  /'
  fail "Merged migrations were modified, renamed or deleted. Add a new migration instead."
fi

mapfile -t added < <(
  { git diff --name-only --diff-filter=A "$merge_base" -- 'supabase/migrations/*.sql'
    git ls-files --others --exclude-standard -- 'supabase/migrations/*.sql'
  } | sort -u
)
if [ "${#added[@]}" -eq 0 ]; then
  pass "no migrations added; nothing to round-trip"
  exit 0
fi
printf '  added: %s\n' "${added[@]}"

# b. ordering
newest_base="$(git ls-tree --name-only "$merge_base" supabase/migrations/ 2>/dev/null | grep -E '\.sql$' | sort | tail -1 || true)"
if [ -n "$newest_base" ]; then
  for f in "${added[@]}"; do
    if [[ "$(basename "$f")" < "$(basename "$newest_base")" ]]; then
      fail "$(basename "$f") is older than $(basename "$newest_base") on ${BASE_REF}. Give it a newer timestamp."
    fi
  done
fi
all_sorted="$(ls supabase/migrations/*.sql | sort)"
newest_n="$(echo "$all_sorted" | tail -n "${#added[@]}")"
if [ "$(printf '%s\n' "${added[@]}" | sort)" != "$newest_n" ]; then
  fail "Added migrations must be the newest files in supabase/migrations/."
fi

# c. down scripts exist
downs=()
missing=0
for f in "${added[@]}"; do
  d="supabase/migrations-down/$(basename "${f%.sql}").down.sql"
  if [ -f "$d" ]; then downs+=("$d"); else echo "  missing: $d"; missing=1; fi
done
[ "$missing" = 0 ] || fail "Every new migration needs a down script in supabase/migrations-down/"
pass "down scripts present"

# d. round trip
log "Check 3: fingerprint with all migrations applied"
fp_full="$(mktemp)"; fp_down="$(mktemp)"; fp_reup="$(mktemp)"; fp_base="$(mktemp)"
trap 'rm -f "$fp_full" "$fp_down" "$fp_reup" "$fp_base"' EXIT
db_schema_fingerprint > "$fp_full"

log "Check 3: down (newest first)"
for (( i=${#downs[@]}-1; i>=0; i-- )); do
  echo "  down: ${downs[$i]}"
  db_psql --single-transaction -f "${downs[$i]}" || fail "Down script failed: ${downs[$i]}"
done
db_schema_fingerprint > "$fp_down"

log "Check 3: up again (oldest first)"
for f in "${added[@]}"; do
  echo "  up:   $f"
  db_psql --single-transaction -f "$f" || fail "Migration failed when re-applied after its down script: $f"
done
db_schema_fingerprint > "$fp_reup"
if ! diff -u "$fp_full" "$fp_reup" > /tmp/down-check-reup.diff; then
  head -60 /tmp/down-check-reup.diff
  fail "Schema after up -> down -> up differs from the original (diff above)"
fi
pass "up -> down -> up gives the same schema"

log "Check 3: compare 'after down' with a database reset to the base version"
supabase db reset --local --no-seed --last "${#added[@]}" >/dev/null || fail "Could not reset to the base version"
db_schema_fingerprint > "$fp_base"
if ! diff -u "$fp_base" "$fp_down" > /tmp/down-check-base.diff; then
  head -60 /tmp/down-check-base.diff
  fail "Down scripts leave objects behind or remove too much (diff vs base version above)"
fi
pass "down scripts exactly reverse the added migrations"

if [ "${CHECK_DOWN_RESTORE:-0}" = 1 ]; then
  log "Restoring all migrations and the seed"
  supabase db reset --local >/dev/null
fi
