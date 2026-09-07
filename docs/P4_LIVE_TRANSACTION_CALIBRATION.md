# P4 Live Transaction Calibration

Date: 2026-09-08

## Purpose

Prove the P4 root-transaction mechanics on isolated synthetic Figma Frames without touching approved production sections.

All calibration nodes were created far off-canvas, exercised inside the connected Figma file, and deleted in the same run. Final leftover count was zero.

## Calibration 1 — forced transform failure and cleanup

Synthetic structure:

`Parent -> Approved Original -> Marker`

Recorded original state before the forced failure:

- root position: `x=80`, `y=90`,
- root size: `420 × 240`,
- sibling index: `0`,
- child count: `1`,
- child name: `Marker`,
- original parent unchanged.

A cloned candidate was staged outside the parent, intentionally resized, then a forced transform failure was raised and the candidate was discarded.

Observed result:

- approved original unchanged: PASS,
- original sibling index unchanged: PASS,
- failed candidate removed: PASS,
- original still in approved parent: PASS,
- temporary-node cleanup: PASS (`0` leftovers).

This directly demonstrates the key P4 invariant that a candidate-side failure does not mutate the working original.

## Calibration 2 — manual-layout root swap and undo

A no-op/equivalent candidate was inserted into the approved root slot, while the original root was moved into an invisible backup Frame. The operation was then undone.

Observed commit state:

- candidate occupied the recorded original sibling slot: PASS,
- original moved into backup root: PASS.

Observed undo state:

- original restored to recorded parent/index: PASS,
- original root geometry/name/lock/child structure restored exactly: PASS,
- committed candidate removed: PASS,
- empty backup removed: PASS,
- temporary-node cleanup: PASS (`0` leftovers).

## Calibration 3 — Auto Layout parent swap and undo

A synthetic vertical Auto Layout parent was created with three root children:

`Before -> Approved AutoLayout Original -> After`

The original child used `layoutAlign=STRETCH`, `layoutGrow=0`, `layoutPositioning=AUTO`. Its resolved geometry before swap was:

- `x=50`, `y=124`,
- `width=600`, `height=180`,
- sibling index `1`.

The candidate was first staged top-level, then inserted at the original index. Parent-contextual Auto Layout child properties were copied **after insertion**, matching the Figma Plugin API requirement.

Observed commit state:

- candidate at expected index: PASS,
- before/after sibling ordering preserved: PASS,
- `layoutAlign` preserved: PASS,
- `layoutGrow` preserved: PASS,
- `layoutPositioning` preserved: PASS,
- resolved root geometry preserved: PASS,
- original moved to backup: PASS.

Observed undo state:

- original restored at expected index: PASS,
- exact sibling order restored: PASS,
- Auto Layout child properties restored: PASS,
- resolved root geometry restored: PASS,
- temporary-node cleanup: PASS (`0` leftovers).

## Engineering conclusion

The live synthetic calibration supports the P4 root-boundary strategy:

`clone -> candidate-only transform -> validate -> root swap OR discard`

Both ordinary/manual and Auto Layout parent behavior were exercised. Failed candidates can be removed without affecting the original, and a successful root swap can retain the original in a bounded backup and restore it exactly.

## Safety limits

This calibration does not enable P5 recipes. It proves transaction mechanics only. Production Safe Fix must still:

- transform only the staged candidate,
- require a passing P3 report before commit,
- keep ambiguous/low-confidence layouts in REVIEW,
- preserve a bounded undo checkpoint,
- never replay unvalidated descendant mutations onto the approved original.
