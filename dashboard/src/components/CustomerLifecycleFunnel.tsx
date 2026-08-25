import { TIERS, TIER_DETAIL } from '@/data/caseFacts'
import { tier3OriginShareOfTier2Base } from '@/lib/calc'
import { num } from '@/lib/format'
import { Card, Note, Section } from './ui/Card'
import { DataNeeded, Tag } from './ui/Tag'
import { Info } from './ui/Tooltip'

const STAGES = [
  {
    tier: TIERS.t3,
    width: '100%',
    count: `${num(TIERS.t3.accounts)} active API keys`,
    caption: 'Self-serve sandbox · automated setup · launched 14 months ago',
  },
  {
    tier: TIERS.t2,
    width: '64%',
    count: `${num(TIERS.t2.accounts)} customers`,
    caption: 'Shared multi-tenant platform · production traffic',
  },
  {
    tier: TIERS.t1,
    width: '34%',
    count: `${num(TIERS.t1.accounts)} customers`,
    caption: 'Single-tenant isolation · bespoke engineering',
  },
]

/**
 * The funnel section exists to expose the missing reporting architecture, not
 * to present a conversion story. Every transition rate between these stages is
 * unmeasured, and the one number we do have (22) is routinely divided by the
 * wrong denominator.
 */
export function CustomerLifecycleFunnel() {
  const originShare = tier3OriginShareOfTier2Base()

  return (
    <Section
      id="funnel"
      eyebrow="Customer growth funnel"
      title="The funnel we cannot currently measure"
      lede="One transition figure exists in the entire packet. Everything else that would tell us whether the self-serve channel creates enterprise customers has never been captured."
      aside={<Tag kind="needed" label="3 of 4 transitions unmeasured" />}
    >
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-semibold">
              Tier 3 → Tier 2 → Tier 1
              <Info>
                Band widths are schematic. The three stages are counted in different units — API keys
                for Tier 3, customers for Tier 2 and Tier 1 — so the widths are not to scale and must
                not be read as a conversion shape.
              </Info>
            </h3>
            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
              widths schematic
            </span>
          </div>

          <div className="grid gap-0">
            {STAGES.map((s, i) => (
              <div key={s.tier.id}>
                <div
                  className="mx-auto rounded-[4px] px-3 py-2.5 text-center"
                  style={{ width: s.width, background: s.tier.accent }}
                >
                  <div
                    className="text-[10px] font-bold tracking-[0.1em]"
                    style={{ color: s.tier.onAccent, opacity: 0.85 }}
                  >
                    {s.tier.name} · {s.tier.role}
                  </div>
                  <div className="num text-[17px] font-semibold" style={{ color: s.tier.onAccent }}>
                    {s.count}
                  </div>
                  <div
                    className="text-[10px] leading-tight"
                    style={{ color: s.tier.onAccent, opacity: 0.8 }}
                  >
                    {s.caption}
                  </div>
                </div>

                {i < STAGES.length - 1 && (
                  <div className="my-2 grid gap-1.5">
                    <div className="text-center text-[13px] leading-none" style={{ color: 'var(--rule-strong)' }}>
                      ▼
                    </div>
                    {i === 0 ? (
                      <div className="grid gap-1.5">
                        <TransitionRow
                          label={`${TIER_DETAIL.t3.knownTier2Graduates} known current Tier-2 customers originated in Tier 3`}
                          value={<Tag kind="fact" label="Case fact" />}
                        />
                        <TransitionRow
                          label="Historical Tier-3 → Tier-2 cohort conversion rate"
                          value={<DataNeeded what="historical signup cohort denominators" />}
                        />
                        <TransitionRow
                          label="Retention / NRR of Tier-3-originated Tier-2 customers"
                          value={<DataNeeded what="downstream retention by origin" />}
                        />
                      </div>
                    ) : (
                      <TransitionRow
                        label="Tier-2 → Tier-1 graduation rate"
                        value={<DataNeeded what="Tier-2 to Tier-1 graduation tracking" />}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
            <h3 className="mb-2 text-[13px] font-semibold">What the number 22 is — and is not</h3>

            <div
              className="mb-2.5 rounded-[4px] border p-2.5"
              style={{ borderColor: 'var(--rule)', background: 'var(--surface-2)' }}
            >
              <div className="eyebrow">What it is</div>
              <p className="mt-1 text-[12px] leading-[1.45]" style={{ color: 'var(--body)' }}>
                <strong style={{ color: 'var(--ink)' }}>
                  {TIER_DETAIL.t3.knownTier2Graduates} of {TIERS.t2.accounts} ≈ {originShare.toFixed(1)}%
                </strong>{' '}
                of the <em>current</em> Tier-2 customer base originated in Tier 3 and upgraded when
                application traffic crossed production thresholds.
              </p>
              <p className="mt-1.5 text-[11px] leading-snug" style={{ color: 'var(--muted)' }}>
                It is also a floor: customers who graduated and later churned are not in the 22.
              </p>
            </div>

            <Note tone="flag" title="Not a conversion rate">
              <ul className="mt-1 grid gap-1.5">
                <li>
                  <strong>{originShare.toFixed(1)}% is not the Tier-3 conversion rate.</strong> Its
                  denominator is today’s Tier-2 base, not a cohort of sandbox signups.
                </li>
                <li>
                  <strong>
                    {TIER_DETAIL.t3.knownTier2Graduates} ÷ {num(TIERS.t3.accounts)} is not a conversion
                    rate either.
                  </strong>{' '}
                  Currently active API keys are not the historical population that had the opportunity
                  to convert.
                </li>
                <li>
                  The true rate needs monthly signup cohorts across all{' '}
                  {TIER_DETAIL.t3.launchedMonthsAgo} months of the channel’s life. Those denominators
                  were never captured.
                </li>
              </ul>
            </Note>
          </Card>

          <Card>
            <h3 className="mb-2 text-[13px] font-semibold">The reporting architecture that is missing</h3>
            <ul className="grid gap-2">
              {[
                { m: 'Tier-3 → Tier-2 cohort conversion, by monthly cohort', why: 'Decides whether the channel is an acquisition engine or a cost' },
                { m: 'Time to graduate from first key to production traffic', why: 'Tells us whether to invest in activation or in guardrails' },
                { m: 'Retention / NRR of Tier-3-originated customers', why: 'Decides whether graduates are better or worse than bought customers' },
                { m: 'Tier-2 → Tier-1 graduation rate and trigger', why: 'Tells us whether enterprise demand is created or merely inherited' },
                { m: 'Tier-3 compute cost per active key', why: 'The only unattributed line in a cloud bill that grew 72%' },
              ].map((x) => (
                <li key={x.m} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
                  <span className="mt-[3px]">
                    <DataNeeded />
                  </span>
                  <span>
                    <span className="block text-[11.5px] leading-snug font-semibold" style={{ color: 'var(--ink)' }}>
                      {x.m}
                    </span>
                    <span className="block text-[10.5px] leading-snug" style={{ color: 'var(--muted)' }}>
                      {x.why}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Section>
  )
}

function TransitionRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-[4px] border border-dashed px-2.5 py-1.5"
      style={{ borderColor: 'var(--rule-strong)', background: 'var(--surface-2)' }}
    >
      <span className="text-[11px] leading-snug" style={{ color: 'var(--body)' }}>
        {label}
      </span>
      {value}
    </div>
  )
}
