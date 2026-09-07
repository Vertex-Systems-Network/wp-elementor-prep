# Roadmap

Last updated: 2026-09-07

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE — PR #1 merged |
| P1 | Audit-Only scanner, discovery, scoring, multi-target report UI | MERGE-READY pending final PR #10 sync |
| P2 | Broader deterministic classifier semantics + confidence evidence | NEXT — issue #3 |
| P3 | Geometry/content/image + pixel validation | NOT STARTED — issue #4 |
| P4 | Candidate transaction + rollback | NOT STARTED — issue #5 |
| P5 | Safe high-confidence recipes | NOT STARTED — issue #6 |
| P6 | Advanced timeline/carousel/milestones/page normalization | NOT STARTED — issue #7 |
| P7 | Multi-frame/page batch queue | NOT STARTED — issue #8 |
| P8 | Optional Elementor schema exporters | NOT STARTED — issue #9 |

## P1 completed capability

- [x] selected-frame scanner
- [x] normalized audit schema
- [x] section-wrapper discovery
- [x] readiness statistics and calibrated status thresholds
- [x] explainable findings
- [x] two-column classifier
- [x] horizontal-row classifier
- [x] vertical-stack classifier
- [x] coherent-grid classifier
- [x] carousel-track classifier
- [x] conservative full-size background exclusion
- [x] multi-target detections per complex section
- [x] fragmented-grid detection for unwrapped visual cells
- [x] PASS-section recipe suppression
- [x] Journey false-positive regression protection
- [x] split-header-style regression fixture
- [x] timeline/chapter structural fixture
- [x] Numbers fragmented-grid fixture
- [x] live golden Figma calibration
- [x] typecheck/tests/build green

## Cross-template production calibration

- [x] Marcus Vane golden fixture
- [ ] real template 2
- [ ] real template 3
- [ ] real template 4
- [ ] real template 5

This five-template calibration is a production mutation gate, not a reason to enable Safe Fix early.

## Production gate before Auto-Fix

- [ ] audit classifications explainable across at least 5 materially different real templates
- [ ] no known high-confidence false positive
- [ ] P3 validation engine exists
- [ ] P4 transaction/rollback engine exists
- [ ] failing candidate demonstrably leaves working section unchanged
