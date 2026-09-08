# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

`Figma selection -> Audit -> classify -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** this README is updated after meaningful verified development batches with canonical CI/artifact state, blockers and next actions.

**Open PR/MR:** `0`

| Phase | Scope | Current status |
|---|---|---|
| P0–P4 | Core audit, validation, transaction/rollback | ✅ Complete |
| P5 | Conservative Safe Fix recipes | 🟡 Engineering + exact-build proof reconstruction + exact-artifact offline verification complete; imported-Figma acceptance pending (#6) |
| P6 | Advanced clone-only calibration | 🟡 Engineering + closure-v2 P5 proof reconstruction + exact-artifact offline verification complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟡 Engineering + closure-v2 prerequisite proof + duplicate-name-safe checkpoint evidence + exact-artifact offline verification complete; real-Figma stress/cancellation acceptance pending (#8) |
| P8 | Optional exporter adapters | ⏸ Deferred / #9 closed as not planned |

## Canonical verified artifacts

| Track | Branch | Verified head | CI / artifact | Digest |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `810d98d` | ✅ #488 · `figma-plugin-dist-488` | `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` |
| P6 | `feat/p6-advanced-structures` | `9a6ae3b` | ✅ #494 · `figma-plugin-dist-494` | `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3` |
| P7 | `feat/p7-batch-queue-core` | `cbfdb66` | ✅ #490 · `figma-plugin-dist-490` | `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43` |

## Latest verified development batch — 2026-09-08

- ✅ P5 artifact ships `verify-p5-evidence.mjs`; canonical calibration acceptance is recomputed outside Figma and bound to the same artifact source SHA / Actions run identity.
- ✅ P5 accepted evidence now reconstructs the runtime proof through core `isValidP5RuntimeProof()` and rejects impossible proof-after-capture chronology.
- ✅ P5 CI #488 passed the full build/provenance/offline-verifier/local-import pipeline plus proof-reconstruction chronology regression coverage.
- ✅ P6 artifact ships `verify-p6-closure.mjs`; combined closure export remains schema v2 with embedded persisted P5 runtime evidence.
- ✅ P6 verifier now reconstructs the embedded P5 prerequisite through core `isValidP5RuntimeProof()`, validates exact-build binding, and rejects `runtimeProofPassedAt > capturedAt` before accepting P6 closure.
- ✅ P6 positive/refusal scenario gate, proof timestamp and proof-build claims remain cross-checked against the independently evaluated P5 evidence.
- ✅ P6 CI #494 passed install, typecheck, 171 tests, build, exact-artifact verifier smoke, local-import integrity and artifact upload.
- ✅ P7 artifact ships `verify-p7-closure.mjs`; closure export remains schema v2 with raw P5 core proof + exact-build P7 receipt.
- ✅ P7 runtime checkpoint evidence now resolves the post-checkpoint live Frame by stable queue index instead of `frameName`.
- ✅ duplicate Figma Frame names therefore cannot redirect checkpoint `frameIdAfter` evidence to a different same-name queue item; dedicated regression coverage is green.
- ✅ P7 CI #490 passed the full schema-v2 exact-artifact verification pipeline.
- ✅ all three canonical tracks provide same-artifact offline verification plus deterministic `prepare-figma-import.mjs` manifest rebinding.
- ✅ a single operator checklist now lives at `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md` for P5 → P6 → P7 imported-runtime closure without synthetic substitutions.
- ✅ 0 open feature PR/MRs; real imported-Figma observations remain the only blockers for #6/#7/#8.

## Repository audit checkpoint — 2026-09-08

- ✅ `main` head `2ed66a9` passed CI #497 before this status-only update.
- ✅ canonical feature heads still match the verified heads above; their latest CI runs are green.
- ✅ open PR/MR count was audited at `0`; there is no pending merge candidate to merge.
- ✅ open issues are limited to #6, #7 and #8; their remaining acceptance gates require real imported-Figma runtime observations rather than more synthetic CI evidence.
- ✅ no failed canonical workflow or additional code-side blocker was identified in this repository audit.
- ⚠️ feature branches intentionally remain unmerged because P5/P6/P7 production safety depends on exact-build runtime proof. Do not merge them merely because CI is green.
- ⚠️ branch-local README / `memory-bank/NEXT_ACTIONS.md` snapshots may lag the canonical artifact numbers. Avoid docs-only commits to those exact-build branches unless necessary, because any commit changes the source SHA and therefore creates a new runtime-proof build identity.

### Planned merge order after runtime acceptance

1. P5: collect imported-Figma P5 proof, require same-artifact verifier exit `0`, then create/review/merge the P5 branch and close #6.
2. P6: rebase/retarget after P5, collect positive + preservation-refusal real-Figma closure, verify with the same artifact, then merge and close #7.
3. P7: rebase/retarget after P5, collect 60+ Frame stress + active Full P3 cancellation closure, verify with the same artifact, then merge and close #8.

Until those observations exist, keeping the exact verified feature heads unchanged is safer than generating fresh artifacts for documentation-only churn.

## Self-contained Figma artifact import

If an artifact uses placeholder plugin ID `000000000000000000`, unpack it and run:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json`. `LOCAL_IMPORT_INFO.txt` records provenance and hashes proving compiled `code.js` / `ui.html` were unchanged. Import preparation is **not** runtime acceptance.

