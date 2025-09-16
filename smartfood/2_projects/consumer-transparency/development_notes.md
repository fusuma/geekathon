Short answer: **yes—totally doable in a weekend with Claude Code** if you stick to the P0 “steel‑thread” scope and make a few pragmatic choices. Below is a lean path that Claude Code excels at: small, well‑scoped modules, lots of boilerplate generation, and testable contracts.

---

## The steel‑thread you should ship

**From a consumer scan to a targeted recall alert, end‑to‑end:**

1. **QR → Resolver:** Accept GS1 Digital Link–style paths (`/01/{gtin}/10/{lot}/17/{yyMMdd}`) and redirect to `/lot/{gtin}/{lot}`.
2. **Lot Page:** Render **FreshScore (0–100)** from seeded time/temperature events; show origin, a brief timeline, and the legal disclaimer.
3. **Subscribe:** Email‑only double opt‑in (code sent; one tap confirm).
4. **Trigger Recall (Admin):** Select GTIN+lot; send message to **only** subscribers for that lot; persist an audit log.
5. **Audit + Demo Data:** Seed 4 lots (2 green, 1 amber, 1 red), \~6 events per lot, and 2 subscribers (only one on the recalled lot).

> **What you intentionally do NOT build now:** SMS, vouchers, multi‑language UI, real EPCIS ingestion, role management, fancy charts, cloud deploy. Keep it local, transparent, and deterministic.

---

## Suggested stack (fastest path)

**Option A (fastest to finish):** *Single* Python app

* **FastAPI** (API + admin endpoints), **Jinja2** (server‑rendered lot page), **HTMX/Alpine** (small interactivity), **SQLite** (file DB), **Starlette‑Mail / console backend** (logs “emails”).
* No frontend framework build step, no auth provider, no cloud.

**Option B (if you insist on React):** Next.js for the lot page + API routes, FastAPI for the recall worker. Only pick this if you already have a Next.js template ready.

> Claude Code is especially good at: generating Pydantic models, request/response validators, Jinja templates, and pytest files from your contracts.

---

## Repo scaffold

```
/app
  main.py                 # FastAPI app + routes
  models.py               # Pydantic + SQLAlchemy/SQLite
  services/
    freshscore.py         # deterministic score calc
    notifications.py      # "email" provider (console or file)
  seeds/
    lots.json             # 4 demo lots
    events.json           # time/temp event arrays
  templates/
    lot.html              # consumer page (Jinja)
    admin.html            # minimal recall form & results
  static/
    styles.css
  tests/
    test_resolver.py
    test_freshscore.py
    test_recall_flow.py
```

---

## Minimal data contracts (copy/paste for Claude)

**Lot API response**

```json
{
  "gtin": "09506000134352",
  "lot": "LUS23A45",
  "expiry": "2025-10-01",
  "origin": {"farm_region":"Leiria","processed_at":"Valado dos Frades"},
  "events": [
    {"t":"2025-09-10T07:22:00Z","site":"DC-Porto","step":"shipping","tempC":3.2},
    {"t":"2025-09-10T14:05:00Z","site":"Retail-Norte","step":"receiving","tempC":4.7}
  ],
  "freshscore": {"value":86,"band":"green","reasons":["all within 0–6°C"]}
}
```

**Subscribe request**

```json
{"gtin":"09506000134352","lot":"LUS23A45","channel":"email","value":"carla@example.com","locale":"pt-PT"}
```

**Recall trigger (admin)**

```json
{
  "severity":"HIGH",
  "reason":"Possible contamination",
  "lots":[{"gtin":"09506000134352","lot":"LUS23A45"}],
  "message":{"title":"Safety Notice","body":"Do not consume... Refund available."}
}
```

---

## Acceptance checklist (hit these and you can demo)

1. **Resolver** accepts real‑looking paths and gracefully rejects invalid segments.
2. **Lot page** loads instantly with FreshScore + “Why this score?” drawer (top 1–2 reasons).
3. **Double opt‑in** email writes to DB only after verification.
4. **Recall trigger** sends one “email” to the **affected subscriber only** (log file or console) and produces a CSV/PDF audit.
5. **Unsubscribe** works and is reflected in a second recall test.
6. **Tests** pass for: resolver parsing, FreshScore math (3 seeded scenarios), and recall targeting.

---

