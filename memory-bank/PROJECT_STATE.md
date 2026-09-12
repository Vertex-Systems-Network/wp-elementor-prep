# Project State

Last updated: 2026-09-12

## Product

`wp-elementor-prep` ships as **WP Builders Prepare**: a deterministic Figma audit/safe-prep engine focused first on WordPress Elementor.

Implemented surfaces today:

1. normal Figma plugin packaging/distribution layer;
2. npm/Node CLI for supported Figma inputs;
3. structured continuous-improvement backlog outputs;
4. exact-build release/provenance and fail-closed P12 publisher-evidence intake tooling.

Approved post-P12 direction is now broader: **Figma -> validated target-ready website/build output**, with Elementor first, Gutenberg second, then generic web/framework adapters through a neutral model.

## Non-negotiable policy

- deterministic/AI-free core correctness;
- current core plugin network-free;
- audit before mutation;
- low confidence => REVIEW;
- original design authoritative;
- target preparation happens on candidate/duplicate with validation;
- no undocumented reverse engineering when a documented adapter/bridge is possible;
- responsive risk may be reported but mobile/tablet composition is not invented;
- target adapters are versioned and isolated;
- capability-driven UI prevents invalid option combinations;
- target/package/live-environment validation states remain separate;
- no silent fallback to a different widget/block/code strategy;
- implementation-complete != production-accepted;
- no fabricated runtime/external evidence.

## Current issue queue

- #84 — P12 final integrated validation/release acceptance: **ACTIVE / retained at 80%**. Remaining exact runtime/publisher/2FA evidence and the final internal release-exit decision are deferred to the P27 final-release sequence. Community approval remains external.
- #119 — P13-P27 commercial/multi-target roadmap: **ACTIVE**. P13-P26 implementation/testing may proceed to implementation-complete/internal-readiness without waiting for #84; production acceptance/release remains separate.
- #159 — P13 real-plugin Build-Ready runtime/parity evidence: **OPEN runtime-acceptance dependency**. P13 implementation is complete, but real-plugin runtime acceptance is not.
- #182 — P27 final production-release gate: **DEFINED / execution deferred** until the implementation/internal-readiness program is ready.
- #213 — P14 top-level run-input runtime evidence snapshot: **COMPLETED** through PR #214; issue closed automatically by the verified guarded squash merge.
- #210 — P14 unreadable runtime action-eligibility hook access: **COMPLETED** through PR #211; issue closed automatically by the verified guarded squash merge.
- #207 — P14 caller run-control runtime evidence: **COMPLETED** through PR #208; issue closed automatically by the verified guarded squash merge.
- #201 — P14 injected-coordinator runtime evidence and lease cleanup: **COMPLETED** through PR #205.
- #198 — P14 safe-recipe registry evidence bounds: **COMPLETED** through PR #199.
- #195 — P14 runtime clock/event timestamp evidence: **COMPLETED** through PR #196.
- #192 — P14 bounded receipt envelope/diagnostics/runtime exception evidence: **COMPLETED** through PR #193.
- #126 — exact release #20 publisher evidence intake hardening: **COMPLETED** through PR #129.
- #202, #203 and #204 — accidental empty issue creations during the #201 tool cycle: **CLOSED / NOT PLANNED**. They carry no implementation scope; #201 was authoritative.

## Current PR / main queue

