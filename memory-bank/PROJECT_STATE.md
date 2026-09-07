# Project State

Last updated: 2026-09-08

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and later safely refactors approved desktop Figma layouts into structures that map cleanly to WordPress Elementor.

Runtime must not require generative AI or external network access.

## Current phase

**P2 classifier semantics is merge-ready on `feat/p2-classifier-semantics` / PR #11. P1 Audit-Only is merged to `main`.**

## Completed

- P0 foundation merged via PR #1.
- P1 Audit-Only MVP merged via PR #10; issue #2 closed.
- Selected-frame scanner, normalized model, section discovery, calibrated readiness scoring, explainable findings and report UI implemented.
- Deterministic geometric classifiers implemented for two-column, strict/fragmented grid, horizontal row, vertical stack and carousel track.
- Multi-target reporting, confidence/evidence, PASS recipe suppression and Journey two-column false-positive protection implemented.
- Five materially different real-template calibration set completed: Marcus, Doctor, Esthetic, Lawyer and Legacy mixed.
- Broad calibration demonstrates strong/manual/mixed separation rather than a page-wide guess.
- P2 same-target ranking implemented so specific interpretations suppress redundant generic output on the same target.
- P2 semantic hints implemented: repeated-cards, split-header, facts-list, footer-columns, timeline-chapter and carousel-viewport.
- P2 special visual-role evidence implemented: background-layer, absolute-overlay, decorative-overlay.
- P2 audit UI surfaces semantic hints and special roles.
- Timeline semantics calibrated against Marcus, Doctor and Lawyer Journey structures, including manual full-width chapter fallback.
- Live five-template semantic false-positive review completed.
- Footer/card collision fixed with a shallow-row height gate; Doctor About false positive is rejected while Marcus/Doctor/Legacy contact rows remain valid.
- Facts/divider collision fixed with repeated-container, text-content, width and height-consistency evidence; Marcus real facts remains valid and Lawyer loose-text/divider opening is rejected.
- Four-item content-stack/timeline collision fixed by requiring at least five repeated stack items; three real Journey fixtures remain valid.
- Dedicated regression fixtures added for the above semantic collisions.
- Latest P2 head `5ae3550f9ed4c37ab104787894853fc0a58216b3` passed CI: typecheck, tests and build.

## In progress

- Final PR #11 metadata/acceptance synchronization.
- Merge PR #11 and close issue #3.
- Start P3 validator branch immediately after P2 merge.

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

Five-template broad audit calibration and the P2 semantic hardening pass are complete.

## Safety status

All current Figma runtime behavior remains read-only. No Auto-Fix design mutation is enabled.

## Production mutation gate

Do not enable Safe Fix until:

- P3 validator exists,
- P4 transaction/rollback exists,
- forced validation failure demonstrably leaves the working design untouched.

## Release target

Current usable line: `0.1.x` Audit-Only. Next engineering milestone after P2 merge: P3 validator foundation.
