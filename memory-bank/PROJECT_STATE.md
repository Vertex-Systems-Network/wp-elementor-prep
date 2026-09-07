# Project State

Last updated: 2026-09-07

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and later safely refactors approved desktop Figma layouts into structures that map cleanly to WordPress Elementor.

Runtime must not require generative AI or external network access.

## Current phase

**P1 Audit-Only MVP is functionally complete on `feat/p1-audit-engine`; final PR/merge and broader real-template calibration remain.**

## Completed

- P0 foundation merged via PR #1.
- AI-native planning, deep audit, architecture, feature plan and pre-development plan established.
- Mandatory memory-bank implemented.
- TypeScript/Figma plugin scaffold, read-only scanner, scoring and report UI implemented.
- Deterministic pattern detection implemented for two-column, grid, horizontal row, vertical stack and carousel-track.
- Confidence/evidence model implemented.
- Multi-target pattern reporting implemented while retaining strongest `detection` for compatibility.
- Conservative background exclusion implemented.
- Calibrated PASS/REVIEW/NEEDS_WORK thresholds implemented.
- PASS-section repair recipe suppression implemented.
- Journey small-pair two-column false positive removed.
- Fragmented-grid detection added for visually repeated grids with an unwrapped cell.
- Live Numbers calibration confirms the 2×3 metric region as a fragmented grid at 87% confidence and its lower region as a separate two-column target.
- Live Media calibration remains intentionally carousel-oriented; wide clipped track must not be compressed.
- CI currently passes typecheck, tests and build on the latest calibrated classifier line.

## In progress

- Draft PR #10 finalization.
- Memory/docs synchronization after latest live fragmented-grid calibration.
- Decide P1 merge after final PR review.
- Assemble four additional materially different real Figma templates for production calibration.

## Next phases

- P2: broaden classifier roles, decoration/overlay and timeline semantics.
- P3: geometry/text/image/pixel validator.
- P4: clone -> candidate -> validate -> commit/discard transaction engine.
- P5: conservative high-confidence Safe Fix recipes.
- P6: advanced timeline/carousel/milestone/page normalization recipes.
- P7: batch queue for 60+ frames/pages.
- P8: optional versioned Elementor exporter adapters.

## Golden fixture facts

- frame: `Desktop — Elementor Ready`
- node: `3501:2`
- 1143 × 18794
- 1152 nodes
- 715 container-like nodes
- 270 Auto Layout containers
- 445 manual containers
- 38% Auto Layout coverage
- 433 text nodes
- 17 image-like nodes
- 16 content sections under `App`

## Safety status

All runtime behavior is still read-only. No Auto-Fix design mutation is enabled.

## Production mutation gate

Do not enable Safe Fix until:

- at least 5 materially different real templates have explainable audit results,
- no known high-confidence false positive remains,
- P3 validator exists,
- P4 transaction/rollback exists,
- forced validation failure demonstrably leaves the working design untouched.

## Release target

First useful release: `0.1.x` Audit-Only plugin.
