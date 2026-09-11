# Reliability and Compatibility Audit

Status: PLANNED / CROSS-CUTTING GATE FOR P13-P26  
Owner issue: #119  
Date: 2026-09-11

## 1. Purpose

This audit hardens the post-P12 commercial roadmap so WP Builders Prepare can grow without becoming a collection of fragile export buttons.

The product promise is not merely "convert Figma to X". The product must prove that a selected target is supported, prevent invalid option combinations, preserve the approved source, generate a complete artifact atomically, validate that artifact, and state clearly when a real target environment has or has not been verified.

The cross-cutting reliability flow is:

`Target Profile -> Source Snapshot -> Compatibility -> Optional Target-Ready Duplicate -> Validation -> Generate -> Package Validate -> Import/Build Validate -> Round-Trip QA -> Receipt -> Download/Transfer`

No user-visible success state may skip the gates required by the selected target.

## 2. Official-platform audit findings

### Figma runtime constraints

Official Figma Plugin API documentation confirms:

- plugin network access is manifest-declared and `allowedDomains: ["none"]` blocks external network requests;
- files/pages are dynamically loaded and asynchronous APIs must be awaited correctly;
- `exportAsync` can render PNG/JPG/SVG/PDF and related supported outputs;
- existing image fills can be accessed through `getImageByHash()` and original stored image bytes can be read with `Image.getBytesAsync()`;
- image export constraints support scale/width/height variants;
- `loadFontAsync` loads fonts already accessible to the Figma editor; it is not a raw font-file download API.

Implications:

- the current Community core remains offline;
- arbitrary direct push from Figma to customer WordPress domains is not part of the core contract;
- image UI must distinguish **Stored Original Image Bytes** from **Rendered Appearance**;
- font binary export is not promised from Figma alone.

Official references:

- https://developers.figma.com/docs/plugins/manifest/
- https://developers.figma.com/docs/plugins/making-network-requests/
- https://developers.figma.com/docs/plugins/api/properties/nodes-exportasync/
- https://developers.figma.com/docs/plugins/api/ExportSettings/
- https://developers.figma.com/docs/plugins/api/Image/
- https://developers.figma.com/docs/plugins/api/properties/figma-loadfontasync/

### Elementor runtime/import constraints

Official Elementor documentation confirms:

- template-library imports accept JSON or ZIP;
- Elementor stores page data in JSON;
- modern Container layouts are recursive/nested;
- responsive values are device-specific settings;
- Elementor 4 introduces Atomic elements with their own versioned structure;
- Elementor 4 can coexist with existing v3 content, so target architecture must be explicit rather than assumed;
- global styles/design-system data can live outside the individual page and can require kit/design-system context;
- kit imports can fail because of invalid/corrupt ZIPs, upload-size limits, memory/timeouts, missing ZIP support, authorization, or third-party-plugin dependencies.

Implications:

- there is no single timeless "Elementor exporter";
- initial adapters must be separate versioned families such as `elementor-v3-container` and `elementor-v4-atomic`;
- Pro support is a declared capability set, not an assumption;
- third-party widgets/add-ons are never silently mapped as native Elementor;
- standalone template export must validate global-reference closure;
- kit generation and template generation are distinct output modes;
- an offline Figma-side package validator cannot honestly guarantee a customer's WordPress server can import the package.

Official references:

- https://elementor.com/help/adding-templates/
- https://elementor.com/help/how-to-fix-common-errors-with-import-export/
- https://developers.elementor.com/docs/data-structure/
- https://developers.elementor.com/docs/data-structure/container-element
- https://developers.elementor.com/docs/data-structure/responsive-data
- https://developers.elementor.com/docs/data-structure/atomic-elements
- https://developers.elementor.com/docs/data-structure/global-styles
- https://developers.elementor.com/elementor-editor-4-0-developers-update/

### Gutenberg runtime/import constraints

Official WordPress documentation confirms:

- block editor content is serialized using block delimiters in post content;
- `@wordpress/blocks` exposes parse/serialize APIs;
- WordPress validates saved block markup against block definitions;
- block structures and supported attributes vary across WordPress/block versions;
- block patterns contain serialized block content and can be represented/exported as structured data.

