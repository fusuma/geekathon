Below is a **lean AGILE PRD** you can drop into your repo/wiki. It focuses on the **consumer-facing bundle** we discussed: **Freshness Passport + Recall‑Ready** (with an optional V2 “Allergen Confidence Card”). It’s structured with **epics, user stories, acceptance criteria, data contracts, and a sprintable plan** suitable for a hackathon MVP and a 4–6 week pilot.

---

# PRD — Consumer Transparency Suite

**Scope:** Freshness Passport (lot‑aware “FreshScore”) + Recall‑Ready (lot subscription & targeted alerts)
**Version:** v1.0 (Hackathon MVP → Pilot)
**Date:** 2025‑09‑12
**Product Owner:** You
**Dev Leads:** TBD
**Stakeholders:** QA Lead, Supply Chain/Traceability Lead, Brand/Legal, Customer Support

---

## 1) Problem & Goals

### Problem

Consumers don’t trust static labels for freshness and recall risk. Brands can’t use their rich chain data to personalize guidance or notify only the affected buyers.

### Product Goals (SMART)

1. **Trust:** Deliver lot‑specific transparency in <1.0s after QR scan; ≥95% uptime during pilot.
2. **Engagement:** ≥15% of scanners opt in to **Recall‑Ready** within 30 days.
3. **Precision:** If a mock recall is triggered, **100%** of subscribers on affected lots are notified in <5 minutes.
4. **Waste:** For near‑expiry lots, show tailored guidance that leads to ≥5% higher sell‑through on pilot SKUs (proxy via store simulation during MVP).

### Non‑Goals (v1)

* Replacing legally required on‑pack info (this **augments** labels).
* End‑to‑end EPCIS ingestion at industrial scale (we’ll use a mock store/pipeline).
* Full LCA accuracy; FreshScore is a pragmatic, explainable proxy.

---

## 2) Personas

* **Consumer Carla** (primary): scans QR, wants simple freshness guidance, optional recall alerts; no login.
* **QA Manager Rui**: wants lot page to reflect actual events (sanitation, temperature exceptions).
* **Brand/Support Ana**: needs an interface to trigger recalls and view subscriber coverage.

---

## 3) Success Metrics

* **Activation:** scan‑to‑page load time (p95) ≤ 1s; bounce < 40%.
* **Opt‑in:** recall‑subscription conversion ≥ 15%.
* **Notification:** delivery success ≥ 98%; median latency < 60s; p95 < 5 min.
* **Data fidelity:** FreshScore deviation vs. ground truth (seeded scenarios) ≤ ±10 points.
* **Compliance:** zero PII without explicit opt‑in; audit logs for all recall sends.

---

## 4) Epics → User Stories (MoSCoW, AC)

### Epic A: **Digital Link Resolver & Lot Routing** (Must)

**Story A1:** As a consumer, when I scan a QR with GTIN+lot+expiry, I land on the **correct lot page**.

* **AC (Given/When/Then):**

  * Given a QR `/{01}/{gtin}/{10}/{lot}/{17}/{expiry}`, when requested, then the API resolves to `/lot/{gtin}/{lot}` and returns **200** with lot data; invalid paths return **400** with help text.
* **DoD:** Unit tests for valid/invalid segments; p95 latency < 200ms on mock data.

**Story A2:** As a brand admin, I can override routing to a **campaign page** by GTIN.

* **AC:** GTIN overrides stored & applied; lot‑level still supported; audit log recorded.

---

### Epic B: **Freshness Passport / FreshScore** (Must)

**Story B1:** As a consumer, I see a **FreshScore (0–100)** and plain‑language guidance (“Best within 2 days”).

* **AC:** FreshScore computed from lot’s time‑temperature exposure; page shows a color badge (Green/Amber/Red) with an **explanation tooltip** (“+6 hours >4 °C at DC on Sep 10”).
* **DoD:** Deterministic result for same events; unit tests for three seeded scenarios.

