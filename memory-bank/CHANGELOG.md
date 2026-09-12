# Changelog

## 2026-09-12 — P14 unreadable nested bounded-input evidence hardening

- Opened authoritative issue #216 and focused PR #221 (`fix/p14-bounds-evidence-216`) for unreadable nested plan/confirmation evidence encountered by the P14 bounded-input preflight.
- Confirmed that top-level run-input snapshotting did not protect nested bounds traversal: throwing getters/proxies inside confirmation, plan source/actions or nested action collections could still reject the public transaction promise during the public preflight or the internal core's second bounds pass.
- Guarded the public `assessP14PreparationInputBounds(...)` traversal and added the existing `P14_INTERNAL_INVARIANT_FAILED` structured refusal at stage `bounds-evidence` with bounded runtime diagnostics.
- Guarded the internal retained-duplicate core bounds traversal independently so evidence that becomes unreadable only on the second pass also fails closed; that internal refusal uses `UNKNOWN` source/run correlation and `p14-plan-invalid` instead of dereferencing hostile plan metadata again.
- Preserved ordinary readable oversized evidence on the existing `P14_INPUT_TOO_LARGE` / `bounds` path and preserved normal readable `PREPARED` behavior. No deep canonical snapshot of readable nested semantics, new status/error code, production recipe authority, real Figma mutation surface, target compatibility or production acceptance was introduced.
- Added `tests/p14-bounds-evidence-boundary.test.ts` covering first-pass hostile confirmation evidence, second-pass plan evidence that becomes unreadable, readable oversized-input regression and normal preparation regression. The core full-file replacement was diff-audited and contained only the intended bounds helper/preflight changes.
- Initial code/test head `7ef0a2b43262024ee1f1df59e658143e4dac2681` passed CI #913 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #224 passed; P12 Offline Acceptance #268 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #216. Final synchronized-head CI, Integration Readiness, Final Release Artifact, cross-platform Offline Acceptance and clean/current/mergeable review verification remain required before PR #221 may merge.
- Accidental duplicate/placeholder issues #217, #218, #219 and #220 were created during tool routing, immediately closed `not_planned`, and carry no implementation scope. #216 is authoritative.

## 2026-09-12 — P14 top-level run-input runtime-evidence snapshot

- Opened issue #213 and focused PR #214 (`fix/p14-run-input-snapshot-213`) for the remaining public caller-object property-access trust boundary before P14 transaction semantics.
- Confirmed that the public wrapper still read `input.plan` / `input.confirmation` directly and delegated with `...input`, allowing hostile or one-shot top-level getters to reject the transaction promise or change evidence after run-control validation.
- Added a guarded one-shot snapshot for `plan`, `registry`, `coordinator`, `inputBounds`, `confirmation`, `transactionId`, `preparedName`, `allowPreparedWithReview` and `shouldCancel`; the internal core now receives an explicitly constructed plain object rather than re-entering caller getters through object spread.
- Non-object input or an unreadable known top-level property now returns bounded `BLOCKED` + `P14_INTERNAL_INVARIANT_FAILED` evidence at stage `run-input` before coordinator or adapter access. Safely readable plan correlation metadata is retained where possible; unreadable values use bounded fallbacks.
- Kept runtime clock metadata on the separate fail-soft contract: a throwing/malformed `now` property or callback still produces `UNKNOWN` event time rather than becoming transaction authority failure.
- Preserved existing run-control normalization, raw-size `P14_INPUT_TOO_LARGE`, confirmation, registry authorization, coordinator, cancellation and adapter evidence semantics.
- Added `tests/p14-run-input-snapshot.test.ts` covering non-object input, throwing getters across all known top-level properties, hostile `now`, exact one-shot getter reads and normal `PREPARED` regression. Existing run-control tests continue to prove oversized-control behavior.
- Initial code/test head `3d558f9ac58bde1cfebd82b7e3a11d0a1d94c93e` passed CI #901 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #212 passed; P12 Offline Acceptance #256 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #213. No real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Exact synchronized PR head `5058b82ad17eb166c1e9445aed6959a07bbe856c` passed CI #907, Integration Readiness #268, P12 Final Release Artifact #218 and P12 Offline Acceptance #262 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #214 guarded squash-merged as `f8a983a1ed7d18963e23901996a60f64d55678cd`; issue #213 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.

## 2026-09-12 — P14 runtime eligibility hook property hardening