Implications:

- generated Gutenberg output must parse -> serialize -> parse stably;
- supported fixtures must open without invalid-block warnings;
- target WordPress version and block support are part of the adapter contract;
- "native-only" and "native + scoped compatibility CSS" should be separate explicit modes if both are eventually supported;
- unsupported/custom blocks become REVIEW rather than flattened silently.

Official references:

- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-blocks/
- https://developer.wordpress.org/block-editor/getting-started/fundamentals/markup-representation-block/
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-serialization-default-parser/
- https://developer.wordpress.org/reference/functions/serialize_blocks/
- https://developer.wordpress.org/block-editor/reference-guides/block-api/block-patterns/

## 3. Reliability corrections to the commercial plan

### Correction A — target environment truth is separate from package truth

The plugin can prove that generated bytes satisfy its adapter/package contract. It cannot prove a random WordPress site will import successfully unless that site's environment is actually observed.

Every export therefore has two independent states:

- **Artifact Validation:** generated schema/package/assets passed local deterministic checks.
- **Target Environment Validation:** real target version/environment/import/build was observed.

Without a real target observation, the UI says `Package Validated — Live Site Not Verified`, never `Guaranteed Import`.

### Correction B — target profile is immutable during a run

Before audit/export the user selects a versioned `TargetProfile`.

Example fields:

```text
target: elementor
adapter: elementor-v4-atomic
coreVersion: supported range/preset
pro: true|false
outputMode: template-json | template-zip | kit-zip | section-package
responsiveMode: source-only | explicit-source-breakpoints
assetMode: stored-original | rendered-display | scale-1x | scale-2x | custom
styleMode: local | design-system
```

Changing any field invalidates previous compatibility and export results. A run cannot silently reuse stale validation from a different target profile.

### Correction C — capabilities generate the UI

Each adapter exposes one machine-readable capability descriptor.

The UI is generated from this descriptor instead of manually showing every global option.

Each option is one of:

- `SUPPORTED` — selectable;
- `SUPPORTED_WITH_REVIEW` — selectable with an explicit warning;
- `UNSUPPORTED` — disabled/hidden with a reason;
- `REQUIRES` — enabled only when a dependency/capability is present.

This prevents combinations such as selecting an Elementor v3-only widget inside an Atomic-only export mode or selecting a framework styling mode the adapter cannot compile.

### Correction D — export is atomic

A downloadable artifact is not exposed while it is partially generated.

Pipeline:

1. generate in temporary in-memory/work buffer;
2. validate manifest/schema/references/assets;
3. validate required checksums;
4. optional compile/import/render harness;
5. create final immutable bytes;
6. compute receipt/checksum;
7. enable Download/Copy.

Failure discards the incomplete candidate and leaves the source untouched.

### Correction E — no silent fallback

If a native mapping is unavailable, the product does not silently substitute screenshots, arbitrary HTML, different widgets, or custom JS.

Fallback choices must be user-visible and recorded in the export report, for example:

- Native mapping;
- Native + scoped CSS;
- Flatten visual asset;
- Manual review placeholder;
- Unsupported/block export.

## 4. Canonical user-state machine

Every target export uses the same state model:

```text
IDLE
  -> TARGET_SELECTED
  -> SCANNING
  -> COMPATIBILITY_READY
  -> READY | REVIEW | BLOCKED
  -> DUPLICATING (when needed)
  -> PREPARING
  -> VALIDATING_SOURCE
  -> GENERATING
  -> VALIDATING_ARTIFACT
  -> VERIFYING_TARGET (when available)
  -> ROUND_TRIP_QA (when available)
  -> READY_TO_DOWNLOAD | READY_WITH_REVIEW | FAILED_RECOVERABLE | FAILED_BLOCKED
```

Rules:

- only one active state transition per job;
- invalid transitions are rejected by the state machine;
- buttons are enabled from state, not ad-hoc booleans;
- destructive actions never become enabled from an error/retry path accidentally;
- Cancel is cooperative and leaves no partial mutation/package;
- Retry starts from the last safe deterministic boundary, not from an unknown middle state;
- changing selection/target/source marks prior results `STALE`.

