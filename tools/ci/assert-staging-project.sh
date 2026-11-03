#!/usr/bin/env bash
# Review M5: before any write, prove the target project is the staging project by its NAME, not just by
# the ref in a secret. Fails unless the project with ref $PROJECT_REF is named $EXPECTED_PROJECT_NAME.
#   env: SUPABASE_ACCESS_TOKEN, PROJECT_REF; EXPECTED_PROJECT_NAME (default benben-staging)
#   PROJECTS_JSON_FILE: read the project list from a file instead of the API (self-test)
source "$(dirname "$0")/lib.sh"
: "${PROJECT_REF:?PROJECT_REF is required}"
expected="${EXPECTED_PROJECT_NAME:-benben-staging}"

if [ -n "${PROJECTS_JSON_FILE:-}" ]; then
  json="$(cat "$PROJECTS_JSON_FILE")"
else
  json="$(supabase projects list -o json 2>/dev/null)" || fail "could not list Supabase projects (check SUPABASE_ACCESS_TOKEN)"
fi

name="$(printf '%s' "$json" | PROJECT_REF="$PROJECT_REF" node -e '
  let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
    let list; try { list = JSON.parse(s); } catch { process.exit(2); }
    if (!Array.isArray(list)) list = list.projects ?? [];
    const p = list.find((x) => x.ref === process.env.PROJECT_REF || x.id === process.env.PROJECT_REF);
    process.stdout.write(p ? String(p.name ?? "") : "");
  });')" || fail "could not parse the Supabase project list"

[ -n "$name" ] || fail "project ref ${PROJECT_REF:0:6}… is not visible to this access token"
[ "$name" = "$expected" ] || fail "project ${PROJECT_REF:0:6}… is named '$name', expected '$expected'. Refusing to write."
pass "target project ${PROJECT_REF:0:6}… is '$expected'"
