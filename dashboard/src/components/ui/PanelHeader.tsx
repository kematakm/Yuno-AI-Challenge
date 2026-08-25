import type { ReactNode } from 'react'

/** Shared header for each lettered calculator panel. */
export function PanelHeader({
  letter,
  title,
  subtitle,
  right,
}: {
  letter: string
  title: string
  subtitle: string
  right?: ReactNode
}) {
  return (
    <div
      className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b px-4 py-3"
      style={{ borderColor: 'var(--rule)', background: 'var(--surface-2)' }}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <span
          className="num grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[3px] text-[11px] font-bold"
          style={{ background: 'var(--ink)', color: 'var(--surface)' }}
        >
          {letter}
        </span>
        <div className="min-w-0">
          <h3 className="text-[14px] leading-tight font-semibold">{title}</h3>
          <p className="mt-0.5 max-w-[72ch] text-[11.5px] leading-snug" style={{ color: 'var(--muted)' }}>
            {subtitle}
          </p>
        </div>
      </div>
      {right}
    </div>
  )
}
