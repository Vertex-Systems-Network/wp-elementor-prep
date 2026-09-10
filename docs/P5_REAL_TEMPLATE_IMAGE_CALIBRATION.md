# P5 Real-Template Image-Bearing Calibration

Date: 2026-09-08

## Purpose

Move P5 beyond synthetic fixtures by calibrating conservative layout transforms on cloned sections taken from materially different real desktop templates in the connected Nova Designs Figma file.

The approved source sections were never transformed. Each target was cloned, moved off-canvas, transformed on the clone only, validated against its own pre-transform clone render/geometry, and deleted before the run ended.

## Selection rule

A read-only scan searched desktop roots for manual Frames that already described an unambiguous P5-compatible layout and contained real image fills.

Eligible calibration candidates required:

- `layoutMode = NONE`,
- at least two visible direct children,
- no visible absolute-positioned direct child,
- layer order already equal to visual flow order,
- for linear targets: aligned cross-axis origins, uniform primary-axis gaps, no overlap, in-bounds geometry,
- for grid targets: complete rectangular occupancy, row-major order, consistent fixed track sizes, uniform gaps, in-bounds geometry,
- at least one image fill in the target subtree.

## Calibration set

Six image-bearing sections from six different desktop roots were tested.

| Desktop root | Source node | Recipe geometry | Images | Result |
|---|---|---:|---:|---|
| `2 - Desktop` | `2431:18435` | Horizontal | 1 | PASS |
| `3 - Desktop` | `2431:20032` | Grid | 6 | PASS |
| `4 - Desktop` | `2431:21512` | Horizontal | 3 | PASS |
| `8 - Desktop` | `2431:26203` | Grid | 6 | PASS |
| `11 - Desktop` | `2431:32022` | Grid | 6 | PASS |
| `13 - Desktop` | `2431:34905` | Horizontal | 3 | PASS |

## Evidence

Every target passed all of the following:

- root size exact after transform,
- direct-child geometry exact after transform,
- image-fill count preserved,
- exported PNG bytes exactly identical before/after transform,
- approved original parent/index/root/direct-child geometry unchanged,
- approved original exported PNG bytes unchanged,
- temporary calibration nodes remaining: `0`.

### Exact render hashes

- `2 - Desktop / 2431:18435`: `496644:6426ed21:3c3ce42`
- `3 - Desktop / 2431:20032`: `813916:85a7e2e8:64426f3`
- `4 - Desktop / 2431:21512`: `518398:3d80b76f:3f4b5e4`
- `8 - Desktop / 2431:26203`: `786877:98dec2b3:61043d0`
- `11 - Desktop / 2431:32022`: `1071709:2e72235f:8279eae`
- `13 - Desktop / 2431:34905`: `652400:d87ee7b5:4fb95be`

The hash is a compact calibration fingerprint derived from the exported PNG bytes. Equality was determined by full byte-for-byte PNG comparison, not by the hash alone.

## Safety conclusion

The conservative horizontal and fixed-grid transforms now have exact render-equivalence evidence on real, image-bearing sections across six materially different desktop roots in addition to synthetic fixtures.

This closes the P5 multi-template image-bearing calibration gate for the currently supported linear/grid mutation primitives.

Production Safe Fix remains disabled because one critical runtime gate is still manual: the imported development plugin must execute the compiled `runSafeFixTransaction -> FullFrameValidator -> UI Canvas pixel broker -> P4` self-test successfully. The developer self-test harness is already implemented in `src/plugin/p5-runtime-calibration.ts` and exposed through `Developer: P5 Runtime Self-Test`.