## Claude Code prompt pack (practical, targeted)

Paste these one by one in your editor/CLI with the file open so Claude has context.

1. **Models & schema**

   * *“Generate Pydantic models for Product, Lot, Event(time,tempC,site,step), Subscription, Recall, Notification. Include SQLAlchemy tables for SQLite with sensible indexes.”*
2. **Resolver route**

   * *“In FastAPI, add `GET /v1/resolve/01/{gtin}/10/{lot}/17/{yyMMdd}` that validates segments and redirects to `/lot/{gtin}/{lot}` with 302; write unit tests for valid/invalid inputs.”*
3. **FreshScore service**

   * *“Implement a deterministic FreshScore(events\[], L\_days=14, T\_ref=4, k=0.08). Return value 0–100, band, and top 2 reason strings. Include tests for: (a) all 0–6 °C, (b) 3h @ 9 °C, (c) prolonged 7–8 °C.”*
4. **Lot page template**

   * *“Create `lot.html` with Jinja: product header, FreshScore badge, timeline list, ‘Get recall alerts’ form. Keep it mobile‑first and accessible.”*
5. **Subscribe flow**

   * *“Add POST `/v1/recall/subscribe` (email only), create token, send via console provider, and `POST /v1/recall/verify` to confirm. Rate‑limit by IP+lot.”*
6. **Recall trigger**

   * *“Admin POST `/v1/recall` that targets subscribers by lot, writes Notification rows, and renders an admin HTML view with results. Produce a CSV audit with timestamp, recipient, status.”*
7. **Unsubscribe**

   * *“Add GET `/u/{token}` to set subscription status=unsubscribed and render confirmation.”*
8. **Tests**

   * *“Write pytest for: (1) resolver, (2) FreshScore, (3) subscribe→verify→recall sends exactly one notification to affected subscriber, none to others.”*

---

## Seed data (ask Claude to generate)

* **Lots:** 4 lots across 1 GTIN with varied expiries.
* **Events:** \~6 per lot; ensure one “amber” case with a short >8 °C window.
* **Subscribers:** 2 emails; only one tied to a later‑recalled lot.

Prompt:

* *“Generate `seeds/lots.json` and `seeds/events.json` for 4 lots (2 green, 1 amber, 1 red), each with 5–8 events (shipping/receiving) and tempC values that drive the FreshScore bands accordingly.”*

---

## Common pitfalls (and how to avoid them fast)

* **Over‑engineering the frontend:** Use Jinja + HTMX; skip a full SPA build.
* **Real email/SMS providers:** Use a console/file adapter now; swap later.
* **Complex IDs:** Keep GTIN/lot as plain strings; validate format lightly.
* **Ambiguous math:** Keep FreshScore simple, explainable, and deterministic; show the top temperature interval as the “reason.”
* **PII sprawl:** Store only email, consent timestamps, and opt‑in status; nothing else.

---

## “Go/No‑Go” checkpoints (scope, not time)

* **Checkpoint A:** Resolver + Lot page render with seeded data.
* **Checkpoint B:** FreshScore correct for 3 seed scenarios.
* **Checkpoint C:** Subscribe→Verify lifecycle works.
* **Checkpoint D:** Recall triggers **only** the affected subscriber and emits an audit file.

If you can hit A→D, your live demo will be smooth and credible.

---

### Bottom line

With this scope and the prompts above, **Claude Code is a great fit**—it will crank out the boilerplate (models, routes, tests, templates) while you keep decisions simple. If you want, I can adapt the PRD into a **copy‑paste task list** for your tracker (Jira/Linear) so you can drop it straight into your workflow.


Absolutely—Node.js is a great fit. Here’s a **weekend‑sized plan** to ship the **Consumer Transparency Suite** (Freshness Passport + Recall‑Ready) in **TypeScript + Next.js 14 + SQLite (Prisma)**. I’ve included a full repo scaffold, data model, key routes, and copy‑pasteable code snippets. At the end, I added a tiny **Express** variant for the **Changeover Stopwatch** if you also want an ops‑side demo.

---

## 0) Tech choices (fast + familiar)

* **Runtime:** Node.js 18+ (LTS), **TypeScript**
* **Web/App:** **Next.js 14 App Router** (server components for speed, API routes for backend)
* **DB:** **SQLite** via **Prisma** (file DB = zero setup)
* **Email:** **Nodemailer** with a **stream/file transport** (no external provider needed)
* **Styling:** Minimal CSS (or Tailwind if you’re fluent)
* **Tests:** **Vitest** (or Jest) + **Zod** for input validation

