# R0 Elementor Adapter Snapshot — 2026-09-11

Status: retained planning evidence for P15; not runtime acceptance  
Roadmap owner: #119  
Research date: 2026-09-11

## Purpose

This snapshot refreshes first-party Elementor documentation immediately before freezing the P15 adapter contract. It is a planning input only. External product behavior may change and must be re-verified during implementation/production acceptance.

## First-party sources reviewed

### Import/export surfaces

1. Elementor Help — Import and export Elementor website templates  
   https://elementor.com/help/import-and-export-elementor-website-templates/

   Current documented behavior:
   - website templates can be exported as ZIP;
   - import accepts a website-template ZIP;
   - import/export can include Content, Templates, Settings & Configurations and Plugins;
   - custom files such as custom fonts/icons/custom code depend on plan/capability;
   - availability of export options depends on subscription plan.

2. Elementor Help — Add a template / Template Library  
   https://elementor.com/help/adding-templates/  
   https://elementor.com/help/template-library/

   Current documented behavior:
   - template library import accepts `.json` or `.zip` template files;
   - saved pages/containers can be used as templates.

3. Elementor Help — Theme Builder  
   https://elementor.com/help/the-elementor-theme-builder/

   Current documented behavior:
   - Theme Builder can import `.json` or `.zip` template files for site parts;
   - some upload/security/site settings can affect imports.

### Public data structure

4. Elementor Developers — Data Structure  
   https://developers.elementor.com/docs/data-structure/

   Current documented behavior:
   - Elementor stores page layout/configuration as JSON;
   - template export is a practical way to access/import that data;
   - page data is serialized into Elementor post metadata in WordPress.

5. Elementor Developers — General Structure  
   https://developers.elementor.com/docs/data-structure/general-structure/

   Current documented top-level template fields include:
   - `title`;
   - `type`;
   - `version`;
   - `page_settings`;
   - `content`.

   Documentation currently identifies data structure version `0.4` as latest on that page.

6. Elementor Developers — Container Element  
   https://developers.elementor.com/docs/data-structure/container-element/

   Current v3/container form includes:
   - `id`;
   - `elType: "container"`;
   - `isInner`;
   - `settings`;
   - recursively nested `elements`.

7. Elementor Developers — Widget Element  
   https://developers.elementor.com/docs/data-structure/widget-element/

   Current classic widget form includes:
   - `elType: "widget"`;
   - `widgetType`;
   - widget-control values in `settings`;
   - nested `elements` where supported.

8. Elementor Developers — Responsive Data  
   https://developers.elementor.com/docs/data-structure/responsive-data/

   Current documented responsive model:
   - desktop/default value uses the base control key;
   - device variants use suffixed keys such as `_tablet` and `_mobile`;
   - additional configured breakpoints use the same suffix pattern.

### Global styles and design systems

9. Elementor Developers — Global Styles  
   https://developers.elementor.com/docs/data-structure/global-styles/

   Current documented behavior:
   - classic global colors/fonts live in the active Elementor Kit, not merely the individual page;
   - page controls can reference those globals through `__globals__` values such as `globals/colors?id=...`;
   - references therefore require closure/import handling rather than copying only local values.

10. Elementor Help — Export/import variables and classes  
    https://elementor.com/help/how-to-export-and-import-variables-and-classes/

11. Elementor Help — Import/export design systems  
    https://elementor.com/help/how-to-import-and-export-design-systems/

    Current documented behavior:
    - Atomic design systems use reusable Variables and Classes;
    - classes/variables can be exported/imported, including as ZIP through the documented UI.

### Editor V4 / Atomic architecture

12. Elementor Developers — Atomic Elements  
    https://developers.elementor.com/docs/data-structure/atomic-elements/

    Current documented atomic element fields include:
    - `id`;
    - element schema `version`;
    - atomic `elType` such as `e-div-block`, `e-flexbox`, `e-grid`;
    - `settings`;
    - `editor_settings`;
    - `interactions`;
    - `styles` including responsive/pseudo-state styling;
    - recursively nested `elements`.

13. Elementor Help — Get started with Editor V4  
    https://elementor.com/help/get-started-with-the-elementor-editor-v4/

14. Elementor — Version 4 FAQ  
    https://elementor.com/products/website-builder/v4-faq/

    Current documented behavior:
    - V4/Atomic can coexist with Elementor 3.x Containers/Widgets on the same site/page;
    - new installations can have Atomic features enabled by default;
    - V4 features are an evolving surface, not a reason to assume every classic widget has an atomic equivalent.

