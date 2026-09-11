# Project State

Last updated: 2026-09-11

## Product

`wp-elementor-prep` ships as **WP Builders Prepare**: a deterministic Figma audit/safe-prep engine focused first on WordPress Elementor.

Implemented surfaces today:

1. normal Figma plugin packaging/distribution layer;
2. npm/Node CLI for supported Figma inputs;
3. structured continuous-improvement backlog outputs.

Approved post-P12 direction is now broader: **Figma -> validated target-ready website/build output**, with Elementor first, Gutenberg second, then generic web/framework adapters through a neutral model.

## Non-negotiable policy

- deterministic/AI-free core correctness;
- current core plugin network-free;
- audit before mutation;
- low confidence => REVIEW;
- original design authoritative;
- target preparation happens on candidate/duplicate with validation;
- no undocumented reverse engineering when a documented adapter/bridge is possible;
- responsive risk may be reported but mobile/tablet composition is not invented;
- target adapters are versioned and isolated;
- implementation-complete != production-accepted;
- no fabricated runtime/external evidence.

## Current issue queue

- #84 — P12 final integrated validation/release acceptance: **ACTIVE / external-manual-runtime blocked**, retained at 80% until the exact publishing package/account/2FA/final-exit evidence is genuinely retained. Community approval remains external.
- #119 — post-P12 P13-P26 commercial/multi-target roadmap: **PLANNED / dependency-blocked by #84 internal exit**. Research/planning docs may progress; runtime implementation may not start yet.

## Current PR queue

PR #122 merged the researched P13-P26 planning baseline as `ade501fedb8c810b4964eb3dda414c58450e8565` after CI #721, Integration Readiness #156, P12 Offline Acceptance #76 and P12 Final Release Artifact #32 passed. The current post-merge status-sync PR is documentation-only and is intended to leave the open PR/MR count at `0` after merge.

## Current planning baseline

The commercial plan now includes a recurring **R0 market/platform intelligence gate** and phases P13-P26.

R0 requires AI-assisted public research plus official-platform verification before major target adapters are implemented. Research is advisory and does not override safety or count as runtime acceptance.

Canonical docs:

- `docs/MARKET_RESEARCH_PLAN.md`;
- `docs/COMMERCIAL_EXPANSION_PLAN.md`;
- `docs/AI_NATIVE_PLAN.md`;
- `docs/FEATURE_PLAN.md`.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Maintain issues/PR/research/evidence sync |
| P0-P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P6 advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P7 batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P8 historical exporter placeholder | DEFERRED / SUPERSEDED | N/A | Replaced by P15+ neutral adapter architecture |
| P9 backlog generator | COMPLETE / P12 ACCEPTED | 100% | Retained real plugin export quality |
| P10 npm/CLI | COMPLETE / P12 ACCEPTED | 100% | Retained real REST/auth/plugin parity |
| P11 Figma distribution | IMPLEMENTATION COMPLETE | 100% | Live publisher/install evidence belongs to P12 |
| P12 final validation | IN PROGRESS | 80% | Exact publish-ID package/account/2FA/exit review |
| P13-P26 multi-target commercial expansion | PLANNED / BLOCKED | 0% | Do not implement before #84 internal exit |

Historical P0-P7 core progress remains 100%.

## Approved user-facing future flow

`Choose source -> Choose target -> Audit -> Target Compatibility -> Build/Target-Ready Score -> Responsive Risk -> Create Target-Ready Duplicate if needed -> Validate -> Generate target artifact -> Validate package/schema/assets -> Round-trip preview/diff -> Download/Copy/Import -> Handoff/QA`

## Requested target capabilities now represented in plan

- Elementor/Elementor Pro/WordPress native template JSON/ZIP/kit strategy with validation;
- automatic target-ready duplicate preparation before export;
- selected-section Elementor transfer through documented artifact/optional bridge path;
- Gutenberg native block/pattern export + section transfer;
- HTML/CSS/JS export;
- HTML/CSS static-first code-to-design reconstruction, with JS sandbox requirements;
- React/Next/Vue/Nuxt/Svelte/Angular/Astro adapter platform;
- NestJS treated as optional backend/API scaffold paired with front-end output, not as a visual renderer;
- asset/image/icon export with source-vs-rendered sizing policy;
- font manifest and user-supplied licensed font-file packaging only where legally/technically available;
- round-trip target visual QA;
- existing component-library bindings;
- change-only regeneration;
- agency/project/white-label/estimator features;
- optional AI for research/explanation/drafting only.

## P12 publishing candidate truth

The publishing-ID candidate under manual evaluation was produced from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`, P12 Final Release Artifact #20, artifact ID `10179286885`, digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`.

Planning/docs changes after that source do not automatically replace the runtime candidate or count as live acceptance.

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains authoritative for exact-build runtime provenance.

## Immediate target

Do **not** start P13 runtime implementation.

Immediate executable product path remains #84:

1. retain live evidence for the exact publishing package selected for exit;
2. confirm intended publisher identity/eligibility and required 2FA;
3. perform final P12 internal exit review;
4. only then open the focused P13 implementation issue;
5. run R0 research refresh before each major external target adapter.
