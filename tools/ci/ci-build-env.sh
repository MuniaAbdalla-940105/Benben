#!/usr/bin/env bash
# Prints VITE_* variables for CI builds of pull requests (append the output to $GITHUB_ENV).
# They point at the local stack and use a synthetic anon-role JWT, so the build bundles supabase-js exactly
# like a real deployment and the bundle secret scan (check 8) inspects a realistic bundle.
source "$(dirname "$0")/lib.sh"
echo "VITE_SUPABASE_URL=http://127.0.0.1:54321"
echo "VITE_SUPABASE_ANON_KEY=$(fake_jwt anon)"
echo "VITE_APP_ENV=local"
