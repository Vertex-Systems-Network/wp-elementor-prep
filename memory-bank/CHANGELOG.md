# Changelog

## 2026-09-07

### Foundation
- Established AI-native development approach with mandatory memory-bank.
- Completed repository/product/technical audit.
- Defined deterministic, AI-free runtime direction.
- Defined Elementor-readiness rules and neutral-schema architecture.
- Added TypeScript/Figma plugin Audit-Only scaffold, tests and CI.
- PR #1 merged to `main` after green CI.
- Created roadmap issues #2–#9.

### P1 Audit engine
- Started `feat/p1-audit-engine` and draft PR #10.
- Added selected-frame scanner, section discovery, readiness stats, scoring and report UI.
- Added deterministic two-column, grid, horizontal row, vertical stack and carousel-track detection.
- Added confidence/evidence payloads and conservative full-size background exclusion.
- Added calibrated PASS/REVIEW/NEEDS_WORK thresholds.
- Added PASS-section repair-recipe suppression.
- Fixed SceneNode opacity typing and kept CI green.

### Golden calibration
- Ran the read-only engine against `Desktop — Elementor Ready`.
- Correctly discovered `App` and all 16 content sections in order.
- Confirmed strong sections cluster at PASS while weak/manual sections classify NEEDS_WORK.
- Removed a high-confidence Journey false-positive by adding parent-coverage and minimum-column-width gates.
- Confirmed Media remains a clipped wider carousel-track case and must not be compressed.

### Multi-target reporting
- Added `detections[]` so complex sections can expose multiple target-level patterns while retaining strongest `detection` for compatibility.
- Expanded UI to display multiple target detections.
- Added split-header-style and timeline/chapter structural fixtures.

### Fragmented grid support
- Added dominant-card-anchor analysis for grids where one visual card is fragmented into sibling text/line nodes.
- Live Numbers metric region calibration confirms 5 full card anchors + 5 fragments forming a 2×3 visual grid with one missing wrapped slot.
- Fragmented-grid confidence on the golden Numbers metric region is 87% with 83% occupancy and 100% repeated-card dimension consistency.
- Tightened strict-grid detection so irregular scatter cannot mask the fragmented-grid path.
- Latest CI passes typecheck, tests and build.

### Safety status
- No Auto-Fix mutation behavior enabled.
- All runtime functionality remains read-only.
