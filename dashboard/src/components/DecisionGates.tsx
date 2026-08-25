import { DECISION_GATES, type DecisionGate } from '@/data/decisionGates'
import { TIERS } from '@/data/caseFacts'
import { RECOMMENDED_ALLOCATION } from '@/data/allocation'
import type { AllocationState } from '@/hooks/useAllocation'
import type { Scenario } from '@/hooks/useScenario'
import { evaluateSignal, summariseGate, type SignalState } from '@/lib/signals'
import { Card, Note, Section } from './ui/Card'
import { Tag } from './ui/Tag'
import { Info } from './ui/Tooltip'

/* ==========================================================================
   Layer 3: how the allocation changes as evidence arrives.

   Each condition reads the scenario the user has entered and reports whether
   the MODEL argues for it, against it, is still waiting on an input, or cannot
   be evaluated here at all. Nothing moves the allocation on its own — the
   signal informs, the reader decides, and the Apply button is explicit.
   ========================================================================== */

const STATE_STYLE: Record<SignalState, { fg: string; bg: string; glyph: string; label: string }> = {
  supports: { fg: 'var(--good)', bg: 'var(--good-soft)', glyph: '▲', label: 'Modelled: supports' },
  weakens: { fg: 'var(--bad)', bg: 'var(--bad-soft)', glyph: '▼', label: 'Modelled: argues against' },
  awaiting: { fg: 'var(--pv-need)', bg: 'var(--pv-need-soft)', glyph: '!', label: 'Awaiting input' },
  external: { fg: 'var(--muted)', bg: 'var(--surface-3)', glyph: '–', label: 'Not modellable here' },
}

export function DecisionGates({
  allocation,
  scenario,
}: {
  allocation: AllocationState
  scenario: Scenario
}) {
  const summaries = DECISION_GATES.map((g) => ({
    gate: g,
    signal: summariseGate(
      g.triggers.map((t) => t.id),
      scenario,
    ),
  }))
  const active = summaries
    .filter((s) => s.signal.active)
    .sort((a, b) => b.signal.supports - b.signal.weakens - (a.signal.supports - a.signal.weakens))

  /** Tiers where a 'more' and a 'less' gate both fire — the read is genuinely mixed. */
  const conflicted = new Set(
    active
      .map((a) => a.gate.tier)
      .filter((tier, _i, all) => all.filter((t) => t === tier).length > 1)
      .filter((tier) => {
        const moves = active.filter((a) => a.gate.tier === tier).map((a) => a.gate.move)
        return moves.includes('more') && moves.includes('less')
      }),
  )

  return (
    <Section
      id="gates"
      eyebrow="Layer 3 · What changes the allocation"
      title="Decision gates"
      lede="Each condition reads live from the calculator above. Where the scenario can answer it, the gate says so; where it cannot, it names the instrument that would."
      aside={<Tag kind="calc" label="Live modelled signals" />}
    >
      <SignalBanner active={active} conflicted={conflicted} />

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaries.map(({ gate, signal }) => (
          <GateCard key={gate.id} gate={gate} scenario={scenario} allocation={allocation} active={signal.active} />
        ))}
      </div>

      <div className="mt-4">
        <Note tone="flag" title="Read the gates in both directions">
          Five gates, and three of them argue against the recommendation. The Tier-1 gate fires if
          fully loaded enterprise economics come back strong — which the packet cannot currently rule
          out. The Tier-2 reduction gate fires if reliability improves and churn does not. Nothing
          here asserts that Tier-1 economics are bad or that Tier 2 is definitively the better
          business; both claims need the day-30 instrumentation first.
        </Note>
      </div>
    </Section>
  )
}

