# Decisions

## D-001 — Core runtime is AI-free
Date: 2026-09-07  
Status: ACCEPTED

Core audit/refactor correctness must not depend on generative AI, external model APIs, or token/credit availability.

## D-002 — Audit before mutation
Date: 2026-09-07  
Status: ACCEPTED

No recipe may auto-fix a layout before the plugin can detect, score and explain that pattern read-only.

## D-003 — Conservative confidence model
Date: 2026-09-07  
Status: ACCEPTED

Low-confidence ambiguity produces REVIEW, not a guessed transformation.

## D-004 — Candidate transaction model
Date: 2026-09-07  
Status: ACCEPTED

Transformations operate on cloned candidates and are committed only after validation. Failure discards the candidate and preserves the source.

## D-005 — Visual design is authoritative
Date: 2026-09-07  
Status: ACCEPTED

Structural cleanup may not redesign typography, imagery, color, content or visual composition merely to make implementation easier.

## D-006 — Neutral internal model
Date: 2026-09-07  
Status: ACCEPTED

The Figma scanner/classifier uses a neutral semantic layout model. Target exporters are isolated behind versioned adapters.

## D-007 — Selected-frame MVP
Date: 2026-09-07  
Status: ACCEPTED

Version 0.1 processes one selected desktop frame. Multi-page scanning waits until single-frame accuracy/performance is proven.

## D-008 — Offline manifest
Date: 2026-09-07  
Status: ACCEPTED

Core plugin uses dynamic page access and no network domains.

## D-009 — Memory-bank is mandatory
Date: 2026-09-07  
Status: ACCEPTED

Project state, decisions, roadmap, next actions and changelog are persisted in-repo so work can resume without chat history.

## D-010 — Separate geometry, semantics and visual roles
Date: 2026-09-07  
Status: ACCEPTED

Geometric layout classification, semantic interpretation and preservation roles are separate signals.

## D-011 — Specific pattern wins on the same target
Date: 2026-09-07  
Status: ACCEPTED

When one target satisfies multiple geometric classifiers, report the most specific valid interpretation rather than redundant generic ones.

## D-012 — Issues-first, PR/MR-second development lifecycle
Date: 2026-09-08  
Status: ACCEPTED

Every meaningful work cycle processes open Issues, then open PR/MR work, then new roadmap development. README/memory-bank status is synchronized after meaningful work. Runtime/manual evidence is never fabricated.

## D-013 — Backlog is a first-class product output
Date: 2026-09-10  
Status: ACCEPTED

Audit/prep findings must be convertible into a deterministic structured backlog with ERROR/WARNING/INFO/IMPROVEMENT categories.

## D-014 — Plugin and CLI share one deterministic core
Date: 2026-09-10  
Status: ACCEPTED

Plugin and CLI share scanner/classifier/scoring/backlog logic. Input acquisition is isolated behind source adapters. Proprietary raw `.fig` parsing through undocumented reverse engineering is refused.

## D-015 — Product ships as a normal Figma plugin
Date: 2026-09-10  
Status: ACCEPTED

Release planning includes normal Figma plugin packaging/distribution, not only development-plugin import. Community publication remains subject to Figma review.

## D-016 — Final manual/runtime acceptance is batched in P12
Date: 2026-09-10  
Status: ACCEPTED

Implementation-complete and production-accepted remain separate. P12 is the integrated runtime/release acceptance gate; static CI cannot fabricate real Figma evidence.

## D-017 — Product expands toward a build-ready workflow
Date: 2026-09-11  
Status: ACCEPTED

Post-P12 direction is a deterministic Figma -> build-ready website workflow, with Elementor first and future targets behind adapters.

## D-018 — Responsive analysis reports risk; it does not invent designs
Date: 2026-09-11  
Status: ACCEPTED

The responsive engine may detect likely breakpoint failure/clipping/inflexibility but may not fabricate tablet/mobile composition or silently reorder content.

## D-019 — Commercial and account layers stay outside deterministic correctness
Date: 2026-09-11  
Status: ACCEPTED

Free/Pro/Agency entitlements gate surfaces, not enabled-feature correctness. No design content is sent externally merely to verify a license.

## D-020 — Complexity/effort estimation is transparent and configurable
Date: 2026-09-11  
Status: ACCEPTED

The base estimator uses inspectable factors/weights and user-configurable monetary rules, not opaque AI market-price guesses.

## D-021 — Optional AI is non-authoritative
Date: 2026-09-11  
Status: ACCEPTED

AI may explain/summarize/draft from deterministic outputs but may not authorize mutation, override confidence, replace validation, change score evidence or silently invent responsive layouts.