**Story B2:** As a consumer, I see **origin & handling**: farm region, plant, ship/receive timeline.

* **AC:** Timeline renders 3–5 events; if missing data, show “not available” gracefully.

**Story B3 (Should):** As a store associate, I can view **FEFO hints** for the lot.

* **AC:** A hidden param `?role=retail` adds a “prioritize sale before: <date>” hint.

---

### Epic C: **Recall‑Ready (Lot Subscription & Alerts)** (Must)

**Story C1:** As a consumer, I can **subscribe** to alerts for this lot with **email or phone**, without creating an account.

* **AC:** Double opt‑in (verification code); consent stored; unsubscribe link on every message.

**Story C2:** As a brand admin, I can **trigger a recall** for GTIN+lot(s) and send targeted alerts.

* **AC:** Admin POST with reason, severity, action steps; backend resolves subscribers and dispatches notifications; generates an **audit report** (CSV + PDF).
* **DoD:** Mock recall triggers test sends to sandbox channel; latency dashboards.

**Story C3 (Should):** As a consumer, after recall, I can **claim a voucher**.

* **AC:** Unique token per subscriber; single redemption; exportable CSV.

---

### Epic D: **Admin Console** (Should)

* Manage GTINs, lots, events (mock), score parameters, recall sends, exports.
* Role‑based access (Admin, Support, Read‑only).

---

### Epic E: **Analytics & Telemetry** (Must)

* Events: `qr_scanned`, `page_loaded`, `freshscore_viewed`, `subscribe_started`, `subscribe_confirmed`, `recall_sent`, `recall_delivered`, `recall_opened`.
* Privacy: no tracking cookies for consumers; use anonymous session ID.

---

### Epic F (V2 / Could): **Allergen Confidence Card**

* **Story F1:** Show a **sanitation‑passed** badge when changeover + swab events exist.
* **AC:** If `sanitation_passed=true` within X hours before lot start, show badge with timestamp and a caution if sequence is less ideal (never replace label).

---

## 5) Functional Requirements

* **Lot Page (public)**: FreshScore gauge, timeline, origin, storage tips, **Recall‑Ready CTA**, legal disclaimer, privacy link, language toggle (EN/PT).
* **Subscription Flow**: 2‑step verify; no login; rate‑limited; consent text explicit.
* **Recall Trigger (admin)**: form/API; supports multiple lots; preview message; can schedule or send now; must generate an immutable audit artifact.
* **Explainability**: “Why this score?” drawer with readable rules.

---

## 6) Non‑Functional Requirements (NFRs)

* **Performance:** TTFB < 300ms; page interactive < 1s on 4G.
* **Reliability:** At‑least‑once delivery for alerts; idempotent recall sends.
* **Security:** TLS everywhere; signed admin sessions; hashed tokens; PII encrypted at rest.
* **Privacy:** Explicit opt‑in; minimal PII (email/phone only); data retention ≤ 12 months by default.
* **Compliance UX:** “This information augments but does not replace package labeling.”
* **Accessibility:** WCAG 2.1 AA (color contrast, screen‑reader labels).
* **Localization:** Copy in EN/PT; l10n framework for more.
* **Observability:** Logs, metrics, trace IDs; synthetic ping for resolver.

---

## 7) Domain Model (MVP)

**Entities**

* **Product** `{gtin, name, brand}`
* **Lot** `{gtin, lot, expiry, origin, plant, created_at}`
* **EpcisEvent** `{lot_id, time, step, site, tempC}`
* **FreshnessRecord** `{lot_id, score, computed_at, details}`
* **Subscription** `{id, lot_id, channel(email|sms), value, consent_ts, verified_ts, locale, status}`
* **Recall** `{id, created_by, created_at, severity, reason, affected_lots[], message}`
* **Notification** `{recall_id, subscription_id, sent_at, status, provider_id}`

---

## 8) FreshScore Logic (explainable\*

> *Simple, transparent model for MVP; can swap to a validated shelf‑life/kinetics model later.*

