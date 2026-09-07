# P6 Clone-Only Calibration Contract

P6 advanced recipes must earn mutation eligibility through clone-only evidence before any transformer can be connected to the production P4 commit path.

## Allowed lifecycle

`CALIBRATE plan -> clone approved original -> transform clone -> full P3 validate -> discard clone`

There is intentionally **no commit operation** in the P6 calibration adapter.

A passing validation result is evidence only. It does not mutate, replace or authorize mutation of the approved original.

## Fail-closed rules

- Only `AdvancedRecipePlan.decision === CALIBRATE` can start calibration.
- `REVIEW`, `PRESERVE` and `NOOP` plans are skipped without cloning.
- The adapter must return a candidate handle tied to the requested original id.
- A stale/different plan cannot be substituted after the Figma calibration adapter is created.
- Transform failure triggers candidate discard.
- Validation crash triggers candidate discard.
- Validation rejection still triggers candidate discard and is recorded as `REJECTED` evidence.
- Validation pass still triggers candidate discard and is recorded as `PASSED` evidence.
- Candidate discard failure returns `FAILED` with `leftoverCandidateRisk: true`; production wiring must remain blocked until the leftover is inspected/removed.
- `productionCommitAttempted` is always `false`.

## Concrete Figma calibration adapter

`FigmaAdvancedCalibrationAdapter` wraps the existing P4 candidate staging machinery but exposes only:

- clone
- transform
- validate
- discard

The wrapper does not expose `commitCandidate` through the P6 calibration interface.

## First transformer candidate: page vertical flow

The first concrete P6 transformer is intentionally narrow and calibration-only.

`page-vertical-flow` is attempted only when all of these gates pass:

- decision is `CALIBRATE`,
- recipe/pattern is exactly `page-vertical-flow`,
- `preserveNodeIds` is empty,
- mandatory future Full-P3 + P4 rollback flags are present,
- target is still a manual-layout Frame,
- every direct child is visible,
- no visible direct child is absolute-positioned,
- visual order matches layer order,
- cross-axis origins align within the existing strict linear tolerance,
- primary-axis gaps are uniform within the existing strict linear tolerance,
- all content remains within frame bounds.

The transformer converts only the staged clone to fixed vertical Auto Layout, restores the original root dimensions, and requires direct-child geometry to remain exact within the existing 0.5 px guard. If that guard fails, the transform throws through the calibration runner and the clone is discarded.

`runP6PageFlowCloneCalibration` composes this transformer with the commitless Figma adapter and mandatory Full P3 validator. It is not wired to production Safe Fix UI.

## Current synthetic evidence

CI golden fixtures now cover:

- exact manual geometry -> fixed vertical Auto Layout mapping,
- root width/height preservation,
- direct-child geometry preservation in the synthetic Figma-like fixture,
- refusal when preservation relationships exist,
- refusal with hidden direct children,
- refusal with absolute direct children,
- refusal of non-uniform section gaps,
- refusal of non-CALIBRATE plans.

This is deterministic synthetic evidence only. It does **not** substitute for imported-plugin Figma runtime calibration or real image-bearing template evidence.

## Remaining page-flow evidence

Before this transformer can be considered for P4 production wiring it still needs:

1. imported-plugin clone calibration inside real Figma,
2. full P3 Canvas pixel broker PASS,
3. image-bearing real-template clones,
4. zero leftover candidate nodes across pass/reject/failure cases,
5. confirmation that any page with header/hero or other preservation relationships stays refused by this first recipe,
6. explicit production transaction integration review.

Other advanced recipes remain read-only/review-only until they independently earn the same evidence. Fragmented-card synthesis and carousel/timeline relationships should remain deferred because their wrapper/overflow/preservation semantics are materially more invasive.
