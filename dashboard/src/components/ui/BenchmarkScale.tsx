import type { ReactNode } from 'react'

export interface ScaleBand {
  from: number
  to: number
  /** Full label, always shown in the legend beneath the axis. */
  label: string
  /** Compact label drawn inside the band when it fits. */
  short?: string
  tone?: 'bench' | 'good' | 'watch' | 'bad'
}

export interface ScaleMarker {
  value: number
  label: string
  sub?: string
  color?: string
  side?: 'above' | 'below'
}

const TONE: Record<string, { bg: string; fg: string }> = {
  bench: { bg: 'color-mix(in srgb, var(--pv-bench) 16%, transparent)', fg: 'var(--pv-bench)' },
  good: { bg: 'color-mix(in srgb, var(--good) 15%, transparent)', fg: 'var(--good)' },
  watch: { bg: 'color-mix(in srgb, var(--watch) 16%, transparent)', fg: 'var(--watch)' },
  bad: { bg: 'color-mix(in srgb, var(--bad) 14%, transparent)', fg: 'var(--bad)' },
}

/**
 * A value-against-band strip. Shaded regions are EXTERNAL BENCHMARKS; the
 * pointers are company or calculated values. Keeping them on one axis but
 * visually distinct is the whole point: comparison without conflation.
 */
export function BenchmarkScale({
  min,
  max,
  bands,
  markers,
  ticks,
  unit = '%',
  caption,
}: {
  min: number
  max: number
  bands: ScaleBand[]
  markers: ScaleMarker[]
  ticks?: number[]
  unit?: string
  caption?: ReactNode
}) {
  const span = max - min || 1
  const pos = (v: number) => ((Math.min(max, Math.max(min, v)) - min) / span) * 100
  const tickList = ticks ?? [min, min + span / 4, min + span / 2, min + (span * 3) / 4, max]

  const above = markers.filter((m) => m.side !== 'below')
  const below = markers.filter((m) => m.side === 'below')

  return (
    <div className="min-w-0">
      {/* markers above the track */}
      <div className="relative h-[34px]">
        {above.map((m) => (
          <MarkerLabel key={m.label} marker={m} left={pos(m.value)} unit={unit} anchor="above" />
        ))}
      </div>

      {/* the track */}
      <div
        className="relative h-[22px] w-full overflow-hidden rounded-[3px]"
        style={{ background: 'var(--surface-3)', border: '1px solid var(--rule)' }}
      >
        {bands.map((b) => {
          const tone = TONE[b.tone ?? 'bench'] ?? TONE.bench!
          return (
            <div
              key={`${b.label}-${b.from}`}
              className="absolute inset-y-0 flex items-center justify-center overflow-hidden"
              style={{
                left: `${pos(b.from)}%`,
                width: `${pos(b.to) - pos(b.from)}%`,
                background: tone.bg,
                borderLeft: `1px dashed ${tone.fg}`,
                borderRight: `1px dashed ${tone.fg}`,
              }}
              title={`${b.label}: ${b.from}–${b.to}${unit}`}
            >
              <span
                className="truncate px-1 text-[9px] font-semibold tracking-[0.05em] uppercase"
                style={{ color: tone.fg }}
              >
                {b.short ?? b.label}
              </span>
            </div>
          )
        })}
        {markers.map((m) => (
          <span
            key={`line-${m.label}`}
            className="absolute inset-y-0 w-[2px]"
            style={{ left: `calc(${pos(m.value)}% - 1px)`, background: m.color ?? 'var(--ink)' }}
          />
        ))}
      </div>

      {/* ticks */}
      <div className="relative mt-1 h-[13px]">
        {tickList.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2 font-mono text-[9.5px]"
            style={{ left: `${pos(t)}%`, color: 'var(--faint)' }}
          >
            {Number.isInteger(t) ? t : t.toFixed(1)}
            {unit}
          </span>
        ))}
      </div>

      {below.length > 0 && (
        <div className="relative mt-1 h-[32px]">
          {below.map((m) => (
            <MarkerLabel key={m.label} marker={m} left={pos(m.value)} unit={unit} anchor="below" />
          ))}
        </div>
      )}

      <ul className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1">
        {bands.map((b) => {
          const tone = TONE[b.tone ?? 'bench'] ?? TONE.bench!
          return (
            <li
              key={`legend-${b.label}`}
              className="flex items-center gap-1.5 text-[10px] leading-tight"
              style={{ color: 'var(--muted)' }}
            >
              <span
                className="h-2.5 w-4 shrink-0 rounded-[2px]"
                style={{ background: tone.bg, border: `1px dashed ${tone.fg}` }}
              />
              {b.label}
            </li>
          )
        })}
      </ul>

      {caption && (
        <p className="mt-1.5 text-[10.5px] leading-snug" style={{ color: 'var(--muted)' }}>
          {caption}
        </p>
      )}
    </div>
  )
}

function MarkerLabel({
  marker,
  left,
  unit,
  anchor,
}: {
  marker: ScaleMarker
  left: number
  unit: string
  anchor: 'above' | 'below'
}) {
  // Keep labels inside the container at the extremes.
  const translate = left < 12 ? '0' : left > 88 ? '-100%' : '-50%'
  return (
    <span
      className="absolute whitespace-nowrap"
      style={{
        left: `${left}%`,
        transform: `translateX(${translate})`,
        [anchor === 'above' ? 'bottom' : 'top']: '2px',
        textAlign: translate === '-50%' ? 'center' : translate === '-100%' ? 'right' : 'left',
      }}
    >
      {anchor === 'below' && <Caret color={marker.color} glyph="▲" />}
      <span className="block text-[10px] leading-tight font-semibold" style={{ color: marker.color ?? 'var(--ink)' }}>
        {marker.label} {marker.value.toFixed(1)}
        {unit}
      </span>
      {marker.sub && (
        <span className="block text-[9.5px] leading-tight" style={{ color: 'var(--muted)' }}>
          {marker.sub}
        </span>
      )}
      {anchor === 'above' && <Caret color={marker.color} glyph="▼" />}
    </span>
  )
}

function Caret({ color, glyph }: { color?: string; glyph: string }) {
  return (
    <span aria-hidden className="block text-[8px] leading-none" style={{ color: color ?? 'var(--ink)' }}>
      {glyph}
    </span>
  )
}
