/**
 * Provenance is the spine of this dashboard. Every number rendered anywhere
 * carries one of these five tags so a reader can tell, without reading prose,
 * whether they are looking at something the company observed, something an
 * outside benchmark says, something a user typed, something the page computed,
 * or something nobody has measured yet.
 */
export type Provenance =
  | 'fact' // observed in the case packet
  | 'derived' // arithmetic on case facts only (no assumptions)
  | 'benchmark' // external / industry range, NOT a company fact
  | 'input' // user-entered assumption
  | 'calc' // computed from user assumptions -> illustrative / modeled
  | 'needed' // not measured; must not be filled with a guess

export type TierId = 't1' | 't2' | 't3'

export type StrategicRole = 'PROTECT' | 'SCALE' | 'ACQUIRE'

/** Benchmark comparison verdict. Only assigned where a published range exists. */
export type BenchStatus = 'good' | 'watch' | 'bad' | 'none'

export interface TierFacts {
  id: TierId
  ordinal: 1 | 2 | 3
  name: string
  segment: string
  productName: string
  role: StrategicRole
  roleLine: string
  architecture: string
  /** Unit of the account count: Tier 3 counts API keys, not customers. */
  accountUnit: string
  accounts: number
  arr: number
  /** As stated in the packet. Derived value is computed in lib/calc.ts. */
  statedAvgArr: number
  nrr: number
  availability: number | null
  logoChurn: number | null
  hostingPerAccount: number | null
  hostingTotal: number | null
  scalability: string
  constraint: string
  recommendedAllocation: number
  /** Fill colour for bars, chips and bands. */
  accent: string
  accentSoft: string
  /** Text colour for this tier ON a light/dark page surface. */
  ink: string
  /** Text colour ON the tier's fill colour. */
  onAccent: string
}
