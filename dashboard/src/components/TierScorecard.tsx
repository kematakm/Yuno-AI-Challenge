import type { ReactNode } from 'react'
import {
  availabilityVerdict,
  churnVerdict,
  cogsVerdict,
  nrrVerdict,
  type Verdict,
} from '@/data/benchmarks'
import { TIERS, TIER_DETAIL, TIER_LIST } from '@/data/caseFacts'
import type { Provenance, TierId } from '@/data/types'
import { hostingPctOfArr, derivedAvgArr } from '@/lib/calc'
import { availability, num, pct, ratioPct, usd, usdExact } from '@/lib/format'
import { Card, Section, StatusDot } from './ui/Card'
import { DataNeeded, Tag } from './ui/Tag'
import { Info } from './ui/Tooltip'

interface Cell {
  value: ReactNode
  tag: Provenance
  verdict?: Verdict
  note?: string
}

interface Row {
  key: string
  label: string
  hint?: ReactNode
  cells: Record<TierId, Cell>
}

const needed = (what: string): Cell => ({ value: <DataNeeded what={what} />, tag: 'needed' })

function buildRows(): Row[] {
  const t1 = TIERS.t1
  const t2 = TIERS.t2
  const t3 = TIERS.t3

  return [
    {
      key: 'arr',
      label: 'ARR',
      cells: {
        t1: { value: usd(t1.arr), tag: 'fact', note: usdExact(t1.arr) },
        t2: { value: usd(t2.arr), tag: 'fact', note: usdExact(t2.arr) },
        t3: { value: usd(t3.arr), tag: 'fact', note: usdExact(t3.arr) },
      },
    },
    {
      key: 'accounts',
      label: 'Accounts',
      hint: 'Tier 3 counts active API keys, not paying customers. The units are not equivalent.',
      cells: {
        t1: { value: `${num(t1.accounts)}`, tag: 'fact', note: 'customers' },
        t2: { value: `${num(t2.accounts)}`, tag: 'fact', note: 'customers' },
        t3: { value: `${num(t3.accounts)}`, tag: 'fact', note: 'active API keys' },
      },
    },
    {
      key: 'avgarr',
      label: 'Average ARR',
      hint: 'Packet-stated value. The derived figure (ARR ÷ accounts) is shown beneath it.',
      cells: {
        t1: { value: usd(t1.statedAvgArr), tag: 'fact', note: `derived ${usdExact(derivedAvgArr('t1'))}` },
        t2: { value: usd(t2.statedAvgArr), tag: 'fact', note: `derived ${usdExact(derivedAvgArr('t2'))}` },
        t3: { value: usd(t3.statedAvgArr), tag: 'fact', note: `derived ${usdExact(derivedAvgArr('t3'))} per key` },
      },
    },
    {
      key: 'nrr',
      label: 'Net revenue retention',
      hint: 'Benchmark: >100% healthy, ~105%+ strong, 110%+ stronger.',
      cells: {
        t1: { value: ratioPct(t1.nrr, 0), tag: 'fact', verdict: nrrVerdict(t1.nrr * 100) },
        t2: { value: ratioPct(t2.nrr, 0), tag: 'fact', verdict: nrrVerdict(t2.nrr * 100) },
        t3: { value: ratioPct(t3.nrr, 0), tag: 'fact', verdict: nrrVerdict(t3.nrr * 100) },
      },
    },
    {
      key: 'churn',
      label: 'Annual logo churn',
      hint: 'Benchmark: 5–10% healthy for mid-market, some ranges extend to 12%. Lower is better.',
      cells: {
        t1: needed('Tier-1 logo churn is not stated in the packet'),
        t2: {
          value: ratioPct(t2.logoChurn ?? 0, 0),
          tag: 'fact',
          verdict: churnVerdict((t2.logoChurn ?? 0) * 100),
        },
        t3: {
          value: ratioPct(t3.logoChurn ?? 0, 0),
          tag: 'fact',
          verdict: churnVerdict((t3.logoChurn ?? 0) * 100),
        },
      },
    },
    {
      key: 'availability',
      label: 'Availability',
      hint: 'Benchmark: ~99.9% common production SaaS/API baseline; 99.95% stronger; 99.99% mission-critical.',
      cells: {
        t1: {
          value: availability(t1.availability ?? 0),
          tag: 'fact',
          verdict: availabilityVerdict(t1.availability ?? 0),
        },
        t2: {
          value: availability(t2.availability ?? 0),
          tag: 'fact',
          verdict: availabilityVerdict(t2.availability ?? 0),
        },
        t3: needed('Tier-3 availability is not stated in the packet'),
      },
    },
    {
      key: 'hostacct',
      label: 'Hosting per account',
      cells: {
        t1: { value: usd(t1.hostingPerAccount ?? 0), tag: 'fact', note: 'per customer / year' },
        t2: { value: usd(t2.hostingPerAccount ?? 0), tag: 'fact', note: 'per customer / year' },
        t3: {
          value: <DataNeeded what="Tier-3 compute per key — stated as “negligible”, never measured" />,
          tag: 'needed',
          note: 'stated “negligible”',
        },
      },
    },
    {
      key: 'hostarr',
      label: 'Hosting as % of ARR',
      hint: 'Benchmark bands: multi-tenant 10–25%, single-tenant 25–40% of revenue.',
      cells: {
        t1: {
          value: pct(hostingPctOfArr('t1') ?? 0),
          tag: 'derived',
          verdict: cogsVerdict(hostingPctOfArr('t1') ?? 0, 'single'),
          note: 'hosting only — excludes engineering',
        },
        t2: {
          value: pct(hostingPctOfArr('t2') ?? 0),
          tag: 'derived',
          verdict: cogsVerdict(hostingPctOfArr('t2') ?? 0, 'multi'),
          note: 'hosting only — excludes engineering',
        },
        t3: needed('Tier-3 hosting cost was never measured'),
      },
    },
    {
      key: 'margin',
      label: 'Fully loaded contribution margin',
      hint: 'Requires engineering, SRE, QA, support and implementation cost attributed by customer. None of it exists today.',
      cells: {
        t1: needed('Tier-1 fully loaded cost by customer'),
        t2: needed('Tier-2 fully loaded cost by customer'),
        t3: needed('Tier-3 fully loaded cost by key'),
      },
    },
    {
      key: 'constraint',
      label: 'Primary constraint',
      cells: {
        t1: { value: t1.constraint, tag: 'fact' },
        t2: { value: t2.constraint, tag: 'fact' },
        t3: { value: t3.constraint, tag: 'fact' },
      },
    },
    {
      key: 'scalability',
      label: 'Scalability',
      hint: 'A judgement drawn from the architecture and the constraint, not a measured metric.',
      cells: {
        t1: { value: t1.scalability, tag: 'calc' },
        t2: { value: t2.scalability, tag: 'calc' },
        t3: { value: t3.scalability, tag: 'calc' },
      },
    },
  ]
}

