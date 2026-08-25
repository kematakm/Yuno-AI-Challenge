import { useMemo, useState } from 'react'
import { TIERS } from '@/data/caseFacts'
import {
  TIER1_COST_CATEGORIES,
  derivedAvgArr,
  tier1Margin,
  tier2Reliability,
  tier3Funnel,
  type Tier1CostKey,
  type Tier1Costs,
  type Tier1MarginResult,
  type Tier2Result,
  type Tier3Result,
} from '@/lib/calc'
import { SPEC, type NumericSpec } from '@/lib/validation'
import { useNumericFields, type FieldResult } from './useNumericFields'

/* ============================================================================
   One scenario, shared by the calculators that produce it and the decision
   gates that read it. Lifting the state is what turns the calculator from a
   widget into the input side of a decision rule.
   ========================================================================== */

export const T2_DERIVED_AVG_ARR = Math.round(derivedAvgArr('t2'))

/* -------------------------------- Tier 1 --------------------------------- */

const T1_SPECS = Object.fromEntries(TIER1_COST_CATEGORIES.map((c) => [c.key, SPEC.money])) as Record<
  Tier1CostKey,
  NumericSpec
>
const T1_EMPTY = Object.fromEntries(TIER1_COST_CATEGORIES.map((c) => [c.key, ''])) as Record<
  Tier1CostKey,
  string
>

export interface Tier1Scenario {
  fields: Record<Tier1CostKey, FieldResult>
  set: (key: Tier1CostKey, value: string) => void
  clearAll: () => void
  costs: Tier1Costs
  result: Tier1MarginResult
  engineersRaw: string
  setEngineersRaw: (v: string) => void
  loadedCostRaw: string
  setLoadedCostRaw: (v: string) => void
}

/* -------------------------------- Tier 2 --------------------------------- */

export type Tier2Key =
  | 'targetChurn'
  | 'targetAvailability'
  | 'projectedCustomers'
  | 'infraCostGrowth'
  | 'engInvestment'
  | 'avgArr'

const T2_INITIAL: Record<Tier2Key, string> = {
  targetChurn: '10',
  targetAvailability: '99.9',
  projectedCustomers: String(TIERS.t2.accounts),
  infraCostGrowth: '0',
  engInvestment: '',
  avgArr: String(T2_DERIVED_AVG_ARR),
}

const T2_SPECS: Record<Tier2Key, NumericSpec> = {
  targetChurn: SPEC.rate,
  targetAvailability: SPEC.availability,
  projectedCustomers: { min: 0, max: 100_000, integer: true },
  infraCostGrowth: SPEC.growth,
  engInvestment: SPEC.money,
  avgArr: SPEC.money,
}

export interface Tier2Scenario {
  fields: Record<Tier2Key, FieldResult>
  set: (key: Tier2Key, value: string) => void
  resetAll: () => void
  result: Tier2Result
  /** True only when the inputs the retention model needs are present. */
  modelled: boolean
}

/* -------------------------------- Tier 3 --------------------------------- */

export type Tier3Key =
  | 'cohortSize'
  | 'actualGraduates'
  | 'conversionRate'
  | 'alertReduction'
  | 'avgArrAfterGraduation'
  | 'downstreamNrr'
  | 'totalMonthlyAlerts'
  | 'sreHoursPerAlert'
  | 'sreCostPerHour'

const T3_INITIAL: Record<Tier3Key, string> = {
  cohortSize: '', // never measured — must stay blank
  actualGraduates: '', // never measured — the packet's 22 is a floor
  conversionRate: '', // never measured — must stay blank
  alertReduction: '60',
  avgArrAfterGraduation: String(T2_DERIVED_AVG_ARR),
  downstreamNrr: '',
  totalMonthlyAlerts: '',
  sreHoursPerAlert: '',
  sreCostPerHour: '',
}

const T3_SPECS: Record<Tier3Key, NumericSpec> = {
  cohortSize: SPEC.count,
  actualGraduates: SPEC.count,
  conversionRate: SPEC.rate,
  alertReduction: SPEC.rate,
  avgArrAfterGraduation: SPEC.money,
  downstreamNrr: { min: 0, max: 400, unitLabel: '%' },
  totalMonthlyAlerts: SPEC.count,
  sreHoursPerAlert: SPEC.hoursPerAlert,
  sreCostPerHour: SPEC.money,
}

