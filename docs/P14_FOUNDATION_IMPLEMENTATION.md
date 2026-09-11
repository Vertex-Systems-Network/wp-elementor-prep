# P14 Retained-Duplicate Foundation

Status: IMPLEMENTATION FOUNDATION ONLY — RUNTIME UNWIRED  
Foundation issues: #163, #165  
Roadmap: #119  
Dependencies still open: P13 real-Figma acceptance (#159) and final production release gate (#84)

## What this foundation implements

This foundation turns the frozen P14 specification into a target-neutral deterministic core without exposing a new Figma mutation command.

It adds:

- explicit `P14_SAFE_CANDIDATE` / `P14_SAFE_NOOP` handoff classes;
- versioned preparation recipe definitions with confidence, prerequisite, conflict, mutation-allowlist and validation-profile fields;
- deterministic dependency-topological action ordering and plan digesting;
- fail-closed handling for version mismatches, missing prerequisites, conflicts, dependency cycles, review-only and unsupported findings;
- a retained-duplicate transaction state machine that is intentionally separate from the existing P4/P5 swap-style commit semantics;
- candidate-only recipe callbacks;
- mandatory validation and candidate re-score before retention;
- source fingerprint checks before work, immediately before retention and after retention;
- cooperative cancellation checkpoints;
- candidate discard on transform/validation/re-score/finalization/source-drift failure;
- `CLEANUP_REQUIRED` with candidate identity when discard itself fails;
- machine-readable P14 receipts for prepared/no-op/rejected/blocked/cancelled/cleanup-required outcomes.

## Plan integrity gate

P14 does not trust a persisted, copied or downstream plan merely because it is typed as `P14PreparationPlanV1`.

`validateP14PreparationPlan(...)` runs before the retained-duplicate adapter is touched and verifies:

- schema and engine versions;
- non-empty P13 run/source identity;
- action shape, unique action IDs and canonical target/prerequisite/conflict arrays;
- ELIGIBLE recipe/version/validation-profile contracts;
- exact dependency-topological action order;
- exact executable/no-op/review/refused action buckets;
- missing-prerequisite, conflict, dependency-cycle and no-eligible blockers;
- derived READY / NO_CHANGES_NEEDED / BLOCKED status;
- exact canonical plan digest.

Planner and validator share the same canonical structure derivation and digest implementation. A malformed or contradictory plan returns a non-authorizing `BLOCKED` receipt before any fingerprint, clone, transform, validation, re-score, retention or discard adapter operation can run.

The deterministic digest is an integrity/correlation mechanism, not a cryptographic authenticity signature. P14 does not claim that a party with arbitrary code execution cannot construct a new internally consistent plan; runtime authority still comes from accepted product code, P13 evidence and the surrounding release gates.

## Receipt integrity gate

Every P14 receipt explicitly carries:

- `acceptanceAuthority: false`;
- `targetCompatibilityClaim: false`.

`validateP14PreparationReceipt(...)` rejects contradictory or malformed receipt evidence, including:

- forged acceptance/target-compatibility authority;
- PREPARED without retained candidate, passing validation, re-score, retention evidence and proved source immutability;
- PREPARED versus PREPARED_WITH_REVIEW policy contradictions;
- NO_CHANGES_NEEDED with candidate mutation evidence;
- BLOCKED/CANCELLED receipts with retained target output;
- CLEANUP_REQUIRED without candidate identity and `P14_DISCARD_FAILED` evidence;
- retention transaction/source/candidate identity mismatches;
- malformed error entries, event entries or validation-check entries;
- event timestamps/states that do not form valid evidence records;
- recipe execution entries that are not **exactly one** of applied or accepted idempotent no-op — both true and both false are rejected;
- event histories whose terminal event contradicts the receipt terminal state.

Receipt serialization is deterministic JSON plus a trailing newline. A valid P14 receipt remains evidence only; it is never an Elementor, Gutenberg, framework, publish or production-acceptance claim.

## Safety invariants

1. The approved source node is never passed to recipe mutation callbacks.
2. A P14 transaction never swaps, replaces or deletes the approved source.
3. A candidate cannot reach `PREPARED` without mandatory validation, accepted re-score policy and source-immutability proof.
4. New HIGH/BLOCKER findings caused by preparation reject the candidate.
5. `PREPARED_WITH_REVIEW` requires an explicit policy flag; it is never the default fallback for failed validation.
6. A failed or cancelled candidate is discarded; a failed discard is surfaced as `CLEANUP_REQUIRED` rather than hidden.
7. A no-op plan completes without cloning.
8. Target-neutral preparation does not imply Elementor/Gutenberg/framework readiness.
9. A malformed or tampered plan is blocked before any runtime adapter operation.
10. P14 receipts have no acceptance or target-compatibility authority.
11. A recipe result cannot simultaneously claim a mutation and an idempotent no-op.

## Deliberately not wired yet

This foundation does **not** add a Figma plugin menu item, UI button, real Figma adapter, production recipe registry, target-specific profile or target-specific readiness claim.

The reason is intentional: P13 real-Figma runtime parity is still an open acceptance dependency and P12 remains the final production release gate. The core can be compiled and regression-tested now, while mutation exposure remains gated.

## Next P14 runtime slice after dependencies are accepted

The next runtime slice should bind the pure core to a Figma retained-duplicate adapter that:

- clones only the exact selected source;
- marks the candidate in-progress;
- applies only an accepted recipe registry;
- reuses the existing structural/content/geometry/pixel validators where applicable;
- computes the current P13 report for source-staleness and candidate re-score;
- retains a successful candidate beside the source with deterministic collision-safe naming;
- persists a bounded P14 receipt only after receipt-integrity validation;
- proves cancellation and cleanup in real Figma Desktop.

Until that evidence exists, P14 must remain implementation-foundation only and the roadmap checkbox must stay unchecked.
