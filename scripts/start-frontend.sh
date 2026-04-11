#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/load-env.sh"

cd "$FLOWDESK_ROOT_DIR/flowdesk-frt"
exec npm run dev -- --host "$FLOWDESK_FRONTEND_HOST" --port "$FLOWDESK_FRONTEND_PORT"
