# Engineering Capital Allocation Recommendation

**To:** CEO, for Board review
**From:** Head of Product & Engineering Strategy
**Re:** Where next year's engineering capital and headcount go

---

## Recommendation

**30% Tier 1 Enterprise, 55% Tier 2 Mid Market, 15% Tier 3 Self Serve.**

Fork selection: **the Multi-Tenant Scaling Engine.**

Tier 1 is funded to protect $22M of ARR and reduce the engineering dependency inside it, not to grow it on the current architecture. Tier 2 gets the majority because it is the only tier where one fix reaches every customer. Tier 3 stays because it has produced at least 22 of our current Tier 2 customers and because it is, on the evidence below, the most likely unattributed driver of our cloud cost growth. Fixing it is margin recovery, not just alert reduction.

Two things the Board should read before the percentage.

**The percentage is downstream of a capacity question.** We have four infrastructure engineers and nearly everything here is platform work. Section 3 states the headcount decision that has to be made alongside the allocation.

**One number in this packet is an assumption presented as a measurement, and it is the one holding up the CFO's biggest concern.** Section 2.

---

## 1. Three customers have effectively taken the engineering organization

Three Tier 1 accounts consumed 68% of developer velocity over the last two quarters.

At tier-average ARR those three represent roughly **$3.66M, about 17% of Tier 1 and 10% of total company ARR.** That figure is probably low. Highest integration complexity usually tracks highest volume, so these are likely above-average accounts and the true number may be materially higher. I flag it because it cuts against my own argument: if those accounts are $6M rather than $3.66M, the engineering consumption is more economically defensible than it looks here, and the day-30 margin work will settle it.

Against a roster of 28 backend engineers, 68% of velocity is roughly **19 backend engineers on three customers.** Against the full 44-person engineering organization it is closer to 30 people. The packet does not specify the base. Either reading dismantles the same claim.

The proposal to migrate remaining headcount into Tier 1 feature delivery assumes there is remaining headcount. On the narrow reading, about nine backend engineers serve the other 1,355 customers.

Tier 1 is genuinely valuable. 114% NRR and 99.95% availability are real and I am not proposing we treat this tier as a cost center. But every additional enterprise logo on single-tenant architecture with an immutable legacy database reproduces the dependency rather than amortizing it.

---

## 2. The CFO's 72% does not mean what the room thinks it means, and the reason matters

Cloud grew 72% while revenue grew 38%. Everyone in the packet treats that as a crisis. Test it with the packet's own numbers.

| Tier | Stated annual hosting | % of tier ARR |
|---|---|---|
| Tier 1, single tenant | $3.24M (18 × $180K) | ~15% |
| Tier 2, multi tenant | $560K (140 × $4K) | ~5% |
| Tier 3, serverless | "Negligible" | Unmeasured |

Stated total is about **$3.8M against $35M ARR, roughly 11% of revenue.** At 72% growth the prior-year bill was about $2.2M, so cloud added roughly **$1.6M against $9.6M of new revenue, a marginal cost of revenue near 17%.** For infrastructure SaaS that is unremarkable.

So one of two things is true, and they lead to different actions.

**Either** the 72% is a high rate on a small base and the organization is reacting to a percentage rather than a number, in which case the architecture concern is real but not urgent.

**Or** the per-customer averages are wrong and there is a large pool of cloud spend nobody has attributed to any tier.

I think it is the second, and the packet says where it is.

### "Negligible" is not a measurement

Tier 3 compute is described as negligible in the same paragraph that describes 1,200 active keys running poorly written loops on a trial tier with no rate limiting. Unbounded loops on serverless is the canonical runaway-compute scenario. The sandbox launched 14 months ago. The cloud line grew 72% over approximately the same window.

And the CFO has stated plainly that no cost breakdown by tier exists. Which means "negligible" was not measured by anyone. It is an assumption carried forward from launch, when the sandbox was a marketing play with no traffic, asserted by an organization that cannot currently produce tier margins.

I am not claiming the sandbox is burning millions. I am claiming nobody knows, that it is the most plausible unattributed driver of the number the CFO is worried about, and that we have been making tier decisions using a figure that has never been checked.

**Day-30 deliverable: Tier 3 compute cost per active key, measured, with the top-decile keys by spend identified.**

This changes what the 15% is buying. Rate limiting and quotas are not primarily an SRE-relief project. They are the most likely available margin recovery in the business, and they are cheap.

### The architecture comparison still holds

Tier 1 consumes about three times the infrastructure per dollar of ARR that Tier 2 does, and it is the tier the CEO wants to expand. Five additional enterprise logos add roughly **$900K of annual hosting** before an engineer touches them. That comparison survives whatever the Tier 3 instrumentation finds.

---

## 3. The constraint the allocation percentage hides

Roster: **28 backend, 12 frontend, 4 SRE.**

