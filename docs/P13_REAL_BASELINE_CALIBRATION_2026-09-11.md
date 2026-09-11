# P13 Real-Baseline Calibration — 2026-09-11

Status: CALIBRATION CANDIDATE ACCEPTED FOR PR / NOT PRODUCTION ACCEPTANCE  
Issue: #157  
Roadmap: #119  
P12 final release gate: #84 still required

## Purpose

Calibrate Build-Ready Score 2.0 and Responsive Risk v1 against the already-retained real Pella Nova P9/P10 canonical Figma snapshot without committing private design snapshot data to this public repository.

The retained source snapshot remains outside the repository. Only aggregate metrics, deterministic hashes, rule behavior and provenance are recorded here.

## Retained baseline identity

- accepted P10 canonical snapshot SHA-256: `4be96429f3452f813330629a3e9b51bb331a7bc7be037c1c75448d56fcdaf720`
- accepted audit-v1 baseline: `75 / REVIEW`
- nodes: `1152`
- containers: `715`
- Auto Layout containers: `270`
- manual containers: `445`
- Auto Layout coverage: `38%`
- text nodes / auto-height text nodes: `433 / 433`
- generic names: `613`
- absolute-positioned nodes: `8`
- image-like nodes: `17`
- backlog: `11` active (`1 ERROR / 1 WARNING / 2 INFO / 7 IMPROVEMENT`)

The final calibrated P13 run reproduced every value above exactly. Audit-v1 and backlog JSON hashes remained unchanged from the accepted P10 baseline.

## Calibration evolution

### Initial integrated P13 behavior (`c27f8d14535eaf362831047623b920bde863cbd9`)

- Build-Ready: `78 / REVIEW`
- Responsive Risk: `HIGH`
- responsive high-risk findings: `23`
- Responsive Risk category: `42 / NOT_READY`

Real-source inspection showed that the first implementation over-promoted several ambiguous or intentional geometries:

- manual/layered sibling composition was being treated as HIGH collision evidence;
- known clipped carousel geometry was being duplicated as a generic HIGH overflow finding;
- absolute image composition and small controlled clipping were over-severe;
- tight small horizontal rows could be reported even when no configured reference-width probe applied.

### First calibration pass

The first pass changed overlap/overflow handling so that:

- manual-parent geometry could no longer become HIGH collision evidence from geometry alone;
- retained `carousel-track` semantics suppress the duplicate generic clipping defect;
- image-like absolute/decorative clipping is review-only;
- small proportional overflow (`<= 8%`) is review-only;
- unexplained material in-flow clipping remains HIGH;
- flow-parent sibling collision can still remain HIGH.

Result:

- Build-Ready: `81 / REVIEW`
- Responsive Risk: `MEDIUM`
- responsive high-risk findings: `0`
- Responsive Risk category: `54 / NOT_READY`

### Final calibration pass (`d9614914fcba17ff762972dc273158ee4c81e317`)

The remaining score pressure was reviewed against the real retained geometry rather than accepted mechanically.

Final refinements:

- `RR_HORIZONTAL_DENSITY` v2 requires either a configured reference-width probe to trigger or direct current-width overflow (`> 1.02` ratio). A tight row with no applicable probe no longer creates a responsive finding.
- `RR_OVERLAP_COLLISION` v3 records manual/layered overlap as LOW, zero-penalty advisory evidence. Manual-flow structural debt is already scored separately and is not double-counted as a responsive defect.
- real flow-layout overlap retains MEDIUM/HIGH behavior.
- `RR_OVERFLOW_CLIP_DEPENDENCY` v2 retains the context-aware carousel/media/small-overflow behavior from the first pass.

Final real-baseline result:

- Build-Ready Score 2.0: `85 / REVIEW`
- blocker count: `0`
- analyzed coverage: `1152 / 1152` (`100%`)
- unsupported nodes: `0`
- unknown-geometry nodes: `0`
- Responsive Risk: `MEDIUM`
- responsive high-risk count: `0`
- Responsive Risk category: `70 / REVIEW`
- Structure: `82 / REVIEW`
- Consistency: `94 / READY`
- Handoff Readiness: `94 / READY`
- QA Advisories: `100 / READY`

Final rule observations on the retained baseline:

- `RR_HORIZONTAL_DENSITY`: 20 retained findings; every retained finding has a non-empty triggered reference-width probe (`768` and/or `390` on this baseline).
- `RR_OVERFLOW_CLIP_DEPENDENCY`: 2 MEDIUM review findings; no HIGH findings.
- `RR_OVERLAP_COLLISION`: 20 LOW advisory findings with zero applied penalty.
- `RR_ABSOLUTE_FLOW_DEPENDENCY`: 3 MEDIUM review findings.
- no Responsive Risk finding is HIGH.
- the sole remaining HIGH finding in the whole Build-Ready report is structural `BR_LOW_AUTO_LAYOUT_COVERAGE`; it is not a responsive false blocker.

## Determinism and provenance

Final calibration source:

- source SHA: `d9614914fcba17ff762972dc273158ee4c81e317`
- GitHub Actions workflow run: `34628274641`
- artifact ID: `10275232422`
- artifact digest SHA-256: `4e3bc3e4d6b90da8622d836231d7e4ce70ad1618d545dfc4d0125875a912f705`
- compiled CLI SHA-256: `38817d43abed3eb35405444213ec612595e1e83b4f8ea8a4c53a01d507f47e09`

Two independent `audit:snapshot` executions against the same retained snapshot produced byte-identical:

- `audit-report.json`
- `backlog.json`
- `build-ready-report.json`

Final run-1 hashes:

- audit report: `6b39fada959f3fcdebe30ea93cce792709931793af652e0d7a6aaf464def6253`
- backlog: `007f64459cc4d937a9c486de94e8143cb4849350380d9f5ee406c03b08ba5240`
- Build-Ready report: `e8601ff9dca1a5d7e46d99bcce3465f8adce3e7b967833401b301de40ec69090`

External calibration receipt SHA-256:

- `8e46111919002e31d21918e0ebd400385a6878f6c2e57dd380962c9452d3f816`

## Explicit limitations retained

Calibration does not remove the existing fail-closed limitations:

- actual unbreakable text-token analysis is deferred because text contents are not retained by `AuditNode`;
- spacing pressure is deferred because normalized gap/padding constraints are not retained;
- min/intrinsic-width stack pressure is deferred because those sizing modes are not retained;
- text reflow remains reduced-confidence without font metrics and horizontal sizing constraints;
- media sizing remains geometry-only without media sizing-mode constraints.

## Acceptance boundary

This calibration validates the deterministic P13 implementation against the retained real P10 source and removes observed false HIGH responsive signals. It does **not** by itself mark P13 production-accepted.

Still separate:

- retained real Figma plugin/runtime P13 evidence;
- final P13 internal acceptance review;
- P12 #84 publisher/account/2FA final release gate;
- external Figma Community submission/review/approval.

No private source snapshot or design content is committed by this calibration document.
