# Project State

Last updated: 2026-09-10

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma audit/safe-prep engine for WordPress Elementor with three implemented user surfaces:
1. normal Figma plugin packaging/distribution layer;
2. npm/Node CLI for supported Figma inputs;
3. structured continuous-improvement backlog outputs.

## Current policy

P9–P11 implementation is complete. P12 #84 is the sole release-expansion final validation gate and is now `20%` complete after the cross-platform offline acceptance slice.

Only properties directly exercised by retained evidence receive P12 credit. Real Figma Desktop/runtime/API, P5/P6/P7 closure and Community review remain pending.

## Repository baseline

P11 implementation merge: `7f83a1f82459cd9354882235dd04153bb20e5760` / PR #94.

P12 offline acceptance merge: `cee0d79678e55abac4c3e288d7239eec129603c5` / PR #95.

Post-P11 main `f689fd0b703f83ee81953d36aef8d63bc2a56574` passed CI #645 and Integration Readiness #104. Readiness #104 refreshed P5 → main as `CODE_CONFLICT` across 11 paths including package/build/import and plugin/UI runtime files.

## Current issue queue

- #6 — P5 Safe Fix: implementation complete, genuine Figma closure + final current-main integration pending;
- #7 — P6 Advanced structures: implementation complete on reference head, fresh final-line artifact/runtime closure pending after P5;
- #8 — P7 Batch queue: implementation complete on reference head, fresh final-line stress/cancel closure pending after P5;
- #84 — P12 final integrated validation/release acceptance, active at 20%.

P8 exporter remains deferred. P9/P10/P11 implementation issues are closed.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep Issues/PR/status/provenance synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | IMPLEMENTED / VALIDATION DEFERRED | 94% | Genuine P12 Figma Desktop closure → current-main integration → merge #6 |
| P6 advanced structures | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | After P5: fresh exact artifact + real positive/refusal closure #7 |
| P7 batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | After P5: fresh exact artifact + 60+ stress/cancel closure #8 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate later |
| P9 backlog generator | IMPLEMENTATION COMPLETE / P12 REAL-PLUGIN VALIDATION PENDING | 100% | Real plugin/export/parity quality in #84 |
| P10 npm/CLI | IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | Offline cross-OS acceptance PASS; real Figma API/plugin parity pending |
| P11 Figma plugin distribution | IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | Offline release reproducibility PASS; final integrated install/Community readiness pending |
| P12 final validation | IN PROGRESS | 20% | Next critical path: genuine P5 Desktop/runtime closure |

Historical P0–P7 core progress remains `93%` under its original denominator.

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3.

Canonical P5/P6/P7 artifacts remain exact-build/provenance bound. P9–P12 work does not relax preflight, manifest semantic, archive, evidence or verifier gates.

## P12 completed offline acceptance

PR #95 added a machine-observed acceptance harness and a Linux/macOS/Windows workflow.

Accepted on all three operating systems:
- built Node >=20 CLI execution;
- canonical snapshot audit through paths containing spaces;
- repeated audit JSON/Markdown byte determinism;
- repeated backlog JSON/Markdown byte determinism;
- summary-only determinism with no file writes;
- raw `.fig` fail-closed behavior with exit `2` + `UNSUPPORTED_FIG_LOCAL_FILE`;
- repeated release build byte reproducibility for `code.js`, `manifest.json`, `ui.html`, `RELEASE_INFO.json`, `SHA256SUMS.txt` using identical fixture identity;
- release-package verifier PASS.

PR #95 evidence:
- standard CI #647 PASS;
- Integration Readiness #105 PASS;
- P12 Offline Acceptance run #2 PASS on Linux/macOS/Windows;
- Linux artifact `10127554503`, digest `eca07e7ca5559b9a74c88e61e23e4d6870a81eabd1aeb091f5c04a4f6c106276`;
- macOS artifact `10127561512`, digest `9ff90da24595c89dc57f67daa0fa12e01a122fd21551745b69cf52c2988ba9cd`;
- Windows artifact `10127564618`, digest `e2a95df86973adacc70f4cd2aa403f72c7ae9c4396ad2eb205aa10165070e9b8`.

