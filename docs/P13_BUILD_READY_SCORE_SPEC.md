# P13 Build-Ready Score 2.0 + Responsive Risk — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED BY P12 INTERNAL EXIT  
Owner roadmap issue: #119  
Dependency: #84 must reach internal release acceptance before P13 runtime implementation begins  
Date: 2026-09-11

## 1. Purpose

P13 upgrades WP Builders Prepare from a single audit score into an evidence-backed **Build-Ready Score 2.0** plus a deterministic **Responsive Risk** model.

This specification is intentionally implementation-free. It freezes the product and reliability contract far enough that the later P13 implementation issue can be narrow, testable and fail-closed.

P13 must not mutate a design. It is a read-only analysis phase that prepares trustworthy inputs for P14 target-ready duplication and later target adapters.

## 2. Important separation: Build-Ready is not Target-Ready

The product must not collapse general build quality and target compatibility into one ambiguous number.

P13 therefore defines two distinct concepts:

1. **Build-Ready Score** — target-agnostic evidence about whether the selected Figma structure is practical to implement as a responsive website.
2. **Target-Ready Score** — adapter-specific compatibility for Elementor, Gutenberg, React, Vue, etc.

P13 implements the first concept and freezes the evidence interface needed by the second. It must not fabricate an Elementor/Gutenberg/framework compatibility percentage before that target adapter has an accepted capability profile and validator.

A later adapter may consume the same evidence and publish a separate Target-Ready result.

## 3. Compatibility with the existing audit

The existing accepted audit score/status remains a separate versioned output.

P13 must not silently replace, reinterpret or overwrite historical audit values such as the retained `75 / REVIEW` P9/P10 baseline.

Required version labels:

- existing audit: `auditScoreVersion: 1`;
- new build-ready model: `buildReadyScoreVersion: 2`;
- responsive-risk model: `responsiveRiskVersion: 1`.

Reports may show both scores, but UI and exported JSON must make clear that they answer different questions.

## 4. Non-goals

P13 does **not**:

- create mobile/tablet designs;
- mutate Auto Layout, sizing, text, spacing or constraints;
- infer undocumented target-builder internals;
- claim Elementor/Gutenberg/framework import compatibility;
- generate code;
- execute AI to decide correctness;
- use remote/network services;
- turn ambiguous evidence into a confident pass;
- treat a visual screenshot as proof of semantic structure.

Any future mutation belongs to P14+ and remains candidate -> validate -> commit/rollback.

## 5. Core output contract

A P13 result is immutable for one source fingerprint + run configuration.

Suggested top-level shape:

```ts
interface BuildReadyReportV2 {
  schemaVersion: 1;
  buildReadyScoreVersion: 2;
  responsiveRiskVersion: 1;
  runId: string;
  generatedAt: string;
  source: SourceFingerprint;
  config: BuildReadyRunConfig;
  score: BuildReadyScoreResult;
  categories: BuildReadyCategoryResult[];
  responsiveRisk: ResponsiveRiskSummary;
  findings: BuildReadyFinding[];
  coverage: EvidenceCoverage;
  limitations: LimitationRecord[];
}
```

The same deterministic core contract must be usable by both plugin and CLI adapters.

## 6. Source fingerprint and stale-result rule

A result is valid only for the exact analyzed source/config pair.

Minimum fingerprint inputs:

- file/document identity where available;
- page identity where available;
- root Frame/section node ID;
- stable structural/content fingerprint of the analyzed subtree;
- analyzer versions;
- relevant run options.

If the source, selected root, analyzer version or run options change, the previous result becomes `STALE` and cannot be shown as current.

The UI must never allow a stale PASS/READY badge to survive after the selected source changes.

## 7. Build-Ready categories

Initial target-agnostic categories:

### 7.1 Structure — default weight 30

Evidence includes:

- container hierarchy quality;
- Auto Layout vs manual-flow debt;
- unnecessary deep nesting;
- normal-content dependence on absolute positioning;
- reusable/repeated structure consistency;
- text/container sizing compatibility;
- obvious overlay vs flow classification.

Legitimate overlays must not be penalized merely because they use absolute positioning.

### 7.2 Responsive Risk — default weight 25

Evidence includes only deterministic breakpoint-risk signals. It does not invent responsive solutions.

### 7.3 Consistency — default weight 15

Evidence includes measurable repeated-style/layout inconsistency, for example:

- near-duplicate spacing values in repeated siblings;
- inconsistent repeated card dimensions/alignment;
- repeated component-like groups with structural drift;
- inconsistent text sizing behavior for equivalent roles when role evidence is strong enough.

Do not penalize intentional visual variation without repeat-pattern evidence.

