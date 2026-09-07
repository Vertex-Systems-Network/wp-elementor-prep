# Project State

Last updated: 2026-09-08

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and later safely refactors approved desktop Figma layouts into structures that map cleanly to WordPress Elementor.

Runtime must not require generative AI or external network access.

## Current phase

**P3 validator is active on `feat/p3-validator` / PR #12. P2 classifier semantics is merged to `main`; issue #3 is closed.**

## Completed

- P0 foundation merged via PR #1.
- P1 Audit-Only MVP merged via PR #10; issue #2 closed.
- P2 deterministic classifier semantics merged via PR #11; issue #3 closed.
- Five materially different real-template audit/semantic calibration set completed: Marcus, Doctor, Esthetic, Lawyer and Legacy mixed.
- P2 same-target ranking, semantic hints and preservation roles are implemented and regression-hardened.
- P3 integrity snapshot model implemented with versioned `p3-v1` thresholds.
- Text-content fingerprints and image-fill fingerprints implemented without requiring stable Figma node IDs.
- Text/image geometry is normalized to section coordinates so wrapper-tree changes can remain valid when visible invariants are preserved.
- Duplicate visible content is paired by stable visual order rather than node ID/path.
- Root, text, image and invalid-geometry drift produce explicit failure codes and evidence.
- Section-level PNG export is implemented with the longest render edge capped at 2048 px.
- Plugin UI decodes PNGs through Canvas/ImageData and performs deterministic RGBA comparison.
- Pixel findings implemented: `PIXEL_DIMENSION_MISMATCH` and `PIXEL_DIFF_EXCEEDED`.
- Unit tests cover no-op, wrapper changes, text/image content drift, geometry drift, duplicate content, malformed snapshots, exact pixel no-op, tolerated channel drift, changed pixels, dimension mismatch and pixel-threshold failure.
- Live read-only PNG no-op calibration passed on Marcus About, Journey and Contact; repeated exports were byte-identical in all three cases.
- Latest pixel-validation code head `f9941b46df19f4e46554c52beac57dab695ddf86` passed CI: typecheck, tests and build.

## In progress

- Final P3 documentation/memory synchronization.
- PR #12 acceptance update and final CI verification after documentation synchronization.
- Final P3 merge decision against issue #4 acceptance criteria.

## Next phases

- P4: clone -> candidate -> validate -> commit/discard transaction engine.
- P5: conservative high-confidence Safe Fix recipes.
- P6: advanced timeline/carousel/milestone/page normalization recipes.
- P7: batch queue for 60+ frames/pages.
- P8: optional versioned Elementor exporter adapters.

## Calibration references

See:

- `docs/GOLDEN_CALIBRATION.md`
- `docs/CROSS_TEMPLATE_CALIBRATION.md`
- `docs/P3_VALIDATOR_DESIGN.md`
- `docs/P3_PIXEL_CALIBRATION.md`

## Safety status

All current Figma runtime behavior remains read-only with respect to approved design structure. Audit and P3 validation may inspect/export Frames, but no Auto-Fix transformation is enabled.

## Production mutation gate

Do not enable Safe Fix until:

- P3 validator is merged,
- P4 transaction/rollback exists,
- forced validation failure demonstrably leaves the working design untouched.

## Release target

Current usable line: `0.1.x` Audit-Only + read-only validator development. Next engineering milestone after P3 merge: P4 transaction/rollback foundation.
