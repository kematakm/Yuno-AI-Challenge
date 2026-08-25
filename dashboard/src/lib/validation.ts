/* ============================================================================
   Input validation. Impossible values are rejected at the field, so no
   downstream formula ever runs on a negative ARR or a 140% availability.
   ========================================================================== */

export interface NumericSpec {
  min?: number
  max?: number
  integer?: boolean
  /** Unit shown inside the error message. */
  unitLabel?: string
}

export interface NumericParse {
  /** null means the field is empty — rendered as "Data Needed", never as zero. */
  value: number | null
  error: string | null
}

/** Parse and validate a raw field value against its spec. */
export function parseNumeric(raw: string, spec: NumericSpec = {}): NumericParse {
  const trimmed = raw.replace(/[,$\s]/g, '').trim()
  if (trimmed === '') return { value: null, error: null }

  const n = Number(trimmed)
  if (!Number.isFinite(n)) return { value: null, error: 'Enter a number' }

  if (spec.integer && !Number.isInteger(n)) {
    return { value: null, error: 'Whole numbers only' }
  }
  if (spec.min !== undefined && n < spec.min) {
    return { value: null, error: `Minimum ${spec.min}${spec.unitLabel ?? ''}` }
  }
  if (spec.max !== undefined && n > spec.max) {
    return { value: null, error: `Maximum ${spec.max}${spec.unitLabel ?? ''}` }
  }
  return { value: n, error: null }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Field specs used across the calculators. */
export const SPEC = {
  /** Money: never negative. */
  money: { min: 0, unitLabel: '' } satisfies NumericSpec,
  /** Rates expressed in percentage points. */
  rate: { min: 0, max: 100, unitLabel: '%' } satisfies NumericSpec,
  /** Availability cannot exceed 100%. */
  availability: { min: 0, max: 100, unitLabel: '%' } satisfies NumericSpec,
  /** Counts: whole, non-negative. */
  count: { min: 0, integer: true } satisfies NumericSpec,
  /** Cost growth can be negative (a saving) but is bounded for sanity. */
  growth: { min: -100, max: 500, unitLabel: '%' } satisfies NumericSpec,
  /** Net new customers may be negative (contraction). */
  netCustomers: { min: -1_000, max: 100_000, integer: true } satisfies NumericSpec,
  hoursPerAlert: { min: 0, max: 100 } satisfies NumericSpec,
} as const
