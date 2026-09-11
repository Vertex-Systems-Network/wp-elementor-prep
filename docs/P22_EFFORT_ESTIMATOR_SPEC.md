# P22 Deterministic Complexity / Effort Estimator + Proposal Inputs — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; accepted P13-P21 evidence contracts; selected target adapter/profile where target-specific factors are used  
R0 source snapshot: `docs/R0_EFFORT_ESTIMATOR_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P22 converts accepted source/target/handoff evidence into a deterministic, explainable project-complexity and effort estimate.

The estimator should help users answer:

- how much implementation work is represented by this design/scope;
- which factors contribute most;
- how much work is reusable vs unique;
- which unknowns widen the estimate;
- what QA/review burden remains;
- how the result changes for another target/profile;
- what assumptions/exclusions should appear in a proposal;
- how a user-defined commercial model maps technical effort to price.

P22 does not predict market rates, client willingness to pay, delivery guarantees or commercial outcomes.

## 2. Canonical flow

`Select source/project scope -> Select target/profile -> Validate upstream evidence -> Build normalized factor vector -> Apply versioned coefficient model -> Apply reuse/dedup rules -> Apply uncertainty scenarios -> Calculate effort units -> Optional calibrated hours -> Optional user-defined price model -> Generate proposal inputs + machine receipt`

No estimate is authoritative if required evidence is stale or insufficient for the selected profile.

## 3. Estimator identity

Suggested shape:

```ts
interface EstimateIdentityV1 {
  schemaVersion: 1;
  estimatorVersion: number;
  coefficientSetId: string;
  coefficientSetVersion: number;
  sourceSnapshotHash: string;
  projectScopeHash: string;
  targetProfileHash?: string;
  upstreamEvidenceHashes: string[];
  calibrationProfileId?: string;
  commercialProfileId?: string;
}
```

Changing source scope, target profile, coefficient set, calibration or commercial profile makes downstream estimate output stale.

## 4. Estimate output model

Suggested root:

```ts
interface EffortEstimateV1 {
  identity: EstimateIdentityV1;
  complexityBand: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | "UNKNOWN";
  confidence: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT_EVIDENCE";
  effortUnits: {
    low: number;
    reference: number;
    high: number;
  };
  hours?: {
    low: number;
    reference: number;
    high: number;
    conversionSource: "CALIBRATED" | "USER_DECLARED";
  };
  factors: EstimateFactorResult[];
  assumptions: EstimateAssumption[];
  exclusions: EstimateExclusion[];
  risks: EstimateRisk[];
  proposalInputs?: ProposalInputV1;
  pricing?: PricingOutputV1;
}
```

No default `hours` field is emitted until a valid conversion source exists.

## 5. Neutral effort units

`EFFORT_UNITS` are the canonical technical estimate quantity.

Properties:

- dimensionless relative workload measure;
- deterministic for identical evidence/profile/model versions;
- comparable within the same coefficient model family;
- not a universal hour;
- not a universal monetary value;
- can be calibrated per team/workflow later.

A UI must not label effort units as hours/minutes unless a calibrated/user-declared conversion is active.

## 6. Factor record

Suggested shape:

```ts
interface EstimateFactorResult {
  factorId: string;
  factorVersion: number;
  family: string;
  source: "OBSERVED" | "DERIVED" | "USER_DECLARED" | "UNKNOWN";
  quantity: number;
  unit: string;
  baseCoefficient: number;
  reuseAdjustment?: number;
  targetAdjustment?: number;
  uncertaintyAdjustmentLow?: number;
  uncertaintyAdjustmentHigh?: number;
  contribution: {
    low: number;
    reference: number;
    high: number;
  };
  evidenceRefs: string[];
  notes?: string[];
}
```

Every contribution is inspectable. Hidden weights are forbidden.

## 7. Factor families

Initial families:

- `SCOPE_PAGES`;
- `SCOPE_SECTIONS`;
- `UNIQUE_STRUCTURE`;
- `REUSE_COMPONENTS`;
- `LAYOUT_DEBT`;
- `RESPONSIVE`;
- `TARGET_ADAPTER`;
- `INTERACTIONS`;
- `FORMS`;
- `ROUTING`;
- `CMS_DYNAMIC`;
- `ASSETS_MEDIA`;
- `TOKENS_DESIGN_SYSTEM`;
- `FONTS`;
- `TARGET_FALLBACKS`;
- `QA_RENDER`;
- `QA_INTERACTION`;
- `ACCESSIBILITY_REMEDIATION`;
- `SEO_REMEDIATION`;
- `MANUAL_REVIEW`;
- `INTEGRATIONS`;
- `UNKNOWN_SCOPE`.

A factor family does not have to be enabled for every target/profile.

## 8. Pages and sections

Raw page/frame count is not enough by itself.

P22 should distinguish:

- unique page layouts;
- repeated pages/templates;
- unique sections;
- repeated section instances;
- site-wide shared structures;
- target-native layouts reused across routes.

A repeated card/section instance contributes less than the first unique implementation after accepted reuse evidence exists.

## 9. Unique vs repeated structures

Suggested structural classes:

- `UNIQUE_IMPLEMENTATION`;
- `REUSED_IDENTICAL`;
- `REUSED_VARIANT`;
- `BOUND_EXISTING_COMPONENT`;
- `REPEATED_WITH_DATA_ONLY`;
- `UNKNOWN_REUSE`.

Only accepted component/repetition evidence can trigger reuse reductions. Visual similarity alone with low confidence should not silently discount effort.

## 10. Reuse discount model

Reuse is modeled explicitly rather than by subtracting arbitrary percentages at project total level.

Conceptually:

`contribution = firstImplementationCost + repeatedInstanceCount × repeatedInstanceCoefficient`

Rules:

- first implementation retains full relevant work;
- repeated identical instances use a lower configured coefficient;
- variants add prop/state/QA burden;
- existing accepted code/component bindings can reduce generation work but may retain integration/QA work;
- unknown reuse produces no aggressive discount.

## 11. Layout debt factor

P13/P14 evidence can contribute layout debt such as:

- manual container burden;
- absolute positioning dependencies;
- fragmented structures;
- unclear grouping;
- text sizing/auto-height risks;
- fixed widths/heights that require target preparation;
- unsupported overlay behavior;
- repeated but inconsistent structures.

If P14 Prepared Duplicate resolves a problem and validation passes, unresolved effort should decrease accordingly. Historical repair work can still appear in a retrospective estimate profile if requested.

## 12. Responsive burden

Responsive effort uses P13 source evidence and target-profile requirements.

Potential inputs:

- known breakpoint variants;
- responsive-risk finding count/severity;
- dense horizontal groups;
- fixed sizing risks;
- overflow/carousel behavior;
- unknown mobile/tablet composition;
- target-specific responsive setting burden;
- required P20 viewport matrix.

Missing responsive source evidence widens the high scenario rather than generating invented responsive design work as a precise quantity.

## 13. Target adapter factor

Each target adapter/profile may define a transparent effort profile.

Examples:

- static HTML/CSS;
- Elementor container template;
- Gutenberg core blocks;
- React component;
- Next.js project;
- Nuxt/SvelteKit/Astro/Angular project;
- code-to-design reconstruction.

Target adjustments may account for:

- native mapping coverage;
- scaffold/build requirements;
- import validation requirements;
- target-specific QA;
- required dependency/toolchain work;
- unsupported/fallback paths.

Target coefficient sets are versioned and must not encode hidden commercial pricing.

## 14. Interaction factor

Interactions come from accepted recipes/configuration.

Potential categories:

- disclosure/accordion;
- tabs;
- carousel;
- menu toggle;
- modal/dialog;
- form validation behavior;
- custom interaction not covered by accepted recipe.

Each interaction factor can include:

- implementation unit;
- state/variant count;
- keyboard/accessibility requirements;
- viewport/state QA burden;
- target adapter translation burden.

Repeated use of the same accepted interaction recipe can reuse implementation but still add per-instance QA/setup work where relevant.

## 15. Forms

Form effort is explicit and should not be inferred merely because input-like rectangles exist visually.

Declared/observed factors may include:

- field count/type;
- validation rules;
- conditional fields;
- file upload;
- consent/checkbox groups;
- submit behavior;
- integration target;
- spam protection;
- success/error states;
- accessibility/manual review.

Unknown backend/submission behavior becomes assumption/risk.

## 16. Routing factor

Routing uses P18 route plans or explicit declarations.

Inputs:

- route count;
- nested/shared layouts;
- dynamic segments;
- redirects/aliases if configured;
- 404/not-found/custom states;
- route-level loading/error boundaries only if selected profile includes them.

Frame names alone do not become production routes automatically.

## 17. CMS/dynamic factor

CMS/dynamic effort is counted only when explicitly configured through P24/project declarations.

Potential inputs:

- content type count;
- taxonomy/relationship count;
- query/list/detail templates;
- dynamic fields;
- filters/search;
- pagination;
- user-specific/authenticated content;
- CMS/provider integration;
- migration/content-entry scope.

Before P24 acceptance, undeclared dynamic scope remains an unknown/risk rather than a guessed factor.

## 18. Asset/media factor

Consumes P19 data such as:

- unique raster/vector asset count;
- derivative/responsive variant needs;
- large media count;
- video/animation presence;
- missing/external assets;
- asset optimization requirements;
- icon/logo conversion/export burden.

Duplicate assets should not be charged repeatedly after content-hash deduplication.

## 19. Font/token/design-system factor

Potential inputs:

- source variable/token count by family;
- modes;
- unresolved aliases;
- target token mapping coverage;
- existing target design-system binding coverage;
- custom font family/weight count;
- missing/font-package setup;
- token migration/remediation needs.

Large raw token count alone should not create linear effort if the target mapping is automated/native and verified.

## 20. Fallback/unsupported factor

Target compatibility evidence may classify source features as:

- native;
- native with review;
- generated recipe;
- fallback;
- custom implementation required;
- unsupported;
- unknown.

Custom/fallback work contributes only when the project intends to implement it. If the item is explicitly excluded from scope, move it to exclusions instead of charging implementation effort.

## 21. QA factor

QA must be visible in estimates rather than treated as free overhead.

Potential inputs:

- target artifact validation;
- import/editor validation;
- browser/build validation;
- P20 viewport count;
- interaction state/scenario count;
- visual comparison runs;
- target-specific environment count;
- regression rerun requirements;
- manual inspection steps.

A project with the same generated code but a stronger QA profile can legitimately have higher effort.

## 22. Accessibility/SEO remediation factor

P21 findings can create implementation/review work when included in scope.

Rules:

- only unresolved findings marked actionable/in-scope contribute;
- severity does not directly equal hours;
- specific rule family/owner/remediation class maps to a coefficient;
- manual-review items add review burden, not assumed automatic fix work;
- legal/compliance certification is outside the default estimator.

## 23. Manual-review factor

Manual-review categories can include:

- ambiguous target mapping;
- content/alt-text judgment;
- responsive design decision;
- custom interaction behavior;
- accessibility review;
- SEO content strategy;
- client decision/approval;
- third-party integration uncertainty.

Manual review contributes effort only if it is in project scope. External waiting time is not automatically treated as labor time.

## 24. Unknown-scope factor

Unknowns are explicit records, not hidden multipliers.

Example:

```ts
interface EstimateUnknownV1 {
  unknownId: string;
  category: string;
  descriptionKey: string;
  affectedFactors: string[];
  highScenarioUnits: number;
  resolutionInputRequired: string;
  status: "OPEN" | "RESOLVED" | "EXCLUDED";
}
```

Unknowns generally affect high-scenario effort and confidence.

## 25. Double-count prevention

Each factor definition must declare overlap/exclusivity rules.

Examples:

- one unsupported carousel should not simultaneously receive full custom-widget cost, full generic-interaction cost and full fallback cost unless each represents genuinely separate work;
- asset optimization is not counted again as generic performance remediation when the same task is already represented;
- P14 source preparation and target-specific cleanup should be distinct only where both tasks actually occur.

The factor engine can emit `OVERLAP_REVIEW` when multiple factors claim the same root evidence unexpectedly.

## 26. Work categories

Optional effort-unit breakdown:

- `DISCOVERY_REVIEW`;
- `DESIGN_PREPARATION`;
- `FRONTEND_BUILD`;
- `WORDPRESS_BUILD`;
- `TARGET_INTEGRATION`;
- `DYNAMIC_CMS`;
- `ASSET_TOKEN`;
- `ACCESSIBILITY_SEO`;
- `QA_VALIDATION`;
- `PROJECT_HANDOFF`.

A coefficient contributes to one or more categories in a visible allocation. Categories help later per-role calibration/rates.

## 27. Complexity band

Complexity band is derived from effort units plus structural/risk conditions, not from one raw metric.

Suggested labels:

- `LOW`;
- `MODERATE`;
- `HIGH`;
- `VERY_HIGH`;
- `UNKNOWN`.

Thresholds are model-version data and require calibration. Until calibrated, the UI may show relative effort and factor composition without production-authoritative band labels.

## 28. Confidence calculation

Confidence should decrease when meaningful scope is unknown.

Potential scored dimensions:

- source completeness;
- target selection completeness;
- responsive evidence;
- interaction evidence;
- route/page evidence;
- assets/fonts closure;
- CMS/data declarations;
- unsupported mapping resolution;
- P20 QA evidence;
- manual-review unresolved rate.

Hard gates can force `INSUFFICIENT_EVIDENCE`, such as no source scope or no selected target for a target-specific estimate.

## 29. Scenario range calculation

Initial deterministic range should be composed factor-by-factor.

For each factor:

- `lowContribution`;
- `referenceContribution`;
- `highContribution`.

Project scenarios sum normalized contributions after overlap/reuse rules.

Avoid one global “+30% contingency” unless it is an explicit user-defined commercial/risk rule. Uncertainty belongs where the uncertainty actually exists.

## 30. Hours conversion

Hours output is optional.

Allowed conversion sources:

### Calibrated

A retained team/profile calibration maps work-category effort units to hours.

Example conceptual model:

`hours(category) = effortUnits(category) × hoursPerUnit(category)`

### User-declared

The user explicitly supplies a conversion rate for planning.

The receipt labels it `USER_DECLARED`, not “calibrated.”

No built-in universal conversion is assumed.

## 31. Calibration profile

Suggested shape:

```ts
interface EffortCalibrationProfileV1 {
  profileId: string;
  version: number;
  estimatorVersion: number;
  hoursPerUnitByCategory: Record<string, number>;
  evidenceProjectIds: string[];
  sampleCount: number;
  validFrom: string;
  notes: string[];
}
```

Statistical fields can be added later if a real calibration methodology supports them.

## 32. Calibration data hygiene

Actual effort records can be noisy.

Calibration inclusion should account for:

- interruptions unrelated to project scope;
- rework caused by changed requirements;
- learning/training work;
- meetings/project-management scope;
- environment outages;
- untracked subcontractor work;
- scope creep;
- incomplete time tracking.

Projects with unreliable actuals may be retained for history but excluded from coefficient fitting.

## 33. Model update governance

A coefficient/model update requires:

- version bump;
- change rationale;
- calibration dataset identity;
- before/after fixture estimates;
- regression thresholds;
- no unreviewed silent coefficient mutation;
- migration/compatibility handling for saved estimate profiles.

Old estimates remain reproducible using their recorded model version.

## 34. Pricing model

Pricing is optional and downstream of effort.

Suggested commercial profile:

```ts
interface CommercialProfileV1 {
  profileId: string;
  version: number;
  currency: string;
  mode: "EFFORT_UNIT" | "HOURLY_BY_CATEGORY" | "BLENDED_HOURLY" | "FIXED_BASE_PLUS_EFFORT";
  rates: Record<string, number>;
  minimumFee?: number;
  contingencyPercent?: number;
  rushPercent?: number;
  discountRules?: CommercialAdjustment[];
  taxRules?: CommercialAdjustment[];
}
```

Every value is user/project supplied or explicitly configured by the organization.

## 35. Pricing safeguards

Default estimator must not:

- infer client budget;
- change price based on nationality/location/protected characteristics;
- use hidden willingness-to-pay scoring;
- scrape competitor quotes silently;
- use funding/revenue as a hidden multiplier;
- increase price because the brand looks premium;
- present market-rate claims without a separately accepted external research source.

## 36. Currency boundary

P22 pricing does not need live FX in the deterministic core.

If the user defines rates in one currency, output remains in that currency unless a separately accepted current FX conversion capability is used at proposal time.

Stored estimator receipts should retain original pricing currency/rules rather than silently recalculate historical proposals at new exchange rates.

## 37. Proposal input model

Suggested proposal data:

- project/scope label;
- source/page/section counts;
- selected target/profile;
- inclusions;
- exclusions;
- assumptions;
- deliverables;
- estimated effort range;
- confidence;
- work-category breakdown;
- risk/unknown items;
- QA scope;
- accessibility/SEO advisory/remediation scope;
- optional pricing;
- optional milestone suggestions derived from technical phases;
- exact estimate receipt ID/hash.

This is structured proposal input, not automatically contractual prose.

## 38. Assumptions

Every estimate should carry explicit assumptions where relevant.

Examples:

- final copy/assets supplied;
- target WordPress version/profile remains unchanged;
- no custom third-party Elementor widgets;
- no CMS/dynamic data unless declared;
- responsive behavior limited to accepted evidence/profile;
- existing component library binding remains valid;
- third-party API credentials/integration are excluded;
- one QA environment included.

Assumptions are versioned input and affect estimate identity.

## 39. Exclusions

Exclusions can include:

- content writing;
- data migration;
- hosting/deployment;
- custom backend;
- third-party service setup;
- legal accessibility certification;
- public SEO campaign/link building;
- analytics/tag management;
- browser/device support outside selected matrix;
- ongoing maintenance.

Excluded items do not contribute implementation effort unless a separate estimate is requested.

## 40. Risk register

Estimate risks are not identical to technical findings.

Suggested risk fields:

- risk ID;
- trigger/source evidence;
- probability class only if evidence supports it, otherwise `UNKNOWN`;
- effort impact range;
- affected factors;
- mitigation/clarification needed;
- owner;
- resolution status.

Initial P22 may avoid numeric probability and simply use deterministic `LOW/MEDIUM/HIGH/UNKNOWN` uncertainty classification.

## 41. Proposal milestone suggestions

P22 may group effort into technical milestones without assigning calendar dates automatically.

Examples:

- source preparation;
- target build;
- dynamic/integration work;
- asset/design-system work;
- QA/import validation;
- client review/handoff.

Calendar scheduling depends on staffing/availability and belongs to a separate planning layer.

## 42. No duration guarantee

Effort hours are labor estimates, not elapsed delivery duration.

A 40-hour estimate does not mean “5 days” unless staffing, workday, dependencies and availability are explicitly configured.

P22 should avoid automatic date promises.

## 43. Estimation profiles

Organizations may later define profiles such as:

- freelancer web build;
- WordPress agency;
- front-end product team;
- migration/rebuild;
- audit + handoff only.

A profile specifies coefficient set, enabled factors, calibration mapping and proposal defaults. It does not silently alter source evidence.

## 44. Comparison mode

P22 should support comparing target options using the same source scope.

Example:

- Elementor vs Gutenberg;
- static HTML vs Next.js;
- React component export vs full project scaffold.

Comparison output should show which factors changed, not just two final numbers.

Each estimate uses its own exact target profile hash.

## 45. What-if mode

A non-authoritative planning mode may let users toggle explicit scope choices such as:

- include/exclude CMS;
- include/exclude accessibility remediation;
- one vs multiple QA environments;
- plain CSS vs Tailwind;
- component-only vs project scaffold.

What-if scenarios are clearly labeled `PLANNING_SCENARIO`, not observed scope.

## 46. Change-only future compatibility

P23 baseline/regeneration will need delta estimates.

P22 factor identities should support:

- unchanged factor reuse;
- new/removed pages/sections/components;
- changed target mapping;
- changed asset/token burden;
- QA scope for changed areas plus regression overhead.

Do not design P22 so estimates can only be recomputed as one opaque total.

## 47. Estimate receipt

Machine receipt should include:

- identity/model versions;
- full factor vector;
- coefficient values;
- overlap/reuse decisions;
- low/reference/high contributions;
- confidence calculation evidence;
- assumptions/exclusions;
- calibration source;
- optional commercial rules;
- final effort/pricing outputs;
- generation hash.

This makes an estimate independently explainable.

## 48. Human explanation

User-facing explanation should answer:

- “Why is this estimate high?”
- “What can reduce it?”
- “What is unknown?”
- “Which work is repeated/reusable?”
- “Which target choice changes effort?”
- “How confident is this?”

Explanation is generated from deterministic factor summaries. Future AI can rephrase, not alter numbers/evidence.

## 49. Atomicity

Estimate calculation is pure/read-only over immutable inputs.

Final estimate is committed only after:

- evidence validation;
- factor overlap validation;
- coefficient/profile validation;
- scenario calculation;
- optional hours/pricing rule validation;
- receipt validation.

No partial invalid estimate receives an authoritative status.

## 50. Job state machine

`IDLE -> SCOPE_READY -> EVIDENCE_VALIDATING -> FACTOR_EXTRACTION -> OVERLAP_RESOLUTION -> MODEL_APPLYING -> SCENARIO_CALCULATION -> CONFIDENCE_CALCULATION -> HOURS_CONVERSION? -> PRICING? -> PROPOSAL_INPUTS -> VALIDATING -> COMPLETE`

Terminal/interrupt states:

- `CANCELLED`;
- `STALE`;
- `INSUFFICIENT_EVIDENCE`;
- `MODEL_INVALID`;
- `OVERLAP_CONFLICT`;
- `CALIBRATION_INVALID`;
- `COMMERCIAL_PROFILE_INVALID`;
- `VALIDATION_FAILED`.

## 51. Determinism

For identical evidence, model, profiles and assumptions:

- factor extraction/order is stable;
- contributions are stable;
- estimate scenarios are stable;
- confidence result is stable;
- optional hours/pricing are stable;
- proposal-input serialization is stable.

Timestamps are metadata and excluded from estimate identity/hash where possible.

## 52. Test matrix

### Scope/reuse

- one-page unique site;
- multi-page repeated layout;
- repeated card/section variants;
- existing-component binding;
- ambiguous reuse.

### Target

- Elementor;
- Gutenberg;
- static HTML;
- framework component;
- full project scaffold;
- unsupported/fallback-heavy target.

### Responsive/interaction

- low responsive risk;
- missing responsive evidence;
- carousel/modal/tabs;
- repeated interaction recipe;
- custom/unknown interaction.

### Dynamic/forms

- static site;
- simple form;
- explicit CMS scope;
- undeclared dynamic behavior;
- custom integration declaration.

### Assets/tokens

- asset-light;
- media-heavy;
- tokenized design system;
- missing fonts/assets;
- duplicate asset deduplication.

### QA/advisory

- minimal QA;
- multi-viewport P20 QA;
- manual accessibility/SEO review;
- remediation included/excluded.

### Model behavior

- overlap prevention;
- low/reference/high calculation;
- confidence downgrade;
- insufficient-evidence block;
- calibrated hours;
- user-declared hours;
- invalid calibration;
- deterministic rerun;
- target comparison.

### Pricing

- effort-unit rate;
- category hourly rates;
- minimum fee;
- explicit contingency/rush;
- invalid/negative rate rejection;
- currency preservation.

## 53. Calibration acceptance

Before production hours are enabled from a built-in calibrated profile:

- multiple completed projects exist for relevant target/workflow classes;
- actual effort records are reviewed for scope noise;
- coefficient fitting method is documented;
- holdout/regression fixtures are evaluated;
- bias/systematic under/over-estimation is reviewed;
- coefficient set is versioned;
- previous estimates remain reproducible.

Without sufficient calibration, ship effort units/ranges and allow only explicit user-declared hour conversion.

## 54. Production acceptance

P22 production acceptance requires evidence that:

- factor extraction matches source/target/handoff evidence;
- double-count controls work;
- reuse discounts behave as specified;
- unknowns widen range/confidence rather than disappearing;
- target comparisons are explainable;
- estimate receipts are reproducible;
- no default hidden market pricing exists;
- optional commercial calculations exactly follow user-defined rules;
- proposal inputs reconcile to the estimate receipt;
- stale evidence/profile changes invalidate prior authority;
- at least several materially different real project fixtures are tested.

## 55. Non-goals for first implementation

Not first-slice guarantees:

- universal project-hour accuracy;
- delivery-date scheduling;
- staffing/resource allocation;
- live market-rate scraping;
- competitor price prediction;
- value-based pricing automation;
- revenue-based price optimization;
- probabilistic Monte Carlo forecasting;
- automatic contract/legal terms;
- invoice/payment processing;
- sales CRM integration;
- AI authority over coefficients/estimates.

## 56. P23 handoff

P23 agency/project capabilities can add:

- organization coefficient/calibration profiles;
- client/project estimator presets;
- baseline vs revision estimates;
- change-only estimates;
- role-specific rates;
- white-label proposal presentation;
- estimate history/approval;
- existing-component binding impacts;
- project-specific standards/rules.

P22 keeps the core estimator organization-neutral and deterministic.

## 57. Implementation-opening checklist

Before P22 runtime implementation opens:

- [ ] P12 internal release exit complete;
- [ ] required upstream P13-P21 evidence schemas implemented/accepted;
- [ ] R0 estimator snapshot refreshed;
- [ ] effort-unit model v1 frozen;
- [ ] factor catalog/overlap rules frozen;
- [ ] initial coefficient set defined as planning-only/calibrated as appropriate;
- [ ] confidence model frozen;
- [ ] scenario range model frozen;
- [ ] no built-in hours enabled without calibration;
- [ ] commercial profile schema/rules frozen if pricing ships in the slice;
- [ ] estimator receipt schema frozen;
- [ ] real fixture/calibration campaign prepared;
- [ ] regression rules for coefficient changes frozen.

Until those gates pass, this document remains planning-only and must not be used to claim P22 implementation or universal estimate accuracy.