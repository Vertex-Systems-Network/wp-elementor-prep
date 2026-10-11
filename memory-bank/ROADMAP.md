# Roadmap

Last updated: 2026-09-27

## Product Recovery Program overlay (2026-10-08, D-047)

The phase table below is unchanged. Execution order now follows [`docs/PRODUCT_RECOVERY_PLAN.md`](../docs/PRODUCT_RECOVERY_PLAN.md):

| Milestone | Primary phases served | Status |
|---|---|---|
| M0 Critical correctness fixes | P5, P11/P12 release build, P13, P14, P15 | ACCEPTED — PR #895 merged `f18240e` |
| M1 Table-driven Elementor mapping engine | P15 | ACCEPTED — PR #900 merged `47ada79` |
| M2 Full single-frame extraction | P15 (and P17/P18 IR feed) | ACCEPTED — PRs #905, #906, #907 merged `850c517`; golden landing page with zero silent drops |
| M3 Assets | P15, P19 | ACCEPTED — PRs #908, #909, #910 merged `a4ee8dd`; images and SVG load in the real-target render |
| M4 Responsive breakpoint engine | P13, P15 | ACTIVE — M4.1–M4.2 and M4.3a–b done (breakpoint set, matcher, layout, presence and order merge), next M4.3c |
| M5 Smart duplicate + structure alignment | P5, P6, P14 | QUEUED |
| M6 Version-driven target profiles + v4 Atomic | R0/R1, P15 | QUEUED |
| M7 Round-trip visual proof | P15, P20 | QUEUED |
| M8 Gutenberg native export | P16 | QUEUED |
| M9+ Remaining roadmap | P17–P27 | QUEUED |


