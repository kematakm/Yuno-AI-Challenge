import { BENCHMARKS } from '@/data/benchmarks'
import { COMPANY, TIERS, TIER_DETAIL } from '@/data/caseFacts'
import { TIER1_COST_CATEGORIES } from '@/lib/calc'
import { pct, ratioPct, usd, usdExact } from '@/lib/format'
import { SPEC, parseNumeric } from '@/lib/validation'
import { SIGNAL_THRESHOLDS } from '@/lib/signals'
import { Interpretation, type Verdict } from './ui/Interpretation'
import type { Tier1Scenario } from '@/hooks/useScenario'
import { MarginWaterfall } from './charts/MarginWaterfall'
import { BenchmarkScale } from './ui/BenchmarkScale'
import { Card, Note, Stat } from './ui/Card'
import { NumericField } from './ui/Field'
import { PanelHeader } from './ui/PanelHeader'
import { DataNeeded, Tag } from './ui/Tag'
import { Info } from './ui/Tooltip'

/**
 * B. Tier-1 fully loaded contribution margin.
 * ARR and hosting are case facts. Every other cost line is blank on load —
 * the packet does not contain them and the dashboard will not invent them.
 */
export function Tier1MarginCalculator({ scenario }: { scenario: Tier1Scenario }) {
  const {
    fields,
    set,
    clearAll,
    costs,
    result,
    engineersRaw,
    setEngineersRaw,
    loadedCostRaw,
    setLoadedCostRaw,
  } = scenario

  const engineers = parseNumeric(engineersRaw, { min: 0, max: COMPANY.engineering.total })
  const loadedCost = parseNumeric(loadedCostRaw, SPEC.money)
  const helperTotal =
    engineers.value !== null && loadedCost.value !== null ? engineers.value * loadedCost.value : null

  const benchMarkerLabel = result.isCeiling ? 'Tier 1 — ceiling' : 'Tier 1 contribution margin'

  return (
    <Card padded={false}>
      <PanelHeader
        letter="B"
        title="Tier 1 fully loaded contribution margin"
        subtitle="The question the CEO’s position depends on and the packet cannot answer. ARR and hosting are known; everything else is yours to assume until Finance measures it."
        right={
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" className="btn" onClick={clearAll} title="Return every cost line to blank">
              Clear all inputs
            </button>
          </div>
        }
      />

      <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* ---------------- inputs ---------------- */}
        <div className="grid content-start gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <KnownFigure label="Tier 1 ARR" value={usd(TIERS.t1.arr)} note={usdExact(TIERS.t1.arr)} />
            <KnownFigure
              label="Hosting (stated)"
              value={usd(TIERS.t1.hostingTotal ?? 0)}
              note={`${TIERS.t1.accounts} × ${usd(TIERS.t1.hostingPerAccount ?? 0)}`}
            />
          </div>

          <div className="hairline pt-3">
            <span className="eyebrow mb-2 flex items-center gap-1.5">
              Your cost assumptions
              <Tag kind="input" />
              <Info>
                Enter annual, fully loaded cost attributable to Tier 1. Enter 0 explicitly if you
                believe a category is genuinely nil — a blank means “not measured”, which is a
                different statement.
              </Info>
            </span>

            <div className="grid gap-x-3 sm:grid-cols-2">
              {TIER1_COST_CATEGORIES.map((c) => (
                <NumericField
                  key={c.key}
                  label={c.label}
                  hint={c.hint}
                  prefix="$"
                  raw={fields[c.key].raw}
                  error={fields[c.key].error}
                  onChange={(v) => set(c.key, v)}
                />
              ))}
            </div>
          </div>

          {/* Engineering cost helper — ties the 68% velocity fact to a dollar figure. */}
          <div
            className="rounded-[4px] border p-3"
            style={{ borderColor: 'var(--rule)', background: 'var(--surface-2)' }}
          >
            <span className="eyebrow mb-2 flex items-center">
              Engineering cost helper
              <Info>
                {ratioPct(TIER_DETAIL.t1.velocityShare, 0)} of developer velocity went to{' '}
                {TIER_DETAIL.t1.velocityAccounts} Tier-1 accounts. Against {COMPANY.engineering.backend}{' '}
                backend engineers that is ≈{' '}
                {(TIER_DETAIL.t1.velocityShare * COMPANY.engineering.backend).toFixed(1)} people; against
                all {COMPANY.engineering.total} technical staff ≈{' '}
                {(TIER_DETAIL.t1.velocityShare * COMPANY.engineering.total).toFixed(1)}. The packet does
                not say which base that share is measured against, and it does not state a loaded cost per
                engineer — so both inputs are yours.
              </Info>
            </span>
            <div className="grid gap-x-3 sm:grid-cols-2">
              <NumericField
                label="Engineers on Tier 1 (FTE)"
                raw={engineersRaw}
                error={engineers.error}
                onChange={setEngineersRaw}
                placeholder="e.g. 19"
                hint={`${ratioPct(TIER_DETAIL.t1.velocityShare, 0)} × ${COMPANY.engineering.backend} backend ≈ ${(
                  TIER_DETAIL.t1.velocityShare * COMPANY.engineering.backend
                ).toFixed(1)} FTE. Base unstated in the packet.`}
              />
              <NumericField
                label="Fully loaded cost per engineer"
                prefix="$"
                raw={loadedCostRaw}
                error={loadedCost.error}
                onChange={setLoadedCostRaw}
                placeholder="Your assumption"
                hint="Salary, benefits, tooling and overhead. Not stated in the packet."
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11.5px]" style={{ color: 'var(--muted)' }}>
                {helperTotal === null ? (
                  'Enter both values to compute an engineering cost.'
                ) : (
                  <>
                    Implied engineering cost{' '}
                    <strong className="num font-mono" style={{ color: 'var(--ink)' }}>
                      {usdExact(helperTotal)}
                    </strong>{' '}
                    · {pct((helperTotal / TIERS.t1.arr) * 100)} of Tier-1 ARR
                  </>
                )}
              </span>
              <button
                type="button"
                className="btn"
                disabled={helperTotal === null}
                onClick={() => helperTotal !== null && set('engineering', String(Math.round(helperTotal)))}
              >
                Apply to engineering cost
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- outputs ---------------- */}
        <div className="grid content-start gap-3.5">
          {result.isCeiling ? (
            <Note tone="flag" title="Incomplete — this is a ceiling, not a margin">
              {result.missing.length} of {TIER1_COST_CATEGORIES.length} cost categories are still blank
              ({result.missing.join(', ').toLowerCase()}). Every unentered cost can only reduce the
              figure, so the number below is an <strong>upper bound</strong> on Tier-1 contribution
              margin — not a measurement of it, and not evidence that Tier 1 is profitable.
            </Note>
          ) : (
            <Note tone="bench" title="All categories entered">
              This is a contribution margin on <strong>your</strong> assumptions. It is not GAAP gross
              margin: the categories above include engineering and delivery cost that a cost-of-revenue
              basis would treat differently.
            </Note>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Fully loaded cost"
              value={usd(result.fullyLoadedCost)}
              size="sm"
              sub={usdExact(result.fullyLoadedCost)}
              tag={<Tag kind={result.isCeiling ? 'needed' : 'calc'} label={result.isCeiling ? 'Partial' : 'Calculated'} />}
            />
            <Stat
              label="Contribution margin"
              value={usd(result.contributionMargin)}
              size="sm"
              tone={result.contributionMargin < 0 ? 'var(--bad)' : undefined}
              sub={result.isCeiling ? 'Upper bound' : usdExact(result.contributionMargin)}
              tag={<Tag kind="calc" />}
            />
            <Stat
              label="Margin %"
              value={pct(result.contributionMarginPct)}
              size="sm"
              tone={result.contributionMarginPct < 0 ? 'var(--bad)' : undefined}
              sub={result.isCeiling ? 'Ceiling' : 'of Tier-1 ARR'}
              tag={<Tag kind="calc" />}
            />
            <Stat
              label="Per customer"
              value={usd(result.marginPerCustomer)}
              size="sm"
              sub={`÷ ${TIERS.t1.accounts} customers`}
              tag={<Tag kind="calc" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat
              label="Engineering as % of Tier-1 ARR"
              value={
                result.engineeringPctOfArr === null ? (
                  <DataNeeded what="engineering cost attributable to Tier 1" />
                ) : (
                  pct(result.engineeringPctOfArr)
                )
              }
              size="sm"
              tag={<Tag kind={result.engineeringPctOfArr === null ? 'needed' : 'calc'} />}
            />
            <Stat
              label="Hosting as % of Tier-1 ARR"
              value={pct(((TIERS.t1.hostingTotal ?? 0) / TIERS.t1.arr) * 100)}
              size="sm"
              sub="Case fact ÷ case fact"
              tag={<Tag kind="derived" />}
            />
          </div>

          <MarginWaterfall result={result} costs={costs} />

          <Interpretation
            verdict={t1Verdict(result)}
            headline={t1Headline(result)}
            rules={[
              {
                when: `CM ≥ ${SIGNAL_THRESHOLDS.t1MarginStrongPct}%`,
                then: 'Tier-1 investment thesis strengthens. The engineering dependency is being paid for.',
              },
              {
                when: `CM ${SIGNAL_THRESHOLDS.t1MarginWeakPct}–${SIGNAL_THRESHOLDS.t1MarginStrongPct}%`,
                then: 'Hold the allocation and tighten the customisation gate before adding enterprise logos.',
              },
              {
                when: `CM < ${SIGNAL_THRESHOLDS.t1MarginWeakPct}%`,
                then: 'Constrain customisation, reprice, or reduce the allocation. Feeds the LESS TIER 1 side of the gates.',
              },
            ]}
          >
            Thresholds are pre-committed decision rules chosen in advance, not external benchmarks and
            not company measurements. Every figure here depends on the cost assumptions you entered.
          </Interpretation>

          <div className="hairline pt-3">
            <span className="eyebrow mb-1.5 flex items-center">
              Against external gross-margin benchmarks
              <Info>
                Contribution margin and GAAP gross margin are different bases. The bands are shown for
                orientation only — a contribution margin sitting inside a gross-margin band is not the
                same thing as matching it.
              </Info>
            </span>
            <BenchmarkScale
              min={0}
              max={100}
              ticks={[0, 25, 50, 75, 100]}
              bands={[
                {
                  from: BENCHMARKS.grossMarginSingleTenant.low,
                  to: BENCHMARKS.grossMarginSingleTenant.high,
                  label: 'Single-tenant enterprise gross margin, 60–75%',
                  short: '60–75%',
                  tone: 'bench',
                },
                {
                  from: BENCHMARKS.grossMarginMultiTenant.low,
                  to: BENCHMARKS.grossMarginMultiTenant.high,
                  label: 'Multi-tenant B2B SaaS gross margin, 75–85%',
                  short: '75–85%',
                  tone: 'bench',
                },
              ]}
              markers={[
                {
                  value: Math.max(0, result.contributionMarginPct),
                  label: benchMarkerLabel,
                  sub: result.isCeiling ? 'hosting-loaded only' : 'your full assumption set',
                  color: result.isCeiling ? 'var(--watch)' : TIERS.t1.ink,
                  side: 'above',
                },
              ]}
              caption={
                <>
                  Shaded ranges are <strong>external gross-margin benchmarks</strong> for the two
                  architectures. The pointer is a <strong>contribution margin calculated from your
                  inputs</strong>. They are not the same measure and the comparison is directional only.
                </>
              }
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

function KnownFigure({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div
      className="rounded-[4px] border p-2.5"
      style={{ borderColor: 'var(--rule)', background: 'var(--surface-2)' }}
    >
      <div className="eyebrow flex items-center gap-1.5">
        {label} <Tag kind="fact" label="Fact" />
      </div>
      <div className="num mt-0.5 text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>
        {value}
      </div>
      <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
        {note}
      </div>
    </div>
  )
}

/** Verdict for the Tier-1 interpretation block. Ceiling states are never a verdict. */
function t1Verdict(result: { isCeiling: boolean; contributionMarginPct: number }): Verdict {
  if (result.isCeiling) return 'pending'
  return result.contributionMarginPct >= SIGNAL_THRESHOLDS.t1MarginStrongPct ? 'strengthens' : 'weakens'
}

function t1Headline(result: {
  isCeiling: boolean
  missing: string[]
  contributionMarginPct: number
}): string {
  if (result.isCeiling) {
    return `Tier-1 fully loaded economics remain unproven — ${result.missing.length} cost ${
      result.missing.length === 1 ? 'category' : 'categories'
    } still blank.`
  }
  const p = result.contributionMarginPct
  if (p >= SIGNAL_THRESHOLDS.t1MarginStrongPct) {
    return `Modelled contribution margin ${p.toFixed(1)}% — Tier-1 investment thesis strengthens.`
  }
  if (p >= SIGNAL_THRESHOLDS.t1MarginWeakPct) {
    return `Modelled contribution margin ${p.toFixed(1)}% — below the ${SIGNAL_THRESHOLDS.t1MarginStrongPct}% threshold. Hold and gate customisation.`
  }
  return `Modelled contribution margin ${p.toFixed(1)}% — constrain customisation, reprice, or reduce allocation.`
}
