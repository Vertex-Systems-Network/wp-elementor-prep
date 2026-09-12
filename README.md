# WP Builders Prepare

Deterministic Figma audit, safe-prep and target-readiness tooling for WordPress builders and web-code workflows.

The core product prepares approved designs **without visually redesigning them**, without requiring generative AI for correctness, and without network access in the current core plugin.

Current product surfaces:

- normal Figma plugin;
- npm/Node CLI;
- deterministic audit/backlog/Build-Ready outputs;
- safety-gated P5/P6/P7 preparation foundations;
- development-only read-only P14 Guided Prepare preview and proposed-change review binding;
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
- `docs/P14_FOUNDATION_IMPLEMENTATION.md` — current target-neutral P14 safety and read-only review contract;
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
- `#273` — docs-only synchronization of canonical P13/P14 status through verified PR #272.

Current verified main before #273 docs synchronization is:

`f06858ce384ce7d01510813b34b0ff803912e944`

### Recent verified P13/P14 sequence

- PR #263 bound Guided Prepare preview to the exact current Figma file/page/frame and guarded squash-merged as `196b4d2ed5c9cc46d96b6c613e20733365264d93`; exact head `da9c59091f3142dade4a444aface5b6e6d5577b9` passed CI #1004, P12 Final Release Artifact #315 and P12 Offline Acceptance #359 on Windows/macOS/Ubuntu.
- PR #266 required a fresh selected-Frame P13 fingerprint plus exact compiled-build identity before preview and guarded squash-merged as `b944dc0ceea1c0c3a531fe4e9b88a66dacf3b92f`; exact head `240d82c108c182c52d81edc058e94b0f64fcce4a` passed CI #1007, P12 Final Release Artifact #318 and P12 Offline Acceptance #362.
- PR #267 synchronized canonical status through #266 and guarded squash-merged as `d6b3beaca2a082c22f1a07b99866df8167049ff2`; exact head `d8300faac32208fe2996e95bbd554ef907112f8f` passed CI #1012, Integration Readiness #338, P12 Final Release Artifact #323 and P12 Offline Acceptance #367.
- PR #269 added a versioned snapshot-first non-authorizing proposed-change review manifest and guarded squash-merged as `6514959cbfd9a71c241b204f371a330a6be462e2`; exact head `234eda81ab5c49c3325c7fd9231d3d66841c0013` passed CI #1014, P12 Final Release Artifact #325 and P12 Offline Acceptance #369.
- PR #270 added the first real zero-penalty P13 `BR_SAFE_VERTICAL_STACK_CANDIDATE`, derived only from the existing accepted P2/P5 planner pipeline, and guarded squash-merged as `a70b003bd533cbf42d1aaaabf722639852ba48db`; corrected exact head `5d739cde842cefe6ff640aeba74da4900eddb831` passed CI #1017, P12 Final Release Artifact #328 and P12 Offline Acceptance #372.
- PR #272 rendered the exact proposed-change review binding in the development Guided Prepare panel while preserving publishable-release stripping, and guarded squash-merged as `f06858ce384ce7d01510813b34b0ff803912e944`; exact head `e59058a7de174b18d8377d8052610efc9a12b4c2` passed CI #1019, P12 Final Release Artifact #330 and P12 Offline Acceptance #374.

