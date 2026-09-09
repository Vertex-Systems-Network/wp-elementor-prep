# Project State

Last updated: 2026-09-10

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma audit/safe-prep engine for WordPress Elementor.

Final planned user surfaces:
1. a normal Figma plugin;
2. an npm/Node CLI for supported Figma inputs;
3. structured continuous-improvement backlog outputs.

## Current policy

P9–P11 implementation is complete. P12 #84 is now the sole release-expansion final validation gate.

Until P12 passes:
- production safety locks and exact-build provenance remain active;
- no runtime evidence may be fabricated;
- implementation-complete is not production-accepted;
- latest integration-conflict facts must be preserved;
- Community approval must not be claimed.

## Repository baseline

Latest P11 implementation merge is `7f83a1f82459cd9354882235dd04153bb20e5760` from PR #94.

P10 merged through PR #93 at `7e6aa85958060cc927d8fe09dc5cb88a3feba53e`; P9 merged through PR #89 at `67d6b3df05c8e4550b3df80f95cb5fabeb77de42`.

PR #85 remains authoritative for final P5 integration: canonical P5 → current main has a real `CODE_CONFLICT`, not docs-only. Historical integration proof #37 / CI #500 is superseded. Final P5 integration must preserve current-main source/output-overlap safety, CI/status tooling and closure/runbook hardening.

## Current issue queue

P12/final validation line:
- #6 — P5 Safe Fix: implementation complete, real-Figma closure/integration pending;
- #7 — P6 Advanced structures: implementation complete on reference head, fresh final integration/runtime closure pending;
- #8 — P7 Batch queue: implementation complete on reference head, fresh final integration/stress/cancel closure pending;
- #84 — P12 final integrated validation/release acceptance.

Release-expansion implementation completed:
- #81 / P9 via PR #89;
- #82 / P10 via PR #93;
- #83 / P11 via PR #94.

P8 Elementor exporter remains deferred.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep Issues/PR/status/provenance synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | IMPLEMENTED / VALIDATION DEFERRED | 94% | P12 real Figma closure → then-current-main conflict resolution → merge #6 |
| P6 advanced structures | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | P12 after P5: fresh exact artifact + positive/refusal closure #7 |
| P7 batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | P12 after P5: fresh exact artifact + 60+ stress/cancel closure #8 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate later |
| P9 backlog generator | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | Real plugin/export/parity checks in #84 |
| P10 npm/CLI | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | Real URL/snapshot/OS-path/parity checks in #84 |
| P11 Figma plugin distribution | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | Final integrated normal-install/release/Community-readiness checks in #84 |
| P12 final validation | ACTIVE FINAL GATE | 0% | Execute all deferred final acceptance #84 |

## Progress interpretation

Historical P0–P7 core progress remains `93%` under its original denominator.

P9–P12 are a separate release-expansion line. P9, P10 and P11 are 100% implementation-complete but remain production-validation pending until P12 passes.

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3.

The registry continues to bind canonical P5/P6/P7 engineering artifacts to exact source/run/digest/file hashes and manifest semantics. P9–P11 do not relax any closure gate.

## P5 current technical state

Canonical P5:
- branch `feat/p5-safe-recipes`;
- head `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`;
- CI #488;
- artifact `figma-plugin-dist-488`;
- ZIP SHA-256 `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`;
- manifest semantic SHA-256 `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`.

Exact-artifact preflight/archive/provenance calibration is complete. P12 must collect genuine imported-Figma acceptance, run current-main closure intake and then resolve P5 against the then-current main while preserving current-main safety/tooling contracts.

## P6/P7 current technical state

P6 #494 and P7 #490 remain engineering/reference artifacts. Their final production integration requires fresh exact artifacts after final P5 merge. Those integrated runtime scenarios belong to P12.

## P9 — implementation complete

P9 merged in PR #89. Delivered deterministic ERROR/WARNING/INFO/IMPROVEMENT backlog generation, semantic IDs, lifecycle/delta, summaries, JSON/Markdown export, plugin UI/history and stale async invalidation.

P12 retains real plugin/export/parity validation.

## P10 — implementation complete

P10 merged in PR #93. Delivered official Figma REST URL/file-key input, canonical snapshot schema/path, explicit frame selection, personal/OAuth auth modes, source snapshots, deterministic audit/backlog outputs, CI thresholds, Node >=20 CLI bundle, raw `.fig` refusal and credential-safe serialization.

P12 retains real credentialed execution, snapshot parity, OS-path behavior and production acceptance.

## P11 — implementation complete

P11 merged in PR #94 at `7f83a1f82459cd9354882235dd04153bb20e5760`.

Delivered:
- release-only manifest + capability/menu registry;
- deterministic package builder bound to real plugin ID + source SHA;
- release package SHA/provenance/menu/network verifier;
- destructive release-output overlap protection;
- normal-user current-capability menu commands;
- audit + backlog JSON/Markdown exports;
- developer-only command exclusion;
- root release-facing CHANGELOG and release-contract verifier;
- Community listing template + publishable readiness verifier;
- privacy/offline-network disclosure;
- local/private/team/Community distribution documentation;
- CI coverage for CLI build, release contract, release fixture and Community template.

P11 acceptance evidence:
- CI #640 PASS, including 129 tests and all release checks;
- Integration Readiness #99 PASS;
- reviews 0 / review threads 0.

Two concrete defects were fixed before merge:
1. potentially destructive release `--out` overlap with repository/source paths;
2. non-canonical release hash-file ordering detected by CI.

Safe Fix/Prep and Batch remain absent from the normal release menu until final integrated P12 runtime capabilities exist.

## P12 — active final validation

P12 must validate:
- final release artifact provenance/reproducibility;
- local dev-plugin import and normal plugin install/run;
- P5 real rendered-pixel reject/restore/finalize + zero leftovers + closure intake + fresh main conflict resolution;
- P6 fresh final-line positive/refusal acceptance;
- P7 fresh final-line 60+ sequential queue + active cancellation;
- P9 real backlog/export behavior;
- P10 real Figma URL/file-key CLI + canonical snapshot + OS paths;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity and deterministic outputs;
- P11 final release/distribution package readiness;
- filled Community metadata/assets/support details;
- final closure-intake and release exit review.

Only after P12 passes should the expanded release be production-accepted / 100%.

## Immediate target

1. keep README + memory-bank synchronized through P12;
2. verify post-P11 main CI/readiness;
3. start P12 with non-fabricated prerequisites and exact current-main integration facts;
4. collect real runtime evidence only through genuine supported environments.