#!/usr/bin/env bash
# Stop the SSC CGL Stage 2 evidence dashboard.
for pidfile in /tmp/opencode/cgl_api.pid /tmp/opencode/cgl_web.pid; do
  if [ -f "$pidfile" ]; then
    pid=$(cat "$pidfile")
    if kill -0 "$pid" 2>/dev/null; then
      echo "Stopping PID $pid ($pidfile)..."
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$pidfile"
  fi
done
pkill -f "uvicorn main:app" 2>/dev/null || true
echo "Dashboard stopped."
