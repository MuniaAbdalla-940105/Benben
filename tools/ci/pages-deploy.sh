#!/usr/bin/env bash
# Upload a built directory to a Cloudflare Pages project, creating the project if it does not exist.
#   usage: pages-deploy.sh <dist-dir> <project-name> <branch> <commit-sha>
#   env:   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
#   prints the deployment URL (branch alias when Pages gives one) on the last line of stdout.
# Uses wrangler from the lockfile (pnpm exec), never pnpm dlx (review M3).
source "$(dirname "$0")/lib.sh"
dist="${1:?dist dir}"; project="${2:?project}"; branch="${3:?branch}"; sha="${4:?commit sha}"
[[ "$project" =~ ^[a-z0-9-]+$ ]] || fail "bad Pages project name"
[[ "$branch" =~ ^[a-z0-9-]+$ ]] || fail "bad Pages branch name"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || fail "bad commit sha"

# Exact match on the parsed project names (not a substring grep).
names="$(pnpm exec wrangler pages project list --json 2>/dev/null | node -e '
  let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
    const list = JSON.parse(s);
    for (const p of list) for (const [k, v] of Object.entries(p)) if (/name/i.test(k)) console.log(v);
  });')" || fail "could not list Cloudflare Pages projects"
if ! printf '%s\n' "$names" | grep -qx "$project"; then
  pnpm exec wrangler pages project create "$project" --production-branch main >&2
fi

out="$(mktemp)"
pnpm exec wrangler pages deploy "$dist" --project-name "$project" --branch "$branch" \
  --commit-hash "$sha" --commit-dirty=true | tee "$out" >&2
url="$(grep -o -E "https://[a-z0-9-]+\.${project}\.pages\.dev" "$out" | tail -1)"
rm -f "$out"
[ -n "$url" ] || fail "could not read the deployment URL from wrangler output"
echo "$url"
