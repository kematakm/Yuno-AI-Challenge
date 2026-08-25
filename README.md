# Engineering Capital Allocation — Board Dashboard

Interactive, executive-facing dashboard and scenario calculator supporting a recommendation on
where next year's engineering and product investment goes across three customer/product tiers.

**Thesis:** Protect Tier 1. Fix and scale Tier 2. Automate and instrument Tier 3.
**Recommended allocation:** Tier 1 Enterprise 30% · Tier 2 Mid-Market 55% · Tier 3 Self-Serve 15%.

## Run it

```bash
cd dashboard
npm install
npm run dev          # http://localhost:5173
npm run build        # multi-asset bundle in dashboard/dist
npm run build:single # one self-contained HTML file in dashboard/dist-single
```

## What it answers

1. Where is the money today?
2. What does that revenue actually cost us?
3. Where are engineering and operational resources getting trapped?
4. Which tier offers the strongest repeatable, scalable long-term value?
5. Where should the next engineering dollar go — and what evidence would change that?

## Data integrity

Every figure on the page carries one of five provenance tags — **Case fact**, **Derived**,
**External benchmark**, **Your assumption**, **Calculated** — or renders as **Data Needed**.
The dashboard never fills an unmeasured company figure with an estimate, never presents an
external benchmark as an internal fact, and labels every scenario output as illustrative,
modelled or a ceiling. See [`dashboard/README.md`](dashboard/README.md) for the full rule set
and the formula reference.

## Contents

- [`dashboard/`](dashboard) — the React + TypeScript + Tailwind + Recharts dashboard (this is the deliverable).
- [`docs/engineering-capital-allocation.md`](docs/engineering-capital-allocation.md) — the written
  recommendation memo prepared for Board review. Source of record for the narrative.
- `docs/engineering-capital-allocation.html` — the same memo as a self-contained page for circulation.