- Opened issue #210 and focused PR #211 (`fix/p14-runtime-eligibility-hook-210`) for the remaining unreadable optional runtime action-eligibility hook property boundary.
- Audited the sequential transform path and confirmed that `adapter.assessActionEligibility` was read outside the guarded invocation after a prior recipe could already have mutated the candidate; a throwing/proxy-backed getter could therefore escape before structured candidate cleanup.
- Hardened the public retained-duplicate adapter boundary with a guarded optional-hook property: a throwing getter becomes a deferred callable failure consumed by the existing `P14_TRANSFORM_FAILED` / `transform-recheck` catch path, so candidate discard is attempted instead of letting the transaction escape.
- Readable missing/non-function hook values preserve the existing deterministic structured refusal, while valid hooks are invoked with the original adapter as `this` so adapter state/private expectations remain intact.
- Existing cleanup semantics remain authoritative: if candidate discard also fails after unreadable hook access, the receipt becomes `CLEANUP_REQUIRED` with `P14_DISCARD_FAILED`; no new status or error code was added.
- Added `tests/p14-runtime-eligibility-hook-boundary.test.ts` covering throwing getter cleanup, throwing getter plus discard failure, readable non-function behavior and valid-hook regression.
- Initial head `647a390028d0bee294448d96072a3515cf39f14a` exposed an exact-optional adapter-facade type mismatch in CI #886 before tests ran. Follow-up head `4a4cd0c818a4e5a334c80a2edfe175b6cbccb0c3` exposed implicit-any delegate parameters in CI #887, also before tests; both were TypeScript-only boundary corrections with no runtime-scope expansion.
- Corrected implementation head `a85e0d80a2421f126a74cafe7b581abbb5d897a1` passed CI #888 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #199 passed; P12 Offline Acceptance #243 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #210. No real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Exact synchronized PR head `57b97950928390e8c07ce82e48f92ddff7fabd4f` passed CI #895, Integration Readiness #257, P12 Final Release Artifact #206 and P12 Offline Acceptance #250 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #211 guarded squash-merged as `7f24e57a28941e80d290b9b7dfbdce5fd718e534`; issue #210 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.

## 2026-09-12 — P14 caller run-control runtime-evidence hardening

- Opened issue #207 and focused PR #208 (`fix/p14-run-control-evidence-207`) for the remaining caller-supplied transaction control trust boundary.
- Added `src/core/p14-run-control-evidence.ts` with `assessP14RunControlEvidence(...)` so transaction ID, prepared name, explicit review policy and custom input-bound overrides are validated before confirmation, coordination or adapter access.
- `transactionId` must be a runtime string with a non-whitespace identity and is normalized once before coordinator, adapter and receipt use; supplied `preparedName` must be a string, is normalized once and preserves the established empty/whitespace fallback to `Prepared Duplicate`.
- `allowPreparedWithReview` must be absent or a literal boolean. Truthy non-boolean runtime values can no longer grant the existing `PREPARED_WITH_REVIEW` policy exception.
- Known `inputBounds` fields are read through guarded property access, snapshotted into a plain object and require positive-integer values when supplied. Throwing proxy/getter evidence therefore fails closed instead of escaping the first safety gate.
- Malformed run controls return bounded `BLOCKED` + `P14_INTERNAL_INVARIANT_FAILED` evidence at stage `run-control` before source coordination or adapter access. Valid typed but oversized raw identities preserve the existing `P14_INPUT_TOO_LARGE` bounds outcome.
- Preserved the previous retained-duplicate engine byte-for-byte as internal `src/core/p14-retained-duplicate-transaction-core.ts`; the original public transaction module path is now the hardened run-control boundary.
- Added `tests/p14-run-control-evidence.test.ts` covering throwing bounds getters, malformed control types/values, truthy non-boolean review authorization, normalized runtime identities, explicit boolean review authorization and oversized-control regression semantics.
- Initial implementation head `9e4b0ca8c7abf69d2c7052bcf26f48526e0587dc` passed CI #876 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #187 passed; P12 Offline Acceptance #231 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #207. No real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Final synchronized PR head `c3b577bcf09e3f97060cfcba7b76d202e9119019` passed CI #882, Integration Readiness #247, P12 Final Release Artifact #193 and P12 Offline Acceptance #237 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true`, then guarded squash-merged as `df1e8f33394f13a371c2ff0b97bb6eceb321fd91`. Issue #207 closed completed.

### #201 — P14 transaction coordinator runtime evidence and lease cleanup

Classification: **COMPLETED / merged through PR #205**.

