# Roadmap

Last updated: 2026-09-08

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE — PR #1 merged |
| P1 | Audit-Only scanner, discovery, scoring, multi-target report UI | COMPLETE — PR #10 merged, issue #2 closed |
| P2 | Deterministic classifier semantics + confidence/role evidence | COMPLETE — PR #11 merged, issue #3 closed |
| P3 | Geometry/content/image + pixel validation | COMPLETE — PR #12 merged, issue #4 closed |
| P4 | Candidate transaction + rollback | COMPLETE — PR #13 merged, issue #5 closed |
| P5 | Safe high-confidence recipes | IN PROGRESS — issue #6, PR #14 |
| P6 | Advanced timeline/carousel/milestones/page normalization | NOT STARTED — issue #7 |
| P7 | Multi-frame/page batch queue | NOT STARTED — issue #8 |
| P8 | Optional Elementor schema exporters | NOT STARTED — issue #9 |

## P5 progress

- [x] P4 merged with final green CI
- [x] P5 branch created from merged P4 head
- [x] draft PR #14 opened
- [x] safe recipe plan/result types
- [x] explicit `ELIGIBLE` / `REVIEW` / `NOOP` / `UNSUPPORTED` decisions
- [x] conservative per-recipe confidence gates
- [x] clone-stable child-index target path mapping
- [x] missing-target refusal
- [x] preservation-role blocker
- [x] visible absolute-child blocker
- [x] fragmented-grid blocker
- [x] ambiguous geometric-grid blocker
- [x] carousel/timeline deferral to P6
- [x] Vertical Stack candidate-transform foundation
- [x] Horizontal Row candidate-transform foundation
- [x] Two Column candidate-transform foundation
- [x] strict live geometry prechecks for linear transforms
- [x] planner regression tests added
- [x] initial CI failures diagnosed and patched
- [x] live disposable-Figma Vertical Stack calibration
- [x] live disposable-Figma Horizontal Row calibration
- [x] live disposable-Figma Two Column calibration
- [x] Figma manual->Auto Layout root-shrink behavior found and fixed
- [x] post-fix linear fixtures preserve root/child geometry exactly
- [x] post-fix linear fixture PNG exports are byte-identical
- [x] live calibration cleanup leaves `0` temporary nodes
- [ ] P5 branch final CI green after latest typing fix
- [ ] full P3 validation pass/fail calibration after recipe transforms
- [ ] P4 discard/commit/undo orchestration proof for recipe transforms
- [ ] Facts List mutation
- [ ] Footer Columns mutation
- [ ] Simple Card Grid mutation
- [ ] Metric Grid semantics + mutation
- [ ] Social/Link Strip semantics + mutation
- [ ] multi-template live calibration
- [ ] PR merged / issue #6 closed

## P5 initial recipe set

1. Vertical Stack
2. Horizontal Row
3. Two Column
4. Facts List
5. Footer Columns
6. Simple Card Grid
7. Metric Grid
8. Social/Link Strip

Every recipe must run through P4 candidate isolation and full P3 validation. Low confidence remains REVIEW.

## Production gate before Safe Fix exposure

- [x] audit classifications explainable across at least 5 materially different real templates
- [x] P2 known high-confidence semantic false positives addressed with regression fixtures
- [x] P3 validation engine merged
- [x] P4 transaction/rollback engine merged
- [x] P4 forced candidate failure demonstrated to leave original unchanged on a live disposable Figma fixture
- [x] P4 manual and Auto Layout root swap/undo mechanics live-calibrated
- [x] first three P5 linear transforms have exact synthetic render-equivalence evidence
- [ ] transformed recipe candidate passes the complete P3->P4 orchestration before commit exposure
- [ ] low-confidence/ambiguous cases demonstrably remain REVIEW with no mutation
- [ ] each production-enabled recipe has multi-template success/failure calibration evidence
