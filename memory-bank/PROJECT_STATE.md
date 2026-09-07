# Project State

Last updated: 2026-09-08

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and safely prepares approved desktop Figma layouts for WordPress Elementor-friendly structure.

## Current phase

**P5 conservative Safe Fix recipes — ~70% on `feat/p5-safe-recipes` / draft PR #14.**

Overall roadmap estimate: **63%**.

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
- Read-only `Preview safe fixes` UI; production mutation remains disabled.
- Base linear recipes:
  - Vertical Stack,
  - Horizontal Row,
  - Two Column.
- Semantic linear recipes:
  - Facts List only for `facts-list <- vertical-stack`,
  - Footer Columns only for `footer-columns <- horizontal-row`.
- Simple Card Grid only for high-confidence non-fragmented `repeated-cards <- grid`.
- Safe-plan preview corrected to use `classification.ts` semantic/ranked detections rather than the raw geometry-only classifier.
- Linear analyzer out-of-bounds regression fixture corrected so it reaches the intended bounds gate.

## Live calibration evidence

### Base linear recipes

Vertical Stack / Horizontal Row / Two Column now preserve synthetic root and direct-child geometry plus exported PNG bytes exactly after fixing Figma manual->Auto Layout root shrink.

### P5 transaction lifecycle

Disposable text-bearing fixtures proved:

- forced validation failure -> candidate discarded, original exact,
- pass -> commit -> exact restore,
- pass -> commit -> finalize,
- bounded checkpoint policy,
- `0` temporary nodes left.

This calibration used P3-equivalent invariants; compiled `FullFrameValidator` + UI Canvas broker still needs direct runtime proof.

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

## In progress

- Latest branch CI after semantic/grid additions.
- Compiled `runSafeFixTransaction -> FullFrameValidator -> UI pixel broker -> P4` runtime proof.
- Metric Grid semantics + mutation.
- Social/Link Strip semantics + mutation.
- Multi-template real-frame/image-bearing mutation calibration.

## Safety status

General production Safe Fix is **not exposed**. Low-confidence, ambiguous, fragmented, decorative, carousel and timeline cases remain non-mutating. Every future recipe must still pass candidate isolation + full P3 + P4 commit/rollback gates.

## Next phases

- Finish P5 and merge PR #14 / close issue #6.
- P6 advanced timeline/carousel/milestones/page normalization.
- P7 batch queue for 60+ frames/pages.
- P8 optional Elementor exporter adapters.
