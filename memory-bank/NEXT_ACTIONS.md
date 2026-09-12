# Next Actions

Last updated: 2026-09-13

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

Current screenshot triage is explicitly **non-accepting** and retained in #84 comment `5633658106`:

- the available final-details screenshot still shows the historical `Invalid ID in manifest.json` state;
- two available Publish screenshots are Data Security steps, not final-details/identity/2FA proof;
- the available plugin screenshot is historical P6 closure evidence, not the minimal release #20 package rebind;
- no currently retained screenshot proves 2FA enabled.

Deferred P27 release evidence/action:

1. use the exact pinned release #20 publish ZIP and extracted three-file directory;
2. re-import/update that exact package in Figma Desktop and confirm it opens/runs on the known acceptance design/frame;
3. retain a **fresh** Publish → Add final details screen where the generated publishing ID is accepted and the intended Publish-as identity, Community target, support contact and `No network access` are visible;
4. retain a **fresh** Figma account/security screen showing required 2FA enabled;
5. run `npm run p12:publisher-evidence -- ...` with all explicit confirmations set to `yes` only for facts actually observed;
6. retain the generated receipt; it must say `acceptanceAuthority: false` and `evidenceBundleComplete: true`;
7. perform final internal release-exit review from the receipt + original screenshots.

The evidence intake tool verifies exact bytes and hashes screenshots; it deliberately does not OCR screenshots, infer account state, submit the plugin or self-promote P12.

Community submission/review/approval remains external.

### #119 — Multi-target commercial expansion roadmap

Classification: **P13-P27 active roadmap; implementation/testing through P26 is authorized independently of final production release**.

P13 implementation is complete, P14 pure-core implementation is active, P15-P26 remain preflight-frozen/not-started, and P27 #182 is the deferred final production-release gate.

Canonical future order:

- R0 — recurring AI-assisted market/platform research gate;
- R1 — recurring adapter reliability/compatibility gate;
- P13 — Build-Ready Score 2.0 + Responsive Risk;
- P14 — Target-Ready Duplicate + Guided Prepare;
- P15 — Elementor native export + import validation;
- P16 — Gutenberg native export + section transfer;
- P17 — HTML/CSS/JS export + static-first code-to-design import;
- P18 — framework adapter platform;
- P19 — asset pack + font manifest + design-system export;
- P20 — round-trip visual QA + exact section portability / optional WP Builders Bridge;
- P21 — developer handoff + client/QA + bounded a11y/SEO advisories;
- P22 — deterministic complexity/effort estimator;
- P23 — agency/project + existing-component bindings + change-only regeneration;
- P24 — CMS/dynamic data/forms/interactions;
- P25 — Free/Pro/Agency packaging + entitlements;
- P26 — optional AI assistance;
- P27 — final production release + retained live runtime/publisher/2FA evidence and #84 release-exit decision.

### #241 — post-#240 P14 repository status synchronization

Classification: **ACTIVE / branch prepared**.

Branch `docs/p14-post-240-status-241` synchronizes canonical repository truth after the verified #237/#238 and #239/#240 cycles without expanding runtime scope:

1. record #237 / PR #238 as completed at guarded merge `2966bae643cd7d9ac972bc60da1688b8fed575e2`, exact head `48804348e6244b043c7c76ceca5181d15704592f`, CI #974, Integration Readiness #319, P12 Final Release Artifact #284 and P12 Offline Acceptance #328;
2. record #239 / PR #240 as completed at guarded merge `9e86dd4e10dd282758bcdbb177841a0117b179ae`, exact head `9a01555ab95b595151c47d401a0ba3e771c240d9`, CI #976, P12 Final Release Artifact #287 and P12 Offline Acceptance #331;
3. explicitly preserve the truth that Integration Readiness did not run on code-only PR #240 because its pull-request trigger is path-filtered;
4. record the receipt-integrity one-shot top-level/nested semantic snapshot boundary, detached bounded receipt collections and accepted validation/re-score reuse;
5. synchronize README, `docs/P14_FOUNDATION_IMPLEMENTATION.md`, `memory-bank/PROJECT_STATE.md` and this queue only;
6. keep production safe-recipe authority empty and real Figma mutation/runtime wiring absent;
7. after this sync closes, run a fresh focused P14 pure-core safety-gap audit rather than exposing real Figma mutation.

