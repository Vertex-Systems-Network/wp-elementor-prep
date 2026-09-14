# Project State

Last updated: 2026-09-15

## Product direction

WP Builders Prepare is a deterministic Figma audit/safe-prep platform evolving toward validated multi-target build output while preserving offline/fail-closed authority boundaries.

Current implemented surfaces:

1. P0-P12 deterministic audit/safe-prep/CLI/release foundations;
2. P13 Build-Ready Score 2.0 + Responsive Risk with `p13-core-v2` analyzer-bound provenance;
3. P14 retained-duplicate core and development-only read-only Guided Prepare/review evidence surfaces;
4. bounded P15 Elementor R1 candidate/profile/import/reference evidence chain;
5. bounded P16 Gutenberg R1 normalized parsed-block/capability/profile/candidate/evidence-review/external-authentication/decision-prerequisite chain;
6. exact-build release/provenance tooling.

Approved target order remains Elementor first, Gutenberg second, followed by generic web/framework targets.

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains the machine-readable runtime artifact authority.

## Current repository main

Current verified main before this documentation sync:

`6dc86dfc900244616869e5ff289c3afa815a1d2d`

Recent guarded merge line:

- #354 P16 declared-profile/profile-assessment docs sync -> `b29e53c264362b0e01224d15cf7b603f9aea989f`;
- #356 normalized Gutenberg candidate -> `14a55bf31fc741adea0839d661e3c3358cfb7053`;
- #358 exact canonical Gutenberg candidate identity -> `88617cde269393a3f886b2178c6c0a4765e3bb4a`;
- #360 exact-bound external native-serialization receipt -> `11499202e48d3c51ef416bbc447a729547eba4ce`;
- #362 canonical candidate/identity/receipt docs sync -> `dbd740a1b33ed389510fa0e5274dd5ca26e52dba`;
- #364 Node-20 offline exact-bound native-serialization evidence intake -> `75d77f5eeb0d63e838bceec8fe799c31ba179117`;
- #366 sanitized native-serialization pre-decision review packet -> `d14e0416413531ca98bfd97dc57e839bef6440a1`;
- #368 canonical intake/review-packet docs sync -> `bb21a2561df06b3053606ea35eaec66a9b903128`;
- #370 exact-bound externally reported native evidence authentication -> `5328f6d0205a350e5e1f27b0106fd930e680ae17`;
- #372 canonical external-authentication docs sync -> `ba2e3d78de79d66a5a07abd2030548893b090845`;
- #374 exact-bound native decision prerequisite packet -> `6dc86dfc900244616869e5ff289c3afa815a1d2d`.

## Current issue queue

Persistent roadmap/release dependencies:

- #84 — P12 final integrated validation/release-exit, retained at 80%;
- #119 — P13-P27 commercial/multi-target roadmap owner;
- #159 — P13 genuine real-Figma Build-Ready runtime/parity acceptance dependency;
- #182 — P27 final production-release/evidence gate;
- #287 — repository-admin branch protection/ruleset hardening residual.

Focused P16 issues through #373 are completed through their reviewed implementation flows. Issue #375 owns the current canonical docs sync.

## P12 state

P12 remains **IN PROGRESS / 80%**.

The publishing-authoritative historical candidate remains Final Release Artifact #20 from source:

`5f12b1d28146d5c2af815cc9f83eb30431dce4b5`

Publishing/plugin ID:

`1680034649341961379`

Later P13-P16 development commits do not replace this historical publishing candidate by implication.

Remaining live/manual evidence is deferred to P27: exact-current runtime/publish flow, intended publisher identity, 2FA/security evidence and the separate final internal #84 release-exit decision.

## P13 state

P13 is **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING** with `100% impl`.

Current analyzer is `p13-core-v2`; run identity binds structural hash, config hash and analyzer version. Persisted evidence rejects stale/unsupported identities.

#159 remains required for genuine Figma Desktop runtime/parity acceptance.

## P14 state

P14 remains exactly **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED** with `N/A` progress.

