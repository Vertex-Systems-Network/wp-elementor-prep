# P5 End-to-End Transaction Calibration

Date: 2026-09-08

## Purpose

Prove the intended P5 lifecycle on disposable Figma fixtures before any production Safe Fix action is exposed:

`recipe candidate -> validation -> reject/discard OR commit -> restore/finalize`

No approved customer section was modified. All calibration Frames were created far off-canvas and removed in the same run.

## Fixture design

The calibration used synthetic Frames containing ordinary child Frames plus editable Inter text anchors. The fixtures intentionally contained no image-fill anchors, so image-fill integrity was not exercised in this run; the repository P3 validator still retains image fingerprint checks for real frames.

Validation evidence combined:

- root geometry equality,
- direct child geometry equality,
- text content and section-relative text anchor equality,
- exported PNG byte equality for passing candidates.

A forced failure deliberately moved one candidate text anchor after the recipe transform so both text-anchor and render equality would fail.

## Case 1 — forced validation rejection

Recipe: Vertical Stack.

Flow:

1. Create approved synthetic original.
2. Clone candidate outside normal composition.
3. Apply the strict Vertical Stack Auto Layout recipe.
4. Deliberately move one candidate text node by 8 px.
5. Run P3-equivalent validation.
6. Reject and delete candidate.
7. Re-check approved original.

Result:

- validation passed: `false`
- root geometry still equal: `true`
- direct child geometry still equal: `true`
- text anchors equal: `false` on the intentionally damaged candidate
- rendered PNG exact: `false` on the intentionally damaged candidate
- candidate deleted: `true`
- original remained in same parent/index: `true`
- original root geometry unchanged after rejection: `true`
- original child geometry unchanged after rejection: `true`
- original text anchors unchanged after rejection: `true`
- original PNG unchanged after rejection: `true`

Hashes during forced rejection:

- original: `3618:e18db581`
- rejected candidate: `3619:aea0a2d5`

This proves a validation failure can discard the candidate while leaving the approved original untouched.

## Case 2 — passing recipe, commit, bounded checkpoint, restore

Recipe: Vertical Stack.

Validation result:

- root geometry equal: `true`
- child geometry equal: `true`
- text anchors equal: `true`
- PNG exact: `true`
- original PNG: `3618:e18db581`
- candidate PNG: `3618:e18db581`

Commit evidence:

- validated candidate occupied the recorded approved root slot: `true`
- old original moved to hidden backup: `true`
- backup hidden: `true`
- second-commit policy considered blocked while checkpoint existed: `true`

Restore evidence:

- original returned to the recorded root slot: `true`
- committed candidate removed: `true`
- original root geometry restored exactly: `true`
- original child geometry restored exactly: `true`
- original text anchors restored exactly: `true`
- original PNG restored exactly: `true`

## Case 3 — passing recipe, commit, finalize

Recipe: Horizontal Row.

Validation result:

- root geometry equal: `true`
- child geometry equal: `true`
- text anchors equal: `true`
- PNG exact: `true`
- original PNG: `3133:36b25459`
- candidate PNG: `3133:36b25459`

Finalize evidence:

- committed candidate remained in the approved parent/slot: `true`
- retained old original deleted: `true`
- hidden backup deleted: `true`
- committed candidate still exists: `true`

## Cleanup

Temporary calibration nodes remaining after the run: `0`.

## What this proves

The intended transaction semantics work on disposable text-bearing Figma fixtures:

- candidate-only mutation,
- validation rejection -> discard,
- passing validation -> commit,
- bounded checkpoint before further commit,
- exact restore,
- irreversible finalize,
- no leftover temporary calibration nodes.

## What this does not yet prove

This run used an equivalent disposable validation script inside Figma rather than the compiled plugin `FullFrameValidator` + plugin-UI Canvas broker. Before production Safe Fix exposure, the compiled runtime path must still be exercised through `runSafeFixTransaction` so the exact repository P3 pixel broker is proven end-to-end.

Image-fill anchors were also absent from this synthetic fixture; multi-template real-frame calibration must exercise real images before P5 production exposure.
