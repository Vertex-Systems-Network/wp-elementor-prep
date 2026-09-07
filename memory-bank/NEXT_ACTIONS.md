# Next Actions

Last updated: 2026-09-08

Execute in this order:

1. Open draft PR for `feat/p5-safe-recipes` so CI runs on the P5 foundation.
2. Fix any typecheck/test/build failures before enabling any live mutation calibration.
3. Live-calibrate the three linear recipes on disposable synthetic Figma Frames:
   - Vertical Stack,
   - Horizontal Row,
   - Two Column.
4. For each calibration, prove:
   - the approved original is untouched during candidate transform,
   - candidate target path resolves deterministically,
   - strict geometry prechecks reject unsafe cases,
   - accepted transforms preserve root/content geometry closely enough for full P3,
   - P3 failure discards candidate through P4,
   - P3 pass can commit through P4 and undo/finalize remains bounded.
5. Add regression fixtures for any live failure mode found during calibration.
6. Enable Facts List and Footer Columns mutation only after linear recipes are stable.
7. Enable Simple Card Grid only for non-fragmented repeated-card semantics with explicit grid-track sizing evidence.
8. Do not enable Metric Grid or Social/Link Strip mutation until conservative semantics exist for them.
9. Keep carousel/timeline/advanced page normalization deferred to P6.
10. Maintain the README GitHub progress bar after each material milestone.

## Immediate definition of success

P5 foundation is successful when:

- planner decisions are deterministic and explainable,
- low confidence defaults to REVIEW,
- ambiguous grid / fragmented grid / special visual roles do not mutate,
- candidate target mapping does not depend on clone descendant IDs,
- Vertical Stack / Horizontal Row / Two Column transforms operate only on staged candidates,
- full P3 remains mandatory before P4 commit,
- typecheck/tests/build are green.

The first production-capable recipe is successful only after live disposable-Figma success and forced-failure evidence also passes.
