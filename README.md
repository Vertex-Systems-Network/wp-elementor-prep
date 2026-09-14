# WP Builders Prepare

Deterministic Figma audit, safe-prep and target-readiness tooling for WordPress builders and web-code workflows.

The core product prepares approved designs **without visually redesigning them**, without requiring generative AI for correctness, and without network access in the current core plugin.

Current product surfaces:

- normal Figma plugin;
- npm/Node CLI;
- deterministic audit/backlog/Build-Ready outputs;
- safety-gated P5/P6/P7 preparation foundations;
- P13 Build-Ready Score 2.0 + Responsive Risk with analyzer-bound provenance;
- development-only read-only P14 Guided Prepare/review evidence surfaces;
- P15 Elementor R1 exact candidate/profile/import/reference evidence chain;
- P16 Gutenberg R1 normalized candidate/native-validation evidence chain through an exact decision prerequisite, non-authorizing genuine-evidence retention requirements manifest, offline operator export and exact-current manifest validator;
- exact-build release/provenance tooling.

Canonical planning/status docs:

- `docs/MARKET_RESEARCH_PLAN.md` — R0 market/platform research;
- `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md` — R1 reliability/compatibility contract;
- `docs/COMMERCIAL_EXPANSION_PLAN.md` — P13-P26 roadmap; P27 final release gate is #182;
- `docs/P14_FOUNDATION_IMPLEMENTATION.md` — current P14 boundary plus synchronized downstream adapter status;
- `docs/R0_GUTENBERG_P16_2026-09-14.md` — retained P16 WordPress/Gutenberg R0 snapshot;
- `memory-bank/PROJECT_STATE.md` — current project truth;
- `memory-bank/NEXT_ACTIONS.md` — current execution queue.

Machine-readable operational registry: `config/runtime-artifacts.json`, schema v3.

## Live development status

> **Progress policy:** implementation, runtime acceptance and external review are separate evidence states. New future scope does not reduce already-completed historical core progress.

**Open PR/MR:** see the repository's current pull-request list; this README intentionally does not hardcode a count.

Open roadmap / acceptance dependencies:

- `#84` — P12 retained final validation/release-exit truth;
- `#119` — P13-P27 commercial/multi-target roadmap owner;
- `#159` — P13 real-plugin Build-Ready runtime/parity acceptance dependency;
- `#182` — P27 final production-release gate;
- `#287` — repository-admin branch-protection/ruleset hardening residual.

Current verified main before this documentation sync:

`1532fa54ec9c26bb8904ca939a01754418a70602`

### Recent verified P16 sequence

- PR #356 — deterministic non-authorizing `gutenberg-normalized-candidate-v1` -> `14a55bf31fc741adea0839d661e3c3358cfb7053`.
- PR #358 — exact canonical candidate identity -> `88617cde269393a3f886b2178c6c0a4765e3bb4a`.
- PR #360 — exact-bound caller-supplied native-serialization receipt -> `11499202e48d3c51ef416bbc447a729547eba4ce`.
- PR #364 — Node-20 offline exact-bound native-serialization evidence intake -> `75d77f5eeb0d63e838bceec8fe799c31ba179117`.
- PR #366 — sanitized native-serialization pre-decision review packet -> `d14e0416413531ca98bfd97dc57e839bef6440a1`.
- PR #370 — exact-bound externally reported evidence-authentication report -> `5328f6d0205a350e5e1f27b0106fd930e680ae17`.
- PR #374 — exact-bound decision prerequisite; external auth PASS stops at `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED` -> `6dc86dfc900244616869e5ff289c3afa815a1d2d`.
- PR #376 — canonical decision-prerequisite docs sync -> `31080f673102206e6e6ae41801569d62e2eb7512`; exact head `e05e6e366626f43e99d6745dddbdc9d87c348f93` passed CI #1149, Integration Readiness #419, P12 Final Release Artifact #460 and P12 Offline Acceptance #504.
- PR #378 — deterministic `gutenberg-native-serialization-evidence-retention-requirements-v1`; READY only from the exact `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED` prerequisite and still non-authorizing -> `2d7c9e76eb293b8914dd1106c262064013d70b11`; exact head `8ffee524268d2fb1aac0a1dfefffd63014590d88` passed CI #1151, P12 Final Release Artifact #462 and P12 Offline Acceptance #506.
- PR #380 — synchronized canonical retention-requirements docs -> `c6f6009538e1e0f82bed087783f2c55fa0d9e75d`; corrected exact head `c64a3cd5936fcc2c0d055fe7810a6cf574003da9` passed CI #1155, Integration Readiness #424, P12 Final Release Artifact #466 and P12 Offline Acceptance #510.
- PR #382 — added package command `p16:evidence-retention-requirements` plus Node-20 offline/operator export for the sanitized requirements manifest -> `e2fe19364ac8615bc390f125c2afb4085bfc474c`; exact head `0626987afe962f54a7a89996219e12cf57744bc4` passed CI #1157, P12 Final Release Artifact #468 and P12 Offline Acceptance #512.
- PR #384 — synchronized canonical docs through the operator export -> `4c91cb3033672d6dc3a6fa28287e060a22e40734`; exact head `919df37267b195516f1b98dfd744502b58ecfe66` passed CI #1159, Integration Readiness #427, P12 Final Release Artifact #470 and P12 Offline Acceptance #514.
- PR #386 — added `gutenberg-native-serialization-evidence-retention-requirements-validation-v1`, an exact-current strict-JSON validator for exported requirements manifests -> `1532fa54ec9c26bb8904ca939a01754418a70602`; exact head `dd5d1a9674e9e4fbc86fe11b040a4c9f04d0bb68` passed CI #1162, P12 Final Release Artifact #473 and P12 Offline Acceptance #517.

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
| P14 Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | `──────────` | Read-only review is active; production registry remains empty; #159 required before real mutation exposure |
| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Genuine trusted authentication/internal decision and real target import remain pending |
| P16 Gutenberg native export + transfer | CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED | N/A | `──────────` | Exact chain + retention requirements/export/current-manifest validation exist; genuine authenticated evidence and native target/editor/import/render validation remain unwired |
| P17 HTML/CSS/JS + code-to-design | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Static-first contract retained; JS execution separately gated |
| P18 Framework adapter platform | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Neutral Web IR + adapter/build matrix retained |
| P19 Assets/fonts/design-system export | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Asset/token provenance and font constraints retained |
| P20 Round-trip QA + section portability | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Controlled render harness + calibrated QA required |
| P21 Handoff/client QA/a11y-SEO advisories | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Build from accepted target outputs |
| P22 Complexity / effort estimator | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Transparent effort-unit/calibration contract retained |
| P23 Agency/project/component bindings | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Stable implemented adapters first |
| P24 CMS/dynamic/forms/interactions | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Typed mappings retained; production writes out of first slice |
| P25 Free / Pro / Agency packaging | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Capability-based entitlement contract retained |
| P26 Optional AI assistance | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Non-authoritative AI authority firewall retained |
| P27 Final production release + publisher/runtime evidence | GATE DEFINED / EXECUTION DEFERRED | 0% exec | `░░░░░░░░░░` | Coordinate retained #84 truth + final live runtime/publisher/2FA evidence |

