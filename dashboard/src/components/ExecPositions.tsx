import { EXEC_POSITIONS } from '@/data/caseFacts'
import { Card, Section } from './ui/Card'
import { Tag } from './ui/Tag'

/**
 * The four positions in the room, each with the thing it does not yet account
 * for. Placed immediately before the calculator so the calculator reads as the
 * way to test them rather than as a set of pre-drawn conclusions.
 */
export function ExecPositions() {
  return (
    <Section
      eyebrow="Before the calculator"
      title="The four positions in the room"
      lede="Each is defensible on the evidence available. Each is also missing something the instrumentation would settle."
      aside={<Tag kind="fact" label="Stated positions" />}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {EXEC_POSITIONS.map((p) => (
          <Card key={p.who} className="flex flex-col">
            <div className="text-[11px] font-bold tracking-[0.08em]" style={{ color: 'var(--t1)' }}>
              {p.who.toUpperCase()}
            </div>
            <p className="mt-1.5 text-[12px] leading-[1.45] font-semibold" style={{ color: 'var(--ink)' }}>
              “{p.position}”
            </p>
            <div className="mt-auto pt-2.5">
              <div className="eyebrow mb-1">What it does not settle</div>
              <p className="text-[11px] leading-[1.45]" style={{ color: 'var(--muted)' }}>
                {p.tension}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
