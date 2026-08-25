import { useMemo } from 'react'
import { RECOMMENDED_ALLOCATION } from '@/data/allocation'
import { BENCHMARKS } from '@/data/benchmarks'
import { COMPANY, TIERS, TIER_DETAIL } from '@/data/caseFacts'
import { derivedAvgArr, sreFteEquivalent, tier3Funnel, tier3OriginShareOfTier2Base } from '@/lib/calc'
import { num, pct, usd, usdExact } from '@/lib/format'
import { SPEC } from '@/lib/validation'
import { useNumericFields } from '@/hooks/useNumericFields'
import { AlertShareChart } from './charts/AlertShareChart'
import { BenchmarkScale } from './ui/BenchmarkScale'
import { Card, Note, Stat } from './ui/Card'
import { NumericField } from './ui/Field'
import { PanelHeader } from './ui/PanelHeader'
import { DataNeeded, Tag } from './ui/Tag'
import { Info } from './ui/Tooltip'

type Key =
  | 'cohortSize'
  | 'conversionRate'
  | 'alertReduction'
  | 'avgArrAfterGraduation'
  | 'downstreamNrr'
  | 'totalMonthlyAlerts'
  | 'sreHoursPerAlert'
  | 'sreCostPerHour'

const T3 = TIERS.t3
const DERIVED_T2_AVG_ARR = Math.round(derivedAvgArr('t2'))

const INITIAL: Record<Key, string> = {
  cohortSize: '', // never measured — must stay blank
  conversionRate: '', // never measured — must stay blank
  alertReduction: '60',
  avgArrAfterGraduation: String(DERIVED_T2_AVG_ARR),
  downstreamNrr: '',
  totalMonthlyAlerts: '',
  sreHoursPerAlert: '',
  sreCostPerHour: '',
}

const SPECS: Record<Key, (typeof SPEC)[keyof typeof SPEC]> = {
  cohortSize: SPEC.count,
  conversionRate: SPEC.rate,
  alertReduction: SPEC.rate,
  avgArrAfterGraduation: SPEC.money,
  downstreamNrr: { min: 0, max: 400, unitLabel: '%' },
  totalMonthlyAlerts: SPEC.count,
  sreHoursPerAlert: SPEC.hoursPerAlert,
  sreCostPerHour: SPEC.money,
}

/**
 * D. Tier-3 funnel and SRE burden.
 * The conversion inputs load blank by design. The company has 22 known
 * graduates and no cohort denominator, so no conversion rate is displayed until
 * a user supplies the denominator themselves.
 */
