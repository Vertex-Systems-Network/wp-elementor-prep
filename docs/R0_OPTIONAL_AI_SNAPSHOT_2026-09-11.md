# R0 Optional AI Assistance Snapshot — 2026-09-11

Status: RESEARCH / PLANNING-ONLY  
Owner roadmap issue: #119  
Target phase: P26 — Optional AI Assistance  
Dependencies: #84 P12 internal release exit; accepted P13-P25 deterministic evidence/capability contracts  
Date: 2026-09-11

## 1. Purpose

P26 adds optional AI assistance around the deterministic product rather than inside its authority path.

AI can help synthesize research, explain evidence and draft user-facing material. It must not become the source of truth for audit findings, scores, target compatibility, Safe Fix authorization, mutation acceptance, generated target artifacts, QA verdicts, effort estimates, entitlements or production-data bindings.

The deterministic product must remain fully usable when AI is disabled, unavailable or not entitled.

## 2. Network boundary

The accepted classic Figma plugin core remains network-free. Current Figma plugin documentation requires network domains to be explicitly declared in `manifest.json` via `networkAccess`; the special `none` value prevents network access and declared domains are visible in platform/plugin review contexts.

P26 consequence:

- the current deterministic core does not gain ambient AI network access merely because P26 exists;
- a connected AI surface requires a separately accepted network/privacy/security capability, explicit allowed domains and user-visible data-transfer behavior;
- alternatively AI may run in a separate web/CLI/companion service whose boundary is explicit;
- connected AI configuration cannot silently weaken the offline core contract.

## 3. Provider/model neutrality

P26 does not select one permanent AI provider/model in the domain schema.

AI provider profile must be versioned and include at least:

- provider ID;
- model ID/version where available;
- capability class;
- context/input policy;
- output schema;
- network/privacy policy;
- entitlement/metering capability ID;
- evaluation profile.

Changing provider/model invalidates only AI-output provenance, not deterministic source evidence.

## 4. Allowed first-slice AI capability classes

Initial optional capability families:

- `RESEARCH_SYNTHESIS` — summarize/correlate retained public research sources;
- `EVIDENCE_EXPLANATION` — explain deterministic findings/scores/limitations in plainer language;
- `HANDOFF_DRAFTING` — draft developer/client explanatory prose from P21 machine evidence;
- `REMEDIATION_DRAFTING` — draft non-authoritative remediation guidance tied to an existing deterministic finding;
- `PROPOSAL_DRAFTING` — turn P22 structured proposal inputs into editable prose without changing estimate numbers;
- `CHANGE_SUMMARY_DRAFTING` — summarize P23 deterministic revision deltas;
- `METADATA_DRAFTING` — suggest alt text/meta descriptions/labels only as drafts requiring explicit user acceptance before becoming project/source metadata;
- `MAPPING_SUGGESTION` — suggest potential component/data/token mappings for user review, never commit them automatically.

## 5. Explicit non-authority rules

AI output cannot directly:

- create/close audit findings;
- change rule severity/status/confidence;
- change Build-Ready/Target-Ready scores;
- mark a target as supported/verified;
- authorize P14 mutations;
- bypass candidate -> validate -> accept/rollback transaction flow;
- modify deterministic generated code/artifact without the normal accepted generation path;
- change P20 QA verdicts/thresholds;
- change P22 factor quantities/coefficients/estimate totals;
- grant P25 entitlements;
- infer production P24 credentials/data models as truth;
- claim WCAG/legal/SEO compliance;
- publish/submit/deploy automatically.

## 6. AI output truth class

Every AI response is labeled one of:

- `AI_DRAFT`;
- `AI_SUGGESTION`;
- `AI_RESEARCH_SYNTHESIS`;
- `AI_EXPLANATION`;
- `AI_UNKNOWN`.

It cannot receive `OBSERVED`, `VALIDATED` or equivalent deterministic authority merely because it sounds confident.

## 7. Grounding boundary

AI tasks should consume explicit structured inputs/approved source packets rather than unrestricted project state.

Potential grounding inputs:

- P13-P24 machine receipts;
- selected finding IDs/evidence excerpts;
- selected source text/content approved by user;
- P21 machine handoff model;
- P22 estimate/proposal inputs;
- P23 change manifest;
- retained R0 public research records with source URLs/titles/dates;
- user-authored instructions.

The AI layer does not silently crawl the user's whole Figma file/project/library.

## 8. Prompt-injection boundary

