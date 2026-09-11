# AI-Native Planning

Status: approved foundation plan  
Date: 2026-09-07  
Operational workflow updated: 2026-09-08  
Commercial multi-target expansion aligned: 2026-09-11

## 1. Product intent

Build a deterministic Figma audit/preparation platform that can validate an approved design, create a safe target-ready duplicate when needed, and produce native WordPress-builder or code artifacts through versioned adapters.

Elementor is the first commercial target, Gutenberg follows, and front-end code/framework outputs are added without coupling the scanner/classifier to one target schema.

## 2. Core workflow

1. User selects a supported source scope.
2. Plugin performs read-only audit.
3. Scanner builds a normalized neutral model.
4. Classifier detects layout patterns and risks.
5. Scoring engine produces evidence-backed readiness results.
6. User chooses a target such as Elementor, Gutenberg, HTML or a framework adapter.
7. Target compatibility engine reports supported, review and blocked mappings.
8. If target preparation is needed, plugin offers a target-ready duplicate.
9. Only previously proven recipes modify the candidate/duplicate.
10. Geometry/content/image/structure/pixel validation runs.
11. A versioned target adapter generates an artifact.
12. Target schema/package/assets are validated.
13. Where feasible, a round-trip preview/render is compared to Figma.
14. Download/copy/import is offered with exact validation warnings.

## 3. AI-native does not mean AI-dependent

The project is AI-native in its engineering process: plans, decisions, research, state, tasks, and future-agent handoff are explicitly documented so an AI agent can resume development safely.

Core correctness remains intentionally AI-free:

- no Figma AI dependency for audit/fix correctness;
- no OpenAI/Claude dependency for audit/fix correctness;
- no remote inference required for scoring, preparation or adapter validation;
- no token/credit consumption required for core usage;
- current core plugin remains network-free.

Optional AI assistance may be added later only as an isolated, opt-in, non-authoritative layer.

## 4. Canonical knowledge architecture

The repository maintains:

- `PROJECT_STATE.md`: current truth;
- `ROADMAP.md`: phases/progress;
- `NEXT_ACTIONS.md`: exact executable queue;
- `DECISIONS.md`: durable architecture/product choices;
- `CHANGELOG.md`: material work history;
- `docs/MARKET_RESEARCH_PLAN.md`: recurring research method and latest public-market snapshot;
- `docs/COMMERCIAL_EXPANSION_PLAN.md`: commercial/target-adapter roadmap.

`AGENTS.md` enforces reading/updating these files.

## 5. Development philosophy

### Audit before mutate

No structural auto-fix ships before the same condition can be detected and explained read-only.

### Target validation before export

No target artifact should be presented as ready merely because serialization succeeded. A target adapter must validate schema/package/assets and report unsupported mappings before download/import.

### Explainable classification

Each recommendation includes evidence such as geometry clusters, gaps, parent coverage, overflow, Auto Layout state, text/image composition and target-mapping reasons.

### Confidence-gated mutation

- 90–100: safe candidate only when recipe and validators are accepted;
- 75–89: review/default no mutation until separately proven;
- 50–74: REVIEW;
- <50: preserve and explain.

### Visual truth wins

If target normalization/export cannot preserve visible design within accepted thresholds, preserve the source and report REVIEW/BLOCKED instead of redesigning it.

### Documented adapters over reverse engineering

Prefer documented Elementor/WordPress/Figma/framework structures and extension points. Undocumented private clipboard/schema behavior is not a stable production contract.

## 6. Golden-fixture strategy

Maintain fixtures covering:

- clean marketing page;
- editorial/asymmetric page;
- image-heavy page;
- long timeline page;
- carousel/overflow page;
- complex footer;
- intentional overlays;
- fixed-width responsive-risk cases;
- target-specific Elementor and Gutenberg mapping cases;
- code-export component cases;
- code-to-design static HTML/CSS cases;
- asset/font manifest cases.

No fixture may hard-code one customer's node IDs into product logic.

## 7. Product modes

### Audit Only

Read-only scan, classify, score, explain and report.

### Safe Fix / Prepare

Only proven high-confidence recipes with candidate/validate/rollback.

### Target-Ready Duplicate

Create a duplicate specifically prepared for a selected export target while preserving the approved original.

### Native Builder Export

Elementor and Gutenberg through versioned adapters and target validators.

