import type { ReactNode } from 'react'

export interface Share {
  id: string
  label: string
  value: number
  color: string
  /** Text colour on top of `color`. Required wherever the fill is light. */
  fg?: string
  /** Renders as a hatched, deliberately "not a real category" segment. */
  hatched?: boolean
}

/**
 * A 100% share bar. Used to put ARR share, account share, infrastructure spend
 * share, engineering velocity and alert volume on the same visual footing —
 * the asymmetry between them is the argument of this section.
 */
export function ShareBar({
  label,
  sublabel,
  shares,
  total,
  flag,
}: {
  label: string
  sublabel?: ReactNode
  shares: Share[]
  total?: ReactNode
  flag?: ReactNode
}) {
  const sum = shares.reduce((s, x) => s + x.value, 0) || 1

  return (
    <div className="grid items-center gap-x-3 gap-y-1 sm:grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="text-[11.5px] leading-tight font-semibold" style={{ color: 'var(--ink)' }}>
          {label}
        </div>
        {sublabel && (
          <div className="text-[10px] leading-tight" style={{ color: 'var(--muted)' }}>
            {sublabel}
          </div>
        )}
      </div>

      <div className="flex h-[26px] w-full overflow-hidden rounded-[3px]" style={{ border: '1px solid var(--rule)' }}>
        {shares.map((s) => {
          const w = (s.value / sum) * 100
          return (
            <div
              key={s.id}
              className="flex items-center justify-center overflow-hidden transition-[width] duration-200"
              style={{
                width: `${w}%`,
                background: s.hatched
                  ? `repeating-linear-gradient(135deg, var(--surface-3) 0 5px, var(--rule) 5px 6px)`
                  : s.color,
              }}
              title={`${s.label} — ${w.toFixed(1)}%`}
            >
              {w > 9 && (
                <span
                  className="num truncate px-1 text-[10.5px] font-semibold"
                  style={{ color: s.hatched ? 'var(--muted)' : (s.fg ?? '#fff') }}
                >
                  {w.toFixed(1)}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2 text-right">
        {total && (
          <span className="num text-[11.5px] font-semibold whitespace-nowrap" style={{ color: 'var(--ink)' }}>
            {total}
          </span>
        )}
        {flag}
      </div>
    </div>
  )
}