Design copy, imported HTML/CSS, CMS content, external webpages and research documents are untrusted data, not trusted AI instructions.

Connected AI orchestration must:

- separate system/task instructions from retrieved/source content;
- mark untrusted content boundaries;
- restrict available tools/actions;
- ignore source-content requests to bypass product policies or expose secrets;
- never let retrieved text directly trigger mutation/export/publish/network actions;
- treat suspicious instruction-like content as data and optionally flag it.

## 9. Data minimization

AI requests send the minimum context needed for the selected task.

Examples:

- explain one finding -> send that finding/evidence, not entire document;
- proposal draft -> send P22 structured proposal inputs, not raw design file;
- change summary -> send P23 delta manifest, not all historical project data;
- research synthesis -> send retained public source excerpts/metadata.

The user should be able to understand what class of project data is being sent to a connected provider.

## 10. Secrets and credentials

Never include in AI context:

- API keys/tokens;
- passwords;
- OAuth/session tokens;
- billing credentials;
- database connection strings;
- private provider secrets;
- entitlement signing secrets;
- raw production secrets from P24.

Secret-reference names may be mentioned when necessary, but not secret values.

## 11. Privacy boundary

AI is opt-in/explicit per connected capability.

Before production enablement, the selected provider/service contract must define:

- what data is sent;
- purpose;
- retention/training handling as applicable;
- account/workspace controls;
- deletion/logging behavior where relevant;
- regional/enterprise requirements where applicable;
- error/redaction behavior.

P26 does not assume one provider's privacy terms in the provider-neutral core schema.

## 12. Research synthesis boundary

R0 market/platform research can use AI to synthesize public sources, but:

- source discovery/retrieval evidence is retained independently;
- every material current claim should be traceable to source metadata;
- AI cannot turn an uncited/ambiguous statement into a durable architecture decision by itself;
- contradictory sources are surfaced, not harmonized silently;
- source dates/platform versions matter;
- human/deterministic review freezes the resulting product decision.

## 13. Explanation boundary

AI can rephrase deterministic evidence for different audiences.

Rules:

- finding ID/status/severity/confidence cannot change;
- unsupported features remain unsupported;
- limitations/manual-review boundaries remain present;
- explanation may add examples but must distinguish examples from observed facts;
- client-friendly copy cannot overclaim beyond P21 claim taxonomy.

## 14. Remediation drafting

AI may draft remediation options for an existing finding.

Output must include/reference:

- finding ID;
- target/source scope;
- whether a deterministic P14 recipe exists;
- whether suggestion is design/content/development/manual review;
- unsupported/unknown assumptions.

An AI remediation becomes executable only if mapped to an already accepted deterministic recipe or converted by the user into explicit source/target configuration that passes normal validation.

## 15. Metadata drafting

AI can suggest content such as:

- image alt text;
- meta description;
- accessible label;
- report summary;
- proposal prose.

Such text is a draft until a user explicitly accepts/edits it.

After acceptance, project provenance records `USER_CONFIRMED_FROM_AI_DRAFT` or equivalent so downstream reports do not present the text as originally source-authored.

## 16. Component/mapping suggestions

AI can suggest likely:

- P18 existing-component mapping candidates;
- P19 token names/groups;
- P24 model/field/binding candidates;
- P23 rule/preset ideas.

These suggestions do not enter binding/IR/config registries automatically.

User confirmation plus deterministic schema/signature/type/target validation is mandatory.

## 17. Code boundary

P17/P18 deterministic emitters remain authoritative for supported target code.

AI may:

- explain generated code;
- draft a custom-integration idea;
- suggest how unsupported target behavior might be approached.

AI-generated arbitrary production code is not silently inserted into accepted target artifacts in the first P26 slice.

If a later capability allows AI-generated code, it requires a separate sandbox/static/build/security/QA contract before becoming executable output.

## 18. Mutation boundary

AI never writes to the Figma document directly.

If AI suggests a change:

1. output proposal/draft;
2. user reviews;
3. proposal maps to accepted P14 deterministic recipe/config or remains manual guidance;
4. normal candidate duplicate/transaction flow executes;
5. deterministic validation decides acceptance/rollback.

AI success/confidence is irrelevant to mutation acceptance.

## 19. QA boundary

AI/vision/perceptual models may later help triage P20 diffs, but they cannot replace deterministic P20 channel results or thresholds in the first slice.

Potential future use:

- describe diff region;
- group likely related visual deltas;
- suggest human-review priority.