The synchronization branch must remain current with main, review-clean and gate-clean before guarded merge.

### #239 — P14 receipt-integrity semantic snapshot

Classification: **COMPLETED / merged through PR #240**.

PR #240 (`fix/p14-receipt-semantic-snapshot-239`) closes a distinct integrity-validation boundary without changing recipe or target authority:

1. known receipt-integrity top-level fields are captured through guarded one-shot reads before semantic validation;
2. `appliedActions`, `errors` and `events` are bounded and copied through safe array inspection, a one-shot length read and guarded index reads rather than retaining the original source array/proxy;
3. source, candidate, error and event fields that receipt integrity reuses are detached into plain known-schema records;
4. accepted validation and re-score evidence is reused by PREPARED/PREPARED_WITH_REVIEW invariants instead of re-reading original nested stateful objects;
5. revoked/unreadable top-level, collection and nested receipt evidence fails closed rather than throwing through the integrity API;
6. ordinary valid receipt semantics and existing oversized-envelope behavior remain intact;
7. no production recipe, real Figma mutation, target compatibility or production acceptance authority is introduced.

Exact head `9a01555ab95b595151c47d401a0ba3e771c240d9` passed CI #976, P12 Final Release Artifact #287 and P12 Offline Acceptance #331. The PR had zero review threads, was current with main and mergeable, then guarded squash-merged as `9e86dd4e10dd282758bcdbb177841a0117b179ae`; issue #239 closed completed. Integration Readiness was correctly absent from the code-only PR and is delegated to #241 status synchronization.

### #237 — post-#236 P14 repository status synchronization

Classification: **COMPLETED / merged through PR #238**.

PR #238 (`docs/p14-post-236-status-237`) synchronized canonical repository truth after #234/#236, exercised the path-filtered Integration Readiness gate, and advanced the immediate P14 action to the next focused pure-core safety-gap audit. Exact head `48804348e6244b043c7c76ceca5181d15704592f` passed CI #974, Integration Readiness #319, P12 Final Release Artifact #284 and P12 Offline Acceptance #328, then guarded squash-merged as `2966bae643cd7d9ac972bc60da1688b8fed575e2`; issue #237 closed completed.

### #235 — P14 coordinator acquisition/refusal semantic snapshot

Classification: **COMPLETED / merged through PR #236**.

PR #236 (`fix/p14-coordinator-evidence-snapshot-235`) closed the readable-but-stateful coordinator-result boundary without changing coordination authority:

1. the top-level `acquired` flag is read once before branching;
2. acquired lease evidence and its source-scope / transaction-ID fields are read once before bounded exact binding;
3. refusal reason and optional owner identities are read once before validation and accepted-value construction;
4. accepted coordinator results are rebuilt as plain detached data;
5. throwing/revoked nested evidence fails closed, while evidence that first claims acquisition preserves the existing best-effort exact-lease cleanup contract;
6. no distributed-lock, host/authentication, production recipe, real Figma mutation, target-compatibility or production-acceptance claim is introduced.

Exact head `497b1385b55ca8343d82be04da02de0595228efd` passed CI #972, P12 Final Release Artifact #283 and P12 Offline Acceptance #327. The PR had zero review threads, was current with main and mergeable, then guarded squash-merged as `804ffc6a143c2cf6ab4ca100d7b021289a060be2`; issue #235 closed completed. Integration Readiness was correctly absent from the code-only PR and is delegated to #237 status synchronization.

### #233 — post-#232 P14 repository status synchronization

Classification: **COMPLETED / merged through PR #234**.

