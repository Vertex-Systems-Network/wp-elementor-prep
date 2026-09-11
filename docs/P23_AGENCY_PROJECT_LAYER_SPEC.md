# P23 Agency / Project Layer + Existing-Component Bindings + Change-Only Regeneration — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; accepted P13-P22 evidence/configuration contracts  
R0 source snapshot: `docs/R0_AGENCY_PROJECT_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P23 turns the single-run audit/export pipeline into a repeatable agency/project workflow without weakening deterministic behavior.

It adds:

- organization and project presets;
- bounded custom project rules;
- project baselines/history;
- revision comparison;
- change-only regeneration;
- existing target-component bindings;
- report white-label presentation;
- agency estimator/report configuration references.

P23 does not add arbitrary scripting, cloud collaboration or secret storage to the deterministic core.

## 2. Canonical project flow

`Choose/create project -> resolve organization/project/run configuration -> choose source + target(s) -> load accepted baseline if any -> scan/audit -> compare revision -> identify changed dependency closure -> prepare/generate only safe changed outputs -> revalidate affected outputs -> update QA/handoff/estimate -> create immutable new baseline/history receipt`

Past authoritative baselines remain immutable.

## 3. Project identity

Suggested shape:

```ts
interface ProjectIdentityV1 {
  schemaVersion: 1;
  projectId: string;
  organizationId?: string;
  displayName: string;
  clientLabel?: string;
  createdWithProductVersion: string;
}
```

`projectId` is stable and machine-oriented. Display names/client labels may change without changing project identity.

## 4. Configuration model

Suggested root:

```ts
interface ProjectConfigurationV1 {
  schemaVersion: 1;
  organizationPreset?: PresetRef;
  projectPreset?: PresetRef;
  runOverride?: BoundedRunOverride;
  targetProfiles: TargetProfileRef[];
  ruleSetRefs: RuleSetRef[];
  bindingRegistryRef?: BindingRegistryRef;
  qaProfileRef?: ProfileRef;
  handoffProfileRef?: ProfileRef;
  estimatorProfileRef?: ProfileRef;
  whiteLabelProfileRef?: ProfileRef;
}
```

The resolved effective configuration is immutable per run and receives its own hash.

## 5. Configuration precedence

Precedence, lowest to highest:

1. product defaults;
2. organization preset;
3. project preset;
4. run override.

Rules:

- only schema-marked fields are overrideable;
- security/safety invariants are never overrideable;
- a later layer cannot weaken mandatory evidence gates;
- invalid overrides fail validation or are rejected with explicit diagnostics;
- final field provenance can be inspected.

## 6. Preset versioning

Presets are immutable versioned records.

Updating an organization/project preset creates a new version rather than rewriting historical runs.

A baseline/estimate/report records the exact preset versions used so historical output remains reproducible.

## 7. Organization preset

Potential sections:

- allowed/preferred target adapters;
- target default options;
- asset/token naming policies;
- QA viewport/state requirements;
- P21 report/advisory settings;
- P22 estimator/calibration/commercial profile refs;
- bounded standards/rules;
- binding registry refs;
- output path/naming policies;
- white-label profile ref.

Forbidden:

- secrets;
- executable code;
- hidden evidence suppression;
- direct mutation recipes not already accepted by P14;
- network endpoints that cause ambient fetch behavior.

## 8. Project preset

Project-specific fields may include:

- selected source scopes;
- target(s)/profiles;
- route/page plan refs;
- project naming conventions;
- required QA/report profiles;
- project rule set refs;
- existing-component binding registry ref;
- accepted target limitations;
- estimator/proposal assumptions;
- baseline pointer;
- content/asset/token conventions.

Customer-specific IDs/copy remain data, never hard-coded product logic.

## 9. Run override

A run override supports bounded one-off changes such as:

- export only selected pages;
- choose another accepted target profile;
- temporarily raise QA viewport coverage;
- include/exclude optional report sections;
- select one accepted token mode;
- choose explicit what-if estimator scope.

Run override cannot:

- disable mandatory validation;
- allow arbitrary code/network;
- mark unsupported mapping as verified;
- suppress required blocker findings;
- modify historical baseline receipts.

## 10. Declarative custom rule schema

Conceptual rule:

```ts
interface ProjectRuleV1 {
  ruleId: string;
  version: number;
  appliesTo: string[];
  when: BoundedPredicate;
  then: BoundedRuleOutcome[];
  severity?: string;
  messageKey: string;
}
```

Predicates operate only on whitelisted normalized fields/operators.

Potential operators:

- equality/inequality;
- set membership;
- numeric range;
- string/slug pattern using bounded safe regex/pattern implementation;
- count threshold;
- evidence status/provenance checks;
- target/profile capability checks.

## 11. Custom rule outcomes

Allowed first-slice outcomes:

- add project finding;
- set manual-review requirement;
- require specific QA channel/profile;
- disallow selected target fallback/category;
- enforce naming/path convention;
- require an accepted report/profile;
- raise project severity within bounded policy;
- block handoff/export until condition is resolved.

Not allowed:

- execute JavaScript/shell/Python;
- mutate Figma nodes directly;
- write arbitrary target files;
- fetch remote URLs;
- read host files/secrets;
- suppress immutable safety/validation failures;
- invoke AI as rule authority.

## 12. Rule conflict handling

If multiple rules produce conflicting outcomes:

- mandatory product safety wins;
- explicit priority is allowed only within same trusted rule class and bounded schema;
- incompatible project rules produce `RULE_CONFLICT`/REVIEW rather than nondeterministic last-write-wins behavior;
- conflict details list rule IDs/versions and affected field/action.

## 13. Baseline model

Suggested shape:

```ts
interface ProjectBaselineV1 {
  schemaVersion: 1;
  baselineId: string;
  projectId: string;
  effectiveConfigHash: string;
  sourceSnapshots: SourceSnapshotRef[];
  targetProfiles: TargetProfileRef[];
  semanticManifestHash: string;
  artifactRefs: ArtifactRef[];
  evidenceRefs: EvidenceRef[];
  dependencyGraphHash: string;
  createdFromRunId: string;
}
```

A baseline can be accepted only after required project profile validation completes.

## 14. Semantic project manifest

The project semantic manifest indexes comparable objects such as:

- pages/frames;
- sections;
- source components/variants;
- normalized text/content groups where output depends on them;
- routes;
- target generation plans/components/files;
- assets;
- tokens/modes/aliases;
- interaction recipes;
- findings;
- QA states;
- handoff/estimate refs.

Each object carries stable identity and semantic hash.

## 15. Semantic hash contract

Semantic hashes exclude known volatile metadata.

Potential hash input examples:

- source subtree normalized layout/style/content relevant to target generation;
- component contract rather than canvas coordinates outside component scope;
- token graph/value/mode relationships;
- asset bytes/content hash;
- route path/layout mapping;
- adapter generation plan;
- target source normalized according to adapter-owned canonicalization.

Hash algorithm/version is explicit and migration-aware.

## 16. Comparison engine

A new run compared to baseline produces typed deltas.

Suggested object status:

- `NEW`;
- `UNCHANGED`;
- `CHANGED`;
- `REMOVED`;
- `IMPROVED`;
- `REGRESSED`;
- `RESOLVED`;
- `NOT_COMPARABLE`;
- `UNKNOWN`.

`IMPROVED/REGRESSED/RESOLVED` are used for evidence/findings with ordered semantics; structural objects generally use NEW/UNCHANGED/CHANGED/REMOVED.

## 17. Identity reconciliation

Objects should be matched using strongest accepted identity:

1. stable explicit project/source binding identity;
2. source component/section semantic identity;
3. retained provenance mapping;
4. bounded structural matching with confidence;
5. otherwise NOT_COMPARABLE/NEW+REMOVED.

Do not force-match objects solely because names are the same.

## 18. Rename handling

A pure rename should not cause unnecessary regeneration if semantic output is unaffected and target naming/path policy does not depend on the name.

If the name affects generated component/file/path/route identity, the change propagates accordingly.

Rename detection requires strong identity/provenance, not fuzzy name guessing.

## 19. Dependency graph model

Nodes may include:

- source page/section/component;
- token;
- asset;
- route;
- interaction recipe;
- target generated component/file/artifact;
- QA scenario;
- report/estimate.

Edges have typed dependency reasons, for example:

- `USES_COMPONENT`;
- `USES_TOKEN`;
- `USES_ASSET`;
- `CHILD_OF_ROUTE`;
- `GENERATED_FROM`;
- `QA_VERIFIES`;
- `REPORT_REFERENCES`;
- `ESTIMATE_CONSUMES`.

Graph serialization/order is deterministic.

## 20. Dependency invalidation

When an input changes:

1. mark direct dependent nodes stale;
2. traverse accepted dependency edges;
3. compute minimal affected closure;
4. classify required action by node type;
5. preserve unchanged authoritative outputs outside the closure.

Actions may include:

- `REGENERATE_REQUIRED`;
- `REVALIDATE_REQUIRED`;
- `RERENDER_QA_REQUIRED`;
- `REBUILD_REPORT_REQUIRED`;
- `REESTIMATE_REQUIRED`;
- `NO_ACTION`;
- `REVIEW`.

## 21. Change-only regeneration safety

Reusing a prior target output requires all of:

- semantic input unchanged;
- effective config relevant to output unchanged;
- adapter/version/profile compatible;
- all transitive dependency identities unchanged/compatible;
- binding entries unchanged/compatible;
- prior artifact receipt valid;
- target/profile policy permits reuse;
- no project rule demands regeneration.

Failure of any unknown/compatibility check defaults to regeneration/review, never silent reuse.

## 22. Partial project generation

A user may choose changed-only generation or explicit selected scope.

The project planner still computes dependency closure so selecting one shared component may regenerate multiple dependent routes/pages.

UI/report should state:

- explicitly selected objects;
- automatically included dependents;
- reused unchanged artifacts;
- excluded objects;
- stale objects left unresolved, if user intentionally stops early.

## 23. Existing-component binding registry

Suggested root:

```ts
interface ComponentBindingRegistryV1 {
  schemaVersion: 1;
  registryId: string;
  version: number;
  targetProfileCompatibility: string[];
  bindings: ExistingComponentBindingV1[];
}
```

The registry is immutable/versioned per baseline/run.

## 24. Binding record

Suggested shape:

```ts
interface ExistingComponentBindingV1 {
  bindingId: string;
  version: number;
  sourceSignature: SourceComponentSignature;
  target: {
    adapterId: string;
    packageOrProjectRef: string;
    importPath: string;
    exportName: string;
    compatibleVersionRange?: string;
  };
  props: PropBinding[];
  variants?: VariantBinding[];
  slots?: SlotBinding[];
  tokens?: TokenBindingPolicy;
  assets?: AssetBindingPolicy;
  styleOwnership: "TARGET" | "GENERATED" | "HYBRID";
  requiredContext?: ContextRequirement[];
  fixtureRef: BindingFixtureRef;
  status: "ACTIVE" | "DEPRECATED" | "REVOKED";
}
```

## 25. Source component signature

Signature should contain stable normalized evidence such as:

- source component/set provenance;
- property/variant definitions;
- semantic role;
- required child/slot contract;
- interaction/state recipe requirements;
- configurable content fields;
- meaningful structural/style expectations where binding depends on them.

It should not depend on volatile source timestamps.

## 26. Target component reference

P23 does not need to ingest/execute a target codebase inside the Figma plugin.

Initial references may be explicit user/project configuration backed by fixtures/static metadata.

A future connected local/repository capability can validate actual package/source symbols under a separate security contract.

Until observed externally, target component existence may be `DECLARED` rather than `OBSERVED` and cannot receive the same confidence label.

## 27. Binding compatibility

Before reuse, check:

- target adapter/profile matches;
- source signature matches required binding version;
- required props/variants/slots present;
- unsupported source variant not silently dropped;
- required target context/provider declared;
- token/asset ownership strategy resolved;
- fixture/static validation valid;
- target package/project version compatible if known;
- binding status ACTIVE.

## 28. Binding fallback

If binding fails:

Potential profile-defined outcomes:

- generate new component through P18;
- REVIEW and require user decision;
- block generation.

Never silently bind to a “closest” external component using fuzzy names alone.

## 29. Binding prop mapping

Mappings can be:

- direct source property -> target prop;
- source variant -> enum/union prop;
- boolean visibility -> boolean prop;
- text/image/content slot -> prop/child slot;
- accepted transform through bounded deterministic mapping.

Arbitrary executable transform code is not allowed in registry records.

## 30. Existing-component QA

Binding use still requires QA appropriate to project profile.

Possible validation:

- required props supplied;
- build/static check;
- component renders in harness;
- source/target geometry/content comparison;
- interaction recipes pass;
- style/token ownership behaves as declared.

Existing code ownership does not waive target fidelity validation.

## 31. Agency report profile

P23 can configure P21 presentation:

- organization/client branding;
- logo asset reference;
- report typography/color tokens;
- cover/header/footer;
- organization contact details;
- default report sections/order;
- locale.

Evidence IDs/status/limitations remain canonical and must remain accessible in machine report.

## 32. Mandatory disclosure preservation

White-label profile cannot remove or weaken:

- unsupported feature disclosures;
- manual-review requirements;
- evidence provenance;
- P20 verification scope;
- accessibility/SEO non-certification boundaries;
- target/version compatibility;
- accepted limitations;
- stale/insufficient evidence states.

## 33. Project estimator profiles

P23 may reference P22 organization profiles:

- coefficient set;
- team calibration;
- commercial/rate profile;
- proposal defaults;
- assumptions/exclusions templates.

Historical estimates record exact profile versions. Updating organization rates does not alter old receipts.

## 34. Approval/accepted-limitation records

Project history may retain explicit approvals such as:

- accepted target fallback;
- accepted limitation;
- approved baseline;
- selected component binding;
- handoff acceptance state.

Initial local record should include only identity available in the product context. Do not fabricate organization/user identities or signatures.

Approvals do not override mandatory product safety gates.

## 35. History manifest

Suggested local history index:

```ts
interface ProjectHistoryV1 {
  schemaVersion: 1;
  projectId: string;
  entries: ProjectHistoryEntry[];
}
```

Entries can reference immutable receipts for:

- baseline;
- export;
- QA;
- handoff;
- estimate;
- binding registry update;
- preset update;
- approval/limitation.

## 36. History storage boundary

First implementation can support local downloadable/importable project manifests/packages.

It should not imply multi-user cloud state, sync conflict resolution, server durability or audit-log legal guarantees.

Those require separately designed backend/auth/storage capabilities.

## 37. Project package import

A project manifest/package import must validate:

- schema/version;
- safe paths;
- bounded size/count;
- hashes;
- no secrets/executable content;
- referenced baselines/presets/registries;
- adapter/profile compatibility;
- migration path if older supported schema.

Unknown future schema fails closed rather than partially interpreting fields.

## 38. Migration policy

Project/preset/binding schemas are versioned.

Migration rules:

- pure deterministic migration only;
- source data retained where possible;
- no migration silently upgrades evidence authority;
- old baseline identities retained;
- migration receipt records before/after schema/hash;
- unsupported migration requires explicit re-scan/reconfiguration.

## 39. Batch/project export

P23 can coordinate multiple pages/targets through accepted P7/P17-P20 job principles.

Core/plugin defaults:

- bounded sequential processing;
- cooperative cancellation;
- per-item receipts;
- no unbounded parallel target generation;
- source/config changes mark remaining jobs stale.

CLI/local harness may later use bounded concurrency after resource/isolation testing.

## 40. Cancellation/recovery

Project batch cancellation records:

- completed immutable items;
- cancelled pending/in-flight items;
- reused prior artifacts;
- stale outputs;
- safe resume plan tied to same effective config/source identity.

Resume cannot use stale configuration/baseline silently.

## 41. Project status

Suggested high-level states:

- `CURRENT`;
- `CHANGES_DETECTED`;
- `REGENERATION_REQUIRED`;
- `REVALIDATION_REQUIRED`;
- `REVIEW_REQUIRED`;
- `PARTIALLY_UPDATED`;
- `BLOCKED`;
- `INSUFFICIENT_EVIDENCE`.

Status is derived from dependency/evidence state, not manually painted green.

## 42. Change summary

Human/machine change summary should include:

- changed/new/removed source scopes;
- changed shared components;
- changed tokens/assets;
- target/config/binding changes;
- affected pages/routes/artifacts;
- reused artifacts;
- regenerated artifacts;
- QA/report/estimate invalidations;
- finding NEW/REGRESSED/IMPROVED/RESOLVED counts.

## 43. Estimate delta

P22 can recompute only affected factors plus required regression overhead when change-only evidence is strong.

P23 supplies:

- changed scope closure;
- reusable unchanged scope;
- binding changes;
- target/config changes;
- QA rerun scope;
- uncertainty caused by not-comparable objects.

If delta identity is weak, fall back to full re-estimate/review.

## 44. Rule/preset portability

Organization presets/rules can be exported/imported as deterministic configuration artifacts.

They must declare:

- schema version;
- compatible product/adapter versions;
- IDs/versions;
- no secrets;
- content hash;
- required referenced profiles.

Imported presets cannot auto-enable unavailable paid/entitled features; P25 handles entitlement checks separately.

## 45. Entitlement boundary

P23 defines capability/configuration structures independently of Free/Pro/Agency licensing.

P25 later determines whether the active user can invoke/create/use a capability.

Do not bake commercial plan names into core project data schemas where a neutral capability ID suffices.

## 46. Privacy boundary

Project/client history can contain private business/design information.

Defaults:

- local/offline deterministic handling;
- no analytics upload from core;
- no remote syncing without explicit future connected workflow;
- no secrets in exported project packages;
- user can inspect what is included in project package/report.

## 47. Project deletion boundary

If local history storage exists later, deletion semantics must be explicit.

P23 planning does not claim deletion from external targets, Git repositories, WordPress sites or prior exported files. Local project deletion cannot revoke copies the user already exported/shared.

## 48. Test matrix

### Configuration

- product defaults only;
- organization + project overrides;
- valid run override;
- forbidden safety override;
- invalid/conflicting rules;
- deterministic effective config hash.

### Baseline/change

- identical rerun;
- text-only content change;
- layout change;
- rename only;
- component change affecting multiple pages;
- token change affecting multiple outputs;
- asset byte change;
- adapter/profile version change;
- removed page;
- weak identity/NOT_COMPARABLE.

### Dependency invalidation

- leaf section change;
- shared component change;
- shared token change;
- binding registry update;
- QA profile change;
- handoff profile/branding-only change;
- estimator profile change.

### Bindings

- valid exact binding;
- missing prop;
- new source variant;
- stale target version;
- revoked binding;
- target-owned styles/tokens;
- generated fallback;
- binding fixture mismatch.

### White label/history

- branding change without evidence mutation;
- mandatory disclosure retained;
- baseline history immutable;
- project package import/tamper/path rejection;
- schema migration.

### Batch

- multi-page project;
- changed-only run;
- cancellation/resume;
- stale source mid-queue;
- reused artifact hash validation.

## 49. Production acceptance

P23 production acceptance requires real evidence that:

- configuration precedence/reproducibility works;
- arbitrary executable rules cannot enter deterministic engine;
- baseline semantic identity is stable;
- change detection catches source/config/dependency changes;
- change-only regeneration never reuses stale transitive dependencies;
- existing-component bindings validate and fail closed;
- project history/baselines remain immutable/reproducible;
- white-label presentation cannot suppress mandatory evidence;
- local project package import/export is safe/tamper-evident;
- P22 delta estimates reconcile with changed dependency closure;
- at least several materially different multi-page revisions are tested.

## 50. Non-goals for first implementation

Not first-slice guarantees:

- multi-user cloud collaboration;
- organization RBAC/SSO;
- arbitrary code/custom plugins as rules;
- secret management;
- automatic Git/repository scanning;
- direct deployment orchestration;
- client portal;
- billing/subscriptions;
- live approval e-signatures;
- automatic cross-device project sync;
- merging simultaneous project edits;
- automatic external component-library discovery without a separate connector/local tooling contract.

## 51. P24 handoff

P24 dynamic/CMS mappings can extend project configuration/dependency graph with:

- data model/schema refs;
- content source bindings;
- form submission/integration contracts;
- navigation/menu bindings;
- query/filter/pagination configuration;
- dynamic target mappings.

P24 must retain the same rule: data/backend behavior is explicit configuration, never inferred as production truth from pixels.

## 52. P25 handoff

P25 consumes neutral capability IDs from P23 to enforce plan entitlements for:

- project count/history depth;
- presets/rules;
- binding registries;
- batch/change-only regeneration;
- white-label reports;
- organization estimator profiles;
- target/QA capabilities.

Entitlement denial must not corrupt project data; it only controls allowed actions/outputs.

## 53. Implementation-opening checklist

Before P23 runtime implementation opens:

- [ ] P12 internal release exit complete;
- [ ] required upstream P13-P22 schemas implemented/accepted;
- [ ] R0 agency/project snapshot refreshed;
- [ ] project/preset/effective-config schemas frozen;
- [ ] bounded rule DSL/operator/outcome catalog frozen;
- [ ] semantic hashing/canonicalization frozen;
- [ ] baseline manifest/dependency graph schemas frozen;
- [ ] change-only invalidation rules frozen;
- [ ] existing-component binding registry/signature contract frozen;
- [ ] local project history/package privacy/safety limits frozen;
- [ ] white-label mandatory-disclosure policy frozen;
- [ ] revision/change fixture campaign prepared.

Until those gates pass, this specification remains planning-only and must not be used to claim P23 implementation.