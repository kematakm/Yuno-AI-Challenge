/* ============================================================================
   Formatting helpers. Financial values are formatted in one place so every
   figure on the page reads the same way.
   ========================================================================== */

/** $22M / $660K / $1,667 — compact, board-legible currency. */
export function usd(value: number, opts: { decimals?: number; sign?: boolean } = {}): string {
  const { decimals, sign = false } = opts
  const abs = Math.abs(value)
  const prefix = sign && value > 0 ? '+' : value < 0 ? '−' : ''

  // Trailing zeros only after a decimal point: 660 must not become 66.
  const trim = (n: number, d: number) =>
    n
      .toFixed(d)
      .replace(/(\.\d*?)0+$/, '$1')
      .replace(/\.$/, '')

  if (abs >= 1_000_000) {
    const m = abs / 1_000_000
    return `${prefix}$${trim(m, decimals ?? (abs >= 10_000_000 ? 1 : 2))}M`
  }
  if (abs >= 1_000) {
    const k = abs / 1_000
    return `${prefix}$${trim(k, decimals ?? (abs >= 10_000 ? 0 : 1))}K`
  }
  return `${prefix}$${trim(abs, decimals ?? 0)}`
}

/** Full precision currency for tooltips and audit trails: $3,240,000. */
export function usdExact(value: number): string {
  return `${value < 0 ? '−' : ''}$${Math.abs(Math.round(value)).toLocaleString('en-US')}`
}

/** 14.7% — percentage already expressed in percentage points. */
export function pct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/** 0.147 → 14.7% — for ratios stored as fractions. */
export function ratioPct(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function num(value: number, decimals = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** 157.7 hrs / 8.8 hrs — annual downtime. */
export function hours(value: number): string {
  if (value < 10) return `${value.toFixed(2)} hrs`
  return `${value.toFixed(1)} hrs`
}

/** 157.7 hrs → "6 days 13 hrs" for the human-scale read. */
export function hoursHuman(value: number): string {
  if (value < 24) return `${value.toFixed(1)} hours`
  const d = Math.floor(value / 24)
  const h = Math.round(value - d * 24)
  return `${d}d ${h}h`
}

export function fte(value: number): string {
  return `${value.toFixed(1)} FTE`
}

/** Availability needs more decimals than a normal percentage. */
export function availability(value: number): string {
  return `${value.toFixed(value >= 99.9 ? 2 : 1)}%`
}
