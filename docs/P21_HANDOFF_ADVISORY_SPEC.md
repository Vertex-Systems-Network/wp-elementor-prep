# P21 Developer Handoff + Client/QA + Accessibility/SEO Advisory — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; accepted P13-P20 evidence contracts; target adapter/profile evidence where target-specific claims are made  
R0 source snapshot: `docs/R0_HANDOFF_ADVISORY_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P21 turns retained audit, preparation, generation and QA evidence into a deterministic handoff/reporting layer for developers, agencies and clients.

It must answer:

- what source was analyzed;
- what target/profile was selected;
- what was changed or prepared;
- what was generated;
- what was actually validated/imported/rendered/tested;
- what remains unsupported or requires manual review;
- what accessibility/SEO/performance advisories are supported by evidence;
- what the product explicitly cannot claim.

P21 does not create a new source of truth. It summarizes and cross-links P13-P20 evidence.

## 2. Output families

Initial report families:

1. `DEVELOPER_HANDOFF`;
2. `CLIENT_QA_SUMMARY`;
3. `ACCESSIBILITY_ADVISORY`;
4. `SEO_ADVISORY`;
5. `COMBINED_HANDOFF_PACKAGE`.

All report families consume the same machine evidence graph and finding IDs. Presentation differs; evidence/status does not.

## 3. Canonical flow

`Select completed audit/export/QA run(s) -> Validate evidence graph -> Resolve source/target identities -> Normalize findings -> Apply report profile -> Generate machine JSON -> Generate human report -> Validate references/claims -> Package -> receipt`

If required upstream evidence is missing/stale/tampered, the report is `INSUFFICIENT_EVIDENCE` rather than silently filling gaps.

## 4. Evidence graph

Suggested conceptual root:

```ts
interface HandoffEvidenceGraphV1 {
  schemaVersion: 1;
  source: SourceEvidenceRef;
  buildReady?: BuildReadyEvidenceRef;
  preparation?: PreparationEvidenceRef;
  targetGeneration?: TargetGenerationEvidenceRef[];
  assets?: AssetManifestRef;
  tokens?: TokenManifestRef;
  qa?: QAEvidenceRef[];
  findings: HandoffFinding[];
  decisions: HandoffDecision[];
  limitations: HandoffLimitation[];
}
```

P21 stores references/hashes to accepted upstream receipts. It should not duplicate entire upstream evidence blobs inside every report unless a self-contained export profile explicitly requests embedded evidence.

## 5. Immutable run identity

Every final report records:

- report schema/profile version;
- P21 engine version;
- source identity/snapshot hash;
- selected target adapter/profile versions;
- upstream evidence hashes;
- report profile/options hash;
- generated machine report hash;
- generated human report hash where applicable;
- package hash.

A report becomes stale if any referenced upstream identity changes.

## 6. Common finding model

Suggested shape:

```ts
interface HandoffFindingV1 {
  id: string;
  family: "BUILD" | "TARGET" | "RESPONSIVE" | "ASSET" | "TOKEN" | "QA" | "ACCESSIBILITY" | "SEO" | "PERFORMANCE" | "HANDOFF";
  ruleId: string;
  ruleVersion: number;
  severity: "BLOCKER" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | "UNKNOWN";
  status: "OPEN" | "RESOLVED" | "ACCEPTED_LIMITATION" | "MANUAL_REVIEW" | "NOT_APPLICABLE" | "UNKNOWN";
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  provenance: EvidenceProvenance[];
  sourceRefs?: SourceReference[];
  targetRefs?: TargetReference[];
  summaryKey: string;
  detailKey: string;
  remediationKey?: string;
  standards?: StandardReference[];
  limitations?: string[];
}
```

User-facing copy is generated from versioned message templates keyed by findings, not free-form hidden logic.

## 7. Stable finding IDs

Finding IDs should remain stable across equivalent re-runs where the same underlying issue persists.

Inputs may include:

- rule ID/version;
- source/target canonical identity;
- property/feature slot;
- normalized occurrence path;
- target adapter/profile when target-specific.

Timestamps and presentation order must not affect IDs.

Stable IDs enable baseline/re-audit comparison in P23.

## 8. Finding lineage

P21 should expose lineage:

- original audit finding;
- P14 preparation proposal/action;
- post-preparation status;
- target mapping consequence;
- P20 QA consequence;
- final handoff status.

Example states:

`manual-layout-risk -> prepared duplicate fix accepted -> Elementor mapping native -> render geometry verified -> RESOLVED`

or

`unsupported overlay -> no safe preparation -> target fallback declined -> visual export blocked -> OPEN/BLOCKER`.

This avoids duplicate disconnected findings for one root problem.

## 9. Claim taxonomy

User-facing claims are categorized:

- `OBSERVED` — directly retained from source/target/runtime evidence;
- `VALIDATED` — deterministic validator passed;
- `DERIVED` — deterministic rule applied to accepted evidence;
- `DECLARED` — user/project stated value not independently observed;
- `ADVISORY` — bounded recommendation;
- `MANUAL_REVIEW_REQUIRED`;
- `UNKNOWN`.

Reports must not render `DERIVED`/`DECLARED` as if directly observed.

## 10. Developer Handoff profile

Developer handoff should be precise and implementation-oriented.

Sections may include:

- source identity/scope;
- target profile/toolchain;
- Build-Ready/Target-Ready state;
- responsive risks;
- prepared-duplicate history;
- generated component/block/widget mapping;
- route/page mapping;
- unsupported/fallback features;
- assets + exact paths/hashes;
- fonts + availability/package status;
- tokens + target mapping;
- interaction recipes;
- build/static validation;
- P20 QA channel results;
- open blockers/review items;
- exact import/build instructions where accepted;
- target-specific limitations;
- machine report reference.

## 11. Client QA Summary profile

Client-facing output should be understandable without hiding uncertainty.

Suggested sections:

- scope reviewed;
- readiness state;
- what was verified;
- what was improved/prepared;
- what remains to review manually;
- major target limitations;
- visual/functional QA summary;
- accessibility/SEO advisory summary with explicit scope;
- final handoff status.

Do not expose raw implementation noise by default, but every summary item maps to underlying finding IDs/evidence.

## 12. Status vocabulary

High-level project/report status:

- `READY_FOR_HANDOFF`;
- `READY_WITH_REVIEW`;
- `BLOCKED`;
- `INSUFFICIENT_EVIDENCE`.

This is separate from adapter-specific readiness and P20 verification labels. The report should show underlying statuses, not collapse them irreversibly.

## 13. Handoff readiness gate

`READY_FOR_HANDOFF` requires at minimum:

- source identity valid;
- selected target/profile identity valid if target-specific report;
- no unresolved P21-configured BLOCKER finding;
- required asset/reference closure for selected profile;
- required upstream validation evidence present;
- report generation/references validated;
- limitations disclosed.

It does not imply production deployment is safe unless the selected report profile explicitly requires deployment/runtime evidence.

## 14. Accessibility advisory architecture

Accessibility advisories are rules over accepted source/target/QA evidence.

Each rule declares:

- rule ID/version;
- evidence requirements;
- applicable target/source types;
- standards reference if valid;
- deterministic check;
- outcomes;
- manual-review boundary;
- severity rationale;
- remediation template;
- known false-positive/negative risks.

Rules that cannot determine an answer from available evidence return `MANUAL_REVIEW` or `INSUFFICIENT_EVIDENCE`.

## 15. WCAG reference boundary

P21 may attach a WCAG 2.2 reference only where the rule meaningfully corresponds to the criterion and the evidence supports that advisory.

Reference shape may include:

- standard: `WCAG`;
- version: `2.2`;
- criterion ID/title;
- level;
- relation: `DIRECT_CHECK`, `PARTIAL_EVIDENCE`, `RELATED_ADVISORY`.

A `PARTIAL_EVIDENCE` result cannot be presented as criterion conformance.

## 16. Initial accessibility rule families

Candidate deterministic rules:

### Text alternatives

- image has explicit/user-supplied alt metadata;
- image confirmed decorative;
- image missing alt state;
- ambiguous visual requires manual content judgment.

### Accessible names

- generated/observed interactive control has non-empty accessible name;
- visible label and accessible name relationship where observable;
- generic/duplicate control name advisory within bounded scope;
- source-only icon control without target semantics -> manual review.

### Headings

- generated target heading levels extracted;
- missing page-level heading advisory where selected profile expects one;
- hierarchy jumps/structure advisory;
- visual text that was never semantically mapped remains target-compatibility/semantic issue rather than auto-heading inference.

### Landmarks

- expected target document landmarks present where profile requires them;
- duplicated unnamed navigation/region advisory when observable;
- visual Figma sections alone do not imply landmarks.

### Forms

- explicit label/access-name presence;
- required state only if target markup/data proves it;
- errors/instructions/autocomplete purpose generally require target/runtime/manual evidence.

### Contrast

- deterministic solid foreground/background ratio where both values are resolved;
- ambiguous layered/gradient/video cases -> manual review.

### Target size

- rendered interactive bounding box checked against selected WCAG-related rule only when zoom/device/exception interpretation can be bounded;
- edge cases/exceptions remain review.

### Focus/keyboard

- P20 interaction recipe evidence for focusable controls;
- focus style/obscuration only from actual target-state capture/DOM evidence;
- no source-design-only PASS.

## 17. Contrast result model

A contrast check should record:

- foreground resolved color/value/provenance;
- background resolved color/value/provenance;
- text size/weight classification where needed;
- computed ratio;
- applicable threshold/rule version;
- state/mode;
- confidence;
- ambiguity flags.

If blend/transparency/background image makes the effective color unresolved, the ratio is omitted rather than guessed.

## 18. SEO advisory architecture

SEO rules are target/project evidence rules, not rankings predictions.

Each rule declares:

- required metadata/DOM/project evidence;
- bounded corpus scope;
- Google/general web guidance relation;
- deterministic outcome;
- severity dimension;
- remediation template;
- what the rule does not prove.

## 19. Initial SEO rule families

### Document title

Check:

- present;
- non-empty;
- duplicate within supplied multi-page project scope;
- placeholder-looking values through deterministic placeholder rules.

Do not claim keyword optimization quality without user/content strategy input.

### Meta description

Check:

- present/empty;
- duplicate within project scope;
- placeholder status.

Do not call a description “ranking optimized” automatically.

### Heading/content structure

Check generated semantic heading structure for usability/semantic quality. Google-specific presentation must avoid claiming heading order directly controls ranking.

### Links

Check:

- href present/resolved where target artifact knows it;
- accessible/descriptive link text heuristics using bounded deterministic patterns;
- repeated generic text advisory (`click here`, etc.) only as a configurable heuristic;
- broken external URL status is outside static offline P21 unless supplied by a later network/site checker.

### Images

Reuse explicit alt/decorative state evidence. Do not AI-invent alt text silently.

### Canonical/robots

Only report values when actual generated/target metadata exists. Presence is not correctness without declared site routing/index strategy.

### Structured data

Only validate when JSON-LD/microdata/RDFa actually exists in target output and a separate accepted schema validator/profile is available. P21 does not fabricate schema types from visual cards.

## 20. Bounded duplicate-content analysis

P21 may compare content inside the supplied project corpus using deterministic normalized hashes/similarity rules.

Results mean only “duplicate/near-duplicate within supplied corpus.”

It cannot claim uniqueness across the public internet without a separately accepted network/search capability.

## 21. Performance advisory architecture

Performance advisories may consume:

- P19 asset sizes/dimensions/derivative data;
- P17/P18 generated-client boundary/hydration data;
- build artifact metadata;
- P20 runtime measurements only when explicitly measured.

Initial static advisories:

- oversized asset relative to rendered use;
- duplicate packaged bytes;
- unusually large single media asset based on configurable project thresholds;
- missing optimized/responsive variant where selected target profile expects one;
- excessive client/hydrated component coverage based on explicit selected framework policy;
- multiple full font binaries/weights where package evidence exists.

Do not label static estimates as Core Web Vitals.

## 22. Remediation model

Every actionable finding may include structured remediation:

- `actionType`;
- affected source/target ref;
- recommended owner (`DESIGN`, `CONTENT`, `DEVELOPMENT`, `SEO`, `ACCESSIBILITY`, `CLIENT_DECISION`);
- deterministic instruction template;
- whether Safe Fix/P14 recipe exists;
- whether target regeneration is required;
- whether manual content decision is required;
- validation step after remediation.

P21 does not execute fixes merely because a report recommends them.

## 23. Owner assignment

Suggested owner classes:

- `DESIGNER`;
- `DEVELOPER`;
- `CONTENT_OWNER`;
- `SEO_OWNER`;
- `ACCESSIBILITY_REVIEWER`;
- `CLIENT_DECISION`;
- `PLATFORM_ADMIN`;
- `UNKNOWN`.

Owner assignment is deterministic from rule/category unless user/project overrides it. It does not automatically create tasks in external systems in P21.

## 24. Findings table sorting

Default deterministic order:

1. BLOCKER;
2. HIGH;
3. MEDIUM;
4. LOW;
5. INFO;
6. UNKNOWN;

Then family, source order, rule ID, stable finding ID.

Client profile may group findings differently, but machine order remains stable.

## 25. Resolved history

Reports can optionally include resolved findings to show preparation/QA history.

Resolved records must preserve:

- original finding identity;
- resolution mechanism;
- resolving upstream evidence/receipt;
- validation evidence;
- final status.

Do not simply delete evidence of previously repaired issues from audit history.

## 26. Accepted limitations

User/project may explicitly accept a limitation after being shown impact.

Record:

- finding ID;
- limitation reason;
- accepting actor identity only through available local/project context, never fabricated;
- timestamp/receipt metadata;
- affected channels;
- whether export/handoff is allowed despite it.

Accepted limitation != resolved issue.

## 27. Manual-review checklist

P21 should generate a bounded manual-review checklist from rules that automated evidence cannot settle.

Possible categories:

- content accuracy/meaning;
- alt-text quality/context;
- reading order with assistive technology;
- keyboard experience beyond accepted recipes;
- screen-reader announcement quality;
- cognitive/usability concerns;
- legal/regulatory applicability;
- SEO content/intent strategy;
- real site crawl/index behavior;
- privacy/cookie/consent policy;
- dynamic error/help behavior.

Manual-review items remain linked to source/target context where possible.

## 28. White-label boundary

Full agency white-label controls belong to P23. P21 should separate report content from branding so P23 can safely provide:

- logo/name/theme;
- report header/footer;
- client/project labels;
- optional contact block.

Branding cannot alter evidence, status, standard references or limitations.

## 29. Machine-readable output

Initial canonical machine format:

`handoff-report.v1.json`

Contents include:

- identities;
- evidence refs/hashes;
- summary states;
- findings;
- standards references;
- manual review;
- limitations;
- resolved history;
- report generation receipt.

JSON schema validation is required before final packaging.

## 30. Human-readable output

Initial human output can be deterministic HTML and/or Markdown generated from the same machine model.

Potential later PDF export must follow the PDF artifact pipeline separately and should not become the source-of-truth format.

Requirements:

- accessible semantic report structure;
- finding IDs visible/copyable;
- clear verified vs advisory vs manual-review labels;
- no hidden evidence claims;
- printable layout;
- links/references only where profile allows them.

## 31. Localization boundary

P21 should separate rule/message keys from evidence data so future translations do not mutate findings.

Localization rules:

- machine enums/IDs remain language-independent;
- translated user-facing summaries/remediation preserve meaning;
- standards names/criterion identifiers remain canonical;
- translation does not change status/severity/confidence;
- unsupported language falls back deterministically.

## 32. Client-safe wording contract

Forbidden claim patterns in default templates include:

- “WCAG compliant” from partial automation;
- “legally compliant”;
- “SEO optimized” as a blanket claim;
- “will rank higher”;
- “100% accessible”;
- “pixel-perfect” unless the exact P20 profile/threshold claim is defined and passed;
- “fully responsive” when source evidence/viewports are incomplete;
- “production ready” if deployment/security/data/runtime checks were not in scope.

Preferred language describes exactly what was checked and observed.

## 33. Report profiles

Suggested profile configuration:

```ts
interface HandoffReportProfileV1 {
  schemaVersion: 1;
  profileId: string;
  includeFamilies: string[];
  includeResolved: boolean;
  minimumSeverity?: string;
  includeTechnicalRefs: boolean;
  includeStandardsRefs: boolean;
  includeManualReview: boolean;
  includeEvidenceHashes: boolean;
  localization: string;
}
```

Profile options affect presentation/inclusion, not underlying evidence status.

## 34. Report validation

Before final report is exposed:

- JSON schema valid;
- every included finding ID unique;
- every source/target ref resolves or explicitly external/stale;
- upstream evidence hashes match available receipts;
- standards references use supported versions/IDs;
- no prohibited claim template is emitted;
- summary counts reconcile with finding list;
- resolved/open counts reconcile;
- links/asset references valid within package;
- human report references exact machine report hash.

## 35. Atomic report generation

Generate in staging.

Only expose final report/package after validation succeeds. Cancellation/staleness leaves no final authoritative handoff artifact.

## 36. Handoff package

Conceptual structure:

```text
handoff/
  handoff-report.v1.json
  report.html
  evidence/
    refs.json
  assets/
    optional thumbnails/diffs
  manifests/
    asset-manifest.ref.json
    token-manifest.ref.json
    qa-receipts.ref.json
  receipt.json