### 7.4 Handoff Readiness — default weight 20

Evidence includes:

- meaningful layer/component naming where deterministically classifiable;
- structural ambiguity requiring manual interpretation;
- missing/ambiguous reusable boundaries;
- content/assets that cannot be linked confidently to implementation intent;
- unresolved high-severity audit/backlog findings relevant to implementation.

### 7.5 Deterministic QA Advisories — default weight 10

Bounded, evidence-based checks only, such as:

- fixed-height text clipping risk;
- missing image semantics metadata when the source model exposes it;
- heading-order advisory only when heading roles are explicit enough;
- contrast advisory only when foreground/background colors are resolvable with sufficient confidence.

This category must never be marketed as a complete accessibility, legal or SEO audit.

## 8. Score calculation

Each category produces:

- `score: 0..100 | null`;
- `status: READY | REVIEW | NOT_READY | INSUFFICIENT_EVIDENCE`;
- `applicableWeight`;
- evidence coverage;
- finding counts by severity/confidence.

Default category weights total 100:

- Structure 30
- Responsive Risk 25
- Consistency 15
- Handoff Readiness 20
- Deterministic QA Advisories 10

Rules:

1. Category penalties must come from versioned rule IDs, never opaque AI judgment.
2. One underlying defect must not be double-penalized through multiple aliases. Findings may reference several categories, but penalty ownership is explicit.
3. Category score floors/ceilings caused by blocker findings must be deterministic and versioned.
4. If a category is genuinely non-applicable, remaining weights may be normalized; if evidence is merely missing, it is **not** treated as non-applicable.
5. Too much unknown/unsupported evidence yields `INSUFFICIENT_EVIDENCE` or `REVIEW`, not an artificially high score.
6. The overall score must include coverage metadata so `95 with 45% evidence coverage` cannot look equivalent to `95 with 100% coverage`.

Initial status policy before calibration:

- `READY`: score >= 90, no blocker/high-risk fail condition, and required evidence coverage satisfied;
- `REVIEW`: score 70–89, or any material uncertainty/manual-review condition;
- `NOT_READY`: score < 70, or a deterministic blocker condition;
- `INSUFFICIENT_EVIDENCE`: required analysis inputs are unavailable or coverage falls below the accepted minimum.

Thresholds are part of the versioned scoring contract. Calibration may adjust them before production acceptance, but not silently after release.

## 9. Penalty model

Every scoring rule declares:

```ts
interface BuildReadyRuleDefinition {
  id: string;
  version: number;
  category: BuildReadyCategory;
  severity: "LOW" | "MEDIUM" | "HIGH" | "BLOCKER";
  confidencePolicy: "HIGH_ONLY" | "MEDIUM_PLUS" | "ADVISORY";
  maxPenalty: number;
  dedupeKeyStrategy: string;
  remediationClass: "ADVISORY" | "P14_SAFE_CANDIDATE" | "MANUAL_REVIEW";
}
```

Penalty principles:

- LOW confidence never causes a destructive implication or blocker.
- Advisory-only rules may appear in findings without lowering score until calibrated and accepted.
- Repeated identical issues use bounded aggregation so 200 repeated cards do not produce an absurd negative score.
- A BLOCKER must be tied to a precise deterministic condition and exact evidence.
- Score cannot go below 0 or above 100.

## 10. Responsive Risk model

Responsive Risk answers:

> "What parts of this desktop/source structure are likely to fail, overflow, clip or require manual redesign when available width changes?"

It does **not** answer:

> "What should the mobile design look like?"

### 10.1 Initial rule families

The first implementation issue should begin with these bounded detector families:

- `RR_FIXED_HEIGHT_TEXT_CLIP` — text in a fixed-height region with insufficient growth behavior;
- `RR_FIXED_WIDTH_TEXT_REFLOW` — text width/parent sizing suggests poor shrink/reflow behavior;
- `RR_HORIZONTAL_DENSITY` — horizontal children require a combined minimum width close to/exceeding parent width;
- `RR_MIN_WIDTH_STACK_PRESSURE` — child minimum/intrinsic widths leave no safe contraction path;
- `RR_OVERFLOW_CLIP_DEPENDENCY` — visible content depends on clipping/overflow in a way likely to break when width changes;
- `RR_ABSOLUTE_FLOW_DEPENDENCY` — normal reading-flow content is absolutely placed relative to changing siblings;
- `RR_OVERLAP_COLLISION` — non-overlay siblings have geometry likely to collide under contraction;
- `RR_MEDIA_WRAPPER_RISK` — media sizing/aspect wrapper lacks a stable contraction path;
- `RR_BREAKPOINT_SPACING_PRESSURE` — fixed large gaps/padding consume a material share of narrower reference widths;
- `RR_LONG_UNBREAKABLE_CONTENT` — long token/URL-like content has no deterministic wrap/break path.

