import { useAllocation } from '@/hooks/useAllocation'
import { CustomerLifecycleFunnel } from '@/components/CustomerLifecycleFunnel'
import { DecisionFramework } from '@/components/DecisionFramework'
import { DecisionGates } from '@/components/DecisionGates'
import { EngineeringLeverageCards } from '@/components/EngineeringLeverageCards'
import { ExecPositions } from '@/components/ExecPositions'
import { ExecutiveHeader } from '@/components/ExecutiveHeader'
import { FiveQuestions } from '@/components/FiveQuestions'
import { GTMOperatingModel } from '@/components/GTMOperatingModel'
import { LifecycleVisual } from '@/components/LifecycleVisual'
import { NinetyDayPlan } from '@/components/NinetyDayPlan'
import { ScenarioCalculator } from '@/components/ScenarioCalculator'
import { TierScorecard } from '@/components/TierScorecard'
import { WhereTheMoneyIs } from '@/components/WhereTheMoneyIs'
import { Section } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'

const NAV = [
  { id: 'money', label: 'Money & cost' },
  { id: 'scorecard', label: 'Scorecard' },
  { id: 'trapped', label: 'Capacity trap' },
  { id: 'funnel', label: 'Funnel' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'gates', label: 'Decision gates' },
  { id: 'framework', label: 'Framework' },
  { id: 'gtm', label: 'GTM' },
  { id: 'plan', label: '90 days' },
]

export default function App() {
  const allocation = useAllocation()

  return (
    <div className="min-h-screen">
      <StickyNav />

      <main className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <ExecutiveHeader
          allocation={allocation.allocation}
          isModified={allocation.isModified}
          onReset={allocation.reset}
        />

        <FiveQuestions />

        <div className="grid min-w-0 gap-10">
          <WhereTheMoneyIs />
          <TierScorecard allocation={allocation.allocation} />
          <EngineeringLeverageCards />
          <CustomerLifecycleFunnel />
          <ExecPositions />
          <ScenarioCalculator allocation={allocation} />
          <DecisionGates allocation={allocation} />
          <DecisionFramework />
          <GTMOperatingModel />

          <Section
            id="lifecycle"
            eyebrow="Customer lifecycle"
            title="The lifecycle a customer actually travels"
            lede="The three tiers are not three businesses. They are three stages of the same customer, which is why the allocation is a sequencing decision rather than a portfolio one."
            aside={<Tag kind="calc" label="Analysis" />}
          >
            <LifecycleVisual />
          </Section>

          <NinetyDayPlan />
        </div>

        <IntegrityFooter />
      </main>
    </div>
  )
}

function StickyNav() {
  return (
    <nav
      className="no-print sticky top-0 z-40 border-b backdrop-blur"
      style={{
        borderColor: 'var(--rule)',
        background: 'color-mix(in srgb, var(--paper) 88%, transparent)',
      }}
      aria-label="Section navigation"
    >
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        <span className="text-[11px] font-bold tracking-[0.09em] whitespace-nowrap" style={{ color: 'var(--ink)' }}>
          30 / 55 / 15
        </span>
        <span className="h-3.5 w-px shrink-0" style={{ background: 'var(--rule-strong)' }} />
        <ul className="flex items-center gap-1">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                className="block rounded-[3px] px-2 py-1 text-[11px] whitespace-nowrap transition-colors hover:bg-[var(--surface-3)]"
                style={{ color: 'var(--muted)' }}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function IntegrityFooter() {
  const rules = [
    'No missing company data is invented. Unmeasured values render as “Data Needed”, never as zero.',
    'External benchmarks are labelled as such and are never used to impute a company figure.',
    '22 ÷ 1,200 is not presented as a conversion rate. Nor is 22 ÷ 140.',
    '22 ÷ 140 ≈ 15.7% is stated only as the share of the current Tier-2 base that originated in Tier 3.',
    'Tier-2 reliability is not claimed to cause Tier-2 churn. It is labelled a hypothesis to test.',
    'Tier 1 is not assumed unprofitable, and Tier 2 is not assumed more profitable, until fully loaded cost exists.',
    'Tier 3 is not assumed to deserve permanent funding. Its survival depends on cohort economics after guardrails.',
    'Calculated and observed values are visually distinguished everywhere they appear.',
    'Every scenario output carries an “Illustrative”, “Modelled”, “Scenario” or “Ceiling” label.',
  ]

  return (
    <footer className="mt-12 border-t pt-5" style={{ borderColor: 'var(--rule)' }}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div>
          <div className="eyebrow mb-1.5">Recommendation</div>
          <p className="max-w-[46ch] font-serif text-[16px] leading-[1.45]" style={{ color: 'var(--ink)' }}>
            Protect Tier 1. Fix and scale Tier 2. Automate and instrument Tier 3. Confirm or revise the
            30 / 55 / 15 split in writing at day 90.
          </p>
          <p className="mt-2.5 max-w-[52ch] text-[11px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
            Prepared by Product &amp; Engineering Strategy for CEO and Board review. Figures are drawn
            from the case packet; scenario outputs depend entirely on assumptions entered by the reader.
          </p>
        </div>

        <div>
          <div className="eyebrow mb-1.5">Data integrity rules applied throughout</div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {rules.map((r) => (
              <li
                key={r}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-1.5 text-[10.5px] leading-[1.45]"
                style={{ color: 'var(--muted)' }}
              >
                <span style={{ color: 'var(--good)' }}>✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
