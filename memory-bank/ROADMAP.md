# Roadmap

Last updated: 2026-09-08

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE — PR #1 merged |
| P1 | Audit-Only scanner, discovery, scoring, multi-target report UI | COMPLETE — PR #10 merged, issue #2 closed |
| P2 | Deterministic classifier semantics + confidence/role evidence | COMPLETE — PR #11 merged, issue #3 closed |
| P3 | Geometry/content/image + pixel validation | COMPLETE — PR #12 merged, issue #4 closed |
| P4 | Candidate transaction + rollback | IN PROGRESS — issue #5, PR #13 |
| P5 | Safe high-confidence recipes | NOT STARTED — issue #6 |
| P6 | Advanced timeline/carousel/milestones/page normalization | NOT STARTED — issue #7 |
| P7 | Multi-frame/page batch queue | NOT STARTED — issue #8 |
| P8 | Optional Elementor schema exporters | NOT STARTED — issue #9 |

## P4 progress

- [x] explicit transaction state model
- [x] candidate handle / adapter boundary
- [x] transformer receives candidate only
- [x] commit blocked until P3 passes
- [x] transform failure -> discard
- [x] validation crash/rejection -> discard
- [x] cleanup failure surfaced explicitly
- [x] commit-stage failure separated from pre-commit cleanup
- [x] successful commit evidence is serializable/small
- [x] no large design snapshots in transaction metadata
- [x] forced-transform failure unit fixture
- [x] rejected-validation isolation fixture
- [x] concrete Figma candidate staging adapter
- [x] stale original-parent guard
- [x] stale transaction guard
- [x] root-boundary commit/swap
- [x] hidden bounded original backup
- [x] compact clientStorage undo token
- [x] restore-last-commit implementation
- [x] Auto Layout child properties applied after parent insertion
- [x] live forced-failure calibration on disposable Figma Frames
- [x] live manual-parent swap + undo calibration
- [x] live Auto Layout parent swap + undo calibration
- [x] all live calibration temporary nodes cleaned (`0` leftovers)
- [ ] final P4 docs/memory head green in CI
- [ ] PR #13 merged / issue #5 closed

## P5 initial recipe set

P5 starts only after P4 merge and remains confidence-gated:

1. Vertical Stack
2. Horizontal Row
3. Two Column
4. Facts List
5. Footer Columns
6. Simple Card Grid
7. Metric Grid
8. Social/Link Strip

Every recipe must run through P4 candidate isolation and full P3 validation. Low confidence remains REVIEW.

## Production gate before Safe Fix

- [x] audit classifications explainable across at least 5 materially different real templates
- [x] P2 known high-confidence semantic false positives addressed with regression fixtures
- [x] P3 validation engine merged
- [x] P4 forced candidate failure demonstrated to leave original unchanged on a live disposable Figma fixture
- [x] P4 manual and Auto Layout root swap/undo mechanics live-calibrated
- [ ] P4 merged with final green CI
- [ ] individual P5 recipe has high-confidence classifier + transformation + regression/live calibration evidence
