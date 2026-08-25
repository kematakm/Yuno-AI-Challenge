# AI Orchestration Methodology

How this submission was built. The short version: **external tools establish benchmarks, internal data answers company-specific questions, and no tool is asked something it cannot know.**

---

## The tools

| Tool | What it did | Why this tool |
|---|---|---|
| **Perplexity Pro** | Seven grounded research questions on SaaS margin structure, churn and NRR, uptime standards, PLG conversion, alert fatigue, and single- vs multi-tenant economics. Returned cited benchmarks. | Citations. A benchmark I can point to survives a board challenge; a remembered figure does not. |
| **Claude (Opus)** | The reasoning. Hostile read of the case packet, the allocation argument, then three rounds of adversarial self-review and rewrite. | Long-context argument construction, and the only tool in the stack that will argue against its own prior draft when asked to grade it. |
| **Claude Code** | Turned the memo into a versioned repository: source-of-record markdown, a self-contained circulation page, git history, PR and merge. | The work becomes reviewable by commit rather than by attachment. |

---

## The rule that made it work

The failure mode with research tools is asking them to make your decision. They cannot: they have no access to your internal economics.

| Never asked externally | Because |
|---|---|
| "Which tier should this company invest in?" | Requires fully loaded margin by tier, which the packet does not contain. |
| "Is Tier 1 profitable?" | Same. Hosting cost is known; engineering, SRE, QA, implementation and support cost are not. |

| Asked externally | Because |
|---|---|
| "What is healthy annual logo churn for mid-market B2B SaaS?" | Answerable from public benchmark data. |
| "What uptime is standard for production APIs?" | Same. |

**Internal data only:** Tier 1 fully loaded margin, ARR of the three engineering-heavy accounts, engineering cost by tier, coded churn reasons, real Tier 3 cohort conversion, cloud spend by tier, and the economics of the CEO's five prospective logos.

External research sets the yardstick. The packet gets measured against it. That is the whole method.

---

## Benchmarks against the case packet

| What was measured | Benchmark | Case packet | Read |
|---|---|---|---|
| Multi-tenant infra as % of revenue | 10–25% | Tier 2 hosting **5.1%** of tier ARR | Better than benchmark on hosting alone |
| Single-tenant infra as % of revenue | 25–40% | Tier 1 hosting **14.7%** of tier ARR | Hosting alone does **not** convict Tier 1 — the loaded costs are the unknown |
| Infra per ARR dollar, T1 vs T2 | Multi-tenant structurally cheaper | **2.9×** | Directionally exactly what the benchmark predicts |
| Structural inefficiency threshold | Gross margin <70%, hard to justify <65% | Cannot compute — no margin by tier | This gap **is** the finding |
| Annual logo churn, mid-market | 5–12% healthy, <5–7% best-in-class | Tier 2 **16%**, Tier 3 **42%** | Above benchmark; churn is Tier 2's real weakness |
| NRR | >100% healthy, 105%+ strong, 110%+ best | T1 **114%**, T2 **106%**, T3 **74%** | T1 strong, T2 healthy but modest, T3 well below |
| Availability standard | 99.9% baseline, 99.95% premium | Tier 2 **98.2%**, Tier 1 **99.95%** | Tier 2 allows **158 h/yr** of downtime against 8h46m at 99.9% |
| Free→paid PLG conversion | 3–6% median, 8–15% top quartile | **Not comparable** — see below | Cannot be applied yet |
| Alert practice | Page only on actionable, user-impacting events; handle abuse with rate limits and quotas at the edge | **52%** of pages from free-tier scripts | SRE Lead's diagnosis right, remedy wrong — this is the textbook case for controls, not for closing the tier |
| Customer concentration risk | >20% of revenue in one account, or 30–40% in the top ten, is investor-flagged | Three accounts ≈ **10.5%** of company ARR but **68%** of developer velocity | The concentration is in **engineering**, not revenue — which is why revenue-based reporting never surfaced it |

### Two places the research did not settle the question

**The engineering-capacity benchmark never came back.** The question asked what share of engineering typically goes to maintenance and customer-specific patching versus new development. The response returned churn and NRR data instead — the same ground the next question covered. So the 68% argument rests on internal figures and first principles, not on an external yardstick. Stated plainly because the alternative is implying a benchmark that was never obtained.

**The PLG conversion benchmark cannot be applied.** 22 of 140 Tier 2 customers originating in the sandbox is 15.7% of the *current Tier 2 base* — not a conversion rate. The denominator for a conversion rate is a signup cohort, and 1,200 active keys is a point-in-time snapshot. Comparing 15.7% to a 3–6% median would be a category error. The benchmark becomes usable only after the day-30 cohort work.

> One correction to the research itself: the source computed 98.2% as allowing "18.7×" the downtime of 99.9%. It is 18× exactly (1.8 ÷ 0.1). Small, but the point of citing sources is that they can be checked.

---

## The review loop

Each round graded the prior draft adversarially before rewriting it.

| Round | What it caught | Score |
|---|---|---|
| **1 → 2** | "Negligible" Tier 3 compute sourced straight from the packet's own unmeasured assertion — inside a memo arguing the packet's numbers can't be trusted. A linear $640K cost projection using the exact assumption being attacked on the enterprise side. A sentence pre-committing to what the data would show. | 80 |
| **2 → 3** | Kill-switch precedence didn't close: two day-30 triggers on Tier 3 pointing opposite directions, both plausible simultaneously. "Material" and "meaningful" left undefined one paragraph after explaining why contribution margin needed defining. | 89 |

The pattern is the finding. **Every round caught the document committing the error it was accusing an executive of.** That is why the repository publishes the loop rather than only the polished draft — a clean submission asserts a correction process; a visible one demonstrates it.

Two smaller corrections worth keeping, both against the reviewer:

- The velocity denominator is ambiguous, and the reviewer's own was wrong. Total engineering roster is **44**, not 40 — 68% is ~19 backend engineers or ~30 of the full organization depending on base. The memo should disclose the ambiguity rather than pick the flattering number.
- The three heavy accounts are priced at tier average. If they are really $6M rather than $3.66M, the engineering consumption is *more* economically defensible, not less. That cuts against the argument, which is precisely why it gets flagged in the memo rather than omitted.

---

## The repeatable frame

The same six-stage logic runs across all three tiers, so the audience sees one operating model rather than three separate analyses.

**Signal → Diagnosis → Investment → Operating change → KPI → Kill switch**

| | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| **Signal** | 68% of velocity on 3 accounts | 98.2% uptime, 16% churn | 52% of pages, 22 graduates |
| **Diagnosis** | Bespoke enterprise dependency | Reliability constraint on a scalable model | Valuable funnel, missing controls |
| **Investment** | Protect, don't extend | Majority — fix once for all | Contain and instrument |
| **Operating change** | Customization gate | Rate limiting and capacity | Quotas, abuse detection, alert routing |
| **KPI** | Eng hours + margin per account | Uptime, churn, infra cost per customer | Compute per key, graduation rate |
| **Kill switch** | Margin doesn't justify custom work | Reliability improves, churn doesn't | Funnel economics don't justify burden |

**GTM runs the same spine:** Marketing creates qualified demand → SDR qualifies the motion → Sales places the customer in the right tier → Enablement makes the placement repeatable → RevOps proves whether the economics work. The operative change is that enterprise qualification gains an architecture-fit screen, so ACV alone stops qualifying a deal.
