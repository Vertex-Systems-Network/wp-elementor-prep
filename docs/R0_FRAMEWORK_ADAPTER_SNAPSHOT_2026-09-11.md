# R0 Framework Adapter Snapshot — 2026-09-11

Status: RESEARCH / PLANNING-ONLY  
Owner roadmap issue: #119  
Target phase: P18 — Framework Adapter Platform  
Dependency: P17 neutral Web IR contract + #84 P12 internal release exit  
Date: 2026-09-11

## 1. Purpose

This retained R0 snapshot records current official framework/platform facts that constrain P18 adapter design. It is planning evidence only. It does not open P18 runtime implementation and does not weaken the P12/P13+ dependency gates.

The adapter platform must generate framework-native projects/components from the versioned neutral Web IR defined by P17 rather than creating independent scanner/mapping logic for each framework.

## 2. Current framework observations

### React

Official React documentation reports React 19.3 as the latest release as of this snapshot. React itself remains a UI library rather than a full application framework.

P18 consequence:

- `react` is a component/application adapter, not a routing/backend/deployment contract;
- generated React can remain client-rendered by default unless the user selects a framework profile;
- component boundaries, props, state and interaction recipes must be explicit;
- project scaffolding should not imply Next.js semantics unless the Next.js adapter is selected.

### Next.js

Current official Next.js App Router documentation treats layouts/pages as Server Components by default and uses Client Components for state, event handlers and browser-only APIs. The `'use client'` directive defines the client/server module boundary.

P18 consequence:

- the default Next adapter must be App Router oriented;
- static/presentational generated components should remain Server Components where possible;
- `'use client'` should be introduced only at the smallest accepted interactive boundary;
- props crossing server -> client boundaries must be serializable;
- Server Actions, data fetching, caching and backend behavior are not invented from visual design evidence.

### Vue

Official Vue documentation recommends Single-File Components (`.vue`) for non-trivial build-tool-enabled applications and recommends `<script setup>` when using SFCs with the Composition API.

P18 consequence:

- the initial Vue adapter should generate SFCs;
- Composition API + `<script setup>` is the preferred modern output profile;
- Options API can be a later/configurable compatibility profile, not the default;
- component props/emits must be derived from explicit component/interaction evidence rather than guessed business logic.

### Nuxt

Current Nuxt 4 documentation exposes file-based routing under `app/pages`, auto-imported components under `app/components`, server rendering by default, optional prerendering and explicit client/server component capabilities. Current docs inspected during this snapshot identify the Nuxt 4 line; Nuxt 3 has reached end-of-life and is not an appropriate default target for new output.

P18 consequence:

- first production Nuxt adapter targets a supported Nuxt 4 profile, not Nuxt 3;
- file-system routes are generated only from an explicit page/route map;
- component auto-import conventions can be used but remain adapter configuration, not IR semantics;
- server/client-only/island choices require capability evidence and cannot be guessed solely from appearance.

### Svelte / SvelteKit

Current Svelte documentation is Svelte 5 oriented and recommends runes mode for new code, replacing several legacy patterns. Current SvelteKit docs use file-system routing and server rendering by default, with configurable SSR/CSR/prerender page options.

P18 consequence:

- Svelte output should use Svelte 5-era component conventions and avoid generating legacy syntax for new projects;
- SvelteKit routing/output remains a separate framework profile from plain Svelte components;
- page rendering mode is explicit profile/user configuration, not inferred from a Figma mockup;
- server-only data/load logic is not invented without configured data contracts.

### Angular

Current Angular documentation reports Angular 22 as active. Angular components are standalone by default in modern Angular (the default changed in Angular 19). Angular provides official routing, Signals-based reactivity and framework-level application structure.

P18 consequence:

- initial Angular output should use standalone components rather than generating NgModule-centric architecture by default;
- Signals may be used for accepted local UI-state recipes, but generated state is limited to behavior proven by source/recipe evidence;
- routes are generated only from explicit page mapping;
- dependency injection/services/data layers are not invented from visual design.

### Astro

Current Astro releases are on the Astro 7 line (Astro 7.2 was published in August 2026). Official Astro documentation emphasizes HTML-first components and Islands Architecture: components render to HTML without client JavaScript by default; interactive client islands are explicitly opted in through `client:*` directives.

P18 consequence:

- Astro should be the strongest static-first framework adapter;
- no client hydration is emitted for static components;
- interactive recipes become explicit islands at the smallest viable component boundary;
- hydration strategy is an adapter option backed by accepted behavior, not selected arbitrarily;
- server-island/data behavior is deferred unless a target runtime/data contract is explicitly configured.

## 3. Cross-framework decisions frozen by R0

1. **One neutral IR, many emitters.** Framework adapters do not rescan raw Figma independently.
2. **Framework-native output, not syntax skins.** React JSX, Vue SFC, Svelte components, Angular standalone components and Astro components each use their native conventions.
3. **Static-first.** Components that need no runtime state/interactivity remain non-interactive/server/static where the target supports it.
4. **Hydration/client boundaries are minimal and explicit.** Do not mark an entire page client-side because one widget is interactive.
5. **Routing is configured.** Visual frames do not automatically become production URL structure without an explicit route map/user choice.
6. **Data/backend behavior is configured.** A design cannot prove API schemas, authentication, CMS models or server actions.
7. **No framework dependency installation inside the network-free Figma plugin.** Project generation/package installation runs only in a separately accepted local/CLI/companion workflow.
8. **No generated secrets.** Environment variables, tokens and credentials are placeholders/contracts only.
9. **Existing components win.** P23 component bindings should eventually let teams map source components to codebase-owned components instead of regenerating them.
10. **Version profiles are explicit.** Every generated artifact records adapter and target framework/toolchain versions or declared compatibility range.
11. **Deprecated/EOL defaults are forbidden.** An adapter refreshes R0 before opening implementation against a major platform line.
12. **Build verification is separate from render verification.** Typecheck/build PASS does not imply visual fidelity; browser/render comparison remains a separate gate.

