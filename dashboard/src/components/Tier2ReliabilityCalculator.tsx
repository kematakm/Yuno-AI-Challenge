import { useMemo } from 'react'
import { BENCHMARKS, availabilityVerdict, churnVerdict } from '@/data/benchmarks'
import { TIERS, TIER_DETAIL } from '@/data/caseFacts'
import { derivedAvgArr, tier2Reliability } from '@/lib/calc'
import { hours, hoursHuman, num, pct, usd, usdExact } from '@/lib/format'
import { SPEC } from '@/lib/validation'
import { useNumericFields } from '@/hooks/useNumericFields'
import { DowntimeChart } from './charts/DowntimeChart'
import { BenchmarkScale } from './ui/BenchmarkScale'
import { Card, Note, Stat, StatusDot } from './ui/Card'
import { NumericField } from './ui/Field'
import { PanelHeader } from './ui/PanelHeader'
import { DataNeeded, Tag } from './ui/Tag'
import { Info } from './ui/Tooltip'

type Key =
  | 'targetChurn'
  | 'targetAvailability'
  | 'netNewCustomers'
  | 'infraCostGrowth'
  | 'engInvestment'
  | 'avgArr'

const T2 = TIERS.t2
const DERIVED_AVG_ARR = Math.round(derivedAvgArr('t2'))

const INITIAL: Record<Key, string> = {
  targetChurn: '10',
  targetAvailability: '99.9',
  netNewCustomers: '0',
  infraCostGrowth: '0',
  engInvestment: '',
  avgArr: String(DERIVED_AVG_ARR),
}

const SPECS: Record<Key, (typeof SPEC)[keyof typeof SPEC]> = {
  targetChurn: SPEC.rate,
  targetAvailability: SPEC.availability,
  netNewCustomers: SPEC.netCustomers,
  infraCostGrowth: SPEC.growth,
  engInvestment: SPEC.money,
  avgArr: SPEC.money,
}

/**
 * C. Tier-2 reliability and retention.
 * The arithmetic is expected-value math on logo counts. It deliberately does
 * not model a causal link from availability to churn — that link is the
 * hypothesis this investment is designed to test.
 */
