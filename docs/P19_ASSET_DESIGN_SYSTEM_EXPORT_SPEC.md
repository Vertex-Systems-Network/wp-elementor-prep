# P19 Asset Pack + Design-System Export — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; accepted P13/P14 source preparation; P17 neutral Web IR; P18 adapter platform as applicable  
R0 source snapshot: `docs/R0_ASSET_TOKEN_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P19 creates a deterministic asset and design-system layer that can serve web, WordPress and framework targets without re-deriving the same colors, typography, spacing and image assets independently in every exporter.

P19 has two related but separately validated outputs:

1. **Asset Pack** — exported local visual assets with hashes, formats, source provenance and usage metadata.
2. **Design-System Pack** — normalized source-bound tokens/styles, optional clearly labeled candidates, and versioned target adapters such as DTCG JSON, CSS variables and WordPress `theme.json` preset fragments.

The objective is not to manufacture a design system from every repeated value. Source truth, inferred candidates and target transformations remain distinct.

## 2. Canonical flows

### Asset pack

`Select source scope -> Asset discovery -> Classification -> Export settings -> Native Figma export -> Validate bytes/format -> Optional derivative optimization -> Reference closure -> Package -> Receipt`

### Design-system pack

`Select source scope -> Read Figma variables/styles/bindings -> Normalize aliases/modes/usages -> Analyze unbound repeated-value candidates -> User policy/confirmation where required -> Build neutral Token IR -> Emit selected target formats -> Validate each target -> Package + receipt`

## 3. Evidence classes

Every token/style value is classified as exactly one primary evidence class:

- `SOURCE_VARIABLE` — explicit Figma variable;
- `SOURCE_STYLE` — explicit source style when an accepted style source API is available;
- `BOUND_SOURCE_VALUE` — value explicitly bound to source variable/style;
- `INFERRED_CANDIDATE` — repeated/unbound value proposed by analysis;
- `USER_CONFIRMED_TOKEN` — candidate promoted through explicit user action;
- `TARGET_DERIVED` — value created only to encode an accepted target representation;
- `UNKNOWN`.

The UI/export receipt may never relabel an inferred candidate as source-authored truth.

## 4. Neutral Token IR

Suggested conceptual shape:

```ts
interface TokenIRV1 {
  schemaVersion: 1;
  tokens: TokenRecord[];
  groups: TokenGroup[];
  modes: TokenMode[];
  aliases: TokenAliasEdge[];
  usages: TokenUsage[];
  candidates: TokenCandidate[];
  provenance: TokenSourceSnapshot;
}
```

Each `TokenRecord` contains at least:

- stable internal token ID;
- portable/export name;
- source identity where available;
- evidence class;
- token type;
- default value or mode-value map;
- alias/reference where applicable;
- description/source metadata;
- usage count/locations;
- target mapping annotations;
- conflict/review status.

Source IDs are not used as portable display names.

## 5. Token types

Initial normalized token type set should cover:

- `COLOR`;
- `DIMENSION`;
- `NUMBER`;
- `BOOLEAN`;
- `STRING`;
- `TYPOGRAPHY` composite plus accepted constituents;
- `BORDER` composite where representable;
- `SHADOW`;
- `OPACITY`;
- `DURATION`;
- `CUBIC_BEZIER`/easing when deterministic;
- `GRADIENT` only through an explicitly accepted typed representation.

Unsupported Figma property/value families retain structured source evidence and are not coerced into strings just to make export succeed.

## 6. Modes

Figma variable collection modes must remain first-class.

Examples may include light/dark, brand/alternate or density modes, but P19 does not infer semantic meaning from a mode name beyond preserving it.

Rules:

- all known mode IDs/names are captured;
- each variable value per mode is normalized;
- aliases remain aliases where the target can represent them;
- target formats that cannot represent modes either emit one explicitly selected mode, multiple target files/scopes, or a documented flattened transform;
- silent first-mode-only export is forbidden.

## 7. Alias graph

Variable aliases create a directed graph.

Validation detects:

- unresolved alias targets;
- cycles;
- cross-collection dependencies;
- remote/library references;
- aliases whose target is unavailable in the selected export scope.

Target output may preserve aliases only if its reference model supports them. Otherwise flattening is explicit and the receipt records the resolved chain.

## 8. Usage graph

P19 records where source tokens/values are actually used.

Usage evidence may include:

- source node ID/path;
- property slot (fill/stroke/gap/padding/etc.);
- bound variable/style identity;
- resolved mode at scan time where known;
- component/instance context;
- page/section context.

Usage information supports later cleanup, migration and target mapping but is not automatically shipped in every public token format. Full provenance may live in a sidecar receipt.

## 9. Candidate token mining

Unbound repeated values may be proposed as candidates after explicit analysis.

Candidate generation rules:

- exact repeated values can form deterministic clusters;
- near-value clustering requires a versioned similarity policy and never silently merges values;
- semantic roles are suggestions unless source names/bindings prove them;
- candidates overlapping an existing source variable should usually recommend binding/migration rather than duplicating a new token;
- frequency alone is insufficient to create a canonical global token;
- one-off intentional art-direction values remain one-off by default.

Candidate output is optional and clearly separated from the canonical source token export.

## 10. Naming policy

Portable names are deterministic and validated per selected target.

Naming inputs may include:

- source variable/group name;
- source style name;
- user-confirmed role/name;
- deterministic sanitization;
- namespaced conflict disambiguation.

Rules:

- preserve human-readable source names where valid;
- never use opaque Figma IDs as normal token names;
- collisions are surfaced and resolved deterministically;
- target-specific slug/case transformation occurs in emitters;
- one internal token maps to target names through a receipt rather than mutating its canonical identity.

## 11. DTCG adapter

Initial adapter ID:

`dtcg-2025-10`

P19 should emit a DTCG-compatible token document after schema/fixture validation.

Rules:

- selected token types map only when semantics are accepted;
- aliases remain references when representable;
- composite values follow the selected stable DTCG contract;
- custom WP Builders provenance uses accepted extension/sidecar mechanisms rather than invalid standard fields;
- candidate tokens are omitted by default unless explicitly promoted/selected;
- output validates against the retained implementation schema/fixture set.

The DTCG adapter version is separate from the internal Token IR version.

## 12. CSS custom-property adapter

Initial adapter ID:

`css-custom-properties`

Potential output:

- one root token file;
- optional mode selectors/media wrappers only from explicit selected mode strategy;
- stable custom-property names;
- alias references using `var()` where accepted;
- optional fallback values according to profile.

Do not invent dark-mode media queries because a Figma collection happens to contain a mode called “Dark”. The activation contract is target/user configuration.

## 13. Framework token adapters

P18 adapters may consume Token IR directly and may optionally emit target-native modules.

Examples:

- TypeScript token object;
- CSS variable import;
- Tailwind theme mapping;
- Vue/Svelte scoped/global token CSS;
- Angular global/theme stylesheet.

Framework-specific token output must reuse the P19 neutral model; it must not re-cluster raw Figma values independently.

## 14. WordPress `theme.json` adapter

Initial adapter ID:

`wordpress-theme-json-v3`

The selected WordPress target profile determines exact schema/capabilities.

Potential accepted mappings include:

- colors -> `settings.color.palette`;
- gradients -> `settings.color.gradients` only when representable;
- font families -> `settings.typography.fontFamilies` where packaging/availability is valid;
- font sizes -> `settings.typography.fontSizes`;
- spacing -> `settings.spacing.spacingSizes` or an accepted scale strategy;
- shadows -> `settings.shadow.presets` where target schema supports them;
- layout sizes -> target layout settings only when semantic/global evidence exists.

Rules:

- schema validation is mandatory;
- target capability may reject a source token mapping;
- local component values are not automatically promoted to global theme presets;
- theme activation/overwrite is outside offline generation and requires explicit target workflow;
- existing target presets can be mapped through a target-profile/binding layer instead of duplicated.

## 15. Elementor design-system adapter

Elementor global colors/fonts/kit mapping remains conditional on an accepted public/fixture-backed machine contract from P15.

P19 may define the neutral mapping intention but must not fabricate undocumented Elementor internal IDs or storage shapes.

When an accepted P15 adapter contract exists, P19 provides:

- token identity;
- proposed/global role;
- exact value/mode strategy;
- usage evidence;
- target mapping receipt.

P15 remains authoritative for actual Elementor artifact encoding/import validation.

## 16. Asset discovery

An asset candidate is not every node.

Discovery may identify:

- explicit export settings in source;
- images/image fills;
- vector/icon/logo-like nodes according to deterministic criteria;
- user-selected nodes;
- component assets referenced by generated targets;
- source media required for P17/P18/P15/P16 artifact closure.

Classification states:

- `REQUIRED_ASSET`;
- `OPTIONAL_ASSET`;
- `DECORATIVE_INLINE`;
- `CODE_REPRESENTABLE`;
- `DO_NOT_EXPORT`;
- `REVIEW`;
- `UNSUPPORTED`.

## 17. Native asset export

Native export uses accepted Figma Plugin API capabilities.

Every export request records:

- source node ID;
- source snapshot/version evidence available to the job;
- format;
- scale/constraint;
- vector/raster settings;
- requested name/path;
- plugin/adapter version.

Every result records:

- byte length;
- cryptographic content hash;
- detected media type;
- dimensions where applicable;
- final deterministic path;
- export warnings/errors.

An asset never receives a success receipt if bytes are empty or media validation fails.

## 18. SVG policy

SVG is preferred for suitable vector assets where semantics/fidelity survive export.

Validation should cover:

- parseability;
- dimensions/viewBox;
- forbidden/unexpected active content according to package policy;
- unresolved external references;
- deterministic normalization only when it does not alter intended rendering;
- source hash vs any normalized/optimized derivative hash.

SVG sanitization/optimization is separate from Figma native export.

## 19. Raster policy

Accepted raster formats/profiles may include PNG/JPG/WebP derivatives according to target needs and accepted tooling.

Rules:

- native Figma export format is recorded;
- optimization/format conversion is a derivative step;
- derivative codecs/settings are versioned;
- transparent assets are not silently converted to a format/profile that loses required alpha;
- dimensions/upscaling are explicit;
- no fake “4K” label: output dimensions and source/export scale are recorded numerically.

## 20. Image-fill/source media boundary

Where Figma exposes a source image reference through accepted APIs, P19 should prefer preserving/source-resolving it according to policy rather than rasterizing a larger composite layer unnecessarily.

If only rendered-node export can preserve the intended appearance, the receipt states that the asset is a rendered derivative rather than the original uploaded media.

## 21. Asset deduplication

Content hash is the primary byte-level deduplication key.

Separate source nodes may intentionally reference the same bytes. P19 may package one file with multiple usage/source references when target behavior permits.

Do not deduplicate merely because filenames or dimensions match.

## 22. Deterministic paths

Asset path generation should use a bounded deterministic naming policy combining human-readable slug and collision-safe identity/hash suffix where needed.

Requirements:

- cross-platform safe names;
- bounded path/file lengths;
- case-collision detection;
- no traversal/reserved paths;
- stable output for identical source/profile;
- mapping from source asset ID -> final path in manifest.

## 23. Asset manifest

Suggested shape:

```ts
interface AssetManifestV1 {
  schemaVersion: 1;
  assets: AssetRecord[];
  usages: AssetUsage[];
  derivatives: AssetDerivative[];
  packageHash?: string;
}
```

An `AssetRecord` includes:

- asset ID;
- source node/ref;
- native export hash;
- media type;
- dimensions;
- path;
- format/settings;
- source-vs-rendered classification;
- alt-text source state;
- license/user-supplied metadata when applicable.

## 24. Accessibility metadata

P19 preserves explicit accessibility-relevant source metadata where available/configured.

It does not generate factual alt text through silent AI guessing.

Asset records distinguish:

- `ALT_EXPLICIT_SOURCE`;
- `ALT_USER_SUPPLIED`;
- `DECORATIVE_CONFIRMED`;
- `ALT_MISSING`;
- `ALT_UNKNOWN`.

Target adapters may block/review missing required alt metadata according to their own accessibility policy.

## 25. Fonts

Font-family/token intent can be exported independently of font binaries.

Font binary packaging is allowed only when the file is provided through an accepted user/project source and licensing permits distribution.

P19 never attempts to copy arbitrary locally installed fonts out of Figma/the host environment.

Font records may include:

- family;
- weight/style;
- source/provenance;
- expected file hash if supplied;
- target fallback stack;
- license/packaging status;
- missing status.

## 26. Package structure

Example conceptual structure:

```text
wp-builders-design-system/
  manifest.json
  tokens/
    tokens.dtcg.json
    tokens.css
    token-provenance.json
  assets/
    ...
  targets/
    wordpress/theme.json.fragment.json
    ...
  receipts/
    generation.json
