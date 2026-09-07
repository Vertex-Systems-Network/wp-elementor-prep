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
- image-like nodes: 17
- primary content wrapper discovered: `App`
- section count/order discovered correctly: 16

## Calibrated section results

| Section | Score | Status | Strongest evidence |
|---|---:|---|---|
| SocialStrip | 67 | NEEDS_WORK | horizontal row |
| Identity | 100 | PASS | structured/grid-like internal pattern |
| Recognition | 97 | PASS | vertical stack |
| About | 66 | NEEDS_WORK | two-column, 100% |
| Expertise | 99 | PASS | two-column internally, 100% |
| Philosophy | 54 | NEEDS_WORK | 2×2 grid |
| Journey | 55 | NEEDS_WORK | outer vertical stack, 82% |
| Numbers | 61 | NEEDS_WORK | fragmented 2×3 metric grid + lower two-column |
| Credentials | 96 | PASS | vertical stack |
| Quote | 96 | PASS | vertical stack |
| Testimonials | 96 | PASS | vertical stack |
| Sector | 55 | NEEDS_WORK | 2×2 grid |
| Beyond Work | 62 | NEEDS_WORK | horizontal row/card region |
| Media | 66 | NEEDS_WORK | clipped carousel track, 95% |
| Milestones | 60 | NEEDS_WORK | 2×9 grid |
| Contact | 69 | NEEDS_WORK | horizontal row/column regions |

## Critical calibration fixes confirmed

### Journey false positive removed

The original classifier promoted a tiny aligned child pair to a two-column layout even though it covered only ~18% of its parent. Two-column detection now requires:

- >=55% parent-width coverage,
- each column >=18% of parent width,
- no meaningful overlap.

Live rerun now reports the real outer Journey stack as the strongest pattern instead of the invalid two-column pair.

### Numbers fragmented metric grid recognized

The metric region `3501:575` visually forms a 2×3 grid, but the sixth card is not wrapped as one frame. Live deterministic calibration found:

- 10 direct children,
- 5 repeated full-card anchors,
- 5 fragments belonging to the missing visual cell,
- 2 columns × 3 rows,
- 6 expected slots,
- 1 missing wrapped slot,
- 83% anchor occupancy,
- 100% anchor width consistency,
- 100% anchor height consistency,
- fragmented-grid confidence: 87%.

The lower Numbers region remains a valid independent two-column target at 100% confidence. This confirms the need for multi-target reporting rather than a single best pattern per section.

### Strict grid false-positive hardening

Strict grid detection now requires coherent occupancy and width consistency before returning a normal grid. Irregular scatter falls through to the fragmented-grid classifier where appropriate.

## Calibrated readiness rules

- PASS: score >=80
- REVIEW: score 70–79
- NEEDS_WORK: score <70
- repair recipes are suppressed for PASS sections
- overflow is not an error when a clipped wider carousel track is detected

## CI status

The latest classifier calibration, fragmented-grid support, type guards, tests, and build pass CI on branch `feat/p1-audit-engine`.

## Remaining production calibration gate

Before any automatic design mutation:

1. Run Audit-Only against at least four additional materially different real templates.
2. Record false positives/negatives and tune general rules without hard-coded customer names/node IDs.
3. Build P3 visual/content validator.
4. Build P4 clone/candidate/rollback transaction engine.
5. Only then enable Safe Fix recipes.
