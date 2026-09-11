# P25 Commercial Packaging / Entitlements — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; accepted P13-P24 neutral capability contracts  
R0 source snapshot: `docs/R0_COMMERCIAL_ENTITLEMENT_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P25 defines commercial packaging and entitlement enforcement without contaminating the deterministic product core with plan-name branches or weakening evidence/safety behavior.

Initial business-facing package names may be:

- Free;
- Pro;
- Agency.

But domain code uses neutral capability IDs and entitlement decisions. Product packaging can therefore evolve without rewriting audit/export/project schemas.

## 2. Canonical access flow

`User requests action -> resolve capability ID + action scope -> obtain entitlement snapshot from selected provider -> validate provider/snapshot freshness -> evaluate grants/limits -> allow/deny action -> run unchanged deterministic capability -> record entitlement decision metadata separately from feature evidence`

Entitlement does not change the capability's technical result.

## 3. Capability registry

Suggested shape:

```ts
interface CapabilityDescriptorV1 {
  capabilityId: string;
  version: number;
  family: string;
  titleKey: string;
  actionType: "READ" | "WRITE" | "EXPORT" | "CONNECTED";
  requiredSafetyCapabilities: string[];
  meter?: CapabilityMeterDefinition;
  dependencies?: string[];
}
```

Capability IDs are stable machine identifiers. User-facing plan names/pricing are not capability IDs.

## 4. Initial capability families

Potential neutral families:

- audit/scoring;
- target preparation;
- target exports;
- framework exports;
- assets/tokens;
- round-trip QA;
- handoff/advisories;
- estimator/proposal inputs;
- project baselines/history;
- change-only regeneration;
- component bindings;
- white-label reports;
- CMS/dynamic/forms;
- connected verification/services;
- optional AI assistance in P26.

## 5. Capability dependency rules

A granted capability can require other capabilities technically.

Example:

`project.change-only` may require project baseline/history and selected target export capability.

Entitlement resolver should distinguish:

- commercial grant missing;
- technical dependency unavailable;
- target/provider unsupported;
- feature blocked by P12/implementation state.

Do not show “upgrade required” when the true reason is unsupported target/evidence failure.

## 6. Package profile

Suggested commercial packaging profile:

```ts
interface PackageProfileV1 {
  packageId: string;
  version: number;
  displayName: string;
  grants: CapabilityGrantV1[];
  limits: CapabilityLimitV1[];
  trialPolicyRef?: string;
  providerCompatibility: string[];
}
```

Package profiles are commercial configuration, not embedded in historical technical receipts except by reference to the entitlement decision used at action time.

## 7. Suggested initial package boundaries

Subject to later commercial validation, a planning baseline may be:

### Free

- selected-frame/basic audit;
- bounded Build-Ready summary;
- limited report;
- limited static/web preview/export;
- bounded asset export;
- safety/validation required for any available action.

### Pro

- full Target-Ready analysis;
- target-ready duplicate preparation;
- Elementor/Gutenberg exports when accepted;
- web/framework exports when accepted;
- full asset/design-system pack;
- P20 round-trip QA;
- full P21 handoff/advisories;
- P22 estimator;
- individual project history/baseline capability where product strategy selects it;
- P24 dynamic features where supported.

### Agency

- organization/project presets;
- broader project/history limits;
- existing-component binding registries;
- batch/change-only regeneration;
- white-label report profiles;
- organization estimator/calibration/commercial profiles;
- organization rule sets;
- future team/seat/admin capabilities when an accepted provider exists.

These are packaging suggestions, not implementation-complete claims.

## 8. Safety boundary

Commercial tier cannot disable or hide required safety.

Rules:

- mutation rollback/validation stays mandatory;
- unsupported target feature stays unsupported regardless of tier;
- stale evidence stays stale;
- missing runtime/import proof cannot be purchased into VERIFIED status;
- privacy/security restrictions remain mandatory;
- no “Agency override” that bypasses confidence/validation thresholds.

## 9. Feature visibility vs feature execution

UI may show locked capabilities for discoverability, but execution requires an entitlement decision.

Locked feature UI should clearly distinguish:

- not entitled;
- not implemented/accepted;
- unsupported in selected target;
- requires connected provider;
- requires target Pro/add-on capability;
- blocked by missing evidence.

Commercial CTA must not obscure technical blocker reason.

## 10. Entitlement provider interface

Suggested contract:

```ts
interface EntitlementProviderV1 {
  providerId: string;
  providerVersion: number;
  getSnapshot(context: EntitlementContext): Promise<EntitlementSnapshotV1>;
}
```

The resolver consumes a normalized snapshot rather than provider-specific state throughout product logic.

## 11. Entitlement snapshot

Suggested shape:

```ts
interface EntitlementSnapshotV1 {
  schemaVersion: 1;
  providerId: string;
  subjectRef?: string;
  status: "GRANTED" | "DENIED" | "TRIAL" | "EXPIRED" | "UNKNOWN" | "PROVIDER_UNAVAILABLE";
  grants: CapabilityGrantV1[];
  usage?: CapabilityUsageV1[];
  issuedAt?: string;
  expiresAt?: string;
  providerEvidenceRef?: string;
}
```

Avoid storing unnecessary personal information. `subjectRef` may be opaque and provider-scoped.

## 12. Figma Payments provider

Potential provider ID:

`figma-payments`

Requirements before enablement:

- manifest includes documented `payments` permission;
- current Figma Payments API target contract is refreshed/accepted;
- plugin publication/payment model configured through legitimate publisher workflow;
- user payment/trial status mapped to neutral grants;
- checkout occurs only from accepted user-initiated contexts;
- checkout cancellation/failure returns normal entitlement denial/unknown states;
- payment status does not mutate technical evidence.

## 13. Free-core compatibility

If an existing free Community plugin adds paid functionality, the product should preserve meaningful free capabilities consistent with applicable Figma policy/product strategy.

Free users must not lose access to mandatory safety around actions they can still perform.

Existing local project evidence should remain readable after paid gating is introduced.

## 14. Figma purchase/account scope

Native Figma purchase state may be account-scoped.

P25 must not treat one paid user as proof of organization-wide Agency entitlement.

Potential Agency paths are separate:

- individual account Agency package if commercially acceptable;
- future external organization entitlement service;
- enterprise/private distribution contract;
- manually provisioned signed entitlement through a separately accepted administrative workflow.

No approach is selected until account/licensing/product requirements are validated.

## 15. External entitlement provider

Future provider can support web/CLI/organization licensing.

Requirements:

- authenticated service outside deterministic core;
- no secret keys in plugin/source/project data;
- signed/verifiable entitlement response or authenticated runtime channel;
- privacy policy/data minimization;
- availability/offline policy;
- revocation/expiry;
- replay/tamper resistance;
- organization/seat semantics;
- auditability.

The offline capability engine consumes only normalized granted/denied state.

## 16. Server-side Figma purchase verification

If external services need to verify a Figma purchase, Figma's documented Payments REST API can be one provider-side evidence source.

This happens on a secured server, not by embedding server credentials/PAT in the plugin.

The server maps purchase verification to its own entitlement response without exposing credentials to the client.

## 17. Capability grant

Suggested shape:

```ts
interface CapabilityGrantV1 {
  capabilityId: string;
  scope?: EntitlementScope;
  state: "GRANTED" | "DENIED";
  source: "PACKAGE" | "TRIAL" | "ADDON" | "ADMIN";
  validUntil?: string;
}
```

Scopes can later restrict project count, target family or other bounded dimensions without changing capability identity.

## 18. Capability limits

Limits can include:

- export/run count;
- project count;
- history depth;
- page/frame count per project;
- batch size;
- retained QA/report history;
- connected service usage;
- optional AI usage in P26.

Limits must be explicit and deterministic at the entitlement layer.

## 19. Meter definition

Suggested meter:

```ts
interface CapabilityMeterDefinition {
  meterId: string;
  unit: "RUN" | "SUCCESSFUL_EXPORT" | "PAGE" | "PROJECT" | "CREDIT";
  countOn: "START" | "COMMIT" | "SUCCESS";
  rollbackOnFailure: boolean;
}
```

The product should prefer counting successful committed value-producing operations rather than failures when practical.

## 20. Trial policy

Trial policy records:

- provider;
- included capabilities;
- duration/usage limit;
- start authority;
- expiration rule;
- user-facing disclosure;
- post-trial behavior.

Figma-native custom trial behavior must comply with current platform requirements, including resource-description disclosure when applicable.

## 21. Offline behavior

Entitlement provider defines offline/unknown policy.

For premium writes/exports:

- valid cached/signed snapshot may be accepted only if provider contract explicitly supports it and it is unexpired;
- otherwise UNKNOWN/PROVIDER_UNAVAILABLE fails closed for new premium actions.

For local data:

- read existing project/evidence/history;
- inspect previous receipts;
- access free capabilities;
- export portable user-owned project data where product portability policy permits.

## 22. Grace period

A future external entitlement provider may support a bounded signed offline grace period.

Requirements:

- explicit duration;
- signed snapshot/expiry;
- no indefinite cached paid state;
- clock rollback/tamper behavior considered;
- clear user-facing state;
- not applicable to provider capabilities requiring live network anyway.

Initial Figma Payments behavior follows accepted platform state without inventing a separate grace mechanism.

## 23. Entitlement decision

Every gated action produces an ephemeral/retained decision record as appropriate:

- capability ID;
- action scope;
- provider ID/version;
- snapshot status/age;
- granted/denied;
- relevant limit/meter state;
- denial reason code;
- product version.

Do not put purchase/payment details into technical artifact manifests unless required; a simple authorization receipt reference is enough.

## 24. Denial reason codes

Potential reasons:

- `NOT_ENTITLED`;
- `TRIAL_EXPIRED`;
- `USAGE_LIMIT_REACHED`;
- `PROJECT_LIMIT_REACHED`;
- `PROVIDER_UNAVAILABLE`;
- `SNAPSHOT_EXPIRED`;
- `CAPABILITY_NOT_IN_PACKAGE`;
- `DEPENDENCY_NOT_ENTITLED`;
- `PACKAGE_CONFIGURATION_INVALID`.

Technical unsupported/validation errors use different error namespaces.

## 25. Downgrade behavior

On downgrade/expiry:

- block future gated actions;
- preserve project history/evidence;
- preserve prior generated artifact references;
- allow free/read actions;
- surface which features are locked;
- do not downgrade old VERIFIED evidence merely because entitlement expired;
- future regeneration requiring locked capability remains unavailable until entitlement returns or scope changes.

## 26. Upgrade behavior

Upgrade immediately changes available capability grants when provider state is accepted.

It must not automatically execute premium actions or mutate designs/projects.

The user explicitly invokes the now-available action.

## 27. Project portability

Commercial packaging must not make project files unreadable when tier changes.

A lower tier may restrict creating new advanced baselines/bindings/exports while still letting the user inspect/export machine-readable project data according to portability policy.

No destructive data loss as an upsell mechanism.

## 28. Entitlement and P23 projects

P23 project data can declare capability dependencies, but does not own billing.

Examples:

- project contains a binding registry requiring `project.component-bindings`;
- project has white-label profile requiring `project.white-label` to regenerate branded reports;
- existing branded report receipt remains historical if entitlement expires.

## 29. Entitlement and P24 dynamic providers

P24 provider capabilities can be separately entitled:

- core WordPress dynamic mapping;
- forms;
- connected provider validation;
- custom provider SDK.

Entitlement does not grant provider technical compatibility or credentials.

## 30. Entitlement and P26 AI

P26 optional AI capabilities are separate IDs such as:

- `ai.explain-findings`;
- `ai.research-synthesis`;
- `ai.draft-handoff-copy`;
- `ai.draft-remediation`.

AI usage/credits can be metered independently from deterministic Pro/Agency features.

Failure/absence of AI entitlement never disables deterministic evidence/actions the user is otherwise entitled to.

## 31. Package matrix validation

Before release, validate commercial profile:

- every grant references known capability;
- dependencies are satisfiable;
- no lower-tier safety capability missing;
- limits are non-negative/bounded;
- same capability not both granted/denied ambiguously;
- trial policy references known capabilities;
- target/product UI labels reconcile with capability registry;
- unavailable/unimplemented capability cannot be marketed as active.

## 32. Feature maturity state

Commercial availability is separate from implementation maturity.

Each capability can have maturity:

- `PLANNED`;
- `EXPERIMENTAL`;
- `IMPLEMENTED_NOT_ACCEPTED`;
- `PRODUCTION_ACCEPTED`;
- `DEPRECATED`;
- `REMOVED`.

Entitlement grant cannot make PLANNED/UNACCEPTED capability executable in production.

## 33. Release gating

Release builds declare:

- capability registry version;
- package profile version;
- enabled production-accepted capability IDs;
- entitlement provider configuration;
- manifest permissions/network policy.

CI verifies no paid package advertises capabilities compiled/gated off or not production-accepted.

## 34. Manifest/network implications

If Figma Payments is enabled:

- `payments` permission is explicit in manifest;
- Community/release contract tests include it;
- privacy/docs describe payment behavior as needed;
- unrelated network access remains `none` under accepted core architecture unless separately approved.

Adding payment permission does not authorize general fetch/network APIs.

## 35. Privacy

Minimize entitlement personal data.

Core technical receipts should not contain:

- billing address;
- card/payment details;
- sensitive purchase metadata;
- authentication tokens;
- server credentials.

Only store provider-scoped opaque identity/status necessary to explain authorization where required.

## 36. Security

Rules:

- client-side UI lock alone is not entitlement authority for connected expensive/server features;
- server-connected premium endpoints validate entitlement server-side;
- plugin code must not contain backend secrets;
- entitlement responses are validated/tamper-resistant according to provider;
- no user-editable project JSON field can self-grant capability;
- imported project/preset capability refs do not change entitlement.

## 37. Tests

### Capability registry

- known/unknown ID;
- dependency graph;
- maturity gate;
- package profile reconciliation.

### Entitlement states

- granted;
- denied;
- trial;
- expired;
- unknown;
- provider unavailable;
- usage limit reached;
- project/batch limit.

### Data preservation

- downgrade retains project/history;
- prior receipts remain valid;
- locked regeneration blocked without corruption;
- upgrade requires explicit action.

### Figma payments

- manifest permission contract;
- paid/unpaid status mapping fixture;
- checkout cancel/success handling fixture where testable;
- trial usage/time policy;
- no general network permission introduced.

### External provider

- signed/validated snapshot fixture;
- expiry/revocation;
- tampered snapshot rejection;
- server-side authorization for connected endpoint;
- no secrets in client receipt.

### Commercial profiles

- Free meaningful capability set;
- Pro dependencies;
- Agency project capabilities;
- unavailable capability cannot be advertised;
- safety rules equal across tiers for same action.

## 38. Production acceptance

P25 acceptance requires:

- neutral capability registry working independently of plan labels;
- package-profile validation;
- Free/paid action gating without evidence corruption;
- downgrade/upgrade data-preservation behavior;
- entitlement unknown/provider failure behavior;
- usage limit/trial behavior for any shipped meter;
- exact release/manifest permission evidence;
- live Figma payment/publisher evidence if Figma-native payment is shipped;
- secure server-side validation evidence if connected paid services are shipped;
- no safety/validation weakening by tier;
- docs/UI accurately reflect availability and limits.

Commercial launch still requires actual publisher/billing eligibility outside repository planning.

## 39. Non-goals for first implementation

Not first-slice guarantees:

- multi-seat organization billing;
- invoices/tax handling outside platform provider;
- custom billing portal;
- coupons/affiliate system;
- sales CRM;
- complex seat transfer;
- enterprise SSO/RBAC;
- perpetual offline license without a designed provider;
- crypto/license-key obfuscation as security;
- dynamic personalized pricing;
- hidden willingness-to-pay pricing.

## 40. P26 handoff

P26 optional AI uses P25 neutral capabilities/metering for access/cost control while remaining non-authoritative.

Entitlement may control whether AI is available, but deterministic core results remain available according to their own capabilities and cannot be altered by AI access level.

## 41. Implementation-opening checklist

Before P25 runtime implementation opens:

- [ ] P12 internal release exit complete;
- [ ] shipped P13-P24 capability IDs/maturity states frozen;
- [ ] R0 commercial snapshot refreshed;
- [ ] capability registry schema frozen;
- [ ] initial Free/Pro/Agency package profile approved commercially;
- [ ] provider choice validated against publisher eligibility/product distribution;
- [ ] Figma payments manifest/release implications accepted if used;
- [ ] entitlement unknown/offline/downgrade policies frozen;
- [ ] data portability policy frozen;
- [ ] meter/trial semantics frozen if used;
- [ ] connected-service server verification/security contract accepted if used;
- [ ] production acceptance tests named before coding.

Until those gates pass, this specification remains planning-only and must not be used to claim P25 implementation, paid-publisher eligibility or commercial launch readiness.