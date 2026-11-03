#!/usr/bin/env bash
# Regenerate packages/db-types/src/database.ts from the local database (pnpm db:types).
# Run after every migration change and commit the result; CI check 7 fails when it is stale.
source "$(dirname "$0")/lib.sh"
require_local_db
out="packages/db-types/src/database.ts"
supabase gen types --lang typescript --local --schema public 2>/dev/null > "$out.tmp"
mv "$out.tmp" "$out"
echo "wrote $out"
