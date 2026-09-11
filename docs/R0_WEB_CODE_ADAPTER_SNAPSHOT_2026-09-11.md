# R0 Web / Code Adapter Snapshot — 2026-09-11

Status: RESEARCH / PLANNING-ONLY  
Owner roadmap issue: #119  
Target phase: P17 — Universal Web Export + Code-to-Design Import  
Date: 2026-09-11

## 1. Purpose

This retained R0 snapshot records the public standards/security facts that P17 must treat as external constraints before implementation. It is planning evidence only. It does not authorize runtime implementation, production acceptance, JavaScript execution, network access, or P12 closure.

P17 remains blocked on the internal P12 release-exit gate in #84 and on the accepted sequencing defined in `docs/COMMERCIAL_EXPANSION_PLAN.md`.

## 2. Scope reviewed

The research pass focused on the minimum standards needed to freeze a safe first adapter contract for:

- Figma/design -> semantic HTML/CSS output;
- optional deterministic vanilla-JS output for explicitly representable interactions;
- HTML/CSS -> new Figma reconstruction;
- future sandboxed JavaScript-assisted reconstruction;
- optional Tailwind output;
- asset/token packaging;
- browser-render verification.

## 3. Retained public-source observations

### HTML sandboxing

The WHATWG HTML Standard defines `<iframe sandbox>` as a restriction set where scripts, forms, navigation and other capabilities are disabled unless individual tokens re-enable them. A sandboxed document without `allow-same-origin` is treated as an opaque origin.

Implication for P17:

- executable imported code must never run in the deterministic Figma/plugin core;
- a future execution harness must use an isolated browser context with deny-by-default sandbox permissions;
- navigation, popups, forms, downloads and same-origin access remain disabled unless a separately accepted capability explicitly requires them.

Source retained from WHATWG HTML Standard, iframe sandbox section, checked 2026-09-11.

### `allow-scripts` + `allow-same-origin` risk

MDN explicitly warns against combining `allow-scripts` and `allow-same-origin` for same-origin embedded content because it can effectively defeat the sandbox.

Implication for P17:

- the first JavaScript execution harness must not depend on a same-origin iframe that combines both permissions;
- preferred model is a dedicated isolated origin/process/container with a narrow message bridge;
- if a future renderer requires script execution, its origin and capability model must be threat-reviewed independently.

Source retained from MDN `<iframe>` reference, checked 2026-09-11.

### DOM parsing is not a sanitization guarantee

MDN documents `DOMParser.parseFromString()` as an injection sink. HTML parsed as `text/html` is effectively inert while detached, but scripts/event handlers can become active if unsafe nodes are later inserted into an active DOM. Trusted Types can constrain injection sinks, but the application must still define the transformation/sanitization policy.

Implication for P17:

- static code import may parse HTML into a detached representation, but parser success is not equivalent to safe rendering;
- source sanitization/normalization must be explicit before any active preview DOM is created;
- event handler attributes, script elements, dangerous URL schemes and executable embedding surfaces must be rejected or stripped according to a versioned policy;
- reconstructed Figma output is derived from normalized static structure, not by copying an untrusted active DOM.

Sources retained from MDN `DOMParser.parseFromString()` and Trusted Types API, checked 2026-09-11.

### CSS can initiate external fetches

CSS `@import` loads an external stylesheet URL. Other CSS values may also reference network resources.

Implication for P17:

- offline/static import cannot treat arbitrary external CSS as self-contained;
- imports/URLs are classified as local, embedded/data, allowed packaged asset, external-network, or unsupported;
- external network fetch is disabled in the core/static parser path;
- unresolved external styles/assets remain explicit REVIEW/BLOCKED evidence rather than silently disappearing.

Source retained from MDN `@import`, checked 2026-09-11.

### Constructable stylesheet parsing is not a general import parser

`CSSStyleSheet.replaceSync()` can parse a list of CSS rules for a constructed stylesheet, but imported `@import` rules are removed rather than fetched. Browser CSSOM also reflects browser-specific parsing/normalization rather than preserving source text exactly.

Implication for P17:

- browser CSSOM may be used as one validation/rendering layer, but it must not be the only source-preserving parser contract;
- canonical import should use an owned normalized CSS model with explicit unsupported syntax diagnostics;
- source text, normalized model and browser-rendered behavior remain separate evidence layers.

Source retained from MDN `CSSStyleSheet.replaceSync()` / CSSStyleSheet, checked 2026-09-11.

### Tailwind is generated from source-class detection

Current Tailwind documentation states that utilities are generated by scanning source files for class-like tokens, and supports arbitrary values/properties/variants. Tailwind v4 also exposes theme-variable-driven utilities and dynamic values.

Implication for P17:

- Tailwind output must be a separate versioned adapter, not a lossy search/replace over CSS;
- generated classes must be statically discoverable by the selected Tailwind toolchain;
- arbitrary values can preserve exact design values but should not be used to hide a lack of token mapping;
- adapter receipts must record Tailwind major/toolchain assumptions.

Sources retained from official Tailwind CSS documentation, checked 2026-09-11.

## 4. Architecture decisions retained from R0

