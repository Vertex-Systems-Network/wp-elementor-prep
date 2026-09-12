# P14 Retained-Duplicate Foundation

Status: CORE IMPLEMENTATION + READ-ONLY GUIDED PREPARE RUNTIME PREVIEW — CONFIRMATION/MUTATION UNWIRED  
Roadmap: #119  
Current status synchronization: #273  
Open acceptance/release dependencies: P13 real-Figma acceptance (#159), P12 release-exit review (#84), and final production-release gate P27 (#182)

## Purpose

P14 implements the target-neutral safety foundation for `Target-Ready Duplicate + Guided Prepare` without granting production mutation authority. The approved source remains authoritative. Any future preparation mutation must operate on a retained duplicate/candidate, validate and re-score that candidate, prove the source remained unchanged, and fail closed when evidence is stale, malformed, unreadable or unauthorized.

The implementation currently has two distinct surfaces:

1. a deterministic retained-duplicate core with bounded plan, confirmation, authorization, transaction, adapter-evidence, validation/re-score, cleanup and receipt contracts;
2. a development-only **read-only Guided Prepare preview** driven by exact current P13 Build-Ready evidence, including a non-authorizing proposed-change review artifact.

The second surface does **not** create confirmation evidence or wire retained-duplicate mutation into Figma.

## Authority model

P14 keeps these authorities separate:

- **plan integrity** — the plan is internally coherent and digest-bound;
- **recipe authorization** — every eligible action matches an exact current safe-recipe registry binding;
- **reviewed confirmation** — explicit reviewed intent is bound to exact plan/run/source/action evidence;
- **runtime eligibility** — candidate assumptions are re-evaluated before later sequential actions;
- **validation/re-score** — candidate outcome is independently checked after mutation;
- **source immutability** — source fingerprint must remain unchanged;
- **production acceptance** — not granted by any P14 core, preview, manifest or receipt artifact.

`P14PreparationConfirmationV1`, P14 plan previews, proposed-change review manifests and P14 receipts remain non-authorizing evidence. They do not establish user identity, authentication, target compatibility or production acceptance.

The production safe-recipe registry remains intentionally empty. Synthetic tests may inject explicit test-only recipes, but those mappings are not production authority.

## Core retained-duplicate contract

The implemented core includes:

- explicit P13 -> P14 handoff and deterministic preparation planning;
- versioned plan schema, canonical action ordering and digest integrity;
- bounded input/resource preflight;
- one-shot known-schema semantic snapshots for caller-owned plan/confirmation evidence;
- standalone plan-integrity snapshotting (#243/#244);
- standalone confirmation validation snapshotting (#245/#246);
- confirmation construction from one captured reviewed-plan state (#247/#248);
- safe-recipe registry bounds, semantic snapshots and exact binding authorization;
- execution authorization from captured plan evidence (#249/#250);
- explicit reviewed-plan confirmation contract for mutating READY plans;
- retained-duplicate transaction semantics with candidate-only recipe callbacks;
- detached adapter callback inputs and bounded adapter-output evidence;
- sequential runtime action-eligibility reassessment;
- captured planned-action identity/prerequisite binding (#251/#252);
- validation-profile coverage from captured plan/observed evidence (#253/#254);
- bounded validation checks and re-score evidence;
- source fingerprint validation and post-run source immutability proof;
- cooperative cancellation, source-scope coordination and bounded cleanup evidence;
- bounded event/diagnostic/timestamp evidence;
- bounded receipt-integrity snapshots and detached receipt collections.

## Bounded evidence rule

Typed JavaScript/TypeScript values are runtime evidence, not automatic trust.

P14 generally:

1. preflights resource size where supported;
2. captures only the known schema through guarded property/index reads;
3. copies bounded arrays into plain values;
4. validates semantics against captured data;
5. avoids re-entering stateful/hostile getters after acceptance;
6. fails closed with bounded diagnostics for unreadable/revoked evidence.

This is not a generic recursive deep clone. Each boundary copies only fields the contract consumes.

## Plan integrity, authorization and confirmation

For a mutating READY plan, these gates remain separate:

1. `validateP14PreparationPlan(...)` — internal plan coherence;
2. `authorizeP14PreparationPlan(...)` — exact current registry authorization;
3. `validateP14PreparationConfirmation(...)` — reviewed intent bound to exact plan/source/run/action evidence.

Missing mutating-plan confirmation remains `P14_CONFIRMATION_REQUIRED`; malformed/stale/mismatched confirmation remains `P14_CONFIRMATION_MISMATCH`. These outcomes occur before source coordination or adapter access.

The current development preview does not create `P14PreparationConfirmationV1`.

## Read-only Guided Prepare runtime preview

The development preview sequence is:

1. P13 Audit produces/persists validated Build-Ready runtime evidence;
2. exactly one current Figma Frame is selected;
3. persisted P13 evidence is validated;
4. evidence must belong to the exact current file/page/frame;
5. the current Frame is freshly scanned with the existing deterministic scanner/Build-Ready analyzer;
6. persisted P13 fingerprint and exact compiled-build identity must match that fresh state;
7. only then is the P14 plan/review preview rendered.

Development surfaces were added through:

- #255/#256 — P14 plan preview model from persisted P13 evidence;
- #257/#258 — developer-menu discoverability;
- #260/#261 — normal development main-panel preview;
- #262/#263 — exact file/page/frame binding;
- #265/#266 — fresh selected-Frame and exact compiled-build binding;
- #268/#269 — versioned snapshot-first proposed-change review manifest;
- #271/#272 — human-readable Proposed Change Review Binding panel.

The generated publishable release UI strips the development-only P14 preview/review-binding surface.

## Exact current-context and freshness binding

PR #263 binds preview evidence to exact current file/page/frame IDs and rechecks context after asynchronous evidence loading. Human-readable names are non-authoritative.

PR #266 additionally requires a fresh selected-Frame scan to match persisted:

- P13 `runId`;
- source `rootId`;
- `structuralHash`;
- `configHash`;
- `analyzerVersion`;
- plugin version;
- compiled build `sourceSha`, `runId`, and `runNumber`.

A mismatch fails closed with fresh-Audit guidance.

## Proposed-change review manifest

PR #269 adds `P14ProposedChangeReviewManifestV1`, a versioned review artifact built from one bounded semantic snapshot of the P14 plan before integrity validation/reuse.

It carries explicit non-authority flags:

- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `mutationEnabled=false`;
- `confirmationEnabled=false`.

Its exact review binding includes:

- P13 run ID;
- source node ID and fingerprint;
- P14 plan digest;
- canonical eligible action IDs.

When eligible actions exist, the manifest detaches their:

- action ID;
- source rule/version;
- recipe/version;
- confidence;
- target node IDs;
- prerequisite recipe IDs;
- mutation allowlist;
- validation profile ID.

Revoked, unreadable or integrity-invalid plan evidence fails closed instead of becoming review authority.

PR #272 renders this exact manifest as a human-readable Proposed Change Review Binding block in the development panel. It adds no approve/confirm control and the publishable release UI strips the entire development-only surface.

## First real P13 safe-preparation opportunity

PR #270 adds the first real target-neutral P13 preparation candidate signal:

`BR_SAFE_VERTICAL_STACK_CANDIDATE`

Properties:

- `remediationClass: P14_SAFE_CANDIDATE`;
- category `STRUCTURE`;
- LOW severity;
- zero score penalty;
- target-agnostic evidence;
- derived exclusively from existing `detectPatterns -> detectSpecialRoles -> planSafeRecipes` semantics;
- emitted only when existing P5 planning returns `ELIGIBLE` for `vertical-stack` at the existing 90% gate.

Therefore existing P5 NOOP, role-preservation, absolute-child and confidence/refusal rules stay authoritative; P13 does not implement parallel eligibility logic.

The production P14 registry is still empty. The production P13->P14 handoff therefore converts this real candidate to REVIEW with `P14_SAFE_BINDING_REQUIRED`, leaves `eligibleActionIds=[]`, and produces a BLOCKED P14 plan. This is intentional: a real opportunity signal is not production mutation authority.

## Preview authority locks

The Guided Prepare preview remains explicitly locked:

- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `mutationEnabled=false`;
- `confirmationEnabled=false`.

The preview does not create confirmation, call `runP14RetainedDuplicateTransaction(...)`, clone/mutate Figma nodes or register a production safe recipe.

## Source immutability and cleanup

When the retained-duplicate transaction core is exercised in deterministic tests/synthetic adapters, the source is used only for identity/fingerprinting and cloning. Recipe callbacks operate on candidate evidence. Successful preparation still requires source-after fingerprint equality with source-before evidence.

Candidate discard or coordinator-release failures remain explicit cleanup evidence. No development preview bypasses these contracts because no real P14 mutation path is wired into the plugin UI.

## Current boundaries / non-goals

Still intentionally absent:

- production safe-recipe registrations;
- approval/confirmation creation from the development preview;
- real retained-duplicate Figma mutation adapter/command;
- target-specific Elementor/Gutenberg preparation recipes;
- distributed cross-process lock claims;
- cryptographic user-authentication claims;
- target compatibility claims from target-neutral P14 evidence;
- production acceptance from automated CI or preview evidence.

P13 real-plugin runtime/parity acceptance #159 remains required before real P14 Figma mutation exposure. It does not block target-neutral core/read-only work.

## Retained verification

### PR #269

Exact head `234eda81ab5c49c3325c7fd9231d3d66841c0013` passed CI #1014, P12 Final Release Artifact #325 and P12 Offline Acceptance #369 on Windows/macOS/Ubuntu before guarded squash merge `6514959cbfd9a71c241b204f371a330a6be462e2`.

### PR #270

Exact corrected head `5d739cde842cefe6ff640aeba74da4900eddb831` passed CI #1017, P12 Final Release Artifact #328 and P12 Offline Acceptance #372 on Windows/macOS/Ubuntu before guarded squash merge `a70b003bd533cbf42d1aaaabf722639852ba48db`.

### PR #272

Exact head `e59058a7de174b18d8377d8052610efc9a12b4c2` passed CI #1019, P12 Final Release Artifact #330 and P12 Offline Acceptance #374 on Windows/macOS/Ubuntu before guarded squash merge `f06858ce384ce7d01510813b34b0ff803912e944`.

## Current repository state

Current main is:

`f06858ce384ce7d01510813b34b0ff803912e944`

Canonical status synchronization is tracked by #273 on `docs/p13-p14-post-272-status-273`.

P12 remains at its retained 80% release-exit state. P15-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.

## Next P14 step

After #273 status synchronization closes, run the next focused P14 implementation-gap audit. Do not infer that a real P13 candidate or review manifest authorizes confirmation or mutation. Any future confirmation/mutation surface requires an explicit separate contract preserving exact evidence freshness, production recipe authorization, candidate-only mutation, validation/re-score/source-immutability gates, fail-closed cleanup, and #159 real-Figma runtime evidence before real mutation exposure.
