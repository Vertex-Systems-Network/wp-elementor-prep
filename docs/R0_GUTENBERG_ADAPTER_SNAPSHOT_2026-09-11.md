# R0 Gutenberg / WordPress Block Editor Adapter Snapshot — 2026-09-11

Status: retained planning evidence for P16; not runtime acceptance  
Roadmap owner: #119  
Research date: 2026-09-11

## Purpose

This snapshot refreshes first-party WordPress/Gutenberg documentation before freezing P16. It records only behavior supported by current official WordPress documentation and separates documented block serialization from higher-level import wrappers whose full file schema is not public in the same detail.

## First-party sources reviewed

### Block serialization and parser

1. WordPress Block Editor Handbook — Data Flow and Data Format  
   https://developer.wordpress.org/block-editor/explanations/architecture/data-flow/

   Current documented behavior:
   - block editor content is represented as an in-memory tree of blocks;
   - when saved, blocks are serialized into `post_content`;
   - block identity/attributes are encoded using block comment delimiters around/within HTML;
   - loading performs the reverse parse back into a block tree.

2. `@wordpress/block-serialization-default-parser`  
   https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-serialization-default-parser/

   Current documented behavior:
   - WordPress ships JavaScript and PHP default parser implementations;
   - the parser converts serialized block markup into block structures;
   - it implements the serialization specification used for WordPress documents.

3. `@wordpress/block-serialization-spec-parser`  
   https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-serialization-spec-parser/

   Current documented behavior:
   - the formal serialization grammar is published;
   - parsing serialized block markup is therefore a documented contract rather than an undocumented clipboard format.

### Patterns

4. WordPress Documentation — Site Editor Patterns  
   https://wordpress.org/documentation/article/site-editor-patterns/

   Current documented behavior:
   - custom patterns can be imported from JSON;
   - individual custom patterns can be exported as JSON;
   - multiple patterns can be exported as a ZIP containing JSON files;
   - pattern/template-part management through Site Editor depends on a Block theme.

5. WordPress Documentation — Block Patterns  
   https://wordpress.org/documentation/article/block-pattern/

6. WordPress Documentation — Comparing Patterns, Template Parts and Synced Patterns  
   https://wordpress.org/documentation/article/comparing-patterns-template-parts-and-reusable-blocks/

   Current documented semantics:
   - Patterns are suited to repeated design/layout;
   - Template Parts are for repeated structural site areas such as Header/Footer and require compatible theme/editor context;
   - Synced Patterns represent reusable content whose edits propagate to usages.

### Block capabilities and theme constraints

7. WordPress Block Editor Handbook — Block Supports  
   https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/

   Current documented behavior:
   - block support for spacing, dimensions, layout, typography, color, shadow and other style capabilities is declared per block;
   - a UI/control being available depends on the block and, in some cases, theme support.

8. WordPress Block Editor Handbook — `theme.json` Global Settings & Styles  
   https://developer.wordpress.org/block-editor/how-to-guides/themes/global-settings-and-styles/

9. WordPress Block Editor Handbook — theme.json v3 reference  
   https://developer.wordpress.org/block-editor/reference-guides/theme-json-reference/theme-json-living/

10. WordPress Theme Handbook — Layout / Spacing  
    https://developer.wordpress.org/themes/global-settings-and-styles/settings/layout/  
    https://developer.wordpress.org/themes/global-settings-and-styles/settings/spacing/

    Current documented behavior:
    - a theme can constrain content/wide widths;
    - spacing controls/allowed units and `blockGap` behavior depend on theme.json settings;
    - layout/style options that appear in the editor are not universally available across every theme/configuration.

### Core block examples

11. WordPress Block Editor Handbook — Group  
    https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-design/core-block-group/

12. WordPress Block Editor Handbook — Column  
    https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-design/core-block-column/

    Current documented behavior:
    - core layout blocks serialize to block comments + HTML;
    - individual blocks declare concrete supports and markup;
    - Group/Columns/Column are not interchangeable generic containers; mappings must respect each block's capabilities.

## Reliability conclusions

