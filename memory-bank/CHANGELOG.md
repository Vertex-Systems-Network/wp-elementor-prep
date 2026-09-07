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
- Extended normalized node snapshots with clipping and opacity signals.
- Added explainable deterministic detection for two-column, grid, horizontal row, vertical stack and carousel-track patterns.
- Added confidence/evidence payloads and conservative full-size background exclusion.
- Updated audit UI to show detected pattern evidence.
- Added unit tests for two-column, 2x3 grid, background exclusion and carousel overflow.
- Fixed SceneNode opacity typing so CI typecheck/build/test is green.

### Live golden calibration
- Ran the read-only classifier against the live `Desktop — Elementor Ready` golden frame.
- Correctly discovered `App` and all 16 sections in order.
- Calibrated status thresholds to PASS >=80, REVIEW 70–79, NEEDS_WORK <70.
- Confirmed useful detection for About two-column, Philosophy/Sector 2×2 grids, Media carousel track and Milestones repeated grid.
- Tightened two-column gating after a Journey false-positive.
- Reran the live fixture and confirmed Journey now reports its outer vertical stack instead of the invalid tiny two-column candidate.
- Suppressed repair recipes for already-PASS sections.

### Multi-pattern reporting
- Added a multi-target detection model so complex sections can expose more than one meaningful layout pattern.
- Kept the strongest `detection` field for backwards compatibility while adding `detections[]`.
- Expanded the Audit UI to show multiple targets and their confidence values.
- Added regression fixtures for a Numbers-like metric-grid + lower two-column section, split-header-style pair and timeline/chapter structure.

### Safety status
- No Auto-Fix mutation behavior enabled.
- All current runtime functionality remains read-only.
