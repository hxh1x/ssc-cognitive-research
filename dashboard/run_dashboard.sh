#!/usr/bin/env bash
# Start the SSC CGL Stage 2 evidence dashboard (backend + frontend).
# Backend : http://localhost:8000   (API, read-only)
# Frontend: http://localhost:5173   (dashboard UI)
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="${CGL_DATA_DIR:-$(dirname "$ROOT")}"
export CGL_DATA_DIR="$DATA_DIR"

echo "Data dir : $CGL_DATA_DIR"
echo "Starting backend on :8000 ..."
cd "$ROOT/backend"
nohup python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 > /tmp/opencode/cgl_api.log 2>&1 &
echo $! > /tmp/opencode/cgl_api.pid

echo "Starting frontend on :5173 ..."
cd "$ROOT/frontend"
if [ ! -d node_modules ]; then
  echo "Installing frontend dependencies (first run only)..."
  npm install
fi
nohup npm run dev -- --port 5173 --host 127.0.0.1 > /tmp/opencode/cgl_web.log 2>&1 &
echo $! > /tmp/opencode/cgl_web.pid

sleep 4
echo "--- backend health ---"
curl -s http://localhost:8000/api/health || echo "BACKEND NOT RESPONDING (see /tmp/opencode/cgl_api.log)"
echo
echo "Open the dashboard at: http://localhost:5173"
