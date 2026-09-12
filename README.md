# WP Builders Prepare

Deterministic Figma audit, safe-prep and target-readiness tooling for WordPress builders and web-code workflows.

The core product prepares approved designs **without visually redesigning them**, without requiring generative AI for correctness, and without network access in the current core plugin.

Current product surfaces:

- normal Figma plugin;
- npm/Node CLI;
- deterministic backlog/report outputs;
- exact-build release/provenance tooling.

Current core flow:

`Figma/plugin-or-CLI input -> Audit -> classify -> score -> backlog -> plan -> candidate clone -> safe transform -> validate -> commit/rollback -> report`

Approved post-P12 direction:

`Choose target/profile -> Audit -> Target Compatibility -> Build/Target-Ready Score -> Responsive Risk -> Target-Ready Duplicate if needed -> Validate -> Generate atomically -> Artifact validation -> Real target verification when available -> Round-trip QA -> Receipt -> Download/Copy/Import -> Handoff`

Canonical planning docs:

- `docs/MARKET_RESEARCH_PLAN.md` — R0 market/platform research;
- `docs/R0_MARKET_SNAPSHOT_2026-09-11.md` — retained September 2026 competitor/platform snapshot;
- `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md` — R1 adapter/option/system reliability contract;
- `docs/COMMERCIAL_EXPANSION_PLAN.md` — retained P13-P26 commercial implementation roadmap; P27 final production-release gate is tracked by #182;
- `docs/P13_P26_PREFLIGHT_COMPLETION_2026-09-11.md` — retained P13-P26 planning/preflight completion index;
- `docs/P14_FOUNDATION_IMPLEMENTATION.md` — current target-neutral retained-duplicate core safety contract;
- `docs/AI_NATIVE_PLAN.md`;
- `docs/FEATURE_PLAN.md`.

## Live development status

> **Progress policy:** implementation, runtime acceptance and external Community review are tracked separately. New future scope does not reduce already-completed historical core progress.

**Open PR/MR:** see the repository's current pull-request list; this README intentionally does not hardcode a count.

Open roadmap / acceptance issues:

- `#84` — P12 retained final validation/release-exit truth; remaining live runtime/publisher/2FA evidence is intentionally deferred to the final release sequence.
- `#119` — P13-P27 commercial/multi-target roadmap owner; P13-P26 implementation/testing may proceed before final production release.
- `#159` — P13 real-plugin Build-Ready runtime/parity evidence and internal runtime-acceptance dependency.
- `#182` — P27 final production-release gate coordinating the remaining external/manual release evidence and final release decision.
- `#264` — docs-only synchronization of canonical P14 status after the verified Guided Prepare runtime-preview sequence through #265/#266.

