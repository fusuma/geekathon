# EnergyCurve - TOU Energy Shifting for Food Lines

## Problem
Energy cost spikes; schedules ignore tariff windows.

## MVP
* Import tariff curve + order mix
* Optimizer suggests start times and **deferrable tasks** (e.g., blast chillers) to lower cost

## KPIs
* kWh shifted off‑peak
* € saved per day
* Carbon intensity delta

## Implementation Notes
- Import time-of-use tariff data
- Identify deferrable production tasks
- Optimize scheduling to minimize energy costs
- Calculate carbon footprint reduction