# Next Actions

Last updated: 2026-09-11

## Mandatory cycle

1. Issues first.
2. PR/MR second.
3. R0 research refresh when the next task depends on an evolving external target.
4. R1 reliability/compatibility contract freeze for that target.
5. Highest-priority unblocked roadmap work.
6. Tests/verification before acceptance claims.
7. README + memory-bank sync in the same cycle.
8. No fabricated runtime/external evidence.

## Current queue classification

### #84 — P12 final integrated validation/release acceptance

Classification: **active external/manual runtime + publisher gate**.

P12 remains `80%` until live evidence closes the exact publishing-package/account/2FA/final-exit path.

Current retained publishing candidate:

- plugin ID `1680034649341961379`;
- source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`;
- Final Release Artifact #20;
- artifact `wp-builders-prepare-final-release-20`, ID `10179286885`;
- artifact digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`;
- exact three-file publish ZIP digest `sha256:1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

PR #129 / issue #126 added deterministic evidence intake support. The exact candidate is pinned in `config/p12-publisher-candidate.json`; use `docs/P12_PUBLISHER_EVIDENCE_INTAKE.md` and `npm run p12:publisher-evidence -- ...`.

Immediate required evidence/action:

1. use the exact pinned release #20 publish ZIP and extracted three-file directory;
2. re-import/update that exact package in Figma Desktop and confirm it opens/runs on the known acceptance design/frame;
3. retain the live Publish → Add final details screen with valid manifest ID, intended Publish-as identity, Community target, support contact and `No network access` visible;
4. retain the Figma account/security screen showing required 2FA enabled;
5. run `npm run p12:publisher-evidence -- ...` with all explicit confirmations set to `yes` only for facts actually observed;
6. retain the generated receipt; it must say `acceptanceAuthority: false` and `evidenceBundleComplete: true`;
7. perform final internal release-exit review from the receipt + original screenshots.

The evidence intake tool verifies exact bytes and hashes screenshots; it deliberately does not OCR screenshots, infer account state, submit the plugin or self-promote P12.

Community submission/review/approval remains external.

### #119 — Multi-target commercial expansion roadmap

Classification: **planning active / implementation dependency-blocked by #84 internal exit**.

Research/reliability planning may proceed; P13 runtime code may not.

Canonical future order:

- R0 — recurring AI-assisted market/platform research gate;
- R1 — recurring adapter reliability/compatibility gate;
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
- Elementor v4 Atomic architecture and hybrid coexistence with v3 content;
- official Gutenberg serialization/parse/serialize model;
- Figma export, original image-byte and font limitations;
- market competition from native WordPress conversion and Figma-to-code tools.

Before implementing P15, P16, P17 or P18, refresh official target docs and competitor baseline again rather than assuming this snapshot is still current.

## R1 reliability actions now mandatory

Canonical contract: `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md`.

Before implementation of a target adapter, freeze and test:

1. immutable versioned `TargetProfile` schema;
2. adapter capability descriptor (`SUPPORTED`, `SUPPORTED_WITH_REVIEW`, `UNSUPPORTED`, `REQUIRES`);
3. UI dependency/reset rules so stale incompatible options cannot survive target/version changes;
4. target-specific structured error codes and recovery paths;
5. source fingerprint/staleness policy;
6. atomic generation/download policy;
7. artifact schema/reference/assets validator;
8. real target import/build/render harness where applicable;
9. round-trip QA policy where feasible;
10. acceptance labels: SOURCE READY / ARTIFACT VALIDATED / IMPORT VERIFIED / RENDER VERIFIED / ROUND-TRIP VERIFIED / REVIEW / BLOCKED.

No adapter may claim live target compatibility from local package validation alone.

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
5. add cancellation/retry/source-staleness coverage;
6. real Figma acceptance.

### P15 Elementor

Before implementation:

1. R0 refresh official Elementor docs;
2. R1 freeze separate initial adapter families (`elementor-v3-container`, `elementor-v4-atomic`);
3. define Core/Pro capability overlays explicitly;
4. distinguish template JSON, template ZIP and website-kit ZIP contracts;
5. define global-style/variable/reference closure rules;
6. define DECLARED vs OBSERVED WordPress environment profiles;
7. add schema/package/asset validators;
8. add real import tests into supported Elementor versions;
9. add server/import failure diagnostics for ZIP support/upload/memory/third-party requirements where observable;
10. prove section artifact/bridge flow without undocumented clipboard internals.

### P16 Gutenberg

Before implementation:

1. R0 refresh target WordPress/block docs;
2. R1 freeze WordPress version/block capability profile;
3. native core-block mapping matrix;
4. parse -> serialize -> parse stability tests;
5. editor-open tests without invalid-block recovery prompts;
6. explicit theme/custom-block dependency reporting;
7. section/pattern transfer proof.

### P17/P18 web/framework

Before implementation:

1. R0 demand/version research;
2. R1 target profile and option capability matrix;
3. generated project dependency versions pinned, never `latest`;
4. generated fixture install/typecheck/build matrix;
5. invalid option combinations impossible in UI and rejected by core contracts;
6. static-first code import only;
7. ZIP path traversal/zip-bomb/file-count/remote-resource tests;
8. arbitrary JS remains OFF until separate sandbox acceptance.

## Important implementation guardrails

- Do not reverse-engineer undocumented Elementor clipboard internals; prefer template artifacts and optional WP Builders Bridge.
- Keep the Community core offline; arbitrary direct push to customer WordPress domains is not part of the current `allowedDomains: ["none"]` contract.
- Do not claim "NestJS design export"; NestJS is backend/API scaffold only and must pair with a front-end adapter.
- Code-to-design JavaScript execution stays OFF by default until a separate sandbox specification is accepted.
- Figma image-fill bytes may be exported as `Stored Original` when `getImageByHash(...).getBytesAsync()` succeeds; cropped/effected appearance is a separate rendered export.
- Do not call stored image bytes the upstream upload source when provenance is unknown.
- Raw font binaries are not exported from Figma merely because font names are accessible. Default is a font manifest; package raw fonts only when user-supplied and license-permitted.
- Every downloadable target artifact requires target validation and an export receipt.
- Offline-valid package != observed live-site import success.
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

Target phases will add adapter capability, option-state, schema/package, malformed-input, import/build/render and round-trip harness tests.

Runtime artifact preflight requires exact-build provenance, immutable/manifest checks and the active schema-v3 registry contract.

## Progress tracking

- historical P0-P7 core: `100%`;
- P9/P10 accepted technical slices: `100%`;
- P11 implementation: `100%`;
- P12 final validation: `80%`;
- R0/R1: planning gates, no runtime completion percentage;
- P13-P26: `0%`, planned/dependency-blocked.
