import type { Provenance } from '@/data/types'
import { PROVENANCE_META } from './provenance'
import { cn } from './cn'

/**
 * The provenance chip. Every number on this page is tagged with one of five
 * kinds so a reader can tell an observation from an assumption at a glance.
 */
export function Tag({
  kind,
  label,
  className,
  title,
}: {
  kind: Provenance
  label?: string
  className?: string
  title?: string
}) {
  const meta = PROVENANCE_META[kind]
  return (
    <span
      title={title ?? meta.help}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-[3px] px-[5px] py-[1px] text-[9.5px] leading-[1.5] font-semibold tracking-[0.07em] uppercase',
        className,
      )}
      style={{
        color: meta.fg,
        background: meta.bg,
        border: `1px ${meta.dashed ? 'dashed' : 'solid'} color-mix(in srgb, ${meta.fg} 32%, transparent)`,
      }}
    >
      <span aria-hidden className="text-[9px] opacity-80">
        {meta.glyph}
      </span>
      {label ?? meta.label}
    </span>
  )
}

/** The inline "Data Needed" placeholder used instead of a zero. */
export function DataNeeded({ what, className }: { what?: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[3px] border border-dashed px-1.5 py-[1px] font-mono text-[11px] font-medium tracking-wide',
        className,
      )}
      style={{
        color: 'var(--pv-need)',
        background: 'var(--pv-need-soft)',
        borderColor: 'color-mix(in srgb, var(--pv-need) 45%, transparent)',
      }}
      title={what ? `Not measured: ${what}` : 'Not measured. Left blank rather than estimated.'}
    >
      DATA NEEDED
    </span>
  )
}
