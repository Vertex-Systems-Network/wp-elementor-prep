# R0 Commercial Packaging / Entitlement Snapshot — 2026-09-11

Status: RESEARCH / PLANNING-ONLY  
Owner roadmap issue: #119  
Target phase: P25 — Commercial Packaging / Entitlements  
Dependencies: #84 P12 internal release exit; accepted P13-P24 neutral capability contracts  
Date: 2026-09-11

## 1. Purpose

P25 defines how product capabilities can be packaged commercially without coupling core evidence schemas to Free/Pro/Agency plan names and without weakening safety/validation for lower tiers.

Commercial access controls which actions/features a user may invoke. It must not rewrite observed source evidence, target compatibility, QA truth or historical project receipts.

## 2. Current Figma Payments API

Current official Figma Plugin API documentation provides a Payments API for plugins/widgets. A plugin must request the `payments` permission in `manifest.json` before accessing `figma.payments`.

The API can expose payment status and initiate checkout, and can support custom time/usage-based free-trial experiences.

P25 consequence:

- a Figma-native paid entitlement provider is a documented option for classic Community plugins;
- adding `payments` is a manifest/permission change and must be treated as a versioned product/release decision;
- payment status is entitlement evidence, not audit/target-readiness evidence;
- the deterministic scan/generation logic remains independent of how the entitlement was obtained.

## 3. Existing free plugin boundary

Current Figma Community guidance states that functionality of an already published free plugin/widget may be moved behind a paywall using the Payments API, but the plugin/widget must retain free functionality.

P25 consequence:

- packaging should support a durable free core rather than assuming the current free resource can be transformed into an all-paid product;
- Free capabilities should remain useful and safety-complete;
- paid gating should occur at value-added action/capability boundaries, not by hiding required validation or corrupting existing project data.

## 4. Paid publishing eligibility is external/account-specific

Figma Community selling requires creator/publisher eligibility and paid-resource publication rules. Current guidance also distinguishes individual paid-resource publishing from team/organization Community profiles and notes account-level purchase limitations.

P25 consequence:

- repository planning must not assume the current publisher/account is eligible for paid publishing;
- P12 live publisher/account/2FA exit remains separate and cannot be replaced by packaging documentation;
- native Figma purchase state should not be assumed to implement organization-wide Agency licensing by itself;
- an Agency/multi-seat commercial model may require a future separate entitlement/account service or organization contract.

## 5. Server-side payment verification

Figma also documents a Payments REST API that can validate purchases on a server and gate external services/endpoints for paid users.

P25 consequence:

- external paid services can later verify Figma purchase state through a separately accepted backend;
- server credentials/personal access tokens must never be embedded in the plugin or project artifacts;
- server-side entitlement verification belongs to a connected service security/privacy contract, not the offline deterministic core.

## 6. Network-free core boundary

Current accepted core plugin architecture remains network-free.

P25 therefore separates:

- `CAPABILITY_LOGIC` — deterministic feature implementation;
- `ENTITLEMENT_DECISION` — whether the user may invoke a capability;
- `CONNECTED_SERVICE` — optional external service access requiring separate network/privacy/security acceptance.

A capability can remain fully deterministic/offline even if access to it is granted by platform payment state.

## 7. Neutral capability IDs

Product schemas should reference stable capability IDs rather than commercial plan names.

Examples:

- `audit.selected-frame`;
- `audit.full-project`;
- `prepare.target-ready-duplicate`;
- `export.elementor`;
- `export.gutenberg`;
- `export.web`;
- `export.framework.react`;
- `export.assets.full`;
- `qa.round-trip`;
- `handoff.full`;
- `estimate.effort`;
- `project.baselines`;
- `project.change-only`;
- `project.white-label`;
- `dynamic.cms`;
- `dynamic.forms`;
- `ai.explain` (future P26).

Free/Pro/Agency are packaging profiles that grant capability IDs; they are not embedded into P13-P24 domain objects.

## 8. Safety capabilities are not premium

Mandatory validation/safety behaviors are not optional paid extras.

A tier may limit whether a user can generate a specific output, but if an output/action is available, required checks still run.

Never gate behind payment:

- rollback/safe-failure handling for an available mutation;
- integrity validation required to avoid corrupt output;
- disclosure that evidence is stale/unsupported;
- privacy/security boundaries;
- exact entitlement-independent project/source truth needed to avoid data loss.

## 9. Downgrade boundary

If entitlement is lost/downgraded:

- existing project/source/history data remains readable/exportable where baseline product data portability requires it;
- previously generated files remain the user's external copies;
- gated actions can become unavailable;
- historical receipts remain valid records of what occurred under the prior entitlement;
- no project evidence is silently deleted or rewritten;
- no destructive “lock project until payment” behavior in first-slice design.

## 10. Unknown entitlement boundary

Entitlement state may be:

- `GRANTED`;
- `DENIED`;
- `TRIAL`;
- `EXPIRED`;
- `UNKNOWN`;
- `PROVIDER_UNAVAILABLE`.

Unknown/provider-unavailable must fail closed for new premium actions while preserving free/read-only data access. It cannot be treated as paid merely because network/platform state could not be checked.

## 11. Usage limits/trials

Usage-based or time-based trial limits, where supported by the chosen provider, must be explicit and user-visible.

A usage meter must specify:

- capability being counted;
- unit (run/export/page/etc.);
- period/window;
- count source/authority;
- reset rule;
- offline behavior;
- what happens when limit is reached.

The product must not silently count failed/stale/cancelled operations as successful billable usage unless the commercial policy explicitly and reasonably defines that unit.

## 12. Agency/multi-seat boundary

Agency features may include organization presets/history/white-label/bindings/batch/export governance, but entitlement should be modeled separately from project data.

Potential future organization entitlement provider requirements:

- organization/seat identity;
- role/permission mapping;
- license assignment;
- signed/verified entitlement snapshot;
- offline grace policy;
- revocation/expiry;
- auditability;
- privacy/security controls.

These are not implied by Figma's individual plugin purchase state.

## 13. R0 refresh triggers

Refresh before implementation if:

- Figma Payments API or manifest requirements change materially;
- Community paid-plugin eligibility/publishing rules change;
- the product chooses one-time vs subscription publication;
- external account/billing/organization licensing is introduced;
- usage metering/trials become first-class;
- P26 connected AI/provider costs affect entitlements;
- a web/CLI product surface needs entitlement verification;
- multi-seat Agency licensing is implemented.

## 14. Sources retained

Checked 2026-09-11:

- Figma Developer Docs — Requiring Payment / Plugin Payments API;
- Figma Developer Docs — Payments REST API;
- Figma Developer Docs — Plugin Manifest (`payments` permission);
- Figma Help Center — selling Community resources and publishing classic plugins.

## 15. Non-authorizing statement

This snapshot does not advance P12, establish publisher eligibility, select a paid publication model, authorize billing/network infrastructure, or open P25 runtime implementation.