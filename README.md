# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

`Figma selection -> Audit -> classify -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** after every meaningful verified work batch, this README must be synchronized with issue/PR state, module-wise progress, blockers and next actions.

**Open PR/MR:** `0`

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | ✅ COMPLETE | 100% | `██████████` | Keep Issues → PR/MR → development lifecycle, status verification and artifact registry synchronized |
| P0–P4 core audit/validation/transaction | ✅ COMPLETE | 100% | `██████████` | None |
| P5 Conservative Safe Fix | 🟡 RUNTIME ACCEPTANCE | 94% | `█████████░` | Canonical #488 exact-main preflight + retained-ZIP digest verified → real Figma runtime/rendered-pixel proof → closure intake PASS → fresh current-main integration resolution + full CI → merge #6 |
| P6 Advanced structures | 🟠 INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P6 conflicts → fresh registered artifact → real image-bearing + refusal closure #7 |
| P7 60+ Frame batch queue | 🟠 INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P7 conflicts → fresh registered artifact → 60+ stress + active cancellation closure #8 |
| P8 Elementor exporter adapters | ⏸ DEFERRED | N/A | `──────────` | Re-evaluate after normalization line is stable |

**Overall active project progress:** `█████████░ 93%`

> Overall progress covers the active P0–P7 delivery line plus governance/tooling. Deferred P8 is not counted as an active unfinished blocker. Percentages represent verified product/runtime scope, not tooling volume or optimistic completion claims.

### Mandatory AI-native work order

Every work cycle must execute in this order:

1. **Issues first** — list all open issues, solve actionable code/docs/test issues, identify dependency/manual-runtime blockers, and never fabricate evidence to close a blocked issue.
2. **PR/MR second** — inspect all open Pull Requests / Merge Requests for CI, conflicts, mergeability and review feedback; fix and merge eligible work.
3. **Development third** — only then begin the highest-priority unblocked roadmap work.
4. **End-of-work sync** — run verification, update memory-bank files, and synchronize this module-wise + overall progress before declaring the batch complete.

Canonical policy: `docs/AI_NATIVE_PLAN.md`, `AGENTS.md`, and `memory-bank/DECISIONS.md` D-012.

## Latest verified checkpoint — 2026-09-10

- ✅ latest verified base before issue #80 work is `main` `698940369635b6f40972e6404e7e7ff71b57ea14`; PR #79 hardened the real-Figma closure runbook and passed post-merge CI #618 + Integration Readiness #90.
- ✅ the actual canonical P5 GitHub Actions artifact #488 (`figma-plugin-dist-488`, artifact id `10062772456`) was downloaded again and its retained ZIP SHA-256 matched the registered digest `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`.
- ✅ exact current-main `scripts/runtime-artifact-preflight.mjs` and `config/runtime-artifacts.json` source bytes were reconstructed from GitHub and verified against their Git blob SHAs (`8d2d459b310ed2426f353ea91687d2a6d1dd6e09` and `de517b340cf951896fa3e312b40d9ddb4e86f944`) before execution.
- ✅ current-main final-closure preflight on canonical #488 + retained ZIP passed with exact BUILD_INFO identity, raw ZIP digest MATCH, `5/5` immutable file SHA-256 matches and schema-v3 id-excluded manifest semantic SHA-256 MATCH.
- ✅ the packaged #488 helper produced a separate sibling prepared copy using a calibration numeric plugin ID; `code.js` / `ui.html` remained byte-identical and the prepared copy passed the same current-main preflight with the same manifest semantic hash. This calibration does **not** replace preparation with the actual Figma development-plugin ID or the real import.
- ✅ exact current-main `runtime-closure-intake.mjs` bytes were separately Git-blob verified (`52bb19fead394579e1e89f09141bfbc6900f5cc3`) and exercised against canonical #488 and the prepared sibling copy with intentionally invalid `{}` evidence. In both cases artifact preflight passed, the exact same-artifact verifier ran through `verified-bytes-memory-bootstrap`, and the invalid evidence correctly failed closed at verifier exit `1`.
- ✅ issue #6 marks canonical current-main preflight and retained-ZIP digest checks complete. Every imported-Figma/runtime/rendered-pixel/real-evidence closure item remains open.
- ⚠️ latest Integration Readiness #90 reports P5 → current `main` as **`CODE_CONFLICT`**, not docs-only. Conflicts include `.github/workflows/ci.yml` and `scripts/prepare-figma-import.mjs` plus README/memory-bank files. The historical integration proof #37 / CI #500 is therefore superseded for merge authorization.
- ✅ after real P5 runtime acceptance + closure-intake PASS, a fresh P5→then-current-main integration resolution must preserve current-main helper overlap safety, CI/status/tooling hardening and current closure/runbook contracts while integrating P5 runtime code deliberately, then pass full PR CI before #6 can close.
- ✅ the connected Figma canvas API can execute Plugin API operations in known design files, but it does not establish the required condition of importing and running this exact downloaded development-plugin artifact with its own manifest/menu/UI iframe. It therefore cannot substitute for P5 acceptance.
- ✅ open product/runtime dependency chain remains #6 → #7/#8. Canonical feature heads and registered artifact bytes are unchanged, so P5 remains 94% and overall active progress remains 93%.

Detailed engineering history is retained in `memory-bank/CHANGELOG.md`.

## Phase status

| Phase | Scope | Current status |
|---|---|---|
| P0–P4 | Core audit, validation, transaction/rollback | ✅ Complete |
| P5 | Conservative Safe Fix recipes | 🟡 Engineering/exact-build/offline verification + exact-main artifact/archive preflight calibration complete; real imported-Figma acceptance + closure intake + fresh current-main integration proof pending (#6) |
| P6 | Advanced clone-only calibration | 🟠 Engineering complete on reference head; post-P5 integration + fresh exact-build real-Figma closure pending (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟠 Engineering complete on reference head; post-P5 integration + fresh exact-build stress/cancellation closure pending (#8) |
| P8 | Optional exporter adapters | ⏸ DEFERRED / #9 closed as not planned |

## Canonical runtime artifact registry

| Track | Branch / head | CI / artifact | Digest | Closure eligibility |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` · `810d98d` | ✅ #488 · `figma-plugin-dist-488` | `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` | ✅ Final #6 runtime acceptance build |
| P6 | `feat/p6-advanced-structures` · `9a6ae3b` | ✅ #494 · `figma-plugin-dist-494` | `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3` | ⚠️ Reference only; rebuild after P5 merge |
| P7 | `feat/p7-batch-queue-core` · `cbfdb66` | ✅ #490 · `figma-plugin-dist-490` | `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43` | ⚠️ Reference only; rebuild after P5 merge |

