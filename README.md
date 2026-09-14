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
- P15 Elementor R1 foundation: v0.4/container validation, bounded widget-capability reporting, exact candidate/import-evidence binding, immutable declared target profiles, read-only profile assessment, bounded global/core-image asset review, deterministic combined reference identity and exact-bound external closure-evidence receipts;
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
- `docs/P14_FOUNDATION_IMPLEMENTATION.md` — current target-neutral P14 safety/read-only review contract;
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

`d0796310fb3b6d4f1753d472e0e9f9783bb752b3`

### Recent verified P13/P14 sequence

- PR #269 added a versioned snapshot-first non-authorizing proposed-change review manifest and guarded squash-merged as `6514959cbfd9a71c241b204f371a330a6be462e2`; exact head `234eda81ab5c49c3325c7fd9231d3d66841c0013` passed CI #1014, P12 Final Release Artifact #325 and P12 Offline Acceptance #369.
- PR #270 added the first real zero-penalty P13 `BR_SAFE_VERTICAL_STACK_CANDIDATE`, derived only from the accepted P2/P5 planner pipeline, and guarded squash-merged as `a70b003bd533cbf42d1aaaabf722639852ba48db`; corrected exact head `5d739cde842cefe6ff640aeba74da4900eddb831` passed CI #1017, P12 Final Release Artifact #328 and P12 Offline Acceptance #372.
- PR #272 rendered the exact proposed-change review binding in the development Guided Prepare panel while preserving publishable-release stripping, and guarded squash-merged as `f06858ce384ce7d01510813b34b0ff803912e944`; exact head `e59058a7de174b18d8377d8052610efc9a12b4c2` passed CI #1019, P12 Final Release Artifact #330 and P12 Offline Acceptance #374.
- PR #279 introduced `p13-core-v2` and analyzer-bound Build-Ready run identity across report generation, persisted runtime evidence, P13→P14 handoff and plugin/CLI parity. Corrected exact head `b590d0c1652d153525f6fd1a6c8db95dba7e9d54` passed CI #1026, P12 Final Release Artifact #337 and P12 Offline Acceptance #381 before guarded squash merge `31c2ddcee932592a9f7357b1bba07c4009cac684`. Integration Readiness did not trigger for this code-only diff.
- PR #281 preserved persisted-evidence inspection status/reasons (`VALID`, `EMPTY`, `INVALID`, `READ_FAILED`, `QUARANTINED`) and surfaced exact fresh-Audit diagnostics in the development P13 viewer and P14 preview. Exact head `e201f43a7b11355daa2b73c957f82ce397bb6003` passed CI #1028, P12 Final Release Artifact #339 and P12 Offline Acceptance #383 before guarded squash merge `801075561f22a1738219e58e9f39096705dc80ac`. Integration Readiness did not trigger for this code-only diff.
- PR #283 synchronized the canonical P13/P14 status docs through PR #281 and guarded squash-merged as `54fad8332e9ef4d41c5ccd2c5ccda4fb10247c5c`; exact head passed CI #1030, Integration Readiness #349, P12 Final Release Artifact #341 and P12 Offline Acceptance #385.
- PR #286 hardened dependency/workflow supply-chain controls with a committed lockfile, `npm ci`, immutable first-party action SHAs, Dependabot and secret-file ignore coverage, then guarded squash-merged as `245a045fcbc30bd2ec81edb06dba65119e358a50`. Exact head passed CI #1048, Integration Readiness #362, P12 Final Release Artifact #359 and P12 Offline Acceptance #403; a one-time locked `npm audit --audit-level=high` reported 0 vulnerabilities.
- PR #293 hardened the P3 UI pixel-broker boundary so malformed/tampered metrics and oversized broker images fail closed, then guarded squash-merged as `47dbc078b0a41cbbe5301d6e0d95d5ca33cc8721`. Exact head passed CI #1054, P12 Final Release Artifact #365 and P12 Offline Acceptance #409; Integration Readiness did not trigger for this code-only diff.
- PR #294 aligned the operator-facing P13 offline parity intake with `p13-core-v2` analyzer-bound run identity and guarded squash-merged as `9955be0561807550a7ad1444d8d013d783820188`. Exact head `68189da1fba9b42610cc932e1193851c8c7e9636` passed CI #1056, P12 Final Release Artifact #367 and P12 Offline Acceptance #411; Integration Readiness did not trigger for this code-only diff.
- Issue #295 regenerated the current traceable, non-publishable P13 development runtime artifact from source `9955be0561807550a7ad1444d8d013d783820188`: Actions run `34833881774`, artifact `p13-runtime-evidence-9955be056180-analyzer-v2`, ID `10343017256`, digest `sha256:b3e5a07a5a012f9c1f4deec32389ad83a0e8550580f60de408db14644de5f1fe`. The artifact does not grant runtime acceptance; #159 remains open for genuine Figma Desktop evidence.
- PR #298 synchronized the canonical P13/P14 docs after security/parity work and guarded squash-merged as `127c7215a15a36a2aabc62da79a02708903f4cb9`.
- PR #300 added a deterministic development-only P14 runtime review packet bound to exact plugin/build provenance, persisted evidence, full Figma context and analyzer-bound P13 identity while keeping all four authority flags false; guarded squash merge `3a1f2f96617304aa4251aa4f3e4e112bce13612a`.
- PR #302 disabled persisted checkout credentials in all four permanent trusted workflows and enforced the security contract; Integration Readiness proved canonical public refs remain fetchable without persisted credentials; guarded squash merge `5295a40839b093a77b3c6d2dc98daa6ac63d5067`.
- PR #304 established the documented Elementor v0.4/container template contract and bounded offline validator; guarded squash merge `4c6e0f63718a6b38b056c82207e25973356d0d66`.
- PR #306 added the read-only Elementor capability registry/report for directly documented classic widget IDs `heading`, `image`, and `button`; guarded squash merge `c242197a2d0a0dd24d7364db5f10c1fb6fa76e13`.
- PR #308 added the deterministic non-authorizing Elementor candidate artifact envelope. Import validation remains `NOT_RUN`, download remains disabled, and target-compatibility/production-acceptance claims remain false; guarded squash merge `426314b183f220f66a315a24f9b1122a464909b9`.
- PR #310 synchronized the canonical P14/P15 status docs through the first Elementor foundation slices; guarded squash merge `3e3254b1c77d78fe7eff2f9278b6a6c6def1c5a9`.
- PR #312 added exact canonical candidate SHA-256 identity and a fail-closed non-authorizing future import-validation receipt contract; guarded squash merge `a5b87cad3df803de32ff359d8d0e84796b5d8482`.
- PR #314 added offline operator intake for externally captured exact-bound Elementor import evidence; guarded squash merge `5992fe947a0a2f73d388d0239fde23a53435f046`.
- PR #316 added an immutable declared Elementor target profile and SHA-256 profile fingerprint while keeping target observation/compatibility/generation/download authority false; guarded squash merge `da29e5c95a76dc6eb25ad8026a7fa1bba156423e`.
- PR #318 bound validated exact-candidate import evidence to the immutable declared target-profile fingerprint without changing receipt-v1 authority; guarded squash merge `fb7a9f210f5088b645e4bf046cd4b1f09e3aa72b`.
- PR #320 added read-only target-profile/candidate metadata alignment assessment. `PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING` is not a compatibility claim and reference/target validation remains `NOT_RUN`; guarded squash merge `44a9e0851b3e7a4235e8854066ef09cc399fb78b`.
- PR #322 added a non-authorizing global-reference key review gate. It emits no raw `__globals__` values, requires external closure when keys exist, and keeps asset-reference review `NOT_RUN`; guarded squash merge `d603ce87a645160204d2de6fd458279ba7b3bf3f`.
- PR #324 synchronized the canonical P15 R1 status docs through the global-reference review batch; guarded squash merge `94bc8635b68c5781353d3bcb89388e4b630c69c5`.
- PR #326 added the first documented asset-reference review gate, whitelisting only the exact core `image` widget `settings.image` MEDIA control from pinned upstream Elementor source. Raw asset URLs are not emitted; guarded squash merge `cde7ea30ad64e2fc6d308de29779f1a49068d543`.
- PR #328 bound the exact current global + documented asset review state into one deterministic SHA-256 reference-review identity while keeping closure/compatibility authority false; guarded squash merge `5b95d5e3e96d7051e4c74930b6df7eb16038707f`.
- PR #330 added an exact-bound external reference-closure PASS/FAIL evidence receipt contract. Receipt intake rejects BLOCKED/REVIEW/no-reference identities, and even reported PASS remains non-authorizing; guarded squash merge `d0796310fb3b6d4f1753d472e0e9f9783bb752b3`.

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
| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Exact candidate/profile/import evidence + bounded global/core-image asset review + combined reference identity + external closure-evidence receipt contract are merged; actual external closure evidence/internal decision, real target import, Figma semantic generation and product download remain unaccepted/unwired |
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

