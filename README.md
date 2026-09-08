# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

`Figma selection -> Audit -> classify -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** this README is updated after every meaningful verified development batch with canonical issue/PR state, module-wise progress, blockers and next actions.

**Open PR/MR:** `0` at the latest completed `main` checkpoint.

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | ✅ COMPLETE | 100% | `██████████` | Keep Issues → PR/MR → development lifecycle and status sync enforced |
| P0–P4 core audit/validation/transaction | ✅ COMPLETE | 100% | `██████████` | None |
| P5 Conservative Safe Fix | 🟡 RUNTIME ACCEPTANCE | 90% | `█████████░` | Real imported-Figma proof for #6, same-artifact verifier, then merge |
| P6 Advanced structures | 🟠 INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P6 conflicts → fresh artifact → real closure #7 |
| P7 60+ Frame batch queue | 🟠 INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P7 conflicts → fresh artifact → stress/cancel closure #8 |
| P8 Elementor exporter adapters | ⏸ DEFERRED | N/A | `──────────` | Re-evaluate after normalization line is stable |

**Overall active project progress:** `█████████░ 93%`

> Overall progress covers the active P0–P7 delivery line plus governance/tooling. Deferred P8 is not counted as an active unfinished blocker. Percentages represent verified scope, not optimistic estimates.

### Mandatory AI-native work order

Every future work cycle must execute in this order:

1. **Issues first** — list all open issues, fix actionable ones, and identify dependency/manual-runtime blockers. Do not fabricate evidence to close a blocked issue.
2. **PR/MR second** — inspect all open Pull Requests / Merge Requests for CI, conflicts, mergeability and review feedback; fix and merge eligible work.
3. **Development third** — only then begin the highest-priority unblocked roadmap work, using safe parallel workstreams where useful.
4. **End-of-work sync** — run verification, update memory-bank files, and update this module-wise + overall progress before declaring the batch complete.

Canonical policy: `docs/AI_NATIVE_PLAN.md`, `AGENTS.md`, and `memory-bank/DECISIONS.md` D-012.

| Phase | Scope | Current status |
|---|---|---|
| P0–P4 | Core audit, validation, transaction/rollback | ✅ Complete |
| P5 | Conservative Safe Fix recipes | 🟡 Engineering + exact-build proof reconstruction + exact-artifact offline verification complete; imported-Figma acceptance pending (#6) |
| P6 | Advanced clone-only calibration | 🟡 Engineering complete on current verified head; post-P5 integration + fresh exact-build real-Figma closure pending (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟡 Engineering complete on current verified head; post-P5 integration + fresh exact-build stress/cancellation closure pending (#8) |
| P8 | Optional exporter adapters | ⏸ Deferred / #9 closed as not planned |

## Canonical verified artifacts

| Track | Branch | Verified head | CI / artifact | Digest |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `810d98d` | ✅ #488 · `figma-plugin-dist-488` | `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` |
| P6 | `feat/p6-advanced-structures` | `9a6ae3b` | ✅ #494 · `figma-plugin-dist-494` | `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3` |
| P7 | `feat/p7-batch-queue-core` | `cbfdb66` | ✅ #490 · `figma-plugin-dist-490` | `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43` |

> P6 #494 and P7 #490 remain verified engineering/reference artifacts. The final P6/P7 closure artifacts must be rebuilt after P5 lands because integration checks prove those branches require post-P5 conflict resolution.

## Latest verified development batch — 2026-09-08

- ✅ P5 artifact ships `verify-p5-evidence.mjs`; canonical calibration acceptance is recomputed outside Figma and bound to the same artifact source SHA / Actions run identity.
- ✅ P5 accepted evidence reconstructs the runtime proof through core `isValidP5RuntimeProof()` and rejects impossible proof-after-capture chronology.
- ✅ P5 CI #488 passed the full build/provenance/offline-verifier/local-import pipeline plus proof-reconstruction chronology regression coverage.
- ✅ P6 artifact ships `verify-p6-closure.mjs`; combined closure export is schema v2 with embedded persisted P5 runtime evidence.
- ✅ P6 verifier reconstructs the embedded P5 prerequisite, validates exact-build binding and rejects impossible proof chronology.
- ✅ P6 CI #494 passed install, typecheck, 171 tests, build, exact-artifact verifier smoke, local-import integrity and artifact upload.
- ✅ P7 artifact ships `verify-p7-closure.mjs`; closure export is schema v2 with raw P5 core proof + exact-build P7 receipt.
- ✅ P7 checkpoint evidence resolves post-checkpoint live Frames by stable queue index rather than potentially duplicated Frame names.
- ✅ P7 CI #490 passed the full schema-v2 exact-artifact verification pipeline.
- ✅ all three canonical tracks provide same-artifact offline verification plus deterministic `prepare-figma-import.mjs` manifest rebinding.
- ✅ `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md` is the operator checklist for runtime closure and follows the verified dependency order.
- ✅ non-mutating integration readiness automation classifies P5→main, P6→P5 and P7→P5 merge state without changing exact-build feature refs.
- ✅ `main` ships a self-contained local Figma import helper and package command; CI verifies compiled `code.js` / `ui.html` stay byte-for-byte unchanged after manifest ID rebinding.
- ✅ local-import preparation fails closed when source/output paths are equal or nested, preventing destructive source deletion or recursive copy behavior.
- ✅ GitHub Actions use current Node-24-based `checkout`, `setup-node` and `upload-artifact` v7 majors; workflow token permissions are explicitly read-only.
- ✅ duplicate stale CI/integration runs are cancelled through workflow concurrency controls.
- ✅ PR #39 merged into `main` at `fef549f`; final PR head passed CI #512 + Integration Readiness #10 before merge.
- ✅ post-merge `main` Integration Readiness #11 passed; CI #513 completed typecheck, tests, build and self-contained local-import safety verification successfully.
- ✅ final README checkpoint `b8a5869` passed CI #514 and Integration Readiness #12.
- ✅ AI-native operational policy now requires Issues first, PR/MR second, development third, followed by memory-bank + README module progress synchronization.
- ✅ stale P4-era memory-bank state has been synchronized to current P5/P6/P7 engineering and runtime/integration blockers.

## Repository audit checkpoint — 2026-09-08

- ✅ canonical P5/P6/P7 heads still match the verified heads above; their latest canonical CI runs remain green.
- ✅ open issues are limited to #6, #7 and #8; no additional product/code defect issue was found during the latest issue-first sweep.
- ✅ open PR/MR count was `0` before this policy-sync work batch began.
- ✅ repository search found no outstanding `TODO`, `FIXME`, `XXX` or `HACK` markers on `main`.
- ⚠️ canonical feature branches intentionally remain frozen while their exact-build runtime evidence is relevant; docs-only churn on those branches would change source SHA and proof identity.

## Integration readiness checkpoint — 2026-09-08

- ✅ canonical P5 → current `main` remains a documentation-only integration conflict; runtime source does not require conflict resolution at this gate.
- ✅ isolated `integration/p5-main-20260908` previously resolved the documentation differences without modifying canonical P5 runtime code; proof PR #37 became mergeable and CI #500 passed.
- ✅ canonical P5 head remains `810d98d`, so artifact #488 remains the exact build for issue #6 runtime acceptance.
- ⚠️ P6 → latest P5 is a real code conflict. Automated integration readiness reports overlap in CI/provenance/runtime files including `manifest.template.json`, `scripts/build.mjs`, `src/plugin/main.ts` and P5 evidence/proof storage.
- ⚠️ P7 → latest P5 is also a real code conflict, with overlap across build/runtime/P5 proof files plus branch-local import/acceptance surfaces.
- ✅ issue #6/#7/#8 trackers record this dependency/integration state.
- ✅ `scripts/check-integration-readiness.mjs` reproduces merge checks through read-only `git merge-tree --write-tree` simulation.
- ✅ `.github/workflows/integration-readiness.yml` reports all three dependency edges on `main`, relevant PRs and manual dispatch, and uploads machine-readable JSON evidence.
- ⚠️ do **not** collect final P6/P7 closure evidence on a build that must later be rebased. Merge P5 first, then resolve P6/P7 against merged P5, produce fresh exact-build artifacts, and collect final runtime evidence from those builds.

### Planned merge order after runtime acceptance

1. **P5:** collect imported-Figma proof from `figma-plugin-dist-488`, require same-artifact `verify-p5-evidence.mjs` exit `0`, then apply the already CI-proven main-documentation resolution, review/merge P5 and close #6.
2. **P6:** after P5 lands, rebase/resolve P6 against merged P5, run full CI and produce a **fresh exact-build artifact**; only then collect positive + preservation-refusal real-Figma closure, verify it with that same artifact, merge and close #7.
3. **P7:** after P5 lands, rebase/resolve P7 against merged P5, run full CI and produce a **fresh exact-build artifact**; only then collect 60+ Frame stress + active Full P3 cancellation closure, verify it with that same artifact, merge and close #8.

## Automated integration readiness

Run the non-mutating checker after fetching the canonical refs:

```bash
npm run integration:readiness
```

Use `--json` for machine-readable output or run the underlying script with `--strict` when an integration edge is expected to be code-conflict-free. See `docs/INTEGRATION_READINESS.md` for the full workflow. This checker is merge-preparation evidence only; it does not replace imported-Figma runtime acceptance.

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

Exit code `0` requires canonical acceptance and an exact artifact-build match. Offline verification is read-only and cannot replace the required imported-Figma runtime observation.

## Remaining real-runtime acceptance

Use `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md` as the operator sequence.

### P5 — issue #6

- [ ] import `figma-plugin-dist-488`
- [ ] run `Developer: P5 Runtime Self-Test`
- [ ] require `P5 Compiled Runtime Acceptance: PASS`
- [ ] verify rendered-pixel forced reject, restore, finalize and `0` leftovers
- [ ] export closure JSON and require same-artifact `verify-p5-evidence.mjs` exit code `0`
- [ ] after PASS, land P5 using the already validated main-doc integration resolution

Production Safe Fix mutation remains locked until this exact-build runtime proof passes.

### P6 — issue #7

Current #494 remains a verified engineering/reference artifact. Final closure must occur **after P5 merges**:

- [ ] rebase/resolve P6 against merged P5
- [ ] require full CI PASS and publish a fresh exact-build P6 artifact
- [ ] establish the exact-build P5 prerequisite in that fresh P6 build
- [ ] run positive image-bearing page-flow clone calibration and require Full P3 PASS with unchanged image-anchor count
- [ ] run preservation-sensitive page and require `NO_CANDIDATE` refusal PASS
- [ ] require `P6 Closure acceptance: PASS`
- [ ] export schema-v2 closure and require same-artifact `verify-p6-closure.mjs` exit code `0`

P6 production advanced mutation remains intentionally disabled.

### P7 — issue #8

Current #490 remains a verified engineering/reference artifact. Final closure must occur **after P5 merges**:

- [ ] rebase/resolve P7 against merged P5
- [ ] require full CI PASS and publish a fresh exact-build P7 artifact
- [ ] establish its exact-build P5 prerequisite
- [ ] execute a realistic 60+ Frame batch with `maxConcurrentProcessors === 1`
- [ ] request cancellation during a genuinely long active Full P3 operation
- [ ] retain settled active-frame cancellation evidence with matching processor attempt
- [ ] require `Closure acceptance: PASS`
- [ ] export schema-v2 closure and require same-artifact `verify-p7-closure.mjs` exit code `0`

## Safety invariants

- approved original design is the visual source of truth
- unsupported/ambiguous structures are refused, never guessed
- candidate-only mutation; Full P3 before P4 commit
- rendered-pixel evidence is mandatory for production validation
- runtime proof/evidence must be traceable to the exact CI-built artifact currently loaded
- offline closure verifiers must recompute canonical acceptance and match the verifier artifact build
- P5/P6 prerequisite proof chronology must be valid and cannot occur after evidence capture
- P6 prerequisite claims must match independently verified embedded P5 runtime evidence
- P7 prerequisite acceptance must be recomputed from raw P5 proof + exact-build P7 receipt
- P7 checkpoint live-ID evidence follows stable queue position, not potentially duplicated Frame names
- P6 advanced calibration remains clone-only with no production commit seam
- P7 processing is strictly sequential with cooperative cancellation
- local manifest rebinding must never alter compiled plugin code/UI
- local-import source and output paths must be separate, non-nested directories
- final P6/P7 runtime evidence must be collected only after their post-P5 integration builds are fixed and verified

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
npm run integration:readiness
```

For a repository-local artifact:

```bash
npm run prepare:figma-import -- <your-figma-plugin-id>
```

## Runtime acceptance operator guide

For real Figma Desktop acceptance collection and issue-closure evidence, follow `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md` in order. Synthetic CI evidence never substitutes for the imported-Figma runtime observation.
