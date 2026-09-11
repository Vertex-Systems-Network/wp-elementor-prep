# Next Actions

Last updated: 2026-09-11

## Mandatory cycle

1. Issues first.
2. PR/MR second.
3. R0 research refresh when the next task depends on an evolving external target.
4. Highest-priority unblocked roadmap work.
5. Tests/verification before acceptance claims.
6. README + memory-bank sync in the same cycle.
7. No fabricated runtime/external evidence.

## Current queue classification

### #84 — P12 final integrated validation/release acceptance

Classification: **active external/manual runtime + publisher gate**.

P12 remains `80%` until live evidence closes the exact publishing-package/account/2FA/final-exit path.

Current retained publishing candidate:

- plugin ID `1680034649341961379`;
- source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`;
- Final Release Artifact #20;
- artifact `wp-builders-prepare-final-release-20`, ID `10179286885`;
- digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`.

Immediate required evidence remains:

1. exact selected exit package used in Figma Desktop;
2. live final-details screen with valid ID;
3. intended Publish-as identity/eligibility;
4. required 2FA state;
5. network disclosure consistent with accepted release contract;
6. final internal release-exit review.

Community submission/review/approval remains external.

### #119 — Multi-target commercial expansion roadmap

Classification: **planning active / implementation dependency-blocked by #84 internal exit**.

Research/planning may proceed; P13 runtime code may not.

Canonical future order:

- R0 — recurring AI-assisted market/platform research gate;
- P13 — Build-Ready Score 2.0 + Responsive Risk;
- P14 — Target-Ready Duplicate + Guided Prepare;
- P15 — Elementor native export + import validation;
- P16 — Gutenberg native export + section transfer;
- P17 — HTML/CSS/JS export + static-first code-to-design import;
- P18 — framework adapter platform;
- P19 — asset pack + font manifest + design-system export;
- P20 — round-trip visual QA + exact section portability / optional WP Builders Bridge;
- P21 — developer handoff + client/QA + bounded a11y/SEO advisories;
- P22 — deterministic complexity/effort estimator;
- P23 — agency/project + existing-component bindings + change-only regeneration;
- P24 — CMS/dynamic data/forms/interactions;
- P25 — Free/Pro/Agency packaging + entitlements;
- P26 — optional AI assistance.

## R0 research actions already captured

Current September 2026 snapshot records:

- official Elementor JSON/ZIP/template/kit import paths and modern container/Atomic data structures;
- official Gutenberg serialization/pattern import/export model;
- market competition from native WordPress conversion and Figma-to-code tools;
- Figma asset export capabilities;
- Figma raw-font-file export limitation.

Before implementing P15, P16, P17 or P18, refresh official target docs and competitor baseline again rather than assuming the September snapshot is still current.

## First implementation sequence after P12 internal exit

### P13

1. open a focused P13 implementation issue from #119;
2. freeze Build-Ready v2 categories and target-compatibility evidence schema;
3. add responsive-risk fixtures;
4. implement read-only only;
5. add deterministic plugin/CLI parity tests;
6. calibrate on real Figma where offline fixtures cannot prove behavior;
7. production acceptance before P14 new mutation scope.

### P14

After P13 acceptance:

1. define `Create Target-Ready Duplicate` transaction contract;
2. ensure original remains untouched;
3. prepare only already-explainable patterns;
4. validate/re-score duplicate;
5. real Figma acceptance.

### P15/P16 target exporters

For each target:

1. R0 official-doc refresh;
2. versioned adapter contract;
3. native element/block mapping matrix;
4. schema/package validator;
5. target-ready duplicate prerequisites;
6. representative export fixtures;
7. real import into supported target version;
8. section-level artifact transfer proof;
9. record unsupported mappings explicitly.

## Important implementation guardrails

- Do not reverse-engineer undocumented Elementor clipboard internals; prefer template artifacts and optional WP Builders Bridge.
- Do not claim "NestJS design export"; NestJS is backend/API scaffold only and must pair with a front-end adapter.
- Code-to-design JavaScript execution stays OFF by default until a separate sandbox specification is accepted.
- Raw font binaries are not exportable from Figma merely because font names are accessible. Default is a font manifest; package raw fonts only when user-supplied and license-permitted.
- Image export UI must state whether output is source-oriented/original where available or rendered/scaled from the design.
- Every downloadable target artifact requires target validation and an export receipt.
- Round-trip visual QA must never auto-pass unsupported target rendering.
- Optional AI cannot authorize mutations, change score evidence or replace target validators.

## Verification baseline

For future implementation batches run the relevant subset of:

```bash
npm install
npm run status:verify
npm run typecheck
npm test
npm run build
npm run build:cli
npm run verify:release-contract
npm run test:release-package
npm run community:verify
npm run p12:offline
npm run integration:readiness
```

Target phases will add their own adapter/schema/import/render harness tests.

Runtime artifact preflight requires exact-build provenance, immutable/manifest checks and the active schema-v3 registry contract.

## Progress tracking

- historical P0-P7 core: `100%`;
- P9/P10 accepted technical slices: `100%`;
- P11 implementation: `100%`;
- P12 final validation: `80%`;
- P13-P26: `0%`, planned/dependency-blocked.
