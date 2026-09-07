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
- Added shallow best-pattern search and confidence/evidence payloads.
- Added conservative full-size background exclusion.
- Updated audit UI to show detected pattern, confidence and evidence.
- Added unit tests for two-column, 2x3 grid, background exclusion and carousel overflow.

### Live golden calibration
- Ran the read-only classifier against the live `Desktop — Elementor Ready` golden frame.
- Correctly discovered `App` and all 16 sections in order.
- Confirmed strong sections score approximately 96–100 while weak/manual sections score approximately 51–68 in the initial model.
- Confirmed useful detection for About two-column, Philosophy/Sector 2×2 grids, Media carousel track and Milestones repeated grid.
- Found a Journey false-positive two-column at 85% confidence caused by only 18% parent-width coverage.
- Prepared stricter two-column coverage/width gating and a regression test.
- Prepared status calibration: PASS >=80, REVIEW 70–79, NEEDS_WORK <70.
- Prepared suppression of repair recipes for already-PASS sections.
- Documented a remaining limitation: complex sections need multi-pattern reporting instead of one-best-pattern only.

### Safety status
- No Auto-Fix mutation behavior enabled.
- All current runtime functionality remains read-only.
