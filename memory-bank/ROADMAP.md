# Roadmap

Last updated: 2026-09-07

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE/PR pending |
| P1 | Audit-Only scanner, section discovery, score, report UI | STARTED |
| P2 | Geometry/layout classifier + confidence evidence | NOT STARTED |
| P3 | Geometry/content/image + pixel validation | NOT STARTED |
| P4 | Candidate transaction + rollback | NOT STARTED |
| P5 | Safe high-confidence recipes | NOT STARTED |
| P6 | Advanced recipes: timeline/carousel/milestones | NOT STARTED |
| P7 | App/page normalizer | NOT STARTED |
| P8 | Multi-frame/page batch queue | NOT STARTED |
| P9 | Optional Elementor schema exporters | NOT STARTED |

## P1 detailed progress

- [x] selection/scanner contract drafted
- [x] normalized audit types scaffolded
- [x] initial statistics implementation scaffolded
- [x] initial weighted readiness score scaffolded
- [x] simple report UI scaffolded
- [ ] CI verification
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
