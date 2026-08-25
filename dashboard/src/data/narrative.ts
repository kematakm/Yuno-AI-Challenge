import type { TierId } from './types'

/* ============================================================================
   Narrative content, centralised so no component hardcodes copy or numbers.
   ========================================================================== */

/**
 * The five questions this has to answer in under two minutes. Each one anchors
 * to the section that answers it, and together they trace the three layers:
 * what we see, what the reporting misses, and how the allocation changes.
 */
export const FIVE_QUESTIONS = [
  {
    n: 1,
    q: 'What is the current investment recommendation?',
    a: '30% Tier 1 protect, 55% Tier 2 scale, 15% Tier 3 acquire. Fork: the multi-tenant scaling engine.',
    anchor: 'money',
    layer: 'Layer 1',
  },
  {
    n: 2,
    q: 'Why does each tier get that allocation?',
    a: 'Reach per fix. Tier 1 work reaches 1 customer, Tier 2 work reaches 140, Tier 3 guardrails reach 1,200 keys.',
    anchor: 'trapped',
    layer: 'Layer 1',
  },
  {
    n: 3,
    q: 'What is the hidden flaw in the current reporting?',
    a: 'No tier connects revenue to engineering consumption, reliability, or downstream conversion.',
    anchor: 'blindspots',
    layer: 'Layer 2',
  },
  {
    n: 4,
    q: 'What data would make us change the allocation?',
    a: 'Five decision gates, each with the instrument that reports it and the allocation it pre-commits to.',
    anchor: 'gates',
    layer: 'Layer 3',
  },
  {
    n: 5,
    q: 'How will we know within 90 days whether the thesis is right?',
    a: 'Instrument by day 30, fix by day 60, confirm or revise 30 / 55 / 15 in writing by day 90.',
    anchor: 'plan',
    layer: 'Layer 3',
  },
] as const

/**
 * Layer 2 of the dashboard: what the current reporting misses.
 * Each tier is scored today on metrics that cannot see its actual constraint.
 */
export const BLIND_SPOTS: Record<
  TierId,
  { reported: string; missing: string; proof: string; implication: string }
> = {
  t1: {
    reported: 'ARR / NRR',
    missing: 'Engineering consumption and fully loaded contribution margin',
    proof: '3 accounts consumed 68% of developer velocity',
    implication:
      'Revenue concentration is not the only risk. There is also engineering concentration.',
  },
  t2: {
    reported: 'ARR / churn',
    missing: 'Whether reliability is suppressing the economics of an otherwise scalable architecture',
    proof: '98.2% availability + peak-hour cascading timeouts',
    implication: 'Tier 2 may have a fixable execution problem, not a broken business model.',
  },
  t3: {
    reported: 'ARR / NRR / churn',
    missing: 'Downstream customer creation and operational noise as separate issues',
    proof: '22 current Tier-2 customers originated in Tier 3',
    implication: 'Tier 3 may be a funnel being scored as a destination.',
  },
}

export const BLIND_SPOT_CONCLUSION =
  'The allocation debate is happening on top of a reporting architecture that does not connect revenue to resource consumption, reliability, or downstream conversion.'

/** Per-tier KPI sets. What each tier is actually managed on. */
export const TIER_KPIS: Record<TierId, string[]> = {
  t1: ['Contribution margin', 'Engineering hours per account', 'Deployment time', 'NRR'],
  t2: ['Availability', 'Logo churn', 'NRR', 'Infrastructure cost per customer'],
  t3: ['Graduation rate', 'Downstream ARR', 'Downstream retention', 'Alert burden / SRE capacity'],
}

/** Section 3 — where engineering leverage breaks. */
export const LEVERAGE_CARDS: Record<
  TierId,
  {
    /** The single fact that carries the card. Rendered as the dominant number. */
    bigNumber: string
    bigCaption: string
    flow: string[]
    label: string
    labelTone: 'bad' | 'good' | 'watch'
    footnote: string
  }
