# Changeover Stopwatch + Loss Pareto

## Problem
**Changeovers steal hours** each week, but teams rarely know **which specific tasks** (cleaning, film swap, QA wait, tools, etc.) cause most of the loss.

## Solution
Makes changeovers measurable and ranks the biggest time sinks so you fix the right ones first.

## User Flows

### Operator (tablet at line)
1. Tap **Start Changeover** when last good unit of SKU A is produced
2. Pick **From SKU → To SKU** (or scan work order/QR)
3. Tap **Reason buttons** to time-slice changeover segments
4. Tap **End Changeover** when first good unit of SKU B is produced
5. Optional: add notes, photo, crew size

### Supervisor
1. View **weekly Pareto** of changeover minutes by reason
2. Use **What‑If slider** to simulate reduction scenarios
3. Export **1‑page PDF** for daily meetings

## MVP Scope
* One screen timer with Start/End and reason selector
* 8-10 curated reasons (CLN, LBL, MAT, QA, ENG, SET, TRN, OTH)
* SQLite data store
* Pareto chart with what-if analysis
* CSV and PDF exports

## Reason Codes
* `CLN` Cleaning/Sanitation
* `LBL` Label/film change & print setup
* `MAT` Waiting on materials/components
* `QA` Waiting on QA/quality release
* `ENG` Tooling/engineering adjustment
* `SET` Machine settings (speeds, temps)
* `TRN` Operator instructions/training
* `OTH` Other (requires note)

## What-If Math Example
* Weekly top reason (QA wait) = **124 min**
* Reduction target 50% → **62 min saved**
* Line run rate = **80 packs/min**
* Packs gained = `62 × 80 = 4,960`
* Margin per pack = **€0.07**
* **€/week** = `4,960 × 0.07 = €347.20`
* **€/year** (×52) ≈ **€18,054.40**

## Demo Script (3-4 minutes)
1. **Start** a changeover (shows big stopwatch)
2. Tap **CLN → LBL → QA** to create 3 segments in 30–40 seconds
3. **End** changeover; go to dashboard
4. Pareto shows **QA wait** as #1 (seeded)
5. Move slider to **50% reduction** → "Save **62 min/week**, **€18k/year**"
6. Export **PDF**; show it's ready for the morning meeting

## Tech Stack
* **Backend:** FastAPI or Flask + SQLite
* **Frontend:** Streamlit (fastest) or React/Vite
* **Charts:** Plotly or Chart.js

## BRAINR Integration
Export changeover events and loss segments:

```json
{
  "factory_id": "VALADO-01",
  "line_id": "PACK-02",
  "event_type": "CHANGEOVER",
  "from_sku": "CH-WNG-400",
  "to_sku": "CH-BON-500",
  "duration_sec": 1440,
  "segments": [
    {"reason_code": "CLN", "duration_sec": 1000},
    {"reason_code": "LBL", "duration_sec": 440}
  ]
}
```

## Why Judges Will Like It
* **Instant insight:** Pareto chart shows biggest fix
* **Actionable what-if:** Shows minutes & euros gained
* **Credible rollout:** Simple timers now → later integrate with MES
* **People-positive:** Helps crews prove where they need support