# Project State

Last updated: 2026-09-07

## Product

`wp-elementor-prep` is a deterministic Figma plugin that audits and eventually safely refactors approved desktop Figma layouts into structures that map cleanly to WordPress Elementor.

Core runtime must not require generative AI or external network access.

## Current phase

**Phase 1 Audit-Only engine active on branch `feat/p1-audit-engine`.**

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

## In progress

- Issue #2: Audit-Only MVP hardening and golden-fixture calibration.
- Validate new classifier branch in CI.
- Calibrate section discovery/pattern results against the live Marcus Vane golden fixture.

## Not started

- Full decoration/background role classifier beyond conservative full-size background screening.
- Timeline/chapter-specific classifier (#3 scope).
- Visual/integrity validator (#4).
- Transaction clone/rollback engine (#5).
- Safe Auto-Fix recipes (#6).
- Advanced transformations (#7).
- Batch queue (#8).
- Elementor exporter (#9).

## Golden fixture observations

Initial reference desktop:

- 1143 × 18794,
- ~1152 nodes,
- ~715 frame-like nodes,
- ~270 Auto Layout frames,
- ~445 non-Auto-Layout frames,
- ~38% Auto Layout coverage,
- ~433 text nodes.

Known pattern families: two-column, split header, metric grid, timeline chapters, card grids, carousel track, milestones, footer columns, social/link strip.

## Safety status

All current runtime behavior remains read-only. No Auto-Fix mutation behavior is enabled.

## Release target

First useful release: `0.1.x` Audit-Only plugin.
