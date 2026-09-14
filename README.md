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
- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity, exact-bound external closure-evidence receipts, offline closure-evidence operator intake, deterministic non-authorizing pre-decision review packets and exact-bound externally reported authentication-result binding;
- P16 Gutenberg R1 foundation: current official R0 snapshot, bounded `gutenberg-normalized-parsed-block-v1` review contract, documented-core capability reporting, immutable declared target-profile identity, profile-bound normalized assessment, non-authorizing normalized candidate envelope, exact candidate SHA-256 identity and exact-bound externally reported native-serialization validation receipt contract;
- exact-build release/provenance tooling.

Current core flow:

`Figma/plugin-or-CLI input -> Audit -> classify -> score -> backlog -> plan -> candidate clone -> safe transform -> validate -> commit/rollback -> report`

Approved post-P12 direction:

`Choose target/profile -> Audit -> Target Compatibility -> Build/Target-Ready Score -> Responsive Risk -> Target-Ready Duplicate if needed -> Validate -> Generate atomically -> Artifact validation -> Real target verification when available -> Round-trip QA -> Receipt -> Download/Copy/Import -> Handoff`

Canonical planning/status docs:

- `docs/MARKET_RESEARCH_PLAN.md` — R0 market/platform research;
- `docs/R0_MARKET_SNAPSHOT_2026-09-11.md` — retained September 2026 competitor/platform snapshot;
- `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md` — R1 adapter/option/system reliability contract;
- `docs/COMMERCIAL_EXPANSION_PLAN.md` — retained P13-P26 commercial implementation roadmap; P27 final production-release gate is tracked by #182;
- `docs/P13_P26_PREFLIGHT_COMPLETION_2026-09-11.md` — retained P13-P26 planning/preflight completion index;
- `docs/P14_FOUNDATION_IMPLEMENTATION.md` — current target-neutral P14 safety/read-only review contract plus synchronized downstream adapter status;
- `docs/R0_GUTENBERG_P16_2026-09-14.md` — retained first P16 official WordPress/Gutenberg platform snapshot;
- `memory-bank/PROJECT_STATE.md` — current repository/project truth;
- `memory-bank/NEXT_ACTIONS.md` — current execution queue.

## Live development status

> **Progress policy:** implementation, runtime acceptance and external Community review are tracked separately. New future scope does not reduce already-completed historical core progress.

**Open PR/MR:** see the repository's current pull-request list; this README intentionally does not hardcode a count.

Open roadmap / acceptance issues:

- `#84` — P12 retained final validation/release-exit truth; remaining live runtime/publisher/2FA evidence is deferred to the final P27 release sequence.
- `#119` — P13-P27 commercial/multi-target roadmap owner; P13-P26 implementation/testing may proceed before final production release.
- `#159` — P13 real-plugin Build-Ready runtime/parity evidence and internal runtime-acceptance dependency.
- `#182` — P27 final production-release gate coordinating remaining live/manual release evidence and final release decision.
- `#287` — repository-admin branch-protection/ruleset hardening remains open because it requires GitHub administration access.

Current verified main is:

`11499202e48d3c51ef416bbc447a729547eba4ce`

### Recent verified P13/P14/P15/P16 sequence

