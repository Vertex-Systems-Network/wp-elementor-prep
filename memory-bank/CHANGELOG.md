# Changelog

## 2026-09-09

### Runtime artifact symlink hardening
- Continued the mandatory issue-first/PR-first cycle with open issues still #6/#7/#8 and no actionable product issue unblocked by real runtime evidence.
- Identified that runtime artifact preflight followed symbolic links for required packaged files.
- PR #46 switched required artifact-file inspection to `lstatSync()` and now fails closed when `BUILD_INFO.txt`, `manifest.json`, `code.js`, `ui.html`, `prepare-figma-import.mjs`, or the same-artifact verifier is a symbolic link.
- Added regression coverage proving a symlinked compiled runtime file is rejected before immutable-hash acceptance.
- Removed duplicate required-file diagnostics while preserving fail-closed behavior.
- PR #46 head `7fa579e` passed CI #557 with no review/thread blockers.
- PR #46 squash-merged to `main` at `15cc973`.
- Post-merge main CI #558 and Integration Readiness #44 passed.
- Identified the remaining matching provenance gap: the supplied artifact root directory itself could still be a symbolic link.
- PR #47 switched artifact-root inspection to `lstatSync()` and now rejects a symbolic-link artifact directory before required-file/identity/hash/manifest checks.
- Added regression coverage proving a symlinked artifact root fails closed.
- PR #47 head `6a90c11` passed CI #559 with no review/thread blockers.
- PR #47 squash-merged to `main` at `8297b69`.
- Post-merge main CI #560 and Integration Readiness #45 passed.
- Open PR/MR count returned to `0`; canonical P5/P6/P7 exact-build feature heads and registered runtime artifact bytes were not modified.

### Closure evidence symlink hardening
- Re-ran the mandatory issue-first/PR-first cycle: open issues remain #6/#7/#8 and there were no open PRs before the new hardening batch.
- Identified a provenance-boundary gap in `runtime:closure-intake`: `statSync()` followed operator-supplied evidence symlinks.
- Switched evidence-path metadata inspection to `lstatSync()` and fail closed when the supplied closure evidence path is a symbolic link.
- Added regression coverage proving symbolic-link evidence is rejected before evidence read/hash/verifier execution.
- Kept the change main-side only; canonical P5/P6/P7 exact-build feature heads and registered runtime artifact bytes were not modified.
- PR #45 head `f2233fb` passed CI #551 with no review/thread blockers.
- PR #45 squash-merged to `main` at `8444698`.
- Post-merge main CI #552 passed status verification, typecheck, tests, build and local-import safety.
- Post-merge Integration Readiness #40 passed.
- Open PR/MR count returned to `0` after merge.

### Runtime closure intake
- Performed the mandatory issue-first sweep: open issues remain #6/#7/#8; no new actionable issue was found.
- Confirmed open PR/MR count was `0` before development began.
- Added `scripts/runtime-closure-intake.mjs` and `npm run runtime:closure-intake`.
- Closure intake requires final-closure artifact preflight PASS before verifier execution.
- Evidence intake requires a regular non-empty JSON file with a top-level object and a default 5 MiB size bound.
- Evidence SHA-256 is recorded for operator traceability.
- The verifier is the exact hash-pinned verifier inside the registered artifact and is launched directly through Node without shell interpolation.
- Preflight failure, reference-only closure eligibility, malformed/oversized evidence, verifier execution error, signal or non-zero exit all fail closed.
- Added regression tests proving verifier suppression on preflight/evidence failure and PASS/non-zero verifier behavior.
- Added `docs/RUNTIME_CLOSURE_INTAKE.md`.
- PR #43 first implementation head `07bc91e` passed CI #535.
- Final PR #43 head `2ea96d2` passed CI #540 and Integration Readiness #30 with no review/thread blockers.
- PR #43 squash-merged to `main` at `7d9f22b`.
- Post-merge main CI #541 and Integration Readiness #31 both passed.
- Open PR/MR count returned to `0` after merge.
- Issue #6 tracker was synchronized to require `runtime:closure-intake` after real Figma evidence export.
- Canonical P5/P6/P7 feature heads were not modified.

### Immutable runtime artifact hash pinning
- Recorded previously missing PR #42 state in the canonical changelog.
- Upgraded `config/runtime-artifacts.json` to schema v2 with immutable per-file SHA-256 pins.
- Pinned `BUILD_INFO.txt`, `code.js`, `ui.html`, packaged `prepare-figma-import.mjs` and each track's same-artifact verifier.
- Intentionally left `manifest.json` outside byte-hash pinning so the supported plugin-ID-only local rebind remains possible while manifest semantics are still validated.
- Added fail-closed tests for compiled runtime and verifier tampering plus allowed manifest plugin-ID rebinding.
- PR #42 final head `e9c718c` passed CI #529 with no review/thread blockers.
- PR #42 squash-merged to `main` at `92a4440`.
- Post-merge CI #530 and Integration Readiness #22 passed.
- Final synchronized pre-batch main checkpoint `659efc6` passed CI #534 and Integration Readiness #26.

