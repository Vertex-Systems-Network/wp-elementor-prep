# WP Builders Prepare

Deterministic Figma audit, safe-prep and target-readiness tooling for WordPress builders and web-code workflows.

The core product prepares approved designs **without visually redesigning them**, without requiring generative AI for correctness, and without network access in the current core plugin.

Current product surfaces:

- normal Figma plugin;
- npm/Node CLI;
- deterministic audit/backlog/Build-Ready outputs;
- safety-gated P5/P6/P7 preparation foundations;
- P13 Build-Ready Score 2.0 + Responsive Risk with analyzer-bound provenance;
- development-only read-only P14 Guided Prepare preview, proposed-change review binding, exact runtime review packet and persisted-evidence diagnostics;
- P15 Elementor R1 foundation with exact candidate/profile/import/reference evidence binding and non-authorizing review/authentication-report surfaces;
- P16 Gutenberg R1 foundation with normalized parsed-block/capability contracts, declared target profile, profile-bound assessment, normalized candidate + exact identity, exact-bound external native-serialization receipt, Node-20 offline evidence intake, sanitized pre-decision review packet, exact-bound externally reported evidence-authentication binding and a sanitized decision-prerequisite packet that stops at genuine-authentication-evidence required;
- exact-build release/provenance tooling.

Current core flow:

`Figma/plugin-or-CLI input -> Audit -> classify -> score -> backlog -> plan -> candidate clone -> safe transform -> validate -> commit/rollback -> report`

Approved post-P12 direction:

`Choose target/profile -> Audit -> Target Compatibility -> Build/Target-Ready Score -> Responsive Risk -> Target-Ready Duplicate if needed -> Validate -> Generate atomically -> Artifact validation -> Real target verification when available -> Round-trip QA -> Receipt -> Download/Copy/Import -> Handoff`

Canonical planning/status docs:

- `docs/MARKET_RESEARCH_PLAN.md` — R0 market/platform research;
- `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md` — R1 reliability/compatibility contract;
- `docs/COMMERCIAL_EXPANSION_PLAN.md` — P13-P26 implementation roadmap; P27 final release gate is #182;
- `docs/P14_FOUNDATION_IMPLEMENTATION.md` — current P14 safety/read-only review contract plus synchronized downstream adapter status;
- `docs/R0_GUTENBERG_P16_2026-09-14.md` — retained P16 WordPress/Gutenberg R0 snapshot;
- `memory-bank/PROJECT_STATE.md` — current repository/project truth;
- `memory-bank/NEXT_ACTIONS.md` — current execution queue.

Machine-readable operational registry: `config/runtime-artifacts.json`, schema v3.

## Live development status

> **Progress policy:** implementation, runtime acceptance and external Community review are tracked separately. New future scope does not reduce already-completed historical core progress.

**Open PR/MR:** see the repository's current pull-request list; this README intentionally does not hardcode a count.

Open roadmap / acceptance issues:

- `#84` — P12 retained final validation/release-exit truth; remaining live runtime/publisher/2FA evidence is deferred to P27;
- `#119` — P13-P27 commercial/multi-target roadmap owner;
- `#159` — P13 real-plugin Build-Ready runtime/parity acceptance dependency;
- `#182` — P27 final production-release gate;
- `#287` — repository-admin branch-protection/ruleset hardening residual.

Current verified main is:

`6dc86dfc900244616869e5ff289c3afa815a1d2d`

### Recent verified P16 sequence