PR #205 (`fix/p14-coordinator-runtime-evidence-201`) closed the injected-coordinator trust-boundary gap without changing recipe or target authority:

1. `assessP14TransactionLeaseResultEvidence(...)` validates acquisition results as runtime evidence before any adapter access;
2. acquired lease source scope and transaction ID must be bounded and exactly match the normalized requested identities;
3. refusal reasons are restricted to the coordinator contract and optional owner identities are bounded before receipt use;
4. throwing, unreadable proxy-backed or malformed acquisition evidence fails closed as structured coordination evidence;
5. malformed evidence that still claims acquisition triggers a one-shot best-effort release using the exact expected lease identity;
6. coordinator release is considered successful only when it returns literal `true`;
7. release false/non-boolean/throw cannot escape or be silently ignored and instead converts the terminal transaction outcome to `CLEANUP_REQUIRED` with bounded `coordination-release` evidence;
8. if retention already succeeded, truthful retained candidate/retention/validation/re-score evidence is preserved while lease recovery remains required; pre-clone cleanup failure does not invent a candidate;
9. default coordinator conflict/concurrency behavior and NO_CHANGES_NEEDED no-lease behavior remain unchanged;
10. no distributed locking, host authentication, real Figma mutation surface or production recipe authority is introduced.

Initial code/test head `511bf68adbe1859695d7dbe2dea12e974afa024f` passed CI #867, P12 Final Release Artifact #178 and P12 Offline Acceptance #222 on Ubuntu/macOS/Windows. Exact synchronized head `1f76443e652f5d7c2c3dd9498b33463c1c2e7e03` then passed CI #872, Integration Readiness #239, P12 Final Release Artifact #183 and P12 Offline Acceptance #227 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and `mergeable=true`, then guarded squash-merged as `e80bf4c21b64d6b72714965f4e954759e1c4159d`. Issue #201 closed completed.

Accidental issues #202, #203 and #204 were created empty during tool invocation, immediately marked **CLOSED / NOT PLANNED**, and carry no work; #201 is the only authoritative implementation issue for this slice.

### #198 — P14 safe-recipe registry evidence bounds

Classification: **COMPLETED / merged through PR #199**.

PR #199 (`fix/p14-registry-bounds-198`) closed the registry resource-bound gap without changing authorization authority:

1. `assessP14SafeRecipeRegistryBounds(...)` reuses existing P14 safety limits rather than defining new registry-specific limits;
2. top-level `bindings` is count-bounded before binding traversal;
3. recipe `sourceRuleIds`, `prerequisites`, `conflictsWith` and `mutationAllowlist` are count-bounded before item traversal;
4. binding/rule/recipe/profile/order/dependency/conflict identities are bounded before semantic validation;
5. `validateP14SafeRecipeRegistry(...)` applies the resource gate before its existing semantic traversal, so handoff resolution and runtime authorization inherit it;
6. oversized proxy-backed arrays are rejected from `.length` without item/property traversal;
7. oversized and bounded-malformed registries preserve the existing execution outcome `BLOCKED` + `P14_RECIPE_UNAUTHORIZED` before confirmation/coordinator/adapter access;
8. the production safe-recipe registry remains empty and no mutating recipe authority is introduced.

Initial code/test head `4ebf8328159f6d0d94ba8b606987cb8c0599a66a` passed CI #858, P12 Final Release Artifact #169 and P12 Offline Acceptance #213 on Ubuntu/macOS/Windows. Exact synchronized head `e782a08090a4e158f99da22bf25d8fff60c8c529` then passed CI #863, Integration Readiness #231, P12 Final Release Artifact #174 and P12 Offline Acceptance #218 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and `mergeable=true`, then squash-merged as `80cefcb8b90a85b5e5a8b5ad4e6a0f65ddf6d12b`. Issue #198 closed completed.

### #195 — P14 runtime clock and event timestamp evidence

Classification: **COMPLETED / merged through PR #196**.

PR #196 (`fix/p14-runtime-clock-evidence-195`) completed the clock-evidence scope without adding any real Figma mutation surface or production recipe authority:

1. shared normalized UTC millisecond timestamp validation is used by confirmation and event evidence;
2. confirmations remain strict and reject unavailable-time evidence;
3. receipt event timestamps accept only normalized UTC or explicit `UNKNOWN`;
4. oversized/non-canonical event timestamps are rejected before parsing;
5. runtime `now()` throw/non-string/oversized/non-canonical output cannot escape the transaction and becomes `UNKNOWN`;
6. `UNKNOWN` represents unavailable wall-clock evidence only and does not alter event state/detail, cleanup or terminal-status semantics;
7. tests cover hostile callbacks, pre-parse length rejection, strict confirmation compatibility and forged receipt timestamps.

