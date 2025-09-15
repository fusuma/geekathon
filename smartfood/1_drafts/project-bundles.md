# Project Bundles - Pick‑and‑Package Options

## Quality Bundle
**Narrative:** "Fewer recalls, faster trace."

### Components
1. **DateCode Checker Lite** - Validate expiry/lot codes against SKU rules
2. **Spec Mismatch Finder** - Compare ERP vs. label specs
3. **Lot Linker Lite** - Map inbound to finished lots for traceability

## Operations Bundle
**Narrative:** "More throughput by fixing the basics."

### Components
1. **Changeover Stopwatch** - Track changeover time by reason with Pareto
2. **Order‑Mix Simplifier** - Reorder to minimize changeovers
3. **Micro‑Stop Logger** - Track station micro-stops with easy buttons

## Sustainability Bundle
**Narrative:** "Lower cost, lower footprint, same output."

### Components
1. **Peak‑kWh Nudge** - Move tasks out of peak energy windows
2. **Smart Hose Watch** - Log washdown usage by area
3. **Yield‑Water Board** - Correlate process yield with water usage

## Top 3 for Fastest "Wow Per Hour"
1. **DateCode Checker Lite** – Dead simple, high impact, great demo
2. **Changeover Stopwatch + Pareto** – Classic, clean visuals, business value
3. **Lot Linker Lite** – Makes traceability tangible in minutes

## Shared Building Blocks

### Specs JSON Example
```json
{
  "sku": "CH-BON-500",
  "date_code_regex": "^[0-9]{6}$",
  "shelf_life_days": 14,
  "allergens": ["SOY", "WHEAT"],
  "lot_prefix": "LUS"
}
```

### Downtime Reasons CSV
```
code,name
CHG,Changeover
CLN,Cleanup
JAM,Jam
MAT,Material Wait
ENG,Engineering
```