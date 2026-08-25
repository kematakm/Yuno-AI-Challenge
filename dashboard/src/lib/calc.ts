import { COMPANY, TIERS, TIER_DETAIL, STATED_HOSTING_TOTAL } from '@/data/caseFacts'
import type { TierId } from '@/data/types'

/* ============================================================================
   All formulas live here so they are auditable in one place. Every function is
   pure. Nothing in this file invents a company figure: functions that depend on
   an unmeasured input return `null` and the UI renders "Data Needed".
   ========================================================================== */

export const HOURS_PER_YEAR = 8_760 // 365 × 24

/* --------------------------------------------------------------------------
   Availability
   ------------------------------------------------------------------------ */

/**
 * Annual downtime implied by an availability percentage.
 *   downtime = (1 − availability/100) × 8,760
 * Sanity: 98.2% → 157.68 hrs · 99.9% → 8.76 hrs · 99.95% → 4.38 hrs · 99.99% → 0.88 hrs
 */
export function downtimeHours(availabilityPct: number): number {
  return (1 - availabilityPct / 100) * HOURS_PER_YEAR
}

/* --------------------------------------------------------------------------
   Tier arithmetic on case facts only (no assumptions -> provenance "derived")
   ------------------------------------------------------------------------ */

/** ARR ÷ account count. Tier 3's denominator is API keys, not customers. */
export function derivedAvgArr(tierId: TierId): number {
  const t = TIERS[tierId]
  return t.arr / t.accounts
}

/** Stated hosting as a share of the tier's ARR. Null where hosting is unmeasured. */
export function hostingPctOfArr(tierId: TierId): number | null {
  const t = TIERS[tierId]
  if (t.hostingTotal === null) return null
  return (t.hostingTotal / t.arr) * 100
}

/** Share of company ARR held by a tier. */
export function arrShare(tierId: TierId): number {
  return (TIERS[tierId].arr / COMPANY.totalArr) * 100
}

/** Share of *stated* hosting spend. Tier 3 is excluded because it is unmeasured. */
export function statedHostingShare(tierId: TierId): number | null {
  const h = TIERS[tierId].hostingTotal
  if (h === null) return null
  return (h / STATED_HOSTING_TOTAL) * 100
}

/** Stated hosting across the company as a share of total ARR. Excludes Tier 3. */
export function statedHostingPctOfCompanyArr(): number {
  return (STATED_HOSTING_TOTAL / COMPANY.totalArr) * 100
}

/**
 * The share of the CURRENT Tier-2 base that originated in Tier 3.
 * 22 / 140 ≈ 15.7%. This is explicitly NOT a conversion rate: the denominator
 * is today's customer base, not a historical signup cohort.
 */
export function tier3OriginShareOfTier2Base(): number {
  return (TIER_DETAIL.t3.knownTier2Graduates / TIERS.t2.accounts) * 100
}

/* --------------------------------------------------------------------------
   A. Engineering allocation
   ------------------------------------------------------------------------ */

/**
 * Scenario-equivalent headcount for an allocation percentage.
 * This is a proportional translation only — it does not assume roles are
 * interchangeable and it is not a staffing assignment.
 */
export function allocationToFte(allocationPct: number, poolHeadcount: number): number {
  return (allocationPct / 100) * poolHeadcount
}

export function allocationTotal(a: Record<TierId, number>): number {
  return a.t1 + a.t2 + a.t3
}

/** Delta of a working allocation against the recommendation, in points. */
export function allocationDelta(
  working: Record<TierId, number>,
  baseline: Record<TierId, number>,
): Record<TierId, number> {
  return { t1: working.t1 - baseline.t1, t2: working.t2 - baseline.t2, t3: working.t3 - baseline.t3 }
}

/* --------------------------------------------------------------------------
   B. Tier 1 fully loaded contribution margin
   ------------------------------------------------------------------------ */

