# Project State

Last updated: 2026-09-08

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and safely prepares approved desktop Figma layouts for structures that map cleanly to WordPress Elementor.

Runtime must not require generative AI or an external AI backend.

## Current phase

**P5 conservative Safe Fix recipes are active on `feat/p5-safe-recipes` / draft PR #14. P4 transaction/rollback is merged through PR #13 and issue #5 is closed.**

## Completed

- P0 foundation merged via PR #1.
- P1 Audit-Only MVP merged via PR #10; issue #2 closed.
- P2 deterministic classifier semantics merged via PR #11; issue #3 closed.
- P3 deterministic integrity + rendered pixel validator merged via PR #12; issue #4 closed.
- P4 candidate-isolated transaction/rollback merged via PR #13; issue #5 closed.
- Five materially different real-template audit/semantic calibration set completed: Marcus, Doctor, Esthetic, Lawyer and Legacy mixed.
- P3 validates root geometry, text-content fingerprints, image-fill fingerprints, section-relative anchors and section-level rendered PNG pixel drift.
- P4 enforces `clone -> transform candidate -> validate -> commit/swap OR discard` and bounded single-step undo/finalize.
- README exposes a GitHub-visible overall roadmap progress bar, phase table and P5 sub-progress bar.

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

## P5 live linear calibration

- First disposable-Figma run exposed a Figma transition behavior: setting `layoutMode` on a manual Frame could shrink its primary axis before fixed sizing was fully established.
- Initial observed drift:
  - Vertical `420x360 -> 420x210`,
  - Horizontal `560x220 -> 360x220`,
  - Two Column `620x300 -> 490x300`.
- Recipe was corrected to capture and restore exact target Frame width/height after applying fixed Auto Layout sizing/padding.
- Second disposable-Figma run passed all three linear recipes:
  - root geometry exactly preserved,
  - direct child geometry exactly preserved,
  - original/candidate exported PNG bytes exactly identical,
  - cleanup left `0` temporary nodes.
- Exact repeat PNG hashes:
  - Vertical: `1991:fc5b25d0:56432610`,
  - Horizontal: `1605:91f4b947:a5b5e509`,
  - Two Column: `1872:18640bfc:5135a1c0`.
- Calibration evidence documented in `docs/P5_LINEAR_LIVE_CALIBRATION.md`.

## In progress

- Resolve remaining P5 CI/typecheck feedback on the latest branch head.
- Wire the linear recipe transformer through the complete full-P3 validation and P4 transaction path.
- Prove forced P3 rejection discards the recipe candidate with approved original untouched.
- Prove a passing recipe candidate commits through P4 and remains restorable/finalizable through the bounded checkpoint.

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
- `docs/P5_LINEAR_LIVE_CALIBRATION.md`

## Safety status

General Safe Fix is still not exposed as a production action. The first linear transforms have exact synthetic render-equivalence evidence, but production-capable status still requires the complete candidate transform -> P3 -> P4 orchestration and multi-template calibration.

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
