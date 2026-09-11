# P14 Target-Ready Duplicate + Guided Prepare — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED BY P12 INTERNAL EXIT AND P13 PRODUCTION ACCEPTANCE  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; accepted P13 Build-Ready Score 2.0 contract/runtime  
Date: 2026-09-11

## 1. Purpose

P14 turns accepted P13 findings into a safe, user-controlled preparation workflow **without modifying the approved source design**.

The phase generalizes the existing Safe Fix transaction model into a retained duplicate workflow suitable for later Elementor, Gutenberg and code adapters.

P14 is not a target exporter. Its job is to create a structurally safer duplicate, validate it, re-score it and produce an auditable receipt that downstream target adapters may consume.

## 2. Core product promise

User-facing promise:

> Preview exactly what can be prepared safely, create a duplicate, apply only accepted recipes to that duplicate, validate the result, compare before/after evidence, and keep the original untouched.

The workflow must fail closed. If preparation cannot be completed and validated safely, no partially approved duplicate is presented as ready.

## 3. Terminology

- **Source** — the approved Figma Frame/section selected by the user. Immutable for this workflow.
- **Preparation Plan** — deterministic ordered list of eligible/no-op/refused recipe actions derived from P13 findings and accepted recipe definitions.
- **Candidate Duplicate** — temporary clone used while transformations and validation are in progress.
- **Prepared Duplicate** — candidate retained only after all required validation gates pass or the user explicitly accepts a REVIEW result where policy allows.
- **Target Profile** — versioned Elementor/Gutenberg/framework contract owned by later adapter phases. P14 must not invent one.
- **Receipt** — machine-readable record of source fingerprint, plan, applied/refused recipes, validation and before/after scoring.

## 4. Critical distinction: prepared is not target-compatible

P14 must not display `Elementor Ready`, `Gutenberg Ready`, `React Ready`, or another target-specific claim unless an accepted adapter TargetProfile is actually active.

Initial P14 should use target-neutral labels such as:

- `Prepared Duplicate`;
- `Build-Ready Improved`;
- `Safe Preparation Complete`;
- `Review Required`.

Later P15+ adapters may call the same transaction engine with an accepted target-scoped recipe pack. Only then may a target-specific readiness result be shown, and that result remains separate from P14 structural preparation.

## 5. Existing architecture to preserve

The existing transaction engine already establishes an important invariant: the approved original is identified once and is never passed to the transform function; mutation happens on the candidate and validation precedes commit.

P14 must preserve that invariant while changing the finalization semantics for this phase:

- P4/P5 style flows may support a commit/swap behavior;
- **P14 must never replace or delete the approved source**;
- P14 finalization means retaining the validated duplicate as a separate node.

Therefore P14 needs an explicit duplicate-retention commit mode instead of assuming the existing swap-style commit behavior is safe for this use case.

## 6. Entry conditions

A P14 preparation run may start only when all are true:

1. eligible Figma source root is selected;
2. a current, non-stale P13 report exists for the exact source/config fingerprint;
3. P13 result contains at least one finding classified as an accepted preparation candidate or an explicit no-op confirmation;
4. required source geometry/content facts are available;
5. no blocking unsupported condition makes safe preparation impossible;
6. no other mutation transaction owns the same source/candidate scope.

If any condition fails, the action is disabled or returns a stable BLOCKED/REVIEW result with recovery guidance.

## 7. P13-to-P14 handoff contract

P14 may only consider findings that explicitly declare:

`remediationClass: P14_SAFE_CANDIDATE`

A finding must also provide or resolve to:

- stable rule ID/version;
- exact target node/context;
- confidence meeting the accepted mutation gate;
- accepted recipe ID/version;
- prerequisites;
- refusal conditions;
- expected mutation allowlist;
- validator requirements.

P14 must never convert a generic P13 warning into a mutation by inference.

Findings classified `ADVISORY`, `MANUAL_REVIEW`, unknown, unsupported or below-confidence stay read-only.

## 8. Recipe registry

Every mutating recipe is versioned and registered explicitly.

Suggested contract:

