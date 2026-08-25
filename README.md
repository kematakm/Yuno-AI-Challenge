# Engineering Capital Allocation — Board Dashboard

Interactive, executive-facing dashboard and scenario calculator supporting a recommendation on
where next year's engineering and product investment goes across three customer/product tiers.

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

## What it answers

1. Where is the money today?
2. What does that revenue actually cost us?
3. Where are engineering and operational resources getting trapped?
4. Which tier offers the strongest repeatable, scalable long-term value?
5. Where should the next engineering dollar go — and what evidence would change that?

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
