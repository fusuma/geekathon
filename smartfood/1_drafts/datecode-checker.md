# DateCode Checker Lite

## Problem
Need to validate expiry/lot codes against SKU rules quickly and reliably.

## What it does
OCR the expiry/lot code and validate format/range against SKU rules.

## MVP
Folder of package photos → OCR → regex/date checks → Pass/Fail + CSV export.

## Fake Data
* 30 label images (good/bad)
* Per‑SKU JSON spec (code format, min/max shelf life)

## Demo Moment
Show wrong lot code → instant red flag + "open hold" record.

## Stretch Goal
Add camera live view + bounding box overlay.

## Why It's Great
* Dead simple to implement
* High business impact
* Great demo potential
* Easy to fake data