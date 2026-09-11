# Changelog

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
