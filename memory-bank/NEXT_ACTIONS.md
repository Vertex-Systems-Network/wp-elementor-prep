# Next Actions

Last updated: 2026-09-08

Execute in this order:

1. Build/import the current development plugin and run `Developer: P5 Runtime Self-Test` or click the UI `Runtime self-test` action in Figma Desktop.
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
   - forced rendered drift -> validation `REJECTED` -> candidate deleted -> original untouched,
   - exact recipe -> full P3 `PASS` -> P4 `COMMITTED` -> exact restore -> checkpoint cleared.
4. Require returned pixel metrics on both paths and `0` `__P5RuntimeCalibration__` leftovers.
5. Confirm the local versioned runtime proof is written only on a full PASS; a failed rerun must clear/lock the proof.
6. After proof unlocks mutation, use a disposable copy of a real eligible section and run one explicit production UI `Apply this Safe Fix` action:
   - verify fresh re-audit still reports the exact target/recipe as `ELIGIBLE`,
   - verify full P3 passes before commit,
   - verify the UI reports a pending checkpoint,
   - choose `Restore original` and verify the exact original returns with no temporary nodes.
7. Repeat on another disposable copy and choose `Finalize fix`; verify the committed candidate remains, the retained original backup is removed and no checkpoint remains.
8. If any runtime/UI smoke test fails, keep mutation locked or restore the checkpoint and fix the concrete failure before merge.
9. Re-run CI on the final P5 head, perform PR #14 review, mark it ready only when all gates are green, then merge and close issue #6.
10. Keep carousel/timeline/advanced page normalization deferred to P6.

## Evidence already established

- Vertical Stack, Horizontal Row and Two Column exact synthetic geometry + PNG equivalence.
- Facts List exact synthetic geometry + PNG equivalence; hash `4805:c1887f4a`.
- Footer Columns exact synthetic geometry + PNG equivalence; hash `3225:3421c31e`.
- Simple Card Grid exact 2x2 fixed-track synthetic geometry + PNG equivalence; hash `4476:6ba2b3ec`.
- Metric Grid deterministic semantics + 95% gate + exact synthetic GRID render equivalence.
- Social/Link Strip deterministic semantics + 95% gate + exact synthetic horizontal render equivalence.
- Figma manual->Auto Layout primary-axis shrink discovered and fixed.
- Synthetic P5 lifecycle proved reject/discard, commit/restore, commit/finalize and bounded checkpoint behavior with `0` leftovers.
- Compiled runtime self-test harness implemented and available through both plugin menu and UI.
- Versioned mutation proof gate implemented and regression-tested.
- Explicit gated production Safe Fix apply/restore/finalize UI implemented.
- Real image-bearing clone-only calibration passed across six different desktop roots (`2`, `3`, `4`, `8`, `11`, `13`) with exact direct geometry/PNG equality, preserved image counts, untouched originals and `0` leftovers.
- CI run #97 passed install, typecheck, tests and build on the gated production-UI/documentation head.

## Immediate success gate

P5 is blocked primarily on the manual imported-plugin integration proof and a short post-proof disposable production-UI smoke test. Do not treat Safe Fix as production-unlocked until those pass.
