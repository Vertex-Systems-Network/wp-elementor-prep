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
| P5 | Conservative Safe Fix recipes + exact-build proof | IMPLEMENTED / VALIDATION DEFERRED | 94% | `█████████░` | Final P12 real-Figma closure → fresh P5→then-current-main conflict resolution preserving #85 requirements → merge #6 |
| P6 | Advanced timeline/carousel/milestone/page normalization | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | Final P12 P5 merge → resolve P6 → fresh registered artifact → positive/refusal closure #7 |
| P7 | Sequential multi-frame/page batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | Final P12 P5 merge → resolve P7 → fresh registered artifact → 60+ stress/cancel closure #8 |
| P8 | Optional Elementor schema exporters | DEFERRED | N/A | `──────────` | Re-evaluate after normalization line stabilizes |
| P9 | Actionable backlog generator | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged PR #89; validate real plugin/export/parity behavior in #84 |
| P10 | npm/Node CLI + source adapters | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged PR #93; validate real URL/snapshot/OS-path/parity behavior in #84 |
| P11 | Normal Figma plugin distribution | IMPLEMENTATION IN PROGRESS | 85% | `█████████░` | Finish release/community contracts → PR/CI → merge #83 → P12 normal-install/release validation |
| P12 | Final integrated validation/release acceptance | PLANNED FINAL GATE | 0% | `░░░░░░░░░░` | Batch all deferred manual/runtime/end-to-end acceptance after P11 implementation (#84) |

## Progress interpretation

**Historical core P0–P7 progress:** `█████████░ 93%`

This preserves the original verified core denominator.

**Release-expansion implementation:**
- P9: 100%;
- P10: 100%;
- P11: 85%;
- P12 final validation: 0%.

P8 remains optional/deferred and is not counted as an active blocker unless explicitly reactivated.

## Validation policy

Manual/runtime/end-to-end product testing is deferred until P12.

Before P12:
- implementation may continue where safe;
- safety/provenance locks remain authoritative;
- no real Figma evidence may be fabricated;
- implementation-complete must not be confused with production-accepted;
- latest P5→main `CODE_CONFLICT` state from PR #85 must be preserved rather than reverted to a stale docs-only assumption.

Automated repository safeguards may still exist, but they do not count as final product acceptance under this policy.

## P0–P4

Complete and merged. The core line provides deterministic scanning/classification, semantic/preservation evidence, geometry/content/image integrity, rendered-pixel validation, candidate-only transaction isolation, Full P3-before-P4 commit, and bounded restore/finalize checkpoint behavior.

## P5 — issue #6

Engineering and exact-artifact offline verification are complete on:

- branch `feat/p5-safe-recipes`,
- head `810d98d`,
- CI #488 PASS / run ID `34242984963`,
- artifact `figma-plugin-dist-488`,
- digest `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`,
- manifest semantic SHA-256 `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46` with only top-level plugin `id` excluded.

The artifact is registered in `config/runtime-artifacts.json` schema v3 as the current final-closure-eligible P5 build. Main-side preflight/archive/provenance plumbing is hardened.

Real imported-Figma acceptance is deferred to P12 rather than blocking P9–P11 implementation.

After P12 P5 closure-intake PASS, a fresh integration against the then-current `main` is mandatory. Latest Integration Readiness reported P5 → main `CODE_CONFLICT`; the final resolution must preserve current-main source/output-overlap safety, CI/status tooling and closure/runbook hardening while deliberately integrating P5 runtime code.

## P6 — issue #7

Engineering is complete on reference head `9a6ae3b` / CI #494 PASS.

Artifact #494 remains reference-only. After P5 final closure + fresh current-main integration merge, P6 must be resolved on that line, rebuilt as a fresh exact artifact, registered with fresh provenance, and validated through real positive + preservation-refusal scenarios and current-main closure intake in P12.

## P7 — issue #8

Engineering is complete on reference head `cbfdb66` / CI #490 PASS.

Artifact #490 remains reference-only. After P5 final closure + fresh current-main integration merge, P7 must be resolved on that line, rebuilt as a fresh exact artifact, registered with fresh provenance, and validated through a realistic 60+ Frame run plus active Full-P3 cancellation and current-main closure intake in P12.

## P8

Optional exporter adapters remain intentionally deferred; issue #9 is closed as not planned for the active delivery line.

## P9 — actionable backlog / issue #81

Implementation completed and merged via PR #89.

Delivered:
- ERROR / WARNING / INFO / IMPROVEMENT backlog categories;
- deterministic identity, severity/priority, context/evidence and actions;
- OPEN / RESOLVED / REGRESSED / ACCEPTED_RISK lifecycle;
- NEW / RESOLVED / REGRESSED / UNCHANGED delta;
- category/severity summaries;
- deterministic JSON/Markdown export;
- plugin history/view/export;
- stale async invalidation;
- non-mutating boundary.

P12 retains real plugin/export/parity validation.

## P10 — npm/Node CLI / issue #82

Implementation completed and merged via PR #93 at `7e6aa85958060cc927d8fe09dc5cb88a3feba53e`.

Delivered:
- official Figma REST URL/file-key input;
- canonical versioned snapshot path;
- explicit Frame/node selection and ambiguous-frame refusal;
- personal-token + OAuth environment auth modes;
- cloud source snapshot export;
- audit/backlog JSON + Markdown outputs;
- previous backlog delta, summary-only and CI fail thresholds;
- Node >=20 cross-platform runner and persistent CLI bundle;
- explicit `UNSUPPORTED_FIG_LOCAL_FILE` for raw `.fig`;
- no credential serialization;
- strict implementation-side tests/typecheck/build contracts.

P12 retains real credentialed execution, snapshot parity, OS-path behavior and production acceptance.

## P11 — Figma plugin distribution / issue #83

Implementation is active on `feat/p11-release-packaging`.

Delivered on the branch so far:
- release-only manifest template;
- explicit release capability/menu registry;
- deterministic release package builder requiring a real plugin ID and exact source SHA;
- release package verifier for placeholder IDs, unexpected files, network/menu drift and provenance/hash mismatches;
- current-capability normal-user commands and audit/backlog exports;
- developer-only evidence/self-test exclusion from release menu;
- release fixture verification in CI;
- Community listing template + readiness verifier;
- privacy/offline network declaration;
- local/private/team/Community distribution guide.

Before P11 implementation completion:
- finish version/changelog/static release contracts;
- run PR CI and repair any defects;
- merge #83;
- leave actual install/runtime/Community acceptance to P12.

Safe Fix/Prep and Batch are not exposed on the current release line until final integrated runtime capabilities exist.

Community publication remains subject to Figma review.

## P12 — final integrated validation / issue #84

Run one final validation matrix after implementation is complete:
- release artifact provenance/reproducibility;
- local dev-plugin import;
- normal plugin install/run;
- P5 rendered-pixel reject/restore/finalize + zero leftovers;
- P5 closure intake + fresh current-main conflict resolution preserving PR #85 requirements;
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

For every future development cycle:

1. inspect/process open Issues;
2. inspect open PR/MR;
3. continue the highest-priority unblocked implementation item;
4. synchronize README + memory-bank state during the work, not only after it;
5. distinguish implementation progress from final validation progress;
6. preserve safety/provenance and latest integration-conflict truth while testing is deferred;
7. run final manual/runtime/end-to-end validation only in P12 unless the user explicitly changes that policy.