# Pre-Development Plan

Date: 2026-09-07

## Objective

Reach a trustworthy Audit-Only MVP before enabling any mutation logic.

## Milestone 0 — Foundation

Deliverables:

- AI-native repository instructions (`AGENTS.md`).
- Memory-bank with canonical status and next actions.
- Product/architecture/feature specifications.
- TypeScript + Figma Plugin API scaffold.
- Strict compiler configuration.
- Build script.
- Unit-test framework.
- GitHub Actions CI.

Exit criteria:

- `npm run build`, `npm run typecheck`, and `npm test` work locally/CI.
- Plugin launches with no external network access.

## Milestone 1 — Audit-Only MVP

Deliverables:

- Selection validator.
- Selected-frame scanner.
- Normalized audit model.
- Overall counts and Auto Layout coverage.
- Initial per-section discovery.
- Initial readiness scoring.
- Read-only UI report.
- Fixture-based tests for scoring.

Exit criteria:

On the golden page, audit should correctly distinguish already-structured vs weak sections broadly consistent with the manual audit. No Figma node is mutated.

## Milestone 2 — Classifier accuracy

Deliverables:

- geometric row/column/grid clustering,
- decoration/background detection,
- carousel detection,
- repeated chapter/card detection,
- evidence + confidence payloads.

Exit criteria:

- classifier has unit tests for normal and adversarial examples,
- at least 5 distinct real templates audited,
- no known high-confidence false positive in golden fixtures.

## Milestone 3 — Validation engine

Deliverables:

- geometry/content/image fingerprints,
- section PNG export contract,
- UI pixel-diff prototype,
- calibration data.

Exit criteria:

Known intentional no-op/cosmetic-equivalent transformations pass; known visual drift fails.

## Milestone 4 — Transaction engine

Deliverables:

- clone candidate,
- transform hook,
- validate hook,
- commit/swap,
- discard/rollback,
- audit metadata.

Exit criteria:

A forced failing transform cannot damage the working section.

## Milestone 5 — First Safe Fix recipes

Order:

1. Horizontal Row
2. Vertical Stack
3. Two Column
4. Facts List
5. Footer Columns
6. Simple Grid
7. Metric Grid

Exit criteria:

Each recipe has:
- detection tests,
- transformation tests where possible,
- validation path,
- confidence threshold,
- rollback coverage.

## Quality gates

Every PR must satisfy:

- typecheck,
- unit tests,
- build,
- memory-bank update,
- no undocumented mutation behavior,
- no network dependency added to core without explicit decision record.

## Issue strategy

Create one issue per milestone plus focused implementation issues. Each issue must include acceptance criteria and memory-bank implications.

## Release strategy

- `0.1.x`: audit-only.
- `0.2.x`: conservative safe fixes.
- `0.3.x`: advanced validation/recipes.
- `0.4.x`: batch processing.
- `1.0.0`: production-ready core after multi-template validation.

## Immediate engineering order

1. Merge foundation/planning scaffold.
2. Run CI and fix any scaffold errors.
3. Implement normalized section discovery.
4. Improve score model from simple coverage to explainable weighted findings.
5. Add JSON test fixtures representing golden layouts without storing proprietary design content.
6. Validate audit against the live Figma golden page.
7. Only then start classifier recipes.
