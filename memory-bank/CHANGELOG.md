# Changelog

## 2026-09-12 — P14 safe-recipe registry semantic snapshot hardening

- Opened authoritative issue #226 and focused PR #227 (`fix/p14-registry-semantic-snapshot-226`) after a fresh post-#223 P14 authorization-boundary audit.
- Confirmed a readable-but-stateful registry TOCTOU gap distinct from #198: resource bounds, semantic validation and later recipe authorization/resolution could re-read the same caller-owned registry evidence at different times, allowing bounded readable getters/proxies to change bindings or nested recipe semantics after validation.
- Added `src/core/p14-registry-semantic-snapshot.ts` to capture only the known safe-recipe registry contract into bounded plain evidence through guarded property/index reads after the first registry resource preflight. It does not enumerate arbitrary properties or perform a generic deep clone.
- `assessP14SafeRecipeRegistryEvidence(...)` now performs first resource bounds, semantic capture, a second bounds pass over the plain snapshot, then semantic validation. Evidence that grows oversized after first preflight stays invalid rather than entering authorization semantics; unreadable capture fails closed with bounded diagnostics.
- `validateP14SafeRecipeRegistry(...)`, exact safe-recipe resolution and `authorizeP14PreparationPlan(...)` consume stable plain registry evidence, so caller-owned `bindings`/recipe getters are not re-entered after the registry evidence boundary.
- Existing transaction authority remains unchanged: invalid/unreadable/oversized registry evidence still yields `BLOCKED` + `P14_RECIPE_UNAUTHORIZED` before confirmation, source coordination or adapter access; the production safe-recipe registry remains empty.
- Added `tests/p14-registry-semantic-snapshot.test.ts` covering top-level binding re-entry, nested recipe re-entry, evidence that grows oversized after the first bounds pass, capture-time unreadability and normal exact authorization behavior.
- Initial implementation/test head `4bd44da760d0dc0558b4d7c710bd779d1dd1e534` passed CI #939 including status verification, typecheck, full tests, plugin/CLI builds, release/package/community verification and local Figma import preparation; P12 Final Release Artifact #250 passed; P12 Offline Acceptance #294 passed on Ubuntu/macOS/Windows.
- Exact synchronized PR head `6446c49a6cf5da5d039600f96a0ac3bd03e2b904` passed CI #945, Integration Readiness #299, P12 Final Release Artifact #256 and P12 Offline Acceptance #300 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #227 guarded squash-merged as `e5e22a4c556856a7c2ab11dbb94025ee838e0bb4`; issue #226 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.
- No production safe recipe, real Figma adapter/UI/mutation command, target-compatibility claim or production acceptance was introduced.

## 2026-09-12 — P14 nested plan/confirmation semantic snapshot hardening

