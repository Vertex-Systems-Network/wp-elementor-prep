# Project State

Last updated: 2026-09-16

## Product direction

WP Builders Prepare is a deterministic Figma audit/safe-prep platform evolving toward validated multi-target build output while preserving offline/fail-closed authority boundaries.

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains the machine-readable runtime artifact authority.

## Current repository line

Current verified main before the active P15 environment-qualification release train:

`623b09277bc90d52b324468b0429e01671ac8520`

Recent accepted P15 sequence:

- PR #478 — fresh locally validated Elementor Template JSON download; exact final head `085b34ffdd16065dce218c9be5eb962e687c8e91`; CI #1269, Final #580 and Offline #624 PASS; merge `e03b7f3233b51d7c3f9f81a0dcd0a21db26cfc20`;
- PR #480 — bounded deterministic container solid-background + uniform-radius fidelity; merge `f568ec2236a1a0c7102a656368a7632ec8f581dd` after required exact-head gates passed;
- PR #482 — exact-bound external Elementor target-proof evidence contract and sanitized offline intake; final exact head `500ce695d2392128dfd53d9d181dcf392ca64a57` passed CI #1281, P12 Final Release Artifact #592 and P12 Offline Acceptance #636; merge `04c3710cab693c232e512e53de21b20f6f496555`; issue #481 completed;
- PR #485 — synchronized canonical P15 state after #482; exact head `a7f5cda81c5303bb5b8473561e7b94db3cf41ea8` passed CI #1283, Final #594 and Offline #638; merge `623b09277bc90d52b324468b0429e01671ac8520`; issue #484 completed.

Active P15 code-side release train:

- issue #486 / PR #487 — deterministic, non-authorizing Elementor target-environment qualification evidence and offline intake;
- implementation head `1872be59bcee3443d75ba7024e12714fdf7e4102` passed CI #1287, P12 Final Release Artifact #598 and P12 Offline Acceptance #642 before this canonical docs sync;
- this docs sync moves the PR head, so full exact-head gates must pass again before merge.

Active P15 acceptance dependency remains:

- issue #483 — first controlled genuine Elementor Template JSON import/editor/render observation for one exact generated candidate;
- state: **EXTERNAL/RUNTIME BLOCKED** pending a qualified controlled WordPress + Elementor environment and retained operator evidence;
- no repository code/CI may synthesize the missing target observation.

## Persistent dependencies

- #84 — P12 final integrated validation/release exit; retained at 80%;
- #119 — P13-P27 commercial/multi-target roadmap owner;
- #159 — genuine Figma Desktop P13 Build-Ready runtime/parity acceptance dependency;
- #182 — P27 final production-release/evidence gate;
- #287 — repository-admin branch protection/ruleset hardening residual;
- #483 — genuine controlled Elementor import/editor/render target proof.

## AI-native execution state

Repository development remains issue-first, PR-second, R0/R1-aware and exact-head gated.

Active speed policy:

- one acceptance objective per focused release train;
- tightly related implementation/tests/UI/docs commits may stay in the same PR;
- focused verification is used during iteration;
- full CI / Final Release / Offline Acceptance gates are mandatory on the exact merge head;
- canonical status is synchronized when status/authority/execution truth materially changes;
- shared hotspots use one integrator and parallel work uses non-overlapping ownership;
- no synthetic overall project percentage or fabricated runtime evidence.

The process is faster, but target/runtime authority is not weaker.

## P12-P14 state

- P12 — **IN PROGRESS / 80%**. Historical publishing authority remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`. Later development does not replace it by implication.
- P13 — **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**, `100% impl`; #159 still requires genuine Figma Desktop evidence and separate internal review.
- P14 — **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**, `N/A`; `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty and no production P14 mutation authority exists.

## P15 state

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED** with `N/A` progress.

Accepted main before PR #487 includes:

