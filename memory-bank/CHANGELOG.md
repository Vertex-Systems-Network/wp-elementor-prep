# Changelog

## 2026-09-12 — P14 coordinator runtime-evidence and lease-cleanup hardening

- Opened issue #201 and focused PR #205 (`fix/p14-coordinator-runtime-evidence-201`) for the remaining injected source-transaction coordinator trust-boundary gap.
- Added runtime validation for coordinator acquisition evidence: acquisition flag, refusal reason, optional owner identities and acquired lease identities are treated as unknown evidence and bounded before transaction semantics use them.
- Acquired lease evidence must match the exact normalized requested source scope and transaction ID; unreadable/proxy-backed or malformed evidence fails closed before adapter access.
- If malformed evidence still claims `acquired: true`, the transaction makes one bounded best-effort release attempt using the exact expected source/transaction lease identity.
- Coordinator release now succeeds only on literal `true`; `false`, non-boolean runtime evidence or throw is converted to bounded `CLEANUP_REQUIRED` evidence at stage `coordination-release` instead of escaping or being silently ignored.
- Receipt integrity now permits coordinator-release cleanup with truthful retained-candidate/retention evidence when finalization already succeeded, or without candidate evidence when the release problem occurs before a candidate exists.
- Added `tests/p14-coordinator-runtime-evidence.test.ts` covering throwing/unreadable/malformed acquisition, oversized owner identity, claimed-acquired recovery, release false/throw, pre-clone release cleanup, default coordinator success and NO_CHANGES_NEEDED no-lease behavior.
- Initial code/test head `511bf68adbe1859695d7dbe2dea12e974afa024f` passed CI #867 including status verification, typecheck, full tests, plugin/CLI builds and release/package/community checks; P12 Final Release Artifact #178 passed; P12 Offline Acceptance #222 passed on Ubuntu/macOS/Windows.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS for #201. No distributed lock, real Figma mutation command, production recipe authority, target-compatibility claim or production acceptance was introduced.
- Accidental empty issues #202, #203 and #204 were immediately closed as `not_planned`; they carry no implementation scope and #201 remains authoritative.
- Final synchronized-head CI/evidence/review verification remains required before PR #205 may merge.

## 2026-09-12 — P14 safe-recipe registry resource bounding

- Opened issue #198 and focused PR #199 (`fix/p14-registry-bounds-198`) for the remaining safe-recipe registry resource-bound gap before semantic authorization.
- Added `src/core/p14-registry-bounds.ts` with a resource-only `assessP14SafeRecipeRegistryBounds(...)` gate that reuses the existing P14 action/dependency/conflict/mutation/identity limits.
- Safe-recipe registry `bindings`, recipe `sourceRuleIds`, `prerequisites`, `conflictsWith` and `mutationAllowlist` are now count-bounded before semantic item traversal; binding/recipe/profile/order and nested rule/dependency/conflict identities are bounded before authorization validation.
- `validateP14SafeRecipeRegistry(...)` applies the bounds gate first, so direct validation, P13→P14 resolution and runtime plan authorization inherit the same resource contract.
- Oversized registry evidence preserves the existing execution result `BLOCKED` + `P14_RECIPE_UNAUTHORIZED`; no new transaction status/error code or mutation authority was introduced.
- Added `tests/p14-registry-bounds.test.ts` covering exact boundaries, oversized identities, top-level/nested proxy arrays that permit only `.length`, bounded malformed registries, empty production registry preservation, and zero coordinator/adapter access on transaction rejection.
- Initial code/test head `4ebf8328159f6d0d94ba8b606987cb8c0599a66a` passed CI #858, P12 Final Release Artifact #169 and P12 Offline Acceptance #213 on Ubuntu/macOS/Windows.
- Final synchronized PR head `e782a08090a4e158f99da22bf25d8fff60c8c529` passed CI #863, Integration Readiness #231, P12 Final Release Artifact #174 and P12 Offline Acceptance #218 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main and was reported mergeable by GitHub.
- PR #199 squash-merged as `80cefcb8b90a85b5e5a8b5ad4e6a0f65ddf6d12b`; issue #198 closed completed. P14 remains runtime-unwired and production recipe authority remains empty.
- Updated the P14 foundation, README, PROJECT_STATE and NEXT_ACTIONS without enabling real Figma mutation, registering a production recipe, or creating target-compatibility/production-acceptance authority.

