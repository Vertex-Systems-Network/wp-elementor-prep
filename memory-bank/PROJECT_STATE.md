# Project State

Last updated: 2026-09-16

## Product direction

WP Builders Prepare is a deterministic Figma audit/safe-prep platform evolving toward validated multi-target build output while preserving offline/fail-closed authority boundaries.

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains the machine-readable runtime artifact authority.

## Current repository line

Current verified main before this P15 release train:

`95f3cb44f4637365db58aedca0b218da1fcd6c41`

That main includes:

- PR #474 — deterministic P15 compatibility coverage + categorical mapping readiness; exact head `438bab50e3683580b15bc9cd25a48eb66a37ede3`; CI #1262, Final #573 and Offline #617 PASS; merge `d09f5430831394c21033585354fe7daceaba78d4`;
- PR #476 — AI-native release-train cadence, compact canonical context and refreshed roadmap truth; exact head `c7d9e65a190e9b16668bc0e64234663d7679fc27`; CI #1264, Final #575 and Offline #619 PASS; merge `95f3cb44f4637365db58aedca0b218da1fcd6c41`.

Active release train:

- issue #477 / PR #478 — fresh locally validated Elementor Template JSON download;
- initial implementation head `4367068e4b967f01315a5fa0a04156f94079a2aa` passed CI #1266, P12 Final Release Artifact #577 and P12 Offline Acceptance #621 before this canonical status-sync commit;
- final acceptance must be rerun on the post-doc-sync exact PR head before merge.

## Persistent dependencies

- #84 — P12 final integrated validation/release exit; retained at 80%;
- #119 — P13-P27 commercial/multi-target roadmap owner;
- #159 — genuine Figma Desktop P13 Build-Ready runtime/parity acceptance dependency;
- #182 — P27 final production-release/evidence gate;
- #287 — repository-admin branch protection/ruleset hardening residual.

## AI-native execution state

Repository development remains issue-first, PR-second, R0/R1-aware and exact-head gated.

Active speed policy:

- one acceptance objective per focused release train;
- tightly related implementation/tests/UI/docs commits may stay in the same PR;
- focused verification is used during iteration;
- full CI / Final Release / Offline Acceptance gates are mandatory on the exact merge head;
- canonical status is synchronized once per accepted behavior-changing train when practical;
- shared hotspots use one integrator and parallel work uses non-overlapping ownership;
- no synthetic overall project percentage or fabricated runtime evidence.

The process is faster, but target/runtime authority is not weaker.

## P12-P14 state

- P12 — **IN PROGRESS / 80%**. Historical publishing authority remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`. Later development does not replace it by implication.
- P13 — **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**, `100% impl`; #159 still requires genuine Figma Desktop evidence and separate internal review.
- P14 — **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**, `N/A`; `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty and no production P14 mutation authority exists.

## P15 state

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED** with `N/A` progress.

Accepted/main foundation before PR #478 includes:

- target-neutral export IR;
- deterministic local Elementor v0.4 Container/Widget Template JSON generation;
- selected-Figma-Frame bounded Auto Layout/plain-text extraction;
- fail-closed REVIEW for unsupported/ambiguous source states;
- sanitized normal/publishable `Preview Elementor` UI;
- bounded user-declared WordPress/Elementor TargetProfile alignment preview;
- compatibility categories `NATIVE`, `NATIVE_WITH_REVIEW`, `CONVERTIBLE`, `FALLBACK`, `UNSUPPORTED`, `UNKNOWN`;
- categorical mapping readiness `READY`, `READY_WITH_REVIEW`, `NOT_READY`, `INSUFFICIENT_EVIDENCE`.

PR #478 adds one explicit artifact-transfer surface without changing target authority:

- every click re-reads exactly one current selected Frame and reruns extraction, mapping readiness and deterministic generation;
- download is eligible only for review-free `READY` mapping plus `GENERATED_LOCAL_CANDIDATE` / `READY_FOR_TARGET_IMPORT_VALIDATION`;
- the generated template is rebuilt/revalidated immediately before exposure and must exactly match the generation candidate;
- success returns `p15-elementor-local-template-download-result-v1` with immediate `templateJson` plus a sanitized deterministic receipt containing bounded source/generator identity, SHA-256 candidate/artifact fingerprints, safe hash-derived filename and `localValidationStatus=PASS`;
- blocked/review/unknown/unsupported/mismatch states expose no artifact;
- normal preview and declared-profile payloads still expose no candidate/template JSON;
- the large `src/plugin/main.ts` and raw `src/ui/ui.html` remain unchanged; a modular plugin entry/controller and deterministic build-time UI extension keep the new path isolated and fail closed on integration drift.

User-facing success truth is exactly bounded to:

- **LOCAL ARTIFACT VALIDATED**;
- **TARGET IMPORT NOT VERIFIED**.

Authority remains:

- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `importValidationStatus=NOT_RUN`;
- `targetEnvironmentValidationStatus=NOT_RUN`;
- `environmentObserved=false`;
- no WordPress/Elementor network connection;
- no target import/editor/render execution;
- no clipboard/section transfer;
- no Figma mutation.

Only the fresh successful local-download result has `fileDownload=true`. Existing candidate, normal-preview and declared-profile contracts retain their previous non-download authority. Local file download is not target compatibility, import verification or production acceptance.

Next P15 product slice after PR #478 is a small deterministic visual-fidelity mapping pack, followed by one controlled real Elementor import proof.

## P16 state

P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

The retained foundation includes normalized Gutenberg candidate/capability/profile contracts, exact candidate identity, external receipt/offline revalidation, sanitized review/decision prerequisites, genuine-evidence retention requirements, offline operator export/current-manifest validation, and hardened bounded local JSON I/O/output handling.

During the focused Elementor V1 window, keep P16 stable unless a concrete shared blocker appears. Genuine authenticated evidence and real Gutenberg target/editor/import/render validation remain required before stronger authority.

## P17-P27 state

- P17-P26 — **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**;
- P27 — **GATE DEFINED / EXECUTION DEFERRED** under #182.

Do not open future phases merely to increase parallelism while the bounded Elementor-first V1 is unfinished.

## Immediate execution target

Complete the coherent Elementor-first internal V1 path:

`selected Figma Frame -> deterministic extraction -> mapping readiness -> fresh candidate -> local artifact validation -> explicit Template JSON download -> minimum deterministic fidelity mappings -> controlled real Elementor import evidence`

The locally validated artifact must remain labeled as local validation only until real target evidence changes that truth.
