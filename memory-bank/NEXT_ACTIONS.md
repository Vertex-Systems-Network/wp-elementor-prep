# Next Actions

Last updated: 2026-09-10

## Current policy

P9–P11 implementation is complete. P12 #84 is now the sole release-expansion final validation gate.

For every P12 cycle:
1. inspect open Issues;
2. inspect open PR/MR;
3. continue the highest-priority unblocked validation/integration obligation;
4. run repository integrity/provenance checks where applicable;
5. synchronize README + memory-bank state during the same cycle;
6. never fabricate runtime evidence or describe validation-pending work as production-accepted.

## Current queue

Final validation/integration:
- #6 — P5 Safe Fix: implementation complete; genuine Figma closure + current-main integration pending;
- #7 — P6 Advanced structures: implementation complete on reference head; fresh final integration/artifact/runtime closure pending after P5;
- #8 — P7 Batch queue: implementation complete on reference head; fresh final integration/artifact/stress/cancel closure pending after P5;
- #84 — P12 final integrated validation/release acceptance.

Completed release-expansion implementation:
- #81 / P9 → PR #89;
- #82 / P10 → PR #93;
- #83 / P11 → PR #94.

P8 Elementor exporter remains deferred.

## Runtime/provenance boundary

Canonical P5 #488 provenance/preflight/archive plumbing remains hardened.

Latest authoritative P5 integration truth is `CODE_CONFLICT`. Historical integration proof #37 / CI #500 is superseded. Final P5 closure must be followed by a fresh then-current-main integration resolution preserving helper overlap safety, CI/status tooling, artifact provenance and closure/runbook hardening.

Runtime artifact preflight requires a non-symlink artifact root, stable descriptor identity, immutable file hashes, exact build identity and schema-v3 manifest semantics.

P6 #494 and P7 #490 remain engineering/reference artifacts; fresh final artifacts and real runtime closure are required after P5 final integration.

## P9 — implementation complete

Merged PR #89. Real plugin backlog/export/parity behavior remains part of P12.

## P10 — implementation complete

Merged PR #93. Real credentialed Figma REST execution, canonical snapshot parity, Windows/macOS path behavior and plugin/CLI parity remain P12 tasks.

## P11 — implementation complete

Merged PR #94 at `7f83a1f82459cd9354882235dd04153bb20e5760`.

Implemented:
- release manifest/capability registry;
- deterministic real-plugin-ID/source-SHA package builder;
- fail-closed package/provenance verifier;
- release-output source-overlap safety;
- normal-user current-capability menu commands;
- audit/backlog JSON + Markdown exports;
- developer-command exclusion;
- CHANGELOG/version/release contract;
- Community metadata/readiness verifier;
- privacy/offline-network declaration;
- local/private/team/Community distribution guide;
- release checks in CI.

Pre-merge P11 evidence:
- CI #640 PASS;
- Integration Readiness #99 PASS;
- 129 tests PASS;
- reviews 0;
- review threads 0.

Actual normal-plugin install/use, final integrated P5/P6/P7 menu capabilities, filled Community metadata/assets/support contact and Community submission readiness remain P12 tasks.

## P12 — immediate execution sequence

### A. Refresh exact current state
1. verify post-P11 `main` CI + Integration Readiness;
2. refresh P5 → current-main integration readiness; do not rely on stale historical conflict file lists;
3. retain canonical P5 #488 exact artifact provenance and registry pins.

### B. P5 final closure/integration
1. prepare/import the exact P5 artifact-derived plugin with a genuine Figma development-plugin ID using sibling/non-nested output;
2. run `Developer: P5 Runtime Self-Test` in real Figma Desktop;
3. require compiled runtime acceptance PASS;
4. collect genuine rendered-pixel forced-reject / restore / finalize evidence and zero leftovers;
5. export stable `p5-evidence.json` without manual edits;
6. pass current-main `runtime:closure-intake` with original ZIP binding where retained;
7. re-run integration readiness against then-current main;
8. deliberately resolve P5 code conflicts while preserving current-main safety/tooling/release-expansion work;
9. run full CI, merge P5, close #6 only after all evidence/integration gates pass.

### C. P6 final line
After P5 merge:
1. resolve P6 against merged line;
2. create/register fresh exact artifact;
3. collect real image-bearing positive calibration + preservation-refusal evidence;
4. pass closure intake;
5. merge/close #7.

### D. P7 final line
After P5/P6-required line:
1. resolve P7 against merged line;
2. create/register fresh exact artifact;
3. run realistic 60+ sequential batch and require every item terminal + max concurrency 1;
4. request cancellation during genuinely active long Full P3 processing;
5. collect cooperative cancellation evidence;
6. pass closure intake;
7. merge/close #8.

### E. P9/P10/P11 release acceptance
Validate on equivalent real inputs/builds:
- P9 backlog categories, dedupe, delta and plugin exports;
- P10 official Figma URL/file-key CLI and canonical snapshot CLI;
- raw `.fig` clear unsupported/supported-bridge behavior;
- plugin/CLI parity and deterministic outputs;
- Windows/macOS CLI path handling where applicable;
- P11 final integrated release package provenance/reproducibility;
- local dev import + normal installed/private plugin flow;
- final release menu matches actually integrated capabilities;
- filled Community metadata, support contact, category/target and final visual assets;
- final publishable readiness check.

Figma Community review/approval is external and must never be reported as completed until it actually occurs.

## Progress tracking

- historical P0–P7 core progress remains `93%`;
- P9 implementation: `100%`, P12 validation pending;
- P10 implementation: `100%`, P12 validation pending;
- P11 implementation: `100%`, P12 validation pending;
- P12 final validation: `0%`, active next gate.