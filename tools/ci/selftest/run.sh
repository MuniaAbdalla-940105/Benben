#!/usr/bin/env bash
# CI self-test: proves that every required CI check FAILS on a bad input (ST-001 acceptance criteria).
#
#   usage: tools/ci/selftest/run.sh <node|db|all> [case ...]
#     node  cases that need Node, pnpm and Deno only (checks 1, 8, 9, seed guard, prod-forbidden list)
#     db    cases that need the local Supabase stack running (checks 2-7)
#
# Each case injects one bad input, runs the SAME script or command that CI runs, and passes only when that
# check exits non-zero AND its output names the expected reason. Injected files are new, untracked files
# named *selftest*; they are removed after each case, and no tracked file is modified, so it is safe to run
# on a working copy. Each group ends with a positive control: the same checks pass on the clean tree.
source "$(dirname "$0")/../lib.sh"

group="${1:-all}"; shift || true
only=("$@")
results=()
failures=0
created=()
LOGDIR="$(mktemp -d)"

cleanup_files() {
  local f
  for f in "${created[@]}"; do rm -rf "$f"; done
  created=()
}
trap cleanup_files EXIT

# write <path> : stdin -> new file; refuses to overwrite anything that already exists.
write() {
  [ ! -e "$1" ] || fail "selftest would overwrite existing $1"
  mkdir -p "$(dirname "$1")"
  created+=("$1")
  cat > "$1"
}

want() { [ "${#only[@]}" -eq 0 ] || printf '%s\n' "${only[@]}" | grep -qx "$1"; }

# expect_fail <case> <check> <regex the output must contain> <command...>
expect_fail() {
  local name="$1" check="$2" pattern="$3"; shift 3
  local logf="$LOGDIR/$name.log" rc=0
  printf '\n--- case %-26s (%s): expecting failure\n' "$name" "$check"
  ( "$@" ) >"$logf" 2>&1 || rc=$?
  if [ "$rc" -ne 0 ] && grep -q -E "$pattern" "$logf"; then
    printf 'OK   %-26s exit=%d, matched /%s/\n' "$name" "$rc" "$pattern"
    grep -E "$pattern" "$logf" | head -3 | sed 's/^/       | /'
    results+=("| $name | $check | failed as expected (exit $rc) |")
  else
    printf 'FAIL %-26s exit=%d (expected non-zero and /%s/). Last output:\n' "$name" "$rc" "$pattern"
    tail -30 "$logf" | sed 's/^/       | /'
    results+=("| $name | $check | **NOT DETECTED** (exit $rc) |")
    failures=$((failures + 1))
  fi
}

expect_pass() {
  local name="$1" check="$2"; shift 2
  local logf="$LOGDIR/$name.log" rc=0
  printf '\n--- control %-23s (%s): expecting success\n' "$name" "$check"
  ( "$@" ) >"$logf" 2>&1 || rc=$?
  if [ "$rc" -eq 0 ]; then
    printf 'OK   %-26s passes on the clean tree\n' "$name"
    results+=("| $name | $check | passes on clean tree |")
  else
    printf 'FAIL %-26s exit=%d on the clean tree. Last output:\n' "$name" "$rc"
    tail -30 "$logf" | sed 's/^/       | /'
    results+=("| $name | $check | **FAILED on clean tree** (exit $rc) |")
    failures=$((failures + 1))
  fi
}

