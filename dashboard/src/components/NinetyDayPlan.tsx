import { TIERS } from '@/data/caseFacts'
import { NINETY_DAY_PLAN } from '@/data/narrative'
import type { TierId } from '@/data/types'
import { Card, Section } from './ui/Card'
import { Tag } from './ui/Tag'

/**
 * The 90-day execution view. Everything in the first window is instrumentation,
 * because most of the disagreement in the room is about numbers nobody has.
 */
export function NinetyDayPlan() {
  return (
    <Section
      id="plan"
      eyebrow="Layer 3 · How the allocation changes"
      title="90-day proof plan"
      lede="The allocation is confirmed or revised in writing at day 90. Everything in the first window exists to replace an argument with a measurement."
      aside={<Tag kind="calc" label="Plan" />}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {NINETY_DAY_PLAN.map((phase, i) => (
          <Card key={phase.window} className="flex flex-col">
            <div className="mb-2.5 flex items-baseline justify-between gap-2">
              <span className="flex items-baseline gap-2">
                <span
                  className="num grid h-[20px] w-[20px] place-items-center rounded-[3px] text-[10.5px] font-bold"
                  style={{ background: 'var(--ink)', color: 'var(--surface)' }}
                >
                  {i + 1}
                </span>
                <span className="text-[14px] font-bold tracking-[0.05em]" style={{ color: 'var(--ink)' }}>
                  {phase.theme}
                </span>
              </span>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>
                {phase.window}
              </span>
            </div>
            <p className="mb-3 text-[11px] leading-snug" style={{ color: 'var(--muted)' }}>
              {phase.intent}
            </p>
            <ul className="grid gap-2">
              {phase.items.map((item) => {
                const tier = item.tier ? TIERS[item.tier as TierId] : null
                return (
                  <li key={item.text} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2">
                    <span
                      className="mt-[5px] h-2 w-2 shrink-0 rounded-[2px]"
                      style={{ background: tier?.accent ?? 'var(--rule-strong)' }}
                      title={tier ? tier.name : 'Cross-tier'}
                    />
                    <span className="text-[11.5px] leading-[1.4]" style={{ color: 'var(--body)' }}>
                      {item.text}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>
        ))}
      </div>

      <div
        className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[5px] border px-3.5 py-2.5"
        style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}
      >
        <span className="eyebrow">Legend</span>
        {[TIERS.t1, TIERS.t2, TIERS.t3].map((t) => (
          <span key={t.id} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
            <span className="h-2 w-2 rounded-[2px]" style={{ background: t.accent }} />
            {t.name}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
          <span className="h-2 w-2 rounded-[2px]" style={{ background: 'var(--rule-strong)' }} />
          Cross-tier / GTM
        </span>
      </div>
    </Section>
  )
}
