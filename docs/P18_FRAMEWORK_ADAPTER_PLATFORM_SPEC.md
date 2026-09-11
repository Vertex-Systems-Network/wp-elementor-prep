# P18 Framework Adapter Platform — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; accepted P13/P14 foundations; P17 neutral Web IR and validation primitives; roadmap sequencing  
R0 source snapshot: `docs/R0_FRAMEWORK_ADAPTER_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P18 turns the P17 neutral Web IR into a versioned multi-framework generation platform.

The objective is not to maintain separate Figma-to-React, Figma-to-Vue, Figma-to-Angular, etc. conversion engines. The objective is one deterministic source/semantic/layout pipeline with target-specific emitters, capability profiles and validation harnesses.

Initial adapter families:

- React;
- Next.js App Router;
- Vue;
- Nuxt;
- Svelte;
- SvelteKit;
- Astro;
- Angular;
- future adapters through the same SDK contract.

## 2. Canonical flow

`Validated source/Prepared Duplicate -> P17 neutral Web IR -> choose framework adapter/profile -> adapter compatibility pass -> component-boundary plan -> target code generation -> parser/typecheck/build validation -> controlled preview -> optional P20 visual comparison -> artifact + receipt`

No target-specific adapter may bypass source evidence, unsupported-feature records or asset closure merely to produce compiling code.

## 3. Core architecture

P18 consists of five layers:

1. **Neutral input layer** — accepted P17 Web IR and shared asset/token/interaction evidence.
2. **Adapter capability layer** — describes target framework features, versions and constraints.
3. **Planning layer** — maps neutral components/layout/interactions into target-native file/component/rendering decisions.
4. **Emitter layer** — generates deterministic source files/configuration.
5. **Validation layer** — parses/typechecks/builds/previews the generated artifact and records evidence.

Framework-specific code belongs in layers 2–5. Raw Figma scanning does not.

## 4. Adapter descriptor

Suggested contract:

```ts
interface FrameworkAdapterDescriptorV1 {
  schemaVersion: 1;
  adapterId: string;
  adapterVersion: number;
  framework: {
    name: "react" | "next" | "vue" | "nuxt" | "svelte" | "sveltekit" | "astro" | "angular" | string;
    compatibility: VersionRangeContract;
  };
  runtime: RuntimeCompatibilityContract;
  languages: Array<"typescript" | "javascript">;
  styling: StylingCapabilityContract;
  routing: RoutingCapabilityContract;
  rendering: RenderingCapabilityContract;
  interactions: InteractionCapabilityContract;
  projectScopes: ProjectScope[];
  buildHarness: BuildHarnessContract;
}
```

Every adapter release freezes this descriptor and its fixture corpus.

## 5. Generation profile

Every generation job creates an immutable profile containing at least:

- adapter ID/version;
- target framework compatibility range or exact target version;
- JavaScript vs TypeScript;
- project scope;
- component granularity policy;
- styling strategy;
- route strategy;
- rendering/hydration strategy;
- asset strategy;
- token strategy;
- interaction recipe set/version;
- existing-component binding registry version, if any;
- toolchain/package-manager profile;
- browser preview profile;
- explicit user declarations.

Changing an upstream profile field invalidates dependent planning/build/render evidence.

## 6. Project scopes

P18 must distinguish:

### `COMPONENT`

One reusable component and its required local assets/styles. No router/app scaffold unless required by target syntax.

### `SECTION`

A selected section composed from one or more generated/bound components.

### `PAGE`

One route/page artifact. Routing metadata may be generated only if route intent is explicit.

### `MULTI_PAGE`

Multiple pages plus explicit route map/layout relationships.

### `PROJECT`

Complete accepted project scaffold including package metadata, source directories and build configuration.

The user should not receive a full framework application when they only asked for a component.

## 7. Component boundary planner

The planner consumes neutral evidence and generates a proposed component graph before writing code.

Signals may include:

- explicit Figma components/instances;
- repeated normalized structures;
- page/section hierarchy;
- semantic roles;
- local state/interaction ownership;
- user component-granularity preference;
- existing component bindings;
- reuse count;
- prop variability across instances.

Output classification:

- `BOUND_EXISTING`;
- `GENERATE_COMPONENT`;
- `INLINE_STRUCTURE`;
- `REVIEW_BOUNDARY`;
- `UNSUPPORTED`.

The plan is deterministic for the same IR/profile/registry version.

## 8. Prop inference

Props may be generated only from observable/configured variability.

Examples:

- repeated card title/image/body differences -> candidate props;
- explicit component variant -> candidate enum/union prop;
- explicit boolean visibility/state variant -> candidate boolean/state prop;
- fixed decorative value used once -> not automatically a prop.

Do not invent application-domain props such as `user`, `product`, `checkout`, `permissions` or API entities solely from visible copy.

Generated prop names must be deterministic, valid identifiers and source-traceable.

## 9. Existing component bindings

The P18 SDK must be designed so P23 can register existing component mappings without replacing the adapter architecture.

A binding can declare:

- target package/import path;
- component name;
- accepted source component identity/signature;
- prop mapping;
- variant mapping;
- slot/children mapping;
- required providers/context;
- style ownership;
- version range;
- validation fixtures.

When an accepted binding exists, reuse is preferred over regenerating a duplicate component.

Unknown or stale bindings produce REVIEW, never silent fallback to an unrelated component.

## 10. Shared interaction model

P18 receives accepted interaction recipes from P17.

The neutral recipe describes behavior, not framework syntax. Example concepts:

- disclosure state;
- selected tab;
- carousel index;
- menu expanded state;
- dialog open state;
- controlled input state where source intent is explicit.

Adapters translate the same recipe into native framework mechanisms.

No adapter may create behavior from unsupported prototype ambiguity.

## 11. React adapter

Initial ID:

`react-web`

Preferred first profile:

- TypeScript;
- functional components;
- explicit props types/interfaces;
- React 19-compatible output after implementation-time R0 refresh;
- local state only when an accepted interaction recipe requires it;
- semantic JSX;
- CSS strategy selected by profile.

Rules:

- presentational components remain stateless where possible;
- hooks are emitted only when needed;
- effects are not used as a generic state propagation mechanism;
- no router is assumed in plain React output;
- no data fetching/API client is invented;
- no framework-specific server semantics are implied.

Validation:

- TypeScript/JS parser;
- React/JSX compile;
- selected bundler/app harness build;
- preview render;
- interaction fixtures where relevant.

## 12. Next.js adapter

Initial ID:

`next-app-router`

Default architecture:

- App Router;
- TypeScript;
- Server Components by default for non-interactive generated UI;
- smallest viable Client Component boundary for accepted interactivity/browser APIs;
- layouts/pages only from explicit page/route relationships.

Rules:

- `'use client'` is emitted only at a required client boundary;
- a client boundary's exported props must satisfy the selected Next/React serialization contract;
- server-only and client-only concerns cannot be silently mixed;
- generated visual code does not invent Server Actions;
- generated visual code does not invent database/API fetching;
- caching/revalidation is user/project configuration;
- dynamic rendering is not inferred from a mockup;
- image/font optimizations are adapter capabilities only after their asset contracts are accepted.

Validation must include production `next build` or the accepted version-equivalent build command plus controlled route render fixtures.

## 13. Vue adapter

Initial ID:

`vue-sfc`

Preferred profile:

- Vue 3 compatible at implementation time;
- TypeScript;
- Single-File Components;
- Composition API;
- `<script setup>`;
- scoped/plain style profile as selected.

Rules:

- props use deterministic `defineProps` contracts;
- emits use `defineEmits` only for accepted outward interaction contracts;
- `ref`/`computed` state is introduced only when needed;
- no global store is generated by default;
- no router is included in component-only output;
- slots are generated from actual compositional variability, not mechanically for every child.

Validation:

- Vue SFC compiler/parser;
- TypeScript check;
- accepted Vite/Vue production build;
- preview render.

## 14. Nuxt adapter

Initial ID:

`nuxt-web`

Initial implementation target must be a supported Nuxt 4 profile after implementation-time R0 refresh.

Rules:

- project routes use `app/pages` only from explicit route mapping;
- reusable components use accepted Nuxt/Vue component conventions;
- SSR/universal default may be retained, but data/server behavior is not invented;
- `.client` / `<ClientOnly>` is used only for explicit client-only requirements;
- server components/islands remain an advanced capability pack until accepted fixtures exist;
- prerender routes are explicit/derivable from route configuration, not assumed from frame names;
- Nitro/server endpoints are outside initial visual adapter scope unless separately configured.

Validation includes Nuxt typecheck/build/generate profile as applicable and route preview verification.

## 15. Svelte adapter

Initial ID:

`svelte-component`

Preferred first profile:

- Svelte 5-era syntax;
- runes mode for newly generated stateful components;
- TypeScript where selected;
- component-scoped CSS where appropriate.

Rules:

- `$props()` rather than legacy `export let` for new runes-mode output;
- `$state`/`$derived` only where accepted state/derived behavior exists;
- avoid deprecated legacy event/component APIs for new generation;
- no router is assumed for plain Svelte component output;
- snippets/composition are used according to current accepted Svelte patterns rather than blindly reproducing old slots syntax.

Validation includes Svelte compiler + TypeScript/check tooling + controlled render.

## 16. SvelteKit adapter

Initial ID:

`sveltekit-web`

Rules:

- routes use SvelteKit file-system conventions only from explicit route map;
- SSR remains the default target behavior unless profile/user configuration says otherwise;
- CSR/prerender page options are generated explicitly and minimally;
- `+page.server`/server load/API endpoints are not invented from visual design;
- client-only browser behavior is isolated to code that genuinely needs it;
- generated project does not fabricate auth/session/data contracts.

Validation includes framework check/build and rendered route fixtures.

## 17. Astro adapter

Initial ID:

`astro-islands`

Default behavior:

- TypeScript-compatible Astro project;
- `.astro` components for static/presentational content;
- zero client hydration for components with no interaction requirement;
- explicit smallest islands for accepted interactions.

Rules:

- no `client:*` directive for static content;
- hydration directive selection is a profile/recipe decision;
- a page may mix static Astro structure and accepted framework island components;
- server islands/data behavior require explicit runtime/data configuration;
- adapter must record integration packages if React/Vue/Svelte islands are selected.

Astro is not implemented as “React with different filenames”; the emitter must preserve Astro's HTML-first model.

Validation includes Astro check/build plus static output and hydrated-island runtime fixtures where used.

## 18. Angular adapter

Initial ID:

`angular-web`

Preferred initial profile after R0 refresh:

- supported Angular major;
- TypeScript;
- standalone components;
- Angular templates/styles;
- official Angular Router only when route scope requires it;
- Signals for accepted local reactive state where suitable.

Rules:

- do not generate NgModule architecture as the default for new projects;
- do not generate services merely because multiple components exist;
- dependency injection is introduced only for configured application services/contracts;
- RxJS is not used as boilerplate for purely local static/stateful UI when a simpler accepted mechanism suffices;
- forms/data services/SSR are separate capabilities.

Validation includes Angular compiler/typecheck/production build and route/component render fixtures.

## 19. Styling adapter boundary

Styling is selected independently of framework semantics where possible.

Potential profiles:

- plain CSS;
- CSS Modules where supported by target/project scaffold;
- Vue/Svelte scoped component CSS;
- Tailwind through a versioned adapter;
- existing codebase/design-system classes through P23 binding registry.

The neutral style model remains P17-owned. P18 only chooses native placement/encoding.

Unsupported CSS evidence cannot disappear because a framework's styling syntax differs.

## 20. Token mapping

P18 may consume accepted design tokens from shared/P19 contracts.

Token strategies:

- literal values;
- CSS custom properties;
- generated token module/object;
- existing project token binding;
- framework-specific wrappers only where useful.

A token reference must resolve. Dangling design-system imports/variables reject the build artifact.

## 21. Asset handling

All adapters consume the shared asset manifest and output deterministic target paths/imports.

Rules:

- local packaged assets remain content-hash traceable;
- framework image components/optimizers are optional adapter capabilities, not automatic replacements;
- remote image domains are never silently added;
- missing assets remain errors/review evidence;
- font file packaging obeys the shared user-supplied/license-permitted contract.

## 22. Route planning

Route generation is a separate planning artifact.

Suggested route record:

```ts
interface RoutePlanV1 {
  sourcePageId: string;
  routePath: string;
  routeName?: string;
  layoutId?: string;
  dynamicSegments?: DynamicSegmentContract[];
  renderingMode?: string;
  provenance: "USER_DECLARED" | "SOURCE_METADATA" | "PROJECT_IMPORTED";
}
```

No route receives `INFERRED_FROM_VISIBLE_HEADING` provenance. Frame names may be suggestions in UI but require explicit acceptance before generation.

## 23. Dynamic routes/data

A design can show repeated content but cannot prove the production data source.

P18 may emit:

- typed placeholder props;
- sample fixture data in development examples clearly labeled sample;
- component interfaces;
- route placeholders only from explicit route contracts.

P18 may not silently emit:

- fake production API URLs;
- guessed database schemas;
- auth/session logic;
- CMS queries;
- payment logic;
- backend persistence.

Those belong to configured P24 or project-specific integration layers.

## 24. Type generation

TypeScript profiles should use generated types to make unsupported/ambiguous contracts visible early.

Rules:

- deterministic type/property names;
- no `any` as a universal escape hatch;
- unknown external data uses explicit unknown/placeholder contract until configured;
- discriminated unions may represent accepted component variants;
- generated component bindings validate required props.

Compiler errors are build failures, not REVIEW-only warnings.

## 25. File/path determinism

For the same IR, generation profile, adapter version and binding registry:

- component file names are stable;
- route file names are stable;
- import order is stable;
- prop order is stable;
- CSS declaration/order follows deterministic rules;
- package/config files are stable;
- diagnostics are stable;
- manifest hashes are stable except unavoidable toolchain output handled separately.

Name collisions use a deterministic disambiguation rule and appear in the receipt.

## 26. Package/dependency policy

Project-scaffold adapters maintain an explicit allowlisted dependency template.

Generated `package.json` must distinguish:

- framework runtime dependencies;
- adapter-required build dependencies;
- optional styling/integration dependencies;
- user/project-bound dependencies.

No dependency is added “just in case.”

Adapter receipts record exact generated dependency declarations. Installation/build receipts separately record actual resolved lockfile versions.

## 27. Networked build boundary

The Figma Community plugin remains network-free according to its accepted contract.

Dependency installation/build/preview that requires Node/package registries occurs in a separately accepted local/CLI/companion execution context.

Before production use, that context must provide:

- isolated workspace;
- no inherited secrets;
- explicit network policy;
- package registry policy;
- bounded CPU/memory/time/disk;
- lifecycle-script policy;
- cleanup after job;
- build logs and tool versions;
- lockfile/artifact receipt.

## 28. Adapter SDK

A future adapter implementation must implement a bounded SDK contract rather than importing internal scanner state directly.

Conceptual interface:

```ts
interface FrameworkAdapterV1 {
  descriptor(): FrameworkAdapterDescriptorV1;
  analyze(input: WebIR, profile: GenerationProfile): AdapterAnalysis;
  plan(input: WebIR, profile: GenerationProfile): FrameworkGenerationPlan;
  generate(plan: FrameworkGenerationPlan): GeneratedFileSet;
  validateStatic(files: GeneratedFileSet, profile: GenerationProfile): StaticValidationResult;
  build?(workspace: AcceptedBuildWorkspace): BuildValidationResult;
  preview?(artifact: BuiltArtifact, harness: PreviewHarness): PreviewResult;
}
```

Adapters receive immutable normalized inputs and return structured outputs/diagnostics.

## 29. Adapter capability taxonomy

For each neutral feature, adapters declare one of:

- `NATIVE`;
- `NATIVE_WITH_PROFILE`;
- `GENERATED_RECIPE`;
- `BOUND_COMPONENT_REQUIRED`;
- `FALLBACK`;
- `UNSUPPORTED`;
- `UNKNOWN`.

Coverage denominators include unsupported/unknown nodes; adapters cannot inflate readiness by omitting hard cases.

## 30. Compatibility/readiness state

Suggested categorical states:

- `READY`;
- `READY_WITH_REVIEW`;
- `NOT_READY`;
- `INSUFFICIENT_EVIDENCE`.

Evidence includes:

- component boundary coverage;
- semantic/layout/style coverage from P17;
- target feature coverage;
- interaction recipe coverage;
- route/profile completeness;
- binding resolution;
- asset/token closure;
- static validation state;
- build validation state;
- preview/render state.

Do not ship a cross-framework numeric score until calibration proves it useful.

## 31. Validation labels

UI/report must keep separate:

- `ADAPTER COMPATIBLE`;
- `GENERATION PLAN VALIDATED`;
- `FILES GENERATED`;
- `STATIC CHECK PASS`;
- `TYPECHECK PASS`;
- `BUILD PASS`;
- `PREVIEW RENDERED`;
- `INTERACTION VERIFIED`;
- later `VISUAL COMPARE PASS` / `ROUND-TRIP VERIFIED`;
- `REVIEW`;
- `BLOCKED`.

Compiling code is not automatically visually correct code.

## 32. Atomic generation

Generation writes to staging first.

Before exposing a final downloadable project:

- generated file set validates;
- all required imports/references resolve at the static layer;
- package manifest passes adapter rules;
- required assets exist;
- no forbidden placeholders/secrets are present;
- receipt/hash is created.

Build/render validation can then upgrade the evidence labels without mutating the source artifact unexpectedly.

## 33. Job state machine

`IDLE -> PROFILE_READY -> ADAPTER_ANALYSIS -> COMPONENT_PLANNING -> PLAN_REVIEW? -> GENERATING -> STATIC_VALIDATING -> BUILDING? -> PREVIEWING? -> INTERACTION_VERIFYING? -> COMPLETE`

Terminal/interrupt states:

- `CANCELLED`;
- `STALE`;
- `BLOCKED`;
- `UNSUPPORTED_PROFILE`;
- `GENERATION_FAILED`;
- `STATIC_VALIDATION_FAILED`;
- `BUILD_FAILED`;
- `PREVIEW_FAILED`;
- `INTERACTION_FAILED`.

Source/profile/adapter/binding version changes invalidate downstream evidence.

## 34. Security rules

P18 source generation itself is deterministic text/file generation and does not need to execute arbitrary source code.

Forbidden inside deterministic generation:

- executing generated application code;
- executing untrusted imported code;
- installing packages;
- reading host credentials;
- fetching remote dependencies/assets;
- invoking arbitrary shell commands.

Those actions, when required for build verification, occur only through accepted isolated harness APIs with bounded commands generated by the adapter contract.

## 35. Build command allowlist

A production validation harness must not execute arbitrary commands copied from user-controlled project metadata.

Each adapter/profile owns an allowlisted sequence such as conceptually:

- install using selected package manager under accepted policy;
- framework typecheck/check command;
- framework production build;
- accepted preview/start command.

Exact commands are version-profile data and must be refreshed/tested at implementation time.

## 36. Test corpus

Shared fixtures:

- typography/content-heavy page;
- nested layout/flex/grid;
- repeated cards with inferred props;
- explicit Figma component/variant;
- assets/SVG/fonts;
- responsive source variants/constraints;
- intentional overlay;
- unsupported effect/layout;
- each accepted interaction recipe;
- multi-page route map;
- binding registry fixture;
- naming collision fixture.

Framework-specific fixtures additionally prove:

- native compile/typecheck;
- production build;
- route rendering where applicable;
- server/client or hydration boundary behavior;
- interaction behavior;
- asset resolution;
- no forbidden/generated secrets.

## 37. Cross-adapter equivalence

The same neutral fixture exported to multiple frameworks should retain equivalent user-visible semantics while allowing native implementation differences.

Equivalence evidence compares:

- text/content;
- semantic roles;
- layout geometry;
- assets;
- responsive viewport behavior;
- interaction outcomes;
- accessibility-relevant semantics where deterministically known.

Source code text is not expected to be equivalent across frameworks.

## 38. P20 handoff

P18 output must expose enough deterministic metadata for P20 round-trip QA:

- adapter/profile versions;
- Web IR hash;
- component/route plan hash;
- generated file manifest/hashes;
- build artifact identity;
- preview URL/route contract within controlled harness;
- viewport profiles;
- source node -> generated component/element provenance where possible.

P20 should not reverse engineer generated code to reconstruct provenance that P18 could have emitted directly.

## 39. P23/P24 handoff

P18 architecture explicitly reserves extension points for:

- P23 existing-component bindings/client standards/project presets;
- P24 CMS/data/forms/dynamic behavior mappings.

Those layers configure the adapter. They do not fork or replace the neutral source model.

## 40. NestJS/full-stack boundary

NestJS is not a visual rendering target and must not appear as a peer UI adapter that claims to convert Figma into NestJS pages.

A future full-stack project profile may pair:

- one accepted frontend adapter;
- separately configured API/data contracts;
- optional NestJS backend scaffold.

Backend resources/controllers/services are generated only from explicit configured contracts, never inferred from pixels or copy.

## 41. Production acceptance

Implementation-complete and production-accepted remain separate.

An adapter can be called production-accepted only after its claimed profile has real evidence for:

- current supported target/toolchain contract;
- deterministic generation;
- parser/static validation;
- typecheck where applicable;
- production build;
- controlled preview;
- accepted interaction fixtures;
- asset/reference closure;
- failure-mode coverage;
- cross-platform/path coverage where relevant;
- artifact/build receipts;
- P20 visual evidence when visual-fidelity claims are made.

One adapter's acceptance does not automatically accept all P18 adapters.

## 42. Implementation sequencing

Recommended implementation order, subject to implementation-time R0 research:

1. freeze reusable adapter SDK + Web IR consumption contract;
2. React TypeScript adapter;
3. Next.js App Router adapter;
4. Vue SFC adapter;
5. Nuxt 4 adapter;
6. Svelte 5 adapter;
7. SvelteKit adapter;
8. Astro adapter;
9. Angular standalone adapter;
10. expand based on validated demand.

Each adapter should be independently shippable/feature-gated rather than blocking the platform until every framework is complete.

## 43. Implementation-opening checklist

Before any P18 runtime implementation starts:

- [ ] P12 internal release exit is complete;
- [ ] roadmap prerequisite phases required for the selected implementation slice are accepted;
- [ ] P17 neutral Web IR implementation/contract used by P18 is accepted;
- [ ] R0 framework snapshot is refreshed;
- [ ] exact first target major/toolchain is selected and supported;
- [ ] adapter SDK v1 is frozen;
- [ ] component boundary/prop inference policy is frozen;
- [ ] package/dependency allowlist is frozen;
- [ ] isolated build harness security contract is accepted;
- [ ] test corpus for the first adapter exists;
- [ ] production acceptance evidence list is named before coding begins.

Until these gates pass, this specification remains planning-only and must not be used to claim P18 implementation progress.