Why this works: everything runs locally, you avoid infra drag, and you still have clear separation of concerns.

---

## 1) Repo scaffold

```
consumer-transparency/
  .env.local
  package.json
  prisma/
    schema.prisma
    seed.ts
  src/
    app/
      api/
        resolve/01/[gtin]/10/[lot]/17/[yyMMdd]/route.ts
        recall/subscribe/route.ts
        recall/verify/route.ts
        admin/recall/route.ts
        unsubscribe/[token]/route.ts
      lot/[gtin]/[lot]/page.tsx
      admin/page.tsx
      layout.tsx
      globals.css
    lib/
      db.ts
      freshscore.ts
      mail.ts
      csv.ts
      zod.ts
    components/
      Gauge.tsx
      Timeline.tsx
      SubscribeForm.tsx
```

> **Install:**
> `npm i next react react-dom prisma @prisma/client zod nodemailer uuid`
> `npx prisma init --datasource-provider sqlite`

---

## 2) Prisma data model (drop in)

**prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Product {
  gtin   String  @id
  name   String
  brand  String?
  lots   Lot[]
}

model Lot {
  id        String   @id @default(cuid())
  gtin      String
  lot       String
  expiry    DateTime
  origin    String?
  plant     String?
  createdAt DateTime @default(now())
  product   Product  @relation(fields: [gtin], references: [gtin])
  events    EpcisEvent[]
  subs      Subscription[]
  @@unique([gtin, lot])
}

model EpcisEvent {
  id      String   @id @default(cuid())
  lotId   String
  time    DateTime
  step    String   // shipping | receiving | observe
  site    String
  tempC   Float?
  lot     Lot      @relation(fields: [lotId], references: [id])
  @@index([lotId, time])
}

model Subscription {
  id          String   @id @default(cuid())
  lotId       String
  channel     String   // "email" only for MVP
  value       String   // email address
  status      String   // "pending" | "confirmed" | "unsubscribed"
  token       String   @unique
  consentTs   DateTime?
  verifiedTs  DateTime?
  unsubTs     DateTime?
  lot         Lot      @relation(fields: [lotId], references: [id])
  notifications Notification[]
  @@index([lotId, status])
}

model Recall {
  id         String   @id @default(cuid())
  severity   String
  reason     String
  createdAt  DateTime @default(now())
  messageT   String   // title
  messageB   String   // body
  items      RecallItem[]
  notifications Notification[]
}

model RecallItem {
  id       String @id @default(cuid())
  recallId String
  gtin     String
  lot      String
  recall   Recall @relation(fields: [recallId], references: [id])
}

model Notification {
  id           String   @id @default(cuid())
  recallId     String
  subscriptionId String
  recipient    String
  sentAt       DateTime?
  status       String   // "queued" | "sent" | "error"
  providerId   String?
  recall       Recall @relation(fields: [recallId], references: [id])
  subscription Subscription @relation(fields: [subscriptionId], references: [id])
}
```

**DB init:**
`npx prisma migrate dev -n init`
`npx prisma db seed` (we’ll add `seed.ts` next)

---

## 3) FreshScore service (explainable + deterministic)

**src/lib/freshscore.ts**

```ts
export type TempEvent = { t: string; tempC?: number };
export type ScoreResult = { value: number; band: "green" | "amber" | "red"; reasons: string[] };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * Simple kinetic-like model:
 * - baseline shelf life L_days at T_ref (°C)
 * - for each interval Δt (h) at temp T: aging factor a = exp(k * max(0, T - T_ref))
 * - consumed = Σ (Δt * a)
 */
