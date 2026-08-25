import type { CSSProperties, ReactNode } from 'react'
import { cn } from './cn'

export function Section({
  id,
  eyebrow,
  title,
  lede,
  aside,
  children,
  className,
}: {
  id?: string
  eyebrow?: string
  title: string
  lede?: ReactNode
  aside?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('min-w-0 scroll-mt-24', className)}>
      <header className="mb-3.5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b pb-2.5" style={{ borderColor: 'var(--rule)' }}>
        <div className="min-w-0">
          {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
          <h2 className="text-[19px] leading-tight sm:text-[21px]">{title}</h2>
          {lede && (
            <p className="mt-1.5 max-w-[68ch] text-[13px] leading-[1.55]" style={{ color: 'var(--muted)' }}>
              {lede}
            </p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </header>
      {children}
    </section>
  )
}

export function Card({
  children,
  className,
  accent,
  padded = true,
  style,
}: {
  children: ReactNode
  className?: string
  /** Left rule in a tier colour. */
  accent?: string
  padded?: boolean
  style?: CSSProperties
}) {
  return (
    <div
      className={cn(
        'card relative',
        // Let a caller opt into horizontal scrolling; otherwise clip.
        className?.includes('overflow-') ? '' : 'overflow-hidden',
        padded && 'p-4',
        className,
      )}
      style={{ ...(accent ? { borderLeft: `3px solid ${accent}` } : {}), ...style }}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-start justify-between gap-3">
      <h3 className="text-[13.5px] leading-snug font-semibold">{children}</h3>
      {right}
    </div>
  )
}

/** A labelled figure. The single most repeated element on the page. */
export function Stat({
  label,
  value,
  sub,
  tone,
  size = 'md',
  tag,
}: {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  tone?: string
  size?: 'sm' | 'md' | 'lg'
  tag?: ReactNode
}) {
  const sizes = { sm: 'text-[15px]', md: 'text-[20px]', lg: 'text-[27px]' }
  return (
    <div className="min-w-0">
      <div className="eyebrow flex items-center gap-1.5">{label}</div>
      <div
        className={cn('num mt-0.5 font-semibold leading-tight', sizes[size])}
        style={{ color: tone ?? 'var(--ink)' }}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-[11px] leading-snug" style={{ color: 'var(--muted)' }}>
          {sub}
        </div>
      )}
      {tag && <div className="mt-1">{tag}</div>}
    </div>
  )
}

/** Benchmark verdict indicator. Only rendered where a published range exists. */
export function StatusDot({ status, label }: { status: 'good' | 'watch' | 'bad'; label?: string }) {
  const map = {
    good: { c: 'var(--good)', bg: 'var(--good-soft)', t: 'At / above benchmark' },
    watch: { c: 'var(--watch)', bg: 'var(--watch-soft)', t: 'Watch' },
    bad: { c: 'var(--bad)', bg: 'var(--bad-soft)', t: 'Below benchmark' },
  }[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[3px] px-1.5 py-[1px] text-[10px] font-semibold tracking-[0.03em] whitespace-nowrap"
      style={{ color: map.c, background: map.bg }}
      title={map.t}
    >
      <span className="h-[6px] w-[6px] shrink-0 rounded-full" style={{ background: map.c }} />
      {label ?? map.t}
    </span>
  )
}

/** Callout used for hypotheses, caveats and integrity warnings. */
export function Note({
  tone = 'neutral',
  title,
  children,
}: {
  tone?: 'neutral' | 'flag' | 'bench'
  title?: string
  children: ReactNode
}) {
  const map = {
    neutral: { fg: 'var(--muted)', bg: 'var(--surface-3)', bd: 'var(--rule)' },
    flag: { fg: 'var(--pv-need)', bg: 'var(--pv-need-soft)', bd: 'color-mix(in srgb, var(--pv-need) 30%, transparent)' },
    bench: { fg: 'var(--pv-bench)', bg: 'var(--pv-bench-soft)', bd: 'color-mix(in srgb, var(--pv-bench) 28%, transparent)' },
  }[tone]
  return (
    <div
      className="rounded-[4px] border px-2.5 py-2 text-[11.5px] leading-[1.5]"
      style={{ background: map.bg, borderColor: map.bd, color: 'var(--body)' }}
    >
      {title && (
        <span className="mr-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase" style={{ color: map.fg }}>
          {title}
        </span>
      )}
      {children}
    </div>
  )
}
