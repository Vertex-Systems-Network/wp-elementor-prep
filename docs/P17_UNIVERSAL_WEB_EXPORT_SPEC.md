# P17 Universal Web Export + Code-to-Design Import — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; P13/P14 accepted foundations; sequencing after P15/P16 per roadmap  
R0 source snapshot: `docs/R0_WEB_CODE_ADAPTER_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P17 defines a deterministic, versioned web adapter layer for two directions:

1. **Design -> Web:** generate validated semantic HTML/CSS/assets and only bounded, explicitly representable JavaScript interactions.
2. **Web -> Design:** parse supported HTML/CSS packages into a new Figma reconstruction without requiring arbitrary JavaScript execution.

The goal is not to claim that every website can be losslessly converted. The goal is to make supported conversion boundaries explicit, reproducible and evidence-backed.

## 2. Canonical user flows

### Design -> Web

`Select Frame/section -> Choose web profile -> Compatibility Scan -> Prepare Duplicate if required -> Build neutral web IR -> Generate HTML/CSS/assets/(optional JS) -> Validate package -> Controlled browser render -> Compare -> Download + receipt`

### Web -> Design

`Choose HTML/CSS input -> Package safety scan -> Parse static source -> Resolve local resources -> Build normalized web IR -> Unsupported-feature report -> Create new Figma reconstruction candidate -> Validate structure/assets/text -> Optional browser/reference compare -> Accept new reconstruction + receipt`

No success label may imply browser/runtime/fidelity proof that was not actually observed.

## 3. Adapter identity

Initial adapter family:

`web-standard-v1`

Initial profiles:

- `html-css-static`;
- `html-css-assets`;
- `html-css-vanilla-js` — gated to accepted interaction recipes only;
- `static-html-css-import`;
- `static-site-package-import`;
- `tailwind-static` — conditional on separate adapter/toolchain acceptance.

Future framework targets belong to P18 and must consume the same neutral model instead of forking P17 scanning logic.

## 4. Target/source profile contract

Suggested shape:

```ts
interface WebTargetProfileV1 {
  schemaVersion: 1;
  adapterId: "web-standard-v1";
  adapterVersion: number;
  direction: "DESIGN_TO_WEB" | "WEB_TO_DESIGN";
  html: {
    semanticPolicyVersion: number;
    documentMode: "FULL_DOCUMENT" | "FRAGMENT";
  };
  css: {
    strategy: "PLAIN_CSS" | "CSS_VARIABLES" | "TAILWIND";
    supportMatrixVersion: number;
    responsivePolicyVersion: number;
  };
  interactions: {
    mode: "NONE" | "ALLOWLISTED_VANILLA_JS" | "SANDBOXED_RUNTIME";
    recipeSetVersion?: number;
  };
  assets: {
    policyVersion: number;
    localOnly: boolean;
  };
  runtime?: {
    browserEngine?: ObservedOrDeclaredString;
    browserVersion?: ObservedOrDeclaredVersion;
    sandboxProfile?: string;
  };
}
```

Every runtime/environment field preserves provenance: `OBSERVED`, `DECLARED`, `DEFAULT_ASSUMED` only where harmless, or `UNKNOWN`.

## 5. Neutral Web IR boundary

P17 must not generate target files directly from arbitrary raw Figma nodes or raw DOM nodes. Both directions normalize through a target-neutral Web IR.

Minimum IR responsibilities:

- semantic role/tag intent;
- ordered child hierarchy;
- text runs/content;
- layout mode: flow/flex/grid/positioned;
- sizing/min/max constraints;
- spacing;
- typography;
- fills/backgrounds/borders/radius/shadows;
- media/asset references;
- visibility/state evidence;
- responsive constraints/media-query evidence;
- interaction recipe references;
- provenance back to source Figma node or source DOM selector/path;
- unsupported/lossy annotations.

The IR must be deterministic, serializable and versioned.

## 6. Design -> HTML semantic mapping

P17 does not emit a `div` for every Figma Frame when stronger evidence exists.

Potential semantic mappings include:

- clear page root -> `main` only when landmark evidence is valid;
- navigation groups -> `nav` when role is explicit;
- headings -> `h1`…`h6` only when hierarchy is known;
- paragraph text -> `p`;
- list structures -> `ul`/`ol` + `li`;
- explicit links -> `a`;
- explicit user actions -> `button` when action semantics are known;
- images -> `img`/`picture` according to accepted media strategy;
- decorative visuals -> non-semantic background/presentation output where appropriate;
- sections/articles/footer/header only when source evidence supports that role.

Ambiguous semantics use conservative generic markup plus REVIEW evidence. The adapter never invents SEO/landmark meaning for presentation-only layers.

## 7. Layout mapping

Initial mapping priority:

1. normal document flow;
2. Flexbox for one-dimensional Auto Layout/compatible structures;
3. CSS Grid for accepted two-dimensional repeated/grid structures;
4. positioned layers only when overlays/anchoring are intentional;
5. unsupported/freeform geometry -> REVIEW or controlled absolute-position fallback.

Absolute positioning must not be used as a silent universal fallback merely to match one desktop screenshot.

## 8. Responsive policy

P13 Responsive Risk is input evidence. P17 may generate responsive behavior only from explicit/deterministic constraints.

Allowed sources include:

- Figma Auto Layout sizing/wrap evidence;
- min/max width rules derivable from the source;
- intrinsic image/aspect behavior;
- accepted repeated-grid constraints;
- explicitly provided breakpoint variants or target settings;
- user-declared breakpoint policy.

Forbidden behavior:

- inventing mobile/tablet compositions;
- guessing hidden/reordered content;
- generating arbitrary breakpoint-specific typography or spacing solely to make screenshots look better.

If desktop source evidence is insufficient, the package is marked responsive REVIEW even if the desktop render matches.

## 9. CSS strategy

### Plain CSS

Default first implementation.

Requirements:

- deterministic class naming;
- stable declaration ordering;
- CSS variables for repeated accepted tokens where selected;
- explicit media-query generation;
- no external `@import` in an offline package;
- no hidden remote dependencies.

### CSS variables

When repeated values meet accepted tokenization rules, emit versioned custom properties. A one-off value does not become a global token merely to increase token coverage.

### Tailwind — conditional adapter

Tailwind output is separate from the neutral IR and records target/toolchain assumptions.

Rules:

- utilities must be statically discoverable by the selected build flow;
- arbitrary values are permitted for exact values but reported separately from token-backed values;
- arbitrary property/variant use is bounded and deterministic;
- dynamic class construction that the selected Tailwind scanner cannot detect is rejected;
- generated config/theme variables are part of the artifact receipt.

## 10. Asset export

P17 packages assets through the shared P19-oriented asset contract where available, but the initial adapter still needs local closure.

Each asset record contains:

- source identity/provenance;
- content hash;
- media type;
- dimensions where relevant;
- output path;
- usage references;
- export scale/policy;
- alt-text source status;
- missing/external status.

Generated HTML/CSS may reference only packaged/resolved resources unless the selected profile explicitly allows declared external references. Offline validated packages default to local closure.

## 11. Font policy

Generated packages may emit font-family intent and CSS font stacks.

Raw font binaries are included only when:

- user supplied them through an accepted local flow;
- license policy permits packaging;
- file hashes and weights/styles are known.

P17 must not claim Figma can export arbitrary installed font binaries.

## 12. Interactions

First production interaction scope is allowlist-only.

Potential accepted recipes after tests:

- disclosure/accordion;
- tabs;
- simple carousel/slider with deterministic controls;
- mobile menu toggle only when the source explicitly represents the states/behavior;
- modal/dialog only when accessibility/focus/escape/scroll behavior is fully specified;
- anchor navigation;
- simple class/state toggles.

Each recipe has:

- recipe ID/version;
- required semantic structure;
- required source evidence;
- generated JS module;
- keyboard/focus expectations;
- cleanup/unmount behavior where relevant;
- runtime fixtures.

Unknown prototype behavior is not converted into guessed JavaScript.

## 13. Generated JavaScript boundary

`html-css-vanilla-js` may contain only code generated from accepted internal recipes.

It may not contain:

- copied arbitrary script from an imported page;
- `eval`/`new Function`;
- remote script loaders;
- analytics/tracker injection;
- ambient credential/storage access;
- unbounded navigation;
- dependency installation at runtime.

The generated JS source is deterministic for the same IR/profile/version.

## 14. Web -> Design static import

The default code-import path does not execute JavaScript.

Accepted pipeline:

1. scan package paths and limits;
2. select/validate HTML entrypoint;
3. parse into a detached normalized DOM model;
4. strip/quarantine executable surfaces according to policy;
5. parse local CSS into the owned normalized style model;
6. resolve cascade/selectors for supported syntax;
7. resolve local assets;
8. compute static layout through the accepted render/layout engine;
9. construct Web IR;
10. create a **new** Figma reconstruction candidate;
11. validate text/assets/geometry/structure;
12. expose unsupported/lossy evidence.

Imported code never mutates the existing approved Figma design in place.

## 15. Import security scan

Before parsing/rendering, classify at least:

- script elements;
- inline event-handler attributes;
- executable URL schemes;
- iframes/objects/embeds;
- forms/submission targets;
- meta refresh;
- remote stylesheet/script/font/image references;
- CSS `@import`;
- CSS URL references;
- service worker intent;
- fetch/XHR/WebSocket/EventSource intent if scripts are inspected;
- window/navigation/popup intent;
- storage/cookie APIs if scripts are inspected;
- oversized files/decompression bombs/path traversal.

Static import either rejects, strips, quarantines or records each according to a versioned policy. No active behavior is silently permitted.

## 16. Package safety

ZIP/folder input validation must include:

- bounded compressed/uncompressed size;
- bounded file count;
- bounded nesting depth/path length;
- path traversal rejection;
- symlink/special-file rejection where applicable;
- deterministic entrypoint selection or explicit user choice;
- case-collision handling;
- duplicate path rejection;
- content-type sniffing/extension mismatch diagnostics;
- stable package hash.

The original package remains immutable; normalization operates on a candidate workspace.

## 17. External resources

Initial offline import does not fetch remote resources.

Classification:

- local resolved;
- inline/data resource accepted by policy;
- declared external;
- blocked external;
- missing.

A page whose intended render materially depends on unresolved external CSS/fonts/images cannot receive `VISUAL_COMPARE_PASS` against the intended source unless those resources are supplied through an accepted path.

## 18. CSS support matrix

P17 implementation must maintain a machine-readable support matrix, not a vague “CSS supported” claim.

Initial categories:

- layout: block/inline/flex/grid/position;
- sizing/min/max/aspect-ratio;
- margin/padding/gap;
- typography;
- colors/backgrounds/borders/radius;
- shadows;
- overflow;
- transforms with bounded supported forms;
- opacity;
- object-fit/object-position;
- media queries;
- CSS variables;
- pseudo-classes/elements where statically representable;
- generated content;
- filters/blend/mask/clip-path;
- animations/transitions;
- container queries;
- advanced selectors;
- writing modes/logical properties;
- custom fonts.

Each property/feature is versioned as `SUPPORTED`, `SUPPORTED_WITH_REVIEW`, `RENDER_ONLY`, `FALLBACK`, `UNSUPPORTED`, or `UNKNOWN`.

## 19. Browser render harness

Artifact validation and browser render verification are separate gates.

Controlled render requirements:

- pinned browser engine/version;
- deterministic viewport/device-scale profile;
- no ambient user session;
- network disabled unless a separately accepted fixture explicitly requires it;
- local package served from controlled origin;
- fonts/assets pinned;
- animation/transitions disabled or stabilized for capture;
- deterministic wait/readiness contract;
- screenshot hash/metadata retained.

A valid HTML/CSS package is not called `BROWSER_RENDERED` until this harness actually renders it.

## 20. Future executable import harness

`SANDBOXED_RUNTIME` is a future separately accepted capability.

Minimum requirements before enabling:

- isolated origin/process/container separate from the Figma plugin core;
- deny-by-default iframe/browser sandbox or equivalent;
- no same-origin escape path;
- no ambient credentials/cookies/storage;
- network deny by default;
- navigation/popups/downloads/forms deny by default;
- bounded CPU/time/memory;
- explicit message schema between renderer and controller;
- no arbitrary host filesystem access;
- teardown after each job;
- malicious fixture suite;
- threat model and security review.

It is not necessary for the first static import release.

## 21. Reconstruction mapping

Web -> Figma reconstruction converts normalized layout into editable Figma structures where evidence permits:

- flex rows/columns -> Auto Layout;
- grid -> nested Auto Layout or future grid representation according to accepted mapping rules;
- text -> text nodes with font/style evidence;
- images/SVG -> corresponding media/vector nodes;
- backgrounds/borders/radius/shadows -> supported Figma properties;
- positioned overlays -> preserved only when intentional;
- unsupported effects -> approximation only with explicit REVIEW.

The reconstruction is not labeled “original Figma recovered.” It is a generated reconstruction with provenance back to source code paths/selectors.

## 22. Validation labels

Keep labels distinct:

- `SOURCE PARSED`;
- `STATIC MODEL VALIDATED`;
- `TARGET READY`;
- `PACKAGE VALIDATED`;
- `BROWSER RENDERED`;
- `VISUAL COMPARE PASS`;
- `RECONSTRUCTION CREATED`;
- `RECONSTRUCTION VALIDATED`;
- future `SCRIPT RUNTIME OBSERVED`;
- `REVIEW`;
- `BLOCKED`.

A parser PASS never upgrades automatically to render/runtime fidelity.

## 23. Readiness classification

Suggested categorical state:

- `READY`;
- `READY_WITH_REVIEW`;
- `NOT_READY`;
- `INSUFFICIENT_EVIDENCE`.

Evidence includes:

- semantic mapping coverage;
- layout mapping coverage;
- CSS support coverage;
- asset closure;
- responsive confidence;
- interaction coverage;
- unresolved external resources;
- unsupported feature count/severity.

A numeric score should not ship until calibrated across diverse real fixtures.

## 24. Job state machines

### Export

`IDLE -> PROFILE_READY -> COMPATIBILITY -> PREPARATION_REQUIRED? -> IR_BUILD -> GENERATING -> PACKAGE_VALIDATING -> RENDER_VERIFYING? -> VISUAL_COMPARING? -> COMPLETE`

### Import

`IDLE -> INPUT_SCAN -> SAFETY_SCAN -> PARSING -> STYLE_RESOLUTION -> RESOURCE_RESOLUTION -> IR_BUILD -> RECONSTRUCTING -> FIGMA_VALIDATING -> VISUAL_COMPARING? -> COMPLETE`

Terminal states include:

- `CANCELLED`;
- `BLOCKED`;
- `STALE`;
- `PACKAGE_REJECTED`;
- `PARSE_FAILED`;
- `RESOURCE_INCOMPLETE`;
- `RENDER_FAILED`;
- `RECONSTRUCTION_FAILED`;
- `VALIDATION_FAILED`.

Any source/profile/policy-version change invalidates downstream results.

## 25. Atomic generation/reconstruction

### Export

Generate into staging. Only publish the downloadable artifact after package validation succeeds.

### Import

Build a candidate reconstruction in a new controlled page/frame/location. Validate before presenting it as accepted output.

Failure/cancellation leaves no partial “successful” artifact and no silent mutation of an approved source.

## 26. Determinism contract

For identical normalized source, adapter version, target profile and bundled assets:

- IR serialization is stable;
- generated file paths are stable;
- HTML/CSS/recipe JS text is stable;
- package manifest is stable;
- artifact hash is stable except explicitly declared non-deterministic metadata fields, which should be avoided;
- diagnostics ordering is stable.

Browser screenshot bytes may vary by pinned platform/browser/font renderer; therefore render evidence records exact environment and uses calibrated comparison rather than pretending universal byte equality.

## 27. Testing matrix

Before implementation acceptance, tests should cover at least:

### Design -> Web fixtures

- semantic content page;
- nested flex/Auto Layout;
- two-column and repeated grid;
- image-heavy hero/card layout;
- intentional overlays;
- unsupported freeform composition;
- responsive-risk case;
- local font/package case;
- each accepted interaction recipe.

### Web -> Design fixtures

- clean semantic HTML/CSS;
- flexbox;
- grid;
- CSS variables;
- media queries;
- local assets/SVG;
- pseudo-elements/generated content;
- remote dependencies blocked;
- malicious script/event-handler fixture;
- path traversal/ZIP bomb-style rejection fixtures;
- unsupported CSS diagnostics;
- Tailwind compiled-static input.

### Fidelity

- no-op/reference browser render;
- known geometry drift;
- typography drift;
- missing image/font;
- responsive viewport set;
- reconstruction text/content preservation.

## 28. Acceptance boundary

Implementation-complete and production-accepted remain separate.

P17 production acceptance requires real evidence for the profiles claimed, including:

- deterministic package generation;
- package validation;
- browser render on pinned accepted harness;
- visual comparison fixtures;
- static import safety behavior;
- new-Figma reconstruction behavior;
- unsupported feature reporting;
- cross-platform/path safety where applicable;
- exact artifact/profile/version receipts.

No JavaScript execution acceptance is implied unless the separate runtime harness has passed its own threat model and real malicious/runtime fixture campaign.

## 29. Non-goals for first implementation

Not part of the first accepted P17 slice:

- arbitrary React/Vue/Svelte application execution;
- npm install of untrusted projects;
- arbitrary JavaScript execution;
- remote URL capture inside the network-free Figma plugin;
- login/session replay;
- backend/API execution;
- server-side rendering of unknown applications;
- browser extension automation;
- claiming lossless recovery of original Figma design from HTML;
- inventing responsive states absent from evidence.

These require separate later specs/capabilities.

## 30. P18 handoff

P18 framework adapters consume the P17 neutral Web IR and validation primitives.

P18 must not duplicate:

- source scanning;
- semantic normalization;
- asset closure;
- responsive evidence;
- unsupported-feature taxonomy;
- browser render/visual-compare receipt model.

Framework generators are target adapters layered on top of the accepted neutral model.

## 31. Implementation-opening checklist

Before P17 runtime implementation opens:

- [ ] P12 internal release exit complete;
- [ ] prerequisite P13/P14 contracts accepted in the implemented product line;
- [ ] roadmap sequencing decision confirms P17 start;
- [ ] R0 snapshot refreshed if stale/material platform changes occurred;
- [ ] Web IR schema frozen;
- [ ] CSS support matrix frozen;
- [ ] package safety limits frozen;
- [ ] sanitization/executable-surface policy frozen;
- [ ] browser render harness selected and pinned;
- [ ] first interaction recipe allowlist frozen;
- [ ] real fixture corpus prepared;
- [ ] production acceptance plan names exact evidence artifacts.

Until those gates pass, this document remains planning-only and must not be cited as runtime acceptance.