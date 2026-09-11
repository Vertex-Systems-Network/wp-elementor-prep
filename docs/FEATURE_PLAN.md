# Feature Plan

Date: 2026-09-07  
Post-P12 multi-target expansion aligned: 2026-09-11

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

Canonical contract: `docs/COMMERCIAL_EXPANSION_PLAN.md`. Market process: `docs/MARKET_RESEARCH_PLAN.md`.

## R0 — Market / platform intelligence gate

Recurring planning gate, not a runtime feature.

- AI-assisted public web/market research;
- official platform-doc verification;
- competitor matrix;
- gap/differentiator analysis;
- target format/API stability classification;
- privacy/network/licensing review;
- roadmap/decision updates before adapter implementation.

## P13 — Build-Ready Score 2.0 + Responsive Risk

Read-only first.

- category-based Build-Ready score;
- Target Compatibility dimension;
- fixed-size/text-reflow/overflow/min-width risk;
- dense row/column risk;
- absolute normal-content dependencies;
- section/frame summaries;
- versioned score contract;
- no invented responsive design.

## P14 — Target-Ready Duplicate + Guided Prepare

- choose target;
- run target-readiness check;
- `Create Target-Ready Duplicate` when needed;
- proposed changes + confidence;
- proven Auto Layout/gap/padding/sizing/text-height recipes only;
- preserve legitimate overlays;
- candidate/duplicate -> full validation -> accept/reject;
- original remains unchanged;
- before/after target-ready score.

## P15 — Elementor Native Export + Import Validation

- modern Container JSON adapter;
- Atomic adapter only where documented/stable;
- Elementor Pro widget mappings only when selected and supported;
- template JSON export;
- ZIP/library import package where documented;
- website-template/kit ZIP only after real documented compatibility validation;
- global colors/fonts/classes/variables mapping;
- responsive settings adapter;
- alignment/layout/widget/asset/package validation;
- full page + selected section artifact;
- optional WordPress bridge path for robust section transfer;
- no undocumented clipboard reverse engineering.

## P16 — Gutenberg Native Export + Transfer

- native core-block mapping first;
- serialized block markup;
- pattern JSON export/import;
- selected section -> block/pattern artifact;
- parse/serialize round-trip validation;
- supported WordPress-version contract;
- optional WP Builders Bridge receiver;
- unsupported/custom-block cases become explicit REVIEW.

## P17 — HTML/CSS/JS Export + Code-to-Design Import

### Design -> code
- semantic HTML;
- CSS/CSS variables;
- vanilla JS only for representable interactions;
- optional Tailwind adapter;
- assets + manifest;
- code package ZIP.

### Code -> design
- HTML + CSS paste/upload;
- folder/ZIP import;
- static-first parser/reconstruction;
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

Config options:

- JS/TS;
- CSS/Tailwind/CSS Modules and accepted styling adapters;
- component granularity;
- routing/project scaffold;
- asset/token policy;
- component-library binding;
- accessibility/semantic preferences.

Add adapter SDK so new frameworks do not require core-scanner changes.

NestJS is treated as optional backend/API scaffold paired with a front-end target, not as a visual renderer.

## P19 — Asset Pack + Font Manifest + Design-System Export

- raster images;
- SVG/icons/vectors;
- source/display/custom-scale image policy;
- deterministic naming/de-duplication;
- asset usage manifest;
- font family/style/weight/usage manifest;
- missing-font report;
- raw font files only when separately user-supplied and license-permitted;
- colors/typography/spacing/radii/shadows/tokens;
- CSS variables/framework token adapters;
- documented Elementor variables/classes and Gutenberg/theme.json mapping where supported.

## P20 — Round-Trip Visual QA + Exact Section Portability

- generate target artifact;
- render in controlled target harness;
- compare geometry/content/assets/pixels against Figma;
- calibrated PASS/REVIEW/BLOCKED;
- export receipt tied to source audit/adapter version;
- Elementor section/container artifact;
- Gutenberg pattern/block artifact;
- versioned clipboard/bridge payload;
- optional `WP Builders Bridge` WordPress companion plugin.

## P21 — Developer Handoff + Client/QA + Bounded A11y/SEO Advisories

- Build-Ready/Target-Ready report;
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
- READY / REVIEW / BLOCKED reasons.

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
- bind Figma components to existing React/Vue/etc components and props.

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
- Target capability matrix: Native / Converted / Review percentages before export.
- Shareable exact-run readiness certificate.
- Bricks and other WordPress-builder adapters after Elementor/Gutenberg.
- Adapter SDK/marketplace after contracts stabilize.
- Revision diff + regenerate-only-changed sections.