export function computeFreshScore(
  events: TempEvent[],
  L_days = 14,
  T_ref = 4,
  k = 0.08
): ScoreResult {
  if (!events.length) return { value: 50, band: "amber", reasons: ["insufficient data"] };

  // sort by time
  const sorted = [...events].sort((a, b) => +new Date(a.t) - +new Date(b.t));

  let consumedH = 0;
  let worst: { start: string; end: string; T: number; factor: number; hours: number } | null = null;

  for (let i = 0; i < sorted.length - 1; i++) {
    const start = new Date(sorted[i].t);
    const end = new Date(sorted[i + 1].t);
    const hours = Math.max(0, (end.getTime() - start.getTime()) / 36e5);
    const T = sorted[i].tempC ?? T_ref; // assume T_ref if missing
    const factor = Math.exp(k * Math.max(0, T - T_ref));
    const delta = hours * factor;
    consumedH += delta;
    if (!worst || delta > (worst.hours * worst.factor)) {
      worst = { start: sorted[i].t, end: sorted[i + 1].t, T, factor, hours };
    }
  }

  const totalH = L_days * 24;
  const remaining = clamp(totalH - consumedH, 0, totalH);
  const value = Math.round((remaining / totalH) * 100);

  const band = value >= 70 ? "green" : value >= 40 ? "amber" : "red";
  const reasons: string[] = [];
  if (worst) {
    const hrs = worst.hours.toFixed(1);
    reasons.push(
      worst.T <= T_ref
        ? `mostly within ideal range (≤ ${T_ref}°C)`
        : `${hrs}h around ${worst.T.toFixed(1)}°C increased aging`
    );
  }
  return { value, band, reasons };
}
```

---

## 4) Mail + CSV utilities

**src/lib/mail.ts**

```ts
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  streamTransport: true, newline: "unix", buffer: true
});

export async function sendMail(to: string, subject: string, text: string, html?: string) {
  const info = await transport.sendMail({
    from: '"Lusiaves Alerts" <no-reply@example.local>',
    to, subject, text, html
  });
  // For demo: print to console
  console.log("MAIL_OUT:\n" + (info.message?.toString() ?? subject));
  return info;
}
```

**src/lib/csv.ts**

```ts
export function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) =>
    v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
  const lines = [headers.join(",")].concat(rows.map(r => headers.map(h => esc(r[h])).join(",")));
  return lines.join("\n");
}
```

---

## 5) Next.js API routes

### 5.1 Resolver → redirect to lot page

**src/app/api/resolve/01/\[gtin]/10/\[lot]/17/\[yyMMdd]/route.ts**

```ts
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { gtin: string; lot: string; yyMMdd: string } }
) {
  const { gtin, lot, yyMMdd } = params;
  if (!/^\d{14}$/.test(gtin) || !lot || !/^\d{6}$/.test(yyMMdd))
    return NextResponse.json({ error: "Invalid GS1 Digital Link segments" }, { status: 400 });

  return NextResponse.redirect(new URL(`/lot/${gtin}/${encodeURIComponent(lot)}`, _req.url));
}
```

### 5.2 Subscribe (create pending + send verification)

**src/lib/zod.ts**

```ts
import { z } from "zod";
export const SubscribeSchema = z.object({
  gtin: z.string().min(8),
  lot: z.string().min(1),
  channel: z.literal("email"),
  value: z.string().email(),
  locale: z.string().optional()
});
```

**src/app/api/recall/subscribe/route.ts**

```ts
import { NextResponse } from "next/server";
import { SubscribeSchema } from "@/lib/zod";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { gtin, lot, value } = parsed.data;
  const lotRec = await prisma.lot.findUnique({ where: { gtin_lot: { gtin, lot } } });
  if (!lotRec) return NextResponse.json({ error: "Lot not found" }, { status: 404 });

  const token = randomUUID();
  await prisma.subscription.create({
    data: { lotId: lotRec.id, channel: "email", value, status: "pending", token }
  });

  const verifyUrl = new URL(`/api/recall/verify?token=${token}`, req.url).toString();
  await sendMail(value, "Confirm lot alerts", `Click to confirm: ${verifyUrl}`);

  return NextResponse.json({ status: "verify_sent" });
}
```

### 5.3 Verify

**src/app/api/recall/verify/route.ts**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const sub = await prisma.subscription.findUnique({ where: { token } });
  if (!sub || sub.status !== "pending")
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  await prisma.subscription.update({
    where: { token },
    data: { status: "confirmed", verifiedTs: new Date() }
  });

  return NextResponse.json({ status: "confirmed" });
}
```

### 5.4 Unsubscribe

