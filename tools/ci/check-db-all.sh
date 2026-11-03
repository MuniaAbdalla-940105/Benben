#!/usr/bin/env bash
# Runs database checks 2-7 and 3 in the same order as CI, against the local stack (pnpm ci:db).
# Start the stack first: pnpm db:start
source "$(dirname "$0")/lib.sh"
dir="$(dirname "$0")"
bash "$dir/check-seed-synthetic.sh"
bash "$dir/check-migrations-fresh.sh"
bash "$dir/check-db-tests.sh"
bash "$dir/check-db-lint.sh"
bash "$dir/check-rls.sh"
bash "$dir/check-types-fresh.sh"
CHECK_DOWN_RESTORE="${CHECK_DOWN_RESTORE:-1}" bash "$dir/check-down-migrations.sh"
log "All database checks passed"