PR #234 (`docs/p14-post-232-status-233`) synchronized canonical repository truth after #230/#232, explicitly recorded the code-only Integration Readiness path-filter behavior, and advanced the immediate P14 action to the next focused pure-core safety-gap audit. Exact head `7bbfa45eaa5047c7b3a0230d43f4bfda5ce51998` passed CI #970, Integration Readiness #316, P12 Final Release Artifact #281 and P12 Offline Acceptance #325, then guarded squash-merged as `27144161082ce3cff9c9a0ca1e0364cd19b727ad`; issue #233 closed completed.

### #231 — P14 adapter-output semantic snapshot

Classification: **COMPLETED / merged through PR #232**.

PR #232 (`fix/p14-adapter-output-snapshot-231`) closed the readable-but-stateful adapter-output boundary without changing recipe or target authority:

1. known candidate-handle, recipe-execution, runtime-eligibility, validation, re-score and retention output fields are captured through guarded one-shot reads before semantic validation or accepted-copy construction;
2. prerequisite/profile/check arrays are copied through bounded guarded length/index reads into plain arrays before later coverage/policy/receipt semantics;
3. nested validation checks are captured into plain known-schema values so accepted evidence retains no adapter-owned check object references;
4. readable stateful getters/proxies cannot present one value during validation and another during exact binding or final accepted-copy construction;
5. throwing property/length/index access and revoked proxies fail closed as invalid evidence rather than escaping the transaction;
6. existing failure stages/error codes and bounded count diagnostics remain authoritative;
7. the boundary is shallow/schema-driven, not a generic recursive deep clone, and adds no production recipe, real Figma mutation surface, target compatibility or production acceptance authority.

An early implementation head exposed only a test-fixture TypeScript literal-narrowing error in CI #960 / Final Release #271; Offline Acceptance #315 had already passed. The test fixture was widened without runtime-scope expansion and the proxy helper was made explicitly type-safe. Exact final head `b06240a02cc8fc14c0c94e23ba9e554a62eae319` then passed CI #965, P12 Final Release Artifact #276 and P12 Offline Acceptance #320 on Ubuntu/macOS/Windows. The PR had zero review threads/reviews/comments, was current with main (`behind_by=0`) and mergeable, then guarded squash-merged as `2bbc24fb8afa3ccb9cc202fd816dfc8d69888941`. Integration Readiness was correctly absent from the code-only PR because its PR trigger is path-filtered. Issue #231 closed completed.

### #229 — P14 adapter callback input isolation

Classification: **COMPLETED / merged through PR #230**.

The post-#226 audit confirmed a distinct adapter-input mutation boundary: caller-owned plan/confirmation/registry evidence was already snapshotted, but the accepted mutable candidate/action/plan objects were then passed by reference into runtime adapter callbacks and reused by later core semantics.

PR #230 (`fix/p14-adapter-input-isolation-229`) narrowed that boundary without changing recipe or target authority:

1. known P14 candidate/action/plan values are copied into fresh plain adapter-facing objects;
2. action and plan collections are copied only from the already-accepted bounded P14 contract — this is not an arbitrary recursive deep clone;
3. `assessActionEligibility`, `applyRecipe`, `validateCandidate`, `rescoreCandidate`, `retainCandidate` and `discardCandidate` receive detached copies rather than the core's internal accepted objects;
4. mutation performed by one callback is therefore not visible to later callbacks or receipt/source/candidate correlation semantics;
5. scalar source/transaction/prepared-name arguments and all existing adapter-output validation remain unchanged;
6. the boundary does not sandbox or validate an adapter's actual candidate-side mutation behavior;
7. the production safe-recipe registry remains empty and no real Figma adapter/UI/mutation command, target compatibility or production acceptance is introduced.

Initial implementation/test head `651d4c5f9d8d3e7776eb23b9eafeecb1727498d0` passed CI #952, P12 Final Release Artifact #263 and P12 Offline Acceptance #307 on Ubuntu/macOS/Windows. Exact synchronized head `7466a230344c8a85a10c4a68fb05216ac7d5d4cf` then passed CI #958, Integration Readiness #310, P12 Final Release Artifact #269 and P12 Offline Acceptance #313 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and `mergeable=true`, then guarded squash-merged as `bad83a48ab58dfa8b956e7b6bf02c74a079a4665`. Issue #229 closed completed.

