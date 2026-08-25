import { FIVE_QUESTIONS } from '@/data/narrative'

/**
 * The five questions the packet exists to answer, each with a one-line answer
 * and a jump link. This is the under-two-minutes read.
 */
export function FiveQuestions() {
  return (
    <nav aria-label="The five questions" className="mb-8">
      <div className="eyebrow mb-2">The five questions this packet answers</div>
      <ol className="grid gap-px overflow-hidden rounded-[5px] border md:grid-cols-3 lg:grid-cols-5"
        style={{ borderColor: 'var(--rule)', background: 'var(--rule)' }}>
        {FIVE_QUESTIONS.map((q) => (
          <li key={q.n} style={{ background: 'var(--surface)' }}>
            <a
              href={`#${q.anchor}`}
              className="flex h-full flex-col gap-1.5 p-3 transition-colors hover:bg-[var(--surface-3)]"
            >
              <span className="flex items-baseline gap-2">
                <span
                  className="num text-[11px] font-bold"
                  style={{ color: 'var(--t2-ink)' }}
                >
                  0{q.n}
                </span>
                <span className="text-[12px] leading-snug font-semibold" style={{ color: 'var(--ink)' }}>
                  {q.q}
                </span>
              </span>
              <span className="text-[11px] leading-[1.45]" style={{ color: 'var(--muted)' }}>
                {q.a}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
