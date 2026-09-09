# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

Final planned user surfaces:

- normal Figma plugin;
- npm/Node CLI for supported Figma inputs;
- structured ERROR / WARNING / INFO / IMPROVEMENT backlog output.

`Figma/plugin-or-CLI input -> Audit -> classify -> backlog -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** implementation progress and final validation progress are tracked separately. P9–P11 implementation is complete; P12 is the active final integrated validation gate.

**Open PR/MR:** `1` — PR #95 `P12: validate offline CLI and release determinism cross-platform`.

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | ✅ COMPLETE | 100% | `██████████` | Keep Issues → PR/MR → development lifecycle, status verification and artifact registry synchronized |
| P0–P4 core audit/validation/transaction | ✅ COMPLETE | 100% | `██████████` | None |
| P5 Conservative Safe Fix | 🟡 IMPLEMENTED / VALIDATION DEFERRED | 94% | `█████████░` | P12 real Figma closure → fresh P5→then-current-main `CODE_CONFLICT` resolution preserving current-main safety → merge #6 |
| P6 Advanced structures | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P12 after P5 merge: resolve P6 → fresh artifact → real positive/refusal closure #7 |
| P7 60+ Frame batch queue | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P12 after P5 merge: resolve P7 → fresh artifact → 60+ stress + active cancellation closure #8 |
| P8 Elementor exporter adapters | ⏸ DEFERRED | N/A | `──────────` | Re-evaluate after normalization line is stable |
| P9 Actionable backlog generator | ✅ IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged via PR #89; real plugin/export/parity behavior remains in #84 |
| P10 npm/Node CLI | ✅ IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged via PR #93; real Figma API/parity checks remain; offline cross-OS acceptance is in PR #95 |
| P11 Normal Figma plugin distribution | ✅ IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged via PR #94; final integrated install/runtime/release/Community readiness remains in #84 |
| P12 Final integrated validation | 🧪 VALIDATION IN PROGRESS | 0% | `░░░░░░░░░░` | PR #95 cross-platform offline determinism/release slice → then genuine Figma P5/P6/P7 + real API/plugin acceptance |

**Overall active project progress:** `█████████░ 93%`

> The 93% figure preserves the historical P0–P7 core-delivery denominator. P9–P12 are tracked as a separate release-expansion line so new scope does not rewrite verified historical progress.

### Release-expansion implementation status

- P9 implementation: `██████████ 100%`
- P10 implementation: `██████████ 100%`
- P11 implementation: `██████████ 100%`
- P12 final validation: `░░░░░░░░░░ 0%` — active in PR #95; no acceptance credit before the matrix passes.

### Current testing policy

P12 is the sole release-expansion acceptance gate:

- no real Figma evidence may be fabricated;
- implementation-complete is not the same as production-accepted;
- production safety locks and exact-build provenance remain active;
- P5/P6/P7 runtime acceptance must use genuine final-line evidence and current-main closure intake;
- P10 real credentialed Figma execution and plugin/CLI parity remain pending even if offline cross-platform validation passes;
- P11 normal install/private distribution/final Community readiness remain pending;
- Figma Community review/approval is external and must not be claimed until it actually occurs.

### Mandatory AI-native work order

Every work cycle executes in this order:

1. **Issues first** — inspect open issues and distinguish validation-pending/final-gate work.
2. **PR/MR second** — inspect open Pull Requests / Merge Requests and avoid duplicate/stale work.
3. **Development/validation third** — continue the highest-priority unblocked P12 obligation.
4. **End-of-work sync** — synchronize README + memory-bank state without claiming unobserved acceptance.

Canonical policy: `docs/AI_NATIVE_PLAN.md`, `AGENTS.md`, `memory-bank/DECISIONS.md`, and `docs/RELEASE_EXPANSION_PLAN.md`.

## Current repository checkpoint — 2026-09-10

- ✅ P9 backlog implementation merged through PR #89 at `67d6b3df05c8e4550b3df80f95cb5fabeb77de42`.
- ✅ P10 CLI/source-adapter implementation merged through PR #93 at `7e6aa85958060cc927d8fe09dc5cb88a3feba53e`.
- ✅ P11 normal Figma release packaging/distribution implementation merged through PR #94 at `7f83a1f82459cd9354882235dd04153bb20e5760`.
- ✅ post-P11 status main `f689fd0b703f83ee81953d36aef8d63bc2a56574` passed CI #645 and Integration Readiness #104.
- ✅ Integration Readiness #104 refreshed the current P5 → main state as `CODE_CONFLICT` with 11 conflicted paths, including `package.json`, build/import scripts and plugin/UI runtime files.
- 🧪 PR #95 is the first P12 acceptance slice: Linux/macOS/Windows offline CLI determinism, raw `.fig` refusal, path-with-spaces handling and release-package reproducibility.
- ✅ canonical P5 #488 artifact provenance/preflight/archive plumbing remains hardened and calibrated.
- ✅ P6 #494 and P7 #490 remain engineering/reference artifacts; final production integration requires fresh exact builds after final P5 merge.

Detailed engineering history is retained in `memory-bank/CHANGELOG.md`.

## Expanded release implementation

### P9 — Actionable backlog generator / issue #81

P9 implementation is complete and merged. It provides deterministic ERROR/WARNING/INFO/IMPROVEMENT categories, semantic fingerprints/IDs, lifecycle and run-to-run delta, summaries, JSON/Markdown exports, plugin UI/history and stale async invalidation.

P12 owns real plugin/export/parity validation.

### P10 — npm/Node CLI / issue #82

P10 implementation is complete and merged through PR #93.

Implemented commands:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>" --node-id "<frame-id>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

Implemented source/runtime contracts include official Figma REST input, personal/OAuth environment credentials, canonical snapshot schema v1, source snapshot export, deterministic audit/backlog outputs, previous-backlog delta, summary-only and fail thresholds, Node >=20 CLI bundle and credential-safe serialization.

Raw proprietary `.fig` files remain explicitly unsupported through undocumented parsing:

```text
/path/file.fig -> UNSUPPORTED_FIG_LOCAL_FILE
```

P12 PR #95 validates the offline/cross-platform portion. Real credentialed Figma API execution and plugin/CLI parity remain separate pending P12 obligations.

### P11 — Normal Figma plugin distribution / issue #83

P11 implementation is complete and merged through PR #94 at `7f83a1f82459cd9354882235dd04153bb20e5760`.

Implemented:

- release-only manifest + capability/menu registry;
- deterministic real-plugin-ID/source-SHA release builder;
- fail-closed package/provenance/menu/network verifier;
- destructive release-output overlap guard;
- normal-user current-capability menu commands;
- audit/backlog JSON + Markdown exports;
- developer-only command exclusion;
- release-facing CHANGELOG/version contract;
- Community metadata template + publishable readiness verifier;
- privacy/offline-network disclosure;
- local/private/team/Community distribution guidance.

CI #640 and Integration Readiness #99 passed before merge. Safe Fix/Prep and Batch are not falsely exposed before their final P12 integrated runtime line exists.

### P12 — Final integrated validation / issue #84

P12 is active.

#### Current slice — PR #95

The cross-platform offline acceptance workflow executes the same harness on Linux, macOS and Windows and retains a machine-readable evidence artifact per OS. It validates:

- built CLI execution with Node >=20;
- canonical snapshot audit through paths containing spaces;
- byte-identical audit JSON/Markdown across repeated identical runs;
- byte-identical backlog JSON/Markdown across repeated generation;
- deterministic summary-only output with no file writes;
- raw `.fig` fail-closed behavior with exit `2` + `UNSUPPORTED_FIG_LOCAL_FILE`;
- repeated release builds using identical plugin/source identity;
- byte-identical plugin runtime and provenance files across repeated release builds;
- release package verifier PASS.

It explicitly leaves these PENDING:

- real credentialed Figma REST execution;
- real Figma Desktop development-plugin import;
- P5 rendered-pixel runtime closure;
- P6 real-Figma closure;
- P7 real-Figma stress/cancellation closure;
- Community submission/review.

#### Remaining final matrix

After PR #95, P12 still requires:

- real release artifact provenance/reproducibility on the final integrated runtime line;
- local development-plugin import and normal installed/private plugin flow;
- P5 rendered-pixel reject/restore/finalize + zero leftovers;
- P5 closure intake + fresh then-current-main conflict resolution preserving current-main safety;
- P6 positive + preservation-refusal scenarios on a fresh final-line artifact;
- P7 realistic 60+ sequential queue + active Full-P3 cancellation on a fresh final-line artifact;
- P9 real backlog/export quality;
- P10 real Figma URL/file-key execution and plugin/CLI parity;
- final release menu matched to actually integrated capabilities;
- filled Community metadata/support/assets and publishable readiness;
- final closure-intake/release exit review.

Only after P12 passes should the expanded release be called production-accepted / 100%.

## Phase status

| Phase | Scope | Current status |
|---|---|---|
| P0–P4 | Core audit, validation, transaction/rollback | ✅ Complete |
| P5 | Conservative Safe Fix recipes | 🟡 Engineering/provenance implemented; final real Figma closure + fresh current-main integration in P12 (#6) |
| P6 | Advanced clone-only calibration | 🟠 Engineering complete on reference head; final integration/runtime acceptance in P12 (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟠 Engineering complete on reference head; final integration/stress/cancellation acceptance in P12 (#8) |
| P8 | Optional exporter adapters | ⏸ DEFERRED / #9 closed as not planned |
| P9 | Actionable backlog | ✅ Implementation complete / P12 validation pending; PR #89 / #81 closed |
| P10 | npm/Node CLI + source adapters | ✅ Implementation complete; P12 offline acceptance PR #95 active, real API/parity still pending |
| P11 | Normal Figma plugin distribution | ✅ Implementation complete / P12 validation pending; PR #94 / #83 closed |
| P12 | Final integrated validation | 🧪 ACTIVE — PR #95 offline cross-platform slice in progress / #84 |

## Canonical runtime artifact registry

| Track | Branch / head | CI / artifact | Digest | Closure eligibility |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` · `810d98d` | ✅ #488 · `figma-plugin-dist-488` | `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` | ✅ Final #6 runtime acceptance build |
| P6 | `feat/p6-advanced-structures` · `9a6ae3b` | ✅ #494 · `figma-plugin-dist-494` | `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3` | ⚠️ Reference only; final line requires fresh build |
| P7 | `feat/p7-batch-queue-core` · `cbfdb66` | ✅ #490 · `figma-plugin-dist-490` | `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43` | ⚠️ Reference only; final line requires fresh build |