```ts
interface PreparationRecipeDefinition {
  id: string;
  version: number;
  sourceRuleIds: string[];
  minConfidence: number;
  prerequisites: string[];
  refusalCodes: string[];
  mutationAllowlist: MutationField[];
  validationProfileId: string;
  idempotencyKeyStrategy: string;
  conflictsWith: string[];
  orderClass: string;
}
```

No free-form runtime code path may mutate arbitrary node properties outside the recipe allowlist.

## 9. Initial safe recipe classes

The first P14 implementation should reuse only patterns already supported by accepted Safe Fix/advanced structure evidence, plus narrowly defined P13 remediations whose safety is separately proven.

Potential initial classes:

- high-confidence vertical stack normalization;
- high-confidence horizontal row normalization;
- high-confidence two-column normalization;
- accepted repeated-card/grid normalization;
- accepted facts/footer/metric/social-strip normalization;
- safe text auto-height correction where text content/geometry preservation is validated;
- measured gap/padding normalization only when the intended spacing can be derived deterministically from existing geometry;
- sizing-mode corrections only when geometry/content preservation can be proven.

Anything involving uncertain overlays, custom masks, complex vector transforms, animation/prototype semantics, carousel/timeline behavior, ambiguous grid synthesis or target-specific widgets remains REVIEW/UNSUPPORTED until a dedicated accepted recipe exists.

## 10. Plan-first UX

No mutation starts from a single blind `Fix All` action.

Canonical UX:

1. `Check Build Readiness` (P13 result);
2. `Preview Safe Preparation`;
3. show grouped plan:
   - Eligible changes;
   - Already correct / no-op;
   - Review only;
   - Unsupported/refused;
4. show expected before/after category impact as **estimated from rule ownership**, never as a fabricated guaranteed final score;
5. user chooses `Create Prepared Duplicate`;
6. candidate workflow executes;
7. validation + re-score completes;
8. user receives Prepared / Review / Rejected result plus receipt.

Advanced per-recipe toggles may be added later only when dependency/conflict rules can make every combination valid. Initial implementation should prefer one deterministic accepted plan over a combinatorial checkbox matrix.

## 11. Transaction state machine

P14 requires an explicit state machine:

`IDLE -> PREFLIGHT -> PLAN_READY -> AWAITING_CONFIRMATION -> CLONING -> TRANSFORMING -> VALIDATING -> RESCORING -> FINALIZING -> COMPLETE`

Terminal/exception states:

- `CANCELLED`;
- `REJECTED`;
- `RECOVERABLE_ERROR`;
- `BLOCKED`;
- `SOURCE_STALE`;
- `CLEANUP_REQUIRED`.

Rules:

- only one active mutation transaction per source scope;
- each run has a unique transaction ID;
- transition order is deterministic and logged;
- no state may skip required validation;
- COMPLETE is impossible without a retained prepared duplicate or explicit no-op outcome;
- a cancelled/rejected/error run cannot be reported as prepared.

## 12. Atomicity and cleanup

User-visible atomicity requirement:

> A failed preparation must not leave a half-prepared duplicate that looks approved.

Implementation policy:

- candidate is marked/internal-labeled as in-progress where host behavior allows;
- mutation occurs only on candidate;
- validation failure triggers candidate discard by default;
- cancellation before finalization triggers candidate discard;
- transform crash triggers candidate discard;
- cleanup failure moves state to `CLEANUP_REQUIRED` and surfaces exact candidate node ID plus recovery action;
- only successful finalization removes in-progress metadata and exposes the duplicate as prepared.

No failure path may silently retain an unlabeled partial duplicate.

## 13. Source immutability proof

P14 must prove the original source was not changed.

Before cloning, capture an immutable source snapshot/fingerprint sufficient to verify protected properties.

After candidate transformation and before COMPLETE:

- recompute source fingerprint;
- verify source still matches preflight snapshot;
- if it changed unexpectedly, block finalization and mark `SOURCE_CHANGED_DURING_RUN` or `SOURCE_STALE`;
- distinguish user edits made concurrently from plugin-caused mutation where possible, but never pretend the original is unchanged when proof fails.

The receipt must include source-before and source-after fingerprints.

