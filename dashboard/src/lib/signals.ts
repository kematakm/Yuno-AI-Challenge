import { BENCHMARKS } from '@/data/benchmarks'
import { TIERS } from '@/data/caseFacts'
import { sreFteEquivalent } from './calc'
import type { Scenario } from '@/hooks/useScenario'

/* ============================================================================
   Decision-gate signals.

   Each gate condition is evaluated against the scenario the user has entered.
   A condition returns one of four states, and the distinction matters:

     supports  — the modelled scenario argues FOR this direction
     weakens   — the modelled scenario argues AGAINST it
     awaiting  — the calculator could evaluate this, but the input is blank
     external  — the calculator cannot evaluate this at all; it needs evidence
                 the packet does not contain and no input would supply

   Nothing here observes reality. These are statements about a MODEL built from
   assumptions the reader typed, which is why every surfaced callout is labelled
   "modelled signal" rather than a finding.
   ========================================================================== */

export type SignalState = 'supports' | 'weakens' | 'awaiting' | 'external'

export interface Signal {
  state: SignalState
  /** Shown under the condition. Always names the number that produced the state. */
  detail: string
}

/**
 * Pre-committed decision thresholds. These are OUR decision rules, chosen in
 * advance so a result produces a decision rather than an argument about basis.
 * They are not external benchmarks and are not company measurements.
 */
export const SIGNAL_THRESHOLDS = {
  /** Fully loaded Tier-1 contribution margin considered strong. */
  t1MarginStrongPct: 60,
  /** Below this, Tier-1 economics are treated as deteriorating materially. */
  t1MarginWeakPct: 40,
  /** Engineering spend on Tier 1 above this share of its ARR is a dependency signal. */
  t1EngineeringHeavyPctOfArr: 25,
  t1EngineeringLightPctOfArr: 15,
  /** Availability target that counts as reaching the production baseline. */
  t2BaselineAvailability: 99.9,
  /** Infra cost per customer above this at scale breaks the leverage thesis. */
  t2InfraPerCustomerCeiling: 6_000,
  /** Customer count at which the cost curve has to be re-checked. */
  t2ScaleCheckpointCustomers: 200,
  /** Alert reduction that counts as materially lowering SRE burden. */
  t3AlertReductionMaterialPct: 60,
  t3AlertReductionWeakPct: 30,
} as const

const awaiting = (what: string): Signal => ({ state: 'awaiting', detail: `Enter ${what}.` })
const external = (what: string): Signal => ({
  state: 'external',
  detail: `Not modellable here — needs ${what}.`,
})

/* -------------------------------------------------------------------------- */

