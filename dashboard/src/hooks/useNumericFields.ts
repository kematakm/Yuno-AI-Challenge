import { useCallback, useMemo, useState } from 'react'
import { parseNumeric, type NumericSpec } from '@/lib/validation'

export interface FieldResult {
  raw: string
  value: number | null
  error: string | null
}

/**
 * Keeps raw text and parsed value in step for a group of assumption inputs.
 * Raw text is the source of truth so a field can be cleared back to blank —
 * blank means "Data Needed", which is a meaningful state in this dashboard.
 */
export function useNumericFields<K extends string>(
  initial: Record<K, string>,
  specs: Record<K, NumericSpec>,
) {
  const [raw, setRaw] = useState<Record<K, string>>(initial)

  const fields = useMemo(() => {
    const out = {} as Record<K, FieldResult>
    ;(Object.keys(raw) as K[]).forEach((k) => {
      const parsed = parseNumeric(raw[k], specs[k])
      out[k] = { raw: raw[k], value: parsed.value, error: parsed.error }
    })
    return out
  }, [raw, specs])

  const set = useCallback((key: K, value: string) => {
    setRaw((r) => ({ ...r, [key]: value }))
  }, [])

  const setMany = useCallback((patch: Partial<Record<K, string>>) => {
    setRaw((r) => ({ ...r, ...patch }))
  }, [])

  const clearAll = useCallback(() => {
    setRaw((r) => {
      const next = {} as Record<K, string>
      ;(Object.keys(r) as K[]).forEach((k) => {
        next[k] = ''
      })
      return next
    })
  }, [])

  const resetAll = useCallback(() => setRaw(initial), [initial])

  const anyError = (Object.keys(fields) as K[]).some((k) => fields[k].error !== null)

  return { fields, set, setMany, clearAll, resetAll, anyError }
}