- Opened authoritative issue #223 and focused PR #224 (`fix/p14-semantic-snapshot-223`) after a fresh post-#216 P14 trust-boundary audit.
- Confirmed a readable-but-stateful TOCTOU gap: first bounds traversal, plan integrity, confirmation validation and later transaction semantics could read the same caller-owned nested plan/confirmation objects at different times, so bounded readable proxy/getter evidence could change after preflight without throwing.
- Added `src/core/p14-semantic-input-snapshot.ts` to capture only the known P14 plan/confirmation contract into plain evidence through guarded, bounded property/index reads after the first resource preflight. It does not enumerate arbitrary properties or perform a generic recursive deep clone.
- Re-runs the existing P14 bounds contract on the plain semantic snapshot before delegation. Evidence that becomes oversized after first preflight preserves the established `P14_INPUT_TOO_LARGE` / `bounds` path; collection capture remains bounded by the existing action/blocker/target/dependency/mutation/bucket limits and total-target budget.
- Core semantics now receive the plain nested plan/confirmation snapshot, so readable stateful caller getters/proxies are not re-entered after the semantic boundary. Unreadable capture continues to use bounded `P14_INTERNAL_INVARIANT_FAILED` / `bounds-evidence` evidence before coordination/adapter access.
- Added `tests/p14-semantic-input-snapshot.test.ts` covering stateful nested action getter re-entry, stateful confirmation getter re-entry, evidence that grows oversized after the first bounds pass, and normal preparation regression.
- Initial head `64168dea7b5c6aea126cc89404221da79973b5bd` passed typecheck and the new focused tests, but Final Release #237 surfaced one existing #216 receipt-correlation regression in `tests/p14-bounds-evidence-boundary.test.ts`: semantic capture failure retained readable source metadata instead of the established `UNKNOWN` / `p14-plan-invalid` second-pass fallback.
- Corrected implementation head `8ec0c14c6301d16b8b9564a5b0d01423147629b5` restored the #216 correlation contract and passed CI #927 including full tests/builds/contracts, P12 Final Release Artifact #238 and P12 Offline Acceptance #282 on Ubuntu/macOS/Windows.
- Exact synchronized PR head `483e4b3f655ee8c99e844fbc9395313db22812f1` passed CI #932, Integration Readiness #289, P12 Final Release Artifact #243 and P12 Offline Acceptance #287 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #224 guarded squash-merged as `a84104b459d38b90368e0ef21ec1ac32788cd438`; issue #223 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.
- No production safe recipe, real Figma adapter/UI/mutation command, target-compatibility claim or production acceptance was introduced.

## 2026-09-12 — P14 unreadable nested bounded-input evidence hardening

- Opened authoritative issue #216 and focused PR #221 (`fix/p14-bounds-evidence-216`) for unreadable nested plan/confirmation evidence encountered by the P14 bounded-input preflight.
- Confirmed that top-level run-input snapshotting did not protect nested bounds traversal: throwing getters/proxies inside confirmation, plan source/actions or nested action collections could still reject the public transaction promise during the public preflight or the internal core's second bounds pass.
- Guarded the public `assessP14PreparationInputBounds(...)` traversal and added the existing `P14_INTERNAL_INVARIANT_FAILED` structured refusal at stage `bounds-evidence` with bounded runtime diagnostics.
- Guarded the internal retained-duplicate core bounds traversal independently so evidence that becomes unreadable only on the second pass also fails closed; that internal refusal uses `UNKNOWN` source/run correlation and `p14-plan-invalid` instead of dereferencing hostile plan metadata again.
- Preserved ordinary readable oversized evidence on the existing `P14_INPUT_TOO_LARGE` / `bounds` path and preserved normal readable `PREPARED` behavior. No deep canonical snapshot of readable nested semantics, new status/error code, production recipe authority, real Figma mutation surface, target compatibility or production acceptance was introduced.
- Added `tests/p14-bounds-evidence-boundary.test.ts` covering first-pass hostile confirmation evidence, second-pass plan evidence that becomes unreadable, readable oversized-input regression and normal preparation regression. The core full-file replacement was diff-audited and contained only the intended bounds helper/preflight changes.
- Initial code/test head `7ef0a2b43262024ee1f1df59e658143e4dac2681` passed CI #913 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #224 passed; P12 Offline Acceptance #268 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #216. No real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Exact synchronized PR head `33e9a956b1c63aec9623e9c3187449a8569f6236` passed CI #921, Integration Readiness #280, P12 Final Release Artifact #232 and P12 Offline Acceptance #276 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #221 guarded squash-merged as `e028c76d520564fde6177269e75c6efa423b0a5b`; issue #216 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.
- Accidental duplicate/placeholder issues #217, #218, #219 and #220 were created during tool routing, immediately closed `not_planned`, and carry no implementation scope. #216 was authoritative.

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
- Final synchronized PR head `c3b577bcf09e3f97060cfcba7b76d202e9119019` passed CI #882, Integration Readiness #247, P12 Final Release Artifact #193 and P12 Offline Acceptance #237 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main (`behind_by=0`) and was reported `mergeable=true` by GitHub.
- PR #208 guarded squash-merged as `df1e8f33394f13a371c2ff0b97bb6eceb321fd91`; issue #207 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.