## 14. Candidate linkage

Candidate metadata/receipt should retain:

- original/source node ID;
- candidate node ID;
- source fingerprint;
- P13 report/run ID;
- P14 transaction ID;
- recipe-plan digest;
- created timestamp;
- preparation profile/version.

The displayed duplicate name should be deterministic and non-destructive, e.g. `Desktop — Prepared` with collision-safe suffixing. The product must not depend on names for identity.

## 15. Sequential transform ordering

Recipes are applied in a deterministic topological order derived from recipe dependencies and conflicts.

Requirements:

- parent/container structural changes before dependent child sizing changes where required;
- recipes with conflicting writes cannot both enter the same plan;
- plan ordering is stable for the same input;
- one recipe cannot silently change the eligibility of another without the engine re-evaluating that dependency;
- if a prerequisite becomes false during the run, stop and reject/replan rather than continuing with stale assumptions.

No unbounded parallel mutation of the same tree.

## 16. Idempotency and retry

A successful recipe must be designed to become NOOP when re-evaluated against the already-prepared structure.

Retry rules:

- retry after a recoverable failure creates a new transaction ID;
- source fingerprint must still match;
- recipe registry versions must still match;
- previous partial candidate must be discarded or explicitly selected for recovery before retry;
- re-running P14 on an already prepared duplicate should produce mostly NOOP/remaining findings rather than compounding spacing or nesting.

Idempotency tests are mandatory for every accepted recipe.

## 17. Cancellation semantics

Cancellation must be cooperative and deterministic.

Safe cancellation checkpoints:

- after preflight;
- before clone;
- between recipes;
- before validation;
- before finalization.

If cancellation is requested while a single atomic recipe write is underway, finish that bounded write, then stop and discard the candidate.

Cancellation after finalization has completed does not delete the prepared duplicate automatically; at that point the transaction is COMPLETE.

## 18. Validation stack

A candidate may be retained only after all required validators for the active recipe set run.

Validation layers:

### 18.1 Structural validation

- expected node hierarchy remains valid;
- no unintended child loss/duplication;
- recipe-specific Auto Layout/grid/sizing requirements hold;
- IDs/references needed inside the duplicate remain coherent.

### 18.2 Content validation

- text content preserved unless a recipe explicitly allows a bounded text-property change;
- image/vector content preserved;
- visibility preserved;
- component/instance semantics preserved where required.

### 18.3 Geometry validation

- root placement/size rules respected;
- key child geometry remains within calibrated tolerances;
- intentional overlays remain overlays;
- no new clipping/collision introduced.

### 18.4 Pixel/render validation

Use the existing pixel-diff capability only where an accepted host/runtime path provides comparable renders. Pixel validation is a guard, not the sole correctness criterion.

### 18.5 Build-Ready re-score

Run the accepted P13 model on the candidate after structural validation.

Rules:

- score improvement is not by itself sufficient for acceptance;
- a candidate that scores higher but violates content/geometry preservation is rejected;
- expected remediated findings should resolve or convert to explicit NOOP;
- new HIGH/BLOCKER findings caused by preparation reject the candidate.

## 19. Acceptance outcomes

P14 result statuses:

### `PREPARED`

All mandatory validators pass, source immutability passes, no new blocker/high finding is introduced, and candidate is retained.

### `PREPARED_WITH_REVIEW`

Only allowed if policy explicitly permits non-blocking unresolved review findings; receipt/UI lists them clearly. This must never be used to hide failed required validation.

### `NO_CHANGES_NEEDED`

Plan contains only accepted NOOP findings and source is already structurally prepared.

### `REJECTED`

Candidate failed required validation and was discarded successfully.

### `BLOCKED`

Preparation was not started because prerequisites/confidence/support were insufficient.

### `CLEANUP_REQUIRED`

Candidate failed/cancelled but automatic discard failed. UI must identify the candidate and offer safe cleanup/recovery.

## 20. No score chasing

P14 must not mutate merely to maximize a numeric score.

A recipe exists because it fixes a specific accepted structural problem while preserving design intent. If a visually intentional structure has a lower Build-Ready score but cannot be safely normalized, it stays REVIEW.

