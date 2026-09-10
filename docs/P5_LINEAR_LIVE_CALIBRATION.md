# P5 Linear Recipe Live Calibration

Date: 2026-09-08

## Purpose

Calibrate the first P5 candidate-only Auto Layout transforms against the real Figma Plugin API without touching approved production design nodes.

All calibration Frames were disposable synthetic fixtures created far off-canvas in the connected Figma file and deleted in the same run.

Recipes exercised:

- Vertical Stack
- Horizontal Row
- Two Column

## Safety boundary

The calibration modified only cloned/synthetic candidate Frames. It did not alter an approved customer section and does not by itself enable production Safe Fix.

## Calibration 1 — transition-size failure discovered

The first run reproduced an important Figma behavior: assigning `layoutMode` to a manual Frame can immediately switch the primary axis into content-driven sizing before the subsequent fixed sizing settings are fully established.

Observed first-run drift:

| Recipe | Original bounds | Candidate bounds after initial transform |
|---|---:|---:|
| Vertical Stack | `420 × 360` | `420 × 210` |
| Horizontal Row | `560 × 220` | `360 × 220` |
| Two Column | `620 × 300` | `490 × 300` |

Child geometry itself remained at its original positions/sizes, but the root candidate Frame shrank. The PNG render therefore changed and would correctly fail P3 root/pixel validation.

This was treated as a recipe bug, not as an acceptable tolerance.

## Fix

The linear transform now:

1. records candidate target width/height before enabling Auto Layout,
2. sets the requested Auto Layout direction,
3. sets primary/counter sizing modes to `FIXED`,
4. applies measured padding and item gap,
5. restores the exact recorded Frame width/height with `resize()`.

The transform still does not reorder layers.

## Calibration 2 — post-fix exact render equivalence

After the size-preservation fix, all three recipes were re-run on fresh synthetic fixtures.

### Vertical Stack

Original/candidate bounds:

`420 × 360`

Children before and after:

- A: `x=40, y=30, 300 × 60`
- B: `x=40, y=110, 300 × 80`
- C: `x=40, y=210, 300 × 70`

Result:

- candidate layout mode: `VERTICAL`
- root bounds preserved: PASS
- child geometry preserved exactly: PASS
- exported PNG exact byte match: PASS
- original PNG hash: `1991:fc5b25d0:56432610`
- candidate PNG hash: `1991:fc5b25d0:56432610`

### Horizontal Row

Original/candidate bounds:

`560 × 220`

Children before and after:

- A: `x=30, y=40, 120 × 110`
- B: `x=170, y=40, 140 × 110`
- C: `x=330, y=40, 100 × 110`

Result:

- candidate layout mode: `HORIZONTAL`
- root bounds preserved: PASS
- child geometry preserved exactly: PASS
- exported PNG exact byte match: PASS
- original PNG hash: `1605:91f4b947:a5b5e509`
- candidate PNG hash: `1605:91f4b947:a5b5e509`

### Two Column

Original/candidate bounds:

`620 × 300`

Children before and after:

- Left: `x=40, y=35, 240 × 210`
- Right: `x=310, y=35, 250 × 210`

Result:

- candidate layout mode: `HORIZONTAL`
- root bounds preserved: PASS
- child geometry preserved exactly: PASS
- exported PNG exact byte match: PASS
- original PNG hash: `1872:18640bfc:5135a1c0`
- candidate PNG hash: `1872:18640bfc:5135a1c0`

## Cleanup evidence

Both the failed first calibration and successful second calibration deleted every disposable calibration node before finishing.

Final temporary-node count after the successful run:

`0`

## Engineering conclusion

The strict linear recipe geometry is capable of converting a compatible manual layout into Auto Layout while preserving the rendered output exactly on the controlled fixtures.

The discovered root-shrink behavior validates why P5 cannot rely only on classifier confidence: candidate transformation must be followed by P3 geometry/content/pixel validation before P4 can commit.

## Remaining gate

Before any linear recipe is considered production-capable, P5 must still prove the complete orchestration path:

`candidate transform -> full P3 validation -> P4 discard on rejection OR commit on pass -> bounded undo/finalize`

This calibration proves transform-level equivalence only; it does not bypass P3 or P4.
