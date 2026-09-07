# Project State

Last updated: 2026-09-07

## Product

`wp-elementor-prep` is a deterministic Figma plugin that audits and eventually safely refactors approved desktop Figma layouts into structures that map cleanly to WordPress Elementor.

Core runtime must not require generative AI or external network access.

## Current phase

**Phase 1 Audit-Only engine active on branch `feat/p1-audit-engine`; golden-fixture calibration is stable and multi-pattern reporting is being added.**

## Completed

- Phase 0 foundation merged to `main` via PR #1.
- Product direction, deep audit, architecture, feature plan and pre-development plan established.
- Mandatory AI-native memory-bank implemented.
- TypeScript/Figma plugin scaffold implemented.
- Read-only scanner/scoring/report UI implemented.
- CI/test/build pipeline verified green after fixing SceneNode opacity typing.
- Roadmap issues #2–#9 created.
- Deterministic detection implemented for two-column, grid, horizontal row, vertical stack and carousel-track patterns.
- Detection confidence/evidence payloads implemented.
- Live Marcus Vane golden-frame audit correctly discovers `App` and all 16 sections in order.
- Calibrated score thresholds classify strong sections PASS and weak/manual sections NEEDS_WORK.
- Stricter two-column gate removed the Journey false-positive; Journey now reports outer vertical-stack evidence instead.
- About, Philosophy, Sector, Media and Milestones pattern evidence remains useful after calibration.
- Repair recipe suppression is active for already-PASS sections.

## In progress

- Issue #2 / draft PR #10: Audit-Only MVP hardening.
- Multi-pattern reporting so complex sections expose multiple target-level detections.
- Tests for complex Numbers-style sections, split-header-style pairs and timeline/chapter structures.
- Audit UI expansion to show multiple detected targets.

## Not started

- Full decoration/background role classifier beyond conservative full-size background screening.
- Dedicated timeline/chapter semantic classifier (#3 broader scope).
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
- 433 text nodes
- 17 image-like nodes
- 16 content sections under `App`

See `docs/GOLDEN_CALIBRATION.md` for section-by-section calibration.

## Safety status

All current runtime behavior remains read-only. No Auto-Fix mutation behavior is enabled.

## Release target

First useful release: `0.1.x` Audit-Only plugin.
