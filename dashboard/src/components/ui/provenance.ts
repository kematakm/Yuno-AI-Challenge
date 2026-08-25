import type { Provenance } from '@/data/types'

/**
 * The five provenance kinds. Every number rendered anywhere on the dashboard
 * carries one of them so a reader can tell an observation from an assumption.
 */
export const PROVENANCE_META: Record<
  Provenance,
  { label: string; glyph: string; fg: string; bg: string; dashed: boolean; help: string }
> = {
  fact: {
    label: 'Case fact',
    glyph: '●',
    fg: 'var(--pv-fact)',
    bg: 'var(--pv-fact-soft)',
    dashed: false,
    help: 'Stated in the case packet. Observed, not estimated.',
  },
  derived: {
    label: 'Derived',
    glyph: '÷',
    fg: 'var(--pv-fact)',
    bg: 'var(--pv-fact-soft)',
    dashed: false,
    help: 'Arithmetic on case facts only. No assumptions added.',
  },
  benchmark: {
    label: 'External benchmark',
    glyph: '◇',
    fg: 'var(--pv-bench)',
    bg: 'var(--pv-bench-soft)',
    dashed: false,
    help: 'Industry reference range researched externally. Not a company fact.',
  },
  input: {
    label: 'Your assumption',
    glyph: '✎',
    fg: 'var(--pv-input)',
    bg: 'var(--pv-input-soft)',
    dashed: false,
    help: 'A value you entered. Changing it changes every figure downstream.',
  },
  calc: {
    label: 'Calculated',
    glyph: '=',
    fg: 'var(--pv-calc)',
    bg: 'var(--pv-calc-soft)',
    dashed: false,
    help: 'Computed from your assumptions. Illustrative / modelled, not actual.',
  },
  needed: {
    label: 'Data needed',
    glyph: '!',
    fg: 'var(--pv-need)',
    bg: 'var(--pv-need-soft)',
    dashed: true,
    help: 'Never measured. Deliberately left blank rather than filled with a guess.',
  },
}
