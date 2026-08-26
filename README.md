# Q3 Forecast Call — Evidence Before Optimism

Submission package: the executive decision artifact and the analytical record
behind it.

**23 business days remaining · $5.0M target · $2.15M closed**

---

## Contents

| File | Role |
|---|---|
| [`01_original_prompt.md`](01_original_prompt.md) | Original challenge — authoritative for case facts · **⚠ awaiting source** |
| [`02_hostile_read.md`](02_hostile_read.md) | Pre-solution critique — analytical input · **⚠ awaiting source** |
| [`03_external_research.md`](03_external_research.md) | External benchmarks only · **⚠ awaiting source** |
| [`04_final_response.md`](04_final_response.md) | **Business source of truth** · **⚠ awaiting source** |
| [`05_ai_methodology.md`](05_ai_methodology.md) | AI workflow and evidence discipline |
| [`index.html`](index.html) | **Primary artifact** — one executive decision slide |
| [`visuals/q3_forecast_decision_board.png`](visuals/q3_forecast_decision_board.png) | Slide as an image |
| [`visuals/q3_forecast_decision_board.pdf`](visuals/q3_forecast_decision_board.pdf) | Slide as a single-page landscape PDF |

The slide is designed to complement the written response, not repeat it.
Detailed reasoning belongs in `04_final_response.md`.

> Also in this repository, from an earlier and unrelated exercise:
> `docs/engineering-capital-allocation.*`. Not part of this submission.

---

## Source-of-truth hierarchy

Where sources conflict, the higher entry wins:

1. `04_final_response.md` — authoritative business recommendation
2. Verified calculations / math audit — authoritative quantitative source
3. Original case — authoritative for case facts
4. External research — supporting benchmarks only
5. Hostile read / adversarial reviews — analytical inputs, not final decisions

The visual artifact is subordinate to the final response.

---

## ⚠ Open flags

**Four of the five source documents were not supplied** with the packaging
brief and are not present in the repository, the session workspace, or
connected storage. Each file states what is missing and what depends on it.
None was reconstructed.

Consequences for this submission, stated plainly:

1. **QC step 2 is unexecuted.** The deal calls could not be verified against
   `04_final_response.md`; they were taken on the authority of the packaging
   brief, which specified them verbatim.
2. **QC step 1 is partially executed.** No math audit was supplied. Every
   figure was recomputed deterministically and reconciles internally (below),
   but it has not been checked against the original audit.
3. **The slide presents conclusions without the argument behind them**, because
   the document it is meant to complement is absent.

No conflict was found between the figures in the brief and the recomputed
arithmetic.

---

## Quantitative reconciliation

Recomputed deterministically rather than quoted. Scale: $M.

| Scenario | Composition | Value | vs. $5.0M target |
|---|---|---:|---:|
| Closed Won | banked | **2.15** | −2.85 |
| Current evidence-backed floor | closed won; Streamline pending CFO validation | **2.15** | −2.85 |
| Named Best Case | + Streamline 0.50 + GlobalCart 1.15 + NovaBank 0.85 | **4.65** | **−0.35** |
| Full Named Upside | + AeroPay 1.40 | **6.05** | +1.05 |

- `2.15 + 0.50 + 1.15 + 0.85 = 4.65` ✓
- `4.65 + 1.40 = 6.05` ✓
- Fingo ($0.70M) is called out of Q3 and is excluded from every scenario above. ✓

**Load-bearing consequence:** the Named Best Case lands **$0.35M below the
$5.0M target** even if all three deals close. Clearing the target requires
AeroPay. This is arithmetic, not a new recommendation — it is shown on the
slide as the hatched shortfall band against the target rule.

These are **scenario levels, not probability-weighted forecasts**. No
subjective deal probabilities appear anywhere in this submission.

---

## Evidence discipline

Four categories, never silently converted into one another:

- **CASE FACT** — directly stated in the original challenge.
- **EXTERNAL BENCHMARK** — supporting external evidence; never company fact.
- **ASSUMPTION / JUDGMENT** — a management conclusion from available evidence.
- **DATA NEEDED** — cannot be known from the packet.

On the slide: deal names, values, owners, the target, closed-won and the day
count are **CASE FACT**; forecast calls, constraints, next actions,
intervention priorities and gates are **ASSUMPTION / JUDGMENT**; the evidence
column is **DATA NEEDED**. No **EXTERNAL BENCHMARK** appears on the slide.

---

## Quality control

| # | Check | Result |
|---|---|---|
| 1 | Every number verified against the math audit | ⚠ **no math audit supplied** — all figures recomputed and internally reconciled |
| 2 | Every deal call verified against `04_final_response.md` | ⚠ **unexecuted** — file not supplied |
| 3 | No subjective probabilities introduced | ✅ |
| 4 | No missing company information invented | ✅ |
| 5 | External benchmarks labelled as external | ✅ none present |
| 6 | Assumptions labelled as assumptions | ✅ |
| 7 | Slide understandable without the methodology | ✅ |
| 8 | Methodology does not dominate the submission | ✅ |
| 9 | All five deals on the decision board | ✅ |
| 10 | $5.0M / $2.15M / $4.65M / $6.05M reconcile | ✅ |
| 11 | Q4 capacity guardrail present | ✅ |
| 12 | 23-day operating gates present | ✅ |
| 13 | Visual does not alter the approved recommendation | ✅ transferred verbatim from the brief; ⚠ unverified against `04` |

---

## Viewing the artifact

`visuals/q3_forecast_decision_board.html` is a self-contained page. Open it in a
browser; it adapts to light and dark and prints to landscape for presentation.