# ---------------------------------------------------------------------------------------------- node
run_node() {
  local dir; dir="$(dirname "$0")/.."

  if want lint-error; then
    write apps/web/src/selftest-lint.ts <<'EOF'
// selftest: lint must reject explicit any
export const value: any = 1;
EOF
    expect_fail lint-error "1 lint" "no-explicit-any" pnpm lint
    cleanup_files
  fi

  if want type-error; then
    write apps/web/src/selftest-type.ts <<'EOF'
// selftest: typecheck must reject this
export const n: number = 'not a number';
EOF
    expect_fail type-error "1 typecheck" "TS2322" pnpm typecheck
    cleanup_files
  fi

  if want failing-vitest; then
    write packages/shared/src/selftest-failing.test.ts <<'EOF'
import { expect, it } from 'vitest';
it('selftest: a deliberately failing unit test', () => {
  expect(1 + 1).toBe(3);
});
EOF
    expect_fail failing-vitest "1 unit tests" "selftest: a deliberately failing unit test" pnpm test
    cleanup_files
  fi

  if want bundle-service-jwt; then
    expect_fail bundle-service-jwt "8 bundle scan" "JWT with role service_role" \
      env VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="$(fake_jwt service_role)" \
      bash -c 'pnpm build >/dev/null && bash tools/ci/check-bundle-secrets.sh'
  fi

  if want bundle-secret-key; then
    expect_fail bundle-secret-key "8 bundle scan" "sb_secret_" \
      env VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=sb_secret_selftestNotARealKey0000 \
      bash -c 'pnpm build >/dev/null && bash tools/ci/check-bundle-secrets.sh'
  fi

  if want bundle-literal; then
    write apps/web/public/selftest-leak.txt <<'EOF'
SUPABASE_SERVICE_ROLE_KEY role=service_role (selftest)
EOF
    expect_fail bundle-literal "8 bundle scan" "service_role" \
      bash -c 'pnpm build >/dev/null && bash tools/ci/check-bundle-secrets.sh'
    cleanup_files
  fi

  if want failing-deno-test; then
    write supabase/functions/_shared/selftest_failing.test.ts <<'EOF'
import { assertEquals } from 'jsr:@std/assert@1';
Deno.test('selftest: a deliberately failing function test', () => {
  assertEquals(1 + 1, 3);
});
EOF
    expect_fail failing-deno-test "9 deno test" "selftest: a deliberately failing function test" \
      bash "$dir/check-functions.sh"
    cleanup_files
  fi

  if want seed-real-data; then
    write supabase/seed/selftest_real_data.sql <<'EOF'
-- selftest: real-looking personal data must be rejected
-- insert into profiles (phone, email) values ('+201012345678', 'someone@gmail.com');
EOF
    expect_fail seed-real-data "seed guard" "real-looking (phone|email)" bash "$dir/check-seed-synthetic.sh"
    cleanup_files
  fi

  if want bundle-key-not-logged; then
    # L1: the scan names the file and a short prefix, never the whole key.
    local key=sb_secret_selftestFULLVALUEmustNotBeLogged123
    expect_fail bundle-key-not-logged "8 bundle scan (L1)" "sb_secret_se" \
      env VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="$key" \
      bash -c 'pnpm build >/dev/null && bash tools/ci/check-bundle-secrets.sh'
    if grep -q "$key" "$LOGDIR/bundle-key-not-logged.log"; then
      echo "FAIL bundle-key-not-logged: the full key appears in the scan output"
      results+=("| bundle-key-not-logged | 8 bundle scan (L1) | **full key printed** |"); failures=$((failures + 1))
    fi
  fi

  if want bundle-access-token; then
    expect_fail bundle-access-token "8 bundle scan (L2)" "sbp_" \
      env VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="sbp_$(printf %040d 0)" \
      bash -c 'pnpm build >/dev/null && bash tools/ci/check-bundle-secrets.sh'
  fi

  if want bundle-postgres-dsn; then
    expect_fail bundle-postgres-dsn "8 bundle scan (L2)" "postgresql:/" \
      env VITE_SUPABASE_URL='postgresql://postgres:selftestpw@db.example.test:5432/postgres' VITE_SUPABASE_ANON_KEY=x \
      bash -c 'pnpm build >/dev/null && bash tools/ci/check-bundle-secrets.sh'
  fi

  if want bundle-secret-name; then
    write apps/web/public/selftest-secret-name.txt <<'EOF'
CLOUDFLARE_API_TOKEN=selftest
EOF
    expect_fail bundle-secret-name "8 bundle scan (L2)" "CLOUDFLARE_A" \
      bash -c 'pnpm build >/dev/null && bash tools/ci/check-bundle-secrets.sh'
    cleanup_files
  fi

  if want vite-env-prefix; then
    write apps/web/vite.config.selftest.ts <<'EOF'
import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ mode }) => ({ envPrefix: ['VITE_', 'SUPABASE_'], define: { e: loadEnv(mode, '.', '') } }));
EOF
    expect_fail vite-env-prefix "8 Vite config (L2)" "envPrefix must be exactly|loadEnv" \
      bash -c 'pnpm --filter @benben/web build >/dev/null && bash tools/ci/check-bundle-secrets.sh apps/web/dist'
    cleanup_files
  fi

  if want svc-rpc-in-app; then
    write apps/web/src/selftest-svc.ts <<'EOF'
