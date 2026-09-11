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
