import type { TierFacts, TierId } from './types'

/* ============================================================================
   CASE FACTS — everything in this file is stated in the case packet.
   Nothing here is estimated, extrapolated or assumed. Values that the packet
   does not contain are represented as `null` and render as "Data Needed".
   ========================================================================== */

export const COMPANY = {
  totalArr: 35_000_000,
  revenueGrowthYoY: 0.38,
  /** Cloud infrastructure spend growth last year. Grew ~2x faster than revenue. */
  cloudCostGrowthYoY: 0.72,
  engineering: {
    backend: 28,
    frontend: 12,
    sre: 4,
    get total() {
      return this.backend + this.frontend + this.sre
    },
  },
  /** Explicitly unavailable per the CFO. */
  grossMarginByTier: null,
} as const

export const TIERS: Record<TierId, TierFacts> = {
  t1: {
    id: 't1',
    ordinal: 1,
    name: 'Tier 1',
    segment: 'High-Volume Enterprise',
    productName: 'Core API Engine',
    role: 'PROTECT',
    roleLine: 'Revenue engine. Fund protection and de-risking; single-tenancy currently limits engineering leverage.',
    architecture: 'Single-tenant, isolated',
    accountUnit: 'customers',
    accounts: 18,
    arr: 22_000_000,
    statedAvgArr: 1_220_000,
    nrr: 1.14,
    availability: 99.95,
    logoChurn: null, // not stated in the packet
    hostingPerAccount: 180_000,
    hostingTotal: 3_240_000,
    scalability: 'Low current engineering leverage',
    constraint: 'Bespoke engineering / legacy architecture',
    recommendedAllocation: 30,
    accent: 'var(--t1)',
    accentSoft: 'var(--t1-soft)',
    ink: 'var(--t1-ink)',
    onAccent: 'var(--on-t1)',
  },
  t2: {
    id: 't2',
    ordinal: 2,
    name: 'Tier 2',
    segment: 'High-Growth Mid-Market',
    productName: 'Multi-Tenant Platform',
    role: 'SCALE',
    roleLine: 'One platform fix reaches every current and future customer.',
    architecture: 'Shared multi-tenant',
    accountUnit: 'customers',
    accounts: 140,
    arr: 11_000_000,
    statedAvgArr: 78_000,
    nrr: 1.06,
    availability: 98.2,
    logoChurn: 0.16,
    hostingPerAccount: 4_000,
    hostingTotal: 560_000,
    scalability: 'High potential engineering leverage',
    constraint: 'Reliability / peak-hour rate limiting',
    recommendedAllocation: 55,
    accent: 'var(--t2)',
    accentSoft: 'var(--t2-soft)',
    ink: 'var(--t2-ink)',
    onAccent: 'var(--on-t2)',
  },
  t3: {
    id: 't3',
    ordinal: 3,
    name: 'Tier 3',
    segment: 'Self-Serve / Developer Sandbox',
    productName: 'PLG Channel',
    role: 'ACQUIRE',
    roleLine: 'Possible acquisition engine being read as an infrastructure problem.',
    accountUnit: 'active API keys',
    architecture: 'Serverless',
    accounts: 1_200,
    arr: 2_000_000,
    statedAvgArr: 1_600,
    nrr: 0.74,
    availability: null, // not stated in the packet
    logoChurn: 0.42,
    hostingPerAccount: null, // described as "negligible" — never measured
    hostingTotal: null,
    scalability: 'High acquisition scalability once controlled',
    constraint: 'Guardrails / abuse / alert burden',
    recommendedAllocation: 15,
    accent: 'var(--t3)',
    accentSoft: 'var(--t3-soft)',
    ink: 'var(--t3-ink)',
    onAccent: 'var(--on-t3)',
  },
}

export const TIER_LIST: TierFacts[] = [TIERS.t1, TIERS.t2, TIERS.t3]

/** Tier-specific operating facts that do not fit the common scorecard shape. */
export const TIER_DETAIL = {
  t1: {
    deploymentDays: 18,
    /** Last two quarters. */
    velocityShare: 0.68,
    velocityAccounts: 3,
    databaseNote: 'Legacy immutable database framework',
    contributionMargin: null as number | null, // fully loaded cost never assembled
  },
  t2: {
    peakWindow: '9:00–11:00 AM EST',
    failureMode: 'Cascading timeout errors across the shared cluster',
  },
  t3: {
    alertShare: 0.52,
    knownTier2Graduates: 22,
    launchedMonthsAgo: 14,
    dedicatedInfraBudget: false,
    alertDrivers: [
      'Poorly written loops',
      'Abusive configurations',
      'Runaway scripts',
      'Weak trial-tier rate limiting',
    ],
    docsQuality: 'Poor documentation',
    /** Denominator is unknown: historical signup cohorts were never captured. */
    historicalCohortSize: null as number | null,
  },
} as const

/** Total hosting the packet actually states. Tier 3 is NOT zero — it is unmeasured. */
export const STATED_HOSTING_TOTAL = 3_240_000 + 560_000 // $3.8M

/** Positions in the room. Shown so the dashboard argues against them explicitly. */
export const EXEC_POSITIONS = [
  {
    who: 'CEO',
    position: 'Shift engineering toward Tier 1 — it holds the largest ARR.',
    tension: 'Largest ARR does not by itself establish the best return on the next engineering dollar.',
  },
  {
    who: 'VP Product',
    position: 'Tier 2 could scale materially if rate limiting is fixed.',
    tension: 'Directionally backed here, but reliability → retention remains a hypothesis.',
  },
  {
    who: 'SRE Lead',
    position: 'Kill or heavily restrict Tier 3 because of alert burden.',
    tension: 'Alert burden is a missing control, not proof the channel is worthless.',
  },
  {
    who: 'CFO',
    position: 'Gross margin by tier is currently unavailable.',
    tension: 'Every profitability claim in this packet is therefore unresolved.',
  },
] as const
