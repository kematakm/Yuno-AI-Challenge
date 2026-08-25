import { TIER_LIST } from '@/data/caseFacts'
import { FRAMEWORK, FRAMEWORK_STEPS } from '@/data/narrative'
import { Card, Section } from './ui/Card'
import { Tag } from './ui/Tag'

/**
 * The same six-step frame applied identically to all three tiers. Using one
 * shape across the tiers is what makes the recommendation reviewable: nobody
 * has to trust that each tier was assessed on comparable terms.
 */
export function DecisionFramework() {
  return (
    <Section
      id="framework"
      eyebrow="Repeatable decision framework"
      title="One frame, three tiers"
      lede="Signal → Diagnosis → Investment → Operating change → KPI → Kill switch. Applied the same way to each tier, so the comparison is structural rather than rhetorical."
      aside={<Tag kind="calc" label="Analysis" />}
    >
      <Card className="overflow-x-auto p-0" padded={false}>
        <table className="w-full min-w-[62rem] border-collapse text-left">
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th className="eyebrow px-3 py-2.5" style={{ borderBottom: '1px solid var(--rule)' }}>
                Tier
              </th>
              {FRAMEWORK_STEPS.map((s, i) => (
                <th
                  key={s}
                  className="px-3 py-2.5 align-bottom"
                  style={{ borderBottom: '1px solid var(--rule)', borderLeft: '1px solid var(--rule)' }}
                >
                  <span className="eyebrow flex items-center gap-1.5">
                    <span
                      className="num grid h-[15px] w-[15px] place-items-center rounded-full text-[8.5px] font-bold"
                      style={{ background: 'var(--ink)', color: 'var(--surface)' }}
                    >
                      {i + 1}
                    </span>
                    {s}
                  </span>
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
                  <span
                    className="mt-1 inline-block rounded-[2px] px-1 py-px text-[9px] font-bold tracking-[0.1em]"
                    style={{ background: t.accentSoft, color: t.ink }}
                  >
                    {t.role}
                  </span>
                </th>
                {FRAMEWORK[t.id].map((cell, i) => (
                  <td
                    key={`${t.id}-${i}`}
                    className="px-3 py-3 align-top text-[11px] leading-[1.45]"
                    style={{
                      borderTop: '1px solid var(--rule)',
                      borderLeft: '1px solid var(--rule)',
                      color: i === 5 ? 'var(--pv-need)' : 'var(--body)',
                      background: i === 5 ? 'var(--pv-need-soft)' : undefined,
                      fontWeight: i === 5 ? 500 : 400,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Section>
  )
}
