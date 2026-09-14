# P14 Retained-Duplicate Foundation

Status: CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED
Roadmap: #119  
Canonical status synchronized through P14 review-packet, P15 R1 profile/reference-review/closure-evidence/operator-intake/pre-decision-review/external-authentication-binding merges, and P16 normalized parsed-block/capability/profile/assessment/candidate/identity/external-native-serialization-receipt merges
Open acceptance/release dependencies: P13 real-Figma acceptance (#159), P12 release-exit review (#84), and final production-release gate P27 (#182)

## Purpose

P14 implements the target-neutral safety foundation for `Target-Ready Duplicate + Guided Prepare` without granting production mutation authority. The approved source remains authoritative. Any future preparation mutation must operate on a retained duplicate/candidate, validate and re-score that candidate, prove the source remained unchanged, and fail closed when evidence is stale, malformed, unreadable or unauthorized.

The implementation currently has two distinct P14 surfaces:

1. a deterministic retained-duplicate core with bounded plan, confirmation, authorization, transaction, adapter-evidence, validation/re-score, cleanup and receipt contracts;
2. a development-only **read-only Guided Prepare preview** driven by exact current P13 Build-Ready evidence, including a non-authorizing proposed-change review artifact, an exact-context deterministic runtime review packet and precise persisted-evidence rejection diagnostics.

The preview does **not** create confirmation evidence or wire retained-duplicate mutation into Figma.

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
- standalone plan-integrity and confirmation snapshots;
- safe-recipe registry bounds, semantic snapshots and exact binding authorization;
- explicit reviewed-plan confirmation contract for mutating READY plans;
- retained-duplicate transaction semantics with candidate-only recipe callbacks;
- detached adapter callback inputs and bounded adapter-output evidence;
- sequential runtime action-eligibility reassessment;
- captured planned-action identity/prerequisite binding;
- validation-profile coverage from captured plan/observed evidence;
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

## P13 analyzer/run provenance required by P14

Current P13 Build-Ready provenance is:

- analyzer semantic version `p13-core-v2`;
- deterministic `runId` bound to exact `structuralHash + configHash + analyzerVersion`;
- stale/unsupported analyzer versions rejected by persisted runtime-evidence validation;
- contradictory run IDs rejected even when other report fields look valid;
- P13 -> P14 handoff requires the current analyzer-bound identity;
- plugin/CLI `sameRunIdentity` includes analyzer version;
- `generatedAt` remains non-semantic runtime metadata.

Persisted P13 evidence inspection distinguishes `VALID`, `EMPTY`, `INVALID`, `READ_FAILED` and `QUARANTINED`. The development P13 viewer and P14 preview surface bounded rejection reasons and require a fresh Audit when evidence cannot be trusted.

The current traceable development artifact for genuine #159 Figma Desktop evidence remains:

- source `9955be0561807550a7ad1444d8d013d783820188`;
- run `34833881774`;
- artifact ID `10343017256`;
- digest `sha256:b3e5a07a5a012f9c1f4deec32389ad83a0e8550580f60de408db14644de5f1fe`;
- analyzer `p13-core-v2`;
- `acceptanceAuthority=false`, `productionReleaseArtifact=false`, `doNotPublish=true`, `targetCompatibilityClaim=false`.

This is input for #159, not runtime acceptance or production authority.

## Read-only Guided Prepare runtime preview

The development preview requires:

1. P13 Audit to produce validated Build-Ready runtime evidence;
2. exactly one current Figma Frame;
3. exact file/page/frame identity;
4. current analyzer/run identity;
5. a fresh selected-Frame deterministic scan;
6. exact persisted/current `runId`, `rootId`, `structuralHash`, `configHash`, `analyzerVersion` and compiled-build provenance;
7. only then P14 plan/review preview rendering.

The versioned proposed-change review artifact binds review to P13 run ID, source node/fingerprint, P14 plan digest and canonical eligible action IDs. The deterministic runtime review packet binds current plugin/build provenance, persisted evidence, exact Figma context, analyzer-bound P13 identity and P14 plan summary.

These surfaces keep:

- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `mutationEnabled=false`;
- `confirmationEnabled=false`.

The generated publishable release UI strips the development-only Guided Prepare/review surfaces.

## First real P13 safe-preparation opportunity

The real target-neutral P13 signal `BR_SAFE_VERTICAL_STACK_CANDIDATE` remains:

- `remediationClass: P14_SAFE_CANDIDATE`;
- LOW severity;
- zero score penalty;
- derived only from the accepted P2/P5 planner pipeline;
- emitted only when existing P5 planning returns `ELIGIBLE` for `vertical-stack` at the existing confidence gate.

The production P14 registry is still empty. Production P13 -> P14 handoff therefore converts this real candidate to REVIEW with `P14_SAFE_BINDING_REQUIRED`, leaves `eligibleActionIds=[]`, and produces a BLOCKED P14 plan. A real opportunity signal is not production mutation authority.

## Source immutability and cleanup

When the retained-duplicate transaction core is exercised in deterministic tests/synthetic adapters, the source is used only for identity/fingerprinting and cloning. Recipe callbacks operate on candidate evidence. Successful preparation still requires source-after fingerprint equality with source-before evidence.

Candidate discard or coordinator-release failures remain explicit cleanup evidence. No development preview bypasses these contracts because no real P14 mutation path is wired into the plugin UI.

## Current P14 boundaries / non-goals

Still intentionally absent:

- production safe-recipe registrations;
- approval/confirmation creation from the development preview;
- real retained-duplicate Figma mutation adapter/command;
- target-specific Elementor/Gutenberg preparation recipes;
- distributed cross-process lock claims;
- cryptographic user-authentication claims;
- target compatibility claims from target-neutral P14 evidence;
- production acceptance from automated CI or preview evidence.

P13 real-plugin runtime/parity acceptance #159 remains required before real P14 Figma mutation exposure. It does not block target-neutral core/read-only work or bounded downstream target-adapter evidence foundations.

## Downstream P15 state

P15 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**.

Its bounded non-authorizing chain now covers documented Elementor v0.4/container validation, documented-core capability reporting, candidate/import identity, immutable declared target profile, profile-bound evidence/alignment, bounded global/core-image reference review, combined reference identity, exact-bound external closure receipt, offline operator intake, pre-decision review packet and exact-bound caller-supplied authentication-result binding.

Real Elementor import remains unvalidated. Repository code does not authenticate external evidence or verifier identity. `EXTERNALLY_REPORTED_PASS` is not genuine authentication authority; `internalDecisionStatus=NOT_RUN`; closure/compatibility/production/generation/download authority remains disabled.

## Downstream P16 state

P16 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current bounded chain:

- PR #346 — official Gutenberg R0 snapshot, repository-owned normalized parsed-block contract and documented-core API-v3 capability report;
- PR #350 — immutable declared `gutenberg-target-profile-v1` and deterministic profile SHA-256 fingerprint;
- PR #352 — profile-bound normalized capability assessment with exact document/profile fingerprints and strongest state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`;
- PR #356 — deterministic `gutenberg-normalized-candidate-v1` with explicit rejected/review/`READY_FOR_NATIVE_SERIALIZATION_VALIDATION` states and canonical embedded profile/document JSON only after successful validation;
- PR #358 — exact `gutenberg-normalized-candidate-identity-v1` SHA-256 integrity identity. Only canonical READY candidates qualify; embedded evidence is rebuilt and canonical bytes must match;
- PR #360 — exact-bound `gutenberg-native-serialization-validation-receipt-v1` for caller-supplied external PASS|FAIL reports. PASS requires exact candidate/declared WordPress binding, reported parse+serialize+round-trip success, no invalid-block warnings and native-output digest metadata.

The P16 candidate identity is integrity evidence only. The external receipt validator validates structure, logical consistency and exact binding only. Repository code does not execute WordPress, run `@wordpress/blocks`/PHP, ingest raw native Gutenberg post-content bytes, fetch/authenticate evidence references or identify a verifier.

Therefore a valid reported PASS still keeps:

- `nativeSerializationAuthority=false`;
- `targetEnvironmentValidated=false`;
- `editorImportValidated=false`;
- `renderValidated=false`;
- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `generationEnabled=false`;
- `downloadEnabled=false`.

The repository normalized JSON serializer is not Gutenberg post-content serialization and intentionally omits WordPress `innerContent`. No repository raw block-comment serializer, genuine WordPress site connection, editor/import/render harness, dynamic-block rendering proof, Figma semantic mapping, selected-section transfer, pattern/package generation or download authority is accepted.

## Retained P16 verification

- PR #346 -> `66f6a77f31c69b0c4cd280a21bc03eb53759ec4d`; exact head `faab4bb4d0805e6d71c04e91ac543ee2805f762e`; CI #1118, Final #429, Offline #473 PASS.
- PR #348 docs -> `a9718ab0f9b349bbf349e829d9b0e932aa41a6c6`; exact head `1ffb6ff5f5174721047cb14616ab2d2eb2d09ee6`; CI #1120, Integration #400, Final #431, Offline #475 PASS.
- PR #350 -> `db14fe54d2d3397c9b393d95534ffffb1d475ce1`; exact head `36002c95e459b2ae60e45adc2e0db76054c1d733`; CI #1122, Final #433, Offline #477 PASS.
- PR #352 -> `5ed52132da6bee067e6e3005d1748dfd3677d2e6`; exact head `18d8635e959ab63c1af2eb1239fccbca9dbb6644`; CI #1124, Final #435, Offline #479 PASS.
- PR #354 docs -> `b29e53c264362b0e01224d15cf7b603f9aea989f`; exact head `197bf68c38fcd0886d7f00a885c97a2fb0ad2057`; CI #1126, Integration #404, Final #437, Offline #481 PASS.
- PR #356 -> `14a55bf31fc741adea0839d661e3c3358cfb7053`; exact head `b01e08e517a4430b6cffcc916fdb0ae965ea1159`; CI #1128, Final #439, Offline #483 PASS.
- PR #358 -> `88617cde269393a3f886b2178c6c0a4765e3bb4a`; exact head `0ba249e9932abf76998e79abbfad122cffd18ccb`; CI #1130, Final #441, Offline #485 PASS.
- PR #360 -> `11499202e48d3c51ef416bbc447a729547eba4ce`; exact head `728e585d5ef7d90dde0fcf61286f85fdca1b1a01`; CI #1132, Final #443, Offline #487 PASS Windows/macOS/Ubuntu.

Integration Readiness did not trigger for the code-only #350/#352/#356/#358/#360 diffs.

## Current repository state

Current main is:

`11499202e48d3c51ef416bbc447a729547eba4ce`

P12 remains at retained 80%. P14 remains **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED** with empty production registry and #159 required before real mutation exposure. P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED** with genuine trusted authentication/internal decision still pending. P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**; externally reported native-serialization PASS is not repository authority. P17-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.

## Next P13/P14 and P16 step

The next authority-bearing P13 step remains genuine Figma Desktop evidence under #159. Until that evidence is captured and separately reviewed, do not expose real P14 Figma mutation.

In parallel, P16 may continue only through bounded deterministic/non-authorizing R1 evidence work. A safe next slice is exact offline/operator intake or review packaging for the current candidate + receipt, provided it revalidates fresh candidate identity and never treats caller-supplied PASS as native-serialization authority. Repository-native serialization, genuine WordPress target validation, evidence authentication/internal decision, Figma semantic generation, pattern packaging, section transfer and download authority require separate future gates.