PR #122 merged the market-researched multi-target planning baseline as `ade501fedb8c810b4964eb3dda414c58450e8565` after CI #721, Integration Readiness #156, P12 Offline Acceptance #76 and P12 Final Release Artifact #32 passed. PR #123 synchronized post-plan status and merged as `d34c026202ae6ecd8f88f71e6056d619578ce56f`. PR #124 added the R1 reliability/compatibility audit and merged as `4d38c46c359bd030bf36100f4424760b1380db81`. PR #129 added deterministic final publisher-evidence intake tooling and squash-merged as `cc466367fa0c6fee119d4fb183371af5fb3f04c7` after CI #730, P12 Offline Acceptance #85 and P12 Final Release Artifact #41 passed. PR #130 then synchronized post-#129 repository status and merged as `c6a4e1df034fbd62077c58227b2c0c4dc4c116d2`. PR #131 retained the current commercial R0 market refresh and merged as `a22b3121f1d00698ee9d4e4bf283f3bf2bfa9119`; its current-main push checks passed CI #735, Integration Readiness #168, P12 Offline Acceptance #90 and P12 Final Release Artifact #46. PR #193 completed P14 receipt-envelope/runtime-diagnostic hardening and squash-merged as `e54cb44c3dabe6cd2a459f70df917b9422fadddd` after exact head `5b9a02ce3b15ab49a1f281b51494e51bc5eb0e57` passed CI #844, Integration Readiness #217, P12 Final Release Artifact #155 and P12 Offline Acceptance #199 on Ubuntu/macOS/Windows; issue #192 closed completed. PR #194 synchronized post-#193 repository status and squash-merged as `b7c00aefa8b85112bcc5968144786da5351e0202`. PR #196 completed P14 runtime clock/event-timestamp evidence hardening and squash-merged as `8021874323f5bad6ebf648b0891bc9f6358dd1bf` after exact head `47cb0b4d2d3c53f7f818af760131cc78737cb5c4` passed CI #854, Integration Readiness #224, P12 Final Release Artifact #165 and P12 Offline Acceptance #209 on Ubuntu/macOS/Windows; issue #195 closed completed. PR #199 completed P14 safe-recipe registry resource bounding and squash-merged as `80cefcb8b90a85b5e5a8b5ad4e6a0f65ddf6d12b` after exact head `e782a08090a4e158f99da22bf25d8fff60c8c529` passed CI #863, Integration Readiness #231, P12 Final Release Artifact #174 and P12 Offline Acceptance #218 on Ubuntu/macOS/Windows; issue #198 closed completed. PR #205 completed P14 coordinator runtime-evidence/lease-cleanup hardening and squash-merged as `e80bf4c21b64d6b72714965f4e954759e1c4159d` after exact head `1f76443e652f5d7c2c3dd9498b33463c1c2e7e03` passed CI #872, Integration Readiness #239, P12 Final Release Artifact #183 and P12 Offline Acceptance #227 on Ubuntu/macOS/Windows; issue #201 closed completed. PR #208 completed P14 caller run-control runtime-evidence hardening and guarded squash-merged as `df1e8f33394f13a371c2ff0b97bb6eceb321fd91` after exact head `c3b577bcf09e3f97060cfcba7b76d202e9119019` passed CI #882, Integration Readiness #247, P12 Final Release Artifact #193 and P12 Offline Acceptance #237 on Ubuntu/macOS/Windows; issue #207 closed completed. PR #211 completed P14 runtime action-eligibility hook property hardening and guarded squash-merged as `7f24e57a28941e80d290b9b7dfbdce5fd718e534` after exact head `57b97950928390e8c07ce82e48f92ddff7fabd4f` passed CI #895, Integration Readiness #257, P12 Final Release Artifact #206 and P12 Offline Acceptance #250 on Ubuntu/macOS/Windows; issue #210 closed completed. PR #214 completed P14 top-level run-input runtime-evidence snapshot hardening and guarded squash-merged as `f8a983a1ed7d18963e23901996a60f64d55678cd` after exact head `5058b82ad17eb166c1e9445aed6959a07bbe856c` passed CI #907, Integration Readiness #268, P12 Final Release Artifact #218 and P12 Offline Acceptance #262 on Ubuntu/macOS/Windows; issue #213 closed completed. PR #221 completed P14 unreadable nested bounded-input evidence hardening and guarded squash-merged as `e028c76d520564fde6177269e75c6efa423b0a5b` after exact head `33e9a956b1c63aec9623e9c3187449a8569f6236` passed CI #921, Integration Readiness #280, P12 Final Release Artifact #232 and P12 Offline Acceptance #276 on Ubuntu/macOS/Windows; issue #216 closed completed. PR #224 completed P14 nested plan/confirmation semantic snapshot hardening and guarded squash-merged as `a84104b459d38b90368e0ef21ec1ac32788cd438` after exact synchronized head `483e4b3f655ee8c99e844fbc9395313db22812f1` passed CI #932, Integration Readiness #289, P12 Final Release Artifact #243 and P12 Offline Acceptance #287 on Ubuntu/macOS/Windows; issue #223 closed completed. Initial head `64168dea7b5c6aea126cc89404221da79973b5bd` had exposed an existing #216 receipt-correlation regression in Final Release #237, which corrected implementation head `8ec0c14c6301d16b8b9564a5b0d01423147629b5` fixed before final synchronization. PR #227 completed P14 safe-recipe registry semantic snapshot hardening and guarded squash-merged as `e5e22a4c556856a7c2ab11dbb94025ee838e0bb4` after exact synchronized head `6446c49a6cf5da5d039600f96a0ac3bd03e2b904` passed CI #945, Integration Readiness #299, P12 Final Release Artifact #256 and P12 Offline Acceptance #300 on Ubuntu/macOS/Windows; issue #226 closed completed. Initial implementation/test head `4bd44da760d0dc0558b4d7c710bd779d1dd1e534` had already passed CI #939, P12 Final Release Artifact #250 and P12 Offline Acceptance #294 on Ubuntu/macOS/Windows before same-cycle docs synchronization. PR #230 completed #229 adapter callback input isolation and guarded squash-merged as `bad83a48ab58dfa8b956e7b6bf02c74a079a4665` after exact synchronized head `7466a230344c8a85a10c4a68fb05216ac7d5d4cf` passed CI #958, Integration Readiness #310, P12 Final Release Artifact #269 and P12 Offline Acceptance #313 on Ubuntu/macOS/Windows; issue #229 closed completed. PR #232 completed #231 adapter-output semantic snapshot hardening and guarded squash-merged as `2bbc24fb8afa3ccb9cc202fd816dfc8d69888941` after exact head `b06240a02cc8fc14c0c94e23ba9e554a62eae319` passed CI #965, P12 Final Release Artifact #276 and P12 Offline Acceptance #320 on Ubuntu/macOS/Windows; Integration Readiness was path-filtered for that code-only diff; post-merge status synchronization #233 / PR #234 passed CI #970, Integration Readiness #316, P12 Final Release Artifact #281 and P12 Offline Acceptance #325 at exact head `7bbfa45eaa5047c7b3a0230d43f4bfda5ce51998`, then guarded squash-merged as `27144161082ce3cff9c9a0ca1e0364cd19b727ad`. Issues #231 and #233 closed completed. PR #236 then completed #235 coordinator acquisition/refusal evidence snapshot hardening and guarded squash-merged as `804ffc6a143c2cf6ab4ca100d7b021289a060be2` after exact head `497b1385b55ca8343d82be04da02de0595228efd` passed CI #972, P12 Final Release Artifact #283 and P12 Offline Acceptance #327; Integration Readiness was path-filtered for that code-only diff; post-merge status synchronization #237 / PR #238 passed CI #974, Integration Readiness #319, P12 Final Release Artifact #284 and P12 Offline Acceptance #328 at exact head `48804348e6244b043c7c76ceca5181d15704592f`, then guarded squash-merged as `2966bae643cd7d9ac972bc60da1688b8fed575e2`. Issues #235 and #237 closed completed. PR #240 then completed #239 receipt-integrity semantic snapshot hardening and guarded squash-merged as `9e86dd4e10dd282758bcdbb177841a0117b179ae` after exact head `9a01555ab95b595151c47d401a0ba3e771c240d9` passed CI #976, P12 Final Release Artifact #287 and P12 Offline Acceptance #331; Integration Readiness was path-filtered for the code-only diff. PR #242 completed #241 post-#240 canonical status synchronization and guarded squash-merged as `a2246d564c63912d1f74014a87d9181796eb2386`. P14 then continued through standalone plan/confirmation/authorization/runtime evidence snapshot hardening in PRs #244, #246, #248, #250, #252 and #254, merging respectively as `583c42a637a0e477bde0892a4ecd393744813350`, `34755df477d93612e953c991e99b66e91b277cd7`, `ea3a30a5d70d865f491550d4a81cf0d93555e9c0`, `c998636e39a9576555a6b8e800db9095f08319c0`, `44bc19823bf8c0cdd80ba1d2be5d435405179aee` and `9b2d17b8a9a8a511cedf67a8df49efed6598d37d`. Read-only Guided Prepare runtime preview work then merged through PR #256 (`2b037a678109838aad6dd17499250ca2e9d708ff`), PR #258 (`3a87f86ed5148e4cfb15a79fda2cf459ef0c5bb6`), PR #261 (`633edc0417c5b4ee16efdc81c8d12eae860815bb`), PR #263 (`196b4d2ed5c9cc46d96b6c613e20733365264d93`) and PR #266 (`b944dc0ceea1c0c3a531fe4e9b88a66dacf3b92f`). PR #263 exact head `da9c59091f3142dade4a444aface5b6e6d5577b9` passed CI #1004, P12 Final Release Artifact #315 and P12 Offline Acceptance #359; PR #266 exact head `240d82c108c182c52d81edc058e94b0f64fcce4a` passed CI #1007, P12 Final Release Artifact #318 and P12 Offline Acceptance #362. Issue #239 and all focused P14 issues through #265 are closed completed. Issue #126 is also closed completed.

