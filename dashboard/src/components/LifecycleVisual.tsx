import { TIERS } from '@/data/caseFacts'
import { LIFECYCLE, LIFECYCLE_QUESTION } from '@/data/narrative'
import { num } from '@/lib/format'
import { Card } from './ui/Card'

/**
 * The lifecycle a customer actually travels, and the question underneath it.
 * If the answer is no, the Tier-1 problem regenerates with every successful
 * customer and next year's roadmap writes itself.
 */
export function LifecycleVisual() {
  return (
    <Card className="p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <div className="eyebrow mb-2.5">Customer lifecycle</div>
          <div className="grid gap-1.5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch">
            {LIFECYCLE.map((s, i) => {
              const tier = TIERS[s.tier]
              return (
                <div key={s.tier} className="contents">
                  <div
                    className="rounded-[4px] px-3 py-2.5"
                    style={{ background: tier.accentSoft, border: `1px solid ${tier.accent}` }}
                  >
                    <div className="text-[9.5px] font-bold tracking-[0.1em]" style={{ color: tier.ink }}>
                      {tier.name.toUpperCase()}
                    </div>
                    <div className="mt-0.5 text-[13.5px] leading-tight font-semibold" style={{ color: 'var(--ink)' }}>
                      {s.stage}
                    </div>
                    <div className="mt-1 text-[10.5px] leading-snug" style={{ color: 'var(--muted)' }}>
                      {s.detail}
                    </div>
                    <div className="num mt-1.5 text-[10.5px] font-semibold" style={{ color: tier.ink }}>
                      {num(tier.accounts)} {tier.accountUnit}
                    </div>
                  </div>
                  {i < LIFECYCLE.length - 1 && (
                    <div
                      aria-hidden
                      className="grid place-items-center py-1 text-[13px] sm:py-0"
                      style={{ color: 'var(--rule-strong)' }}
                    >
                      <span className="hidden sm:block">▶</span>
                      <span className="sm:hidden">▼</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="rounded-[5px] border p-4"
          style={{ borderColor: 'var(--rule-strong)', background: 'var(--surface-2)' }}
        >
          <div className="eyebrow mb-1.5">The structural question underneath the allocation</div>
          <p className="font-serif text-[17px] leading-[1.4] sm:text-[19px]" style={{ color: 'var(--ink)' }}>
            {LIFECYCLE_QUESTION}
          </p>
          <p className="mt-2 text-[11.5px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
            If the answer is no, successful customers tend to land on isolated architecture with
            customer-specific engineering, and the Tier-1 constraint regenerates with each one. That
            makes an enterprise-capable multi-tenant path a roadmap question, not an infrastructure one.
          </p>
        </div>
      </div>
    </Card>
  )
}