export function Tier3FunnelCalculator() {
  const { fields, set, resetAll } = useNumericFields<Key>(INITIAL, SPECS)

  const reduction = fields.alertReduction.value ?? 0
  const result = useMemo(
    () =>
      tier3Funnel({
        historicalCohortSize: fields.cohortSize.value,
        modelledConversionPct: fields.conversionRate.value,
        targetAlertReductionPct: reduction,
        avgArrAfterGraduation: fields.avgArrAfterGraduation.value ?? DERIVED_T2_AVG_ARR,
        downstreamNrrPct: fields.downstreamNrr.value,
        totalMonthlyAlerts: fields.totalMonthlyAlerts.value,
        sreHoursPerAlert: fields.sreHoursPerAlert.value,
        sreCostPerHour: fields.sreCostPerHour.value,
      }),
    [
      fields.cohortSize.value,
      fields.conversionRate.value,
      reduction,
      fields.avgArrAfterGraduation.value,
      fields.downstreamNrr.value,
      fields.totalMonthlyAlerts.value,
      fields.sreHoursPerAlert.value,
      fields.sreCostPerHour.value,
    ],
  )

  const cohortEntered = fields.cohortSize.value !== null && fields.cohortSize.value > 0

  return (
    <Card padded={false}>
      <PanelHeader
        letter="D"
        title="Tier 3 funnel & SRE burden"
        subtitle="Two questions: is the sandbox creating customers, and what would the guardrails give back? Neither can be answered from the packet alone."
        right={
          <button type="button" className="btn" onClick={resetAll}>
            Reset assumptions
          </button>
        }
      />

      <div className="p-4">
        <div className="grid gap-2.5 sm:grid-cols-3">
          <Known label="Active API keys" value={num(T3.accounts)} note="not customers" />
          <Known
            label="Known Tier-2 customers from Tier 3"
            value={num(TIER_DETAIL.t3.knownTier2Graduates)}
            note={`${pct(tier3OriginShareOfTier2Base())} of today’s Tier-2 base — not a conversion rate`}
          />
          <Known
            label="Share of automated alerts"
            value={pct(TIER_DETAIL.t3.alertShare * 100, 0)}
            note={`Carried by ${COMPANY.engineering.sre} SREs`}
          />
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* inputs */}
          <div className="grid content-start gap-3">
            <span className="eyebrow flex items-center gap-1.5">
              Your assumptions <Tag kind="input" />
            </span>

            <div className="grid gap-x-3 sm:grid-cols-2">
              <NumericField
                label="Historical eligible Tier-3 cohort"
                raw={fields.cohortSize.raw}
                error={fields.cohortSize.error}
                onChange={(v) => set('cohortSize', v)}
                emphasise
                hint={`Total developers who signed up across the ${TIER_DETAIL.t3.launchedMonthsAgo} months the sandbox has existed and had the opportunity to graduate. This is the denominator the company has never captured. Today's 1,200 active keys are not it.`}
              />
              <NumericField
                label="Modelled Tier-3 → Tier-2 conversion"
                suffix="%"
                raw={fields.conversionRate.raw}
                error={fields.conversionRate.error}
                onChange={(v) => set('conversionRate', v)}
                hint="A forward-looking assumption for the ARR scenario. Deliberately not pre-filled — there is no company figure to pre-fill it with."
              />
              <NumericField
                label="Average Tier-2 ARR after graduation"
                prefix="$"
                raw={fields.avgArrAfterGraduation.raw}
                error={fields.avgArrAfterGraduation.error}
                onChange={(v) => set('avgArrAfterGraduation', v)}
                hint={`Defaults to the Tier-2 average (${usdExact(DERIVED_T2_AVG_ARR)}). Whether graduates land at, above or below that average is unmeasured.`}
              />
              <NumericField
                label="Downstream NRR of graduates"
                suffix="%"
                raw={fields.downstreamNrr.raw}
                error={fields.downstreamNrr.error}
                onChange={(v) => set('downstreamNrr', v)}
                hint="Retention of Tier-2 customers that originated in Tier 3, versus the 106% Tier-2 average. Decides whether graduates are better or worse than bought customers."
              />
              <NumericField
                label="Target alert reduction"
                suffix="%"
                raw={fields.alertReduction.raw}
                error={fields.alertReduction.error}
                onChange={(v) => set('alertReduction', v)}
                hint="Reduction in Tier-3-originated alerts after quotas, trial rate limiting, abuse detection and non-paging routing."
              />
              <NumericField
                label="Total automated alerts / month"
                raw={fields.totalMonthlyAlerts.raw}
                error={fields.totalMonthlyAlerts.error}
                onChange={(v) => set('totalMonthlyAlerts', v)}
                hint="The packet states Tier 3's 52% share but never the absolute volume. Without it, only shares can be computed."
              />
              <NumericField
                label="SRE hours per alert"
                raw={fields.sreHoursPerAlert.raw}
                error={fields.sreHoursPerAlert.error}
                onChange={(v) => set('sreHoursPerAlert', v)}
                hint="Triage plus context-switch cost. Optional."
              />
              <NumericField
                label="Fully loaded SRE cost per hour"
                prefix="$"
                raw={fields.sreCostPerHour.raw}
                error={fields.sreCostPerHour.error}
                onChange={(v) => set('sreCostPerHour', v)}
                hint="Optional. Converts reclaimed hours into a dollar figure."
              />
            </div>

            <Note tone="flag" title="Two divisions this dashboard will not perform">
              <ul className="mt-1 grid gap-1">
                <li>
                  <strong>
                    {TIER_DETAIL.t3.knownTier2Graduates} ÷ {num(T3.accounts)}
                  </strong>{' '}
                  — active keys today are not the historical population that could have converted.
                </li>
                <li>
                  <strong>
                    {TIER_DETAIL.t3.knownTier2Graduates} ÷ {TIERS.t2.accounts} ={' '}
                    {pct(tier3OriginShareOfTier2Base())}
                  </strong>{' '}
                  — that is the share of the current Tier-2 base that came from Tier 3, and nothing
                  more.
                </li>
              </ul>
            </Note>
          </div>

          {/* outputs */}
          <div className="grid content-start gap-3.5">
            <div>
              <span className="eyebrow mb-1.5 flex items-center">
                Cohort conversion
                <Info>
                  The 22 counts only Tier-3-originated customers who are still in Tier 2 today.
                  Graduates who later churned are not in it, so any rate computed from 22 is a lower
                  bound on true historical conversion.
                </Info>
              </span>

              {!cohortEntered ? (
                <Note tone="flag" title="Cannot be calculated">
                  Conversion rate cannot be calculated until a historical cohort size is entered. The
                  company has {TIER_DETAIL.t3.knownTier2Graduates} known graduates and no denominator:
                  signup cohorts were never captured across the channel’s{' '}
                  {TIER_DETAIL.t3.launchedMonthsAgo} months. Until then, no comparison against the
                  external 2–6% PLG benchmark is meaningful and none is shown.
                </Note>
              ) : (
                <>
                  <div className="mb-3 grid grid-cols-2 gap-3">
                    <Stat
                      label="Observed conversion (lower bound)"
                      value={pct(result.observedConversionPct ?? 0, 2)}
                      size="md"
                      sub={`${TIER_DETAIL.t3.knownTier2Graduates} still-active graduates ÷ ${num(
                        fields.cohortSize.value ?? 0,
                      )} cohort`}
                      tag={<Tag kind="calc" />}
                    />
                    <Stat
                      label="Modelled graduates"
                      value={
                        result.modelledGraduates === null ? (
                          <DataNeeded what="a modelled conversion rate" />
                        ) : (
                          result.modelledGraduates.toFixed(1)
                        )
                      }
                      size="md"
                      sub={
                        result.modelledGraduates === null
                          ? 'Enter a modelled conversion rate'
                          : `${num(fields.cohortSize.value ?? 0)} × ${pct(fields.conversionRate.value ?? 0)}`
                      }
                      tag={<Tag kind={result.modelledGraduates === null ? 'needed' : 'calc'} label={result.modelledGraduates === null ? undefined : 'Modelled'} />}
                    />
                  </div>

                  <BenchmarkScale
                    min={0}
                    max={12}
                    ticks={[0, 2, 4, 6, 8, 10, 12]}
                    bands={[
                      {
                        from: BENCHMARKS.plgConversion.low,
                        to: BENCHMARKS.plgConversion.high,
                        label: 'Typical developer sandbox → paid conversion, 2–6%',
                        short: '2–6%',
                        tone: 'bench',
                      },
                      {
                        from: BENCHMARKS.plgConversion.strongLow,
                        to: BENCHMARKS.plgConversion.strongHigh,
                        label: 'Strong developer sandbox conversion, 7–10%',
                        short: '7–10%',
                        tone: 'good',
                      },
                    ]}
                    markers={[
                      {
                        value: result.observedConversionPct ?? 0,
                        label: 'Observed floor',
                        color: TIERS.t3.ink,
                        side: 'above',
                      },
                      ...(result.modelledGraduates !== null
                        ? [
                            {
                              value: fields.conversionRate.value ?? 0,
                              label: 'Modelled',
                              color: 'var(--pv-input)',
                              side: 'below' as const,
                            },
                          ]
                        : []),
                    ]}
                    caption="External free-developer-to-paid conversion benchmark, shown only once you supply a denominator. The observed pointer is a floor, not a measured rate."
                  />
                </>
              )}
            </div>

            <div className="hairline grid grid-cols-2 gap-3 pt-3">
              <Stat
                label="Modelled downstream ARR"
                value={
                  result.modelledDownstreamArr === null ? (
                    <DataNeeded what="cohort size and a conversion assumption" />
                  ) : (
                    usd(result.modelledDownstreamArr)
                  )
                }
                size="sm"
                sub={
                  result.modelledDownstreamArr === null
                    ? 'Needs cohort size × conversion rate'
                    : `Scenario only — cohort × conversion × ${usd(fields.avgArrAfterGraduation.value ?? 0)}`
                }
                tag={
                  <Tag
                    kind={result.modelledDownstreamArr === null ? 'needed' : 'calc'}
                    label={result.modelledDownstreamArr === null ? undefined : 'Modelled — not actual ARR'}
                  />
                }
              />
              <Stat
                label="Graduate retention vs Tier-2 average"
                value={
                  fields.downstreamNrr.value === null ? (
                    <DataNeeded what="downstream NRR by customer origin" />
                  ) : (
                    pct(fields.downstreamNrr.value, 0)
                  )
                }
                size="sm"
                sub={
                  fields.downstreamNrr.value === null
                    ? 'The single most decision-relevant missing number in this tier'
                    : `Tier-2 average is ${pct((TIERS.t2.nrr ?? 0) * 100, 0)} — ${
                        fields.downstreamNrr.value >= TIERS.t2.nrr * 100 ? 'above' : 'below'
                      } it`
                }
                tag={<Tag kind={fields.downstreamNrr.value === null ? 'needed' : 'input'} />}
              />
            </div>

            <div className="hairline pt-3">
              <AlertShareChart currentSharePct={result.currentAlertShare} reductionPct={reduction} />

              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  label="Tier-3 alert share today"
                  value={pct(result.currentAlertShare, 0)}
                  size="sm"
                  tag={<Tag kind="fact" />}
                />
                <Stat
                  label="Share after reduction"
                  value={pct(result.postFixAlertShare)}
                  size="sm"
                  sub="Share falls more slowly than volume — the other half is unchanged"
                  tag={<Tag kind="calc" />}
                />
                <Stat
                  label="Tier-3 alerts eliminated / month"
                  value={
                    result.alertsEliminated === null ? (
                      <DataNeeded what="total monthly alert volume" />
                    ) : (
                      num(result.alertsEliminated, 0)
                    )
                  }
                  size="sm"
                  tag={<Tag kind={result.alertsEliminated === null ? 'needed' : 'calc'} />}
                />
                <Stat
                  label="SRE capacity reclaimed"
                  value={
                    result.sreHoursReclaimedAnnual === null ? (
                      <DataNeeded what="alert volume and SRE hours per alert" />
                    ) : (
                      `${num(result.sreHoursReclaimedAnnual, 0)} hrs/yr`
                    )
                  }
                  size="sm"
                  sub={
                    result.sreHoursReclaimedAnnual === null
                      ? 'Needs alert volume and hours per alert'
                      : `≈ ${sreFteEquivalent(result.sreHoursReclaimedAnnual).toFixed(2)} FTE of a ${
                          COMPANY.engineering.sre
                        }-person team${
                          result.sreCostReclaimedAnnual !== null
                            ? ` · ${usd(result.sreCostReclaimedAnnual)}/yr`
                            : ''
                        }`
                  }
                  tag={<Tag kind={result.sreHoursReclaimedAnnual === null ? 'needed' : 'calc'} />}
                />
              </div>
            </div>

            <Note>
              <strong style={{ color: 'var(--ink)' }}>
                What the {RECOMMENDED_ALLOCATION.t3}% buys.
              </strong>{' '}
              Quotas, trial-tier
              rate limiting, abuse detection and non-paging alert routing are cheap, automated and
              apply to every key at once. They are also the only way to find out whether this channel
              is an acquisition engine or a cost — killing it now forecloses the measurement. Tier-3
              compute has never been metered, which makes it the most plausible unattributed line in a
              cloud bill that grew {pct(COMPANY.cloudCostGrowthYoY * 100, 0)} last year.
            </Note>
          </div>
        </div>
      </div>
    </Card>
  )
}

function Known({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div
      className="rounded-[4px] border px-2.5 py-2"
      style={{ borderColor: 'var(--rule)', background: 'var(--surface-2)' }}
    >
      <div className="eyebrow flex items-center gap-1">
        {label} <Tag kind="fact" label="Fact" />
      </div>
      <div className="num mt-0.5 text-[16px] font-semibold" style={{ color: 'var(--ink)' }}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--muted)' }}>
        {note}
      </div>
    </div>
  )
}
