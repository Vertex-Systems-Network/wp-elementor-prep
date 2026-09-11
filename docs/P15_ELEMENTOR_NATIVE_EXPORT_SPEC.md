# P15 Elementor Native Export + Validation — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit, P13 production acceptance, P14 production acceptance  
R0 source snapshot: `docs/R0_ELEMENTOR_ADAPTER_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P15 converts an accepted Figma source or P14 Prepared Duplicate into a versioned, native Elementor artifact while preserving the source design and making compatibility/verification claims only for properties actually tested.

P15 is the first target-specific adapter phase. It therefore exercises the full R1 reliability model: immutable TargetProfile, capability-driven options, deterministic mapping, atomic generation, schema/reference/assets validation, real import/render harness and explicit verification levels.

## 2. User-facing goal

The intended flow is:

`Select Frame/section -> Choose Elementor profile -> Compatibility Check -> Build/Target-Ready evidence -> Create Prepared Duplicate if required -> Map to Elementor -> Validate -> Verify import/render where available -> Download/transfer + receipt`

The product must not show a successful `Download Elementor Template` state before the selected output artifact is fully generated and locally validated.

## 3. Initial adapter families

P15 must not ship one ambiguous Elementor serializer.

Initial adapter families:

### 3.1 `elementor-v3-container`

Uses documented classic/container/widget JSON concepts:

- top-level template/page structure;
- `elType: "container"` layout nodes;
- classic `elType: "widget"` + `widgetType` leaves;
- classic responsive `settings` suffixes;
- classic global-style references where used.

### 3.2 `elementor-v4-atomic`

Uses documented Atomic concepts:

- atomic element types such as `e-div-block`, `e-flexbox`, `e-grid`;
- versioned atomic element schema;
- atomic `styles`;
- `editor_settings` only where required and documented;
- interactions only when an accepted mapping exists;
- Variables/Classes/design-system mapping when supported.

### 3.3 Hybrid profile

A v3/v4 hybrid profile is not part of the first required adapter acceptance merely because Elementor permits coexistence.

It may be added later only after:

- explicit mixed-schema fixtures;
- deterministic parent/child compatibility rules;
- real import/render validation;
- global-style/class/variable dependency closure.

Initial UI should prefer one explicit output family.

## 4. TargetProfile contract

Each run captures an immutable profile.

Suggested shape:

```ts
interface ElementorTargetProfileV1 {
  schemaVersion: 1;
  adapterId: "elementor-v3-container" | "elementor-v4-atomic";
  adapterVersion: number;
  target: {
    wordpressVersion: ObservedOrDeclaredVersion;
    phpVersion?: ObservedOrDeclaredVersion;
    elementorCoreVersion: ObservedOrDeclaredVersion;
    elementorPro?: {
      installed: ObservedOrDeclaredBoolean;
      version?: ObservedOrDeclaredVersion;
      active?: ObservedOrDeclaredBoolean;
    };
    atomicEditor?: ObservedOrDeclaredBoolean;
    breakpoints: BreakpointProfile;
    capabilities: ElementorCapabilitySnapshot;
  };
  artifact: ElementorArtifactProfile;
}
```

Every environment field must record provenance:

- `OBSERVED` — read from an accepted companion/test environment;
- `DECLARED` — entered/selected by user;
- `DEFAULT_ASSUMED` — allowed only for harmless defaults explicitly documented by the adapter;
- `UNKNOWN` — not available.

`DECLARED` must never be rendered as `OBSERVED`.

## 5. Capability descriptor

UI options are generated from a machine-readable capability matrix, not hard-coded independent toggles.

Minimum capability states:

- `SUPPORTED`;
- `SUPPORTED_WITH_REVIEW`;
- `UNSUPPORTED`;
- `REQUIRES`.

Each capability declares:

- adapter family/version;
- minimum/maximum tested Elementor versions;
- Core/Pro requirement;
- Atomic enabled requirement;
- target artifact types supported;
- mapping/validation rules;
- fallback policy;
- verification level available.

If a capability is unsupported, the UI disables it before generation. It must not wait until the ZIP/import stage to fail.

## 6. Artifact families

P15 distinguishes artifact families explicitly.

### 6.1 Template JSON — REQUIRED FIRST

This is the first required native export target because Elementor publicly documents JSON template data structure and JSON template import.

Supported scope may include:

- selected section/container represented as an importable template;
- page template;
- supported Theme Builder document type when capability is explicitly accepted.

### 6.2 Template ZIP — CONDITIONAL

Elementor accepts ZIP template imports, but P15 must enable generated Template ZIP only after a canonical real Elementor export fixture defines the wrapper/package contract and round-trip import passes.

A ZIP that merely contains our JSON is not automatically labeled an Elementor Template ZIP.

### 6.3 Website Template / Kit ZIP — SEPARATE ADVANCED CAPABILITY

A website-template ZIP can involve:

- Content;
- Templates/site parts;
- Settings & Configurations;
- media;
- Plugins;
- design-system/global data;
- plan-dependent custom files.

Therefore this is a separate capability, not a synonym for single-page/template ZIP.

Enable only after:

- fixture-backed package contract;
- dependency closure rules;
- real import test;
- partial-import behavior is understood;
- missing plugin/global/media dependencies are surfaced.

### 6.4 WP Builders Bridge payload — LATER/OPTIONAL

For one-click section transfer, P15/P20 may define a versioned WP Builders Bridge payload that is **our documented contract** and is imported by a companion WordPress plugin.

This must not reverse-engineer undocumented Elementor clipboard internals.

## 7. Compatibility scan

Before export, run deterministic mapping analysis against the immutable TargetProfile.

Output categories:

- `NATIVE` — direct supported Elementor representation;
- `NATIVE_WITH_REVIEW` — supported but requires manual review or environment dependency;
- `CONVERTIBLE` — can be represented by an accepted transformation/preparation step;
- `FALLBACK` — accepted bounded fallback with visible fidelity/behavior cost;
- `UNSUPPORTED` — no safe accepted mapping;
- `UNKNOWN` — evidence/capability insufficient.

The scan must provide percentages/counts only from classified eligible nodes. Unknown/unclassified nodes remain visible in coverage.

## 8. Target-Ready result

P15 introduces a **separate** Target-Ready result. It does not overwrite Build-Ready Score 2.0.

Suggested output:

```ts
interface ElementorReadinessResult {
  targetProfileId: string;
  targetProfileDigest: string;
  status: "READY" | "READY_WITH_REVIEW" | "NOT_READY" | "INSUFFICIENT_EVIDENCE";
  compatibilityCoverage: number;
  counts: {
    native: number;
    nativeWithReview: number;
    convertible: number;
    fallback: number;
    unsupported: number;
    unknown: number;
  };
  blockers: ElementorCompatibilityFinding[];
  reviewItems: ElementorCompatibilityFinding[];
}
```

A numeric Target-Ready score may be added after calibration, but the first reliable implementation may ship categorical readiness + capability coverage instead of manufacturing a precise percentage too early.

If a numeric score is added, it must have its own versioned model and calibration corpus.

## 9. Preparation requirement

P15 may consume:

- original source when already structurally suitable and no mutation is required;
- P14 Prepared Duplicate when accepted structural preparation is required.

If compatibility analysis identifies a preparation step that P14 does not yet support safely:

- status is REVIEW/NOT_READY;
- P15 does not mutate the original;
- no hidden target-specific fix is applied inside the exporter.

Future target-scoped P14 recipes may be added only through the accepted recipe/TargetProfile extension contract.

## 10. Neutral intermediate representation

Elementor serializers should consume a normalized semantic/layout IR rather than re-reading raw Figma differently in each adapter.

The IR should represent only facts that can be supported deterministically, including:

- hierarchy;
- container/layout intent;
- sizing/grow/shrink behavior;
- alignment;
- gap/padding/margins;
- text content and text role where supported;
- image/media assets;
- button/link intent;
- repeated/component-like groups;
- overlay positioning;
- responsive evidence;
- design tokens/style references;
- interaction intent only when explicit.

The IR itself must not contain Elementor-specific control names. Adapter mapping belongs after the IR boundary.

## 11. v3 container mapping policy

Initial mapping priorities:

### Layout

- normal flow groups -> Elementor Containers;
- horizontal Auto Layout -> row/flex container where supported;
- vertical Auto Layout -> column/flex container;
- accepted grid structures -> supported grid/container mapping only when target capability confirms it;
- deliberate overlays -> explicit positioning only when accepted and preserved;
- ambiguous manual composition -> REVIEW rather than guessed flex settings.

### Content widgets

Initial Core-first mappings may include only well-documented, broadly available primitives such as:

- heading/text;
- image;
- button;
- divider/spacer only when semantically justified;
- icon only when the asset/control contract is accepted.

Every widget mapping has a versioned control map. Unknown widget/control keys are not invented.

### Nested widgets

Use nested widgets only when the selected Elementor version/capability matrix explicitly supports them and real fixtures pass. Otherwise represent through simpler accepted primitives or REVIEW.

## 12. v4 Atomic mapping policy

Atomic mapping must prefer the atomic architecture rather than wrapping every Figma node in legacy widgets.

Initial candidates:

- layout groups -> accepted Atomic layout elements;
- text -> accepted Atomic text/heading primitives;
- links/buttons -> accepted atomic semantic element + styles where supported;
- repeated styles -> Classes/Variables only after design-system mapping is accepted;
- local visual values -> local `styles` where accepted.

Do not assume classic widget control names apply to Atomic `styles`.

Every atomic element output must include the documented element schema version required by the accepted adapter fixture.

## 13. Core / Pro / third-party boundaries

P15 must surface dependencies before generation.

Examples:

- Core-native capability;
- Pro-required Form/Theme Builder/dynamic capability;
- third-party-addon-required widget;
- custom code requirement;
- unsupported interaction.

Policies:

1. No third-party widget is emitted unless that addon/version is explicitly selected in a supported TargetProfile.
2. A Pro widget is not silently downgraded to a visually similar Core structure if behavior changes materially.
3. Accepted fallbacks must state behavior/fidelity loss before export.
4. If a target site lacks a requirement, `IMPORT VERIFIED` cannot be claimed even if local JSON is valid.

## 14. Responsive mapping

Responsive output requires an explicit breakpoint profile.

### v3

Map only supported responsive controls into base/device-suffixed settings for the accepted target version/profile.

### v4

Map into the accepted Atomic responsive style structure rather than assuming v3 suffix behavior is sufficient.

Rules:

- P13 generic reference widths are analysis probes only;
- they do not become Elementor breakpoints automatically;
- if Figma has no explicit mobile/tablet design, P15 may apply only deterministic, accepted responsive rules derived from structure and selected profile;
- it must not invent a new composition, reorder narrative content arbitrarily or fabricate hidden elements;
- high-risk unresolved responsive findings remain REVIEW/NOT_READY.

## 15. Global styles, Variables and Classes

### v3 globals

If output uses classic global references, validator must ensure referenced global IDs are either:

- known built-ins;
- included in the export dependency closure;
- mapped to an existing observed/declared target global;
- otherwise blocked/reviewed.

### v4 design system

Atomic Variables/Classes require their own mapping table and export/dependency contract.

Initial safe policy may prefer local styles unless the user explicitly chooses `Use design system` and the adapter can validate all class/variable references.

No dangling global/class/variable reference is allowed in an `ARTIFACT VALIDATED` output.

## 16. Assets

P15 consumes P19-style asset contracts when available; until then it must implement only the minimum deterministic asset closure required for accepted Elementor artifacts.

Asset records include:

- source node ID;
- deterministic filename;
- media type;
- stored-original vs rendered-appearance origin;
- dimensions;
- content hash;
- target reference path/URL strategy;
- export status.

The adapter must not generate a broken image URL and call the template valid.

If Elementor import requires media handling not represented in a single template JSON, that limitation is surfaced explicitly.

## 17. Fonts

P15 exports font usage metadata and maps to target typography capabilities.

Raw font binaries are included only if user-supplied and license-permitted.

If a design uses a font unavailable in the target environment:

- show requirement/fallback before export;
- do not silently substitute a different font and call the result exact;
- `RENDER VERIFIED` requires the accepted test target to have the intended font or an explicitly accepted fallback.

## 18. Interactions and behavior

Static visual mapping and behavior mapping are separate capabilities.

Initial P15 may support static:

- links;
- basic button URLs;
- simple anchors where target contract is accepted.

Advanced behavior such as:

- forms/actions;
- menus;
- tabs/accordion/carousel;
- popups;
- motion effects;
- sticky/fixed behavior;
- dynamic tags;
- loop/grid querying;
- interactions/animations;

requires explicit capability rules and real behavior verification.

If behavior is not accepted, preserve visual evidence but classify the feature REVIEW/UNSUPPORTED; do not output inert UI under a successful behavior claim.

## 19. Artifact generation state machine

Canonical P15 job states:

`IDLE -> PROFILE_READY -> COMPATIBILITY -> PREPARATION_REQUIRED? -> MAPPING -> GENERATING -> VALIDATING_ARTIFACT -> IMPORT_VERIFYING? -> RENDER_VERIFYING? -> COMPLETE`

Terminal/exception states:

- `CANCELLED`;
- `BLOCKED`;
- `RECOVERABLE_ERROR`;
- `STALE`;
- `ARTIFACT_REJECTED`;
- `IMPORT_FAILED`;
- `RENDER_FAILED`.

Rules:

- source/Prepared Duplicate fingerprint + TargetProfile digest are frozen for the run;
- changing target version/options invalidates compatibility and generated artifact;
- no download/copy action is enabled before `ARTIFACT VALIDATED`;
- verification failure does not delete the locally valid artifact but clearly downgrades its verification state;
- user may retry import/render verification without regenerating if exact artifact hash and target profile remain unchanged.

## 20. Atomic generation

Generate into a temporary in-memory/staging package.

Final downloadable artifact becomes visible only when:

- serialization completes;
- all required assets exist;
- all references resolve;
- schema/package validation passes;
- package digest is computed.

On failure/cancel, discard the staged output. Never offer a partial ZIP/template under the final filename.

## 21. Template JSON validation

Minimum validator layers:

### General structure

- valid JSON;
- exact supported top-level keys/types;
- accepted Elementor data structure version;
- supported document type;
- `page_settings` valid for scope;
- recursive `content` array valid.

### Element integrity

- unique IDs within artifact scope;
- allowed element types only;
- required fields per adapter family;
- no impossible parent/child relation;
- widget types are supported by capability matrix;
- settings/styles use accepted control/property IDs/types.

### Reference closure

- global styles resolved;
- class/variable references resolved;
- asset references resolved;
- internal IDs/repeaters/nested relations resolved where applicable.

### Responsive integrity

- device keys/styles match target profile;
- no orphan custom breakpoint suffix/reference;
- units/values fall in accepted serializer range.

### Dependency manifest

- Core/Pro/addon requirements explicitly listed;
- unknown dependency prevents READY claim.

## 22. ZIP/package validation

For any enabled ZIP family:

- no path traversal;
- normalized file paths;
- bounded file count/size/compression ratio;
- deterministic file ordering/timestamps where feasible for reproducible output;
- manifest/index files required by the accepted package fixture;
- every declared internal file exists;
- every referenced asset exists;
- package has no unexpected executable payload;
- final ZIP hash recorded in receipt.

Website Template/Kit ZIP receives a separate validator from Template ZIP.

## 23. Real import harness

`ARTIFACT VALIDATED` is not `IMPORT VERIFIED`.

Production acceptance requires supported Elementor test environments.

Initial harness matrix should include at least:

- supported Elementor v3/container target;
- supported Elementor v4/Atomic target;
- Core-only where relevant;
- Pro-enabled target for any Pro feature shipped;
- at least one custom-breakpoint case if responsive export supports it.

Harness records:

- WordPress version;
- PHP version;
- Elementor Core/Pro versions;
- Atomic enabled state;
- active theme;
- relevant plugins;
- upload/import settings;
- exact artifact SHA;
- import result/errors;
- created template/page ID;
- warnings/dependency prompts.

## 24. Render verification

After successful import, render the exact imported page/section in the supported harness.

Verification may compare:

- viewport screenshots at accepted widths;
- bounding geometry for key mapped nodes;
- text/content preservation;
- image presence;
- visibility;
- expected interaction markers for supported behavior.

Visual diff thresholds are calibrated and versioned. A visual diff is not the only validator.

Result states:

- `IMPORT VERIFIED` if import succeeded;
- `RENDER VERIFIED` only if render checks pass;
- `ROUND-TRIP VERIFIED` later only if P20 comparison contract passes.

## 25. Verification labels shown to user

Never collapse these into one green check:

- `SOURCE COMPATIBLE`;
- `PREPARED`;
- `ARTIFACT VALIDATED`;
- `IMPORT VERIFIED`;
- `RENDER VERIFIED`;
- `ROUND-TRIP VERIFIED`;
- `REVIEW`;
- `BLOCKED`.

The UI may show a progress chain so the user understands exactly what has and has not been proven.

## 26. Section export / transfer

Required P15 section flow:

1. user selects one Frame/section;
2. run P13/P15 compatibility against exact selection;
3. prepare duplicate only if required;
4. generate a native template JSON for the selection where accepted;
5. validate;
6. user downloads/imports into Elementor Template Library.

Future one-click `Copy for Elementor` can use WP Builders Bridge, but until bridge acceptance the plugin should not claim native clipboard compatibility.

## 27. WP Builders Bridge boundary

A companion WordPress plugin may later improve installation and verification.

Potential responsibilities:

- receive/upload WP Builders versioned payload;
- observe WordPress/Elementor environment;
- validate dependency compatibility;
- invoke accepted WordPress/Elementor import paths;
- return structured import/render diagnostics;
- support section transfer without undocumented clipboard internals.

Security requirements before bridge implementation:

- authenticated WordPress capability checks;
- CSRF/nonce protection;
- strict payload schema;
- upload limits;
- no arbitrary PHP/JS execution;
- asset MIME validation;
- least-privilege REST/admin actions;
- explicit site connection/consent.

The current Figma Community core remains network-free. A networked bridge/client is a separate product surface and permission review.

## 28. Option-state design to prevent glitches

User options form a dependency graph.

Example order:

1. Adapter family (`v3 Container` / `v4 Atomic`);
2. exact/tested target version range/profile;
3. Core/Pro capability profile;
4. document type (`Section/Container`, `Page`, accepted site part);
5. styling strategy (`Local`, accepted Globals/Design System);
6. responsive profile;
7. artifact family (`JSON`, conditional ZIP, conditional Website Template/Kit`);
8. advanced behavior capabilities.