* **Inputs:**

  * `L_days` (baseline shelf life), `T_ref` (ideal temp), `k` (sensitivity per °C), EPCIS temp/time events.
* **Compute:**

  * For each interval `Δt` at temp `T`: **aging factor** `a = exp(k * max(0, T - T_ref))`.
  * **Consumed life (hours)** `= Σ (Δt × a)`.
  * **Remaining life (hours)** `= L_days×24 − consumed`.
  * **FreshScore** `= clamp(0, 100 × remaining / (L_days×24))`.
* **Outputs:**

  * Score (0–100), traffic light (≥70 green / 40–69 amber / <40 red), 1–2 bullet reasons (largest intervals > T\_ref).

*(Example params: `L_days=14`, `T_ref=4 °C`, `k=0.08` per °C.)*

---

## 9) APIs (MVP contracts)

### 9.1 Resolver

`GET /v1/resolve/01/{gtin}/10/{lot}/17/{yyMMdd}` → `302` to `/lot/{gtin}/{lot}`

### 9.2 Passport (lot data)

`GET /v1/lot/{gtin}/{lot}` →

```json
{
  "gtin": "09506000134352",
  "lot": "LUS23A45",
  "expiry": "2025-10-01",
  "origin": {"farm_region":"Leiria","processed_at":"Valado dos Frades"},
  "events": [{"t":"2025-09-10T07:22:00Z","site":"DC-Porto","step":"shipping","tempC":3.2}],
  "freshscore": {"value":86,"band":"green","reasons":["all within 0–6°C"],"computed_at":"2025-09-12T09:10:00Z"}
}
```

### 9.3 Subscribe

`POST /v1/recall/subscribe`

```json
{"gtin":"09506000134352","lot":"LUS23A45","channel":"email","value":"carla@example.com","locale":"pt-PT"}
```

→ `200 {"status":"verify_sent"}`

`POST /v1/recall/verify`

```json
{"token":"abc123"}
```

→ `200 {"status":"confirmed"}`

### 9.4 Trigger Recall (admin)

`POST /v1/recall`

```json
{
  "severity":"HIGH",
  "reason":"Possible contamination",
  "lots":[{"gtin":"09506000134352","lot":"LUS23A45"}],
  "message":{"title":"Safety Notice","body":"Do not consume...","actions":["Refund at point of sale"]}
}
```

→ `202 {"recall_id":"R-20250912-01"}`

---

## 10) UI Requirements

**Lot Page (mobile‑first)**

* Header: product name, lot, expiry.
* **FreshScore gauge** + “Best within X days” (if amber/red, show concise caution text).
* Timeline: 3–5 chain events.
* CTA: **“Get recall alerts for this lot”**; email/phone field, consent checkbox.
* Disclosure text: “Augments but does not replace package labeling.”

**Admin**

* Dashboard: lots seen/scanned, opt‑ins, recall sends.
* Recall form: select GTIN/lot(s), preview message, send test, send now.

---

## 11) Risks & Mitigations

* **Data gaps** → Show graceful “not available” with reason; default FreshScore to conservative.
* **False precision** → Always display **how computed**; avoid decimals; show bands.
* **PII handling** → Encrypt at rest; strict retention; DPAs with providers (SMS/Email).
* **Over‑alerting** → Lot‑scoped targeting only; throttle retries; unsubscribe in 1 tap.

---

## 12) Dependencies

* QR printing (GS1 Digital Link encoding) for demo labels.
* Email/SMS provider (mock adapter for hackathon, real later).
* EPCIS/mock event feed (JSON file or table).
* Legal copy review (privacy, disclaimer).

---

## 13) Release Plan

### Hackathon MVP (48 hours)

**Must‑have**

* Resolver & lot page (EN), mock events, FreshScore calc (deterministic), recall subscribe (email only), admin recall trigger, test notification log, basic analytics.

**Demo Script**

