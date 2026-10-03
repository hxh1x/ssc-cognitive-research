# SSC CGL Stage 2 — Evidence Dashboard

Local, read-only web app to explore the frozen Stage 2 evidence layer:
**8,800 PYQs** (2,200 × Quant / English / Reasoning / GA) with topics, archetypes,
methods, traps, difficulty fields, years and shifts.

- Backend: `http://localhost:8000` (Python FastAPI, read-only)
- Frontend: `http://localhost:5173` (React + TypeScript + Vite + Tailwind + Recharts)

## Project structure

```
dashboard/
  run_dashboard.sh     # start backend + frontend
  stop_dashboard.sh    # stop both
  README.md            # this file
  backend/
    main.py            # FastAPI app, all /api/* endpoints
    requirements.txt   # fastapi, uvicorn[standard]
  frontend/
    package.json       # react, react-router-dom, recharts, tailwindcss
    vite.config.ts     # dev port 5173, /api proxy to :8000
    src/
      api.ts           # typed API client
      filters.tsx      # global filter state (persists across pages)
      App.tsx          # routes
      components/
        ui.tsx         # layout, cards, bars, heatmap, drawer, pagination
        charts.tsx     # recharts wrappers (bar, trend, donut)
        QuestionDrawer.tsx  # question detail drawer incl. options
      pages/
        Overview.tsx Subject.tsx Topic.tsx Questions.tsx Archetypes.tsx
        Traps.tsx Methods.tsx Papers.tsx Quality.tsx About.tsx
```

## Dependencies

- Python ≥ 3.10 with `fastapi`, `uvicorn[standard]`
  (`pip install --user fastapi "uvicorn[standard]"`)
- Node ≥ 18 with npm (frontend deps install automatically on first run)

## Installation

```bash
cd /home/harixx/cgl_pyqs/dashboard
pip install --user --break-system-packages -r backend/requirements.txt
cd frontend && npm install && cd ..
```

## Startup

```bash
./run_dashboard.sh
# open http://localhost:5173
./stop_dashboard.sh   # when done
```

`CGL_DATA_DIR` env var overrides the dataset location (default: `/home/harixx/cgl_pyqs`).
Logs: `/tmp/opencode/cgl_api.log`, `/tmp/opencode/cgl_web.log`.
PIDs: `/tmp/opencode/cgl_api.pid`, `/tmp/opencode/cgl_web.pid`.

## Data locations (read-only — never modified)

- `cgl_quant_pattern_db.csv`, `cgl_english_pattern_db.csv`,
  `cgl_reasoning_pattern_db.csv`, `cgl_awareness_pattern_db.csv`
- `cgl_structured_data.csv` (used only to look up options a–d by row order)
- `stage2_summary.txt` (shown verbatim on the Data Quality page)

The backend loads all CSVs once at startup and caches them in memory.
No cache or generated files are written next to the datasets.

## Troubleshooting

- **Backend not responding**: check `/tmp/opencode/cgl_api.log`; ensure port 8000
  is free (`pkill -f "uvicorn main:app"`), then rerun.
- **Blank page / API errors**: the Vite dev server proxies `/api` to
  `localhost:8000` — the backend must be running first.
- **Port clash on 5173**: run `./stop_dashboard.sh`, or start the frontend with
  `npm run dev -- --port 5174` inside `frontend/`.
- **Counts look wrong**: hit `http://localhost:8000/api/health` — it must show
  `{"rows":{"quant":2200,"english":2200,"reasoning":2200,"ga":2200}}`.

## How to add a future CSV version

1. Place the new `*_pattern_db.csv` files in the data dir (keep the same column
   contract: `Question_ID,Year,Shift,Subject,…,Example`).
2. Keep ID prefixes (`QNT-`, `ENG-`, `REA-`, `GA-`) or update `SUBJECTS` in
   `backend/main.py`.
3. Restart the backend (`./stop_dashboard.sh && ./run_dashboard.sh`).
4. Verify `/api/health` counts and the Overview totals.
