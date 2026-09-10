# Project State

Last updated: 2026-09-10

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma audit/safe-prep engine for WordPress Elementor with three implemented user surfaces:
1. normal Figma plugin packaging/distribution layer;
2. npm/Node CLI for supported Figma inputs;
3. structured continuous-improvement backlog outputs.

## Current policy

P9–P11 implementation is complete. P12 #84 is the sole release-expansion final validation gate and is now `40%` complete after cross-platform offline acceptance plus genuine P5 Desktop/runtime closure and final integration.

Only properties directly exercised by retained evidence receive P12 credit. P5 real Desktop/runtime closure is complete; real Figma API/plugin parity, P6/P7 closure and Community review remain pending.

## Repository baseline

P11 implementation merge: `7f83a1f82459cd9354882235dd04153bb20e5760` / PR #94.

P12 offline acceptance merge: `cee0d79678e55abac4c3e288d7239eec129603c5` / PR #95.

Post-P11 main `f689fd0b703f83ee81953d36aef8d63bc2a56574` passed CI #645 and Integration Readiness #104. Readiness #104 refreshed P5 → main as `CODE_CONFLICT` across 11 paths including package/build/import and plugin/UI runtime files.

## Current issue queue

- #6 — P5 Safe Fix: CLOSED COMPLETED after real Desktop acceptance, closure-intake PASS and PR #99 merge;
- #7 — P6 Advanced structures: implementation complete on reference head, now unblocked for a fresh post-P5 final-line artifact/runtime closure;
- #8 — P7 Batch queue: implementation complete on reference head, fresh final-line stress/cancel closure pending after P5;
- #84 — P12 final integrated validation/release acceptance, active at 20%.

P8 exporter remains deferred. P9/P10/P11 implementation issues are closed.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep Issues/PR/status/provenance synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | Real Desktop + closure-intake + PR #99 merge PASS |
| P6 advanced structures | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | After P5: fresh exact artifact + real positive/refusal closure #7 |
| P7 batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | After P5: fresh exact artifact + 60+ stress/cancel closure #8 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate later |
| P9 backlog generator | IMPLEMENTATION COMPLETE / P12 REAL-PLUGIN VALIDATION PENDING | 100% | Real plugin/export/parity quality in #84 |
| P10 npm/CLI | IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | Offline cross-OS acceptance PASS; real Figma API/plugin parity pending |
| P11 Figma plugin distribution | IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | Offline release reproducibility PASS; final integrated install/Community readiness pending |
| P12 final validation | IN PROGRESS | 40% | Next critical path: P6 fresh final-line runtime closure |

Historical P0–P7 core progress is now `95%` under its original eight-phase denominator: P0–P5 at 100%, P6/P7 at 80%.

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

## P12 dependency security checkpoint — complete

Issue #96 / PR #97 cleared the two moderate dev-toolchain audit findings without changing runtime/product code. The pre-fix retained audit (run `34422011818`, artifact `10131236873`, SHA-256 `4d7c7b7f7d0e4bc5798e5d56465071e0bcf6fc28e04878ab96a292f9ed0ed8c9`) showed both findings were Vitest / `@vitest/mocker` advisory `GHSA-82fw-gwwq-j7x9`; production-only audit was already zero.

Vitest was updated from `^3.2.0` to `^4.1.11`. Compatibility run `34423555371` passed the full repository/release/offline/import suite and both full + production audits at zero; retained artifact `10131793673` has SHA-256 `c64dd7a76bc61c9980f3a254e50fa90deeb16fc7e19ba06de4c7fccb4e21aa91`. PR #97 CI #657 and cross-platform P12 Offline #12 passed, squash merge `01f959ebc792823ee67aa386a65335aab564d667` closed #96, and post-merge CI #658 / Integration Readiness #115 / P12 Offline #13 all passed.

No P5/P6/P7/P12 acceptance percentage changes from this maintenance checkpoint; genuine real-Figma/API/runtime/Community gates remain pending.

## P5 final technical state — COMPLETE

Canonical P5 #488 real Desktop evidence passed for source `810d98d6e09cb4cf3fe4758fcb07e87734254a8e` / run `34242984963` (#488). Current-main closure run `34463444342` completed with canonical archive SHA MATCH, immutable 5/5 MATCH, manifest semantic MATCH and same-artifact verifier exit 0. Final integration PR #99 passed CI #661 and merged as `91c3feda1e8841f5b07ec189c5289c701ce199f5`; post-merge CI #662, Integration Readiness #118 and P12 Offline #17 passed. Issue #6 is closed completed.

## P6/P7 state

P6 #494 and P7 #490 remain engineering/reference artifacts only. P5 is now merged, so P6 is unblocked for a fresh exact final-line build and real closure; P7 follows on the resulting final line.

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

P6 fresh post-P5 integration/build → final-closure-eligible registry/preflight → genuine real-Figma positive/refusal evidence → current-main closure intake → merge/close #7.

## P6/P7 downstream integration rehearsal checkpoint — 2026-09-10

- Current-main basis: `84ea74f7550edb1a4857e40fe4addb14369abb6f`, after the proven P5 rehearsal resolution.
- P6 `9a6ae3b29e2f70ebbd987a686856c2957f590b75`: 10 real post-P5 conflicts → 0 unresolved; latest run `34421353122` PASS; artifact `10131008051`; SHA-256 `96a175e83970a168c5ea2f0af0df2f057e50937330200632e468c86b7be6c650`.
- P7 `cbfdb66db531da8613582c84523265e42dad63a2`: 15 real post-P5 conflicts → 0 unresolved; run `34421353146` PASS; 66 test files / 323 tests PASS; artifact `10131008310`; SHA-256 `22a9473bead40053fb07e80aa0b00e1dd117c9bd0bbd94e395dd8afd57567982`.
- P7 compatibility was migrated to the stronger current build-bound P5 proof contract plus exact-build P7 receipt; the older unbound P5 proof model was not restored.
- Development-only P6/P7 controls remain excluded from the normal release surface.
- These rehearsals are `acceptanceAuthority: false`; they do not change P6/P7/P12 percentages or remove real-Figma/fresh-artifact closure requirements.

