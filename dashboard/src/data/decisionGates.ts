import type { TierId } from './types'

/* ============================================================================
   DECISION GATES — "what would change my mind".
   Each gate names the evidence that would move capital, the instrument that
   produces that evidence, and the allocation the recommendation pre-commits to
   if the gate fires. The pre-committed responses are stated in advance so the
   revision is a decision rule, not an argument held after the fact.
   ========================================================================== */

export interface GateTrigger {
  id: string
  text: string
  /** The instrument that produces this evidence. None of these exist today. */
  measuredBy: string
  /** Day by which the instrument is expected to report. */
  by: string
}

export interface DecisionGate {
  id: string
  direction: string
  tier: TierId
  /** 'more' widens the tier's allocation, 'less' narrows it. */
  move: 'more' | 'less'
  summary: string
  triggers: GateTrigger[]
  /** Allocation this recommendation pre-commits to if the gate fires. Sums to 100. */
  response: Record<TierId, number>
  responseNote: string
  /** Shown when the modelled scenario is actively arguing for this direction. */
  signalLine: string
}

/**
 * The single gate shown in the executive header. It is the falsification test for
 * the recommendation's own central bet, stated before anyone is asked to fund it.
 */
export const HEADLINE_GATE = {
  condition: 'If Tier-2 availability reaches 99.9% and logo churn does not improve',
  consequence:
    'reliability was not the constraint. The Tier-2 thesis is re-tested and capital shifts from platform work to fit, pricing and onboarding.',
  measuredBy: 'Availability by hour + coded churn-reason analysis',
  by: 'Day 90',
} as const

export const DECISION_GATES: DecisionGate[] = [
  {
    id: 'more-t1',
    direction: 'MORE TIER 1',
    tier: 't1',
    move: 'more',
    summary: 'Enterprise economics survive full loading, or the custom work stops being custom.',
    signalLine: 'Supports increasing Tier 1 investment',
    triggers: [
      {
        id: 't1-margin-strong',
        text: 'Fully loaded Tier-1 contribution margin remains strong after engineering, SRE, QA, support and implementation cost',
        measuredBy: 'Contribution-margin model, all 18 accounts',
        by: 'Day 30',
      },
      {
        id: 't1-engineering-justified',
        text: 'Engineering-heavy accounts economically justify their resource consumption',
        measuredBy: 'Engineering hours tagged by account × margin per account',
        by: 'Day 30',
      },
      {
        id: 't1-reusable',
        text: 'Custom work becomes reusable or productised across three or more enterprise accounts',
        measuredBy: 'Customisation gate reuse rate',
        by: 'Day 60',
      },
      {
        id: 't1-no-proportional-dependency',
        text: 'Additional enterprise logos do not create proportional engineering dependency',
        measuredBy: 'Engineering hours per account across new enterprise logos',
        by: 'Day 90',
      },
    ],
    response: { t1: 45, t2: 40, t3: 15 },
    responseNote: 'Enterprise economics hold under full loading; capital returns to the tier that holds the revenue.',
  },
  {
    id: 'more-t2',
    direction: 'MORE TIER 2',
    tier: 't2',
    move: 'more',
    summary: 'The platform fix converts into customer outcomes and the cost curve stays flat.',
    signalLine: 'Supports increasing Tier 2 investment',
    triggers: [
      {
        id: 't2-availability',
        text: 'Availability moves toward 99.9%',
        measuredBy: 'Availability by hour, measured weekly',
        by: 'Day 60',
      },
      {
        id: 't2-churn-improves',
        text: 'Churn declines after reliability improves',
        measuredBy: 'Coded churn-reason analysis + cohort retention',
        by: 'Day 90',
      },
      {
        id: 't2-infra-leveraged',
        text: 'Infrastructure cost per customer remains leveraged as customer count grows',
        measuredBy: 'Infra cost per customer modelled to 200 customers',
        by: 'Day 60',
      },
      {
        id: 't2-expansion-without-engineering',
        text: 'Customer expansion does not require proportional engineering growth',
        measuredBy: 'NRR vs engineering hours per Tier-2 customer',
        by: 'Day 90',
      },
    ],
    response: { t1: 20, t2: 65, t3: 15 },
    responseNote: 'The scaling engine is confirmed; Tier 1 holds at protection level only.',
  },
  {
    id: 'less-t2',
    direction: 'LESS TIER 2',
    tier: 't2',
    move: 'less',
    summary: 'The reliability thesis fails its own test, or the architecture is not as leveraged as assumed.',
    signalLine: 'Tier 2 thesis requires reassessment',
    triggers: [
      {
        id: 't2-reliability-without-churn',
        text: 'Reliability improves but churn does not',
        measuredBy: 'Availability by hour + coded churn-reason analysis',
        by: 'Day 90',
      },
      {
        id: 't2-infra-linear',
        text: 'Infrastructure cost scales linearly with customer growth',
        measuredBy: 'Cost-per-customer curve with cluster capacity priced',
        by: 'Day 60',
      },
      {
        id: 't2-disproportionate-capacity',
        text: 'Supporting 300 customers requires disproportionate SRE or engineering capacity',
        measuredBy: 'SRE and engineering hours per customer at the target count',
        by: 'Day 90',
      },
    ],
    response: { t1: 40, t2: 45, t3: 15 },
    responseNote:
      'The constraint was not reliability or the architecture is not leveraged. Capital moves to protection and to product work on fit, pricing and onboarding.',
  },
  {
    id: 'more-t3',
    direction: 'MORE TIER 3',
    tier: 't3',
    move: 'more',
    summary: 'The sandbox is an acquisition engine with a measurable downstream return.',
    signalLine: 'Supports increasing Tier 3 funnel investment',
    triggers: [
      {
        id: 't3-conversion-strong',
        text: 'Cohort conversion into Tier 2 is strong against the external 2–6% PLG range',
        measuredBy: 'Cohort conversion with a real historical denominator',
        by: 'Day 30',
      },
      {
        id: 't3-retention-strong',
        text: 'Tier-3-originated Tier-2 customers retain and expand well',
        measuredBy: 'Downstream retention / NRR by origin',
        by: 'Day 60',
      },
      {
        id: 't3-alerts-drop',
        text: 'Alert burden drops materially after guardrails',
        measuredBy: 'Alert volume and SRE hours, before vs after',
        by: 'Day 60',
      },
    ],
    response: { t1: 20, t2: 55, t3: 25 },
    responseNote: 'Acquisition economics are proven; the channel is funded from enterprise protection.',
  },
  {
    id: 'less-t3',
    direction: 'LESS TIER 3',
    tier: 't3',
    move: 'less',
    summary: 'The funnel does not exist, or the controls do not work.',
    signalLine: 'Supports restricting Tier 3',
    triggers: [
      {
        id: 't3-conversion-weak',
        text: 'Cohort conversion into Tier 2 is weak',
        measuredBy: 'Historical cohort denominators across all 14 monthly cohorts',
        by: 'Day 30',
      },
      {
        id: 't3-retention-weak',
        text: 'Downstream retention of Tier-3-originated customers is poor',
        measuredBy: 'Downstream retention / NRR by origin',
        by: 'Day 60',
      },
      {
        id: 't3-burden-persists',
        text: 'SRE burden remains high after automation',
        measuredBy: 'Alert volume and SRE hours consumed, before vs after',
        by: 'Day 60',
      },
    ],
    response: { t1: 30, t2: 65, t3: 5 },
    responseNote: 'Channel is restricted to invited developers; freed capital goes to the scaling engine.',
  },
]