- PR #269 added a versioned snapshot-first non-authorizing proposed-change review manifest and guarded squash-merged as `6514959cbfd9a71c241b204f371a330a6be462e2`; exact head `234eda81ab5c49c3325c7fd9231d3d66841c0013` passed CI #1014, P12 Final Release Artifact #325 and P12 Offline Acceptance #369.
- PR #270 added the first real zero-penalty P13 `BR_SAFE_VERTICAL_STACK_CANDIDATE`, derived only from the accepted P2/P5 planner pipeline, and guarded squash-merged as `a70b003bd533cbf42d1aaaabf722639852ba48db`; corrected exact head `5d739cde842cefe6ff640aeba74da4900eddb831` passed CI #1017, P12 Final Release Artifact #328 and P12 Offline Acceptance #372.
- PR #272 rendered the exact proposed-change review binding in the development Guided Prepare panel while preserving publishable-release stripping, and guarded squash-merged as `f06858ce384ce7d01510813b34b0ff803912e944`; exact head `e59058a7de174b18d8377d8052610efc9a12b4c2` passed CI #1019, P12 Final Release Artifact #330 and P12 Offline Acceptance #374.
- PR #279 introduced `p13-core-v2` and analyzer-bound Build-Ready run identity across report generation, persisted runtime evidence, P13→P14 handoff and plugin/CLI parity. Corrected exact head `b590d0c1652d153525f6fd1a6c8db95dba7e9d54` passed CI #1026, P12 Final Release Artifact #337 and P12 Offline Acceptance #381 before guarded squash merge `31c2ddcee932592a9f7357b1bba07c4009cac684`.
- PR #281 preserved persisted-evidence inspection status/reasons (`VALID`, `EMPTY`, `INVALID`, `READ_FAILED`, `QUARANTINED`) and surfaced exact fresh-Audit diagnostics in the development P13 viewer and P14 preview; guarded squash merge `801075561f22a1738219e58e9f39096705dc80ac`.
- PR #286 hardened dependency/workflow supply-chain controls with a committed lockfile, `npm ci`, immutable first-party action SHAs, Dependabot and secret-file ignore coverage; guarded squash merge `245a045fcbc30bd2ec81edb06dba65119e358a50`.
- PR #293 hardened the P3 UI pixel-broker boundary so malformed/tampered metrics and oversized broker images fail closed; guarded squash merge `47dbc078b0a41cbbe5301d6e0d95d5ca33cc8721`.
- PR #294 aligned the operator-facing P13 offline parity intake with `p13-core-v2` analyzer-bound run identity; guarded squash merge `9955be0561807550a7ad1444d8d013d783820188`.
- Issue #295 regenerated the current traceable, non-publishable P13 development runtime artifact from source `9955be0561807550a7ad1444d8d013d783820188`: Actions run `34833881774`, artifact `p13-runtime-evidence-9955be056180-analyzer-v2`, ID `10343017256`, digest `sha256:b3e5a07a5a012f9c1f4deec32389ad83a0e8550580f60de408db14644de5f1fe`.
- PR #300 added a deterministic development-only P14 runtime review packet while keeping all four authority flags false; guarded squash merge `3a1f2f96617304aa4251aa4f3e4e112bce13612a`.
- PR #302 disabled persisted checkout credentials in all four permanent trusted workflows; guarded squash merge `5295a40839b093a77b3c6d2dc98daa6ac63d5067`.
- PR #304 established the documented Elementor v0.4/container template contract and bounded offline validator; guarded squash merge `4c6e0f63718a6b38b056c82207e25973356d0d66`.
- PR #306 added the read-only Elementor capability registry/report for directly documented classic widget IDs `heading`, `image`, and `button`; guarded squash merge `c242197a2d0a0dd24d7364db5f10c1fb6fa76e13`.
- PR #308 added the deterministic non-authorizing Elementor candidate artifact envelope; guarded squash merge `426314b183f220f66a315a24f9b1122a464909b9`.
- PR #312 added exact canonical candidate SHA-256 identity and a fail-closed non-authorizing future import-validation receipt contract; guarded squash merge `a5b87cad3df803de32ff359d8d0e84796b5d8482`.
- PR #314 added offline operator intake for externally captured exact-bound Elementor import evidence; guarded squash merge `5992fe947a0a2f73d388d0239fde23a53435f046`.
- PR #316 added an immutable declared Elementor target profile and SHA-256 profile fingerprint while keeping target observation/compatibility/generation/download authority false; guarded squash merge `da29e5c95a76dc6eb25ad8026a7fa1bba156423e`.
- PR #318 bound validated exact-candidate import evidence to the immutable declared target-profile fingerprint; guarded squash merge `fb7a9f210f5088b645e4bf046cd4b1f09e3aa72b`.
- PR #320 added read-only target-profile/candidate metadata alignment assessment; guarded squash merge `44a9e0851b3e7a4235e8854066ef09cc399fb78b`.
- PR #322 added a non-authorizing global-reference key review gate; guarded squash merge `d603ce87a645160204d2de6fd458279ba7b3bf3f`.
- PR #326 added the first documented asset-reference review gate for the exact core `image` MEDIA control; guarded squash merge `cde7ea30ad64e2fc6d308de29779f1a49068d543`.
- PR #328 bound the exact current global + documented asset review state into one deterministic SHA-256 reference-review identity; guarded squash merge `5b95d5e3e96d7051e4c74930b6df7eb16038707f`.
- PR #330 added an exact-bound external reference-closure PASS/FAIL evidence receipt contract; guarded squash merge `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`.
- PR #334 added a Node-20 offline operator intake for exact template/profile/reference-closure receipts; guarded squash merge `c20d8835c27cf73e1e367c478f346f6c80d72824`.
- PR #338 added a deterministic sanitized pre-decision reference-closure review packet; guarded squash merge `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`.
- PR #343 added exact binding for a caller-supplied externally reported evidence-authentication result while keeping `authenticationAuthority=false` and `internalDecisionStatus=NOT_RUN`; guarded squash merge `464461a86a4aed4bd43260baee79619a25216c2b`.
- PR #345 synchronized canonical P15 docs; guarded squash merge `359f247fbb70ee5e301136682ad69a0945e0a6ed`.
- PR #346 added the first bounded P16 Gutenberg normalized parsed-block/capability foundation; guarded squash merge `66f6a77f31c69b0c4cd280a21bc03eb53759ec4d`; exact head `faab4bb4d0805e6d71c04e91ac543ee2805f762e` passed CI #1118, Final Release #429 and Offline #473.
- PR #348 synchronized the first P16 foundation into canonical docs; guarded squash merge `a9718ab0f9b349bbf349e829d9b0e932aa41a6c6`; exact head `1ffb6ff5f5174721047cb14616ab2d2eb2d09ee6` passed CI #1120, Integration Readiness #400, Final Release #431 and Offline #475.
- PR #350 added immutable declared `gutenberg-target-profile-v1` and deterministic SHA-256 profile fingerprint; guarded squash merge `db14fe54d2d3397c9b393d95534ffffb1d475ce1`; exact head `36002c95e459b2ae60e45adc2e0db76054c1d733` passed CI #1122, Final Release #433 and Offline #477.
- PR #352 added deterministic profile-bound normalized capability assessment with strongest state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`; guarded squash merge `5ed52132da6bee067e6e3005d1748dfd3677d2e6`; exact head `18d8635e959ab63c1af2eb1239fccbca9dbb6644` passed CI #1124, Final Release #435 and Offline #479.
- PR #354 synchronized canonical P16 profile/assessment docs; guarded squash merge `b29e53c264362b0e01224d15cf7b603f9aea989f`; exact head `197bf68c38fcd0886d7f00a885c97a2fb0ad2057` passed CI #1126, Integration Readiness #404, Final Release #437 and Offline #481.
- PR #356 added deterministic non-authorizing `gutenberg-normalized-candidate-v1` with explicit invalid/review/`READY_FOR_NATIVE_SERIALIZATION_VALIDATION` states and canonical embedded profile/document JSON only after their validation gates; guarded squash merge `14a55bf31fc741adea0839d661e3c3358cfb7053`; exact head `b01e08e517a4430b6cffcc916fdb0ae965ea1159` passed CI #1128, Final Release #439 and Offline #483.
- PR #358 added exact canonical `gutenberg-normalized-candidate-identity-v1` SHA-256 integrity identity; review/invalid/tampered candidates fail before identity creation; guarded squash merge `88617cde269393a3f886b2178c6c0a4765e3bb4a`; exact head `0ba249e9932abf76998e79abbfad122cffd18ccb` passed CI #1130, Final Release #441 and Offline #485.
- PR #360 added exact-bound externally reported `gutenberg-native-serialization-validation-receipt-v1`; reported PASS requires exact candidate/declared-WordPress binding, parse+serialize+round-trip success, no invalid-block warnings and native-output digest metadata, while repository execution/authentication and all authority remain false; guarded squash merge `11499202e48d3c51ef416bbc447a729547eba4ce`; exact head `728e585d5ef7d90dde0fcf61286f85fdca1b1a01` passed CI #1132, Final Release #443 and Offline #487.

