# Project State

Last updated: 2026-09-07

## Product

`wp-elementor-prep` is a deterministic Figma plugin that audits and eventually safely refactors approved desktop Figma layouts into structures that map cleanly to WordPress Elementor.

Core runtime must not require generative AI or external network access.

## Current phase

**Phase 1 Audit-Only engine active on branch `feat/p1-audit-engine`; live golden-fixture calibration completed.**

## Completed

- Phase 0 foundation merged to `main` via PR #1.
- Product direction, deep audit, architecture, feature plan and pre-development plan established.
- Mandatory AI-native memory-bank implemented.
- TypeScript/Figma plugin scaffold implemented.
- Read-only scanner/scoring/report UI implemented.
- CI/test/build pipeline verified green.
- Roadmap issues #2–#9 created.
- P1 deterministic pattern-classifier foundation implemented for two-column, grid, horizontal row, vertical stack and carousel-track detection.
- P1 detection evidence/confidence payload added.
- P1 unit tests added for two-column, 2x3 grid, background exclusion and carousel overflow.
- Live Figma calibration on the Marcus Vane golden frame correctly discovered `App` and all 16 sections in order.
- Live calibration showed strong sections at ~96–100 and weak/manual sections at ~51–68 under the initial score model.
- Live calibration correctly recognized About two-column, Philosophy/Sector 2x2 grids, Media carousel overflow, and Milestones 2x9 grid.
- Journey exposed a false-positive two-column detection caused by only 18% parent-width coverage; stricter coverage/column-width gating has been prepared.
- Screening status thresholds prepared as PASS >=80, REVIEW 70–79, NEEDS_WORK <70.
- Repair recipe suppression prepared for already-PASS sections.

## In progress

- Issue #2: Audit-Only MVP hardening.
- Draft PR #10.
- Commit calibrated classifier/scoring fixes and rerun CI.
- Rerun live calibration after stricter two-column logic.
- Expand from one-best-pattern to multi-pattern findings for complex sections such as Numbers.

## Not started

- Full decoration/background role classifier beyond conservative full-size background screening.
- Timeline/chapter-specific classifier (#3 scope).
- Visual/integrity validator (#4).
- Transaction clone/rollback engine (#5).
- Safe Auto-Fix recipes (#6).
- Advanced transformations (#7).
- Batch queue (#8).
- Elementor exporter (#9).

## Golden fixture facts

- 1143 × 18794
- 1152 nodes
- 715 container-like nodes
- 270 Auto Layout containers
- 445 manual containers
- 38% Auto Layout coverage
- 433 text nodes, all 433 currently auto-height in the working duplicate
- 17 image-like nodes
- 16 content sections under `App`

See `docs/GOLDEN_CALIBRATION.md` for section-by-section calibration.

## Safety status

All current runtime behavior remains read-only. No Auto-Fix mutation behavior is enabled.

## Release target

First useful release: `0.1.x` Audit-Only plugin.