### #226 — P14 safe-recipe registry semantic snapshot

Classification: **COMPLETED / merged through PR #227**.

PR #227 (`fix/p14-registry-semantic-snapshot-226`) closed the readable-but-stateful registry authorization boundary without changing recipe or target authority:

1. the existing registry resource bounds run first against caller evidence;
2. after an allowed first pass, only the known safe-recipe registry schema is copied through guarded, bounded property/index reads into plain semantic evidence;
3. the existing registry bounds contract is re-run on the plain snapshot before semantic validation;
4. validation, exact recipe resolution and plan authorization consume stable plain registry evidence instead of re-reading caller-owned bindings/recipe getters;
5. readable registry evidence that grows oversized after the first pass remains invalid and follows the existing unauthorized transaction path;
6. unreadable capture fails closed before confirmation, source coordination or adapter access;
7. the production safe-recipe registry remains empty and no real Figma adapter/UI/mutation command, target compatibility or production acceptance is introduced.

Initial implementation/test head `4bd44da760d0dc0558b4d7c710bd779d1dd1e534` passed CI #939, P12 Final Release Artifact #250 and P12 Offline Acceptance #294 on Ubuntu/macOS/Windows. Exact synchronized head `6446c49a6cf5da5d039600f96a0ac3bd03e2b904` then passed CI #945, Integration Readiness #299, P12 Final Release Artifact #256 and P12 Offline Acceptance #300 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and `mergeable=true`, then guarded squash-merged as `e5e22a4c556856a7c2ab11dbb94025ee838e0bb4`. Issue #226 closed completed.

### #223 — P14 nested plan/confirmation semantic snapshot

Classification: **COMPLETED / merged through PR #224**.

PR #224 (`fix/p14-semantic-snapshot-223`) closed the readable-but-stateful nested semantic-evidence boundary without changing mutation or target authority:

1. after the first bounded resource preflight, the known P14 plan and optional confirmation schema are copied through guarded, bounded property/index reads into plain semantic snapshots;
2. only known P14 semantic fields are copied — this is not an arbitrary generic deep clone;
3. the existing bounds contract is re-run on the plain snapshot before delegation, so readable evidence that grows oversized after the first pass still fails on the established `P14_INPUT_TOO_LARGE` / `bounds` path;
4. caller-owned nested getters/proxies are not delegated into retained-duplicate core semantics after the semantic boundary;
5. unreadable semantic capture stays on the existing `P14_INTERNAL_INVARIANT_FAILED` / `bounds-evidence` path before coordinator/adapter access;
6. the #216 second-pass unreadable-evidence correlation contract remains `UNKNOWN` / `p14-plan-invalid`;
7. production safe-recipe authority remains empty and no real Figma adapter/UI/mutation command, target compatibility or production acceptance is introduced.

Initial head `64168dea7b5c6aea126cc89404221da79973b5bd` exposed one existing #216 receipt-correlation regression in Final Release #237. Corrected implementation head `8ec0c14c6301d16b8b9564a5b0d01423147629b5` restored that fallback and passed CI #927, P12 Final Release Artifact #238 and P12 Offline Acceptance #282 on Ubuntu/macOS/Windows. Exact synchronized head `483e4b3f655ee8c99e844fbc9395313db22812f1` then passed CI #932, Integration Readiness #289, P12 Final Release Artifact #243 and P12 Offline Acceptance #287 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and `mergeable=true`, then guarded squash-merged as `a84104b459d38b90368e0ef21ec1ac32788cd438`. Issue #223 closed completed.

### #216 — P14 unreadable nested bounded-input evidence

Classification: **COMPLETED / merged through PR #221**.

PR #221 (`fix/p14-bounds-evidence-216`) closed the narrow unreadable nested bounds-traversal gap without changing mutation or target authority:

