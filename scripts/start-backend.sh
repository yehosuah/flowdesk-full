#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/load-env.sh"

cd "$FLOWDESK_ROOT_DIR/flowdesk-bck"
exec python3 -m uvicorn main:app \
  --host "$FLOWDESK_BACKEND_HOST" \
  --port "$FLOWDESK_BACKEND_PORT" \
  --reload