export function Tier2ReliabilityCalculator() {
  const { fields, set, resetAll } = useNumericFields<Key>(INITIAL, SPECS)

  const targetChurn = fields.targetChurn.value
  const targetAvailability = fields.targetAvailability.value
  const avgArr = fields.avgArr.value

  const result = useMemo(
    () =>
      tier2Reliability({
        targetChurnPct: targetChurn ?? (T2.logoChurn ?? 0) * 100,
        targetAvailabilityPct: targetAvailability ?? (T2.availability ?? 0),
        netNewCustomers: fields.netNewCustomers.value ?? 0,
        infraCostGrowthPct: fields.infraCostGrowth.value ?? 0,
        additionalEngInvestment: fields.engInvestment.value,
        avgArr: avgArr ?? DERIVED_AVG_ARR,
      }),
    [targetChurn, targetAvailability, avgArr, fields.netNewCustomers.value, fields.infraCostGrowth.value, fields.engInvestment.value],
  )

  const churnEntered = targetChurn !== null
  const availEntered = targetAvailability !== null
  const arrEntered = avgArr !== null

  return (
    <Card padded={false}>
      <PanelHeader
        letter="C"
        title="Tier 2 reliability & retention"
        subtitle="What a platform fix is worth if it works — and an explicit statement of what has not been shown."
        right={
          <button type="button" className="btn" onClick={resetAll}>
            Reset assumptions
          </button>
        }
      />

      <div className="p-4">
        <Note tone="flag" title="Hypothesis, not a finding">
          Nothing in the packet establishes that Tier-2 reliability <em>causes</em> Tier-2 churn. Both
          are true at once — 98.2% availability and 16% annual logo churn — and rate-limit failures
          land in peak business hours ({TIER_DETAIL.t2.peakWindow}), which makes the link plausible.
          This calculator prices <strong>what a churn improvement would be worth</strong>. It does not
          claim reliability will deliver it. Coded churn-reason analysis is a day-30 deliverable
          precisely because this is unproven.
        </Note>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* inputs */}
          <div className="grid content-start gap-3">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Known label="Customers" value={num(T2.accounts)} />
              <Known label="ARR" value={usd(T2.arr)} />
              <Known label="Logo churn" value={pct((T2.logoChurn ?? 0) * 100, 0)} />
              <Known label="Availability" value={`${T2.availability}%`} />
            </div>

            <div className="hairline pt-3">
              <span className="eyebrow mb-2 flex items-center gap-1.5">
                Your assumptions <Tag kind="input" />
              </span>
              <div className="grid gap-x-3 sm:grid-cols-2">
                <NumericField
                  label="Target logo churn"
                  suffix="%"
                  raw={fields.targetChurn.raw}
                  error={fields.targetChurn.error}
                  onChange={(v) => set('targetChurn', v)}
                  hint="External benchmark for healthy mid-market logo churn is 5–10%, with some ranges to 12%."
                />
                <NumericField
                  label="Target availability"
                  suffix="%"
                  raw={fields.targetAvailability.raw}
                  error={fields.targetAvailability.error}
                  onChange={(v) => set('targetAvailability', v)}
                  hint="Common production SaaS/API baseline is ~99.9%. 99.95% stronger, 99.99% mission-critical."
                />
                <NumericField
                  label="Net new customers"
                  raw={fields.netNewCustomers.raw}
                  error={fields.netNewCustomers.error}
                  onChange={(v) => set('netNewCustomers', v)}
                  hint="Net of churn. Used to show the retention gain at the larger base."
                />
                <NumericField
                  label="Infrastructure cost growth"
                  suffix="%"
                  raw={fields.infraCostGrowth.raw}
                  error={fields.infraCostGrowth.error}
                  onChange={(v) => set('infraCostGrowth', v)}
                  hint="Applied to the $4K per-customer figure. Holding it flat assumes linear scaling on a cluster that already fails at peak — treat the result as a floor."
                />
                <NumericField
                  label="Average ARR per customer"
                  prefix="$"
                  raw={fields.avgArr.raw}
                  error={fields.avgArr.error}
                  onChange={(v) => set('avgArr', v)}
                  hint={`Defaults to the derived figure: ${usdExact(T2.arr)} ÷ ${T2.accounts} = ${usdExact(DERIVED_AVG_ARR)}. Churning customers may not be average-sized.`}
                />
                <NumericField
                  label="Additional engineering investment"
                  prefix="$"
                  raw={fields.engInvestment.raw}
                  error={fields.engInvestment.error}
                  onChange={(v) => set('engInvestment', v)}
                  hint="Optional. Used only to express the illustrative ARR protected as a multiple of spend."
                />
              </div>
            </div>

            <div className="hairline pt-3">
              <span className="eyebrow mb-1.5">Logo churn against the external band</span>
              <BenchmarkScale
                min={0}
                max={20}
                ticks={[0, 5, 10, 15, 20]}
                bands={[
                  {
                    from: BENCHMARKS.midMarketLogoChurn.low,
                    to: BENCHMARKS.midMarketLogoChurn.high,
                    label: 'Healthy mid-market logo churn, 5–10%',
                    short: '5–10%',
                    tone: 'good',
                  },
                  { from: 10, to: 12, label: 'Outer edge of benchmark, to 12%', short: '10–12%', tone: 'watch' },
                ]}
                markers={[
                  {
                    value: (T2.logoChurn ?? 0) * 100,
                    label: 'Today',
                    color: 'var(--bad)',
                    side: 'above',
                  },
                  ...(churnEntered
                    ? [{ value: targetChurn, label: 'Target', color: TIERS.t2.ink, side: 'below' as const }]
                    : []),
                ]}
                caption="Shaded bands are external benchmarks. Pointers are the company figure and your target."
              />
            </div>
          </div>

          {/* outputs */}
          <div className="grid content-start gap-3.5">
            {!churnEntered || !arrEntered ? (
              <Note tone="flag" title="Inputs required">
                Enter a target churn rate and an average ARR to model retention value.
              </Note>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat
                    label="Logos lost today"
                    value={result.currentLogosLost.toFixed(1)}
                    size="sm"
                    sub={`${T2.accounts} × ${pct(result.currentChurnPct, 0)}`}
                    tag={<Tag kind="derived" />}
                  />
                  <Stat
                    label="Logos lost at target"
                    value={result.targetLogosLost.toFixed(1)}
                    size="sm"
                    sub={`${T2.accounts} × ${pct(targetChurn, 0)}`}
                    tag={<Tag kind="calc" />}
                  />
                  <Stat
                    label="Additional logos retained"
                    value={result.logosRetained.toFixed(1)}
                    size="sm"
                    tone={result.logosRetained >= 0 ? 'var(--good)' : 'var(--bad)'}
                    sub="Expected value, not a countable list of saved customers"
                    tag={<Tag kind="calc" />}
                  />
                  <Stat
                    label="Illustrative ARR protected"
                    value={usd(result.arrProtected)}
                    size="sm"
                    tone={result.arrProtected >= 0 ? 'var(--good)' : 'var(--bad)'}
                    sub={`${result.logosRetained.toFixed(1)} × ${usdExact(avgArr)} average ARR`}
                    tag={<Tag kind="calc" label="Illustrative" />}
                  />
                </div>

                <Note>
                  <strong style={{ color: 'var(--ink)' }}>Illustrative, using an average-ARR assumption.</strong>{' '}
                  {result.logosRetained.toFixed(1)} logos is expected-value arithmetic across{' '}
                  {T2.accounts} customers, not {Math.round(result.logosRetained)} identifiable accounts,
                  and it assumes churning customers are average-sized. Churn improvement is the
                  assumption; the ARR figure is only what that assumption would be worth.
                  {fields.netNewCustomers.value !== null && fields.netNewCustomers.value !== 0 && (
                    <>
                      {' '}
                      At the projected base of {num(result.projectedCustomers)} customers the same
                      churn delta retains {result.projectedLogosRetained.toFixed(1)} logos ≈{' '}
                      <strong>{usd(result.projectedArrProtected)}</strong>.
                    </>
                  )}
                  {result.returnMultiple !== null && (
                    <>
                      {' '}
                      Against {usd(fields.engInvestment.value ?? 0)} of additional engineering
                      investment that is{' '}
                      <strong>{result.returnMultiple.toFixed(1)}× in first-year ARR protected</strong>{' '}
                      — a scenario ratio, not a return on investment.
                    </>
                  )}
                </Note>
              </>
            )}

            {availEntered && (
              <>
                <DowntimeChart
                  currentAvailability={T2.availability ?? 0}
                  targetAvailability={targetAvailability}
                />
                <div className="grid grid-cols-3 gap-3">
                  <Stat
                    label="Downtime today"
                    value={hours(result.currentDowntime)}
                    size="sm"
                    sub={hoursHuman(result.currentDowntime)}
                    tag={<StatusDot {...availabilityVerdict(T2.availability ?? 0)} label="Below baseline" />}
                  />
                  <Stat
                    label="Downtime at target"
                    value={hours(result.targetDowntime)}
                    size="sm"
                    sub={hoursHuman(result.targetDowntime)}
                    tag={<StatusDot {...availabilityVerdict(targetAvailability)} />}
                  />
                  <Stat
                    label="Downtime eliminated"
                    value={hours(Math.max(0, result.downtimeEliminated))}
                    size="sm"
                    tone="var(--good)"
                    sub="Per year, across all 140 customers at once"
                    tag={<Tag kind="calc" />}
                  />
                </div>
              </>
            )}

            <div className="hairline grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3">
              <Stat
                label="Hosting per customer"
                value={usd(result.projectedHostingPerCustomer, { decimals: 1 })}
                size="sm"
                sub={
                  result.projectedHostingPerCustomer === result.currentHostingPerCustomer
                    ? 'Unchanged from today'
                    : `from ${usd(result.currentHostingPerCustomer)} today`
                }
                tag={<Tag kind="calc" />}
              />
              <Stat
                label="Projected hosting total"
                value={usd(result.projectedHostingTotal)}
                size="sm"
                sub={`${num(result.projectedCustomers)} customers, linear scaling assumed`}
                tag={<Tag kind="calc" />}
              />
              <Stat
                label="Cost per customer at 200"
                value={<DataNeeded what="cluster capacity cost curve above ~200 customers" />}
                size="sm"
                sub="Linear per-customer cost is a floor, not an estimate"
                tag={<Tag kind="needed" />}
              />
            </div>

            <p className="text-[10.5px] leading-snug" style={{ color: 'var(--muted)' }}>
              Churn status today:{' '}
              <span className="font-semibold">{churnVerdict((T2.logoChurn ?? 0) * 100).text}</span> ·
              Availability status today:{' '}
              <span className="font-semibold">{availabilityVerdict(T2.availability ?? 0).text}</span>
              <Info>
                Both verdicts come from published external ranges, not from internal judgement. Where
                no benchmark exists, this dashboard assigns no status.
              </Info>
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function Known({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[4px] border px-2.5 py-1.5"
      style={{ borderColor: 'var(--rule)', background: 'var(--surface-2)' }}
    >
      <div className="eyebrow flex items-center gap-1">
        {label} <Tag kind="fact" label="Fact" />
      </div>
      <div className="num mt-0.5 text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>
        {value}
      </div>
    </div>
  )
}