1. the public bounded-input preflight catches throwing nested plan/confirmation getters and returns bounded `BLOCKED` + `P14_INTERNAL_INVARIANT_FAILED` at stage `bounds-evidence`;
2. the internal retained-duplicate core guards its second bounded-input traversal too, so evidence that becomes unreadable only on the second pass cannot escape;
3. internal second-pass rejection uses `UNKNOWN` source/run correlation and `p14-plan-invalid` instead of dereferencing hostile plan metadata again;
4. failures occur before source coordination or adapter access;
5. readable oversized evidence preserves the established `P14_INPUT_TOO_LARGE` / `bounds` path;
6. readable normal preparation remains unchanged;
7. no deep canonical snapshot of readable nested semantics, new status/error code, production recipe, real Figma mutation surface, target compatibility or production acceptance is introduced.

Initial code/test head `7ef0a2b43262024ee1f1df59e658143e4dac2681` passed CI #913, P12 Final Release Artifact #224 and P12 Offline Acceptance #268 on Ubuntu/macOS/Windows. Exact synchronized head `33e9a956b1c63aec9623e9c3187449a8569f6236` then passed CI #921, Integration Readiness #280, P12 Final Release Artifact #232 and P12 Offline Acceptance #276 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and `mergeable=true`, then guarded squash-merged as `e028c76d520564fde6177269e75c6efa423b0a5b`. Issue #216 closed completed.

Accidental duplicate/placeholder issues #217, #218, #219 and #220 were created during the #216 tool-routing cycle, immediately marked **CLOSED / NOT PLANNED**, and carry no implementation scope. #216 was authoritative.

### #213 — P14 top-level run-input runtime evidence snapshot

Classification: **COMPLETED / merged through PR #214**.

PR #214 (`fix/p14-run-input-snapshot-213`) closed the narrow public caller-object property-access boundary without changing mutation or target authority:

1. `plan`, `registry`, `coordinator`, `inputBounds`, `confirmation`, `transactionId`, `preparedName`, `allowPreparedWithReview` and `shouldCancel` are read through guarded one-shot access before bounds/core semantics;
2. accepted values are copied into a plain snapshot and delegated explicitly; the wrapper no longer uses `...input`, so caller getters are not re-entered after validation;
3. non-object input or a throwing known top-level getter returns bounded `BLOCKED` + `P14_INTERNAL_INVARIANT_FAILED` evidence at stage `run-input` before coordinator or adapter access;
4. runtime `now` property/callback handling remains on the existing fail-soft `UNKNOWN` event-time contract rather than becoming transaction authority;
5. existing run-control normalization, raw-size `P14_INPUT_TOO_LARGE`, confirmation, registry authorization, coordinator, cancellation and adapter evidence semantics are preserved;
6. no new status/error code, production recipe, real Figma mutation surface, target compatibility or production acceptance is introduced.

Initial code/test head `3d558f9ac58bde1cfebd82b7e3a11d0a1d94c93e` passed CI #901, P12 Final Release Artifact #212 and P12 Offline Acceptance #256 on Ubuntu/macOS/Windows. Exact synchronized head `5058b82ad17eb166c1e9445aed6959a07bbe856c` then passed CI #907, Integration Readiness #268, P12 Final Release Artifact #218 and P12 Offline Acceptance #262 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and `mergeable=true`, then guarded squash-merged as `f8a983a1ed7d18963e23901996a60f64d55678cd`. Issue #213 closed completed.

### #210 — P14 runtime action-eligibility hook property boundary

Classification: **COMPLETED / merged through PR #211**.

PR #211 (`fix/p14-runtime-eligibility-hook-210`) closed the narrow unreadable optional-hook gap without changing mutation or target authority:

1. the public retained-duplicate adapter boundary exposes a guarded `assessActionEligibility` property;
2. readable missing/non-function values preserve the existing structured `P14_TRANSFORM_FAILED` / `transform-recheck` refusal after a prior recipe;
3. a throwing/proxy-backed getter becomes a deferred callable failure, so the core catches it only at the existing guarded runtime recheck point and attempts candidate discard;
4. if that discard also fails, existing `CLEANUP_REQUIRED` + `P14_DISCARD_FAILED` evidence is preserved;
5. a valid hook is invoked with the original adapter as `this`, preserving adapter state/private method expectations;
6. the later recipe is never applied when hook access cannot be trusted;
7. no new status/error code, production recipe, real Figma mutation surface, target compatibility or production acceptance is introduced.

