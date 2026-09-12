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

PR #122 merged the market-researched multi-target planning baseline as `ade501fedb8c810b4964eb3dda414c58450e8565` after CI #721, Integration Readiness #156, P12 Offline Acceptance #76 and P12 Final Release Artifact #32 passed. PR #123 synchronized post-plan status and merged as `d34c026202ae6ecd8f88f71e6056d619578ce56f`. PR #124 added the R1 reliability/compatibility audit and merged as `4d38c46c359bd030bf36100f4424760b1380db81`. PR #129 added deterministic final publisher-evidence intake tooling and squash-merged as `cc466367fa0c6fee119d4fb183371af5fb3f04c7`. PR #131 retained the current commercial R0 market refresh and merged as `a22b3121f1d00698ee9d4e4bf283f3bf2bfa9119`. PR #193 completed P14 receipt-envelope/runtime-diagnostic hardening and squash-merged as `e54cb44c3dabe6cd2a459f70df917b9422fadddd`. PR #196 completed runtime clock/event-timestamp evidence hardening and squash-merged as `8021874323f5bad6ebf648b0891bc9f6358dd1bf` after exact head `47cb0b4d2d3c53f7f818af760131cc78737cb5c4` passed CI #854, Integration Readiness #224, P12 Final Release Artifact #165 and P12 Offline Acceptance #209 on Ubuntu/macOS/Windows; issue #195 closed completed.

The retained P13-P26 planning/preflight sequence remains the implementation contract. P13 Build-Ready Score/Responsive Risk implementation is complete while real-plugin runtime/parity acceptance remains open in #159. P14 target-neutral retained-duplicate preparation remains under active pure-core hardening with production recipe authority and real Figma mutation exposure intentionally unwired. The merged #192/#193 and #195/#196 slices now bound receipt envelope/diagnostic evidence and runtime clock/timestamp evidence without changing P14 authority. P15-P26 remain preflight-frozen and implementation-not-started. Production acceptance/release remains a separate P27/#182 decision and #84 retains the P12 release-exit truth.

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
| P14 Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | `──────────` | Continue next focused pure-core fail-closed audit after #195; production registry remains empty; #159 required before real Figma mutation exposure |
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

**Overall progress is intentionally not collapsed into one synthetic percentage.** Historical P0-P7 core remains 100%; P12 remains 80%; P13 implementation is complete with runtime acceptance pending; P14 core implementation is active and runtime-unwired; P15-P26 implementation is not started; P27 release execution is not started.

R0/R1 gate definitions remain complete but are re-executed where applicable. Implementation completion, real-runtime acceptance and production release are separate evidence states; one does not imply another.

## Current P12 publishing line

The retained publishing candidate under manual evaluation was produced from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, Figma-assigned publishing ID `1680034649341961379`. The exact candidate remains pinned in `config/p12-publisher-candidate.json`; planning/core-hardening commits do not replace that live publishing candidate or count as P12 live acceptance.

The currently available screenshot set remains insufficient for exit; fresh exact-#20 runtime, valid final-details and 2FA evidence is still required during the P27 release sequence. Actual Community review/approval remains external.

## R0 — AI-native market/platform research

Before major new target-adapter implementation, research must refresh official target docs, competitor capability baseline, product gaps, format/API stability and network/privacy/licensing risks. Research remains planning input only and does not count as runtime acceptance.

## R1 — reliability and compatibility gate

Every major adapter must define an immutable versioned target profile, capability descriptor, stale-result invalidation, strict job state machine, structured errors, atomic generation, artifact validators, real import/build/render harness where applicable, and evidence-scoped readiness labels.

A package can be `ARTIFACT VALIDATED` without being `IMPORT VERIFIED`. We do not claim an unobserved WordPress server will import successfully merely because local JSON/ZIP validation passed.

## Current execution order

1. continue the next focused P14 pure-core implementation/hardening slice while real Figma mutation remains unwired;
2. complete P13 #159 real-plugin runtime/parity acceptance when genuine real-Figma evidence is available; #159 is required before P14 real mutation exposure, not before pure-core development;
3. refresh R0 before each major external adapter if platform facts materially changed;
4. execute R1 before implementing/accepting each major adapter;
5. implement P15-P26 in dependency order, preserving the distinction between implementation, internal readiness and production acceptance;
6. use P27 #182 as the final production-release sequence only after the implementation/internal-readiness program is ready;
7. during P27, capture remaining exact release runtime, Publish final-details and 2FA evidence and perform the genuine #84 release-exit decision;
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

Automated checks are evidence only for the properties they exercise.

## Runtime artifact registry

Machine-readable operational registry: `config/runtime-artifacts.json` schema v3.
