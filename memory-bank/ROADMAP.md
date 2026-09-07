# Roadmap

Last updated: 2026-09-07

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE on PR #1; CI PASS |
| P1 | Audit-Only scanner, section discovery, score, report UI | STARTED — issue #2 |
| P2 | Geometry/layout classifier + confidence evidence | NOT STARTED — issue #3 |
| P3 | Geometry/content/image + pixel validation | NOT STARTED — issue #4 |
| P4 | Candidate transaction + rollback | NOT STARTED — issue #5 |
| P5 | Safe high-confidence recipes | NOT STARTED — issue #6 |
| P6 | Advanced recipes: timeline/carousel/milestones/page normalization | NOT STARTED — issue #7 |
| P7 | Multi-frame/page batch queue | NOT STARTED — issue #8 |
| P8 | Optional Elementor schema exporters | NOT STARTED — issue #9 |

## P1 detailed progress

- [x] selection/scanner contract drafted
- [x] normalized audit types scaffolded
- [x] initial statistics implementation scaffolded
- [x] initial weighted readiness score scaffolded
- [x] simple report UI scaffolded
- [x] CI verification
- [ ] robust section discovery
- [ ] explainable finding model expansion
- [ ] golden fixture calibration
- [ ] additional fixture JSON

## Production gate before any Auto-Fix

All must be true:

- [ ] audit classifications are explainable
- [ ] at least 5 materially different real templates tested
- [ ] no known high-confidence false positive in fixtures
- [ ] validation engine exists
- [ ] transaction/rollback engine exists
- [ ] failing candidate demonstrably leaves working section unchanged
