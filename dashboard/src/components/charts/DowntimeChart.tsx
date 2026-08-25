import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { downtimeHours } from '@/lib/calc'
import { hours, hoursHuman } from '@/lib/format'
import { Tag } from '../ui/Tag'

interface Row {
  name: string
  hours: number
  kind: 'current' | 'target' | 'bench'
  availability: number
}

/**
 * Annual downtime implied by availability. The point of the chart is the
 * distance between 98.2% and 99.9% — a difference of 1.7 percentage points that
 * is 149 hours of customer-visible outage a year.
 */
export function DowntimeChart({
  currentAvailability,
  targetAvailability,
}: {
  currentAvailability: number
  targetAvailability: number
}) {
  const rows: Row[] = [
    {
      name: `Tier 2 today · ${currentAvailability}%`,
      hours: downtimeHours(currentAvailability),
      kind: 'current',
      availability: currentAvailability,
    },
    {
      name: `Your target · ${targetAvailability}%`,
      hours: downtimeHours(targetAvailability),
      kind: 'target',
      availability: targetAvailability,
    },
    { name: 'Baseline · 99.9%', hours: downtimeHours(99.9), kind: 'bench', availability: 99.9 },
    { name: 'Stronger · 99.95%', hours: downtimeHours(99.95), kind: 'bench', availability: 99.95 },
    {
      name: 'Mission-critical · 99.99%',
      hours: downtimeHours(99.99),
      kind: 'bench',
      availability: 99.99,
    },
  ]

  const color = (k: Row['kind']) =>
    k === 'current' ? 'var(--bad)' : k === 'target' ? 'var(--t2)' : 'var(--pv-bench)'

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow">Annual downtime · (1 − availability) × 8,760 hrs</span>
        <span className="flex gap-1.5">
          <Tag kind="derived" />
          <Tag kind="benchmark" />
        </span>
      </div>

      <div style={{ width: '100%', height: 176 }}>
        <ResponsiveContainer>
          <BarChart data={rows} layout="vertical" margin={{ top: 2, right: 76, bottom: 2, left: 0 }} barCategoryGap="20%">
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey="name"
              width={148}
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
              formatter={(v) => [`${hours(Number(v))} / year (${hoursHuman(Number(v))})`, 'Downtime']}
            />
            <Bar dataKey="hours" isAnimationActive={false} radius={[2, 2, 2, 2]}>
              {rows.map((r) => (
                <Cell key={r.name} fill={color(r.kind)} fillOpacity={r.kind === 'bench' ? 0.45 : 1} />
              ))}
              <LabelList
                dataKey="hours"
                position="right"
                formatter={(v: unknown) => hours(Number(v))}
                style={{ fill: 'var(--body)', fontSize: 10.5, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
