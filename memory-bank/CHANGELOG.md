# Changelog

## 2026-09-08

### P2 semantic hardening
- Completed representative read-only semantic review across the five-template calibration set.
- Confirmed positive semantics for Marcus/Doctor/Lawyer Journey, Marcus About facts, and Marcus/Doctor/Legacy contact-channel rows.
- Found and fixed a Doctor About false footer-columns classification by requiring footer/contact rows to remain shallow relative to section height.
- Found and fixed a Lawyer Biography Opening false facts-list classification by requiring repeated container items with text, broad-width and height-consistency evidence.
- Found and fixed Legacy Numbers/Media false timeline semantics by requiring at least five repeated vertical-stack items before timeline inference.
- Added regression fixtures for tall lower card rows, loose text/divider pseudo-lists and four-item non-timeline stacks.
- Confirmed the hardened rules preserve real positive cases after the fixes.
- Latest code/test head passed typecheck, tests and build.

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
- Added semantic hints without replacing underlying geometry: repeated-cards, split-header, facts-list, footer-columns, timeline-chapter and carousel-viewport.
- Added special preservation roles: background-layer, absolute-overlay, decorative-overlay.
- Updated Audit UI to show semantic hints and role evidence.
- Added ranking, semantic and role tests including adversarial overlap coverage.
- Added top-level-context guard for split-header inference.
- Added manual full-width sequential text-rich chapter-stack fallback for timeline semantics.
- Hardened background-role inference so normal Auto Layout wrappers are not treated as backgrounds.

### Safety status
- No Auto-Fix mutation behavior enabled.
- All runtime functionality remains read-only.
