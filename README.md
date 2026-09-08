# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

`Figma selection -> Audit -> classify -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** this README is updated after every meaningful verified development batch with canonical issue/PR state, module-wise progress, blockers and next actions.

**Open PR/MR:** `1` — PR #41 runtime artifact preflight is the current work batch; it will return to `0` after merge/final status sync.

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | ✅ COMPLETE | 100% | `██████████` | Keep Issues → PR/MR → development lifecycle, status verification and artifact registry synchronized |
| P0–P4 core audit/validation/transaction | ✅ COMPLETE | 100% | `██████████` | None |
| P5 Conservative Safe Fix | 🟡 RUNTIME ACCEPTANCE | 92% | `█████████░` | Preflight #488 → manifest rebind if needed → real imported-Figma proof → same-artifact verifier → merge #6 |
| P6 Advanced structures | 🟠 INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P6 conflicts → fresh registered artifact → real closure #7 |
| P7 60+ Frame batch queue | 🟠 INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P7 conflicts → fresh registered artifact → stress/cancel closure #8 |
| P8 Elementor exporter adapters | ⏸ DEFERRED | N/A | `──────────` | Re-evaluate after normalization line is stable |

**Overall active project progress:** `█████████░ 93%`

> Overall progress covers the active P0–P7 delivery line plus governance/tooling. Deferred P8 is not counted as an active unfinished blocker. Percentages represent verified scope, not optimistic completion claims.

### Mandatory AI-native work order

Every future work cycle must execute in this order:

1. **Issues first** — list all open issues, solve actionable ones, identify dependency/manual-runtime blockers, and never fabricate evidence to close a blocked issue.
2. **PR/MR second** — inspect all open Pull Requests / Merge Requests for CI, conflicts, mergeability and review feedback; fix and merge eligible work.
3. **Development third** — only then begin the highest-priority unblocked roadmap work, using safe parallel workstreams where useful.
4. **End-of-work sync** — run verification, update memory-bank files, and update this module-wise + overall progress before declaring the batch complete.

Canonical policy: `docs/AI_NATIVE_PLAN.md`, `AGENTS.md`, and `memory-bank/DECISIONS.md` D-012.

## Current issue / PR checkpoint — 2026-09-08

- ✅ issue-first sweep completed before this development batch.
- ✅ open issues remain exactly #6, #7 and #8; no new actionable product/code defect issue was found.
- ✅ issue #7 and #8 bodies were corrected so current P6 #494 / P7 #490 builds are explicitly **reference-only** for final closure.
- ✅ open PR/MR count was `0` before development began.
- 🟡 PR #41 is the current isolated main-side tooling branch and does not modify canonical P5/P6/P7 feature heads.
- ✅ PR #41 first implementation head passed CI #517: README contract, typecheck, tests, build and local-import safety.
- ✅ previous `main` checkpoint `f5463d2` passed CI #516 and Integration Readiness #14.

## Phase status

| Phase | Scope | Current status |
|---|---|---|
| P0–P4 | Core audit, validation, transaction/rollback | ✅ Complete |
| P5 | Conservative Safe Fix recipes | 🟡 Engineering/exact-build/offline verification complete; imported-Figma acceptance pending (#6) |
| P6 | Advanced clone-only calibration | 🟠 Engineering complete on reference head; post-P5 integration + fresh exact-build real-Figma closure pending (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟠 Engineering complete on reference head; post-P5 integration + fresh exact-build stress/cancellation closure pending (#8) |
| P8 | Optional exporter adapters | ⏸ Deferred / #9 closed as not planned |

## Canonical runtime artifact registry

| Track | Branch / head | CI / artifact | Digest | Closure eligibility |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` · `810d98d` | ✅ #488 · `figma-plugin-dist-488` | `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` | ✅ Final #6 runtime acceptance build |
| P6 | `feat/p6-advanced-structures` · `9a6ae3b` | ✅ #494 · `figma-plugin-dist-494` | `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3` | ⚠️ Reference only; rebuild after P5 merge |
| P7 | `feat/p7-batch-queue-core` · `cbfdb66` | ✅ #490 · `figma-plugin-dist-490` | `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43` | ⚠️ Reference only; rebuild after P5 merge |

Machine-readable operational registry: `config/runtime-artifacts.json`.

## Runtime artifact preflight

Before importing an artifact into Figma or collecting closure evidence, run the main-side fail-closed preflight:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

The preflight checks:

- exact `BUILD_INFO.txt` source/workflow SHA, Actions run ID and run number;
- required `code.js`, `ui.html`, manifest, packaged import helper and same-artifact verifier;
- manifest main/UI targets and required developer menu commands;
- offline-only network policy (`allowedDomains: ["none"]`);
- placeholder vs locally rebound Figma plugin ID;
- whether the registered build is eligible for the requested final-closure intent.

Expected current behavior:

```text
P5 #488 + final-closure  -> PASS
P6 #494 + final-closure  -> FAIL CLOSED
P7 #490 + final-closure  -> FAIL CLOSED
P6/P7 + reference intent -> PASS with warning
```

For reference-only inspection:

```bash
npm run runtime:preflight -- p6 /path/to/unpacked/figma-plugin-dist-494 --intent=reference
npm run runtime:preflight -- p7 /path/to/unpacked/figma-plugin-dist-490 --intent=reference
```

Use `--json` for machine-readable output. See `docs/RUNTIME_ARTIFACT_PREFLIGHT.md`.

Preflight is operational safety tooling only. It cannot mint runtime proof and never replaces real imported-Figma observation or the verifier shipped inside the exact artifact.

## Self-contained Figma artifact import

If a verified artifact still uses placeholder plugin ID `000000000000000000`, use the **helper packaged inside that artifact**:

```bash
cd /path/to/unpacked/artifact
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json`. `LOCAL_IMPORT_INFO.txt` proves compiled `code.js` / `ui.html` stayed unchanged. Manifest preparation is not runtime acceptance.

## Integration readiness

Non-mutating `scripts/check-integration-readiness.mjs` + `.github/workflows/integration-readiness.yml` simulate the dependency edges without changing exact-build feature refs.

- ✅ P5 → current `main`: runtime source is compatible; known conflict is documentation-only. Isolated integration proof PR #37 became mergeable and CI #500 passed.
- ⚠️ P6 → latest P5: real shared-code conflicts across build/provenance/runtime/P5 proof surfaces.
- ⚠️ P7 → latest P5: real shared-code conflicts across build/runtime/P5 proof/acceptance surfaces.
- ⚠️ do **not** collect final P6/P7 closure evidence on a build that must later be rebased.

Run locally after fetching canonical refs:

```bash
npm run integration:readiness
```

## Planned closure / merge order

1. **P5 / #6**
   - preflight `figma-plugin-dist-488` and require PASS;
   - rebind manifest locally if needed using the packaged helper;
   - import the exact build into Figma Desktop;
   - run `Developer: P5 Runtime Self-Test` and require `P5 Compiled Runtime Acceptance: PASS`;
   - prove rendered-pixel forced rejection, restore, finalize and `0` leftovers;
   - export `p5-evidence.json`;
   - run the same artifact's `verify-p5-evidence.mjs` and require exit `0`;
   - apply the CI-proven docs integration resolution, merge P5 and close #6.

2. **P6 / #7 — only after P5 lands**
   - resolve/rebase P6 against merged P5/main;
   - run full CI and create a fresh exact-build artifact;
   - update the runtime artifact registry to that fresh build;
   - establish its exact-build P5 prerequisite;
   - run image-bearing positive page-flow clone calibration with Full P3 PASS and unchanged image-anchor count;
   - run preservation-sensitive refusal and require `NO_CANDIDATE` / refusal PASS;
   - require combined P6 closure PASS and same-artifact verifier exit `0`;
   - merge and close #7.

3. **P7 / #8 — only after P5 lands**
   - resolve/rebase P7 against merged P5/main;
   - run full CI and create a fresh exact-build artifact;
   - update the runtime artifact registry to that fresh build;
   - establish its exact-build P5 prerequisite;
   - execute a realistic 60+ Frame batch with every item terminal and `maxConcurrentProcessors === 1`;
   - request cancellation during a genuinely long active Full P3 operation and retain matching cooperative settlement evidence;
   - require final closure PASS and same-artifact verifier exit `0`;
   - merge and close #8.

Full operator checklist: `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md`.

## Independent closure verification

Always run the verifier from the **same unpacked artifact** that produced the Figma runtime evidence:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
node verify-p6-closure.mjs < p6-closure.json
node verify-p7-closure.mjs < p7-closure.json
```

Exit code `0` requires canonical acceptance and exact artifact-build binding. Offline verification cannot replace real Figma observation.

## Safety invariants

- approved original design is the visual source of truth;
- unsupported/ambiguous structures are refused, never guessed;
- candidate-only mutation; Full P3 before P4 commit;
- rendered-pixel evidence is mandatory where required by runtime acceptance;
- runtime evidence must be traceable to the exact CI-built artifact loaded in Figma;
- offline verifiers must recompute canonical acceptance and match that artifact build;
- proof chronology must be valid and cannot occur after evidence capture;
- P6 advanced calibration remains clone-only with no production commit seam;
- P7 processing remains strictly sequential with cooperative cancellation;
- local manifest rebinding must never alter compiled plugin code/UI;
- final P6/P7 evidence must come from their post-P5 fresh integration builds.

## Development

```bash
npm install
npm run status:verify
npm run typecheck
npm test
npm run build
npm run integration:readiness
```

Runtime artifact preflight:

```bash
npm run runtime:preflight -- <p5|p6|p7> <unpacked-artifact-dir>
```

For a repository-local development artifact:

```bash
npm run prepare:figma-import -- <your-figma-plugin-id>
```
