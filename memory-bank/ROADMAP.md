# Roadmap

Last updated: 2026-09-11

| Module / Phase | Scope | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---|---:|---|---|
| AI-native governance/tooling | Memory-bank, issue/PR-first lifecycle, CI/integration/artifact tooling | COMPLETE | 100% | `██████████` | Keep status, issue ownership and artifact provenance synchronized |
| P0 | Specification, architecture, repository foundation | COMPLETE | 100% | `██████████` | None |
| P1 | Audit-only scanner, discovery, scoring, report UI | COMPLETE | 100% | `██████████` | None |
| P2 | Deterministic classifier semantics + evidence | COMPLETE | 100% | `██████████` | None |
| P3 | Geometry/content/image + rendered-pixel validation | COMPLETE | 100% | `██████████` | None |
| P4 | Candidate transaction + rollback | COMPLETE | 100% | `██████████` | None |
| P5 | Conservative Safe Fix recipes + exact-build proof | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained real Desktop/runtime closure |
| P6 | Advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained real positive/refusal closure |
| P7 | Sequential multi-frame batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained 64-Frame stress + cancellation closure |
| P8 | Optional Elementor schema exporters | DEFERRED | N/A | `──────────` | Re-evaluate only behind neutral/versioned adapters |
| P9 | Actionable backlog generator | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real plugin export quality retained |
| P10 | npm/Node CLI + source adapters | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real REST/auth/plugin parity retained |
| P11 | Normal Figma plugin distribution | IMPLEMENTATION COMPLETE | 100% | `██████████` | Current publish-ID package needs final live publisher/install evidence under P12 |
| P12 | Final integrated validation/release acceptance | IN PROGRESS | 80% | `████████░░` | Close current publish-ID install/publisher/2FA/exit review gates in #84; Community approval remains external |
| P13 | Build-Ready Score 2.0 + Responsive Risk | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Do not implement until P12 internal exit closes |
| P14 | Advanced Safe Fix + guided Prepare Frame | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Requires P13 read-only detectors and P12 exit |
| P15 | Elementor Readiness + deterministic Build Plan | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Requires stable P13/P14 contracts; keep adapter boundary |
| P16 | Design-system detector + token advisory | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Read-only first; no token mutation without separate spec |
| P17 | Developer handoff + client/QA readiness | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Build on P13-P16 structured outputs |
| P18 | Deterministic complexity/effort estimator | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Transparent/configurable factors only |
| P19 | Agency presets, custom rules, white label, project workflows | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Requires stable report/estimator contracts |
| P20 | Free / Pro / Agency packaging + entitlements | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Keep payments/account layer outside deterministic core |
| P21 | Optional AI assistance | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Isolated opt-in explainer layer only; never authoritative |

## Progress interpretation

**Historical core P0-P7 progress:** `██████████ 100%`

P0-P7 remain the original production core denominator and are complete.

**P12 final validation:** `████████░░ 80%`.

P13-P21 are newly approved future scope and are intentionally tracked as `PLANNED / BLOCKED` at 0%. Their addition does not reduce the already-completed historical core percentage and grants no implementation credit.

## Current P12 truth

P9 real-plugin export quality and P10 real REST/auth/plugin parity are accepted. The previous exact installed/private release flow was also observed successfully.

Figma's live publishing flow later rejected the previous development manifest ID for Community publishing. A Figma-assigned publishing ID `1680034649341961379` was generated, PR #118 rebound the release workflow, and current main became `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`.

Fresh main verification for that publishing identity passed:

- CI #709;
- Integration Readiness #145;
- P12 Offline Acceptance #64 on Linux/macOS/Windows;
- P12 Final Release Artifact #20;
- authoritative artifact `wp-builders-prepare-final-release-20`, artifact ID `10179286885`;
- artifact digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`.

The current P12 percentage does **not** advance from these static/offline facts alone. Remaining internal acceptance requires retained live evidence for the current publish-ID package/account flow, including intended publisher identity/eligibility, 2FA where required, and final exit review. Actual Community review/approval remains external.

## P13-P21 execution order

The post-P12 commercial roadmap is owned by #119 and specified in `docs/COMMERCIAL_EXPANSION_PLAN.md`.

Dependency order:

1. P13 proves read-only Build-Ready/Responsive Risk detection and versioned scoring.
2. P14 may mutate only conditions already detected/explained by P13 or earlier accepted classifiers.
3. P15 consumes the neutral model and produces Elementor guidance through adapter boundaries.
4. P16 adds read-only design-system/token advisory.
5. P17 assembles deterministic handoff and QA reports from accepted structured outputs.
6. P18 adds transparent/configurable effort estimation.
7. P19 layers agency presets, bounded custom rules, white label and project workflows.
8. P20 defines commercial tiers/entitlements without coupling correctness to payment/network availability.
9. P21 adds optional AI explanation/drafting only after deterministic outputs exist.

No later phase may weaken audit-before-mutate, confidence gating, transaction safety, visual-authority, offline-core or evidence requirements.

## Runtime artifact registry

The artifact is registered in `config/runtime-artifacts.json` schema v3 as the operational provenance contract for retained exact-build runtime artifacts.

## Execution policy

For every work cycle:

1. Issues first;
2. PR/MR second;
3. highest-priority unblocked roadmap obligation next;
4. tests/verification before acceptance claims;
5. README + memory-bank synchronization in the same cycle;
6. no synthetic runtime/external evidence;
7. implementation-complete and production-accepted remain separate states.
