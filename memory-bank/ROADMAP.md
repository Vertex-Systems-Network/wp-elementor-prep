# Roadmap

Last updated: 2026-09-07

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE — PR #1 merged |
| P1 | Audit-Only scanner, section discovery, score, report UI | IN PROGRESS — issue #2, PR #10 |
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
- [x] live golden fixture: App + 16 sections discovered in correct order
- [x] live calibration: strong vs weak score separation confirmed
- [x] live calibration: About, Philosophy, Sector, Media, Milestones pattern evidence confirmed
- [x] false-positive case identified: Journey tiny two-column candidate
- [x] stricter two-column gating prepared
- [x] score-status threshold calibration prepared
- [x] PASS-section repair-recipe suppression prepared
- [ ] rerun CI on calibrated fixes
- [ ] rerun live golden fixture after calibrated fixes
- [ ] multi-pattern findings per complex section
- [ ] fixture: split header
- [ ] fixture: timeline chapter
- [ ] test at least 4 more materially different real templates

## Production gate before any Auto-Fix

- [ ] audit classifications explainable across at least 5 real templates
- [ ] no known high-confidence false positive
- [ ] validation engine exists
- [ ] transaction/rollback engine exists
- [ ] failing candidate demonstrably leaves working section unchanged
