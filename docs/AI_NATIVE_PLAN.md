# AI-Native Planning

Status: approved foundation plan  
Date: 2026-09-07  
Operational workflow updated: 2026-09-08  
Commercial multi-target expansion aligned: 2026-09-11  
Reliability/compatibility audit added: 2026-09-11

## 1. Product intent

Build a deterministic Figma audit/preparation platform that can validate an approved design, create a safe target-ready duplicate when needed, and produce native WordPress-builder or code artifacts through versioned adapters.

Elementor is the first commercial target, Gutenberg follows, and front-end code/framework outputs are added without coupling the scanner/classifier to one target schema.

The product is commercially useful only if option combinations, target versions, export state and failure recovery remain reliable. Adapter reliability is therefore part of architecture, not final QA polish.

## 2. Core workflow

1. User selects a supported source scope.
2. User selects a versioned target profile.
3. Plugin performs read-only audit.
4. Scanner builds a normalized neutral model.
5. Classifier detects layout patterns and risks.
6. Scoring engine produces evidence-backed readiness results.
7. Target compatibility engine reports supported, review and blocked mappings.
8. If target preparation is needed, plugin offers a target-ready duplicate.
9. Only previously proven recipes modify the candidate/duplicate.
10. Geometry/content/image/structure/pixel validation runs.
11. A versioned target adapter generates an artifact atomically.
12. Target schema/package/references/assets are validated.
13. Real import/build/render validation runs where the target harness exists.
14. Where feasible, a round-trip preview/render is compared to Figma.
15. Download/copy/import is offered with exact validation level and warnings.
16. A receipt records source fingerprint, target profile, adapter version and validation result.

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
- `docs/MARKET_RESEARCH_PLAN.md`: recurring R0 research method and public-market snapshot;
- `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md`: recurring R1 reliability/compatibility contract;
- `docs/COMMERCIAL_EXPANSION_PLAN.md`: commercial/target-adapter roadmap.

`AGENTS.md` enforces reading/updating these files.

## 5. Development philosophy

### Audit before mutate

No structural auto-fix ships before the same condition can be detected and explained read-only.

### Target validation before export

No target artifact should be presented as ready merely because serialization succeeded. A target adapter must validate schema/package/references/assets and report unsupported mappings before download/import.

### Live target truth is separate from local artifact truth

A locally validated Elementor/Gutenberg/code package is not automatically a verified live-site import. The UI and receipts distinguish:

- `SOURCE READY`;
- `ARTIFACT VALIDATED`;
- `IMPORT VERIFIED`;
- `RENDER VERIFIED`;
- `ROUND-TRIP VERIFIED`;
- `REVIEW REQUIRED`;
- `BLOCKED`.

### Capability-driven UI

Each adapter exposes a machine-readable capability descriptor. The UI derives valid choices from that descriptor rather than showing every global option.

Changing target/version/output/style options invalidates stale validation and clears incompatible dependent values.

Invalid combinations are disabled/rejected with a reason rather than failing late in generation.

### Atomic export

Target output is generated into a temporary candidate, validated, finalized, checksummed and only then exposed for download/copy. Partial or failed artifacts are discarded.

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

### Structured failure over generic errors

Accepted target flows use stable error codes, exact phase/adapter/run identity, retryability and actionable next steps. Generic-only `Something went wrong` failures are not sufficient.

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
- target-specific Elementor v3 Container cases;
- target-specific Elementor v4 Atomic cases;
- Gutenberg valid/invalid block cases;
- code-export component cases;
- framework option-combination cases;
- code-to-design static HTML/CSS cases;
- malformed ZIP/path traversal/oversize cases;
- asset stored-original vs rendered cases;
- font manifest/missing-font cases;
- cancellation/retry/stale-source cases.

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

### Asset Pack

Stored original image bytes where available, rendered appearance/scale variants, SVG/vector export, font usage manifest and design-token output.

## 8. Success criteria

A non-developer should eventually be able to:

