# R0 Asset + Design Token Snapshot — 2026-09-11

Status: RESEARCH / PLANNING-ONLY  
Owner roadmap issue: #119  
Target phase: P19 — Asset Pack + Design-System Export  
Dependencies: #84 P12 internal release exit; accepted P17/P18 neutral target contracts  
Date: 2026-09-11

## 1. Purpose

This snapshot records current platform facts that constrain P19 asset and design-system export. It is planning evidence only and does not open P19 runtime implementation.

P19 must preserve source truth. It should export actual reusable assets/tokens where the source proves them, while keeping inferred/recommended design-system structure visibly separate from source-bound facts.

## 2. Figma asset export observations

Current Figma Plugin API `exportAsync` supports native export paths including PNG/JPG, PDF and SVG string, with additional supported export formats depending on node/content type. The default export without settings is PNG at 1x.

P19 consequences:

- asset export should use Figma-native export capabilities rather than screenshotting nodes through an unrelated browser path;
- export format/scale/settings must be part of the immutable asset receipt;
- source node identity and resulting content hash must be retained;
- a visual layer is not automatically an exportable product asset: export intent remains explicit/derived through accepted classification rules;
- optimized derivatives must remain distinguishable from original/native exports.

## 3. Figma variable observations

Current Figma Plugin API exposes local variables and variable collections, including collection modes and bound-variable information. Figma variables can represent reusable values and aliases applied to design properties.

The Figma REST Variables API also exists, but access is plan/account/scope constrained; current documentation requires Enterprise access for these endpoints and write operations have additional seat/permission requirements.

P19 consequences:

- the in-plugin source path should be the primary offline-compatible source for local variable/token extraction;
- REST-variable support is an optional connected capability and must not become a requirement for the Figma Community plugin;
- variable IDs/collection IDs are source identities, not portable cross-tool token IDs;
- modes and aliases must survive normalization rather than being flattened silently to one resolved value;
- remote/library provenance must remain explicit.

## 4. Async API preference

Current Figma documentation deprecates several synchronous variable/node lookup methods in favor of async variants, especially under dynamic-page document access.

P19 consequence:

- future implementation should prefer supported async Plugin API calls and not freeze new architecture around deprecated synchronous accessors.

## 5. Design Tokens Community Group format

The Design Tokens Community Group (DTCG) published its first stable specification as version `2025.10`. It provides a tool-neutral JSON interchange format for design tokens. The specification is a Community Group specification rather than a W3C Standards Track Recommendation.

P19 consequences:

- P19 should support DTCG `2025.10` export as a first-class interchange target after schema/fixture acceptance;
- WP Builders may retain an internal richer token IR for provenance/modes/target mappings, then emit DTCG rather than making a proprietary JSON shape the only portable format;
- tool-specific information belongs in namespaced/owned metadata extensions or sidecar receipts, not by corrupting standard token semantics;
- implementation-time R0 refresh is required before pinning future DTCG versions.

## 6. WordPress design-system mapping observations

Current WordPress `theme.json` version 3 is the latest living schema. It includes settings/styles for color, typography, spacing, dimensions, layout, shadow and other theme capabilities. WordPress exposes preset concepts that can be mapped from an accepted token system, but target theme/version capability still controls whether a value can be represented natively.

P19 consequences:

- `theme.json` is a target adapter output, not the neutral token model;
- token -> WordPress preset mapping must retain unsupported/unmapped evidence;
- generated `theme.json` must validate against the selected WordPress-version schema;
- spacing/color/typography/shadow mappings should be deterministic and target-capability aware;
- a design token is not automatically a global WordPress preset if source evidence says it is local/one-off.

## 7. Frozen architecture decisions

1. **Source-bound and inferred tokens are different evidence classes.**
2. **Figma Variables are preferred source truth when bound and available.** Repeated raw values may become candidates, not silently canonical tokens.
3. **Aliases and modes are preserved.** Flattening is an explicit target transformation only.
4. **Neutral Token IR is target-independent.** DTCG, CSS variables, WordPress presets and framework token modules are emitters.
5. **Asset identity is content-hash based plus source provenance.** Filenames are not identity.
6. **No arbitrary font extraction.** Font binaries are packaged only through the existing user-supplied/license-permitted contract.
7. **No hidden remote downloads in the offline plugin.** Remote assets/fonts remain declared external/missing until supplied through an accepted path.
8. **Optimization is non-destructive.** Original/native export and optimized derivative both retain provenance.
9. **Usage evidence matters.** Token candidates record where values are used and bound.
10. **Target design-system exports are versioned adapters.** Elementor, Gutenberg/theme.json, CSS, Tailwind/framework targets consume the same neutral token/asset model.

## 8. Initial token families

P19 should initially normalize only families with clear portable semantics:

- color;
- dimension/spacing;
- typography composite/constituents;
- border/radius where accepted;
- shadow;
- opacity;
- duration/easing only when source/prototype evidence is deterministic;
- boolean/string/number source variables retained where useful to target adapters.

Gradient, complex paint/effect, responsive and component-token semantics require explicit typed representations and should not be flattened into color/string tokens merely for export coverage.

## 9. Candidate-token boundary

Repeated raw values that are not source variables/styles can be analyzed as candidates.

A candidate record should include:

- normalized value;
- source occurrences;
- semantic contexts;
- frequency;
- similarity cluster evidence where relevant;
- proposed role/name;
- confidence;
- conflicts;
- source-bound-token overlap.

Candidate tokens are never published as `SOURCE TOKEN` without user confirmation or source binding evidence.

## 10. Asset pack boundary

Initial pack may include accepted subsets of:

- SVG/vector exports;
- raster image exports;
- icons/logos explicitly selected/classified for export;
- image fills that can be resolved through accepted Figma capabilities;
- generated previews/thumbnails clearly labeled derivative;
- manifest + hashes + usage map.

It does not silently include every layer rendered to an image.

## 11. R0 refresh triggers

Refresh this snapshot before implementation if:

- Figma export/Variables APIs materially change;
- Figma introduces new portable token/library APIs relevant to P19;
- DTCG publishes a new stable version;
- selected WordPress/theme.json schema changes materially;
- P19 adds remote asset fetching;
- P19 adds font extraction/licensing behavior;
- P19 adds optimization codecs or external binaries;
- Elementor/other target design-system APIs gain an accepted public machine contract.

## 12. Non-authorizing statement

This document does not advance P12, authorize P19 implementation, authorize remote asset downloads, or grant production acceptance to any design-system target adapter.