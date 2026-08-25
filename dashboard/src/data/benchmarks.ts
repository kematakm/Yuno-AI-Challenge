/* ============================================================================
   EXTERNAL BENCHMARKS — researched separately. These are NOT company facts and
   are never used to impute a company-specific value. They exist only to give a
   board reader a reference band next to an internal number.
   ========================================================================== */

export interface BenchmarkBand {
  id: string
  label: string
  /** Lower / upper bound of the "healthy" band, in the metric's own units. */
  low: number
  high: number
  /** Optional stretch bound (e.g. "7–10% is strong" for PLG conversion). */
  strongLow?: number
  strongHigh?: number
  unit: '%' | 'pct-points' | 'availability'
  note: string
  /** true = higher is better (NRR); false = lower is better (churn, COGS). */
  higherIsBetter: boolean
}

export const BENCHMARKS = {
  grossMarginMultiTenant: {
    id: 'gm-mt',
    label: 'Multi-tenant B2B SaaS gross margin',
    low: 75,
    high: 85,
    unit: '%',
    note: 'Directional range. Gross margin, not contribution margin.',
    higherIsBetter: true,
  },
  grossMarginSingleTenant: {
    id: 'gm-st',
    label: 'Single-tenant enterprise software gross margin',
    low: 60,
    high: 75,
    unit: '%',
    note: 'Directional range. Gross margin, not contribution margin.',
    higherIsBetter: true,
  },
  cogsMultiTenant: {
    id: 'cogs-mt',
    label: 'Multi-tenant infrastructure / COGS as % of revenue',
    low: 10,
    high: 25,
    unit: '%',
    note: 'Directional range for shared-architecture SaaS.',
    higherIsBetter: false,
  },
  cogsSingleTenant: {
    id: 'cogs-st',
    label: 'Single-tenant infrastructure / delivery as % of revenue',
    low: 25,
    high: 40,
    unit: '%',
    note: 'Directional range for isolated-architecture delivery.',
    higherIsBetter: false,
  },
  midMarketLogoChurn: {
    id: 'churn',
    label: 'Healthy annual mid-market logo churn',
    low: 5,
    high: 10,
    strongLow: 10,
    strongHigh: 12,
    unit: '%',
    note: 'Some benchmark ranges extend toward 12%. Lower is better.',
    higherIsBetter: false,
  },
  nrr: {
    id: 'nrr',
    label: 'Healthy net revenue retention',
    low: 100,
    high: 105,
    strongLow: 105,
    strongHigh: 110,
    unit: '%',
    note: 'Above 100% is healthy; ~105%+ strong; 110%+ stronger.',
    higherIsBetter: true,
  },
  plgConversion: {
    id: 'plg',
    label: 'Free developer / API sandbox → paid conversion',
    low: 2,
    high: 6,
    strongLow: 7,
    strongHigh: 10,
    unit: '%',
    note: 'Typical 2–6%; 7–10% can be strong. Requires a cohort denominator to compare.',
    higherIsBetter: true,
  },
} as const satisfies Record<string, BenchmarkBand>

/** Availability reference points, with annual downtime pre-computed for the axis. */
export const AVAILABILITY_REFERENCE = [
  { label: 'Mission-critical', availability: 99.99, tone: 'good' as const },
  { label: 'Stronger', availability: 99.95, tone: 'good' as const },
  { label: 'Common production SaaS/API baseline', availability: 99.9, tone: 'good' as const },
]

export const AVAILABILITY_BASELINE = 99.9

/* --------------------------------------------------------------------------
   Benchmark verdicts. A colour is only assigned where a published range
   exists — never on judgement alone.
   ------------------------------------------------------------------------ */

export type Verdict = { status: 'good' | 'watch' | 'bad'; text: string }

/** Availability vs the ~99.9% production baseline. */
export function availabilityVerdict(availability: number): Verdict {
  if (availability >= 99.95) return { status: 'good', text: 'At or above "stronger" (99.95%)' }
  if (availability >= 99.9) return { status: 'good', text: 'At production baseline (99.9%)' }
  if (availability >= 99.5) return { status: 'watch', text: 'Below the 99.9% baseline' }
  return { status: 'bad', text: 'Materially below the 99.9% baseline' }
}

/** Logo churn vs the 5–10% healthy band (some ranges extend to 12%). */
export function churnVerdict(churnPct: number): Verdict {
  if (churnPct <= 10) return { status: 'good', text: 'Inside the 5–10% healthy band' }
  if (churnPct <= 12) return { status: 'watch', text: 'At the outer edge of benchmark (≤12%)' }
  return { status: 'bad', text: 'Above the healthy band (5–10%, outer edge 12%)' }
}

/** NRR vs the >100% / 105%+ / 110%+ ladder. */
export function nrrVerdict(nrrPct: number): Verdict {
  if (nrrPct >= 110) return { status: 'good', text: 'Strong (110%+)' }
  if (nrrPct >= 105) return { status: 'good', text: 'Healthy / strong (105%+)' }
  if (nrrPct > 100) return { status: 'watch', text: 'Above 100%, below the 105% strong mark' }
  return { status: 'bad', text: 'Below 100% — contraction' }
}

/** Infrastructure cost as % of ARR, judged against the matching architecture band. */
export function cogsVerdict(pct: number, architecture: 'multi' | 'single'): Verdict {
  const band = architecture === 'multi' ? BENCHMARKS.cogsMultiTenant : BENCHMARKS.cogsSingleTenant
  if (pct <= band.low) return { status: 'good', text: `Below the ${band.low}–${band.high}% band` }
  if (pct <= band.high) return { status: 'watch', text: `Inside the ${band.low}–${band.high}% band` }
  return { status: 'bad', text: `Above the ${band.low}–${band.high}% band` }
}
