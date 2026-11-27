#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start the Python FastAPI ML server on 127.0.0.1:8000
(
  cd "$SCRIPT_DIR/server"
  uvicorn app:app --host 127.0.0.1 --port 8000
) &
ML_PID=$!

cleanup() {
  kill "$ML_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Start the Node/Express API server on $PORT (default 5000)
cd "$SCRIPT_DIR"
exec npx tsx server.ts
