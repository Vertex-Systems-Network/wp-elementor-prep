# Next Actions

Last updated: 2026-09-08

Execute in this order:

1. Get the current `feat/p5-safe-recipes` head green in CI; inspect/fix any remaining typecheck, test or build issue before widening mutation scope.
2. Exercise the compiled `runSafeFixTransaction -> FullFrameValidator -> plugin UI pixel broker -> P4` path on disposable Figma fixtures.
3. Prove through that compiled path:
   - forced validation failure discards the candidate,
   - approved original remains unchanged,
   - passing validation permits commit,
   - restore is exact,
   - finalize is clean,
   - no temporary nodes remain.
4. Keep general production mutation disabled while the compiled runtime proof is pending.
5. Add Metric Grid semantics only after distinguishing metrics from generic repeated cards; fragmented metric cells remain REVIEW.
6. Add Social/Link Strip semantics with conservative row/text/link-like evidence; do not infer from arbitrary horizontal rows.
7. Run mutation calibration on multiple real template families, including image-bearing sections, before enabling a production Safe Fix button.
8. Keep carousel/timeline/advanced page normalization deferred to P6.
9. Update README progress bars, `PROJECT_STATE`, `ROADMAP`, `NEXT_ACTIONS`, and `CHANGELOG` after every material milestone.

## Evidence already established

- Vertical Stack, Horizontal Row and Two Column exact synthetic geometry + PNG equivalence.
- Facts List exact synthetic geometry + PNG equivalence; hash `4805:c1887f4a`.
- Footer Columns exact synthetic geometry + PNG equivalence; hash `3225:3421c31e`.
- Simple Card Grid exact 2x2 fixed-track synthetic geometry + PNG equivalence; hash `4476:6ba2b3ec`.
- Figma manual->Auto Layout primary-axis shrink discovered and fixed.
- Synthetic P5 lifecycle proved reject/discard, commit/restore, commit/finalize and bounded checkpoint behavior with `0` leftovers.

## Immediate success gate

P5 may move toward production exposure only when current CI is green and the compiled full-P3 broker has been proven inside the P5 transaction runtime. Metric/Social recipes and multi-template mutation calibration follow after that.
