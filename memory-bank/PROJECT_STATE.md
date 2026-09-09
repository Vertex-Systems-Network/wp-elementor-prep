# Project State

Last updated: 2026-09-10

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma audit/safe-prep engine for WordPress Elementor.

Final planned user surfaces:
1. a normal Figma plugin;
2. an npm/Node CLI for supported Figma inputs;
3. structured continuous-improvement backlog outputs.

## Current policy

Manual/runtime/end-to-end product testing remains deferred until P12 final integrated validation.

Before P12:
- implementation may continue where safe;
- production safety locks and exact-build provenance remain active;
- no runtime evidence may be fabricated;
- implementation-complete is not production-accepted;
- latest integration-conflict facts must be preserved.

## Repository baseline

Latest merged implementation baseline is `main` `7e6aa85958060cc927d8fe09dc5cb88a3feba53e` from P10 PR #93.

P9 merged through PR #89 at `67d6b3df05c8e4550b3df80f95cb5fabeb77de42`.

PR #85 remains authoritative for final P5 integration: latest verified Integration Readiness reports canonical P5 → current main as `CODE_CONFLICT`, not docs-only. Historical integration proof #37 / CI #500 is superseded for merge authorization. The final P5 integration resolution must preserve current-main source/output-overlap safety, CI/status tooling and closure/runbook hardening.

## Current issue queue

Core/runtime validation-pending:
- #6 — P5 Safe Fix;
- #7 — P6 Advanced structures;
- #8 — P7 Batch queue.

Release expansion:
- #81 — P9 actionable backlog generator: implementation completed via PR #89; issue closed; P12 validation pending;
- #82 — P10 npm/CLI + supported Figma source adapters: implementation completed via PR #93; issue closed; P12 validation pending;
- #83 — P11 normal Figma plugin packaging/distribution: active implementation on `feat/p11-release-packaging`;
- #84 — P12 final integrated validation/release acceptance.

P8 Elementor exporter remains deferred.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep Issues/PR/status/provenance synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | IMPLEMENTED / VALIDATION DEFERRED | 94% | P12 real Figma closure → fresh then-current-main `CODE_CONFLICT` resolution preserving #85 requirements → merge #6 |
| P6 advanced structures | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | P12 after P5 merge: fresh exact artifact + positive/refusal closure #7 |
| P7 batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | P12 after P5 merge: fresh exact artifact + 60+ stress/cancel closure #8 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate later |
| P9 backlog generator | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | Final plugin/runtime/parity checks in #84 |
| P10 npm/CLI | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | Final real URL/snapshot/OS-path/parity checks in #84 |
| P11 Figma plugin distribution | IMPLEMENTATION IN PROGRESS | 85% | Finish static package/community contracts → PR/CI → merge #83 → P12 release validation |
| P12 final validation | PLANNED FINAL GATE | 0% | Run all deferred final acceptance #84 |

## Progress interpretation

Historical P0–P7 core progress remains `93%` under its original denominator.

P9–P12 are a separate release-expansion line. Module percentages there represent implementation progress only until P12 production validation passes.

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3.

The registry continues to bind canonical P5/P6/P7 engineering artifacts to exact source/run/digest/file hashes and manifest semantics. P9–P11 do not mutate those registered artifacts or relax any closure gate.

## P5 current technical state

Canonical P5:
- branch `feat/p5-safe-recipes`;
- head `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`;
- CI #488;
- artifact `figma-plugin-dist-488`;
- ZIP SHA-256 `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`;
- manifest semantic SHA-256 `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`.

Current-main exact-artifact preflight/archive/provenance calibration is complete. Real imported-Figma acceptance remains scheduled for P12. After closure passes, P5 still requires a fresh integration resolution against the then-current main preserving current-main helper-overlap safety and hardened CI/status/closure contracts.

## P6/P7 current technical state

P6 #494 and P7 #490 remain engineering/reference artifacts. Their final production integration requires fresh exact artifacts after the final P5 merge. Those integrated runtime scenarios belong to P12.

