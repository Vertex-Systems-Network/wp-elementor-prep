# Next Actions

Last updated: 2026-09-07

Execute in this order:

1. Commit the P1 classifier/scanner updates on `feat/p1-audit-engine`.
2. Run CI; fix all typecheck/test/build failures before adding more classifier logic.
3. Run the Audit-Only engine against the live golden Figma frame and capture:
   - discovered section count/order,
   - score per section,
   - detected pattern/confidence per section.
4. Compare results to manual expectations:
   - strong: Hero/Identity/Recognition/Expertise/Credentials/Quote/Testimonials,
   - weak/needs work: About/Philosophy/Journey/Numbers/Sector/Beyond Work/Media/Milestones/Contact/Social Strip.
5. Tune section discovery and scoring without hard-coding section names.
6. Add split-header, decorative-overlap and timeline fixtures.
7. Open/merge the P1 PR only when CI is green and golden calibration is recorded.
8. Do not implement mutation recipes yet.

## Immediate definition of success

P1 checkpoint is reached when the read-only report consistently discovers the real page sections and produces explainable scores/pattern detections close enough to the manual audit that discrepancies can be reasoned about rather than guessed.
