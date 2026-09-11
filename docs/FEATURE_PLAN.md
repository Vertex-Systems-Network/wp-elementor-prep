# Feature Plan

Date: 2026-09-07  
Post-P12 multi-target expansion aligned: 2026-09-11  
Reliability/compatibility audit aligned: 2026-09-11

> P0-P8 below are the original foundation plan. Live completion truth is in `memory-bank/ROADMAP.md`. Post-P12 work is implementation-blocked by the internal P12 exit in #84.

## P0 — Core audit foundation

### Selection + scanner
- one selected top-level desktop frame for MVP;
- selected subtree traversal;
- lightweight normalized tree;
- layout/sizing/geometry/clipping/fills/effects/text/image/semantic-name metadata.

### Section discovery
- page/content wrapper detection;
- section candidates from geometry/order with names as hints only.

### Readiness scoring
- global/per-section score with explicit findings;
- penalize manual normal-content layout, fixed text heights, spacers, excessive generic wrappers and unsafe absolute positioning;
- reward logical nesting, Auto Layout, consistent gap/padding and editable/repeated structure.

## P1 — Layout classifier

Horizontal row, vertical stack, two-column, grid, repeated cards, split header, facts/list, footer columns, carousel/track, timeline/chapter and decorative/background roles with confidence/evidence.

## P2 — Integrity + visual validation

Geometry, text/image fingerprints, node sanity, PNG export, pixel diff and exact validation failures.

## P3 — Transaction engine

Clone -> transform candidate -> validate -> commit/swap OR discard, with restore/undo path.

## P4 — Safe recipes

Vertical Stack, Horizontal Row, Two Column, Split Header, Facts List, Button Group, Footer Columns, Simple Card Grid, Metric Grid and Social/Link Strip.

## P5 — Advanced recipes

Timeline, alternating timeline, carousel viewport/track, fragmented card synthesis, milestone grids, overlay/media composition and page normalizer.

## P6 — Batch productivity

Sequential multi-frame queue, cancel/resume, per-frame reports and versioned processed metadata.

## P7 — Design-system advisory

Read-only repeated color/typography/button/card/global-style candidates. No automatic system rewrite without a separate safety spec.

## P8 — Optional Elementor exporter

Historical/deferred placeholder. The post-P12 plan now replaces this with a broader neutral target-adapter architecture in P15+.

# Post-P12 commercial expansion

Canonical contracts:

- `docs/COMMERCIAL_EXPANSION_PLAN.md` — commercial roadmap;
- `docs/MARKET_RESEARCH_PLAN.md` — R0 market/platform research;
- `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md` — R1 adapter/option/system reliability.

## R0 — Market / platform intelligence gate

Recurring planning gate, not a runtime feature.

- AI-assisted public web/market research;
- official platform-doc verification;
- competitor matrix;
- gap/differentiator analysis;
- target format/API stability classification;
- privacy/network/licensing review;
- roadmap/decision updates before adapter implementation.

## R1 — Reliability / compatibility gate

Recurring architecture/acceptance gate, not a runtime feature.

Before implementing a major target adapter, freeze:

- immutable versioned `TargetProfile`;
- machine-readable capability descriptor;
- option dependency/reset rules;
- source fingerprint/stale-result rules;
- target export state machine;
- structured error/retry/cancel model;
- atomic generation/download contract;
- schema/package/reference/assets validators;
- real import/build/render harness where applicable;
- precise readiness labels separating local artifact validity from observed target verification.

No adapter may expose invalid option combinations or claim live compatibility from local serialization alone.

## P13 — Build-Ready Score 2.0 + Responsive Risk

Read-only first.

- category-based Build-Ready score;
- Target Compatibility dimension;
- fixed-size/text-reflow/overflow/min-width risk;
- dense row/column risk;
- absolute normal-content dependencies;
- section/frame summaries;
- versioned score contract;
- source fingerprint for stale-result invalidation;
- no invented responsive design.

## P14 — Target-Ready Duplicate + Guided Prepare