## D-022 — P13 implementation is gated by P12 internal exit
Date: 2026-09-11  
Status: ACCEPTED

Planning/research for P13+ may proceed, but runtime implementation must not begin until the internal P12 release-exit gate in #84 closes. Community approval remains external.

## D-023 — Market/platform research is a recurring AI-native gate
Date: 2026-09-11  
Status: ACCEPTED

Before implementing a major externally evolving target adapter/capability, AI-assisted public research must refresh official platform documentation, competitor baseline, feasibility, privacy/network/licensing risks and differentiation opportunities.

Research informs planning only. Competitor marketing claims never count as runtime acceptance evidence.

Canonical process: `docs/MARKET_RESEARCH_PLAN.md`.

## D-024 — Target-ready duplication precedes target-specific mutation/export when needed
Date: 2026-09-11  
Status: ACCEPTED

When a Figma source is not target-ready but deterministic preparation is safe, WP Builders Prepare should create a target-ready duplicate/candidate and preserve the approved original.

The duplicate follows the existing transaction/validation rules. Export is not a justification for destructively rewriting the source design.

## D-025 — Target artifacts require versioned adapters and validation
Date: 2026-09-11  
Status: ACCEPTED

Elementor, Gutenberg and code/framework outputs must use explicit versioned adapters that declare supported target versions/capabilities and validate generated schema/package/assets before claiming readiness.

A successful serializer alone is not sufficient evidence of a valid importable artifact.

## D-026 — WordPress transfer uses documented formats or our own bridge
Date: 2026-09-11  
Status: ACCEPTED

Elementor/Gutenberg section portability should prefer documented template/block/pattern structures and an optional versioned `WP Builders Bridge` companion plugin when direct transfer is needed.

Undocumented private Elementor clipboard internals are not a production dependency.

## D-027 — Code-to-design import is static-first and untrusted JavaScript is sandboxed
Date: 2026-09-11  
Status: ACCEPTED

HTML/CSS can be parsed/reconstructed without executing arbitrary application code. JavaScript execution is OFF by default and requires a separately accepted sandbox/companion architecture with bounded capabilities.

Imported code produces a new reconstruction; it does not silently mutate an approved Figma design.

## D-028 — Asset/font export must state what is actually obtainable
Date: 2026-09-11  
Status: ACCEPTED

Image/vector exports must identify whether bytes are source-oriented/original where genuinely available or rendered/scaled from the Figma design.

Figma font identities/usages may be exported as a manifest, but raw font binaries are not promised from Figma when the Plugin API does not expose them. Raw font packaging requires separately user-supplied, license-permitted font files.

## D-029 — Framework coverage is an adapter platform, not core branching
Date: 2026-09-11  
Status: ACCEPTED

React/Next/Vue/Nuxt/Svelte/Angular/Astro and future framework outputs consume one neutral component/layout intermediate representation plus target adapters. New framework support must not fork or contaminate the deterministic scanner/classifier.

NestJS is treated as optional backend/API scaffolding paired with a front-end adapter rather than a visual rendering target.

## D-030 — Round-trip target rendering is the preferred export quality gate
Date: 2026-09-11  
Status: ACCEPTED

Where a supported target can be rendered in a controlled harness, generated output should be compared back to the Figma source using geometry/content/assets/pixel evidence before production acceptance.

Unsupported or excessive drift produces REVIEW/BLOCKED rather than a false success.

## D-031 — Reliability/compatibility is a mandatory R1 gate
Date: 2026-09-11  
Status: ACCEPTED

After R0 research and before implementing a major target adapter, the project must freeze a versioned TargetProfile, capability descriptor, option-state rules, error/retry model, atomic generation contract, validators and target-specific acceptance harness.

Canonical specification: `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md`.

Reason: commercial breadth is not useful if target options can combine into unsupported states or if the UI can present a false success.

## D-032 — Target UI is capability-driven and stale validation is invalidated
Date: 2026-09-11  
Status: ACCEPTED

Each adapter exposes machine-readable capabilities. Product UI enables only combinations the active adapter declares as SUPPORTED or explicitly SUPPORTED_WITH_REVIEW.

Changing target, target version, adapter family, output mode or other compatibility-affecting settings invalidates prior validation and clears incompatible dependent options.

No hidden stale UI value may be allowed to submit an otherwise invalid combination.

## D-033 — Artifact validation and real target verification are distinct truths
Date: 2026-09-11  
Status: ACCEPTED

A locally generated package may be marked ARTIFACT VALIDATED after deterministic schema/package/reference/assets checks, but it may not be presented as IMPORT VERIFIED, RENDER VERIFIED or ROUND-TRIP VERIFIED unless the corresponding real supported target behavior was actually observed.

