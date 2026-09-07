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

The role classifier was run read-only across all five templates using only geometry, opacity, overlap, layout-positioning, Auto Layout state, and descendant-count evidence.

After hardening full-size background inference so Auto Layout content wrappers cannot be treated as backgrounds:

| Fixture | Background layers | Absolute overlays | Decorative overlays |
|---|---:|---:|---:|
| Marcus | 4 | 8 | 0 |
| Doctor | 4 | 0 | 0 |
| Esthetic | 1 | 0 | 0 |
| Lawyer | 13 | 0 | 0 |
| Legacy | 1 | 5 | 0 |

Observed examples are structurally plausible: hero images/shades classify as background layers; explicit floating hero elements classify as absolute overlays. Marcus `Hero Decorative Layer` is now preserved as an explicit absolute overlay rather than inferred as a background because it participates in Auto Layout metadata. Low-opacity decoration remains intentionally conservative and did not fire on these five fixtures.

Important: role detection does not authorize mutation. It is preservation evidence for later P3/P4/P5 work.

## P2 semantic calibration

Representative live targets were checked with the same deterministic semantic rules:

| Case | Result | Evidence summary |
|---|---|---|
| Marcus Media viewport | `carousel-viewport` | clipped 1052px viewport, ~1778px track, ~727px intentional overflow |
| Marcus Philosophy | `repeated-cards` | 2×2, 100% width consistency, 100% occupancy |
| Marcus Sector | `repeated-cards` | 2×2, 100% width consistency, 100% occupancy |
| Marcus About facts | `facts-list` | 8 items, all 8 contain exactly two text descendants |
| Marcus Journey | `timeline-chapter` | 6 full-width sequential blocks; 5 substantial text-rich chapters |
| Doctor Journey | `timeline-chapter` | 6 full-width sequential blocks plus repeated nested two-column chapters |
| Lawyer Journey | `timeline-chapter` | 6 full-width sequential manual text-rich exhibit blocks |

### Footer/contact calibration

The initial footer rule required a row to occupy at least 15% of section height. Live contact sections proved that assumption was too strict: valid contact-channel rows are often shallow.

Observed rows:

- Marcus: 4 columns, top ~72% of section, 100% horizontal coverage, 100% text-bearing columns.
- Doctor: 4 channels, top ~91%, 100% horizontal coverage, 100% text-bearing columns.
- Legacy: 4 columns, top ~83%, ~68% horizontal coverage, 100% text-bearing columns.

The semantic rule was recalibrated to require lower-section placement, 3–6 items, >=75% text-bearing columns and >=65% horizontal coverage instead of arbitrary row height. A top-of-section adversarial fixture remains rejected.

### Split-header false-positive hardening

Live Doctor Journey calibration exposed an important semantic collision: the first nested two-column chapter row sits near the top of the Journey section and is shallow enough to resemble a split header by position alone.

The split-header rule now requires top-level section context as well as position/height. Nested targets qualify only when their parent begins within the first ~2% of the section; ordinary chapter rows deeper in a section are rejected. A regression fixture covers this case.

## Timeline calibration

Three materially different Journey structures were inspected:

- Marcus: 6 full-width sequential blocks; 5 text-rich chapters after an opening/header block.
- Doctor: 6 full-width sequential blocks with repeated nested two-column chapters.
- Lawyer: 6 full-width sequential manual exhibit blocks with rich text and no dependable Auto Layout.

P2 therefore supports two deterministic timeline signals:

1. vertical stack with repeated nested two-column chapter targets;
2. conservative full-width sequential, substantial, text-rich chapter stack fallback for manual layouts.

The fallback is evidence-only and remains subject to future cross-template false-positive review.

## Production mutation gate status

- [x] at least 5 materially different real templates audited
- [x] broad strong/manual/mixed separation demonstrated
- [x] live semantic calibration covers carousel, repeated cards, facts list, footer/contact rows and structured/manual timelines
- [x] known nested chapter vs split-header collision has a deterministic guard and regression fixture
- [ ] latest P2 CI must be green before merge
- [ ] P3 visual/content validator implemented
- [ ] P4 candidate transaction/rollback implemented
- [ ] forced failed candidate proven to preserve the working design

Safe Fix remains disabled.