## 2026-09-12 — P14 coordinator runtime-evidence and lease-cleanup hardening

- Opened issue #201 and focused PR #205 (`fix/p14-coordinator-runtime-evidence-201`) for the remaining injected source-transaction coordinator trust-boundary gap.
- Added runtime validation for coordinator acquisition evidence: acquisition flag, refusal reason, optional owner identities and acquired lease identities are treated as unknown evidence and bounded before transaction semantics use them.
- Acquired lease evidence must match the exact normalized requested source scope and transaction ID; unreadable/proxy-backed or malformed evidence fails closed before adapter access.
- If malformed evidence still claims `acquired: true`, the transaction makes one bounded best-effort release attempt using the exact expected source/transaction lease identity.
- Coordinator release now succeeds only on literal `true`; `false`, non-boolean runtime evidence or throw is converted to bounded `CLEANUP_REQUIRED` evidence at stage `coordination-release` instead of escaping or being silently ignored.
- Receipt integrity now permits coordinator-release cleanup with truthful retained-candidate/retention evidence when finalization already succeeded, or without candidate evidence when the release problem occurs before a candidate exists.
- Added `tests/p14-coordinator-runtime-evidence.test.ts` covering throwing/unreadable/malformed acquisition, oversized owner identity, claimed-acquired recovery, release false/throw, pre-clone release cleanup, default coordinator success and NO_CHANGES_NEEDED no-lease behavior.
- Initial code/test head `511bf68adbe1859695d7dbe2dea12e974afa024f` passed CI #867 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #178 passed; P12 Offline Acceptance #222 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #201. No distributed lock, real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Accidental empty issues #202, #203 and #204 were immediately closed as `not_planned`; they carry no implementation scope and #201 remains authoritative.
- Final synchronized PR head `1f76443e652f5d7c2c3dd9498b33463c1c2e7e03` passed CI #872, Integration Readiness #239, P12 Final Release Artifact #183 and P12 Offline Acceptance #227 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main and was reported mergeable by GitHub.
- PR #205 guarded squash-merged as `e80bf4c21b64d6b72714965f4e954759e1c4159d`; issue #201 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.

## 2026-09-12 — P14 safe-recipe registry resource bounding

- Opened issue #198 and focused PR #199 (`fix/p14-registry-bounds-198`) for the remaining safe-recipe registry resource-bound gap before semantic authorization.
- Added `src/core/p14-registry-bounds.ts` with a resource-only `assessP14SafeRecipeRegistryBounds(...)` gate that reuses the existing P14 action/dependency/conflict/mutation/identity limits.
- Safe-recipe registry `bindings`, recipe `sourceRuleIds`, `prerequisites`, `conflictsWith` and `mutationAllowlist` are now count-bounded before semantic item traversal; binding/recipe/profile/order and nested rule/dependency/conflict identities are bounded before authorization validation.
- `validateP14SafeRecipeRegistry(...)` applies the resource gate first, so direct validation, P13→P14 resolution and runtime plan authorization inherit the same resource contract.
- Oversized registry evidence preserves the existing execution result `BLOCKED` + `P14_RECIPE_UNAUTHORIZED`; no new transaction status/error code or mutation authority was introduced.
- Added `tests/p14-registry-bounds.test.ts` covering exact boundaries, oversized identities, top-level/nested proxy arrays that permit only `.length`, bounded malformed registries, empty production registry preservation, and zero coordinator/adapter access on transaction rejection.
- Initial code/test head `4ebf8328159f6d0d94ba8b606987cb8c0599a66a` passed CI #858, P12 Final Release Artifact #169 and P12 Offline Acceptance #213 on Ubuntu/macOS/Windows.
- Final synchronized PR head `e782a08090a4e158f99da22bf25d8fff60c8c529` passed CI #863, Integration Readiness #231, P12 Final Release Artifact #174 and P12 Offline Acceptance #218 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main and was reported mergeable by GitHub.
- PR #199 squash-merged as `80cefcb8b90a85b5e5a8b5ad4e6a0f65ddf6d12b`; issue #198 closed completed. P14 remains runtime-unwired and production recipe authority remains empty.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS without enabling real Figma mutation, registering a production recipe, or creating target-compatibility/production-acceptance authority.