```

Large upstream evidence may be referenced by hash rather than duplicated depending on selected package profile.

## 37. Package safety

Requirements:

- safe deterministic paths;
- bounded file count/size;
- no secrets/tokens/credentials;
- no unexpected remote active content;
- embedded HTML report uses safe static content;
- hashes match;
- package hash retained.

## 38. Privacy boundary

Reports can expose sensitive project/client content. P21 therefore defaults to local/offline generation consistent with the existing plugin trust boundary.

No report/evidence is uploaded to a remote analytics/AI service by the deterministic core.

Future connected sharing is a separate capability requiring explicit user action and privacy contract.

## 39. Baseline/re-audit compatibility

P21 finding IDs/status model should support P23 comparison later.

A future baseline comparison can classify:

- `NEW`;
- `UNCHANGED`;
- `IMPROVED`;
- `REGRESSED`;
- `RESOLVED`;
- `NOT_COMPARABLE`.

P21 should not implement the whole agency history layer yet, but must avoid IDs that make comparison impossible.

## 40. Test matrix

### Evidence graph

- complete P13-P20 references;
- missing/stale reference;
- tampered hash;
- multiple target profiles;
- source-only advisory report;
- target-render-observed report.

### Accessibility

- explicit image alt;
- decorative image;
- missing/unknown alt;
- named/unnamed button;
- duplicate generic link names;
- valid/invalid heading hierarchy;
- resolvable solid contrast;
- gradient/background-image contrast ambiguity;
- P20 target-size geometry;
- keyboard recipe PASS/FAIL/insufficient evidence.

### SEO

- title/meta present;
- duplicates across bounded project;
- placeholder metadata;
- link with/without href;
- descriptive/generic anchor heuristic;
- canonical/robots present/absent;
- structured data absent/present where target supports it.

### Reporting

- developer profile;
- client profile;
- combined report;
- localization fallback;
- prohibited-claim regression tests;
- deterministic ordering/serialization;
- package hash tamper detection.

## 41. Acceptance boundary

P21 implementation-complete and production-accepted are separate.

Production acceptance requires real evidence that:

- upstream evidence lineage is retained accurately;
- source-vs-target provenance is clear;
- developer/client reports reconcile to the same machine findings;
- deterministic accessibility/SEO rules produce expected bounded results;
- manual-review boundaries fail closed;
- prohibited marketing/compliance claims cannot be emitted by default templates;
- reports are reproducible from identical evidence/profile versions;
- package/reference validation fails on stale/tampered evidence;
- at least one WordPress target and one code/framework target consume the report contract successfully.

## 42. Non-goals for first implementation

Not first-slice guarantees:

- legal accessibility certification;
- automated full WCAG conformance testing;
- actual screen-reader testing across all assistive technologies;
- public-internet duplicate-content search;
- Google ranking prediction;
- Search Console integration;
- live crawl/index monitoring;
- Lighthouse/Core Web Vitals unless separately measured;
- automatic AI-written alt text/meta descriptions as authoritative fixes;
- project-management/task-system sync;
- full white-label/agency lifecycle controls;
- production security/privacy audit.

## 43. P22 handoff

P22 effort/complexity estimation may consume P21 finding/limitation counts and target mappings, but P22 must not interpret accessibility/SEO severity as monetary value automatically.

P21 exposes structured factors such as:

- unresolved blocker/high counts by family;
- manual-review count;
- target fallback/unsupported count;
- route/page/component counts;
- asset/token issues;
- responsive/interaction review burden;
- verified vs unverified target scope.

P22 applies its own transparent estimation policy.

## 44. P23 handoff

P23 can add:

- branding/white-label presentation;
- project/client baselines;
- owner assignment overrides;
- standards presets;
- approval/accepted-limitation workflows;
- report history/change comparison.

P21 keeps the underlying evidence model organization-neutral.

## 45. Implementation-opening checklist

Before P21 runtime implementation opens:

- [ ] P12 internal release exit complete;
- [ ] selected upstream P13-P20 contracts implemented/accepted for the claimed report profile;
- [ ] R0 accessibility/SEO snapshot refreshed;
- [ ] finding/evidence graph schema v1 frozen;
- [ ] WCAG reference mapping rules frozen and reviewed;
- [ ] accessibility manual-review boundaries frozen;
- [ ] SEO scope/claim boundaries frozen;
- [ ] prohibited claim regression list frozen;
- [ ] report JSON schema frozen;
- [ ] deterministic message-template system frozen;
- [ ] human report format/accessibility contract frozen;
- [ ] package/privacy boundaries frozen;
- [ ] real cross-target fixture corpus prepared.

Until those gates pass, this document remains planning-only and must not be used to claim P21 implementation or accessibility/SEO certification.