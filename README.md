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

`Choose target -> Audit -> Target Compatibility -> Build/Target-Ready Score -> Responsive Risk -> Target-Ready Duplicate if needed -> Validate -> Generate target artifact -> Target validation -> Round-trip QA -> Download/Copy/Import -> Handoff`

Canonical planning docs:

- `docs/MARKET_RESEARCH_PLAN.md`;
- `docs/COMMERCIAL_EXPANSION_PLAN.md`;
- `docs/AI_NATIVE_PLAN.md`;
- `docs/FEATURE_PLAN.md`.

## Live development status

> **Progress policy:** implementation, runtime acceptance and external Community review are tracked separately. New future scope does not reduce already-completed historical core progress.

**Open PR/MR:** `0 after this post-merge status-sync PR lands`

Open issues:

- `#84` — P12 final validation: active manual/publisher/runtime exit gate.
- `#119` — P13-P26 commercial/multi-target expansion owner; implementation blocked by #84 internal exit.

PR #122 merged the market-researched multi-target planning baseline as `ade501fedb8c810b4964eb3dda414c58450e8565` after CI #721, Integration Readiness #156, P12 Offline Acceptance #76 and P12 Final Release Artifact #32 all passed. This planning merge changed no runtime/plugin behavior and granted no P13-P26 acceptance credit.

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | COMPLETE | 100% | `██████████` | Keep Issues -> PR/MR -> R0 research -> development -> evidence lifecycle synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | `██████████` | None |
| P5 Conservative Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained real Figma closure |
| P6 Advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained positive/refusal closure |
| P7 Batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained 64-Frame stress/cancellation closure |
| P8 Historical exporter placeholder | DEFERRED / SUPERSEDED | N/A | `──────────` | Replaced by P15+ neutral target adapters |
| P9 Backlog generator | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real plugin export quality retained |
| P10 npm/Node CLI | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real REST/auth/plugin parity retained |
| P11 Normal Figma distribution | IMPLEMENTATION COMPLETE | 100% | `██████████` | Live publisher/install evidence remains in P12 |
| P12 Final integrated validation | IN PROGRESS | 80% | `████████░░` | Exact publish-ID package/account/2FA/final exit review |
| P13 Build-Ready Score 2.0 + Responsive Risk | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | P12 internal exit first |
| P14 Target-Ready Duplicate + Guided Prepare | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Requires P13 read-only contracts |
| P15 Elementor native export + validation | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Versioned documented adapter + real import proof |
| P16 Gutenberg native export + transfer | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Native block/pattern validation |
| P17 HTML/CSS/JS + code-to-design | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Static-first; JS sandbox spec required |
| P18 Framework adapter platform | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Neutral component IR + adapter SDK |
| P19 Assets/fonts/design-system export | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Honest source/rendered/font-file policy |
| P20 Round-trip QA + section portability | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Render harness + optional WP Builders Bridge |
| P21 Handoff/client QA/a11y-SEO advisories | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Build from accepted target outputs |
| P22 Complexity / effort estimator | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Transparent/configurable factors only |
| P23 Agency/project/component bindings | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Stable target adapters first |
| P24 CMS/dynamic/forms/interactions | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Static output stability first |
| P25 Free / Pro / Agency packaging | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Commercial shell outside deterministic core |
| P26 Optional AI assistance | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Non-authoritative research/explainer/drafting only |

**Overall active project progress:** `██████████ 100%`

Historical P0-P7 core remains 100%. P12 is tracked separately at 80%. P13-P26 are approved future scope at 0% and are not implementation-authorized yet.

## Current P12 publishing line

The retained publishing candidate under manual evaluation was produced from source:

`5f12b1d28146d5c2af815cc9f83eb30431dce4b5`

Figma-assigned publishing ID:

`1680034649341961379`