## 2026-09-12 — P14 runtime clock and event-timestamp evidence hardening

- Opened issue #195 and focused PR #196 (`fix/p14-runtime-clock-evidence-195`) for the remaining untrusted runtime-clock/event-timestamp evidence gap.
- Added `src/core/p14-timestamp-evidence.ts` with a shared strict normalized UTC millisecond timestamp validator, explicit `UNKNOWN` event-time sentinel and fail-safe runtime clock reader.
- P14 preparation confirmation build/validation now reuses the shared normalized UTC validator; confirmation timestamps remain strict reviewed-intent evidence and do not accept `UNKNOWN`.
- Receipt event integrity now accepts only normalized UTC event time or explicit `UNKNOWN`, and rejects oversized/non-canonical/impossible timestamp evidence before `Date.parse(...)`.
- Transaction event construction now treats `now()` as untrusted metadata evidence: throw, non-string, oversized and non-canonical values cannot escape the transaction and are represented as unavailable time rather than fabricated wall-clock evidence.
- Added `tests/p14-timestamp-evidence.test.ts` covering pre-parse length rejection, strict timestamp shapes, hostile clock callbacks, confirmation compatibility, valid-clock preservation and forged receipt timestamps.
- Initial PR head `38ec9c36e44aa1e2431802bc74d8c9bab6a1adbe` passed P12 Offline Acceptance #203 but exposed a test-only TypeScript inference failure in CI #848 / P12 Final Release Artifact #159. The heterogeneous test callbacks were explicitly typed in follow-up commit `4d2b56497d90c58c71293ec9f473260fb9c8cef8`; no production clock logic change was required for that failure.
- Updated `docs/P14_FOUNDATION_IMPLEMENTATION.md`, README, PROJECT_STATE and NEXT_ACTIONS with the timestamp evidence contract. No real Figma mutation command, production recipe authority, target-compatibility claim or acceptance authority was introduced.
- Final synchronized PR head `47cb0b4d2d3c53f7f818af760131cc78737cb5c4` passed CI #854, Integration Readiness #224, P12 Final Release Artifact #165 and P12 Offline Acceptance #209 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main and was reported mergeable by GitHub.
- PR #196 squash-merged as `8021874323f5bad6ebf648b0891bc9f6358dd1bf`; issue #195 closed completed. P14 remains runtime-unwired and production recipe authority remains empty.

## 2026-09-12 — P14 receipt envelope and runtime-diagnostic hardening