The source design remains authoritative over the score.

## 21. Target-aware extension point

Later target adapters may request P14 preparation with a versioned target profile, but target-neutral and target-specific recipes must stay distinguishable.

Future plan fields may include:

- `targetProfileId`;
- `targetProfileVersion`;
- target-specific rule/recipe IDs;
- target capability prerequisite.

A target-specific recipe can run only if:

1. adapter TargetProfile is accepted;
2. capability is explicitly SUPPORTED or accepted SUPPORTED_WITH_REVIEW;
3. recipe version is accepted for that target profile;
4. target validator exists.

P14 itself does not create these claims before P15+.

## 22. Mutation allowlist

Each recipe must declare exact properties it may change.

Examples of potentially allowed properties after recipe-specific acceptance:

- layout mode/direction;
- primary/counter axis sizing mode;
- item spacing/gap;
- padding;
- text auto-resize mode;
- layout sizing/grow/alignment fields;
- wrapper creation only for recipes explicitly designed and validated for it.

Protected by default:

- text characters/content;
- fills/strokes/effects;
- image bytes;
- vector paths;
- fonts/type styles except explicit sizing-mode behavior;
- prototype interactions;
- component linkage;
- visibility;
- masks;
- blend modes;
- rotations;
- user-authored names except deterministic duplicate-root naming/metadata;
- source/original properties of any kind.

A new writable field requires recipe contract + tests, not an ad-hoc implementation change.

## 23. Recipe refusal behavior

Refusal is a successful safety outcome, not a generic error.

Stable refusal classes should cover at least:

- below confidence gate;
- special visual role/overlay detected;
- absolute-flow ambiguity;
- unsupported advanced pattern;
- fragmented grid/wrapper synthesis not accepted;
- component/instance mutation unsafe;
- insufficient geometry;
- source stale;
- conflicting recipe writes;
- validator unavailable;
- target-specific recipe requested without accepted TargetProfile.

UI should explain why and identify the affected node/context.

## 24. Performance and freeze prevention

P14 must remain bounded even on large frames.

Requirements:

- plan generation reuses P13 findings and existing classifier output instead of rescanning unnecessarily;
- transformations are sequential and bounded;
- validation work is staged so cheap structural failures stop before expensive render/pixel work;
- progress is monotonic and tied to deterministic work units;
- cancellation checkpoints occur between recipe/validator stages;
- render/pixel snapshots use bounded dimensions/resources;
- huge candidates may be BLOCKED before clone when accepted size/work thresholds are exceeded.

No silent long-running background loop in the Figma UI thread.

## 25. Structured errors

Reserve stable P14 error codes including:

- `P14_P13_REPORT_REQUIRED`;
- `P14_P13_REPORT_STALE`;
- `P14_NO_ELIGIBLE_RECIPES`;
- `P14_RECIPE_VERSION_MISMATCH`;
- `P14_RECIPE_CONFLICT`;
- `P14_CLONE_FAILED`;
- `P14_SOURCE_CHANGED_DURING_RUN`;
- `P14_TRANSFORM_FAILED`;
- `P14_VALIDATION_FAILED`;
- `P14_RESCORE_FAILED`;
- `P14_FINALIZE_FAILED`;
- `P14_DISCARD_FAILED`;
- `P14_CANCELLED`;
- `P14_INPUT_TOO_LARGE`;
- `P14_INTERNAL_INVARIANT_FAILED`.

Every error with a safe user action should expose a recovery step.

## 26. Receipt contract

A completed/blocked/rejected run emits a deterministic receipt.

Suggested shape:

```ts
interface PreparationReceiptV1 {
  schemaVersion: 1;
  transactionId: string;
  status: PreparationStatus;
  source: {
    nodeId: string;
    beforeFingerprint: string;
    afterFingerprint: string;
  };
  candidate?: {
    nodeId: string;
    retained: boolean;
  };
  p13RunId: string;
  preparationProfileVersion: number;
  planDigest: string;
  recipes: RecipeExecutionRecord[];
  validation: ValidationSummary;
  beforeScore: BuildReadyScoreRef;
  afterScore?: BuildReadyScoreRef;
  limitations: LimitationRecord[];
  generatedAt: string;
}
```

