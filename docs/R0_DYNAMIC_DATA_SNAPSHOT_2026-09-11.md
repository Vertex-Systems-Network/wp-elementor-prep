# R0 CMS / Dynamic Data / Forms Snapshot — 2026-09-11

Status: RESEARCH / PLANNING-ONLY  
Owner roadmap issue: #119  
Target phase: P24 — CMS, Dynamic Data, Forms + Interaction Mapping  
Dependencies: #84 P12 internal release exit; accepted P15-P23 target/project contracts  
Date: 2026-09-11

## 1. Purpose

This snapshot records current public WordPress/Elementor dynamic-content extension paths and freezes the P24 planning boundary.

P24 must not infer production data models, APIs, CMS schemas, form destinations or authentication from visual design alone. Dynamic behavior becomes exportable only after the user/project provides an explicit typed data/integration contract that can be validated against the selected target.

## 2. WordPress Block Bindings API

Current WordPress Block Editor documentation states that the Block Bindings API is available from WordPress 6.5+ and binds dynamic data sources to supported block attributes which then affect front-end output.

Current documented core sources include post meta/post data/term data/pattern overrides, with extensibility for custom sources.

P24 consequences:

- Gutenberg dynamic output should prefer the documented Block Bindings path where the selected WordPress/block/version profile supports the required attribute/source;
- block binding is target encoding, not the neutral data model;
- source name/key and supported attributes must be version/profile validated;
- unsupported blocks/attributes cannot be silently represented as working bindings;
- custom binding sources require a separately accepted WordPress-side implementation/bridge capability.

## 3. WordPress Query Loop

Current `core/query` documentation identifies Query Loop as a hybrid block capable of querying post types through structured query attributes. Current extension guidance documents Query Loop variations and custom query handling, including WordPress REST API-based editor previews and server-side query handling.

P24 consequences:

- collection/list intent may map to Query Loop only when the target WordPress profile and declared content model fit the documented query contract;
- a visual repeated-card region does not automatically prove it is a WordPress post query;
- post type, taxonomy/filter/order/pagination/inherit semantics must be explicit configuration or accepted target metadata;
- unsupported query semantics stay REVIEW/CUSTOM_IMPLEMENTATION_REQUIRED.

## 4. Elementor Dynamic Tags

Current official Elementor developer documentation describes Dynamic Tags as a documented extension mechanism for inserting data from various sources into controls. Elementor Pro provides active dynamic-tag functionality and multiple built-in data sources; external developers can register custom dynamic tags.

Current dynamic-tag categories distinguish types such as text, number, URL, color, image/media/gallery and post meta.

P24 consequences:

- Elementor dynamic mappings should be versioned and type-compatible with the target control/tag category;
- Pro-dependent mappings must require an explicit Elementor Pro target profile and must never be emitted as available in Free-only mode;
- custom data sources require a separately accepted WordPress/Elementor extension implementation, not an invented private tag ID;
- P15 remains authoritative for actual Elementor artifact encoding/import validation.

## 5. Neutral dynamic contract

P24 needs a target-independent typed Dynamic Data IR containing explicit declarations for:

- content entities/types;
- fields;
- scalar/media/reference types;
- relationships;
- collection/query intent;
- route/detail/list bindings;
- source component/property bindings;
- forms and submission intent;
- navigation/menu intent;
- interaction/state bindings;
- provider/runtime capability references;
- sample/fixture data separated from production data source configuration.

Target adapters translate this IR into documented target mechanisms.

## 6. Static sample vs production data

Visible text/images in a design are usually sample content, not proof of production schema/source.

P24 freezes three separate concepts:

- `STATIC_CONTENT` — literal content that ships as authored;
- `SAMPLE_FIXTURE` — development/preview example data that demonstrates the binding contract;
- `PRODUCTION_BINDING` — explicit configured data source/model/provider mapping.

A sample card repeated three times is not automatically a CMS collection.

## 7. Data provider boundary

Initial provider classes may include:

- WordPress native content model;
- WordPress custom post type/taxonomy/meta contract;
- Gutenberg Block Bindings source;
- Elementor documented dynamic-tag source;
- target-framework local typed data/fixture;
- generic external API contract placeholder;
- future CMS-specific adapters.

Actual credentials/network connections live outside the offline deterministic Figma plugin.

## 8. Forms boundary

A visual form can provide evidence for fields/labels/order/layout, but cannot prove:

- submission destination;
- authentication;
- email recipient;
- database/table;
- CRM provider;
- webhook URL;
- anti-spam vendor;
- retention policy;
- legal consent wording;
- server-side validation/business rules.

These require explicit configuration.

## 9. Navigation boundary

Visual navigation can suggest links/menu structure when destinations are explicit, but dynamic WordPress menu assignment, role-specific navigation, CMS-driven menus and framework route data require declared target contracts.

P24 keeps literal links, route bindings and dynamic menu sources distinct.

## 10. Interaction boundary

P17 accepted interaction recipes remain the behavior source of truth for generic UI state. P24 only adds data-driven/configured interaction inputs such as:

- filter value;
- query pagination;
- form field state;
- selected CMS item;
- dynamic route parameter;
- search query;
- configured data-bound visibility.

P24 does not create arbitrary business logic from Figma prototype arrows.

## 11. Security and privacy boundary

The deterministic core remains network-free and credential-free.

P24 project/config artifacts must not embed:

- API keys;
- OAuth tokens;
- passwords;
- database credentials;
- private webhook secrets;
- authenticated cookies/session tokens.

A future connected/local runtime can reference a secret by opaque environment/config key under a separately accepted security contract; receipts do not serialize secret values.

## 12. Query safety boundary

Dynamic query declarations must be bounded, typed and validated.

Generated target queries should not concatenate arbitrary user-controlled SQL/code. WordPress target adapters use documented post/query/REST/block APIs. Framework adapters generate typed provider contracts or accepted data-fetch scaffolds only when explicitly configured.

## 13. Schema evolution

Content/data contracts are versioned. A changed field type, removed field, changed relationship or provider contract invalidates dependent bindings, generated artifacts, QA, handoff and P22 estimates through the P23 dependency graph.

## 14. R0 refresh triggers

Refresh before implementation if:

- WordPress Block Bindings API changes materially;
- `core/query`/Query Loop capability changes materially;
- Elementor dynamic-tag APIs/contracts change materially;
- P15/P16 accepted target profiles change;
- P24 introduces a real external CMS/provider adapter;
- form provider/network submission becomes executable;
- authenticated data preview is added;
- GraphQL/REST client generation becomes first-class;
- P24 adds production database/backend code generation.

## 15. Sources retained

Checked 2026-09-11:

- WordPress Block Editor Handbook — Block Bindings API;
- WordPress Core Block reference — Query Loop;
- WordPress Block Editor Handbook — Extending Query Loop;
- Elementor Developers — Dynamic Tags and documented dynamic-tag categories/registration.

## 16. Non-authorizing statement

This snapshot does not advance P12, authorize P24 implementation, authorize network/credential access, or claim that visual design alone defines a production CMS/data model.