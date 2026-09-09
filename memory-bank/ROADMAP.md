# Roadmap

Last updated: 2026-09-09

| Module / Phase | Scope | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---|---:|---|---|
| AI-native governance/tooling | Memory-bank, issue/PR-first lifecycle, CI/integration/artifact tooling | COMPLETE | 100% | `██████████` | Keep status + artifact registry synchronized after every batch |
| P0 | Specification, architecture, repository foundation | COMPLETE | 100% | `██████████` | None |
| P1 | Audit-Only scanner, discovery, scoring, report UI | COMPLETE | 100% | `██████████` | None |
| P2 | Deterministic classifier semantics + evidence | COMPLETE | 100% | `██████████` | None |
| P3 | Geometry/content/image + rendered-pixel validation | COMPLETE | 100% | `██████████` | None |
| P4 | Candidate transaction + rollback | COMPLETE | 100% | `██████████` | None |
| P5 | Conservative Safe Fix recipes + exact-build proof | RUNTIME ACCEPTANCE | 94% | `█████████░` | Hash-pinned #488 → real Figma proof → one-command closure intake PASS → merge #6 |
| P6 | Advanced timeline/carousel/milestone/page normalization | INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P6 conflicts → fresh registered artifact + provenance pins → #7 closure |
| P7 | Sequential multi-frame/page batch queue | INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P7 conflicts → fresh registered artifact + provenance pins → #8 closure |
| P8 | Optional Elementor schema exporters | DEFERRED | N/A | `──────────` | Re-evaluate after normalization line stabilizes |

## Overall active roadmap progress

`█████████░ 93%`

The overall percentage tracks the currently active P0–P7 delivery line plus governance/tooling. Deferred P8 is not treated as an active incomplete blocker.

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

The artifact is registered in `config/runtime-artifacts.json` schema v3 as the current final-closure-eligible P5 build. Main-side `runtime:preflight` validates exact build identity, stable descriptor-backed artifact reads, `5/5` immutable SHA-256 pins, and deterministic manifest semantics while allowing only placeholder/numeric top-level plugin-ID rebinding. An optionally retained Actions ZIP can also be bound to the registry digest.

The main-side `runtime:closure-intake` combines final-closure preflight, optional raw ZIP binding, descriptor-pinned evidence intake, byte-exact evidence hashing, strict UTF-8/JSON validation, verifier revalidation and verified-byte in-memory verifier execution. It cannot create runtime evidence.

Remaining gate is real imported-Figma acceptance followed by `runtime:closure-intake` PASS. Production Safe Fix mutation remains locked until that real-runtime evidence passes the exact-artifact verifier chain.

## P6 — issue #7

Engineering is complete on reference head `9a6ae3b` / CI #494 PASS. Automated integration readiness proves real shared-code conflicts against latest P5.

Artifact #494 is reference-only in runtime artifact registry schema v3 and fails closed for final closure. Its immutable files and id-excluded manifest semantics are pinned for safe inspection. After P5 merges, P6 must be integrated, rebuilt as a fresh exact artifact, registered with fresh identity/digest/immutable hashes/manifest semantic pin, then validated with real positive + preservation-refusal Figma scenarios.

## P7 — issue #8

Engineering is complete on reference head `cbfdb66` / CI #490 PASS. Automated integration readiness proves real shared-code conflicts against latest P5.

Artifact #490 is reference-only in runtime artifact registry schema v3 and fails closed for final closure. Its immutable files and id-excluded manifest semantics are pinned for safe inspection. After P5 merges, P7 must be integrated, rebuilt as a fresh exact artifact, registered with fresh identity/digest/immutable hashes/manifest semantic pin, then validated with a realistic 60+ Frame stress run plus active Full-P3 cooperative cancellation.

## P8

Optional exporter adapters remain intentionally deferred; issue #9 is closed as not planned for the active delivery line. It is future product development, not a blocker for the current P0–P7 release line.

## Mandatory roadmap execution policy

For every future development cycle:

1. inspect/process open Issues,
2. inspect/fix/merge open PR/MR,
3. continue the highest-priority unblocked roadmap item,
4. run verification,
5. update memory-bank + runtime registry when canonical artifact state changes,
6. update root README module-wise and overall progress bars before declaring the batch complete.

Runtime/manual acceptance evidence must never be synthesized merely to advance a progress percentage.
