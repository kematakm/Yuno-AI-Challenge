# 05 · AI Methodology

> **“AI was used to investigate, challenge, validate, and communicate the decision — not to make the decision.”**

---

## Workflow

```
Original Case
  → Decomposition
  → Hostile Read
  → External Validation
  → Strategic Hypothesis
  → Decision
  → Math Verification
  → Independent Attack
  → Human Judgment
  → Executive Artifact
```

Each stage was allowed to change the answer. The chain is ordered so that
criticism arrives **before** commitment, and verification arrives **before**
presentation.

---

## Stages

### 1 · Simplify / decompose
**Tool:** ChatGPT
**Purpose:** Convert the challenge into explicit decisions, deliverables,
constraints, facts, and missing information.

Output: a flat inventory separating what the case *states* from what it merely
*implies*, and an explicit list of what the packet cannot answer.

### 2 · Hostile read
**Tool:** Claude
**Purpose:** Identify contradictions, missing data, unsupported assumptions,
and hidden decision forks **before** proposing a solution.

Run against the case only — not against a draft answer — so the critique could
not be anchored to a solution already in mind.

### 3 · External validation
**Tool:** Perplexity
**Purpose:** Validate only externally knowable assumptions and benchmarks.

Benchmarks were kept in their own file and were never merged into the deal
record. An external benchmark can inform a judgment; it can never become a
company fact. See *Evidence discipline* below.

### 4 · Strategic synthesis
**Tool:** ChatGPT
**Purpose:** Compare the case evidence, hostile read, and external research;
develop the working hypothesis and executive recommendation.

### 5 · Quantitative verification
**Tool:** Code / deterministic calculation
**Purpose:** Recompute forecast arithmetic, coverage, gaps, discount
sensitivity, and other load-bearing calculations rather than trusting model
arithmetic.

Every figure that appears on the slide is a recomputed sum, not a quoted one.
The reconciliation is reproduced in the repository README.

### 6 · Independent adversarial review
**Tool:** Gemini / foreign model
**Purpose:** Attack the completed recommendation for unsupported assumptions,
false precision, inconsistent logic, and missed executive questions.

A different model family was used deliberately: a critique from the same model
that wrote the answer tends to agree with it.

### 7 · Final judgment
**Owner:** Human
**Purpose:** Accept, reject, or qualify AI criticism and make the final
business decisions.

Not every criticism was accepted. The forecast calls, the intervention
priorities, and the Q4 guardrail are human decisions.

### 8 · Artifact construction
**Tool:** Claude Code
**Purpose:** Turn the approved source-of-truth response into the final
executive artifact **without changing the business recommendation**.

Constrained to packaging: no new business claims, no invented company data, no
new probabilities, no reinterpretation of the calls.

---

## Evidence discipline

Four categories are labelled throughout this repository. They are never
silently converted into one another.

| Label | Meaning |
|---|---|
| **CASE FACT** | Directly stated in the original challenge. |
| **EXTERNAL BENCHMARK** | Supporting external evidence. Never presented as company-specific fact. |
| **ASSUMPTION / JUDGMENT** | A management conclusion drawn from available evidence. |
| **DATA NEEDED** | Information that cannot be known from the packet. |

The most common failure this guards against is a benchmark hardening into a
company fact, or a judgment hardening into a number.

---

## Source-of-truth hierarchy

Where sources conflict, the higher entry wins:

1. `04_final_response.md` — authoritative business recommendation
2. Verified calculations / math audit — authoritative quantitative source
3. Original case — authoritative for case facts
4. External research — supporting benchmarks only
5. Hostile read / adversarial reviews — analytical inputs, not final decisions

The visual artifact is subordinate to the final response. A conflict between
the two is flagged, never silently resolved.

---

## What AI was not used for

- Choosing which deals to commit, hold, or call out of the quarter.
- Assigning probabilities. None appear anywhere in this submission; the
  scenario levels are arithmetic sums of named deals.
- Filling gaps in company data. Unknowns are labelled **DATA NEEDED** and left
  unresolved.
- Deciding where the CEO's time is spent.
