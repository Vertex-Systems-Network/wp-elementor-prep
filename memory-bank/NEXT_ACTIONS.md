# Next Actions

Last updated: 2026-09-08

Execute in this order:

1. Confirm CI is green on the final P4 adapter/documentation head.
2. Update PR #13 with final P4 acceptance evidence:
   - candidate-only transform boundary,
   - P3-required commit gate,
   - discard behavior on transform/validation failure,
   - concrete Figma root-swap adapter,
   - bounded backup/undo token,
   - live manual + Auto Layout synthetic transaction calibration,
   - zero-leftover cleanup evidence.
3. Mark PR #13 ready and merge only if CI remains green.
4. Close issue #5 after merge.
5. Create `feat/p5-safe-recipes` from merged `main`.
6. Start P5 with the smallest high-confidence recipes only:
   - Vertical Stack,
   - Horizontal Row,
   - Two Column,
   - Facts List,
   - Footer Columns,
   - Simple Card Grid,
   - Metric Grid,
   - Social/Link Strip.
7. Every P5 mutation must use the P4 candidate transaction adapter and full P3 validation before commit.
8. Low-confidence or semantically ambiguous targets must return REVIEW and must not mutate.
9. Do not begin P6 advanced timeline/carousel/page normalization until P5 simple recipes have live success/failure calibration across multiple template families.

## Immediate definition of success

P4 is complete when:

- forced transform failure leaves the approved original unchanged,
- validation rejection/crash leaves the approved original unchanged,
- failed candidate cleanup is reliable and explicit,
- root commit is available only after passing validation,
- successful commit returns auditable small metadata,
- bounded undo restores the original root when checkpoint assumptions still hold,
- manual and Auto Layout root swap/undo mechanics are live-calibrated on disposable synthetic Frames,
- typecheck/tests/build are green,
- PR #13 is merged and issue #5 is closed.

P5 foundation is successful when at least the first simple high-confidence recipe can mutate only a candidate, pass P3, commit through P4, and roll back safely without any unvalidated edit reaching the approved original.
