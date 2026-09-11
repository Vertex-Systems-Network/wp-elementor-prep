# P14 Retained-Duplicate Foundation

Status: IMPLEMENTATION FOUNDATION ONLY — RUNTIME UNWIRED  
Foundation issues: #163, #165, #169, #171, #173  
Roadmap: #119  
Dependencies still open: P13 real-Figma acceptance (#159) and final production release gate (#84)

## What this foundation implements

This foundation turns the frozen P14 specification into a target-neutral deterministic core without exposing a new Figma mutation command.

It includes explicit P13→P14 handoff, versioned safe-recipe authorization, bounded input preflight, deterministic dependency-topological planning, plan/receipt integrity validation, retained-duplicate transaction semantics, candidate-only recipe callbacks, mandatory validation/re-score, source-immutability proof, cooperative cancellation, fail-closed cleanup and source-scope transaction coordination.

## Bounded input preflight

`assessP14PreparationInputBounds(...)` is the first transaction gate, before canonical plan validation, registry authorization, source coordination or adapter access.

It applies deterministic limits to action/blocker counts, targets per action, total target references, prerequisites/conflicts/mutation fields, action buckets, blocker action references and identity/detail string lengths.

Important safety behavior:

- oversized top-level arrays are rejected from their `.length` without traversing their contents;
- oversized nested target/dependency arrays are rejected before iterating their items;
- callers may inject only stricter limits — injected values cannot loosen the defaults or hard safety ceilings;
- oversized input returns `BLOCKED` + `P14_INPUT_TOO_LARGE`;
- source-before/source-after fingerprints remain `UNKNOWN` because no runtime source proof was attempted;
- source transaction coordinator and adapter methods remain untouched on a bounded-preflight rejection.

These limits are freeze/resource safety bounds only. They are not estimates of Elementor/Gutenberg conversion effort or target compatibility.

## Plan integrity and execution authority

A persisted or copied plan is not trusted merely because it is typed as `P14PreparationPlanV1`.

`validateP14PreparationPlan(...)` proves internal plan coherence. `authorizeP14PreparationPlan(...)` separately proves every `ELIGIBLE` action is still authorized by the current exact safe-recipe registry. Both gates run after the bounded-input gate and before mutation work.

The production safe-recipe registry remains intentionally empty, so a self-consistent mutating READY plan is non-executable by default. Synthetic positive tests inject explicit test-only registries; those mappings are not production authority.

## Source-scope transaction coordination

`P14SourceTransactionCoordinator` enforces the frozen single-owner rule for executable READY runs:

- one active transaction may own a source scope at a time;
- one active transaction ID may own only one source scope;
- same-source overlap fails before adapter access with `P14_TRANSACTION_CONFLICT`;
- stale/non-owner release cannot clear the current owner;
- independent source scopes may run concurrently;
- NO_CHANGES_NEEDED and already-BLOCKED plans do not consume mutation leases;
- acquired READY leases release through `finally` on every terminal path.

The default coordinator is process-local only; no distributed/cross-plugin-instance locking is claimed.

## Receipt integrity gate

Every P14 receipt explicitly carries `acceptanceAuthority: false` and `targetCompatibilityClaim: false`.

Receipt validation rejects contradictory/malformed status, candidate, retention, source-fingerprint, error, event, validation and recipe-execution evidence. A recipe result must be exactly one of applied or accepted idempotent no-op. A valid receipt remains evidence only; it is never an Elementor, Gutenberg, framework, publish or production-acceptance claim.

## Safety invariants

1. Oversized/pathological input is blocked before deep plan processing or adapter access.
2. The approved source node is never passed to recipe mutation callbacks.
3. A P14 transaction never swaps, replaces or deletes the approved source.
4. A candidate cannot reach `PREPARED` without mandatory validation, accepted re-score policy and source-immutability proof.
5. New HIGH/BLOCKER findings caused by preparation reject the candidate.
6. `PREPARED_WITH_REVIEW` requires an explicit policy flag.
7. Failed/cancelled candidates are discarded; discard failure becomes `CLEANUP_REQUIRED`.
8. A no-op plan completes without cloning.
9. Target-neutral preparation does not imply target readiness.
10. Malformed/tampered plans are blocked before adapter access.
11. Eligible recipes require current registry authorization before adapter access.
12. P14 receipts have no acceptance/target-compatibility authority.
13. One executable READY transaction may own a source scope at a time.
14. Acquired transaction leases are released in a bounded `finally` path.

## Deliberately not wired yet

This foundation does **not** add a Figma plugin menu item, UI button, real Figma adapter, production mutating recipe, target-specific profile or target-specific readiness claim.

P13 #159 real-Figma runtime parity remains an open acceptance dependency and P12 #84 remains the final production release gate. P14 must stay implementation-foundation only and the roadmap checkbox must remain unchecked until those acceptance requirements and later real runtime preparation evidence are genuinely satisfied.
