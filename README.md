# WP Elementor Prep

AI-free Figma structure auditor and safe-prep engine for WordPress Elementor.

## Goal

Take an approved desktop Figma design and make its internal layout Elementor-ready **without visually redesigning it**. The long-term workflow is:

`Figma selection -> Audit -> Confidence classification -> Safe Fix -> Visual/geometry validation -> Report -> optional Elementor export`

The plugin is intentionally deterministic. It must not depend on Figma AI, OpenAI, Claude, or any other generative service for its core audit/refactor pipeline.

## Development status

**Overall roadmap: 58% — P0 through P4 complete, P5 in progress**

`████████████░░░░░░░░ 58%`

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

### P5 recipe progress

`███░░░░░░░ 30% foundation`

- ✅ deterministic recipe plan/result types
- ✅ high-confidence eligibility gates
- ✅ clone-stable child-index target mapping
- ✅ REVIEW/NOOP/UNSUPPORTED safety decisions
- ✅ special-role / absolute-child / fragmented-grid blockers
- ✅ strict candidate-only Vertical Stack transform foundation
- ✅ strict candidate-only Horizontal Row transform foundation
- ✅ strict candidate-only Two Column transform foundation
- 🟡 live Figma calibration pending
- ⬜ Facts List mutation
- ⬜ Footer Columns mutation
- ⬜ Simple Card Grid mutation
- ⬜ Metric Grid semantics + mutation
- ⬜ Social/Link Strip semantics + mutation

### Safety pipeline

`Audit -> classify -> plan -> clone candidate -> transform candidate -> P3 validate -> commit/swap OR discard -> bounded undo/finalize`

P4 enforces candidate isolation: the approved original is never passed to the transformer, a commit cannot occur until validation passes, and only one pending undo checkpoint may exist at a time.

P5 adds a second gate: low-confidence or semantically ambiguous detections stay in REVIEW and do not receive a mutation plan.

Canonical engineering status lives in `memory-bank/PROJECT_STATE.md` and `memory-bank/ROADMAP.md`.

## Current phase

**P5: conservative Safe Fix recipe foundation.**

P4 is merged and issue #5 is closed. P5 currently enables planning for the initial recipe family and candidate-only transform foundations for the simplest linear layouts. General Safe Fix is not yet exposed as a production action until the new recipes pass CI and live disposable-Figma calibration through P3/P4.

## Core principles

- Original design is the visual source of truth.
- Never guess when confidence is low.
- Audit first; mutate only after the audit engine is proven.
- Candidate/validate/commit transactions for fixes.
- Elementor-native output: containers, nested containers, widgets, gap, padding, sizing, minimal absolute positioning.
- No external AI/network dependency in the core plugin runtime.
- Memory-bank is mandatory and must be updated with every meaningful development session.

## Development

```bash
npm install
npm run build
npm test
```

Then register/import the development plugin in Figma using the generated `dist/manifest.json` after setting a valid plugin ID in `.env` or `FIGMA_PLUGIN_ID`.

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
- `memory-bank/` — canonical project state for humans and AI agents

## Golden fixture

The first reference design is the Marcus Vane desktop page that contains a broad mix of patterns: hero, two-column about, cards, metrics, timeline/journey, carousel/media, milestones, and footer. It is used as a **golden audit fixture**, not as hard-coded product logic.