**src/app/api/unsubscribe/\[token]/route.ts**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const sub = await prisma.subscription.findUnique({ where: { token: params.token } });
  if (!sub) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  await prisma.subscription.update({
    where: { token: params.token },
    data: { status: "unsubscribed", unsubTs: new Date() }
  });
  return NextResponse.json({ status: "unsubscribed" });
}
```

### 5.5 Admin: trigger recall (with secret)

**src/app/api/admin/recall/route.ts**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { toCSV } from "@/lib/csv";

export async function POST(req: Request) {
  const token = req.headers.get("x-admin-token");
  if (!token || token !== process.env.ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { severity, reason, lots, message } = await req.json() as {
    severity: string; reason: string;
    lots: { gtin: string; lot: string }[];
    message: { title: string; body: string }
  };

  const recall = await prisma.recall.create({
    data: { severity, reason, messageT: message.title, messageB: message.body,
      items: { create: lots } }
  });

  const notifications: any[] = [];

  for (const { gtin, lot } of lots) {
    const lotRec = await prisma.lot.findUnique({ where: { gtin_lot: { gtin, lot } } });
    if (!lotRec) continue;
    const subs = await prisma.subscription.findMany({
      where: { lotId: lotRec.id, status: "confirmed" }
    });
    for (const s of subs) {
      await prisma.notification.create({
        data: {
          recallId: recall.id, subscriptionId: s.id,
          recipient: s.value, status: "queued"
        }
      });
      await sendMail(
        s.value,
        message.title,
        `${message.body}\nAffected lot: ${gtin}/${lot}\nUnsub: ${new URL(`/api/unsubscribe/${s.token}`, req.url)}`
      );
      await prisma.notification.updateMany({
        where: { recallId: recall.id, subscriptionId: s.id },
        data: { status: "sent", sentAt: new Date() }
      });
      notifications.push({
        recipient: s.value, gtin, lot, status: "sent"
      });
    }
  }

  const csv = toCSV(notifications);
  // For demo: include CSV in response
  return new NextResponse(csv, {
    status: 200,
    headers: { "content-type": "text/csv; charset=utf-8",
               "content-disposition": `attachment; filename="recall-${recall.id}.csv"` }
  });
}
```

---

## 6) Lot page (server component)

**src/app/lot/\[gtin]/\[lot]/page.tsx**

```tsx
import { prisma } from "@/lib/db";
import { computeFreshScore } from "@/lib/freshscore";
import SubscribeForm from "@/components/SubscribeForm";
import Timeline from "@/components/Timeline";
import Gauge from "@/components/Gauge";

export default async function LotPage({ params }: { params: { gtin: string; lot: string } }) {
  const lot = await prisma.lot.findUnique({
    where: { gtin_lot: { gtin: params.gtin, lot: params.lot } },
    include: { product: true, events: { orderBy: { time: "asc" } } }
  });

  if (!lot) return <div className="p-6">Lot not found.</div>;

  const events = lot.events.map(e => ({ t: e.time.toISOString(), tempC: e.tempC ?? undefined }));
  const score = computeFreshScore(events);
  const bestWithinDays = Math.max(0, Math.round((score.value / 100) * 14)); // rough display

  return (
    <main className="max-w-xl p-6 mx-auto">
      <h1 className="text-xl font-semibold">{lot.product?.name ?? "Product"} — Lot {lot.lot}</h1>
      <p className="text-sm text-gray-600">Expiry: {lot.expiry.toISOString().slice(0,10)}</p>
      <div className="my-4"><Gauge value={score.value} band={score.band} /></div>
      <p className="mb-2"><strong>Best within:</strong> {bestWithinDays} days</p>
      <ul className="text-sm text-gray-700 mb-4">
        {score.reasons.map((r, i) => <li key={i}>• {r}</li>)}
      </ul>

      <h2 className="font-semibold mt-4 mb-2">Journey</h2>
      <Timeline events={lot.events} />

      <div className="mt-6 p-4 border rounded">
        <h3 className="font-semibold mb-2">Get recall alerts for this lot</h3>
        <SubscribeForm gtin={lot.gtin} lot={lot.lot} />
        <p className="text-xs text-gray-500 mt-2">
          This augments but does not replace package labeling. Safe handling always applies.
        </p>
      </div>
    </main>
  );
}
```

**src/components/SubscribeForm.tsx**