## P9 — implementation complete

P9 merged in PR #89 at `67d6b3df05c8e4550b3df80f95cb5fabeb77de42`.

Implemented:
- ERROR / WARNING / INFO / IMPROVEMENT categories;
- deterministic semantic fingerprints and IDs;
- severity/priority + context/evidence;
- active category/severity summaries;
- OPEN / RESOLVED / REGRESSED / ACCEPTED_RISK lifecycle;
- NEW / RESOLVED / REGRESSED / UNCHANGED delta;
- retained resolved history;
- JSON/Markdown export;
- plugin UI backlog view/export;
- per-file/page/frame clientStorage history;
- stale async audit invalidation;
- non-mutating safety boundary.

Production/manual/runtime acceptance remains part of P12.

## P10 — implementation complete

P10 merged in PR #93 at `7e6aa85958060cc927d8fe09dc5cb88a3feba53e`.

Implemented:
- `audit:figma` using official Figma REST URL/file-key input;
- personal token + OAuth environment credential modes;
- explicit `--node-id` and URL `node-id` support;
- fail-closed ambiguous top-level frame selection;
- owned canonical snapshot schema v1;
- `audit:snapshot` offline path input;
- explicit `UNSUPPORTED_FIG_LOCAL_FILE` for raw `.fig` paths;
- `backlog:generate` from audit JSON;
- audit/backlog JSON + Markdown output;
- cloud audit `source-snapshot.json` export;
- `--out`, `--previous-backlog`, `--summary-only`, `--fail-on`;
- stable CLI exit-code contract;
- Node >=20 esbuild runner + persistent `build:cli` bundle;
- source-bound audit timestamps;
- credentials excluded from serialized outputs;
- strict TypeScript/CI implementation contracts.

Real Figma credential execution, Windows/macOS path behavior, snapshot parity and production acceptance remain P12 obligations.

## P11 — active implementation

Branch: `feat/p11-release-packaging`.

Implemented so far:
- separate release manifest template;
- explicit release capability/menu registry;
- deterministic release package builder requiring real plugin ID + source SHA;
- fail-closed release package verifier;
- normal-user release commands for current integrated capabilities;
- audit report and backlog JSON/Markdown exports;
- developer-only self-test/evidence command exclusion from normal release menu;
- release package fixture verification in CI;
- Community listing template + readiness verifier;
- privacy/offline network declaration;
- local/private/team/Community distribution documentation;
- release output source-control exclusion.

Remaining before implementation-complete:
- finish static release/community/version/changelog contracts;
- run PR CI and resolve implementation defects;
- merge #83;
- preserve actual normal-install/Community/runtime acceptance for P12.

Safe Fix/Prep and Batch are intentionally not exposed by the current release menu until their final integrated P12 runtime line exists.

Community publication remains subject to Figma review.

## P12 — final validation

P12 validates the completed implementation line:
- release artifact provenance/reproducibility;
- local dev-plugin import;
- normal plugin install/run;
- P5 rendered-pixel reject/restore/finalize + zero leftovers;
- P5 closure intake + fresh current-main conflict resolution preserving PR #85 requirements;
- P6 fresh-artifact positive/refusal acceptance;
- P7 fresh-artifact 60+ sequential queue + active cancellation;
- P9 backlog category/dedupe/delta/export quality;
- P10 real Figma URL/file-key CLI;
- P10 canonical snapshot-path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity and deterministic outputs;
- P11 release/distribution package readiness;
- final closure-intake;
- Windows/macOS CLI path handling where applicable.

Only after P12 passes should the expanded release be production-accepted / 100%.

## Immediate development target

1. finish P11 static package/community/version contracts on `feat/p11-release-packaging`;
2. keep README + memory-bank synchronized during the P11 PR lifecycle;
3. run PR CI, fix defects and merge #83 implementation;
4. then P12 #84 becomes the sole release-expansion final gate.