Initial head `38ec9c36e44aa1e2431802bc74d8c9bab6a1adbe` passed P12 Offline Acceptance #203 but exposed a test-only TypeScript inference error in CI #848 / P12 Final Release Artifact #159. After explicit callback typing, exact synchronized head `47cb0b4d2d3c53f7f818af760131cc78737cb5c4` passed CI #854, Integration Readiness #224, P12 Final Release Artifact #165 and P12 Offline Acceptance #209 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and `mergeable=true`, then squash-merged as `8021874323f5bad6ebf648b0891bc9f6358dd1bf`. Issue #195 closed completed.

### #192 — P14 bounded receipt envelope and runtime diagnostics

Classification: **COMPLETED / merged through PR #193**.

PR #193 (`fix/p14-receipt-envelope-bounds-192`) completed the issue scope without adding any real Figma mutation surface or production recipe authority:

1. `appliedActions`, `errors` and `events` are count-bounded before item traversal using the existing P14 action-count safety limit;
2. receipt `transactionId`, `p13RunId`, `planDigest`, source-node identity and error stages use the existing identity bound;
3. error detail/recovery and event detail use the existing detail bound;
4. transaction error/event constructors emit bounded diagnostics by construction;
5. adapter/discard exception text is rendered fail-closed, including hostile `toString()` behavior;
6. regression coverage includes proxy-backed no-traversal arrays, exact-boundary acceptance, forged oversized evidence and oversized/hostile runtime exceptions;
7. `docs/P14_FOUNDATION_IMPLEMENTATION.md` records the invariant without changing runtime/acceptance authority.

Exact synchronized PR head `5b9a02ce3b15ab49a1f281b51494e51bc5eb0e57` passed CI #844, Integration Readiness #217, P12 Final Release Artifact #155 and P12 Offline Acceptance #199 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/comments, was current with main (`behind_by=0`) and `mergeable=true`, then squash-merged as `e54cb44c3dabe6cd2a459f70df917b9422fadddd`. Issue #192 closed completed.

## R0 research actions already captured

PR #131 retained the current September 2026 snapshot in `docs/R0_MARKET_SNAPSHOT_2026-09-11.md` and merged as `a22b3121f1d00698ee9d4e4bf283f3bf2bfa9119`.

The retained snapshot records:

- official Elementor JSON/ZIP/template/kit import paths and modern container/Atomic data structures;
- Elementor v4 Atomic architecture and hybrid coexistence with v3 content;
- official Gutenberg serialization/parse/serialize model;
- Figma export, original image-byte and font limitations;
- market competition from native WordPress conversion and Figma-to-code tools;
- current competitive pressure from UiChemy, Anima, Locofy, Builder.io and first-party Figma design-to-code direction;
- the durable positioning rule that generic conversion alone is not the moat: validated target readiness, environment-aware diagnostics, explicit mapping/fallback states, render/round-trip proof and receipts are the stronger differentiators.

Current-main checks on the retained R0 merge passed CI #735, Integration Readiness #168, P12 Offline Acceptance #90 and P12 Final Release Artifact #46.

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

## Current implementation sequence under the P13-P27 model

### P13

Implementation is complete for Build-Ready Score v2, Responsive Risk, plugin/CLI integration and retained real-source calibration. Remaining work is #159 genuine real-plugin runtime/parity evidence and separate internal runtime acceptance. This is not a production-release claim.

### P14

Current work is target-neutral pure-core hardening only:

1. complete #216 / PR #221 on its final synchronized head, then begin the next focused safety-gap audit from the resulting main;
2. keep the approved source immutable and mutate only retained candidates;
3. keep production safe-recipe authority empty until explicit acceptance;
4. fail closed on malformed/stale adapter/control/receipt/registry/coordinator evidence while preserving truthful cleanup state;
5. validate/re-score before retention and reject newly introduced HIGH/BLOCKER findings;
6. continue focused safety-gap audits until core implementation is internally ready;
7. require #159 before real Figma mutation exposure;
8. require genuine real-Figma acceptance before any production mutation/readiness claim.

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
- P13 implementation: `100%` with runtime acceptance pending #159;
- P14: pure-core implementation/hardening active, runtime unwired;
- P15-P26: `0%`, preflight-frozen / implementation not started;
- P27: final production-release gate defined, execution deferred.