Receipt must distinguish:

- planned;
- applied;
- no-op;
- refused;
- failed;
- rolled back/discarded.

A receipt never claims downstream Elementor/Gutenberg/framework import success.

## 27. Export/history behavior

The receipt may be exported through existing report infrastructure only after the run reaches a terminal state.

History rules:

- previous receipts remain immutable;
- new run gets new transaction ID;
- prepared duplicate records its receipt linkage where safe/appropriate;
- deleting a prepared duplicate later does not rewrite historical receipt truth;
- source edits after completion make future readiness results stale but do not alter the historical run.

## 28. UI requirements for smooth operation

Primary actions should stay simple:

- `Preview Safe Preparation`;
- `Create Prepared Duplicate`;
- `Open Preparation Report`.

UX rules:

- never label a button `Fix All` when some findings are review/refused;
- show eligible/no-op/review/refused counts before confirmation;
- show estimated scope of change, not guaranteed score uplift;
- group repeated recipes by context with expandable instances;
- while running, disable conflicting mutation commands for the same source;
- show clear Cancel action where cancellation is safe;
- on cleanup failure, show the candidate node and `Select Candidate` / retry cleanup guidance;
- success screen must say the original was preserved only after source fingerprint verification passes;
- no target-specific export button is enabled merely because P14 succeeds.

## 29. Test matrix required for implementation acceptance

### Unit tests

- P13 eligibility filtering;
- recipe registry/version matching;
- conflict/dependency ordering;
- mutation allowlist enforcement;
- refusal codes;
- state transitions;
- source-stale detection;
- cancellation transitions;
- cleanup/discard behavior;
- receipt serialization.

### Recipe fixture tests

For every mutating recipe:

- positive eligible case;
- already-correct NOOP case;
- just-below-confidence refusal;
- overlay/special-role refusal where relevant;
- idempotency second-run case;
- validation-failure rollback;
- content preservation;
- geometry preservation.

### Transaction/invariant tests

- source object is never passed to transform function;
- source fingerprint unchanged after success;
- source fingerprint unchanged after rejection/cancellation;
- failed candidate does not remain as an approved-looking duplicate;
- cleanup failure is surfaced, not hidden;
- conflicting recipes cannot execute together;
- COMPLETE cannot occur before validation/re-score/finalize;
- source/config/repository recipe-version change invalidates stale plan;
- retry cannot reuse a stale plan blindly.

### Integration tests

- plugin flow on controlled fixtures;
- CLI can produce/validate the same preparation plan semantics where mutation itself is plugin-only;
- existing P5/P6 accepted recipe behavior remains unchanged unless intentionally version-bumped;
- batch system cannot run conflicting mutations concurrently on the same source.

### Real Figma acceptance

Use the known real acceptance design plus focused fixture frames covering:

- successful safe preparation;
- refusal preserving a legitimate overlay;
- cancellation cleanup;
- failed validation rollback;
- prepared duplicate before/after Build-Ready evidence;
- zero source mutation.

No P5/P6/P7 rerun campaign is required; reuse retained evidence and add only P14-specific behavior proof.

## 30. Production acceptance gates

P14 may be marked **IMPLEMENTATION COMPLETE** only after automated contract/recipe/transaction tests pass.

P14 may be marked **PRODUCTION ACCEPTED** only after:

- P13 is production accepted;
- real Figma duplicate workflow is retained;
- source immutability proof passes;
- positive + refusal + rollback/cancel evidence passes;
- every shipped recipe has idempotency and preservation evidence;
- no partial approved-looking candidates remain after failure tests;
- receipts are deterministic and versioned;
- plugin/CLI planning semantics are aligned where comparable;
- README/memory-bank/status sync is complete.

Only after P14 production acceptance may P15 use the prepared-duplicate engine for Elementor-specific preparation.

## 31. Current gate

This document is planning-only.

P14 runtime implementation must not begin while:

- #84 internal P12 exit remains open; or
- P13 has not reached production acceptance.

Planning work grants no P12, P13 or P14 runtime acceptance credit.