Machine-readable operational registry: `config/runtime-artifacts.json` schema v3. It records exact build identity, ZIP digest, closure eligibility, immutable per-file SHA-256 pins and an id-excluded manifest semantic SHA-256 for each registered artifact.

### P5 registered provenance

- Source/workflow SHA: `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`
- Actions run ID / run number: `34242984963` / `488`
- Artifact: `figma-plugin-dist-488`
- ZIP digest: `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`
- Manifest semantic SHA-256, top-level plugin `id` excluded: `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`
- Immutable file pins: `BUILD_INFO.txt`, `code.js`, `ui.html`, `prepare-figma-import.mjs`, `verify-p5-evidence.mjs` (`5/5`).

## Runtime artifact preflight

Before importing an artifact into Figma or collecting closure evidence, use current `main`:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

When the original downloaded Actions ZIP is retained, bind those raw bytes too:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488 --archive=/path/to/figma-plugin-dist-488.zip
```

For canonical P5 #488, both commands have been exercised against the actual downloaded artifact using exact current-main preflight source and registry bytes. The retained-ZIP form passed with archive digest MATCH, exact BUILD_INFO identity, `5/5` immutable file pins and manifest semantic MATCH.

Preflight validates:

- real non-symlink artifact root and required files;
- stable `dev` / `ino` / size / mtime / ctime identity between validation and descriptor open;
- descriptor-pinned BUILD_INFO, manifest and immutable file reads;
- exact source/workflow SHA, run ID and run number;
- immutable runtime/helper/verifier SHA-256 pins;
- schema-v3 manifest semantics after removing only top-level `id` and recursively key-sorting objects;
- required menu commands and offline-only `allowedDomains=["none"]`;
- optional retained ZIP raw SHA-256 against the registry digest;
- final-closure eligibility for the selected track.

P6 #494 and P7 #490 remain reference-only and fail closed for final-closure intent.

## Self-contained Figma artifact import

Canonical #488 still has the placeholder plugin ID. Prepare a copy with the **actual Figma development-plugin ID** using the helper packaged inside that same artifact and a sibling/non-nested output directory:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-figma-plugin-id> . ../figma-plugin-dist-488-local
```

Then import:

```text
../figma-plugin-dist-488-local/manifest.json
```

Requirements:

- never use a nested output such as `./dist-local`;
- `code.js` and `ui.html` remain byte-for-byte unchanged;
- only top-level manifest `id` may vary semantically;
- schema-v3 manifest semantic SHA remains the registered MATCH;
- preparation itself is **not** runtime acceptance.

The calibration sibling copy proved this operator path preserves code/UI and registered manifest semantics, but a calibration numeric ID is not the real Figma development-plugin ID.

## P5 real Figma acceptance — next critical path

The remaining #6 runtime gate requires the actual downloaded artifact-derived development plugin running in Figma Desktop with its own UI iframe/pixel broker:

