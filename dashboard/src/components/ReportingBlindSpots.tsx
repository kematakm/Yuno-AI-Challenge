import { TIER_LIST } from '@/data/caseFacts'
import { BLIND_SPOTS, BLIND_SPOT_CONCLUSION } from '@/data/narrative'
import { Card, Section } from './ui/Card'
import { DataNeeded, Tag } from './ui/Tag'

/**
 * Layer 2 of the dashboard. Layer 1 is what the company already sees; this is
 * what the metrics it watches cannot show. Each tier is scored today on numbers
 * that are blind to its actual constraint, which is why the allocation argument
 * has been unresolvable.
 */
export function ReportingBlindSpots() {
  return (
    <Section
      id="blindspots"
      eyebrow="Layer 2 · The gap"
      title="What the current reporting misses"
      lede="Every tier is measured on something real. None is measured on the thing that decides its allocation."
      aside={<Tag kind="needed" label="Reporting gaps" />}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {TIER_LIST.map((t) => {
          const b = BLIND_SPOTS[t.id]
          return (
            <Card key={t.id} accent={t.accent} className="flex flex-col">
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[12.5px] font-semibold" style={{ color: 'var(--ink)' }}>
                  {t.name}
                </span>
                <span
                  className="rounded-[2px] px-1 py-px text-[9px] font-bold tracking-[0.1em]"
                  style={{ background: t.accentSoft, color: t.ink }}
                >
                  {t.role}
                </span>
              </div>

              <Row label="Current reporting emphasises">
                <span className="font-mono text-[12px] font-semibold" style={{ color: 'var(--ink)' }}>
                  {b.reported}
                </span>
              </Row>

              <Row label="What it misses" flagged>
                <span className="flex flex-wrap items-start gap-1.5">
                  <span className="mt-[1px]">
                    <DataNeeded />
                  </span>
                  <span className="text-[12px] leading-[1.4] font-medium" style={{ color: 'var(--ink)' }}>
                    {b.missing}
                  </span>
                </span>
              </Row>

              <Row label="Key proof">
                <span className="flex items-start gap-1.5">
                  <span className="mt-[1px]">
                    <Tag kind="fact" label="Fact" />
                  </span>
                  <span className="text-[12px] leading-[1.4]" style={{ color: 'var(--body)' }}>
                    {b.proof}
                  </span>
                </span>
              </Row>

              <div className="mt-auto pt-3">
                <div className="eyebrow mb-1">Strategic implication</div>
                <p
                  className="text-[12.5px] leading-[1.45] font-medium"
                  style={{ color: t.ink }}
                >
                  {b.implication}
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      <div
        className="mt-4 rounded-[5px] border-l-[3px] px-4 py-3"
        style={{
          borderColor: 'var(--pv-need)',
          background: 'var(--pv-need-soft)',
          borderTop: '1px solid color-mix(in srgb, var(--pv-need) 22%, transparent)',
          borderRight: '1px solid color-mix(in srgb, var(--pv-need) 22%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--pv-need) 22%, transparent)',
        }}
      >
        <p className="max-w-[92ch] text-[13px] leading-[1.5]" style={{ color: 'var(--ink)' }}>
          {BLIND_SPOT_CONCLUSION}
        </p>
      </div>
    </Section>
  )
}

function Row({
  label,
  children,
  flagged,
}: {
  label: string
  children: React.ReactNode
  flagged?: boolean
}) {
  return (
    <div
      className="mb-2 rounded-[4px] px-2.5 py-2"
      style={{
        background: flagged ? 'var(--pv-need-soft)' : 'var(--surface-2)',
        border: `1px ${flagged ? 'dashed' : 'solid'} ${
          flagged ? 'color-mix(in srgb, var(--pv-need) 32%, transparent)' : 'var(--rule)'
        }`,
      }}
    >
      <div className="eyebrow mb-1">{label}</div>
      {children}
    </div>
  )
}
