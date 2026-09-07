# Roadmap

Last updated: 2026-09-08

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE — PR #1 merged |
| P1 | Audit-Only scanner, discovery, scoring, multi-target report UI | COMPLETE — PR #10 merged, issue #2 closed |
| P2 | Deterministic classifier semantics + confidence/role evidence | MERGE-READY — issue #3, PR #11 |
| P3 | Geometry/content/image + pixel validation | NEXT — issue #4 |
| P4 | Candidate transaction + rollback | NOT STARTED — issue #5 |
| P5 | Safe high-confidence recipes | NOT STARTED — issue #6 |
| P6 | Advanced timeline/carousel/milestones/page normalization | NOT STARTED — issue #7 |
| P7 | Multi-frame/page batch queue | NOT STARTED — issue #8 |
| P8 | Optional Elementor schema exporters | NOT STARTED — issue #9 |

## P2 progress

- [x] same-target specificity ranking/de-duplication
- [x] semantic hint model separated from geometric pattern kind
- [x] repeated-cards semantic hint
- [x] split-header semantic hint + nested-chapter guard
- [x] facts-list semantic hint + repeated-container evidence
- [x] footer-columns semantic hint + shallow lower-row guard
- [x] timeline-chapter semantic hint from nested repeated chapters
- [x] manual full-width text-rich chapter-stack fallback
- [x] minimum five-item timeline gate
- [x] background-layer role evidence
- [x] absolute-overlay role evidence
- [x] conservative decorative-overlay role evidence
- [x] semantic/role output exposed in Audit UI
- [x] ranking/semantics/role unit fixtures
- [x] adversarial overlap/overflow fixtures
- [x] facts-list loose-text/divider adversarial fixture
- [x] footer-columns tall-card adversarial fixture
- [x] four-item non-timeline adversarial fixture
- [x] live P2 role calibration across five templates
- [x] final semantic cross-template false-positive review
- [x] latest P2 code/test head green in CI
- [ ] final docs/memory commit CI green
- [ ] PR #11 merged / issue #3 closed

## Cross-template production calibration

- [x] Marcus Vane golden fixture
- [x] Doctor — highly structured
- [x] Esthetic — almost entirely manual
- [x] Lawyer — almost entirely manual and deeply nested
- [x] Legacy — mixed structured/manual

The five-template audit and semantic calibration requirement is satisfied. It does not authorize mutation by itself.

## P3 planned foundation

- [ ] validation types and versioned thresholds
- [ ] geometry snapshot/fingerprint
- [ ] text-content fingerprint
- [ ] image-fill fingerprint
- [ ] structural sanity checks
- [ ] deterministic compare result with reasons
- [ ] no-op pass fixture
- [ ] geometry/text/image drift failure fixtures
- [ ] section-level PNG export capture
- [ ] Canvas pixel diff in plugin UI
- [ ] calibration of pixel/geometry thresholds

## Production gate before Auto-Fix

- [x] audit classifications explainable across at least 5 materially different real templates
- [x] P2 known high-confidence semantic false positives addressed with regression fixtures
- [ ] P3 validation engine exists
- [ ] P4 transaction/rollback engine exists
- [ ] failing candidate demonstrably leaves working section unchanged
