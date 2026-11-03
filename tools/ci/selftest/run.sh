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

  if want prod-forbidden; then
    # Not a failing check but a guarantee: the production list drops prod-forbidden functions that the
    # staging list still deploys (ADR-002 §4).
    write supabase/functions/mock-gateway/index.ts <<'EOF2'
// selftest: a non-prod function
Deno.serve(() => new Response('mock'));
EOF2
    expect_pass prod-forbidden "deploy guard" bash -c '
      set -e
      bash tools/ci/deploy-functions.sh staging --dry-run | grep -x mock-gateway
      if bash tools/ci/deploy-functions.sh production --dry-run | grep -x mock-gateway; then
        echo "mock-gateway would be deployed to production"; exit 1
      fi'
    cleanup_files
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
    # Supabase default privileges grant EXECUTE on new public functions to anon and authenticated.
    db_psql -c 'create function public.selftest_exposed() returns int language sql as $f$ select 1 $f$;'
    expect_fail anon-executable-function "6 RPC allow-list" "selftest_exposed\(\) \(anon\)" bash "$dir/check-rls.sh"
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

  if want edited-merged-migration; then
    local merged
    merged="$(git ls-tree --name-only "$(git merge-base "${BASE_REF:-origin/main}" HEAD)" supabase/migrations/ | grep -E '\.sql$' | head -1 || true)"
    if [ -n "$merged" ] && git diff --quiet -- "$merged"; then
      printf -- '-- selftest edit\n' >> "$merged"
      expect_fail edited-merged-migration "3 immutability" "Merged migrations were modified" bash "$dir/check-down-migrations.sh"
      git checkout -- "$merged"
    else
      echo "skip edited-merged-migration: no migration on the base branch yet (or it has local edits)"
      results+=("| edited-merged-migration | 3 immutability | skipped: no merged migration on base yet |")
    fi
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
