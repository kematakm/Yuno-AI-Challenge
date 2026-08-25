import { useEffect, useState } from 'react'
import { ALLOCATION_RATIONALE, RECOMMENDED_ALLOCATION, THESIS } from '@/data/allocation'
import { COMPANY, TIER_LIST } from '@/data/caseFacts'
import { HEADLINE_GATE } from '@/data/decisionGates'
import type { TierId } from '@/data/types'
import { usd, ratioPct, num } from '@/lib/format'
import { AllocationChart } from './AllocationChart'
import { Card } from './ui/Card'
import { DataNeeded, Tag } from './ui/Tag'
import { Info } from './ui/Tooltip'

/** The tier carrying the largest recommended allocation — the visual centre of gravity. */
const PRIMARY_TIER: TierId = (Object.keys(RECOMMENDED_ALLOCATION) as TierId[]).reduce((a, b) =>
  RECOMMENDED_ALLOCATION[a] >= RECOMMENDED_ALLOCATION[b] ? a : b,
)

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
  }, [theme])

  const next = { system: 'light', light: 'dark', dark: 'system' } as const
  const glyph = { system: '◐', light: '☼', dark: '☾' }[theme]

  return (
    <button
      type="button"
      className="btn no-print"
      onClick={() => setTheme(next[theme])}
      title={`Theme: ${theme}. Click to change.`}
      aria-label={`Theme: ${theme}. Click to change.`}
    >
      <span aria-hidden>{glyph}</span> <span className="capitalize">{theme}</span>
    </button>
  )
}

