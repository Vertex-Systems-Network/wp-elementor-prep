# P6 Clone-Only Calibration Contract

P6 advanced recipes must earn mutation eligibility through clone-only evidence before any transformer can be connected to the production P4 commit path.

## Allowed lifecycle

`CALIBRATE plan -> clone approved original -> transform clone -> full P3 validate -> discard clone`

There is intentionally **no commit operation** in the P6 calibration adapter.

A passing validation result is evidence only. It does not mutate, replace or authorize mutation of the approved original.

## Fail-closed rules

- Only `AdvancedRecipePlan.decision === CALIBRATE` can start calibration.
- `REVIEW`, `PRESERVE` and `NOOP` plans are skipped without cloning.
- The adapter must return a candidate handle tied to the requested original id.
- Transform failure triggers candidate discard.
- Validation crash triggers candidate discard.
- Validation rejection still triggers candidate discard and is recorded as `REJECTED` evidence.
- Validation pass still triggers candidate discard and is recorded as `PASSED` evidence.
- Candidate discard failure returns `FAILED` with `leftoverCandidateRisk: true`; production wiring must remain blocked until the leftover is inspected/removed.
- `productionCommitAttempted` is always `false`.

## What this proves

The core harness proves the calibration state machine cannot accidentally reach a production commit and that cleanup behavior is explicit across pass/reject/failure cases.

It does **not** yet prove any specific advanced Figma transformer is safe.

## Remaining per-recipe evidence

Before a P6 recipe can be connected to P4, each recipe still needs:

1. a Figma clone transformer that consumes the corresponding `AdvancedRecipePlan`,
2. synthetic golden fixtures,
3. image-bearing real-template clones,
4. full P3 visual/content exactness evidence,
5. preservation evidence for every `preserveNodeIds` relationship,
6. zero leftover candidate nodes across pass/reject/failure calibration,
7. explicit production transaction integration review.

Initial priorities should be the least structurally invasive recipes first. `page-vertical-flow` and simple milestone structures are better calibration candidates than fragmented-card synthesis or carousel/timeline relationships, which should remain REVIEW/PRESERVE until their wrapper/overflow semantics are proven.
