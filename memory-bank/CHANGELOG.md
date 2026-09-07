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
- Started `feat/p1-audit-engine`.
- Extended normalized node snapshots with clipping and opacity signals.
- Added explainable deterministic detection for two-column, grid, horizontal row, vertical stack and carousel-track patterns.
- Added shallow best-pattern search and confidence/evidence payloads.
- Added conservative full-size background exclusion to reduce obvious false overlap/layout classification.
- Updated audit UI to show detected pattern, confidence and evidence.
- Added unit tests for two-column, 2x3 grid, background exclusion and carousel overflow.

### Safety status
- No Auto-Fix mutation behavior enabled.
- All current runtime functionality remains read-only.
