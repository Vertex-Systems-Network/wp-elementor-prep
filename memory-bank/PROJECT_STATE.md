# Project State

Last updated: 2026-09-11

## Product

`wp-elementor-prep` ships as **WP Builders Prepare**: a deterministic Figma audit/safe-prep engine focused first on WordPress Elementor.

Implemented user surfaces:

1. normal Figma plugin packaging/distribution layer;
2. npm/Node CLI for supported Figma inputs;
3. structured continuous-improvement backlog outputs.

Post-P12 product direction is now approved as a broader deterministic **Figma -> build-ready website workflow**, with Elementor first and future targets isolated behind adapters.

## Non-negotiable policy

- core audit/scoring/Safe Fix remains deterministic and AI-free;
- core plugin remains network-free unless a later separately accepted optional layer changes that contract;
- audit before mutation;
- low confidence => REVIEW, not mutation;
- original visual design is authoritative;
- all mutations remain candidate -> validate -> commit/rollback;
- responsive analysis may report risk but may not invent tablet/mobile composition;
- Elementor guidance uses modern nested-container intent and versioned adapters;
- implementation-complete and production-accepted remain separate states;
- no runtime/external evidence is fabricated.

## Current repository baseline

PR #120 merged the P13-P21 commercial-planning baseline as:

`03b7ca6cf03229b606325a6719958afae1d4d564`

That merge changed planning/status documentation only. It did not add P13 runtime behavior and does not grant P12 or P13 acceptance credit.

The exact P12 publishing-ID package currently under manual evaluation was produced from source:

`5f12b1d28146d5c2af815cc9f83eb30431dce4b5`

PR #118 replaced the previous publishing-invalid manifest identity with Figma-assigned plugin ID:

`1680034649341961379`

Verification on that publishing candidate passed:

- CI #709;
- Integration Readiness #145;
- P12 Offline Acceptance #64 on Linux/macOS/Windows;
- P12 Final Release Artifact #20;
- artifact `wp-builders-prepare-final-release-20`, ID `10179286885`;
- artifact digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`.

Subsequent planning-only commits do not by themselves constitute new runtime acceptance. P12 exit review must explicitly identify the exact publishing package whose live evidence is being accepted.

Static/offline verification does not by itself close live publisher/runtime gates.

## Current issue queue

- #84 — P12 final integrated validation/release acceptance: **ACTIVE / external-manual-runtime blocked**, retained at 80% until the current publish-ID package/account flow and final exit review are genuinely retained. Community review/approval remains external.
- #119 — P13+ Commercial expansion roadmap: **PLANNED / dependency-blocked by #84 internal exit**. Planning/docs are approved and merged; implementation is not authorized yet.

All earlier P5/P6/P7 production issues are closed completed. P8 exporter remains deferred.

## Current PR queue

`0` open PR/MR after the P13-P21 planning merge and this post-merge status synchronization.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep Issues/PR/status/provenance synchronized |
| P0-P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P6 advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P7 batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | None |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate behind neutral/versioned adapters |
| P9 backlog generator | COMPLETE / P12 ACCEPTED | 100% | Retained real plugin export quality |
| P10 npm/CLI | COMPLETE / P12 ACCEPTED | 100% | Retained real REST/auth/plugin parity |
| P11 Figma plugin distribution | IMPLEMENTATION COMPLETE | 100% | Current publish-ID live install/publisher evidence still belongs to P12 |
| P12 final validation | IN PROGRESS | 80% | Current publish-ID package/account/2FA/exit review; Community approval external |
| P13-P21 commercial expansion | PLANNED / BLOCKED | 0% | Do not implement before #84 internal exit |

Historical P0-P7 core progress remains `100%` under its original denominator. New future scope does not retroactively lower completed-core progress.

## P12 accepted technical slices

Retained acceptance includes:

- cross-platform offline CLI/release behavior;
- P5 real Desktop Safe Fix/runtime closure;
- P6 real positive/refusal closure;
- P7 real 64-Frame sequential stress + active cancellation closure;
- P9 real plugin backlog/report export quality;
- P10 credentialed REST execution, auth/error behavior and plugin/CLI parity;
- previous exact installed/private package runtime observation.

The live Community publishing flow then exposed that the prior development plugin ID was not valid as the publishing identity. That discovery correctly reopened the publishing-identity packaging path without invalidating earlier runtime observations of the deterministic core.

## Post-P12 commercial roadmap

Issue #119 and `docs/COMMERCIAL_EXPANSION_PLAN.md` define the approved future sequence:

- P13 — Build-Ready Score 2.0 + Responsive Risk;
- P14 — Advanced Safe Fix + guided Prepare Frame;
- P15 — Elementor Readiness + deterministic Build Plan;
- P16 — design-system detector + token advisory;
- P17 — developer handoff + client/QA readiness;
- P18 — deterministic complexity/effort estimator;
- P19 — agency presets/custom rules/white-label/project workflows;
- P20 — Free / Pro / Agency packaging + entitlement boundaries;
- P21 — optional AI assistance, isolated and non-authoritative.

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3.

The registry/provenance system remains authoritative for exact-build runtime artifacts. P13+ planning does not weaken archive, manifest-semantic, immutable-file, evidence or verifier gates.

## Immediate target

Do **not** begin P13 implementation yet.

Immediate product/release target remains #84:

1. retain live evidence for the exact publishing-ID package/account flow selected for P12 exit;
2. confirm intended publisher identity/eligibility and 2FA where Figma requires it;
3. perform the final P12 release-exit review without conflating submission with approval;
4. only then unblock P13 implementation through a focused issue/branch/PR.