> = {
  t1: {
    bigNumber: '68%',
    bigCaption: 'of developer velocity consumed by custom patches for 3 of 18 accounts',
    flow: [
      'Legacy immutable database framework',
      'Custom backend patches per account',
      '18-day deployment clearance',
      'Recurring engineering dependency',
    ],
    label: 'Custom Engineering Dependency',
    labelTone: 'bad',
    footnote:
      'Single-tenant customisation limits engineering leverage as customer-specific work increases: effort attaches to the account it was written for rather than amortising across the tier.',
  },
  t2: {
    bigNumber: '140',
    bigCaption: 'customers reached by one platform fix — and every customer added after it',
    flow: [
      'Peak-hour rate limits fail (9–11 AM EST)',
      'Cascading timeouts across the shared cluster',
      '98.2% availability (~158 hrs downtime/yr)',
      'Elevated retention risk — hypothesis, not measured',
    ],
    label: 'Fix once, scale many',
    labelTone: 'good',
    footnote:
      'The asymmetry, not the cost, is the argument: Tier 1’s problem repeats per customer, Tier 2’s does not.',
  },
  t3: {
    bigNumber: '52%',
    bigCaption: 'of automated on-call alerts originate in the trial tier, carried by 4 SREs',
    flow: [
      'Poorly written loops and runaway scripts',
      'Abusive configurations on the trial tier',
      'No effective trial-tier rate limiting',
      'Non-actionable pages routed to 4 SREs',
    ],
    label: 'Automate the noise, preserve the funnel',
    labelTone: 'watch',
    footnote:
      'These are controls that were never built, on a channel that has never had a dedicated infrastructure budget.',
  },
}

/** Section: repeatable decision framework, identical shape across all three tiers. */
export const FRAMEWORK_STEPS = [
  'Signal',
  'Diagnosis',
  'Investment',
  'Operating change',
  'KPI',
  'Kill switch',
] as const

export const FRAMEWORK: Record<TierId, string[]> = {
  t1: [
    '68% of developer velocity consumed by 3 accounts',
    'Bespoke engineering dependency on legacy architecture',
    'Protect revenue, improve delivery efficiency',
    'Customisation / productisation gate before bespoke work ships',
    'Contribution margin · engineering hours per account · deployment cycle time · NRR',
    'Reduce bespoke investment if fully loaded economics do not justify it',
  ],
  t2: [
    '98.2% availability with 16% annual logo churn',
    'Reliability constraint sitting on a scalable architecture',
    'Fix the platform, then scale it',
    'Rate limiting, peak capacity, cascading-failure isolation',
    'Availability · logo churn · NRR · infra cost per customer',
    'Reassess the thesis if reliability improves and customer outcomes do not',
  ],
  t3: [
    '52% of alerts, and 22 known Tier-2 customers originated here',
    'Possible acquisition funnel operating without controls',
    'Automate the noise, instrument the funnel',
    'Quotas, trial rate limits, abuse detection, non-paging alert routing, docs',
    'Graduation rate · downstream ARR · downstream retention · alert volume · SRE hours',
    'Reduce or restrict if funnel economics stay weak after controls ship',
  ],
}

/** GTM operating layer. */
export const GTM_STAGES = [
  { fn: 'Marketing', verb: 'Acquire' },
  { fn: 'SDR', verb: 'Qualify' },
  { fn: 'Sales', verb: 'Place' },
  { fn: 'Enablement', verb: 'Repeat' },
  { fn: 'RevOps', verb: 'Measure' },
] as const

