# Cross-Template Calibration

Date: 2026-09-08

Purpose: validate the read-only audit/classifier against materially different desktop Figma structures before any mutation feature is allowed. Calibration node IDs are references only and must never be hard-coded into production logic.

## Template set

| Fixture | Frame | Root Auto Layout | Sections | PASS | REVIEW | NEEDS_WORK |
|---|---|---:|---:|---:|---:|---:|
| Marcus Vane golden | `Desktop — Elementor Ready` | 38% | 16 | 6 | 0 | 10 |
| Doctor | `D01 · Desktop 1440 · Adrian Vale` | 88% | 19 | 19 | 0 | 0 |
| Esthetic | `E01 · Desktop 1440 · Aurelia Voss` | ~1% | 19 | 0 | 0 | 19 |
| Lawyer | `D01 · Desktop 1440 · Adrian Kessler` | ~0% | 18 | 0 | 0 | 18 |
| Legacy mixed | `29 - Desktop` | 64% | 18 | 9 | 6 | 3 |

The set intentionally includes highly structured, almost entirely manual, deeply nested and mixed legacy documents.

## P1 conclusions

- Strong Auto Layout templates are not falsely degraded: Doctor returned 19/19 PASS.
- Fully manual templates are not falsely presented as ready: Esthetic and Lawyer returned all sections NEEDS_WORK.
- Mixed legacy pages receive section-level separation instead of a single page-wide verdict.
- Golden Marcus remains useful for fragmented-grid, carousel overflow, timeline, role-preservation and partial-structure cases.
- No customer name or node ID is required by production classifier logic.

## P2 special-role calibration

The role classifier was run read-only across all five templates using geometry, opacity, overlap, layout-positioning, Auto Layout state and descendant-count evidence.

After hardening full-size background inference so normal Auto Layout content wrappers cannot be treated as backgrounds:

| Fixture | Background layers | Absolute overlays | Decorative overlays |
|---|---:|---:|---:|
| Marcus | 4 | 8 | 0 |
| Doctor | 4 | 0 | 0 |
| Esthetic | 1 | 0 | 0 |
| Lawyer | 13 | 0 | 0 |
| Legacy | 1 | 5 | 0 |

Observed examples remain structurally plausible. Full-size media/shade layers can be preserved as backgrounds; explicitly positioned floating elements remain overlays. Low-opacity decoration is intentionally conservative and did not fire on the five-template set.

Role detection is preservation evidence only. It never authorizes mutation.

## P2 semantic calibration

Representative live targets were checked with the same deterministic geometry/subtree rules used by the classifier.

Confirmed positive cases:

| Case | Expected semantic | Post-hardening result | Evidence summary |
|---|---|---|---|
| Marcus About facts | `facts-list` | PASS | 8 repeated container items; 100% text-item, broad-width and height-consistency evidence |
| Marcus Journey | `timeline-chapter` | PASS | 6 full-width sequential blocks; text-rich chapter structure |
| Doctor Journey | `timeline-chapter` | PASS | 6 full-width sequential blocks plus repeated nested two-column chapter structure |
| Lawyer Journey | `timeline-chapter` | PASS | 6 full-width sequential manual text-rich exhibit blocks |
| Marcus Contact main row | `footer-columns` | PASS | 4 items, ~72% section position, ~13% section height, 100% text/coverage |
| Doctor Contact channels | `footer-columns` | PASS | 4 items, ~91% section position, ~3% section height, 100% text/coverage |
| Legacy Contact channels | `footer-columns` | PASS | 4 items, ~83% section position, ~4% section height, 100% text, ~68% horizontal coverage |

Other established semantic cases remain valid: clipped carousel viewport, coherent repeated-card grids and top-level split headers.

## False-positive review and fixes

The five-template semantic pass exposed three important generic-rule collisions. All fixes were expressed using general geometry/subtree evidence only.

### 1. Tall About card row mislabeled as footer columns

Doctor About contains a 3-card text row in the lower part of the section. It satisfied the old lower-position/text/coverage rule even though it is a content-card row.

Post-fix footer rule additionally requires the target row to be shallow relative to its section (`height <= 18%` of section height).

- Doctor About row: ~25% section height -> rejected.
- Marcus Contact main row: ~13% -> retained.
- Doctor Contact channels: ~3% -> retained.
- Legacy Contact channels: ~4% -> retained.

A regression fixture now rejects a tall lower three-card row.

### 2. Loose text/dividers mislabeled as facts list

Lawyer Biography Opening contains loose text siblings and divider frames. The previous compact-text heuristic could incorrectly interpret this as a facts list.

Post-fix facts-list semantics require:

- at least 5 repeated **container** items,
- >=80% items with 1–4 text descendants,
- >=80% items occupying at least 80% of target width,
- >=70% item-height consistency.

Marcus About's real 8-item facts list remains detected; Lawyer's divider/text opening is rejected. A dedicated adversarial fixture covers loose text + divider frames.

### 3. Four-item content stacks mislabeled as timelines

Legacy Numbers/Media exposed that a generic four-item vertical stack can contain nested layout evidence without being a timeline.

Post-fix timeline semantics require at least 5 repeated stack items before nested-two-column or full-width chapter fallback can qualify.

- Marcus Journey: 6 items -> retained.
- Doctor Journey: 6 items -> retained.
- Lawyer Journey: 6 items -> retained.
- Legacy four-item content stack -> rejected.

A regression fixture now rejects four-item stacks even when nested two-column evidence exists.

## Split-header hardening

A nested Doctor Journey chapter row sits near the top of the section and can look like a split header by position alone. Split-header semantics therefore require top-level section context in addition to top/height geometry. Nested chapter rows deeper in the hierarchy are rejected.

## Same-target ranking

A target may satisfy several geometric classifiers. P2 reports the most specific valid interpretation per target:

`carousel-track > grid > two-column > horizontal-row > vertical-stack`

This prevents a carousel track from also appearing as a competing generic horizontal row repair target.

## P2 acceptance evidence

- [x] at least 5 materially different real templates audited
- [x] broad strong/manual/mixed separation demonstrated
- [x] semantic hints are geometry/subtree based, not customer-copy based
- [x] known split-header/chapter collision has a deterministic guard
- [x] known footer/card collision has a deterministic guard
- [x] known facts/divider collision has a deterministic guard
- [x] known four-stack/timeline collision has a deterministic guard
- [x] positive facts/timeline/footer cases remain detected after hardening
- [x] same-target redundant patterns are de-duplicated
- [x] role evidence remains preservation-only and read-only
- [x] latest P2 typecheck/tests/build are green

## Production mutation gate status

P2 can be merged, but Safe Fix remains blocked until:

- [ ] P3 geometry/text/image/pixel validator exists,
- [ ] P4 candidate transaction/rollback engine exists,
- [ ] a forced failed candidate demonstrably leaves the working design untouched.

Safe Fix remains disabled.