| Module / Phase | Scope | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---|---:|---|---|
| AI-native governance/tooling | Memory-bank, issue/PR-first lifecycle, R0 research, R1 reliability, CI/provenance | REPO-SIDE DETECTION COMPLETE / ADMIN ENFORCEMENT IN PROGRESS | N/A | `──────────` | Release-train cadence active; #287 admin branch/ruleset enforcement still required |
| Runner benchmark / final-batch execution | Canonical Runner queue, blocking-vs-deferred classification, consolidated exact-head Runner batch | DEFINED / ACTIVE | N/A | `──────────` | Add every discovered Runner task to `docs/RUNNER_BENCHMARK.md`; execute non-blocking items together at final integration |
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
| P15 | Elementor native export + import validation | CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED | N/A | `──────────` | Exact proof/profile/candidate binding retained; bounded responsive mapping includes direction, linked-px and split-axis px gaps (#821), flex alignment, px padding, #576 explicit wrap and #578 wrap-conditioned align-content; #564–#574 managed-media evidence/decision contract remains bounded; no retained operator approval is supplied, and arbitrary-host/general media portability plus broader responsive/matrix coverage remain pending |
| P16 | Gutenberg native export + section transfer | CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED | N/A | `──────────` | Deterministic evidence/retention/operator foundation exists; genuine authenticated evidence and native target/editor/import/render validation remain unwired |
| P17 | HTML/CSS/JS export + code-to-design import | FOUNDATION IMPLEMENTATION IN PROGRESS / CONTROLLED LOCAL BROWSER PROOF | N/A | `──────────` | Static neutral IR/export/package gate + exact local Chrome render proof; visual fidelity, JS, reconstruction and production authority remain separate |
| P18 | Framework adapter platform | PREFLIGHT OPEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | #846 opens R0+R1 evidence review, then bounded adapter SDK and first framework build/render proof |
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

R0/R1 are recurring governance/acceptance gates. P13 implementation is complete but runtime acceptance remains open. P14 is active with no stable numeric denominator and no production mutation authority. P15 has one retained controlled target proof but no broad compatibility/production authority; P16 remains target-validation unwired. Both remain `N/A` progress. P17 foundation implementation is active with a bounded controlled local browser proof and no visual-fidelity/reconstruction/production authority. P18 preflight is open under #846, with implementation not started. P19-P26 remain preflight frozen/not started. P27 execution remains deferred.

## Current P15 implementation truth

P15 is **CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED**. PR #774 merged the bounded Button tablet/mobile border-width extension after 7/7 exact-head gates. Issue #775 / PR #776 merged Container normal border type/color plus explicit desktop/tablet/mobile widths after 7/7 exact-head gates as main `ebbe9ee8...`. Issue #777 / PR #778 merged isolated Container hover border and responsive widths after 7/7 exact-head gates as main `21848e94...`. Issue #779 / PR #780 merged Container classic hover background color after 7/7 exact-head gates as main `cbec0be0...`. Issue #781 / PR #782 merged Container normal/hover classic overlay colors after 7/7 exact-head gates as main `5eb93905...`. Issue #783 / PR #784 merged explicit responsive overlay opacity after 7/7 exact-head gates as main `d7c5cc87...`. Issue #785 / PR #787 merged bounded four-family Container composition after 7/7 exact-head gates as main `965bb48e...`. Issue #788 / PR #789 merged Container normal/hover box shadows after 7/7 exact-head gates as main `228b68a1...`. Issue #790 / PR #791 merged six-family Container composition after 7/7 exact-head gates as main `d24ed13b...`. Issue #792 / PR #793 merged explicit responsive normal/hover radii after 7/7 exact-head gates as main `e6de603b...`. Issue #794 / PR #795 composed five bounded Button color families; exact-head gates passed and it merged as main `b8ed7584edc8052947f801046166291f5980c56c`. Neither expands the accepted target proof. Subsequent P15 work completed Container gradients (#796/#797), hover transitions (#800/#801), radial gradients (#804/#805), and overlay blend/filter composition (#808/#809), all with exact-head seven-gate evidence. The latest P15 handoff must be re-derived from the live capability map; the previous state referenced stale work.

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

Typography, gradients, opacity/effects and nonuniform-radius conversion remain outside the accepted fidelity slice. #556 adds explicit source/candidate-bound default tablet/mobile direction, #558 linked-px gap, #560 flex align/justify, #562 px-padding, #576 exact `nowrap`/`wrap` overrides, and #578 exact same-breakpoint wrap-conditioned `align_content`; broader responsive behavior remains outside accepted closure.

PR #518 / #483 retained that first bounded observation on exact WordPress `6.8` + Elementor `4.2.4`: import/editor/render PASS, bounded structure/background/radius fidelity PASS and qualified/full/full environment/proof/chain classifications. PR #546 / #545 machine-readably bound the exact TargetProfile fingerprint to that reference; PR #548 / #547 binds the current canonical candidate to the exact candidate identity observed in #483. PR #552 / #551 resolves exact Figma image-review nodes into URL-only neutral image references only when a manifest is bound to the exact source IR; downstream asset closure remains unverified. PR #554 / #553 adds a shared neutral-IR identity plus explicit source-bound Heading/Button semantic promotion with no heuristic inference. PR #556 / #555 adds exact source/candidate-bound tablet/mobile container-direction keys verified against Elementor `4.2.4`, PR #558 / #557 adds exact linked-px tablet/mobile `flex_gap` GAPS objects while preserving desktop gap, PR #560 / #559 adds exact tablet/mobile `flex_align_items` / `flex_justify_content` overrides while preserving desktop alignment, PR #562 / #561 adds exact px `padding_tablet` / `padding_mobile` DIMENSIONS objects while preserving desktop padding, PR #576 / #575 adds exact `flex_wrap_tablet` / `flex_wrap_mobile` overrides for explicit `nowrap` / `wrap` only while preserving desktop wrap and omitted breakpoints, and PR #578 / #577 writes `container_align_content_tablet` / `container_align_content_mobile` only when the exact same wrapped candidate proves explicit `wrap` at that breakpoint. None grants a responsive-closure claim. PR #564 / #563 adds one separate production-generated URL-only Image vector whose real controlled WP `6.8` + Elementor `4.2.4` observation requires exact reference-review binding, target-managed attachment source provenance, rendered URL binding to the rewritten MEDIA URL and actual browser image load; even full pass keeps `assetReferenceClosureClaim=false`. PR #566 / #565 consumes only exact full-pass asset evidence for an asset-only reference identity and emits sanitized `OBSERVED_ASSET_EVIDENCE_BOUND` evidence with `OBSERVED_PROOF_VALIDATED`, but performs no internal closure decision and grants no authentication/closure authority. PR #568 / #567 separately requires the source digest to equal canonical controlled PNG SHA-256 `sha256:65cbaae5caf987301a644dbad6b783476a2e39b2980425a0c57a6505a1c7e5a8` and the imported WordPress attachment original-file digest to equal that same value, plus `image/png` and positive dimensions, for `TARGET_MANAGED_CONTENT_INTEGRITY_PASS`; wrong-but-equal non-canonical digests reject, `referenceClosureClaim=false`, and attachment-ID portability/general media closure remain unclaimed. PR #570 / #569 then recomputes/binds the #566 observed-evidence and #568 integrity paths into `READY_FOR_INTERNAL_REVIEW` while keeping `internalDecisionStatus=NOT_RUN`; readiness is not a closure decision. PR #572 / #571 adds only the exact controlled Target-A local-template export → fresh Target-B local-template import portability path, requiring Target-A source-provenance binding, a distinct Target-B-local managed-media fingerprint, canonical controlled PNG bytes/MIME/dimensions and a loaded Target-B render. PR #574 / #573 defines an exact operator decision record bound to that chain, but repository/CI does not synthesize a retained APPROVE; current retained runtime state therefore stays `NOT_RUN`. Only a separately supplied exact APPROVE may close the bounded asset-reference scope, while global closure, arbitrary-host/general media portability, numeric attachment-ID portability, broad target compatibility, production, generation and download authority remain false. A candidate/reference mismatch remains only a reference mismatch, not incompatibility. Broader responsive mapping and additional target-matrix coverage still require their own implementation/evidence.

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
7. Record every discovered Runner-dependent task in `docs/RUNNER_BENCHMARK.md`; default non-blocking items to the consolidated `FINAL_BATCH`.
8. Execute `BLOCKING_NOW` Runner entries immediately when security/safety/release prerequisites require them.
9. Focused local/static/unit checks during iteration; consolidated exact-head Runner/CI/release/offline gates at final integration/merge.
10. Canonical memory/README truth synchronized only when behavior/status/authority actually changes.
11. No synthetic runtime/external evidence or synthetic overall project percentage.
12. Implementation-complete and production-accepted remain separate.


## 2026-09-27 post-PR #818 status

PR #818 state-only reconciliation merged as main `13fb2f5b9200dc9ece2174be3d24d5d259ea29bd` after all seven required exact-head gates passed with zero unresolved review threads. Issue #819 owns final canonical state reconciliation and refresh of the P15 capability map. P15 remains CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED; recent bounded additions include Container gradients, hover transitions, radial gradients and overlay blend/filter composition. Runtime, broad compatibility, production and download authority remain unclaimed.


## P15 responsive Container gap-axis implementation — Issue #821

PR #821 merged after all seven required exact-head gates passed on `0ff80cb98fffeb444fc3ce0e610842c2d9ad9d43`, with zero unresolved review threads and expected-head guard; resulting main is `a3396e9030e33e9a0a8146eab5ec6dbeaa9a412f`. Explicit tablet/mobile row/column px pairs coexist with linked-px gaps under exact source/candidate binding. Broader compatibility and responsive closure remain unclaimed.

## Next bounded P15 candidate — Issue #823

Pinned Elementor 4.2.4 Flex Item source supports responsive custom basis via a responsive type selector and conditional slider. The queued candidate is explicit tablet/mobile px only, bounded to 0..1000; controlled proof must confirm exact serialized target keys and shape.


## P15 responsive Flex Item basis implementation — Issue #823

PR #823 passed all seven exact-head gates on a89bee55c3d43a0f40b2c97701c4a473ef9cce6b, had zero unresolved review threads, and merged as main b34f5b254dfe7bf8f217d691ecf8d58652674428 with expected-head guard. The bounded px custom-basis pair resolver preserves desktop settings and omitted breakpoints. Broader compatibility, responsive closure and production authority remain unclaimed.


## Pre-P19 sequencing (2026-09-28)

Issue #846 and [the evidence exit gate](../docs/PRE_P19_EVIDENCE_EXIT.md) require separate, genuine P15/P16/P17/P18 exits before P19 implementation. Routine in-scope work is preauthorized; absent source bytes, target runtime observations or authenticated evidence remain blockers rather than synthetic PASS. P18 R0/R1 preflight is open, but no adapter implementation or compatibility claim has started.