- Opened issue #192 and focused PR #193 (`fix/p14-receipt-envelope-bounds-192`) for the remaining P14 receipt-envelope/resource-safety gap.
- Added `src/core/p14-receipt-evidence.ts` with shared receipt collection, identity/detail bounding and hostile runtime-error rendering helpers based on the existing P14 safety limits.
- Receipt integrity now count-bounds `appliedActions`, `errors` and `events` from `.length` before item traversal, preventing forged oversized collections from triggering unbounded iteration or status-specific scans.
- Receipt `transactionId`, `p13RunId`, `planDigest`, source node identity and error stage now use the existing P14 identity bound; error detail/recovery and event detail use the existing detail bound.
- Transaction `receiptError(...)` and event construction now emit bounded diagnostics by construction. Adapter and discard exception text is bounded before entering receipt state; hostile exception stringification falls back deterministically instead of escaping the transaction.
- Added `tests/p14-receipt-envelope-bounds.test.ts` covering exact limits, forged oversized top-level evidence, proxy-backed no-traversal collection checks, long adapter/discard exceptions and exception objects whose `toString()` throws.
- Updated `docs/P14_FOUNDATION_IMPLEMENTATION.md` with the bounded receipt-envelope/runtime-diagnostic contract and new safety invariants. No real Figma mutation command, production recipe authority, target-compatibility claim or acceptance authority was introduced.
- Pre-memory-sync PR head `7a031c2f8e2b405e084ae2fbdd677205d9e9c7e7` passed CI #840 including typecheck/full tests/builds/contracts, P12 Final Release Artifact #151, and P12 Offline Acceptance #195 on Ubuntu/macOS/Windows.
- Final synchronized PR head `5b9a02ce3b15ab49a1f281b51494e51bc5eb0e57` passed CI #844, Integration Readiness #217, P12 Final Release Artifact #155 and P12 Offline Acceptance #199 on Ubuntu/macOS/Windows; it had zero unresolved review threads/comments, remained current with main and was reported mergeable by GitHub.
- PR #193 squash-merged as `e54cb44c3dabe6cd2a459f70df917b9422fadddd`; issue #192 closed completed. P14 remains runtime-unwired and production safe-recipe authority remains empty.

## 2026-09-11 — R0 commercial market refresh

- Ran a fresh public-market scan against current UiChemy, Anima, Locofy, Builder.io and first-party Figma product/documentation pages.
- Retained the dated evidence and source URLs in `docs/R0_MARKET_SNAPSHOT_2026-09-11.md`; competitor claims are explicitly market signals rather than target-schema/API authority.
- Confirmed that generic `Figma -> code` generation is heavily commoditized and now overlaps with Figma's own code/agent direction.
- Reinforced the product moat as `Audit -> Target Compatibility -> Target-Ready Duplicate -> declared/native mapping -> artifact/environment validation -> render/round-trip proof -> receipt`.
- Added P15 planning requirement for Elementor/WordPress environment diagnostics with `DECLARED ENVIRONMENT` vs `OBSERVED ENVIRONMENT`; local JSON/ZIP validity cannot imply an unobserved live import.
- Promoted the target capability matrix to a user-facing commercial surface with explicit `NATIVE`, `NATIVE + CSS`, `VISUAL ASSET FALLBACK`, `MANUAL REVIEW` and `UNSUPPORTED` strategies and no silent fallback.
- Reinforced one neutral semantic IR across WordPress/code targets so users are not forced to re-tag/re-prepare the same safe intent for every adapter.
- Retained section-transfer speed as a product requirement while keeping documented artifacts / the versioned WP Builders Bridge ahead of undocumented private clipboard dependencies.
- Added durable decisions D-038 through D-042: verified readiness states are user-facing; Elementor environment truth stays evidence-scoped; shared IR should avoid unnecessary re-tagging; failed/refused generation is non-billable if credits are introduced; exact pricing remains evidence-driven rather than copied from competitors.
- Retained API/MCP/agent access as a later Pro/Agency differentiator after deterministic target contracts are accepted.
- No P13-P26 runtime implementation or acceptance credit was granted. #84 remains the internal P12 gate before implementation starts.

## 2026-09-11 — P12 publisher evidence intake hardening

