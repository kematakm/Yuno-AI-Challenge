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
  /** true when today's packet already contains the evidence for this trigger. */
  alreadyObserved?: boolean
}

export interface DecisionGate {
  id: string
  direction: string
  tier: TierId
  summary: string
  triggers: GateTrigger[]
  /** Allocation this recommendation pre-commits to if the gate fires. Sums to 100. */
  response: Record<TierId, number>
  responseNote: string
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
    summary: 'Enterprise economics survive full loading, or the bespoke work stops being bespoke.',
    triggers: [
      {
        id: 'g1a',
        text: 'Fully loaded Tier-1 contribution margin stays strong after engineering, SRE, QA, support and implementation cost',
        measuredBy: 'Contribution-margin model, all 18 accounts',
        by: 'Day 30',
      },
      {
        id: 'g1b',
        text: 'The three accounts consuming 68% of velocity economically justify that consumption',
        measuredBy: 'Engineering hours tagged by account × margin per account',
        by: 'Day 30',
      },
      {
        id: 'g1c',
        text: 'Bespoke work becomes reusable or productised across three or more enterprise accounts',
        measuredBy: 'Customisation gate reuse rate',
        by: 'Day 60',
      },
      {
        id: 'g1d',
        text: 'Tier-2 infrastructure cost per customer exceeds $6K at 200 customers — multi-tenant leverage is weaker than assumed',
        measuredBy: 'Cost-per-customer curve modelled to 200 customers',
        by: 'Day 60',
      },
    ],
    response: { t1: 45, t2: 40, t3: 15 },
    responseNote: 'Multi-tenant leverage thesis weakens; capital returns to the tier that holds the revenue.',
  },
  {
    id: 'more-t2',
    direction: 'MORE TIER 2',
    tier: 't2',
    summary: 'The platform fix converts into customer outcomes and the cost curve stays flat.',
    triggers: [
      {
        id: 'g2a',
        text: 'Availability moves toward 99.9% after rate limiting and peak capacity ship',
        measuredBy: 'Availability by hour, measured weekly',
        by: 'Day 60',
      },
      {
        id: 'g2b',
        text: 'Logo churn declines materially from 16% toward the 5–10% benchmark band',
        measuredBy: 'Coded churn-reason analysis + cohort retention',
        by: 'Day 90',
      },
      {
        id: 'g2c',
        text: 'Infrastructure cost stays leveraged as customer count grows',
        measuredBy: 'Infra cost per customer at 200 customers',
        by: 'Day 60',
      },
      {
        id: 'g2d',
        text: 'Tier-2 customers expand without proportional engineering growth',
        measuredBy: 'NRR vs engineering hours per Tier-2 customer',
        by: 'Day 90',
      },
      {
        id: 'g2e',
        text: 'Tier-1 fully loaded margin per ARR dollar comes back below Tier 2',
        measuredBy: 'Contribution-margin model by tier',
        by: 'Day 30',
      },
    ],
    response: { t1: 20, t2: 65, t3: 15 },
    responseNote: 'The scaling engine is confirmed; Tier 1 holds at protection level only.',
  },
  {
    id: 'less-t3',
    direction: 'LESS TIER 3',
    tier: 't3',
    summary: 'The funnel does not exist, or the controls do not work.',
    triggers: [
      {
        id: 'g3a',
        text: 'Cohort conversion into Tier 2 is weak against the 2–6% external PLG range',
        measuredBy: 'Historical cohort denominators across all 14 monthly cohorts',
        by: 'Day 30',
      },
      {
        id: 'g3b',
        text: 'Tier-3-originated customers retain or expand below the Tier-2 average',
        measuredBy: 'Downstream retention / NRR by origin',
        by: 'Day 60',
      },
      {
        id: 'g3c',
        text: 'SRE burden stays high after rate limiting, quotas and alert routing ship',
        measuredBy: 'Alert volume and SRE hours consumed, before vs after',
        by: 'Day 60',
      },
    ],
    response: { t1: 30, t2: 65, t3: 5 },
    responseNote: 'Channel is restricted to invited developers; freed capital goes to the scaling engine.',
  },
  {
    id: 'more-t3',
    direction: 'MORE TIER 3',
    tier: 't3',
    summary: 'The sandbox is an acquisition engine with a measurable downstream return.',
    triggers: [
      {
        id: 'g4a',
        text: 'Tier-3-originated customers show strong downstream retention / NRR versus the Tier-2 average',
        measuredBy: 'Downstream retention / NRR by origin',
        by: 'Day 60',
      },
      {
        id: 'g4b',
        text: 'Cohort conversion compares favourably with the 2–6% external PLG range',
        measuredBy: 'Cohort conversion with a real historical denominator',
        by: 'Day 30',
      },
      {
        id: 'g4c',
        text: 'Alert volume falls materially after guardrails, freeing SRE capacity',
        measuredBy: 'Alert volume reduction vs the 52% baseline share',
        by: 'Day 60',
      },
    ],
    response: { t1: 20, t2: 55, t3: 25 },
    responseNote: 'Acquisition economics are proven; the channel is funded from enterprise protection.',
  },
]