Each detector must declare prerequisites and refusal cases. If geometry or semantics are insufficient, output REVIEW/unknown rather than guessing.

### 10.2 Reference widths

P13 may evaluate arithmetic risk against explicit **reference widths**, but these are analysis probes, not generated designs.

Default generic web profile may include versioned reference widths such as desktop/tablet/mobile probes. They must be visible in run metadata and user-configurable only within validated bounds.

Changing a reference-width profile invalidates the prior result.

### 10.3 Responsive finding evidence

Each responsive finding should retain:

- rule ID/version;
- node/context IDs;
- ancestor/container path;
- observed width/height/sizing modes used by the rule;
- computed threshold/ratio;
- reference width(s) that triggered the risk;
- confidence;
- severity;
- explanation;
- safe next step class;
- whether the finding is target-agnostic.

No finding may contain only a generic statement such as "mobile may break" without measurable evidence.

## 11. Evidence coverage

P13 must make uncertainty visible.

Example coverage fields:

```ts
interface EvidenceCoverage {
  scannedNodes: number;
  eligibleNodes: number;
  analyzedNodes: number;
  unsupportedNodes: number;
  unknownGeometryNodes: number;
  categoryCoverage: Record<string, number>; // 0..1
  overallCoverage: number; // 0..1
}
```

Coverage should affect status when evidence is insufficient, but must not silently inflate/deflate the numeric score.

## 12. Target-readiness evidence interface

P13 freezes a target-adapter input contract without producing fake target results.

Future adapters may consume normalized evidence such as:

- layout/container intent;
- flow direction;
- sizing modes;
- gap/padding;
- absolute-overlay classification;
- repeated-card/component groups;
- text sizing/growth behavior;
- image/media behavior;
- responsive-risk findings;
- unresolved structural blockers.

A target adapter remains responsible for its own:

- versioned `TargetProfile`;
- capability matrix;
- widget/block/component mapping;
- package/schema validation;
- real import/build/render evidence.

## 13. UI state contract

P13 UI must be driven by explicit run state rather than ad-hoc button booleans.

Minimum states:

`IDLE -> SCANNING -> ANALYZING -> SCORING -> COMPLETE`

Terminal/non-happy states:

- `CANCELLED`;
- `RECOVERABLE_ERROR`;
- `BLOCKED`;
- `STALE`.

Rules:

- only one active analysis job per plugin instance unless the batch framework explicitly owns sequencing;
- cancellation is cooperative and leaves no partial "current" result;
- retry creates a new run ID;
- stale results remain viewable as historical evidence but cannot be exported as current without re-run;
- changing selection/config during a run either locks the run input or cancels/restarts explicitly; it must never silently mix sources.

## 14. Performance and hang prevention

P13 implementation must remain bounded.

Required design constraints:

- prefer O(n) or O(n log n) scans over global O(n²) geometry comparisons;
- sibling comparisons are scoped to one container and bounded;
- repeated-pattern grouping uses existing normalized fingerprints where possible;
- heavy pixel/render checks are not part of the base P13 read-only scan;
- cancellation checkpoints occur throughout long traversals;
- progress is monotonic and based on bounded work units;
- large/unsupported inputs fail with an actionable code rather than freezing the plugin.

The implementation issue must define measurable fixture/runtime budgets from current accepted real-file scale before production acceptance. No cross-machine millisecond guarantee is declared in this planning spec.

## 15. Structured error codes

At minimum reserve stable codes for:

- `P13_NO_ELIGIBLE_SELECTION`;
- `P13_SOURCE_STALE`;
- `P13_UNSUPPORTED_ROOT`;
- `P13_ANALYSIS_CANCELLED`;
- `P13_GEOMETRY_INSUFFICIENT`;
- `P13_EVIDENCE_INSUFFICIENT`;
- `P13_INPUT_TOO_LARGE`;
- `P13_INTERNAL_INVARIANT_FAILED`.

Every user-visible error must provide a safe recovery action when one exists.

## 16. Export/report contract

P13 must support machine-readable and human-readable reporting through the existing report/export architecture.

The export must retain:

- analyzer/scoring versions;
- exact source fingerprint;
- run config/reference widths;
- numeric score and status;
- category scores/statuses;
- responsive-risk summary;
- full findings/evidence;
- coverage;
- limitations;
- generated timestamp.

A report is evidence for the analyzed run only. It is not certification that a later modified design remains ready.

## 17. Plugin/CLI parity

P13 logic belongs in the shared deterministic core.