- Current P14 core main baseline is `f8a983a1ed7d18963e23901996a60f64d55678cd`, the guarded squash merge of PR #214 / issue #213.
- PR #214 exact synchronized head `5058b82ad17eb166c1e9445aed6959a07bbe856c` passed CI #907, Integration Readiness #268, P12 Final Release Artifact #218 and P12 Offline Acceptance #262 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and GitHub reported `mergeable=true` before the guarded squash merge.
- PR #214 snapshots `plan`, `registry`, `coordinator`, `inputBounds`, `confirmation`, `transactionId`, `preparedName`, `allowPreparedWithReview` and `shouldCancel` through guarded one-shot reads, delegates only a plain explicit snapshot to the internal core, and removes `...input` getter re-entry. Non-object/unreadable caller evidence returns bounded `BLOCKED` + `P14_INTERNAL_INVARIANT_FAILED` at stage `run-input` before coordinator/adapter access. Runtime `now` property/callback handling remains on the established fail-soft `UNKNOWN` event-time contract. No new status/error code, production recipe authority or real Figma mutation exposure was introduced.
- Initial #214 code/test head `3d558f9ac58bde1cfebd82b7e3a11d0a1d94c93e` had already passed CI #901, P12 Final Release Artifact #212 and P12 Offline Acceptance #256 on Ubuntu/macOS/Windows before same-cycle docs synchronization.
- PR #211 exact synchronized head `57b97950928390e8c07ce82e48f92ddff7fabd4f` passed CI #895, Integration Readiness #257, P12 Final Release Artifact #206 and P12 Offline Acceptance #250 on Ubuntu/macOS/Windows; it guarded squash-merged as `7f24e57a28941e80d290b9b7dfbdce5fd718e534` and issue #210 closed completed.
- PR #212 synchronized post-#211 status and squash-merged as `ce6b00b523eee675b34363bbe99ec467bc0b14b5`.
- PR #208 exact synchronized head `c3b577bcf09e3f97060cfcba7b76d202e9119019` passed CI #882, Integration Readiness #247, P12 Final Release Artifact #193 and P12 Offline Acceptance #237 on Ubuntu/macOS/Windows; it guarded squash-merged as `df1e8f33394f13a371c2ff0b97bb6eceb321fd91` and issue #207 closed completed.
- PR #209 synchronized post-#208 status and squash-merged as `080ff3738720d6d2c77570e341f1e43a6cf8daa5`.
- PR #205 exact synchronized head `1f76443e652f5d7c2c3dd9498b33463c1c2e7e03` passed CI #872, Integration Readiness #239, P12 Final Release Artifact #183 and P12 Offline Acceptance #227 on Ubuntu/macOS/Windows; it squash-merged as `e80bf4c21b64d6b72714965f4e954759e1c4159d`.
- PR #199 exact synchronized head `e782a08090a4e158f99da22bf25d8fff60c8c529` passed CI #863, Integration Readiness #231, P12 Final Release Artifact #174 and P12 Offline Acceptance #218 on Ubuntu/macOS/Windows; it squash-merged as `80cefcb8b90a85b5e5a8b5ad4e6a0f65ddf6d12b`.
- PR #196 exact synchronized head `47cb0b4d2d3c53f7f818af760131cc78737cb5c4` passed CI #854, Integration Readiness #224, P12 Final Release Artifact #165 and P12 Offline Acceptance #209 on Ubuntu/macOS/Windows; it squash-merged as `8021874323f5bad6ebf648b0891bc9f6358dd1bf`.
- PR #193 completed receipt-envelope/runtime-diagnostic hardening and merged as `e54cb44c3dabe6cd2a459f70df917b9422fadddd`.
- PR #129 merged P12 publisher evidence intake tooling as `cc466367fa0c6fee119d4fb183371af5fb3f04c7`.
- PR #131 retained the current R0 commercial market snapshot as `a22b3121f1d00698ee9d4e4bf283f3bf2bfa9119`.

## Current planning baseline

The commercial plan has two recurring pre-implementation gates, implementation phases P13-P26, and the final production-release gate P27:

- **R0 — Market/Platform Research:** AI-assisted public research + official-platform verification before major externally evolving adapters.
- **R1 — Reliability/Compatibility Gate:** explicit target profile, capability matrix, option-state contract, structured errors, atomic export, target validator and acceptance harness before implementation.

Research is advisory and neither R0 nor R1 overrides safety or counts as runtime acceptance.

Canonical docs:

- `docs/MARKET_RESEARCH_PLAN.md`;
- `docs/R0_MARKET_SNAPSHOT_2026-09-11.md`;
- `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md`;
- `docs/COMMERCIAL_EXPANSION_PLAN.md`;
- `docs/P14_FOUNDATION_IMPLEMENTATION.md`;
- `docs/AI_NATIVE_PLAN.md`;
- `docs/FEATURE_PLAN.md`;
- `docs/P12_PUBLISHER_EVIDENCE_INTAKE.md`.

## Reliability audit conclusions

The P13-P26 direction remains commercially strong, but the reliable product contract requires:

