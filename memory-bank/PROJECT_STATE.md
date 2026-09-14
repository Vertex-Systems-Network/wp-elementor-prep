# Project State

Last updated: 2026-09-14

## Product

`wp-elementor-prep` ships as **WP Builders Prepare**: a deterministic Figma audit, safe-prep and target-readiness platform focused first on WordPress builders and then broader web-code targets.

Current implemented surfaces:

1. normal Figma plugin packaging/distribution;
2. npm/Node CLI for supported Figma inputs;
3. deterministic audit, scoring, backlog and Build-Ready outputs;
4. validated P5/P6/P7 safe-prep/runtime foundations;
5. P13 Build-Ready Score 2.0 + Responsive Risk with analyzer-bound provenance;
6. P14 target-neutral retained-duplicate core;
7. development-only read-only P14 Guided Prepare preview with exact evidence freshness, proposed-change review binding, exact runtime review packet and persisted-evidence rejection diagnostics;
8. bounded P15 Elementor R1 foundation with v0.4/container validation, documented-core capabilities, exact candidate/import-evidence binding, immutable declared target profiles, read-only alignment, bounded global/core-image asset review, combined reference identity, exact-bound external closure-evidence receipts, offline operator intake, deterministic non-authorizing pre-decision review packets and exact-bound externally reported authentication-result binding;
9. bounded P16 Gutenberg foundation with the repository-owned `gutenberg-normalized-parsed-block-v1` review contract and read-only documented-core capability reporting for `core/paragraph`, `core/heading`, `core/image`, and `core/group`;
10. exact-build release/provenance and fail-closed P12 publisher-evidence tooling.

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

Current verified main after the first bounded P16 Gutenberg normalized parsed-block/capability foundation:

`66f6a77f31c69b0c4cd280a21bc03eb53759ec4d`

Recent guarded merge line:

- #283 docs sync -> `54fad8332e9ef4d41c5ccd2c5ccda4fb10247c5c`;
- #286 supply-chain security -> `245a045fcbc30bd2ec81edb06dba65119e358a50`;
- #293 P3 pixel-broker fail-closed security -> `47dbc078b0a41cbbe5301d6e0d95d5ca33cc8721`;
- #294 P13 offline analyzer-v2 parity -> `9955be0561807550a7ad1444d8d013d783820188`;
- #298 canonical docs sync -> `127c7215a15a36a2aabc62da79a02708903f4cb9`;
- #300 P14 deterministic runtime review packet -> `3a1f2f96617304aa4251aa4f3e4e112bce13612a`;
- #302 persisted checkout-credential hardening -> `5295a40839b093a77b3c6d2dc98daa6ac63d5067`;
- #304 Elementor v0.4/container validator -> `4c6e0f63718a6b38b056c82207e25973356d0d66`;
- #306 Elementor read-only capability registry/report -> `c242197a2d0a0dd24d7364db5f10c1fb6fa76e13`;
- #308 non-authorizing Elementor candidate artifact envelope -> `426314b183f220f66a315a24f9b1122a464909b9`;
- #310 canonical P14/P15 docs sync -> `3e3254b1c77d78fe7eff2f9278b6a6c6def1c5a9`;
- #312 exact candidate identity + import-validation receipt contract -> `a5b87cad3df803de32ff359d8d0e84796b5d8482`;
- #314 offline exact-bound Elementor import-evidence intake -> `5992fe947a0a2f73d388d0239fde23a53435f046`;
- #316 immutable declared Elementor target profile/fingerprint -> `da29e5c95a76dc6eb25ad8026a7fa1bba156423e`;
- #318 profile-bound import-evidence envelope -> `fb7a9f210f5088b645e4bf046cd4b1f09e3aa72b`;
- #320 read-only target-profile compatibility/alignment assessment -> `44a9e0851b3e7a4235e8854066ef09cc399fb78b`;
- #322 non-authorizing global-reference key review gate -> `d603ce87a645160204d2de6fd458279ba7b3bf3f`;
- #324 canonical P15 R1 docs sync -> `94bc8635b68c5781353d3bcb89388e4b630c69c5`;
- #326 documented core Image MEDIA asset-reference review -> `cde7ea30ad64e2fc6d308de29779f1a49068d543`;
- #328 deterministic combined reference-review identity -> `5b95d5e3e96d7051e4c74930b6df7eb16038707f`;
- #330 exact-bound external reference-closure evidence receipt contract -> `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`;
- #332 canonical reference-evidence docs sync -> `f2403e41998a8c91aedde3fa411863edd983ea99`;
- #334 offline exact-bound reference-closure evidence intake -> `c20d8835c27cf73e1e367c478f346f6c80d72824`;
- #338 non-authorizing pre-decision reference-closure review packet -> `250f3d2f82f0f7ca8a5c374ff0199ffef39d16ba`;
- #340 canonical pre-decision packet docs sync -> `34b77b567d49423dae9e15212cf4c82cf842eca5`;
- #343 exact-bound externally reported authentication-result binding -> `464461a86a4aed4bd43260baee79619a25216c2b`;
- #345 canonical P15 external-authentication docs sync -> `359f247fbb70ee5e301136682ad69a0945e0a6ed`;
- #346 first bounded P16 Gutenberg normalized parsed-block/capability foundation -> `66f6a77f31c69b0c4cd280a21bc03eb53759ec4d`.

