# Lot Linker (Lite Traceability)

## Problem
Need to map inbound lot IDs to finished lots for traceability.

## What it does
Map inbound lot IDs to finished lots via simple "work order join."

## MVP
Upload two CSVs (receipts, work orders) → build lot genealogy graph + export.

## Fake Data
5 inbound lots → 4 finished SKUs with overlaps.

## Demo Moment
Click finished lot → see all parents.

## Stretch Goal
"Recall scope" button shows affected customers.

## Why It's Great
* Makes traceability tangible in minutes
* Essential for recall readiness
* Simple but powerful visualization