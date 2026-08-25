import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Tag } from '../ui/Tag'

/**
 * Alert volume before and after a Tier-3 reduction, indexed to 100 units of
 * today's total alert volume. Indexing rather than sharing matters: the
 * non-Tier-3 half does not shrink, so the Tier-3 *share* falls more slowly than
 * the reduction figure suggests.
 */
export function AlertShareChart({
  currentSharePct,
  reductionPct,
}: {
  currentSharePct: number
  reductionPct: number
}) {
  const other = 100 - currentSharePct
  const after = currentSharePct * (1 - reductionPct / 100)

  const data = [
    { name: 'Today', t3: currentSharePct, other, total: 100 },
    { name: `After ${reductionPct}% cut`, t3: after, other, total: after + other },
  ]

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow">Alert volume, indexed to 100 = today’s total</span>
        <Tag kind="calc" />
      </div>
      <div style={{ width: '100%', height: 132 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 2, right: 62, bottom: 2, left: 0 }} barCategoryGap="26%">
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" width={112} tickLine={false} axisLine={{ stroke: 'var(--rule)' }} />
            <Tooltip
              cursor={{ fill: 'color-mix(in srgb, var(--muted) 10%, transparent)' }}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--rule-strong)',
                borderRadius: 5,
                fontSize: 12,
                color: 'var(--ink)',
              }}
              formatter={(v, n) => [
                `${Number(v).toFixed(1)} index units`,
                n === 't3' ? 'Tier 3' : 'All other alerts',
              ]}
            />
            <Bar dataKey="t3" stackId="a" fill="var(--t3)" isAnimationActive={false} />
            <Bar dataKey="other" stackId="a" fill="var(--rule-strong)" isAnimationActive={false}>
              <LabelList
                dataKey="total"
                position="right"
                formatter={(v: unknown) => `${Number(v).toFixed(0)} total`}
                style={{ fill: 'var(--body)', fontSize: 10.5, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 text-[10.5px]" style={{ color: 'var(--muted)' }}>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: 'var(--t3)' }} /> Tier 3
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: 'var(--rule-strong)' }} /> All other
          alerts — not attributed by tier, assumed unchanged
        </span>
      </div>
    </div>
  )
}