## Current issue queue

- #84 — **P12 final integrated validation/release acceptance: ACTIVE / retained at 80%**. Remaining exact runtime, publisher final-details, 2FA and final internal release-exit evidence is deferred to P27. Community approval remains external.
- #119 — **P13-P27 commercial/multi-target roadmap: ACTIVE**. P13-P26 implementation/testing may progress independently of final production release.
- #159 — **P13 real-plugin Build-Ready runtime/parity evidence: OPEN runtime-acceptance dependency**. Genuine real-Figma runtime acceptance remains pending.
- #182 — **P27 final production-release gate: DEFINED / execution deferred**.
- #287 — **OPEN repository-admin security hardening**. Main branch protection/ruleset enforcement requires GitHub administration access and is not represented as fixed by code changes.
Focused issues #275, #280, #284, #285, #288, #295, #297, #299, #301, #303, #305, #307, #309, #311, #313, #315, #317, #319, #321, #323, #325, #327, #329, #331, #333, #337, #339, #342, #344 and #341 are completed through their reviewed implementation/artifact flows.

## P13 state

P13 Build-Ready Score 2.0 + Responsive Risk implementation remains complete in core/plugin/CLI, with genuine runtime acceptance still pending under #159.

Current analyzer/provenance contract after PR #279:

- analyzer semantic version is `p13-core-v2`;
- Build-Ready `runId` binds exact `structuralHash + configHash + analyzerVersion`;
- normal and insufficient-evidence reports use the same identity helper;
- persisted runtime evidence rejects stale/unsupported analyzer versions and contradictory run IDs;
- P13 -> P14 handoff requires the current analyzer-bound identity;
- plugin/CLI parity includes analyzer version in `sameRunIdentity`;
- `generatedAt` remains runtime metadata and does not change deterministic semantic identity.

This v2 identity was required because PR #270 materially changed analyzer semantics by adding the real target-neutral `BR_SAFE_VERTICAL_STACK_CANDIDATE`.

PR #281 then preserved why persisted evidence cannot be used. Read-only inspection distinguishes:

- `VALID`;
- `EMPTY`;
- `INVALID`;
- `READ_FAILED`;
- `QUARANTINED`.

Validation/read/quarantine diagnostics are bounded. The development P13 evidence viewer and P14 Guided Prepare preview now show the rejection reason and fresh-Audit guidance instead of collapsing all unusable evidence to a generic null state.

The compatibility helper `loadLatestP13RuntimeEvidence(): bundle | null` remains available; accepted evidence semantics are unchanged.

PR #294 brings the offline operator intake under the same current identity contract: both plugin evidence and CLI Build-Ready input must use `p13-core-v2`, each run ID must bind exact structural/config/analyzer identity, analyzer version participates in `sameRunIdentity`, and stale/forged identity fails before a receipt is written. `generatedAt` remains the intentionally ignored semantic-comparison field.

Issue #295 then regenerated the traceable development artifact for the genuine #159 attempt from current source `9955be0561807550a7ad1444d8d013d783820188`: run `34833881774`, artifact `p13-runtime-evidence-9955be056180-analyzer-v2`, ID `10343017256`, digest `sha256:b3e5a07a5a012f9c1f4deec32389ad83a0e8550580f60de408db14644de5f1fe`. It remains non-authorizing/do-not-publish and #159 remains open.

## P13 safe-preparation opportunity

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

Development-only Guided Prepare includes:

- #255/#256 — persisted P13 evidence -> P14 plan preview;
- #257/#258 — developer-menu route;
- #260/#261 — normal development main-panel preview;
- #262/#263 — exact current file/page/frame binding;
- #265/#266 — fresh current Frame fingerprint + exact compiled-build binding;
- #268/#269 — versioned snapshot-first proposed-change review manifest;
- #271/#272 — human-readable Proposed Change Review Binding;
- #275/#279 — current `p13-core-v2` analyzer/run provenance required by retained evidence and P13 -> P14 handoff;
- #280/#281 — precise persisted-evidence rejection diagnostics and fresh-Audit guidance;
- #299/#300 — deterministic exact-context runtime review packet with all P14 authority flags still false.

