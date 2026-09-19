# Roadmap

Last updated: 2026-09-19

| Module / Phase | Scope | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---|---:|---|---|
| AI-native governance/tooling | Memory-bank, issue/PR-first lifecycle, R0 research, R1 reliability, CI/provenance | REPO-SIDE DETECTION COMPLETE / ADMIN ENFORCEMENT IN PROGRESS | N/A | `──────────` | Release-train cadence active; #287 admin branch/ruleset enforcement still required |
| P0 | Specification, architecture, repository foundation | COMPLETE | 100% | `██████████` | None |
| P1 | Audit-only scanner/discovery/scoring | COMPLETE | 100% | `██████████` | None |
| P2 | Deterministic classifier semantics + evidence | COMPLETE | 100% | `██████████` | None |
| P3 | Integrity + rendered-pixel validation | COMPLETE | 100% | `██████████` | None |
| P4 | Candidate transaction + rollback | COMPLETE | 100% | `██████████` | None |
| P5 | Conservative Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained runtime closure |
| P6 | Advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained positive/refusal closure |
| P7 | Sequential batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained stress/cancellation closure |
| P8 | Historical optional Elementor exporter placeholder | DEFERRED / SUPERSEDED BY P15+ | N/A | `──────────` | Use new neutral target-adapter roadmap |
| P9 | Actionable backlog generator | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real plugin export quality retained |
| P10 | npm/Node CLI + source adapters | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real REST/auth/plugin parity retained |
| P11 | Normal Figma plugin distribution | IMPLEMENTATION COMPLETE | 100% | `██████████` | Live publisher/install evidence remains in P12 |
| P12 | Final integrated validation/release acceptance | IN PROGRESS | 80% | `████████░░` | Finish exact publish-ID package/account/2FA/exit review in #84 |
| R0 | Market/platform research gate | DEFINED / RECURRING | 100% | `██████████` | Refresh before major externally evolving adapters |
| R1 | Reliability/compatibility gate | DEFINED / RECURRING | 100% | `██████████` | Execute TargetProfile/capability/validator/harness gate per adapter |
| P13 | Build-Ready Score 2.0 + Responsive Risk | IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING | 100% impl | `██████████` | #159 real-plugin parity/internal runtime acceptance |
| P14 | Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | `──────────` | Read-only review active; production registry empty; #159 before real mutation exposure |
| P15 | Elementor native export + import validation | CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED | N/A | `──────────` | Exact proof/profile/candidate binding retained; #552 image, #554 semantic, #556 direction, #558 linked-px gap and #560 flex alignment slices exist; broader responsive + real asset/reference closure remain pending |
| P16 | Gutenberg native export + section transfer | CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED | N/A | `──────────` | Deterministic evidence/retention/operator foundation exists; genuine authenticated evidence and native target/editor/import/render validation remain unwired |
| P17 | HTML/CSS/JS export + code-to-design import | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | R0+R1, static-first; JS sandbox spec required |
| P18 | Framework adapter platform | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | R0+R1, neutral component IR + adapter SDK + build matrix |
| P19 | Asset pack + font manifest + design-system export | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Stored-original vs rendered policy; font/API constraints |
| P20 | Round-trip visual QA + exact section portability | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Target render harness + optional offline-first WP Builders Bridge |
| P21 | Developer handoff + client/QA + bounded a11y/SEO advisories | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Build from accepted target outputs |
| P22 | Deterministic complexity/effort estimator | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Transparent/configurable factors only |
| P23 | Agency/project + existing-component bindings | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Stable adapters/report contracts first |
| P24 | CMS/dynamic data/forms/interactions | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Static/native export stability first |
| P25 | Free / Pro / Agency packaging + entitlements | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Keep account/payment outside deterministic core |
| P26 | Optional AI assistance | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Opt-in research/explainer/drafting only |
| P27 | Final production release + publisher/runtime evidence | GATE DEFINED / EXECUTION DEFERRED | 0% exec | `░░░░░░░░░░` | Final live evidence + retained #84 release-exit decision after implementation/internal readiness |

## Progress interpretation

**Historical core P0-P7:** `██████████ 100%`.

**P12 final validation:** `████████░░ 80%`.

Overall project progress is intentionally not collapsed into one synthetic percentage. Implementation, runtime acceptance and external approval are separate evidence states.

R0/R1 are recurring governance/acceptance gates. P13 implementation is complete but runtime acceptance remains open. P14 is active with no stable numeric denominator and no production mutation authority. P15 has one retained controlled target proof but no broad compatibility/production authority; P16 remains target-validation unwired. Both remain `N/A` progress. P17-P26 remain preflight frozen/not started. P27 execution remains deferred.

## Current P15 implementation truth

P15 is **CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED**.

Bounded code-side surfaces now include:

- target-neutral export IR and deterministic local Elementor v0.4 Container/Widget Template JSON generation;
- read-only selected-Figma-Frame extraction, compatibility/mapping-readiness states and fail-closed REVIEW handling;
- explicit fresh local Template JSON download with immediate local candidate revalidation and sanitized receipt;
- bounded deterministic opaque single-solid container background and uniform pixel radius extraction/serialization;
- versioned `elementor-target-proof-evidence-v1` with exact candidate identity + TargetProfile fingerprint binding, observed import/editor/render/fidelity steps and proof classifications `BOUND_FULL_PASS`, `BOUND_PARTIAL`, `BOUND_FAIL`, `REJECTED`;
- sanitized `p15:elementor-target-proof-intake` with candidate/profile/proof SHA-256 fingerprints;
- versioned `elementor-target-environment-evidence-v1` and policy `elementor-target-environment-policy-2026-09-16-v1` for observed WordPress/Elementor/PHP/database/memory/browser facts;
- environment classifications `QUALIFIED_FOR_BOUND_TARGET_PROOF`, `REVIEW_REQUIRED`, `NOT_QUALIFIED`, `REJECTED` with conservative minimums and clean-Core review boundaries;
- sanitized `p15:elementor-target-environment-intake` with environment SHA-256 and explicit no-import/no-editor/no-render authority;
- `elementor-target-proof-chain-v1` combined candidate/profile/environment/proof validation so qualified environment packets cannot be substituted across retained runs merely because WordPress/Elementor versions match;
- exact environment/proof runtime-version equality, retained evidence-reference equality and chronology checks;
- combined classifications `CHAIN_FULL_PASS`, `CHAIN_PARTIAL`, `CHAIN_FAIL`, `CHAIN_BLOCKED`, `REJECTED`;
- sanitized `p15:elementor-target-proof-chain-intake` with candidate/profile/environment/proof SHA-256 fingerprints and no candidate/template content leakage.

The explicit download surface is **local artifact transfer only**. Style mappings are local deterministic fidelity only. Environment qualification and combined chain validation are evidence-integrity gates only. Target-proof intake validates externally supplied observations only. None of these alone is target compatibility, import authority or production acceptance.

On a successful fresh local-download result only, `fileDownload=true` is allowed and the UI says **LOCAL ARTIFACT VALIDATED / TARGET IMPORT NOT VERIFIED**.

These facts stay authoritative:

- `acceptanceAuthority=false` for environment qualification, target-proof intake and proof-chain intake;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `internalReviewRequired=true` for external environment/proof evidence;
- local generation/download keeps `importValidationStatus=NOT_RUN`, `targetEnvironmentValidationStatus=NOT_RUN`, `environmentObserved=false`;
- no target observation is synthesized by CI/repository code;
- no WordPress/Elementor network connection from the Figma core;
- no automated import/editor/render execution claim;
- no Atomic-v4 acceptance from the Container proof path;
- no clipboard/section transfer;
- no Figma mutation.

Even `CHAIN_FULL_PASS` requires genuine retained real-environment observations and separate internal review before stronger P15 authority can be considered.

Typography, gradients, opacity/effects and nonuniform-radius conversion remain outside the accepted fidelity slice. #556 adds explicit source/candidate-bound default tablet/mobile direction, #558 adds linked-px gap, and #560 adds flex align/justify overrides; broader responsive behavior remains outside accepted closure.

PR #518 / #483 retained that first bounded observation on exact WordPress `6.8` + Elementor `4.2.4`: import/editor/render PASS, bounded structure/background/radius fidelity PASS and qualified/full/full environment/proof/chain classifications. PR #546 / #545 machine-readably bound the exact TargetProfile fingerprint to that reference; PR #548 / #547 binds the current canonical candidate to the exact candidate identity observed in #483. PR #552 / #551 resolves exact Figma image-review nodes into URL-only neutral image references only when a manifest is bound to the exact source IR; downstream asset closure remains unverified. PR #554 / #553 adds a shared neutral-IR identity plus explicit source-bound Heading/Button semantic promotion with no heuristic inference. PR #556 / #555 adds exact source/candidate-bound tablet/mobile container-direction keys verified against Elementor `4.2.4`, PR #558 / #557 adds exact linked-px tablet/mobile `flex_gap` GAPS objects while preserving desktop gap, and PR #560 / #559 adds exact tablet/mobile `flex_align_items` / `flex_justify_content` overrides while preserving desktop alignment. None grants a responsive-closure claim. A candidate/reference mismatch remains only a reference mismatch, not incompatibility. Broader responsive mapping, real reference/asset closure and any additional claimed target matrix coverage still require their own implementation and evidence.

## Current P16 implementation truth

P16 is **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**.

The deterministic foundation includes normalized candidate/native-validation evidence contracts, immutable declared target profiles, exact candidate identity, offline receipt/evidence intake, sanitized review/decision prerequisites, genuine-evidence retention requirements, offline operator export/validation and hardened bounded local JSON I/O/output handling. Genuine authenticated evidence and real native target/editor/import/render validation are still required before stronger authority.

## R0 / R1 recurring gates

R0 refreshes official platform/market/privacy/licensing evidence before major externally evolving adapters. R1 freezes immutable profiles/capabilities, error/staleness/atomicity/validation/evidence contracts and real target harness expectations. Research or local validation never grants runtime acceptance.

## Current P12 truth

The publishing-authoritative P12 candidate remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5` with Figma-assigned plugin ID `1680034649341961379`. P12 remains at 80% until retained live package/publisher/account/2FA/final-exit evidence and internal review are complete. Community approval remains external.

## Runtime artifact registry

The artifact is registered in `config/runtime-artifacts.json` schema v3 as the machine-readable operational provenance authority for retained exact-build runtime artifacts.

## Execution policy

1. Issues first.
2. PR/MR second.
3. R0 refresh when required by an externally evolving target.
4. R1 compatibility/reliability contract freeze.
5. Highest-priority unblocked roadmap obligation.
6. One focused release train per acceptance objective.
7. Focused checks during iteration; full exact-head CI/release/offline gates at merge.
8. Canonical memory/README truth synchronized only when behavior/status/authority actually changes.
9. No synthetic runtime/external evidence or synthetic overall project percentage.
10. Implementation-complete and production-accepted remain separate.
