# P14 Retained-Duplicate Foundation

Status: IMPLEMENTATION FOUNDATION ONLY — RUNTIME UNWIRED  
Foundation issues: #163, #165, #169, #171, #173, #175, #177, #179, #181, #184, #186, #188, #190, #192, #195, #198, #201, #207  
Roadmap: #119  
Open acceptance/release dependencies: P13 real-Figma acceptance (#159), P12 release-exit review (#84), and final production-release gate P27 (#182)

## What this foundation implements

This foundation turns the frozen P14 specification into a target-neutral deterministic core without exposing a new Figma mutation command.

It includes explicit P13→P14 handoff, versioned safe-recipe authorization, bounded input preflight, bounded caller run-control evidence, bounded safe-recipe registry evidence, deterministic dependency-topological planning, explicit reviewed-plan confirmation, plan/receipt integrity validation, retained-duplicate transaction semantics, candidate-only recipe callbacks, sequential runtime action-eligibility re-evaluation, bounded adapter-output evidence, active-recipe validation-profile coverage, bounded validation-check evidence, mandatory validation/re-score, bounded re-score evidence validation, bounded runtime source-fingerprint evidence, bounded receipt-envelope/runtime-diagnostic evidence, bounded runtime event-clock/timestamp evidence, source-immutability proof, cooperative cancellation with bounded callback-failure handling, fail-closed cleanup, source-scope transaction coordination and bounded injected-coordinator runtime evidence/lease cleanup.

## Bounded input preflight

`assessP14PreparationInputBounds(...)` remains the resource-size gate before canonical plan validation, registry authorization, confirmation validation, source coordination or adapter access.

It applies deterministic limits to action/blocker counts, targets per action, total target references, prerequisites/conflicts/mutation fields, action buckets, blocker action references, plan/source identities, run-level transaction/prepared-name identity lengths and supplied confirmation identities/action lists.

Important safety behavior:

- oversized top-level arrays are rejected from their `.length` without traversing their contents;
- oversized nested target/dependency/confirmation action arrays are rejected before iterating their items;
- `transactionId`, `preparedName` and confirmation evidence are bounded before the transaction coordinator or adapter is touched;
- callers may inject only stricter limits — injected values cannot loosen the defaults or hard safety ceilings;
- oversized input returns `BLOCKED` + `P14_INPUT_TOO_LARGE`;
- source-before/source-after fingerprints remain `UNKNOWN` because no runtime source proof was attempted;
- oversized source/run/digest identities are not echoed back into the rejection receipt; bounded placeholders are used instead;
- an oversized transaction ID is replaced by the bounded receipt fallback `p14-transaction-invalid`;
- source transaction coordinator and adapter methods remain untouched on a bounded-preflight rejection.

These limits are freeze/resource safety bounds only. They are not estimates of Elementor/Gutenberg conversion effort or target compatibility.

## Run-control runtime evidence

Caller-supplied transaction controls are runtime evidence, not authority granted by TypeScript declarations. The public `runP14RetainedDuplicateTransaction(...)` boundary therefore validates and snapshots control values before delegating to the retained-duplicate transaction core.

`assessP14RunControlEvidence(...)` requires:

- `transactionId` to be a string with a non-whitespace identity; the accepted value is normalized once before coordinator, adapter and receipt use;
- supplied `preparedName` to be a string; it is normalized once and preserves the established empty/whitespace fallback to `Prepared Duplicate`;
- supplied `allowPreparedWithReview` to be a literal boolean; only literal `true` can authorize the existing `PREPARED_WITH_REVIEW` policy path;
- supplied `inputBounds` to be an object whose known override fields can be read safely and whose present values are positive integers.

Known `inputBounds` properties are snapshotted into a plain object before the transaction core reuses them. A proxy/getter that throws therefore cannot escape the first bounds gate by being re-read later. Malformed run-control evidence returns a bounded `BLOCKED` receipt with `P14_INTERNAL_INVARIANT_FAILED` at stage `run-control`, before confirmation, coordination or adapter access.

Resource-size authority remains separate from run-control type/shape authority. Valid typed but oversized transaction/prepared-name strings are still measured from their raw values and retain the established `P14_INPUT_TOO_LARGE` outcome. Stricter caller-supplied positive-integer bounds still use the existing clamp/default/hard-limit policy and cannot loosen defaults.

The prior transaction engine is retained as the internal deterministic core; the original public module path is now the hardened run-control boundary. This split adds no recipe, target, host-identity or production-acceptance authority.

## Bounded safe-recipe registry evidence

The safe-recipe registry is authorization evidence and is therefore treated as an untrusted runtime structure even though production currently registers no mutating recipes.

`assessP14SafeRecipeRegistryBounds(...)` reuses the existing P14 safety limits before `validateP14SafeRecipeRegistry(...)` performs semantic validation. It does not define a parallel registry-specific limit system.

The bounds gate requires:

- top-level `bindings` count to remain within the existing action-count limit before any binding item is traversed;
- each recipe's `sourceRuleIds`, `prerequisites`, `conflictsWith` and `mutationAllowlist` collection to remain within the corresponding existing P14 count limit before item traversal;
- binding source-rule identity, recipe ID, validation-profile ID, order class and nested rule/dependency/conflict identities to remain within the existing P14 identity limit;
- oversized proxy-backed arrays to fail from `.length` without property/item traversal.

The bounds assessment runs inside `validateP14SafeRecipeRegistry(...)`, so handoff resolution and execution authorization inherit the same resource guard. Bounded-but-malformed registries still use the established semantic validation failures. Oversized registry evidence also stays on the existing execution authorization outcome: `BLOCKED` + `P14_RECIPE_UNAUTHORIZED`, before confirmation, source coordination or adapter access. No new transaction status/error authority is created by this resource gate.

The production safe-recipe registry remains intentionally empty. Registry bounding does not register a recipe, prove a recipe safe, grant mutation authority or establish target compatibility/production acceptance.

## Plan integrity, execution authority and reviewed confirmation

A persisted or copied plan is not trusted merely because it is typed as `P14PreparationPlanV1`.

For a mutating `READY` plan, three separate gates must pass before source coordination or adapter access:

1. `validateP14PreparationPlan(...)` proves internal plan coherence;
2. `authorizeP14PreparationPlan(...)` proves every `ELIGIBLE` action is still authorized by the current exact safe-recipe registry;
3. `validateP14PreparationConfirmation(...)` proves the caller supplied explicit reviewed intent bound to the exact plan digest, P13 run, source node/fingerprint and canonical eligible action set.

`P14PreparationConfirmationV1` is versioned and always carries `acceptanceAuthority: false` and `targetCompatibilityClaim: false`. Its timestamp is strict normalized UTC ISO evidence. Standalone confirmation build/validation is bounds-first before plan-integrity processing.

Missing confirmation returns `P14_CONFIRMATION_REQUIRED`. Malformed, stale or plan-mismatched confirmation returns `P14_CONFIRMATION_MISMATCH`. Both outcomes are `BLOCKED`, keep source fingerprints `UNKNOWN` and occur before the source lease or runtime adapter is touched.

Confirmation is an intent/correlation artifact only. It is not cryptographic authentication, user identity proof, recipe authority, target-readiness evidence or production acceptance. A future UI may create it only after showing the proposed changes for the exact current plan.

`NO_CHANGES_NEEDED` is non-mutating, so it does not require this mutating-plan confirmation. Already-BLOCKED plans also do not enter the confirmation gate.

The production safe-recipe registry remains intentionally empty, so a self-consistent mutating READY plan is non-executable by default even if someone fabricates a confirmation. Synthetic positive tests inject explicit test-only registries; those mappings are not production authority.

## Sequential runtime action-eligibility re-evaluation

The frozen P14 sequential-transform contract does not allow one recipe to silently invalidate the assumptions of a later recipe. Static topological planning is therefore necessary but not sufficient once candidate mutation has begun.

The first eligible action is already bound by plan integrity, current safe-recipe authorization, exact reviewed confirmation and the freshly cloned candidate. After any recipe result has been recorded, every subsequent eligible action must pass two additional runtime gates before `applyRecipe(...)` is called:

1. the core verifies that every declared `prerequisiteRecipeId` has a completed earlier execution result in this transaction;
2. the adapter must provide bounded `assessActionEligibility(...)` evidence for the current candidate, bound to the exact action ID, recipe ID and exact planned prerequisite recipe-ID set.

`validateP14RuntimeActionEligibilityEvidence(...)` rejects malformed, stale, duplicated, oversized or plan-mismatched assessment evidence. The assessment is untrusted runtime evidence even though an adapter is strongly typed.

A later action is reassessed even when it has no explicit prerequisite IDs: any earlier candidate mutation could still invalidate its eligibility. If the adapter cannot perform this reassessment after a prior recipe, the transaction fails closed and discards the candidate rather than silently trusting the old plan.

A valid runtime assessment with `eligible: false` stops the sequence before that action mutates, discards the candidate and returns replan/recovery guidance. A malformed/missing reassessment follows `P14_TRANSFORM_FAILED`; lost prerequisite/eligibility assumptions follow the stable prerequisite/replan safety path. Raw hostile assessment evidence is not copied into receipts.

An accepted idempotent `becameNoOp` recipe result still counts as completed prerequisite execution evidence, because the recipe was re-evaluated and proved already satisfied rather than skipped without proof.

This gate is target-neutral. It does not authorize a production recipe, prove target compatibility or replace the later mandatory validation/re-score/source-immutability gates.

## Bounded adapter-output evidence

TypeScript adapter return types are not treated as runtime trust. Clone, recipe execution and retention outputs are validated as unknown evidence before their fields can affect transaction state or be copied into receipts.

`validateP14CandidateHandleEvidence(...)` requires bounded non-empty source/candidate identities, exact approved-source binding and a candidate identity distinct from the source. Malformed clone evidence returns the existing clone-failure path before any recipe mutation starts.

`validateP14RecipeExecutionResultEvidence(...)` requires bounded exact action/recipe identities, boolean outcome fields, exactly one of applied or accepted idempotent no-op, and bounded optional detail. The runtime transaction binds each result to the exact planned action before it is added to `appliedActions`. Malformed evidence triggers candidate cleanup and `P14_TRANSFORM_FAILED`; raw oversized result detail is not promoted into the receipt error.

`validateP14RetentionEvidence(...)` requires bounded transaction/source/retained-node/prepared-name identities and, during execution, exact equality with the current transaction, approved source, candidate and requested prepared name. Malformed or mismatched retention evidence cannot produce `PREPARED`; it follows the finalization cleanup path.

Receipt integrity reuses the same bounded execution-result/retention shape validators and requires bounded candidate identity evidence. A copied or forged receipt therefore cannot become valid merely because an oversized runtime identity is non-empty.

These validators do not invent a Figma node-ID format, authenticate a host, or prove that an adapter really performed the claimed external operation. They establish bounded shape and exact transaction identity binding only.

## Active recipe validation-profile coverage

The frozen P14 validation stack requires every validator profile declared by the active recipe set to actually run before a candidate may be retained. Generic `validation.passed=true` is therefore not sufficient evidence.

`requiredP14ValidationProfileIds(...)` derives the required profile set only from `ELIGIBLE` actions and de-duplicates it deterministically. `assessP14ValidationProfileCoverage(...)` then evaluates the adapter's explicit `profileIdsRun` evidence.

The coverage gate requires:

- every active eligible recipe to expose a bounded `validationProfileId`;
- `profileIdsRun` to be an explicit bounded array of bounded non-empty IDs;
- duplicate reported profile IDs to fail closed;
- every required profile ID to appear in the observed evidence;
- extra explicitly reported profiles to be permitted only within the same bounded evidence limit; extras never substitute for a missing required profile.

Observed profile evidence is normalized to a stable bounded representation before it is attached to a rejection receipt. Missing, duplicate, malformed or oversized profile evidence returns `P14_VALIDATION_FAILED`, discards the candidate and prevents re-score/finalization.

Adapter validation output is treated as untrusted runtime evidence even though the TypeScript interface is strongly typed. A null/non-object/malformed validation result fails through the validation cleanup path instead of escaping as an uncaught property-access error.

Validation-profile coverage and generic mandatory validation checks are independent gates. Both must pass before Build-Ready re-score can start. Profile coverage proves only that declared validator profiles were represented in execution evidence; it does not prove the validators are externally accepted, prove target compatibility or grant runtime/production acceptance.

## Bounded validation-check evidence

`validateP14ValidationEvidence(...)` treats the adapter-provided validation summary and its `checks` array as untrusted runtime evidence before policy evaluation or receipt attachment. Strong TypeScript return types are not runtime authority.

The validator enforces resource and evidence bounds before the transaction can trust check data:

- `checks` must be an explicit array and its count is bounded by the existing P14 action-count safety limit;
- an oversized check array is rejected from `.length` before any item traversal;
- every check ID must be a non-empty string within the existing P14 identity bound;
- optional check detail must be a string within the existing P14 detail bound;
- `passed` and `required` must be booleans;
- only accepted bounded checks are normalized into transaction evidence.

Malformed or oversized validation-check evidence follows `P14_VALIDATION_FAILED`, discards the candidate and stops before re-score or retention. Raw hostile oversized check detail is not copied into the receipt. Receipt integrity reuses the same bounded check validator, so copied/forged receipts cannot bypass the runtime resource contract.

This shape/resource gate remains separate from validation-profile coverage and from the generic mandatory-check policy. It does not decide whether a required check should exist, does not authorize a validator, and does not create target-readiness or production-acceptance evidence.

## Candidate re-score evidence hardening

`rescoreCandidate(...)` output is also treated as untrusted runtime evidence before any field dereference.

`validateP14RescoreEvidence(...)` is shared by the transaction runtime and receipt-integrity validator. It requires:

- bounded non-empty `runId` and accepted scored P13 status identity;
- status in the scored P13 domain `READY | REVIEW | NOT_READY`;
- finite integer score in the accepted P13 range `0..100`;
- non-negative safe-integer blocker/high-risk/introduced-risk counts;
- boolean review evidence.

A numeric P14 re-score summary cannot truthfully encode P13 `INSUFFICIENT_EVIDENCE`, because the accepted P13 model represents that status with `score: null`. Such contradictory evidence therefore fails closed rather than being coerced.

Malformed/null/non-finite/out-of-domain re-score evidence causes candidate cleanup with `P14_RESCORE_FAILED` and never reaches retention. By contrast, structurally valid evidence that reports a newly introduced HIGH/BLOCKER finding remains the separate existing `P14_VALIDATION_FAILED` preparation-policy outcome.

This evidence gate does not create a new score target and does not require score-chasing to `READY`. The frozen P14 acceptance rule remains preservation-first: mandatory validators must pass and preparation must not introduce new HIGH/BLOCKER findings.

## Runtime source-fingerprint evidence

P14's central source-safety claim depends on runtime fingerprint equality, so typed adapter return values are not trusted merely because `fingerprintSource(...)` declares `Promise<string>`.

`validateP14SourceFingerprintEvidence(...)` accepts only a bounded, non-empty runtime fingerprint string within the existing P14 identity bound. It deliberately does **not** invent a cryptographic hash format or claim host authenticity.

Every runtime source fingerprint read is validated before comparison or receipt attachment:

- initial preflight source binding;
- `NO_CHANGES_NEEDED` source recheck;
- pre-retain source immutability check;
- post-retain source immutability check.

Malformed, empty, null or oversized runtime fingerprint evidence fails closed. Raw invalid evidence is never copied into a receipt. Where proof could not be retained, the receipt uses the explicit bounded `UNKNOWN` sentinel instead.

A valid bounded fingerprint that differs from the accepted before-fingerprint remains genuine stale/change evidence and follows the existing `SOURCE_STALE`/`P14_SOURCE_CHANGED_DURING_RUN` paths. Invalid fingerprint evidence is not misrepresented as a changed source value.

Receipt integrity applies the same bounded fingerprint shape contract while permitting `UNKNOWN` only as a receipt sentinel for unavailable proof. This validation establishes evidence shape/bounds only; it does not establish cryptographic strength, Figma identity, publisher identity, or external runtime acceptance.

## Cancellation control hardening

`shouldCancel()` is runtime control evidence, not a trusted boolean merely because its TypeScript signature says so. `assessP14CancellationCheck(...)` therefore distinguishes three outcomes: explicit `true`, explicit `false`, and callback failure.

A callback failure includes synchronous throw, rejected promise, or a non-boolean runtime return. Failure is never relabeled as user-requested cancellation. Failure detail is bounded before it can enter receipt/event evidence.

The transaction applies this rule at every cooperative cancellation checkpoint: before clone, before each recipe execution checkpoint, before validation, and before finalization. A pre-clone callback failure returns a structured fail-closed receipt without cloning or mutating. Once a candidate exists, callback failure first attempts candidate discard and returns the normal rejection path; if discard itself fails, the result becomes `CLEANUP_REQUIRED`.

Normal `true` cancellation semantics remain unchanged: pre-clone cancellation performs no clone, while post-clone cancellation discards the candidate before returning `CANCELLED`. Callback failure and user cancellation remain separate evidence states.

An acquired source-scope transaction lease is always passed through the bounded release-evidence step before the transaction returns. Cancellation-check failure therefore cannot silently skip lease cleanup; a failed release becomes explicit `CLEANUP_REQUIRED` evidence. This is process-local transaction safety only; it is not host cancellation proof, user identity evidence or production acceptance.

## Source-scope transaction coordination

`P14SourceTransactionCoordinator` enforces the frozen single-owner rule for executable READY runs:

- one active transaction may own a source scope at a time;
- one active transaction ID may own only one source scope;
- same-source overlap fails before adapter access with `P14_TRANSACTION_CONFLICT`;
- stale/non-owner release cannot clear the current owner;
- independent source scopes may run concurrently;
- NO_CHANGES_NEEDED and already-BLOCKED plans do not consume mutation leases;
- acquired READY leases must produce explicit successful release evidence before the transaction can return a clean terminal outcome.

Lease acquisition occurs only after integrity, recipe authorization and exact confirmation succeed. The default coordinator is process-local only; no distributed/cross-plugin-instance locking is claimed.

## Coordinator runtime evidence and lease cleanup

An injected coordinator is a runtime boundary, not authority granted by the `P14SourceTransactionCoordinator` TypeScript type.

`assessP14TransactionLeaseResultEvidence(...)` validates acquisition results before transaction code may branch on them. It requires a boolean acquisition flag, a supported refusal reason, bounded optional owner identities, and—when acquisition is claimed—bounded lease identities exactly equal to the normalized requested source scope and transaction ID. Unreadable/proxy-backed evidence fails closed instead of escaping through property access.

A throwing `tryAcquire(...)` or malformed refusal/acquisition result returns a structured pre-adapter `BLOCKED` receipt. If malformed evidence nevertheless claims `acquired: true`, the core makes one best-effort release attempt using the exact expected source/transaction lease identity so an injected coordinator cannot intentionally hide an acquired lease behind malformed evidence.

Lease release is also runtime evidence. Only the literal result `true` is accepted as successful cleanup. A `false`, non-boolean runtime value or thrown release call cannot override the transaction promise or be silently ignored. Instead, the already-produced outcome is converted to `CLEANUP_REQUIRED` and receives bounded `P14_INTERNAL_INVARIANT_FAILED` evidence at stage `coordination-release` plus explicit lease-recovery guidance.

If candidate retention already succeeded before coordinator release failed, the receipt keeps truthful candidate/retention/validation/re-score evidence and marks the retained candidate as retained while the transaction itself becomes `CLEANUP_REQUIRED`. If the run failed before a candidate existed, coordinator cleanup may likewise produce `CLEANUP_REQUIRED` without inventing candidate evidence. Receipt integrity recognizes both cases only when the exact coordinator-release failure stage is present.

These checks do not prove distributed locking, host authenticity, persistence, cross-plugin coordination or external ownership recovery. They only make the injected process-local coordination boundary bounded and fail-closed.

## Bounded receipt envelope and runtime diagnostics

P14 receipt integrity treats the receipt envelope itself as untrusted evidence, not just its nested validation/re-score payloads.

`assessP14ReceiptCollection(...)` applies the existing P14 action-count safety limit to `appliedActions`, `errors` and `events`. An oversized collection is rejected from its `.length` before any item access, iteration, duplicate scan or status-specific `.some(...)` check. This preserves a bounded receipt-integrity traversal even for proxy-backed or otherwise hostile forged arrays.

Top-level receipt correlation identities — `transactionId`, `p13RunId`, `planDigest` and `source.nodeId` — use the existing P14 identity bound. Error `stage` also uses the identity bound, while error `detail`, optional `recovery` and optional event `detail` use the existing P14 detail bound. The plan digest keeps its existing `p14-plan-` correlation prefix requirement; no host-specific node-ID or authentication format is invented.

Transaction diagnostic constructors use the same shared bounds. `receiptError(...)` and event construction therefore emit bounded diagnostics by construction, including details assembled from planner/authorization/runtime failures. Runtime adapter/discard/coordinator exceptions are rendered through `safeP14RuntimeErrorMessage(...)`, which bounds long messages and falls back deterministically when hostile exception stringification itself throws.

These envelope/resource limits do not make a receipt authoritative. They bound traversal and evidence size only; `acceptanceAuthority` and `targetCompatibilityClaim` remain false.

## Runtime clock and event timestamp evidence

Runtime wall-clock callbacks are evidence providers, not transaction authority. A caller-supplied `now()` callback therefore cannot be trusted merely because the TypeScript surface historically returned `string`.

`isP14NormalizedUtcTimestamp(...)` centralizes the strict P14 timestamp shape already used by reviewed-plan confirmations: normalized UTC ISO with millisecond precision (`YYYY-MM-DDTHH:mm:ss.sssZ`), bounded before parsing, and round-tripped through `Date` to reject impossible calendar values. Preparation confirmations continue to require this strict observed timestamp and do not accept an unavailable-time sentinel.

Receipt event timestamps use the same bounded normalized form when runtime clock evidence is valid. If the runtime clock callback throws, returns a non-string, exceeds the existing identity bound, or returns a non-canonical/invalid timestamp, `readP14RuntimeEventTimestamp(...)` records the explicit `UNKNOWN` sentinel instead of throwing or inventing an observed time.

Receipt integrity accepts only normalized UTC event evidence or the explicit `UNKNOWN` sentinel. Oversized/malformed event timestamp strings are rejected before `Date.parse(...)`, so forged receipt evidence cannot force unbounded timestamp parsing.

`UNKNOWN` means only that the event's wall-clock timestamp was unavailable or invalid. It is not a real time, does not weaken event state ordering, does not authenticate the host clock, and does not claim monotonicity, cross-machine synchronization, publisher identity or production acceptance. Transaction state/detail/cleanup semantics remain unchanged when clock evidence is unavailable.

## Receipt integrity gate

Every P14 receipt explicitly carries `acceptanceAuthority: false` and `targetCompatibilityClaim: false`.

Receipt validation rejects contradictory/malformed status, candidate, retention, source-fingerprint, error, event, validation, re-score and recipe-execution evidence. Receipt collection counts are bounded before traversal; top-level correlation identities and error/event diagnostics are bounded with the existing P14 identity/detail limits. Event time evidence must be normalized bounded UTC or the explicit unavailable sentinel. Validation profile evidence must be present, bounded and duplicate-free where validation evidence is carried; validation-check count, IDs, boolean fields and optional detail are bounded through the same shared validator used at runtime; prepared outcomes require non-empty profile execution evidence. Runtime/receipt re-score evidence uses the same accepted scored-P13 validator. Source fingerprint evidence is bounded and may use the explicit `UNKNOWN` sentinel only as receipt evidence for unavailable proof. Candidate identities, recipe execution results and retention identities are bounded through the same adapter-evidence contracts used at runtime. Coordinator-release cleanup is recognized only through bounded `P14_INTERNAL_INVARIANT_FAILED` evidence at the exact `coordination-release` stage. Its supported error-code allowlist includes current authorization, confirmation, coordination and bounded-input outcomes emitted by the transaction core. A valid receipt remains evidence only; it is never an Elementor, Gutenberg, framework, publish or production-acceptance claim.

## Safety invariants

1. Oversized/pathological input is blocked before deep plan processing or adapter access.
2. Run-level and confirmation identities are bounded by the same first-gate policy.
3. Oversized rejection evidence remains bounded and does not echo hostile identity payloads.
4. A mutating READY plan requires separate integrity, recipe-authorization and exact reviewed-confirmation gates.
5. Confirmation cannot authorize a recipe, bypass validation or claim target readiness/production acceptance.
6. Static topological ordering is rechecked at runtime: every subsequent action must still be eligible against the current candidate before mutation.
7. Declared prerequisite recipes must have completed earlier in the same transaction before a dependent action can execute.
8. Missing/malformed runtime reassessment evidence fails closed before the later recipe mutation.
9. Candidate clone evidence is bounded and source-bound before recipe mutation begins.
10. Recipe execution evidence is bounded and action-bound before it enters `appliedActions`.
11. Retention evidence is bounded and exactly transaction/source/candidate/prepared-name bound before `PREPARED` can be emitted.
12. Every active eligible recipe's declared validation profile must be represented in bounded validation evidence before re-score or retention.
13. Generic `validation.passed=true` cannot substitute for missing recipe-specific validator coverage.
14. Malformed runtime validation evidence fails through candidate cleanup rather than bypassing validation.
15. Candidate re-score output is untrusted evidence and must satisfy the bounded scored-P13 contract before policy evaluation.
16. Re-score evidence hardening does not create a new score target or override design-preservation rules.
17. Every runtime source fingerprint read is bounded and validated before equality comparison or receipt attachment.
18. Invalid source-fingerprint evidence is represented as unavailable proof, never fabricated stale/change proof.
19. The approved source node is never passed to recipe mutation callbacks.
20. A P14 transaction never swaps, replaces or deletes the approved source.
21. A candidate cannot reach `PREPARED` without mandatory validation, accepted re-score policy and source-immutability proof.
22. New HIGH/BLOCKER findings caused by preparation reject the candidate.
23. `PREPARED_WITH_REVIEW` requires explicit literal-boolean review authorization; truthy non-boolean runtime values cannot grant it.
24. Explicit cancellation and cancellation-check failure are distinct; callback failure is never emitted as `P14_CANCELLED`.
25. Cancellation-check throw/reject/non-boolean results fail closed; after clone they require candidate cleanup before return.
26. Failed/cancelled candidates are discarded; discard failure becomes `CLEANUP_REQUIRED`.
27. A no-op plan completes without cloning and without mutating-plan confirmation.
28. Target-neutral preparation does not imply target readiness.
29. Malformed/tampered plans are blocked before adapter access.
30. Eligible recipes require current registry authorization before adapter access.
31. P14 receipts have no acceptance/target-compatibility authority.
32. One executable READY transaction may own a source scope at a time.
33. An acquired transaction lease requires explicit successful release evidence; failed release becomes `CLEANUP_REQUIRED` rather than escaping or being ignored.
34. Validation-check arrays are count-bounded before traversal, and check IDs/details are bounded before policy evaluation or receipt attachment.
35. Validation-check shape/resource validation remains separate from profile coverage and required-check policy; bounded evidence alone never proves target readiness.
36. Receipt `appliedActions`, `errors` and `events` counts are bounded from `.length` before their contents are traversed.
37. Receipt correlation identities and error/event diagnostics are bounded by the existing P14 identity/detail limits.
38. Runtime adapter/discard/coordinator exception rendering cannot emit unbounded receipt error or event detail.
39. Receipt-envelope hardening introduces no new host identifier, authentication or acceptance semantics.
40. Event timestamp strings are length/shape checked before parsing and must be normalized UTC or the explicit `UNKNOWN` sentinel.
41. A throwing, non-string, oversized or non-canonical runtime clock callback cannot escape the transaction or inject raw timestamp evidence.
42. `UNKNOWN` event time represents unavailable evidence; it never fabricates an observed wall-clock timestamp or changes transaction state semantics.
43. Reviewed-plan confirmation timestamps remain strict normalized UTC evidence and cannot use the event-time `UNKNOWN` sentinel.
44. P14 does not claim host-clock accuracy, monotonicity or cross-machine time synchronization.
45. Safe-recipe registry top-level and nested collections are count-bounded before semantic traversal using existing P14 limits.
46. Safe-recipe registry rule/recipe/profile/order/dependency identities are bounded before semantic authorization validation.
47. Oversized registry evidence remains fail-closed on the existing `P14_RECIPE_UNAUTHORIZED` path before confirmation, source coordination or adapter access.
48. Registry resource bounding never registers a production recipe or grants mutation, compatibility or acceptance authority.
49. Injected coordinator acquisition results are untrusted evidence and must be readable, bounded and contract-valid before adapter access.
50. Acquired lease evidence is bound to the exact normalized requested source scope and transaction ID before execution may continue.
51. Malformed evidence that claims acquisition triggers one bounded best-effort exact-lease cleanup attempt before return.
52. Only literal `true` release evidence proves coordinator cleanup; false/non-boolean/throwing release cannot silently produce a clean terminal outcome.
53. Coordinator cleanup failure preserves truthful candidate/retention state while changing the transaction outcome to `CLEANUP_REQUIRED`; it does not imply distributed lock recovery or host authenticity.
54. Caller run-control type/shape evidence is validated before confirmation, coordinator or adapter access.
55. Transaction and prepared-name identities are normalized once before runtime semantics; their raw typed values still drive resource-size rejection.
56. Known input-bound override fields are snapshotted safely before the core reuses them; throwing getters cannot escape the first gate.
57. Present input-bound override values must be positive integers and remain stricter-only through the existing clamp/default/hard-limit policy.
58. Run-control hardening adds no recipe, target, authentication, compatibility or production-acceptance authority.

## Deliberately not wired yet

This foundation does **not** add a Figma plugin menu item, UI button, real Figma adapter, real Figma validator, production mutating recipe, target-specific profile, identity/authentication service or target-specific readiness claim.

P13 #159 real-Figma runtime parity remains an open P14 acceptance dependency. P12 #84 remains open at its retained state, with the remaining live/manual release evidence deferred to P27 #182. Under the roadmap execution model, these open release gates do **not** block P14 core implementation/testing from reaching implementation-complete or internally-ready state; they do block production acceptance/release claims. P14 runtime mutation exposure and production recipe authority remain deliberately unwired until their own acceptance prerequisites are genuinely satisfied.