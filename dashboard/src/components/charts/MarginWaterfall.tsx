import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TIER1_COST_CATEGORIES, type Tier1Costs, type Tier1MarginResult } from '@/lib/calc'
import { usd, usdExact } from '@/lib/format'
import { Note } from '../ui/Card'
import { Tag } from '../ui/Tag'

interface Step {
  name: string
  base: number
  delta: number
  kind: 'total' | 'cost' | 'result'
  raw: number
}

const SHORT: Record<string, string> = {
  engineering: 'Engineering',
  sre: 'SRE / ops',
  support: 'Support',
  implementation: 'Implementation',
  qa: 'QA / testing',
  other: 'Other delivery',
}

/**
 * Waterfall from ARR down through each entered cost line to contribution margin.
 * Only categories the user has actually entered appear — a blank category is
 * absent from the chart rather than drawn as a zero-height bar.
 */
export function MarginWaterfall({ result, costs }: { result: Tier1MarginResult; costs: Tier1Costs }) {
  if (result.contributionMargin < 0) {
    return (
      <Note tone="flag" title="Cost exceeds ARR">
        Your assumptions put fully loaded Tier-1 cost at {usdExact(result.fullyLoadedCost)} against{' '}
        {usdExact(result.arr)} of ARR — a contribution margin of{' '}
        <strong>{usdExact(result.contributionMargin)}</strong>. The waterfall is hidden because the
        chart cannot represent a negative running balance honestly.
      </Note>
    )
  }

  const steps: Step[] = []
  let running = result.arr
  steps.push({ name: 'Tier 1 ARR', base: 0, delta: result.arr, kind: 'total', raw: result.arr })

  const push = (name: string, amount: number) => {
    const after = running - amount
    steps.push({ name, base: after, delta: amount, kind: 'cost', raw: -amount })
    running = after
  }

  push('Hosting', result.hosting)
  TIER1_COST_CATEGORIES.forEach((c) => {
    const v = costs[c.key]
    if (v !== null) push(SHORT[c.key] ?? c.label, v)
  })

  steps.push({
    name: result.isCeiling ? 'Margin ceiling' : 'Contribution margin',
    base: 0,
    delta: running,
    kind: 'result',
    raw: running,
  })

  // A ceiling is not a result: colour it as "watch" until every cost is entered.
  const color = (kind: Step['kind']) =>
    kind === 'total'
      ? 'var(--t1)'
      : kind === 'cost'
        ? 'var(--bad)'
        : result.isCeiling
          ? 'var(--watch)'
          : 'var(--good)'

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow">ARR → fully loaded cost → contribution margin</span>
        <span className="flex gap-1.5">
          {result.isCeiling && <Tag kind="needed" label={`${result.missing.length} costs blank`} />}
          <Tag kind="calc" />
        </span>
      </div>

      <div style={{ width: '100%', height: Math.max(150, steps.length * 30 + 34) }}>
        <ResponsiveContainer>
          <BarChart
            data={steps}
            layout="vertical"
            margin={{ top: 4, right: 58, bottom: 4, left: 0 }}
            barCategoryGap="22%"
          >
            <XAxis
              type="number"
              domain={[0, result.arr]}
              tickFormatter={(v: number) => usd(v, { decimals: 0 })}
              tickLine={false}
              axisLine={{ stroke: 'var(--rule)' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={112}
              tickLine={false}
              axisLine={{ stroke: 'var(--rule)' }}
            />
            <Tooltip
              cursor={{ fill: 'color-mix(in srgb, var(--muted) 10%, transparent)' }}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--rule-strong)',
                borderRadius: 5,
                fontSize: 12,
                color: 'var(--ink)',
              }}
              formatter={(_v, _n, item) => {
                const s = item?.payload as Step | undefined
                if (!s) return ['', '']
                return [`${s.raw < 0 ? '−' : ''}${usdExact(Math.abs(s.raw))}`, s.name]
              }}
              labelFormatter={() => ''}
            />
            <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="delta" stackId="w" isAnimationActive={false} radius={[2, 2, 2, 2]}>
              {steps.map((s) => (
                <Cell key={s.name} fill={color(s.kind)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
