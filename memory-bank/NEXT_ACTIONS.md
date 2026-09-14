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
- PR #366 — sanitized native-serialization pre-decision review packet.

Current review progression is intentionally bounded:

`normalized document/profile -> READY candidate -> exact candidate identity -> external receipt -> offline revalidation/intake -> pre-decision packet -> REPORTED_PASS_AUTHENTICATION_REQUIRED -> authenticate retained evidence -> separate internal decision`

The next safe P16 slice may bind an **externally reported evidence-authentication result** to the exact current candidate identity + canonical receipt hash + evidence-reference hash, following the existing P15 pattern, but it must remain non-authorizing by itself.

Required next-slice constraints if implemented:

- only accept a current exact-bound `REPORTED_PASS_AUTHENTICATION_REQUIRED` packet;
- bind exact current candidate identity;
- bind canonical receipt SHA-256;
- bind SHA-256 of the required evidence reference without echoing the raw reference;
- allow only bounded externally reported authentication outcomes;
- keep repository evidence authentication authority false;
- keep `internalDecisionStatus=NOT_RUN`;
- keep all target/runtime/compatibility/production/generation/download authority false;
- reject stale candidate/profile/document/receipt/review identities fail closed.

Do **not** treat the current intake or pre-decision packet as native serialization authority. Repository code still does not execute WordPress, fetch/authenticate evidence, identify a verifier or prove the target environment.

Current P16 non-authority facts that must remain true:

- custom/unregistered/freeform blocks remain `REVIEW_REQUIRED`;
- normalized JSON is review evidence, not Gutenberg post-content serialization;
- the repository model intentionally omits WordPress `innerContent`;
- declared target profile is intended-target evidence only, not observed site/runtime evidence;
- `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING` is metadata/profile alignment only;
- `REPORTED_PASS_AUTHENTICATION_REQUIRED` is caller-supplied evidence awaiting authentication/internal review;
- `evidenceAuthenticationStatus=NOT_RUN`;
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
- #366 -> `d14e0416413531ca98bfd97dc57e839bef6440a1`; exact head `a5424bca7ce1e78527beba440300125058986ac7`; CI #1138, Final Release #449, Offline #493 PASS.

## Current guardrails

1. No synthetic overall project percentage.
2. P12 retained release truth remains 80%; later implementation commits do not silently replace its publishing candidate.
3. P14 real mutation remains blocked until #159 plus separate mutation authorization.
4. P15/P16 evidence surfaces are non-authorizing unless a later explicit authenticated/internal decision contract says otherwise.
5. No raw evidence references, raw global values, raw asset URLs or raw native Gutenberg post-content should leak into sanitized review artifacts.
6. No Figma-to-Elementor/Gutenberg semantic generator or section transfer is accepted yet.
7. No WordPress target-environment/editor/import/render validation is accepted for P16 yet.
8. #287 remains an admin-level repository protection residual until branch rules are actually enabled.
9. P27 owns final production release and deferred live P12 evidence closure.
