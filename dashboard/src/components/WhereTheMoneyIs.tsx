import { BENCHMARKS } from '@/data/benchmarks'
import { COMPANY, STATED_HOSTING_TOTAL, TIERS, TIER_DETAIL } from '@/data/caseFacts'
import { hostingPctOfArr, statedHostingPctOfCompanyArr } from '@/lib/calc'
import { num, ratioPct, usd, usdExact } from '@/lib/format'
import { Card, Note, Section, Stat } from './ui/Card'
import { BenchmarkScale } from './ui/BenchmarkScale'
import { ShareBar } from './ui/ShareBar'
import { DataNeeded, Tag } from './ui/Tag'
import { Info } from './ui/Tooltip'

const T1 = TIERS.t1
const T2 = TIERS.t2
const T3 = TIERS.t3

const NEUTRAL = 'var(--rule-strong)'

/**
 * Questions 1 and 2: where the money is, and what it costs.
 * Putting revenue share, account share, infrastructure spend, engineering
 * velocity and alert volume on one axis is the whole point — none of these
 * distributions match each other.
 */
export function WhereTheMoneyIs() {
  const t1Cogs = hostingPctOfArr('t1') ?? 0
  const t2Cogs = hostingPctOfArr('t2') ?? 0

  return (
    <Section
      id="money"
      eyebrow="Questions 1 & 2"
      title="Where the money is — and what that revenue costs"
      lede="Five distributions across the same three tiers. They do not line up, and every gap between them is a capital-allocation question."
      aside={<Tag kind="fact" label="Case facts + derived shares" />}
    >
      <Card className="p-4 sm:p-5">
        <ul className="mb-3.5 flex flex-wrap gap-x-4 gap-y-1.5">
          {[T1, T2, T3].map((t) => (
            <li key={t.id} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
              <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: t.accent }} />
              {t.name} — {t.segment}
            </li>
          ))}
          <li className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
            <span
              className="h-2.5 w-4 rounded-[2px]"
              style={{
                background:
                  'repeating-linear-gradient(135deg, var(--surface-3) 0 5px, var(--rule) 5px 6px)',
                border: '1px solid var(--rule)',
              }}
            />
            Not attributed by tier
          </li>
        </ul>

        <div className="grid gap-3.5">
          <ShareBar
            label="ARR"
            sublabel="Where revenue sits today"
            total={usd(COMPANY.totalArr)}
            shares={[
              { id: 't1', label: 'Tier 1', value: T1.arr, color: T1.accent, fg: T1.onAccent },
              { id: 't2', label: 'Tier 2', value: T2.arr, color: T2.accent, fg: T2.onAccent },
              { id: 't3', label: 'Tier 3', value: T3.arr, color: T3.accent, fg: T3.onAccent },
            ]}
          />

          <ShareBar
            label="Accounts"
            sublabel={
              <>
                Mixed units
                <Info>
                  Tier 1 and Tier 2 are customer counts. Tier 3 is 1,200 active API keys, which is not
                  the same unit — a developer may hold several keys, and a key is not a paying logo.
                  Shown together only to convey scale.
                </Info>
              </>
            }
            total={`${num(T1.accounts + T2.accounts + T3.accounts)} units`}
            shares={[
              { id: 't1', label: 'Tier 1 customers', value: T1.accounts, color: T1.accent, fg: T1.onAccent },
              { id: 't2', label: 'Tier 2 customers', value: T2.accounts, color: T2.accent, fg: T2.onAccent },
              { id: 't3', label: 'Tier 3 API keys', value: T3.accounts, color: T3.accent, fg: T3.onAccent },
            ]}
          />

          <ShareBar
            label="Stated hosting spend"
            sublabel="Tier 3 excluded — never measured"
            total={usd(STATED_HOSTING_TOTAL)}
            shares={[
              { id: 't1', label: 'Tier 1 hosting', value: T1.hostingTotal ?? 0, color: T1.accent, fg: T1.onAccent },
              { id: 't2', label: 'Tier 2 hosting', value: T2.hostingTotal ?? 0, color: T2.accent, fg: T2.onAccent },
            ]}
            flag={<DataNeeded what="Tier 3 compute cost — described as negligible, never measured" />}
          />

          <ShareBar
            label="Developer velocity"
            sublabel="Last two quarters"
            total="100% of velocity"
            shares={[
              {
                id: 't1-3',
                label: '3 Tier-1 accounts',
                value: TIER_DETAIL.t1.velocityShare * 100,
                color: T1.accent,
                fg: T1.onAccent,
              },
              {
                id: 'rest',
                label: 'All other work — not attributed by tier',
                value: (1 - TIER_DETAIL.t1.velocityShare) * 100,
                color: NEUTRAL,
                hatched: true,
              },
            ]}
            flag={<Tag kind="needed" label="Remainder unattributed" />}
          />

          <ShareBar
            label="Automated alerts"
            sublabel="On-call pages"
            total="100% of alerts"
            shares={[
              { id: 't3', label: 'Tier 3', value: TIER_DETAIL.t3.alertShare * 100, color: T3.accent, fg: T3.onAccent },
              {
                id: 'rest',
                label: 'All other alerts — not attributed by tier',
                value: (1 - TIER_DETAIL.t3.alertShare) * 100,
                color: NEUTRAL,
                hatched: true,
              },
            ]}
            flag={<Tag kind="needed" label="Remainder unattributed" />}
          />
        </div>

        <div className="hairline mt-4 pt-3">
          <p className="max-w-[80ch] text-[12.5px] leading-[1.55]" style={{ color: 'var(--body)' }}>
            <strong style={{ color: 'var(--ink)' }}>Read the gaps.</strong> Tier 1 holds{' '}
            {ratioPct(T1.arr / COMPANY.totalArr, 0)} of ARR across {T1.accounts} customers and{' '}
            {ratioPct((T1.hostingTotal ?? 0) / STATED_HOSTING_TOTAL, 0)} of all measured hosting spend.
            Three of those customers took {ratioPct(TIER_DETAIL.t1.velocityShare, 0)} of developer
            velocity. Tier 3 is 88% of the account base, {ratioPct(T3.arr / COMPANY.totalArr, 0)} of
            revenue, {ratioPct(TIER_DETAIL.t3.alertShare, 0)} of the alerts — and an unmeasured share
            of the cloud bill.
          </p>
        </div>
      </Card>

      <div className="mt-4 grid gap-4">
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[13.5px] font-semibold">
              Infrastructure cost per ARR dollar, against architecture benchmarks
            </h3>
            <span className="flex gap-1.5">
              <Tag kind="derived" />
              <Tag kind="benchmark" />
            </span>
          </div>

          <BenchmarkScale
            min={0}
            max={45}
            ticks={[0, 10, 20, 30, 40]}
            bands={[
              {
                from: BENCHMARKS.cogsMultiTenant.low,
                to: BENCHMARKS.cogsMultiTenant.high,
                label: 'Multi-tenant infrastructure / COGS, 10–25% of revenue',
                short: '10–25%',
                tone: 'bench',
              },
              {
                from: BENCHMARKS.cogsSingleTenant.low,
                to: BENCHMARKS.cogsSingleTenant.high,
                label: 'Single-tenant infrastructure / delivery, 25–40% of revenue',
                short: '25–40%',
                tone: 'bench',
              },
            ]}
            markers={[
              { value: t2Cogs, label: 'Tier 2', sub: '$4K / customer', color: T2.ink, side: 'above' },
              { value: t1Cogs, label: 'Tier 1', sub: '$180K / customer', color: T1.ink, side: 'below' },
            ]}
            caption={
              <>
                Shaded ranges are external benchmarks for infrastructure/COGS as a share of revenue,
                shown for comparison only. They are not used to impute any company figure. Tier 1
                consumes roughly {(t1Cogs / t2Cogs).toFixed(1)}× the hosting per ARR dollar that Tier 2
                does, and sits below its own architecture's typical band — hosting alone, before
                engineering.
              </>
            }
          />

          <Note tone="flag" title="Not on this axis">
            Tier 3 cannot be plotted. Its compute is described as “negligible” but was never measured,
            and the CFO confirms no cost breakdown by tier exists. A number nobody produced is not a
            small number — it is an unknown one.
          </Note>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <Stat
              label="Stated hosting, company-wide"
              value={usd(STATED_HOSTING_TOTAL)}
              size="lg"
              sub={`${statedHostingPctOfCompanyArr().toFixed(1)}% of total ARR · ${usdExact(
                STATED_HOSTING_TOTAL,
              )} across Tier 1 and Tier 2 only`}
              tag={<Tag kind="derived" />}
            />
          </Card>

          <Card>
            <Stat
              label="Cloud spend growth vs revenue growth"
              value={
                <>
                  {ratioPct(COMPANY.cloudCostGrowthYoY, 0)}{' '}
                  <span className="text-[15px] font-normal" style={{ color: 'var(--muted)' }}>
                    vs {ratioPct(COMPANY.revenueGrowthYoY, 0)}
                  </span>
                </>
              }
              size="lg"
              sub="Infrastructure grew ~1.9× faster than revenue last year. The tier driving the divergence is unidentified."
              tag={<Tag kind="fact" />}
            />
          </Card>

          <Card>
            <Stat
              label="Fully loaded contribution margin by tier"
              value={<DataNeeded what="engineering, SRE, QA, support and implementation cost by customer" />}
              size="lg"
              sub="Hosting is the only cost currently attributable to a tier. Every profitability claim in this packet is unresolved until this exists."
              tag={<Tag kind="needed" />}
            />
          </Card>
        </div>
      </div>
    </Section>
  )
}
