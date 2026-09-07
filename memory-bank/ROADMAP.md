# Roadmap

Last updated: 2026-09-08

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE — PR #1 merged |
| P1 | Audit-Only scanner, discovery, scoring, multi-target report UI | COMPLETE — PR #10 merged, issue #2 closed |
| P2 | Deterministic classifier semantics + confidence/role evidence | COMPLETE — PR #11 merged, issue #3 closed |
| P3 | Geometry/content/image + pixel validation | COMPLETE — PR #12 merged, issue #4 closed |
| P4 | Candidate transaction + rollback | COMPLETE — PR #13 merged, issue #5 closed |
| P5 | Safe high-confidence recipes | IN PROGRESS — issue #6, PR #14, `feat/p5-safe-recipes` |
| P6 | Advanced timeline/carousel/milestones/page normalization | NOT STARTED — issue #7 |
| P7 | Multi-frame/page batch queue | NOT STARTED — issue #8 |
| P8 | Optional Elementor schema exporters | NOT STARTED — issue #9 |

## P5 progress

**Estimated P5 completion: 55%**

`██████░░░░ 55%`

- [x] P4 merged with final green CI
- [x] P5 branch created from merged P4 head
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
- [x] P5 root-shrink transition bug found and fixed
- [x] exact geometry + PNG live calibration for all three linear recipes
- [x] reusable full-P3 frame validation broker added
- [x] P5 -> P4 transaction integration seam added
- [x] read-only Safe Fix preview UI added
- [x] forced synthetic validation rejection -> candidate discard proof
- [x] passing synthetic validation -> commit -> exact restore proof
- [x] passing synthetic validation -> commit -> finalize proof
- [x] bounded single-checkpoint policy exercised in end-to-end calibration
- [x] calibration cleanup leaves `0` temporary nodes
- [ ] final P5 branch CI green on current head
- [ ] compiled FullFrameValidator broker exercised through the actual P5 runtime
- [ ] Facts List mutation
- [ ] Footer Columns mutation
- [ ] Simple Card Grid mutation
- [ ] Metric Grid semantics + mutation
- [ ] Social/Link Strip semantics + mutation
- [ ] multi-template live mutation calibration
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
- [x] first P5 linear transforms have exact synthetic geometry/render equivalence
- [x] synthetic reject/discard and pass/commit/restore/finalize lifecycle demonstrated
- [ ] current P5 branch green in CI
- [ ] individual recipe proves compiled full-P3 broker + P4 commit path
- [ ] low-confidence/ambiguous cases demonstrably remain REVIEW with no mutation
- [ ] multi-template mutation calibration passes before production exposure
