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
6. development-only read-only P14 Guided Prepare preview;
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
- invalid option combinations are blocked by capability-driven state;
- artifact validation, live-target verification and production acceptance remain distinct states;
- no silent fallback to another widget/block/code strategy;
- implementation-complete != runtime-accepted != production-accepted;
- no fabricated runtime, account or marketplace evidence.

## Current repository main

Current verified main after P14 Guided Prepare freshness hardening:

`b944dc0ceea1c0c3a531fe4e9b88a66dacf3b92f`

That is the guarded squash merge of PR #266.

Current docs-only synchronization:

- issue #264;
- branch `docs/p14-post-266-status-264`;
- scope limited to README, P14 foundation and memory-bank state/next-actions.

## Current issue queue

- #84 — **P12 final integrated validation/release acceptance: ACTIVE / retained at 80%**. Remaining exact runtime, publisher final-details, 2FA and final internal release-exit evidence is deferred to P27. Figma Community approval remains external.
- #119 — **P13-P27 commercial/multi-target roadmap: ACTIVE**. P13-P26 implementation/testing may progress independently of final production release.
- #159 — **P13 real-plugin Build-Ready runtime/parity evidence: OPEN runtime-acceptance dependency**. P13 implementation is complete; genuine real-Figma runtime acceptance is not.
- #182 — **P27 final production-release gate: DEFINED / execution deferred**.
- #264 — **ACTIVE docs-only synchronization** through the verified P14 runtime-preview work ending at #265/#266.

Focused P14 issues #243 through #265 that were implemented in this sequence are closed completed through their guarded PR merges.

## P13 state

P13 Build-Ready Score 2.0 + Responsive Risk implementation is complete in core/plugin/CLI.

Still pending:

- #159 genuine real-Figma plugin runtime evidence;
- retained plugin/CLI parity/internal runtime acceptance.

P13 implementation completion does not imply production release.

## P14 core state

P14 has a substantial deterministic target-neutral retained-duplicate foundation, including:

- P13 -> P14 handoff;
- bounded input preflight;
- plan integrity/digest validation;
- safe-recipe registry bounds and exact authorization;
- explicit reviewed confirmation contract;
- retained-duplicate transaction semantics;
- detached adapter input/output evidence;
- sequential runtime eligibility re-evaluation;
- validation-profile coverage;
- validation/re-score/source-immutability gates;
- cancellation, coordination and cleanup contracts;
- bounded receipt/runtime diagnostics;
- one-shot semantic snapshots at caller/adapter/coordinator/receipt boundaries.

Recent hardening after the old #240 status line:

- #243/#244 — standalone plan-integrity semantic snapshot;
- #245/#246 — standalone confirmation validation snapshot;
- #247/#248 — confirmation builder reviewed-plan snapshot;
- #249/#250 — execution authorization plan snapshot;
- #251/#252 — planned runtime-action binding snapshot;
- #253/#254 — validation-profile coverage snapshots.

The production safe-recipe registry remains intentionally empty.

## P14 read-only Guided Prepare runtime preview

P14 now exposes its existing preparation-plan model through development-only read-only preview surfaces:

- #255/#256 — persisted P13 evidence -> P14 plan preview model;
- #257/#258 — developer-menu route;
- #260/#261 — normal development main-panel preview;
- #262/#263 — exact current Figma file/page/frame binding;
- #265/#266 — fresh current-Frame structural/config/analyzer/run fingerprint and exact compiled-build binding.

The preview is rendered only when:

1. exactly one Frame is currently selected;
2. validated persisted P13 evidence exists;
3. persisted file/page/frame IDs match the current context;
4. selection/file/page identity remains stable while evidence loads;
5. a fresh current scan produces the same P13 `runId`, `rootId`, `structuralHash`, `configHash` and `analyzerVersion`;
6. persisted plugin version and compiled build `sourceSha/runId/runNumber` match the current plugin build.

If any check fails, the preview fails closed and instructs the user to run Audit on the selected Frame again.

Human-readable page/frame names are not identity authority.

The generated publishable release UI strips the development-only P14 preview surface.

## P14 authority remains locked

The preview and current core do not grant production mutation authority.

Current explicit locks:

- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `mutationEnabled=false`;
- `confirmationEnabled=false`.

Not wired into the Figma plugin:

- confirmation creation from the preview;
- `runP14RetainedDuplicateTransaction(...)` as a user-facing mutation command;
- real Figma retained-duplicate mutation adapter;
- production safe-recipe registrations;
- Elementor/Gutenberg target-specific P14 preparation recipes.

#159 real-Figma P13 runtime acceptance remains required before real P14 mutation exposure. It does not block core/read-only implementation.

## Latest retained P14 verification

### PR #263 — current-context binding

Exact head:

`da9c59091f3142dade4a444aface5b6e6d5577b9`

Passed:

- CI #1004;
- P12 Final Release Artifact #315;
- P12 Offline Acceptance #359 on Windows/macOS/Ubuntu;
- zero review threads;
- mergeable before guarded squash merge.

Merged as:

`196b4d2ed5c9cc46d96b6c613e20733365264d93`

### PR #266 — fresh current-build/Frame binding

Exact head:

`240d82c108c182c52d81edc058e94b0f64fcce4a`

Passed:

- CI #1007;
- P12 Final Release Artifact #318;
- P12 Offline Acceptance #362 on Windows/macOS/Ubuntu;
- zero review threads;
- mergeable before guarded squash merge.

Merged as:

`b944dc0ceea1c0c3a531fe4e9b88a66dacf3b92f`

## P12 release truth

P12 remains at retained `80%`.

Publishing-authoritative historical candidate remains:

- source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`;
- plugin ID `1680034649341961379`;
- Final Release Artifact #20;
- artifact `wp-builders-prepare-final-release-20`, ID `10179286885`;
- artifact digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`;
- exact three-file publish ZIP `sha256:1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

Later P13/P14 development commits do not silently replace that historical P12 publishing candidate or count as live publisher acceptance.

Remaining P12 live/manual evidence is owned by final P27 sequence #182.

## P15-P26 state

P15-P26 remain **preflight frozen / implementation not started**.

They may proceed under roadmap #119 when their dependency order is reached. Each major evolving external adapter must re-execute R0 research as needed and satisfy R1 capability/profile/validator/harness contracts.

## P27 state

P27 #182 remains the final production-release gate.

It owns:

- deferred exact P12 runtime/publisher/2FA evidence;
- final internal #84 release-exit review;
- final P13-P26 production-acceptance sweep;
- exact-current release artifact/provenance checks;
- clear separation of internal production acceptance from external marketplace review/approval.

## Immediate project action

Complete #264 docs-only synchronization and its exact-head gates. After it merges, continue the next focused P14 implementation/safety slice without interpreting the read-only preview as confirmation or mutation authority.

No synthetic overall project percentage is used. Historical module progress and current implementation/runtime/release states remain separate.
