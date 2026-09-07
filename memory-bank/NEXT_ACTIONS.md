# Next Actions

Last updated: 2026-09-07

Execute in this order:

1. Synchronize P1 golden-calibration docs and memory-bank with the confirmed fragmented Numbers grid and green CI.
2. Update draft PR #10 with the final P1 scope/results and mark it ready for review.
3. Merge PR #10 only if latest CI remains green and the diff still contains no design-mutation behavior.
4. After merge, start a focused P2 branch for broader classifier semantics (decorative/overlay roles, timeline/chapter semantics, target de-duplication/ranking).
5. In parallel with P2, identify at least four additional materially different real desktop templates and run Audit-Only calibration on them.
6. Record every meaningful false positive/negative in `PROJECT_STATE`, `CHANGELOG`, and calibration docs; never hard-code customer copy/node IDs into the engine.
7. Begin P3 validator design only after the P2 evidence model is stable enough to specify what a candidate transformation must preserve.
8. Do **not** enable Safe Fix before P3 validator and P4 transaction/rollback foundations exist.

## Immediate definition of success

P1 is merge-ready when:

- selected desktop scan works,
- real section discovery works on the golden fixture,
- strong vs weak readiness is explainable,
- multi-target layout evidence works,
- fragmented grid is detected without inventing a wrapped node,
- Journey false positive remains fixed,
- typecheck/tests/build are green,
- no Figma mutation exists in runtime code.
