# Next Actions

Last updated: 2026-09-08

Execute in this order:

1. Wait for / inspect CI on the latest `feat/p5-safe-recipes` head and fix any remaining typecheck/test/build failure before expanding mutation scope.
2. Exercise the compiled `FullFrameValidator` broker through `runSafeFixTransaction` so the production runtime path proves:
   - candidate-only recipe transform,
   - full P3 geometry/content/image snapshot validation,
   - plugin-UI rendered pixel comparison,
   - rejected validation -> candidate discard,
   - passing validation -> P4 commit.
3. Add regression coverage around the P5 runtime seam where it can be kept deterministic outside Figma.
4. Keep the current read-only `Preview safe fixes` UI available while general mutation remains disabled.
5. Once the compiled runtime path is green, enable Facts List mutation with its own strict geometry/semantic prechecks and P3/P4 calibration.
6. Enable Footer Columns next, using shallow footer/contact-row semantics only.
7. Enable Simple Card Grid only for non-fragmented repeated-card semantics with explicit row/column sizing evidence.
8. Do not enable Metric Grid or Social/Link Strip mutation until conservative semantics exist for them.
9. Keep carousel/timeline/advanced page normalization deferred to P6.
10. Re-run mutation calibration across multiple real template families before exposing a production Safe Fix button.
11. Maintain `README.md`, `PROJECT_STATE.md`, `ROADMAP.md`, `NEXT_ACTIONS.md` and `CHANGELOG.md` after every material milestone.

## Evidence already established

- Vertical Stack / Horizontal Row / Two Column candidate transforms preserve synthetic root/child geometry and PNG bytes exactly.
- A Figma primary-axis shrink during manual -> Auto Layout transition was discovered and fixed by restoring exact target bounds after layout configuration.
- End-to-end disposable calibration proved:
  - forced validation failure deletes the candidate while the approved original remains exact,
  - passing validation permits root commit,
  - restore returns the exact original and removes candidate/backup,
  - finalize retains the committed candidate and deletes the old original/backup,
  - cleanup leaves `0` temporary nodes.

## Immediate definition of success

The next P5 gate is successful when:

- current branch CI is green,
- the actual compiled FullFrameValidator pixel broker is used by a P5 transaction,
- forced rejection through that path discards the candidate with original untouched,
- a passing candidate commits through P4 and remains restorable/finalizable,
- no broad production mutation is exposed before these checks pass.
