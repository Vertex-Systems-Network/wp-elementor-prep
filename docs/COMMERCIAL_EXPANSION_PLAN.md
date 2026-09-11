# Commercial Expansion Plan

Status: PLANNED / IMPLEMENTATION BLOCKED BY P12 INTERNAL EXIT  
Owner issue: #119  
Date: 2026-09-11

## 1. Product direction

WP Builders Prepare should evolve from a deterministic Figma audit utility into a **Figma -> validated target-ready build platform**.

Primary commercial promise:

> Audit an approved design, make a safe target-ready duplicate when needed, validate it, then export/import native website-builder or code output with evidence that the result is structurally and visually ready.

Elementor + Elementor Pro + WordPress remain the first commercial target, Gutenberg is the second WordPress target, and code/framework outputs are isolated behind adapters so the deterministic Figma core does not become framework-specific.

The product must increase sales/client value without weakening the existing guarantees:

- deterministic core behavior;
- explainable evidence;
- audit before mutation;
- original visual design remains authoritative;
- low confidence produces REVIEW, not a guessed transformation;
- every mutation is candidate -> validate -> commit/rollback;
- core plugin remains AI-free and network-free;
- no customer/template-specific IDs/copy in product logic;
- no undocumented reverse engineering when a documented adapter/bridge is possible;
- implementation-complete and production-accepted remain separate states.

## 2. User-requested commercial pillars

The roadmap is explicitly aligned to these product outcomes.

### A. Continuous AI-assisted market research

AI research should continuously inspect public product/market changes, official platform docs, competitor capabilities and customer workflow friction. Research is planning input only; it never becomes runtime authority.

Canonical process: `docs/MARKET_RESEARCH_PLAN.md`.

### B. Elementor / Elementor Pro / WordPress native output

Users should be able to:

- validate a selected Frame/page for Elementor compatibility;
- see alignment/structure/responsive/widget-mapping issues before export;
- if the source is not target-ready, choose **Create Elementor-Ready Duplicate**;
- run only proven target-specific preparation on that duplicate;
- validate the prepared duplicate;
- download an Elementor template JSON/ZIP or supported website-template/kit package where the documented target format allows it;
- optionally transfer a selected section through a safe WordPress-side bridge;
- keep the original Figma design untouched.

### C. HTML + CSS + JS output and code-to-design input

Users should be able to export static/runnable web packages and, in the opposite direction, import supported code into a Figma reconstruction flow.

The reverse direction is **static-first and sandboxed**. Arbitrary untrusted JavaScript must never execute directly inside the deterministic core/plugin context merely to reconstruct a design.

### D. Framework/library output

Users should be able to choose a target adapter and options for modern front-end stacks, beginning with the highest-value documented targets and expanding through an adapter SDK.

Initial likely targets:

- React;
- Next.js;
- Vue;
- Nuxt;
- Svelte / SvelteKit;
- Angular;
- Astro;
- plain HTML/CSS/JS;
- Tailwind-based variants where appropriate.

`NestJS` is a server-side Node framework, not a browser UI renderer. The design itself should therefore not be described as "converted to NestJS UI". A future NestJS option may generate an integration scaffold/API/data contract alongside a front-end adapter when the user explicitly chooses a full-stack package.

### E. Asset pack export

Users should be able to export:

- raster images;
- SVG/vector icons;
- logos/illustrations;
- an asset manifest;
- font family/style/usage manifest;
- design tokens where available;
- selectable image sizing policy.

Image sizing options should include:

- **Original/source-oriented** where source bytes or trustworthy source dimensions are available;
- **Rendered at design display size**;
- **1x / 2x / custom scale**;
- **Web optimized** where a separately accepted deterministic encoder is available.

The Figma Plugin API does not provide a general raw-font-file export API. Raw font binaries must therefore never be promised from Figma alone. Font binary packaging is allowed only when a user separately supplies legally usable font files through a future local/companion flow.

### F. Gutenberg native output

Users should be able to validate and export a selected page/section as native Gutenberg-compatible structures using documented block/pattern serialization rather than flattened HTML-only output where native blocks are possible.