The retained P13-P26 planning/preflight sequence remains the implementation contract. Since that freeze, P13 Build-Ready Score/Responsive Risk core plus plugin/CLI integration and real-source calibration have been implemented; real-plugin runtime/parity acceptance remains open in #159. P14 target-neutral retained-duplicate preparation remains under active implementation with production recipe authority and real Figma mutation exposure intentionally unwired. The merged #192 / PR #193 slice bounds receipt collections, correlation identities, diagnostics and runtime exception evidence; the merged #195 / PR #196 slice bounds runtime event-clock/timestamp evidence and represents unavailable event time explicitly as `UNKNOWN`; the merged #198 / PR #199 slice bounds safe-recipe registry collections and identities before semantic authorization traversal while preserving the existing unauthorized outcome; the merged #201 / PR #205 slice treats injected coordinator acquire/release behavior as untrusted runtime evidence and turns unresolved lease cleanup into explicit `CLEANUP_REQUIRED` evidence instead of an uncaught/silent outcome; the merged #207 / PR #208 slice validates and normalizes transaction IDs, prepared names, explicit review policy and custom input-bound overrides before transaction semantics; the merged #210 / PR #211 slice guards runtime `assessActionEligibility` hook property access so a throwing/proxy getter after prior candidate mutation is converted into the existing structured `transform-recheck` cleanup path instead of escaping the transaction; the merged #213 / PR #214 slice snapshots known top-level run-input properties through guarded one-shot reads and removes `...input` re-entry so hostile caller getters cannot escape or change evidence after the public boundary; the merged #216 / PR #221 slice guards nested bounded-input plan/confirmation traversal in both the public boundary and internal core, preserving readable oversized-input semantics while converting unreadable getter/proxy failures into structured pre-adapter `bounds-evidence` receipts; the merged #223 / PR #224 slice captures the known bounded nested plan/confirmation schema into plain semantic evidence after first preflight, re-runs bounds on that snapshot and prevents readable stateful caller getters/proxies from changing later transaction semantics; the merged #226 / PR #227 slice captures the known safe-recipe registry schema into bounded plain evidence after the first registry resource preflight, re-runs registry bounds on that snapshot, and makes validation/resolution/authorization consume stable evidence so readable stateful registry getters cannot change later recipe authority; the merged #229 / PR #230 slice detaches candidate/action/plan values passed into object-bearing runtime adapter callbacks so callback-side mutation cannot alter later core transaction state; the merged #231 / PR #232 slice snapshots known adapter-returned candidate, recipe, runtime-eligibility, validation, re-score and retention evidence through bounded one-shot reads so readable stateful or revoked adapter proxies cannot change accepted semantics after validation. The post-#232 #233 / PR #234 synchronization records those merges on the canonical status surfaces; the merged #235 / PR #236 slice snapshots coordinator acquisition/refusal semantic fields once before exact lease/refusal validation and returns detached accepted evidence so readable stateful coordinator getters cannot change meaning after validation. The #237 / PR #238 synchronization records the coordinator-evidence cycle on the canonical status surfaces; the merged #239 / PR #240 slice snapshots receipt-integrity top-level and receipt-owned nested semantic evidence before reuse, detaches bounded receipt collections through guarded copy, and makes PREPARED/PREPARED_WITH_REVIEW consume accepted validation/re-score evidence rather than re-reading original stateful objects. Revoked or unreadable receipt evidence now fails closed at the integrity boundary. #241 / PR #242 completed the post-#240 synchronization. PRs #244-#254 extended the same bounded one-shot evidence model across standalone plan integrity, confirmation validation/construction, execution authorization, runtime action binding and validation-profile coverage. PRs #256/#258/#261 exposed the existing P14 plan model as a development-only read-only Guided Prepare preview in the evidence viewer, developer menu and normal development panel without enabling confirmation or mutation. PR #263 binds that preview to the exact current Figma file/page/frame and rejects selection changes while evidence loads. PR #266 freshly rescans the selected Frame and requires the persisted P13 run/root/structural/config/analyzer fingerprint plus plugin/build identity to match the current runtime before rendering. All P14 preview authority flags remain locked (`acceptanceAuthority=false`, `targetCompatibilityClaim=false`, `mutationEnabled=false`, `confirmationEnabled=false`); the production safe-recipe registry remains empty and no real retained-duplicate mutation adapter is exposed. Current docs-only synchronization is #264. P15-P26 remain preflight-frozen and implementation-not-started. Under roadmap #119, those implementation/test slices are no longer blocked by #84; production acceptance/release remains a separate P27/#182 decision and #84 retains the P12 release-exit truth.

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
| R1 Reliability/compatibility gate contract | DEFINED / RECURRING | 100% | `██████████` | Contract complete; execute profile/capability/validator/harness gate per adapter |
| P13 Build-Ready Score 2.0 + Responsive Risk | IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING | 100% impl | `██████████` | #159 real-plugin parity/internal runtime acceptance remains; production release is later P27 |
| P14 Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | `──────────` | Complete #264 status sync; read-only preview is exact-context/current-build bound; retained-duplicate mutation runtime is unwired; production registry remains empty; #159 required before real Figma mutation exposure |
| P15 Elementor native export + validation | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | R0+R1 refresh as needed; versioned v3/v4 adapter + real import proof |
| P16 Gutenberg native export + transfer | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | R0+R1 refresh as needed; native block/pattern/editor validation |
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
| P27 Final production release + publisher/runtime evidence | GATE DEFINED / EXECUTION DEFERRED | 0% exec | `░░░░░░░░░░` | Run after implementation/internal-readiness sequence; coordinate retained #84 truth + final live runtime/publisher/2FA evidence |