export function evaluateSignal(id: string, s: Scenario): Signal {
  switch (id) {
    /* ------------------------------ Tier 1 ------------------------------- */

    case 't1-margin-strong': {
      const r = s.t1.result
      if (r.isCeiling) {
        return awaiting(`all ${r.missing.length} remaining Tier-1 cost categories`)
      }
      const pct = r.contributionMarginPct
      if (pct >= SIGNAL_THRESHOLDS.t1MarginStrongPct) {
        return {
          state: 'supports',
          detail: `Modelled fully loaded margin ${pct.toFixed(1)}% — at or above the ${SIGNAL_THRESHOLDS.t1MarginStrongPct}% pre-committed threshold.`,
        }
      }
      if (pct < SIGNAL_THRESHOLDS.t1MarginWeakPct) {
        return {
          state: 'weakens',
          detail: `Modelled fully loaded margin ${pct.toFixed(1)}% — below the ${SIGNAL_THRESHOLDS.t1MarginWeakPct}% floor. Constrain customisation, reprice, or reduce allocation.`,
        }
      }
      return {
        state: 'weakens',
        detail: `Modelled fully loaded margin ${pct.toFixed(1)}% — short of the ${SIGNAL_THRESHOLDS.t1MarginStrongPct}% threshold, not yet at the ${SIGNAL_THRESHOLDS.t1MarginWeakPct}% floor.`,
      }
    }

    case 't1-engineering-justified': {
      const pct = s.t1.result.engineeringPctOfArr
      if (pct === null) return awaiting('an engineering cost for Tier 1')
      if (pct <= SIGNAL_THRESHOLDS.t1EngineeringLightPctOfArr) {
        return {
          state: 'supports',
          detail: `Engineering is ${pct.toFixed(1)}% of Tier-1 ARR — inside the ${SIGNAL_THRESHOLDS.t1EngineeringLightPctOfArr}% threshold. Consumption looks proportionate to the revenue it holds.`,
        }
      }
      if (pct >= SIGNAL_THRESHOLDS.t1EngineeringHeavyPctOfArr) {
        return {
          state: 'weakens',
          detail: `Engineering is ${pct.toFixed(1)}% of Tier-1 ARR — at or above the ${SIGNAL_THRESHOLDS.t1EngineeringHeavyPctOfArr}% dependency threshold.`,
        }
      }
      return {
        state: 'awaiting',
        detail: `Engineering is ${pct.toFixed(1)}% of Tier-1 ARR — between the ${SIGNAL_THRESHOLDS.t1EngineeringLightPctOfArr}% and ${SIGNAL_THRESHOLDS.t1EngineeringHeavyPctOfArr}% thresholds. Inconclusive.`,
      }
    }

    case 't1-reusable':
      return external('customisation-gate reuse rate across enterprise accounts')

    case 't1-no-proportional-dependency':
      return external('engineering hours per account tracked across new enterprise logos')

    /* ------------------------------ Tier 2 ------------------------------- */

    case 't2-availability': {
      const target = s.t2.fields.targetAvailability.value
      if (target === null) return awaiting('a target availability')
      const current = TIERS.t2.availability ?? 0
      if (target >= SIGNAL_THRESHOLDS.t2BaselineAvailability) {
        return {
          state: 'supports',
          detail: `Modelled target ${target}% reaches the ${SIGNAL_THRESHOLDS.t2BaselineAvailability}% production baseline, from ${current}% today.`,
        }
      }
      return {
        state: 'weakens',
        detail: `Modelled target ${target}% still sits below the ${SIGNAL_THRESHOLDS.t2BaselineAvailability}% production baseline.`,
      }
    }

    case 't2-churn-improves': {
      const churn = s.t2.fields.targetChurn.value
      const avail = s.t2.fields.targetAvailability.value
      if (churn === null || avail === null) return awaiting('a target churn and target availability')
      const current = (TIERS.t2.logoChurn ?? 0) * 100
      const reliabilityFixed = avail >= SIGNAL_THRESHOLDS.t2BaselineAvailability
      if (!reliabilityFixed) {
        return {
          state: 'awaiting',
          detail: `This condition only reads once availability reaches ${SIGNAL_THRESHOLDS.t2BaselineAvailability}%.`,
        }
      }
      if (churn < current) {
        return {
          state: 'supports',
          detail: `Modelled: churn ${current.toFixed(0)}% → ${churn}% at ${avail}% availability, protecting ${s.t2.result.logosRetained.toFixed(1)} logos. Illustrative — the causal link is untested.`,
        }
      }
      return {
        state: 'weakens',
        detail: `Modelled: availability reaches ${avail}% and churn stays at ${churn}%. Reliability was not the constraint — re-test the thesis.`,
      }
    }

    case 't2-infra-leveraged': {
      const r = s.t2.result
      const grew = r.projectedCustomers > r.baseCustomers
      if (!grew) return awaiting(`a projected customer count above ${r.baseCustomers}`)
      if (r.projectedHostingPerCustomer <= SIGNAL_THRESHOLDS.t2InfraPerCustomerCeiling) {
        return {
          state: 'supports',
          detail: `Modelled: $${Math.round(r.projectedHostingPerCustomer).toLocaleString()} per customer at ${r.projectedCustomers} customers — ${r.projectedHostingPctOfArr.toFixed(1)}% of projected ARR. Leverage holds under a linear assumption.`,
        }
      }
      return {
        state: 'weakens',
        detail: `Modelled: $${Math.round(r.projectedHostingPerCustomer).toLocaleString()} per customer exceeds the $${SIGNAL_THRESHOLDS.t2InfraPerCustomerCeiling.toLocaleString()} ceiling. Multi-tenant leverage thesis weakens.`,
      }
    }

    case 't2-expansion-without-engineering':
      return external('NRR set against engineering hours per Tier-2 customer')

    case 't2-reliability-without-churn': {
      const churn = s.t2.fields.targetChurn.value
      const avail = s.t2.fields.targetAvailability.value
      if (churn === null || avail === null) return awaiting('a target churn and target availability')
      const current = (TIERS.t2.logoChurn ?? 0) * 100
      if (avail >= SIGNAL_THRESHOLDS.t2BaselineAvailability && churn >= current) {
        return {
          state: 'supports',
          detail: `Modelled: ${avail}% availability with churn unchanged at ${churn}%. Churn is fit, pricing or onboarding — capital shifts from platform to product.`,
        }
      }
      return {
        state: 'weakens',
        detail: `Modelled scenario improves churn to ${churn}% alongside availability, so this reduction condition does not fire.`,
      }
    }

    case 't2-infra-linear': {
      const r = s.t2.result
      const growth = s.t2.fields.infraCostGrowth.value
      if (growth === null) return awaiting('an infrastructure cost growth rate')
      const atCheckpoint = r.projectedCustomers >= SIGNAL_THRESHOLDS.t2ScaleCheckpointCustomers
      if (r.projectedHostingPerCustomer > SIGNAL_THRESHOLDS.t2InfraPerCustomerCeiling) {
        return {
          state: 'supports',
          detail: `Modelled: $${Math.round(r.projectedHostingPerCustomer).toLocaleString()} per customer${atCheckpoint ? ` at ${r.projectedCustomers} customers` : ''} — above the $${SIGNAL_THRESHOLDS.t2InfraPerCustomerCeiling.toLocaleString()} ceiling. Cost is not staying leveraged.`,
        }
      }
      return {
        state: 'weakens',
        detail: `Modelled cost per customer stays at $${Math.round(r.projectedHostingPerCustomer).toLocaleString()}, inside the ceiling. This reduction condition does not fire.`,
      }
    }

    case 't2-disproportionate-capacity':
      return external('SRE and engineering hours per customer measured at the target count')

    /* ------------------------------ Tier 3 ------------------------------- */

    case 't3-conversion-strong': {
      if (!s.t3.cohortEntered) return awaiting('a historical eligible cohort size')
      const conv = s.t3.result.observedConversionPct
      if (conv === null) return awaiting('a historical eligible cohort size')
      const b = BENCHMARKS.plgConversion
      if (conv >= b.high) {
        return {
          state: 'supports',
          detail: `${conv.toFixed(2)}% against the external ${b.low}–${b.high}% range${s.t3.result.graduatesAreFloor ? ' — and this is a floor, since the 22 counts only still-active graduates' : ''}.`,
        }
      }
      if (conv < b.low) {
        return {
          state: 'weakens',
          detail: `${conv.toFixed(2)}% falls below the external ${b.low}–${b.high}% range.`,
        }
      }
      return {
        state: 'awaiting',
        detail: `${conv.toFixed(2)}% sits inside the external ${b.low}–${b.high}% range — typical, not strong.`,
      }
    }

    case 't3-conversion-weak': {
      if (!s.t3.cohortEntered) return awaiting('a historical eligible cohort size')
      const conv = s.t3.result.observedConversionPct
      if (conv === null) return awaiting('a historical eligible cohort size')
      const b = BENCHMARKS.plgConversion
      if (conv < b.low) {
        return { state: 'supports', detail: `${conv.toFixed(2)}% is below the external ${b.low}–${b.high}% range.` }
      }
      return {
        state: 'weakens',
        detail: `${conv.toFixed(2)}% is at or above the external ${b.low}% floor, so this reduction condition does not fire.`,
      }
    }

    case 't3-retention-strong': {
      const nrr = s.t3.fields.downstreamNrr.value
      if (nrr === null) return awaiting('downstream NRR for Tier-3-originated customers')
      const tierAvg = TIERS.t2.nrr * 100
      if (nrr >= tierAvg) {
        return {
          state: 'supports',
          detail: `${nrr}% against the ${tierAvg.toFixed(0)}% Tier-2 average. Graduates retain at least as well as the base.`,
        }
      }
      return {
        state: 'weakens',
        detail: `${nrr}% is below the ${tierAvg.toFixed(0)}% Tier-2 average.`,
      }
    }

    case 't3-retention-weak': {
      const nrr = s.t3.fields.downstreamNrr.value
      if (nrr === null) return awaiting('downstream NRR for Tier-3-originated customers')
      const tierAvg = TIERS.t2.nrr * 100
      if (nrr < 100) {
        return { state: 'supports', detail: `${nrr}% is below 100% — graduated cohorts contract.` }
      }
      if (nrr < tierAvg) {
        return {
          state: 'supports',
          detail: `${nrr}% is below the ${tierAvg.toFixed(0)}% Tier-2 average, though still expanding.`,
        }
      }
      return { state: 'weakens', detail: `${nrr}% matches or beats the Tier-2 average, so this condition does not fire.` }
    }

    case 't3-alerts-drop': {
      const r = s.t3.fields.alertReduction.value
      if (r === null) return awaiting('a target alert reduction')
      const reclaimed = s.t3.result.sreHoursReclaimedAnnual
      const suffix =
        reclaimed !== null ? ` ≈ ${sreFteEquivalent(reclaimed).toFixed(2)} FTE of the 4-person SRE team.` : ''
      if (r >= SIGNAL_THRESHOLDS.t3AlertReductionMaterialPct) {
        return {
          state: 'supports',
          detail: `Modelled ${r}% reduction takes Tier 3 from ${s.t3.result.currentAlertShare.toFixed(0)}% to ${s.t3.result.postFixAlertShare.toFixed(1)}% of alert volume.${suffix}`,
        }
      }
      return {
        state: 'weakens',
        detail: `Modelled ${r}% reduction is short of the ${SIGNAL_THRESHOLDS.t3AlertReductionMaterialPct}% bar set for the guardrail programme.`,
      }
    }

    case 't3-burden-persists': {
      const r = s.t3.fields.alertReduction.value
      if (r === null) return awaiting('a target alert reduction')
      if (r < SIGNAL_THRESHOLDS.t3AlertReductionWeakPct) {
        return {
          state: 'supports',
          detail: `Modelled ${r}% reduction leaves Tier 3 at ${s.t3.result.postFixAlertShare.toFixed(1)}% of alert volume. Burden persists after automation.`,
        }
      }
      return {
        state: 'weakens',
        detail: `Modelled ${r}% reduction clears the ${SIGNAL_THRESHOLDS.t3AlertReductionWeakPct}% floor, so this condition does not fire.`,
      }
    }

    default:
      return external('a measurement outside this calculator')
  }
}

/* -------------------------------------------------------------------------- */

export interface GateSignal {
  supports: number
  weakens: number
  evaluable: number
  /**
   * True when the modelled scenario argues for this direction: at least one
   * condition fires and none outweighs it. A single firing condition is enough
   * to surface a reduction gate — a thesis that fails one of its own tests is
   * news, even when the others have not been modelled yet.
   */
  active: boolean
}

export function summariseGate(conditionIds: string[], s: Scenario): GateSignal {
  const results = conditionIds.map((id) => evaluateSignal(id, s))
  const supports = results.filter((r) => r.state === 'supports').length
  const weakens = results.filter((r) => r.state === 'weakens').length
  return {
    supports,
    weakens,
    evaluable: supports + weakens,
    active: supports > 0 && supports >= weakens,
  }
}