### G. Section-level copy/transfer

For Elementor and Gutenberg, a user should be able to select one section and choose a target-specific transfer action.

Preferred implementation order:

1. documented native JSON/pattern/block serialization;
2. downloadable section artifact;
3. optional `WP Builders Bridge` WordPress companion plugin that recognizes our own versioned clipboard/import payload and creates native builder structures;
4. direct site push only in a separately accepted authenticated/networked module.

Do **not** depend on reverse-engineering undocumented Elementor clipboard internals.

## 3. Commercial user outcomes

### Individual designer/developer

- know whether a design is build-ready;
- repair safe structural issues without redesigning;
- get native builder/code output;
- export assets with predictable sizing;
- compare generated result to Figma before handoff.

### Freelancer / small studio

- shorten Figma-to-build time;
- reduce cleanup after import;
- create reusable sections/templates;
- produce defensible effort estimates and client-ready QA reports;
- support both WordPress and front-end framework clients.

### Agency / team

- use presets and component bindings;
- batch multiple pages;
- export to multiple targets from one neutral model;
- enforce client/project standards;
- white-label reports;
- compare revisions and regenerate only changed sections.

## 4. Canonical target-ready workflow

The future end-user flow should be:

1. **Choose source** — selected Frame, selected section, controlled multi-Frame project, or supported code input.
2. **Choose target** — Elementor, Gutenberg, HTML, React, Vue, etc.
3. **Research-aware target contract** — adapter version states exactly which target/platform versions are supported.
4. **Read-only audit** — deterministic structure/content/asset scan.
5. **Target Compatibility Check** — target-specific mapping/alignment/unsupported-feature analysis.
6. **Build-Ready + Target-Ready Score** — evidence by category.
7. **Responsive Risk** — identify likely breakpoint failures without inventing responsive design.
8. **Decision:**
   - already target-ready -> continue;
   - not ready but safely repairable -> **Create Target-Ready Duplicate**;
   - ambiguous/unsafe -> REVIEW with exact blockers.
9. **Prepare duplicate** — only previously proven recipes.
10. **Validate duplicate** — geometry, text, images, structure, target rules and rendered-pixel checks.
11. **Generate target output** — versioned adapter.
12. **Target artifact validation** — schema, references, assets, missing features, package integrity.
13. **Round-trip preview** — render generated output where feasible and compare against Figma visual evidence.
14. **Download / Copy / Import** — only after validation gate passes or with explicit REVIEW warnings.
15. **Handoff / QA report** — exact limitations and unsupported mappings.

The approved original never needs to be destructively modified for export.

## 5. AI-native market intelligence gate (R0)

R0 is a recurring governance gate, not a runtime feature and not a numbered implementation phase.

Before opening implementation for a major new adapter/capability:

1. refresh official platform docs;
2. refresh competitor matrix;
3. record market baseline and gaps;
4. verify target format/import path is documented enough to support safely;
5. classify network/licensing/privacy requirements;
6. update acceptance criteria if the target platform changed;
7. record durable changes in `DECISIONS.md`.

Research snapshot and procedure: `docs/MARKET_RESEARCH_PLAN.md`.

## 6. Post-P12 phase sequence

### P13 — Build-Ready Score 2.0 + Responsive Risk

**Mode:** read-only first.

Add versioned category scoring and evidence for:

- Structure;
- Responsive Risk;
- Target Compatibility;
- Consistency;
- Accessibility/QA advisories where deterministically measurable;
- Handoff Readiness.

Responsive-risk detectors include fixed sizing, text reflow, overflow, dense horizontal groups, absolute normal-content dependencies, media wrappers, minimum viable widths and breakpoint-sensitive spacing.

No responsive mutation and no invented mobile/tablet composition.

### P14 — Target-Ready Duplicate + Guided Prepare

This phase generalizes the existing Safe Fix model into a user-facing target preparation flow.

Actions:

- `Check Target Readiness`;
- `Create Target-Ready Duplicate`;
- proposed-change review;
- safe Auto Layout/layout-sizing corrections;
- measured gap/padding fixes;
- safe text auto-height fixes;
- repeated-structure normalization where a proven recipe exists;
- preserve legitimate overlays;
- validate and re-score the duplicate.

