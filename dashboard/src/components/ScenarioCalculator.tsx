import { useState } from 'react'
import { RECOMMENDED_ALLOCATION, STAFF_POOLS, type StaffPoolId } from '@/data/allocation'
import { COMPANY, TIER_LIST } from '@/data/caseFacts'
import type { TierId } from '@/data/types'
import { allocationToFte } from '@/lib/calc'
import { clamp, parseNumeric, SPEC } from '@/lib/validation'
import type { AllocationState } from '@/hooks/useAllocation'
import { AllocationChart } from './AllocationChart'
import { Tier1MarginCalculator } from './Tier1MarginCalculator'
import { Tier2ReliabilityCalculator } from './Tier2ReliabilityCalculator'
import { Tier3FunnelCalculator } from './Tier3FunnelCalculator'
import { Card, Note, Section } from './ui/Card'
import { PanelHeader } from './ui/PanelHeader'
import { SliderRow, ToggleGroup } from './ui/Field'
import { Tag } from './ui/Tag'
import { Info } from './ui/Tooltip'

export function ScenarioCalculator({ allocation }: { allocation: AllocationState }) {
  return (
    <Section
      id="calculator"
      eyebrow="Scenario calculator"
      title="Challenge the assumptions"
      lede="Nothing below is pre-filled with company data that does not exist. Enter your own assumptions and the outputs recalculate; leave them blank and the dashboard says so rather than showing a zero."
      aside={
        <span className="flex flex-wrap gap-1.5">
          <Tag kind="input" />
          <Tag kind="calc" />
          <Tag kind="needed" />
        </span>
      }
    >
      <div className="grid gap-5">
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[5px] border px-3.5 py-2"
          style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}
        >
          <span className="eyebrow shrink-0" style={{ color: 'var(--ink)' }}>
            Reading key
          </span>
          {(
            [
              ['fact', 'Case fact'],
              ['benchmark', 'External benchmark'],
              ['input', 'Assumption you entered'],
              ['calc', 'Calculated — illustrative'],
              ['needed', 'Never measured'],
            ] as const
          ).map(([kind, gloss]) => (
            <span key={kind} className="flex items-center gap-1.5">
              <Tag kind={kind} />
              <span className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
                {gloss}
              </span>
            </span>
          ))}
        </div>

        <AllocationPanel state={allocation} />
        <Tier1MarginCalculator />
        <Tier2ReliabilityCalculator />
        <Tier3FunnelCalculator />
      </div>
    </Section>
  )
}

/* ==========================================================================
   A. Engineering allocation
   ========================================================================== */

