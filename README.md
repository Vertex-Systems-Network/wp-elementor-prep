# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

`Figma selection -> Audit -> classify -> backlog/plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** after every meaningful verified work batch, this README must be synchronized with issue/PR state, module-wise progress, blockers and next actions.

> **Current release policy:** per P12 issue #84, manual/runtime/end-to-end product validation is batched into the final integrated validation phase. A module may therefore be **100% implementation complete while still validation-pending**. `100%` below does not mean production-accepted unless P12 has passed.

**Open PR/MR:** `0`

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | ✅ COMPLETE | 100% | `██████████` | Keep Issues → PR/MR → development lifecycle, status verification and artifact registry synchronized |
| P0–P4 core audit/validation/transaction | ✅ IMPLEMENTATION COMPLETE | 100% | `██████████` | Covered again by final integrated P12 validation |
| P5 Conservative Safe Fix | 🟡 IMPLEMENTATION COMPLETE · P12 VALIDATION PENDING | 100% | `██████████` | Retain canonical #488; real Desktop/runtime/rendered-pixel + closure/integration validation is batched into P12 |
| P6 Advanced structures | 🟡 IMPLEMENTATION COMPLETE · P12 VALIDATION PENDING | 100% | `██████████` | Retain #494 as engineering reference; fresh integrated artifact/runtime scenarios are part of P12 |
| P7 60+ Frame batch queue | 🟡 IMPLEMENTATION COMPLETE · P12 VALIDATION PENDING | 100% | `██████████` | Retain #490 as engineering reference; integrated stress/cancellation is part of P12 |
| P8 Elementor exporter adapters | ⏸ DEFERRED | N/A | `──────────` | Re-evaluate after the active release line stabilizes |
| P9 Actionable backlog | 🟡 IMPLEMENTATION COMPLETE · P12 VALIDATION PENDING | 100% | `██████████` | Deterministic backlog/core/UI/export implemented in PR #87; final manual/product validation occurs in P12 |
| P10 npm/CLI + source adapters | ⚪ NEXT | 0% | `░░░░░░░░░░` | Implement Figma REST + canonical snapshot adapters, deterministic CLI outputs, explicit raw `.fig` refusal |
| P11 Normal Figma plugin packaging | ⚪ PLANNED | 0% | `░░░░░░░░░░` | Production/release manifest, user command surface, packaging/distribution assets/workflow |
| P12 Final integrated validation + release acceptance | ⚪ PLANNED | 0% | `░░░░░░░░░░` | Run one integrated manual/runtime/end-to-end validation matrix after P9–P11 implementation |

**Overall active project progress:** `███████░░░ 67%`

The overall percentage is the rounded arithmetic mean of all active numeric module rows in the table; deferred `N/A` rows are excluded. This keeps progress mechanically reproducible when scope expands. The bar is a coarse 10-cell visualization of that numeric value.

### Mandatory AI-native work order

Every work cycle must execute in this order:

1. **Issues first** — inspect all open issues, solve actionable implementation work, and classify genuine dependency/manual-validation blockers without fabricating evidence.
2. **PR/MR second** — inspect CI, conflicts, mergeability and review feedback; merge only eligible work.
3. **Development third** — continue the highest-priority unblocked roadmap item.
4. **End-of-work sync** — run verification and synchronize README + memory-bank state before completion.

Canonical policy: `docs/AI_NATIVE_PLAN.md`, `AGENTS.md`, and `memory-bank/DECISIONS.md` D-012.

## Current roadmap direction — 2026-09-10

Open release-line issues are now:

- #6 — P5 implementation complete; final runtime/integration validation pending P12;
- #7 — P6 implementation complete; final integrated positive/refusal validation pending P12;
- #8 — P7 implementation complete; final integrated 60+ stress/cancellation validation pending P12;
- #81 — P9 actionable backlog;
- #82 — P10 npm/CLI runner + supported Figma input adapters;
- #83 — P11 normal Figma plugin packaging/distribution;
- #84 — P12 final integrated validation and release acceptance.

Issue #84 explicitly defers repeated manual/runtime/end-to-end testing until implementation scope is complete. Existing safety locks stay in force: deferred validation never authorizes production mutation, issue closure based on fake evidence, or claims of release readiness.

## P9 actionable backlog

P9 adds a pure deterministic backlog engine in `src/core/backlog.ts` that is shared by the Figma plugin and future P10 CLI.

Implemented behavior:

- categories: `ERROR`, `WARNING`, `INFO`, `IMPROVEMENT`;
- stable semantic `id` / fingerprint independent of volatile Figma node IDs/timestamps;
- severity + priority + source/finding code;
- file/page/frame/section/node contexts where available;
- title, explanation, evidence, confidence, proposed action and optional recipe candidate;
- `autoFixEligible` is fail-safe and remains `false` for audit recipe opportunities unless a separate safety gate proves otherwise;
- `OPEN`, `RESOLVED`, `REGRESSED`, `ACCEPTED_RISK` lifecycle;
- `NEW`, `RESOLVED`, `REGRESSED`, `UNCHANGED` run-to-run delta;
- repeated semantic occurrences deduplicated while retaining individual contexts/evidence;
- resolved history retained across clean runs so a later return is correctly marked `REGRESSED`;
- generic runtime-finding input for future P5/P6/P7/P12 signals;
- deterministic `backlog.json` and `backlog.md` serialization;
- plugin `clientStorage` persistence for consecutive-run delta;
- plugin UI backlog summary/view plus JSON/Markdown export;
- reporting only: no P9 path mutates the document.

Detailed contract: `docs/P9_ACTIONABLE_BACKLOG.md`.

## Canonical runtime artifact registry

| Track | Branch / head | CI / artifact | Digest | Current role |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` · `810d98d` | ✅ #488 · `figma-plugin-dist-488` | `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` | Engineering-complete canonical P5 validation reference |
| P6 | `feat/p6-advanced-structures` · `9a6ae3b` | ✅ #494 · `figma-plugin-dist-494` | `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3` | Engineering reference; P12 uses a fresh integrated build |
| P7 | `feat/p7-batch-queue-core` · `cbfdb66` | ✅ #490 · `figma-plugin-dist-490` | `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43` | Engineering reference; P12 uses a fresh integrated build |