- Corrected issue #84 body so release #20 / plugin ID `1680034649341961379` is the authoritative publishing candidate and old release #17 is retained only as historical runtime evidence.
- Opened issue #126 to make the final package/publisher/2FA evidence collection deterministic and fail-closed.
- Added `config/p12-publisher-candidate.json` with the exact release #20 source, plugin ID, artifact identity, exact publish ZIP SHA-256, extracted plugin file hashes, manifest contract and required evidence/attestations.
- Added `scripts/p12-publisher-evidence-intake.mjs` and `npm run p12:publisher-evidence`.
- Evidence intake verifies the exact publish ZIP SHA-256 and extracted `code.js`, `manifest.json`, `ui.html` hashes before accepting screenshot evidence.
- Intake rejects missing/empty/oversized/symlinked evidence, wrong or extra package files, manifest contract drift and missing operator confirmations.
- Runtime, Publish/Add-final-details and 2FA screenshots are hashed but never OCRed or machine-interpreted; live facts remain explicit operator attestations.
- Receipt semantics explicitly keep `acceptanceAuthority: false`, `screenshotsAreHashedNotInterpreted: true` and `finalInternalAcceptanceRequiresSeparateReview: true`.
- Added regression tests for the success path, extracted-file tamper, exact ZIP tamper, missing 2FA attestation and manifest semantic mismatch.
- Added `docs/P12_PUBLISHER_EVIDENCE_INTAKE.md` with the exact operator command and fail-closed behavior.
- PR #129 head `6a60ae540fa6fdacca8a30d73edd1ae3c61714e6` passed CI #730, P12 Offline Acceptance #85 and P12 Final Release Artifact #41, had no review/thread blockers, and squash-merged as `cc466367fa0c6fee119d4fb183371af5fb3f04c7`; issue #126 closed completed.
- P12 remains `80%`. The next genuine action is live release #20 runtime/publish/2FA screenshots -> deterministic intake receipt -> final internal exit review. P13 remains blocked.

## 2026-09-11 — Reliability/compatibility audit for P13-P26

- Completed the remaining post-plan housekeeping by merging PR #123 as `d34c026202ae6ecd8f88f71e6056d619578ce56f` after CI #723, Integration Readiness #158, P12 Offline Acceptance #78 and P12 Final Release Artifact #34 passed.
- Re-audited the post-P12 commercial plan against current official Figma, Elementor and WordPress/Gutenberg documentation.
- Added `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md` as a new recurring **R1** gate after R0 market/platform research and before major adapter implementation.
- Added the requirement that every adapter use an immutable versioned TargetProfile plus a machine-readable capability descriptor so the UI cannot submit stale/invalid target-option combinations.
- Added strict separation between SOURCE READY, ARTIFACT VALIDATED, IMPORT VERIFIED, RENDER VERIFIED and ROUND-TRIP VERIFIED so local package validation cannot be misrepresented as a real live-site guarantee.
- Hardened Elementor planning around separate v3 Container and v4 Atomic adapter families, explicit Core/Pro overlays, template-vs-ZIP-vs-kit separation, global-reference closure and real target import acceptance.
- Hardened Gutenberg planning around target-version contracts, parse/serialize stability and real editor-open validity checks.
- Added atomic target-package generation: temporary candidate -> validate -> finalize/checksum -> Download/Copy. Failed/cancelled partial artifacts are discarded.
- Added no-silent-fallback policy: native+CSS, visual asset, manual placeholder or unsupported fallbacks must be visible and recorded rather than substituted silently.
- Added a canonical target-export state machine, source staleness fingerprints, deterministic run/receipt identity, cooperative cancel/retry and bounded sequential job orchestration.
- Added structured target error codes and explicit FAILED_RECOVERABLE vs FAILED_BLOCKED outcomes instead of generic-only errors.
- Added generated-framework build matrices with pinned dependency versions; accepted artifacts may not use unbounded `latest` versions.
- Added code-import archive defenses for path traversal, zip bombs, excessive files/nesting and arbitrary JavaScript execution.
- Corrected asset semantics using official Figma APIs: image-fill stored bytes may be exported as `Stored Original`, while crop/mask/effects/layout appearance is a distinct rendered export. Stored bytes are not claimed as upstream-upload provenance.
- Retained raw-font policy: font identity/usage manifest from Figma; raw binaries only when separately user-supplied and license-permitted.
- Kept the Community core offline under `allowedDomains: ["none"]`; the preferred WP Builders Bridge is file/paste import first. Arbitrary direct customer-domain push remains a separately accepted future networked module.
- Added durable decisions D-031 through D-037 and synchronized AGENTS, README, PROJECT_STATE, NEXT_ACTIONS, ROADMAP, AI_NATIVE_PLAN and FEATURE_PLAN.
- First PR #124 attempt exposed a real status-contract failure because R0/R1 used `N/A` while only DEFERRED modules may use `N/A`; corrected the README to mark the gate definitions `100% / DEFINED-RECURRING` while preserving the requirement to execute each gate per adapter.
- PR #124 final head `10b025f62679191ec43dd5afd50e6e69e8e3fcc4` passed CI #726, Integration Readiness #161, P12 Offline Acceptance #81 and P12 Final Release Artifact #37 with no review/thread blockers.
- PR #124 squash-merged the R1 reliability/compatibility plan as `4d38c46c359bd030bf36100f4424760b1380db81`.
- No P13-P26 runtime implementation or acceptance percentage was granted; #84 remains the internal gate before P13 starts.

