#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/load-env.sh"

exec node "$FLOWDESK_ROOT_DIR/scripts/gateway/dev-proxy.mjs"