- select a design/section;
- choose a supported target profile without seeing impossible option combinations;
- receive a trustworthy Build-Ready/Target-Ready result;
- create a validated target-ready duplicate when needed;
- export native editable builder/code output;
- export assets with explicit original-vs-rendered sizing policy;
- see exactly what cannot be mapped;
- distinguish local package validation from a real target import/render proof;
- compare generated output to the Figma source;
- cancel/retry safely without partial artifacts or source damage;
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

### C. R0 — research gate for evolving external targets

Before implementation of a major new external adapter/capability:

1. refresh `docs/MARKET_RESEARCH_PLAN.md`;
2. verify official target documentation;
3. record competitor baseline/gaps;
4. classify target format/API stability;
5. identify privacy/network/licensing constraints;
6. update acceptance criteria and `DECISIONS.md` when needed.

Research is planning evidence only. Competitor claims are not runtime acceptance evidence.

### D. R1 — reliability/compatibility gate

After R0 and before adapter implementation, freeze:

1. versioned immutable `TargetProfile`;
2. adapter capability descriptor;
3. option dependency/reset rules;
4. source fingerprint/stale-result rules;
5. state machine and valid UI actions;
6. structured error/retry contract;
7. atomic generation/download contract;
8. schema/package/reference/assets validator;
9. real target import/build/render harness where applicable;
10. exact readiness labels and receipt fields.

Canonical R1 specification: `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md`.

### E. New development third

Only after issues, PR/MRs and required R0/R1 gates are processed.

Use focused issue/branch/PR work, preserve green CI and keep exact-build/provenance-sensitive paths intact unless the task requires changes.

### F. Mandatory end-of-work sync

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
- **R1** — reliability/compatibility gate before adapter implementation/acceptance.

Planned implementation sequence:

1. **P13** — Build-Ready Score 2.0 + Responsive Risk.
2. **P14** — Target-Ready Duplicate + guided Prepare.
3. **P15** — Elementor native export/import validation with separate v3 Container/v4 Atomic adapter families and section transfer strategy.
4. **P16** — Gutenberg native export/pattern/block transfer with parse/serialize/editor validation.
5. **P17** — HTML/CSS/JS export + static-first code-to-design import.
6. **P18** — framework adapter platform (React/Next/Vue/Nuxt/Svelte/Angular/Astro etc.) with pinned build matrices.
7. **P19** — asset pack + font manifest + design-system/token export.
8. **P20** — round-trip visual QA + exact section portability / optional offline-first WordPress bridge.
9. **P21** — developer handoff + client/QA + bounded accessibility/SEO advisories.
10. **P22** — deterministic complexity/effort estimator.
11. **P23** — agency/project layer + existing-component bindings + change-only regeneration.
12. **P24** — CMS/dynamic data/forms/interactions mapping.
13. **P25** — Free/Pro/Agency commercial packaging + entitlements.
14. **P26** — optional AI assistance, including market-research synthesis and explanation/drafting only.

P13 implementation remains blocked until the internal P12 release-exit gate in #84 is closed. Planning/research/reliability audits may continue without granting implementation credit.

## 11. Commercial expansion safety and reliability rules

- responsive analysis reports risk, not invented mobile design;
- target preparation happens on a duplicate/candidate with validation;
- target profile is immutable for one run; changes invalidate prior results;
- Elementor v3 Container and v4 Atomic output are separate versioned adapter families;
- Elementor Core/Pro/third-party capabilities are declared explicitly;
- Gutenberg output must pass parse/serialize and editor validity checks;
- framework generators consume a neutral intermediate representation and pass pinned build matrices;
- direct WordPress transfer uses a documented import path or our own optional versioned companion bridge;
- current Community core remains network-free; arbitrary customer-domain push is not part of `allowedDomains: ["none"]`;
- no reliance on undocumented private clipboard formats;
- code-to-design JavaScript is sandboxed/disabled by default;
- image exports label Stored Original vs Rendered Appearance accurately;
- raw font binaries are not claimed exportable from Figma when the Plugin API does not expose them;
- complexity estimates are transparent/configurable;
- entitlements gate surfaces, not correctness;
- no silent fallback changes the output strategy behind the user's back;
- optional AI cannot authorize mutation, change score evidence, replace validators or claim unsupported target compatibility.
