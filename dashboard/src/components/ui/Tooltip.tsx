import { useId, useState, type ReactNode } from 'react'

/**
 * Minimal hover/focus tooltip. No dependency, keyboard reachable, and it never
 * traps focus — the whole page must stay presentable in a live board meeting.
 */
export function Info({ children, label = 'More detail' }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault()
          setOpen((o) => !o)
        }}
        className="ml-1 grid h-[13px] w-[13px] cursor-help place-items-center rounded-full border text-[9px] font-semibold transition-colors"
        style={{
          borderColor: 'var(--rule-strong)',
          color: 'var(--muted)',
          background: 'var(--surface-2)',
        }}
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-[calc(100%+7px)] left-1/2 z-50 w-[min(19rem,70vw)] -translate-x-1/2 rounded-[5px] border p-2.5 text-[11.5px] leading-[1.5] font-normal normal-case tracking-normal shadow-lg"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--rule-strong)',
            color: 'var(--body)',
            boxShadow: 'var(--shadow-lift)',
          }}
        >
          {children}
        </span>
      )}
    </span>
  )
}
