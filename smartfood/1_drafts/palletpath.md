# PalletPath - In‑Plant Logistics & Dock Sequencing

## Problem
Forklift congestion and dock jams.

## MVP
* Simple graph of plant lanes, orders → shortest collision‑aware routes & dock slots
* Tablet UI for forklift tasks; heatmap of aisle congestion

## KPIs
* Travel time per pallet
* Queue time at dock
* Near‑miss events (simulated)

## Implementation Notes
- Create plant layout graph representation
- Implement pathfinding with collision avoidance
- Build tablet interface for forklift operators
- Generate congestion heatmaps