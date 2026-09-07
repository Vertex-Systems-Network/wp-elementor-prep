# Roadmap

Last updated: 2026-09-07

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE — PR #1 merged |
| P1 | Audit-Only scanner, discovery, scoring, multi-target report UI | COMPLETE — PR #10 merged, issue #2 closed |
| P2 | Broader deterministic classifier semantics + confidence/role evidence | IN PROGRESS — issue #3, PR #11 |
| P3 | Geometry/content/image + pixel validation | NOT STARTED — issue #4 |
| P4 | Candidate transaction + rollback | NOT STARTED — issue #5 |
| P5 | Safe high-confidence recipes | NOT STARTED — issue #6 |
| P6 | Advanced timeline/carousel/milestones/page normalization | NOT STARTED — issue #7 |
| P7 | Multi-frame/page batch queue | NOT STARTED — issue #8 |
| P8 | Optional Elementor schema exporters | NOT STARTED — issue #9 |

## P2 progress

- [x] same-target specificity ranking/de-duplication
- [x] semantic hint model separated from geometric pattern kind
- [x] repeated-cards semantic hint
- [x] split-header semantic hint
- [x] facts-list semantic hint
- [x] footer-columns semantic hint
- [x] timeline-chapter semantic hint from nested repeated chapters
- [x] manual full-width text-rich chapter-stack fallback
- [x] background-layer role evidence
- [x] absolute-overlay role evidence
- [x] conservative decorative-overlay role evidence
- [x] semantic/role output exposed in Audit UI
- [x] ranking/semantics/role unit fixtures
- [x] adversarial overlap fixture
- [x] carousel overflow fixture retained from P1
- [x] live P2 role calibration across five templates
- [ ] dedicated facts-list adversarial fixture
- [ ] dedicated footer-columns adversarial fixture
- [ ] final semantic cross-template false-positive review
- [ ] latest CI green on final P2 head

## Cross-template production calibration

- [x] Marcus Vane golden fixture
- [x] Doctor — highly structured
- [x] Esthetic — almost entirely manual
- [x] Lawyer — almost entirely manual and deeply nested
- [x] Legacy — mixed structured/manual

The five-template audit calibration requirement is satisfied. It does not authorize mutation by itself.

## Production gate before Auto-Fix

- [x] audit classifications explainable across at least 5 materially different real templates at broad readiness level
- [ ] P2 finalized with no known high-confidence semantic/role false positive
- [ ] P3 validation engine exists
- [ ] P4 transaction/rollback engine exists
- [ ] failing candidate demonstrably leaves working section unchanged
