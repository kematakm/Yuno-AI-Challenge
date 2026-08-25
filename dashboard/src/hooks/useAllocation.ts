import { useCallback, useMemo, useState } from 'react'
import { RECOMMENDED_ALLOCATION } from '@/data/allocation'
import type { TierId } from '@/data/types'
import { allocationDelta, allocationTotal } from '@/lib/calc'
import { clamp } from '@/lib/validation'

const IDS: TierId[] = ['t1', 't2', 't3']

export type Allocation = Record<TierId, number>
export type Locks = Record<TierId, boolean>

/**
 * Rebalance so the three tiers sum to exactly 100 after `id` is set to `value`.
 * The delta is absorbed proportionally by the unlocked tiers; locked tiers hold.
 * Largest-remainder rounding keeps every value an integer and the total at 100.
 */
function rebalance(current: Allocation, id: TierId, value: number, locks: Locks): Allocation {
  const others = IDS.filter((i) => i !== id)
  const unlocked = others.filter((i) => !locks[i])
  const lockedSum = others.filter((i) => locks[i]).reduce((s, i) => s + current[i], 0)

  // Cannot push the changed tier past what the locked tiers leave available.
  const target = clamp(Math.round(value), 0, 100 - lockedSum)

  if (unlocked.length === 0) {
    return { ...current, [id]: target }
  }

  const remaining = 100 - lockedSum - target
  const unlockedSum = unlocked.reduce((s, i) => s + current[i], 0)

  const raw: Record<string, number> = {}
  unlocked.forEach((i) => {
    raw[i] = unlockedSum > 0 ? remaining * (current[i] / unlockedSum) : remaining / unlocked.length
  })

  // Largest-remainder rounding so the three integers still total 100.
  const floored = unlocked.map((i) => ({ id: i, floor: Math.floor(raw[i] ?? 0), rem: (raw[i] ?? 0) % 1 }))
  let deficit = remaining - floored.reduce((s, f) => s + f.floor, 0)
  floored.sort((a, b) => b.rem - a.rem)

  const next: Allocation = { ...current, [id]: target }
  floored.forEach((f) => {
    next[f.id as TierId] = f.floor + (deficit-- > 0 ? 1 : 0)
  })
  return next
}

export interface AllocationState {
  allocation: Allocation
  locks: Locks
  autoBalance: boolean
  total: number
  isValid: boolean
  delta: Allocation
  isModified: boolean
  setTier: (id: TierId, value: number) => void
  toggleLock: (id: TierId) => void
  setAutoBalance: (on: boolean) => void
  normalise: () => void
  reset: () => void
  applyPreset: (next: Allocation, label: string) => void
  presetLabel: string | null
}

export function useAllocation(): AllocationState {
  const [allocation, setAllocation] = useState<Allocation>({ ...RECOMMENDED_ALLOCATION })
  const [locks, setLocks] = useState<Locks>({ t1: false, t2: false, t3: false })
  const [autoBalance, setAutoBalance] = useState(true)
  const [presetLabel, setPresetLabel] = useState<string | null>(null)

  const setTier = useCallback(
    (id: TierId, value: number) => {
      setPresetLabel(null)
      setAllocation((current) =>
        autoBalance
          ? rebalance(current, id, value, locks)
          : { ...current, [id]: clamp(Math.round(value), 0, 100) },
      )
    },
    [autoBalance, locks],
  )

  const toggleLock = useCallback((id: TierId) => {
    setLocks((l) => ({ ...l, [id]: !l[id] }))
  }, [])

  /** Scale the current values so they total 100 without changing their ratios. */
  const normalise = useCallback(() => {
    setAllocation((current) => {
      const total = allocationTotal(current)
      if (total === 0) return { ...RECOMMENDED_ALLOCATION }
      const scaled = IDS.map((i) => ({ id: i, raw: (current[i] / total) * 100 }))
      const floored = scaled.map((s) => ({ id: s.id, floor: Math.floor(s.raw), rem: s.raw % 1 }))
      let deficit = 100 - floored.reduce((s, f) => s + f.floor, 0)
      floored.sort((a, b) => b.rem - a.rem)
      const next = { t1: 0, t2: 0, t3: 0 } as Allocation
      floored.forEach((f) => {
        next[f.id] = f.floor + (deficit-- > 0 ? 1 : 0)
      })
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setAllocation({ ...RECOMMENDED_ALLOCATION })
    setLocks({ t1: false, t2: false, t3: false })
    setPresetLabel(null)
  }, [])

  const applyPreset = useCallback((next: Allocation, label: string) => {
    setAllocation({ ...next })
    setPresetLabel(label)
  }, [])

  const total = allocationTotal(allocation)
  const delta = useMemo(() => allocationDelta(allocation, RECOMMENDED_ALLOCATION), [allocation])
  const isModified = IDS.some((i) => allocation[i] !== RECOMMENDED_ALLOCATION[i])

  return {
    allocation,
    locks,
    autoBalance,
    total,
    isValid: total === 100,
    delta,
    isModified,
    setTier,
    toggleLock,
    setAutoBalance,
    normalise,
    reset,
    applyPreset,
    presetLabel,
  }
}