import { getSupabase } from './supabase';
export const call = () => getSupabase()?.rpc('svc_runtime_env' as never);
EOF
    expect_fail svc-rpc-in-app "1 lint (ADR-007)" "ADR-007" pnpm lint
    cleanup_files
  fi

  if want prod-forbidden; then
    # A6: the production deploy FAILS (not skips) when its list names a prod-forbidden function.
    local prodlist; prodlist="$(mktemp)"
    printf 'health\nmock-gateway\n' > "$prodlist"
    expect_fail prod-forbidden "deploy guard (A6)" "prod-forbidden function 'mock-gateway'" \
      env PRODUCTION_FUNCTIONS_FILE="$prodlist" bash tools/ci/deploy-functions.sh production --dry-run
    expect_pass prod-list-clean "deploy guard (A6)" bash tools/ci/deploy-functions.sh production --dry-run
    rm -f "$prodlist"
  fi

  if want wrong-staging-project; then
    # M5: refuse to write when the ref belongs to a project not named benben-staging.
    local pj; pj="$(mktemp)"
    echo '[{"id":"abcdefghijklmnopqrst","name":"benben-production"}]' > "$pj"
    expect_fail wrong-staging-project "deploy preflight (M5)" "Refusing to write" \
      env PROJECT_REF=abcdefghijklmnopqrst PROJECTS_JSON_FILE="$pj" bash tools/ci/assert-staging-project.sh
    echo '[{"id":"abcdefghijklmnopqrst","name":"benben-staging"}]' > "$pj"
    expect_pass right-staging-project "deploy preflight (M5)" \
      env PROJECT_REF=abcdefghijklmnopqrst PROJECTS_JSON_FILE="$pj" bash tools/ci/assert-staging-project.sh
    rm -f "$pj"
  fi

  if want untrusted-artifact-symlink; then
    # H1: the preview-deploy job rejects an artifact with symlinks before uploading it.
    local art; art="$(mktemp -d)"
    echo '<!doctype html>' > "$art/index.html"; ln -s /etc/passwd "$art/leak"
    expect_fail untrusted-artifact-symlink "preview deploy (H1)" "non-regular files" \
      bash tools/ci/check-untrusted-dist.sh "$art"
    rm -rf "$art"
  fi

  want control || return 0
  log "Positive control: the node checks pass on the clean tree"
  expect_pass control-lint "1 lint" pnpm lint
  expect_pass control-typecheck "1 typecheck" pnpm typecheck
  expect_pass control-vitest "1 unit tests" pnpm test
  expect_pass control-bundle "8 bundle scan" \
    env VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="$(fake_jwt anon)" \
    bash -c 'pnpm build >/dev/null && bash tools/ci/check-bundle-secrets.sh'
  expect_pass control-deno "9 deno test" bash "$dir/check-functions.sh"
  expect_pass control-seed "seed guard" bash "$dir/check-seed-synthetic.sh"
}

