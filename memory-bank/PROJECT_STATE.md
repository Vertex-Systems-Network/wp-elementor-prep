# Project State

Last updated: 2026-09-08

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and safely prepares approved desktop Figma layouts for structures that map cleanly to WordPress Elementor.

Core runtime must not require generative AI, external inference, or network access.

## Mandatory execution order

Every work cycle follows:

1. open Issues first,
2. open PR/MR second,
3. new development third,
4. verification + memory-bank + README module progress update before completion.

See `docs/AI_NATIVE_PLAN.md`, `AGENTS.md`, and decision D-012.

## Current phase

**P0–P4 are complete. P5/P6/P7 engineering is implemented and verified on canonical feature heads. The active release gate is real imported-Figma runtime acceptance for P5 issue #6. P6/P7 final closure must occur only after P5 merges and their code conflicts are resolved against the merged P5 line.**

## Repository status

- `main` status checkpoint: `b8a5869`.
- Main CI #514: PASS.
- Main Integration Readiness #12: PASS.
- Open PR/MR: `0` at the start of this policy-sync batch.
- Open issues: #6, #7, #8.
- No additional actionable code-defect issue was found during the latest issue sweep.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep operational state synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | RUNTIME ACCEPTANCE | 90% | Real imported-Figma proof for #6, then merge |
| P6 advanced structures | INTEGRATION BLOCKED | 80% | Merge P5, resolve P6→P5 conflicts, fresh artifact, runtime closure #7 |
| P7 batch queue | INTEGRATION BLOCKED | 80% | Merge P5, resolve P7→P5 conflicts, fresh artifact, stress/cancel closure #8 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate only after normalization line is stable |

## Canonical verified feature artifacts

### P5

- Branch: `feat/p5-safe-recipes`
- Head: `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`
- CI: #488 PASS
- Artifact: `figma-plugin-dist-488`
- Digest: `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`
- Remaining: real imported-Figma runtime acceptance + same-artifact verifier for issue #6.

### P6

- Branch: `feat/p6-advanced-structures`
- Head: `9a6ae3b29e2f70ebbd987a686856c2957f590b75`
- CI: #494 PASS
- Reference artifact: `figma-plugin-dist-494`
- Digest: `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3`
- Current artifact is engineering/reference only for final closure because P6 has real code conflicts against latest P5.

### P7

- Branch: `feat/p7-batch-queue-core`
- Head: `cbfdb66db531da8613582c84523265e42dad63a2`
- CI: #490 PASS
- Reference artifact: `figma-plugin-dist-490`
- Digest: `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43`
- Current artifact is engineering/reference only for final closure because P7 has real code conflicts against latest P5.

## Integration readiness

The non-mutating `scripts/check-integration-readiness.mjs` + GitHub Actions workflow reports:

- P5 → main: documentation-only conflict; integration resolution was already proven mergeable in an isolated probe with CI #500 PASS.
- P6 → P5: real code conflicts across build/provenance/runtime files.
- P7 → P5: real code conflicts across build/runtime/P5 proof and acceptance surfaces.

Do not mutate P5/P6/P7 canonical exact-build branches merely for documentation churn.

## Current blockers

### Issue #6 — P5

Requires actual Figma Desktop imported-plugin runtime evidence. CI or synthetic evidence cannot replace it.

### Issue #7 — P6

Depends on P5 merge first. Then resolve integration conflicts, produce a fresh exact-build P6 artifact, collect positive + preservation-refusal real-Figma evidence, and pass same-artifact offline verification.

### Issue #8 — P7

Depends on P5 merge first. Then resolve integration conflicts, produce a fresh exact-build P7 artifact, collect realistic 60+ Frame stress + active Full-P3 cancellation evidence, and pass same-artifact offline verification.

## Safety status

- Approved original design remains authoritative.
- Candidate-only mutation and Full P3 validation remain mandatory before P4 commit.
- Rendered-pixel evidence is mandatory where runtime acceptance requires it.
- Exact-build provenance cannot be replaced with another artifact or synthetic evidence.
- P6 advanced calibration remains clone-only with no production commit seam.
- P7 remains strictly sequential with cooperative cancellation.

## Immediate release target

Complete P5 real-Figma acceptance for artifact #488, verify the exported closure with the same artifact, merge P5, close #6, then re-integrate P6/P7 in dependency order and collect fresh runtime closure evidence.