The following decisions are frozen for P17 planning unless a later R0 refresh changes the public platform constraints:

1. **Static-first import is the default.** HTML/CSS can be parsed without running JavaScript.
2. **JavaScript execution is opt-in and separate.** It is never required for the base reconstruction path.
3. **Untrusted JavaScript never executes inside the network-free Figma Community plugin core.**
4. **A future executable renderer is isolated.** It must use a separate accepted sandbox/origin/process capability with deny-by-default permissions.
5. **No ambient network.** Imported HTML/CSS/JS cannot fetch arbitrary remote resources during deterministic analysis.
6. **No ambient storage/cookies.** Future execution harnesses must not inherit user/browser session state.
7. **No top-level navigation/popups/forms/downloads by default.**
8. **Parsing and sanitization are separate gates.** Parser acceptance does not imply safe preview acceptance.
9. **Code import always creates a new reconstruction.** It never silently mutates an approved Figma source.
10. **Round-trip fidelity is evidence-based.** A syntactically valid package is not automatically `RENDER VERIFIED`.
11. **Tailwind is an adapter, not the neutral model.** Core layout/style data remains framework-neutral.
12. **External dependencies are explicit.** Missing remote CSS, scripts, fonts and images remain blockers/review items unless supplied through an accepted local package path.

## 5. Initial supported source profiles

P17 implementation should begin with bounded profiles instead of claiming arbitrary-web support.

### Import profile A — `static-html-css`

Accepted inputs:

- one HTML document or fragment;
- local CSS files;
- local raster/SVG assets;
- optional local font metadata/files only when user-supplied and license-permitted;
- no required script execution.

Expected outcome:

- normalized DOM/layout/style model;
- explicit unsupported CSS evidence;
- new Figma reconstruction candidate;
- optional controlled browser render for comparison after sanitization.

### Import profile B — `static-site-package`

Accepted inputs:

- bounded ZIP/folder;
- deterministic entrypoint selection;
- local relative assets/styles;
- scripts retained as metadata/diagnostics but not executed by default.

### Import profile C — `sandboxed-runtime` — FUTURE / SEPARATE ACCEPTANCE

Potentially executes bounded JavaScript in a separate isolated renderer. Not part of the first production implementation.

## 6. Export profiles

Initial export profiles should remain explicit:

- `html-css-static`;
- `html-css-vanilla-js` only for accepted interaction recipes;
- `html-css-assets`;
- `tailwind-static` after adapter/toolchain fixtures are accepted.

Each profile records:

- adapter version;
- semantic HTML policy;
- CSS strategy;
- responsive strategy;
- interaction strategy;
- asset/font strategy;
- unsupported-feature list;
- exact package hash/receipt.

## 7. Security boundary for imported content

Before preview/reconstruction, classify and either reject, strip, quarantine or retain-as-metadata:

- `<script>`;
- inline event handlers;
- `javascript:` and other executable URL schemes;
- `<iframe>`, `<object>`, `<embed>` and plugin-like surfaces;
- meta refresh/navigation behaviors;
- remote stylesheet/script/font/image URLs;
- CSS imports and URL-bearing declarations;
- forms/submission endpoints;
- service-worker registration intent;
- storage/cookie access intent;
- WebSocket/EventSource/fetch/XHR intent;
- navigation/window-opening intent;
- dynamically generated markup that requires script execution.

The policy must be deterministic, versioned and testable. Silent execution is forbidden.

## 8. Fidelity categories

P17 should distinguish at least:

- `SOURCE_PARSED`;
- `STATIC_MODEL_VALIDATED`;
- `PACKAGE_VALIDATED`;
- `BROWSER_RENDERED`;
- `VISUAL_COMPARE_PASS`;
- `RECONSTRUCTION_CREATED`;
- `RECONSTRUCTION_VALIDATED`;
- `REVIEW`;
- `BLOCKED`.

No label should imply script/runtime behavior was preserved unless it was actually executed and observed in the accepted harness.

## 9. Known gaps before implementation

Before P17 runtime work opens, implementation planning still needs:

- a frozen neutral web layout/style/interactions IR boundary;
- CSS support matrix and fallback taxonomy;
- exact HTML semantic mapping rules;
- ZIP/path/resource limits;
- asset URL rewrite rules;
- controlled browser render harness specification;
- JavaScript interaction recipe allowlist;
- threat model for any future executable renderer;
- deterministic visual comparison thresholds;
- test corpus covering modern layout, media queries, typography, SVG and unsupported features.

## 10. R0 refresh triggers

Refresh this snapshot before implementation if any of the following materially changes:

- browser sandbox/CSP/Trusted Types behavior relevant to the selected renderer;
- Tailwind major/toolchain contract;
- selected HTML/CSS parser libraries or supported syntax ranges;
- chosen browser automation/render engine;
- P17 adds networked URL capture;
- P17 adds JavaScript execution;
- P17 adds remote dependency installation;
- code-import scope expands from static pages to framework/runtime applications.

## 11. Non-authorizing statement

This document is research evidence only. It does not grant P12 acceptance, does not permit P13-P17 runtime implementation before their dependency gates, and does not authorize arbitrary code execution or network access.