## 4. Initial adapter priority

Recommended order after P17 acceptance and R0 refresh at implementation time:

1. React + TypeScript;
2. Next.js App Router + TypeScript;
3. Vue SFC + TypeScript;
4. Nuxt 4 + TypeScript;
5. Svelte 5 + TypeScript;
6. SvelteKit;
7. Astro;
8. Angular standalone;
9. additional adapters based on market demand and acceptance cost.

Priority is not a claim that earlier adapters are inherently better. It balances demand, shared primitives and validation cost.

## 5. Styling strategy observations

P18 should not hardwire one styling system into the IR.

Initial accepted styling profiles can include:

- plain CSS;
- CSS Modules where native/appropriate;
- scoped component CSS for Vue/Svelte;
- Tailwind only through the separately versioned P17/P18 Tailwind adapter;
- framework-native style placement without changing normalized style semantics.

A framework adapter may reorganize CSS into native files/blocks but cannot silently change unsupported/lossy style evidence.

## 6. Component boundary policy

Potential deterministic boundary evidence:

- explicit Figma component/instance structure;
- repeated semantic structures with accepted classifier confidence;
- page/section boundaries;
- interaction/state ownership;
- user-specified component granularity;
- existing-component bindings.

Do not create hundreds of meaningless one-node components, and do not collapse an entire page into one monolith merely to simplify generation.

## 7. State and interaction policy

Only accepted P17 interaction recipes can introduce local runtime behavior in initial P18 adapters.

Examples after recipe acceptance may include:

- disclosure/tabs;
- carousel;
- menu toggle;
- modal/dialog;
- selected/active state.

Framework state implementation is adapter-specific:

- React hooks/client component;
- Vue refs/computed in `<script setup>`;
- Svelte runes;
- Angular Signals;
- Astro hydrated island using selected UI integration or accepted vanilla island strategy.

The underlying behavior contract remains framework-neutral and versioned.

## 8. Routing and project scaffolds

Scaffold generation is conditional on user-selected project scope.

Supported scopes should distinguish:

- component only;
- selected section/component library fragment;
- single page;
- multi-page application/site;
- project scaffold.

A component export must not unnecessarily generate routing/build/deployment boilerplate.

For project scope, route definitions must come from:

- explicit user route mapping;
- accepted source page metadata;
- imported project configuration;
- later CMS/project contract.

## 9. Server/client and rendering-mode policy

Frameworks differ materially, so the adapter must expose native rendering decisions rather than pretending they are interchangeable.

Examples:

- Next: Server Components default, Client Components for interaction/browser APIs;
- Nuxt: SSR/universal defaults plus client/server components and prerender options;
- SvelteKit: SSR/CSR/prerender page options;
- Astro: static HTML by default, explicit client islands;
- plain React/Vue/Svelte: client build unless a framework/runtime profile is selected;
- Angular: application/browser rendering profile with separately configured SSR/prerender support.

Visual design alone is insufficient to choose database/server rendering behavior.

## 10. Build-system boundary

Generated projects may target accepted current toolchains, but dependency resolution is not performed in the offline Figma plugin.

A future local/CLI generator can:

- materialize files;
- pin package versions/ranges;
- run package manager install in an explicit networked mode;
- typecheck/lint/build;
- retain lockfile/toolchain receipt;
- launch controlled preview for P20 comparison.

Networked dependency installation is a separate capability with supply-chain controls and cannot inherit the Figma Community plugin's offline trust assumptions.

## 11. Supply-chain controls required before executable scaffold validation

Before an adapter can install/build generated projects in production acceptance:

- exact package manager/runtime versions are recorded;
- package registry source is explicit;
- dependencies are allowlisted/versioned by adapter profile;
- lifecycle script policy is explicit;
- lockfile is retained;
- unexpected transitive/network behavior is detected where feasible;
- no secrets are available in the validation environment;
- build runs in an isolated workspace with bounded resources.

## 12. Adapter validation layers

Every framework adapter should support the applicable subset of:

1. schema/profile validation;
2. deterministic file generation;
3. parser/compiler/typecheck validation;
4. framework production build;
5. static output inspection;
6. controlled preview render;
7. P20 visual/geometry/content comparison;
8. interaction recipe checks;
9. artifact/package receipt.

These states stay separate in UI/reporting.

## 13. R0 refresh triggers

Refresh before implementation if:

- a target framework releases a new major;
- a targeted major becomes EOL/unsupported;
- routing/rendering defaults materially change;
- React/Next server-client boundaries change materially;
- Vue/Svelte/Angular component authoring recommendations change;
- Astro hydration/islands contracts change;
- the chosen build tool/package manager baseline changes;
- a new framework becomes commercially higher priority;
- P18 adds executable third-party code or dependency installation.

## 14. Non-authorizing statement

This snapshot is research/planning evidence only. P18 runtime implementation remains blocked by the roadmap dependencies and P12 internal release exit. No current framework version observation in this file is a perpetual compatibility promise; the implementation-opening R0 refresh is mandatory.