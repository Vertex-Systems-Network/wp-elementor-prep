# P26 Optional AI Assistance — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; accepted P13-P25 deterministic evidence/capability contracts  
R0 source snapshot: `docs/R0_OPTIONAL_AI_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P26 adds optional AI assistance around the deterministic WP Builders Prepare platform.

AI may improve comprehension, research synthesis and drafting speed, but the product remains architecturally valid without AI. Deterministic scanners, scores, preparation transactions, target adapters, QA, handoff findings, estimates, project history, dynamic-data schemas and entitlements remain authoritative.

## 2. Canonical AI flow

`User invokes explicit AI capability -> verify P25 entitlement/usage -> resolve provider profile -> assemble minimum deterministic grounding packet -> privacy/redaction preflight -> connected AI request -> schema/citation validation -> mark output AI_DRAFT/SUGGESTION -> user reviews -> accept/edit/discard -> if accepted into project data, write through normal typed P23/P24/content contract -> downstream deterministic validation/regeneration as required`

No AI response directly mutates project/source/target authority.

## 3. AI capability registry

Suggested descriptors:

```ts
interface AICapabilityDescriptorV1 {
  capabilityId: string;
  version: number;
  class: "RESEARCH_SYNTHESIS" | "EVIDENCE_EXPLANATION" | "HANDOFF_DRAFTING" | "REMEDIATION_DRAFTING" | "PROPOSAL_DRAFTING" | "CHANGE_SUMMARY_DRAFTING" | "METADATA_DRAFTING" | "MAPPING_SUGGESTION";
  inputPolicyRef: string;
  outputSchemaRef: string;
  allowedEvidenceFamilies: string[];
  authority: "NON_AUTHORITATIVE";
  entitlementCapabilityId: string;
}
```

Every first-slice AI capability is non-authoritative.

## 4. Invariant: deterministic core independence

When AI is disabled/unavailable:

- audits still run;
- Build/Target-Ready states still calculate;
- P14 preparation still uses accepted deterministic recipes;
- target exports still generate/validate;
- P20 QA still verifies;
- P21 reports still generate deterministically;
- P22 estimates still calculate;
- P23 project/change-only workflows still function;
- P24 data mappings still validate/generate;
- P25 entitlement for non-AI capabilities still functions.

No deterministic feature has an AI hard dependency unless a future distinct AI-only capability is explicitly designed.

## 5. Authority firewall

AI output cannot call/modify authority-bearing functions directly.

Authority-bearing domains include:

- audit scanner/classifier;
- finding status/severity/confidence;
- score weights/thresholds;
- Safe Fix/P14 mutation execution/acceptance;
- target compatibility mapping result;
- target artifact validator;
- P20 QA verdict/threshold;
- P21 standards/compliance state;
- P22 factors/coefficients/price;
- P23 baseline/dependency identity;
- P24 production schema/provider truth;
- P25 entitlement grants.

AI can only create separate suggestion/draft objects referencing these results.

## 6. Grounding packet

Suggested shape:

```ts
interface AIGroundingPacketV1 {
  schemaVersion: 1;
  taskId: string;
  capabilityId: string;
  evidenceRefs: GroundingEvidenceRef[];
  sourceExcerpts?: GroundingExcerpt[];
  userInstruction?: string;
  projectContext?: BoundedProjectContext;
  allowedClaims: ClaimBoundary[];
  prohibitedClaims: ClaimBoundary[];
  packetHash: string;
}
```

Packet construction is deterministic before network transfer.

## 7. Context minimization

Each capability declares required/optional data classes.

Examples:

### Explain finding

Send:

- selected finding;
- exact evidence;
- target/source context needed to understand it;
- accepted standards reference/limitation.

Do not send unrelated pages/project history.

### Draft proposal

Send:

- P22 structured proposal inputs;
- user-selected tone/project labels;
- relevant assumptions/exclusions.

Do not send raw Figma geometry unless needed.

### Change summary

Send:

- P23 delta manifest;
- selected project labels;
- finding/QA changes.

Do not send unchanged full history.

## 8. Data-class registry

Potential AI-sendable classes:

- public research excerpts;
- machine finding metadata;
- selected source text;
- target limitation metadata;
- QA summaries/diff metrics;
- handoff machine model;
- estimate/proposal structured inputs;
- project delta summary;
- explicitly selected image/capture if a future vision capability is accepted;
- user instruction.

Sensitive/secret data classes are forbidden by default.

## 9. Secret scanner/redaction preflight

Before connected AI request, inspect structured fields for forbidden data categories.

At minimum reject/redact:

- API keys/tokens;
- authorization headers;
- passwords;
- private keys;
- OAuth/session credentials;
- database credentials;
- entitlement signing secrets;
- provider webhooks/secrets;
- raw environment secret values.

Structured P24/P25 contracts should contain references rather than secrets, reducing exposure by design.

## 10. User disclosure

Before first use/provider-profile activation, disclose at a useful level:

- AI is optional;
- which provider/service class is used;
- what data categories may be sent;
- that output is a draft/suggestion;
- usage/entitlement implications;
- privacy policy/link/reference for selected provider/service.

Per-task UI should show the selected scope/data class when practical.

## 11. Network execution boundary

Connected AI calls run only in an accepted connected context:

- explicitly network-enabled plugin profile with allowlisted domains; or
- companion/local app; or
- secured server/service.

The existing network-free deterministic plugin build remains separately buildable/testable unless product distribution deliberately changes after acceptance.

## 12. Provider client boundary

Provider SDK/client code is isolated from deterministic domain modules.

Conceptual adapter:

```ts
interface AIProviderV1 {
  profile(): AIProviderProfileV1;
  invoke(request: AIProviderRequestV1): Promise<AIProviderResponseV1>;
}
```

Core AI orchestration talks to this interface, not provider-specific request shapes.

## 13. Model/provider provenance

Every AI result records:

- provider ID;
- provider profile version;
- model ID/version/alias as available;
- AI capability ID/version;
- grounding packet hash;
- output schema version;
- generated output hash;
- source/citation refs where applicable;
- result status.

A changed model/provider does not change old deterministic evidence.

## 14. AI output base model

```ts
interface AIOutputEnvelopeV1<T> {
  schemaVersion: 1;
  authority: "AI_DRAFT" | "AI_SUGGESTION" | "AI_EXPLANATION" | "AI_RESEARCH_SYNTHESIS";
  capabilityId: string;
  providerProfileRef: string;
  groundingPacketHash: string;
  payload: T;
  assumptions: string[];
  citations?: AIValidatedCitation[];
  warnings: string[];
}
```

Schema validation is mandatory before output is displayed as structured result.

## 15. Finding explanation

AI explanation can provide:

- plain-language summary;
- why it matters;
- evidence walkthrough;
- suggested next steps;
- audience-specific phrasing.

It must echo canonical finding ID/status/severity/confidence from grounding, not rewrite them.

A validator rejects structured output that asserts a different canonical status.

## 16. Client explanation

P21 client-safe claim policy is applied after AI drafting.

AI draft cannot remove:

- unsupported limitation;
- manual-review requirement;
- verification scope;
- non-certification wording;
- insufficient-evidence state.

Postprocessor compares required disclosures to grounding and restores/rejects output if missing.

## 17. Research synthesis

AI synthesis can:

- compare retained official docs;
- summarize changes;
- identify potential roadmap impact;
- draft R0 discussion points.

It cannot directly update adapter support/acceptance.

A human/deterministic planning step must explicitly convert supported sourced facts into durable decisions/docs.

## 18. Research source validation

For a research result:

- citation ID must resolve to retrieved/retained source;
- source URL/domain/title/date metadata belongs to retrieval layer;
- quote/paraphrase limits handled by research layer;
- AI cannot invent new authoritative citations;
- conflicting source claims remain visible;
- stale source dates can trigger research refresh.

## 19. Remediation suggestions

Suggested schema includes:

- finding IDs;
- action category;
- suggested steps;
- assumptions;
- whether deterministic recipe exists;
- manual vs config vs content change;
- expected revalidation step.

If no accepted deterministic recipe exists, UI labels recommendation as manual guidance, not one-click fix.

## 20. Draft content acceptance

AI-authored text does not become project/source truth until explicit user action.

Acceptance flow:

- `AI_DRAFT`;
- user edits/accepts;
- validation for target field (length/type/etc.);
- store as normal project content with provenance `USER_CONFIRMED_AI_DRAFT`;
- invalidate dependent artifact/report/QA through P23 graph if content affects them.

## 21. Alt text draft

AI may draft alt text only from explicitly selected image/context in an accepted vision/text capability.

Rules:

- draft label visible;
- user confirms/edits;
- decorative decision remains user/deterministic content-policy decision;
- do not infer sensitive facts about people;
- do not silently overwrite existing source alt metadata;
- P21 reports distinguish user-confirmed AI-derived text from missing/source-authored state if provenance matters.

## 22. Meta/SEO draft

AI may draft meta title/description/content guidance using user-selected content/project context.

It cannot claim:

- guaranteed rankings;
- search volume without sourced research;
- keyword competitiveness without sourced data;
- indexing status without observed target/search evidence.

Draft must respect P21 SEO scope limits.

## 23. Proposal drafting

P22 structured quantities/prices are immutable inputs to AI proposal drafting.

Validator compares any numbers/currency/assumptions in AI structured output against P22 receipt.

AI may choose wording/organization but cannot change:

- effort units/hours;
- price;
- confidence;
- assumptions/exclusions;
- target scope;
- unsupported limitations.

## 24. Change summary drafting

P23 deterministic delta classifications are authoritative.

AI can summarize:

- changed/new/removed scope;
- impacted outputs;
- regressions/improvements;
- required revalidation;
- estimate delta.

It cannot mark a CHANGED object UNCHANGED or invent a change absent from the manifest without labeling it as interpretation/question.

## 25. Mapping suggestions

Potential mapping candidates:

- Figma component -> existing code component;
- raw repeated value -> token candidate;
- design region -> CMS model candidate;
- visual field -> dynamic data field candidate.

Output includes confidence/explanation but deterministic matching/typing/registry rules decide whether the candidate can be accepted.

User acceptance is required before project config mutation.

## 26. Prompt-injection defense

Untrusted content includes:

- Figma layer text;
- imported web/code comments;
- CMS content;
- external research documents/webpages;
- client-provided copy;
- generated target content.

AI orchestration rules:

- do not treat untrusted content as system/tool instructions;
- tools/actions available to AI are minimal for task;
- no mutation/publish/deploy tools in first slice;
- no secret retrieval tools;
- research browsing, if later added, uses a controlled retrieval layer;
- suspicious instructions can be flagged in warnings;
- downstream output still must pass structured invariants.

## 27. Tool-calling boundary

First-slice AI does not autonomously call product mutation/export/deployment operations.

Future tool-enabled agent work requires separate acceptance covering:

- tool allowlist;
- argument validation;
- user confirmation for side effects;
- source/evidence grounding;
- prompt-injection resistance;
- audit log;
- rollback/transaction behavior;
- entitlement/security/privacy.

## 28. AI and Safe Fix

AI can recommend an existing recipe by ID, but deterministic recipe eligibility is recomputed from source evidence before execution.

The AI cannot set `eligible=true` or bypass recipe confidence/validation.

Execution still follows P14 candidate/validate/commit/rollback.

## 29. AI and target mappings

AI can suggest a target mapping only as a candidate.

P15-P18/P24 adapter capability matrix remains authoritative.

Unknown/unsupported feature cannot become native because AI generated code/JSON for it.

## 30. AI and visual QA

Optional future AI vision triage is secondary evidence.

Potential outputs:

- human-readable description of a diff;
- likely grouping of related regions;
- suggested investigation path.

P20 deterministic visual/content/geometry/interaction channel results remain authoritative and are always shown.

## 31. AI and effort estimates

AI explanations consume P22 factor contributions.

Invariant tests should verify AI cannot change returned estimate values in structured proposal/explanation outputs.

If AI mentions alternative scope, it is a what-if suggestion requiring explicit new P22 scenario calculation.

## 32. AI entitlement

P25 resolver runs before AI network request.

Denial/limit exhaustion:

- no provider request;
- deterministic workflow remains available;
- user sees capability/usage reason;
- no partial hidden charge/use.

Usage meter counts according to explicit selected P25 policy.

## 33. Usage/cost receipt

Where provider/plan exposes usage data, AI receipt may record bounded non-sensitive metrics such as:

- request count;
- provider reported input/output units/tokens where available;
- internal credit units;
- cost only if provider/account system exposes an accepted reliable value.

Do not fabricate cost from stale price assumptions inside deterministic core.

## 34. Caching boundary

AI output cache may use grounding packet hash + provider/model/profile + capability/version + user instruction hash.

Cache is advisory optimization only.

Rules:

- never reuse across incompatible privacy/project scopes;
- expiration/version policy explicit;
- deterministic evidence changes alter packet hash;
- model/provider change can invalidate cache;
- user can regenerate when entitled;
- cached output remains labeled AI.

## 35. Project history

If AI output is saved to P23 history, record it as an optional draft/suggestion artifact with provider provenance.

Accepted user-confirmed content/config becomes a separate normal project history entry.

Discarded AI outputs need not pollute authoritative project baseline.

## 36. Privacy/logging

Production logging defaults to metadata needed for reliability/billing/security, not raw project prompts/content.

If raw prompts/outputs are retained for debugging/product improvement, this requires explicit provider/service privacy design, minimization and user/org policy—not an implicit default in the deterministic core.

## 37. Organization controls

Future Agency controls may allow:

- AI disabled organization-wide;
- allowed provider profiles;
- allowed AI capability classes;
- data-class restrictions;
- retention profile;
- budget/usage caps;
- require user confirmation for every AI send;
- prohibit image/source-content transmission.

P23 config can reference these controls after a separate accepted connected-AI org schema exists.

## 38. Safety/claim validation

Post-AI validators should test capability-specific invariants.

Examples:

- finding explanation canonical status matches source;
- proposal numeric values match P22;
- client handoff retains mandatory P21 disclosure;
- research citations all resolve;
- mapping suggestion does not claim acceptance;
- metadata draft remains draft;
- no prohibited secret pattern appears;
- no unsupported/legal/ranking guarantee language where disallowed by profile.

Invalid AI output is rejected or shown as invalid draft, never used to update core evidence.

## 39. Evaluation suite

P26 needs a retained evaluation corpus before production enablement.

Test classes:

- correct explanation of simple finding;
- unsupported feature cannot be explained as supported;
- manual-review boundary retained;
- prompt injection embedded in design text;
- prompt injection embedded in research page;
- secret-like strings in context;
- conflicting research sources;
- missing citation;
- proposal numbers preserved;
- estimate high/low explanation without number changes;
- alt/meta draft clearly non-authoritative;
- mapping suggestion requires confirmation;
- provider timeout/unavailable;
- schema-invalid output;
- entitlement denied/limit reached;
- deterministic workflow unchanged when AI disabled.

## 40. Red-team/invariant tests

Critical invariant tests should attempt to get AI to:

- change score/status;
- claim target verified without evidence;
- authorize mutation;
- expose secret;
- obey malicious design text;
- invent a source;
- alter price;
- grant entitlement;
- hide accessibility/SEO disclaimer;
- auto-publish/deploy.

The orchestration/output validator must prevent these paths independently of model cooperation.

## 41. Acceptance labels

AI feature states:

- `AI_DISABLED`;
- `AI_AVAILABLE`;
- `AI_NOT_ENTITLED`;
- `AI_PROVIDER_UNAVAILABLE`;
- `AI_REQUEST_RUNNING`;
- `AI_DRAFT_READY`;
- `AI_DRAFT_INVALID`;
- `AI_DRAFT_ACCEPTED_BY_USER`;
- `AI_DRAFT_DISCARDED`.

Do not reuse deterministic `VERIFIED` labels for AI prose.

## 42. Job state machine

`IDLE -> ENTITLEMENT -> GROUNDING -> PRIVACY_PREFLIGHT -> PROVIDER_REQUEST -> OUTPUT_SCHEMA -> INVARIANT_VALIDATION -> DRAFT_READY -> USER_ACCEPT/EDIT/DISCARD`

Terminal/error states:

- `CANCELLED`;
- `NOT_ENTITLED`;
- `PROVIDER_UNAVAILABLE`;
- `PRIVACY_BLOCKED`;
- `TIMEOUT`;
- `SCHEMA_INVALID`;
- `CITATION_INVALID`;
- `INVARIANT_VIOLATION`;
- `DISCARDED`.

## 43. Cancellation

Cancellation stops/abandons provider work when API/provider supports cancellation; otherwise ignore late output and do not apply it.

A cancelled request cannot auto-save accepted content/config.

## 44. Deterministic acceptance after AI content

When user accepts AI draft into project data:

1. normalize/validate typed content/config;
2. create P23 project change entry with provenance;
3. recompute semantic hashes/dependency closure;
4. regenerate/revalidate required target outputs;
5. rerun P20/P21/P22 downstream evidence as needed.

AI draft acceptance never skips normal invalidation.

## 45. Release architecture

Recommended packaging keeps builds separable:

- deterministic offline Community core build;
- optional AI-connected build/module/provider profile only after network/privacy acceptance;
- or companion/server AI capability while Community core remains network-free.

Final choice is an implementation-time product/distribution decision, not assumed by P26 planning.

## 46. Manifest implications

If classic plugin itself makes AI network requests, exact allowed domains must be declared through Figma `networkAccess` and release/privacy/community documentation refreshed.

No wildcard/unbounded domains merely for convenience without explicit accepted rationale/security review.

## 47. Provider change governance

Provider/model changes require:

- profile version update;
- privacy/security review if behavior/data handling changes;
- eval suite rerun;
- structured output compatibility check;
- cost/metering review;
- no change to deterministic authority firewall.

A “smarter model” does not justify weakening validation.

## 48. AI research governance

R0 research workflow can use AI for breadth/synthesis while repository durable decisions still record:

- source facts;
- checked date;
- conflicting/uncertain points;
- exact accepted architectural implication;
- reviewer/commit evidence.

AI-generated market claims without retained sources are not durable R0 evidence.

## 49. Non-goals for first implementation

Not first-slice capabilities:

- autonomous Figma mutation agent;
- autonomous deployment/publishing;
- AI deciding target compatibility;
- AI replacing deterministic code generators;
- AI changing effort/pricing;
- AI granting entitlements;
- unrestricted whole-project upload;
- unrestricted browser/tool agent;
- arbitrary AI-generated production code insertion;
- autonomous CMS/backend schema creation;
- AI-only accessibility/legal/SEO certification;
- background autonomous monitoring inside the plugin.

## 50. Production acceptance

Each AI capability is accepted independently.

Minimum acceptance evidence:

- deterministic core works with AI fully disabled;
- provider/network/privacy contract accepted;
- entitlement/metering behavior tested;
- minimum-context grounding verified;
- secret/redaction tests;
- prompt-injection tests;
- structured output schema tests;
- authority/invariant firewall tests;
- provider timeout/error/cancellation behavior;
- mandatory disclaimers/status preserved;
- user accept/edit/discard flow;
- accepted content triggers normal project invalidation/revalidation;
- evaluation corpus meets defined quality thresholds for the specific drafting/explanation task.

## 51. Roadmap closure boundary

P26 completes the currently planned P13-P26 commercial-expansion preflight sequence, not runtime implementation.

After P26 planning acceptance:

- roadmap contracts exist for the planned commercial layers;
- implementation remains sequenced and gated by P12 internal release exit;
- each future phase still requires implementation branch/issues/tests/real acceptance;
- R0 refresh remains mandatory for externally evolving target/provider phases.

## 52. Implementation-opening checklist

Before P26 runtime implementation opens:

- [ ] P12 internal release exit complete;
- [ ] deterministic capability being augmented is implemented/accepted;
- [ ] R0 AI snapshot refreshed;
- [ ] exact first AI capability class selected;
- [ ] provider/model/profile selected;
- [ ] P25 entitlement/meter profile accepted;
- [ ] connected network/privacy/security boundary accepted;
- [ ] grounding/data-class policy frozen;
- [ ] secret/redaction policy frozen;
- [ ] prompt-injection/tool boundary frozen;
- [ ] structured output/invariant validators frozen;
- [ ] evaluation/red-team corpus prepared;
- [ ] user disclosure/acceptance UX frozen;
- [ ] fallback/no-AI path proven.

Until these gates pass, this specification remains planning-only and must not be used to claim P26 implementation, autonomous-agent capability or AI authority over deterministic product behavior.