Machine-readable operational registry: `config/runtime-artifacts.json` schema v3. It records exact build identity, ZIP digest, closure eligibility, immutable per-file SHA-256 pins and an id-excluded manifest semantic SHA-256 for each registered artifact.

## Current P5 integration map

Integration Readiness #104 against `main` `f689fd0b703f` reports P5 `810d98d6e09c` → main as `CODE_CONFLICT` in:

- `.github/workflows/ci.yml`;
- `README.md`;
- `memory-bank/CHANGELOG.md`;
- `memory-bank/NEXT_ACTIONS.md`;
- `memory-bank/PROJECT_STATE.md`;
- `memory-bank/ROADMAP.md`;
- `package.json`;
- `scripts/build.mjs`;
- `scripts/prepare-figma-import.mjs`;
- `src/plugin/main.ts`;
- `src/ui/ui.html`.

This exact map supersedes older file-list assumptions, but final integration must be refreshed again after genuine P5 closure because current main may move.

## Runtime artifact preflight

Canonical P5 final-closure preparation remains:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488 [--archive=/path/to/figma-plugin-dist-488.zip]
```

If plugin-ID rebinding is needed, use the helper packaged inside the exact artifact with a sibling/non-nested destination:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-figma-plugin-id> . ../figma-plugin-dist-488-local
```

