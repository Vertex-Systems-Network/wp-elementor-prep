# WP Elementor Prep

AI-free Figma structure auditor and safe-prep engine for WordPress Elementor.

## Goal

Take an approved desktop Figma design and make its internal layout Elementor-ready **without visually redesigning it**.

`Figma selection -> Audit -> Confidence classification -> Safe Fix -> P3 validation -> P4 transaction -> Report -> optional Elementor export`

The core runtime is deterministic and must not depend on Figma AI, OpenAI, Claude, or another generative service.

## Development status

**Overall roadmap: 67% — P0 through P4 complete, P5 at final integration gate**

`█████████████░░░░░░░ 67%`

| Phase | Scope | Status |
|---|---|---|
| P0 | Specification, architecture, repository foundation | ✅ Complete |
| P1 | Audit-only scanner, discovery and scoring | ✅ Complete |
| P2 | Deterministic classifier semantics + role evidence | ✅ Complete |
| P3 | Geometry/content/image + rendered pixel validator | ✅ Complete |
| P4 | Candidate transaction engine + rollback/undo | ✅ Complete |
| P5 | Conservative high-confidence Safe Fix recipes | 🟡 95% — imported-plugin proof pending |
| P6 | Advanced timeline/carousel/milestone normalization | ⬜ Planned |
| P7 | Multi-frame/page batch queue | ⬜ Planned |
| P8 | Optional versioned Elementor exporter adapters | ⬜ Planned |

### P5 progress

**P5: 95%**

`██████████░ 95%`

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
- ✅ Metric Grid semantics, 95% gate, fixed-grid transform + exact live calibration
- ✅ Social/Link Strip semantics, 95% gate, horizontal transform + exact live calibration
- ✅ Figma manual -> Auto Layout root-shrink behavior discovered and guarded
- ✅ synthetic reject/discard, pass/commit/restore and pass/commit/finalize evidence
- ✅ reusable FullFrameValidator broker + P5/P4 runtime seam
- ✅ compiled P5 runtime self-test harness + developer menu/UI action
- ✅ six-template real image-bearing clone-only mutation calibration
- ✅ read-only Safe Fix preview UI
- ✅ versioned compiled-runtime proof gate
- ✅ explicit gated `Apply this Safe Fix` production path with fresh re-audit
- ✅ bounded `Restore original` / `Finalize fix` checkpoint controls
- ✅ explicit P5 recipe -> Elementor mapping documentation
- ✅ CI #97 green: install, typecheck, tests, build
- 🟡 imported-plugin compiled runtime self-test execution
- ⬜ post-proof disposable production-UI smoke test
- ⬜ PR #14 ready/merge + issue #6 close

### Safety pipeline

`Audit -> classify -> plan -> clone candidate -> transform candidate -> full P3 validate -> P4 commit OR discard -> bounded restore/finalize`

P4 guarantees candidate isolation. P5 adds conservative semantic/confidence/geometry gates. Production mutation controls now exist but remain **locked** until the current plugin build passes its versioned compiled-runtime self-test.

Canonical engineering status lives in `memory-bank/PROJECT_STATE.md`, `memory-bank/ROADMAP.md`, and `memory-bank/NEXT_ACTIONS.md`.

## Current recipe rules

P5 v1 mutation gates:

- Vertical Stack >= 90%
- Horizontal Row >= 90%
- Two Column >= 92%
- Facts List >= 92% only for `facts-list <- vertical-stack`
- Footer Columns >= 92% only for `footer-columns <- horizontal-row`
- non-fragmented Repeated Card Grid >= 94%
- Metric Grid >= 95% with explicit metric/stat/KPI/number naming evidence + simple text-oriented cells
- Social/Link Strip >= 95% with explicit social/follow/connect naming evidence + compact horizontal items

Carousel/timeline structures remain deferred to P6. Fragmented or ambiguous grids remain REVIEW.

## Runtime proof gate

The imported development plugin must pass:

`SafeRecipePlan -> runSafeFixTransaction -> P4 clone -> candidate transform -> FullFrameValidator -> UI Canvas pixel broker -> P4 reject/commit -> restore`

Run either:

`Plugins -> Pella Elementor Prep -> Developer: P5 Runtime Self-Test`

or use the plugin UI `Runtime self-test` action.

A full PASS writes a versioned local proof and unlocks eligible Safe Fix buttons. A failed or stale proof keeps mutation locked.

## Production Safe Fix behavior

When the proof gate is unlocked and no checkpoint is pending:

1. Preview conservative Safe Fix plans.
2. Click `Apply this Safe Fix` on one currently eligible target.
3. The plugin re-audits the selected Frame and refuses stale eligibility.
4. It clones a P4 candidate and transforms the candidate only.
5. Full P3 content/geometry/image/render validation runs, including UI Canvas pixel diff.
6. `REJECTED`/`FAILED` candidates are discarded; the approved original stays unchanged.
7. `COMMITTED` creates one bounded checkpoint.
8. Choose `Restore original` or explicitly `Finalize fix` before any further mutation.

## Real-template calibration

The current linear/grid mutation primitives were clone-calibrated on image-bearing sections from six different real desktop roots (`2`, `3`, `4`, `8`, `11`, `13`). Every clone preserved root geometry, direct-child geometry, image-fill counts and exported PNG bytes exactly; every approved source remained unchanged and cleanup left `0` temporary nodes.

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
- `docs/P5_COMPILED_RUNTIME_SELF_TEST.md`
- `docs/P5_METRIC_SOCIAL_LIVE_CALIBRATION.md`
- `docs/P5_REAL_TEMPLATE_IMAGE_CALIBRATION.md`
- `memory-bank/` — canonical project state for humans and AI agents

## Golden fixture

The first reference design is the Marcus Vane desktop page, which contains hero, two-column, card, metric, timeline, carousel, milestone and footer patterns. It is a calibration fixture, never hard-coded product logic.
