import { TIERS, TIER_LIST } from '@/data/caseFacts'
import { usd } from '@/lib/format'
import { GTM_MATRIX, GTM_STAGES } from '@/data/narrative'
import { Card, Section } from './ui/Card'
import { Tag } from './ui/Tag'

/**
 * The GTM operating layer. The allocation only holds if the commercial motion
 * stops placing customers into the tier that cannot absorb them: high ARR alone
 * should not qualify a customer for bespoke engineering.
 */
export function GTMOperatingModel() {
  return (
    <Section
      id="gtm"
      eyebrow="GTM operating layer"
      title="The commercial motion that has to match the allocation"
      lede="Engineering allocation fails if sales keeps placing customers into the tier that requires bespoke work. Qualification is where the architecture decision actually gets made."
      aside={<Tag kind="calc" label="Operating design" />}
    >
      <Card className="mb-4">
        <div className="grid gap-1.5 sm:grid-cols-5">
          {GTM_STAGES.map((s, i) => (
            <div key={s.fn} className="relative">
              <div
                className="rounded-[4px] px-3 py-2.5 text-center"
                style={{ background: 'var(--surface-3)', border: '1px solid var(--rule)' }}
              >
                <div className="text-[12px] font-bold tracking-[0.06em]" style={{ color: 'var(--ink)' }}>
                  {s.fn.toUpperCase()}
                </div>
                <div className="mt-0.5 text-[10.5px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--t2-ink)' }}>
                  {s.verb}
                </div>
              </div>
              {i < GTM_STAGES.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-1/2 -right-[7px] hidden -translate-y-1/2 text-[11px] sm:block"
                  style={{ color: 'var(--rule-strong)' }}
                >
                  ▶
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-x-auto p-0" padded={false}>
        <table className="w-full min-w-[62rem] border-collapse text-left">
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th className="eyebrow px-3 py-2.5" style={{ borderBottom: '1px solid var(--rule)' }}>
                Tier · motion
              </th>
              {GTM_STAGES.map((s) => (
                <th
                  key={s.fn}
                  className="eyebrow px-3 py-2.5 align-bottom"
                  style={{ borderBottom: '1px solid var(--rule)', borderLeft: '1px solid var(--rule)' }}
                >
                  {s.fn}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIER_LIST.map((t) => (
              <tr key={t.id}>
                <th
                  scope="row"
                  className="px-3 py-3 align-top"
                  style={{ borderTop: '1px solid var(--rule)', borderLeft: `3px solid ${t.accent}` }}
                >
                  <span className="block text-[12px] font-semibold" style={{ color: 'var(--ink)' }}>
                    {t.name}
                  </span>
                  <span className="mt-1 block text-[10.5px] leading-snug font-normal" style={{ color: 'var(--muted)' }}>
                    {GTM_MATRIX[t.id].motion}
                  </span>
                </th>
                {GTM_MATRIX[t.id].cells.map((cell, i) => (
                  <td
                    key={`${t.id}-${i}`}
                    className="px-3 py-3 align-top text-[11px] leading-[1.45]"
                    style={{ borderTop: '1px solid var(--rule)', borderLeft: '1px solid var(--rule)', color: 'var(--body)' }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div
          className="rounded-[5px] border px-3.5 py-3"
          style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}
        >
          <div className="eyebrow mb-1">The qualification rule that changes the economics</div>
          <p className="text-[12px] leading-[1.5]" style={{ color: 'var(--body)' }}>
            <strong style={{ color: 'var(--ink)' }}>
              High ARR alone should not automatically qualify a customer for bespoke engineering.
            </strong>{' '}
            Enterprise qualification adds an architecture-fit screen: customisation burden,
            implementation requirements, expected engineering dependency, ACV and strategic importance —
            assessed before the deal is placed, not after the patch is requested.
          </p>
        </div>
        <div
          className="rounded-[5px] border px-3.5 py-3"
          style={{ borderColor: 'var(--rule)', background: 'var(--surface)' }}
        >
          <div className="eyebrow mb-1">The reporting chain RevOps has to close</div>
          <p className="text-[12px] leading-[1.5]" style={{ color: 'var(--body)' }}>
            Pipeline → ARR → implementation burden → engineering consumption → contribution margin.
            Today that chain breaks at “implementation burden”, which is why the company can report
            {usd(TIERS.t1.arr)} of Tier-1 ARR and not say what it costs to hold.
          </p>
        </div>
      </div>
    </Section>
  )
}
