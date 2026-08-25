import { RECOMMENDED_ALLOCATION } from '@/data/allocation'
import { TIERS, TIER_LIST, TIER_DETAIL } from '@/data/caseFacts'
import { LEVERAGE_CARDS } from '@/data/narrative'
import type { TierId } from '@/data/types'
import { num, ratioPct } from '@/lib/format'
import { Card, Section } from './ui/Card'
import { Tag } from './ui/Tag'

/** How far one unit of engineering work travels in each tier. This is the thesis. */
const REACH: Record<TierId, { value: string; detail: string; tone: 'bad' | 'good' | 'watch' }> = {
  t1: {
    value: '1 customer',
    detail: 'A custom backend patch benefits the account it was written for.',
    tone: 'bad',
  },
  t2: {
    value: `${num(TIERS.t2.accounts)} customers`,
    detail: 'A platform fix benefits every current customer and every one added afterwards.',
    tone: 'good',
  },
  t3: {
    value: `${num(TIERS.t3.accounts)} keys`,
    detail: 'Guardrails apply to every key at once, including future ones. Automated by design.',
    tone: 'watch',
  },
}

const TONE_COLOR = { bad: 'var(--bad)', good: 'var(--good)', watch: 'var(--watch)' } as const

/** The tier carrying the largest recommended allocation is the visual centre of gravity. */
const PRIMARY: TierId = (Object.keys(RECOMMENDED_ALLOCATION) as TierId[]).reduce((a, b) =>
  RECOMMENDED_ALLOCATION[a] >= RECOMMENDED_ALLOCATION[b] ? a : b,
)

export function EngineeringLeverageCards() {
  return (
    <Section
      id="trapped"
      eyebrow="Questions 3 & 4"
      title="The engineering capacity trap"
      lede="Each tier consumes engineering differently. The difference is not how much work there is — it is how far one unit of that work travels."
      aside={<Tag kind="fact" label="Case facts + stated flows" />}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.28fr)_minmax(0,1fr)]">
        {TIER_LIST.map((t) => {
          const card = LEVERAGE_CARDS[t.id]
          const reach = REACH[t.id]
          const primary = t.id === PRIMARY
          return (
            <Card
              key={t.id}
              accent={t.accent}
              className="flex flex-col"
              style={
                primary
                  ? { borderLeftWidth: 5, borderColor: t.accent, boxShadow: 'var(--shadow-lift)' }
                  : undefined
              }
            >
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--ink)' }}>
                  {t.name}
                </span>
                <span
                  className="rounded-[2px] px-1 py-px text-[9px] font-bold tracking-[0.1em]"
                  style={{ background: t.accentSoft, color: t.ink }}
                >
                  {t.role}
                </span>
                <span className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
                  {t.segment}
                </span>
                {primary && (
                  <span
                    className="ml-auto rounded-[2px] px-1.5 py-px text-[9px] font-bold tracking-[0.1em] whitespace-nowrap"
                    style={{ background: t.accent, color: t.onAccent }}
                  >
                    PRIMARY BET · {RECOMMENDED_ALLOCATION[t.id]}%
                  </span>
                )}
              </div>

              {/* The single fact that carries the card. */}
              <div className="mt-1 mb-1">
                <div
                  className="num leading-[0.95] font-bold"
                  style={{
                    color: t.ink,
                    fontSize: primary ? 'clamp(48px, 6.2vw, 68px)' : 'clamp(40px, 5vw, 54px)',
                    letterSpacing: '-0.035em',
                  }}
                >
                  {card.bigNumber}
                </div>
                <p
                  className="mt-1.5 max-w-[34ch] text-[12.5px] leading-[1.35] font-medium"
                  style={{ color: 'var(--body)' }}
                >
                  {card.bigCaption}
                </p>
              </div>

              <ol className="mt-3 grid gap-0">
                {card.flow.map((step, i) => (
                  <li key={step} className="relative grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 pb-3 last:pb-0">
                    <span className="relative flex justify-center">
                      <span
                        className="z-10 mt-[3px] h-[9px] w-[9px] shrink-0 rounded-full"
                        style={{
                          background: i === card.flow.length - 1 ? t.accent : 'var(--surface)',
                          border: `2px solid ${t.accent}`,
                        }}
                      />
                      {i < card.flow.length - 1 && (
                        <span
                          className="absolute top-[10px] bottom-[-4px] w-px"
                          style={{ background: 'var(--rule-strong)' }}
                        />
                      )}
                    </span>
                    <span className="text-[11.5px] leading-[1.4]" style={{ color: 'var(--body)' }}>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>

              <div
                className="mt-3 rounded-[4px] border px-2.5 py-2"
                style={{ borderColor: 'var(--rule)', background: 'var(--surface-2)' }}
              >
                <div className="eyebrow">Reach of one engineering fix</div>
                <div
                  className="num mt-0.5 text-[16px] font-semibold"
                  style={{ color: TONE_COLOR[reach.tone] }}
                >
                  {reach.value}
                </div>
                <p className="mt-0.5 text-[10.5px] leading-snug" style={{ color: 'var(--muted)' }}>
                  {reach.detail}
                </p>
              </div>

              <div className="mt-auto pt-3">
                <div
                  className="rounded-[3px] px-2 py-1.5 text-[11px] font-semibold tracking-[0.02em]"
                  style={{ background: t.accent, color: t.onAccent }}
                >
                  {card.label}
                </div>
                <p className="mt-2 text-[10.5px] leading-[1.45]" style={{ color: 'var(--muted)' }}>
                  {card.footnote}
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      <div
        className="mt-4 rounded-[5px] border px-4 py-3"
        style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}
      >
        <p className="max-w-[86ch] text-[12.5px] leading-[1.55]" style={{ color: 'var(--body)' }}>
          <strong style={{ color: 'var(--ink)' }}>The asymmetry, not the cost, is the argument.</strong>{' '}
          {ratioPct(TIER_DETAIL.t1.velocityShare, 0)} of developer velocity went to{' '}
          {TIER_DETAIL.t1.velocityAccounts} of {TIERS.t1.accounts} Tier-1 customers over the last two
          quarters, and none of it amortises across the other {TIERS.t1.accounts - TIER_DETAIL.t1.velocityAccounts}.
          Tier 2’s constraint is one shared cluster serving {TIERS.t2.accounts} customers — the same fix,
          once. That is why the incremental dollar moves, not because Tier 1 is unprofitable. Nobody has
          measured whether it is.
        </p>
      </div>
    </Section>
  )
}
