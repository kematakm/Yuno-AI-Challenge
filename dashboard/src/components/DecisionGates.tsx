import { useState } from 'react'
import { DECISION_GATES } from '@/data/decisionGates'
import { TIERS } from '@/data/caseFacts'
import { RECOMMENDED_ALLOCATION } from '@/data/allocation'
import type { AllocationState } from '@/hooks/useAllocation'
import { Card, Note, Section } from './ui/Card'
import { Tag } from './ui/Tag'

/**
 * Decision gates. The point is not that the recommendation might be wrong — it
 * is that the conditions under which it changes are written down in advance,
 * with the instrument that would produce the evidence and the allocation the
 * recommendation pre-commits to.
 */
export function DecisionGates({ allocation }: { allocation: AllocationState }) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <Section
      id="gates"
      eyebrow="Question 5 · What would change my mind"
      title="Decision gates"
      lede="Tick the evidence you believe will come back true. Each gate names the instrument that produces it, the day it reports, and the allocation this recommendation pre-commits to if it fires."
      aside={<Tag kind="benchmark" label="Pre-committed responses" />}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DECISION_GATES.map((gate) => {
          const tier = TIERS[gate.tier]
          const hits = gate.triggers.filter((t) => checked.has(t.id)).length
          const armed = hits > 0
          return (
            <Card key={gate.id} accent={tier.accent} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[13px] leading-tight font-bold tracking-[0.03em]" style={{ color: tier.ink }}>
                  {gate.direction}
                </h3>
                <span
                  className="num shrink-0 rounded-[3px] px-1.5 py-px text-[10px] font-semibold"
                  style={{
                    background: armed ? tier.accentSoft : 'var(--surface-3)',
                    color: armed ? tier.ink : 'var(--muted)',
                  }}
                >
                  {hits}/{gate.triggers.length}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--muted)' }}>
                {gate.summary}
              </p>

              <ul className="mt-3 grid gap-2.5">
                {gate.triggers.map((t) => {
                  const on = checked.has(t.id)
                  return (
                    <li key={t.id}>
                      <label className="grid cursor-pointer grid-cols-[14px_minmax(0,1fr)] gap-2">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(t.id)}
                          className="mt-[2px] h-[13px] w-[13px] cursor-pointer accent-[var(--t2)]"
                        />
                        <span>
                          <span
                            className="block text-[11.5px] leading-[1.4]"
                            style={{ color: on ? 'var(--ink)' : 'var(--body)', fontWeight: on ? 600 : 400 }}
                          >
                            {t.text}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                            <span
                              className="rounded-[2px] px-1 py-px text-[9px] font-semibold tracking-[0.05em] uppercase"
                              style={{ background: 'var(--pv-need-soft)', color: 'var(--pv-need)' }}
                            >
                              {t.by}
                            </span>
                            <span className="text-[10px] leading-tight" style={{ color: 'var(--muted)' }}>
                              {t.measuredBy}
                            </span>
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-auto pt-3">
                <div
                  className="rounded-[4px] border p-2.5"
                  style={{
                    borderColor: armed ? tier.accent : 'var(--rule)',
                    background: armed ? tier.accentSoft : 'var(--surface-2)',
                  }}
                >
                  <div className="eyebrow mb-1">Pre-committed response</div>
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {(['t1', 't2', 't3'] as const).map((id) => {
                      const v = gate.response[id]
                      const d = v - RECOMMENDED_ALLOCATION[id]
                      return (
                        <span
                          key={id}
                          className="num rounded-[3px] px-1.5 py-px font-mono text-[10.5px] font-semibold"
                          style={{ background: 'var(--surface)', color: TIERS[id].ink, border: '1px solid var(--rule)' }}
                          title={`${TIERS[id].name}: ${v}% (${d >= 0 ? '+' : '−'}${Math.abs(d)} pts vs recommendation)`}
                        >
                          {TIERS[id].name.replace('Tier ', 'T')} {v}%
                          {d !== 0 && (
                            <span className="ml-0.5 font-normal opacity-70">
                              {d > 0 ? '↑' : '↓'}
                              {Math.abs(d)}
                            </span>
                          )}
                        </span>
                      )
                    })}
                  </div>
                  <p className="text-[10.5px] leading-snug" style={{ color: 'var(--muted)' }}>
                    {gate.responseNote}
                  </p>
                  <button
                    type="button"
                    className="btn mt-2 w-full"
                    onClick={() =>
                      allocation.applyPreset(
                        gate.response,
                        `${gate.direction} gate applied — ${gate.response.t1} / ${gate.response.t2} / ${gate.response.t3}. This is the pre-committed response, not the current recommendation.`,
                      )
                    }
                  >
                    Apply to calculator
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-4">
        <Note tone="flag" title="Read the gates in both directions">
          Two of these gates argue against the recommendation and two argue for it. That is deliberate.
          The Tier-1 gate fires if fully loaded enterprise economics come back strong — which the
          packet cannot currently rule out — or if multi-tenant cost leverage turns out to be weaker
          than assumed. Nothing here asserts that Tier 1 is unprofitable or that Tier 2 is definitely
          the better margin. Both claims need the day-30 instrumentation before anyone can make them.
        </Note>
      </div>
    </Section>
  )
}
