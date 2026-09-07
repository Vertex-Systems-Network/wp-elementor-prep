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

### P1 Audit-Only engine
- Implemented selected-frame scanner, section discovery, readiness stats, scoring and report UI.
- Implemented deterministic two-column, grid, horizontal row, vertical stack and carousel-track detection.
- Added confidence/evidence payloads and conservative full-size background exclusion.
- Added multi-target pattern reporting.
- Added fragmented-grid detection for unwrapped visual cells.
- Removed Journey tiny-child two-column false positive.
- Calibrated PASS/REVIEW/NEEDS_WORK thresholds and PASS recipe suppression.
- Confirmed Numbers fragmented 2×3 grid and Media clipped carousel behavior on live Figma.
- PR #10 merged to `main`; issue #2 closed.

### Five-template calibration
- Completed broad read-only calibration on Marcus, Doctor, Esthetic, Lawyer and Legacy mixed desktops.
- Doctor (88% root Auto Layout) returned 19/19 PASS.
- Esthetic (~1% root Auto Layout) returned 19/19 NEEDS_WORK.
- Lawyer (~0% root Auto Layout) returned 18/18 NEEDS_WORK.
- Legacy mixed (64% root Auto Layout) returned 9 PASS, 6 REVIEW, 3 NEEDS_WORK.
- Confirmed section-level scoring works across highly structured, manual and mixed files.

### P2 classifier semantics
- Started `feat/p2-classifier-semantics` and draft PR #11.
- Added same-target specificity ranking so specific patterns suppress redundant generic interpretations.
- Added semantic hints without replacing underlying geometry: repeated-cards, split-header, facts-list, footer-columns, timeline-chapter.
- Added special preservation roles: background-layer, absolute-overlay, decorative-overlay.
- Updated Audit UI to show semantic hints and role evidence.
- Added ranking, semantic and role tests including adversarial overlap coverage.
- First P2 semantic/role CI run passed typecheck, tests and build.

### P2 live role/timeline calibration
- Ran role heuristics read-only across all five real templates.
- Marcus: 5 background layers, 7 absolute overlays.
- Doctor: 4 background layers.
- Esthetic: 1 background layer.
- Lawyer: 13 background layers in image/card structures.
- Legacy: 1 background layer, 5 absolute overlays.
- No low-opacity decorative-overlay rule fired in this sample set, preserving conservative behavior.
- Inspected Marcus, Doctor and Lawyer Journey structures.
- Added a manual full-width sequential text-rich chapter-stack fallback so timeline semantics do not depend on existing Auto Layout/two-column structure.

### Safety status
- No Auto-Fix mutation behavior enabled.
- All runtime functionality remains read-only.