The original design remains untouched unless the user separately chooses an already-accepted existing Safe Fix workflow.

### P15 — Elementor Native Export + Import Validation

Build the first production target adapter around official Elementor structures.

Supported output families should be versioned explicitly:

- modern Container-based template JSON;
- Elementor Atomic structures when their documented target contract is stable for the required capability;
- template JSON;
- ZIP containing supported template JSON assets where the official library import path supports it;
- website-template/kit ZIP only when the package can be produced and validated against documented Elementor import requirements;
- optional Elementor Pro mappings when the target site/user explicitly selects Pro and the widget mapping is documented.

Pre-download checks:

- target schema version;
- container hierarchy;
- widget mapping coverage;
- responsive setting coverage;
- IDs/references;
- global colors/fonts/classes/variables mapping;
- asset references;
- unsupported widget/feature list;
- alignment/layout validation;
- package integrity.

User actions:

- `Download Elementor Template`;
- `Download Elementor ZIP/Kit` when supported by the adapter contract;
- `Copy Section for Elementor` through the documented/bridge path;
- `Open Export Report`.

No export should pretend unsupported Pro widgets or third-party addons are native mappings.

### P16 — Gutenberg Native Export + Section Transfer

Build a Gutenberg adapter using native serialized block structures and patterns.

Goals:

- map compatible design structure to core blocks first;
- support Group/Columns/Grid-like structures as supported by target WordPress versions;
- map headings, paragraphs, buttons, images, lists and media to native blocks when possible;
- export pattern JSON where appropriate;
- export serialized block markup;
- section-level copy payload;
- optional `WP Builders Bridge` receiver for robust paste/import.

Validation:

- block parse -> serialize round-trip;
- no invalid block warnings for supported fixtures;
- semantic heading/media integrity;
- target WordPress version contract;
- unsupported/custom-block fallback is explicit REVIEW, not silent flattening.

### P17 — Universal Web Export + Code-to-Design Import

#### Design -> code

Output options:

- semantic HTML;
- CSS;
- vanilla JS only where interaction exists and is representable;
- CSS variables/design tokens;
- optional Tailwind adapter;
- assets directory + manifest;
- responsive stylesheet generated only from explicit/deterministic rules.

#### Code -> design

Input options:

- HTML + CSS paste/upload;
- HTML/CSS folder/ZIP;
- optional URL capture in a future separately networked module;
- JS-enabled reconstruction only in a strict sandbox/companion renderer.

Security rules:

- default JS execution is OFF;
- strip/block network requests, storage, navigation and dangerous APIs in sandbox mode;
- core parser can reconstruct static layout without executing code;
- imported result is a **new Figma reconstruction**, never silent mutation of an approved design;
- unsupported CSS/JS features are reported.

### P18 — Framework Adapter Platform

Create one neutral component/layout intermediate representation and target-specific generators.

Initial adapters should be prioritized by research and demand:

- React;
- Next.js;
- Vue;
- Nuxt;
- Svelte/SvelteKit;
- Angular;
- Astro;
- optional React Native only after a separate native-layout feasibility specification.

Configurable options may include:

- JavaScript vs TypeScript;
- CSS Modules / plain CSS / Tailwind / other accepted styling adapter;
- component granularity;
- existing component-library bindings;
- routing scaffold;
- asset strategy;
- token strategy;
- accessibility/semantic output preferences;
- package-manager/project scaffold.

Add an **Adapter SDK** so later frameworks/libraries can be implemented without changing the core scanner.

Full-stack option:

- if a user chooses NestJS, generate only backend/API/data-contract scaffolding that is actually derivable/configurable, paired with a selected front-end adapter;
- never claim a visual design itself maps directly to NestJS rendering.

### P19 — Asset Pack + Design-System Export

Combine target-independent asset export and design-system advisory.

Asset export:

- raster images;
- SVG vectors/icons;
- PDF where useful;
- source/display/custom-scale image options;
- deterministic naming and de-duplication;
- missing/external asset warnings;
- asset manifest with node/source usage.

