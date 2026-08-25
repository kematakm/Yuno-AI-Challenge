import { TIER_LIST } from '@/data/caseFacts'
import { RECOMMENDED_ALLOCATION } from '@/data/allocation'
import type { TierId } from '@/data/types'
import { cn } from './ui/cn'

/**
 * 100% stacked allocation bar. When the working scenario differs from the
 * recommendation, the recommended split is drawn as a tick above the bar so the
 * board can see the delta rather than being told about it.
 */
export function AllocationChart({
  allocation,
  showBaseline = true,
  height = 'md',
  labels = true,
}: {
  allocation: Record<TierId, number>
  showBaseline?: boolean
  height?: 'sm' | 'md'
  labels?: boolean
}) {
  const total = allocation.t1 + allocation.t2 + allocation.t3
  const safeTotal = total > 0 ? total : 1
  const modified = TIER_LIST.some((t) => allocation[t.id] !== RECOMMENDED_ALLOCATION[t.id])

  // Cumulative boundary positions of the recommendation, for the baseline ticks.
  const baselineMarks = [
    RECOMMENDED_ALLOCATION.t1,
    RECOMMENDED_ALLOCATION.t1 + RECOMMENDED_ALLOCATION.t2,
  ]

  return (
    <div className="min-w-0">
      {showBaseline && modified && (
        <div className="relative mb-[3px] h-[9px]">
          {baselineMarks.map((m) => (
            <span
              key={m}
              className="absolute top-0 h-[9px] w-px"
              style={{ left: `${m}%`, background: 'var(--rule-strong)' }}
              title={`Recommended boundary at ${m}%`}
            />
          ))}
          <span
            className="absolute top-[-1px] text-[9px] font-semibold tracking-[0.06em] uppercase"
            style={{ left: `calc(${baselineMarks[1]}% + 6px)`, color: 'var(--muted)' }}
          >
            Recommended split
          </span>
        </div>
      )}

      <div
        className={cn('flex w-full overflow-hidden rounded-[3px]', height === 'md' ? 'h-11' : 'h-6')}
        style={{ border: '1px solid var(--rule)' }}
        role="img"
        aria-label={`Allocation: Tier 1 ${allocation.t1}%, Tier 2 ${allocation.t2}%, Tier 3 ${allocation.t3}%`}
      >
        {TIER_LIST.map((t) => {
          const v = allocation[t.id]
          const w = (v / safeTotal) * 100
          const wide = w > 11
          return (
            <div
              key={t.id}
              className="flex items-center justify-center transition-[width] duration-200 ease-out"
              style={{ width: `${w}%`, background: t.accent }}
              title={`${t.name} — ${t.role} — ${v}%`}
            >
              {labels && wide && (
                <span className="num px-1 text-center leading-tight" style={{ color: t.onAccent }}>
                  <span className="block text-[9px] font-semibold tracking-[0.09em] uppercase opacity-80">
                    {t.name} · {t.role}
                  </span>
                  <span className={cn('block font-semibold', height === 'md' ? 'text-[15px]' : 'text-[11px]')}>
                    {v}%
                  </span>
                </span>
              )}
            </div>
          )
        })}
      </div>

      {total !== 100 && (
        <div className="mt-1.5 text-[11px] font-semibold" style={{ color: 'var(--bad)' }}>
          Allocation totals {total}% — must equal 100%.
        </div>
      )}
    </div>
  )
}
