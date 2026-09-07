# Next Actions

Last updated: 2026-09-08

Execute in this order:

1. Build/import the current development plugin and run `Developer: P5 Runtime Self-Test` from Figma Desktop.
2. The self-test must exercise the exact compiled path:
   - `SafeRecipePlan`,
   - `runSafeFixTransaction`,
   - P4 candidate clone,
   - candidate-only transform,
   - `FullFrameValidator`,
   - plugin UI Canvas PNG decode/pixel diff,
   - P4 reject/discard or commit,
   - bounded restore.
3. Require both paths to pass:
   - forced rendered drift -> validation REJECTED -> candidate deleted -> original untouched,
   - exact recipe -> full P3 PASS -> P4 COMMITTED -> exact restore -> checkpoint cleared.
4. Require returned pixel metrics on both paths and `0` `__P5RuntimeCalibration__` leftovers.
5. If the compiled self-test fails, keep production mutation disabled and fix the concrete broker/runtime failure before any UI widening.
6. If it passes, expose production Safe Fix only as an explicit user action after read-only preview, with clear result reporting and P4 restore/finalize controls.
7. Re-run CI on the final P5 head, review PR #14, then merge and close issue #6 only when all P5 gates are green.
8. Keep carousel/timeline/advanced page normalization deferred to P6.
9. Continue maintaining README progress bars and the memory-bank after every material milestone.

## Evidence already established

- Vertical Stack, Horizontal Row and Two Column exact synthetic geometry + PNG equivalence.
- Facts List exact synthetic geometry + PNG equivalence; hash `4805:c1887f4a`.
- Footer Columns exact synthetic geometry + PNG equivalence; hash `3225:3421c31e`.
- Simple Card Grid exact 2x2 fixed-track synthetic geometry + PNG equivalence; hash `4476:6ba2b3ec`.
- Metric Grid deterministic semantics + 95% gate + exact synthetic GRID render equivalence.
- Social/Link Strip deterministic semantics + 95% gate + exact synthetic horizontal render equivalence.
- Figma manual->Auto Layout primary-axis shrink discovered and fixed.
- Synthetic P5 lifecycle proved reject/discard, commit/restore, commit/finalize and bounded checkpoint behavior with `0` leftovers.
- Compiled runtime self-test harness implemented and available through the development-plugin menu.
- Real image-bearing clone-only calibration passed across six different desktop roots (`2`, `3`, `4`, `8`, `11`, `13`) with exact direct geometry/PNG equality, preserved image counts, untouched originals and `0` leftovers.
- CI run #84 passed after Metric/Social implementation.

## Immediate success gate

P5 is now blocked primarily on one manual integration proof: execution of the imported plugin's compiled `FullFrameValidator -> UI Canvas pixel broker` inside the real P5/P4 transaction path. Do not enable general Safe Fix before that proof passes.
