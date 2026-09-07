# Roadmap

Last updated: 2026-09-07

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE — PR #1 merged |
| P1 | Audit-Only scanner, section discovery, score, report UI | IN PROGRESS — issue #2, PR #10; golden calibration stable |
| P2 | Geometry/layout classifier + confidence evidence | PARTIALLY STARTED as P1 foundation; multi-pattern reporting added; issue #3 remains broader scope |
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
- [x] stricter two-column gate removes Journey false-positive
- [x] calibrated status thresholds active
- [x] PASS-section repair-recipe suppression active
- [x] CI green after SceneNode opacity type guard
- [x] multi-pattern reporting implementation prepared
- [x] fixture coverage prepared for split-header-style and timeline/chapter structures
- [ ] CI on multi-pattern change
- [ ] live Numbers multi-pattern calibration
- [ ] test at least 4 more materially different real templates

## Production gate before any Auto-Fix

- [ ] audit classifications explainable across at least 5 real templates
- [ ] no known high-confidence false positive
- [ ] validation engine exists
- [ ] transaction/rollback engine exists
- [ ] failing candidate demonstrably leaves working section unchanged