Rules:

- changing an upstream option resets/revalidates incompatible downstream choices;
- disabled options explain their requirement;
- no hidden stale option remains in serialized config;
- configuration itself is validated before compatibility scan;
- unsupported combination is impossible to submit through normal UI and rejected by core contract if constructed programmatically.

## 29. Fallback policy

No silent fallback.

Every non-native fallback declares:

- original intent;
- replacement strategy;
- visual fidelity risk;
- behavior loss;
- responsive risk;
- editability impact;
- whether user confirmation is required.

Example: converting an unsupported complex visual effect to a flattened image may be a valid optional fallback for some use cases, but it must be shown as `FALLBACK / reduced editability`, not `NATIVE`.

## 30. Error model

Reserve stable codes including:

- `P15_PROFILE_INVALID`;
- `P15_PROFILE_STALE`;
- `P15_TARGET_VERSION_UNSUPPORTED`;
- `P15_PRO_REQUIRED`;
- `P15_ATOMIC_REQUIRED`;
- `P15_CAPABILITY_UNSUPPORTED`;
- `P15_SOURCE_NOT_READY`;
- `P15_PREPARATION_REQUIRED`;
- `P15_MAPPING_BLOCKED`;
- `P15_GLOBAL_REFERENCE_UNRESOLVED`;
- `P15_ASSET_MISSING`;
- `P15_FONT_REQUIREMENT_UNRESOLVED`;
- `P15_SCHEMA_INVALID`;
- `P15_PACKAGE_INVALID`;
- `P15_GENERATION_CANCELLED`;
- `P15_IMPORT_FAILED`;
- `P15_RENDER_FAILED`;
- `P15_ENVIRONMENT_MISMATCH`;
- `P15_INTERNAL_INVARIANT_FAILED`.

