# WP Elementor Prep

AI-free Figma structure auditor and safe-prep engine for WordPress Elementor.

## Goal

Take an approved desktop Figma design and make its internal layout Elementor-ready **without visually redesigning it**.

`Figma selection -> Audit -> Confidence classification -> Safe Fix -> P3 validation -> P4 transaction -> Report -> optional Elementor export`

The core runtime is deterministic and must not depend on Figma AI, OpenAI, Claude, or another generative service.

## Development status

**Overall roadmap: 63% — P0 through P4 complete, P5 in progress**

`█████████████░░░░░░░ 63%`

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, repository foundation | ✅ Complete |
| P1 | Audit-only scanner, discovery and scoring | ✅ Complete |
| P2 | Deterministic classifier semantics + role evidence | ✅ Complete |
| P3 | Geometry/content/image + rendered pixel validator | ✅ Complete |
| P4 | Candidate transaction engine + rollback/undo | ✅ Complete |
| P5 | Conservative high-confidence Safe Fix recipes | 🟡 In progress |
| P6 | Advanced timeline/carousel/milestone normalization | ⬜ Planned |
| P7 | Multi-frame/page batch queue | ⬜ Planned |
| P8 | Optional versioned Elementor exporter adapters | ⬜ Planned |

### P5 progress

**P5: 70%**

`███████░░░ 70%`

- ✅ deterministic recipe plan/result types
- ✅ high-confidence eligibility gates
- ✅ clone-stable child-index target mapping
- ✅ REVIEW / NOOP / UNSUPPORTED safety decisions
- ✅ special-role / absolute-child / fragmented-grid blockers
- ✅ Vertical Stack candidate transform + exact live calibration
- ✅ Horizontal Row candidate transform + exact live calibration
- ✅ Two Column candidate transform + exact live calibration
- ✅ Facts List semantic transform + exact live calibration
- ✅ Footer Columns semantic transform + exact live calibration
- ✅ Simple Card Grid strict fixed-track transform + exact live calibration
- ✅ Figma manual -> Auto Layout root-shrink behavior discovered and guarded
- ✅ synthetic reject/discard, pass/commit/restore and pass/commit/finalize evidence
- ✅ reusable FullFrameValidator broker + P5/P4 runtime seam
- ✅ read-only Safe Fix preview UI
- 🟡 latest branch CI / compiled runtime proof
- ⬜ Metric Grid semantics + mutation
- ⬜ Social/Link Strip semantics + mutation
- ⬜ multi-template image-bearing mutation calibration

### Safety pipeline

`Audit -> classify -> plan -> clone candidate -> transform candidate -> full P3 validate -> P4 commit OR discard -> bounded undo/finalize`

P4 guarantees candidate isolation. P5 adds conservative semantic/confidence/geometry gates. General production mutation is still disabled until the compiled full-P3 runtime and multi-template mutation calibration are green.

Canonical engineering status lives in `memory-bank/PROJECT_STATE.md`, `memory-bank/ROADMAP.md`, and `memory-bank/NEXT_ACTIONS.md`.

## Current recipe rules

P5 v1 mutation gates:

- Vertical Stack >= 90%
- Horizontal Row >= 90%
- Two Column >= 92%
- Facts List >= 92%
- Footer Columns >= 92%
- non-fragmented Repeated Card Grid >= 94%

Carousel/timeline structures remain deferred to P6. Fragmented grids remain REVIEW.

## Core principles

- Original design is the visual source of truth.
- Never guess when confidence is low.
- Candidate-only mutation; original is never handed to a transformer.
- Full P3 validation is mandatory before P4 commit.
- Elementor-native structure: containers, nested containers, gap, padding, sizing and minimal absolute positioning.
- No external AI/network dependency in the core plugin runtime.
- Memory-bank updates are mandatory after material development work.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

Then import the generated development plugin from `dist/manifest.json` after setting a valid Figma plugin ID.

## Project docs

- `docs/AI_NATIVE_PLAN.md`
- `docs/DEEP_AUDIT.md`
- `docs/FEATURE_PLAN.md`
- `docs/PRE_DEVELOPMENT_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/ELEMENTOR_RULES.md`
- `docs/P3_VALIDATOR_DESIGN.md`
- `docs/P3_PIXEL_CALIBRATION.md`
- `docs/P4_TRANSACTION_DESIGN.md`
- `docs/P4_LIVE_TRANSACTION_CALIBRATION.md`
- `docs/P5_SAFE_RECIPES.md`
- `docs/P5_LINEAR_LIVE_CALIBRATION.md`
- `docs/P5_END_TO_END_TRANSACTION_CALIBRATION.md`
- `docs/P5_SEMANTIC_AND_GRID_LIVE_CALIBRATION.md`
- `memory-bank/` — canonical project state for humans and AI agents

## Golden fixture

The first reference design is the Marcus Vane desktop page, which contains hero, two-column, card, metric, timeline, carousel, milestone and footer patterns. It is a calibration fixture, never hard-coded product logic.
