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

## Section calibration

| Section | Auto Layout | Initial score | Manual expectation | Pattern evidence |
|---|---:|---:|---|---|
| SocialStrip | 38% | 64 | needs cleanup | horizontal row, 90% |
| Identity | 100% | 100 | pass | existing structured pattern |
| Recognition | 100% | 97 | pass | vertical stack |
| About | 33% | 60 | needs work | two-column, 100% |
| Expertise | 100% | 96 | pass | two-column found internally |
| Philosophy | 13% | 51 | needs work | 2×2 grid, 91% |
| Journey | 23% | 55 | needs work | **false-positive two-column found at 85% due only 18% parent-width coverage** |
| Numbers | 25% | 56 | needs work | two-column found in lower region; primary metrics grid needs richer multi-pattern reporting |
| Credentials | 100% | 96 | pass | vertical stack |
| Quote | 100% | 96 | pass | vertical stack |
| Testimonials | 100% | 96 | pass | vertical stack |
| Sector | 13% | 51 | needs work | 2×2 grid, 91% |
| Beyond Work | 36% | 62 | needs work | horizontal row/card region |
| Media | 39% | 63 | needs work | carousel track, 95%, overflow intentionally preserved |
| Milestones | 27% | 57 | needs work | 2×9 grid, 100% |
| Contact | 44% | 68 | needs work | two-column found internally |

## Calibration conclusions

### What worked

1. Section discovery correctly found `App` and all 16 sections in correct Y order without requiring section-name logic.
2. Strong sections clustered at ~96–100.
3. Weak/manual sections clustered at ~51–68.
4. About correctly exposed a high-confidence two-column recipe candidate.
5. Philosophy and Sector correctly exposed 2×2 grid candidates.
6. Media correctly detected a clipped wider carousel track rather than treating overflow as a layout error.
7. Milestones correctly revealed a repeated two-column, nine-row structure.

### Required fixes discovered

1. `NEEDS_WORK` threshold should be raised so weak 51–68 sections are not incorrectly presented as mostly-ready. Calibration target: PASS >=80, REVIEW 70–79, NEEDS_WORK <70 for current screening model.
2. Two-column detection must reject tiny aligned child pairs that cover too little of the parent. Journey exposed a false high-confidence result with only 18% parent-width coverage.
3. `recommendedRecipe` should be suppressed for already-PASS sections; recognizing an internal pattern does not mean a repair is needed.
4. One-best-pattern is insufficient for complex sections. Numbers contains both a metric-grid problem and another two-column region. Future reporting should support multiple pattern findings/targets per section rather than letting a 100%-confidence secondary pattern hide the primary weak structure.
5. Identity’s internal structure can look grid-like even though the section is already compliant. Detection is useful evidence but should not trigger a fix when readiness is PASS.

## Changes applied after calibration

- stricter two-column width/coverage gate added,
- screening status threshold changed to NEEDS_WORK <70,
- repair recipe hidden for PASS sections,
- regression test added for tiny aligned children false-positive.

## Remaining P1 calibration work

- rerun after stricter two-column logic,
- add multi-pattern finding model,
- add split-header fixture,
- add timeline/chapter fixture,
- test at least four more materially different real templates before mutation work.