- PR #346 — first bounded normalized parsed-block/capability foundation -> `66f6a77f31c69b0c4cd280a21bc03eb53759ec4d`.
- PR #350 — immutable declared `gutenberg-target-profile-v1` + deterministic SHA-256 fingerprint -> `db14fe54d2d3397c9b393d95534ffffb1d475ce1`.
- PR #352 — profile-bound normalized capability assessment; strongest state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING` -> `5ed52132da6bee067e6e3005d1748dfd3677d2e6`.
- PR #356 — non-authorizing `gutenberg-normalized-candidate-v1` -> `14a55bf31fc741adea0839d661e3c3358cfb7053`.
- PR #358 — exact canonical candidate SHA-256 identity -> `88617cde269393a3f886b2178c6c0a4765e3bb4a`.
- PR #360 — exact-bound caller-supplied native-serialization PASS/FAIL receipt contract -> `11499202e48d3c51ef416bbc447a729547eba4ce`.
- PR #362 — canonical docs sync through the candidate/identity/receipt batch -> `dbd740a1b33ed389510fa0e5274dd5ca26e52dba`.
- PR #364 — Node-20 offline exact-bound native-serialization evidence intake -> `75d77f5eeb0d63e838bceec8fe799c31ba179117`; exact head `9190ed8c6a8f3b7b6913adef93e16184c6ccd071` passed CI #1136, P12 Final Release Artifact #447 and P12 Offline Acceptance #491.
- PR #366 — sanitized `gutenberg-native-serialization-review-packet-v1`; reported PASS advances only to evidence authentication + separate internal review -> `d14e0416413531ca98bfd97dc57e839bef6440a1`; exact head `a5424bca7ce1e78527beba440300125058986ac7` passed CI #1138, P12 Final Release Artifact #449 and P12 Offline Acceptance #493.
- PR #368 — synchronized canonical docs through the intake/review-packet batch -> `bb21a2561df06b3053606ea35eaec66a9b903128`; exact head `9d0204660a2d8cda7578f39b153e962905fb4341` passed CI #1140, Integration Readiness #413, P12 Final Release Artifact #451 and P12 Offline Acceptance #495.
- PR #370 — exact-bound `gutenberg-native-serialization-authentication-report-v1`; it binds current candidate identity digest, canonical receipt SHA-256 and SHA-256 of the source evidence reference while `EXTERNALLY_REPORTED_PASS` remains non-authorizing -> `5328f6d0205a350e5e1f27b0106fd930e680ae17`; exact head `bd97932bafb32056979011178653eff0430c0266` passed CI #1142, P12 Final Release Artifact #453 and P12 Offline Acceptance #497.
- PR #372 — synchronized canonical docs through the external-authentication binding -> `ba2e3d78de79d66a5a07abd2030548893b090845`; exact head `12c3bb7f7e62d624263732ea7aa90f44ffa96c41` passed CI #1144, Integration Readiness #416, P12 Final Release Artifact #455 and P12 Offline Acceptance #499.
- PR #374 — added `gutenberg-native-serialization-decision-prerequisite-v1`; external auth FAIL routes to review and external auth PASS stops at `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`, with no decision authority -> `6dc86dfc900244616869e5ff289c3afa815a1d2d`; corrected exact head `4560a7d9fdfaac79369bba1f5dc05b0897eeb9a9` passed CI #1147, P12 Final Release Artifact #458 and P12 Offline Acceptance #502.

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | COMPLETE | 100% | `██████████` | Keep Issues -> PR/MR -> R0 -> R1 -> development -> evidence lifecycle synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | `██████████` | None |
| P5 Conservative Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained real Figma closure |
| P6 Advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained positive/refusal closure |
| P7 Batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained 64-Frame stress/cancellation closure |
| P8 Historical exporter placeholder | DEFERRED / SUPERSEDED | N/A | `──────────` | Replaced by P15+ neutral target adapters |
| P9 Backlog generator | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real plugin export quality retained |
| P10 npm/Node CLI | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real REST/auth/plugin parity retained |
| P11 Normal Figma distribution | IMPLEMENTATION COMPLETE | 100% | `██████████` | Live publisher/install evidence remains in P12 |
| P12 Final integrated validation | IN PROGRESS | 80% | `████████░░` | Fresh exact-#20 runtime/final-details/2FA evidence + final internal exit review |
| R0 Market/platform research gate contract | DEFINED / RECURRING | 100% | `██████████` | Refresh per major adapter |
| R1 Reliability/compatibility gate contract | DEFINED / RECURRING | 100% | `██████████` | Execute profile/capability/validator/harness gate per adapter |
| P13 Build-Ready Score 2.0 + Responsive Risk | IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING | 100% impl | `██████████` | #159 real-plugin parity/internal runtime acceptance remains |
| P14 Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | `──────────` | Read-only review is active; production registry remains empty; #159 is required before real mutation exposure |
| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/profile/reference evidence chain exists; genuine trusted authentication/internal decision and real target import remain pending |
| P16 Gutenberg native export + transfer | CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED | N/A | `──────────` | Exact candidate/receipt/intake/review/auth/decision-prerequisite chain exists; strongest state requires genuine authenticated evidence; native target/editor/import/render validation remains unwired |
| P17 HTML/CSS/JS + code-to-design | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Static-first contract retained; JS execution remains separately gated |
| P18 Framework adapter platform | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Neutral Web IR + versioned adapter/build matrix retained |
| P19 Assets/fonts/design-system export | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Asset/token provenance and font constraints retained |
| P20 Round-trip QA + section portability | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Controlled render harness + calibrated QA required in implementation |
| P21 Handoff/client QA/a11y-SEO advisories | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Build from accepted target outputs; bounded claim rules retained |
| P22 Complexity / effort estimator | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Transparent effort-unit/calibration contract retained |
| P23 Agency/project/component bindings | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Stable implemented adapters first; semantic invalidation contract retained |
| P24 CMS/dynamic/forms/interactions | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Typed data/form/provider mappings retained; production writes remain out of first slice |
| P25 Free / Pro / Agency packaging | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Capability-based entitlement contract retained; publisher eligibility remains external/account-specific |
| P26 Optional AI assistance | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Non-authoritative AI authority firewall retained |
| P27 Final production release + publisher/runtime evidence | GATE DEFINED / EXECUTION DEFERRED | 0% exec | `░░░░░░░░░░` | Coordinate retained #84 truth + final live runtime/publisher/2FA evidence after implementation/internal readiness |

