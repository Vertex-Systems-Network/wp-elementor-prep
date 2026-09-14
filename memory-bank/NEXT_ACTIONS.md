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

The current Elementor evidence chain already supports exact candidate/profile/import/reference binding, offline operator intake, sanitized pre-decision review and externally reported authentication-result binding.

Do not manufacture closure by adding a WordPress connection, target mutation, unsupported Pro/add-on assumptions or product download authority.

A caller-supplied/external PASS is not repository authentication. A stronger P15 internal decision requires genuine retained trusted evidence and a separate explicit decision path.

## Parallel unblocked action — continue bounded P16 Gutenberg R1 foundation

Classification: **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current implemented P16 chain:

- PR #346 — normalized parsed-block contract + documented-core capability reporting;
- PR #350 — immutable declared target profile + deterministic SHA-256 fingerprint;
- PR #352 — profile-bound normalized assessment;
- PR #356 — deterministic non-authorizing normalized candidate;
- PR #358 — exact canonical candidate SHA-256 identity;
- PR #360 — exact-bound external native-serialization PASS/FAIL receipt contract;
- PR #364 — Node-20 offline exact-bound native-serialization evidence intake;
- PR #366 — sanitized native-serialization pre-decision review packet;
- PR #368 — canonical intake/review-packet docs sync;
- PR #370 — exact-bound externally reported native evidence authentication binding;
- PR #372 — canonical external-authentication docs sync;
- PR #374 — exact-bound native decision-prerequisite packet.

Current review progression is intentionally bounded:

`normalized document/profile -> READY candidate -> exact candidate identity -> external receipt -> offline revalidation/intake -> pre-decision packet -> REPORTED_PASS_AUTHENTICATION_REQUIRED -> external authentication report -> EXTERNALLY_REPORTED_PASS|FAIL -> decision prerequisite -> GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED -> genuinely retained authenticated evidence -> separate internal decision`

The current `gutenberg-native-serialization-authentication-report-v1` binds:

- exact current candidate identity digest;
- exact canonical receipt SHA-256;
- SHA-256 of the exact receipt `evidenceReference` without echoing the raw reference;
- bounded caller-supplied authentication result `PASS|FAIL`;
- canonical reported timestamp.

The current `gutenberg-native-serialization-decision-prerequisite-v1` then:

- revalidates that exact authentication-report chain;
- preserves exact candidate identity + canonical receipt SHA-256;
- fingerprints canonical validated authentication-report bytes;
- maps invalid auth reports to `REJECTED_INVALID_AUTHENTICATION_REPORT`;
- maps external auth FAIL to `EXTERNAL_AUTH_FAIL_REVIEW_REQUIRED`;
- maps external auth PASS only to `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`;
- intentionally omits the raw evidence reference, source evidence-reference hash and native Gutenberg post content.

The next authority-bearing P16 progression must **not** be manufactured from another caller-supplied flag. It requires genuinely retained authenticated evidence plus a separate explicit internal-decision path. Any additional code-only work should remain deterministic/read-only/evidence-review support and must not imply that external authentication reporting is trusted authentication.

Current P16 non-authority facts that must remain true:

- custom/unregistered/freeform blocks remain `REVIEW_REQUIRED`;
- normalized JSON is review evidence, not Gutenberg post-content serialization;
- the repository model intentionally omits WordPress `innerContent`;
- declared target profile is intended-target evidence only, not observed site/runtime evidence;
- `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING` is metadata/profile alignment only;
- the pre-decision packet keeps `evidenceAuthenticationStatus=NOT_RUN`;
- `EXTERNALLY_REPORTED_PASS` is caller-supplied authentication reporting only;
- strongest current code-side state is `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`;
- `authenticationAuthority=false`;
- `decisionAuthority=false`;
- `internalDecisionStatus=NOT_RUN`;
- `nativeSerializationAuthority=false`;
- `targetEnvironmentValidated=false`;
- `editorImportValidated=false`;
- `renderValidated=false`;
- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `generationEnabled=false`;
- `downloadEnabled=false`.