export interface Tier3Scenario {
  fields: Record<Tier3Key, FieldResult>
  set: (key: Tier3Key, value: string) => void
  resetAll: () => void
  result: Tier3Result
  cohortEntered: boolean
}

export interface Scenario {
  t1: Tier1Scenario
  t2: Tier2Scenario
  t3: Tier3Scenario
}

export function useScenario(): Scenario {
  /* ---- Tier 1 ---- */
  const t1Fields = useNumericFields<Tier1CostKey>(T1_EMPTY, T1_SPECS)
  const [engineersRaw, setEngineersRaw] = useState('')
  const [loadedCostRaw, setLoadedCostRaw] = useState('')

  const t1Costs = useMemo(() => {
    const out = {} as Tier1Costs
    TIER1_COST_CATEGORIES.forEach((c) => {
      out[c.key] = t1Fields.fields[c.key].value
    })
    return out
  }, [t1Fields.fields])

  const t1Result = useMemo(() => tier1Margin(t1Costs), [t1Costs])

  /* ---- Tier 2 ---- */
  const t2Fields = useNumericFields<Tier2Key>(T2_INITIAL, T2_SPECS)
  const f2 = t2Fields.fields

  const t2Result = useMemo(
    () =>
      tier2Reliability({
        targetChurnPct: f2.targetChurn.value ?? (TIERS.t2.logoChurn ?? 0) * 100,
        targetAvailabilityPct: f2.targetAvailability.value ?? TIERS.t2.availability ?? 0,
        projectedCustomers: f2.projectedCustomers.value ?? TIERS.t2.accounts,
        infraCostGrowthPct: f2.infraCostGrowth.value ?? 0,
        additionalEngInvestment: f2.engInvestment.value,
        avgArr: f2.avgArr.value ?? T2_DERIVED_AVG_ARR,
      }),
    [
      f2.targetChurn.value,
      f2.targetAvailability.value,
      f2.projectedCustomers.value,
      f2.infraCostGrowth.value,
      f2.engInvestment.value,
      f2.avgArr.value,
    ],
  )

  /* ---- Tier 3 ---- */
  const t3Fields = useNumericFields<Tier3Key>(T3_INITIAL, T3_SPECS)
  const f3 = t3Fields.fields

  const t3Result = useMemo(
    () =>
      tier3Funnel({
        historicalCohortSize: f3.cohortSize.value,
        actualGraduates: f3.actualGraduates.value,
        modelledConversionPct: f3.conversionRate.value,
        targetAlertReductionPct: f3.alertReduction.value ?? 0,
        avgArrAfterGraduation: f3.avgArrAfterGraduation.value ?? T2_DERIVED_AVG_ARR,
        downstreamNrrPct: f3.downstreamNrr.value,
        totalMonthlyAlerts: f3.totalMonthlyAlerts.value,
        sreHoursPerAlert: f3.sreHoursPerAlert.value,
        sreCostPerHour: f3.sreCostPerHour.value,
      }),
    [
      f3.cohortSize.value,
      f3.actualGraduates.value,
      f3.conversionRate.value,
      f3.alertReduction.value,
      f3.avgArrAfterGraduation.value,
      f3.downstreamNrr.value,
      f3.totalMonthlyAlerts.value,
      f3.sreHoursPerAlert.value,
      f3.sreCostPerHour.value,
    ],
  )

  return {
    t1: {
      fields: t1Fields.fields,
      set: t1Fields.set,
      clearAll: t1Fields.clearAll,
      costs: t1Costs,
      result: t1Result,
      engineersRaw,
      setEngineersRaw,
      loadedCostRaw,
      setLoadedCostRaw,
    },
    t2: {
      fields: f2,
      set: t2Fields.set,
      resetAll: t2Fields.resetAll,
      result: t2Result,
      modelled: f2.targetChurn.value !== null && f2.avgArr.value !== null,
    },
    t3: {
      fields: f3,
      set: t3Fields.set,
      resetAll: t3Fields.resetAll,
      result: t3Result,
      cohortEntered: f3.cohortSize.value !== null && f3.cohortSize.value > 0,
    },
  }
}