In particular, offline Elementor/Gutenberg package validation cannot guarantee a customer's unobserved WordPress server configuration.

## D-034 — Elementor v3 Container and v4 Atomic are separate adapter families
Date: 2026-09-11  
Status: ACCEPTED

Elementor export must not assume one timeless schema. Initial accepted Elementor families are planned separately for v3 Container-oriented output and v4 Atomic-oriented output, with Pro capabilities declared as overlays only where documented/tested.

Hybrid sites may choose an intended output family; the generator does not silently mix architectures by default.

## D-035 — Export/package generation is atomic and never silently falls back
Date: 2026-09-11  
Status: ACCEPTED

A target artifact is generated into a temporary candidate, validated, finalized and checksummed before Download/Copy becomes available. Failed or cancelled candidates are discarded.

If a native mapping is unavailable, the product must expose the fallback choice (for example native+scoped CSS, visual asset, manual placeholder or unsupported) rather than silently substituting another implementation strategy.

## D-036 — Community core remains offline; WordPress bridge is file/paste first
Date: 2026-09-11  
Status: ACCEPTED

The current Community core keeps `allowedDomains: ["none"]`. Arbitrary direct push from Figma to customer WordPress domains is not part of the core contract because target sites use arbitrary domains and would broaden network permissions materially.

The preferred `WP Builders Bridge` path is downloadable/importable file or explicit paste payload inside WordPress admin. Any future direct authenticated push is a separately accepted networked module with its own privacy/security/manifest review.

## D-037 — Figma image export distinguishes stored original bytes from rendered appearance
Date: 2026-09-11  
Status: ACCEPTED

For Figma image fills, `getImageByHash(...).getBytesAsync()` may provide the encoded image bytes stored by Figma. That is labeled `Stored Original`, while crop/mask/effects/layout appearance is exported separately as a rendered result.

The product must not claim those stored bytes prove the upstream user-upload provenance when Figma does not expose that provenance.

## D-038 — Verified readiness states are a product feature, not internal-only metadata
Date: 2026-09-11  
Status: ACCEPTED

Market research confirms that generic design-to-code generation is crowded, including first-party Figma direction. WP Builders Prepare therefore differentiates by making reliability states visible to users: `ARTIFACT VALIDATED`, `IMPORT VERIFIED`, `RENDER VERIFIED`, `ROUND-TRIP VERIFIED`, `REVIEW` and `BLOCKED` where applicable.

These labels may only be earned by the corresponding evidence; they are never marketing aliases for an unobserved target environment.

## D-039 — Elementor readiness includes environment diagnostics without pretending the server was observed
Date: 2026-09-11  
Status: ACCEPTED

P15 must distinguish Figma/design compatibility, generated package validity and WordPress/Elementor environment compatibility. Target version, Core/Pro profile, upload/import limits, memory/time/security/REST constraints and similar environment facts are reported only when explicitly declared or actually observed.

`DECLARED ENVIRONMENT` and `OBSERVED ENVIRONMENT` are separate. A locally valid JSON/ZIP cannot become `IMPORT VERIFIED` merely because common hosting requirements are known.

## D-040 — Shared semantic IR should prevent unnecessary re-tagging across targets
Date: 2026-09-11  
Status: ACCEPTED

When layout/component/token intent can be inferred safely once, Elementor, Gutenberg, HTML and framework adapters should consume the same neutral semantic representation rather than forcing the user to re-tag/re-prepare the same source separately for every target.

Each adapter still owns its own capability limits and may return REVIEW/UNSUPPORTED. Shared IR is not permission for lossy or silent target conversion.

## D-041 — Failed or refused generation is non-billable if usage credits are introduced
Date: 2026-09-11  
Status: ACCEPTED

If P25 later adopts credits or usage units, validation refusal, failed generation and cancellation before the defined successful-artifact boundary must not consume paid usage. Entitlement charging occurs only after the product-defined successful generation boundary.

Correctness validators are always enforced regardless of tier, and this decision does not itself require a credit-based pricing model.

## D-042 — Pricing is an evidence-driven hypothesis until target value is accepted
Date: 2026-09-11  
Status: ACCEPTED

Competitor prices are point-in-time market signals, not a price list to copy. Free / Pro / Agency remains the packaging hypothesis, but exact price points should not be frozen until accepted P15-P20 workflows provide evidence about user value, support burden, conversion friction and operating cost.

Current research snapshot: `docs/R0_MARKET_SNAPSHOT_2026-09-11.md`.