- choose target profile;
- run target-readiness check;
- `Create Target-Ready Duplicate` when needed;
- proposed changes + confidence;
- proven Auto Layout/gap/padding/sizing/text-height recipes only;
- preserve legitimate overlays;
- candidate/duplicate -> full validation -> accept/reject;
- original remains unchanged;
- before/after target-ready score;
- cooperative cancellation and deterministic retry from safe boundaries.

## P15 — Elementor Native Export + Import Validation

Initial adapter families are separate:

- `elementor-v3-container`;
- `elementor-v4-atomic`;
- explicit Core/Pro capability overlays only where documented/tested.

Outputs are separate contracts:

- template JSON;
- template/multi-template ZIP where officially supported;
- website-template/kit ZIP only after kit-specific structure/dependency validation;
- selected-section artifact/bridge payload.

Checks:

- target data/schema version;
- modern Container/Atomic structure rules;
- widget mapping coverage;
- responsive settings coverage;
- unique IDs/references;
- global colors/fonts/classes/variables reference closure;
- asset references;
- package integrity;
- explicit unsupported Pro/third-party add-ons;
- layout/alignment validation;
- local artifact validation separated from actual live-site import verification.

A hybrid Elementor site chooses the intended output family; the generator does not silently mix v3/v4 architectures.

No undocumented clipboard reverse engineering.

## P16 — Gutenberg Native Export + Transfer

- versioned WordPress/block capability profile;
- native core-block mapping first;
- serialized block markup;
- pattern JSON export/import;
- selected section -> block/pattern artifact;
- parse -> serialize -> parse stability;
- real supported editor-open validation without invalid-block recovery prompts;
- optional WP Builders Bridge receiver;
- unsupported/custom-block cases become explicit REVIEW;
- theme/runtime differences are reported separately from serializer correctness.

## P17 — HTML/CSS/JS Export + Code-to-Design Import

### Design -> code
- semantic HTML;
- CSS/CSS variables;
- vanilla JS only for representable interactions;
- optional Tailwind adapter;
- assets + manifest;
- code package ZIP;
- atomic generation + validation before download.

### Code -> design
- HTML + CSS paste/upload;
- folder/ZIP import;
- static-first parser/reconstruction;
- archive path traversal, zip-bomb, file-count, nesting and oversize protections;
- remote resource auto-fetch disabled by default;
- JS disabled by default;
- any JS-enabled rendering must use a separately accepted sandbox/companion architecture;
- imported output creates a new reconstruction, not silent mutation of an approved design.

## P18 — Framework Adapter Platform

Initial target candidates, prioritized by R0 research:

- React;
- Next.js;
- Vue;
- Nuxt;
- Svelte/SvelteKit;
- Angular;
- Astro;
- optional React Native only after separate feasibility/safety specification.

Config options are capability-driven, not globally assumed:

- JS/TS;
- CSS/Tailwind/CSS Modules and accepted styling adapters;
- component granularity;
- routing/project scaffold;
- asset/token policy;
- component-library binding;
- accessibility/semantic preferences.

Reliability requirements:

- generated project dependency versions are pinned/adapter-bounded, never unbounded `latest`;
- every accepted adapter option matrix has fixture coverage;
- generated fixture projects install/typecheck/build in CI;
- changing framework/version/styling invalidates stale validation.

Add adapter SDK so new frameworks do not require core-scanner changes.

NestJS is treated as optional backend/API scaffold paired with a front-end target, not as a visual renderer.

## P19 — Asset Pack + Font Manifest + Design-System Export

- raster images;
- SVG/icons/vectors;
- **Stored Original** image bytes for Figma image fills when `getImageByHash(...).getBytesAsync()` is available;
- **Rendered Appearance** for crop/mask/effects/composited appearance;
- rendered display-size / 1x / 2x / custom scale modes;
- deterministic naming/de-duplication;
- asset usage manifest;
- font family/style/weight/usage manifest;
- missing-font report;
- raw font files only when separately user-supplied and license-permitted;
- colors/typography/spacing/radii/shadows/tokens;
- CSS variables/framework token adapters;
- documented Elementor variables/classes and Gutenberg/theme.json mapping where supported.

