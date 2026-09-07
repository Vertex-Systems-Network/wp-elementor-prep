# Next Actions

Last updated: 2026-09-07

Execute in this order:

1. Commit the multi-pattern Audit-Only upgrade on `feat/p1-audit-engine`.
2. Run CI and fix any typecheck/test/build failure immediately.
3. Rerun the live golden Figma audit using multi-pattern reporting; confirm Numbers exposes both its metric grid and lower two-column target without regressing Journey/Media.
4. If multi-pattern calibration is stable, update PR #10 from draft to ready and merge only with green CI.
5. Test Audit-Only on at least four more materially different real templates and record section-discovery/classifier discrepancies.
6. Finish issue #2 only when no known high-confidence false positive remains on the five-template calibration set.
7. Continue issue #3 with broader decoration/timeline classification after P1 is stable.
8. Do **not** implement Safe Fix before P3 validator and P4 transaction foundations exist.

## Immediate definition of success

P1 checkpoint is reached when the plugin scans a selected desktop frame, discovers real sections, separates strong/weak readiness, and exposes multiple explainable layout targets in complex sections without mutating the Figma document.
