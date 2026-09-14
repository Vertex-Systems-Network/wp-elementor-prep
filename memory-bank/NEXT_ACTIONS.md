# Next Actions

Last updated: 2026-09-15

Runtime artifact preflight requires `config/runtime-artifacts.json` schema-v3 and must fail closed on stale or mismatched registered artifacts.

## Priority 1 — preserve P14 mutation boundary

P14 remains **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**.

- Keep #159 genuine Figma Desktop Build-Ready runtime/parity evidence as the prerequisite before real P14 mutation exposure.
- `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty.
- Do not convert read-only review packets, candidate signals or persisted evidence into production mutation authority.
- Any future mutation surface requires explicit recipe authorization, fresh exact evidence, candidate-only mutation, validation/re-score/source-immutability gates and fail-closed cleanup.

## Priority 2 — P15 only where genuine trusted evidence permits

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**.

The current Elementor evidence chain supports exact candidate/profile/import/reference binding, offline operator intake, sanitized pre-decision review and externally reported authentication-result binding.

A caller-supplied/external PASS is not repository authentication. A stronger P15 internal decision requires genuine retained trusted evidence and a separate explicit decision path.

## Parallel P16 state — bounded code-side foundation complete through requirements export + exact-current validation

Classification: **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current implemented P16 chain:

- PR #346 — normalized parsed-block contract + documented-core capability reporting;
- PR #350 — immutable declared target profile + deterministic SHA-256 fingerprint;
- PR #352 — profile-bound normalized assessment;
- PR #356 — deterministic normalized candidate;
- PR #358 — exact canonical candidate SHA-256 identity;
- PR #360 — exact-bound external native-serialization PASS/FAIL receipt contract;
- PR #364 — Node-20 offline exact-bound native-serialization evidence intake;
- PR #366 — sanitized native-serialization pre-decision review packet;
- PR #370 — exact-bound externally reported native evidence authentication binding;
- PR #374 — exact-bound native decision-prerequisite packet;
- PR #376 — canonical decision-prerequisite docs sync;
- PR #378 — exact-bound genuine-evidence retention requirements manifest;
- PR #380 — canonical retention-requirements docs sync;
- PR #382 — offline/operator retention-requirements export command;
- PR #384 — canonical operator-export docs sync;
- PR #386 — exact-current strict-JSON retention-requirements manifest validator.

Current progression is intentionally bounded:

`normalized document/profile -> READY candidate -> exact identity -> external receipt -> offline revalidation -> pre-decision packet -> REPORTED_PASS_AUTHENTICATION_REQUIRED -> external authentication report -> EXTERNALLY_REPORTED_PASS|FAIL -> decision prerequisite -> GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED -> retention requirements manifest/export -> exact-current manifest validation -> genuinely retained authenticated evidence -> separate internal decision`

`p16:evidence-retention-requirements` provides a Node-20 offline/operator export surface that:

- accepts only local document/profile/receipt/authentication-report JSON plus optional output path;
- rebuilds the existing exact chain;
- writes only the sanitized `gutenberg-native-serialization-evidence-retention-requirements-v1` manifest;
- returns exit 0 only for `EVIDENCE_RETENTION_REQUIREMENTS_READY`, otherwise exit 2;
- prints only safe summary metadata;
- accepts no future evidence artifact, authenticator identity, authentication method, authenticated-at assertion or evidence PASS/FAIL;
- performs no authentication and makes no internal decision;
- exposes no raw evidence reference, source evidence-reference hash or raw native Gutenberg post content.

`gutenberg-native-serialization-evidence-retention-requirements-validation-v1` now:

- rebuilds the current exact requirements manifest from document/profile/receipt/authentication-report;
- validates a previously exported manifest by strict JSON-only, key-order-independent semantic equality;
- rejects extra, missing or mutated fields;
- rejects stale candidate/profile/receipt/authentication-report bindings;
- distinguishes `REJECTED_CURRENT_CHAIN_NOT_READY` from `REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE`;
- emits `CURRENT_REQUIREMENTS_MANIFEST_VALID` only when the saved non-authorizing metadata exactly matches the current chain;
- reports only sanitized status metadata and canonical expected/provided SHA-256 fingerprints;
- never echoes the provided manifest payload and never authenticates evidence or creates an internal decision.

### Authority stop line

Do **not** implement a stronger P16 authority-bearing intake/decision merely by adding another caller-supplied result flag. The next authority-bearing progression requires genuinely retained authenticated evidence that satisfies the requirements profile, plus a separate explicit internal-decision contract/review.

Until such genuine evidence exists, keep these facts true:

- custom/unregistered/freeform blocks remain `REVIEW_REQUIRED`;
- normalized JSON is review evidence, not Gutenberg post-content serialization;
- repository model intentionally omits WordPress `innerContent`;
- declared target profile is intended-target evidence only;
- `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING` is metadata/profile alignment only;
- `EXTERNALLY_REPORTED_PASS` is caller-supplied authentication reporting only;
- `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED` is not authentication authority;
- `EVIDENCE_RETENTION_REQUIREMENTS_READY` is requirements metadata only;
- `CURRENT_REQUIREMENTS_MANIFEST_VALID` is exact-current metadata validation only;
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

### Safe code-only work while genuine evidence is absent

Only deterministic/read-only/supporting work remains unblocked, such as stricter input bounds, serialization/sanitization hardening, current-manifest validation tooling or additional rejection tests. Such work must not accept evidence as trusted, assert authentication, connect to WordPress, claim compatibility or enable generation/download.

## Roadmap state

- P12 — IN PROGRESS / 80%; historical publishing candidate remains Final Release Artifact #20;
- P13 — IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING (#159);
- P14 — CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED;
- P15 — CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED;
- P16 — CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED;
- P17-P26 — PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED;
- P27 — GATE DEFINED / EXECUTION DEFERRED (#182).

Future dependency order remains P14 -> R0/R1 as needed -> P15 only where genuine evidence permits -> bounded P16 support until genuine evidence exists -> P17 -> P18 -> P19 -> P20 -> P21 -> P22 -> P23 -> P24 -> P25 -> P26 -> P27.

## Latest retained proof

- #374 -> `6dc86dfc900244616869e5ff289c3afa815a1d2d`; corrected exact head `4560a7d9fdfaac79369bba1f5dc05b0897eeb9a9`; CI #1147, Final Release #458, Offline #502 PASS;
- #376 docs sync -> `31080f673102206e6e6ae41801569d62e2eb7512`; exact head `e05e6e366626f43e99d6745dddbdc9d87c348f93`; CI #1149, Integration #419, Final Release #460, Offline #504 PASS;
- #378 retention requirements -> `2d7c9e76eb293b8914dd1106c262064013d70b11`; exact head `8ffee524268d2fb1aac0a1dfefffd63014590d88`; CI #1151, Final Release #462, Offline #506 PASS;
- #380 docs sync -> `c6f6009538e1e0f82bed087783f2c55fa0d9e75d`; corrected exact head `c64a3cd5936fcc2c0d055fe7810a6cf574003da9`; CI #1155, Integration #424, Final Release #466, Offline #510 PASS;
- #382 requirements export -> `e2fe19364ac8615bc390f125c2afb4085bfc474c`; exact head `0626987afe962f54a7a89996219e12cf57744bc4`; CI #1157, Final Release #468, Offline #512 PASS;
- #384 docs sync -> `4c91cb3033672d6dc3a6fa28287e060a22e40734`; exact head `919df37267b195516f1b98dfd744502b58ecfe66`; CI #1159, Integration #427, Final Release #470, Offline #514 PASS;
- #386 manifest validator -> `1532fa54ec9c26bb8904ca939a01754418a70602`; exact head `dd5d1a9674e9e4fbc86fe11b040a4c9f04d0bb68`; CI #1162, Final Release #473, Offline #517 PASS.

## Current guardrails

1. No synthetic overall project percentage.
2. P12 retained release truth remains 80%; later implementation commits do not silently replace its publishing candidate.
3. P14 real mutation remains blocked until #159 plus separate mutation authorization.
4. P15/P16 caller-supplied evidence and external authentication reports remain non-authorizing until genuinely retained trusted evidence plus a separate explicit internal decision exists.
5. No raw evidence references, source evidence-reference hashes, raw global values, raw asset URLs or raw native Gutenberg post content should leak into sanitized review/decision/requirements/export/validation artifacts.
6. No Figma-to-Elementor/Gutenberg semantic generator or section transfer is accepted yet.
7. No WordPress target-environment/editor/import/render validation is accepted for P16 yet.
8. #287 remains an admin-level repository protection residual until branch rules are actually enabled.
9. P27 owns final production release and deferred live P12 evidence closure.