**Overall progress is intentionally not collapsed into one synthetic percentage.**

## Current P14 boundary

P14 remains **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**. `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty. Read-only preview/review evidence does not create confirmation or production mutation authority. #159 genuine Figma Desktop evidence remains required before real P14 mutation exposure.

## Current P15 boundary

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**. Declared profiles, import/reference receipts, offline intake, review packets and externally reported authentication results remain non-authorizing evidence surfaces. Real WordPress/Elementor import, compatibility, semantic generation, production acceptance and download authority remain unvalidated.

## Current P16 boundary

P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current bounded chain now includes:

- normalized parsed-block/capability contract;
- immutable declared `gutenberg-target-profile-v1` + profile fingerprint;
- profile-bound assessment with strongest metadata state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`;
- deterministic normalized candidate + exact candidate identity;
- exact-bound caller-supplied native-serialization receipt;
- offline receipt revalidation/intake;
- sanitized pre-decision review packet;
- exact-bound externally reported evidence-authentication report;
- sanitized decision-prerequisite packet that stops at `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`;
- deterministic `gutenberg-native-serialization-evidence-retention-requirements-v1`, READY only from that exact prerequisite. It preserves exact candidate identity, canonical receipt SHA-256, canonical authentication-report SHA-256 and declared WordPress version, then fingerprints a requirements profile for a future separate trusted intake;
- `p16:evidence-retention-requirements`, a Node-20 offline/operator export that accepts only the existing local document/profile/receipt/authentication-report chain and writes the sanitized manifest. Exit 0 means only requirements metadata is READY; it is not evidence authentication or decision authority;
- `gutenberg-native-serialization-evidence-retention-requirements-validation-v1`, which rebuilds the current exact manifest and validates a previously exported manifest with strict JSON-only, key-order-independent semantic equality. It rejects stale/tampered/extra/missing fields and reports only sanitized fingerprints/status metadata.

Validator states are `REJECTED_CURRENT_CHAIN_NOT_READY`, `REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE`, and `CURRENT_REQUIREMENTS_MANIFEST_VALID`. VALID means only that the non-authorizing requirements metadata exactly matches the current deterministic chain. It does not authenticate evidence, validate WordPress, create an internal decision, or grant compatibility/production authority.

The retention requirements manifest/export/validator accepts **no future evidence artifact or evidence PASS/FAIL**, performs no authentication, and makes no internal decision. Outputs remain sanitized and do not expose the raw evidence reference, source evidence-reference hash or native Gutenberg post content.

Current authority remains fixed: `evidenceAuthenticationStatus=NOT_RUN`, `authenticationAuthority=false`, `nativeSerializationAuthority=false`, `targetEnvironmentValidated=false`, `editorImportValidated=false`, `renderValidated=false`, `decisionAuthority=false`, `acceptanceAuthority=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false`, `generationEnabled=false`, `downloadEnabled=false`, `internalDecisionStatus=NOT_RUN`, and `internalDecisionEligible=false`.

The repository still does **not** execute WordPress/PHP/`@wordpress/blocks`, fetch or authenticate evidence, identify/verify an authenticator, validate signatures, connect to a WordPress site, prove editor/import/render behavior, map Figma semantics, transfer sections, or generate patterns/packages.

The normalized JSON model is not Gutenberg post-content serialization and intentionally omits WordPress `innerContent`. Custom/unregistered/freeform content remains `REVIEW_REQUIRED`.

## Current P12 publishing line

P12 remains at the retained **80%** release-exit state. The publishing-authoritative historical package remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5` with plugin ID `1680034649341961379`. Later P13-P16 development commits do not silently replace that publishing candidate.

## Immediate execution order

1. keep P14 non-authorizing while #159 genuine Figma evidence remains pending;
2. continue P15 only where genuine trusted evidence permits a stronger internal decision;
3. for P16, do not create a stronger authority-bearing intake/decision from caller-supplied metadata; genuinely retained authenticated evidence is now the prerequisite for the next authority-bearing step;
4. additional P16 code-only work may remain read-only/supporting, but must preserve every false authority flag above;
5. continue P17-P26 only in retained dependency order;
6. execute P27 #182 only after implementation/internal readiness is ready.