## Roadmap state

- P12 — IN PROGRESS / 80%; historical publishing candidate remains Final Release Artifact #20;
- P13 — IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING (#159);
- P14 — CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED;
- P15 — CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED;
- P16 — CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED;
- P17-P26 — PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED;
- P27 — GATE DEFINED / EXECUTION DEFERRED (#182).

Future dependency order remains P14 -> R0/R1 as needed -> continue P15 only where genuine evidence permits -> continue bounded P16 Gutenberg R1 -> P17 code/static-first import -> P18 frameworks -> P19 assets/design-system -> P20 round-trip QA -> P21 handoff/QA -> P22 effort -> P23 agency/bindings -> P24 CMS/forms/interactions -> P25 entitlements -> P26 optional non-authoritative AI -> P27 final production release/evidence closure.

## Latest retained proof

### P16 candidate/native-validation evidence batch

- #356 -> `14a55bf31fc741adea0839d661e3c3358cfb7053`; exact head `b01e08e517a4430b6cffcc916fdb0ae965ea1159`; CI #1128, Final Release #439, Offline #483 PASS;
- #358 -> `88617cde269393a3f886b2178c6c0a4765e3bb4a`; exact head `0ba249e9932abf76998e79abbfad122cffd18ccb`; CI #1130, Final Release #441, Offline #485 PASS;
- #360 -> `11499202e48d3c51ef416bbc447a729547eba4ce`; exact head `728e585d5ef7d90dde0fcf61286f85fdca1b1a01`; CI #1132, Final Release #443, Offline #487 PASS;
- #362 docs sync -> `dbd740a1b33ed389510fa0e5274dd5ca26e52dba`; exact-head CI/Integration/Final/Offline PASS;
- #364 -> `75d77f5eeb0d63e838bceec8fe799c31ba179117`; exact head `9190ed8c6a8f3b7b6913adef93e16184c6ccd071`; CI #1136, Final Release #447, Offline #491 PASS;
- #366 -> `d14e0416413531ca98bfd97dc57e839bef6440a1`; exact head `a5424bca7ce1e78527beba440300125058986ac7`; CI #1138, Final Release #449, Offline #493 PASS;
- #368 docs sync -> `bb21a2561df06b3053606ea35eaec66a9b903128`; exact head `9d0204660a2d8cda7578f39b153e962905fb4341`; CI #1140, Integration #413, Final Release #451, Offline #495 PASS;
- #370 -> `5328f6d0205a350e5e1f27b0106fd930e680ae17`; exact head `bd97932bafb32056979011178653eff0430c0266`; CI #1142, Final Release #453, Offline #497 PASS;
- #372 docs sync -> `ba2e3d78de79d66a5a07abd2030548893b090845`; exact head `12c3bb7f7e62d624263732ea7aa90f44ffa96c41`; CI #1144, Integration #416, Final Release #455, Offline #499 PASS;
- #374 -> `6dc86dfc900244616869e5ff289c3afa815a1d2d`; corrected exact head `4560a7d9fdfaac79369bba1f5dc05b0897eeb9a9`; CI #1147, Final Release #458, Offline #502 PASS.

## Current guardrails

1. No synthetic overall project percentage.
2. P12 retained release truth remains 80%; later implementation commits do not silently replace its publishing candidate.
3. P14 real mutation remains blocked until #159 plus separate mutation authorization.
4. P15/P16 caller-supplied evidence, external authentication reports and deterministic decision-prerequisite packets remain non-authorizing until genuinely retained trusted evidence plus a separate explicit internal decision exists.
5. No raw evidence references, source evidence-reference hashes, raw global values, raw asset URLs or raw native Gutenberg post-content should leak into sanitized decision/review artifacts.
6. No Figma-to-Elementor/Gutenberg semantic generator or section transfer is accepted yet.
7. No WordPress target-environment/editor/import/render validation is accepted for P16 yet.
8. #287 remains an admin-level repository protection residual until branch rules are actually enabled.
9. P27 owns final production release and deferred live P12 evidence closure.
