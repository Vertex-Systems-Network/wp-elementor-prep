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

P12 remains `80%`. The authoritative publishing candidate remains source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`, Final Release Artifact #20 and exact three-file publish ZIP SHA-256 `1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

Remaining live evidence is intentionally deferred to P27 #182: exact release #20 Figma Desktop rebind, valid Publish final-details identity state, retained 2FA evidence, deterministic publisher-evidence intake receipt and separate final internal #84 release-exit review. Community approval remains external.

### #119 — Multi-target commercial expansion roadmap

Classification: **P13-P27 active roadmap; implementation/testing through P26 is authorized independently of final production release**.

P13 implementation is complete with runtime acceptance pending #159. P14 target-neutral pure-core implementation is active. P15-P26 remain preflight-frozen / implementation not started. P27 #182 is the deferred final production-release gate.

### #159 — P13 real-plugin Build-Ready runtime/parity evidence

Classification: **open runtime-acceptance dependency**.

Complete only when genuine real Figma Desktop Build-Ready evidence and deterministic plugin/CLI parity evidence are captured and reviewed. This gates P14 real mutation exposure, not continued pure-core implementation/testing.

### #182 — P27 final production-release gate

Classification: **defined / execution deferred**.

Run only after the implementation/internal-readiness program is ready. It owns final live runtime/publisher/2FA evidence, #84 release-exit review and the final production-acceptance sweep. Marketplace review/approval remains external.

### #213 — P14 top-level run-input runtime evidence snapshot

Classification: **ACTIVE / PR #214 under same-cycle documentation and final exact-head verification**.

PR #214 (`fix/p14-run-input-snapshot-213`) closes the narrow public caller-object trust boundary without changing mutation or target authority:

1. `plan`, `registry`, `coordinator`, `inputBounds`, `confirmation`, `transactionId`, `preparedName`, `allowPreparedWithReview` and `shouldCancel` are read through guarded one-shot top-level access before bounds/core semantics;
2. accepted values are copied into a plain snapshot and delegated explicitly; the public wrapper no longer uses `...input`, so caller getters are not re-entered after validation;
3. non-object input or a throwing known top-level getter returns bounded `BLOCKED` + `P14_INTERNAL_INVARIANT_FAILED` evidence at stage `run-input` before coordinator or adapter access;
4. safely readable plan correlation data is retained where possible; unreadable values fall back to bounded `UNKNOWN` / `p14-plan-invalid` evidence;
5. runtime `now` metadata deliberately stays on the existing fail-soft clock contract, so a throwing/malformed clock property or callback becomes `UNKNOWN` event time rather than transaction authority failure;
6. existing run-control normalization, `P14_INPUT_TOO_LARGE`, confirmation, registry, coordinator, cancellation and adapter evidence semantics remain unchanged;
7. adversarial tests cover non-object input, throwing top-level getters, one-shot getters, hostile `now` getter and normal `PREPARED` regression;
8. no new status/error code, production recipe, real Figma mutation surface, target compatibility or production acceptance is introduced.

Initial code/test head `3d558f9ac58bde1cfebd82b7e3a11d0a1d94c93e` passed CI #901, P12 Final Release Artifact #212 and P12 Offline Acceptance #256 on Ubuntu/macOS/Windows. Same-cycle README/foundation/memory synchronization follows on the same branch; fresh exact-head CI, Integration Readiness, Final Release Artifact, cross-platform Offline Acceptance and clean/current/mergeable review evidence are required before merge.

## Recently completed P14 safety slices

- #210 / PR #211 — guarded unreadable runtime action-eligibility hook property access; exact synchronized head `57b97950928390e8c07ce82e48f92ddff7fabd4f` passed CI #895, Integration Readiness #257, Final Release #206 and Offline #250, then guarded squash-merged as `7f24e57a28941e80d290b9b7dfbdce5fd718e534`.
- #207 / PR #208 — caller run-control runtime evidence, normalization and guarded `inputBounds` snapshot; guarded squash merge `df1e8f33394f13a371c2ff0b97bb6eceb321fd91`.
- #201 / PR #205 — injected coordinator acquisition/release evidence and truthful lease cleanup; merge `e80bf4c21b64d6b72714965f4e954759e1c4159d`.
- #198 / PR #199 — bounded safe-recipe registry evidence before semantic authorization; merge `80cefcb8b90a85b5e5a8b5ad4e6a0f65ddf6d12b`.
- #195 / PR #196 — runtime clock/event timestamp evidence; merge `8021874323f5bad6ebf648b0891bc9f6358dd1bf`.
- #192 / PR #193 — bounded receipt envelope/runtime diagnostics; merge `e54cb44c3dabe6cd2a459f70df917b9422fadddd`.

P14 remains runtime-unwired and the production safe-recipe registry remains intentionally empty.

## Current implementation sequence

### P14

1. finish #213 / PR #214 on the exact synchronized head;
2. keep the approved source immutable and mutate only candidates/duplicates;
3. keep production safe-recipe authority empty until explicit acceptance;
4. continue focused target-neutral trust-boundary audits until pure-core implementation is internally ready;
5. fail closed on malformed/stale caller, plan, confirmation, registry, coordinator, adapter, validation, score, receipt or cancellation evidence while preserving truthful cleanup state;
6. require #159 before any real Figma mutation exposure;
7. require genuine real-Figma acceptance before any production mutation/readiness claim.

### P15-P18 external target adapters

Before implementation of each major adapter:

1. refresh R0 official platform docs and market facts;
2. execute R1 and freeze the immutable target profile, capability matrix, option-state rules, error model, validators and acceptance harness;
3. keep target artifact validation distinct from observed live import/render verification;
4. use documented target formats/APIs or the versioned WP Builders Bridge; do not depend on undocumented Elementor clipboard internals;
5. keep generated framework dependencies pinned and arbitrary code-to-design JavaScript disabled until a separately accepted sandbox exists.

### P19-P26

Implement in roadmap dependency order only after prerequisite target outputs/contracts are stable. Preserve truthful stored-original/rendered asset semantics, explicit font limitations, deterministic handoff/QA/effort evidence, capability-based commercial entitlements and non-authoritative optional AI.

## Important implementation guardrails

- Deterministic core correctness remains AI-free and network-free.
- Original visual design remains authoritative.
- Low confidence => REVIEW, never guessed mutation.
- Candidate -> validate -> retain/discard remains the mutation contract.
- Current Community core remains `allowedDomains: ["none"]`.
- Offline-valid artifact != observed live target import/render proof.
- Raw font binaries are packaged only when separately user-supplied and license-permitted.
- Stored image-fill bytes are not described as proven upstream upload provenance.
- Optional AI cannot authorize mutations, change deterministic score evidence or replace validators.
- Implementation-complete, internally-ready, production-accepted and marketplace-approved remain separate states.

## Verification baseline

For implementation batches run the relevant subset of:

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

Runtime/manual evidence is retained only when genuinely observed; CI cannot manufacture it.

## Progress tracking

- historical P0-P7 core: `100%`;
- P9/P10 accepted technical slices: `100%`;
- P11 implementation: `100%`;
- P12 final validation: `80%`;
- R0/R1: recurring planning/reliability gates;
- P13 implementation: `100%` with runtime acceptance pending #159;
- P14: pure-core implementation/hardening active, runtime unwired;
- P15-P26: `0%`, preflight-frozen / implementation not started;
- P27: final production-release gate defined, execution deferred.
