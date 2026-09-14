# P14 Retained-Duplicate Foundation

Status: CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED  
Roadmap: #119  
Canonical status synchronized through P14 review-packet work, the bounded P15 Elementor R1 evidence/review chain, and P16 Gutenberg R1 through genuine-evidence retention requirements metadata + offline export + exact-current manifest validation + offline validation CLI + bounded local JSON I/O + iterative structural bounds + depth/value/text-bounded accessor-safe direct canonicalization + prototype-safe canonicalization + alias-safe atomic output writes.

Open acceptance/release dependencies: P13 real-Figma acceptance (#159), P12 release-exit review (#84), and P27 final production-release gate (#182).

## Purpose

P14 owns target-neutral **Target-Ready Duplicate + Guided Prepare** foundations. The approved source design remains authoritative. Preparation must operate on a retained candidate/duplicate, validate before acceptance, fail closed on ambiguity and never reinterpret static evidence as production mutation authority.

## Current P14 authority boundary

P14 remains exactly **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**.

`PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty. Current production handoff therefore remains REVIEW/BLOCKED and no production-eligible mutation action IDs exist.

Read-only preview/review/evidence surfaces do not confirm or execute a mutation, grant target compatibility or production acceptance, or bypass #159 genuine Figma Desktop evidence.

P13 analyzer identity remains `p13-core-v2`; stale or unsupported persisted evidence must fail closed.

## Downstream adapter separation

P15 Elementor and P16 Gutenberg may build deterministic/read-only/evidence contracts in parallel, but they do not authorize P14 mutation and P14 does not manufacture target-runtime evidence.

### Current P15 state

P15 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED** with `N/A` progress.

Its bounded chain includes declared target profiles, exact candidate/import/reference evidence binding, offline operator intake, pre-decision review and externally reported authentication-result binding. These remain non-authorizing evidence/review surfaces.

Real WordPress/Elementor target import, genuine trusted evidence authentication/internal decision, semantic generation, compatibility, production acceptance and download authority remain unvalidated/unaccepted.

### Current P16 state

P16 remains exactly **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current bounded chain includes:

- normalized `gutenberg-normalized-parsed-block-v1` review contract and documented-core capability reporting;
- immutable declared `gutenberg-target-profile-v1` + deterministic profile fingerprint;
- profile-bound assessment with strongest metadata state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`;
- deterministic normalized candidate + exact canonical candidate identity;
- exact-bound caller-supplied native-serialization receipt;
- offline exact-bound receipt intake/revalidation;
- sanitized pre-decision review packet;
- exact-bound externally reported evidence-authentication report;
- sanitized decision prerequisite where external auth PASS stops at `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`;
- deterministic `gutenberg-native-serialization-evidence-retention-requirements-v1`, READY only from that exact prerequisite and containing only chain fingerprints, declared WordPress version and future retention requirements metadata;
- Node-20 package command `p16:evidence-retention-requirements`, which exports that sanitized requirements manifest from local document/profile/receipt/authentication-report JSON only;
- deterministic `gutenberg-native-serialization-evidence-retention-requirements-validation-v1`, which rebuilds the current exact requirements manifest and rejects stale/tampered/extra/missing saved manifests using strict JSON-only, key-order-independent semantic comparison;
- Node-20 package command `p16:evidence-retention-requirements-validate`, which validates local document/profile/receipt/authentication-report/manifest JSON through that contract and writes only sanitized validation metadata;
- shared fail-closed local JSON I/O for both retention CLIs: every input is capped at 1 MiB before parse with a post-read byte-length recheck, must be a regular file, cannot be zero-byte/whitespace-only, and the normalized output path cannot collide with any input path;
- iterative post-parse structural validation: container nesting is capped at 64 levels and total JSON values at 50,000 before target builders/validators execute;
- direct exact-current canonicalization independently enforces 64 container levels, 50,000 visited values and an aggregate 1 MiB UTF-8 text budget across string values + object keys for exported validator/fingerprint callers, so bypassing the operator CLI does not bypass complexity bounds;
- accessor-safe direct canonicalization: own property descriptors are read instead of invoking enumerable values through normal property access; enumerable object accessors and array-index accessors are rejected without getter/setter execution, while normal own data descriptors remain supported;
- prototype-safe canonicalization for the exact-current manifest validator: canonical objects use no `Object.prototype`, so own enumerable JSON keys including `__proto__` remain data fields, affect fingerprints and are rejected when added instead of being silently dropped;
- alias-safe output writes: output parent directories are resolved through `realpath`, canonical output is compared against real input locations, existing symlink/non-regular targets are rejected, hardlink identity against inputs is rejected where available, and output is staged in a unique same-directory regular temp file before atomic rename.

The operator structural guard is iterative rather than recursive, so the guard itself does not create a recursion limit. It rejects byte-bounded but deeply nested or high-cardinality JSON before downstream validation/canonicalization. Focused cross-CLI tests cover depth 65 and more than 50,000 total JSON values while remaining under the 1 MiB byte cap.

The direct canonicalizer accepts depth 64 and exactly 50,000 total values, fails closed for 65 / 50,001, and additionally caps aggregate UTF-8 text from object keys + string values at 1 MiB. Object-key bytes are charged before sorting. Browser-safe manual UTF-8 accounting covers ASCII, multi-byte Unicode, surrogate pairs and lone-surrogate replacement width. Accessor-backed object values and array indices are rejected from own descriptors without invoking caller-controlled getters/setters. Normal own data descriptors, including own enumerable `__proto__` data keys, remain canonicalized. Existing cycle, sparse-array, non-finite, non-JSON and non-plain-object rejection remains unchanged.

Atomic rename prevents a late-created final symlink from being followed back onto an input; it is replaced instead. Temporary output state is cleaned before fail-closed write errors. Focused tests cover symlink, hardlink and symlinked-parent aliases and verify source input immutability.

Focused canonicalization regressions cover top-level and nested own `__proto__` additions, direct structural/text boundaries and accessor-backed values, and confirm `Object.prototype` is not polluted. Validator version/schema/status are unchanged because the hardenings preserve the existing strict exact-current metadata contract.

Operator/input failures remain exit code 2 with deterministic content-free errors. Windows path comparison is case-normalized for output/input collision checks.

Validation CLI exit 0 means only `CURRENT_REQUIREMENTS_MANIFEST_VALID`; every rejection exits 2. Stdout is limited to output path, validation/current-requirements status, exactSemanticMatch and canonical expected/provided SHA-256 values. The supplied manifest payload is never echoed.

Validator outcomes remain `REJECTED_CURRENT_CHAIN_NOT_READY`, `REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE`, or `CURRENT_REQUIREMENTS_MANIFEST_VALID`. VALID means only that the saved non-authorizing requirements metadata matches the current exact chain. It does not authenticate evidence, validate WordPress, or create an internal decision.

The retention requirements manifest/export/validator/validation CLI accepts no future evidence artifact, authenticator identity, authentication method, authenticated-at assertion or evidence PASS/FAIL; it does not authenticate evidence and does not make an internal decision. Export exit 0 still means only `EVIDENCE_RETENTION_REQUIREMENTS_READY` metadata.

It intentionally does not expose raw evidence references, source evidence-reference hashes, supplied manifest payloads or raw native Gutenberg post content in the written manifest, validator result or stdout.

Current P16 authority remains fixed:

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

Repository code still does not execute WordPress/PHP/`@wordpress/blocks`, connect to WordPress REST/site runtime, fetch/authenticate evidence, identify/verify an authenticator, validate signatures, prove target environment/editor/import/render behavior, map Figma semantics, transfer sections, or generate patterns/packages.

The normalized JSON serializer is not Gutenberg post-content serialization and the repository normalized model intentionally omits WordPress `innerContent`. Custom/unregistered/freeform content remains `REVIEW_REQUIRED`.

## Current repository state

Current verified main before this documentation sync:

`4adc40d74b74f74f362cb635854dd2c8240134d8`

Recent P16 merge line:

- #370 external authentication binding -> `5328f6d0205a350e5e1f27b0106fd930e680ae17`;
- #372 canonical auth docs sync -> `ba2e3d78de79d66a5a07abd2030548893b090845`;
- #374 decision prerequisite -> `6dc86dfc900244616869e5ff289c3afa815a1d2d`;
- #376 canonical decision-prerequisite docs sync -> `31080f673102206e6e6ae41801569d62e2eb7512`;
- #378 genuine-evidence retention requirements manifest -> `2d7c9e76eb293b8914dd1106c262064013d70b11`;
- #380 canonical retention-requirements docs sync -> `c6f6009538e1e0f82bed087783f2c55fa0d9e75d`;
- #382 offline/operator retention-requirements export -> `e2fe19364ac8615bc390f125c2afb4085bfc474c`;
- #384 canonical operator-export docs sync -> `4c91cb3033672d6dc3a6fa28287e060a22e40734`;
- #386 exact-current retention-manifest validator -> `1532fa54ec9c26bb8904ca939a01754418a70602`;
- #388 canonical manifest-validator docs sync -> `d7532a98b71e5dc5ac6c100b0386f06422966cf9`;
- #390 offline/operator exact-current validation CLI -> `c173c617ad205f0fef4a5659f27bf007067e6eb5`;
- #392 canonical validation-CLI docs sync -> `78f25d0cbc72427ea9824370762099db916750ed`;
- #394 retention operator local-file hardening -> `19d36b87b71cdc0d8b8f862c733420d64a56d3d2`;
- #396 canonical file-bound-hardening docs sync -> `12dc1e7e7e149e4da51a13c14722ac834f8a69ca`;
- #398 prototype-safe retention-manifest canonicalization -> `4ec559f538899697d51138fc35ed79c2bea486b1`;
- #400 canonical prototype-safe docs sync -> `158132b4076fe5a70afa8e8778ae888fcca4db60`;
- #402 alias-safe atomic retention output writes -> `8445fc0632a58515a52d72e3cf85ed1364761b9c`;
- #404 canonical alias-safe-output docs sync -> `4f66522ae9d8dc6fb82875b32634306918ed0a9a`;
- #406 iterative retention JSON structural bounds -> `5feb04adcd6aaca2079b749d495e22e1da6f6671`;
- #408 canonical JSON-structure-bounds docs sync -> `ab8cb5e783b14688180959017aa79b9a86adfa66`;
- #410 direct retention-manifest canonicalization bounds -> `cb4de36d4922b31b1e278d4f55426d042736549b`;
- #412 canonical direct-canonicalization-bounds docs sync -> `1a7cb4b7692a0361d645ddf1396f6aac561ad093`;
- #414 direct canonicalization UTF-8 text-byte bounds -> `86cc545456a1f994c9893069b878110662a60bbe`;
- #416 canonical direct-canonical-text docs sync -> `5b0d3e9f08122c4df7cb29edfd0e51dabb8de440`;
- #418 accessor-safe direct canonicalization -> `4adc40d74b74f74f362cb635854dd2c8240134d8`.

P12 remains at the retained **80%** release-exit state. Its publishing-authoritative historical candidate remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5` with plugin ID `1680034649341961379`.

P17-P26 remain preflight-frozen / implementation-not-started. P27 #182 remains the final production-release gate. #287 remains the admin-level repository-protection residual.

## Next P13/P14 step

Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. Any future P14 mutation surface requires separate explicit authorization with fresh evidence, candidate-only mutation, validation/re-score/source-immutability gates and fail-closed cleanup.

For P16, do not promote the requirements manifest/export/validator/validation CLI, byte/structure-bounded alias-safe local-file guards, depth/value/text-bounded accessor-safe prototype-safe direct canonicalization or any caller-supplied result into trusted evidence, authentication authority or an internal decision. The next authority-bearing step requires genuinely retained authenticated evidence first.