# R0 Agency / Project Layer Snapshot — 2026-09-11

Status: RESEARCH / PLANNING-ONLY  
Owner roadmap issue: #119  
Target phase: P23 — Agency / Project Layer + Existing-Component Bindings + Change-Only Regeneration  
Dependencies: #84 P12 internal release exit; accepted P13-P22 evidence/configuration contracts  
Date: 2026-09-11

## 1. Purpose

P23 adds organization/project-level configuration and history without weakening the deterministic source/target contracts established in P13-P22.

The agency/project layer should make the product practical for repeated professional use across clients, teams and revisions while preserving one rule: organization preferences can configure evidence processing/presentation, but cannot rewrite observed facts or bypass validation gates.

## 2. Frozen architecture principles

1. **Core remains organization-neutral.** Agency/client presets wrap the accepted deterministic core; they do not fork scanner or adapter logic.
2. **Configuration precedence is explicit.** Product defaults, organization preset, project preset and run override resolve through a documented order with a final effective-config receipt.
3. **No arbitrary executable custom rules.** Custom organization rules use a bounded declarative schema/DSL. JavaScript, shell code, dynamic imports and remote executable policy are forbidden in the deterministic core.
4. **Project identity is immutable/versioned.** Client/project labels are metadata; project/baseline identity comes from versioned IDs and source/target/config hashes.
5. **Baseline comparison uses semantic identities/hashes.** File timestamps, export filenames and arbitrary modified dates are never sufficient change evidence.
6. **Dependency-aware change regeneration.** A shared component/token/asset change invalidates all outputs that depend on it even if their source section did not change directly.
7. **Change-only regeneration is fail-closed.** If dependency closure cannot prove an output unchanged, the item becomes REVIEW/REGENERATE rather than silently reused.
8. **Existing component bindings are explicit mappings.** Source components map to codebase/target-owned components only through versioned binding records and fixtures.
9. **Stale bindings never silently match.** Version/signature mismatch produces REVIEW/BLOCKED according to profile.
10. **White-label affects presentation only.** Branding cannot hide required warnings, evidence states, hashes, limitations or standards boundaries.
11. **Secrets do not belong in project presets.** Credentials/API keys/tokens live only in future accepted secure connected execution contexts.
12. **History is append-oriented.** New runs/baselines do not mutate past authoritative receipts.
13. **Batch execution remains bounded.** The Figma/plugin deterministic path retains the accepted sequential/bounded execution guarantees; high-concurrency project builds require separately accepted CLI/local harness controls.
14. **P22 organization calibration stays explicit.** Agency estimator/rate presets configure P22 but do not change source evidence.

## 3. Configuration layers

Initial precedence, lowest to highest:

1. `PRODUCT_DEFAULT`;
2. `ORGANIZATION_PRESET`;
3. `PROJECT_PRESET`;
4. `RUN_OVERRIDE`.

A later layer may override only fields marked overrideable by schema. Security/safety invariants are non-overrideable.

The effective configuration receipt records:

- every input layer ID/version/hash;
- field-level provenance where useful;
- rejected/invalid overrides;
- final normalized configuration hash.

## 4. Organization preset boundary

Organization presets may contain bounded settings such as:

- target adapter defaults;
- report profiles/branding references;
- naming/path conventions;
- accepted viewport matrices;
- P21 advisory presets;
- P22 coefficient/calibration/commercial profile references;
- project standards/rule sets;
- binding registry references;
- allowed output profiles;
- QA requirement presets;
- asset/token naming policy references.

They may not contain arbitrary code, secrets or permission-bypass flags.

## 5. Project preset boundary

A project preset can bind organization rules to one client/project context:

- project ID/name/labels;
- source file/page/frame scopes;
- target profiles;
- route/page plan references;
- component binding registry version;
- accepted limitations;
- report/white-label profile;
- estimator profile;
- baseline ID;
- project-specific bounded rules;
- project asset/token conventions.

Project copy/names are metadata, not product logic constants.

## 6. Declarative rule boundary

Custom rules should support bounded predicates over normalized evidence, for example conceptually:

- target profile equals X;
- finding family/severity/status matches values;
- source property falls outside allowed range;
- token naming pattern mismatch;
- project disallows fallback category Y;
- target requires specific QA channel.

Allowed outcomes are bounded actions such as:

- add deterministic finding;
- raise severity within configured limits;
- mark manual review required;
- block a target/profile;
- require a QA/report step;
- apply naming/presentation policy.

Rules cannot mutate arbitrary Figma nodes, execute code, access network/storage, or suppress mandatory safety findings.

## 7. Baseline identity

A baseline should bind at least:

- project preset/effective-config hash;
- source snapshot/IR identity;
- target adapter/profile identities;
- asset/token manifest identities;
- component binding registry identity;
- generation artifact manifest hashes;
- QA/handoff evidence where included;
- baseline schema/version.

