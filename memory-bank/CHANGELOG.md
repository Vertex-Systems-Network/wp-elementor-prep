# Changelog

## 2026-09-08

### P5 conservative Safe Fix foundation
- Merged P4 candidate transaction/rollback through PR #13 and closed issue #5.
- Added a GitHub-visible README roadmap progress bar and per-phase status table.
- Created `feat/p5-safe-recipes` from the merged P4 head.
- Added deterministic Safe Recipe types with `ELIGIBLE`, `REVIEW`, `NOOP` and `UNSUPPORTED` decisions.
- Added conservative v1 confidence gates for Vertical Stack, Horizontal Row, Two Column, Facts List, Footer Columns and non-fragmented repeated-card grids.
- Added clone-stable candidate target mapping using child-index paths instead of descendant node IDs.
- Added hard blockers for missing targets, special visual roles, visible absolute direct children, fragmented grids and ambiguous geometric grids.
- Deferred carousel/timeline mutation to P6.
- Added strict candidate-only Figma transform foundations for Vertical Stack, Horizontal Row and Two Column.
- Linear transforms refuse mutation unless visual/layer order already matches, cross-axis origins align within 1 px, primary-axis gaps are uniform within 1 px, children do not overlap and geometry stays inside target bounds.
- Linear transforms do not reorder layers and still require full P3 validation before any P4 commit.
- Added P5 planner regression tests and `docs/P5_SAFE_RECIPES.md`.

### P4 candidate transaction + rollback
- Merged P3 validator through PR #12 and closed issue #4.
- Created `feat/p4-transaction-engine` and draft PR #13.
- Added explicit transaction states and serializable event journal.
- Added candidate handle + adapter boundary so transformers never receive the approved original root.
- Added deterministic `clone -> transform candidate -> validate -> commit/swap OR discard` state machine.
- Added discard behavior for transform failures, validator crashes and rejected validation reports.
- Added explicit cleanup-failure and commit-stage failure handling.
- Added small commit evidence and opaque undo-token contract; no large node/PNG snapshots are stored in transaction metadata.
- Added unit fixtures proving forced transform failure and rejected validation leave the approved original unchanged.
- Added concrete Figma transaction adapter with top-level off-layout candidate staging, stale-parent/transaction guards and root-boundary commit.
- Added hidden bounded original backup and `restoreLastCommit()` through a compact clientStorage checkpoint.
- Added `finalizeLastCommit()` and a single-pending-checkpoint guard so backup roots cannot accumulate silently.
- Fixed adapter null-safety after CI caught nullable parent accesses.
- Applied Auto Layout child properties only after candidate insertion into the destination parent.
- Ran live isolated forced-failure calibration in the connected Figma file: original root/index/geometry/content remained unchanged, failed candidate was removed and cleanup left 0 temporary nodes.
- Ran live manual-parent swap + undo calibration: original restored exactly, candidate/backup removed, 0 temporary nodes remained.
- Ran live vertical Auto Layout parent swap + undo calibration: sibling order, layoutAlign/layoutGrow/layoutPositioning and resolved root geometry were preserved and restored; 0 temporary nodes remained.
- PR #13 merged to `main`; issue #5 closed.

### P3 validator foundation + pixel layer
- Merged P2 classifier semantics through PR #11 and closed issue #3.
- Created `feat/p3-validator` and draft PR #12.
- Added versioned P3 integrity snapshot/result types.
- Added deterministic text-content fingerprints and image-fill integrity fingerprints.
- Added section-relative text/image anchor geometry and duplicate matching independent of Figma node IDs.
- Allowed wrapper/node-count changes when visible invariants remain equivalent.
- Added explicit failures for root, text, image and invalid snapshot drift.
- Added section-level PNG export using Figma `exportAsync()` with a 2048 px longest-edge cap.
- Added plugin-UI Canvas/ImageData decoding and deterministic RGBA pixel comparison.
- Added pixel failure reasons for dimension mismatch and excessive visual drift.
- Added `p3-v1` pixel thresholds: channel tolerance 8/255, changed pixels <=0.5%, mean channel delta <=0.5.
- Added pixel regression tests for exact no-op, tolerated deltas, changed pixels, dimension mismatch, malformed buffers and threshold failures.
- Ran live read-only no-op export calibration on Marcus About, Journey and Contact; repeated PNG exports were byte-identical for all three sections.
- PR #12 merged to `main`; issue #4 closed.

### P2 semantic hardening
- Completed representative read-only semantic review across the five-template calibration set.
- Confirmed positive semantics for Marcus/Doctor/Lawyer Journey, Marcus About facts, and Marcus/Doctor/Legacy contact-channel rows.
- Found and fixed a Doctor About false footer-columns classification by requiring footer/contact rows to remain shallow relative to section height.
- Found and fixed a Lawyer Biography Opening false facts-list classification by requiring repeated container items with text, broad-width and height-consistency evidence.
- Found and fixed Legacy Numbers/Media false timeline semantics by requiring at least five repeated vertical-stack items before timeline inference.
- Added regression fixtures for tall lower card rows, loose text/divider pseudo-lists and four-item non-timeline stacks.
- Confirmed the hardened rules preserve real positive cases after the fixes.
- PR #11 merged to `main`; issue #3 closed.

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
- Added same-target specificity ranking so specific patterns suppress redundant generic interpretations.
- Added semantic hints without replacing underlying geometry: repeated-cards, split-header, facts-list, footer-columns, timeline-chapter and carousel-viewport.
- Added special preservation roles: background-layer, absolute-overlay, decorative-overlay.
- Updated Audit UI to show semantic hints and role evidence.
- Added ranking, semantic and role tests including adversarial overlap coverage.
- Added top-level-context guard for split-header inference.
- Added manual full-width sequential text-rich chapter-stack fallback for timeline semantics.
- Hardened background-role inference so normal Auto Layout wrappers are not treated as backgrounds.

### Safety status
- P5 remains confidence-gated, candidate-only and blocked from production exposure until each recipe passes CI, full P3 and live calibration.
