# P5 Semantic + Simple Grid Live Calibration

Date: 2026-09-08

## Purpose

Calibrate the next conservative P5 Safe Fix recipes on disposable Figma fixtures after the base Vertical Stack / Horizontal Row / Two Column recipes had already passed exact render-equivalence checks.

No approved customer section was modified. Every calibration Frame was created far off-canvas and removed in the same run.

## Facts List

Contract:

- semantic hint: `facts-list`
- underlying geometry: `vertical-stack`
- confidence gate: >= 92%
- target must still pass the shared strict linear geometry preflight
- transform direction: `VERTICAL`

Disposable fixture:

- 5 broad text-bearing fact item Frames
- equal horizontal origin
- uniform 16 px vertical gap
- no absolute children
- complete ordinary-flow content

Result:

- target root geometry exact: `true`
- direct child geometry exact: `true`
- exported PNG bytes exact: `true`
- candidate layoutMode: `VERTICAL`
- exact repeated PNG hash: `4805:c1887f4a`
- temporary nodes left: `0`

## Footer Columns

Contract:

- semantic hint: `footer-columns`
- underlying geometry: `horizontal-row`
- confidence gate: >= 92%
- target must still pass the shared strict linear geometry preflight
- transform direction: `HORIZONTAL`

Disposable fixture:

- shallow lower-section row
- 4 text-bearing column Frames
- equal vertical origin
- uniform horizontal gap
- no absolute children

Result:

- target root geometry exact: `true`
- direct child geometry exact: `true`
- exported PNG bytes exact: `true`
- candidate layoutMode: `HORIZONTAL`
- exact repeated PNG hash: `3225:3421c31e`
- temporary nodes left: `0`

## Simple Card Grid

The first grid recipe is intentionally stricter than the audit classifier.

Production eligibility still requires:

- geometric pattern: `grid`
- semantic hint: `repeated-cards`
- confidence >= 94%
- `fragmentedCellCandidate !== true`

The mutation preflight additionally requires:

- every direct child visible,
- no direct absolute child,
- at least 2 columns and 2 rows,
- complete rectangular occupancy with exactly one direct child per cell,
- layer order already equals row-major visual order,
- each column has a consistent fixed width within 1 px,
- each row has a consistent fixed height within 1 px,
- one consistent column gap and one consistent row gap within 1 px,
- all geometry remains inside the target Frame.

The transformer uses Figma GRID Auto Layout with:

- `layoutMode = GRID`
- `gridAutoTracks = NONE`
- `gridItemsPositioning = ROW_AUTO_FLOW`
- explicit row/column counts
- explicit row/column gaps
- measured frame padding
- fixed row and column track sizes
- exact root width/height restoration after the transition
- immediate direct-child geometry guard before P3

Disposable 2x2 text-bearing fixture:

- root: `540 x 360`
- columns: `2`
- rows: `2`
- fixed column tracks: `210, 210`
- fixed row tracks: `130, 130`
- column gap: `40`
- row gap: `30`
- padding: top `30`, right `40`, bottom `40`, left `40`

Result:

- root + direct child geometry exact: `true`
- exported PNG bytes exact: `true`
- candidate layoutMode: `GRID`
- exact repeated PNG hash: `4476:6ba2b3ec`
- temporary nodes left: `0`

## Additional engineering hardening completed in this pass

- Safe Fix preview now consumes the semantic/ranked classifier pipeline from `classification.ts`, not the raw geometry-only classifier. This is required for Facts List, Footer Columns and Repeated Cards to reach P5 planning.
- The out-of-bounds linear-layout regression fixture was corrected so it reaches the intended bounds check instead of failing earlier on non-uniform gaps.
- `linearDirectionForSafeRecipe()` now refuses malformed semantic/geometric combinations.
- Simple Card Grid has a pure deterministic geometry analyzer and regression fixtures before Figma mutation.

## Safety conclusion

Facts List, Footer Columns and Simple Card Grid now have exact synthetic render-equivalence evidence. This does **not** yet make general Safe Fix production-ready. The compiled `runSafeFixTransaction -> FullFrameValidator -> plugin UI pixel broker -> P4` path and real multi-template image-bearing mutation calibration remain required gates.