- target-neutral export IR;
- deterministic local Elementor v0.4 Container/Widget Template JSON generation;
- selected-Figma-Frame bounded Auto Layout/plain-text extraction;
- fail-closed REVIEW for unsupported/ambiguous source states;
- sanitized normal/publishable `Preview Elementor` UI;
- bounded user-declared WordPress/Elementor TargetProfile alignment preview;
- compatibility categories `NATIVE`, `NATIVE_WITH_REVIEW`, `CONVERTIBLE`, `FALLBACK`, `UNSUPPORTED`, `UNKNOWN`;
- categorical mapping readiness `READY`, `READY_WITH_REVIEW`, `NOT_READY`, `INSUFFICIENT_EVIDENCE`;
- explicit fresh local Template JSON download with immediate local candidate revalidation and sanitized deterministic receipt;
- deterministic opaque single-`SOLID` container background extraction to canonical uppercase `#RRGGBB`;
- deterministic bounded uniform pixel corner-radius extraction;
- native Elementor container serialization through `background_background='classic'`, `background_color` and linked pixel `border_radius` dimensions;
- explicit REVIEW boundaries for multiple/unsupported/translucent fills, invalid RGB states, partial/nonuniform/out-of-range radii and image asset closure;
- versioned `elementor-target-proof-evidence-v1` bound to the exact canonical candidate identity and immutable declared TargetProfile fingerprint;
- separate retention of actually observed WordPress/Elementor versions instead of treating declared versions as observed truth;
- independent import/editor-open/render observations with fail-closed prerequisite sequencing;
- bounded fidelity observation fields for structure, solid background and uniform radius;
- evidence-only classifications `BOUND_FULL_PASS`, `BOUND_PARTIAL`, `BOUND_FAIL`, `REJECTED`;
- sanitized offline `p15:elementor-target-proof-intake` output with candidate/profile/proof SHA-256 input fingerprints while omitting candidate/template contents.

PR #487 adds a necessary-but-not-sufficient environment qualification layer for the eventual real #483 run:

- versioned `elementor-target-environment-evidence-v1` retains observed WordPress, Elementor Core, PHP, database, WordPress memory and editor-browser facts plus clean-core dependency facts;
- policy `elementor-target-environment-policy-2026-09-16-v1` conservatively requires WordPress `6.8+`, PHP `7.4+`, MySQL `5.6+` or MariaDB `10.5+`, WordPress memory `>=256 MB`, and the bounded current supported browser floors captured by the R0 refresh;
- SQLite/other DBs, below-minimum runtime facts and unsupported/stale browsers classify `NOT_QUALIFIED`;
- active Elementor Pro or third-party Elementor addons classify `REVIEW_REQUIRED` for the clean-Core first-proof policy rather than silently passing;
- malformed/unknown/elevated-authority evidence classifies `REJECTED`;
- sanitized `p15:elementor-target-environment-intake` emits qualification state plus the input SHA-256 and explicitly keeps `importObserved=false`, `editorObserved=false`, `renderObserved=false`.

User-facing local-download truth remains exactly bounded to:

- **LOCAL ARTIFACT VALIDATED**;
- **TARGET IMPORT NOT VERIFIED**.

Authority remains:

- `acceptanceAuthority=false` for environment qualification and target-proof intake;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `importValidationStatus=NOT_RUN` until genuine retained target evidence is separately accepted into the relevant authority state;
- `targetEnvironmentValidationStatus=NOT_RUN` on the local generation/download path;
- environment qualification means only that one externally observed runtime satisfies the bounded prerequisites for attempting the proof; it is not import/render verification;
- `environmentObserved=false` for the local generation/download path;
- `internalReviewRequired=true` for external environment/proof evidence;
- no WordPress/Elementor network connection from the Figma core;
- no automated target import/editor/render execution claim;
- no clipboard/section transfer;
- no Figma mutation.

A qualified environment plus a `BOUND_FULL_PASS` target-proof packet still requires genuine retained real-environment observations and separate internal review before any stronger P15 authority can be considered.

Issue #483 owns the next P15 acceptance action. The real run must first retain qualified environment evidence, then exercise the exact candidate import/editor/render path, then run the exact-bound proof intake. Until that real target proof exists, do not expand serializer/fidelity merely to advance the roadmap mechanically.

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

`selected Figma Frame -> deterministic extraction -> mapping readiness -> fresh candidate -> local artifact validation -> explicit Template JSON download -> bounded deterministic container fidelity -> observed target-environment qualification -> exact-bound target-proof intake -> controlled real Elementor import/editor/render observation (#483) -> retained evidence -> separate internal review`

The locally validated artifact, environment qualification and proof-intake machinery must remain non-target-authorizing until genuine retained target observations and review change that truth.