## 2026-09-12 — P14 runtime clock and event-timestamp evidence hardening

- Opened issue #195 and focused PR #196 (`fix/p14-runtime-clock-evidence-195`) for the remaining untrusted runtime-clock/event-timestamp evidence gap.
- Added `src/core/p14-timestamp-evidence.ts` with a shared strict normalized UTC millisecond timestamp validator, explicit `UNKNOWN` event-time sentinel and fail-safe runtime clock reader.
- P14 preparation confirmation build/validation now reuses the shared normalized UTC validator; confirmation timestamps remain strict reviewed-intent evidence and do not accept `UNKNOWN`.
- Receipt event integrity now accepts only normalized UTC event time or explicit `UNKNOWN`, and rejects oversized/non-canonical/impossible timestamp evidence before `Date.parse(...)`.
- Transaction event construction now treats `now()` as untrusted metadata evidence: throw, non-string, oversized and non-canonical values cannot escape the transaction and are represented as unavailable time rather than fabricated wall-clock evidence.
- Added `tests/p14-timestamp-evidence.test.ts` covering pre-parse length rejection, strict timestamp shapes, hostile clock callbacks, confirmation compatibility, valid-clock preservation and forged receipt timestamps.
- Initial PR head `38ec9c36e44aa1e2431802bc74d8c9bab6a1adbe` passed P12 Offline Acceptance #203 but exposed a test-only TypeScript inference failure in CI #848 / P12 Final Release Artifact #159. The heterogeneous test callbacks were explicitly typed in follow-up commit `4d2b56497d90c58c71293ec9f473260fb9c8cef8`; no production clock logic change was required for that failure.
- Updated `docs/P14_FOUNDATION_IMPLEMENTATION.md`, README, PROJECT_STATE and NEXT_ACTIONS with the timestamp evidence contract. No real Figma mutation command, production recipe authority, target-compatibility claim or acceptance authority was introduced.
- Final synchronized PR head `47cb0b4d2d3c53f7f818af760131cc78737cb5c4` passed CI #854, Integration Readiness #224, P12 Final Release Artifact #165 and P12 Offline Acceptance #209 on Ubuntu/macOS/Windows; it had zero unresolved review threads/reviews/comments, remained current with main and was reported mergeable by GitHub.
- PR #196 squash-merged as `8021874323f5bad6ebf648b0891bc9f6358dd1bf`; issue #195 closed completed. P14 remains runtime-unwired and production recipe authority remains empty.

## 2026-09-12 — P14 receipt envelope and runtime-diagnostic hardening