Verification on that candidate passed CI #709, Integration Readiness #145, P12 Offline #64 and Final Release Artifact #20 (`wp-builders-prepare-final-release-20`, artifact ID `10179286885`, digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`).

Static/docs changes after that source are not automatically new live acceptance. P12 exit must name the exact package whose Figma Desktop/publisher evidence is accepted.

Actual Community review/approval remains external.

## R0 — AI-native market/platform research

Before major new target-adapter implementation, research must refresh:

- official target docs;
- competitor capability baseline;
- product gaps/differentiators;
- target format/API stability;
- network/privacy/licensing risks.

Current research shows that native WordPress conversion and Figma-to-code are already competitive markets, so WP Builders Prepare should differentiate on **pre-export validation, target-ready duplication, deterministic native output, round-trip visual QA, exact section portability, asset control, component bindings and agency governance**, not simply “export React/HTML.”

Research is planning input only and does not count as runtime acceptance.

## Planned WordPress workflow

### Elementor / Elementor Pro

1. select Frame or section;
2. choose Elementor target/version/Free-or-Pro capability set;
3. run compatibility/alignment/widget/responsive checks;
4. if needed, `Create Elementor-Ready Duplicate`;
5. validate duplicate;
6. generate versioned native Elementor artifact;
7. validate JSON/ZIP/package/assets;
8. round-trip preview/diff where supported;
9. download template/ZIP/kit where the adapter contract supports it;
10. selected-section transfer through documented artifact/optional WP Builders Bridge.

No dependency on undocumented Elementor clipboard internals.

### Gutenberg

- native core-block mapping first;
- serialized block markup;
- pattern JSON;
- parse/serialize validation;
- selected-section block/pattern transfer;
- optional WP Builders Bridge receiver.

## Planned code/framework workflow

### Design -> code

- HTML/CSS/JS;
- React, Next.js, Vue, Nuxt, Svelte/SvelteKit, Angular, Astro via adapters;
- JS/TS and styling options where accepted;
- existing component-library bindings;
- assets/tokens included.

### Code -> design

- HTML/CSS static-first reconstruction;
- folder/ZIP input;
- arbitrary JS disabled by default;
- JS-enabled rendering only through a separately accepted sandbox/companion design;
- result becomes a new Figma reconstruction.

NestJS is considered a backend/API scaffold option paired with a front-end target, not a visual renderer.

## Planned asset export

- images/icons/SVGs;
- explicit source-oriented/original vs rendered/display-size vs 1x/2x/custom export policy;
- deterministic naming/de-duplication;
- asset manifest;
- font family/style/weight/usage manifest;
- raw font files only when user-supplied and license-permitted because the Figma Plugin API does not provide a general raw-font-file export path.

## Key differentiators queued

- round-trip rendered visual diff before export acceptance;
- target capability matrix: Native / Converted / Review;
- change-only regeneration between Figma revisions;
- exact-run readiness certificate;
- existing component-library binding;
- Export Preview Lab;
- optional WordPress companion bridge;
- later Bricks/other builders through the same adapter model.

## Safety invariants

- source visual design remains authoritative;
- unsupported/ambiguous structures are REVIEW/BLOCKED, never guessed;
- target preparation occurs on candidate/duplicate with validation;
- low confidence does not mutate;
- plugin/CLI share one deterministic core;
- raw `.fig` reverse engineering remains refused;
- responsive analysis does not invent mobile/tablet design;
- target adapters are versioned and declare support limits;
- code-to-design untrusted JS is not executed in the core;
- commercial entitlements gate surfaces, not correctness;
- optional AI cannot authorize mutation, alter score evidence or replace validators.

## Current execution order

1. finish genuine P12 exact-package/publisher/2FA/final-exit evidence in #84;
2. close P12 internal exit only on retained evidence;
3. open focused P13 implementation issue from #119;
4. run R0 refresh before each major target adapter;
5. continue P13-P26 in dependency order with one focused issue/branch/PR per phase.

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