export const GTM_MATRIX: Record<TierId, { motion: string; cells: string[] }> = {
  t1: {
    motion: 'Highly qualified enterprise motion',
    cells: [
      'Category and reference-led; not a volume channel.',
      'Qualify customisation burden, implementation load, architecture fit, expected engineering dependency, ACV and strategic value.',
      'Place only where enterprise isolation is genuinely required. High ARR alone does not qualify a customer for bespoke engineering.',
      'Enterprise qualification screen, architecture-fit checklist, gate criteria for custom work.',
      'Connect pipeline → ARR → implementation burden → engineering consumption → contribution margin.',
    ],
  },
  t2: {
    motion: 'Primary scalable commercial motion',
    cells: [
      'ICP-led demand generation into the multi-tenant platform.',
      'Prioritise ICP-fit accounts; use product and usage signals where available.',
      'Default placement for any customer that does not require enterprise isolation or customisation.',
      'Repeatable positioning, qualification rules, migration and upgrade narrative.',
      'Conversion, churn, NRR, sales cycle, cost-to-serve, and graduation into Tier 1.',
    ],
  },
  t3: {
    motion: 'Marketing-led developer acquisition',
    cells: [
      'Optimise qualified developer adoption, activation, and production intent.',
      'No indiscriminate prospecting. Engage only on usage or behavioural signals of production readiness.',
      'Self-serve placement; graduation is triggered by traffic crossing production thresholds.',
      'Documentation, activation paths, and a defined graduation narrative into Tier 2.',
      'Cohort graduation rate, time to graduate, downstream retention — not ARR and NRR.',
    ],
  },
}

/** 90-day execution plan. */
export const NINETY_DAY_PLAN = [
  {
    window: 'Days 1–30',
    theme: 'INSTRUMENT',
    intent: 'Stop deciding on numbers nobody has measured.',
    items: [
      { text: 'Fully loaded Tier-1 contribution margin, all 18 accounts', tier: 't1' },
      { text: 'Engineering effort tagged by account, retroactive two quarters', tier: 't1' },
      { text: 'Tier-2 coded churn-reason analysis', tier: 't2' },
      { text: 'Tier-2 reliability baseline: availability by hour, peak headroom', tier: 't2' },
      { text: 'Tier-3 cohort funnel across all 14 monthly cohorts', tier: 't3' },
      { text: 'Tier-3 alert triage and compute cost per active key', tier: 't3' },
      { text: 'GTM tier qualification definitions', tier: null },
    ],
  },
  {
    window: 'Days 31–60',
    theme: 'FIX',
    intent: 'Ship the controls the diagnosis calls for.',
    items: [
      { text: 'Tier-1 customisation gate live', tier: 't1' },
      { text: 'Tier-2 rate limiting and peak-hour capacity ship', tier: 't2' },
      { text: 'Tier-2 cascading-failure isolation', tier: 't2' },
      { text: 'Tier-3 quotas, trial rate limits, automated mitigation', tier: 't3' },
      { text: 'GTM qualification playbooks', tier: null },
      { text: 'RevOps unified reporting', tier: null },
    ],
  },
  {
    window: 'Days 61–90',
    theme: 'PROVE',
    intent: 'Confirm or revise the allocation in writing.',
    items: [
      { text: 'Tier-1 engineering leverage: hours per account, deploy cycle vs 18 days', tier: 't1' },
      { text: 'Tier-2 retention response and availability trend', tier: 't2' },
      { text: 'Tier-3 graduation economics and alert reduction', tier: 't3' },
      { text: 'GTM repeatability evidence', tier: null },
      { text: 'Confirm or revise the 30 / 55 / 15 allocation', tier: null },
    ],
  },
] as const

/** Lifecycle visual. */
export const LIFECYCLE = [
  { tier: 't3' as TierId, stage: 'Try / Build', detail: 'Sandbox, automated setup, no commercial motion' },
  { tier: 't2' as TierId, stage: 'Launch / Scale', detail: 'Production traffic on shared multi-tenant platform' },
  { tier: 't1' as TierId, stage: 'Enterprise Complexity', detail: 'Isolation, customisation, bespoke engineering' },
]

export const LIFECYCLE_QUESTION =
  'Can customers become more valuable without becoming proportionally more expensive to serve?'