Preparation is not runtime acceptance.

## Runtime closure intake

After genuine runtime evidence exists:

```bash
npm run runtime:closure-intake -- <p5|p6|p7> <unpacked-artifact-dir> <evidence-json> [--archive=/path/to/artifact.zip]
```

Direct packaged verifier invocation is diagnostic-only and cannot authorize final release acceptance by itself.

## Safety invariants

- approved original design remains the visual source of truth;
- unsupported or ambiguous structures are refused, never guessed;
- unsafe findings become backlog items rather than guessed mutations;
- mutations occur only on candidate clones before mandatory validation;
- production mutation locks remain active until final validation passes;
- runtime proof remains traceable to exact final artifacts;
- current-main safety/tooling/release work must not be lost during P5/P6/P7 integration;
- plugin and CLI share one deterministic analysis core;
- raw proprietary `.fig` files are not parsed through undocumented reverse engineering;
- normal release menus expose only capabilities actually integrated on the release line.

## Current execution order

1. ✅ P9 / #81 — implementation complete.
2. ✅ P10 / #82 — implementation complete.
3. ✅ P11 / #83 — implementation complete.
4. 🧪 P12 / #84 — PR #95 offline cross-platform acceptance, then genuine Figma/runtime/integration acceptance.

P8 remains optional/deferred.

## Development and validation commands

```bash
npm install
npm run status:verify
npm run typecheck
npm test
npm run build
npm run build:cli
npm run verify:release-contract
npm run test:release-package
npm run community:verify
npm run p12:offline
npm run integration:readiness
```

> Automated/offline checks are real evidence for the specific properties they exercise, but they are not substitutes for P12's pending real Figma/runtime observations.