```

Exact filenames are versioned by the pack schema. Optional outputs are omitted cleanly rather than represented by empty misleading files.

## 27. Package safety/validation

Before download/finalization:

- all paths safe and unique;
- manifest references resolve;
- content hashes match actual bytes;
- token aliases resolve within selected scope or are explicitly external;
- target token documents validate;
- no forbidden active content in asset package;
- no unexpected network URLs when offline/local closure is required;
- bounded file count/size;
- package hash/receipt created after deterministic assembly.

## 28. Atomicity

P19 operates in staging.

A final asset/design-system package is exposed only after required validation succeeds. Cancel/failure discards partial final output but may retain structured diagnostics in memory/UI.

No partial package is labeled successful.

## 29. Readiness state

Suggested categorical states:

- `READY`;
- `READY_WITH_REVIEW`;
- `NOT_READY`;
- `INSUFFICIENT_EVIDENCE`.

Evidence dimensions include:

- asset closure;
- token source coverage;
- unresolved aliases;
- mode handling;
- target mapping coverage;
- candidate-token conflicts;
- missing fonts/assets;
- package validation.

A design with zero source tokens can still export assets, but it should not be described as having a validated source design system merely because candidates were generated.

## 30. Verification labels

Keep distinct:

- `SOURCE ASSETS DISCOVERED`;
- `SOURCE TOKENS READ`;
- `CANDIDATES ANALYZED`;
- `ASSETS EXPORTED`;
- `TOKEN IR VALIDATED`;
- `TARGET TOKENS VALIDATED`;
- `PACKAGE VALIDATED`;
- later `TARGET IMPORT VERIFIED`;
- `REVIEW`;
- `BLOCKED`.

## 31. Job state machine

`IDLE -> SOURCE_SCAN -> ASSET_DISCOVERY -> TOKEN_EXTRACTION -> CANDIDATE_ANALYSIS? -> POLICY_REVIEW? -> ASSET_EXPORT -> TOKEN_NORMALIZATION -> TARGET_EMISSION -> PACKAGE_VALIDATION -> COMPLETE`

Terminal states:

- `CANCELLED`;
- `STALE`;
- `BLOCKED`;
- `ASSET_EXPORT_FAILED`;
- `TOKEN_GRAPH_INVALID`;
- `TARGET_MAPPING_FAILED`;
- `PACKAGE_REJECTED`.

Any source snapshot, mode-selection, target-profile or candidate-promotion change invalidates downstream evidence.

## 32. Determinism

For identical source snapshot, selected scope, policy/profile and adapter versions:

- Token IR ordering/IDs are stable;
- exported target token text is stable;
- asset paths are stable;
- native export requests are stable;
- deterministic native export bytes are expected where Figma guarantees stable output; otherwise exact source/export environment is recorded;
- derivative outputs are tied to exact codec/tool versions;
- manifests/receipts are stable apart from intentionally excluded runtime timestamps.

## 33. Test matrix

Token fixtures:

- one collection/one mode;
- multiple modes;
- aliases;
- alias chain;
- unresolved/remote alias;
- collision names;
- bound and unbound values;
- candidate overlap with existing token;
- typography composite;
- shadow/gradient edge cases;
- WordPress target-supported and unsupported mappings.

Asset fixtures:

- PNG/JPG;
- simple SVG;
- complex vector;
- image fill;
- transparent raster;
- same bytes from multiple source nodes;
- name/path collisions;
- missing/unsupported asset;
- malformed/unsafe SVG derivative;
- large file/limit rejection.

Package fixtures:

- deterministic rerun;
- missing reference;
- tampered hash;
- case/path collision;
- optional-target omission;
- offline external-reference rejection.

## 34. Target handoff

P15/P16/P17/P18 consume the P19 asset/token outputs through versioned contracts rather than reading arbitrary files by convention.

At minimum handoff provides:

- Token IR hash/version;
- Asset Manifest hash/version;
- selected mode/flattening policy;
- target mapping IDs/versions;
- exact asset path/content hashes;
- missing/review diagnostics.

## 35. P20 handoff

P20 round-trip QA must know which expected visual differences originate from token/asset transformation.

P19 therefore emits:

- source -> token target mapping;
- source -> asset file mapping;
- native vs derivative classification;
- selected mode;
- unresolved/missing evidence;
- exact package hash.

P20 does not need to rediscover these transformations from generated source code.

## 36. Non-goals for first implementation

Not first-slice guarantees:

- two-way live design-token sync with arbitrary codebases;
- modifying remote Figma team libraries;
- automatic publishing of Figma variables;
- extracting arbitrary installed font binaries;
- AI-based token naming as authoritative source truth;
- automatic license determination;
- remote CDN/image optimization;
- every DTCG token type before fixture support exists;
- undocumented Elementor kit mutation.

## 37. Production acceptance

Production acceptance for each output profile requires real evidence for the claims it makes.

Minimum P19 acceptance campaign should include:

- real Figma variable collection/modes/aliases;
- real bound usages;
- native asset exports;
- deterministic manifests/hashes;
- DTCG validation;
- CSS token validation/render fixture;
- WordPress `theme.json` schema validation for claimed profile;
- missing/unsupported behavior;
- package safety;
- cross-platform extraction/path verification;
- target consumer fixtures from at least one accepted downstream adapter.

A successful DTCG export does not automatically prove WordPress or Elementor import behavior.

## 38. Implementation-opening checklist

Before P19 runtime implementation opens:

- [ ] P12 internal release exit complete;
- [ ] required upstream source/target contracts accepted;
- [ ] R0 asset/token snapshot refreshed;
- [ ] Token IR v1 frozen;
- [ ] asset manifest v1 frozen;
- [ ] DTCG target version/schema/fixtures frozen;
- [ ] Figma Plugin API variable/export fixture set frozen;
- [ ] candidate-token promotion policy frozen;
- [ ] asset/path/size safety limits frozen;
- [ ] font licensing/packaging boundary frozen;
- [ ] first downstream target consumer selected;
- [ ] production evidence checklist named before coding.

Until those gates pass, this specification remains planning-only.