Errors include recovery guidance and relevant node/capability/dependency context.

## 31. Receipt contract

Every terminal generation run emits a deterministic receipt.

Minimum data:

- run ID;
- source/Prepared Duplicate fingerprint;
- P13/P14 references when used;
- TargetProfile + digest;
- adapter ID/version;
- compatibility classification counts;
- mapping decisions/fallbacks/refusals;
- artifact family;
- artifact hash/size;
- schema/package validation result;
- dependency manifest;
- import verification target/result if run;
- render verification result if run;
- limitations;
- timestamps.

Receipt wording must distinguish `DECLARED` and `OBSERVED` target facts.

## 32. Determinism and reproducibility

For same normalized source + same TargetProfile + same adapter version:

- semantic mapping result is identical;
- IDs generated by the adapter use a deterministic collision-safe strategy where Elementor does not require random IDs;
- serialized JSON ordering is stable for repository/test artifacts;
- deterministic ZIP metadata is used where package rules allow;
- artifact hash should match across supported environments when all deterministic inputs are identical.

If an Elementor-required field is inherently nondeterministic, document it and normalize it out of semantic parity comparisons rather than hiding it.

## 33. Performance

Generation must remain bounded:

- one normalized source traversal reused across mapping stages;
- no unbounded global O(n²) comparison;
- assets deduplicated by hash;
- large images exported/encoded with explicit limits;
- ZIP creation streams/bounds memory where implementation environment requires it;
- progress reflects deterministic mapping/assets/validation stages;
- cooperative cancel between bounded stages;
- large unsupported jobs fail early with actionable size/dependency details.

