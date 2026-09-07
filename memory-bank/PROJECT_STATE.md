# Project State

Last updated: 2026-09-07

## Product

`wp-elementor-prep` is a deterministic Figma plugin that audits and eventually safely refactors approved desktop Figma layouts into structures that map cleanly to WordPress Elementor.

Core runtime must not require generative AI or external network access.

## Current phase

**Phase 0 foundation complete on PR #1; Phase 1 Audit-Only scaffold started.**

## Completed

- Product direction established.
- Deep technical/product audit completed.
- AI-native development model defined.
- Mandatory memory-bank architecture implemented.
- Elementor-readiness rules documented.
- Feature roadmap and pre-development plan documented.
- Initial TypeScript/Figma plugin scaffold implemented.
- Initial read-only scanner/scoring/report UI implemented.
- CI/test/build scaffold implemented.
- CI run #1 passed: install, typecheck, tests, and build all successful.
- Roadmap issues #2–#9 created for P1–P8.

## In progress

- PR #1 review/merge.
- Issue #2: Audit-Only MVP hardening and golden-fixture calibration.

## Not started

- Geometric classifier recipes (#3).
- Visual/integrity validator (#4).
- Transaction clone/rollback engine (#5).
- Safe Auto-Fix recipes (#6).
- Advanced timeline/carousel/milestone recipes (#7).
- Batch queue for 60+ frames/pages (#8).
- Elementor JSON exporter adapters (#9).

## Golden fixture observations

Initial reference desktop:

- 1143 × 18794,
- ~1152 nodes,
- ~715 frame-like nodes,
- ~270 Auto Layout frames,
- ~445 non-Auto-Layout frames,
- ~38% Auto Layout coverage,
- ~433 text nodes.

Strong structured sections exist alongside weak ones; therefore the plugin must support `PASS/no change` as a first-class outcome.

Known pattern families include two-column, split header, metric grid, timeline chapters, card grids, carousel track, milestones, footer columns, and social/link strip.

## Current architecture constraints

- selected-frame scope first,
- `documentAccess: dynamic-page`,
- network access disabled,
- TypeScript strict mode,
- audit before mutation,
- future mutations use clone/candidate/validate/commit-or-discard,
- internal neutral layout model separated from future Elementor schema adapters.

## Current risk level

Low for read-only audit development. High for any mutation work until validator + transaction engine exist.

## Release target

First useful release: `0.1.x` Audit-Only plugin.