The first implementation head `647a390028d0bee294448d96072a3515cf39f14a` exposed an exact-optional TypeScript facade mismatch in CI #886. Follow-up head `4a4cd0c818a4e5a334c80a2edfe175b6cbccb0c3` exposed implicit-any delegate typing in CI #887. Both failed before tests and were corrected without runtime-scope expansion. Corrected implementation head `a85e0d80a2421f126a74cafe7b581abbb5d897a1` passed CI #888, P12 Final Release Artifact #199 and P12 Offline Acceptance #243 on Ubuntu/macOS/Windows. Exact synchronized head `57b97950928390e8c07ce82e48f92ddff7fabd4f` then passed CI #895, Integration Readiness #257, P12 Final Release Artifact #206 and P12 Offline Acceptance #250 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and `mergeable=true`, then guarded squash-merged as `7f24e57a28941e80d290b9b7dfbdce5fd718e534`. Issue #210 closed completed.

### #207 — P14 caller run-control runtime evidence

Classification: **COMPLETED / merged through PR #208**.

PR #208 (`fix/p14-run-control-evidence-207`) closed the caller run-control trust boundary without changing mutation or target authority:

1. `assessP14RunControlEvidence(...)` validates runtime control types before confirmation, source coordination or adapter access;
2. `transactionId` must be a string with a non-whitespace identity and is normalized once before coordinator/adapter/receipt use;
3. supplied `preparedName` must be a string, is normalized once, and preserves the established empty/whitespace fallback to `Prepared Duplicate`;
4. supplied `allowPreparedWithReview` must be a literal boolean, so truthy non-boolean values cannot authorize review retention;
5. known `inputBounds` override fields are snapshotted through guarded property reads and present values must be positive integers;
6. unreadable proxy-backed bounds or malformed present overrides fail closed as `BLOCKED` + `P14_INTERNAL_INVARIANT_FAILED` at stage `run-control` before coordinator/adapter access;
7. valid typed but oversized raw identities preserve the established `P14_INPUT_TOO_LARGE` outcome;
8. the previous retained-duplicate engine is preserved as an internal core while the original public module path is the hardened boundary;
9. no production recipe, real Figma mutation surface, target compatibility or production acceptance is introduced.

Initial implementation head `9e4b0ca8c7abf69d2c7052bcf26f48526e0587dc` passed CI #876, P12 Final Release Artifact #187 and P12 Offline Acceptance #231 on Ubuntu/macOS/Windows. Exact synchronized head `c3b577bcf09e3f97060cfcba7b76d202e9119019` then passed CI #882, Integration Readiness #247, P12 Final Release Artifact #193 and P12 Offline Acceptance #237 on Ubuntu/macOS/Windows. The PR had zero unresolved review threads/reviews/comments, was current with main (`behind_by=0`) and `mergeable=true`, then guarded squash-merged as `df1e8f33394f13a371c2ff0b97bb6eceb321fd91`. Issue #207 closed completed.

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

1. complete #233 / draft PR #234 canonical post-#232 status synchronization on a fully verified exact head;
2. after #233 closes, run the next focused P14 pure-core safety-gap audit rather than exposing real mutation;
3. keep the approved source immutable and mutate only retained candidates;
4. keep production safe-recipe authority empty until explicit acceptance;
5. fail closed on malformed/stale adapter/control/receipt/registry/coordinator evidence while preserving truthful cleanup state;
6. validate/re-score before retention and reject newly introduced HIGH/BLOCKER findings;
7. continue focused safety-gap audits until core implementation is internally ready;
8. require #159 before real Figma mutation exposure;
9. require genuine real-Figma acceptance before any production mutation/readiness claim.

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