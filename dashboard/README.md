# Dashboard

React 19 · TypeScript · Tailwind CSS 4 · Recharts 3 · Vite.

```bash
npm install
npm run dev           # dev server
npm run build         # typecheck + production bundle -> dist/
npm run build:single  # single self-contained HTML file -> dist-single/
npm run lint          # oxlint
```

## Structure

```
src/
  data/          Centralised constants. No component hardcodes a figure.
    caseFacts.ts     Everything stated in the case packet. Unmeasured values are `null`.
    benchmarks.ts    External benchmark ranges + the verdict functions that use them.
    allocation.ts    Recommended 30/55/15 split, thesis copy, staffing pools.
    decisionGates.ts Decision gates, their instruments, and pre-committed responses.
    narrative.ts     Section copy: leverage cards, framework, GTM matrix, 90-day plan.
  lib/
    calc.ts        Every formula, pure and commented. Returns `null` where data is missing.
    format.ts      Currency, percentage, hours and FTE formatting.
    validation.ts  Input parsing and range specs (no negative ARR, no >100% availability, …).
  hooks/
    useAllocation.ts     Allocation state, locking, auto-rebalance, largest-remainder rounding.
    useNumericFields.ts  Raw-text-backed assumption inputs so "blank" stays a real state.
  components/
    ui/            Card, Section, Stat, Tag, Field, BenchmarkScale, ShareBar, Tooltip.
    charts/        Recharts wrappers: margin waterfall, downtime, alert volume.
    <section>.tsx  One file per dashboard section.
```

## Formula reference

All of these live in `src/lib/calc.ts`.

| Output | Formula |
|---|---|
| Annual downtime | `(1 − availability/100) × 8,760` |
| Derived average ARR | `tier ARR ÷ tier account count` |
| Hosting as % of ARR | `tier hosting ÷ tier ARR` |
| Scenario FTE | `(allocation % ÷ 100) × pool headcount` |
| Fully loaded cost (Tier 1) | `hosting + every entered cost category` |
| Contribution margin (Tier 1) | `ARR − fully loaded cost` |
| Logos lost | `customers × churn rate` |
| Additional logos retained | `customers × (current churn − target churn)` |
| Illustrative ARR protected | `additional logos retained × average ARR` |
| Observed Tier-3 conversion | `known graduates ÷ historical eligible cohort` (a lower bound) |
| Modelled downstream ARR | `cohort × modelled conversion × average Tier-2 ARR` |
| Post-fix alert share | `0.52(1 − r) ÷ (1 − 0.52r)` — the non-Tier-3 half does not shrink |
| SRE capacity reclaimed | `alerts eliminated × hours per alert × 12` |

## Data integrity rules enforced in code

1. No missing company data is invented. Unmeasured values render as **Data Needed**, never zero.
2. External benchmarks are labelled and never used to impute a company figure.
3. `22 ÷ 1,200` is never presented as a conversion rate.
4. `22 ÷ 140 ≈ 15.7%` is stated only as the share of the *current* Tier-2 base that originated in Tier 3.
5. Tier-2 reliability is labelled a hypothesis for Tier-2 churn, never a cause.
6. Tier 1 is not assumed unprofitable; the margin calculator returns a labelled **ceiling** until
   every cost category is entered.
7. Tier 2 is not assumed more profitable until fully loaded cost exists.
8. Tier 3 is not assumed to deserve permanent funding — a `LESS TIER 3` gate is on the page.
9. Calculated and observed values are visually distinguished by provenance tag everywhere.
10. Every scenario output is labelled Illustrative, Modelled, Scenario or Ceiling.

## Validation

Inputs reject negative money, churn or rates outside 0–100%, availability above 100%, and
non-integer counts. The allocation must total exactly 100%: auto-rebalance holds it there
(respecting per-tier locks), and with auto-rebalance off the panel shows a validation warning
plus a normalise action until it does.
