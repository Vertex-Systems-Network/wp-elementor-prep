# P16 Gutenberg Native Export + Section Transfer — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; P13 and P14 production acceptance; P15 sequencing per roadmap  
R0 source snapshot: `docs/R0_GUTENBERG_ADAPTER_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P16 converts a supported Figma source or P14 Prepared Duplicate into editable native WordPress Block Editor content, with deterministic Core-block mapping, parse/serialize validation, theme capability awareness and safe section transfer.

The objective is not to dump visual HTML into WordPress. The output should remain understandable and editable as Gutenberg/Core blocks wherever the target model supports the design.

## 2. Canonical user flow

`Select Frame/section -> Choose Gutenberg profile -> Compatibility Scan -> Prepare Duplicate if required -> Map to native blocks -> Serialize -> Parse/Serialize/Parse validation -> Optional Pattern wrapper -> Import/Editor verification -> Render verification -> Download/Transfer + receipt`

No user-facing success state may imply target import/render proof unless that proof was actually observed.

## 3. Adapter identity

Initial adapter ID:

`wordpress-gutenberg-core`

Future adapter families may include:

- block-theme-aware site parts;
- supported WooCommerce blocks;
- explicitly supported third-party block libraries;
- custom organization block libraries.

These remain separate capabilities/profile overlays rather than silent fallbacks.

## 4. Immutable Gutenberg TargetProfile

Suggested shape:

```ts
interface GutenbergTargetProfileV1 {
  schemaVersion: 1;
  adapterId: "wordpress-gutenberg-core";
  adapterVersion: number;
  wordpressVersion: ObservedOrDeclaredVersion;
  editor: {
    siteEditorAvailable: ObservedOrDeclaredBoolean;
    blockTheme: ObservedOrDeclaredBoolean;
  };
  theme?: {
    slug?: ObservedOrDeclaredString;
    themeJsonVersion?: ObservedOrDeclaredVersion;
    capabilities: ThemeCapabilitySnapshot;
    presets?: ThemePresetSnapshot;
  };
  blocks: BlockCapabilitySnapshot;
  artifact: GutenbergArtifactProfile;
}
```

Every target/environment value retains provenance:

- `OBSERVED`;
- `DECLARED`;
- `DEFAULT_ASSUMED` only where harmless and documented;
- `UNKNOWN`.

## 5. Artifact families

### 5.1 Serialized block markup — REQUIRED FIRST

Canonical inner artifact is WordPress block serialization suitable for `post_content`, for example nested `<!-- wp:* -->` block delimiters plus valid saved markup.

It is accepted only after:

- parse succeeds;
- semantic block tree passes schema/capability validation;
- serialize succeeds;
- re-parse yields the same normalized semantic tree;
- references/assets are closed.

### 5.2 Standard Pattern JSON — CONDITIONAL

WordPress documents Pattern JSON import/export. P16 enables generated Pattern JSON only after canonical real WordPress exported-pattern fixtures establish the wrapper fields expected by supported target versions and round-trip import succeeds.

### 5.3 Multi-pattern ZIP — CONDITIONAL

WordPress documents bulk pattern export as ZIP containing JSON pattern files. Generation is a separate package capability with:

- path/file validation;
- file count/size bounds;
- one validated JSON wrapper per pattern;
- deterministic package receipt.

### 5.4 Template Part — TARGET/ROLE DEPENDENT

Header/footer/site-part output is enabled only if:

- source role is explicit enough;
- target uses compatible Site Editor/block-theme capability;
- Template Part fixture/import flow is accepted.

A normal content section is not silently converted into a Template Part.

### 5.5 Synced Pattern — EXPLICIT ONLY

Synced Pattern semantics propagate edits across usages. Therefore P16 never chooses synced behavior automatically. User must explicitly request it through a supported bridge/target workflow.

## 6. Compatibility classification

Each source node/group maps to one of:

- `NATIVE_CORE`;
- `NATIVE_CORE_WITH_REVIEW`;
- `CONVERTIBLE`;
- `FALLBACK`;
- `CUSTOM_BLOCK_REQUIRED`;
- `UNSUPPORTED`;
- `UNKNOWN`.

Coverage remains visible. Unknown nodes never disappear from the denominator merely to make compatibility look higher.

## 7. Core-block-first mapping

Initial reliable mappings should prioritize documented Core blocks.

Potential mapping families:

- semantic text -> `core/paragraph`, `core/heading`, `core/list` where role is clear;
- images -> `core/image`;
- button groups -> `core/buttons` + `core/button`;
- grouped containers -> `core/group` with accepted layout attributes;
- two-column structures -> `core/columns` + `core/column` when constraints match;
- separators -> `core/separator` when semantically appropriate;
- spacer only when source intent genuinely requires spacing not better represented by blockGap/padding;
- quote/pullquote/media-text only when semantic/layout evidence meets accepted mapping rules.

Every mapping is versioned against the target WordPress/Core block capability profile.

## 8. Group vs Columns vs other layout blocks

The adapter must not treat every Figma frame as a generic Group.

Mapping policy:

- flow container with one-dimensional layout -> Group with supported layout attributes where appropriate;
- true column structure -> Columns/Column only when child behavior matches the Core block contract;
- repeated card/grid structures -> Group/Grid only when the target version/theme capability supports the required layout without destructive approximation;
- visual overlays/absolute composition -> REVIEW/FALLBACK unless an accepted native/CSS strategy exists.

## 9. Theme capability awareness

A generated block may parse but fail to expose/render an intended style because theme.json disables or constrains the relevant support.

P16 capability checks therefore cover target/theme facts such as:

- contentSize/wideSize;
- layout editing/support;
- spacing margin/padding/blockGap;
- allowed spacing units/presets;
- typography controls/presets;
- color/gradient palettes;
- dimensions/aspect/minHeight/minWidth;
- shadows;
- position/sticky;
- block-specific supports.

If the target theme is unknown, theme-dependent features are marked DECLARED/UNKNOWN and cannot receive `RENDER VERIFIED` before observation.

## 10. Styling strategy

User-visible strategy is capability-driven, not arbitrary.

Potential strategies:

### `NATIVE_PRESETS`

Use target theme presets only when exact intended values can be mapped to observed/declared presets.

### `NATIVE_CUSTOM_VALUES`

Use supported block style attributes with literal values when theme/block supports custom values.

### `BRIDGE_STYLES`

Use a versioned WP Builders Bridge stylesheet/class payload only after that companion capability is accepted.

### `FALLBACK_FLATTENED`

Optional reduced-editability fallback for otherwise unsupported visuals; must be clearly labeled and user-confirmed.

No silent custom CSS injection into an artifact that was presented as pure Core-block output.

## 11. Preset and reference closure

A generated reference to theme presets must resolve against the TargetProfile or included bridge/design-system package.

Validator must detect:

- unresolved color preset;
- unresolved typography preset;
- unresolved spacing preset;
- unavailable custom unit;
- unsupported style property;
- theme support disabled.

Dangling preset references prevent `ARTIFACT VALIDATED` when they are required for intended rendering.

## 12. Responsive behavior

Gutenberg does not use one universal device-suffix settings model equivalent to classic Elementor. Responsive behavior may come from intrinsic layout, theme CSS, Core block behavior or newer WordPress features.

Policies:

- P13 responsive risk remains input evidence;
- P16 chooses only accepted native layout properties that adapt intrinsically;
- it does not invent a separate mobile composition;
- if required behavior needs CSS unavailable in pure Core blocks, classify as REVIEW or accepted Bridge fallback;
- device-specific visibility/output is enabled only when target WordPress/version capability is explicitly accepted;
- render verification uses versioned viewport profiles rather than assuming editor controls equal frontend behavior.

## 13. Block serialization correctness

P16 uses official WordPress parser semantics as the machine contract.

Validation cycle:

1. generate normalized block tree;
2. serialize to block markup;
3. parse with official/default parser implementation used by acceptance harness;
4. normalize parsed result;
5. serialize parsed result;
6. parse again;
7. compare semantic block tree and required saved markup invariants.

Any parser exception, invalid delimiter nesting or semantic mismatch rejects the artifact.

## 14. Static vs dynamic blocks

Static blocks save markup directly. Dynamic blocks may serialize only block comment attributes and render on the server.

P16 initial scope should prefer static, self-contained Core blocks.

A dynamic block is emitted only when:

- block/version is explicitly supported;
- required server-side WordPress functionality is known;
- attributes are accepted;
- real editor + frontend render fixtures exist.

## 15. Editor validity gate

`ARTIFACT VALIDATED` is not enough.

Production acceptance requires editor-open tests on supported WordPress environments:

- import/insert artifact;
- editor parses blocks;
- no "This block contains unexpected or invalid content" recovery prompt for accepted fixtures;
- block hierarchy remains editable;
- expected text/assets are present;
- saving and reopening preserves the normalized semantic tree.

This produces `EDITOR VERIFIED`.

## 16. Pattern semantics

Default selected-section wrapper, when Pattern JSON capability is enabled:

- standard non-synced Pattern;
- editable after insertion;
- no global sync side effect.

User explicitly chooses synced behavior later if a bridge/target workflow supports it.

Pattern metadata such as title/category/source is generated deterministically or supplied by user in bounded validated fields.

## 17. Section transfer UX

Reliable first workflow:

1. select Figma section;
2. check Gutenberg compatibility;
3. create Prepared Duplicate if required;
4. generate validated block markup and/or accepted Pattern JSON;
5. `Download Pattern` or `Download Block Markup`;
6. import through WordPress documented UI/bridge;
7. optional observed editor/render verification.

Future `Copy for Gutenberg` uses one of:

- a documented supported browser/editor pathway proven by fixture tests;
- preferably WP Builders Bridge using our own versioned payload.

Do not reverse engineer private Gutenberg clipboard state/MIME formats.

## 18. WP Builders Bridge role

A companion plugin can make section transfer smoother without weakening the offline core.

Potential bridge responsibilities:

- observe WordPress/theme/core-block capabilities;
- receive versioned WP Builders payload/file/paste;
- verify nonce/capabilities/auth;
- parse/validate blocks server/client-side;
- create Pattern/template content through accepted WordPress APIs;
- upload/media-map assets;
- return structured editor/import diagnostics;
- optionally render known preview route for verification.

Security remains separate from the network-free Figma Community plugin architecture.

## 19. Asset handling

For `core/image` and media-bearing blocks:

- asset manifest links Figma source node -> exported asset hash;
- local artifact can reference packaged/bridge media identity only according to accepted transfer strategy;
- final WordPress attachment URL/ID is target-environment data and cannot be fabricated offline;
- bridge/import harness maps uploaded media to final IDs/URLs and rewrites block attributes/markup deterministically;
- missing media prevents observed render verification.

Alt text is preserved/generated only from explicit source metadata or user input; AI guesses are not silently inserted as accessibility truth.

## 20. Fonts

Core block markup cannot guarantee arbitrary custom fonts on an unknown theme.

P16 therefore emits:

- typography intent/requirements;
- target preset mapping where resolved;
- raw font binaries only when user-supplied/license-permitted through a separate accepted theme/bridge capability.

If the target theme lacks the intended font, render verification cannot claim exact typography.

## 21. Interactions/dynamic content

Initial P16 scope is static-first.

Advanced capabilities such as:

- navigation;
- query loop;
- forms;
- search;
- accordion/details variants;
- interactive API behaviors;
- WooCommerce/product blocks;
- synced pattern/global content;
- dynamic post/template data

require explicit versioned capability packs, dependencies and real frontend verification.

Unsupported behavior remains REVIEW/UNSUPPORTED rather than inert fake output.

## 22. Target-ready status

P16 readiness stays separate from Build-Ready and Elementor readiness.

Suggested states:

- `READY`;
- `READY_WITH_REVIEW`;
- `NOT_READY`;
- `INSUFFICIENT_EVIDENCE`.

Evidence includes mapping coverage and blocker/review counts.

A numeric Gutenberg score is optional and should not ship until calibrated. Categorical readiness is preferable to fake precision.

## 23. Job state machine

`IDLE -> PROFILE_READY -> COMPATIBILITY -> PREPARATION_REQUIRED? -> MAPPING -> SERIALIZING -> VALIDATING_ARTIFACT -> WRAPPING_PATTERN? -> IMPORT_VERIFYING? -> EDITOR_VERIFYING? -> RENDER_VERIFYING? -> COMPLETE`

Terminal states:

- `CANCELLED`;
- `BLOCKED`;
- `RECOVERABLE_ERROR`;
- `STALE`;
- `ARTIFACT_REJECTED`;
- `IMPORT_FAILED`;
- `EDITOR_INVALID`;
- `RENDER_FAILED`.

Source/profile changes invalidate downstream results.

## 24. Atomic artifact generation

Generate into staging memory/files. User receives final artifact only after validation succeeds.

On failure/cancel:

- discard staging output;
- no partial final download;
- preserve structured error/receipt.

Final artifact records exact hash.

## 25. Pattern JSON/ZIP validation

When enabled through accepted fixtures:

### JSON

- valid JSON;
- wrapper fields/types match accepted WordPress fixture/schema for target version;
- contained block markup independently passes parse/serialize/re-parse;
- no unexpected executable content.

### ZIP

- no path traversal;
- bounded count/size/compression ratio;
- only expected pattern JSON files/metadata;
- each inner pattern validates;
- deterministic filename collision strategy;
- package hash recorded.

## 26. Verification labels

UI must keep separate:

- `SOURCE COMPATIBLE`;
- `PREPARED`;
- `ARTIFACT VALIDATED`;
- `IMPORT VERIFIED`;
- `EDITOR VERIFIED`;
- `RENDER VERIFIED`;
- later `ROUND-TRIP VERIFIED`;
- `REVIEW`;
- `BLOCKED`.

A syntax-valid block fragment from an unknown theme is never described as render verified.

## 27. Option-state contract

Suggested dependency order:

1. WordPress target version/profile;
2. theme mode (`Unknown`, declared theme profile, observed connected/bridge target);
3. artifact scope (`Section`, `Page fragment`, accepted Pattern, accepted Template Part);
4. styling strategy;
5. theme preset/reference strategy;
6. asset transfer strategy;
7. advanced/custom block capabilities.

Changing an upstream setting clears/revalidates dependent choices and makes existing compatibility/artifacts stale.

## 28. No silent fallback

Fallbacks must state:

- native mapping that was unavailable;
- replacement strategy;
- editability impact;
- responsive/theme risk;
- behavior loss;
- whether custom CSS/bridge/plugin dependency is introduced.

Flatten-to-image or Custom HTML cannot masquerade as native editable Gutenberg output.

## 29. Error model

Reserve stable codes including:

- `P16_PROFILE_INVALID`;
- `P16_PROFILE_STALE`;
- `P16_WORDPRESS_VERSION_UNSUPPORTED`;
- `P16_THEME_CAPABILITY_UNKNOWN`;
- `P16_THEME_SUPPORT_MISSING`;
- `P16_CORE_BLOCK_UNSUPPORTED`;
- `P16_CUSTOM_BLOCK_REQUIRED`;
- `P16_SOURCE_NOT_READY`;
- `P16_MAPPING_BLOCKED`;
- `P16_PRESET_UNRESOLVED`;
- `P16_ASSET_UNRESOLVED`;
- `P16_SERIALIZATION_FAILED`;
- `P16_PARSE_FAILED`;
- `P16_ROUNDTRIP_MISMATCH`;
- `P16_PATTERN_WRAPPER_INVALID`;
- `P16_PACKAGE_INVALID`;
- `P16_IMPORT_FAILED`;
- `P16_EDITOR_INVALID`;
- `P16_RENDER_FAILED`;
- `P16_GENERATION_CANCELLED`;
- `P16_INTERNAL_INVARIANT_FAILED`.

## 30. Receipt

Every terminal run records:

- source/P14 fingerprints;
- TargetProfile digest/provenance;
- adapter version;
- mapping classifications;
- exact block tree digest;
- serialized markup hash;
- parse/serialize/re-parse result;
- pattern/ZIP hash if produced;
- theme/preset dependencies;
- assets/dependencies;
- import/editor/render observations;
- fallbacks/review items;
- limitations/timestamps.

## 31. Determinism

Same normalized source + same TargetProfile + same adapter version yields same normalized block tree and semantic serialization.

Where WordPress wrapper metadata requires variable identifiers/timestamps, normalize/document them separately rather than weakening semantic parity.

## 32. Performance

- map normalized IR once;
- avoid unnecessary reparsing beyond required validation passes;
- bound nested depth/file size/block count;
- assets dedupe by hash;
- staged validation short-circuits on cheap syntax/schema failures;
- cooperative cancellation between mapping/serialization/parse/package/verification stages;
- extremely large inputs fail early with actionable limits.

## 33. Test matrix

### Unit

- TargetProfile/theme capability validation;
- Core block mappings;
- style/preset closure;
- option dependency resets;
- serialization helpers;
- error codes;
- receipt determinism.

### Block fixtures

- headings/paragraphs/lists;
- image;
- buttons;
- Group row/stack;
- Columns/Column;
- nested groups;
- repeated cards;
- full/wide alignment under compatible theme;
- deliberate overlay refusal;
- unknown theme support;
- unavailable preset;
- custom block required.

### Serialization invariants

- generated markup parses;
- parse -> serialize -> parse semantic equality;
- malformed delimiter rejected;
- unknown block policy enforced;
- duplicate/invalid attrs rejected where contract requires;
- escaping/XSS-sensitive text/URLs preserved safely;
- second save/open fixture remains valid.

### Pattern/package

- canonical exported Pattern JSON round-trip;
- malformed JSON;
- invalid inner markup;
- multi-pattern ZIP traversal/bomb/count tests;
- deterministic names/hashes where feasible.

### Real WordPress acceptance

- supported classic theme/editor page/post insertion where applicable;
- supported block theme Site Editor/pattern import;
- editor opens without invalid-block recovery;
- save/reopen stability;
- frontend render screenshots at accepted widths;
- explicit expected refusal for missing theme/plugin capability.

## 34. Security

Generated block HTML/attributes must treat user-provided content as untrusted data.

Requirements:

- correct escaping/serialization;
- URLs validated under accepted scheme policy;
- no arbitrary script tags in Core-block path;
- Custom HTML/custom JS is a separate explicit capability and disabled by default;
- ZIP/pattern imports bounded and path-safe;
- bridge requires authenticated capability/nonce checks and strict schema.

## 35. Production acceptance

P16 may be `IMPLEMENTATION COMPLETE` when:

- Core mapping and serializer tests pass;
- parse/serialize/re-parse gate passes;
- capability-driven UI prevents invalid profiles;
- receipts/artifact validation work.

P16 may be `PRODUCTION ACCEPTED` only when:

- R0 assumptions remain current;
- dependencies are accepted;
- Core-block artifacts open/edit/save successfully in supported real WordPress environments;
- Pattern JSON is enabled only if fixture-backed round-trip import passes;
- enabled ZIP capability has package tests;
- theme compatibility states behave correctly;
- no accepted fixture triggers invalid-block recovery;
- frontend render verification is retained for supported profile(s);
- source design remains unchanged;
- docs/status sync is complete.

## 36. Current gate

This is planning-only work.

Do not begin P16 runtime implementation until roadmap dependencies are genuinely accepted and its focused implementation issue refreshes WordPress/Core block/theme assumptions as needed.

No P12/P13/P14/P15/P16 acceptance credit is granted by this document.
