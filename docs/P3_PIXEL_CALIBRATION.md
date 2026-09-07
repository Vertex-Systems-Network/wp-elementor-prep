# P3 Pixel Calibration

Date: 2026-09-08

## Purpose

Record the first live, read-only calibration of section-level PNG export stability for the P3 validator. This does not mutate Figma nodes and does not authorize Safe Fix.

## Runtime policy

The validator caps the longest rendered edge at 2048 px. Sections smaller than that render at 1x; taller/larger sections are proportionally downscaled before PNG decoding and pixel comparison.

Current `p3-v1` pixel thresholds:

- per-channel tolerance: 8 / 255,
- maximum changed pixels: 0.5%,
- maximum mean channel delta: 0.5.

These values are versioned and may be recalibrated before P5.

## Live no-op export calibration

Representative sections from the Marcus golden file were exported twice with the same production render-scale rule. The two PNG byte streams matched exactly in every case.

| Section | Natural size | Render scale | PNG bytes | Exact repeat match |
|---|---:|---:|---:|---|
| About (`sec/about`) | 1143 × 975.21 | 1.0000 | 344,125 | PASS |
| Journey (`sec/journey`) | 1143 × 5016.34 | 0.408265 | 745,857 | PASS |
| Contact (`sec/contact`) | 1143 × 761.88 | 1.0000 | 54,383 | PASS |

For all three sections:

- repeated export hash matched,
- byte length matched,
- differing byte count was 0.

This demonstrates deterministic no-op PNG export behavior on both ordinary-size and capped-scale tall sections in the current calibration file.

## Synthetic drift coverage

Unit fixtures separately prove:

- exact pixel buffers produce zero drift,
- per-channel differences inside tolerance do not mark a pixel changed,
- a channel change beyond tolerance marks the pixel changed,
- dimension mismatch fails explicitly,
- visual drift above the changed-pixel threshold fails explicitly,
- malformed RGBA buffer lengths fail explicitly.

## Safety interpretation

A no-op render passing is necessary but not sufficient for future mutation safety. P4 must still guarantee `clone -> transform candidate -> validate -> commit/swap OR discard`, and a forced failed candidate must leave the approved working section untouched.