The real P13 vertical-stack opportunity is still **not** production mutation authority. `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty, so production P13→P14 handoff downgrades the candidate to REVIEW with `P14_SAFE_BINDING_REQUIRED`, produces no production-eligible action IDs, and keeps the P14 plan BLOCKED.

The proposed-change review manifest and visible review-binding panel remain evidence only. They do not create confirmation, do not execute the retained-duplicate transaction, and do not claim target compatibility or production acceptance.

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
| P13 Build-Ready Score 2.0 + Responsive Risk | IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING | 100% impl | `██████████` | #159 real-plugin parity/internal runtime acceptance remains; real vertical-stack opportunity evidence is implemented |
| P14 Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | `──────────` | Complete #273 status sync; read-only preview includes exact-context/current-build review binding; real vertical-stack candidate remains REVIEW/BLOCKED because production registry remains empty; retained-duplicate mutation runtime is unwired; #159 required before real Figma mutation exposure |
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
| P27 Final production release + publisher/runtime evidence | GATE DEFINED / EXECUTION DEFERRED | 0% exec | `░░░░░░░░░░` | Coordinate retained #84 truth + final live runtime/publisher/2FA evidence after implementation/internal readiness |

**Overall progress is intentionally not collapsed into one synthetic percentage.** Historical P0-P7 core remains 100%; P12 remains 80%; P13 implementation is complete with real-plugin runtime acceptance pending; P14 core/read-only review implementation is active while confirmation and retained-duplicate mutation authority remain unwired; P15-P26 implementation is not started; P27 release execution is not started.

R0/R1 gate definitions remain complete but are re-executed where applicable. Implementation completion, real-runtime acceptance and production release are separate evidence states; one does not imply another.

## Current P13/P14 boundary

P13 now records a real high-confidence vertical-stack preparation opportunity using the existing accepted P2/P5 detection/planning semantics. The P13 finding is LOW severity, target-agnostic and zero penalty; it does not lower the Build-Ready score merely because a safe-preparation opportunity exists.

P14 Guided Prepare remains development-only and read-only. Before rendering, it requires exact current file/page/frame identity, stable selection during evidence load, a fresh matching Build-Ready source/run/config/analyzer fingerprint, and exact current plugin/build identity.

The versioned proposed-change review artifact binds human review to the exact P13 run, source fingerprint, P14 plan digest and canonical eligible action IDs. When eligible actions exist in synthetic/test registries it also records exact rule/recipe versions, target IDs, prerequisites, mutation allowlists and validation profile IDs. In normal production configuration the registry is empty, so the real vertical-stack candidate remains review-only and the manifest contains no production-authorized eligible action binding.

Current explicit P14 preview/review locks remain:

- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `mutationEnabled=false`;
- `confirmationEnabled=false`.

The generated publishable release UI strips the development-only Guided Prepare preview and Proposed Change Review Binding surface.

## Current P12 publishing line

The retained publishing candidate under manual evaluation was produced from source:

`5f12b1d28146d5c2af815cc9f83eb30431dce4b5`

Figma-assigned publishing ID:

`1680034649341961379`

Verification on that historical candidate passed CI #709, Integration Readiness #145, P12 Offline #64 and Final Release Artifact #20 (`wp-builders-prepare-final-release-20`, artifact ID `10179286885`, digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`). The exact three-file publish ZIP SHA-256 is `1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

The exact candidate is pinned in `config/p12-publisher-candidate.json`. `npm run p12:publisher-evidence` verifies exact ZIP/extracted-plugin hashes, hashes runtime/publish/2FA screenshots, requires explicit operator confirmations, and emits a receipt with `acceptanceAuthority: false`. Operator instructions are in `docs/P12_PUBLISHER_EVIDENCE_INTAKE.md`.

The currently retained screenshot set is **not sufficient** for exit: the retained final-details screenshot still shows the historical `Invalid ID in manifest.json` state, the other Publish screenshots are Data Security steps rather than final-details/2FA proof, and the retained plugin UI screenshot is historical P6 evidence rather than the minimal release #20 rebind. Fresh exact-#20 runtime, valid final-details and 2FA screenshots remain required.

Later P13/P14 development commits do not silently replace this historical P12 publishing candidate or count as live publisher acceptance. Actual Community review/approval remains external.

## R0 — AI-native market/platform research

Before major new target-adapter implementation, research must refresh official target docs, competitor capability baseline, product gaps, format/API stability and network/privacy/licensing risks.

The retained market snapshot is `docs/R0_MARKET_SNAPSHOT_2026-09-11.md`. Research is planning input only and does not count as runtime acceptance.

## R1 — reliability and compatibility gate

Every major adapter must define these before implementation:

- immutable versioned `TargetProfile`;
- machine-readable capability descriptor driving valid UI options;
- stale-result invalidation when target/source/options change;
- strict job state machine and cooperative cancel/retry behavior;
- structured error codes with actionable next steps;
- atomic generation with no partial download/copy artifacts;
- schema/package/reference/assets validators;
- real import/build/render harness where applicable;
- readiness labels separating local artifact validation from observed live-target verification.

A package can be `ARTIFACT VALIDATED` without being `IMPORT VERIFIED`. We do not claim an unobserved WordPress server will import successfully merely because local JSON/ZIP validation passed.

## Planned WordPress workflow

### Elementor / Elementor Pro

1. select Frame or section;
2. choose explicit Elementor adapter family/version and Core/Pro capability profile;
3. run compatibility/alignment/widget/responsive checks;
4. if needed, create an Elementor-ready duplicate;
5. validate duplicate;
6. generate versioned native Elementor artifact atomically;
7. validate JSON/ZIP/package/references/assets;
8. obtain real target import/render proof where the acceptance harness supports it;
9. run round-trip preview/diff where supported;
10. expose only output families the adapter actually supports;
11. support selected-section transfer through documented artifact/optional WP Builders Bridge.

Initial Elementor adapter families remain planned separately for v3 Container output and v4 Atomic output. No dependency on undocumented Elementor clipboard internals is accepted.

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
- React, Next.js, Vue, Nuxt, Svelte/SvelteKit, Angular, Astro through versioned adapters;
- JS/TS/styling options only when declared by the adapter capability matrix;
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

NestJS remains a backend/API scaffold option paired with a front-end target, not a visual renderer.

## Planned asset export

- images/icons/SVGs;
- Stored Original image bytes where Figma image-fill bytes are accessible;
- Rendered Appearance for crop/mask/effects/layout appearance;
- display-size vs 1x/2x/custom export options;
- deterministic naming/de-duplication;
- asset manifest;
- font family/style/weight/usage manifest;
- raw font files only when user-supplied and license-permitted.

Stored image bytes are not described as proven upstream-upload provenance when Figma cannot prove that provenance.

## Safety and reliability invariants

- source visual design remains authoritative;
- unsupported/ambiguous structures are REVIEW/BLOCKED, never guessed;
- target preparation occurs on candidate/duplicate with validation;
- low confidence does not mutate;
- plugin/CLI share one deterministic core;
- raw `.fig` reverse engineering remains refused;
- responsive analysis does not invent mobile/tablet design;
- target adapters are versioned and declare support limits;
- invalid option combinations are prevented by capability-driven state;
- no silent fallback changes implementation strategy;
- untrusted code-to-design JS is not executed in the core;
- current Community core remains network-free;
- commercial entitlements gate surfaces, not correctness;
- optional AI cannot authorize mutation, alter score evidence or replace validators.

## Current execution order

1. complete #273 canonical status synchronization through verified PR #272;
2. run a fresh focused P14 gap audit without interpreting the real P13 candidate or review manifest as confirmation/mutation authority;
3. complete #159 real-plugin P13 runtime/parity acceptance when genuine real-Figma evidence is available; #159 is required before real P14 mutation exposure, not before target-neutral core/read-only work;
4. refresh R0 before major external adapters when platform facts materially changed;
5. execute R1 before implementing/accepting each major adapter;
6. implement P15-P26 in dependency order with focused issue/branch/PR slices and separate implementation/internal-readiness/production-acceptance states;
7. use P27 #182 as the final production-release sequence after implementation/internal readiness;
8. during P27, capture remaining exact release runtime, Publish final-details and 2FA evidence and perform the genuine #84 release-exit decision;
9. treat Community submission/review/approval as external to internal production acceptance.

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