- Opened issue #192 and focused PR #193 (`fix/p14-receipt-envelope-bounds-192`) for the remaining P14 receipt-envelope/resource-safety gap.
- Added `src/core/p14-receipt-evidence.ts` with shared receipt collection, identity/detail bounding and hostile runtime-error rendering helpers based on the existing P14 safety limits.
- Receipt integrity now count-bounds `appliedActions`, `errors` and `events` from `.length` before item traversal, preventing forged oversized collections from triggering unbounded iteration or status-specific scans.
- Receipt `transactionId`, `p13RunId`, `planDigest`, source node identity and error stage now use the existing P14 identity bound; error detail/recovery and event detail use the existing detail bound.
- Transaction `receiptError(...)` and event construction now emit bounded diagnostics by construction. Adapter and discard exception text is bounded before entering receipt state; hostile exception stringification falls back deterministically instead of escaping the transaction.
- Added `tests/p14-receipt-envelope-bounds.test.ts` covering exact limits, forged oversized top-level evidence, proxy-backed no-traversal collection checks, long adapter/discard exceptions and exception objects whose `toString()` throws.
- Updated `docs/P14_FOUNDATION_IMPLEMENTATION.md` with the bounded receipt-envelope/runtime-diagnostic contract and new safety invariants. No real Figma mutation command, production recipe authority, target-compatibility claim or acceptance authority was introduced.
- Pre-memory-sync PR head `7a031c2f8e2b405e084ae2fbdd677205d9e9c7e7` passed CI #840 including typecheck/full tests/builds/contracts, P12 Final Release Artifact #151, and P12 Offline Acceptance #195 on Ubuntu/macOS/Windows.
- Final synchronized PR head `5b9a02ce3b15ab49a1f281b51494e51bc5eb0e57` passed CI #844, Integration Readiness #217, P12 Final Release Artifact #155 and P12 Offline Acceptance #199 on Ubuntu/macOS/Windows; it had zero unresolved review threads/comments, remained current with main and was reported mergeable by GitHub.
- PR #193 squash-merged as `e54cb44c3dabe6cd2a459f70df917b9422fadddd`; issue #192 closed completed. P14 remains runtime-unwired and production recipe authority remains empty.

## 2026-09-11 — R0 commercial market refresh

- Ran a fresh public-market scan against current UiChemy, Anima, Locofy, Builder.io and first-party Figma product/documentation pages.
- Retained the dated evidence and source URLs in `docs/R0_MARKET_SNAPSHOT_2026-09-11.md`; competitor claims are explicitly market signals rather than target-schema/API authority.
- Confirmed that generic `Figma -> code` generation is heavily commoditized and now overlaps with Figma's own code/agent direction.
- Reinforced the product moat as `Audit -> Target Compatibility -> Target-Ready Duplicate -> declared/native mapping -> artifact/environment validation -> render/round-trip proof -> receipt`.
- Added P15 planning requirement for Elementor/WordPress environment diagnostics with `DECLARED ENVIRONMENT` vs `OBSERVED ENVIRONMENT`; local JSON/ZIP validity cannot imply an unobserved live import.
- Promoted the target capability matrix to a user-facing commercial surface with explicit `NATIVE`, `NATIVE + CSS`, `VISUAL ASSET FALLBACK`, `MANUAL REVIEW` and `UNSUPPORTED` strategies and no silent fallback.
- Reinforced one neutral semantic IR across WordPress/code targets so users are not forced to re-tag/re-prepare the same safe intent for every adapter.
- Retained section-transfer speed as a product requirement while keeping documented artifacts / the versioned WP Builders Bridge ahead of undocumented private clipboard dependencies.
- Added durable decisions D-038 through D-042: verified readiness states are user-facing; Elementor environment truth stays evidence-scoped; shared IR should avoid unnecessary re-tagging; failed/refused generation is non-billable if credits are introduced; exact pricing remains evidence-driven rather than copied from competitors.
- Retained API/MCP/agent access as a later Pro/Agency differentiator after deterministic target contracts are accepted.
- No P13-P26 runtime implementation or acceptance credit was granted. #84 remains the internal P12 gate before implementation starts.

## 2026-09-11 — P12 publisher evidence intake hardening

