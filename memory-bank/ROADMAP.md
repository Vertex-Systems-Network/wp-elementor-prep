# Roadmap

Last updated: 2026-09-08

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, memory-bank, repo foundation | COMPLETE — PR #1 merged |
| P1 | Audit-Only scanner, discovery, scoring, multi-target report UI | COMPLETE — PR #10 merged, issue #2 closed |
| P2 | Deterministic classifier semantics + confidence/role evidence | COMPLETE — PR #11 merged, issue #3 closed |
| P3 | Geometry/content/image + pixel validation | IN PROGRESS — issue #4, PR #12 |
| P4 | Candidate transaction + rollback | NOT STARTED — issue #5 |
| P5 | Safe high-confidence recipes | NOT STARTED — issue #6 |
| P6 | Advanced timeline/carousel/milestones/page normalization | NOT STARTED — issue #7 |
| P7 | Multi-frame/page batch queue | NOT STARTED — issue #8 |
| P8 | Optional Elementor schema exporters | NOT STARTED — issue #9 |

## P3 progress

- [x] versioned validation types and thresholds
- [x] root section geometry validation
- [x] text-content fingerprints
- [x] image-fill fingerprints
- [x] section-relative text/image anchors
- [x] duplicate-content matching independent of node IDs
- [x] wrapper/node-count changes allowed when visible invariants match
- [x] explicit geometry/content/image failure reasons
- [x] no-op pass fixture
- [x] geometry/text/image drift failure fixtures
- [x] invalid-geometry fixture
- [x] section-level PNG export capture
- [x] bounded render scale for tall/large sections
- [x] Canvas/ImageData decoding in plugin UI
- [x] deterministic RGBA pixel metrics
- [x] explicit pixel dimension mismatch failure
- [x] explicit pixel-threshold failure
- [x] versioned pixel thresholds
- [x] pixel unit fixtures
- [x] representative live no-op PNG calibration
- [x] live About/Journey/Contact repeated exports byte-identical
- [x] latest pixel-validation code head green in CI
- [ ] final docs/memory head green in CI
- [ ] PR #12 merged / issue #4 closed

## Cross-template production calibration

- [x] Marcus Vane golden fixture
- [x] Doctor — highly structured
- [x] Esthetic — almost entirely manual
- [x] Lawyer — almost entirely manual and deeply nested
- [x] Legacy — mixed structured/manual

The five-template audit/semantic calibration and representative P3 no-op render calibration are satisfied. None of these authorize mutation by themselves.

## Production gate before Auto-Fix

- [x] audit classifications explainable across at least 5 materially different real templates
- [x] P2 known high-confidence semantic false positives addressed with regression fixtures
- [ ] P3 validation engine merged
- [ ] P4 transaction/rollback engine exists
- [ ] failing candidate demonstrably leaves working section unchanged
