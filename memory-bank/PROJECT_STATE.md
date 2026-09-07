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

- Deterministic Safe Recipe plan/result types.
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
- Linear transforms require strict live geometry before changing the candidate: matching visual/layer order, cross-axis alignment <= 1 px, uniform gaps <= 1 px, no overlap and in-bounds geometry.
- Linear transforms do not reorder layers; they apply fixed-size Auto Layout using measured gap/padding only when strict prechecks pass.
- Reusable `FullFrameValidator` broker exists for full P3 geometry/content/image + rendered-pixel validation.
- `runSafeFixTransaction` wires an eligible plan to the P4 candidate transaction adapter and requires the injected full-P3 validator before commit.
- Read-only `Preview safe fixes` UI exposes P5 plan decisions while mutation remains disabled.
- Planner and linear-layout regression tests are present.

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

## P5 end-to-end synthetic transaction calibration

A second disposable calibration exercised the intended recipe -> validation -> transaction lifecycle using text-bearing synthetic Frames far off-canvas. No approved customer section was modified.

- Forced validation rejection after a valid Vertical Stack recipe:
  - candidate was deleted,
  - approved original remained in the same parent/index,
  - root/child/text geometry remained exact,
  - original PNG remained exact.
- Passing Vertical Stack recipe:
  - root/child/text geometry exact,
  - PNG bytes exact (`3618:e18db581` for both original and candidate),
  - candidate occupied the approved root slot only after validation,
  - original moved to a hidden backup,
  - bounded checkpoint blocked a second commit by policy,
  - restore returned the exact original and removed candidate/backup.
- Passing Horizontal Row recipe:
  - full synthetic validation passed with exact PNG bytes (`3133:36b25459`),
  - commit succeeded,
  - finalize removed the retained old original/backup while keeping the committed candidate.
- Cleanup left `0` temporary nodes.
- These fixtures had text anchors but no image-fill anchors; the repository P3 validator still retains exact image-fill fingerprint checks for real frames.
- Evidence is documented in `docs/P5_END_TO_END_TRANSACTION_CALIBRATION.md`.

## In progress

- Get final CI green on the latest P5 branch head.
- Verify the compiled `FullFrameValidator`/plugin-UI pixel broker through the P5 transaction runtime, not only the equivalent disposable calibration script.
- Add regression coverage around the P5 runtime orchestration seam where practical.
- Then enable Facts List and Footer Columns mutation behind the same P3/P4 gates.

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
- `docs/P5_END_TO_END_TRANSACTION_CALIBRATION.md`

## Safety status

General Safe Fix is still not exposed as a production action. The first linear transforms have exact synthetic render-equivalence and end-to-end reject/commit/restore/finalize evidence, but production-capable status still requires green CI, compiled full-P3 broker verification and multi-template calibration.

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
