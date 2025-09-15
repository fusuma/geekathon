# LabelGuard AI – Allergen & Label Integrity Copilot

**🏆 Recommended build for hackathon**

## Problem
Mislabeling and allergen errors drive recalls; manual checks miss edge cases.

## MVP (Weekend Build)
* Webcam or sample images of packages
* OCR (date/lot, ingredients) + rules engine that compares to a **digital product spec** (JSON)
* "Pass/Fail" overlay + **Non‑Conformance Event** POST to a mock `/events/nonconformance`
* Dashboard: open non‑conformances, root‑cause tag, and printable hold ticket

## KPIs
* Mislabel detection rate
* False positive rate
* Time‑to‑detect
* #holds avoided (simulated)

## Stretch Goal
Small on‑edge model to detect **label position skew** or **missing allergen icon**

## Why This Wins
* **High business impact:** Recall prevention, compliance
* **Clear "wow" demo:** Camera spots a wrong label in real time
* **Easy to fake data:** Label images and product specs
* **Clean integration story:** BRAINR quality events
* **Speaks to sponsors:** Risk, brand protection, safer processes

## 48-Hour MVP Scope
Webcam + OCR + simple CV model verifies SKU, allergens, date/lot codes vs. the digital spec; creates a **non‑conformance event** to a mock BRAINR endpoint and a **hold/stop‑line** suggestion in a small dashboard.

## Demo Script (3-4 minutes)
1. **Hook (20s):** "In food, most recalls start with a label."
2. **Live Run (90s):** Show good pack → green overlay; show wrong allergen icon → red overlay; dashboard auto‑opens NC with image.
3. **Operator Action (40s):** Click *Hold Pallet*, add note, show audit PDF.
4. **Business Impact (40s):** KPI slide: 95% detection on seeded cases; simulated € recall avoided per 10k packs.
5. **Integration (30s):** One slide: webhooks into BRAINR QC events.
6. **Vision (20s):** Edge device + multi‑line scale‑up.

## Architecture
```
Camera/Images → OCR (date/lot/ingredients)
             → Icon Detector (optional)  
             → Rules Engine (Spec JSON)
             → Event Dispatcher → Mock MES (/events/nonconformance)
             → Dashboard (Streamlit/React) + SQLite/Postgres
```

## Mock Integration Contract
* `POST /v1/events/nonconformance`
* `GET /v1/events?status=open&type=nonconformance`
* `POST /v1/events/{id}/actions` (e.g., `HOLD_PALLET`, `OVERRIDE` with reason)