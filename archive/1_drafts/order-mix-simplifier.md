# Order‑Mix Simplifier

## Problem
Small orders create excessive changeovers; need to reorder while meeting due times.

## What it does
Reorders small orders to minimize changeovers while meeting due times.

## MVP
CSV of orders (SKU, qty, due) → heuristic sort → compare changeover count.

## Fake Data
40 orders across 6 SKUs.

## Demo Moment
Side‑by‑side: original vs. optimized sequence.

## Stretch Goal
Add constraints (allergen blocks, labor windows).