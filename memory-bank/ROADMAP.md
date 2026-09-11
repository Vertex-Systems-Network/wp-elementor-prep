# Roadmap

Last updated: 2026-09-11

| Module / Phase | Scope | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---|---:|---|---|
| AI-native governance/tooling | Memory-bank, issue/PR-first lifecycle, R0 research, R1 reliability, CI/provenance | COMPLETE | 100% | `██████████` | Keep status/research/reliability/evidence synchronized |
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
| R0 | Market/platform research gate | PLANNING GATE | N/A | `──────────` | Refresh before major externally evolving adapters |
| R1 | Reliability/compatibility gate | PLANNING GATE | N/A | `──────────` | Freeze TargetProfile/capabilities/errors/validators/acceptance harness before adapter implementation |
| P13 | Build-Ready Score 2.0 + Responsive Risk | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | P12 internal exit first |
| P14 | Target-Ready Duplicate + Guided Prepare | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Requires P13 read-only contracts |
| P15 | Elementor native export + import validation | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1, versioned v3/v4 adapters, real import acceptance |
| P16 | Gutenberg native export + section transfer | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1, parse/serialize/editor validation |
| P17 | HTML/CSS/JS export + code-to-design import | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1, static-first; JS sandbox spec required |
| P18 | Framework adapter platform | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1, neutral component IR + adapter SDK + build matrix |
| P19 | Asset pack + font manifest + design-system export | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Stored-original vs rendered policy; font/API constraints |
| P20 | Round-trip visual QA + exact section portability | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Target render harness + optional offline-first WP Builders Bridge |
| P21 | Developer handoff + client/QA + bounded a11y/SEO advisories | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Build from accepted target outputs |
| P22 | Deterministic complexity/effort estimator | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Transparent/configurable factors only |
| P23 | Agency/project + existing-component bindings | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Stable adapters/report contracts first |
| P24 | CMS/dynamic data/forms/interactions | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Static/native export stability first |
| P25 | Free / Pro / Agency packaging + entitlements | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Keep account/payment outside deterministic core |
| P26 | Optional AI assistance | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Opt-in research/explainer/drafting only |

## Progress interpretation

**Historical core P0-P7:** `██████████ 100%`.

**P12 final validation:** `████████░░ 80%`.

R0/R1 are governance/acceptance gates and do not receive product implementation percentages. P13-P26 are approved future scope at `0% / PLANNED-BLOCKED`. New scope does not retroactively lower completed-core progress.

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

## P13-P26 dependency order

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

## Runtime artifact registry

The artifact is registered in `config/runtime-artifacts.json` schema v3 as the operational provenance contract for retained exact-build runtime artifacts.

## Execution policy

1. Issues first.
2. PR/MR second.
3. R0 research refresh when required by the next external target.
4. R1 compatibility/reliability contract freeze.
5. Highest-priority unblocked roadmap obligation.
6. Tests/target validation before acceptance claims.
7. README + memory-bank same-cycle sync.
8. No synthetic runtime/external evidence.
9. Implementation-complete and production-accepted remain separate.