Fonts:

- family/style/weight/usage manifest;
- missing-font warnings;
- CSS `font-family` mapping;
- raw font files only when separately user-supplied and license-permitted.

Design system:

- colors;
- typography;
- spacing;
- radius;
- shadows/effects;
- button/card/form patterns;
- token candidates;
- CSS variables;
- framework token formats through adapters;
- Elementor variables/classes and Gutenberg/theme.json mapping only when documented and target-compatible.

### P20 — Round-Trip Visual QA + Exact Section Portability

This is a major differentiator.

For supported targets:

1. export target artifact;
2. render/preview in a controlled target harness;
3. capture comparable output;
4. compare geometry/content/assets/pixels against the Figma source;
5. fail or mark REVIEW when drift exceeds calibrated thresholds.

Also formalize exact section portability:

- Elementor section/container artifact;
- Gutenberg block/pattern artifact;
- clipboard/bridge payload with schema version;
- `WP Builders Bridge` WordPress plugin can receive our payload and create native editor data;
- checksum and source-report linkage so the user knows which validation run produced the pasted section.

### P21 — Developer Handoff + Client/QA + Accessibility/SEO Advisories

Outputs:

- Build-Ready/Target-Ready scores;
- target export limitations;
- responsive risks;
- asset/font manifest;
- token summary;
- Safe Fix/duplicate preparation history;
- round-trip QA result;
- unresolved backlog.

Add deterministic advisory checks where evidence exists:

- heading hierarchy;
- image alt-text presence/placeholder status;
- contrast checks where colors are resolvable;
- button/link naming completeness;
- landmark/semantic suggestions;
- obvious oversized media/performance risks;
- missing interaction states where source variants explicitly exist.

Do not market these as a complete automated legal/accessibility/SEO audit.

### P22 — Complexity / Effort Estimator + Proposal Inputs

Transparent/configurable factors only:

- page/frame count;
- unique vs reusable sections;
- target adapter complexity;
- forms/carousels/navigation;
- responsive burden;
- manual-layout debt;
- custom component count;
- asset/media burden;
- dynamic/CMS requirements explicitly selected by user;
- expected unsupported/manual mappings.

Outputs:

- complexity band;
- configurable effort units/hours;
- confidence and contributing factors;
- user-defined monetary pricing rules;
- structured proposal inputs.

No opaque AI market-price guessing.

### P23 — Agency / Project / Existing-Component Layer

Agency capabilities:

- audit/export presets;
- per-client standards;
- bounded custom rules;
- white-label reports;
- sequential batch/project export;
- baseline/re-audit comparison;
- only-changed-section detection;
- export history and target-version history;
- component binding registry.

Existing-component binding is especially important for professional code teams:

- map a Figma component to an existing React/Vue/etc component;
- map design props to component props;
- avoid regenerating components the codebase already owns;
- validate required props/variants.

### P24 — CMS, Dynamic Data, Forms + Interaction Mapping

Only after static/native output is stable.

Potential supported mappings:

- WordPress posts/custom post types/taxonomies;
- Elementor dynamic tags where documented and selected;
- Gutenberg Query/Pattern relationships where supported;
- form intent and field structures;
- navigation/menu intent;
- simple prototype interactions -> supported target interactions;
- CMS/data placeholders for framework exports.

Dynamic behavior must be explicitly configured; never infer production data sources from a visual mockup alone.

### P25 — Commercial Packaging / Entitlements

Suggested boundaries:

**Free**

- selected-frame audit;
- basic Build-Ready score;
- limited asset export;
- limited HTML preview/export;
- limited report.

**Pro**

- full Target-Ready analysis;
- target-ready duplicate preparation;
- Elementor + Gutenberg export;
- HTML/code/framework exports;
- full asset pack;
- round-trip QA;
- design-system export;
- handoff/QA;
- estimator.

**Agency**

- project/batch workflows;
- custom presets/rules;
- white label;
- component bindings;
- baseline/change-only exports;
- configurable estimator and higher-volume workflow.

Commercial/account code stays outside deterministic correctness. Any networked license/account flow requires a separately accepted architecture and may not upload design content merely to check a license.