The preview requires exact current context and fresh current-build P13 evidence. The review manifest is bound to P13 run ID, source node/fingerprint, plan digest, canonical eligible action IDs and exact eligible action rule/recipe/target/prerequisite/mutation/validation evidence.

The normal production registry is still empty. Therefore the real `BR_SAFE_VERTICAL_STACK_CANDIDATE` remains REVIEW with `P14_SAFE_BINDING_REQUIRED`; the plan stays BLOCKED with zero production-eligible actions.

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

### PR #279 — analyzer-bound P13 identity

- corrected exact head `b590d0c1652d153525f6fd1a6c8db95dba7e9d54`;
- CI #1026 — PASS;
- P12 Final Release Artifact #337 — PASS;
- P12 Offline Acceptance #381 — PASS Windows/macOS/Ubuntu;
- Integration Readiness did not trigger for this code-only diff;
- guarded squash merge `31c2ddcee932592a9f7357b1bba07c4009cac684`.

### PR #281 — persisted-evidence rejection diagnostics

- exact head `e201f43a7b11355daa2b73c957f82ce397bb6003`;
- CI #1028 — PASS;
- P12 Final Release Artifact #339 — PASS;
- P12 Offline Acceptance #383 — PASS Windows/macOS/Ubuntu;
- Integration Readiness did not trigger for this code-only diff;
- guarded squash merge `801075561f22a1738219e58e9f39096705dc80ac`.

### PR #286 — dependency/workflow supply-chain hardening

- guarded squash merge `245a045fcbc30bd2ec81edb06dba65119e358a50`;
- CI #1048 — PASS;
- Integration Readiness #362 — PASS;
- P12 Final Release Artifact #359 — PASS;
- P12 Offline Acceptance #403 — PASS Windows/macOS/Ubuntu;
- one-time locked npm audit reported 0 vulnerabilities.

### PR #293 — P3 pixel-broker fail-closed hardening

- exact head `fe8dd4c25802eb77acd375f3e14874568db9f988`;
- CI #1054 — PASS;
- P12 Final Release Artifact #365 — PASS;
- P12 Offline Acceptance #409 — PASS Windows/macOS/Ubuntu;
- Integration Readiness did not trigger for the code-only diff;
- guarded squash merge `47dbc078b0a41cbbe5301d6e0d95d5ca33cc8721`.

### PR #294 — analyzer-v2 offline runtime parity intake

- exact head `68189da1fba9b42610cc932e1193851c8c7e9636`;
- CI #1056 — PASS;
- P12 Final Release Artifact #367 — PASS;
- P12 Offline Acceptance #411 — PASS Windows/macOS/Ubuntu;
- Integration Readiness did not trigger for the code-only diff;
- guarded squash merge `9955be0561807550a7ad1444d8d013d783820188`.

Earlier retained review-manifest / real-candidate / review-binding proof remains recorded in PRs #269, #270 and #272.

## P12 release truth

P12 remains at retained `80%`.

Publishing-authoritative historical candidate remains:

- source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`;
- plugin ID `1680034649341961379`;
- Final Release Artifact #20;
- artifact `wp-builders-prepare-final-release-20`, ID `10179286885`;
- artifact digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`;
- exact three-file publish ZIP `sha256:1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

Later P13/P14/P15/P16 development commits do not replace that historical P12 publishing candidate or count as live publisher acceptance. Remaining P12 live/manual evidence is owned by final P27 sequence #182.

## P15 state

P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**. The bounded offline/read-only chain now includes:

- PR #304 — documented Elementor data version `0.4` modern `container`/`widget` contract with bounded validation; legacy `section`/`column`, Atomic `e-*`, unknown element types, malformed settings, duplicate IDs and resource-limit violations fail closed;
- PR #306 — versioned read-only capability registry/report for directly evidenced classic widget IDs `heading`, `image`, and `button`; unregistered widgets are `REVIEW_REQUIRED`, with no Pro/add-on availability inference;
- PR #308 — deterministic non-authorizing candidate artifact envelope;
- PR #312 — exact canonical candidate SHA-256 identity and fail-closed non-authorizing import-validation receipt contract;
- PR #314 — offline operator intake for externally captured exact-bound PASS/FAIL import evidence; even bound observed PASS requires separate internal review and grants no compatibility/download authority;
- PR #316 — immutable declared Elementor target profile with SHA-256 fingerprint; environment source remains `DECLARED`, not observed;
- PR #318 — additive import-evidence binding to the exact current target-profile fingerprint and declared target versions;
- PR #320 — read-only target-profile/candidate metadata alignment assessment; the highest state is `PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING`, not target compatibility;
- PR #322 — global-reference key review gate that emits only widget/path/key inventory, never raw `__globals__` values; detected keys require external closure;
- PR #326 — first documented asset-reference review gate, restricted to the exact core `image` widget `settings.image` MEDIA control from pinned Elementor source. Source media IDs remain evidence only, raw URLs are replaced by SHA-256 fingerprints, and arbitrary/third-party media-shaped settings are not inferred as supported;
- PR #328 — one deterministic SHA-256 reference-review identity binding exact candidate/profile plus canonical global + asset review state. REVIEW/BLOCKED and outstanding external-closure facts remain distinct;
- PR #330 — exact-bound external global/asset closure PASS/FAIL evidence receipt contract. Intake is eligible only for current `EXTERNAL_CLOSURE_REQUIRED` identity; reported PASS remains external evidence, not a closure/compatibility/production authority claim.
- PR #334 — offline operator intake for an exact template + declared profile + closure receipt. It revalidates the fresh current identity, emits only sanitized reported results/current identity/exact raw-input SHA-256 hashes, rejects stale/ineligible replay, and does not echo evidence references, raw global values or raw asset URLs.
- PR #338 — deterministic pre-decision reference-closure review packet. It binds the fresh current identity and canonical valid-receipt SHA-256, separates invalid/reported-fail/reported-pass states, keeps `evidenceAuthenticationStatus=NOT_RUN` and `internalDecisionStatus=NOT_RUN`, and grants no closure/compatibility/production/generation/download authority.
- PR #343 — exact-bound externally reported evidence-authentication result contract. It requires the current authentication-required pre-decision packet and binds the supplied PASS|FAIL report to current identity digest, canonical receipt SHA-256 and SHA-256 of each required evidence reference without emitting the raw references. Repository code does not authenticate the evidence or verifier; even `EXTERNALLY_REPORTED_PASS` keeps `authenticationAuthority=false`, all closure/compatibility/production/generation/download authority false and `internalDecisionStatus=NOT_RUN`.

Real WordPress/Elementor target import remains unvalidated. `targetCompatibilityClaim=false`, production acceptance remains false, generation/download authority remains disabled, global-reference values remain unresolved, raw asset URLs are not emitted, and repository code does not fetch/authenticate external evidence references or identify/verify an authenticator. The exact-bound external authentication-report contract records only a caller-supplied PASS|FAIL result tied to current hashes; `EXTERNALLY_REPORTED_PASS` is not genuine authentication authority, and `internalDecisionStatus` remains `NOT_RUN`. Genuine trusted authentication plus a separate internal decision are still required, and no Figma-to-Elementor semantic generator, Elementor Pro/third-party mapping, gallery/video/add-on asset support or Atomic generation has been accepted.

## P16 state

P16 is **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress. PR #346 / issue #341 retained the first bounded Gutenberg foundation:

- current official WordPress/Gutenberg R0 snapshot;
- repository-owned `gutenberg-normalized-parsed-block-v1` review contract over normalized `blockName`, `attrs`, `innerBlocks`, and `innerHTML`;
- bounded block/depth/attribute/string limits with fail-closed diagnostics;
- top-level `blockName=null` freeform handling kept distinct from named namespaced blocks;
- read-only documented-core capability registry/report for exact official API-v3 IDs `core/paragraph`, `core/heading`, `core/image`, and `core/group`;
- custom/unregistered/freeform content remains `REVIEW_REQUIRED`.

The normalized JSON serializer is not Gutenberg post-content serialization and the repository model intentionally omits WordPress `innerContent`. No raw block markup generation, `@wordpress/blocks`/PHP runtime execution, WordPress REST/site connection, live editor/import/render proof, dynamic render proof, pattern/package generation, Figma semantic mapping, selected-section transfer, production acceptance or download authority has been introduced. `targetCompatibilityClaim=false`, `productionAcceptance=false`, `generationEnabled=false`, and `downloadEnabled=false` remain fixed.

## P17-P26 state

P17-P26 remain **preflight frozen / implementation not started** and proceed under roadmap #119 with R0/R1 gates as applicable.

## P27 state

P27 #182 remains the final production-release gate and owns deferred exact P12 runtime/publisher/2FA evidence, final #84 release-exit review, final production-acceptance sweep and exact-current release provenance.

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains the machine-readable operational artifact registry.

## Immediate project action

Keep #159 genuine Figma Desktop evidence as the prerequisite before real P14 mutation exposure. P15 remains blocked at the next authority-bearing step until genuine trusted authentication plus a separate internal decision are retained; repository code must not fetch/authenticate evidenceReference values, infer authenticator identity, or treat `EXTERNALLY_REPORTED_PASS` as closure/compatibility authority. In parallel, P16 may continue only through bounded deterministic/read-only foundation slices that preserve the current non-authorizing Gutenberg boundary. Native serialization, target profile binding, real editor/import/render validation, Figma semantic generation, pattern packaging and download authority each require separate evidence/gates before stronger claims are made.

No synthetic overall project percentage is used. Historical module progress and current implementation/runtime/release states remain separate.