Required parity policy:

- same normalized source + same config -> same rule IDs, severity, evidence semantics, category scores, overall score and status;
- adapter metadata may differ only where the platform genuinely exposes different provenance/context fields;
- plugin-only UI state must not affect scoring;
- CLI network/REST acquisition differences must not alter normalized scoring semantics once the same source facts are available.

Production acceptance requires same-input parity on fixtures and at least one retained real-file comparison where the source adapters expose equivalent data.

## 18. Test matrix required before implementation acceptance

The eventual P13 implementation PR must include all of the following classes.

### Unit tests

- every scoring rule boundary;
- severity/confidence behavior;
- capped repeated penalties;
- blocker floors;
- weight normalization;
- insufficient-evidence behavior;
- stale-result invalidation;
- responsive detector thresholds.

### Fixture tests

- healthy Auto Layout page;
- manual but intentionally valid editorial composition;
- long-text reflow risk;
- dense horizontal nav/cards;
- legitimate overlay that must not be penalized;
- normal content incorrectly absolute-positioned;
- fixed-height text clipping case;
- image/media wrapper risk;
- very large frame input;
- unsupported/missing-geometry input.

### Property/invariant tests

- score always 0..100;
- adding unrelated unsupported nodes cannot improve evidence coverage;
- duplicate identical findings do not bypass penalty caps;
- LOW-confidence evidence cannot create a blocker;
- cancellation cannot yield COMPLETE;
- source/config change always invalidates current result;
- analysis never mutates design data.

### Plugin/CLI parity tests

- same normalized fixture -> exact semantic result parity;
- deterministic JSON ordering/normalization where current report contracts require it.

### Real Figma acceptance

Use the known acceptance file/frame plus at least one deliberately responsive-risk-heavy fixture/frame. Retain exported report evidence and confirm no source mutation.

## 19. Calibration protocol

Scoring should not be tuned from one showcase file.

Before production acceptance:

1. build a labeled fixture corpus covering both good and bad patterns;
2. run current real acceptance frame(s);
3. record false positives, false negatives and REVIEW cases;
4. adjust rule thresholds/penalties only with versioned rationale;
5. freeze score model version 2;
6. retain the calibration snapshot in repository evidence/docs.

A threshold change after production acceptance requires a score-model version bump when it can materially change user results.

## 20. Smooth UX requirements

To avoid option and system glitches:

- show one primary action: `Check Build Readiness`;
- keep advanced reference-width options collapsed by default;
- never expose target-specific options in P13 unless backed by an accepted TargetProfile;
- disable export while the current result is stale/incomplete;
- preserve the last completed run as historical evidence while a new run is in progress;
- show exact blocker count and top responsive risks before the numeric score detail;
- every finding links to/selects the affected Figma node where the host adapter supports it;
- repeated findings are grouped with expandable instances;
- do not show a green READY state when evidence coverage is insufficient;
- no modal loop that forces the user through dozens of findings one by one.

## 21. Security/privacy

P13 remains inside the current offline deterministic core:

- no network access;
- no external AI call;
- no document content leaves the plugin/CLI process except through explicit user export;
- exported reports may contain node names/text evidence, so the user must explicitly initiate export as today.

## 22. Commercial implications

P13 should improve conversion without becoming marketing-only scoring.

Useful user-facing outputs:

- `Build-Ready 92 / READY` with evidence coverage;
- category breakdown;
- `Responsive Risk: 3 HIGH, 7 MEDIUM`;
- exact blockers to resolve before Elementor/Gutenberg/code export becomes available in later phases;
- before/after comparison once P14 prepares a duplicate.

The score is valuable only because every point is traceable to deterministic evidence.

## 23. P13 implementation entry gate

Do not open/merge P13 runtime implementation until:

- #84 internal P12 exit is accepted;
- this preflight contract is retained on main;
- a focused P13 implementation issue is opened under #119;
- scoring rule IDs/versions and fixture corpus are defined in that issue/PR;
- implementation remains read-only.

P13 planning does not change P12 progress and does not grant P13 implementation or production-acceptance credit.

## 24. P13 exit gate

P13 can be marked **IMPLEMENTATION COMPLETE** only after automated contract/parity tests pass.

P13 can be marked **PRODUCTION ACCEPTED** only after:

- calibration evidence is retained;
- real Figma read-only acceptance passes;
- plugin/CLI same-input semantic parity is retained where inputs are equivalent;
- no source mutation is observed;
- cancellation/staleness/large-input behavior is demonstrated;
- report/export schema is stable and versioned;
- README/memory-bank/status are synchronized.

Only then may P14 introduce new target-ready duplication/mutation behavior.