export function ExecutiveHeader({
  allocation,
  isModified,
  onReset,
}: {
  allocation: Record<TierId, number>
  isModified: boolean
  onReset: () => void
}) {
  return (
    <header className="mb-8">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="eyebrow">Board packet · FY engineering & product investment</div>
          <h1 className="mt-1.5 max-w-[26ch] text-[26px] leading-[1.1] font-bold sm:text-[32px]">
            Capital Allocation &amp; Scaling Operating System
          </h1>
          <p className="mt-2 max-w-[62ch] text-[13px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
            How we protect current ARR, scale repeatable infrastructure, and revise investment as
            evidence improves.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.04em]"
            style={{ background: 'var(--t1)', color: 'var(--on-t1)' }}
          >
            <span className="opacity-70">CURRENT THESIS</span>
            <span className="h-3 w-px" style={{ background: 'currentColor', opacity: 0.35 }} />
            {THESIS.badge}
          </span>
          <ThemeToggle />
          <button type="button" className="btn no-print" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      <Card className="p-0" padded={false}>
        <div className="border-b p-4 sm:p-5" style={{ borderColor: 'var(--rule)' }}>
          <p
            className="max-w-[62ch] font-serif text-[17px] leading-[1.45] sm:text-[19.5px]"
            style={{ color: 'var(--ink)' }}
          >
            {THESIS.headline}
          </p>
          <p className="mt-2 max-w-[70ch] text-[12.5px]" style={{ color: 'var(--muted)' }}>
            {THESIS.shortForm} — {THESIS.subhead}
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="eyebrow flex items-center">
              {isModified ? 'Working scenario' : 'Recommended engineering allocation'}
              <Info>
                The recommendation is 30 / 55 / 15. Editing the scenario calculator updates this bar;
                the recommended boundaries stay marked above it.
              </Info>
            </span>
            {isModified ? (
              <span className="flex items-center gap-2">
                <Tag kind="input" label="Scenario — edited" />
                <button type="button" className="btn no-print" onClick={onReset}>
                  Reset to recommendation
                </button>
              </span>
            ) : (
              <Tag kind="calc" label="Recommendation" />
            )}
          </div>

          <AllocationChart allocation={allocation} />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {TIER_LIST.map((t) => {
              const v = allocation[t.id]
              const rec = RECOMMENDED_ALLOCATION[t.id]
              const delta = v - rec
              const primary = t.id === PRIMARY_TIER
              return (
                <div
                  key={t.id}
                  className="rounded-[4px] border p-3"
                  style={{
                    borderColor: primary ? t.accent : 'var(--rule)',
                    borderWidth: primary ? 2 : 1,
                    background: primary ? t.accentSoft : 'var(--surface-2)',
                  }}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ background: t.accent }}
                      />
                      <span className="truncate text-[12.5px] font-semibold" style={{ color: 'var(--ink)' }}>
                        {t.name}
                      </span>
                      <span
                        className="rounded-[2px] px-1 py-px text-[9px] font-bold tracking-[0.1em]"
                        style={{ background: t.accentSoft, color: t.ink }}
                      >
                        {t.role}
                      </span>
                    </span>
                    <span className="num shrink-0 text-[19px] font-semibold" style={{ color: t.ink }}>
                      {v}%
                    </span>
                  </div>
                  {primary && (
                    <div
                      className="mt-1.5 inline-flex rounded-[2px] px-1.5 py-px text-[9px] font-bold tracking-[0.1em]"
                      style={{ background: t.accent, color: t.onAccent }}
                    >
                      PRIMARY BET
                    </div>
                  )}
                  <p className="mt-1.5 text-[11.5px] leading-[1.45]" style={{ color: 'var(--muted)' }}>
                    {ALLOCATION_RATIONALE[t.id]}
                  </p>
                  {delta !== 0 && (
                    <p className="mt-1.5 font-mono text-[10.5px] font-semibold" style={{ color: 'var(--pv-input)' }}>
                      {delta > 0 ? '+' : '−'}
                      {Math.abs(delta)} pts vs recommended {rec}%
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div
            className="mt-4 flex flex-wrap items-start gap-x-4 gap-y-2 rounded-[4px] border-l-[3px] px-3 py-2.5"
            style={{
              borderColor: 'var(--pv-need)',
              background: 'var(--pv-need-soft)',
              borderTop: '1px solid color-mix(in srgb, var(--pv-need) 22%, transparent)',
              borderRight: '1px solid color-mix(in srgb, var(--pv-need) 22%, transparent)',
              borderBottom: '1px solid color-mix(in srgb, var(--pv-need) 22%, transparent)',
            }}
          >
            <span
              className="shrink-0 rounded-[2px] px-1.5 py-px text-[9px] font-bold tracking-[0.1em]"
              style={{ background: 'var(--pv-need)', color: 'var(--surface)' }}
            >
              DECISION GATE
            </span>
            <p className="min-w-0 flex-1 text-[12px] leading-[1.5]" style={{ color: 'var(--body)' }}>
              <strong style={{ color: 'var(--ink)' }}>{HEADLINE_GATE.condition}</strong>,{' '}
              {HEADLINE_GATE.consequence}
              <span className="ml-1.5" style={{ color: 'var(--muted)' }}>
                {HEADLINE_GATE.by} · {HEADLINE_GATE.measuredBy}.
              </span>{' '}
              <a href="#gates" className="font-semibold underline underline-offset-2" style={{ color: 'var(--pv-need)' }}>
                All eight gates
              </a>
            </p>
          </div>
        </div>
      </Card>

      <CompanyContext />
      <ProvenanceLegend />
    </header>
  )
}

function CompanyContext() {
  const items = [
    { label: 'Total ARR', value: usd(COMPANY.totalArr), kind: 'fact' as const },
    { label: 'Revenue growth YoY', value: ratioPct(COMPANY.revenueGrowthYoY, 0), kind: 'fact' as const },
    {
      label: 'Cloud cost growth YoY',
      value: ratioPct(COMPANY.cloudCostGrowthYoY, 0),
      kind: 'fact' as const,
      flag: 'Grew ~1.9× faster than revenue',
    },
    {
      label: 'Technical headcount',
      value: num(COMPANY.engineering.total),
      kind: 'fact' as const,
      flag: '28 backend · 12 frontend · 4 SRE',
    },
    { label: 'Gross margin by tier', value: null, kind: 'needed' as const, flag: 'CFO: unavailable' },
  ]

  return (
    <div className="mt-3 grid gap-px overflow-hidden rounded-[5px] border sm:grid-cols-3 lg:grid-cols-5"
      style={{ borderColor: 'var(--rule)', background: 'var(--rule)' }}>
      {items.map((i) => (
        <div key={i.label} className="p-2.5" style={{ background: 'var(--surface)' }}>
          <div className="eyebrow">{i.label}</div>
          <div className="num mt-0.5 text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
            {i.value ?? <DataNeeded what="gross margin by tier" />}
          </div>
          {i.flag && (
            <div className="mt-0.5 text-[10.5px] leading-tight" style={{ color: 'var(--muted)' }}>
              {i.flag}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * The reading key. This case turns on separating what the company observed from
 * what an outside benchmark says from what the reader assumed, so the three
 * primary categories lead and the two secondary ones follow.
 */
function ProvenanceLegend() {
  return (
    <div
      className="mt-3 rounded-[5px] border px-3.5 py-2.5"
      style={{ borderColor: 'var(--rule-strong)', background: 'var(--surface)' }}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="eyebrow shrink-0" style={{ color: 'var(--ink)' }}>
          How to read this page
        </span>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {(
            [
              ['fact', 'Stated in the case packet'],
              ['benchmark', 'Industry range — not a company number'],
              ['input', 'Entered by you, not observed'],
            ] as const
          ).map(([kind, gloss]) => (
            <li key={kind} className="flex items-center gap-1.5">
              <Tag kind={kind} />
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                {gloss}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="hairline mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2">
        <span className="flex items-center gap-1.5">
          <Tag kind="derived" />
          <span className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
            Arithmetic on case facts only
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <Tag kind="calc" />
          <span className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
            Computed from your assumptions — illustrative
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <Tag kind="needed" />
          <span className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
            Never measured — left blank rather than estimated
          </span>
        </span>
      </div>
    </div>
  )
}
