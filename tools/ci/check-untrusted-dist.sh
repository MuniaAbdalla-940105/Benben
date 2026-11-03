#!/usr/bin/env bash
# Validates a build artifact that came from pull-request code before the privileged preview-deploy job
# uploads it (review H1): only regular files and directories, no symlinks, sane size, an index.html,
# then the bundle secret scan (check 8) on it.
source "$(dirname "$0")/lib.sh"
dir="${1:?usage: check-untrusted-dist.sh <dir>}"
[ -d "$dir" ] || fail "$dir is not a directory"
[ -f "$dir/index.html" ] || fail "$dir has no index.html"
odd="$(find "$dir" ! -type f ! -type d -print | head -5)"
[ -z "$odd" ] || fail "artifact contains non-regular files (symlinks, devices): $odd"
files="$(find "$dir" -type f | wc -l)"; kb="$(du -sk "$dir" | cut -f1)"
[ "$files" -le 2000 ] || fail "artifact has $files files (limit 2000)"
[ "$kb" -le 51200 ] || fail "artifact is ${kb} KB (limit 50 MB)"
pass "artifact shape ok ($files files, ${kb} KB)"
bash "$(dirname "$0")/check-bundle-secrets.sh" "$dir"
