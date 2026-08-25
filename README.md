# Capital Allocation & Scaling Operating System

An interactive, executive-facing management system behind a recommendation on where next year's
engineering and product investment goes across three customer/product tiers. It is built to be
operated, not read: the calculator feeds the decision gates, and the gates report which way the
modelled evidence points.

**Thesis:** Protect Tier 1. Fix and scale Tier 2. Automate and instrument Tier 3.
**Recommended allocation:** Tier 1 Enterprise 30% · Tier 2 Mid-Market 55% · Tier 3 Self-Serve 15%.

**Live dashboard:** https://claude.ai/code/artifact/2ede08e7-deaa-4c67-8530-ff9a9646096b

## Run it

```bash
cd dashboard
npm install
npm run dev            # http://localhost:5173
npm run build          # multi-asset bundle in dashboard/dist
npm run build:single   # one self-contained HTML file in dashboard/dist-single
npm run build:artifact # regenerates docs/dashboard.html for hosting / circulation
```

## Deploy to Vercel

The repo carries a `vercel.json` that already specifies the install command, build command and
output directory, so no dashboard settings are required.

**From the Vercel dashboard (nothing to install):**

1. **Add New… → Project**, import `kematakm/Yuno-AI-Challenge`.
2. Leave every field at its default — `vercel.json` supplies them — and press **Deploy**.
3. The dashboard is served at the project root, e.g. `https://<project>.vercel.app`.

**From a terminal:**

```bash
npm i -g vercel
vercel login
vercel --prod          # run from the repo root
```

**Which branch goes live.** Vercel treats the repository's default branch (`main`) as production and
every other branch as a preview. This work sits on `claude/board-investment-dashboard-hnq0sn`, so
either merge it into `main` first, or open **Project Settings → Git → Production Branch** and set it
to `claude/board-investment-dashboard-hnq0sn`. Pushing the branch as-is still produces a fully
shareable preview URL.

The build Vercel runs is:

```bash
npm --prefix dashboard ci      # installCommand
npm --prefix dashboard run build   # buildCommand -> dashboard/dist
```

## Three layers

| Layer | Question it settles | Sections |
|---|---|---|
| **1 — What we see today** | Where the money is, what it costs, where capacity goes | Money & cost · Blind-spot inputs · Tier scorecard · Where engineering leverage breaks |
| **2 — What the reporting misses** | Why the allocation argument has been unresolvable | What the current reporting misses · Customer growth lifecycle |
| **3 — How the allocation changes** | What would move capital, and when we'd know | Scenario calculator · Decision gates · Framework · GTM spine · 90-day proof plan |

## The five questions it answers in under two minutes

1. What is the current investment recommendation?
2. Why does each tier get that allocation?
3. What is the hidden flaw in the current reporting?
4. What data would make us change the allocation?
5. How will we know within 90 days whether the thesis is right?

## Live decision gates

Five gates — MORE / LESS Tier 1, Tier 2 and Tier 3 — read directly from the scenario calculator.
Each condition reports one of four states, and the distinction is the point:

- **supports** / **argues against** — the modelled scenario points that way
- **awaiting input** — the calculator could answer it, but a field is blank
- **not modellable here** — it needs evidence no input can supply, and the gate names the instrument

Gates never move the allocation on their own. When a tier's gates fire in both directions the
banner says the signals conflict, which is an argument for holding and waiting for the
instrumentation rather than for moving capital. Thresholds live in `src/lib/signals.ts` as
pre-committed decision rules — not external benchmarks, and not company measurements.

## Data integrity

Every figure on the page carries one of five provenance tags — **Case fact**, **Derived**,
**External benchmark**, **Your assumption**, **Calculated** — or renders as **Data Needed**.
The dashboard never fills an unmeasured company figure with an estimate, never presents an
external benchmark as an internal fact, and labels every scenario output as illustrative,
modelled or a ceiling. See [`dashboard/README.md`](dashboard/README.md) for the full rule set
and the formula reference.

## Contents

- [`dashboard/`](dashboard) — the React + TypeScript + Tailwind + Recharts source (this is the deliverable).
- [`docs/dashboard.html`](docs/dashboard.html) — the built dashboard as one self-contained file.
  Open it directly in a browser; it is also the source published at the link above.
- [`docs/engineering-capital-allocation.md`](docs/engineering-capital-allocation.md) — the written
  recommendation memo prepared for Board review. Source of record for the narrative.
- `docs/engineering-capital-allocation.html` — the same memo as a self-contained page for circulation.
