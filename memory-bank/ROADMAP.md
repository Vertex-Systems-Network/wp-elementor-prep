# Roadmap

Last updated: 2026-09-08

| Module / Phase | Scope | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---|---:|---|---|
| AI-native governance/tooling | Memory-bank, issue/PR-first lifecycle, CI/integration tooling | COMPLETE | 100% | `██████████` | Keep status synchronized after every batch |
| P0 | Specification, architecture, repository foundation | COMPLETE | 100% | `██████████` | None |
| P1 | Audit-Only scanner, discovery, scoring, report UI | COMPLETE | 100% | `██████████` | None |
| P2 | Deterministic classifier semantics + evidence | COMPLETE | 100% | `██████████` | None |
| P3 | Geometry/content/image + rendered-pixel validation | COMPLETE | 100% | `██████████` | None |
| P4 | Candidate transaction + rollback | COMPLETE | 100% | `██████████` | None |
| P5 | Conservative Safe Fix recipes + exact-build proof | RUNTIME ACCEPTANCE | 90% | `█████████░` | Real imported-Figma proof for #6, then merge |
| P6 | Advanced timeline/carousel/milestone/page normalization | INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P6 conflicts → fresh artifact → #7 closure |
| P7 | Sequential multi-frame/page batch queue | INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P7 conflicts → fresh artifact → #8 closure |
| P8 | Optional Elementor schema exporters | DEFERRED | N/A | `──────────` | Re-evaluate after normalization line stabilizes |

## Overall active roadmap progress

`█████████░ 93%`

The overall percentage tracks the currently active P0–P7 delivery line plus governance/tooling. Deferred P8 is not treated as an active incomplete blocker.

## P0–P4

Complete and merged. The core line now provides:

- deterministic scanning/classification,
- semantic/preservation evidence,
- geometry/content/image integrity checks,
- rendered-pixel validation,
- candidate-only transaction isolation,
- Full P3 before P4 commit,
- bounded restore/finalize checkpoint behavior.

## P5 — issue #6

Engineering and exact-artifact offline verification are complete on:

- branch `feat/p5-safe-recipes`,
- head `810d98d`,
- CI #488 PASS,
- artifact `figma-plugin-dist-488`.

Remaining gate is real imported-Figma acceptance and same-artifact verifier exit `0`. Production Safe Fix mutation remains locked until that gate passes.

## P6 — issue #7

Engineering is complete on reference head `9a6ae3b` / CI #494 PASS, but automated integration readiness proves real shared-code conflicts against latest P5.

Final closure must wait until P5 merges, then P6 must be integrated, rebuilt as a fresh exact artifact, and validated with real positive + preservation-refusal Figma scenarios.

## P7 — issue #8

Engineering is complete on reference head `cbfdb66` / CI #490 PASS, but automated integration readiness proves real shared-code conflicts against latest P5.

Final closure must wait until P5 merges, then P7 must be integrated, rebuilt as a fresh exact artifact, and validated with a realistic 60+ Frame stress run plus active Full-P3 cooperative cancellation.

## P8

Optional exporter adapters remain intentionally deferred; issue #9 is closed as not planned for the active delivery line.

## Mandatory roadmap execution policy

For every future development cycle:

1. inspect/process open Issues,
2. inspect/fix/merge open PR/MR,
3. continue the highest-priority unblocked roadmap item,
4. run verification,
5. update this roadmap when phase/module state changes,
6. update root README module-wise and overall progress bars before declaring the batch complete.

Runtime/manual acceptance evidence must never be synthesized merely to advance a progress percentage.
