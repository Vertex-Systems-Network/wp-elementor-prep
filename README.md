# WP Builders Prepare

Deterministic Figma audit and target-ready preparation for WordPress builders and web code. The current Figma plugin core is network-free and does not visually redesign approved source frames.

## Product Recovery Program (active since 2026-10-08)

A full code audit at main `9fdbe6f` showed that the safety/evidence framework is strong but the product layer is thin. The audit found:
- target/version selection is cosmetic;
- the release UI build is broken;
- the Elementor export maps only basic container layout, with no typography, sizing, styles or images;
- desktop/tablet/mobile alignment does not exist yet;
- Gutenberg block generation does not exist yet.

The single resumable build backlog is [`docs/PRODUCT_RECOVERY_PLAN.md`](docs/PRODUCT_RECOVERY_PLAN.md). Its milestones:

| Milestone | Scope |
|---|---|
| M0 | Critical fixes |
| M1 | Mapping engine |
| M2 | Full extraction |
| M3 | Assets |
| M4 | Responsive breakpoint engine |
| M5 | Smart duplicate + structure alignment |
| M6 | Target profiles / v4 Atomic |
| M7 | Round-trip proof |
| M8 | Gutenberg |
| M9+ | Remaining phases |

Current: **M0 accepted (PR #895); M1 mapping engine accepted (PR #900); M2 full single-frame extraction accepted (PR #907; zero silent drops on the golden landing page); M3 assets accepted (PR #910; images and SVG load in the real-target render); M4 responsive breakpoint engine active**.

## Current phase progress

**P15, P16 and P17 are in progress.** Their scopes are still expanding, so the repository does not assign a completion percentage to them. “Implemented” below means bounded code exists; it does not mean a real imported design matches Figma or is approved for production.

| Phase | What works now | What is still needed |
|---|---|---|
| **P15 · Elementor** — core foundation in progress | Deterministic Elementor v0.4 Template JSON candidate, selected-frame extraction, explicit responsive/style mappings, controlled WordPress 6.8 + Elementor 4.2.4 proof, and read-only review of core Image and Container background MEDIA references. | Package 13/14 images need durable WordPress-managed media; verify image loads and spacing/padding against the Figma desktop/mobile frames in a real import. Broad compatibility, download and production acceptance remain unclaimed. |
| **P16 · Gutenberg** — core foundation in progress; target validation unwired | Normalized candidate and exact-bound receipt chain, offline evidence-retention manifest/validator, and bounded local JSON I/O. | Genuine authenticated evidence, then real Gutenberg native serialization, editor/import/render validation and an internal closure decision. No target compatibility or production claim. |
| **P17 · Web export/code-to-design** — foundation implementation in progress | Static export/import safety preflight, neutral Web IR, IR-to-HTML/CSS generation, package validation and one controlled local Chrome render proof. | Calibrated visual comparison, safe JavaScript policy/execution, Web-to-Figma reconstruction and production acceptance. A local browser proof is not visual parity. |

### Package 13/14 demo import status

The two Package 13/14 Website Template ZIPs still contain temporary Figma asset references: **44 unique URLs in Template 1 and 45 in Template 2**. Template 2 has **43 core Image widget occurrences and 2 Container background occurrences**. PRs [#839](https://github.com/Vertex-Systems-Network/wp-elementor-prep/pull/839) and [#841](https://github.com/Vertex-Systems-Network/wp-elementor-prep/pull/841) merged read-only diagnostics for those documented controls. They do not download/upload images or rewrite the ZIPs. The draft import probe checked selected document persistence; it did not compare browser screenshots against Figma, so spacing and padding parity are **unverified**. The available older Adrian Voss media pack is not an asset match for Package 13/14. The 2026-09-28 [asset retrieval probe](docs/P15_PACKAGE_13_14_ASSET_PROBE_2026-09-28.md) received a Figma Site Unavailable HTML response instead of image bytes, so the P15 blocker is retained.

### What “ready” means here

- **Repository checks:** exact-head CI and security gates validate code contracts. They do not certify an arbitrary customer template.
- **Target evidence:** controlled WordPress/Elementor and local browser observations apply only to their tested versions and fixtures.
- **Release:** P12 remains 80% pending current publisher/account/2FA/final-exit evidence. P27 owns final production and marketplace acceptance. P13 #159 needs genuine Figma Desktop runtime evidence; #287 needs repository admin branch-protection settings.

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | ANPOS CHILD-ADOPTION FOUNDATION IMPLEMENTED / FULL ASSURANCE MAPPING IN PROGRESS | N/A | `──────────` | `.ai/manifest.json`, active-project identity, Requirements 1–96 applicability matrix, applicable policy contracts and deterministic validator added; PM/agent identity/consent/lease/commercial capabilities remain explicitly inactive; #287 admin branch/ruleset enforcement still required |
| Product Recovery Program (M0–M9) | IN PROGRESS / M0–M3 ACCEPTED, M4 ACTIVE | 40% | `████░░░░░░` | 4/10 milestones accepted (M0 via PR #895, M1 via PR #900, M2 via PR #907: zero silent drops on the golden landing page; M3 via PR #910: deterministic atomic asset pack with IMPORT.md, pack-relative media per D-051, image/background sizing, SVG icons, plugin download labelled as its manifest; images and SVG upload, relink, import and render with HTTP 200 on the disposable WP 6.8 + Elementor 4.2.4 target); packs stay `REVIEW REQUIRED` until an automated upload/relink path ships; next M4.1 breakpoint set — see `docs/PRODUCT_RECOVERY_PLAN.md` |
| P0–P4 historical core aggregate | COMPLETE | 100% | `██████████` | Compatibility summary only; individual P0-P4 rows below are canonical for phase visibility |
| P0 AI-native foundation + audit-only scaffold | COMPLETE | 100% | `██████████` | Planning, memory-bank, deterministic audit-only scaffold and CI foundation established |
| P1 Audit-Only MVP + golden-fixture calibration | COMPLETE | 100% | `██████████` | Read-only selected-frame audit, explainable scoring and fixture calibration complete |
| P2 Deterministic layout classifier + evidence/confidence | COMPLETE | 100% | `██████████` | Classifier families, preservation roles and adversarial regression coverage complete |
| P3 Geometry/content/image integrity + visual-diff validator | COMPLETE | 100% | `██████████` | Full validation and fail-closed pixel-broker path retained |
| P4 Candidate transaction engine + rollback guarantees | COMPLETE | 100% | `██████████` | Candidate clone -> transform -> validate -> commit/discard transaction foundation complete |
| P5 Conservative Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained real Figma closure |
| P6 Advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained positive/refusal closure |
| P7 Batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained 64-Frame stress/cancellation closure |
| P8 Historical exporter placeholder | DEFERRED / SUPERSEDED | N/A | `──────────` | Replaced by P15+ neutral target adapters |
| P9 Backlog generator | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real plugin export quality retained |
| P10 npm/Node CLI | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real REST/auth/plugin parity retained |
| P11 Normal Figma distribution | IMPLEMENTATION COMPLETE | 100% | `██████████` | Live publisher/install evidence remains in P12 |
| P12 Final integrated validation | IN PROGRESS | 80% | `████████░░` | Fresh exact-#20 runtime/final-details/2FA evidence + final internal exit review |
| R0 Market/platform research gate contract | DEFINED / RECURRING | 100% | `██████████` | Refresh per major adapter |
| R1 Reliability/compatibility gate contract | DEFINED / RECURRING | 100% | `██████████` | Execute profile/capability/validator/harness gate per adapter |
| P13 Build-Ready Score 2.0 + Responsive Risk | IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING | 100% impl | `██████████` | #159 real-plugin parity/internal runtime acceptance remains |
| P14 Target-Ready Duplicate + Guided Prepare | IMPLEMENTATION COMPLETE / INTERNAL CONFIRMATION ACTIVATION / PRODUCTION ACCEPTANCE PENDING | 100% impl | `██████████` | R1-R6 merged through PR #658; internal/dev activation only; publishable release activation disabled; live/runtime acceptance and target compatibility remain separate |
| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED | N/A | `──────────` | Local candidate + bounded Elementor 4.2.4 proof; permanent Package 13/14 media, imported image-load and Figma spacing parity are not verified |
| P16 Gutenberg native export + transfer | CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED | N/A | `──────────` | Candidate/evidence-retention tooling exists; genuine authenticated evidence and real editor/import/render validation are pending |
| P17 HTML/CSS/JS + code-to-design | FOUNDATION IMPLEMENTATION IN PROGRESS / CONTROLLED LOCAL BROWSER PROOF | N/A | `──────────` | Static IR to HTML/CSS package and local Chrome proof exist; visual parity, JS execution and Web-to-Figma reconstruction are pending |
| P18 Framework adapter platform | REACT STATIC ADAPTER + CONTROLLED RUNTIME PROOF RETAINED | 20% impl | `██░░░░░░░░` | #850 SDK/refusal tests and #858 pinned React/Vite build + local Chrome receipt are green; #866 source-bound DOM/layout receipt and #869 IR-bound reference intake are green; visual parity, broader framework slices, Figma parity and production acceptance remain pending |
| P19 Assets/fonts/design-system export | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Asset/token provenance and font constraints retained |
| P20 Round-trip QA + section portability | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Controlled render harness + calibrated QA required |
| P21 Handoff/client QA/a11y-SEO advisories | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Build from accepted target outputs |
| P22 Complexity / effort estimator | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Transparent effort-unit/calibration contract retained |
| P23 Agency/project/component bindings | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Stable implemented adapters first |
| P24 CMS/dynamic/forms/interactions | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Typed mappings retained; production writes out of first slice |
| P25 Free / Pro / Agency packaging | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Capability-based entitlement contract retained |
| P26 Optional AI assistance | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Non-authoritative AI authority firewall retained |
| P27 Final production release + publisher/runtime evidence | GATE DEFINED / EXECUTION DEFERRED | 0% exec | `░░░░░░░░░░` | Coordinate retained #84 truth + final live runtime/publisher/2FA evidence |

**Overall progress is intentionally not collapsed into one synthetic percentage.** The P15–P17 N/A entries mean their full acceptance scope has no validated denominator; they do not mean no work has been done.

## ANPOS child-adoption status

The repository now uses a project-specific ANPOS adoption layer documented in [`docs/ANPOS_ADOPTION.md`](docs/ANPOS_ADOPTION.md). This adds routing, active-project identity, a Requirements 1–96 applicability matrix, canonical completion map, inactive-by-default policy contracts and a deterministic validator without copying the canonical vendor/commercial runtime or changing the network-free Figma core. `npm run anpos:validate` verifies the metadata. Full ANPOS requirement certification, PM/AI identity/consent/lease integrations and commercial runtime remain separate and are not claimed.

## Versioned target option-bank status

The Elementor Free + Pro audit pipeline is now wired to versioned snapshots and gap reports. The current bank entry is Free 4.3.2 + Pro 4.3.0; Gutenberg has an official-contract entry. Run `npm run audit:elementor -- --elementor-free=... --elementor-pro=...` or `npm run audit:gutenberg -- --gutenberg-version=...` to append a new version. The plugin UI selectors are generated from `docs/option-bank/registry.json`, and each selector currently has one entry. The selected Elementor bank is carried into the read-only P15 preview and into the `optionBankId` of the local download receipt. A Gutenberg bank is refused for Elementor output (`P15_OPTION_BANK_TARGET_MISMATCH`), and Gutenberg export itself is not available yet (recovery M8). The bank is a static inventory: it does not change the generated mapping until version-driven profiles land in recovery M6. Static inventory remains separate from runtime/import/render compatibility.

## Before P19

[P15–P18 evidence exit gate](docs/PRE_P19_EVIDENCE_EXIT.md); consolidated [evidence register](docs/P15_P18_EVIDENCE_REGISTER_2026-09-29.md); P17’s visual comparison boundary is [documented here](docs/P17_VISUAL_COMPARISON_CONTRACT_2026-09-29.md); P16’s dated Gutenberg R0 contract is [here](docs/P16_GUTENBERG_R0_CONTRACT_2026-09-29.md) is open under #846. P18 React first-slice [R0/R1 review](docs/P18_REACT_R0_R1_2026-09-28.md) and dated framework matrix [R0 refresh](docs/P18_FRAMEWORK_R0_MATRIX_2026-09-29.md) is retained under #848; #850 adds the bounded static adapter SDK and refusal tests, and #858 adds a green pinned React/Vite build + local Chrome runtime receipt. Visual/Figma parity, Elementor target acceptance and production acceptance remain separate pending gates. P19 stays frozen until P15 imported media/layout proof, P16 authenticated native-editor proof, P17 visual/reconstruction proof and P18 framework build/render proof each pass a scope-specific internal review. CI or a controlled fixture alone does not close any of these exits.

## Development and source of truth

- Node.js **22.12.0+** (see `.nvmrc`); use `npm ci` for locked dependencies and repository scripts for checks.
- Machine-readable operational registry: `config/runtime-artifacts.json`, schema v3.
- **Progress sync policy:** every material repository mutation updates the relevant current phase status before an external handoff.
- **Open PR/MR:** [live pull-request list](https://github.com/Vertex-Systems-Network/wp-elementor-prep/pulls).
- Detailed roadmap: [commercial expansion plan](docs/COMMERCIAL_EXPANSION_PLAN.md); current execution state: [project state](memory-bank/PROJECT_STATE.md) and [next actions](memory-bank/NEXT_ACTIONS.md).
- Historical PR and gate-by-gate notes: [README progress history through 2026-09-28](docs/README_PROGRESS_HISTORY_2026-09-28.md).

P14 implementation progress is 100% (6/6 bounded slices implemented); production acceptance and publishable release activation remain separate.