## Reliability conclusions

### 1. P15 cannot be one generic "Elementor" serializer

Elementor currently has two materially different element/style models that can coexist:

- classic/container + widget data;
- Atomic elements with a different element/style architecture.

Therefore initial adapters remain separate and versioned:

- `elementor-v3-container`;
- `elementor-v4-atomic`.

Hybrid target environments are represented by an environment capability profile, not by silently mixing schemas inside one exporter.

### 2. Template JSON is the safest first artifact contract

Elementor publicly documents the JSON data model and explicitly documents template import/export using JSON.

Therefore P15 should make **Template JSON** the first required native artifact target.

### 3. ZIP support must distinguish documented import acceptance from public package specification

Elementor documents importing/exporting ZIP files, including website templates/kits, but the public developer pages reviewed here do not provide a complete stable specification for every website-template ZIP internal file/layout/dependency variant.

Therefore:

- `Template ZIP` may be enabled only after a canonical real Elementor export fixture demonstrates the exact accepted wrapper/package contract and the generated ZIP round-trips through the supported importer;
- `Website Template / Kit ZIP` is a separate higher-complexity capability with content/settings/plugins/design-system dependency closure;
- P15 must not create an arbitrary ZIP and label it a valid Elementor Kit merely because Elementor accepts ZIP files generally.

### 4. Core vs Pro vs third-party capabilities must be explicit

Elementor's available export features and widgets vary by plan/plugins. A design using a Form, Loop, Theme Builder part, custom font, custom code or third-party widget cannot be represented as universally available Core output.

Target environment must distinguish at least:

- Elementor Core version;
- Atomic/V4 enabled state;
- Elementor Pro installed/version/active state when relevant;
- supported third-party addons, if any;
- WordPress version/PHP environment when observed through a companion/target harness;
- active breakpoint profile;
- design-system/global-style capability.

Unobserved environment facts are `DECLARED` or `UNKNOWN`, never treated as `OBSERVED`.

### 5. Responsive mapping must use the target's actual profile

Classic Elementor responsive settings use device-suffixed control keys, including custom breakpoints. Atomic styling has its own responsive style model.

Therefore P13's generic responsive risk probes do not automatically become Elementor responsive values. P15 requires a versioned breakpoint mapping for the selected adapter/environment.

### 6. Global references need dependency closure

A page that references a global color/font is incomplete if the referenced Kit/design-system value is absent on import.

P15 validator must distinguish:

- local literal style;
- built-in global reference;
- custom global reference with included dependency;
- unresolved external global reference.

Atomic Variables/Classes require a separate design-system mapping/closure path from classic `__globals__` references.

### 7. Hybrid v3/v4 support is a capability matrix, not automatic conversion

Because Elementor currently allows v3 and v4 content together, WP Builders Prepare may eventually emit a hybrid document only when a versioned adapter explicitly supports that combination.

Initial product should prefer an explicit user choice/output profile rather than silently mixing classic and Atomic elements.

### 8. "Elementor Ready" must have levels

P15 should separate:

- `SOURCE COMPATIBLE` — Figma/prepared duplicate can be mapped to chosen adapter profile;
- `ARTIFACT VALIDATED` — generated JSON/ZIP passes local schema/reference/assets checks;
- `IMPORT VERIFIED` — exact artifact imported successfully into a supported Elementor test environment;
- `RENDER VERIFIED` — imported page/section rendered and passed bounded visual/semantic checks.

No offline-valid package can claim observed live-site import success.

## Product implications

The commercially strong flow remains:

`Select design -> Choose Elementor profile -> Compatibility scan -> Prepare duplicate if needed -> Native mapping -> Artifact validation -> Real import/render verification where available -> Download/import receipt`

The moat is not merely "Figma to Elementor". It is **validated, explainable Elementor readiness with preserved source design and proof of what was actually verified**.

## Re-research trigger

Refresh this R0 snapshot before P15 production implementation if any of the following change materially:

- Elementor public data-structure version;
- Atomic element schema/style architecture;
- import/export UI/formats;
- new default V4 behavior;
- responsive breakpoint representation;
- design-system variable/class export model;
- documented Core/Pro capability boundaries.

This snapshot grants no runtime acceptance and does not unblock P15 while #84/P13/P14 dependencies remain open.
