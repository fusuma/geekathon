# Catch‑Weight Reasonability Check

## Problem
Need to flag outlier pack weights vs. learned distribution.

## What it does
Flags outlier pack weights vs. learned distribution.

## MVP
CSV import (unit weights) → z‑score/outlier flags → Pareto of causes.

## Fake Data
2,000 weights with injected anomalies.

## Demo Moment
Turn on "tighten tolerance" slider → false positives fall/rise.

## Stretch Goal
Lightweight online learning per SKU.