The read-only Guided Prepare/review/evidence chain is implemented in development, but `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty. Production handoff therefore remains REVIEW/BLOCKED and no real P14 Figma mutation authority exists.

#159 remains required before real P14 mutation exposure.

## P15 state

P15 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED** with `N/A` progress.

Current bounded Elementor R1 chain includes:

- documented v0.4/container template validation;
- directly documented classic-widget capability reporting;
- deterministic non-authorizing candidate + exact identity;
- declared target profile + profile fingerprint;
- exact-bound import/reference evidence;
- bounded global/core-image asset reference review;
- reference-review identity + external closure receipt;
- offline operator intake;
- sanitized pre-decision review packet;
- exact-bound externally reported authentication-result binding.

Genuine trusted evidence authentication/internal decision, real WordPress/Elementor import, semantic generation, target compatibility, production acceptance and download authority remain pending/unwired.

## P16 state

P16 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current bounded deterministic/read-only/evidence-review chain includes:

- official WordPress/Gutenberg R0 snapshot;
- `gutenberg-normalized-parsed-block-v1` over normalized `blockName`, `attrs`, `innerBlocks`, `innerHTML`;
- bounded fail-closed node/depth/attribute/string validation;
- top-level `blockName=null` freeform handling distinct from named blocks;
- read-only documented-core capability reporting for exact API-v3 IDs `core/paragraph`, `core/heading`, `core/image`, `core/group`;
- custom/unregistered/freeform content remains `REVIEW_REQUIRED`;
- immutable declared `gutenberg-target-profile-v1` + deterministic SHA-256 profile fingerprint;
- profile-bound normalized assessment with strongest state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`;
- deterministic `gutenberg-normalized-candidate-v1` with invalid-profile, invalid-document, REVIEW and `READY_FOR_NATIVE_SERIALIZATION_VALIDATION` states;
- exact canonical `gutenberg-normalized-candidate-identity-v1` SHA-256 integrity identity;
- exact-bound caller-supplied `gutenberg-native-serialization-validation-receipt-v1`;
- Node-20 offline intake that rebuilds the current candidate, recomputes identity, revalidates the receipt and emits sanitized `BOUND_REPORTED_PASS|BOUND_REPORTED_FAIL|REJECTED` evidence plus raw-input hashes;
- deterministic `gutenberg-native-serialization-review-packet-v1` where valid reported PASS advances only to `REPORTED_PASS_AUTHENTICATION_REQUIRED` and next action `AUTHENTICATE_EVIDENCE_THEN_INTERNAL_REVIEW`;
- exact-bound `gutenberg-native-serialization-authentication-report-v1` where a caller-supplied authentication result binds the exact current candidate identity digest, canonical receipt SHA-256 and SHA-256 of the exact source evidence reference and emits `EXTERNALLY_REPORTED_PASS|EXTERNALLY_REPORTED_FAIL|REJECTED`;
- deterministic sanitized `gutenberg-native-serialization-decision-prerequisite-v1` that validates that exact chain, fingerprints canonical authentication-report bytes, and yields `REJECTED_INVALID_AUTHENTICATION_REPORT`, `EXTERNAL_AUTH_FAIL_REVIEW_REQUIRED`, or strongest `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`. It intentionally omits the raw evidence reference, the source evidence-reference hash, and raw native Gutenberg post content.

The normalized JSON serializer is not Gutenberg post-content serialization and the normalized repository model intentionally omits WordPress `innerContent`.

The pre-decision packet itself still records `evidenceAuthenticationStatus=NOT_RUN`. The separate authentication-report contract remains external reporting only: `authenticationAuthority=false`. The decision-prerequisite packet explicitly adds `decisionAuthority=false` and keeps `internalDecisionStatus=NOT_RUN`. Repository code still does not execute WordPress, `@wordpress/blocks` or PHP; does not connect to WordPress REST/site runtime; does not fetch/authenticate evidence; does not identify an authenticator/verifier; does not verify signatures; and does not prove target-environment/editor/import/render behavior.

Current authority remains fixed:

- `authenticationAuthority=false`;
- `nativeSerializationAuthority=false`;
- `targetEnvironmentValidated=false`;
- `editorImportValidated=false`;
- `renderValidated=false`;
- `decisionAuthority=false`;
- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `generationEnabled=false`;
- `downloadEnabled=false`;
- `internalDecisionStatus=NOT_RUN`.

A valid `EXTERNALLY_REPORTED_PASS` remains caller-supplied reporting only. The strongest current code-side state is `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`, not repository authentication, internal acceptance, native-serialization authority or target compatibility.

## P17-P26 state

P17-P26 remain **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**. Their retained design contracts remain available but no implementation-complete or production claims are made.

## P27 state

P27 #182 remains **GATE DEFINED / EXECUTION DEFERRED**. It owns final production acceptance, exact-current release provenance, deferred live P12 runtime/publisher/2FA evidence and the separate #84 release-exit decision.

## Immediate project action

1. Keep #159 as the prerequisite before real P14 mutation exposure.
2. Continue P15 only where genuine trusted evidence allows stronger internal decisions.
3. Continue P16 only through bounded deterministic/read-only/evidence-review R1 slices while native target validation remains unwired.
4. Do not manufacture P16 authority from caller-supplied receipts/authentication reports or deterministic prerequisite packets; any authority-bearing progression requires genuinely retained authenticated evidence and a separate explicit internal decision path.
5. Keep P17-P26 in dependency order after stable target-adapter foundations.
6. Execute P27 only when implementation/internal readiness is complete.
7. Keep #287 open until repository settings actually enforce the required rules.

No synthetic overall project percentage is used. Historical module completion, implementation readiness, runtime acceptance and production release remain separate evidence states.
