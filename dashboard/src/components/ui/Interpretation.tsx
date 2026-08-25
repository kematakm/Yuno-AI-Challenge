import type { ReactNode } from 'react'

/**
 * The line that turns a calculator output into a decision.
 *
 * A calculator that only produces numbers leaves the reader to infer what they
 * mean. These blocks state, in advance, what each range of outputs implies for
 * the allocation thesis — and stay explicit that the reading is modelled from
 * assumptions, not observed.
 */
export type Verdict = 'strengthens' | 'weakens' | 'pending'

const STYLE: Record<Verdict, { fg: string; bg: string; label: string }> = {
  strengthens: { fg: 'var(--good)', bg: 'var(--good-soft)', label: 'Thesis strengthens' },
  weakens: { fg: 'var(--bad)', bg: 'var(--bad-soft)', label: 'Thesis weakens' },
  pending: { fg: 'var(--pv-need)', bg: 'var(--pv-need-soft)', label: 'Not yet readable' },
}

export function Interpretation({
  verdict,
  headline,
  children,
  rules,
}: {
  verdict: Verdict
  headline: string
  children?: ReactNode
  /** The decision rules, stated in advance so the reading is not made after the fact. */
  rules: Array<{ when: string; then: string }>
}) {
  const st = STYLE[verdict]
  return (
    <div
      className="rounded-[5px] border-l-[3px] px-3 py-2.5"
      style={{
        borderColor: st.fg,
        background: st.bg,
        borderTop: `1px solid color-mix(in srgb, ${st.fg} 22%, transparent)`,
        borderRight: `1px solid color-mix(in srgb, ${st.fg} 22%, transparent)`,
        borderBottom: `1px solid color-mix(in srgb, ${st.fg} 22%, transparent)`,
      }}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className="rounded-[2px] px-1.5 py-px text-[9px] font-bold tracking-[0.1em]"
          style={{ background: st.fg, color: 'var(--surface)' }}
        >
          {st.label.toUpperCase()}
        </span>
        <span className="text-[12.5px] leading-snug font-semibold" style={{ color: 'var(--ink)' }}>
          {headline}
        </span>
      </div>

      {children && (
        <p className="mt-1.5 text-[11.5px] leading-[1.5]" style={{ color: 'var(--body)' }}>
          {children}
        </p>
      )}

      <ul className="mt-2 grid gap-1">
        {rules.map((r) => (
          <li
            key={r.when}
            className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-start gap-x-1.5 text-[10.5px] leading-[1.45]"
            style={{ color: 'var(--muted)' }}
          >
            <span className="font-semibold whitespace-nowrap" style={{ color: st.fg }}>
              {r.when} →
            </span>
            <span>{r.then}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
