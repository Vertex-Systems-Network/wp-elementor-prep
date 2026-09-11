# Market Research Plan

Status: PLANNED / CONTINUOUS AI-NATIVE GOVERNANCE INPUT  
Date: 2026-09-11  
Owner issue: #119

## Purpose

WP Builders Prepare will use AI-assisted public-market research as a recurring planning input so product decisions stay aligned with current Figma, WordPress, Elementor, Gutenberg and design-to-code workflows.

Research is advisory. It may change roadmap priorities only through an explicit documented decision and never overrides deterministic runtime safety rules.

## Mandatory research loop

Run before the first implementation issue of each major post-P12 adapter/capability, and refresh at least once per major release planning cycle:

1. **Market scan** — current competing products, official platform capabilities, pricing/packaging patterns, onboarding friction and high-value workflows.
2. **Official-platform verification** — prefer official Elementor, WordPress/Gutenberg, Figma and framework documentation for import/export/data-format claims.
3. **Competitor matrix** — record what established tools already provide so WP Builders Prepare does not compete only on commodity conversion.
4. **Gap analysis** — identify differentiators that fit our safety model: readiness validation, target-aware duplicate preparation, deterministic output, round-trip visual QA, exact-build provenance, asset control, section-level portability and agency governance.
5. **Feasibility/risk review** — classify each idea as documented/stable, adapter-sensitive, undocumented/risky, network-dependent, licensing-sensitive or impossible through the current Figma Plugin API.
6. **Roadmap decision** — add/change scope only through `DECISIONS.md`, issue acceptance criteria and roadmap synchronization.
7. **Post-release observation** — compare user friction/support requests against the research assumptions and feed evidence into the next cycle.

## September 2026 research snapshot

### WordPress / Elementor

Official Elementor documentation confirms:

- Elementor templates can be imported as JSON or ZIP into the Template Library.
- Elementor website templates/kits can be exported/imported as ZIP and can include content, templates and site settings.
- Elementor's documented data model uses JSON and supports modern nested `container` structures; current developer docs also document Atomic elements as a separate evolving schema.
- Responsive values are stored as device-specific settings, so generated responsive settings must remain adapter/version aware.
- Elementor supports cross-site copy/paste between Elementor editors when compatible features are enabled, but WP Builders Prepare must not depend on undocumented clipboard internals.

Product implication: build documented JSON/ZIP adapters first; use an optional WordPress-side bridge for robust one-click section transfer rather than reverse-engineering private clipboard formats.

### WordPress / Gutenberg

Official WordPress documentation confirms:

- Gutenberg stores blocks as serialized block markup in post content.
- `@wordpress/blocks` provides serialization APIs.
- user-created patterns can be imported/exported as JSON.

Product implication: a Gutenberg adapter can target native core-block/pattern structures and a safe serialized-block clipboard payload, with validation before export.

### Design-to-code competition

Current market products already advertise Figma-to-code output for combinations of HTML/CSS, React, Vue and other front-end frameworks. A leading WordPress-focused competitor also advertises native Elementor, Gutenberg and Bricks conversion plus direct import/copy workflows.

Product implication: plain "Figma to HTML/React" is not enough differentiation. WP Builders Prepare should compete on **pre-export validation + deterministic target preparation + native editable output + round-trip visual QA + multi-target adapters + agency governance**.

### Figma asset capabilities and limits

Official Figma Plugin API documentation supports node export to PNG/JPG/SVG/PDF and other encoded formats through `exportAsync`. Font APIs expose font identity/availability for editing but do not expose a general raw-font-file export API.

Product implication:

- image/icon/vector export is a first-class supported feature;
- offer original-source bytes only where the Figma API actually exposes/reconstructs them safely; otherwise label the export as rendered/exported output;
- font export from the Figma document means **font manifest + family/style/usage mapping** by default;
- raw font binaries may only be packaged when the user separately supplies legally usable font files through a future local/companion flow. Never claim Figma can export font binaries when the API does not expose them.

## Differentiation priorities discovered by research

1. Target-aware **duplicate-and-prepare** before export instead of blind conversion.
2. Native Elementor/Gutenberg structures, not flattened screenshots or generic HTML wrappers.
3. Validation gates before every downloadable/importable artifact.
4. Section-level portability plus full-page/project export.
5. Round-trip rendered comparison: Figma source vs generated target preview.
6. Deterministic asset pack with explicit original-vs-rendered image policy.
7. Framework adapter SDK rather than one hard-coded code generator.
8. Code-to-design import with strict sandboxing and static-first behavior.
9. Existing-component binding so teams can map Figma components to their own React/Vue/WordPress component libraries.
10. Agency presets, client QA, white-label evidence and reproducible estimates.

## Research evidence policy

- Prefer official docs for platform-format claims.
- Competitor marketing claims are market signals, not acceptance evidence.
- Never copy proprietary schemas, code or undocumented clipboard formats.
- If a target requires undocumented reverse engineering, mark it REVIEW/BLOCKED and prefer a companion adapter/plugin using documented extension points.
- Research findings do not grant implementation or production-acceptance percentage.
