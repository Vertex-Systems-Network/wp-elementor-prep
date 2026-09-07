# Deep Audit

Date: 2026-09-07

## Repository audit

At project start the repository contained only a one-line README and no application source, tests, CI, specification, architecture, or state tracking. This is useful because there is no legacy code to preserve, but it also means all engineering contracts must be established before mutation logic is written.

### Current risks from an empty baseline

- No canonical definition of “Elementor ready”.
- No testable layout-classification contract.
- No rollback safety model.
- No versioned memory/state for future AI agents.
- No fixture strategy.
- No CI guardrails.
- High risk of overfitting to one design if implementation starts directly from node IDs.

## Golden Figma audit

The initial working reference desktop is 1143 × 18794 and contains approximately:

- 1152 nodes,
- 715 frame-like nodes,
- 270 Auto Layout frames,
- 445 non-Auto-Layout frames,
- about 38% Auto Layout coverage,
- 433 text nodes.

The duplicate/reference comparison previously showed equal dimensions, equal descendant/text counts and no text-sequence mismatches.

### Existing strong sections

The reference page already demonstrates that the scanner must not assume every section needs repair. Examples with strong Auto Layout coverage include Identity, Recognition, Expertise, Credentials, Quote, and Testimonials. Hero is also substantially structured.

### Weak pattern families discovered

- About: clear 60/40 two-column composition but many manual frames.
- Philosophy: split header plus card/grid region; heavy manual positioning.
- Journey: outer vertical stack with five repeated chapters, but chapter internals are mostly manual and include overlays/decorative content.
- Numbers: repeated two-column metric grid, including a fragmented metric cell that is not wrapped consistently.
- Sector: repeated card layout with very low Auto Layout coverage.
- Beyond Work: split heading/description plus repeated content/cards.
- Media: likely carousel/track behavior where an internal horizontal region may intentionally exceed viewport width.
- Milestones: repeated timeline/grid plus controls; significant manual positioning.
- Contact: footer structure is partly vertical Auto Layout but main columns are still a manual horizontal composition.
- Social Strip: top-level horizontal row exists, but internal wrappers are overly generic/manual.

## Technical feasibility audit

### Figma Plugin API

The Plugin API supports the required foundation:

- dynamic page loading via `documentAccess: "dynamic-page"`,
- network restriction via `networkAccess.allowedDomains`, including `["none"]`,
- strict TypeScript typings via `@figma/plugin-typings`,
- node traversal and geometry inspection,
- Auto Layout properties on frames,
- node cloning for candidate transactions,
- PNG export via `exportAsync()` for visual comparison,
- plugin-private node metadata with `setPluginData()`.

Official references:

- https://developers.figma.com/docs/plugins/manifest/
- https://developers.figma.com/docs/plugins/api/typings/
- https://developers.figma.com/docs/plugins/api/properties/nodes-exportasync/
- https://developers.figma.com/docs/plugins/api/properties/nodes-setplugindata/
- https://developers.figma.com/docs/plugins/migrating-to-dynamic-loading/

### Elementor architecture

Elementor’s modern data model supports nested layout elements and stores page content as structured JSON. Containers can contain nested containers/widgets. Elementor is also introducing atomic layout element schemas (`e-div-block`, `e-flexbox`, `e-grid`). Therefore the plugin should maintain an internal neutral layout model and isolate any future Elementor exporter behind schema adapters rather than coupling the Figma audit engine directly to one JSON version.

Official references:

- https://developers.elementor.com/docs/data-structure/
- https://developers.elementor.com/docs/data-structure/container-element
- https://developers.elementor.com/docs/data-structure/atomic-elements

## Critical product risks

### 1. False-positive Auto Layout conversion

Setting Auto Layout changes child positioning behavior. A visually correct static composition can be broken even when a structural inference seems plausible.

Mitigation: audit first; candidate clone; validate; commit/rollback.

### 2. Decoration mistaken for content

Full-bleed backgrounds, large years, low-opacity lettering, timeline lines, overlays and badges can create overlaps that would confuse a simple row/column classifier.

Mitigation: decoration/background classification before flow classification.

### 3. Carousel mistaken for overflow bug

An intentionally wide horizontal track can exceed the visible viewport.

Mitigation: detect repeated horizontal cards + clipping/viewport context; preserve track width.

### 4. Fragmented semantic groups

A metric/card may exist as several siblings instead of one parent wrapper.

Mitigation: cluster-by-cell logic with confidence scoring; never synthesize a wrapper at low confidence.

### 5. Generic-name overfitting

Many frames are named `Container`, `Text`, or `Heading 2`. Names are weak evidence.

Mitigation: geometry and node composition are primary; names are a secondary feature only.

### 6. Large-file performance

Scanning all pages and all nodes eagerly can be slow.

Mitigation: selected-frame scope first, dynamic page access, typed/filtered traversal, cache normalized snapshots, batch pages only after single-frame reliability is proven.

### 7. Visual-diff cost

Exporting every descendant to PNG would be expensive.

Mitigation: compare at section/candidate level, use geometry/content integrity first, pixel diff only for transformed candidates or user-requested strict validation.

## Audit conclusion

The project is feasible without runtime AI. The main difficulty is not Figma API access; it is building an explainable, conservative layout classifier and a transactional validation system that avoids silent visual damage. Therefore the correct first implementation is Audit-Only, not Auto-Fix.
