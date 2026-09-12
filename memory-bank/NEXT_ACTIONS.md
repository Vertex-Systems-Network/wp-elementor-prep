# Next Actions

Last updated: 2026-09-12

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

Classification: **active retained release-exit truth / live evidence deferred to P27**.

P12 remains `80%` until genuine live evidence closes the exact publishing-package/account/2FA/final-exit path. Development through P13-P26 is no longer blocked by this manual gate.

Current retained publishing candidate:

- plugin ID `1680034649341961379`;
- source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`;
- Final Release Artifact #20;
- artifact `wp-builders-prepare-final-release-20`, ID `10179286885`;
- artifact digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`;
- exact three-file publish ZIP digest `sha256:1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

PR #129 / issue #126 added deterministic evidence intake support. The exact candidate is pinned in `config/p12-publisher-candidate.json`; use `docs/P12_PUBLISHER_EVIDENCE_INTAKE.md` and `npm run p12:publisher-evidence -- ...`.

Current screenshot triage is explicitly **non-accepting** and retained in #84 comment `5633658106`. Deferred P27 work remains exact package rebind, live final-details/publisher identity, live 2FA evidence, deterministic evidence intake and separate internal release-exit review. Community submission/review/approval remains external.

### #119 — Multi-target commercial expansion roadmap

Classification: **P13-P27 active roadmap; implementation/testing through P26 is authorized independently of final production release**.

P13 implementation is complete, P14 pure-core implementation is active, P15-P26 remain preflight-frozen/not-started, and P27 #182 is the deferred final production-release gate.

Canonical future order remains R0 -> R1 -> P13 -> P14 -> P15 Elementor -> P16 Gutenberg -> P17 code -> P18 frameworks -> P19 assets -> P20 round-trip -> P21 handoff -> P22 estimator -> P23 agency/project -> P24 dynamic/forms -> P25 packaging -> P26 optional AI -> P27 final release.

### #195 — P14 runtime clock and event timestamp evidence

Classification: **COMPLETED / merged through PR #196**.

PR #196 completed the focused clock-evidence scope without adding real Figma mutation or production recipe authority:

1. shared normalized UTC millisecond timestamp validation is used by confirmation and event evidence;
2. confirmations remain strict and reject unavailable-time evidence;
3. receipt event timestamps accept only normalized UTC or explicit `UNKNOWN`;
4. oversized/non-canonical event timestamps are rejected before parsing;
5. runtime `now()` throw/non-string/oversized/non-canonical output cannot escape the transaction and becomes `UNKNOWN`;
6. event state/detail/cleanup semantics remain unchanged;
7. tests cover hostile clocks, parse bounds, strict confirmation compatibility and forged receipt timestamps.

Initial head `38ec9c36e44aa1e2431802bc74d8c9bab6a1adbe` exposed a test-only TypeScript inference failure in CI #848. After explicit callback typing, exact synchronized head `47cb0b4d2d3c53f7f818af760131cc78737cb5c4` passed CI #854, Integration Readiness #224, P12 Final Release Artifact #165 and P12 Offline Acceptance #209 on Ubuntu/macOS/Windows. It had zero unresolved review threads/reviews/comments, was current with main and `mergeable=true`, then squash-merged as `8021874323f5bad6ebf648b0891bc9f6358dd1bf`. Issue #195 closed completed.

### #192 — P14 bounded receipt envelope and runtime diagnostics

Classification: **COMPLETED / merged through PR #193**.

PR #193 completed bounded receipt collections, identities, diagnostics and runtime exception rendering and squash-merged as `e54cb44c3dabe6cd2a459f70df917b9422fadddd` after exact synchronized-head verification.

## R0 / R1 retained rules

Before major external target adapters, refresh official target/competitor facts where material and execute the reliability contract: immutable target profile, capability descriptor, option-state reset rules, structured errors, source staleness, atomic generation, artifact validators, real-target harness where applicable and evidence-scoped readiness labels.

No adapter may claim live target compatibility from local package validation alone.

## Current implementation sequence under the P13-P27 model

### P13

Implementation is complete. Remaining work is #159 genuine real-plugin runtime/parity evidence and separate internal runtime acceptance. This does not block P14 pure-core development.

### P14

Current work is target-neutral pure-core hardening only:

1. start the next focused safety-gap audit from main `8021874...` now that #195 / PR #196 is completed;
2. keep the approved source immutable and mutate only retained candidates;
3. keep production safe-recipe authority empty until explicit acceptance;
4. fail closed on malformed/stale adapter/control/receipt evidence while representing non-authoritative unavailable metadata explicitly;
5. validate/re-score before retention and reject newly introduced HIGH/BLOCKER findings;
6. continue focused safety-gap audits until core implementation is internally ready;
7. require #159 before real Figma mutation exposure;
8. require genuine real-Figma acceptance before any production mutation/readiness claim.

### P15 Elementor

Before implementation: refresh R0, freeze separate v3 Container/v4 Atomic target profiles, define Core/Pro capabilities, package contracts, global reference closure, declared-vs-observed environment evidence, schema/package/assets validators, real import harnesses and documented section transfer.

### P16 Gutenberg

Before implementation: refresh official block docs, freeze WordPress/block capabilities, native block mapping, parse/serialize stability, editor-open validity, dependency reporting and section/pattern transfer proof.

### P17/P18 web/framework

Before implementation: refresh demand/version facts, freeze capability matrices, pin generated dependencies, require fixture install/typecheck/build, prevent invalid options, keep static-first import, enforce archive defenses and leave arbitrary JS OFF pending separate sandbox acceptance.

## Important implementation guardrails

- Do not reverse-engineer undocumented Elementor clipboard internals.
- Keep the Community core offline.
- NestJS is backend/API scaffolding, not a visual renderer.
- Code-to-design arbitrary JavaScript stays OFF pending a separate accepted sandbox.
- Stored Figma image bytes and rendered appearance remain distinct evidence/output concepts.
- Raw font binaries require user-supplied/license-permitted files.
- Every target artifact requires validation and a receipt.
- Offline-valid package != observed live-site success.
- Optional AI cannot authorize mutations, change score evidence or replace validators.

## Verification baseline

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

Runtime artifact preflight requires exact-build provenance and the active schema-v3 registry contract.

## Progress tracking

- historical P0-P7 core: `100%`;
- P9/P10 accepted technical slices: `100%`;
- P11 implementation: `100%`;
- P12 final validation: `80%`;
- R0/R1: planning gates, no runtime completion percentage;
- P13 implementation: `100%` with runtime acceptance pending #159;
- P14: pure-core implementation/hardening active, runtime unwired;
- P15-P26: `0%`, preflight-frozen / implementation not started;
- P27: final production-release gate defined, execution deferred.
