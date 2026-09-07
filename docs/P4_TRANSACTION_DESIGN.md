# P4 Candidate Transaction Design

Date: 2026-09-08

## Goal

P4 guarantees that an experimental refactor cannot damage the approved working section. The transaction boundary is:

`clone -> transform candidate -> validate -> commit/swap OR discard`

P4 is infrastructure. It does not choose layout recipes; P5 owns confidence-gated Safe Fix recipes.

## Core invariant

The approved original root is never passed to the transformer. Only a staged candidate can be transformed.

A transaction may reach root commit only after the injected P3 validator returns `passed: true`.

## State machine

Core states:

- `IDLE`
- `CLONING`
- `TRANSFORMING`
- `VALIDATING`
- `DISCARDING`
- `COMMITTING`
- `COMMITTED`
- `REJECTED`
- `FAILED`

Every transaction returns a small serializable event journal for audit/debugging.

## Candidate handle

The transaction core tracks root-level references only:

- approved `originalNodeId`,
- temporary `candidateNodeId`.

Descendant IDs and wrapper trees are intentionally not transaction identity. P3 compares content, section-relative geometry and rendered output independently of wrapper IDs.

## Failure behavior

### Clone fails

No candidate exists and commit cannot occur.

### Transform fails

The candidate is discarded. The approved original remains untouched.

### Validation crashes or rejects

The candidate is discarded. The approved original remains untouched. Commit is unreachable.

### Discard fails

The transaction fails explicitly with `failureStage: discard`; it does not continue to commit.

### Commit fails

The core does not blindly delete the candidate after commit begins because the adapter may have crossed the root-swap boundary. The Figma adapter performs local rollback inside `commitCandidate()` and reports a combined error if rollback itself fails.

## Concrete Figma adapter

`FigmaCandidateTransactionAdapter` implements the root transaction against the Figma Plugin API.

### Clone/staging

1. resolve the approved root Frame and ordered parent,
2. reject roots inside a component Instance,
3. record parent ID, sibling index, root x/y, name and lock state,
4. clone the original root,
5. immediately reparent the clone to the current Page,
6. move it to a far off-layout staging coordinate,
7. lock it between transaction stages,
8. keep only small in-memory candidate metadata.

This removes the candidate from the approved parent layout before transformation.

### Transform

The candidate is temporarily unlocked and passed to the injected recipe callback. The original node is not provided to that callback.

### Validate

The adapter resolves original + candidate roots and invokes the injected full P3 validator. P5 callers are responsible for providing the complete required P3 policy, including rendered pixel evidence when a commit is possible.

### Commit/root swap

After validation passes:

1. reject the commit if a previous single-step undo checkpoint is still pending,
2. re-resolve candidate/original/parent,
3. verify transaction identity and reject stale metadata,
4. verify the original has not moved from the recorded parent,
5. create an invisible top-level backup Frame,
6. insert the validated candidate at the recorded sibling index,
7. copy parent-contextual root child layout properties **after insertion** (`layoutAlign`, `layoutGrow`, `layoutPositioning`),
8. restore recorded x/y for non-Auto-Layout parents,
9. move the previous approved original into the backup Frame,
10. store a compact single-step undo token in `figma.clientStorage`,
11. emit small `CommitEvidence`.

No descendant edits are replayed onto the approved original.

## Commit rollback

If any commit step throws, the adapter attempts to:

- clear a newly written undo token if necessary,
- put the original back at its recorded parent/index/x/y,
- move the candidate back to staging if it had entered the parent,
- remove an empty backup Frame.

If rollback also throws, both errors are surfaced explicitly.

## Bounded undo checkpoint

The implemented token format is a compact opaque root reference:

`p4v1|originalNodeId|committedNodeId|parentNodeId|siblingIndex|x|y|backupFrameId`

It contains no PNG data, no serialized subtree and no full design snapshot.

The adapter deliberately permits **one pending checkpoint only**. A second commit is rejected until the existing checkpoint is either restored or explicitly finalized. This prevents invisible backup accumulation and makes rollback state unambiguous.

`hasPendingUndo()` reports whether a checkpoint is active.

`restoreLastCommit()` validates that:

- the retained original still exists in the expected backup,
- the committed candidate still exists in the expected parent.

It then restores the original root at the recorded slot/geometry, removes the committed candidate, removes the empty backup and clears the clientStorage token.

`finalizeLastCommit()` is the explicit irreversible acceptance path. It validates that the retained original is still in the expected backup, removes that backup/original, clears the token and leaves the committed candidate as the approved root.

## Automated test evidence

The pure transaction engine uses an in-memory adapter fixture to prove:

- forced transform failure leaves the approved original unchanged,
- rejected P3 validation leaves the approved original unchanged,
- validator crashes discard the candidate,
- failed candidates are discarded,
- commit is never called after transform/validation failure,
- passing validation permits commit,
- successful commit returns small audit evidence,
- cleanup failures are explicit,
- commit-stage errors are separated from pre-commit failures.

## Live Figma evidence

Disposable off-canvas synthetic Frames were used to test actual Figma root mechanics; all temporary nodes were removed afterward.

Confirmed:

- forced candidate failure leaves original root/index/geometry/content unchanged,
- failed candidate cleanup succeeds,
- manual-parent root swap + undo restores exactly,
- vertical Auto Layout parent root swap preserves sibling order and root layout behavior,
- Auto Layout `layoutAlign`, `layoutGrow` and `layoutPositioning` are preserved when copied after insertion,
- resolved root geometry is preserved through swap and restored through undo,
- calibration cleanup leaves `0` temporary nodes.

See `docs/P4_LIVE_TRANSACTION_CALIBRATION.md`.

## Safety gate before P5

P4 proves the transaction boundary, not recipe correctness. P5 may only mutate when:

- the target classification is high confidence,
- the recipe transforms the staged candidate only,
- full P3 validation passes,
- commit goes through this P4 root transaction,
- any previous undo checkpoint is explicitly restored or finalized before another commit,
- ambiguous/low-confidence cases remain REVIEW.