### P26 — Optional AI Assistance

AI remains opt-in and non-authoritative.

Allowed roles:

- market research synthesis;
- explain deterministic findings;
- summarize backlog;
- suggest which supported target adapter best fits stated requirements;
- draft developer notes;
- draft proposal narrative from deterministic estimator inputs;
- help map user-described component names to already-configured adapter choices.

Forbidden roles:

- authorize mutation;
- override confidence/validation;
- silently invent mobile layouts;
- replace target schema validation;
- run untrusted code outside the sandbox;
- claim unsupported adapter compatibility;
- upload design content without a separately accepted consent/privacy contract.

## 7. Extra high-value options for sales and retention

These are explicitly included in research/prioritization even if their final phase may move:

### Change-only regeneration

Detect what changed between Figma revisions and regenerate only affected sections/components/assets. High agency-retention value.

### Target capability matrix before export

Show something like:

- Native: 82%
- Supported with deterministic conversion: 12%
- Review/manual: 6%

This sets realistic expectations before purchase/export.

### Existing component-library mode

Use a team's real components instead of generating generic replacements. This is a strong differentiation from one-shot code generators.

### Export Preview Lab

Preview desktop/tablet/mobile target rendering before download and show visual drift/risk.

### Design lint / pre-handoff certification

A shareable `READY`, `REVIEW`, `BLOCKED` certificate tied to the exact audit/export run, not a marketing-only badge.

### Target adapter marketplace/SDK

Long-term: documented adapter SDK for external/community target generators, but only after core adapter contracts are stable and security-reviewed.

### Bricks / additional WordPress builders

Research as later adapters. Current market evidence shows demand for multiple native WordPress builders, but Elementor and Gutenberg remain first priority.

## 8. Architecture boundaries

```text
Figma / CLI / supported code source adapters
        |
        v
Normalized neutral model
        |
        +--> deterministic audit/classifier/scoring
        +--> responsive/target-risk engine
        +--> design-system + asset model
        +--> complexity estimator
        |
        +--> recipe planner -> candidate duplicate -> validation -> commit/rollback
        |
        +--> neutral build/component model
                 |
                 +--> Elementor adapter
                 +--> Gutenberg adapter
                 +--> HTML/CSS/JS adapter
                 +--> framework adapter SDK
                 +--> future builder adapters

Target validation layer
        +--> schema/package validator
        +--> asset/reference validator
        +--> render harness / round-trip visual diff

Presentation / commercial shell
        +--> reports / white label / presets
        +--> entitlements
        +--> optional WP Builders Bridge
        +--> optional AI assistant
```

No target/commercial/AI module may change deterministic core results for the same enabled feature/input/version.

## 9. Adapter and bridge policy

Every adapter must declare:

- adapter ID/version;
- supported target/platform versions;
- required target plan/features (for example Elementor Pro);
- supported elements/widgets/blocks;
- unsupported/fallback behavior;
- responsive capability;
- asset policy;
- validation rules;
- whether network/companion software is required.

Every generated artifact includes an export receipt with adapter version, source audit version, validation state and warnings.

`WP Builders Bridge` is optional companion software for robust WordPress import/copy/direct-transfer workflows. It must not become a hidden requirement for normal downloadable exports.

## 10. Acceptance and release model

Every phase must have:

1. R0 research refresh where the target is externally evolving;
2. focused issue with acceptance criteria;
3. issue-first / PR-second processing;
4. deterministic fixtures/tests;
5. focused branch + PR;
6. plugin/CLI parity where applicable;
7. memory-bank + README synchronization;
8. target-specific schema/import validation;
9. real runtime evidence for behavior not provable offline;
10. implementation-complete and production-accepted tracked separately;
11. no fabricated external/provider behavior.

Target-export production acceptance additionally requires representative generated artifacts to import/render successfully in the real supported target version.

## 11. Current gate

Planning/research is approved under #119, but **P13 implementation must not begin until the internal P12 release-exit gate in #84 is closed**.

Actual Figma Community review/approval remains external and is not a prerequisite for planning, but it must never be reported complete without Figma confirmation.
