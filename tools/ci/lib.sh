# shellcheck shell=bash
# Shared helpers for tools/ci/*.sh. Source it; do not run it.
# Every check script runs the same way locally and in GitHub Actions (CI only adds the runner).
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# Pinned CLI from package.json (ADR-002 §15). Never a globally installed one.
supabase() { pnpm exec supabase "$@"; }

LOCAL_DB_URL="${LOCAL_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
PROJECT_ID="$(sed -n 's/^project_id = "\(.*\)"/\1/p' supabase/config.toml)"
DB_CONTAINER="supabase_db_${PROJECT_ID}"

log()  { printf '\n==> %s\n' "$*"; }
pass() { printf 'PASS: %s\n' "$*"; }
# ::error:: is a GitHub Actions annotation; locally it is just a readable prefix.
fail() { printf '::error::%s\n' "$*" >&2; exit 1; }

# psql against the local stack. Uses the host psql when present, otherwise the one in the db container.
db_psql() {
  if command -v psql >/dev/null 2>&1; then
    PGCONNECT_TIMEOUT=10 psql "$LOCAL_DB_URL" -X -q -v ON_ERROR_STOP=1 "$@"
  else
    docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -X -q -v ON_ERROR_STOP=1 "$@"
  fi
}

# Schema-only fingerprint of the local database, used by the up -> down -> up check.
# pg_dump runs inside the db container so its version always matches the server.
# Excluded: realtime's daily message partitions (created by the realtime service on its own clock)
# and the per-dump random \restrict token.
db_schema_fingerprint() {
  docker exec "$DB_CONTAINER" pg_dump -U supabase_admin -d postgres --schema-only \
    --exclude-schema=supabase_migrations --exclude-table='realtime.messages_*' \
    | grep -v -E '^\\(un)?restrict '
}

require_local_db() {
  db_psql -Atc 'select 1' >/dev/null 2>&1 \
    || fail "Local Supabase is not running. Start it with: pnpm db:start"
}

# Synthetic JWT with the given role, for builds and self-tests that need a realistic key shape.
# Never a real key: the signature is a fixed dummy string, so it is useless against any project.
fake_jwt() {
  local h p
  h="$(printf '{"alg":"HS256","typ":"JWT"}' | base64 -w0 | tr '+/' '-_' | tr -d '=')"
  p="$(printf '{"iss":"ci-synthetic","role":"%s","exp":1983812996}' "$1" | base64 -w0 | tr '+/' '-_' | tr -d '=')"
  printf '%s.%s.Y2ktc3ludGhldGljLW5vdC1hLXJlYWwtc2lnbmF0dXJl' "$h" "$p"
}
