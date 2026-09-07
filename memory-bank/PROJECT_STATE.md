# Project State

Last updated: 2026-09-08

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and safely prepares approved desktop Figma layouts for WordPress Elementor-friendly structure.

## Current phase

**P5 conservative Safe Fix recipes — ~95% on `feat/p5-safe-recipes` / draft PR #14.**

Overall roadmap estimate: **67%**.

All eight P5 v1 recipe families are implemented, calibrated and mapped to Elementor intent. The explicit production Safe Fix UI path is now implemented behind a versioned compiled-runtime proof gate. The critical remaining gate is execution of the imported development plugin's compiled runtime self-test before mutation can unlock on a real plugin installation.

## Completed phases

- P0 foundation — PR #1 merged.
- P1 Audit-Only MVP — PR #10 merged; issue #2 closed.
- P2 classifier semantics — PR #11 merged; issue #3 closed.
- P3 integrity + rendered pixel validator — PR #12 merged; issue #4 closed.
- P4 candidate transaction/rollback — PR #13 merged; issue #5 closed.

## P5 implemented

- Safe Recipe plans with `ELIGIBLE`, `REVIEW`, `NOOP`, `UNSUPPORTED`.
- Conservative confidence thresholds and semantic blockers.
- Clone-stable child-index target paths.
- `runSafeFixTransaction` P5 -> P4 integration seam.
- Reusable `FullFrameValidator` broker.
- Read-only `Preview safe fixes` UI.
- Base linear recipes:
  - Vertical Stack,
  - Horizontal Row,
  - Two Column.
- Semantic linear recipes:
  - Facts List only for `facts-list <- vertical-stack`,
  - Footer Columns only for `footer-columns <- horizontal-row`,
  - Social/Link Strip only for `social-link-strip <- horizontal-row`.
- Grid recipes:
  - Simple Card Grid only for high-confidence non-fragmented `repeated-cards <- grid`,
  - Metric Grid only for high-confidence `metric-grid <- grid` with explicit metric/stat naming evidence and simple text-oriented cells.
- Metric Grid and Social/Link Strip use 95% confidence gates.
- Safe-plan preview uses semantic/ranked detections from `classification.ts` rather than raw geometry-only detections.
- Linear/grid transforms contain direct-child post-mutation geometry guards.
- Developer compiled runtime self-test harness implemented in `src/plugin/p5-runtime-calibration.ts` and exposed as both `Developer: P5 Runtime Self-Test` and the UI `Runtime self-test` action.
- Versioned local runtime-proof gate added; missing/stale/failed proof keeps mutation locked.
- Explicit gated production Safe Fix action implemented:
  - re-audits the current selected Frame before applying,
  - accepts only a freshly `ELIGIBLE` target/recipe pair,
  - stages a P4 candidate,
  - requires full P3 including UI Canvas pixel diff,
  - commits only on pass,
  - keeps exactly one bounded restore/finalize checkpoint,
  - blocks further mutation while a checkpoint is pending.
- `Restore original` and explicit irreversible `Finalize fix` UI controls implemented.
- P5 recipe-to-Elementor mappings documented in `docs/P5_SAFE_RECIPES.md` and `docs/ELEMENTOR_RULES.md`.

## Live calibration evidence

### Base linear recipes

Vertical Stack / Horizontal Row / Two Column preserve synthetic root/direct-child geometry plus exported PNG bytes exactly after fixing Figma manual->Auto Layout root shrink.

### P5 transaction lifecycle

Disposable text-bearing fixtures proved:

- forced validation failure -> candidate discarded, original exact,
- pass -> commit -> exact restore,
- pass -> commit -> finalize,
- bounded checkpoint policy,
- `0` temporary nodes left.

This lifecycle calibration used P3-equivalent invariants. The exact compiled `FullFrameValidator` + UI Canvas broker path is implemented as a developer self-test but still needs execution from the imported development plugin.

### Facts List

- root geometry exact: true
- direct-child geometry exact: true
- PNG exact: true
- hash: `4805:c1887f4a`
- mode: `VERTICAL`
- leftovers: `0`

### Footer Columns

- root geometry exact: true
- direct-child geometry exact: true
- PNG exact: true
- hash: `3225:3421c31e`
- mode: `HORIZONTAL`
- leftovers: `0`

### Simple Card Grid

Disposable 2x2 text-bearing grid:

- fixed tracks: columns `210,210`; rows `130,130`
- gaps: column `40`, row `30`
- padding: top `30`, right `40`, bottom `40`, left `40`
- root/direct-child geometry exact: true
- PNG exact: true
- hash: `4476:6ba2b3ec`
- mode: `GRID`
- leftovers: `0`

### Metric Grid

Disposable text-bearing KPI fixture:

- root/direct-child geometry exact: true
- PNG exact: true
- mode: `GRID`
- image/temporary cleanup: clean

### Social/Link Strip

Disposable text-bearing Social Connect fixture:

- root/direct-child geometry exact: true
- PNG exact: true
- mode: `HORIZONTAL`
- temporary cleanup: clean

### Six-template real image-bearing calibration

Clone-only mutations passed on six different desktop roots:

- `2 - Desktop / 2431:18435` — Horizontal — 1 image
- `3 - Desktop / 2431:20032` — Grid — 6 images
- `4 - Desktop / 2431:21512` — Horizontal — 3 images
- `8 - Desktop / 2431:26203` — Grid — 6 images
- `11 - Desktop / 2431:32022` — Grid — 6 images
- `13 - Desktop / 2431:34905` — Horizontal — 3 images

All six preserved root/direct-child geometry, image counts and exported PNG bytes exactly. Approved source nodes remained unchanged and cleanup left `0` temporary nodes.

## CI

CI run #97 completed successfully on the gated production-UI/documentation head: install, typecheck, tests and build all passed.

## In progress

- Import the current development plugin and run `Developer: P5 Runtime Self-Test` (or the UI `Runtime self-test`).
- Require the exact compiled `runSafeFixTransaction -> FullFrameValidator -> UI Canvas pixel broker -> P4` path to pass both forced-reject and pass/commit/restore cases.
- Confirm the runtime proof unlocks Safe Fix only after PASS and is cleared on failure/stale version.
- Exercise one production-gated Safe Fix on a disposable real section, then restore it; separately exercise commit -> finalize on a disposable copy.
- Final PR review, mark PR #14 ready, merge and close issue #6 only when the runtime proof is green.

## Safety status

Production Safe Fix controls are implemented but **mutation remains locked until the compiled runtime proof passes in the imported plugin**. Low-confidence, ambiguous, fragmented, decorative, carousel and timeline cases remain non-mutating. Every recipe still requires candidate isolation + full P3 + P4 commit/rollback.

## Next phases

- Finish P5 and merge PR #14 / close issue #6.
- P6 advanced timeline/carousel/milestones/page normalization.
- P7 batch queue for 60+ frames/pages.
- P8 optional Elementor exporter adapters.
