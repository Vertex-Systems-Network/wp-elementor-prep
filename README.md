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
- `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md` — R1 adapter/option/system reliability contract;
- `docs/COMMERCIAL_EXPANSION_PLAN.md` — P13-P26 commercial roadmap;
- `docs/AI_NATIVE_PLAN.md`;
- `docs/FEATURE_PLAN.md`.

## Live development status

> **Progress policy:** implementation, runtime acceptance and external Community review are tracked separately. New future scope does not reduce already-completed historical core progress.

**Open PR/MR:** `current reliability-audit planning PR only; expected 0 after merge`

Open issues:

- `#84` — P12 final validation: active manual/publisher/runtime exit gate.
- `#119` — P13-P26 commercial/multi-target expansion owner; implementation blocked by #84 internal exit.

PR #122 merged the market-researched multi-target planning baseline as `ade501fedb8c810b4964eb3dda414c58450e8565` after CI #721, Integration Readiness #156, P12 Offline Acceptance #76 and P12 Final Release Artifact #32 passed. PR #123 then synchronized post-plan status and merged as `d34c026202ae6ecd8f88f71e6056d619578ce56f` after CI #723, Integration Readiness #158, P12 Offline Acceptance #78 and P12 Final Release Artifact #34 passed. These changes were planning/docs only and granted no P13-P26 runtime acceptance credit.

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
| P12 Final integrated validation | IN PROGRESS | 80% | `████████░░` | Exact publish-ID package/account/2FA/final exit review |
| R0 Market/platform research | PLANNING GATE | N/A | `──────────` | Refresh before major external adapters |
| R1 Reliability/compatibility | PLANNING GATE | N/A | `──────────` | Freeze target profile/capabilities/errors/validators/harness before implementation |
| P13 Build-Ready Score 2.0 + Responsive Risk | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | P12 internal exit first |
| P14 Target-Ready Duplicate + Guided Prepare | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Requires P13 read-only contracts |
| P15 Elementor native export + validation | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1; versioned v3/v4 adapter + real import proof |
| P16 Gutenberg native export + transfer | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1; native block/pattern/editor validation |
| P17 HTML/CSS/JS + code-to-design | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1; static-first; JS sandbox spec required |
| P18 Framework adapter platform | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | R0+R1; neutral component IR + adapter SDK/build matrix |
| P19 Assets/fonts/design-system export | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Stored-original vs rendered policy; font/API constraints |
| P20 Round-trip QA + section portability | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Render harness + optional offline-first WP Builders Bridge |
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

Before major new target-adapter implementation, research must refresh official target docs, competitor capability baseline, product gaps, format/API stability and network/privacy/licensing risks.

Research is planning input only and does not count as runtime acceptance.

## R1 — reliability and compatibility gate

Every major adapter must define these before implementation:

- immutable versioned `TargetProfile`;
- machine-readable capability descriptor that drives valid UI options;
- stale-result invalidation when target/source/options change;
- strict job state machine and cooperative cancel/retry behavior;
- structured error codes with actionable next steps;
- atomic generation: no partial download/copy artifacts;
- schema/package/reference/assets validators;
- real import/build/render harness where applicable;
- exact readiness labels separating local artifact validation from observed live-target verification.

A package can be `ARTIFACT VALIDATED` without being `IMPORT VERIFIED`. We do not claim an unobserved WordPress server will import successfully merely because local JSON/ZIP validation passed.

## Planned WordPress workflow

### Elementor / Elementor Pro

1. select Frame or section;
2. choose explicit Elementor adapter family/version and Core/Pro capability profile;
3. run compatibility/alignment/widget/responsive checks;
4. if needed, `Create Elementor-Ready Duplicate`;
5. validate duplicate;
6. generate versioned native Elementor artifact atomically;
7. validate JSON/ZIP/package/references/assets;
8. real target import/render proof where the acceptance harness supports it;
9. round-trip preview/diff where supported;
10. download template/ZIP/kit only for an output family the adapter actually supports;
11. selected-section transfer through documented artifact/optional WP Builders Bridge.

Initial Elementor adapter families are planned separately for v3 Container output and v4 Atomic output. A hybrid site chooses the intended output family rather than receiving an ambiguous mixed schema.

No dependency on undocumented Elementor clipboard internals. Third-party add-ons are not silently represented as native Elementor widgets.

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
- React, Next.js, Vue, Nuxt, Svelte/SvelteKit, Angular, Astro via adapters;
- JS/TS and styling options only when declared by the adapter capability matrix;
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

NestJS is considered a backend/API scaffold option paired with a front-end target, not a visual renderer.

## Planned asset export

- images/icons/SVGs;
- **Stored Original** image bytes where Figma image-fill bytes are accessible;
- **Rendered Appearance** for crop/mask/effects/layout appearance;
- rendered display-size vs 1x/2x/custom export options;
- deterministic naming/de-duplication;
- asset manifest;
- font family/style/weight/usage manifest;
- raw font files only when user-supplied and license-permitted because the Figma Plugin API does not provide a general raw-font-file export path.

Stored image bytes are not described as proven upstream-upload provenance when Figma cannot prove that provenance.

## Key differentiators queued

- round-trip rendered visual diff before export acceptance;
- target capability matrix with explicit Native / Review / Unsupported states;
- change-only regeneration between Figma revisions;
- exact-run readiness certificate;
- existing component-library binding;
- Export Preview Lab;
- optional WordPress companion bridge using file/paste first;
- later Bricks/other builders through the same adapter model.

## Safety and reliability invariants

- source visual design remains authoritative;
- unsupported/ambiguous structures are REVIEW/BLOCKED, never guessed;
- target preparation occurs on candidate/duplicate with validation;
- low confidence does not mutate;
- plugin/CLI share one deterministic core;
- raw `.fig` reverse engineering remains refused;
- responsive analysis does not invent mobile/tablet design;
- target adapters are versioned and declare support limits;
- invalid option combinations are prevented by capability-driven state, not discovered only after export;
- no silent fallback changes the implementation strategy;
- code-to-design untrusted JS is not executed in the core;
- current Community core remains `allowedDomains: ["none"]`; arbitrary customer-domain push is separate future scope;
- commercial entitlements gate surfaces, not correctness;
- optional AI cannot authorize mutation, alter score evidence or replace validators.

## Current execution order

1. finish genuine P12 exact-package/publisher/2FA/final-exit evidence in #84;
2. close P12 internal exit only on retained evidence;
3. open focused P13 implementation issue from #119;
4. run R0 before each major external adapter;
5. run R1 before implementing/accepting each major adapter;
6. continue P13-P26 in dependency order with one focused issue/branch/PR per phase.

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
