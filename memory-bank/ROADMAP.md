# Roadmap

Last updated: 2026-09-07

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE — PR #1 merged |
| P1 | Audit-Only scanner, section discovery, score, report UI | IN PROGRESS — issue #2 |
| P2 | Geometry/layout classifier + confidence evidence | PARTIALLY STARTED as P1 foundation; issue #3 remains broader scope |
| P3 | Geometry/content/image + pixel validation | NOT STARTED — issue #4 |
| P4 | Candidate transaction + rollback | NOT STARTED — issue #5 |
| P5 | Safe high-confidence recipes | NOT STARTED — issue #6 |
| P6 | Advanced recipes: timeline/carousel/milestones/page normalization | NOT STARTED — issue #7 |
| P7 | Multi-frame/page batch queue | NOT STARTED — issue #8 |
| P8 | Optional Elementor schema exporters | NOT STARTED — issue #9 |

## P1 detailed progress

- [x] selection/scanner contract
- [x] normalized audit types
- [x] initial statistics
- [x] initial weighted readiness score
- [x] report UI
- [x] CI verification
- [x] first explainable pattern detection primitives
- [x] tests: two-column, grid, background exclusion, carousel overflow
- [ ] robust section discovery calibration
- [ ] golden fixture live calibration
- [ ] fixture: split header
- [ ] fixture: decorative overlap
- [ ] fixture: timeline chapter
- [ ] score weighting calibration

## Production gate before any Auto-Fix

- [ ] audit classifications explainable across fixtures
- [ ] at least 5 materially different real templates tested
- [ ] no known high-confidence false positive
- [ ] validation engine exists
- [ ] transaction/rollback engine exists
- [ ] failing candidate demonstrably leaves working section unchanged