- Corrected issue #84 body so release #20 / plugin ID `1680034649341961379` is the authoritative publishing candidate and old release #17 is retained only as historical runtime evidence.
- Opened issue #126 to make the final package/publisher/2FA evidence collection deterministic and fail-closed.
- Added `config/p12-publisher-candidate.json` with the exact release #20 source, plugin ID, artifact identity, exact publish ZIP SHA-256, extracted plugin file hashes, manifest contract and required evidence/attestations.
- Added `scripts/p12-publisher-evidence-intake.mjs` and `npm run p12:publisher-evidence`.
- Evidence intake verifies the exact publish ZIP SHA-256 and extracted `code.js`, `manifest.json`, `ui.html` hashes before accepting screenshot evidence.
- Intake rejects missing/empty/oversized/symlinked evidence, wrong or extra package files, manifest contract drift and missing operator confirmations.
- Runtime, Publish/Add-final-details and 2FA screenshots are hashed but never OCRed or machine-interpreted; live facts remain explicit operator attestations.
- Receipt semantics explicitly keep `acceptanceAuthority: false`, `screenshotsAreHashedNotInterpreted: true` and `finalInternalAcceptanceRequiresSeparateReview: true`.
- Added regression tests for the success path, extracted-file tamper, exact ZIP tamper, missing 2FA attestation and manifest semantic mismatch.
- Added `docs/P12_PUBLISHER_EVIDENCE_INTAKE.md` with the exact operator command and fail-closed behavior.
- PR #129 head `6a60ae540fa6fdacca8a30d73edd1ae3c61714e6` passed CI #730, P12 Offline Acceptance #85 and P12 Final Release Artifact #41, had no review/thread blockers, and squash-merged as `cc466367fa0c6fee119d4fb183371af5fb3f04c7`; issue #126 closed completed.
- P12 remains `80%`. The next genuine action is live release #20 runtime/publish/2FA screenshots -> deterministic intake receipt -> final internal exit review. P13 remains blocked.

## 2026-09-11 — Reliability/compatibility audit for P13-P26

- Completed the remaining post-plan housekeeping by merging PR #123 as `d34c026202ae6ecd8f88f71e6056d619578ce56f` after CI #723, Integration Readiness #158, P12 Offline Acceptance #78 and P12 Final Release Artifact #34 passed.
- Re-audited the post-P12 commercial plan against current official Figma, Elementor and WordPress/Gutenberg documentation.
- Added `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md` as a new recurring **R1** gate after R0 market/platform research and before major adapter implementation.
- Added the requirement that every adapter use an immutable versioned TargetProfile plus a machine-readable capability descriptor so the UI cannot submit stale/invalid target-option combinations.
- Added strict separation between SOURCE READY, ARTIFACT VALIDATED, IMPORT VERIFIED, RENDER VERIFIED and ROUND-TRIP VERIFIED so local package validation cannot be misrepresented as a real live-site guarantee.
- Hardened Elementor planning around separate v3 Container and v4 Atomic adapter families, explicit Core/Pro overlays, template-vs-ZIP-vs-kit separation, global-reference closure and real target import acceptance.
- Hardened Gutenberg planning around target-version contracts, parse/serialize stability and real editor-open validity checks.
- Added atomic target-package generation: temporary candidate -> validate -> finalize/checksum -> Download/Copy. Failed/cancelled partial artifacts are discarded.
- Added no-silent-fallback policy: native+CSS, visual asset, manual placeholder or unsupported fallbacks must be visible and recorded rather than substituted silently.
- Added a canonical target-export state machine, source staleness fingerprints, deterministic run/receipt identity, cooperative cancel/retry and bounded sequential job orchestration.
- Added structured target error codes and explicit FAILED_RECOVERABLE vs FAILED_BLOCKED outcomes instead of generic-only errors.
- Added generated-framework build matrices with pinned dependency versions; accepted artifacts may not use unbounded `latest` versions.
- Added code-import archive defenses for path traversal, zip bombs, excessive files/nesting and arbitrary JavaScript execution.
- Corrected asset semantics using official Figma APIs: image-fill stored bytes may be exported as `Stored Original`, while crop/mask/effects/layout appearance is a distinct rendered export. Stored bytes are not claimed as upstream-upload provenance.
- Retained raw-font policy: font identity/usage manifest from Figma; raw binaries only when separately user-supplied and license-permitted.
- Kept the Community core offline under `allowedDomains: ["none"]`; the preferred WP Builders Bridge is file/paste import first. Arbitrary direct customer-domain push remains a separately accepted future networked module.
- Added durable decisions D-031 through D-037 and synchronized AGENTS, README, PROJECT_STATE, NEXT_ACTIONS, ROADMAP, AI_NATIVE_PLAN and FEATURE_PLAN.
- First PR #124 attempt exposed a real status-contract failure because R0/R1 used `N/A` while only DEFERRED modules may use `N/A`; corrected the README to mark the gate definitions `100% / DEFINED-RECURRING` while preserving the requirement to execute each gate per adapter.
- PR #124 final head `10b025f62679191ec43dd5afd50e6e69e8e3fcc4` passed CI #726, Integration Readiness #161, P12 Offline Acceptance #81 and P12 Final Release Artifact #37 with no review/thread blockers.
- PR #124 squash-merged the R1 reliability/compatibility plan as `4d38c46c359bd030bf36100f4424760b1380db81`.
- No P13-P26 runtime implementation or acceptance percentage was granted; #84 remains the internal gate before P13 starts.

