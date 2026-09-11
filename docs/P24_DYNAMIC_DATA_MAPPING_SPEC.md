# P24 CMS, Dynamic Data, Forms + Interaction Mapping — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; accepted P15-P23 target/project contracts  
R0 source snapshot: `docs/R0_DYNAMIC_DATA_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P24 adds explicit dynamic-content/data intent to the multi-target platform only after static/native generation is stable.

It defines one neutral, typed data-binding contract that can be mapped into documented target capabilities such as:

- WordPress posts/custom post types/taxonomies/meta;
- Gutenberg Query Loop and Block Bindings where supported;
- Elementor/Elementor Pro documented dynamic data paths;
- framework route/data placeholders and configured provider adapters;
- forms and submission contracts;
- navigation/menu contracts;
- accepted data-driven interactions.

P24 never infers a production database, API, CMS provider or form destination from visual design alone.

## 2. Canonical flow

`Select project/source scope -> identify static repeated/data-like regions -> declare or import data model -> bind source content/components to typed fields -> choose provider/target capability -> compatibility scan -> generate target dynamic plan -> validate schema/references -> generate artifact/scaffold -> target/runtime verification when applicable -> receipt`

Static generation remains available when dynamic evidence/configuration is absent.

## 3. Data truth classes

Every content/data value is classified as one of:

- `STATIC_CONTENT`;
- `SAMPLE_FIXTURE`;
- `USER_DECLARED_SCHEMA`;
- `IMPORTED_SCHEMA`;
- `TARGET_OBSERVED_SCHEMA`;
- `PRODUCTION_BINDING`;
- `UNKNOWN`.

Visible design content defaults to STATIC_CONTENT unless explicitly promoted/configured as fixture/schema evidence.

## 4. Neutral Dynamic Data IR

Suggested conceptual root:

```ts
interface DynamicDataIRV1 {
  schemaVersion: 1;
  models: DataModelV1[];
  queries: DataQueryV1[];
  bindings: DataBindingV1[];
  routes: DynamicRouteBindingV1[];
  forms: FormContractV1[];
  navigation: NavigationContractV1[];
  providers: DataProviderRefV1[];
  fixtures: FixtureSetV1[];
  provenance: DynamicDataProvenanceV1;
}
```

The IR is target-neutral. Target-specific IDs/attributes live in adapter mappings.

## 5. Data model

Suggested shape:

```ts
interface DataModelV1 {
  modelId: string;
  version: number;
  name: string;
  source: "USER_DECLARED" | "IMPORTED" | "TARGET_OBSERVED";
  fields: DataFieldV1[];
  relationships?: DataRelationshipV1[];
  capabilities?: DataModelCapability[];
}
```

Model IDs are stable project identities, not target database table names unless explicitly mapped.

## 6. Field types

Initial neutral field types:

- `STRING`;
- `RICH_TEXT`;
- `NUMBER`;
- `BOOLEAN`;
- `DATE`;
- `DATETIME`;
- `URL`;
- `EMAIL`;
- `IMAGE`;
- `MEDIA`;
- `GALLERY`;
- `COLOR`;
- `ENUM`;
- `REFERENCE`;
- `REFERENCE_LIST`;
- `TAXONOMY_TERM`;
- `JSON_OPAQUE` only as an explicitly unsupported/adapter-specific escape with REVIEW.

Every field has nullability/cardinality and optional validation constraints.

## 7. Relationships

Relationships are explicit:

- one-to-one;
- one-to-many;
- many-to-one;
- many-to-many only when selected provider supports/configures it.

A visual card containing an author/avatar does not automatically establish an author entity relationship.

## 8. Source binding

A source binding maps a source component/text/media/property slot to a typed field.

Suggested shape:

```ts
interface DataBindingV1 {
  bindingId: string;
  sourceRef: SourceBindingTarget;
  modelId: string;
  fieldPath: string;
  bindingRole: "TEXT" | "IMAGE" | "LINK" | "VISIBILITY" | "ATTRIBUTE" | "REPEATER_ITEM";
  transform?: BoundedDataTransform;
  fallback?: ExplicitFallbackPolicy;
}
```

Transforms are bounded deterministic functions, never arbitrary executable code.

## 9. Bounded data transforms

Potential first transforms:

- string prefix/suffix;
- date formatting from declared locale/format;
- number formatting;
- URL composition from typed route fields;
- enum-to-label map;
- nullable fallback;
- media alt/title field selection;
- simple boolean visibility.

Forbidden:

- arbitrary JavaScript/PHP;
- remote network calls;
- eval/template execution;
- hidden database queries;
- AI transformations inside deterministic runtime.

## 10. Fixture separation

Fixture sets provide deterministic preview/test data.

Rules:

- fixture data is clearly labeled non-production;
- fixture data validates against selected model schema;
- generated target examples may import/use fixtures only in dev/demo contexts configured for that profile;
- production artifacts do not silently ship fake fixture data as live content;
- secrets/private production data should not be copied into generic fixture bundles by default.

## 11. Collection/repeater intent

A repeated region may become a dynamic collection only after explicit confirmation/schema binding.

Collection contract includes:

- model/query ID;
- repeated source/template component;
- item key/identity field if needed;
- empty state;
- loading state only when target/runtime requires it;
- pagination strategy;
- sort/filter configuration;
- page size/limit;
- optional static fixture preview.

## 12. Query model

Suggested shape:

```ts
interface DataQueryV1 {
  queryId: string;
  modelId: string;
  filters: QueryFilterV1[];
  sort: QuerySortV1[];
  pagination?: PaginationV1;
  search?: SearchContractV1;
  providerMapping?: ProviderQueryMappingRef;
}
```

Only typed operators supported by the selected provider/adapter may be used.

## 13. Query safety

Rules:

- no raw SQL from design/user text;
- no arbitrary PHP/JS query snippets in neutral IR;
- field/operator types validated;
- pagination/limit bounded;
- target adapter maps through documented APIs;
- unsupported operator/provider combinations -> REVIEW/BLOCKED;
- user input is parameterized/escaped according to target runtime implementation;
- production query execution is outside offline Figma plugin.

## 14. WordPress content model adapter

Potential WordPress mappings:

- model -> post type or configured native entity;
- enum/reference grouping -> taxonomy where explicitly selected;
- fields -> core post fields/meta/accepted custom-field integration;
- relationships -> adapter/provider capability if explicitly supported;
- list query -> Query Loop or server/query contract;
- detail -> singular route/template binding;
- media -> WordPress media/attachment mapping via target import/bridge.

P24 does not register custom post types/meta/taxonomies in production merely because a model exists; target/project profile must explicitly request generation/registration scaffolding.

## 15. WordPress registration scaffold

If explicitly selected, a future accepted WordPress adapter may generate deterministic plugin/theme scaffold for:

- `register_post_type`;
- `register_taxonomy`;
- `register_post_meta`/REST exposure;
- custom Block Binding sources;
- target-side provider code.

This code must be generated from typed configuration, reviewed/validated and installed through a separately accepted WordPress workflow.

It is never executed inside Figma.

## 16. Gutenberg Block Bindings adapter

Initial dynamic mapping should prefer documented Block Bindings when:

- selected WordPress version supports it;
- target block/attribute is bindable;
- data source is supported/registered;
- source key/type is compatible;
- editor/front-end behavior has accepted fixtures.

Mapping receipt records:

- block name;
- attribute;
- source ID/name;
- source key/path;
- WordPress version profile;
- custom source dependency if any.

## 17. Gutenberg Query Loop adapter

A collection can map to `core/query` only if the declared content/query contract can be represented by the selected WordPress version/profile.

Potential mappings:

- post type;
- taxonomy filters;
- author/search/order/orderBy;
- pagination;
- inherited vs explicit query;
- post-template child structure.

Custom filters/REST/server query extensions require explicit provider capability and real editor/front-end validation.

## 18. Elementor dynamic adapter

Elementor dynamic mappings use only documented P15/P24 target contracts.

Potential categories:

- text;
- number;
- URL;
- color;
- image/media/gallery;
- post meta;
- other accepted target categories.

Rules:

- target control must support dynamic value;
- data type/category compatible;
- Elementor Pro requirement explicit where active dynamic tags depend on Pro;
- custom tag/source IDs are generated only with an accepted companion extension contract;
- no undocumented internal dynamic-tag payload guessing.

## 19. Framework data contract adapter

P18 framework adapters may consume Dynamic Data IR to generate configurable typed interfaces/scaffolds.

First-slice output can include:

- TypeScript interfaces/types;
- props/data loader interface;
- route parameter types;
- provider interface/adapter placeholder;
- fixture data;
- component bindings to typed fields;
- client/server boundary annotations dictated by target framework.

Actual API URL/auth/fetch logic is generated only when a concrete provider contract is explicitly configured.

## 20. Provider adapter contract

Suggested descriptor:

```ts
interface DataProviderDescriptorV1 {
  providerId: string;
  adapterVersion: number;
  modelCapabilities: string[];
  queryCapabilities: string[];
  mutationCapabilities: string[];
  authMode: "NONE" | "ENV_REFERENCE" | "CONNECTED_RUNTIME";
  networkRequired: boolean;
  runtimeTargets: string[];
}
```

Neutral IR never stores secret values.

## 21. Generic API provider boundary

A generic REST/GraphQL-like provider may later be configured with:

- base endpoint declaration;
- schema/OpenAPI/GraphQL schema reference;
- operation IDs/query documents;
- typed variable mapping;
- response-field mapping;
- auth reference name;
- error/loading contract.

Arbitrary endpoint guessing or scraping from design copy is forbidden.

## 22. Authentication boundary

Authentication cannot be inferred.

Provider config can declare auth requirement/category, but secret material exists only in separately accepted runtime/environment storage.

Generated artifacts may reference environment variable names/placeholders, never embed actual secrets in receipts/project packages.

## 23. Forms neutral contract

Suggested shape:

```ts
interface FormContractV1 {
  formId: string;
  fields: FormFieldV1[];
  validation: FormValidationRuleV1[];
  submit: FormSubmissionContractV1;
  states: FormStateContractV1;
  consent?: ConsentContractV1[];
  providerRef?: string;
}
```

Form scope must be explicit before target generation.

## 24. Form fields

Initial types:

- text;
- textarea;
- email;
- phone/string;
- number;
- select;
- radio;
- checkbox;
- date;
- file only after provider/security support;
- hidden only from explicit config.

Each field records label, name/key, required state, autocomplete/purpose where explicitly configured, constraints and error-message source.

## 25. Form validation

Validation rules are explicit and typed.

Potential rules:

- required;
- min/max length;
- numeric min/max;
- email syntax;
- pattern through bounded safe regex policy;
- enum membership;
- file size/type if file upload is accepted;
- cross-field rule only through bounded accepted expressions.

Client validation does not replace required server/provider validation for production submissions.

## 26. Form submission contract

Submission modes may include:

- `NO_SUBMISSION` / visual-only prototype;
- target-native form provider;
- WordPress/Elementor accepted form integration;
- generic endpoint provider;
- custom integration required.

The contract must declare:

- provider/action;
- success behavior;
- error behavior;
- field mapping;
- privacy/consent dependencies;
- anti-spam dependency if selected;
- authenticated/unauthenticated mode.

No default email/webhook/CRM destination is invented.

## 27. Elementor Forms boundary

Elementor Pro Forms mapping is a separate capability from generic visual form mapping.

Enable only when:

- selected target has Elementor Pro/form capability;
- widget/settings/action mappings are documented/fixture-backed by P15/P24 acceptance;
- configured submission actions are supported;
- secrets/action credentials are not serialized into offline artifact.

Unsupported actions remain explicit.

## 28. Gutenberg/forms boundary

WordPress core has no one universal core form block contract that can represent every production form workflow. P24 therefore must not pretend generic forms are native Gutenberg core unless a supported block/provider/bridge is selected.

Fallback options include:

- framework/static form scaffold with explicit endpoint config;
- accepted third-party/custom block adapter later;
- bridge/custom plugin capability;
- REVIEW/unsupported.

## 29. Navigation contract

Navigation items can be:

- static URL;
- internal route ref;
- target content ref;
- dynamic menu/provider ref;
- anchor ref.

Each item records label source, destination type, child hierarchy and target behavior.

Visual ordering/nesting can be source evidence; production dynamic-menu provider selection is explicit.

## 30. WordPress navigation mapping

Potential target paths depend on accepted WordPress profile:

- core Navigation block/static links;
- target menu/navigation entity mapping where documented;
- theme/site-part usage;
- dynamic menu source through custom provider/bridge if separately accepted.

P16 remains authoritative for block serialization/target validity.

## 31. Search contract

Search is not inferred from an icon alone.

Explicit search configuration includes:

- search scope/model/provider;
- query field/parameter;
- result route/component;
- empty/error state;
- debounce/client behavior where relevant;
- server/provider operation.

Target implementation depends on provider/framework capability.

## 32. Filter/sort contract

Controls bind to typed query state only after explicit configuration.

Examples:

- taxonomy filter;
- enum filter;
- range filter;
- sort field/direction;
- pagination reset behavior.

Unsupported query/provider combinations remain REVIEW.

## 33. Pagination

Supported strategies are explicit:

- paged/page-number;
- previous/next;
- cursor;
- load-more;
- infinite scroll only with separately accepted interaction/accessibility/runtime contract.

The provider adapter declares which strategy it supports.

## 34. Dynamic routes

Dynamic route binding records:

- model/entity;
- route parameter fields;
- slug/ID strategy;
- list->detail link mapping;
- static generation/prerender strategy only when selected target/provider supports it;
- not-found behavior;
- target adapter profile.

Route parameter identity is configured, not guessed from title copy.

## 35. Conditional visibility

Data-driven visibility may be configured using bounded expressions such as:

- field exists/non-null;
- boolean equals value;
- enum equals/in set;
- collection non-empty;
- simple numeric comparison.

No arbitrary code predicates.

Visibility logic becomes part of target QA/interaction state matrix.

## 36. Interaction integration

P17 remains owner of generic interaction recipes. P24 can parameterize them with dynamic state.

Examples:

- tabs generated from collection data;
- carousel items from query;
- modal content from selected record;
- filtering updates query;
- form submission state drives success/error display.

Adapter must prove framework/target implementation and P20 behavior scenarios.

## 37. State ownership

State is classified:

- `LOCAL_UI_STATE`;
- `ROUTE_STATE`;
- `QUERY_STATE`;
- `FORM_STATE`;
- `SERVER_DATA_STATE`;
- `AUTH_STATE` only through explicit provider contract;
- `UNKNOWN`.

Do not collapse all dynamic behavior into generic client state.

## 38. Mutation/write boundary

Initial P24 should be read/display-first except configured form submission.

General create/update/delete CMS mutations require a separately accepted capability because they introduce:

- authorization;
- validation;
- destructive operations;
- conflict handling;
- server error semantics;
- data privacy/security.

A visual “Edit” button does not authorize CRUD generation.

## 39. Content migration boundary

P24 data binding does not automatically migrate existing production content.

Optional future migration requires:

- source data export/import contract;
- field mapping;
- transformation rules;
- media migration;
- duplicate/ID strategy;
- rollback/backup;
- target validation;
- privacy/security review.

## 40. Schema validation

Before target generation:

- model/field IDs unique;
- field paths resolve;
- relationships resolve;
- query fields/operators compatible;
- bindings type-compatible;
- form field mappings valid;
- provider capabilities sufficient;
- route bindings resolve;
- fixtures validate;
- no secrets present;
- dependency graph updated.

## 41. Target capability classification

Each dynamic mapping is classified:

- `NATIVE`;
- `NATIVE_WITH_PROFILE`;
- `PROVIDER_SUPPORTED`;
- `CUSTOM_EXTENSION_REQUIRED`;
- `STATIC_FALLBACK`;
- `UNSUPPORTED`;
- `UNKNOWN`.

Unknown/unsupported remain visible in readiness denominator.

## 42. Dynamic readiness state

Suggested states:

- `READY`;
- `READY_WITH_REVIEW`;
- `NOT_READY`;
- `INSUFFICIENT_EVIDENCE`.

Evidence includes:

- schema completeness;
- binding coverage;
- provider compatibility;
- form submission completeness;
- route/query completeness;
- target capability coverage;
- secret/runtime dependency readiness;
- QA coverage.

## 43. Project dependency graph integration

P24 adds typed P23 dependency edges such as:

- component `BINDS_MODEL`;
- component `USES_QUERY`;
- route `USES_MODEL`;
- form `SUBMITS_TO_PROVIDER`;
- query `USES_PROVIDER`;
- target artifact `USES_DYNAMIC_BINDING`;
- QA scenario `USES_FIXTURE`.

Schema/provider/binding changes invalidate dependent artifacts/QA/reports/estimates.

## 44. Change-only dynamic regeneration

A data-bound output may be reused only when:

- source component semantics unchanged;
- dynamic schema/bindings unchanged/compatible;
- provider/profile unchanged/compatible;
- route/query/form contracts unchanged;
- target adapter unchanged/compatible;
- fixture changes do not affect production output or QA policy according to explicit classification.

Schema changes default to regeneration/revalidation of affected closure.

## 45. P22 effort integration

P24 exposes transparent factors:

- model count;
- field/relationship complexity;
- query/filter/pagination count;
- dynamic route count;
- form field/validation/submission complexity;
- provider/custom-extension burden;
- dynamic QA scenario count;
- unknown integration dependencies.

P22 does not guess dynamic effort before these are configured.

## 46. QA requirements

Dynamic target acceptance needs deterministic fixtures or controlled observed runtime data.

Potential P20 scenarios:

- populated collection;
- empty collection;
- missing optional field;
- long text/media variant;
- pagination/filter state;
- dynamic route detail;
- form validation error;
- form success/failure with safe test provider;
- loading/error state where runtime actually has async fetching.

No production submission is needed to validate a sandbox/test fixture unless specifically required by accepted provider workflow.

## 47. Offline core vs connected runtime

Offline deterministic core may:

- define/import schema;
- validate bindings;
- create fixtures;
- generate target code/artifacts/config;
- report provider requirements.

It may not:

- fetch production APIs;
- use credentials;
- submit forms;
- mutate CMS content;
- discover private data remotely.

Those require separately accepted connected/local runtime modules.

## 48. Provider connection receipt

Future connected validation must record without secrets:

- provider ID/version;
- target environment identity;
- auth mode/reference name;
- operation/query identity;
- schema/version/hash;
- response shape validation;
- timestamp/result;
- redaction policy.

No token/password value in receipt.

## 49. Error handling

Generated dynamic targets need explicit error/fallback behavior when configured.

Classes:

- validation/config error;
- network unavailable;
- unauthorized/forbidden;
- not found;
- empty result;
- provider/server error;
- malformed response;
- form field/server validation error.

The design cannot invent user-facing production error copy unless user/project supplies it or a bounded placeholder is clearly labeled.

## 50. Localization

Dynamic schemas may declare localized fields/routes, but locale strategy is explicit.

Do not infer multilingual CMS structure from duplicated translated frames without confirmation.

A later localization provider adapter can map locale variants under a separate contract.

## 51. Privacy/data minimization

P24 should minimize sensitive data in fixtures/reports.

Rules:

- avoid real personal production data in generic fixtures;
- use synthetic/user-supplied test data;
- do not serialize credentials;
- form reports list field schema, not submitted private values by default;
- provider response samples can be redacted/minimized;
- connected runtime privacy is separately documented.

## 52. Security rules

Forbidden in deterministic generated configuration:

- hardcoded secrets;
- raw executable query/code strings outside accepted adapter templates;
- unescaped user input concatenated into target query/code;
- unknown remote script loaders;
- disabling target validation to make dynamic output compile;
- silent production mutations.

## 53. Atomicity

Dynamic plan/artifact generation occurs in staging.

Final output is exposed only after:

- schema/binding validation;
- target capability validation;
- reference closure;
- static artifact validation;
- package safety.

Observed provider/import/runtime verification upgrades evidence separately.

## 54. Job state machine

`IDLE -> DATA_SCOPE -> SCHEMA_READY -> BINDING -> PROVIDER_PROFILE -> COMPATIBILITY -> FIXTURE_VALIDATION -> DYNAMIC_PLAN -> GENERATING -> STATIC_VALIDATING -> TARGET_VERIFYING? -> RUNTIME_VERIFYING? -> COMPLETE`

Terminal states:

- `CANCELLED`;
- `STALE`;
- `SCHEMA_INVALID`;
- `BINDING_INVALID`;
- `PROVIDER_UNSUPPORTED`;
- `SECRET_REQUIRED`;
- `ARTIFACT_REJECTED`;
- `TARGET_VERIFY_FAILED`;
- `RUNTIME_VERIFY_FAILED`;
- `INSUFFICIENT_EVIDENCE`.

## 55. Determinism

For identical source, Dynamic Data IR, provider/target profile, fixtures and adapter versions:

- schema normalization stable;
- binding plan stable;
- generated code/artifact stable;
- diagnostics stable;
- receipts stable;
- no production data/network response affects offline generation identity.

Connected runtime observations are separate evidence with environment/result identity.

## 56. Test matrix

### Models/bindings

- simple post/article model;
- custom content type;
- optional/media/reference fields;
- invalid field path;
- relationship;
- source component binding;
- conditional visibility;
- type mismatch.

### Collections/queries

- static repeater converted after explicit binding;
- WordPress Query Loop compatible query;
- taxonomy filter;
- pagination;
- unsupported provider operator;
- empty result;
- multiple sort/filter states.

### Gutenberg

- supported Block Binding;
- unsupported block attribute;
- post meta source;
- custom source dependency;
- query block editor/front-end round trip.

### Elementor

- text/image/URL dynamic mapping;
- Pro-required profile;
- Free-only rejection;
- custom tag dependency;
- incompatible tag/control type.

### Framework

- typed model/interfaces;
- dynamic route;
- fixture-driven list/detail;
- explicit provider placeholder;
- no-provider static fallback.

### Forms

- simple contact form schema;
- validation;
- explicit no-submission prototype;
- configured provider;
- missing submission destination;
- success/error states;
- file-upload unsupported/security case.

### Security

- secret accidentally placed in config -> reject/redact;
- raw query/code injection -> reject;
- unknown remote provider -> review;
- production write/mutation attempt outside capability -> block.

## 57. Production acceptance

P24 production acceptance is per target/provider capability.

Minimum evidence for claimed capability:

- typed schema/binding validation;
- fixture-based generation/render;
- target artifact/build validation;
- actual target dynamic behavior where claimed;
- empty/error/optional data cases;
- no secret leakage;
- dependency invalidation/change-only behavior;
- P20 content/interaction QA;
- P21 handoff disclosure;
- P22 effort factor integration;
- real WordPress/Elementor environment tests for WordPress-specific claims.

One provider/target acceptance does not accept all dynamic providers.

## 58. Non-goals for first implementation

Not first-slice guarantees:

- automatic production database design;
- arbitrary REST/GraphQL discovery;
- live CMS credentials in Figma;
- content migration;
- general CRUD/admin UI generation;
- authentication/authorization systems;
- payment/e-commerce business logic;
- arbitrary serverless/backend functions;
- complex workflow/state machines;
- legal consent/privacy policy generation;
- automatic multilingual CMS strategy;
- every third-party WordPress form/CMS plugin.

## 59. P25 handoff

P25 commercial packaging can gate neutral capabilities such as:

- dynamic schema count;
- target dynamic adapters;
- custom provider adapters;
- forms/integration mappings;
- connected runtime verification;
- project/batch dynamic export.

Entitlement checks do not change schema/binding evidence.

## 60. Implementation-opening checklist

Before P24 runtime implementation opens:

- [ ] P12 internal release exit complete;
- [ ] selected upstream target/project contracts implemented/accepted;
- [ ] R0 dynamic data snapshot refreshed;
- [ ] Dynamic Data IR/schema v1 frozen;
- [ ] bounded transform/query expression catalogs frozen;
- [ ] static vs fixture vs production truth classes frozen;
- [ ] first WordPress/provider mapping selected;
- [ ] form contract/security boundary frozen if forms ship;
- [ ] secret/environment-reference contract frozen;
- [ ] P23 dependency edges/invalidation integrated;
- [ ] fixture/runtime QA campaign prepared;
- [ ] provider-specific production acceptance checklist named before coding.

Until those gates pass, this specification remains planning-only and must not be used to claim P24 implementation or production CMS/data integration.