```tsx
"use client";
import { useState } from "react";

export default function SubscribeForm({ gtin, lot }: { gtin: string; lot: string }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/recall/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ gtin, lot, channel: "email", value: email })
    });
    const data = await res.json();
    setMsg(res.ok ? "Check your email to confirm." : (data.error || "Error"));
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input className="border px-2 py-1 flex-1" type="email" required
             placeholder="you@example.com" value={email}
             onChange={e => setEmail(e.target.value)} />
      <button className="border px-3 py-1" type="submit">Subscribe</button>
      {msg && <span className="text-sm ml-2">{msg}</span>}
    </form>
  );
}
```

*(Gauge/Timeline can be simple divs with CSS bars or minimal SVG—keep it lightweight.)*

---

## 7) Seed data (4 lots, varied temperatures)

**prisma/seed.ts**

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  await prisma.product.upsert({
    where: { gtin: "09506000134352" },
    update: {},
    create: { gtin: "09506000134352", name: "Chicken Breast 500g", brand: "Lusiaves" }
  });

  const lots = [
    { lot: "LUS23A45", expiry: "2025-10-01", profile: "green" },
    { lot: "LUS23B10", expiry: "2025-10-02", profile: "green" },
    { lot: "LUS23C77", expiry: "2025-09-28", profile: "amber" },
    { lot: "LUS23D12", expiry: "2025-09-26", profile: "red" }
  ];

  for (const l of lots) {
    const lot = await prisma.lot.upsert({
      where: { gtin_lot: { gtin: "09506000134352", lot: l.lot } },
      update: {},
      create: {
        gtin: "09506000134352",
        lot: l.lot,
        expiry: new Date(l.expiry),
        origin: "Leiria",
        plant: "Valado dos Frades"
      }
    });

    const base = new Date("2025-09-10T07:00:00Z").getTime();
    const events = [];
    const push = (h: number, temp: number) =>
      events.push({ time: new Date(base + h * 3600e3), tempC: temp });

    // Simple profiles: keep green at ~3-5°C; amber: short 9°C spike; red: prolonged >8°C
    if (l.profile === "green") {
      push(0, 3.5); push(6, 4.2); push(20, 3.8); push(48, 4.0); push(72, 3.6);
    } else if (l.profile === "amber") {
      push(0, 4.0); push(6, 9.2); push(9, 4.5); push(30, 4.1); push(60, 4.0);
    } else { // red
      push(0, 7.5); push(8, 8.2); push(20, 8.5); push(36, 7.8); push(60, 7.2);
    }

    // Convert to ObjectEvent steps
    let site = "DC-Porto";
    for (let i = 0; i < events.length; i++) {
      await prisma.epcisEvent.create({
        data: {
          lotId: lot.id,
          time: events[i].time,
          step: i === 0 ? "shipping" : i === events.length - 1 ? "receiving" : "observe",
          site, tempC: events[i].tempC
        }
      });
      if (i === Math.floor(events.length / 2)) site = "Retail-Norte";
    }
  }

  console.log("Seeded lots & events.");
}

run().finally(() => prisma.$disconnect());
```

**Run:** `npx prisma db seed`

---

## 8) Env & scripts

**.env.local**

```
ADMIN_TOKEN=dev-secret
```

**package.json (scripts)**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "prisma:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force && prisma db seed"
  }
}
```

---

## 9) Manual test plan (quick)

1. **Resolver:** open
   `/api/resolve/01/09506000134352/10/LUS23A45/17/251001` → redirected to `/lot/09506000134352/LUS23A45`.
2. **Lot page:** See FreshScore + “reasons” + timeline.
3. **Subscribe:** Enter email → console shows verification email with link → open link → `/api/recall/verify?token=...` → status confirmed.
4. **Recall:** `curl -X POST /api/admin/recall -H 'x-admin-token: dev-secret' -d '{...}'` → response downloads CSV; console shows “MAIL\_OUT” only for confirmed subscriber on that lot.
5. **Unsubscribe:** GET `/api/unsubscribe/{token}` → recall again → no mail.

---

## 10) Weekend checklist

* [ ] Scaffold Next.js + Prisma + seed data
* [ ] Implement FreshScore + unit tests for 3 profiles (green/amber/red)
* [ ] Resolver route
* [ ] Lot page (Gauge, Timeline, Subscribe)
* [ ] Subscribe + Verify + Unsubscribe
* [ ] Admin Recall (secret header) + CSV audit
* [ ] Smoke tests + demo script

---