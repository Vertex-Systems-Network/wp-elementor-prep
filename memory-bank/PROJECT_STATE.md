# Project State

Last updated: 2026-09-07

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and later safely refactors approved desktop Figma layouts into structures that map cleanly to WordPress Elementor.

Runtime must not require generative AI or external network access.

## Current phase

**P2 classifier semantics is active on `feat/p2-classifier-semantics`, draft PR #11. P1 Audit-Only is merged to `main`.**

## Completed

- P0 foundation merged via PR #1.
- P1 Audit-Only MVP merged via PR #10; issue #2 closed.
- Selected-frame scanner, normalized model, section discovery, calibrated readiness scoring, explainable findings and report UI implemented.
- Deterministic geometric classifiers implemented for two-column, grid, fragmented grid, horizontal row, vertical stack and carousel track.
- Multi-target reporting, confidence/evidence, PASS recipe suppression and Journey false-positive protection implemented.
- Five materially different real-template calibration set completed: Marcus, Doctor, Esthetic, Lawyer and Legacy mixed.
- Calibration demonstrates strong/manual/mixed separation rather than a page-wide guess.
- P2 same-target ranking implemented so specific interpretations such as carousel suppress redundant generic row output on the same target.
- P2 semantic hints implemented conservatively: repeated-cards, split-header, facts-list, footer-columns, timeline-chapter.
- P2 special visual-role evidence implemented: background-layer, absolute-overlay, decorative-overlay.
- P2 audit UI surfaces semantic hints and special roles.
- P2 timeline semantics calibrated against Marcus, Doctor and Lawyer Journey structures, including a manual full-width chapter-stack fallback.
- P2 first CI run after semantic/role integration passed typecheck, tests and build; latest timeline test commit must still be verified before merge.

## In progress

- Issue #3 / PR #11: semantic and role classifier hardening.
- Cross-template review for semantic false positives/negatives.
- Latest CI verification after timeline fallback + regression fixture.
- Memory/docs synchronization for five-template and P2 role calibration.

## Next phases

- P3: geometry/text/image/pixel validator.
- P4: clone -> candidate -> validate -> commit/discard transaction engine.
- P5: conservative high-confidence Safe Fix recipes.
- P6: advanced timeline/carousel/milestone/page normalization recipes.
- P7: batch queue for 60+ frames/pages.
- P8: optional versioned Elementor exporter adapters.

## Calibration fixtures

See:

- `docs/GOLDEN_CALIBRATION.md`
- `docs/CROSS_TEMPLATE_CALIBRATION.md`

Five-template production calibration gate is now satisfied at the broad audit level.

## Safety status

All runtime behavior is still read-only. No Auto-Fix design mutation is enabled.

## Production mutation gate

Do not enable Safe Fix until:

- P2 semantic/role classifications are explainable with no known high-confidence false positive,
- P3 validator exists,
- P4 transaction/rollback exists,
- forced validation failure demonstrably leaves the working design untouched.

## Release target

Current usable line: `0.1.x` Audit-Only. Next classifier milestone: P2 completion before validator work.