**Overall progress is intentionally not collapsed into one synthetic percentage.** Historical P0-P7 core remains 100%; P12 remains 80%; P13 implementation is complete with real-plugin runtime acceptance pending; P14 core/read-only review implementation is active while confirmation and retained-duplicate mutation authority remain unwired; P15 core foundation is in progress with target import still unvalidated; P16-P26 implementation is not started; P27 release execution is not started.

R0/R1 gate definitions remain complete but are re-executed where applicable. Implementation completion, real-runtime acceptance and production release are separate evidence states; one does not imply another.

## Current P13 provenance boundary

P13 current analyzer semantic version is `p13-core-v2`. Build-Ready `runId` now binds exact source `structuralHash`, `configHash` and `analyzerVersion`; the same identity contract is used for normal and insufficient-evidence reports.

Persisted P13 evidence rejects stale/unsupported analyzer versions and contradictory run IDs. P13→P14 handoff also requires this current analyzer-bound identity, and plugin/CLI parity includes analyzer version in `sameRunIdentity`. `generatedAt` is intentionally non-semantic runtime metadata.

Persisted evidence inspection distinguishes `VALID`, `EMPTY`, `INVALID`, `READ_FAILED` and `QUARANTINED`. Rejection/read/quarantine reasons are bounded. The development P13 evidence viewer and P14 Guided Prepare preview surface those reasons and require a fresh Audit rather than silently treating rejected evidence as current.