## 5. Source staleness and run identity

Every run receives:

- source fingerprint;
- selected target profile fingerprint;
- adapter version;
- core engine version;
- validation policy version;
- deterministic run ID/receipt ID.

Before final download/transfer, re-check the source/target fingerprints. If the source changed after audit, mark the result `STALE` and require revalidation.

The downloadable artifact content should be deterministic for the same normalized source + target profile + adapter version. Human timestamps belong in the separate receipt/report, not in deterministic core bytes unless the target format requires them.

## 6. Elementor reliability contract

### Adapter families

Do not collapse Elementor into one mode.

Initial families:

- `elementor-v3-container`;
- `elementor-v4-atomic`;
- Pro capability overlays only where documented and tested.

A hybrid Elementor site may accept either family, but the user must choose the intended output family. The exporter does not emit ambiguous mixed architecture by default.

### Template vs ZIP vs kit

Treat these as separate products:

- template JSON;
- template ZIP/multi-template ZIP where documented;
- website kit ZIP only after kit structure/dependencies are fully validated;
- design-system ZIP only under its own supported Elementor version/capability contract.

### Reference closure

Before download:

- all element IDs valid/unique where required;
- every global style/class/variable reference resolves inside the intended package/site contract;
- all asset references resolve;
- Pro/native widget capability verified;
- no third-party add-on mapping claimed unless a dedicated adapter exists.

### WordPress environment profile

Offline mode accepts a user-selected environment profile and labels it `DECLARED`, not observed.

A future WordPress companion can produce an `OBSERVED` environment profile containing only needed compatibility facts, for example:

- WordPress version;
- Elementor Core version;
- Elementor Pro presence/version when relevant;
- editor family/features;
- required plugins present;
- ZIP support;
- relevant upload/memory/import-limit diagnostics.

The core Figma Community plugin does not need arbitrary network access to use this architecture: the companion can export/import a small compatibility file or receive the generated package in WP Admin.

## 7. Gutenberg reliability contract

For every supported target preset:

- core-block mapping matrix is versioned;
- generated content must parse successfully;
- serialize(parse(output)) must be stable under the accepted normalization policy;
- supported fixtures must re-open in the editor without invalid-block recovery prompts;
- unsupported theme/block/plugin dependencies are listed explicitly;
- target theme differences are not misreported as serializer correctness.

A bridge may import the serialized section/pattern, but the package remains useful without network access through file/paste workflows.

## 8. HTML/framework reliability contract

### Generated project contract

Every framework adapter declares:

- framework and supported version range;
- JavaScript/TypeScript support;
- styling modes;
- package manager preset;
- component/runtime dependencies;
- SSR/client-only assumptions;
- routing assumptions;
- supported interaction primitives;
- unsupported features.

Generated fixture projects must pass install/typecheck/build in CI using pinned adapter test matrices before an adapter is production accepted.

Do not generate dependency versions using `latest` in accepted artifacts.

### Code-to-design security/reliability

Static HTML/CSS reconstruction is the first accepted path.

ZIP/folder import must defend against:

- path traversal;
- oversized archives/zip bombs;
- excessive file counts/nesting;
- unsupported/binary executables;
- remote resource auto-fetch;
- arbitrary script execution.

JavaScript execution remains disabled until a separate sandbox specification proves bounded CPU/time/memory/network/storage/navigation behavior.

## 9. Asset reliability contract

### Raster images

Present explicit choices:

- **Stored Original** — original encoded image bytes from a Figma image fill where `getImageByHash(...).getBytesAsync()` is available;
- **Rendered Appearance** — rendered node including crop/mask/effects/layout appearance;
- **Rendered Display Size**;
- **1x / 2x / custom scale**.

Do not call Stored Original "what the user uploaded" when Figma cannot prove upstream provenance beyond the stored image bytes.

### Vectors/icons

Export SVG with declared text-outline/stroke policy. Report when flattening/outlining changes editability.

### Fonts

Export:

- family;
- style;
- weight when determinable;
- usage locations/counts;
- missing-font state;
- target CSS/Elementor/Gutenberg mapping advisories.

Raw font files are external user-provided inputs only.

## 10. Job orchestration and recovery