function AllocationPanel({ state }: { state: AllocationState }) {
  const [poolId, setPoolId] = useState<StaffPoolId>('all')
  const [customRaw, setCustomRaw] = useState('')

  const customParsed = parseNumeric(customRaw, SPEC.count)
  const selected = STAFF_POOLS.find((p) => p.id === poolId)
  const headcount = poolId === 'custom' ? (customParsed.value ?? 0) : (selected?.headcount ?? COMPANY.engineering.total)
  const poolDetail = poolId === 'custom' ? 'Custom pool' : (selected?.detail ?? '')

  const options = [
    ...STAFF_POOLS.map((p) => ({ id: p.id as StaffPoolId, label: p.label, detail: p.detail })),
    { id: 'custom' as StaffPoolId, label: 'Custom pool', detail: 'Enter your own headcount' },
  ]

  return (
    <Card padded={false}>
      <PanelHeader
        letter="A"
        title="Engineering allocation"
        subtitle="Must total 100%. Auto-rebalance keeps it there; switch it off to see the validation instead."
        right={
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              className="btn"
              data-active={state.autoBalance}
              aria-pressed={state.autoBalance}
              onClick={() => state.setAutoBalance(!state.autoBalance)}
              title="When on, moving one tier redistributes the difference across the unlocked tiers."
            >
              Auto-rebalance {state.autoBalance ? 'on' : 'off'}
            </button>
            <button type="button" className="btn" onClick={state.reset} disabled={!state.isModified}>
              Reset to 30 / 55 / 15
            </button>
          </div>
        }
      />

      <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          {/* The logic, before anyone touches a slider. */}
          <div className="grid grid-cols-3 gap-2">
            {TIER_LIST.map((t) => {
              const primary = t.recommendedAllocation === Math.max(...TIER_LIST.map((x) => x.recommendedAllocation))
              return (
                <div
                  key={t.id}
                  className="rounded-[4px] px-2.5 py-2 text-center"
                  style={{
                    background: primary ? t.accent : t.accentSoft,
                    border: `1px solid ${t.accent}`,
                  }}
                >
                  <div
                    className="num text-[24px] leading-none font-bold"
                    style={{ color: primary ? t.onAccent : t.ink, letterSpacing: '-0.03em' }}
                  >
                    {state.allocation[t.id]}%
                  </div>
                  <div
                    className="mt-1 text-[10px] font-bold tracking-[0.12em]"
                    style={{ color: primary ? t.onAccent : t.ink }}
                  >
                    {t.role}
                  </div>
                  <div
                    className="text-[9.5px] leading-tight"
                    style={{ color: primary ? t.onAccent : 'var(--muted)', opacity: primary ? 0.8 : 1 }}
                  >
                    {t.name}
                  </div>
                </div>
              )
            })}
          </div>

          {TIER_LIST.map((t) => (
            <TierAllocationRow key={t.id} tierId={t.id} state={state} />
          ))}

          <div
            className="flex flex-wrap items-center justify-between gap-2 rounded-[4px] border px-3 py-2"
            style={{
              borderColor: state.isValid ? 'var(--rule)' : 'var(--bad)',
              background: state.isValid ? 'var(--surface-2)' : 'var(--bad-soft)',
            }}
          >
            <span className="eyebrow">Total allocation</span>
            <span className="flex items-center gap-2.5">
              <span
                className="num font-mono text-[16px] font-semibold"
                style={{ color: state.isValid ? 'var(--good)' : 'var(--bad)' }}
              >
                {state.total}%
              </span>
              {!state.isValid && (
                <>
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--bad)' }}>
                    Must equal 100%
                  </span>
                  <button type="button" className="btn" onClick={state.normalise}>
                    Normalise to 100%
                  </button>
                </>
              )}
            </span>
          </div>

          {state.presetLabel && (
            <Note tone="bench" title="Scenario applied">
              {state.presetLabel}
            </Note>
          )}

          <AllocationChart allocation={state.allocation} height="sm" labels={false} />
        </div>

        <div className="grid content-start gap-3">
          <div>
            <span className="eyebrow mb-1.5 flex items-center">
              Translate into capacity
              <Info>
                A proportional translation only. It assumes nothing about whether a backend engineer
                can do SRE work, and it is not a staffing assignment.
              </Info>
            </span>
            <ToggleGroup
              ariaLabel="Staffing pool"
              options={options}
              value={poolId}
              onChange={(id) => setPoolId(id)}
            />
            {poolId === 'custom' && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  className="field max-w-[8rem]"
                  data-empty={customRaw.trim() === ''}
                  data-invalid={Boolean(customParsed.error)}
                  placeholder="Headcount"
                  value={customRaw}
                  onChange={(e) => setCustomRaw(e.target.value)}
                  aria-label="Custom pool headcount"
                />
                <span className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
                  {customParsed.error ?? 'People in the pool being allocated'}
                </span>
              </div>
            )}
            <p className="mt-1.5 text-[10.5px]" style={{ color: 'var(--muted)' }}>
              {poolDetail}
              {poolId !== 'custom' && ` · ${headcount} people`}
            </p>
          </div>

          <div className="overflow-hidden rounded-[4px] border" style={{ borderColor: 'var(--rule)' }}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr style={{ background: 'var(--surface-3)' }}>
                  <th className="eyebrow px-2.5 py-1.5">Tier</th>
                  <th className="eyebrow px-2.5 py-1.5 text-right">Allocation</th>
                  <th className="eyebrow px-2.5 py-1.5 text-right">Scenario equivalent</th>
                </tr>
              </thead>
              <tbody>
                {TIER_LIST.map((t) => (
                  <tr key={t.id} style={{ borderTop: '1px solid var(--rule)' }}>
                    <td className="px-2.5 py-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-[2px]" style={{ background: t.accent }} />
                        <span className="text-[11.5px] font-medium" style={{ color: 'var(--ink)' }}>
                          {t.name}
                        </span>
                      </span>
                    </td>
                    <td className="num px-2.5 py-1.5 text-right font-mono text-[12px]">
                      {state.allocation[t.id]}%
                    </td>
                    <td className="num px-2.5 py-1.5 text-right font-mono text-[12px] font-semibold" style={{ color: 'var(--ink)' }}>
                      {headcount > 0 ? `~${allocationToFte(state.allocation[t.id], headcount).toFixed(1)} FTE` : '—'}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid var(--rule-strong)', background: 'var(--surface-2)' }}>
                  <td className="px-2.5 py-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
                    Pool
                  </td>
                  <td className="num px-2.5 py-1.5 text-right font-mono text-[12px]">{state.total}%</td>
                  <td className="num px-2.5 py-1.5 text-right font-mono text-[12px] font-semibold">
                    {headcount || '—'} people
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Note tone="flag" title="Read this as scenario arithmetic">
            These are <strong>scenario equivalents, not staffing assignments</strong>. Roles are not
            interchangeable: almost every item this recommendation funds — rate limiting, capacity,
            cascading-failure isolation, quotas, abuse detection, alert routing — is platform and
            infrastructure work, and there are {COMPANY.engineering.sre} SREs. At{' '}
            {state.allocation.t2}% of the {COMPANY.engineering.sre}-person SRE pool that is{' '}
            {allocationToFte(state.allocation.t2, COMPANY.engineering.sre).toFixed(1)} people. The
            headcount conversion decision sits alongside this allocation, not after it.
          </Note>
        </div>
      </div>
    </Card>
  )
}

function TierAllocationRow({ tierId, state }: { tierId: TierId; state: AllocationState }) {
  const t = TIER_LIST.find((x) => x.id === tierId)!
  const value = state.allocation[tierId]
  const delta = value - RECOMMENDED_ALLOCATION[tierId]
  const locked = state.locks[tierId]

  return (
    <div>
      <SliderRow
        label={
          <>
            <span className="h-2 w-2 rounded-[2px]" style={{ background: t.accent }} />
            {t.name} · {t.role}
          </>
        }
        value={value}
        onChange={(v) => state.setTier(tierId, v)}
        accent={t.accent}
        disabled={locked}
        right={
          <>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={value}
              disabled={locked}
              aria-label={`${t.name} allocation percent`}
              className="field w-[4.2rem] py-[3px] text-right"
              onChange={(e) => state.setTier(tierId, clamp(Number(e.target.value || 0), 0, 100))}
            />
            <button
              type="button"
              className="btn"
              data-active={locked}
              aria-pressed={locked}
              onClick={() => state.toggleLock(tierId)}
              title={locked ? 'Unlock this tier' : 'Lock this tier so rebalancing does not move it'}
            >
              {locked ? 'Locked' : 'Lock'}
            </button>
          </>
        }
      />
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <span className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
          Recommended {RECOMMENDED_ALLOCATION[tierId]}%
        </span>
        {delta !== 0 && (
          <span className="font-mono text-[10.5px] font-semibold" style={{ color: 'var(--pv-input)' }}>
            {delta > 0 ? '+' : '−'}
            {Math.abs(delta)} pts
          </span>
        )}
      </div>
    </div>
  )
}