Machine-readable operational registry: `config/runtime-artifacts.json` schema v3. It records exact build identity, ZIP digest, closure eligibility, immutable per-file SHA-256 pins and an id-excluded manifest semantic SHA-256 for each registered artifact.

### P5 registered provenance

- source/workflow SHA: `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`
- Actions run ID / run number: `34242984963` / `488`
- artifact: `figma-plugin-dist-488`
- ZIP digest: `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`
- manifest semantic SHA-256, top-level plugin `id` excluded: `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`
- immutable file pins: `BUILD_INFO.txt`, `code.js`, `ui.html`, `prepare-figma-import.mjs`, `verify-p5-evidence.mjs` (`5/5`).

The actual canonical #488 package and retained ZIP have already passed current-main preflight calibration. This is provenance/tooling evidence only, not real Figma acceptance.

## Runtime safety boundaries retained for P12

Before a registered artifact is used for final closure:

```bash
npm run runtime:preflight -- <p5|p6|p7> <unpacked-artifact-dir> [--archive=/path/to/artifact.zip]
```

After **real** Figma evidence is exported:

```bash
npm run runtime:closure-intake -- <p5|p6|p7> <unpacked-artifact-dir> <evidence-json> [--archive=/path/to/artifact.zip]
```

Current tooling enforces:

- non-symlink artifact root / required files / evidence / optional archive;
- stable descriptor identity for trusted reads;
- exact build identity and immutable file SHA-256 pins;
- schema-v3 id-excluded manifest semantic equality;
- optional retained Actions ZIP raw digest equality;
- strict evidence UTF-8 / JSON / exact-byte SHA intake;
- post-preflight verifier revalidation;
- exact verified verifier bytes executed via hash-checking in-memory bootstrap;
- verifier exit `0` for final closure.

Direct packaged-verifier execution is diagnostic-only and cannot replace current-main closure intake.

## Self-contained Figma artifact import

When a validation artifact contains the placeholder plugin ID, prepare a separate sibling/non-nested copy using the helper packaged inside that exact artifact:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-figma-plugin-id> . ../figma-plugin-dist-488-local
```

Never use a nested output such as `./dist-local`. Compiled code/UI must remain byte-identical and only top-level manifest `id` may change semantically.

## P12 final validation matrix

Final integrated validation must cover at least:

- production/release artifact provenance and reproducibility;
- local Figma development-plugin import and normal release install/run behavior;
- P5 rendered-pixel reject/restore/finalize + zero leftovers;
- integrated P6 positive + preservation-refusal scenarios;
- integrated P7 realistic 60+ frame sequential queue + active Full-P3 cancellation;
- P9 backlog categories, dedupe, delta, UI and exports;
- P10 Figma URL/file-key REST route + canonical snapshot route + raw `.fig` clear refusal unless a supported adapter exists;
- plugin/CLI parity and deterministic outputs;
- P11 release manifest/user command surface/private distribution/Community submission package readiness;
- current-main closure intake on final registered artifacts/evidence;
- Windows/macOS CLI path/error handling where applicable.

Only after P12 passes should production acceptance gates close, overall release progress reach 100%, or Community/public release be described as ready. Figma Community listing itself still depends on Figma review.

## Development

```bash
npm install
npm run status:verify
npm run typecheck
npm test
npm run build
npm run integration:readiness
```

P10 will add stable npm CLI entrypoints for Figma REST and canonical snapshot inputs. Raw proprietary `.fig` parsing is explicitly outside the supported deterministic core unless a documented supported adapter exists.