These are genuine offline/cross-platform observations, not substitutes for real Figma runtime evidence.

## P5 integration rehearsal — non-authorizing PASS

A branch-only three-way rehearsal integrated canonical P5 `810d98d6e09cb4cf3fe4758fcb07e87734254a8e` with current main `3c3dc14bc48c3ea8e5df7620e223de0229737d9e` without merging P5 or changing acceptance state. Latest repeat run `34416999259` on rehearsal head `536d4b0f3b07d1675ab5cf87b69a83dbce7d6ebc` resolved the exact `11` current conflicts to `0`, then passed `195/195` integrated tests, status verification, strict typecheck, plugin/CLI builds, release-contract/package verification, Community template verification, P12 offline acceptance and local-import overlap invariants.

The rehearsal retained P9 audit/backlog non-mutation, P5 runtime-gated Safe Fix seams, current-main import safety, separate development vs normal-release UI exposure, and resolved P5 source/run provenance defines in release code. Retained artifact: `10129465465`, SHA-256 `faac0ca60f83c85931ccfd030f70d9672afbd03e55224a48631a2d5b029779b7`.

Canonical #488 + retained ZIP also passed current-contract `runtime:preflight` in run `34416999458`. The rehearsal is explicitly non-authorizing and does not replace genuine Figma Desktop evidence; P5 remains `94%` and P12 remains `20%`.

## P5 current technical state

Canonical P5:
- branch `feat/p5-safe-recipes`;
- head `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`;
- CI #488 / artifact `figma-plugin-dist-488`;
- ZIP SHA-256 `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`;
- manifest semantic SHA-256 `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`.

Exact artifact/archive/preflight calibration is complete. P12 must now use the genuine development-plugin ID and real Figma Desktop to collect compiled runtime + rendered-pixel reject/restore/finalize evidence, export `p5-evidence.json`, pass current-main closure intake, then refresh and resolve P5 → current-main integration.

Integration Readiness #104 conflict set against `f689fd0b703f`:
- `.github/workflows/ci.yml`;
- `README.md`;
- `memory-bank/CHANGELOG.md`;
- `memory-bank/NEXT_ACTIONS.md`;
- `memory-bank/PROJECT_STATE.md`;
- `memory-bank/ROADMAP.md`;
- `package.json`;
- `scripts/build.mjs`;
- `scripts/prepare-figma-import.mjs`;
- `src/plugin/main.ts`;
- `src/ui/ui.html`.

Final integration must refresh this list after genuine P5 closure because main may move.

## P6/P7 state

P6 #494 and P7 #490 remain engineering/reference artifacts only. Final production integration requires fresh exact builds after final P5 merge and real runtime evidence in P12.

## Remaining P12 matrix

Still unaccepted:
- real credentialed Figma REST URL/file-key CLI execution;
- equivalent real plugin audit + plugin/CLI parity;
- genuine P5 Figma Desktop runtime/rendered-pixel closure;
- P5 current-main integration and merge;
- fresh P6 final-line artifact + real positive/refusal closure;
- fresh P7 final-line artifact + real 60+ sequential stress/cancellation closure;
- real plugin backlog/report export quality;
- exact final integrated release artifact with real publisher/plugin identity;
- local dev import + normal installed/private plugin flow;
- final integrated release menu exposure;
- filled Community category/support/target/assets + publishable readiness;
- final release/closure exit review;
- actual Community review/approval remains external.

## Immediate target

Next critical path is genuine P5 Figma Desktop/runtime acceptance. If the environment cannot import/run the exact development-plugin artifact, do not fabricate evidence or merge P5; continue only with other independently genuine P12 checks.