export const TIER1_COST_CATEGORIES = [
  { key: 'engineering', label: 'Engineering (custom patching + feature)', hint: 'Loaded cost of engineers working on Tier-1 accounts' },
  { key: 'sre', label: 'SRE / operations', hint: 'On-call, capacity, incident response attributable to Tier 1' },
  { key: 'support', label: 'Support', hint: 'Named support, escalation, TAM coverage' },
  { key: 'implementation', label: 'Implementation / onboarding', hint: 'Delivery cost amortised across the contract term' },
  { key: 'qa', label: 'QA / testing', hint: 'Including the 18-day deployment clearance cycle' },
  { key: 'other', label: 'Other delivery cost', hint: 'Security review, compliance, dedicated environments' },
] as const

export type Tier1CostKey = (typeof TIER1_COST_CATEGORIES)[number]['key']
export type Tier1Costs = Record<Tier1CostKey, number | null>

export interface Tier1MarginResult {
  arr: number
  hosting: number
  /** Sum of the cost categories the user has actually entered. */
  enteredCost: number
  /** hosting + entered categories. Incomplete until every category has a value. */
  fullyLoadedCost: number
  contributionMargin: number
  contributionMarginPct: number
  marginPerCustomer: number
  engineeringPctOfArr: number | null
  /** Labels of categories still blank. */
  missing: string[]
  complete: boolean
  /**
   * When categories are missing the computed margin is an UPPER BOUND: every
   * unentered cost can only reduce it. The UI must label it as a ceiling.
   */
  isCeiling: boolean
}

/**
 * Fully loaded cost  = hosting (case fact) + every entered cost category
 * Contribution margin = ARR − fully loaded cost
 * Margin %            = contribution margin ÷ ARR
 *
 * Contribution margin here is NOT GAAP gross margin: the categories included
 * are delivery and engineering cost attributable to the tier, which is a
 * different basis from cost of revenue.
 */
export function tier1Margin(costs: Tier1Costs): Tier1MarginResult {
  const arr = TIERS.t1.arr
  const hosting = TIERS.t1.hostingTotal ?? 0

  const missing = TIER1_COST_CATEGORIES.filter((c) => costs[c.key] === null).map((c) => c.label)
  const enteredCost = TIER1_COST_CATEGORIES.reduce((sum, c) => sum + (costs[c.key] ?? 0), 0)

  const fullyLoadedCost = hosting + enteredCost
  const contributionMargin = arr - fullyLoadedCost

  return {
    arr,
    hosting,
    enteredCost,
    fullyLoadedCost,
    contributionMargin,
    contributionMarginPct: (contributionMargin / arr) * 100,
    marginPerCustomer: contributionMargin / TIERS.t1.accounts,
    engineeringPctOfArr: costs.engineering === null ? null : (costs.engineering / arr) * 100,
    missing,
    complete: missing.length === 0,
    isCeiling: missing.length > 0,
  }
}

/* --------------------------------------------------------------------------
   C. Tier 2 reliability / retention
   ------------------------------------------------------------------------ */

export interface Tier2Inputs {
  targetChurnPct: number
  targetAvailabilityPct: number
  /** Absolute customer count modelled for the coming year. */
  projectedCustomers: number
  /** Growth applied to per-customer infrastructure cost. */
  infraCostGrowthPct: number
  additionalEngInvestment: number | null
  /** Average ARR used for the illustrative conversion. Defaults to ARR ÷ customers. */
  avgArr: number
}

export interface Tier2Result {
  baseCustomers: number
  projectedCustomers: number
  currentChurnPct: number
  currentLogosLost: number
  targetLogosLost: number
  logosRetained: number
  arrProtected: number
  /** Same math run on the projected base, so growth compounds the retention gain. */
  projectedLogosRetained: number
  projectedArrProtected: number
  currentDowntime: number
  targetDowntime: number
  downtimeEliminated: number
  currentHostingPerCustomer: number
  projectedHostingPerCustomer: number
  projectedHostingTotal: number
  currentHostingTotal: number
  currentHostingPctOfArr: number
  /** Infrastructure as a share of projected ARR. The leverage test. */
  projectedHostingPctOfArr: number
  projectedArr: number
  /** Illustrative ARR protected ÷ additional engineering investment. */
  returnMultiple: number | null
}

