# P14 Retained-Duplicate Foundation

Status: IMPLEMENTATION FOUNDATION ONLY — RUNTIME UNWIRED  
Foundation issues: #163, #165, #169, #171, #173, #175, #177, #179, #181  
Roadmap: #119  
Open acceptance/release dependencies: P13 real-Figma acceptance (#159), P12 release-exit review (#84), and final production-release gate P27 (#182)

## What this foundation implements

This foundation turns the frozen P14 specification into a target-neutral deterministic core without exposing a new Figma mutation command.

It includes explicit P13→P14 handoff, versioned safe-recipe authorization, bounded input preflight, deterministic dependency-topological planning, explicit reviewed-plan confirmation, plan/receipt integrity validation, retained-duplicate transaction semantics, candidate-only recipe callbacks, active-recipe validation-profile coverage, mandatory validation/re-score, bounded re-score evidence validation, bounded runtime source-fingerprint evidence, source-immutability proof, cooperative cancellation, fail-closed cleanup and source-scope transaction coordination.

## Bounded input preflight

`assessP14PreparationInputBounds(...)` is the first transaction gate, before canonical plan validation, registry authorization, confirmation validation, source coordination or adapter access.

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

## Source-scope transaction coordination

`P14SourceTransactionCoordinator` enforces the frozen single-owner rule for executable READY runs:

- one active transaction may own a source scope at a time;
- one active transaction ID may own only one source scope;
- same-source overlap fails before adapter access with `P14_TRANSACTION_CONFLICT`;
- stale/non-owner release cannot clear the current owner;
- independent source scopes may run concurrently;
- NO_CHANGES_NEEDED and already-BLOCKED plans do not consume mutation leases;
- acquired READY leases release through `finally` on every terminal path.

Lease acquisition occurs only after integrity, recipe authorization and exact confirmation succeed. The default coordinator is process-local only; no distributed/cross-plugin-instance locking is claimed.

## Receipt integrity gate

Every P14 receipt explicitly carries `acceptanceAuthority: false` and `targetCompatibilityClaim: false`.

Receipt validation rejects contradictory/malformed status, candidate, retention, source-fingerprint, error, event, validation, re-score and recipe-execution evidence. Validation profile evidence must be present, bounded and duplicate-free where validation evidence is carried; prepared outcomes require non-empty profile execution evidence. Runtime/receipt re-score evidence uses the same accepted scored-P13 validator. Source fingerprint evidence is bounded and may use the explicit `UNKNOWN` sentinel only as receipt evidence for unavailable proof. Its supported error-code allowlist includes current authorization, confirmation, coordination and bounded-input outcomes emitted by the transaction core. A recipe result must be exactly one of applied or accepted idempotent no-op. A valid receipt remains evidence only; it is never an Elementor, Gutenberg, framework, publish or production-acceptance claim.

## Safety invariants

1. Oversized/pathological input is blocked before deep plan processing or adapter access.
2. Run-level and confirmation identities are bounded by the same first-gate policy.
3. Oversized rejection evidence remains bounded and does not echo hostile identity payloads.
4. A mutating READY plan requires separate integrity, recipe-authorization and exact reviewed-confirmation gates.
5. Confirmation cannot authorize a recipe, bypass validation or claim target readiness/production acceptance.
6. Every active eligible recipe's declared validation profile must be represented in bounded validation evidence before re-score or retention.
7. Generic `validation.passed=true` cannot substitute for missing recipe-specific validator coverage.
8. Malformed runtime validation evidence fails through candidate cleanup rather than bypassing validation.
9. Candidate re-score output is untrusted evidence and must satisfy the bounded scored-P13 contract before policy evaluation.
10. Re-score evidence hardening does not create a new score target or override design-preservation rules.
11. Every runtime source fingerprint read is bounded and validated before equality comparison or receipt attachment.
12. Invalid source-fingerprint evidence is represented as unavailable proof, never fabricated stale/change proof.
13. The approved source node is never passed to recipe mutation callbacks.
14. A P14 transaction never swaps, replaces or deletes the approved source.
15. A candidate cannot reach `PREPARED` without mandatory validation, accepted re-score policy and source-immutability proof.
16. New HIGH/BLOCKER findings caused by preparation reject the candidate.
17. `PREPARED_WITH_REVIEW` requires an explicit policy flag.
18. Failed/cancelled candidates are discarded; discard failure becomes `CLEANUP_REQUIRED`.
19. A no-op plan completes without cloning and without mutating-plan confirmation.
20. Target-neutral preparation does not imply target readiness.
21. Malformed/tampered plans are blocked before adapter access.
22. Eligible recipes require current registry authorization before adapter access.
23. P14 receipts have no acceptance/target-compatibility authority.
24. One executable READY transaction may own a source scope at a time.
25. Acquired transaction leases are released in a bounded `finally` path.

## Deliberately not wired yet

This foundation does **not** add a Figma plugin menu item, UI button, real Figma adapter, real Figma validator, production mutating recipe, target-specific profile, identity/authentication service or target-specific readiness claim.

P13 #159 real-Figma runtime parity remains an open P14 acceptance dependency. P12 #84 remains open at its retained state, with the remaining live/manual release evidence deferred to P27 #182. Under the roadmap execution model, these open release gates do **not** block P14 core implementation/testing from reaching implementation-complete or internally-ready state; they do block production acceptance/release claims. P14 runtime mutation exposure and production recipe authority remain deliberately unwired until their own acceptance prerequisites are genuinely satisfied.
