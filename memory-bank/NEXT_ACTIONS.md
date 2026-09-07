# Next Actions

Last updated: 2026-09-07

Execute in this order:

1. Commit the golden-calibration fixes to `feat/p1-audit-engine`:
   - stricter two-column coverage/width gate,
   - PASS >=80 / REVIEW 70–79 / NEEDS_WORK <70,
   - no repair recipe for PASS sections,
   - Journey false-positive regression test,
   - golden calibration documentation.
2. Run CI and fix any typecheck/test/build failure immediately.
3. Rerun the live golden Figma audit and confirm the Journey false positive is gone or reduced to an explainable lower-confidence detection.
4. Add multi-pattern reporting so complex sections can expose more than one meaningful target; Numbers is the first calibration case.
5. Add split-header and timeline/chapter fixtures.
6. Update PR #10 with calibration results and mark ready only when its acceptance criteria are met.
7. Test Audit-Only on at least four more materially different real templates before beginning mutation safety work.
8. Do **not** implement Safe Fix before P3 validator and P4 transaction foundations exist.

## Immediate definition of success

P1 checkpoint is reached when the plugin can scan the golden frame, discover all real sections, classify strong/weak readiness correctly, and provide explainable pattern evidence without a known high-confidence false positive.
