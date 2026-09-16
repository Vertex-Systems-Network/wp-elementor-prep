# Project State

Last updated: 2026-09-17

## Product direction

WP Builders Prepare is a deterministic Figma audit/safe-prep platform evolving toward validated multi-target build output while preserving offline/fail-closed authority boundaries.

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains the machine-readable runtime artifact authority.

## Accepted P15 implementation baseline

Most recent accepted P15 implementation baseline before this canonical-only sync:

`d8d8ef2762dbe9aeae0da4bbcab3b46aae93535c`

Recent accepted P15 sequence:

- PR #478 — fresh locally validated Elementor Template JSON download; merge `e03b7f3233b51d7c3f9f81a0dcd0a21db26cfc20`;
- PR #480 — bounded deterministic container solid-background + uniform-radius fidelity; merge `f568ec2236a1a0c7102a656368a7632ec8f581dd`;
- PR #482 — exact-bound external Elementor target-proof evidence contract/intake; final head `500ce695d2392128dfd53d9d181dcf392ca64a57` passed CI #1281, Final #592 and Offline #636; merge `04c3710cab693c232e512e53de21b20f6f496555`;
- PR #485 — canonical post-#482 state sync; merge `623b09277bc90d52b324468b0429e01671ac8520`;
- PR #487 — observed target-environment qualification contract/intake; final head `d74b948401dbf4e4f15116cc9a57c8d8cabf7c18` passed CI #1294, Final #605 and Offline #649 on Ubuntu/Windows/macOS; merge `dd281b8bea7670e252629e931129a5276d08bef3`; issue #486 completed;
- PR #489 — exact candidate/profile/environment/proof chain binding; final head `6107a510fa3c97c939e5876c7e0d3e4bdd677b7c` passed CI #1303, Final #614 and Offline #658 on Ubuntu/macOS/Windows; merge `919e76249c110f92679be1a048bd53b366d10e86`; issue #488 completed;
- PR #491 — evidence-intake duplicate-option and resolved output/input path hardening; final head `d820f2a8babfaa719b26ad39dd15e2165cb6a857` passed CI #1305, Final #616 and Offline #660 on Ubuntu/macOS/Windows; merge `926af2c0663717cf1a3085d3ed49cf1c121f5670`; issue #490 completed;
- PR #493 — shared filesystem-identity guard rejecting symlink/hardlink output aliases; final head `4f03472868e0bd6b9a350d0f4a88240cfba5a05a` passed CI #1307, Final #618 and Offline #662 on Ubuntu/Windows/macOS; merge `d8d8ef2762dbe9aeae0da4bbcab3b46aae93535c`; issue #492 completed.

These accepted trains are code-side artifact/evidence integrity only. They do not supply a real WordPress/Elementor import, editor, render or compatibility observation.

## Persistent dependencies

- #84 — P12 final integrated validation/release exit; retained at 80%;
- #119 — P13-P27 commercial/multi-target roadmap owner;
- #159 — genuine Figma Desktop P13 Build-Ready runtime/parity acceptance dependency;
- #182 — P27 final production-release/evidence gate;
- #287 — repository-admin branch protection/ruleset hardening residual;
- #483 — genuine controlled Elementor import/editor/render target proof.

## AI-native execution state

Repository development remains issue-first, PR-second, R0/R1-aware and exact-head gated.

- one acceptance objective per focused release train;
- tightly related implementation/tests/docs may stay in the same PR;
- focused verification during iteration;
- full CI / Final Release / Offline Acceptance mandatory on the exact merge head;
- no synthetic overall project percentage or fabricated runtime evidence.

## P12-P14 state

- P12 — **IN PROGRESS / 80%**. Historical publishing authority remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`.
- P13 — **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**, `100% impl`; #159 still requires genuine Figma Desktop evidence and separate internal review.
- P14 — **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**, `N/A`; `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty and no production P14 mutation authority exists.

## P15 state

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED** with `N/A` progress.

Accepted foundation now includes:

- target-neutral export IR;
- deterministic local Elementor v0.4 Container/Widget Template JSON generation;
- bounded selected-Figma-Frame extraction and fail-closed REVIEW semantics;
- sanitized Elementor preview and bounded declared TargetProfile alignment preview;
- compatibility/mapping-readiness categories;
- explicit fresh local Template JSON download with immediate candidate revalidation and sanitized receipt;
- bounded deterministic opaque single-solid background and uniform-radius extraction/serialization;
- `elementor-target-proof-evidence-v1` bound to exact candidate identity and immutable TargetProfile fingerprint;
- separate retention of actually observed WordPress/Elementor versions;
- import/editor-open/render/fidelity observations with prerequisite sequencing;
- proof classifications `BOUND_FULL_PASS`, `BOUND_PARTIAL`, `BOUND_FAIL`, `REJECTED`;
- sanitized `p15:elementor-target-proof-intake` with SHA-256 input fingerprints;
- `elementor-target-environment-evidence-v1` and policy `elementor-target-environment-policy-2026-09-16-v1`;
- environment classifications `QUALIFIED_FOR_BOUND_TARGET_PROOF`, `REVIEW_REQUIRED`, `NOT_QUALIFIED`, `REJECTED`;
- conservative runtime minimums and clean-Core review policy;
- sanitized `p15:elementor-target-environment-intake` with explicit `importObserved=false`, `editorObserved=false`, `renderObserved=false`;
- `elementor-target-proof-chain-v1` validating exact candidate + TargetProfile + environment evidence + proof evidence together;
- exact environment/proof WordPress+Elementor equality, durable evidence/run-reference equality, chronology validation and existing candidate/profile replay protection;
- combined classifications `CHAIN_FULL_PASS`, `CHAIN_PARTIAL`, `CHAIN_FAIL`, `CHAIN_BLOCKED`, `REJECTED`;
- sanitized `p15:elementor-target-proof-chain-intake` with candidate/profile/environment/proof SHA-256 fingerprints and no template-content leakage;
- duplicate CLI options rejected rather than silently last-write-wins;
- resolved `--out` paths rejected when they collide with consumed input paths;
- shared local/offline filesystem-identity protection using canonical real paths and `dev + ino` identity where available so existing symlink/hardlink output aliases cannot overwrite retained evidence inputs.

User-facing local-download truth remains exactly bounded to:

- **LOCAL ARTIFACT VALIDATED**;
- **TARGET IMPORT NOT VERIFIED**.

Authority remains:

- `acceptanceAuthority=false` for environment qualification, proof intake and proof-chain intake;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- local generation/download keeps `importValidationStatus=NOT_RUN`, `targetEnvironmentValidationStatus=NOT_RUN`, `environmentObserved=false`;
- qualification and chain validation are evidence integrity only, not import/render verification;
- `internalReviewRequired=true` for external environment/proof evidence;
- no WordPress/Elementor network connection from the Figma core;
- no automated target import/editor/render execution claim;
- no Atomic-v4 acceptance from the Container proof path;
- no clipboard/section transfer;
- no Figma mutation.

A qualified environment plus `CHAIN_FULL_PASS` still means only that one genuine externally supplied candidate/profile/environment/proof evidence chain is internally consistent and complete for the bounded clean-Core policy. Separate retained operator evidence and internal review remain mandatory before any stronger P15 authority can be considered.

Issue #483 is the current P15 acceptance action. The genuine run must retain qualification evidence, perform actual candidate Template Library JSON import/editor/render observation, build the exact proof packet, run standalone diagnostics, run the combined chain intake, retain all identities/fingerprints/evidence together and then undergo separate internal review.

## P16 state

P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

The retained foundation includes normalized Gutenberg candidate/capability/profile contracts, exact candidate identity, external receipt/offline revalidation, sanitized review/decision prerequisites, genuine-evidence retention requirements, offline operator export/current-manifest validation and hardened bounded local JSON I/O/output handling.

During the focused Elementor V1 window, keep P16 stable unless a concrete shared blocker appears.

## P17-P27 state

- P17-P26 — **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**;
- P27 — **GATE DEFINED / EXECUTION DEFERRED** under #182.

Do not open future phases merely to increase parallelism while the bounded Elementor-first V1 is unfinished.

## Immediate execution target

Complete the coherent Elementor-first internal V1 path:

`selected Figma Frame -> deterministic extraction -> mapping readiness -> fresh candidate -> local artifact validation -> explicit Template JSON download -> bounded deterministic container fidelity -> observed target-environment qualification -> controlled real Elementor import/editor/render observation (#483) -> exact-bound target-proof intake -> combined environment/proof-chain intake -> retained evidence -> separate internal review`

The locally validated artifact, environment qualification, proof intake and chain intake remain non-target-authorizing until genuine retained target observations and review change that truth.
