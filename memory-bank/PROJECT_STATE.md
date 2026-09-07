# Project State

Last updated: 2026-09-08

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and safely prepares approved desktop Figma layouts for structures that map cleanly to WordPress Elementor.

Runtime must not require generative AI or an external AI backend.

## Current phase

**P5 conservative Safe Fix recipes are active on `feat/p5-safe-recipes`. P4 transaction/rollback is merged through PR #13 and issue #5 is closed.**

## Completed

- P0 foundation merged via PR #1.
- P1 Audit-Only MVP merged via PR #10; issue #2 closed.
- P2 deterministic classifier semantics merged via PR #11; issue #3 closed.
- P3 deterministic integrity + rendered pixel validator merged via PR #12; issue #4 closed.
- P4 candidate-isolated transaction/rollback merged via PR #13; issue #5 closed.
- Five materially different real-template audit/semantic calibration set completed: Marcus, Doctor, Esthetic, Lawyer and Legacy mixed.
- P3 validates root geometry, text-content fingerprints, image-fill fingerprints, section-relative anchors and section-level rendered PNG pixel drift.
- P4 enforces `clone -> transform candidate -> validate -> commit/swap OR discard` and bounded single-step undo/finalize.
- README now exposes a GitHub-visible roadmap progress bar and per-phase status table.

## P5 foundation implemented

- New deterministic Safe Recipe plan/result types.
- Planner decisions: `ELIGIBLE`, `REVIEW`, `NOOP`, `UNSUPPORTED`.
- Conservative confidence gates:
  - Vertical Stack >= 90,
  - Horizontal Row >= 90,
  - Two Column >= 92,
  - Facts List >= 92,
  - Footer Columns >= 92,
  - non-fragmented repeated-card grid >= 94.
- Candidate target mapping uses child-index paths from the audited section root instead of clone descendant IDs.
- Missing target, special visual role, visible absolute direct child, fragmented grid and ambiguous grid all block mutation.
- Carousel/timeline structures remain deferred to P6.
- Candidate-only Figma transform foundation implemented for Vertical Stack, Horizontal Row and Two Column.
- Linear transforms require stricter live geometry before changing the candidate: matching visual/layer order, cross-axis alignment <= 1 px, uniform gaps <= 1 px, no overlap and in-bounds geometry.
- Linear transform does not reorder layers; it applies fixed-size Auto Layout using measured gap/padding only when strict prechecks pass.
- Planner regression tests added.
- P5 design documented in `docs/P5_SAFE_RECIPES.md`.

## In progress

- Open draft P5 PR and run CI.
- Fix any compile/test issues.
- Live disposable-Figma calibration for Vertical Stack, Horizontal Row and Two Column.
- Full P3 pass/fail validation after candidate recipe transforms.
- P4 commit/discard/undo proof around accepted and rejected recipe candidates.

## Next phases

- P5 remaining simple recipes: Facts List, Footer Columns, Simple Card Grid, Metric Grid, Social/Link Strip.
- P6: advanced timeline/carousel/milestone/page normalization recipes.
- P7: batch queue for 60+ frames/pages.
- P8: optional versioned Elementor exporter adapters.

## Calibration references

See:

- `docs/GOLDEN_CALIBRATION.md`
- `docs/CROSS_TEMPLATE_CALIBRATION.md`
- `docs/P3_VALIDATOR_DESIGN.md`
- `docs/P3_PIXEL_CALIBRATION.md`
- `docs/P4_TRANSACTION_DESIGN.md`
- `docs/P4_LIVE_TRANSACTION_CALIBRATION.md`
- `docs/P5_SAFE_RECIPES.md`

## Safety status

General Safe Fix is still not exposed as a production action. P5 planning and candidate-transform foundations exist, but each recipe remains gated by confidence, candidate isolation, mandatory full P3 validation and live calibration before commit availability is considered production-ready.

## Production mutation gate

Before any P5 recipe is considered production-capable:

- target classification must meet its explicit confidence threshold,
- target path must resolve on the staged candidate,
- recipe-specific live geometry prechecks must pass,
- transformation must run only on the staged candidate,
- full P3 validation must pass before P4 root swap,
- low-confidence/ambiguous cases must remain REVIEW,
- bounded undo/finalize must remain available after commit,
- live disposable-Figma success and forced-failure evidence must be recorded.

## Release target

Current merged usable line: Audit-Only + P3 validator + P4 transaction safety. Current development milestone: P5 conservative Safe Fix recipes behind the P3/P4 gates.
