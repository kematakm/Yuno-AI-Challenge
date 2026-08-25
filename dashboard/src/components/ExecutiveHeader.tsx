import { useEffect, useState } from 'react'
import { ALLOCATION_RATIONALE, RECOMMENDED_ALLOCATION, THESIS } from '@/data/allocation'
import { COMPANY, TIER_LIST } from '@/data/caseFacts'
import type { TierId } from '@/data/types'
import { usd, ratioPct, num } from '@/lib/format'
import { AllocationChart } from './AllocationChart'
import { Card, Note } from './ui/Card'
import { DataNeeded, Tag } from './ui/Tag'
import { Info } from './ui/Tooltip'

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
          <h1 className="mt-1.5 max-w-[24ch] text-[26px] leading-[1.1] font-bold sm:text-[32px]">
            Where the next engineering dollar goes
          </h1>
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
              return (
                <div
                  key={t.id}
                  className="rounded-[4px] border p-3"
                  style={{ borderColor: 'var(--rule)', background: 'var(--surface-2)' }}
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

/** The reading key. Without this the rest of the page is not auditable. */
function ProvenanceLegend() {
  return (
    <div className="mt-3">
      <Note>
        <span className="mr-2 inline-flex flex-wrap items-center gap-1.5 align-middle">
          <Tag kind="fact" />
          <Tag kind="derived" />
          <Tag kind="benchmark" />
          <Tag kind="input" />
          <Tag kind="calc" />
          <Tag kind="needed" />
        </span>
        Every figure on this page carries one of these tags. External benchmarks are never used to
        impute a company number, and unmeasured values are left blank rather than estimated.
      </Note>
    </div>
  )
}