The canonical visual/content/geometry/interaction verdict stays P20-owned.

## 20. Estimator boundary

AI can explain why P22 estimate is high/low or draft proposal language.

AI cannot:

- alter factor vector;
- invent hidden risk multiplier;
- alter coefficients/calibration;
- infer client budget/willingness to pay;
- set rates/discounts;
- change final effort/pricing output.

## 21. Entitlement/metering

AI capabilities use P25 neutral IDs, for example:

- `ai.research-synthesis`;
- `ai.explain-findings`;
- `ai.draft-handoff`;
- `ai.draft-proposal`;
- `ai.draft-metadata`;
- `ai.suggest-mapping`.

Usage/cost meters are separate from deterministic capability limits and must be explicit/user-visible.

No AI entitlement may gate deterministic evidence access the user otherwise owns/is entitled to.

## 22. Provider profile

Suggested shape:

```ts
interface AIProviderProfileV1 {
  profileId: string;
  version: number;
  providerId: string;
  modelId: string;
  capabilities: AICapabilityClass[];
  networkMode: "CONNECTED_PLUGIN" | "COMPANION" | "SERVER_SERVICE";
  inputPolicyRef: string;
  outputSchemaVersion: number;
  privacyPolicyRef: string;
  evaluationProfileRef: string;
}
```

Provider/model changes are visible in AI receipts.

## 23. AI request receipt

Suggested metadata:

- AI capability ID;
- provider profile/model IDs;
- deterministic grounding packet hash;
- user instruction hash/content according to privacy policy;
- data classes included;
- redactions;
- entitlement decision ref;
- request timestamp;
- result status;
- output hash;
- citations/source refs when research-capable.

Do not store raw prompt/context by default unless product privacy/debug profile explicitly permits it.

## 24. Output schema

AI capabilities should prefer structured schemas.

Example explanation:

```ts
interface AIExplanationV1 {
  sourceFindingIds: string[];
  summary: string;
  details: string[];
  assumptions: string[];
  manualReviewNotes: string[];
  authority: "AI_EXPLANATION";
}
```

Schema validation failure rejects the AI output as unusable; it never corrupts deterministic evidence.

## 25. Citation/source integrity

Research-synthesis outputs should include source references from the supplied/retrieved evidence packet.

Rules:

- do not accept invented source IDs/URLs;
- cited source must exist in grounding packet;
- distinguish direct source fact vs AI synthesis;
- preserve publication/checked date where relevant;
- unsupported claim can be flagged/removed rather than promoted to decision record.

## 26. Non-determinism boundary

AI outputs may differ for identical inputs even under the same model/profile.

Therefore:

- deterministic evidence/artifact identity does not depend on AI prose;
- AI output receives its own hash/provenance;
- re-running AI does not invalidate target artifact unless user explicitly accepts AI draft into project configuration/content;
- accepted user edits become normal versioned project inputs through P23.

## 27. Failure behavior

AI failures include:

- provider unavailable;
- network denied;
- entitlement/usage limit;
- timeout;
- unsafe/invalid output;
- schema mismatch;
- grounding/citation failure;
- prompt-injection detection/review;
- privacy policy restriction.

All failures degrade to deterministic workflow without changing technical evidence.

## 28. User control

UI should clearly provide:

- explicit AI action invocation;
- what evidence/data class will be used;
- AI/Draft labeling;
- accept/edit/discard for draft content;
- retry/regenerate where entitled;
- deterministic source evidence alongside explanation;
- no automatic opt-in to AI for core audit/export.

## 29. R0 refresh triggers

Refresh before implementation if:

- an AI provider/model/service is selected;
- plugin/network architecture changes;
- Figma network/manifest rules change materially;
- privacy/retention policy changes;
- AI is allowed to generate executable code;
- AI is allowed to propose/trigger automated mutations;
- AI vision becomes part of QA;
- agent/tool-calling/web browsing is introduced;
- organization AI controls/enterprise data policies are added.

## 30. Sources retained

Checked 2026-09-11:

- Figma Developer Docs — Plugin `networkAccess` manifest/network-request behavior;
- existing repository R0 research/architecture and P13-P25 evidence/safety contracts.

Provider-specific public docs are intentionally not frozen because P26 has not selected a production AI provider/model.

## 31. Non-authorizing statement

This snapshot does not advance P12, select an AI provider, authorize network/data transfer, open P26 runtime implementation, or make AI an authority over deterministic product behavior.