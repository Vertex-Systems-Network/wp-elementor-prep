# WP Builders Prepare

Deterministic Figma audit, safe-prep and target-readiness tooling for WordPress builders and web-code workflows.

The core product prepares approved designs **without visually redesigning them**, without requiring generative AI for correctness, and without network access in the current core plugin.

Current product surfaces:

- normal Figma plugin;
- npm/Node CLI;
- deterministic audit/backlog/Build-Ready outputs;
- safety-gated P5/P6/P7 preparation foundations;
- P13 Build-Ready Score 2.0 + Responsive Risk with analyzer-bound provenance;
- development-only read-only P14 Guided Prepare preview, proposed-change review binding and persisted-evidence diagnostics;
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
- `#282` — docs-only synchronization of canonical P13/P14 status through verified PR #281.

Current verified main before #282 docs synchronization is:

`801075561f22a1738219e58e9f39096705dc80ac`

### Recent verified P13/P14 sequence

- PR #269 added a versioned snapshot-first non-authorizing proposed-change review manifest and guarded squash-merged as `6514959cbfd9a71c241b204f371a330a6be462e2`; exact head `234eda81ab5c49c3325c7fd9231d3d66841c0013` passed CI #1014, P12 Final Release Artifact #325 and P12 Offline Acceptance #369.
- PR #270 added the first real zero-penalty P13 `BR_SAFE_VERTICAL_STACK_CANDIDATE`, derived only from the accepted P2/P5 planner pipeline, and guarded squash-merged as `a70b003bd533cbf42d1aaaabf722639852ba48db`; corrected exact head `5d739cde842cefe6ff640aeba74da4900eddb831` passed CI #1017, P12 Final Release Artifact #328 and P12 Offline Acceptance #372.
- PR #272 rendered the exact proposed-change review binding in the development Guided Prepare panel while preserving publishable-release stripping, and guarded squash-merged as `f06858ce384ce7d01510813b34b0ff803912e944`; exact head `e59058a7de174b18d8377d8052610efc9a12b4c2` passed CI #1019, P12 Final Release Artifact #330 and P12 Offline Acceptance #374.
- PR #279 introduced `p13-core-v2` and analyzer-bound Build-Ready run identity across report generation, persisted runtime evidence, P13→P14 handoff and plugin/CLI parity. Corrected exact head `b590d0c1652d153525f6fd1a6c8db95dba7e9d54` passed CI #1026, P12 Final Release Artifact #337 and P12 Offline Acceptance #381 before guarded squash merge `31c2ddcee932592a9f7357b1bba07c4009cac684`. Integration Readiness did not trigger for this code-only diff.
- PR #281 preserved persisted-evidence inspection status/reasons (`VALID`, `EMPTY`, `INVALID`, `READ_FAILED`, `QUARANTINED`) and surfaced exact fresh-Audit diagnostics in the development P13 viewer and P14 preview. Exact head `e201f43a7b11355daa2b73c957f82ce397bb6003` passed CI #1028, P12 Final Release Artifact #339 and P12 Offline Acceptance #383 before guarded squash merge `801075561f22a1738219e58e9f39096705dc80ac`. Integration Readiness did not trigger for this code-only diff.

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
| P14 Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | `──────────` | Complete #282 status sync; read-only preview requires current analyzer/fresh evidence and shows rejection diagnostics; real candidate remains REVIEW/BLOCKED because production registry remains empty; retained-duplicate mutation runtime is unwired; #159 required before real Figma mutation exposure |
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

## Current P13 provenance boundary

P13 current analyzer semantic version is `p13-core-v2`. Build-Ready `runId` now binds exact source `structuralHash`, `configHash` and `analyzerVersion`; the same identity contract is used for normal and insufficient-evidence reports.

Persisted P13 evidence rejects stale/unsupported analyzer versions and contradictory run IDs. P13→P14 handoff also requires this current analyzer-bound identity, and plugin/CLI parity includes analyzer version in `sameRunIdentity`. `generatedAt` is intentionally non-semantic runtime metadata.

Persisted evidence inspection distinguishes `VALID`, `EMPTY`, `INVALID`, `READ_FAILED` and `QUARANTINED`. Rejection/read/quarantine reasons are bounded. The development P13 evidence viewer and P14 Guided Prepare preview surface those reasons and require a fresh Audit rather than silently treating rejected evidence as current.

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

Automated checks are evidence only for the properties they exercise. Target phases add capability-matrix, option-state, package/schema, malformed-input, import/build/render and round-trip harness checks.

## Runtime artifact registry

Machine-readable operational registry: `config/runtime-artifacts.json` schema v3.
