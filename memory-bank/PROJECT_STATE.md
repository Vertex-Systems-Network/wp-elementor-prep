# Project State

Last updated: 2026-09-15

## Product direction

WP Builders Prepare is a deterministic Figma audit/safe-prep platform evolving toward validated multi-target build output while preserving offline/fail-closed authority boundaries.

Current implemented surfaces:

1. P0-P12 deterministic audit/safe-prep/CLI/release foundations;
2. P13 Build-Ready Score 2.0 + Responsive Risk with `p13-core-v2` analyzer-bound provenance;
3. P14 retained-duplicate core and development-only read-only Guided Prepare/review evidence surfaces;
4. bounded P15 Elementor R1 candidate/profile/import/reference evidence chain;
5. bounded P16 Gutenberg R1 normalized candidate/native-validation evidence chain through a genuine-evidence retention requirements manifest, offline operator export, exact-current saved-manifest validator, offline validation CLI, bounded local JSON I/O and prototype-safe canonicalization;
6. exact-build release/provenance tooling.

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains the machine-readable runtime artifact authority.

## Current repository main

Current verified main before this documentation sync:

`4ec559f538899697d51138fc35ed79c2bea486b1`

Recent guarded merge line:

- #370 exact-bound external native evidence authentication binding -> `5328f6d0205a350e5e1f27b0106fd930e680ae17`;
- #372 canonical authentication docs sync -> `ba2e3d78de79d66a5a07abd2030548893b090845`;
- #374 exact-bound native decision prerequisite -> `6dc86dfc900244616869e5ff289c3afa815a1d2d`;
- #376 canonical decision-prerequisite docs sync -> `31080f673102206e6e6ae41801569d62e2eb7512`;
- #378 genuine evidence retention requirements manifest -> `2d7c9e76eb293b8914dd1106c262064013d70b11`;
- #380 canonical retention-requirements docs sync -> `c6f6009538e1e0f82bed087783f2c55fa0d9e75d`;
- #382 offline/operator retention-requirements export -> `e2fe19364ac8615bc390f125c2afb4085bfc474c`;
- #384 canonical operator-export docs sync -> `4c91cb3033672d6dc3a6fa28287e060a22e40734`;
- #386 exact-current retention-requirements manifest validator -> `1532fa54ec9c26bb8904ca939a01754418a70602`;
- #388 canonical manifest-validator docs sync -> `d7532a98b71e5dc5ac6c100b0386f06422966cf9`;
- #390 offline/operator exact-current retention-manifest validation CLI -> `c173c617ad205f0fef4a5659f27bf007067e6eb5`;
- #392 canonical validation-CLI docs sync -> `78f25d0cbc72427ea9824370762099db916750ed`;
- #394 retention operator local-file hardening -> `19d36b87b71cdc0d8b8f862c733420d64a56d3d2`;
- #396 canonical file-bound-hardening docs sync -> `12dc1e7e7e149e4da51a13c14722ac834f8a69ca`;
- #398 prototype-safe retention-manifest canonicalization -> `4ec559f538899697d51138fc35ed79c2bea486b1`.

## Persistent issue queue

- #84 — P12 final integrated validation/release-exit, retained at 80%;
- #119 — P13-P27 commercial/multi-target roadmap owner;
- #159 — genuine Figma Desktop Build-Ready runtime/parity acceptance dependency;
- #182 — P27 final production-release/evidence gate;
- #287 — repository-admin branch protection/ruleset hardening residual.

## P12 state

P12 remains **IN PROGRESS / 80%**.

The publishing-authoritative historical candidate remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`.

Later P13-P16 development commits do not replace this historical publishing candidate by implication. Remaining live/manual release evidence is deferred to P27.

## P13 state

P13 is **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING** with `100% impl`. #159 remains required for genuine Figma Desktop runtime/parity acceptance.

## P14 state

P14 remains exactly **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED** with `N/A` progress.

`PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty. Production handoff remains REVIEW/BLOCKED and no real P14 mutation authority exists. #159 remains required before real mutation exposure.

## P15 state

P15 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED** with `N/A` progress.

Current bounded Elementor chain includes documented template/capability validation, deterministic candidate + identity, declared target profile, exact-bound import/reference evidence, offline intake, sanitized pre-decision review and externally reported authentication-result binding.

Genuine trusted evidence authentication/internal decision, real WordPress/Elementor import, semantic generation, compatibility, production acceptance and download authority remain pending/unwired.

## P16 state

P16 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current bounded deterministic/read-only/evidence chain includes:

- official WordPress/Gutenberg R0 snapshot;
- normalized parsed-block contract over repository-owned review JSON;
- documented-core capability reporting;
- immutable declared target profile + SHA-256 profile fingerprint;
- profile-bound normalized assessment with strongest metadata state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`;
- deterministic normalized candidate + exact canonical candidate identity;
- exact-bound caller-supplied native-serialization receipt;
- Node-20 offline exact-bound receipt intake/revalidation;
- deterministic sanitized pre-decision review packet;
- exact-bound externally reported evidence-authentication report;
- deterministic decision prerequisite where external auth PASS stops at `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`;
- deterministic `gutenberg-native-serialization-evidence-retention-requirements-v1` that is READY only from that exact prerequisite, preserves exact chain fingerprints + declared WordPress version, and fingerprints a fixed future evidence-retention requirements profile;
- package command `p16:evidence-retention-requirements`, a Node-20 offline/operator export that reads only the existing local document/profile/receipt/authentication-report JSON chain and writes that sanitized requirements manifest;
- deterministic `gutenberg-native-serialization-evidence-retention-requirements-validation-v1`, which rebuilds the current exact requirements manifest and validates a previously exported manifest using strict JSON-only, key-order-independent semantic equality;
- package command `p16:evidence-retention-requirements-validate`, a Node-20 offline/operator validation CLI that reads only local document/profile/receipt/authentication-report/manifest JSON and writes only the sanitized validator result;
- shared bounded local JSON I/O for both retention CLIs: each input is capped at 1 MiB before parse with a post-read byte-length recheck, must be a regular file, cannot be zero-byte/whitespace-only, and the normalized output path cannot collide with any input path;
- prototype-safe exact-current canonicalization: canonical object snapshots use no `Object.prototype`, so own enumerable JSON keys such as `__proto__` remain data properties, alter fingerprints and are rejected when added instead of being silently dropped.

Focused regressions cover both top-level and nested own `__proto__` additions and confirm `Object.prototype` remains unpolluted. Validator version/schema/status are unchanged because this restores the existing strict extra-field rejection contract.

Operator/input failures remain exit code 2 with deterministic content-free errors. Windows path comparison is case-normalized for output/input collision checks.

The validation CLI exits 0 only for `CURRENT_REQUIREMENTS_MANIFEST_VALID`; every rejected current-chain/stale/tampered state exits 2. Stdout contains only output path, validation status, current requirements status, exactSemanticMatch and canonical expected/provided SHA-256 values.

The validator rejects extra/missing/mutated fields and stale exact-chain bindings. Exact outcomes are `REJECTED_CURRENT_CHAIN_NOT_READY`, `REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE`, and `CURRENT_REQUIREMENTS_MANIFEST_VALID`. VALID means only that the previously exported non-authorizing requirements metadata exactly matches the current deterministic chain.

The retention requirements manifest/export/validator/validation CLI accepts no future evidence artifact, authenticator identity, authentication method, authenticated-at assertion or evidence PASS/FAIL. It does not authenticate anything and does not make an internal decision. Export exit 0 means only `EVIDENCE_RETENTION_REQUIREMENTS_READY` requirements metadata.

Written output/stdout/validator results intentionally omit the raw evidence reference, source evidence-reference hash, supplied manifest payload and native Gutenberg post content. Validator/CLI output carries sanitized status metadata plus canonical expected/provided SHA-256 fingerprints only.

Repository code still does not execute WordPress, `@wordpress/blocks` or PHP; does not connect to WordPress REST/site runtime; does not fetch/authenticate evidence; does not identify or verify an authenticator; does not validate signatures; and does not prove target environment/editor/import/render behavior.

Current authority remains fixed:

- `evidenceAuthenticationStatus=NOT_RUN`;
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
- `internalDecisionStatus=NOT_RUN`;
- `internalDecisionEligible=false`.

The normalized JSON model is not Gutenberg post-content serialization and intentionally omits WordPress `innerContent`. Custom/unregistered/freeform content remains `REVIEW_REQUIRED`.

Strongest current code-side state remains a requirements-ready export/validation surface with an offline exact-current checker, bounded local-file I/O and prototype-safe canonicalization that still requires **genuinely retained authenticated evidence** before any authority-bearing internal decision path may be added or executed.

## P17-P26 state

P17-P26 remain **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**. No implementation-complete or production claims are made.

## P27 state

P27 #182 remains **GATE DEFINED / EXECUTION DEFERRED**. It owns final production acceptance, exact-current release provenance, deferred live P12 runtime/publisher/2FA evidence and the separate #84 release-exit decision.

## Immediate project action

1. Keep #159 as the prerequisite before real P14 mutation exposure.
2. Continue P15 only where genuine trusted evidence allows a stronger internal decision.
3. Do not manufacture a P16 trusted-evidence intake or internal decision from another caller-supplied flag; actual retained authenticated evidence is now required for the next authority-bearing progression.
4. Additional P16 code-only work may remain deterministic/read-only/supporting only if every current false authority flag remains false.
5. Keep P17-P26 in dependency order after stable target-adapter foundations.
6. Execute P27 only when implementation/internal readiness is complete.
7. Keep #287 open until repository settings actually enforce the required rules.

No synthetic overall project percentage is used.