Nearly everything this recommendation depends on is platform and infrastructure work: rate limiting, capacity management, cascading-failure isolation, quotas, abuse detection, alert routing, cluster scaling, and eventually a multi-tenant path for enterprise-grade workloads.

Four people cannot deliver that, and 52% of their pages currently come from free-tier scripts. The SRE Lead's attrition warning is not a morale item. It is delivery risk against every commitment in this document.

The Board template asks for one unified percentage. I have given one. The decision that has to be made alongside it:

**Either backend headcount converts into platform and infrastructure headcount, or we hire into it. There is no version of this plan that works with four SREs.**

Conversion first. The fastest available capacity is the engineering currently absorbed by three accounts, and freeing a third of it beats a hiring cycle.

---

## 4. Tier 2 carries the company growth target, which is both the case for it and the risk in it

$35M growing at 38% is **$13.3M of net new ARR** next year.

The VP Product's target of 300 customers implies roughly **$12.5M**, or about **94% of the entire company growth number** from one tier.

That is the strongest argument for the 55%. It is also the reason the target needs a hostile read rather than an endorsement, and it did not get one in the room.

**Churn is not netted out.** At 16% annual logo churn on a growing base, reaching 300 net requires roughly **195 gross adds, not 160.** That is a materially different sales and onboarding load.

**"Without adding a single salesperson" is untested.** $12.5M of new mid-market ARR at $78K ACV is not obviously a self-serve motion. Part of it plausibly is, via Tier 3 graduation, which is a further reason the sandbox stays funded. The rest needs a stated acquisition path before the Board hears the number.

**The cost projection is a floor, not an estimate.** Adding 160 customers at the stated $4K would be $640K of incremental hosting. That figure assumes flat per-customer cost on a cluster that already fails at peak today, which is the same linear-scaling assumption I am objecting to on the enterprise side. Cluster capacity expansion, capex, and the cost curve above roughly 200 customers are unknown. **Cost per customer at 200 customers is a day-60 checkpoint, not a day-90 discovery.**

The tier still wins the fork. 98.2% availability is about **158 hours of downtime a year** against roughly 9 at 99.9%, on a single shared cluster serving 140 customers, which means one fix reaches all of them. Tier 1's problem repeats customer by customer. Tier 2's does not. That asymmetry, not the $640K, is the argument.

---

## 5. Tier 3 is an acquisition engine, and possibly a margin leak

On its own metrics it looks disposable: $2M ARR, 74% NRR, 42% churn, 52% of on-call pages.

22 of 140 Tier 2 customers originated in the sandbox, which is 16% of the current base. **That is a floor.** The sandbox is 14 months old, so those 22 could only come from post-launch cohorts, meaning the share of recently acquired Tier 2 customers is higher. The day-30 cohort work will produce the real denominator, in either direction.

The operational burden is diagnosable: abusive configurations, unbounded loops, no trial-tier rate limiting, an unoptimized documentation site, and an alerting model that routes non-actionable events to humans. Those are controls we never built. We should not kill an acquisition channel to avoid building rate limiting, particularly when the same controls are the likely compute fix.

---

## The allocation

**Tier 1, 30%. Protection and de-risking.** Funds revenue protection and reduction of per-customer engineering dependency. Custom work passes a gate: it ships only if it protects material ARR, satisfies a contract, or is reusable across three or more enterprise accounts. Engineering hours tagged by account. Enterprise qualification adds an architecture-fit screen so ACV alone stops qualifying a deal.

One caveat I owe the CEO: 114% NRR is partly bought with roadmap. A hard protection posture could erode the expansion it is protecting. The gate's reusability test is designed to allow expansion work through while blocking bespoke patching, and I will report on whether that line holds by day 90.

*Measured on:* engineering hours per account, contribution margin per account, deployment cycle time against the current 18 days, NRR.

**Tier 2, 55%. Scaling.** Funds rate limiting, peak-hour capacity, cascading-failure isolation, resilience, and cluster expansion. Becomes the default motion for any customer without a genuine enterprise architectural requirement.

*Measured on:* availability, logo churn, NRR, infrastructure cost per customer, gross adds against the 195 requirement.

**Tier 3, 15%. Acquisition and margin recovery.** Funds quotas, trial-tier rate limiting, abuse detection, automated mitigation, alert aggregation and routing, documentation. Reported on graduation rate into Tier 2 and post-graduation retention, not on ARR and NRR. Sales does not prospect here; engagement triggers on production-readiness signals.

*Measured on:* compute cost per active key, graduation rate, time to graduate, retention after graduation, alert volume, SRE hours consumed.

---

## Kill switches

Contribution margin means **fully loaded margin per ARR dollar**, including hosting, custom engineering, SRE, QA, implementation, and support. Stated so the trigger produces a decision rather than an argument about basis.

If two triggers fire together, the tier-reducing trigger resolves first and the freed points go to the tier named by the higher-priority trigger, in table order.

