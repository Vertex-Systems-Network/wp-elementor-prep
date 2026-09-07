# Golden Fixture Calibration — Marcus Vane

Date: 2026-09-07  
Fixture: `Desktop — Elementor Ready` (1143 × 18794)

This document records live Figma calibration results for the Audit-Only engine. The production engine must not hard-code these node IDs or section names.

## Root scan

- nodes: 1152
- containers: 715
- Auto Layout containers: 270
- manual containers: 445
- Auto Layout coverage: 38%
- text nodes: 433
- auto-height text nodes: 433
- image-like nodes: 17
- primary content wrapper discovered: `App`
- section count/order discovered correctly: 16

## Calibrated section results

After the stricter two-column gate and PASS/REVIEW/NEEDS_WORK threshold calibration, the live read-only rerun produced:

| Section | Calibrated score | Status | Strongest evidence |
|---|---:|---|---|
| SocialStrip | 67 | NEEDS_WORK | horizontal row, 90% |
| Identity | 100 | PASS | grid-like internal structure, 90% |
| Recognition | 97 | PASS | vertical stack, 82% |
| About | 66 | NEEDS_WORK | two-column, 100% |
| Expertise | 99 | PASS | two-column internally, 100% |
| Philosophy | 54 | NEEDS_WORK | 2×2 grid, 91% |
| Journey | 55 | NEEDS_WORK | vertical stack, 82% |
| Numbers | 61 | NEEDS_WORK | lower two-column, 100%; metric grid requires multi-pattern reporting |
| Credentials | 96 | PASS | vertical stack, 78% |
| Quote | 96 | PASS | vertical stack, 74% |
| Testimonials | 96 | PASS | vertical stack, 74% |
| Sector | 55 | NEEDS_WORK | 2×2 grid, 91% |
| Beyond Work | 62 | NEEDS_WORK | horizontal row, 81% |
| Media | 66 | NEEDS_WORK | carousel track, 95%, overflow intentionally preserved |
| Milestones | 60 | NEEDS_WORK | 2×9 grid, 100% |
| Contact | 69 | NEEDS_WORK | horizontal row internally, 84% |

## Calibration conclusions

### Confirmed working behavior

1. Section discovery correctly finds `App` and all 16 sections in correct Y order without requiring section-name logic.
2. Strong sections cluster at approximately 96–100 and classify PASS.
3. Weak/manual sections classify NEEDS_WORK under the calibrated threshold.
4. About exposes a high-confidence two-column target.
5. Philosophy and Sector expose 2×2 grids.
6. Media exposes a clipped wider carousel track instead of treating overflow as an error.
7. Milestones exposes a repeated 2×9 structure.
8. The previous Journey false-positive two-column was removed by requiring meaningful parent coverage and column widths; Journey now reports its real outer vertical stack as strongest evidence.

### Remaining limitation being addressed

One-best-pattern is insufficient for complex sections. Numbers contains a metric grid plus a lower two-column region. The engine is being upgraded to return multiple target-level detections per section while retaining the strongest detection for backwards compatibility.

## Calibrated rules

- PASS: score >=80
- REVIEW: score 70–79
- NEEDS_WORK: score <70
- two-column requires >=55% parent-width coverage
- each column must be >=18% of parent width
- normal two-column candidates must not overlap
- repair recipe is suppressed when section status is PASS

## P1 remaining work

- validate multi-pattern reporting in CI and against the live Numbers section,
- keep split-header and timeline/chapter regression fixtures,
- test Audit-Only on at least four more materially different real templates,
- keep runtime read-only until validator and transaction safety phases are implemented.