**Overall progress is intentionally not collapsed into one synthetic percentage.** Historical P0-P7 core remains 100%; P12 remains 80%; P13 implementation is complete with real-plugin runtime acceptance pending; P14/P15/P16 remain non-authorizing in-progress foundations; P17-P26 implementation is not started; P27 release execution is not started.

## Current P14 boundary

P14 remains **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**. `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty. Read-only preview/review evidence does not create confirmation or production mutation authority. #159 genuine Figma Desktop evidence remains required before real P14 mutation exposure.

## Current P15 boundary

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**. Declared profiles, import/reference receipts, offline intake, review packets and externally reported authentication results are exact-bound evidence surfaces only. Real Elementor/WordPress import, semantic generation, compatibility, production acceptance and download authority remain unvalidated/unaccepted.

## Current P16 boundary

P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current bounded chain:

- official WordPress/Gutenberg R0 snapshot;
- repository-owned `gutenberg-normalized-parsed-block-v1` contract and documented-core API-v3 capability reporting;
- immutable declared `gutenberg-target-profile-v1` + SHA-256 profile fingerprint;
- profile-bound normalized assessment with strongest state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`;
- deterministic `gutenberg-normalized-candidate-v1` + exact canonical candidate identity;
- exact-bound external `gutenberg-native-serialization-validation-receipt-v1`;
- Node-20 offline intake that rebuilds the current candidate and emits only sanitized `BOUND_REPORTED_PASS|BOUND_REPORTED_FAIL|REJECTED` evidence;
- deterministic sanitized `gutenberg-native-serialization-review-packet-v1` where reported PASS advances only to `REPORTED_PASS_AUTHENTICATION_REQUIRED` / `AUTHENTICATE_EVIDENCE_THEN_INTERNAL_REVIEW`;
- exact-bound `gutenberg-native-serialization-authentication-report-v1` where caller-supplied authentication `PASS|FAIL` binds current candidate identity digest, canonical receipt SHA-256 and SHA-256 of the exact source evidence reference, producing only `EXTERNALLY_REPORTED_PASS|EXTERNALLY_REPORTED_FAIL|REJECTED`;
- sanitized `gutenberg-native-serialization-decision-prerequisite-v1` that validates that exact chain, fingerprints canonical authentication-report bytes, and stops at `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED` even after external reported PASS. It intentionally does not re-expose the raw evidence reference or source evidence-reference hash.

The pre-decision packet still records `evidenceAuthenticationStatus=NOT_RUN`; the separate authentication-report surface is external reporting only and keeps `authenticationAuthority=false`. The decision-prerequisite packet keeps `decisionAuthority=false` and `internalDecisionStatus=NOT_RUN`. The repository still does **not** execute WordPress, fetch/authenticate evidence references, identify an authenticator/verifier, verify signatures, ingest raw native Gutenberg post-content, or prove target-environment/editor/import/render behavior.

`nativeSerializationAuthority=false`, `targetEnvironmentValidated=false`, `editorImportValidated=false`, `renderValidated=false`, `acceptanceAuthority=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false`, `generationEnabled=false`, and `downloadEnabled=false` remain the current authority boundary.

The normalized JSON model is not Gutenberg post-content serialization and intentionally omits WordPress `innerContent`. Custom/unregistered/freeform content remains `REVIEW_REQUIRED`.

## Current P12 publishing line

P12 remains at the retained **80%** release-exit state. The publishing-authoritative historical package remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5` with plugin ID `1680034649341961379`. Later P13-P16 development commits do not silently replace that publishing candidate.

## Immediate execution order

1. keep P14 non-authorizing while #159 real-Figma evidence remains pending;
2. continue P15 only where genuine trusted evidence permits a stronger internal decision;
3. continue P16 only through bounded deterministic/read-only/evidence-review R1 slices while native target validation remains unwired; the next authority-bearing progression requires genuinely retained authenticated evidence and a separate internal decision;
4. continue P17-P26 in retained dependency order;
5. execute P27 #182 only after implementation/internal readiness is ready;
6. during P27, retain the remaining exact P12 runtime/publisher/2FA evidence and perform the genuine #84 release-exit decision.
