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

- Current merged `main` feature/tooling checkpoint: `4b4a3be` from PR #41.
- Main CI #523: PASS.
- Main Integration Readiness #17: PASS.
- README status verification, typecheck, tests, build and local-import safety all passed post-merge.
- Open PR/MR: `0`.
- Open issues: #6, #7, #8 only.
- Issue #7 and #8 bodies are synchronized to the proven post-P5 fresh-build closure order.
- No new actionable product/code defect issue was found during the latest issue-first sweep.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep Issues → PR/MR → development lifecycle, status and artifact registry synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | RUNTIME ACCEPTANCE | 92% | Run registered #488 preflight, real imported-Figma proof, same-artifact verifier, then merge #6 |
| P6 advanced structures | INTEGRATION BLOCKED | 80% | P5 merge → resolve conflicts → fresh exact-build artifact → runtime closure #7 |
| P7 batch queue | INTEGRATION BLOCKED | 80% | P5 merge → resolve conflicts → fresh exact-build artifact → stress/cancel closure #8 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate only after normalization line is stable |

## Canonical verified feature artifacts

### P5

- Branch: `feat/p5-safe-recipes`
- Head: `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`
- CI: #488 PASS, run ID `34242984963`
- Artifact: `figma-plugin-dist-488`
- Digest: `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`
- Registry status: final-closure eligible for issue #6.
- Remaining: real imported-Figma runtime acceptance + same-artifact verifier.

### P6

- Branch: `feat/p6-advanced-structures`
- Head: `9a6ae3b29e2f70ebbd987a686856c2957f590b75`
- CI: #494 PASS, run ID `34244113623`
- Reference artifact: `figma-plugin-dist-494`
- Digest: `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3`
- Registry status: reference-only; final closure is fail-closed on this build.

### P7

- Branch: `feat/p7-batch-queue-core`
- Head: `cbfdb66db531da8613582c84523265e42dad63a2`
- CI: #490 PASS, run ID `34243303097`
- Reference artifact: `figma-plugin-dist-490`
- Digest: `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43`
- Registry status: reference-only; final closure is fail-closed on this build.

## Runtime artifact preflight

PR #41 merged the main-side preflight that validates an unpacked runtime artifact before Figma acceptance:

- exact `BUILD_INFO.txt` source/workflow SHA, run ID and run number,
- required compiled files, manifest, packaged import helper and same-artifact verifier,
- expected developer menu commands,
- offline-only manifest network policy,
- plugin-id placeholder/rebinding state,
- final-closure eligibility from `config/runtime-artifacts.json`.

Expected safety behavior:

- P5 #488 + `final-closure`: PASS,
- P6 #494 / P7 #490 + `final-closure`: FAIL CLOSED,
- P6 #494 / P7 #490 + `reference`: PASS with warning.

This preflight cannot mint runtime proof or replace real Figma Desktop observation.

## Integration readiness

The non-mutating integration checker reports:

- P5 → main: documentation-only conflict; isolated resolution proof CI #500 PASS.
- P6 → P5: real shared-code conflicts.
- P7 → P5: real shared-code conflicts.

Do not mutate canonical P5/P6/P7 exact-build branches merely for documentation churn.

## Current blockers

### Issue #6 — P5

Requires actual Figma Desktop imported-plugin runtime evidence. CI, preflight or synthetic evidence cannot replace it.

### Issue #7 — P6

Depends on P5 merge first. Then resolve integration conflicts, produce a fresh exact-build P6 artifact, register it, collect positive + preservation-refusal real-Figma evidence, and pass same-artifact offline verification.

### Issue #8 — P7

Depends on P5 merge first. Then resolve integration conflicts, produce a fresh exact-build P7 artifact, register it, collect realistic 60+ Frame stress + active Full-P3 cancellation evidence, and pass same-artifact offline verification.

## Immediate release target

Run `npm run runtime:preflight -- p5 <unpacked-artifact-488>`, rebind the packaged placeholder manifest if required, complete P5 real-Figma acceptance, verify the exported closure with the same artifact, merge P5, close #6, then re-integrate P6/P7 in dependency order.
