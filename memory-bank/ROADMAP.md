# Roadmap

Last updated: 2026-09-16

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
| P15 | Elementor native export + import validation | CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED | N/A | `──────────` | Neutral IR + v3 generator + selected-Frame extraction + sanitized preview + declared TargetProfile + categorical mapping readiness exist; real import/editor/render and broader media/responsive mapping remain pending |
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

R0/R1 are recurring governance/acceptance gates. P13 implementation is complete but runtime acceptance remains open. P14 is active with no stable numeric denominator and no production mutation authority. P15 and P16 now have substantial deterministic code-side foundations but remain target-import/target-validation unaccepted with `N/A` progress. P17-P26 remain preflight frozen/not started. P27 execution remains deferred. New scope does not retroactively lower completed-core progress.

## Current P15 implementation truth

P15 is **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**.

Accepted bounded code-side surfaces now include:

- target-neutral export IR with explicit container/heading/button/image/plain-text/REVIEW intents;
- deterministic local Elementor v0.4 Container/Widget Template JSON candidate generation;
- read-only selected-Figma-Frame extraction for bounded HORIZONTAL/VERTICAL Auto Layout, padding/gap/alignment and visible plain text;
- sanitized normal/publishable plugin preview;
- bounded user-declared WordPress/Elementor TargetProfile alignment preview;
- deterministic compatibility categories `NATIVE`, `NATIVE_WITH_REVIEW`, `CONVERTIBLE`, `FALLBACK`, `UNSUPPORTED`, `UNKNOWN`;
- categorical mapping-readiness states `READY`, `READY_WITH_REVIEW`, `NOT_READY`, `INSUFFICIENT_EVIDENCE`, with unknown/unsupported nodes retained in the coverage denominator.

The mapping-readiness surface is explicitly **not target compatibility**. `targetCompatibilityClaim=false`, `productionAcceptance=false`, `downloadEnabled=false`, `importValidationStatus=NOT_RUN` and `targetEnvironmentValidationStatus=NOT_RUN` remain authoritative. No target observation, WordPress/Elementor network connection, import/editor/render execution, template download, section transfer or Figma mutation is granted by this state.

## Current P16 implementation truth

P16 is **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**.

The deterministic foundation already includes normalized candidate/native-validation evidence contracts, immutable declared target profiles, exact candidate identity, offline receipt/evidence intake, sanitized review/decision prerequisites, genuine-evidence retention requirements, offline operator export/validation and hardened bounded local JSON I/O/output handling. This remains supporting evidence only: genuine authenticated evidence and real native target/editor/import/render validation are still required before stronger authority.

## R0 — recurring market/platform intelligence

R0 is defined in `docs/MARKET_RESEARCH_PLAN.md`.

Before major target-adapter implementation:

1. refresh official platform docs;
2. refresh competitor/market matrix;
3. identify product gaps/differentiators;
4. classify documented vs risky/undocumented target paths;
5. review privacy/network/licensing constraints;
6. update decisions/acceptance criteria.

Research never grants runtime acceptance.

## R1 — recurring reliability/compatibility gate

R1 is defined in `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md`.

Before implementing a target adapter, freeze:

1. immutable versioned `TargetProfile`;
2. machine-readable capability descriptor;
3. UI dependency/reset rules that prevent stale invalid options;
4. structured error/retry model;
5. source fingerprint/staleness policy;
6. atomic generation and checksum/receipt contract;
7. schema/package/reference/assets validator;
8. real import/build/render acceptance harness where applicable;
9. precise readiness labels separating local artifact validation from observed target verification.

No adapter may claim a live-site guarantee from local package validation alone.

## Current P12 truth

The exact publishing-ID package under manual evaluation was produced from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5` with Figma-assigned ID `1680034649341961379` and Final Release Artifact #20. Static/offline verification passed, but P12 remains at 80% until live publisher/account/2FA/current-package evidence and final internal exit review are retained. Actual Community review/approval remains external.

## P13-P27 dependency and release order

1. P13 proves target/readiness risk evidence read-only.
2. P14 can prepare only conditions already detectable/explainable.
3. P15/P16 establish native WordPress builder adapters after R0/R1 and real target validation.
4. P17 establishes generic web code export and safe static-first reverse import.
5. P18 generalizes target code generation through adapter SDK/neutral component IR and pinned build matrices.
6. P19 standardizes assets/fonts/tokens across targets with truthful stored-original/rendered semantics.
7. P20 validates generated output visually and provides exact section portability/bridge.
8. P21 packages deterministic handoff/client QA/advisories.
9. P22 converts accepted structured evidence into configurable effort estimates.
10. P23 adds agency/project/component-binding/change-only workflows.
11. P24 adds dynamic/CMS/forms/interactions only after static output is stable.
12. P25 defines commercial tiers/entitlements without changing correctness.
13. P26 adds optional AI only after deterministic outputs exist.
14. P27 performs the final production-release sequence, coordinates remaining live runtime/publisher/2FA evidence and preserves #84 as the P12 release-exit truth.

## Runtime artifact registry

The artifact is registered in `config/runtime-artifacts.json` schema v3 as the operational provenance contract for retained exact-build runtime artifacts.

## Execution policy

1. Issues first.
2. PR/MR second.
3. R0 research refresh when required by the next external target.
4. R1 compatibility/reliability contract freeze.
5. Highest-priority unblocked roadmap obligation.
6. Use one focused release train for one acceptance objective; batch tightly related implementation/tests/UI/status-sync work rather than creating ceremonial micro-PRs.
7. Use focused typecheck/tests/builds for fast branch feedback; require the full documented exact-head CI/release/offline gates at the integration/merge checkpoint.
8. Synchronize canonical README/memory truth when status/authority/behavior actually changes, once per accepted release train when practical.
9. No synthetic runtime/external evidence and no synthetic overall project percentage.
10. Implementation-complete and production-accepted remain separate.