Stored image bytes are not marketed as proven upstream-upload provenance when Figma cannot prove that provenance.

## P20 — Round-Trip Visual QA + Exact Section Portability

- generate target artifact;
- render in controlled target harness;
- compare geometry/content/assets/pixels against Figma;
- calibrated PASS/REVIEW/BLOCKED;
- export receipt tied to source fingerprint + target profile + adapter version;
- Elementor section/container artifact;
- Gutenberg pattern/block artifact;
- versioned clipboard/bridge payload;
- optional `WP Builders Bridge` WordPress companion plugin using file/paste import first.

Current Community core remains offline. Arbitrary direct push to customer WordPress domains is separate future networked scope.

## P21 — Developer Handoff + Client/QA + Bounded A11y/SEO Advisories

- Build-Ready/Target-Ready report;
- exact validation level: SOURCE READY / ARTIFACT VALIDATED / IMPORT VERIFIED / RENDER VERIFIED / ROUND-TRIP VERIFIED / REVIEW / BLOCKED;
- responsive risks;
- target mapping limitations;
- asset/font/token summary;
- validation history;
- unresolved backlog;
- heading hierarchy;
- alt-text presence/placeholder checks;
- deterministic contrast check where resolvable;
- CTA/link naming completeness;
- obvious media/performance advisories;
- stable error codes and actionable recovery notes.

Not a claim of complete legal accessibility or SEO compliance.

## P22 — Deterministic Complexity / Effort Estimator

- pages/frames;
- reusable vs unique sections;
- target adapter/manual mapping burden;
- forms/carousels/navigation/components;
- responsive risk;
- manual-layout debt;
- assets/media;
- selected dynamic/CMS needs;
- complexity band;
- configurable effort units/hours;
- user-defined monetary rules;
- structured proposal inputs.

No opaque AI market-price guessing.

## P23 — Agency / Project / Existing-Component Layer

- audit/export presets;
- bounded custom rules;
- client standards;
- white-label reports;
- sequential project export;
- baseline/re-audit comparison;
- change-only regeneration;
- export history/target-version history;
- bind Figma components to existing React/Vue/etc components and props;
- target-profile version history and deterministic regeneration receipts.

## P24 — CMS / Dynamic Data / Forms / Interactions

After static output is stable:

- WordPress posts/CPT/taxonomy intent;
- Elementor dynamic tags where documented and explicitly selected;
- Gutenberg query/pattern relationships where supported;
- forms/fields;
- menu/navigation intent;
- supported prototype interactions;
- CMS/data placeholders for framework exports.

Never infer a real production data source from visuals alone.

## P25 — Commercial Packaging / Entitlements

Suggested tiers:

- **Free:** audit, basic score, limited asset + HTML/report export.
- **Pro:** full target analysis, target-ready duplicate, Elementor/Gutenberg, code/framework exports, full assets, round-trip QA, design-system output, handoff and estimator.
- **Agency:** batch/project, presets/rules, white label, component bindings, change-only regeneration, configurable estimator.

Entitlements gate surfaces, not deterministic correctness.

## P26 — Optional AI Assistance

Opt-in and non-authoritative.

May:
- synthesize market research;
- explain deterministic findings;
- summarize backlog;
- explain target options;
- draft developer/proposal notes from structured outputs.

May not:
- authorize mutation;
- override confidence/validation;
- invent and silently apply responsive design;
- replace target schema validation;
- run untrusted code outside accepted sandbox;
- claim unsupported compatibility;
- exfiltrate design content without explicit future consent/privacy specification.

## Additional differentiators to keep in research queue

- Export Preview Lab with desktop/tablet/mobile target preview.
- Target capability matrix: Native / Review / Unsupported percentages before export.
- Shareable exact-run readiness certificate.
- Bricks and other WordPress-builder adapters after Elementor/Gutenberg.
- Adapter SDK/marketplace after contracts stabilize.
- Revision diff + regenerate-only-changed sections.