## 2026-09-11 — Market-researched multi-target commercial alignment

- Expanded the post-P12 roadmap from P13-P21 to P13-P26 around the user-requested sales/client-growth direction.
- Added recurring R0 AI-assisted market/platform research before major evolving target adapters; official platform documentation is preferred for technical format/API claims and competitor claims remain market signals only.
- Added target-ready duplicate preparation so incompatible source designs can be safely prepared for a selected target without destructively rewriting the approved original.
- Added planned native Elementor / Elementor Pro export with compatibility, alignment, widget, responsive, asset and package validation before JSON/ZIP/kit download where the documented target contract supports it.
- Added planned Gutenberg native block/pattern export and selected-section transfer.
- Added HTML/CSS/JS export and static-first code-to-design reconstruction; untrusted JavaScript execution remains disabled by default pending a separately accepted sandbox/companion specification.
- Added a neutral framework adapter platform for React, Next.js, Vue, Nuxt, Svelte/SvelteKit, Angular, Astro and later adapters. NestJS is explicitly treated as optional backend/API scaffolding paired with a front-end adapter rather than a visual renderer.
- Added asset pack planning for raster images, SVG/icons, source-oriented vs rendered/display-size/custom-scale image choices, font family/style/usage manifests and user-supplied licensed raw-font packaging only where technically/legal available.
- Added round-trip target rendering/visual diff, target capability matrix, existing-component bindings, change-only regeneration, optional `WP Builders Bridge`, CMS/dynamic mappings and stronger agency/project workflows.
- Added durable decisions D-023 through D-030 for research, target-ready duplication, versioned adapter validation, documented WordPress transfer, code-import sandboxing, honest asset/font export, framework adapter isolation and round-trip QA.
- Updated issue #119 as the P13-P26 owner. No runtime/plugin feature or acceptance percentage was granted; P13 implementation remains blocked until #84 internal P12 exit genuinely closes.
- Retained the previous detailed history byte-for-byte in `memory-bank/CHANGELOG_ARCHIVE_PRE_MULTI_TARGET.md`.
- PR #122 head `40831f61a07036d233dbf7cad8a5396c0010641f` passed CI #721, Integration Readiness #156, P12 Offline Acceptance #76 and P12 Final Release Artifact #32 with no review/thread blockers.
- PR #122 squash-merged the researched multi-target planning baseline as `ade501fedb8c810b4964eb3dda414c58450e8565`.
- Planning changes do not replace the retained P12 publishing candidate or grant P13-P26 implementation/runtime acceptance.

## Historical archive

Detailed history before this roadmap alignment is retained byte-for-byte in:

`memory-bank/CHANGELOG_ARCHIVE_PRE_MULTI_TARGET.md`