**Overall progress is intentionally not collapsed into one synthetic percentage.** Historical P0-P7 core remains 100%; P12 remains 80%; P13 implementation is complete with runtime acceptance pending; P14 core and read-only runtime preview implementation are active while confirmation/mutation authority remains unwired; P15-P26 implementation is not started; P27 release execution is not started.

R0/R1 gate definitions remain complete but are re-executed where applicable. Implementation completion, real-runtime acceptance and production release are separate evidence states; one does not imply another.

## Current P12 publishing line

The retained publishing candidate under manual evaluation was produced from source:

`5f12b1d28146d5c2af815cc9f83eb30431dce4b5`

Figma-assigned publishing ID:

`1680034649341961379`

Verification on that candidate passed CI #709, Integration Readiness #145, P12 Offline #64 and Final Release Artifact #20 (`wp-builders-prepare-final-release-20`, artifact ID `10179286885`, digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`). The exact three-file publish ZIP SHA-256 is `1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

The exact candidate is pinned in `config/p12-publisher-candidate.json`. `npm run p12:publisher-evidence` verifies the exact ZIP and extracted plugin hashes, hashes the runtime/publish/2FA screenshots, requires explicit operator confirmations, and emits a receipt with `acceptanceAuthority: false`. Operator instructions are in `docs/P12_PUBLISHER_EVIDENCE_INTAKE.md`.