## 34. Test matrix

### Unit tests

- TargetProfile validation/provenance;
- capability dependency/reset rules;
- v3 mapping rules;
- v4 mapping rules;
- responsive mappings;
- global/class/variable closure;
- fallback classification;
- stable IDs;
- error codes;
- receipt serialization.

### Fixture tests

- simple hero;
- nested flex layout;
- repeated cards/grid;
- text/image/button page;
- responsive v3 settings;
- custom breakpoint case;
- classic global colors/fonts;
- Atomic Variables/Classes fixture when supported;
- Pro-required feature;
- missing dependency;
- unsupported effect/interaction;
- deliberate overlay;
- prepared duplicate input.

### Malformed-input/package tests

- duplicate IDs;
- invalid element type;
- unknown widget;
- dangling global/variable/class reference;
- missing asset;
- invalid responsive suffix/style;
- invalid ZIP paths;
- zip bomb/compression ratio;
- missing package file;
- unsupported target version.

### Import/render matrix

- v3 Core environment;
- v4/Atomic Core environment;
- Pro environment for shipped Pro capability;
- supported custom-breakpoint environment;
- expected refusal on missing requirement.

## 35. Production acceptance

P15 may be `IMPLEMENTATION COMPLETE` when:

- adapter code/tests pass;
- Template JSON validator passes;
- capability-driven UI prevents invalid configurations;
- deterministic receipts/export work.