The operator-facing offline parity intake now independently enforces `p13-core-v2`, requires the analyzer-bound `runId`, includes analyzer version in exact run identity and emits explicit per-side run-identity evidence while keeping `generatedAt` non-semantic. Stale analyzer evidence and forged run IDs fail before a parity receipt is written.

The current traceable development artifact for the next genuine #159 attempt is `p13-runtime-evidence-9955be056180-analyzer-v2` (artifact ID `10343017256`, source `9955be0561807550a7ad1444d8d013d783820188`). It is explicitly non-authorizing and do-not-publish.

## Current P14 boundary

P14 Guided Prepare remains development-only and read-only. Before rendering, it requires exact current file/page/frame identity, stable selection during evidence load, a fresh matching Build-Ready source/run/config/analyzer fingerprint, and exact current plugin/build identity.

The versioned proposed-change review artifact binds human review to the exact P13 run, source fingerprint, P14 plan digest and canonical eligible action IDs. In normal production configuration the registry is empty, so the real vertical-stack candidate remains review-only and the manifest contains no production-authorized eligible action binding.

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

The exact candidate is pinned in `config/p12-publisher-candidate.json`. `npm run p12:publisher-evidence` verifies exact ZIP/extracted-plugin hashes, hashes runtime/publish/2FA screenshots, requires explicit operator confirmations, and emits a receipt with `acceptanceAuthority: false`.

The currently retained screenshot set is **not sufficient** for exit. Fresh exact-#20 runtime, valid Publish final-details and 2FA screenshots remain required. Later P13/P14 development commits do not silently replace this historical P12 publishing candidate or count as live publisher acceptance. Actual Community review/approval remains external.

## R0 / R1 target-adapter gates

Before major external target-adapter implementation, refresh R0 if platform facts materially changed and execute R1 for the exact adapter/profile. R1 must retain immutable target profiles, capability-driven options, stale-result invalidation, strict job state, structured errors, atomic output, schema/package/assets validation and real import/build/render harnesses where applicable.

A package can be `ARTIFACT VALIDATED` without being `IMPORT VERIFIED`. We do not claim an unobserved target will import successfully merely because local JSON/ZIP validation passed.

## Planned target order

1. finish the current P14 target-neutral preparation/read-only review foundation without silently granting production authority;
2. complete #159 real-plugin P13 runtime/parity acceptance when genuine Figma evidence is available;
3. refresh R0/R1 for the target when needed;
4. implement P15 Elementor;
5. implement P16 Gutenberg;
6. continue P17-P26 in retained dependency order;
7. execute P27 #182 only after implementation/internal readiness is ready;
8. during P27, capture remaining exact release runtime/publisher/2FA evidence and perform the genuine #84 release-exit decision.

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
