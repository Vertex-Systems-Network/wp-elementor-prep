# Project State

Last updated: 2026-09-11

## Product

`wp-elementor-prep` ships as **WP Builders Prepare**: a deterministic Figma audit/safe-prep engine focused first on WordPress Elementor.

Implemented surfaces today:

1. normal Figma plugin packaging/distribution layer;
2. npm/Node CLI for supported Figma inputs;
3. structured continuous-improvement backlog outputs;
4. exact-build release/provenance and fail-closed P12 publisher-evidence intake tooling.

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
- capability-driven UI prevents invalid option combinations;
- target/package/live-environment validation states remain separate;
- no silent fallback to a different widget/block/code strategy;
- implementation-complete != production-accepted;
- no fabricated runtime/external evidence.

## Current issue queue

- #84 — P12 final integrated validation/release acceptance: **ACTIVE / external-manual-runtime blocked**, retained at 80% until the exact publishing package/account/2FA/final-exit evidence is genuinely retained. Community approval remains external.
- #119 — post-P12 P13-P26 commercial/multi-target roadmap: **PLANNED / dependency-blocked by #84 internal exit**. Research/reliability planning may progress; runtime implementation may not start yet.
- #126 — exact release #20 publisher evidence intake hardening: **COMPLETED** through PR #129.

## Current PR queue

- PR #122 merged the researched P13-P26 planning baseline as `ade501fedb8c810b4964eb3dda414c58450e8565`.
- PR #123 merged post-plan status synchronization as `d34c026202ae6ecd8f88f71e6056d619578ce56f`.
- PR #124 merged the R1 reliability/compatibility audit as `4d38c46c359bd030bf36100f4424760b1380db81`.
- PR #129 merged P12 publisher evidence intake tooling as `cc466367fa0c6fee119d4fb183371af5fb3f04c7` after CI #730, P12 Offline Acceptance #85 and P12 Final Release Artifact #41 passed.
- This status-sync branch is documentation-only and is intended to leave the open PR/MR count at `0` after merge.

## Current planning baseline

The commercial plan has two recurring pre-implementation gates plus phases P13-P26:

- **R0 — Market/Platform Research:** AI-assisted public research + official-platform verification before major externally evolving adapters.
- **R1 — Reliability/Compatibility Gate:** explicit target profile, capability matrix, option-state contract, structured errors, atomic export, target validator and acceptance harness before implementation.

Research is advisory and neither R0 nor R1 overrides safety or counts as runtime acceptance.

Canonical docs:

- `docs/MARKET_RESEARCH_PLAN.md`;
- `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md`;
- `docs/COMMERCIAL_EXPANSION_PLAN.md`;
- `docs/AI_NATIVE_PLAN.md`;
- `docs/FEATURE_PLAN.md`;
- `docs/P12_PUBLISHER_EVIDENCE_INTAKE.md`.

## Reliability audit conclusions

The P13-P26 direction remains commercially strong, but the reliable product contract requires:

- immutable versioned `TargetProfile` per run;
- machine-readable adapter capability descriptors that generate valid UI options;
- stale validation invalidation whenever target/source/options change;
- separate `SOURCE READY`, `ARTIFACT VALIDATED`, `IMPORT VERIFIED`, `RENDER VERIFIED` and `ROUND-TRIP VERIFIED` states;
- no claim that an offline-valid WordPress package is guaranteed to import on an unobserved site;
- separate Elementor v3 Container and v4 Atomic adapter families rather than one generic exporter;
- explicit Pro/third-party capability declarations;
- Gutenberg parse/serialize/editor validation;
- generated framework projects must compile/build under pinned adapter matrices;
- image export must distinguish stored original image bytes from rendered appearance;
- raw font binaries remain user-supplied/license-permitted only;
- export jobs use a strict state machine, bounded concurrency, cooperative cancel, deterministic retry and atomic final download;
- stable error codes and actionable recovery instead of generic-only failures;
- direct arbitrary WordPress-domain push remains outside the offline Community core; bridge file/paste import is preferred first.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Maintain issues/PR/R0/R1/evidence sync |
| P0-P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P6 advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P7 batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P8 historical exporter placeholder | DEFERRED / SUPERSEDED | N/A | Replaced by P15+ neutral adapter architecture |
| P9 backlog generator | COMPLETE / P12 ACCEPTED | 100% | Retained real plugin export quality |
| P10 npm/CLI | COMPLETE / P12 ACCEPTED | 100% | Retained real REST/auth/plugin parity |
| P11 Figma distribution | IMPLEMENTATION COMPLETE | 100% | Live publisher/install evidence belongs to P12 |
| P12 final validation | IN PROGRESS | 80% | Run exact #20 evidence intake from live runtime/publish/2FA screenshots, then final internal exit review |
| R0 market/platform research | PLANNING GATE | N/A | Refresh before each major adapter |
| R1 reliability/compatibility | PLANNING GATE | N/A | Freeze adapter/profile/validation/error contracts before implementation |
| P13-P26 multi-target commercial expansion | PLANNED / BLOCKED | 0% | Do not implement before #84 internal exit |

Historical P0-P7 core progress remains 100%.

## Approved user-facing future flow

`Choose source -> Choose target/profile -> Audit -> Compatibility -> Build/Target-Ready Score -> Responsive Risk -> Create Target-Ready Duplicate if needed -> Validate -> Generate atomically -> Validate artifact -> Verify real target when available -> Round-trip QA -> Receipt -> Download/Copy/Import -> Handoff/QA`

## P12 publishing candidate truth

The publishing-ID candidate under manual evaluation was produced from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`, P12 Final Release Artifact #20, artifact ID `10179286885`, digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`.

Exact three-file publish ZIP SHA-256: `1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

`config/p12-publisher-candidate.json` now machine-pins the exact candidate. `npm run p12:publisher-evidence` verifies the exact ZIP + extracted plugin files, hashes the required screenshots, requires explicit operator attestations, and emits `acceptanceAuthority: false` so the tool cannot self-close P12.

Planning/docs/support-tool changes after source `5f12...` do not automatically replace the runtime candidate or count as live acceptance.

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3 and remains authoritative for exact-build runtime provenance.

## Immediate target

Do **not** start P13 runtime implementation.

Immediate executable product path remains #84:

1. use the exact release #20 ZIP + extracted three-file directory;
2. retain live Figma Desktop runtime screenshot, Publish/Add-final-details screenshot and Figma 2FA screenshot;
3. run `npm run p12:publisher-evidence -- ...` and retain the receipt;
4. perform final P12 internal exit review against receipt + screenshots;
5. only then open the focused P13 implementation issue;
6. run R0 + R1 before each major external target adapter;
7. implement only after target profile, capability matrix, error model, validator and acceptance harness are frozen.