P15 may be `PRODUCTION ACCEPTED` only when:

- fresh R0 is still current;
- P13/P14 dependencies are production accepted;
- at least one supported v3 artifact imports/renders successfully;
- at least one supported v4 artifact imports/renders successfully if v4 ships;
- every enabled artifact family has a real round-trip/import fixture;
- no enabled ZIP/Kit capability lacks a proven package contract;
- Core/Pro/dependency refusals behave correctly;
- responsive/global/style closure is tested;
- source remains unchanged;
- output verification labels accurately reflect observed evidence;
- docs/status are synchronized.

## 36. Commercial packaging boundary

P15 capability may later be gated by Pro/Agency entitlements, but entitlement logic cannot alter correctness.

Examples:

- Free: compatibility preview/basic mapping summary;
- Pro: native Template JSON/export and full validation;
- Agency: batch projects, presets, bridge/environment verification, white-label receipts.

Exact packaging/pricing remains a P25 decision informed by current market evidence.

## 37. Current gate

This document is planning-only.

Do not begin P15 runtime implementation until:

- #84 internal P12 exit is accepted;
- P13 is production accepted;
- P14 is production accepted;
- R0 source assumptions remain current at implementation time;
- R1 TargetProfile/capability/schema/import-harness details are frozen in the focused implementation issue.

Planning grants no P12/P13/P14/P15 runtime acceptance credit.
