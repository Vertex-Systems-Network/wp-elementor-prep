# P14 Retained-Duplicate Foundation

Status: CORE IMPLEMENTATION + READ-ONLY GUIDED PREPARE RUNTIME PREVIEW — CONFIRMATION/MUTATION UNWIRED  
Roadmap: #119  
Current status synchronization: #264  
Open acceptance/release dependencies: P13 real-Figma acceptance (#159), P12 release-exit review (#84), and final production-release gate P27 (#182)

## Purpose

P14 implements the target-neutral safety foundation for `Target-Ready Duplicate + Guided Prepare` without granting production mutation authority. The approved source remains authoritative. Any future preparation mutation must operate on a retained duplicate/candidate, validate and re-score that candidate, prove the source remained unchanged, and fail closed when evidence is stale, malformed, unreadable or unauthorized.

The current implementation has two distinct surfaces:

1. a deterministic retained-duplicate core with bounded plan, confirmation, authorization, transaction, adapter-evidence, validation/re-score, cleanup and receipt contracts;
2. a development-only **read-only Guided Prepare preview** driven by retained P13 Build-Ready evidence.

The second surface does **not** wire confirmation or retained-duplicate mutation into Figma.

## Authority model

P14 keeps these authorities separate:

- **plan integrity** — the plan is internally coherent and digest-bound;
- **recipe authorization** — every eligible action matches an exact current safe-recipe registry binding;
- **reviewed confirmation** — explicit reviewed intent is bound to the exact plan/run/source/action set;
- **runtime eligibility** — candidate assumptions are re-evaluated before later sequential actions;
- **validation/re-score** — candidate outcome is independently checked after mutation;
- **source immutability** — source fingerprint must remain unchanged;
- **production acceptance** — not granted by any P14 core or preview artifact.

`P14PreparationConfirmationV1`, P14 plan previews and P14 receipts all remain non-authorizing evidence. They do not establish user identity, authentication, target compatibility or production acceptance.

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
- explicit reviewed-plan confirmation for mutating READY plans;
- retained-duplicate transaction semantics with candidate-only recipe callbacks;
- detached adapter callback inputs and bounded adapter-output evidence;
- sequential runtime action-eligibility reassessment;
- captured planned-action identity/prerequisite binding for runtime eligibility (#251/#252);
- validation-profile coverage from captured plan and observed profile evidence (#253/#254);
- bounded validation checks and re-score evidence;
- source fingerprint validation and post-run source immutability proof;
- cooperative cancellation and bounded cancellation-failure evidence;
- source-scope transaction coordination and bounded coordinator evidence;
- fail-closed candidate cleanup and explicit `CLEANUP_REQUIRED` outcomes;
- bounded event/diagnostic/timestamp evidence;
- bounded receipt-integrity snapshots and detached receipt collections.

## Bounded evidence rule

Typed JavaScript/TypeScript values are not trusted merely because their static type looks correct. P14 treats caller-, adapter-, coordinator- and receipt-owned objects as runtime evidence.

The general rule is:

1. preflight resource size where the contract supports it;
2. capture only the known schema through guarded property/index reads;
3. copy bounded arrays into plain values rather than retaining caller-owned collections;
4. validate semantics against the captured value;
5. never re-enter a hostile/stateful getter after acceptance;
6. on unreadable/revoked evidence, fail closed with bounded diagnostics rather than throwing through the public boundary.

This is intentionally **not** a generic recursive deep clone. Each evidence boundary copies only the fields the contract actually consumes.

Oversized arrays retain length-first short-circuit behavior so item getters are not traversed when the count is already outside the accepted bound.

## Plan integrity, authorization and confirmation

For a mutating READY plan, these gates remain distinct:

1. `validateP14PreparationPlan(...)` — internal plan coherence;
2. `authorizeP14PreparationPlan(...)` — exact current registry authorization;
3. `validateP14PreparationConfirmation(...)` — reviewed intent bound to exact plan/source/run/action evidence.

Standalone plan validation now snapshots caller-owned plan evidence before integrity semantics. Standalone confirmation validation captures both confirmation and optional reviewed-plan evidence before binding semantics. Confirmation construction also captures the reviewed plan once before bounds/integrity/READY checks and field copying.

Execution authorization snapshots the plan before filtering eligible actions or comparing action fields with the stable safe-recipe registry. This prevents readable stateful action getters from changing recipe authority during one authorization pass.

Missing mutating-plan confirmation remains `P14_CONFIRMATION_REQUIRED`; malformed/stale/mismatched confirmation remains `P14_CONFIRMATION_MISMATCH`. These outcomes occur before source coordination or runtime adapter access.

## Sequential runtime eligibility and validation coverage

A later action cannot rely only on the original static plan after earlier candidate mutation.

Before later `applyRecipe(...)` calls, the core verifies completed prerequisites and requires bounded runtime eligibility evidence. The planned action binding used by that validator — action ID, recipe ID and planned prerequisite IDs — is captured once before comparison. Revoked/unreadable or changed binding evidence therefore fails closed.

Validation-profile coverage likewise captures the reviewed plan before deriving required profiles and captures observed `profileIdsRun` before canonicalization. Required/observed profile ordering, duplicate detection, optional extras and missing-profile semantics remain deterministic.

These gates do not authorize new recipes or targets; they only ensure the candidate is still being validated against the exact reviewed preparation contract.

## Read-only Guided Prepare runtime preview

P14 now has a development-only runtime preview surface, but it is deliberately non-mutating.

The sequence is:

1. P13 Audit produces and persists validated Build-Ready runtime evidence;
2. the user selects exactly one current Figma Frame;
3. the P14 preview loader validates the persisted P13 evidence;
4. the loader proves that persisted evidence belongs to the exact current file/page/frame;
5. the current Frame is freshly scanned through the existing deterministic scanner and Build-Ready analyzer;
6. persisted P13 fingerprint/build identity must match the fresh current state;
7. only then is the P14 plan preview rendered.

The preview is available in development surfaces added through:

- #255/#256 — read-only P14 plan preview model from persisted P13 evidence;
- #257/#258 — developer-menu discoverability;
- #260/#261 — normal development main-panel preview;
- #262/#263 — exact current Figma context binding;
- #265/#266 — fresh current-Frame fingerprint and exact compiled-build binding.

The generated publishable release UI strips this development-only P14 preview surface.

## Exact current-context binding

PR #263 prevents a valid but unrelated persisted P13 bundle from being shown for another current selection.

Before the preview is rendered:

- exactly one Frame must be selected;
- persisted `fileKey` must equal the current file key;
- persisted `pageId` must equal the current page ID;
- persisted `frameId` must equal the current selected Frame ID;
- file/page/frame identity is rechecked after asynchronous evidence loading so a selection/context change during the request fails closed.

Human-readable page/frame names are intentionally non-authoritative because names may change without changing identity.

A mismatch returns clear `Run Audit on this selected Frame first` guidance rather than rendering stale evidence.

PR #263 exact head `da9c59091f3142dade4a444aface5b6e6d5577b9` passed CI #1004, P12 Final Release Artifact #315 and P12 Offline Acceptance #359 on Windows/macOS/Ubuntu before guarded squash merge `196b4d2ed5c9cc46d96b6c613e20733365264d93`.

## Fresh selected-Frame and exact-build binding

Identity alone is insufficient because a Frame can be edited in place while keeping the same file/page/frame IDs. PR #266 closes that freshness gap.

The selected Frame is freshly scanned with the existing `scanSceneNode(...)` + `buildBuildReadyReport(...)` path. Persisted P13 evidence must then match the fresh current Build-Ready evidence for:

- `runId`;
- source `rootId`;
- source `structuralHash`;
- source `configHash`;
- source `analyzerVersion`.

Persisted runtime evidence must also match the current plugin for:

- plugin version;
- compiled build `sourceSha`;
- compiled build `runId`;
- compiled build `runNumber`.

If the selected Frame changed structurally, the analyzer/config/run identity changed, or the retained evidence belongs to another compiled build, the preview fails closed and requires a fresh Audit on the selected Frame.

PR #266 exact head `240d82c108c182c52d81edc058e94b0f64fcce4a` passed CI #1007, P12 Final Release Artifact #318 and P12 Offline Acceptance #362 on Windows/macOS/Ubuntu before guarded squash merge `b944dc0ceea1c0c3a531fe4e9b88a66dacf3b92f`.

## Preview authority locks

The Guided Prepare preview remains explicitly locked:

- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `mutationEnabled=false`;
- `confirmationEnabled=false`.

The preview does not call `buildP14PreparationConfirmation(...)`, does not call `runP14RetainedDuplicateTransaction(...)`, does not clone or mutate Figma nodes, and does not register a production safe recipe.

It is a review/inspection surface only.

## Source immutability and cleanup

When the retained-duplicate transaction core is exercised in deterministic tests/synthetic adapters, the approved source node ID is used only for identity/fingerprinting and cloning. Recipe callbacks receive candidate evidence, not authority to replace/delete the source.

A successful preparation path still requires source-after fingerprint equality with source-before evidence. Candidate failures attempt discard. A failed discard or transaction-coordinator release remains explicit cleanup evidence rather than being silently treated as success.

No current development preview bypasses these contracts because no real P14 retained-duplicate mutation path is wired into the plugin UI.

## Current boundaries / non-goals

Still intentionally absent:

- production safe-recipe registrations;
- P14 confirmation creation from the development preview;
- a real Figma retained-duplicate mutation adapter/command;
- target-specific Elementor/Gutenberg preparation recipes;
- distributed cross-process lock claims;
- cryptographic user authentication claims;
- target compatibility claims from target-neutral P14 evidence;
- production acceptance from automated CI or preview evidence.

P13 real-plugin runtime/parity acceptance #159 remains required before real P14 Figma mutation exposure. It does not block target-neutral core work or read-only preview hardening.

## Current repository state

Current main after the latest P14 runtime-preview safety slice is:

`b944dc0ceea1c0c3a531fe4e9b88a66dacf3b92f`

Canonical status synchronization is tracked by #264 on `docs/p14-post-266-status-264`.

P12 remains at its retained 80% release-exit state. P15-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.

## Next P14 step

After #264 status synchronization closes, continue with the next focused P14 implementation/safety slice. Do not infer that read-only preview availability authorizes confirmation or mutation. A future confirmation/mutation surface requires an explicit separate issue/contract and must preserve:

- exact current evidence freshness;
- production recipe authorization;
- explicit reviewed confirmation;
- candidate-only mutation;
- validation/re-score/source-immutability gates;
- fail-closed cleanup;
- #159 real-Figma runtime evidence before real mutation exposure.
