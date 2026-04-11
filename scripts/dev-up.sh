#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/load-env.sh"

pids=()

cleanup() {
  trap - INT TERM EXIT

  for pid in "${pids[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done

  wait "${pids[@]:-}" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

"$FLOWDESK_ROOT_DIR/scripts/start-backend.sh" &
pids+=("$!")

"$FLOWDESK_ROOT_DIR/scripts/start-frontend.sh" &
pids+=("$!")

"$FLOWDESK_ROOT_DIR/scripts/start-gateway.sh" &
pids+=("$!")

printf 'Flowdesk gateway running at %s\n' "$FLOWDESK_PUBLIC_ORIGIN"
printf 'Frontend upstream: %s\n' "$FLOWDESK_FRONTEND_URL"
printf 'Backend upstream: %s\n' "$FLOWDESK_BACKEND_URL"

wait