The currently available screenshot set has been explicitly triaged in #84 and is **not sufficient** for exit: the retained final-details screenshot still shows the historical `Invalid ID in manifest.json` state, the other Publish screenshots are Data Security steps rather than final-details/2FA proof, and the retained plugin UI screenshot is historical P6 evidence rather than the minimal release #20 rebind. Fresh exact-#20 runtime, valid final-details and 2FA screenshots are still required.

Static/docs/support-tooling changes after source `5f12...` do not automatically replace the runtime candidate or count as live acceptance. P12 exit must name the exact package whose Figma Desktop/publisher evidence is accepted.

Actual Community review/approval remains external.

## R0 — AI-native market/platform research

Before major new target-adapter implementation, research must refresh official target docs, competitor capability baseline, product gaps, format/API stability and network/privacy/licensing risks.

The current retained market snapshot is `docs/R0_MARKET_SNAPSHOT_2026-09-11.md`, merged by PR #131. It records current competitive pressure from native WordPress conversion and Figma-to-code products and reinforces that WP Builders Prepare must compete on **validated target readiness**, not generic conversion alone.

Research is planning input only and does not count as runtime acceptance.

## R1 — reliability and compatibility gate

Every major adapter must define these before implementation:

- immutable versioned `TargetProfile`;
- machine-readable capability descriptor that drives valid UI options;
- stale-result invalidation when target/source/options change;
- strict job state machine and cooperative cancel/retry behavior;
- structured error codes with actionable next steps;
- atomic generation: no partial download/copy artifacts;
- schema/package/reference/assets validators;
- real import/build/render harness where applicable;
- exact readiness labels separating local artifact validation from observed live-target verification.

A package can be `ARTIFACT VALIDATED` without being `IMPORT VERIFIED`. We do not claim an unobserved WordPress server will import successfully merely because local JSON/ZIP validation passed.

## Planned WordPress workflow

### Elementor / Elementor Pro

1. select Frame or section;
2. choose explicit Elementor adapter family/version and Core/Pro capability profile;
3. run compatibility/alignment/widget/responsive checks;
4. if needed, `Create Elementor-Ready Duplicate`;
5. validate duplicate;
6. generate versioned native Elementor artifact atomically;
7. validate JSON/ZIP/package/references/assets;
8. real target import/render proof where the acceptance harness supports it;
9. round-trip preview/diff where supported;
10. download template/ZIP/kit only for an output family the adapter actually supports;
11. selected-section transfer through documented artifact/optional WP Builders Bridge.

