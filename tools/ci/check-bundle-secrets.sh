#!/usr/bin/env bash
# CI check 8: no server secret in a browser bundle (ADR-002 §15; CLAUDE.md guardrail).
# Scans the built apps (default: apps/*/dist; or the directories given as arguments) for
#   - the literal role name `service_role`,
#   - Supabase secret API keys (`sb_secret_...`),
#   - any JWT whose decoded payload has "role":"service_role" (catches a pasted legacy service key,
#     whose base64 form never contains the literal string).
# Run `pnpm build` first. Fails if a target has no files, so a broken build cannot pass silently.
source "$(dirname "$0")/lib.sh"

if [ "$#" -gt 0 ]; then targets=("$@"); else targets=(apps/*/dist); fi
log "Check 8: browser bundle secret scan in ${targets[*]}"

found=0
for t in "${targets[@]}"; do
  [ -d "$t" ] && [ -n "$(find "$t" -type f -print -quit)" ] || fail "$t is missing or empty. Build the apps first (pnpm build)."

  if grep -R -n -o -I -E 'service_role|sb_secret_[A-Za-z0-9_-]+' "$t" | cut -c1-200; then
    echo "  ^ literal service-role marker or secret key in $t"
    found=1
  fi

  while IFS= read -r jwt; do
    payload="$(printf '%s' "$jwt" | cut -d. -f2 | tr '_-' '/+')"
    while [ $(( ${#payload} % 4 )) -ne 0 ]; do payload="${payload}="; done
    decoded="$(printf '%s' "$payload" | base64 -d 2>/dev/null || true)"
    if printf '%s' "$decoded" | grep -q -E '"role"[[:space:]]*:[[:space:]]*"service_role"'; then
      echo "  JWT with role service_role in $t: ${jwt:0:24}..."
      found=1
    fi
  done < <(grep -R -h -o -I -E 'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+' "$t" | sort -u)
done

[ "$found" = 0 ] || fail "Server secret found in a browser bundle. Only VITE_SUPABASE_ANON_KEY (publishable) may reach the browser."
pass "no service-role key or secret key in ${targets[*]}"
