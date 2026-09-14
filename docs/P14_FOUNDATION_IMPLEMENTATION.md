# P14 Retained-Duplicate Foundation

Status: CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED  
Roadmap: #119  
Canonical status synchronized through P14 review-packet work, the bounded P15 Elementor R1 evidence/review chain, and P16 Gutenberg R1 through offline native-serialization intake + sanitized pre-decision review packet.

Open acceptance/release dependencies: P13 real-Figma acceptance (#159), P12 release-exit review (#84), and final production-release gate P27 (#182).

## Purpose

P14 owns target-neutral **Target-Ready Duplicate + Guided Prepare** foundations. Its safety contract is deliberately separate from Elementor/Gutenberg target adapters.

The approved source design remains authoritative. Any preparation path must operate on a retained candidate/duplicate, validate before acceptance, fail closed on ambiguity, and never reinterpret static evidence as production mutation authority.

## Current P14 authority boundary

P14 remains exactly **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**.

Current retained behavior includes:

- deterministic target-neutral retained-duplicate planning;
- development-only read-only Guided Prepare preview;
- fresh analyzer-bound P13 evidence requirements;
- proposed-change review manifest/binding;
- exact runtime review packet;
- persisted-evidence inspection/rejection diagnostics;
- candidate-only safety semantics.

`PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty. Therefore current production handoff still downgrades a candidate to REVIEW with `P14_SAFE_BINDING_REQUIRED`, produces no production-eligible mutation action IDs and keeps the P14 plan blocked.

The read-only preview/review surfaces do **not**:

- confirm a mutation;
- execute the retained-duplicate transaction;
- grant target compatibility;
- grant production acceptance;
- bypass #159 real-Figma runtime evidence.

## P13 provenance dependency

P13 current analyzer semantic version remains `p13-core-v2`. Build-Ready run identity binds exact source structural hash, config hash and analyzer version. Persisted evidence must fail closed when stale, malformed or produced by an unsupported analyzer identity.

#159 remains the genuine Figma Desktop runtime/parity acceptance dependency before real P14 mutation exposure.

## Downstream adapter separation

P15 Elementor and P16 Gutenberg may build deterministic/read-only/evidence contracts in parallel, but they do not authorize P14 mutation and P14 does not manufacture their target-runtime evidence.

### Current P15 state

P15 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED** with `N/A` progress.

The bounded Elementor chain includes declared target profiles, exact candidate/import-evidence binding, reference review/closure evidence, offline operator intake, pre-decision packets and externally reported authentication-result binding. These are non-authorizing evidence/review surfaces.

Real WordPress/Elementor target import, trusted evidence authentication/internal decision, semantic generation, target compatibility, production acceptance and product download remain unvalidated/unaccepted.

### Current P16 state

P16 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current bounded Gutenberg R1 chain includes:

- official WordPress/Gutenberg R0 snapshot;
- repository-owned `gutenberg-normalized-parsed-block-v1` normalized review contract;
- fail-closed normalized block validation and documented-core API-v3 capability reporting;
- immutable declared `gutenberg-target-profile-v1` + deterministic SHA-256 fingerprint;
- deterministic profile-bound normalized assessment with strongest state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`;
- non-authorizing `gutenberg-normalized-candidate-v1` and exact canonical candidate identity;
- exact-bound caller-supplied `gutenberg-native-serialization-validation-receipt-v1`;
- Node-20 offline intake that rebuilds the current candidate, revalidates exact receipt binding and emits sanitized `BOUND_REPORTED_PASS|BOUND_REPORTED_FAIL|REJECTED` evidence without echoing raw evidence references or native Gutenberg post-content;
- deterministic sanitized `gutenberg-native-serialization-review-packet-v1` where valid reported PASS advances only to `REPORTED_PASS_AUTHENTICATION_REQUIRED` / `AUTHENTICATE_EVIDENCE_THEN_INTERNAL_REVIEW`.

`evidenceAuthenticationStatus=NOT_RUN` and `internalDecisionStatus=NOT_RUN` remain fixed. Repository code does not execute WordPress, fetch/authenticate evidence, identify a verifier, or establish truth of the external observation.

The normalized JSON serializer is not Gutenberg post-content serialization and the repository normalized model intentionally omits WordPress `innerContent`.

No raw block-comment serializer, `@wordpress/blocks`/PHP runtime execution, WordPress REST/site connection, target-environment validation, editor/import/render proof, dynamic-block render proof, Figma semantic mapping, selected-section transfer, pattern/package generation, production acceptance or download authority is wired.

Current P16 authority flags remain false:

- `nativeSerializationAuthority=false`;
- `targetEnvironmentValidated=false`;
- `editorImportValidated=false`;
- `renderValidated=false`;
- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `generationEnabled=false`;
- `downloadEnabled=false`.

## Current repository state

Current verified main before this documentation sync is:

`d14e0416413531ca98bfd97dc57e839bef6440a1`

Recent P16 merge line:

- #356 normalized candidate -> `14a55bf31fc741adea0839d661e3c3358cfb7053`;
- #358 exact candidate identity -> `88617cde269393a3f886b2178c6c0a4765e3bb4a`;
- #360 external native-serialization receipt -> `11499202e48d3c51ef416bbc447a729547eba4ce`;
- #362 canonical docs sync -> `dbd740a1b33ed389510fa0e5274dd5ca26e52dba`;
- #364 offline native-serialization evidence intake -> `75d77f5eeb0d63e838bceec8fe799c31ba179117`;
- #366 sanitized pre-decision native-serialization review packet -> `d14e0416413531ca98bfd97dc57e839bef6440a1`.

P12 remains at the retained **80%** release-exit state. Its publishing-authoritative historical candidate remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5` with plugin ID `1680034649341961379`. Later development commits do not silently replace that publishing candidate.

P17-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate.

## Next P13/P14 step

Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. Target-neutral/read-only P14 work may continue, but any future confirmation/mutation surface requires a separate explicit contract preserving exact evidence freshness, production recipe authorization, candidate-only mutation, validation/re-score/source-immutability gates and fail-closed cleanup.

In parallel, P16 may continue only through bounded deterministic/read-only/evidence-review R1 slices while native target validation remains unwired. Externally reported PASS, offline intake and pre-decision packet state must not be promoted into repository-native serialization authority or target compatibility without separate authenticated evidence and a separate internal decision path.