Initial Elementor adapter families are planned separately for v3 Container output and v4 Atomic output. A hybrid site chooses the intended output family rather than receiving an ambiguous mixed schema.

No dependency on undocumented Elementor clipboard internals. Third-party add-ons are not silently represented as native Elementor widgets.

### Gutenberg

- native core-block mapping first;
- serialized block markup;
- pattern JSON;
- parse -> serialize -> parse stability;
- real editor-open validation for supported fixtures;
- selected-section block/pattern transfer;
- optional WP Builders Bridge receiver.

## Planned code/framework workflow

### Design -> code

- HTML/CSS/JS;
- React, Next.js, Vue, Nuxt, Svelte/SvelteKit, Angular, Astro via adapters;
- JS/TS and styling options only when declared by the adapter capability matrix;
- generated dependency versions pinned in accepted artifacts, never `latest`;
- generated fixture projects must install/typecheck/build before production acceptance;
- existing component-library bindings;
- assets/tokens included.

### Code -> design

- HTML/CSS static-first reconstruction;
- folder/ZIP input;
- path traversal/zip-bomb/file-count/oversize protections;
- arbitrary JS disabled by default;
- JS-enabled rendering only through a separately accepted sandbox/companion design;
- result becomes a new Figma reconstruction.

NestJS is considered a backend/API scaffold option paired with a front-end target, not a visual renderer.

## Planned asset export

- images/icons/SVGs;
- **Stored Original** image bytes where Figma image-fill bytes are accessible;
- **Rendered Appearance** for crop/mask/effects/layout appearance;
- rendered display-size vs 1x/2x/custom export options;
- deterministic naming/de-duplication;
- asset manifest;
- font family/style/weight/usage manifest;
- raw font files only when user-supplied and license-permitted because the Figma Plugin API does not provide a general raw-font-file export path.

Stored image bytes are not described as proven upstream-upload provenance when Figma cannot prove that provenance.

## Key differentiators queued

- round-trip rendered visual diff before export acceptance;
- target capability matrix with explicit Native / Review / Unsupported states;
- change-only regeneration between Figma revisions;
- exact-run readiness certificate;
- existing component-library binding;
- Export Preview Lab;
- optional WordPress companion bridge using file/paste first;
- later Bricks/other builders through the same adapter model.

## Safety and reliability invariants

- source visual design remains authoritative;
- unsupported/ambiguous structures are REVIEW/BLOCKED, never guessed;
- target preparation occurs on candidate/duplicate with validation;
- low confidence does not mutate;
- plugin/CLI share one deterministic core;
- raw `.fig` reverse engineering remains refused;
- responsive analysis does not invent mobile/tablet design;
- target adapters are versioned and declare support limits;
- invalid option combinations are prevented by capability-driven state, not discovered only after export;
- no silent fallback changes the implementation strategy;
- code-to-design untrusted JS is not executed in the core;
- current Community core remains `allowedDomains: ["none"]`; arbitrary customer-domain push is separate future scope;
- commercial entitlements gate surfaces, not correctness;
- optional AI cannot authorize mutation, alter score evidence or replace validators.

## Current execution order

1. complete #264 canonical status synchronization through verified PR #266, then continue the next focused P14 implementation/safety slice while confirmation and real Figma retained-duplicate mutation remain unwired and the production recipe registry remains empty;
2. complete P13 #159 real-plugin runtime/parity acceptance when genuine real-Figma evidence is available; #159 is required before P14 real mutation exposure, not before read-only/core development;
3. refresh R0 before each major external adapter if platform facts materially changed;
4. execute R1 before implementing/accepting each major adapter;
5. implement P15-P26 in dependency order with one focused issue/branch/PR per slice, preserving the distinction between implementation, internal readiness and production acceptance;
6. use P27 #182 as the final production-release sequence only after the implementation/internal-readiness program is ready;
7. during P27, capture the remaining exact release runtime, Publish final-details and 2FA evidence, run the retained P12 publisher-evidence intake, and perform the genuine #84 release-exit decision;
8. treat Community submission/review/approval as external to internal production acceptance.

## Development and validation commands

```bash
npm install
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

For the manual final publisher gate, use `npm run p12:publisher-evidence -- ...` exactly as documented in `docs/P12_PUBLISHER_EVIDENCE_INTAKE.md`.

Automated checks are evidence only for the properties they exercise. Target phases add capability-matrix, option-state, package/schema, malformed-input, import/build/render and round-trip harness checks.

## Runtime artifact registry

Machine-readable operational registry: `config/runtime-artifacts.json` schema v3.