Reuse the proven sequential P7 queue model for expensive export/project jobs.

Rules:

- bounded concurrency;
- per-step timeout;
- cooperative cancellation;
- progress is phase-based and monotonic;
- no duplicate concurrent export for the same run key;
- idempotent retry where possible;
- bounded local checkpoint metadata only, never huge artifact blobs in persistent plugin storage;
- deterministic regeneration after plugin restart when a checkpoint is still valid;
- clear `FAILED_RECOVERABLE` vs `FAILED_BLOCKED` states.

## 11. Error model

No generic-only `Something went wrong` errors in accepted target flows.

Every failure has:

- stable error code;
- target/adapter/run identity;
- phase;
- human-readable cause;
- actionable next step;
- retryable yes/no;
- safe diagnostic details;
- no secrets/design content in logs unless user explicitly exports a diagnostic bundle.

Example families:

- `TARGET_PROFILE_INVALID`;
- `SOURCE_CHANGED`;
- `FONT_MISSING`;
- `ASSET_BYTES_UNAVAILABLE`;
- `MAPPING_UNSUPPORTED`;
- `PACKAGE_REFERENCE_BROKEN`;
- `ELEMENTOR_ENV_NOT_VERIFIED`;
- `GUTENBERG_BLOCK_INVALID`;
- `GENERATED_PROJECT_BUILD_FAILED`;
- `ROUND_TRIP_DRIFT_EXCEEDED`;
- `JOB_CANCELLED`.

## 12. Option-glitch prevention tests

Every adapter UI must include automated tests for:

- changing target clears incompatible dependent values;
- changing adapter version invalidates old validation;
- disabled options cannot be submitted through stale UI state;
- all capability descriptor options have UI coverage;
- all visible combinations are either valid or explicitly REVIEW;
- pairwise/combinatorial option coverage;
- serialization/deserialization of target profiles;
- duplicate clicks do not start duplicate jobs;
- cancel/retry race behavior;
- source-selection changes during long jobs;
- plugin close/reopen recovery metadata;
- large files and memory pressure;
- Unicode/long filenames and duplicate asset names;
- zero/hidden/invisible/missing-font nodes;
- corrupted/malformed generated/imported packages.

## 13. Production acceptance matrix

A target adapter is not production accepted until all applicable layers pass:

1. normalized source fixtures;
2. capability/option contract tests;
3. deterministic serializer tests;
4. schema/package/reference validator;
5. malformed/adversarial tests;
6. generated project build or parser round-trip tests;
7. real target import/editor-open test;
8. real target render test where feasible;
9. Figma source vs target round-trip QA;
10. cancellation/retry/stale-source tests;
11. cross-platform plugin/CLI tests where applicable;
12. exact-build artifact provenance.

If a layer is impossible for a target, the adapter documents the missing proof and cannot claim that stronger level of readiness.

## 14. Reliability release labels

Use precise labels instead of one vague success badge:

- `SOURCE READY` — Figma-side checks passed;
- `ARTIFACT VALIDATED` — generated bytes/package passed deterministic validators;
- `IMPORT VERIFIED` — actual supported target import was observed;
- `RENDER VERIFIED` — actual target render was observed;
- `ROUND-TRIP VERIFIED` — target render stayed within accepted comparison thresholds;
- `REVIEW REQUIRED` — export possible but known limitations remain;
- `BLOCKED` — artifact must not be presented as ready.

## 15. Rollout order correction

The commercial phase order remains P13-P26, but every target phase now passes two recurring gates:

- **R0 — Market/Platform Research:** is the target still documented, valuable and differentiated?
- **R1 — Reliability/Compatibility Gate:** is the adapter profile explicit, option matrix valid, failure model defined, validators available, and acceptance harness ready?

R1 must be completed before implementation for P15, P16, P17, P18, P19 and any future builder/framework adapter.

## 16. Audit conclusion

The P13-P26 direction is commercially strong, but reliable execution requires adapter/version truth, explicit environment-verification levels, a capability-driven UI, atomic package generation, no silent fallback, run staleness detection, structured errors and real target acceptance tests.

These controls are mandatory product architecture, not optional QA polish.