The real P13 vertical-stack opportunity is still **not** production mutation authority. `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty, so production P13→P14 handoff downgrades the candidate to REVIEW with `P14_SAFE_BINDING_REQUIRED`, produces no production-eligible action IDs, and keeps the P14 plan BLOCKED.

The proposed-change review manifest, visible review-binding panel, analyzer identity and persisted-evidence diagnostics are evidence/safety surfaces only. They do not create confirmation, execute the retained-duplicate transaction, claim target compatibility or grant production acceptance.

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
| R0 Market/platform research gate contract | DEFINED / RECURRING | 100% | `██████████` | Current snapshot retained; refresh again per major adapter |
| R1 Reliability/compatibility gate contract | DEFINED / RECURRING | 100% | `██████████` | Execute profile/capability/validator/harness gate per adapter |
| P13 Build-Ready Score 2.0 + Responsive Risk | IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING | 100% impl | `██████████` | #159 real-plugin parity/internal runtime acceptance remains; current analyzer is p13-core-v2 with analyzer-bound run identity |
| P14 Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | `──────────` | Read-only preview requires current analyzer/fresh evidence and shows rejection diagnostics; real candidate remains REVIEW/BLOCKED because production registry remains empty; retained-duplicate mutation runtime is unwired; #159 current real-Figma evidence remains required before real Figma mutation exposure |
| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/profile/import evidence + bounded global/core-image asset review + combined reference identity + external closure receipt + offline operator intake + non-authorizing pre-decision review packet + exact-bound externally reported authentication-result binding are merged; genuine trusted authentication/internal decision, real target import, Figma semantic generation and product download remain unaccepted/unwired |
| P16 Gutenberg native export + transfer | CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED | N/A | `──────────` | Normalized contract/capabilities + declared profile + profile-bound assessment + normalized candidate + exact candidate identity + exact-bound externally reported native-serialization receipt are merged; repository native serialization/WordPress execution/authentication, real editor/import/render validation, Figma semantic mapping, pattern packaging, section transfer and download authority remain unwired/unaccepted |
| P17 HTML/CSS/JS + code-to-design | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Static-first contract retained; JS execution remains separately gated |
| P18 Framework adapter platform | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Neutral Web IR + versioned adapter/build matrix retained |
| P19 Assets/fonts/design-system export | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Asset/token provenance and font constraints retained |
| P20 Round-trip QA + section portability | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Controlled render harness + calibrated QA required in implementation |
| P21 Handoff/client QA/a11y-SEO advisories | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Build from accepted target outputs; bounded claim rules retained |
| P22 Complexity / effort estimator | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Transparent effort-unit/calibration contract retained |
| P23 Agency/project/component bindings | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Stable implemented adapters first; semantic invalidation contract retained |
| P24 CMS/dynamic/forms/interactions | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Typed data/form/provider mappings retained; production writes remain out of first slice |
| P25 Free / Pro / Agency packaging | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Capability-based entitlement contract retained; publisher eligibility remains external/account-specific |
| P26 Optional AI assistance | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Non-authoritative AI authority firewall retained; provider/network choice still unselected |
| P27 Final production release + publisher/runtime evidence | GATE DEFINED / EXECUTION DEFERRED | 0% exec | `░░░░░░░░░░` | Coordinate retained #84 truth + final live runtime/publisher/2FA evidence after implementation/internal readiness |

**Overall progress is intentionally not collapsed into one synthetic percentage.** Historical P0-P7 core remains 100%; P12 remains 80%; P13 implementation is complete with real-plugin runtime acceptance pending; P14 core/read-only review implementation is active while confirmation and retained-duplicate mutation authority remain unwired; P15 core foundation is in progress with target import still unvalidated; P16 core foundation is in progress with target validation unwired; P17-P26 implementation is not started; P27 release execution is not started.

R0/R1 gate definitions remain complete but are re-executed where applicable. Implementation completion, real-runtime acceptance and production release are separate evidence states; one does not imply another.

## Current P13 provenance boundary

P13 current analyzer semantic version is `p13-core-v2`. Build-Ready `runId` binds exact source `structuralHash`, `configHash` and `analyzerVersion`. Persisted P13 evidence rejects stale/unsupported analyzer versions and contradictory run IDs. P13→P14 handoff requires the same analyzer-bound identity, and plugin/CLI parity includes analyzer version in `sameRunIdentity`.

The current traceable development artifact for the next genuine #159 attempt is `p13-runtime-evidence-9955be056180-analyzer-v2` (artifact ID `10343017256`, source `9955be0561807550a7ad1444d8d013d783820188`). It is explicitly non-authorizing and do-not-publish.

## Current P14 boundary

P14 Guided Prepare remains development-only and read-only. Current explicit P14 preview/review locks remain:

- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `mutationEnabled=false`;
- `confirmationEnabled=false`.

The production safe-recipe registry remains empty. The generated publishable release UI strips development-only Guided Prepare/review surfaces. #159 remains required before real Figma mutation exposure.

## Current P15 boundary

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**. The exact candidate/profile/import/reference-closure chain is bounded and non-authorizing. A caller-supplied externally reported authentication PASS is bound to current hashes only; repository code does not authenticate the evidence or verifier, `authenticationAuthority=false`, `internalDecisionStatus=NOT_RUN`, and compatibility/production/generation/download authority remain false.

## Current P16 boundary

P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**. The current bounded chain includes:

- official WordPress/Gutenberg R0 snapshot;
- repository-owned `gutenberg-normalized-parsed-block-v1` normalized review contract with bounded validation and top-level freeform handling;
- read-only documented-core capability reporting for exact official API-v3 IDs `core/paragraph`, `core/heading`, `core/image`, and `core/group`; custom/unregistered/freeform content remains `REVIEW_REQUIRED`;
- immutable declared `gutenberg-target-profile-v1`, canonical JSON and deterministic SHA-256 profile fingerprint;
- deterministic `gutenberg-target-profile-assessment-v1` with exact validated document/profile fingerprints and strongest non-authorizing `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING` state;
- deterministic `gutenberg-normalized-candidate-v1` with explicit invalid-profile, invalid-document, REVIEW and `READY_FOR_NATIVE_SERIALIZATION_VALIDATION` states; canonical profile/document JSON is embedded only after its validation gate succeeds;
- exact `gutenberg-normalized-candidate-identity-v1` SHA-256 integrity identity available only for canonical READY candidates; embedded profile/document evidence is rebuilt and byte-compared before identity creation;
- exact-bound `gutenberg-native-serialization-validation-receipt-v1` for caller-supplied external PASS|FAIL reports. Reported PASS requires exact candidate + declared WordPress binding, parse/serialize/round-trip success, no invalid-block warnings and native-output digest metadata.

None of the above executes WordPress or authenticates external evidence. `READY_FOR_NATIVE_SERIALIZATION_VALIDATION` is not native serialization proof. A valid externally reported PASS is not repository native-serialization authority or target compatibility. The receipt stores native-output digest/length metadata only and does not ingest raw Gutenberg post-content bytes. `nativeSerializationAuthority=false`, `targetEnvironmentValidated=false`, `editorImportValidated=false`, `renderValidated=false`, `acceptanceAuthority=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false`, `generationEnabled=false`, and `downloadEnabled=false` remain fixed.

The normalized JSON serializer is not Gutenberg post-content serialization and the repository model intentionally omits WordPress `innerContent`. No repository raw comment-delimited block serializer, `@wordpress/blocks`/PHP runtime execution, WordPress REST/site connection, genuine editor/import/render proof, dynamic-block render proof, Figma semantic mapping, selected-section transfer, pattern/package generation or product download surface is accepted.

## Current P12 publishing line

The retained publishing candidate under manual evaluation was produced from source:

`5f12b1d28146d5c2af815cc9f83eb30431dce4b5`

Figma-assigned publishing ID:

`1680034649341961379`

Verification on that historical candidate passed CI #709, Integration Readiness #145, P12 Offline #64 and Final Release Artifact #20 (`wp-builders-prepare-final-release-20`, artifact ID `10179286885`, digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`). The exact three-file publish ZIP SHA-256 is `1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

The currently retained screenshot set is **not sufficient** for exit. Fresh exact-#20 runtime, valid Publish final-details and 2FA screenshots remain required. Later P13/P14/P15/P16 development commits do not silently replace this historical P12 publishing candidate or count as live publisher acceptance. Actual Community review/approval remains external.

## R0 / R1 target-adapter gates

Before major external target-adapter implementation, refresh R0 if platform facts materially changed and execute R1 for the exact adapter/profile. R1 must retain immutable target profiles, capability-driven options, stale-result invalidation, strict job state, structured errors, atomic output, schema/package/assets validation and real import/build/render harnesses where applicable.

A package can be `ARTIFACT VALIDATED` without being `IMPORT VERIFIED`. We do not claim an unobserved target will import successfully merely because local JSON/ZIP validation passed.

## Planned target order

1. keep the current P14 target-neutral preparation/read-only review foundation non-authorizing while #159 remains pending;
2. complete #159 real-plugin P13 runtime/parity acceptance when genuine Figma evidence is available;
3. continue P15 only where genuine trusted evidence permits stronger internal decisions;
4. continue bounded P16 Gutenberg R1 work while repository native serialization, target validation and generation authority remain unwired;
5. continue P17-P26 in retained dependency order;
6. execute P27 #182 only after implementation/internal readiness is ready;
7. during P27, capture remaining exact release runtime/publisher/2FA evidence and perform the genuine #84 release-exit decision.

## Development and validation commands

```bash
npm ci
npm run status:verify
npm run typecheck
npm test
npm run build
npm run build:cli
npm run verify:release-contract
npm run test:release-package
npm run community:verify
npm run p12:offline
npm run integration:readiness
```

Automated checks are evidence only for the properties they exercise. Target phases add capability-matrix, option-state, package/schema, malformed-input, import/build/render and round-trip harness checks.

## Runtime artifact registry

Machine-readable operational registry: `config/runtime-artifacts.json` schema v3.
