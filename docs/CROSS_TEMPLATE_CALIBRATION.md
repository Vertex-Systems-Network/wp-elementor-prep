# Cross-Template Calibration

Date: 2026-09-07

Purpose: validate the read-only audit engine against materially different desktop Figma structures before any mutation feature is allowed. These node IDs are calibration references only and must never be hard-coded into production logic.

## Template set

| Fixture | Frame | Root Auto Layout | Sections | PASS | REVIEW | NEEDS_WORK |
|---|---|---:|---:|---:|---:|---:|
| Marcus Vane golden | `Desktop — Elementor Ready` | 38% | 16 | 6 | 0 | 10 |
| Doctor | `D01 · Desktop 1440 · Adrian Vale` | 88% | 19 | 19 | 0 | 0 |
| Esthetic | `E01 · Desktop 1440 · Aurelia Voss` | ~1% | 19 | 0 | 0 | 19 |
| Lawyer | `D01 · Desktop 1440 · Adrian Kessler` | ~0% | 18 | 0 | 0 | 18 |
| Legacy mixed | `29 - Desktop` | 64% | 18 | 9 | 6 | 3 |

The set intentionally includes highly structured, almost entirely manual, and mixed legacy documents.

## P1 conclusions

- Strong Auto Layout templates are not falsely degraded: Doctor returned 19/19 PASS.
- Fully manual templates are not falsely presented as ready: Esthetic and Lawyer returned all sections NEEDS_WORK.
- Mixed legacy pages receive section-level separation instead of a single page-wide verdict.
- Golden Marcus remains useful for fragmented-grid, carousel overflow, timeline, decorative overlay, and partial-structure cases.
- No customer name or node ID is required by the classifier.

## P2 special-role calibration

The first role classifier was run read-only across all five templates using only geometry, opacity, overlap, layout-positioning, and descendant-count evidence.

| Fixture | Background layers | Absolute overlays | Decorative overlays |
|---|---:|---:|---:|
| Marcus | 5 | 7 | 0 |
| Doctor | 4 | 0 | 0 |
| Esthetic | 1 | 0 | 0 |
| Lawyer | 13 | 0 | 0 |
| Legacy | 1 | 5 | 0 |

Observed examples are structurally plausible: hero images/shades classify as background layers; explicit floating hero elements classify as absolute overlays. Low-opacity decoration is intentionally conservative and did not fire on these five fixtures.

Important: role detection does not authorize mutation. It is preservation evidence for later P3/P4/P5 work.

## Timeline calibration

Three materially different Journey structures were inspected:

- Marcus: 6 full-width sequential blocks; 5 text-rich chapters after an opening/header block.
- Doctor: 6 full-width sequential blocks with repeated nested two-column chapters.
- Lawyer: 6 full-width sequential manual exhibit blocks with rich text and no dependable Auto Layout.

P2 therefore supports two deterministic timeline signals:

1. vertical stack with repeated nested two-column chapter targets;
2. conservative full-width sequential, substantial, text-rich chapter stack fallback for manual layouts.

The fallback is evidence-only and remains subject to cross-template false-positive review.

## Production mutation gate status

- [x] at least 5 materially different real templates audited
- [x] broad strong/manual/mixed separation demonstrated
- [ ] P2 semantic/role classifier finalized with no known high-confidence false positive
- [ ] P3 visual/content validator implemented
- [ ] P4 candidate transaction/rollback implemented
- [ ] forced failed candidate proven to preserve the working design

Safe Fix remains disabled.
