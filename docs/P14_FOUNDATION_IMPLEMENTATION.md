# P14 Retained-Duplicate Foundation

Status: IMPLEMENTATION FOUNDATION ONLY — RUNTIME UNWIRED  
Issue: #163  
Roadmap: #119  
Dependencies still open: P13 real-Figma acceptance (#159) and final production release gate (#84)

## What this slice implements

This slice turns the frozen P14 specification into a target-neutral deterministic core without exposing a new Figma mutation command.

It adds:

- explicit `P14_SAFE_CANDIDATE` / `P14_SAFE_NOOP` handoff classes;
- versioned preparation recipe definitions with confidence, prerequisite, conflict, mutation-allowlist and validation-profile fields;
- deterministic action ordering and plan digesting;
- fail-closed handling for version mismatches, missing prerequisites, conflicts, review-only and unsupported findings;
- a retained-duplicate transaction state machine that is intentionally separate from the existing P4/P5 swap-style commit semantics;
- candidate-only recipe callbacks;
- mandatory validation and candidate re-score before retention;
- source fingerprint checks before work, immediately before retention and after retention;
- cooperative cancellation checkpoints;
- candidate discard on transform/validation/re-score/finalization/source-drift failure;
- `CLEANUP_REQUIRED` with candidate identity when discard itself fails;
- machine-readable P14 receipts for prepared/no-op/rejected/blocked/cancelled/cleanup-required outcomes.

## Safety invariants

1. The approved source node is never passed to recipe mutation callbacks.
2. A P14 transaction never swaps, replaces or deletes the approved source.
3. A candidate cannot reach `PREPARED` without mandatory validation, accepted re-score policy and source-immutability proof.
4. New HIGH/BLOCKER findings caused by preparation reject the candidate.
5. `PREPARED_WITH_REVIEW` requires an explicit policy flag; it is never the default fallback for failed validation.
6. A failed or cancelled candidate is discarded; a failed discard is surfaced as `CLEANUP_REQUIRED` rather than hidden.
7. A no-op plan completes without cloning.
8. Target-neutral preparation does not imply Elementor/Gutenberg/framework readiness.

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
- persists a bounded P14 receipt;
- proves cancellation and cleanup in real Figma Desktop.

Until that evidence exists, P14 must remain implementation-foundation only and the roadmap checkbox must stay unchecked.
