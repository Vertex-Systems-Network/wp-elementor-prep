# P14 Retained-Duplicate Foundation

Status: IMPLEMENTATION FOUNDATION ONLY — RUNTIME UNWIRED  
Foundation issues: #163, #165, #169, #171  
Roadmap: #119  
Dependencies still open: P13 real-Figma acceptance (#159) and final production release gate (#84)

## What this foundation implements

This foundation turns the frozen P14 specification into a target-neutral deterministic core without exposing a new Figma mutation command.

It includes explicit P13→P14 handoff, versioned safe-recipe authorization, deterministic dependency-topological planning, plan/receipt integrity validation, retained-duplicate transaction semantics, candidate-only recipe callbacks, mandatory validation/re-score, source-immutability proof, cooperative cancellation, fail-closed cleanup and source-scope transaction coordination.

## Plan integrity and execution authority

A persisted or copied plan is not trusted merely because it is typed as `P14PreparationPlanV1`.

`validateP14PreparationPlan(...)` proves internal plan coherence. `authorizeP14PreparationPlan(...)` separately proves every `ELIGIBLE` action is still authorized by the current exact safe-recipe registry. Both gates run before mutation work.

The production safe-recipe registry remains intentionally empty, so a self-consistent mutating READY plan is non-executable by default. Synthetic positive tests inject explicit test-only registries; those mappings are not production authority.

## Source-scope transaction coordination

P14 now enforces the frozen single-owner rule for executable READY preparation runs.

`P14SourceTransactionCoordinator` maintains a process-local lease keyed by source scope and transaction ID:

- one active transaction may own a source scope at a time;
- one active transaction ID may own only one source scope;
- a second same-source run is rejected before fingerprint/clone/mutation work with `P14_TRANSACTION_CONFLICT`;
- stale or non-owner lease release cannot clear the current owner;
- independent source scopes may run concurrently;
- NO_CHANGES_NEEDED and already-BLOCKED plans do not consume mutation leases;
- every acquired READY lease is released through the transaction's `finally` path on success, rejection, cancellation, source drift, adapter failure and cleanup-required outcomes.

The default coordinator is process-local memory only. It is **not** claimed to be a distributed lock, a cross-plugin-instance lock or persistence across host restarts. A future real Figma adapter may inject a host-scoped coordinator while preserving the same core ownership contract.

## Receipt integrity gate

Every P14 receipt explicitly carries:

- `acceptanceAuthority: false`;
- `targetCompatibilityClaim: false`.

Receipt validation rejects contradictory/malformed status, candidate, retention, source-fingerprint, error, event, validation and recipe-execution evidence. A recipe result must be exactly one of applied or accepted idempotent no-op. A valid receipt remains evidence only; it is never an Elementor, Gutenberg, framework, publish or production-acceptance claim.

## Safety invariants

1. The approved source node is never passed to recipe mutation callbacks.
2. A P14 transaction never swaps, replaces or deletes the approved source.
3. A candidate cannot reach `PREPARED` without mandatory validation, accepted re-score policy and source-immutability proof.
4. New HIGH/BLOCKER findings caused by preparation reject the candidate.
5. `PREPARED_WITH_REVIEW` requires an explicit policy flag.
6. Failed/cancelled candidates are discarded; discard failure becomes `CLEANUP_REQUIRED`.
7. A no-op plan completes without cloning.
8. Target-neutral preparation does not imply target readiness.
9. Malformed/tampered plans are blocked before adapter access.
10. Eligible recipes require current registry authorization before adapter access.
11. P14 receipts have no acceptance/target-compatibility authority.
12. One executable READY transaction may own a source scope at a time.
13. Acquired transaction leases are released in a bounded `finally` path.

## Deliberately not wired yet

This foundation does **not** add a Figma plugin menu item, UI button, real Figma adapter, production mutating recipe, target-specific profile or target-specific readiness claim.

P13 #159 real-Figma runtime parity remains an open acceptance dependency and P12 #84 remains the final production release gate. P14 must stay implementation-foundation only and the roadmap checkbox must remain unchecked until those acceptance requirements and the later real runtime preparation evidence are genuinely satisfied.