## Independent closure verification

Run each verifier from the **same unpacked artifact** that produced the Figma runtime evidence:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
node verify-p6-closure.mjs < p6-closure.json
node verify-p7-closure.mjs < p7-closure.json
```

Exit code `0` requires canonical acceptance and an exact artifact-build match. P5 and P6 additionally reject invalid/impossible prerequisite proof semantics; P7 independently validates its raw P5 proof + exact-build receipt. Offline verification is read-only and cannot replace the required imported-Figma runtime observation.

## Remaining real-runtime acceptance

Use `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md` as the operator sequence for the three runtime gates below.

### P5 — issue #6

- [ ] import `figma-plugin-dist-488` or newer verified artifact
- [ ] run `Developer: P5 Runtime Self-Test`
- [ ] require `P5 Compiled Runtime Acceptance: PASS`
- [ ] verify rendered-pixel forced reject, restore, finalize and `0` leftovers
- [ ] export closure JSON and require same-artifact `verify-p5-evidence.mjs` exit code `0`

Production Safe Fix mutation remains locked until this exact-build runtime proof passes.

### P6 — issue #7

- [ ] import `figma-plugin-dist-494` or newer verified artifact
- [ ] establish exact-build P5 prerequisite in that same plugin build
- [ ] run positive image-bearing page-flow clone calibration and require Full P3 PASS with unchanged image-anchor count
- [ ] run preservation-sensitive page and require `NO_CANDIDATE` refusal PASS
- [ ] open `Developer: P6 Runtime Evidence` and require `P6 Closure acceptance: PASS`
- [ ] export schema-v2 `p6-closure.json` containing the P5 runtime evidence prerequisite
- [ ] require same-artifact `verify-p6-closure.mjs` exit code `0`

P6 production advanced mutation remains intentionally disabled.

### P7 — issue #8

- [ ] import `figma-plugin-dist-490` or newer verified artifact and keep that exact build loaded for all observations
- [ ] establish its exact-build P5 prerequisite
- [ ] execute a realistic 60+ Frame batch run with `maxConcurrentProcessors === 1`
- [ ] request cancellation during a genuinely long active Full P3 operation
- [ ] retain settled active-frame cancellation evidence with matching processor attempt
- [ ] open `Developer: P7 Runtime Evidence` and require `Closure acceptance: PASS`
- [ ] export schema-v2 `p7-closure.json` containing P5 core proof + exact-build receipt
- [ ] require same-artifact `verify-p7-closure.mjs` exit code `0`

## Safety invariants

- approved original design is the visual source of truth
- unsupported/ambiguous structures are refused, never guessed
- candidate-only mutation; Full P3 before P4 commit
- rendered-pixel evidence is mandatory for production validation
- runtime proof/evidence must be traceable to the exact CI-built artifact currently loaded
- offline closure verifiers must recompute canonical acceptance and match the verifier artifact build
- P5/P6 exported prerequisite proof chronology must be valid and cannot occur after evidence capture
- P6 prerequisite claims must match independently verified embedded P5 runtime evidence
- P7 prerequisite acceptance must be recomputed from raw P5 proof + exact-build P7 receipt, never from a copied boolean alone
- P7 checkpoint live-ID evidence follows stable queue position, not potentially duplicated Frame names
- P6 advanced calibration remains clone-only with no production commit seam
- P7 processing is strictly sequential with cooperative cancellation
- local manifest rebinding must never alter compiled plugin code/UI

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

For a repository-local artifact:

```bash
npm run prepare:figma-import -- <your-figma-plugin-id>
```

## Runtime acceptance operator guide

For real Figma Desktop acceptance collection and issue-closure evidence, follow `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md` in order. The runbook deliberately preserves the exact-artifact and no-synthetic-evidence rules used by issues #6, #7 and #8.