### 1. Native Gutenberg output is serialized block markup first

The strongest documented machine contract is WordPress's serialized block format stored in `post_content` and its official parser grammar.

Therefore P16's first required native artifact is **serialized core-block markup** that:

1. parses successfully with the WordPress parser;
2. serializes back deterministically;
3. parses again to the same semantic block tree;
4. opens in a supported editor without invalid-block recovery prompts.

### 2. Pattern JSON is a separate wrapper contract

WordPress documents importing/exporting custom patterns as JSON, but the end-user documentation reviewed here does not define every field/version of the exported JSON wrapper with the same formal detail as the block serialization grammar.

Therefore:

- Pattern JSON is supported only after retaining canonical real WordPress pattern-export fixtures and round-trip import tests;
- multiple-pattern ZIP is a separate package capability with its own validator;
- serialized native block markup remains the canonical inner content even when wrapped in pattern JSON.

### 3. Theme context is part of compatibility

A block artifact can parse correctly yet render differently because the active theme/theme.json controls:

- content/wide widths;
- spacing controls and units;
- color/typography presets;
- blockGap;
- dimension/layout support;
- template-part/site-editor capability.

Therefore P16 must separate:

- local block syntax validity;
- theme capability compatibility;
- observed import/editor validity;
- observed render fidelity.

### 4. Core blocks first

Initial P16 should prioritize native Core blocks because they have first-party schemas/markup and avoid plugin lock-in.

Custom/third-party blocks are allowed only through explicit TargetProfile capabilities and real dependency fixtures. Unknown custom block output is not generated by guessing its attributes.

### 5. Pattern vs Template Part vs Synced Pattern must be explicit

These WordPress concepts have different semantics. The exporter must not label every selected Figma section as a Template Part or Synced Pattern.

Default section portability should produce a **standard non-synced Pattern** or native block fragment when the wrapper/import capability is accepted.

Headers/footers may be eligible for Template Part output only when target theme/editor capability is explicit.

### 6. Theme presets/references need closure

If generated block attributes reference theme presets (color, spacing, typography), the target must contain matching presets or the artifact must use accepted literal/custom values.

No dangling `var:preset|...` or equivalent theme-dependent reference may be described as render verified without the observed target theme providing it.

### 7. Copy/paste cannot rely on undocumented editor clipboard internals

The user goal of `Copy for Gutenberg` is valid, but the reliable implementation should use:

- documented serialized block markup;
- Pattern JSON import where fixture-backed;
- or a versioned WP Builders Bridge receiver.

The core plan does not depend on reverse-engineering private Gutenberg clipboard MIME/data behavior.

### 8. Responsive claims require caution

WordPress block responsive behavior comes from block markup/styles, theme CSS, intrinsic layout and evolving editor capabilities. P16 must not assume a universal Elementor-style device settings model.

P13/P14 responsive evidence may guide safe native layout choices, but if the theme/block model cannot represent a required breakpoint behavior deterministically, the item stays REVIEW or uses an explicitly accepted CSS/bridge fallback.

## Verification levels

P16 should preserve the same evidence ladder as other target adapters:

- `SOURCE COMPATIBLE`;
- `PREPARED`;
- `ARTIFACT VALIDATED` — block markup parses/serializes/re-parses and references/assets are closed;
- `IMPORT VERIFIED` — pattern/block artifact successfully entered a supported WordPress editor/site;
- `EDITOR VERIFIED` — no invalid-block recovery and expected blocks remain editable;
- `RENDER VERIFIED` — supported viewport/theme render checks pass;
- later `ROUND-TRIP VERIFIED`.

An artifact can be syntactically valid while not render-equivalent under an unobserved theme.

## Re-research trigger

Refresh before implementation/acceptance when any materially changes:

- block serialization/parser contract;
- Core block attributes/supports used by shipped mappings;
- Pattern import/export wrapper;
- theme.json schema/support behavior;
- Site Editor/Template Part capability;
- responsive/device-specific block behavior;
- current supported WordPress versions.

This snapshot does not unblock P16 runtime implementation while #84/P13/P14/P15 dependencies remain open.
