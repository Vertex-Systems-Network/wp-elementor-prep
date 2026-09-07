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

## Overall progress

`█████████████░░░░░░░ 63%`

## P5 progress

`███████░░░ 70%`

- [x] P4 merged with final green CI
- [x] Safe Recipe plan/result types
- [x] `ELIGIBLE` / `REVIEW` / `NOOP` / `UNSUPPORTED`
- [x] conservative per-recipe confidence gates
- [x] clone-stable child-index target mapping
- [x] preservation-role / absolute-child / fragmented-grid blockers
- [x] Vertical Stack transform + exact live calibration
- [x] Horizontal Row transform + exact live calibration
- [x] Two Column transform + exact live calibration
- [x] Facts List semantic transform + exact live calibration
- [x] Footer Columns semantic transform + exact live calibration
- [x] Simple Card Grid strict fixed-track transform + exact live calibration
- [x] manual->Auto Layout root-shrink guard
- [x] synthetic reject -> discard proof
- [x] synthetic pass -> commit -> restore proof
- [x] synthetic pass -> commit -> finalize proof
- [x] bounded checkpoint proof
- [x] reusable FullFrameValidator broker
- [x] P5 -> P4 transaction integration seam
- [x] read-only Safe Fix preview UI
- [x] semantic classifier wired into Safe Fix preview
- [x] pure linear/grid geometry regression suites
- [ ] final current-head CI green
- [ ] compiled `runSafeFixTransaction -> FullFrameValidator -> UI pixel broker -> P4` runtime proof
- [ ] Metric Grid semantics + mutation
- [ ] Social/Link Strip semantics + mutation
- [ ] multi-template real-frame/image-bearing mutation calibration
- [ ] production Safe Fix UI gate
- [ ] PR #14 merged / issue #6 closed

## Production gate before Safe Fix exposure

- [x] audit classifications calibrated across at least 5 materially different templates
- [x] semantic false positives covered by regressions
- [x] P3 validator merged
- [x] P4 transaction/rollback merged
- [x] base linear recipes preserve exact synthetic geometry/render
- [x] Facts List / Footer Columns preserve exact synthetic geometry/render
- [x] Simple Card Grid preserves exact synthetic geometry/render
- [x] synthetic reject/discard + commit/restore/finalize lifecycle demonstrated
- [ ] current P5 head green in CI
- [ ] compiled full-P3 broker exercised through actual P5 transaction runtime
- [ ] real image-bearing multi-template mutation calibration passes
- [ ] low-confidence/ambiguous cases remain non-mutating in production UI
