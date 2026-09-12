# Project State

Last updated: 2026-09-13

## Product

`wp-elementor-prep` ships as **WP Builders Prepare**: a deterministic Figma audit, safe-prep and target-readiness platform focused first on WordPress builders and then broader web-code targets.

Current implemented surfaces:

1. normal Figma plugin packaging/distribution;
2. npm/Node CLI for supported Figma inputs;
3. deterministic audit, scoring, backlog and Build-Ready outputs;
4. validated P5/P6/P7 safe-prep/runtime foundations;
5. P14 target-neutral retained-duplicate core;
6. development-only read-only P14 Guided Prepare preview with exact evidence freshness and proposed-change review binding;
7. exact-build release/provenance and fail-closed P12 publisher-evidence tooling.

Approved direction remains:

`Figma -> validated target-ready website/build output`

Elementor is first target family, Gutenberg second, followed by generic web/framework adapters through a neutral model.

## Non-negotiable policy

- deterministic/AI-free core correctness;
- current core plugin network-free;
- audit before mutation;
- low confidence => REVIEW;
- original design authoritative;
- target preparation happens on candidate/duplicate with validation;
- no undocumented reverse engineering where documented formats/APIs/bridges exist;
- responsive analysis does not invent mobile/tablet composition;
- target adapters are versioned and isolated;
- artifact validation, live-target verification and production acceptance remain separate;
- no silent strategy fallback;
- implementation-complete != runtime-accepted != production-accepted;
- no fabricated runtime, account, publisher or marketplace evidence.

## Current repository main

Current verified main after the read-only review-binding panel slice:

`f06858ce384ce7d01510813b34b0ff803912e944`

That is the guarded squash merge of PR #272.

Current docs-only synchronization:

- issue #273;
- branch `docs/p13-p14-post-272-status-273`;
- scope limited to README, P14 foundation and memory-bank state/next-actions.

## Current issue queue

- #84 — **P12 final integrated validation/release acceptance: ACTIVE / retained at 80%**. Remaining exact runtime, publisher final-details, 2FA and final internal release-exit evidence is deferred to P27. Community approval remains external.
- #119 — **P13-P27 commercial/multi-target roadmap: ACTIVE**. P13-P26 implementation/testing may progress independently of final production release.
- #159 — **P13 real-plugin Build-Ready runtime/parity evidence: OPEN runtime-acceptance dependency**. Genuine real-Figma runtime acceptance remains pending.
- #182 — **P27 final production-release gate: DEFINED / execution deferred**.
- #273 — **ACTIVE docs-only synchronization** through PR #272.

Issues #259, #268 and #271 are completed through PRs #270, #269 and #272 respectively.

## P13 state

P13 Build-Ready Score 2.0 + Responsive Risk implementation remains complete in core/plugin/CLI, with genuine runtime acceptance still pending under #159.

PR #270 added the first real target-neutral safe-preparation opportunity without changing score authority:

- rule `BR_SAFE_VERTICAL_STACK_CANDIDATE`;
- `remediationClass: P14_SAFE_CANDIDATE`;
- LOW severity;
- zero score penalty;
- derived only from the accepted `detectPatterns -> detectSpecialRoles -> planSafeRecipes` pipeline;
- emitted only when existing P5 planning returns `ELIGIBLE` for `vertical-stack` at the existing 90% gate;
- existing NOOP, special-role, absolute-child and refusal semantics remain authoritative.

The production P14 registry remains empty, so this P13 candidate is not executable production authority.

## P14 core state

P14 retains a deterministic target-neutral retained-duplicate foundation with bounded plan/confirmation/registry/runtime evidence, exact authorization, candidate-only mutation semantics, runtime eligibility re-checks, validation/re-score/source-immutability gates, coordination/cleanup contracts and fail-closed receipts.

Recent safety hardening remains retained through PR #254, including standalone plan/confirmation/authorization/runtime-binding and validation-profile semantic snapshots.

The production safe-recipe registry remains intentionally empty.

## P14 read-only Guided Prepare runtime preview

Development-only Guided Prepare now includes:

- #255/#256 — persisted P13 evidence -> P14 plan preview;
- #257/#258 — developer-menu route;
- #260/#261 — normal development main-panel preview;
- #262/#263 — exact current file/page/frame binding;
- #265/#266 — fresh current Frame fingerprint + exact compiled-build binding;
- #268/#269 — versioned snapshot-first proposed-change review manifest;
- #271/#272 — human-readable Proposed Change Review Binding in the development panel.

The preview requires exact current context and fresh current-build P13 evidence. The review manifest is bound to:

- P13 run ID;
- source node ID and structural fingerprint;
- plan digest;
- canonical eligible action IDs;
- exact eligible action rule/recipe versions, targets, prerequisites, mutation allowlists and validation profile when any eligible actions exist.

The normal production registry is still empty. Therefore the real `BR_SAFE_VERTICAL_STACK_CANDIDATE` from PR #270 is downgraded by production handoff to REVIEW with `P14_SAFE_BINDING_REQUIRED`; the plan remains BLOCKED with zero production-eligible actions.

The generated publishable release UI strips the development-only P14 preview and review-binding surfaces.

## P14 authority remains locked

Current explicit locks remain:

- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `mutationEnabled=false`;
- `confirmationEnabled=false`.

Not wired into the Figma plugin:

- approval/confirmation creation or persistence from the preview;
- `runP14RetainedDuplicateTransaction(...)` as a user-facing command;
- real retained-duplicate Figma mutation adapter;
- production P14 safe-recipe registrations;
- Elementor/Gutenberg target-specific P14 preparation authority.

#159 real-Figma P13 runtime acceptance remains required before real P14 mutation exposure. It does not block target-neutral core/read-only development.

## Latest retained verification

### PR #269 — proposed-change review manifest

- exact head `234eda81ab5c49c3325c7fd9231d3d66841c0013`;
- CI #1014 — PASS;
- P12 Final Release Artifact #325 — PASS;
- P12 Offline Acceptance #369 — PASS Windows/macOS/Ubuntu;
- guarded squash merge `6514959cbfd9a71c241b204f371a330a6be462e2`.

### PR #270 — first real P13 vertical-stack candidate

- exact corrected head `5d739cde842cefe6ff640aeba74da4900eddb831`;
- CI #1017 — PASS;
- P12 Final Release Artifact #328 — PASS;
- P12 Offline Acceptance #372 — PASS Windows/macOS/Ubuntu;
- guarded squash merge `a70b003bd533cbf42d1aaaabf722639852ba48db`.

### PR #272 — human-readable review binding

- exact head `e59058a7de174b18d8377d8052610efc9a12b4c2`;
- CI #1019 — PASS;
- P12 Final Release Artifact #330 — PASS;
- P12 Offline Acceptance #374 — PASS Windows/macOS/Ubuntu;
- guarded squash merge `f06858ce384ce7d01510813b34b0ff803912e944`.

## P12 release truth

P12 remains at retained `80%`.

Publishing-authoritative historical candidate remains:

- source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`;
- plugin ID `1680034649341961379`;
- Final Release Artifact #20;
- artifact `wp-builders-prepare-final-release-20`, ID `10179286885`;
- artifact digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`;
- exact three-file publish ZIP `sha256:1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

Later P13/P14 development commits do not replace that historical P12 publishing candidate or count as live publisher acceptance. Remaining P12 live/manual evidence is owned by final P27 sequence #182.

## P15-P26 state

P15-P26 remain **preflight frozen / implementation not started**. They may proceed under roadmap #119 when dependency order is reached, with R0 refresh and R1 acceptance contracts where required.

## P27 state

P27 #182 remains the final production-release gate and owns deferred exact P12 runtime/publisher/2FA evidence, final #84 release-exit review, final production-acceptance sweep and exact-current release provenance.

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains the machine-readable operational artifact registry.

## Immediate project action

Complete #273 docs-only synchronization and exact-head gates. After merge, audit the next P14 implementation gap without treating the review manifest or real P13 candidate as confirmation/mutation authority.

No synthetic overall project percentage is used. Historical module progress and current implementation/runtime/release states remain separate.