1. prepare the sibling copy using the actual Figma development-plugin ID;
2. import that exact prepared `manifest.json` into Figma Desktop;
3. run `Developer: P5 Runtime Self-Test`;
4. require `P5 Compiled Runtime Acceptance: PASS`;
5. collect real rendered-pixel forced-reject evidence;
6. prove restore and finalize behavior;
7. require checkpoint cleanup and `0` leftovers;
8. confirm stale proof from another artifact cannot unlock the current build;
9. export the provenance-bound real closure JSON as `p5-evidence.json` to a stable regular non-symlink file.

Synthetic CI, direct Plugin API execution in another connector runtime, or manually fabricated JSON cannot replace these observations.

## Runtime closure intake

After the **real** P5 evidence is exported, run:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json --archive=/path/to/figma-plugin-dist-488.zip
```

Closure intake requires, in order:

1. final-closure artifact/archive preflight PASS;
2. stable regular non-symlink evidence input;
3. raw evidence-byte SHA-256 + strict UTF-8 + top-level JSON-object acceptance;
4. post-preflight re-open of the same-artifact verifier through a stable descriptor;
5. verifier SHA-256 equality with the immutable preflight pin;
6. exact verified verifier bytes executed through the hash-checking in-memory bootstrap;
7. same-artifact verifier exit code `0`.

The current-main rejection calibration used intentionally invalid `{}` evidence and proved that this path reaches the exact P5 verifier yet fails closed at exit `1` when real runtime proof is absent. It does **not** satisfy the final closure checklist.

## Integration readiness

Latest non-mutating Integration Readiness #90 on `main` `698940369635b6f40972e6404e7e7ff71b57ea14` reports:

- ⚠️ **P5 → current `main`: `CODE_CONFLICT`**. Conflicts include `.github/workflows/ci.yml`, `scripts/prepare-figma-import.mjs`, README and memory-bank files. Historical docs-only proof #37 / CI #500 is superseded for merge authorization. After real P5 closure PASS, resolve against the then-current main, preserve current-main import-helper overlap safety + CI/status/tooling/closure hardening, run full PR CI and review the exact resolved diff before merge.
- ⚠️ P6 → latest P5: `CODE_CONFLICT`; resolve after P5 lands and produce a fresh exact build.
- ⚠️ P7 → latest P5: `CODE_CONFLICT`; resolve after P5 lands and produce a fresh exact build.
- ⚠️ final P6/P7 runtime evidence must come from fresh post-P5 integration builds.

Run locally after fetching canonical refs:

```bash
npm run integration:readiness
```

## Planned closure / merge order

### 1. P5 / issue #6

`actual Figma ID sibling prep → exact artifact import → runtime self-test → rendered-pixel reject/restore/finalize → zero leftovers → real p5-evidence.json → closure-intake PASS → fresh P5→current-main integration resolution preserving main safety/tooling → full CI PASS → merge P5 → close #6`

### 2. P6 / issue #7 — only after P5 lands

`resolve against merged P5 → full CI → fresh exact artifact + schema-v3 provenance → exact-build P5 prerequisite → real image-bearing positive calibration + preservation refusal → closure-intake PASS → merge → close #7`

### 3. P7 / issue #8 — only after P5 lands

`resolve against merged P5 → full CI → fresh exact artifact + schema-v3 provenance → exact-build P5 prerequisite → realistic 60+ Frame terminal run with maxConcurrentProcessors === 1 → active Full-P3 cooperative cancellation → closure-intake PASS → merge → close #8`

Full operator checklist: `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md`.

## Safety invariants

- approved original design remains the visual source of truth;
- unsupported or ambiguous structures are refused, never guessed;
- mutations occur only on a candidate clone before mandatory Full P3 validation;
- rendered-pixel evidence is mandatory where required by runtime acceptance;
- runtime proof must be traceable to the exact CI-built artifact loaded in Figma;
- artifact/archive/evidence/verifier filesystem reads are fail-closed at the documented trust boundaries;
- manifest-only plugin-ID rebinding may change only top-level `id`; compiled code/UI stay byte-identical;
- current-main source/output overlap protection and hardened CI/status/closure tooling must not be lost when P5 is integrated;
- P6 advanced calibration remains clone-only with no production commit seam;
- P7 processing remains strictly sequential with cooperative cancellation;
- final P6/P7 closure evidence must come from their post-P5 fresh exact builds.

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
npm run runtime:preflight -- <p5|p6|p7> <unpacked-artifact-dir> [--archive=/path/to/artifact.zip]
```

Runtime closure intake:

```bash
npm run runtime:closure-intake -- <p5|p6|p7> <unpacked-artifact-dir> <evidence-json> [--archive=/path/to/artifact.zip]
```

Repository-local development import preparation must also use a separate non-nested output:

```bash
npm run prepare:figma-import -- <your-figma-plugin-id> dist dist-local-sibling
```