## 2026-09-11 — Market-researched multi-target commercial alignment

- Expanded the post-P12 roadmap from P13-P21 to P13-P26 around the user-requested sales/client-growth direction.
- Added recurring R0 AI-assisted market/platform research before major evolving target adapters; official platform documentation is preferred for technical format/API claims and competitor claims remain market signals only.
- Added target-ready duplicate preparation so incompatible source designs can be safely prepared for a selected target without destructively rewriting the approved original.
- Added planned native Elementor / Elementor Pro export with compatibility, alignment, widget, responsive, asset and package validation before JSON/ZIP/kit download where the documented target contract supports it.
- Added planned Gutenberg native block/pattern export and selected-section transfer.
- Added HTML/CSS/JS export and static-first code-to-design reconstruction; untrusted JavaScript execution remains disabled by default pending a separately accepted sandbox/companion specification.
- Added a neutral framework adapter platform for React, Next.js, Vue, Nuxt, Svelte/SvelteKit, Angular, Astro and later adapters. NestJS is explicitly treated as optional backend/API scaffolding paired with a front-end adapter rather than a visual renderer.
- Added asset pack planning for raster images, SVG/icons, source-oriented vs rendered/display-size/custom-scale image choices, font family/style/usage manifests and user-supplied licensed raw-font packaging only where technically/legal available.
- Added round-trip target rendering/visual diff, target capability matrix, existing-component bindings, change-only regeneration, optional `WP Builders Bridge`, CMS/dynamic mappings and stronger agency/project workflows.
- Added durable decisions D-023 through D-030 for research, target-ready duplication, versioned adapter validation, documented WordPress transfer, code-import sandboxing, honest asset/font export, framework adapter isolation and round-trip QA.
- Updated issue #119 as the P13-P26 owner. No runtime/plugin feature or acceptance percentage was granted; P13 implementation remains blocked until #84 internal P12 exit genuinely closes.
- Retained the previous detailed history byte-for-byte in `memory-bank/CHANGELOG_ARCHIVE_PRE_MULTI_TARGET.md`.
- PR #122 head `40831f61a07036d233dbf7cad8a5396c0010641f` passed CI #721, Integration Readiness #156, P12 Offline Acceptance #76 and P12 Final Release Artifact #32 with no review/thread blockers.
- PR #122 squash-merged the researched multi-target planning baseline as `ade501fedb8c810b4964eb3dda414c58450e8565`.
- Planning changes do not replace the retained P12 publishing candidate or grant P13-P26 implementation/runtime acceptance.

## Historical archive

Detailed history before this roadmap alignment is retained byte-for-byte in:

`memory-bank/CHANGELOG_ARCHIVE_PRE_MULTI_TARGET.md`