# ------------------------------------------------------------------------------------------------ db
run_db() {
  local dir; dir="$(dirname "$0")/.."
  require_local_db

  if want broken-migration; then
    write supabase/migrations/29990101000000_st999_selftest_broken.sql <<'EOF'
-- selftest: syntax error
create table public.selftest_broken (;
EOF
    expect_fail broken-migration "2 fresh DB" "syntax error" bash "$dir/check-migrations-fresh.sh"
    cleanup_files
    supabase db reset --local >/dev/null  # the failed reset left a half-migrated, unseeded database
  fi

  if want migration-bad-name; then
    write supabase/migrations/29990101000000_selftest.sql <<'EOF'
select 1;
EOF
    expect_fail migration-bad-name "2 fresh DB" "bad name" bash "$dir/check-migrations-fresh.sh"
    cleanup_files
  fi

  # The cases below apply SQL straight to the running database (no reset needed) and drop it afterwards.
  if want failing-pgtap; then
    write supabase/tests/zzz_selftest_failing.test.sql <<'EOF'
begin;
select plan(1);
select ok(false, 'selftest: a deliberately failing pgTAP test');
select * from finish();
rollback;
EOF
    expect_fail failing-pgtap "4 pgTAP" "Failed test 1: \"selftest: a deliberately failing pgTAP test\"" bash "$dir/check-db-tests.sh"
    cleanup_files
  fi

  if want db-lint-warning; then
    db_psql -c 'create function public.selftest_lint_warn() returns int language plpgsql as $f$
                declare unused_var int; begin return 1; end $f$;
                revoke execute on function public.selftest_lint_warn() from public, anon, authenticated;'
    expect_fail db-lint-warning "5 db lint" "unused variable" bash "$dir/check-db-lint.sh"
    db_psql -c 'drop function public.selftest_lint_warn()'
  fi

  if want table-without-rls; then
    db_psql -c 'create table public.selftest_no_rls (id int primary key);
                revoke all on public.selftest_no_rls from anon, authenticated;'
    expect_fail table-without-rls "6 RLS" "Tables without RLS: public.selftest_no_rls" bash "$dir/check-rls.sh"
    db_psql -c 'drop table public.selftest_no_rls'
  fi

  if want private-table-without-rls; then
    db_psql -c 'create table private.selftest_no_rls (id int primary key);'
    expect_fail private-table-without-rls "6 RLS" "Tables without RLS: private.selftest_no_rls" bash "$dir/check-rls.sh"
    db_psql -c 'drop table private.selftest_no_rls'
  fi

  if want anon-executable-function; then
    # The ST-001 migration revokes the default grants, so the bad input is an explicit grant.
    db_psql -c 'create function public.selftest_exposed() returns int language sql as $f$ select 1 $f$;
                grant execute on function public.selftest_exposed() to anon, authenticated;'
    expect_fail anon-executable-function "6 RPC allow-list" "public\.selftest_exposed\(\) \(anon\)" bash "$dir/check-rls.sh"
    db_psql -c 'drop function public.selftest_exposed()'
  fi

  if want stale-types; then
    db_psql -c 'create table public.selftest_types (id int primary key);
                alter table public.selftest_types enable row level security;'
    expect_fail stale-types "7 types fresh" "is stale" bash "$dir/check-types-fresh.sh"
    db_psql -c 'drop table public.selftest_types'
  fi

  if want missing-down-script; then
    write supabase/migrations/29990101000000_st999_selftest_down.sql <<'EOF'
create table public.selftest_down (id int primary key);
alter table public.selftest_down enable row level security;
EOF
    expect_fail missing-down-script "3 up/down/up" "missing: supabase/migrations-down/29990101000000_st999_selftest_down.down.sql" \
      bash "$dir/check-down-migrations.sh"
    cleanup_files
  fi

  if want broken-down-script; then
    write supabase/migrations/29990101000000_st999_selftest_down.sql <<'EOF'
create table public.selftest_down (id int primary key);
alter table public.selftest_down enable row level security;
EOF
    write supabase/migrations-down/29990101000000_st999_selftest_down.down.sql <<'EOF'
-- selftest: forgets to drop the table, so the migration cannot be applied again
select 1;
EOF
    db_psql -f supabase/migrations/29990101000000_st999_selftest_down.sql
    expect_fail broken-down-script "3 up/down/up" "already exists" bash "$dir/check-down-migrations.sh"
    db_psql -c 'drop table if exists public.selftest_down'
    cleanup_files
  fi

  if want incomplete-down-script; then
    # Re-runnable migration whose down drops the table but leaves the function behind: up/down/up gives
    # the same schema, so only the comparison with the base version can catch it.
    write supabase/migrations/29990101000000_st999_selftest_down.sql <<'EOF'
create table if not exists public.selftest_down (id int primary key);
alter table public.selftest_down enable row level security;
create or replace function public.selftest_leftover() returns int language sql as $f$ select 1 $f$;
revoke execute on function public.selftest_leftover() from public, anon, authenticated;
EOF
    write supabase/migrations-down/29990101000000_st999_selftest_down.down.sql <<'EOF'
drop table if exists public.selftest_down;
EOF
    db_psql -f supabase/migrations/29990101000000_st999_selftest_down.sql
    expect_fail incomplete-down-script "3 up/down/up" "leave objects behind" bash "$dir/check-down-migrations.sh"
    cleanup_files
    supabase db reset --local >/dev/null  # check 3 left the database at the base version
  fi

  # --- check 3 against a synthetic base commit (BASE_COMMIT), so these cases run before main has migrations.
  # The fake base = HEAD's tree, with the working-tree migrations and down scripts, plus extra files.
  fake_base() {
    local idx f spec path src blob tree
    idx="$(mktemp)"; rm -f "$idx"
    GIT_INDEX_FILE="$idx" git read-tree HEAD
    for f in supabase/migrations/*.sql supabase/migrations-down/*.sql; do
      [ -e "$f" ] || continue
      case "$f" in *selftest*) continue ;; esac
      blob="$(git hash-object -w "$f")"
      GIT_INDEX_FILE="$idx" git update-index --add --cacheinfo "100644,$blob,$f"
    done
    for spec in "$@"; do
      path="${spec%%=*}"; src="${spec#*=}"
      blob="$(git hash-object -w "$src")"
      GIT_INDEX_FILE="$idx" git update-index --add --cacheinfo "100644,$blob,$path"
    done
    tree="$(GIT_INDEX_FILE="$idx" git write-tree)"; rm -f "$idx"
    git commit-tree "$tree" -p HEAD -m "selftest fake base"
  }
  local tmpd mig rb base
  tmpd="$(mktemp -d)"
  mig=20261103000001_st999_selftest_rolled_back
  echo 'create table public.selftest_rb (id int primary key);' > "$tmpd/up.sql"
  echo 'drop table public.selftest_rb;' > "$tmpd/down.sql"

  if want edited-merged-migration; then
    local first; first="$(ls supabase/migrations/*.sql | sort | head -1)"
    { cat "$first"; echo '-- the merged version differed'; } > "$tmpd/edited.sql"
    base="$(fake_base "$first=$tmpd/edited.sql")"
    expect_fail edited-merged-migration "3 immutability" "Merged migrations were modified" \
      env BASE_COMMIT="$base" bash "$dir/check-down-migrations.sh"
  fi

  base="$(fake_base "supabase/migrations/$mig.sql=$tmpd/up.sql" "supabase/migrations-down/$mig.down.sql=$tmpd/down.sql")"
  rb="$tmpd/reverted.txt"

  if want deleted-migration-unlisted; then
    : > "$rb"
    expect_fail deleted-migration-unlisted "3 rollback (A1)" "deleted but not listed" \
      env BASE_COMMIT="$base" MIGRATIONS_REVERTED_FILE="$rb" bash "$dir/check-down-migrations.sh"
  fi

  if want deleted-migration-down-kept; then
    echo "${mig%%_*}  # selftest" > "$rb"
    write "supabase/migrations-down/$mig.down.sql" < "$tmpd/down.sql"
    expect_fail deleted-migration-down-kept "3 rollback (A1)" "was not deleted in the same change" \
      env BASE_COMMIT="$base" MIGRATIONS_REVERTED_FILE="$rb" bash "$dir/check-down-migrations.sh"
    cleanup_files
  fi

  if want deleted-migration-listed; then
    echo "${mig%%_*}  # selftest" > "$rb"
    expect_pass deleted-migration-listed "3 rollback (A1)" \
      env BASE_COMMIT="$base" MIGRATIONS_REVERTED_FILE="$rb" bash "$dir/check-down-migrations.sh"
  fi

  if want reverted-file-bad-format; then
    echo "2026-11-03  # not a version" > "$rb"
    expect_fail reverted-file-bad-format "3 rollback (A1)" "is not a 14-digit migration version" \
      env BASE_COMMIT="$base" MIGRATIONS_REVERTED_FILE="$rb" bash "$dir/check-down-migrations.sh"
  fi
  rm -rf "$tmpd"

  # --- check 6: views, matviews, other schemas, Data API exposure, allow-list format and signature (M4, L6)
  if want view-without-security-invoker; then
    db_psql -c 'create view public.selftest_view as select 1 as x;'
    expect_fail view-without-security-invoker "6 views (M4)" "Views without security_invoker=true: public.selftest_view" \
      bash "$dir/check-rls.sh"
    db_psql -c 'drop view public.selftest_view'
  fi

  if want anon-readable-matview; then
    db_psql -c 'create materialized view public.selftest_mv as select 1 as x; grant select on public.selftest_mv to anon;'
    expect_fail anon-readable-matview "6 matviews (M4)" "public.selftest_mv \(materialized view, anon\)" bash "$dir/check-rls.sh"
    db_psql -c 'drop materialized view public.selftest_mv'
  fi

  if want custom-schema-without-rls; then
    db_psql -c 'create schema selftest_custom; create table selftest_custom.t (id int primary key);'
    expect_fail custom-schema-without-rls "6 other schemas (M4)" "Tables without RLS: selftest_custom.t" bash "$dir/check-rls.sh"
    db_psql -c 'drop schema selftest_custom cascade'
  fi

  if want private-in-api-schemas; then
    local cfg; cfg="$(mktemp)"
    sed 's/^schemas = \["public", "graphql_public"\]/schemas = ["public", "graphql_public", "private"]/' supabase/config.toml > "$cfg"
    expect_fail private-in-api-schemas "6 Data API (M4)" "exposes schema private" \
      env SUPABASE_CONFIG_FILE="$cfg" bash "$dir/check-rls.sh"
    rm -f "$cfg"
  fi

  if want allowlist-bad-format || want allowlist-wrong-signature || want allowlist-exact-signature; then
    local al; al="$(mktemp)"
    db_psql -c 'create function public.selftest_exposed(n integer) returns int language sql as $f$ select n $f$;
                revoke execute on function public.selftest_exposed(integer) from public;
                grant execute on function public.selftest_exposed(integer) to anon, authenticated;'
    if want allowlist-bad-format; then
      echo 'public.selftest_exposed   # name only' > "$al"
      expect_fail allowlist-bad-format "6 allow-list (L6)" "is not <schema>.<function>" \
        env RPC_ALLOWLIST_FILE="$al" bash "$dir/check-rls.sh"
    fi
    if want allowlist-wrong-signature; then
      echo 'public.selftest_exposed(text)' > "$al"
      expect_fail allowlist-wrong-signature "6 allow-list (L6)" "public\.selftest_exposed\(integer\) \(anon\)" \
        env RPC_ALLOWLIST_FILE="$al" bash "$dir/check-rls.sh"
    fi
    if want allowlist-exact-signature; then
      echo 'public.selftest_exposed(integer)   # selftest' > "$al"
      expect_pass allowlist-exact-signature "6 allow-list (L6)" env RPC_ALLOWLIST_FILE="$al" bash "$dir/check-rls.sh"
    fi
    db_psql -c 'drop function public.selftest_exposed(integer)'
    rm -f "$al"
  fi

  # --- M5: the staging marker never overwrites production
  if want runtime-env-production-kept; then
    db_psql -c "update private.runtime_env set env = 'production'"
    expect_fail runtime-env-production-kept "deploy runtime_env (M5)" "refusing to deploy: private.runtime_env is production" \
      db_psql -f tools/ci/sql/set-runtime-env-staging.sql
    if [ "$(db_psql -Atc 'select env from private.runtime_env')" != production ]; then
      echo "FAIL runtime-env-production-kept: production was overwritten"
      results+=("| runtime-env-production-kept | deploy runtime_env (M5) | **production overwritten** |"); failures=$((failures + 1))
    fi
    db_psql -c "update private.runtime_env set env = 'local'"
  fi

  # --- A2: a seed that is not idempotent fails check 2
  if want seed-not-idempotent; then
    write supabase/seed/zz_selftest_not_idempotent.sql <<'EOF'
create table if not exists public.selftest_seed (id serial primary key);
alter table public.selftest_seed enable row level security;
insert into public.selftest_seed default values;
EOF
    expect_fail seed-not-idempotent "2 seed idempotency (A2)" "Seed is not idempotent" bash "$dir/check-migrations-fresh.sh"
    cleanup_files
    supabase db reset --local >/dev/null
  fi

  want control || return 0
  log "Positive control: all database checks pass on the clean tree"
  expect_pass control-db-all "2-7" bash "$dir/check-db-all.sh"
}

case "$group" in
  node) run_node ;;
  db)   run_db ;;
  all)  run_node; run_db ;;
  *)    fail "usage: run.sh <node|db|all> [case ...]" ;;
esac

{
  echo "### CI self-test (${group})"
  echo
  echo "| case | check | result |"
  echo "|---|---|---|"
  printf '%s\n' "${results[@]}"
} | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}"

[ "$failures" -eq 0 ] || fail "${failures} self-test case(s) did not behave as expected"
log "Self-test passed: every injected defect was caught and the clean tree passes"
