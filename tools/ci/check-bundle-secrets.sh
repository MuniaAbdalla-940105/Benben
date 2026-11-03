#!/usr/bin/env bash
# CI check 8: no server secret in a browser bundle (ADR-002 §15; CLAUDE.md guardrail).
# Scans the built apps (default: apps/*/dist; or the directories given as arguments) for
#   - the literal role name `service_role`;
#   - Supabase secret API keys (`sb_secret_...`) and Supabase personal access tokens (`sbp_...`);
#   - Postgres connection strings with a password (postgres://user:password@host);
#   - the names of CI / server secrets (SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD, ...);
#   - any JWT whose decoded payload has "role":"service_role" (catches a pasted legacy service key,
#     whose base64 form never contains the literal string).
# It also fails if a Vite config widens what reaches the bundle: an envPrefix other than 'VITE_', or
# loadEnv(mode, dir, '') which loads every variable.
# Matches are reported by file, line and a short prefix only; a full key never reaches the CI log (L1).
# Run `pnpm build` first. Fails if a target has no files, so a broken build cannot pass silently.
source "$(dirname "$0")/lib.sh"

if [ "$#" -gt 0 ]; then targets=("$@"); else targets=(apps/*/dist); fi
found=0

log "Check 8: Vite configs only expose VITE_* variables"
for cfg in apps/*/vite.config.*; do
  [ -e "$cfg" ] || continue
  if grep -n -E '^[[:space:]]*[^/[:space:]].*envPrefix|^[[:space:]]*envPrefix' "$cfg" | grep -v -E "^[0-9]+:[[:space:]]*envPrefix:[[:space:]]*['\"]VITE_['\"],?[[:space:]]*(//.*)?$"; then
    echo "  ^ $cfg: envPrefix must be exactly 'VITE_'"; found=1
  fi
  if grep -n -E "loadEnv\([^)]*,[[:space:]]*(''|\"\"|\`\`)[[:space:]]*\)" "$cfg"; then
    echo "  ^ $cfg: loadEnv(..., '') loads every environment variable"; found=1
  fi
done

log "Check 8: browser bundle secret scan in ${targets[*]}"
secret_names='SUPABASE_ACCESS_TOKEN|SUPABASE_DB_PASSWORD|SUPABASE_SERVICE_ROLE_KEY|CLOUDFLARE_API_TOKEN|PAYMENTS_HMAC_SECRET|SEND_SMS_HOOK_SECRET|CRON_SECRET|QA_INBOX_TOKEN'
pattern="service_role|sb_secret_[A-Za-z0-9_-]+|sbp_[A-Za-z0-9]{16,}|postgres(ql)?://[^:/@[:space:]\"'\`]+:[^@/[:space:]\"'\`]+@|${secret_names}"

for t in "${targets[@]}"; do
  [ -d "$t" ] && [ -n "$(find "$t" -type f -print -quit)" ] || fail "$t is missing or empty. Build the apps first (pnpm build)."

  # file:line:match -> file:line:<first 12 chars>…  (never the whole value)
  hits="$(grep -R -n -o -I -E "$pattern" "$t" | awk -F: '{ m=$3; for (i=4;i<=NF;i++) m=m":"$i; printf "  %s:%s: %s…\n", $1, $2, substr(m,1,12) }' | sort -u || true)"
  if [ -n "$hits" ]; then
    echo "$hits"
    echo "  ^ server secret marker in $t"
    found=1
  fi

  while IFS= read -r jwt; do
    [ -n "$jwt" ] || continue
    payload="$(printf '%s' "$jwt" | cut -d. -f2 | tr '_-' '/+')"
    while [ $(( ${#payload} % 4 )) -ne 0 ]; do payload="${payload}="; done
    decoded="$(printf '%s' "$payload" | base64 -d 2>/dev/null || true)"
    if printf '%s' "$decoded" | grep -q -E '"role"[[:space:]]*:[[:space:]]*"service_role"'; then
      echo "  JWT with role service_role in $t: ${jwt:0:12}…"
      found=1
    fi
  done < <(grep -R -h -o -I -E 'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+' "$t" | sort -u)
done

[ "$found" = 0 ] || fail "Server secret found in a browser bundle or Vite config. Only VITE_SUPABASE_ANON_KEY (publishable) may reach the browser."
pass "no server secret in ${targets[*]}; Vite configs expose VITE_* only"
