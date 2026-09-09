# Roadmap

Last updated: 2026-09-10

| Module / Phase | Scope | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---|---:|---|---|
| AI-native governance/tooling | Memory-bank, issue/PR-first lifecycle, CI/integration/artifact tooling | COMPLETE | 100% | `██████████` | Keep status + artifact registry synchronized after every batch |
| P0 | Specification, architecture, repository foundation | COMPLETE | 100% | `██████████` | None |
| P1 | Audit-Only scanner, discovery, scoring, report UI | COMPLETE | 100% | `██████████` | None |
| P2 | Deterministic classifier semantics + evidence | COMPLETE | 100% | `██████████` | None |
| P3 | Geometry/content/image + rendered-pixel validation | COMPLETE | 100% | `██████████` | None |
| P4 | Candidate transaction + rollback | COMPLETE | 100% | `██████████` | None |
| P5 | Conservative Safe Fix recipes + exact-build proof | IMPLEMENTED / VALIDATION DEFERRED | 94% | `█████████░` | P12 real-Figma closure → fresh P5→then-current-main conflict resolution → merge #6 |
| P6 | Advanced timeline/carousel/milestone/page normalization | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P12 after P5 merge → fresh registered artifact → positive/refusal closure #7 |
| P7 | Sequential multi-frame/page batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P12 after P5 merge → fresh registered artifact → 60+ stress/cancel closure #8 |
| P8 | Optional Elementor schema exporters | DEFERRED | N/A | `──────────` | Re-evaluate after normalization line stabilizes |
| P9 | Actionable backlog generator | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged PR #89; final real plugin/export/parity validation in #84 |
| P10 | npm/Node CLI + source adapters | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged PR #93; final real URL/snapshot/OS-path/parity validation in #84 |
| P11 | Normal Figma plugin distribution | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged PR #94; final integrated install/runtime/release/Community-readiness validation in #84 |
| P12 | Final integrated validation/release acceptance | ACTIVE FINAL GATE | 0% | `░░░░░░░░░░` | Execute all deferred manual/runtime/end-to-end acceptance (#84) |

## Progress interpretation

**Historical core P0–P7 progress:** `█████████░ 93%`

This preserves the original verified core denominator.

**Release-expansion implementation:**
- P9: 100%;
- P10: 100%;
- P11: 100%;
- P12 final validation: 0%.

P8 remains optional/deferred and is not counted as an active blocker unless explicitly reactivated.

## Validation policy

P12 is now the sole release-expansion acceptance gate.

Until P12 passes:
- safety/provenance locks remain authoritative;
- no real Figma evidence may be fabricated;
- implementation-complete must not be confused with production-accepted;
- Community approval must not be claimed;
- latest P5→main `CODE_CONFLICT` truth must be refreshed/resolved only through the final P12 integration sequence.

Automated repository safeguards protect implementation integrity but do not replace real runtime/product acceptance.

## P0–P4

Complete and merged. The core line provides deterministic scanning/classification, semantic/preservation evidence, geometry/content/image integrity, rendered-pixel validation, candidate-only transaction isolation, Full P3-before-P4 commit, and bounded restore/finalize checkpoint behavior.

## P5 — issue #6

Engineering and exact-artifact offline verification are complete on:
- branch `feat/p5-safe-recipes`;
- head `810d98d`;
- CI #488 PASS / run ID `34242984963`;
- artifact `figma-plugin-dist-488`;
- digest `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`;
- manifest semantic SHA-256 `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46` with only top-level plugin `id` excluded.

The artifact is registered in `config/runtime-artifacts.json` schema v3 as the current final-closure-eligible P5 build. Main-side preflight/archive/provenance plumbing is hardened.

P12 must collect real imported-Figma acceptance, pass closure intake and then resolve P5 against the then-current main while preserving current-main safety/tooling contracts.

## P6 — issue #7

Engineering is complete on reference head `9a6ae3b` / CI #494 PASS. Artifact #494 remains reference-only. After final P5 merge, P6 must be resolved on that line, rebuilt as a fresh exact artifact, registered with fresh provenance, and validated through real positive + preservation-refusal scenarios and current-main closure intake.

## P7 — issue #8

Engineering is complete on reference head `cbfdb66` / CI #490 PASS. Artifact #490 remains reference-only. After final P5 merge, P7 must be resolved on that line, rebuilt as a fresh exact artifact, registered with fresh provenance, and validated through a realistic 60+ Frame run plus active Full-P3 cancellation and current-main closure intake.

## P8

Optional exporter adapters remain intentionally deferred; issue #9 is closed as not planned for the active delivery line.

## P9 — actionable backlog / issue #81

Implementation completed and merged via PR #89. Delivered deterministic categories, identity, severity/priority, context/evidence/actions, lifecycle/delta, summaries, JSON/Markdown export, plugin UI/history and stale async invalidation.

P12 retains real plugin/export/parity validation.

## P10 — npm/Node CLI / issue #82

Implementation completed and merged via PR #93. Delivered official Figma REST URL/file-key input, canonical snapshot path/schema, explicit Frame selection, personal/OAuth auth modes, source snapshot export, deterministic audit/backlog outputs, CI thresholds, Node >=20 runner/bundle, raw `.fig` refusal and credential-safe serialization.

P12 retains real credentialed execution, snapshot parity, OS-path behavior and production acceptance.

## P11 — Figma plugin distribution / issue #83

Implementation completed and merged via PR #94 at `7f83a1f82459cd9354882235dd04153bb20e5760`.

Delivered:
- normal-release manifest and capability/menu registry;
- deterministic real-ID/source-SHA release builder;
- release SHA/provenance/menu/network verifier;
- destructive release-output overlap guard;
- current-capability normal-user menu commands;
- audit/backlog JSON + Markdown exports;
- developer command exclusion;
- root CHANGELOG + release-contract verifier;
- Community listing template + publishable readiness verifier;
- privacy/offline-network disclosure;
- private/team/Community distribution guidance;
- CI release/CLI/community checks.

Pre-merge evidence:
- CI #640 PASS, including 129 tests and all release checks;
- Integration Readiness #99 PASS;
- reviews 0 / review threads 0.

P12 retains normal installed/private plugin flow, final integrated P5/P6/P7 capability exposure, final release provenance and filled Community metadata/assets/support readiness.

## P12 — final integrated validation / issue #84

Run one final validation matrix:
- release artifact provenance/reproducibility;
- local dev-plugin import;
- normal plugin install/run;
- P5 rendered-pixel reject/restore/finalize + zero leftovers;
- P5 closure intake + fresh current-main conflict resolution preserving current safety contracts;
- P6 positive/refusal scenarios on a fresh final-line artifact;
- P7 60+ sequential queue + active cancellation on a fresh final-line artifact;
- P9 backlog categories/dedupe/delta/export;
- P10 Figma URL/file-key CLI;
- P10 canonical snapshot-path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity;
- deterministic outputs;
- final closure-intake;
- P11 distribution/release-package readiness;
- Windows/macOS CLI path behavior where applicable.

Only after P12 passes should the expanded release be marked 100% / production-accepted.

## Mandatory roadmap execution policy

For every P12 cycle:
1. inspect/process open Issues;
2. inspect open PR/MR;
3. continue the highest-priority unblocked validation/integration obligation;
4. synchronize README + memory-bank state during the same cycle;
5. distinguish implementation completion from observed final acceptance;
6. preserve exact-build safety/provenance and latest integration-conflict truth;
7. never synthesize or fabricate real runtime evidence.