1. Scan Pack A (good cold chain) → green **FreshScore 87**.
2. Scan Pack B (temp spike) → **FreshScore 52**, amber with explanation.
3. Subscribe for Pack B → trigger mock recall → show **targeted alert** only for B.
4. Show admin audit export (CSV/PDF).

### Pilot (4–6 weeks)

* SMS channel; localization PT; admin console polish; retry/queue; real EPCIS connector; accessibility audits; privacy/DP: DSR endpoints.

### V2

* **Allergen Confidence Card**, FEFO store hints, voucher claims, EcoScore add‑on.

---

## 14) Backlog (sample, with priority & sizing)

| ID  | Title                      | Priority | Size (pts) | Notes                 |
| --- | -------------------------- | -------- | ---------: | --------------------- |
| A1  | Digital Link resolver      | P0       |          3 | Routing & validation  |
| B1  | FreshScore service         | P0       |          5 | Calculation + reasons |
| B2  | Lot page UI                | P0       |          5 | Gauge, timeline, CTA  |
| C1  | Subscribe (email + verify) | P0       |          5 | Double opt‑in         |
| C2  | Recall trigger (admin)     | P0       |          5 | Targeting + audit     |
| E1  | Telemetry events           | P0       |          3 | Basic analytics       |
| S1  | Seed data scripts          | P0       |          2 | Lots + events         |
| N1  | Privacy/consent copy       | P0       |          1 | Legal text            |
| L10 | Localization (PT)          | P1       |          3 | i18n scaffolding      |
| C3  | Voucher claim flow         | P2       |          5 | Tokens + redemption   |
| F1  | Allergen Confidence Card   | P3       |          5 | V2 feature            |

---

## 15) Definition of Ready (DoR) / Definition of Done (DoD)

**DoR:** User story has acceptance criteria, test data ready, UX notes, non‑goals clear, dependencies identified.
**DoD:** Unit tests ≥ 80% for core; AC pass on staging; telemetry firing; security lint clean; docs updated.

---

## 16) Test Plan (MVP)

* **Unit:** FreshScore math (3 scenarios), resolver parsing, subscription token lifecycle.
* **Integration:** Trigger recall → notifications queued → audit generated.
* **E2E:** Scan → lot page → subscribe → verify → recall send → receive alert (sandbox inbox).
* **Negative:** Bad QR, expired lot, unsubscribe, duplicate subscriptions, rate limit.

---

## 17) Instrumentation & Dashboards

* Counters: scans/day, unique lots, opt‑ins, recalls sent, deliveries, failures.
* Latency: resolve TTFB, FreshScore compute time, notification send latency (p50/p95).
* Funnel: `scan → view → subscribe_start → subscribe_confirmed`.

---

## 18) Data Retention & Security

* Subscriptions: 12 months (configurable); auto‑purge after expiry.
* Notifications log: 24 months (hashed payloads where possible).
* Access: RBAC; admin actions audited (IP, time, user).

---

## 19) Architecture (text)

```
QR (GS1 Digital Link)
   → Resolver (Edge) → Lot API (FastAPI + SQLite/Postgres)
                    → FreshScore Service (stateless)
                    → EPCIS Mock Store (JSON/table)
                    → Notification Worker (email/SMS adapter)
                    → Admin Console (Next.js)
                    → Analytics Sink (events)
```

---

## 20) Seed Data (for demo)

* **Lots:** 4 (two “green”, one “amber”, one “red”)
* **Events per lot:** 5–8 with temp profiles (create one with a 3h 9 °C spike)
* **Subscribers:** 3 test emails (only one on recalled lot)
* **Recall:** 1 HIGH severity scenario

---

### Legal/UX copy (snippets)

* “This page provides lot‑specific guidance based on supply‑chain data. It **does not replace** information on the package. Always follow safe‑handling and cooking instructions.”
* “By subscribing you consent to receive recall notices for this lot. You can unsubscribe anytime.”

---

**That’s the full AGILE PRD.**
If you want, I can adapt this into **issues (epics/stories)** for Jira/Linear with acceptance criteria and seed JSON files so your team can start coding immediately.