## 2026-09-08

### Runtime artifact preflight + issue tracker correction
- Performed the mandated issue-first sweep: open issues remain #6/#7/#8; no new actionable defect issue appeared.
- Corrected #7 and #8 tracker bodies so current P6 #494 / P7 #490 artifacts are explicitly reference-only and final closure requires fresh post-P5 integration builds.
- Confirmed open PR/MR count was `0` before starting new implementation.
- Inspected the actual canonical artifact packages for P5 #488, P6 #494 and P7 #490, including `BUILD_INFO.txt`, manifest commands, packaged import helper and verifier names.
- Added `config/runtime-artifacts.json` as repository-side operational registry for exact source SHA, run ID/number, artifact name/digest, verifier and final-closure eligibility.
- Added `scripts/runtime-artifact-preflight.mjs` and `npm run runtime:preflight`.
- Preflight validates build identity, required files, manifest targets, required developer commands, offline-only network policy and plugin-ID rebinding state.
- P5 #488 passes final-closure preflight; current P6 #494 and P7 #490 fail closed for final-closure intent and pass only as reference inspections with warnings.
- Added regression tests for P5 PASS, P6 final-closure rejection, P6 reference-mode PASS, build-identity mismatch rejection and missing-menu-command rejection.
- Added `docs/RUNTIME_ARTIFACT_PREFLIGHT.md` operator guide.
- PR #41 first implementation head passed CI #517.
- Final PR #41 head `69fd91b` passed CI #522 and Integration Readiness #16 with no review/thread blockers.
- PR #41 squash-merged to `main` at `4b4a3be`.
- Post-merge main CI #523 and Integration Readiness #17 both passed; open PR/MR count returned to `0`.

### AI-native lifecycle + canonical state synchronization
- Added mandatory engineering order: Issues first, PR/MR second, new development third.
- Added explicit rule that actionable issues are fixed before unrelated work while real external/runtime gates may not be fabricated or prematurely closed.
- Added PR/MR gate covering CI, mergeability, conflicts and unresolved review feedback before new development begins.
- Added mandatory end-of-work README synchronization with module-wise percentage, 10-cell progress bar, blocker/next work and overall progress.
- Added decision D-012 documenting the durable lifecycle policy.
- Replaced stale P4-era `PROJECT_STATE.md`, `NEXT_ACTIONS.md` and `ROADMAP.md` with current P5/P6/P7 engineering/runtime/integration state.
- Recorded current canonical P5/P6/P7 heads, artifacts, open issues #6/#7/#8, integration dependencies and the real-Figma closure order.
- Deferred P8 remains outside the active delivery percentage rather than being represented as unfinished active work.

### P4 candidate transaction + rollback
- Merged P3 validator through PR #12 and closed issue #4.
- Created `feat/p4-transaction-engine` and draft PR #13.
- Added explicit transaction states and serializable event journal.
- Added candidate handle + adapter boundary so transformers never receive the approved original root.
- Added deterministic `clone -> transform candidate -> validate -> commit/swap OR discard` state machine.
- Added discard behavior for transform failures, validator crashes and rejected validation reports.
- Added explicit cleanup-failure and commit-stage failure handling.
- Added small commit evidence and opaque undo-token contract; no large node/PNG snapshots are stored in transaction metadata.
- Added concrete Figma transaction adapter with top-level off-layout candidate staging, stale-parent/transaction guards and root-boundary commit.
- Added hidden bounded original backup and `restoreLastCommit()` through a compact clientStorage checkpoint.
- Fixed adapter null-safety after CI caught nullable parent accesses.
- Applied Auto Layout child properties only after candidate insertion into the destination parent.
- Ran live isolated forced-failure calibration in the connected Figma file: original root/index/geometry/content remained unchanged, failed candidate was removed and cleanup left 0 temporary nodes.
- Ran live manual-parent swap + undo calibration: original restored exactly, candidate/backup removed, 0 temporary nodes remained.
- Ran live vertical Auto Layout parent swap + undo calibration: sibling order, layoutAlign/layoutGrow/layoutPositioning and resolved root geometry were preserved and restored; 0 temporary nodes remained.

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
- General Safe Fix remains disabled until P4 is merged and each P5 recipe proves its own confidence + validation path.