/**
 * Retention math is expected-value math on logo counts:
 *   logos lost      = customers × churn rate
 *   logos retained  = customers × (current churn − target churn)
 *   ARR protected   = logos retained × average ARR
 *
 * "Logos retained" is a fractional expectation, not a countable list of saved
 * customers, and the ARR figure inherits the average-ARR assumption. Both are
 * illustrative.
 *
 * This calculator does NOT assert that improving availability causes the target
 * churn. The link between reliability and retention is an untested hypothesis.
 */
export function tier2Reliability(inputs: Tier2Inputs): Tier2Result {
  const t = TIERS.t2
  const baseCustomers = t.accounts
  const currentChurnPct = (t.logoChurn ?? 0) * 100
  const projectedCustomers = Math.max(0, inputs.projectedCustomers)

  const currentLogosLost = baseCustomers * (currentChurnPct / 100)
  const targetLogosLost = baseCustomers * (inputs.targetChurnPct / 100)
  const logosRetained = currentLogosLost - targetLogosLost

  const churnDelta = (currentChurnPct - inputs.targetChurnPct) / 100
  const projectedLogosRetained = projectedCustomers * churnDelta

  const projectedArr = inputs.avgArr * projectedCustomers
  const currentHostingPerCustomer = t.hostingPerAccount ?? 0
  const projectedHostingPerCustomer = currentHostingPerCustomer * (1 + inputs.infraCostGrowthPct / 100)

  return {
    baseCustomers,
    projectedCustomers,
    currentChurnPct,
    currentLogosLost,
    targetLogosLost,
    logosRetained,
    arrProtected: logosRetained * inputs.avgArr,
    projectedLogosRetained,
    projectedArrProtected: projectedLogosRetained * inputs.avgArr,
    currentDowntime: downtimeHours(t.availability ?? 0),
    targetDowntime: downtimeHours(inputs.targetAvailabilityPct),
    downtimeEliminated: downtimeHours(t.availability ?? 0) - downtimeHours(inputs.targetAvailabilityPct),
    currentHostingPerCustomer,
    projectedHostingPerCustomer,
    currentHostingTotal: t.hostingTotal ?? 0,
    currentHostingPctOfArr: ((t.hostingTotal ?? 0) / t.arr) * 100,
    // Linear scaling assumption: per-customer cost held flat on a cluster that
    // already fails at peak. Treat this as a floor, not an estimate.
    projectedHostingTotal: projectedHostingPerCustomer * projectedCustomers,
    projectedArr,
    projectedHostingPctOfArr:
      projectedArr > 0 ? ((projectedHostingPerCustomer * projectedCustomers) / projectedArr) * 100 : 0,
    returnMultiple:
      inputs.additionalEngInvestment && inputs.additionalEngInvestment > 0
        ? (logosRetained * inputs.avgArr) / inputs.additionalEngInvestment
        : null,
  }
}

/* --------------------------------------------------------------------------
   D. Tier 3 funnel / SRE burden
   ------------------------------------------------------------------------ */

export interface Tier3Inputs {
  /** Historical eligible sandbox cohort. Unknown today — must stay blank until measured. */
  historicalCohortSize: number | null
  /**
   * Measured total graduates, once the cohort work produces one. Falls back to the
   * packet's 22 still-active graduates, which is a floor rather than a total.
   */
  actualGraduates: number | null
  /** Forward-looking conversion assumption for the modelled ARR scenario. */
  modelledConversionPct: number | null
  targetAlertReductionPct: number
  avgArrAfterGraduation: number
  /** Downstream retention of Tier-3-originated customers. Unknown today. */
  downstreamNrrPct: number | null
  /** Total automated alert volume per month. Unknown today — only the 52% share is stated. */
  totalMonthlyAlerts: number | null
  sreHoursPerAlert: number | null
  sreCostPerHour: number | null
}