- immutable versioned `TargetProfile` per run;
- machine-readable adapter capability descriptors that generate valid UI options;
- stale validation invalidation whenever target/source/options change;
- separate `SOURCE READY`, `ARTIFACT VALIDATED`, `IMPORT VERIFIED`, `RENDER VERIFIED` and `ROUND-TRIP VERIFIED` states;
- no claim that an offline-valid WordPress package is guaranteed to import on an unobserved site;
- separate Elementor v3 Container and v4 Atomic adapter families rather than one generic exporter;
- explicit Pro/third-party capability declarations;
- Gutenberg parse/serialize/editor validation;
- generated framework projects must compile/build under pinned adapter matrices;
- image export must distinguish stored original image bytes from rendered appearance;
- raw font binaries remain user-supplied/license-permitted only;
- export jobs use a strict state machine, bounded concurrency, cooperative cancel, deterministic retry and atomic final download;
- stable error codes and actionable recovery instead of generic-only failures;
- direct arbitrary WordPress-domain push remains outside the offline Community core; bridge file/paste import is preferred first.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Maintain issues/PR/R0/R1/evidence sync |
| P0-P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P6 advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P7 batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P8 historical exporter placeholder | DEFERRED / SUPERSEDED | N/A | Replaced by P15+ neutral adapter architecture |
| P9 backlog generator | COMPLETE / P12 ACCEPTED | 100% | Retained real plugin export quality |
| P10 npm/CLI | COMPLETE / P12 ACCEPTED | 100% | Retained real REST/auth/plugin parity |
| P11 Figma distribution | IMPLEMENTATION COMPLETE | 100% | Live publisher/install evidence belongs to P12 |
| P12 final validation | IN PROGRESS | 80% | Fresh exact-#20 runtime/final-details/2FA evidence, then receipt + final internal exit review |
| R0 market/platform research | PLANNING GATE | N/A | September snapshot retained; refresh before each major adapter |
| R1 reliability/compatibility | PLANNING GATE | N/A | Freeze adapter/profile/validation/error contracts before implementation |
| P13 Build-Ready Score + Responsive Risk | IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING | 100% impl | #159 real-plugin parity/internal runtime acceptance |
| P14 Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | Continue the next focused pure-core safety-gap audit after #213; production registry remains empty |
| P15-P26 multi-target commercial implementation | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | Implement in dependency order with R0/R1 where applicable |
| P27 final production release | GATE DEFINED / EXECUTION DEFERRED | 0% exec | Coordinate final live runtime/publisher/2FA evidence + #84 release-exit truth |

Historical P0-P7 core progress remains 100%. Implementation completion, runtime acceptance and production release are tracked separately.

## Approved user-facing future flow

`Choose source -> Choose target/profile -> Audit -> Compatibility -> Build/Target-Ready Score -> Responsive Risk -> Create Target-Ready Duplicate if needed -> Validate -> Generate atomically -> Validate artifact -> Verify real target when available -> Round-trip QA -> Receipt -> Download/Copy/Import -> Handoff/QA`

## P12 publishing candidate truth

The publishing-ID candidate under manual evaluation was produced from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`, P12 Final Release Artifact #20, artifact ID `10179286885`, digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`.

Exact three-file publish ZIP SHA-256: `1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

`config/p12-publisher-candidate.json` machine-pins the exact candidate. `npm run p12:publisher-evidence` verifies the exact ZIP + extracted plugin files, hashes the required screenshots, requires explicit operator attestations, and emits `acceptanceAuthority: false` so the tool cannot self-close P12.

Current available screenshots were manually triaged and do **not** close the gate: one final-details screenshot still contains the historical `Invalid ID in manifest.json` state, two screenshots are Data Security steps, and one plugin screenshot is historical P6 closure evidence rather than the minimal release #20 package rebind. The triage is retained in #84 comment `5633658106`.

Planning/docs/support-tool changes after source `5f12...` do not automatically replace the runtime candidate or count as live acceptance.

## Current R0 truth

PR #131 retained `docs/R0_MARKET_SNAPSHOT_2026-09-11.md` from current public competitor/platform research. The durable implication is that generic Figma-to-code conversion is not a defensible product moat by itself; commercial differentiation remains **validated target readiness**: compatibility analysis, safe target-ready duplication, explicit mapping/fallback states, target validation, environment diagnostics, render/round-trip proof and receipts.

R0 research remains advisory and must be refreshed again when a major adapter implementation actually begins.

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains authoritative for exact-build runtime provenance.

## Immediate target

Continue the implementation/internal-readiness program without making production-release claims:

1. start the next focused P14 target-neutral safety-gap audit from core main `f8a983a1...` while real Figma mutation remains unwired and the production recipe registry remains empty;
2. complete #159 only when genuine real-plugin runtime/parity evidence is available; it gates P14 real mutation exposure, not pure-core development;
3. refresh R0 and execute R1 before each major external target adapter where platform facts/capabilities require it;
4. implement P15-P26 in dependency order with atomic validators/harnesses and no live-target claim without observed evidence;
5. use P27 #182 only after implementation/internal-readiness is ready;
6. during P27, capture the remaining exact runtime, Publish final-details and 2FA evidence, run the retained P12 publisher-evidence intake, and perform the genuine #84 release-exit decision;
7. keep Community submission/review/approval external to internal production acceptance.
