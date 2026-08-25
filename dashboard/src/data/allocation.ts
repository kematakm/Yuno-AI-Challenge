import type { TierId } from './types'

/* ============================================================================
   RECOMMENDED ALLOCATION — the thesis under test.
   ========================================================================== */

export const RECOMMENDED_ALLOCATION: Record<TierId, number> = {
  t1: 30,
  t2: 55,
  t3: 15,
}

export const THESIS = {
  badge: 'Multi-Tenant Scaling Engine',
  headline:
    'Protect today’s revenue while shifting incremental capacity toward the repeatable multi-tenant growth engine.',
  shortForm: 'Protect Tier 1. Fix and scale Tier 2. Automate and instrument Tier 3.',
  subhead:
    'Tier 1 is funded to protect $22M and reduce the engineering dependency inside it — not to grow it on the current architecture.',
} as const

export const ALLOCATION_RATIONALE: Record<TierId, string> = {
  t1: 'Protect $22M and 114% NRR; buy down per-customer engineering dependency behind a customisation gate.',
  t2: 'One platform fix reaches 140 customers today and every customer added after. The leading scaling thesis.',
  t3: 'Guardrails, quotas and alert routing. Automated controls that apply to every key at once, and the funnel stays measurable.',
}

/** Staffing pools available for the scenario translation. */
export const STAFF_POOLS = [
  {
    id: 'all',
    label: 'All technical staff',
    headcount: 44,
    detail: '28 backend/core · 12 frontend/UX · 4 SRE',
  },
  {
    id: 'backend',
    label: 'Backend / core only',
    headcount: 28,
    detail: 'The pool that actually does platform work',
  },
  {
    id: 'platform',
    label: 'Backend + SRE',
    headcount: 32,
    detail: 'Closest proxy for platform + infrastructure capacity',
  },
  { id: 'sre', label: 'SRE only', headcount: 4, detail: 'The binding constraint on every platform item' },
] as const

export type StaffPoolId = (typeof STAFF_POOLS)[number]['id'] | 'custom'
