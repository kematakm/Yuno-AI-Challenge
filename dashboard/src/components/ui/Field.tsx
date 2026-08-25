import type { ReactNode } from 'react'
import { Tag } from './Tag'
import { Info } from './Tooltip'
import { cn } from './cn'

/**
 * A user assumption input. Empty is a first-class state: it renders as
 * "Data needed" rather than defaulting to zero, so a blank never silently
 * becomes a company figure.
 */
export function NumericField({
  label,
  hint,
  raw,
  onChange,
  error,
  prefix,
  suffix,
  placeholder = 'Data needed',
  emphasise,
  className,
}: {
  label: string
  hint?: ReactNode
  raw: string
  onChange: (value: string) => void
  error: string | null
  prefix?: string
  suffix?: string
  placeholder?: string
  emphasise?: boolean
  className?: string
}) {
  const empty = raw.trim() === ''
  return (
    <label className={cn('block min-w-0', className)}>
      <span className="eyebrow mb-1 flex flex-wrap items-center gap-1.5">
        <span style={emphasise ? { color: 'var(--ink)' } : undefined}>{label}</span>
        {hint && <Info>{hint}</Info>}
        {empty && <Tag kind="needed" label="Blank" />}
      </span>
      <span className="relative flex items-center">
        {prefix && (
          <span
            className="pointer-events-none absolute left-2 font-mono text-[12px]"
            style={{ color: 'var(--muted)' }}
          >
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          // Explicit name: the visible label also carries a tooltip button and a
          // "Blank" chip, which would otherwise pollute the accessible name.
          aria-label={label}
          className="field"
          data-empty={empty}
          data-invalid={Boolean(error)}
          aria-invalid={Boolean(error)}
          style={{
            paddingLeft: prefix ? '1.35rem' : undefined,
            paddingRight: suffix ? '1.6rem' : undefined,
          }}
          value={raw}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && (
          <span
            className="pointer-events-none absolute right-2 font-mono text-[12px]"
            style={{ color: 'var(--muted)' }}
          >
            {suffix}
          </span>
        )}
      </span>
      <span className="mt-1 block min-h-[13px] text-[10.5px] leading-tight" style={{ color: 'var(--bad)' }}>
        {error ?? ''}
      </span>
    </label>
  )
}

export function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  accent,
  suffix = '%',
  disabled,
  right,
}: {
  label: ReactNode
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  accent?: string
  suffix?: string
  disabled?: boolean
  right?: ReactNode
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="eyebrow flex items-center gap-1.5">{label}</span>
        <span className="flex items-center gap-2">
          <span className="num font-mono text-[13px] font-semibold" style={{ color: accent ?? 'var(--ink)' }}>
            {value}
            {suffix}
          </span>
          {right}
        </span>
      </div>
      <input
        type="range"
        className="range"
        style={{ ['--accent' as string]: accent ?? 'var(--t2)' }}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={typeof label === 'string' ? label : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: ReadonlyArray<{ id: T; label: string; detail?: string }>
  value: T
  onChange: (id: T) => void
  ariaLabel: string
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className="btn"
          data-active={value === o.id}
          aria-pressed={value === o.id}
          title={o.detail}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