const TIER_FOOTNOTES: Record<TierId, string[]> = {
  t1: [
    `${TIER_DETAIL.t1.deploymentDays}-day deployment clearance`,
    `${ratioPct(TIER_DETAIL.t1.velocityShare, 0)} of developer velocity to ${TIER_DETAIL.t1.velocityAccounts} accounts`,
    TIER_DETAIL.t1.databaseNote,
  ],
  t2: [`Rate limits fail at peak (${TIER_DETAIL.t2.peakWindow})`, TIER_DETAIL.t2.failureMode],
  t3: [
    `${ratioPct(TIER_DETAIL.t3.alertShare, 0)} of all automated on-call alerts`,
    `${TIER_DETAIL.t3.knownTier2Graduates} known Tier-2 customers originated here`,
    `Launched ${TIER_DETAIL.t3.launchedMonthsAgo} months ago · no dedicated infrastructure budget`,
  ],
}

export function TierScorecard({ allocation }: { allocation: Record<TierId, number> }) {
  const rows = buildRows()

  return (
    <Section
      id="scorecard"
      eyebrow="Tier scorecard"
      title="The three tiers, on the same metrics"
      lede="Status colours are assigned only where a published external benchmark exists. Where the packet has no number, the cell says so."
      aside={<Tag kind="benchmark" label="Status vs external benchmarks" />}
    >
      {/* Desktop: one comparison table. */}
      <Card className="hidden overflow-x-auto p-0 lg:block" padded={false}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="eyebrow w-[19%] px-4 py-3 align-bottom" style={{ borderBottom: '1px solid var(--rule)' }}>
                Metric
              </th>
              {TIER_LIST.map((t) => (
                <th
                  key={t.id}
                  className="px-4 py-3 align-bottom"
                  style={{ borderBottom: '1px solid var(--rule)', borderLeft: '1px solid var(--rule)' }}
                >
                  <TierHeading tierId={t.id} allocation={allocation} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.key} style={{ background: i % 2 ? 'var(--surface-2)' : 'transparent' }}>
                <th
                  scope="row"
                  className="px-4 py-2.5 align-top text-[11.5px] leading-snug font-medium"
                  style={{ color: 'var(--muted)', borderTop: '1px solid var(--rule)' }}
                >
                  <span className="flex items-start">
                    {row.label}
                    {row.hint && <Info>{row.hint}</Info>}
                  </span>
                </th>
                {TIER_LIST.map((t) => (
                  <td
                    key={t.id}
                    className="px-4 py-2.5 align-top"
                    style={{ borderTop: '1px solid var(--rule)', borderLeft: '1px solid var(--rule)' }}
                  >
                    <CellView cell={row.cells[t.id]} />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th
                scope="row"
                className="px-4 py-3 align-top text-[11.5px] font-medium"
                style={{ color: 'var(--muted)', borderTop: '1px solid var(--rule-strong)' }}
              >
                Also on record
              </th>
              {TIER_LIST.map((t) => (
                <td
                  key={t.id}
                  className="px-4 py-3 align-top"
                  style={{ borderTop: '1px solid var(--rule-strong)', borderLeft: '1px solid var(--rule)' }}
                >
                  <ul className="grid gap-1">
                    {TIER_FOOTNOTES[t.id].map((f) => (
                      <li key={f} className="text-[11px] leading-snug" style={{ color: 'var(--body)' }}>
                        · {f}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>

      {/* Mobile / tablet: one card per tier, same rows in the same order. */}
      <div className="grid gap-4 lg:hidden">
        {TIER_LIST.map((t) => (
          <Card key={t.id} accent={t.accent}>
            <TierHeading tierId={t.id} allocation={allocation} />
            <dl className="mt-3 grid gap-px" style={{ background: 'var(--rule)' }}>
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-start justify-between gap-3 px-0.5 py-1.5"
                  style={{ background: 'var(--surface)' }}
                >
                  <dt className="text-[11px] leading-snug" style={{ color: 'var(--muted)' }}>
                    {row.label}
                  </dt>
                  <dd className="text-right">
                    <CellView cell={row.cells[t.id]} align="right" />
                  </dd>
                </div>
              ))}
            </dl>
            <ul className="mt-3 grid gap-1">
              {TIER_FOOTNOTES[t.id].map((f) => (
                <li key={f} className="text-[11px] leading-snug" style={{ color: 'var(--body)' }}>
                  · {f}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  )
}

function TierHeading({ tierId, allocation }: { tierId: TierId; allocation: Record<TierId, number> }) {
  const t = TIERS[tierId]
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: t.accent }} />
        <span className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
          {t.name}
        </span>
        <span
          className="rounded-[2px] px-1 py-px text-[9px] font-bold tracking-[0.1em]"
          style={{ background: t.accentSoft, color: t.ink }}
        >
          {t.role}
        </span>
      </div>
      <div className="mt-1 text-[11.5px] leading-snug font-normal" style={{ color: 'var(--muted)' }}>
        {t.segment} · {t.architecture}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="num text-[15px] font-semibold" style={{ color: t.ink }}>
          {allocation[tierId]}%
        </span>
        <span className="text-[10px] font-normal" style={{ color: 'var(--muted)' }}>
          engineering allocation
        </span>
      </div>
    </div>
  )
}

function CellView({ cell, align = 'left' }: { cell: Cell; align?: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'flex flex-col items-end' : ''}>
      <div className="num text-[13px] leading-tight font-semibold" style={{ color: 'var(--ink)' }}>
        {cell.value}
      </div>
      {cell.verdict && (
        <div className="mt-1">
          <StatusDot status={cell.verdict.status} label={cell.verdict.text} />
        </div>
      )}
      {cell.note && (
        <div className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--muted)' }}>
          {cell.note}
        </div>
      )}
    </div>
  )
}