function SignalBanner({
  active,
  conflicted,
}: {
  active: Array<{ gate: DecisionGate; signal: { supports: number } }>
  conflicted: Set<string>
}) {
  if (active.length === 0) {
    return (
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[5px] border px-3.5 py-2.5"
        style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}
      >
        <span className="eyebrow shrink-0">Current modelled signal</span>
        <span className="text-[12.5px]" style={{ color: 'var(--muted)' }}>
          No direction is currently argued for. Enter assumptions in the calculator above and the
          gates below will report which way the model points.
        </span>
      </div>
    )
  }

  return (
    <div
      className="rounded-[5px] border-l-[3px] px-3.5 py-2.5"
      style={{
        borderColor: 'var(--pv-calc)',
        background: 'var(--pv-calc-soft)',
        borderTop: '1px solid color-mix(in srgb, var(--pv-calc) 24%, transparent)',
        borderRight: '1px solid color-mix(in srgb, var(--pv-calc) 24%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--pv-calc) 24%, transparent)',
      }}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="eyebrow shrink-0" style={{ color: 'var(--pv-calc)' }}>
          Current modelled signal
          <Info>
            Derived from the assumptions entered in the calculator, not from anything the company has
            measured. The allocation does not move unless you move it.
          </Info>
        </span>
        <ul className="flex flex-wrap gap-2">
          {active.map(({ gate, signal }) => (
            <li
              key={gate.id}
              className="rounded-[3px] px-2 py-1 text-[12px] font-semibold"
              style={{ background: 'var(--surface)', color: TIERS[gate.tier].ink, border: '1px solid var(--rule)' }}
            >
              {gate.signalLine}
              <span className="ml-1.5 font-normal" style={{ color: 'var(--muted)' }}>
                {signal.supports} of {gate.triggers.length} conditions
              </span>
            </li>
          ))}
        </ul>
      </div>
      {conflicted.size > 0 && (
        <p className="mt-1.5 text-[11.5px] font-medium" style={{ color: 'var(--watch)' }}>
          Signals conflict for {[...conflicted].map((t) => TIERS[t as 't1' | 't2' | 't3'].name).join(' and ')}:
          part of the modelled scenario argues for more investment and part argues for less. That is
          the case for holding the allocation and waiting for the instrumentation, not for moving it.
        </p>
      )}
      <p className="mt-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
        Signals are illustrative outputs of your assumptions. They never change the allocation on
        their own.
      </p>
    </div>
  )
}

function GateCard({
  gate,
  scenario,
  allocation,
  active,
}: {
  gate: DecisionGate
  scenario: Scenario
  allocation: AllocationState
  active: boolean
}) {
  const tier = TIERS[gate.tier]
  const signals = gate.triggers.map((t) => ({ trigger: t, signal: evaluateSignal(t.id, scenario) }))
  const supports = signals.filter((s) => s.signal.state === 'supports').length

  return (
    <Card
      accent={tier.accent}
      className="flex flex-col"
      style={active ? { borderColor: tier.accent, boxShadow: 'var(--shadow-lift)' } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] leading-tight font-bold tracking-[0.03em]" style={{ color: tier.ink }}>
          {gate.direction}
        </h3>
        <span
          className="num shrink-0 rounded-[3px] px-1.5 py-px text-[10px] font-semibold"
          style={{
            background: active ? tier.accentSoft : 'var(--surface-3)',
            color: active ? tier.ink : 'var(--muted)',
          }}
          title={`${supports} of ${gate.triggers.length} conditions currently supported by the modelled scenario`}
        >
          {supports}/{gate.triggers.length}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--muted)' }}>
        {gate.summary}
      </p>

      {active && (
        <div
          className="mt-2 rounded-[3px] px-2 py-1 text-[11px] font-semibold"
          style={{ background: 'var(--pv-calc-soft)', color: 'var(--pv-calc)' }}
        >
          Current modelled signal: {gate.signalLine}
        </div>
      )}

      <ul className="mt-3 grid gap-2.5">
        {signals.map(({ trigger, signal }) => {
          const st = STATE_STYLE[signal.state]
          return (
            <li key={trigger.id} className="grid grid-cols-[14px_minmax(0,1fr)] gap-2">
              <span
                aria-hidden
                className="mt-[2px] grid h-[14px] w-[14px] place-items-center rounded-[3px] text-[8px] font-bold"
                style={{ background: st.bg, color: st.fg }}
                title={st.label}
              >
                {st.glyph}
              </span>
              <span>
                <span
                  className="block text-[11.5px] leading-[1.4]"
                  style={{
                    color: signal.state === 'supports' ? 'var(--ink)' : 'var(--body)',
                    fontWeight: signal.state === 'supports' ? 600 : 400,
                  }}
                >
                  {trigger.text}
                </span>
                <span
                  className="mt-0.5 block text-[10.5px] leading-snug"
                  style={{ color: st.fg }}
                >
                  {signal.detail}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span
                    className="rounded-[2px] px-1 py-px text-[9px] font-semibold tracking-[0.05em] uppercase"
                    style={{ background: 'var(--pv-need-soft)', color: 'var(--pv-need)' }}
                  >
                    {trigger.by}
                  </span>
                  <span className="text-[10px] leading-tight" style={{ color: 'var(--muted)' }}>
                    {trigger.measuredBy}
                  </span>
                </span>
              </span>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto pt-3">
        <div
          className="rounded-[4px] border p-2.5"
          style={{
            borderColor: active ? tier.accent : 'var(--rule)',
            background: active ? tier.accentSoft : 'var(--surface-2)',
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
                `${gate.direction} gate applied — ${gate.response.t1} / ${gate.response.t2} / ${gate.response.t3}. This is the pre-committed response to that evidence, not the current recommendation.`,
              )
            }
          >
            Apply to calculator
          </button>
        </div>
      </div>
    </Card>
  )
}