### Code Export

HTML/CSS/JS and framework adapters through a neutral component model.

### Code-to-Design Import

Static-first reconstruction; arbitrary JS execution disabled by default and allowed only in a separately accepted sandbox/companion architecture.

## 8. Success criteria

A non-developer should eventually be able to:

- select a design/section;
- choose a target;
- receive a trustworthy Build-Ready/Target-Ready result;
- create a validated target-ready duplicate when needed;
- export native editable builder/code output;
- export assets with explicit sizing policy;
- see exactly what cannot be mapped;
- compare generated output to the Figma source;
- transfer a section to WordPress through a supported import/bridge path;
- do all core correctness work without generative-AI credits.

## 9. Mandatory AI-native engineering cycle

### A. Issues first

1. Read canonical memory-bank and README.
2. List all open issues.
3. Classify actionable/dependency-blocked/external-blocked/deferred.
4. Solve safely actionable work before unrelated implementation.
5. Never fake runtime/external evidence.

### B. PR/MR second

Inspect CI, mergeability, conflicts and unresolved review feedback for every open PR/MR before new development.

### C. Research gate for evolving external targets

Before implementation of a major new external adapter/capability:

1. refresh `docs/MARKET_RESEARCH_PLAN.md`;
2. verify official target documentation;
3. record competitor baseline/gaps;
4. classify target format/API stability;
5. identify privacy/network/licensing constraints;
6. update acceptance criteria and `DECISIONS.md` when needed.

Research is planning evidence only. Competitor claims are not runtime acceptance evidence.

### D. New development third

Only after issues, PR/MRs and the required research gate are processed.

Use focused issue/branch/PR work, preserve green CI and keep exact-build/provenance-sensitive paths intact unless the task requires changes.

### E. Mandatory end-of-work sync

After meaningful work:

- run relevant tests/verifiers;
- update PROJECT_STATE/NEXT_ACTIONS/ROADMAP/CHANGELOG;
- update DECISIONS for durable policy changes;
- update README module/overall status;
- retain exact blockers and next work.

## 10. Post-P12 multi-target expansion

Canonical details: `docs/COMMERCIAL_EXPANSION_PLAN.md`.

Recurring governance:

- **R0** — AI-assisted market/platform research refresh before major adapter implementation.

Planned implementation sequence:

1. **P13** — Build-Ready Score 2.0 + Responsive Risk.
2. **P14** — Target-Ready Duplicate + guided Prepare.
3. **P15** — Elementor native export/import validation, including section transfer strategy.
4. **P16** — Gutenberg native export/pattern/block transfer.
5. **P17** — HTML/CSS/JS export + static-first code-to-design import.
6. **P18** — framework adapter platform (React/Next/Vue/Nuxt/Svelte/Angular/Astro etc.).
7. **P19** — asset pack + font manifest + design-system/token export.
8. **P20** — round-trip visual QA + exact section portability / optional WordPress bridge.
9. **P21** — developer handoff + client/QA + bounded accessibility/SEO advisories.
10. **P22** — deterministic complexity/effort estimator.
11. **P23** — agency/project layer + existing-component bindings + change-only regeneration.
12. **P24** — CMS/dynamic data/forms/interactions mapping.
13. **P25** — Free/Pro/Agency commercial packaging + entitlements.
14. **P26** — optional AI assistance, including market-research synthesis and explanation/drafting only.

P13 implementation remains blocked until the internal P12 release-exit gate in #84 is closed. Planning/research may continue without granting implementation credit.

## 11. Commercial expansion safety rules

- responsive analysis reports risk, not invented mobile design;
- target preparation happens on a duplicate/candidate with validation;
- Elementor and Gutenberg outputs use versioned documented adapters;
- framework generators consume a neutral intermediate representation;
- direct WordPress transfer uses a documented import path or our own optional versioned companion bridge;
- no reliance on undocumented private clipboard formats;
- code-to-design JavaScript is sandboxed/disabled by default;
- raw font binaries are not claimed exportable from Figma when the Plugin API does not expose them;
- asset exports identify original/source-oriented vs rendered/scaled outputs accurately;
- complexity estimates are transparent/configurable;
- entitlements gate surfaces, not correctness;
- optional AI cannot authorize mutation, change score evidence, replace validators or claim unsupported target compatibility.
