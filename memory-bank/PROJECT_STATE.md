# Project State

Last updated: 2026-09-09

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

- Current merged feature/tooling checkpoint: `51c4bd4` from PR #44.
- PR #44 head `0c4ab88` passed CI #546 with no review/thread blockers.
- PR #44 squash-merged to `main` at `51c4bd4`.
- Post-merge main CI #547: PASS.
- Post-merge Integration Readiness #36: PASS.
- README status verification, typecheck, tests, build and local-import safety all passed post-merge.
- Open PR/MR: `0` after PR #44 merge.
- Open issues: #6, #7, #8 only.
- Issue #6 routes final evidence through hash-pinned, byte-exact `runtime:closure-intake` after real Figma observation.
- Issue #7 and #8 remain synchronized to the proven post-P5 fresh-build closure order.
- Canonical P5/P6/P7 feature heads were not modified by the tooling batch.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep Issues → PR/MR → development lifecycle, status and artifact registry synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | RUNTIME ACCEPTANCE | 94% | Hash-pinned #488 → real imported-Figma proof → byte-exact closure intake PASS → merge #6 |
| P6 advanced structures | INTEGRATION BLOCKED | 80% | P5 merge → resolve conflicts → fresh exact-build artifact + fresh file pins → runtime closure #7 |
| P7 batch queue | INTEGRATION BLOCKED | 80% | P5 merge → resolve conflicts → fresh exact-build artifact + fresh file pins → stress/cancel closure #8 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate only after normalization line is stable |

## Canonical verified feature artifacts

### P5

- Branch: `feat/p5-safe-recipes`
- Head: `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`
- CI: #488 PASS, run ID `34242984963`
- Artifact: `figma-plugin-dist-488`
- Digest: `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`
- Registry status: final-closure eligible for issue #6.
- Registry schema v2 pins immutable SHA-256 for `BUILD_INFO.txt`, `code.js`, `ui.html`, packaged import helper and `verify-p5-evidence.mjs`.
- Remaining: real imported-Figma runtime acceptance followed by byte-exact one-command closure intake PASS.

### P6

- Branch: `feat/p6-advanced-structures`
- Head: `9a6ae3b29e2f70ebbd987a686856c2957f590b75`
- CI: #494 PASS, run ID `34244113623`
- Reference artifact: `figma-plugin-dist-494`
- Digest: `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3`
- Registry status: reference-only; final closure is fail-closed on this build.
- Immutable reference files are SHA-256 pinned for safe inspection.

### P7

- Branch: `feat/p7-batch-queue-core`
- Head: `cbfdb66db531da8613582c84523265e42dad63a2`
- CI: #490 PASS, run ID `34243303097`
- Reference artifact: `figma-plugin-dist-490`
- Digest: `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43`
- Registry status: reference-only; final closure is fail-closed on this build.
- Immutable reference files are SHA-256 pinned for safe inspection.

## Runtime artifact preflight

PR #41 introduced the fail-closed artifact preflight; PR #42 hardened it with per-file SHA-256 validation.

Current preflight validates:

- exact `BUILD_INFO.txt` source/workflow SHA, run ID and run number,
- required compiled files, manifest, packaged import helper and same-artifact verifier,
- exact SHA-256 for immutable packaged files,
- expected developer menu commands,
- offline-only manifest network policy,
- plugin-id placeholder/rebinding state,
- final-closure eligibility from `config/runtime-artifacts.json` schema v2.

`manifest.json` is intentionally not byte-hash pinned because supported local import changes only the Figma plugin ID. Manifest semantics remain validated; compiled runtime/helper/verifier bytes remain pinned.

Expected safety behavior:

- P5 #488 + `final-closure`: PASS only when all 5 immutable pins match,
- P6 #494 / P7 #490 + `final-closure`: FAIL CLOSED,
- P6 #494 / P7 #490 + `reference`: PASS with warning only when their immutable pins match,
- any changed pinned byte: FAIL CLOSED.

## Runtime closure intake

PR #43 introduced the generic main-side closure intake command; PR #44 hardened its evidence traceability:

```bash
npm run runtime:closure-intake -- <p5|p6|p7> <artifact-dir> <evidence-json>
```

The intake runs final-closure preflight first, then accepts only a regular non-empty bounded evidence file. It hashes the exact raw file bytes, performs strict/fatal UTF-8 decoding, requires a top-level JSON object, and only then executes the exact hash-pinned verifier inside that artifact. A verifier non-zero exit, execution error or signal fails the intake.

Important fail-closed properties:

- preflight failure means verifier `NOT RUN`;
- reference-only P6/P7 builds cannot reach verifier execution;
- empty/non-file/oversized evidence means verifier `NOT RUN`;
- invalid UTF-8 means verifier `NOT RUN` and is rejected before JSON parsing;
- evidence SHA-256 is the exact on-disk raw-byte hash, with `hashScope: raw-file-bytes`;
- malformed/non-object JSON means verifier `NOT RUN`;
- verifier is invoked directly through Node without a shell;
- this tooling validates evidence only and cannot create or substitute real Figma observations.

## Integration readiness

The non-mutating integration checker reports:

- P5 → main: documentation-only conflict; isolated resolution proof CI #500 PASS.
- P6 → P5: real shared-code conflicts.
- P7 → P5: real shared-code conflicts.

Do not mutate canonical P5/P6/P7 exact-build branches merely for documentation churn.

## Current blockers

### Issue #6 — P5

Requires actual Figma Desktop imported-plugin runtime evidence. CI, hash-pinned preflight, byte-exact closure intake or synthetic evidence cannot replace it.

### Issue #7 — P6

Depends on P5 merge first. Then resolve integration conflicts, produce a fresh exact-build P6 artifact, register its new identity/digest/file hashes, collect positive + preservation-refusal real-Figma evidence, and pass closure intake using that fresh artifact.

### Issue #8 — P7

Depends on P5 merge first. Then resolve integration conflicts, produce a fresh exact-build P7 artifact, register its new identity/digest/file hashes, collect realistic 60+ Frame stress + active Full-P3 cancellation evidence, and pass closure intake using that fresh artifact.

## Immediate release target

Run hash-pinned preflight on canonical P5 #488, rebind only the manifest plugin ID if required, complete real Figma runtime acceptance, export `p5-evidence.json`, run `npm run runtime:closure-intake -- p5 <artifact-488> p5-evidence.json` and require raw-byte SHA-256 + strict UTF-8/JSON acceptance + verifier exit `0` + final PASS, then merge P5 and close #6 before re-integrating P6/P7.