export interface Tier3Result {
  knownGraduates: number
  /** The numerator actually used: the measured count if entered, else the packet's 22. */
  graduatesUsed: number
  graduatesAreFloor: boolean
  activeKeys: number
  /** 22 ÷ historical cohort. A LOWER BOUND: churned graduates are not in the 22. */
  observedConversionPct: number | null
  modelledGraduates: number | null
  modelledDownstreamArr: number | null
  currentAlertShare: number
  /** Tier-3 share of a smaller total after the reduction. Not 52% × (1−r). */
  postFixAlertShare: number
  currentTier3Alerts: number | null
  postFixTier3Alerts: number | null
  alertsEliminated: number | null
  sreHoursReclaimedAnnual: number | null
  sreCostReclaimedAnnual: number | null
}

/**
 * Conversion:
 *   observed conversion = known graduates ÷ historical eligible cohort
 * The numerator counts only Tier-3-originated customers who are STILL in Tier 2,
 * so the result is a lower bound on true historical conversion.
 *
 * Alert share after a reduction:
 *   tier3' = 0.52 × (1 − r)      other = 0.48 (unchanged)
 *   share' = 0.52(1−r) ÷ (1 − 0.52r)
 * The denominator shrinks with the reduction, so the post-fix share is higher
 * than a naive 52% × (1 − r).
 */
export function tier3Funnel(inputs: Tier3Inputs): Tier3Result {
  const knownGraduates = TIER_DETAIL.t3.knownTier2Graduates
  const activeKeys = TIERS.t3.accounts
  const currentAlertShare = TIER_DETAIL.t3.alertShare

  const cohort = inputs.historicalCohortSize
  const graduatesUsed = inputs.actualGraduates ?? knownGraduates
  const graduatesAreFloor = inputs.actualGraduates === null
  const observedConversionPct = cohort && cohort > 0 ? (graduatesUsed / cohort) * 100 : null

  const modelledGraduates =
    cohort && cohort > 0 && inputs.modelledConversionPct !== null
      ? cohort * (inputs.modelledConversionPct / 100)
      : null

  const r = inputs.targetAlertReductionPct / 100
  const postFixAlertShare = (currentAlertShare * (1 - r)) / (1 - currentAlertShare * r)

  const currentTier3Alerts =
    inputs.totalMonthlyAlerts !== null ? inputs.totalMonthlyAlerts * currentAlertShare : null
  const postFixTier3Alerts = currentTier3Alerts !== null ? currentTier3Alerts * (1 - r) : null
  const alertsEliminated =
    currentTier3Alerts !== null && postFixTier3Alerts !== null
      ? currentTier3Alerts - postFixTier3Alerts
      : null

  const sreHoursReclaimedAnnual =
    alertsEliminated !== null && inputs.sreHoursPerAlert !== null
      ? alertsEliminated * inputs.sreHoursPerAlert * 12
      : null

  return {
    knownGraduates,
    graduatesUsed,
    graduatesAreFloor,
    activeKeys,
    observedConversionPct,
    modelledGraduates,
    modelledDownstreamArr:
      modelledGraduates !== null ? modelledGraduates * inputs.avgArrAfterGraduation : null,
    currentAlertShare: currentAlertShare * 100,
    postFixAlertShare: postFixAlertShare * 100,
    currentTier3Alerts,
    postFixTier3Alerts,
    alertsEliminated,
    sreHoursReclaimedAnnual,
    sreCostReclaimedAnnual:
      sreHoursReclaimedAnnual !== null && inputs.sreCostPerHour !== null
        ? sreHoursReclaimedAnnual * inputs.sreCostPerHour
        : null,
  }
}

/** SRE capacity expressed as a share of the 4-person infrastructure team. */
export function sreFteEquivalent(annualHours: number): number {
  // 2,080 hours = one full-time year.
  return annualHours / 2_080
}