| Trigger | By | Effect |
|---|---|---|
| Tier 3 compute is material and rate limiting recovers meaningful spend | Day 30 | Tier 3 to 20%, funded from Tier 1 |
| Tier 1 fully loaded margin per ARR dollar comes back below Tier 2 | Day 30 | Tier 1 to 20%, Tier 2 to 65% |
| The three high-consumption accounts clear 60% loaded margin | Day 30 | Gate relaxed for those accounts specifically, not tier-wide |
| Tier 3 graduation rate flat or declining across all 14 monthly cohorts | Day 30 | Tier 3 to 5%, points to Tier 2 |
| Tier 3 alert volume not down at least 60% after controls ship | Day 60 | Restrict trial tier to invited developers |
| Tier 2 infrastructure cost per customer above $6K at 200 customers | Day 60 | Multi-tenant leverage thesis is wrong. Tier 2 to 40%, points to Tier 1 |
| Tier 2 availability below 99.5% | Day 90 | Reliability was not the constraint. Hold Tier 2 flat pending diagnosis |
| Tier 3 graduated cohorts retain and expand above Tier 2 average | Day 60 | Tier 3 to 25%, funded from Tier 1 |
| Tier 2 at 99.5%+ but churn not improved 3 points | Day 180 | Churn is fit, pricing, or onboarding. Capital shifts from platform to product |

---

## Executive positions

**CEO, double down on Tier 1.** $22M and 114% NRR must be protected, which is why Tier 1 keeps 30% and a gate rather than a cut. What the ARR figure does not show is that three accounts hold roughly 19 backend engineers, so there is no pool of remaining headcount to migrate. Five more logos on the current architecture add about $900K of hosting and reproduce the dependency five more times. I will protect the tier. I am not recommending we replicate its cost structure to hit a Series B milestone, because the Board will ask about margin at the next raise and we cannot currently answer.

**VP Product, scale Tier 2 to 300.** I agree with the direction and I am backing it with the majority of the capital. Three things have to be fixed in the claim first. 300 net requires about 195 gross adds once 16% churn is netted. 98.2% availability does not support that load today. And "without a single salesperson" needs an acquisition path, because $12.5M at $78K ACV is 94% of the company growth target riding on a motion nobody has described. Fix the cluster, then we defend the number together.

**SRE Lead, kill the sandbox.** The burden is real and four SREs is untenable, and Section 3 is about your problem, not around it. But 52% of pages from unbounded trial loops is a missing rate limiter, not an argument against self-serve. Those same controls are also, I think, the largest available compute recovery in the business, which means your fix pays for itself twice. 60% page reduction required by day 60, with immediate triage in week one so your team stops bleeding before the fixes ship. If it misses the bar, we restrict the tier to invited developers. Kill the noise before killing the funnel.

**CFO, no margin by tier.** You named the gap and the number nobody connected to anything. Two readings: $3.8M against $35M is about 11% of revenue and a ~17% marginal cost of new revenue, which is ordinary, or the per-customer averages are wrong and spend is unattributed. I think it is the second, and I think "negligible" Tier 3 compute is where it is hiding. That is a day-30 deliverable. Finance owns the cost model, engineering owns effort tagging, RevOps owns funnel instrumentation, I own the allocation and revise it in writing on day 30.

---

## 90 day plan

**Days 1 to 30, instrument.** Fully loaded contribution margin for all 18 Tier 1 accounts, draft day 14, signed off day 21. Engineering hours tagged by account, retroactive two quarters, to confirm the 68% and its base. **Tier 3 compute cost per active key with top-decile spenders identified.** Tier 3 cohort curve across all 14 months. Tier 2 baseline: availability by hour, rate-limit failure frequency, capacity headroom at peak, coded churn reasons. Immediate Tier 3 alert triage. Headcount conversion proposal to the CEO in week two.

**Days 31 to 60, fix.** Customization gate live. Tier 2 rate limiting and peak-hour capacity ship, availability measured weekly. Tier 3 quotas, abuse detection, alert routing ship by day 45 so the 60% reduction has measurement time. Cost-per-customer curve modeled to 200 customers with cluster capex priced. Allocation confirmed or revised in writing. Enterprise qualification screen live.

**Days 61 to 90, prove.** Tier 1 engineering hours per account trending down and deploy cycle improving from 18 days, with a note on whether that cycle is legacy-core-specific or organization-wide. Tier 2 against 99.5%, early churn signal, gross-add pace against 195. Tier 3 alert volume, compute recovery, graduation path triggering rather than accidental.

And the structural question underneath all of it: can a customer move from Tier 3 through Tier 2 into enterprise-scale workloads without landing on bespoke single-tenant architecture. If not, the Tier 1 problem regenerates indefinitely and next year's roadmap is a common enterprise-capable multi-tenant path.

At day 90 the Board gets margin by tier, engineering consumption by Tier 1 account, Tier 3 compute findings, availability and churn movement, cohort graduation economics, the confirmed or revised allocation, the headcount decision, and one honest line on what I got wrong in the first 30 days.