A human label such as “Client v2” is display metadata, not baseline identity.

## 8. Change classification

P23 comparison should classify comparable evidence as:

- `NEW`;
- `UNCHANGED`;
- `IMPROVED`;
- `REGRESSED`;
- `RESOLVED`;
- `CHANGED`;
- `REMOVED`;
- `NOT_COMPARABLE`;
- `UNKNOWN`.

The exact classification applies to typed objects: findings, source sections/components, routes, assets, tokens, generated components/files and QA states.

## 9. Semantic hashing

Change detection should hash normalized semantic representations rather than raw volatile serialization where possible.

Potential hashed domains:

- source section/subtree normalized IR;
- component/variant contract;
- text/content where content affects output;
- layout/style semantics;
- route plan;
- asset content hash;
- token value/mode/alias graph;
- interaction recipe configuration;
- target generation plan;
- generated file normalized source where appropriate.

Timestamps, generated-at fields and nondeterministic ordering must be excluded from semantic identity.

## 10. Dependency graph

P23 needs an explicit dependency graph between project-level objects.

Examples:

- route depends on sections/components;
- generated component depends on source component + token/asset refs + adapter profile;
- page artifact depends on generated components + route/layout;
- QA receipt depends on exact build/artifact + viewport/state profile;
- handoff report depends on exact findings/QA/assets/tokens;
- estimate depends on exact scope/evidence/model profiles.

A changed dependency invalidates all downstream nodes until regenerated/revalidated.

## 11. Change-only regeneration boundary

A generated output may be reused only when:

- its direct semantic input hash is unchanged;
- all transitive dependencies are unchanged/compatible;
- adapter/profile/config versions are unchanged;
- binding registry entries used by the output are unchanged/compatible;
- no safety/target rule requires full regeneration;
- artifact identity/receipt remains valid.

Otherwise mark `REGENERATE_REQUIRED`, `REVALIDATE_REQUIRED` or `REVIEW`.

## 12. Existing-component binding boundary

A binding maps one normalized source component contract to an existing target-owned component.

It can record:

- binding ID/version;
- target adapter/profile;
- package/module/import path;
- exported component identifier;
- source component identity/signature;
- prop mapping;
- variant mapping;
- slot/children mapping;
- asset/token ownership;
- style ownership;
- required providers/context;
- supported version range;
- validation fixture/hash;
- fallback policy.

Binding does not copy or execute the external component implementation inside the Figma plugin.

## 13. Binding signature

A source binding signature should be derived from normalized component contract rather than source node ID alone.

Potential signature inputs:

- component set identity/provenance;
- variant/property definitions;
- child/slot structure;
- supported semantic role;
- required interaction/state contract;
- accepted target props.

Node ID can help provenance but is not enough for long-lived matching across duplicates/files.

## 14. Binding validation

Before use:

- source signature compatible;
- target adapter/profile compatible;
- required props/variants mapped;
- required slots/children representable;
- target import/module identifier valid for selected project profile;
- required token/asset/provider dependencies known;
- fixture/static validation accepted;
- binding not stale/revoked.

Failed binding validation never silently falls back to an unrelated component.

## 15. White-label boundary

White-label profile can configure:

- logo/reference asset;
- organization/client display name;
- report typography/theme tokens;
- contact/footer text;
- cover/header structure;
- optional custom domain/link labels in connected future surfaces.

Mandatory evidence status, limitations, standards wording and safety disclaimers cannot be hidden or rewritten into stronger claims.

## 16. History boundary

Project history should retain immutable records for:

- source/baseline snapshots;
- exports/builds;
- target adapter/profile versions;
- bindings used;
- asset/token package versions;
- QA receipts;
- P21 handoff reports;
- P22 estimates;
- accepted limitations/approvals where available.

Initial P23 can store/export local history manifests; cloud collaboration/storage is a separate future capability.

## 17. Security/privacy boundary

Project presets/history may contain client names/content and should remain local/offline by default under the existing product trust boundary.

Forbidden in deterministic project config:

- API tokens;
- OAuth refresh/access tokens;
- passwords;
- SSH keys;
- cloud credentials;
- production database connection strings;
- arbitrary script snippets intended for execution.

Future connected storage/sync requires explicit user action and separate privacy/auth contracts.

## 18. R0 refresh triggers

Refresh before implementation if:

- upstream P13-P22 evidence schemas change materially;
- P18 adapter SDK/binding surface changes materially;
- external codebase component discovery/sync is added;
- cloud/team collaboration/history sync is added;
- arbitrary custom rules or scripting is proposed;
- organization entitlements/roles from P25 constrain project capabilities;
- P24 data/CMS bindings require new dependency-graph semantics;
- repository/VCS integrations are added.

## 19. Non-authorizing statement

This snapshot is planning evidence only. It does not advance P12, authorize P23 implementation, permit arbitrary rule execution, or establish cloud/team collaboration behavior.