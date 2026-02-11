#!/usr/bin/env bash
# Sync environment variables from GitHub Actions secrets to Vercel.
# Usage: Called by .github/workflows/sync-vercel-env.yml
# Requires: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
set -euo pipefail

# Map of Vercel env var name → value (passed as env vars from GitHub secrets)
# Add/remove entries here when secrets change.
declare -A ENV_VARS=(
  # Database
  ["DATABASE_URL"]="${DATABASE_URL:-}"

  # Auth
  ["BETTER_AUTH_SECRET"]="${BETTER_AUTH_SECRET:-}"
  ["GOOGLE_CLIENT_ID"]="${GOOGLE_CLIENT_ID:-}"
  ["GOOGLE_CLIENT_SECRET"]="${GOOGLE_CLIENT_SECRET:-}"
  ["APPLE_CLIENT_ID"]="${APPLE_CLIENT_ID:-}"
  ["APPLE_CLIENT_SECRET"]="${APPLE_CLIENT_SECRET:-}"

  # Storage (Cloudflare R2)
  ["R2_ACCOUNT_ID"]="${R2_ACCOUNT_ID:-}"
  ["R2_ACCESS_KEY_ID"]="${R2_ACCESS_KEY_ID:-}"
  ["R2_SECRET_ACCESS_KEY"]="${R2_SECRET_ACCESS_KEY:-}"
  ["R2_BUCKET_NAME"]="${R2_BUCKET_NAME:-}"
  ["R2_PUBLIC_URL"]="${R2_PUBLIC_URL:-}"

  # Email
  ["RESEND_API_KEY"]="${RESEND_API_KEY:-}"
  ["EMAIL_FROM"]="${EMAIL_FROM:-}"

  # AI
  ["ANTHROPIC_API_KEY"]="${ANTHROPIC_API_KEY:-}"

  # Stripe
  ["STRIPE_SECRET_KEY"]="${STRIPE_SECRET_KEY:-}"
  ["STRIPE_WEBHOOK_SECRET"]="${STRIPE_WEBHOOK_SECRET:-}"

  # Public vars (non-secret but environment-specific)
  ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-}"
  ["NEXT_PUBLIC_USE_AI_ESTIMATE"]="${NEXT_PUBLIC_USE_AI_ESTIMATE:-}"
)

# Target environments: production, preview, development
TARGETS=("production" "preview")

synced=0
skipped=0
failed=0

for name in "${!ENV_VARS[@]}"; do
  value="${ENV_VARS[$name]}"

  if [[ -z "$value" ]]; then
    echo "SKIP: $name (empty)"
    skipped=$((skipped + 1))
    continue
  fi

  for target in "${TARGETS[@]}"; do
    if echo "$value" | vercel env add "$name" "$target" --token="$VERCEL_TOKEN" --force; then
      echo "OK:   $name → $target"
      synced=$((synced + 1))
    else
      echo "FAIL: $name → $target"
      failed=$((failed + 1))
    fi
  done
done

echo ""
echo "Done: $synced synced, $skipped skipped, $failed failed"

if [[ $failed -gt 0 ]]; then
  exit 1
fi
