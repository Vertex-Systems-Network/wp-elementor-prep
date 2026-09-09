# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

Final planned user surfaces:

- normal Figma plugin;
- npm/Node CLI for supported Figma inputs;
- structured ERROR / WARNING / INFO / IMPROVEMENT backlog output.

`Figma/plugin-or-CLI input -> Audit -> classify -> backlog -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** implementation progress and final validation progress are tracked separately. Manual/runtime/end-to-end product testing remains deferred until P12 final integrated validation.

**Open PR/MR:** `1` — PR #94 `P11: add normal Figma release packaging and distribution`.

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | ✅ COMPLETE | 100% | `██████████` | Keep Issues → PR/MR → development lifecycle, status verification and artifact registry synchronized |
| P0–P4 core audit/validation/transaction | ✅ COMPLETE | 100% | `██████████` | None |
| P5 Conservative Safe Fix | 🟡 IMPLEMENTED / VALIDATION DEFERRED | 94% | `█████████░` | P12 real Figma closure → fresh P5→then-current-main `CODE_CONFLICT` resolution preserving PR #85 requirements → merge #6 |
| P6 Advanced structures | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P12 after P5 merge: resolve P6 → fresh artifact → real positive/refusal closure #7 |
| P7 60+ Frame batch queue | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P12 after P5 merge: resolve P7 → fresh artifact → 60+ stress + active cancellation closure #8 |
| P8 Elementor exporter adapters | ⏸ DEFERRED | N/A | `──────────` | Re-evaluate after normalization line is stable |
| P9 Actionable backlog generator | ✅ IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged via PR #89; validate real plugin/export/parity behavior in #84 |
| P10 npm/Node CLI | ✅ IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged via PR #93; validate real Figma URL/snapshot parity + OS path behavior in #84 |
| P11 Normal Figma plugin distribution | 🔵 IMPLEMENTATION IN PROGRESS | 85% | `█████████░` | PR #94 CI/review → merge #83 → P12 normal-install/runtime/release acceptance |
| P12 Final integrated validation | 🧪 FINAL GATE | 0% | `░░░░░░░░░░` | Run all deferred manual/runtime/end-to-end acceptance after P11 implementation (#84) |

**Overall active project progress:** `█████████░ 93%`

> The 93% figure preserves the historical P0–P7 core-delivery denominator. P9–P12 are tracked as a separate release-expansion line so new scope does not rewrite verified historical progress.

### Release-expansion implementation status

- P9 implementation: `██████████ 100%`
- P10 implementation: `██████████ 100%`
- P11 implementation: `█████████░ 85%`
- P12 final validation: `░░░░░░░░░░ 0%`

### Current testing policy

Per current project direction:

- implementation continues where safe;
- manual/runtime/end-to-end product testing is deferred to P12;
- production safety locks and provenance rules remain active;
- no real Figma evidence may be fabricated;
- implementation-complete is not the same as production-accepted;
- automated repository checks are implementation safeguards only and do not count as final product acceptance;
- latest P5→main `CODE_CONFLICT` state from PR #85 remains authoritative until a fresh final integration resolution is performed.

### Mandatory AI-native work order

Every work cycle executes in this order:

1. **Issues first** — inspect open issues and distinguish implementation work from validation-pending work.
2. **PR/MR second** — inspect open Pull Requests / Merge Requests and avoid duplicate/stale work.
3. **Development third** — continue the highest-priority unblocked implementation item.
4. **End-of-work sync** — synchronize README + memory-bank state without claiming deferred acceptance.

Canonical policy: `docs/AI_NATIVE_PLAN.md`, `AGENTS.md`, `memory-bank/DECISIONS.md`, and `docs/RELEASE_EXPANSION_PLAN.md`.

## Current repository checkpoint — 2026-09-10

- ✅ latest merged main baseline is `7e6aa85958060cc927d8fe09dc5cb88a3feba53e` from P10 PR #93.
- ✅ P9 backlog implementation merged through PR #89 at `67d6b3df05c8e4550b3df80f95cb5fabeb77de42`; issue #81 is implementation-complete with P12 validation pending.
- ✅ P10 CLI/source-adapter implementation merged through PR #93; issue #82 and implementation subtask #90 are closed as implementation-complete with P12 validation pending.
- 🔵 P11 #83 implementation is under review in PR #94 from `feat/p11-release-packaging`.
- ✅ PR #85 remains authoritative for the final P5 integration contract: P5 → current main is `CODE_CONFLICT`, not docs-only.
- ✅ canonical P5 #488 artifact provenance/preflight/archive plumbing remains hardened and calibrated.
- ✅ P6 #494 and P7 #490 remain engineering/reference artifacts; final production integration requires fresh exact builds after final P5 merge.
- 🧪 manual/runtime/end-to-end acceptance is intentionally deferred to #84/P12.

Detailed engineering history is retained in `memory-bank/CHANGELOG.md`.

## Expanded release implementation

### P9 — Actionable backlog generator / issue #81

P9 implementation is complete and merged.

Implemented:

- `ERROR`, `WARNING`, `INFO`, `IMPROVEMENT` categories;
- deterministic semantic fingerprints and IDs;
- severity/priority, Figma context, evidence/confidence and proposed action;
- OPEN / RESOLVED / REGRESSED / ACCEPTED_RISK lifecycle;
- NEW / RESOLVED / REGRESSED / UNCHANGED run-to-run delta;
- retained resolved history;
- category and severity summaries;
- deterministic `backlog.json` / `backlog.md` serialization;
- plugin UI backlog view/export;
- clientStorage history with stale-audit invalidation;
- non-mutating reporting boundary.

P12 still owns real plugin/export/parity validation.

### P10 — npm/Node CLI / issue #82

P10 implementation is complete and merged through PR #93.

Implemented commands:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>" --node-id "<frame-id>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

Implemented source/runtime contracts:

- official Figma REST URL/file-key adapter;
- personal token and OAuth environment credential modes;
- explicit Frame/node selection with fail-closed ambiguous-frame behavior;
- owned canonical snapshot schema v1;
- cloud `source-snapshot.json` export;
- audit/backlog JSON + Markdown outputs;
- previous-backlog delta input;
- summary-only mode and CI fail thresholds;
- stable exit-code contract;
- Node >=20 temporary esbuild runner and persistent `build:cli` bundle;
- source-bound timestamps for snapshot reproducibility;
- credentials excluded from serialized reports/backlogs/snapshots.

#### Raw `.fig` path rule

The deterministic core does **not** reverse-engineer proprietary raw `.fig` files through an undocumented parser.

Until a supported bridge exists:

```text
/path/file.fig -> UNSUPPORTED_FIG_LOCAL_FILE
```

P12 owns real credentialed Figma execution, snapshot parity, Windows/macOS path behavior and production acceptance.

### P11 — Normal Figma plugin distribution / issue #83

P11 implementation is active in PR #94 from `feat/p11-release-packaging`.

Implemented on the branch:

- separate `manifest.release.template.json` for the normal release surface;
- explicit release capability/menu registry in `config/plugin-release.json`;
- deterministic release package builder requiring a real Figma plugin ID and source SHA;
- fail-closed release verifier for placeholder IDs, network/menu drift, unexpected files and SHA/provenance mismatches;
- fail-closed release-output overlap guard preventing destructive cleanup of repository/source/dependency paths;
- normal-user release menu commands for open/audit/validate/export-report on the currently integrated main capability set;
- audit report JSON/Markdown export plus backlog JSON/Markdown export;
- developer-only evidence/self-test commands excluded from the normal release menu;
- release package CI fixture verification;
- Community listing metadata template and readiness verifier;
- privacy/offline-network declaration;
- local/private/team/Community distribution guidance;
- root `CHANGELOG.md` plus package-version/release-contract consistency verification;
- generated release directories excluded from source control.

Remaining before marking P11 implementation complete:

- require PR #94 CI PASS;
- fix any CI/review defects;
- merge #83 implementation;
- keep actual Community submission/approval and normal-install runtime acceptance in P12.

Safe Fix/Prep and Batch are **not falsely exposed** by the current P11 release menu before their final integrated P12 line exists. Their normal-user release exposure must follow the final integrated runtime capability set.

Community publication remains subject to Figma review and is not assumed to be automatic.

### P12 — Final integrated validation / issue #84

After implementation scope is complete, run one integrated validation matrix covering:

- release artifact provenance/reproducibility;
- local development-plugin import;
- normal Figma plugin install/run;
- P5 rendered-pixel reject/restore/finalize + zero leftovers;
- P5 closure intake + fresh then-current-main `CODE_CONFLICT` resolution preserving PR #85 safety requirements;
- P6 positive + preservation-refusal scenarios on a fresh final-line artifact;
- P7 realistic 60+ sequential queue + active Full-P3 cancellation on a fresh final-line artifact;
- P9 backlog categories/dedupe/delta/export;
- P10 official URL/file-key CLI;
- P10 canonical snapshot-path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity on equivalent snapshots;
- deterministic report/backlog output;
- final closure-intake on registered artifacts/evidence;
- P11 distribution/release-package readiness;
- Windows/macOS CLI path behavior where applicable.

Only after P12 passes should the expanded release be called production-accepted / 100%.

## Phase status

| Phase | Scope | Current status |
|---|---|---|
| P0–P4 | Core audit, validation, transaction/rollback | ✅ Complete |
| P5 | Conservative Safe Fix recipes | 🟡 Engineering/provenance implemented; final real Figma closure + fresh current-main conflict resolution deferred to P12 (#6) |
| P6 | Advanced clone-only calibration | 🟠 Engineering complete on reference head; final integration/runtime acceptance deferred to P12 (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟠 Engineering complete on reference head; final integration/stress/cancellation acceptance deferred to P12 (#8) |
| P8 | Optional exporter adapters | ⏸ DEFERRED / #9 closed as not planned |
| P9 | Actionable backlog | ✅ Implementation complete / P12 validation pending; PR #89 / #81 closed |
| P10 | npm/Node CLI + source adapters | ✅ Implementation complete / P12 validation pending; PR #93 / #82 closed |
| P11 | Normal Figma plugin distribution | 🔵 PR #94 open / implementation review + CI / #83 |
| P12 | Final integrated validation | 🧪 Planned final gate / #84 |

## Canonical runtime artifact registry

| Track | Branch / head | CI / artifact | Digest | Closure eligibility |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` · `810d98d` | ✅ #488 · `figma-plugin-dist-488` | `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` | ✅ Final #6 runtime acceptance build |
| P6 | `feat/p6-advanced-structures` · `9a6ae3b` | ✅ #494 · `figma-plugin-dist-494` | `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3` | ⚠️ Reference only; final line requires fresh build |
| P7 | `feat/p7-batch-queue-core` · `cbfdb66` | ✅ #490 · `figma-plugin-dist-490` | `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43` | ⚠️ Reference only; final line requires fresh build |

Machine-readable operational registry: `config/runtime-artifacts.json` schema v3. It records exact build identity, ZIP digest, closure eligibility, immutable per-file SHA-256 pins and an id-excluded manifest semantic SHA-256 for each registered artifact.

### P5 registered provenance

- Source/workflow SHA: `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`
- Actions run ID / run number: `34242984963` / `488`
- Artifact: `figma-plugin-dist-488`
- ZIP digest: `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`
- Manifest semantic SHA-256, top-level plugin `id` excluded: `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`
- Immutable file pins: `BUILD_INFO.txt`, `code.js`, `ui.html`, `prepare-figma-import.mjs`, `verify-p5-evidence.mjs` (`5/5`).

## Runtime artifact preflight

Before final P12 runtime evidence is collected, current `main` provides:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

When the original downloaded Actions ZIP is retained:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488 --archive=/path/to/figma-plugin-dist-488.zip
```

Preflight validates:

- real non-symlink artifact root and required files;
- stable descriptor identity;
- exact BUILD_INFO source/run identity;
- immutable runtime/helper/verifier hashes;
- schema-v3 manifest semantics after removing only top-level `id`;
- required menu commands and offline network policy;
- optional retained ZIP raw SHA-256;
- final-closure eligibility.

P6 #494 and P7 #490 remain reference-only for final closure.

## Self-contained Figma artifact import

Canonical #488 still has a placeholder plugin ID. For final P12 local development-plugin validation, prepare a sibling/non-nested copy using the helper packaged inside the same artifact:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-figma-plugin-id> . ../figma-plugin-dist-488-local
```

Then import:

```text
../figma-plugin-dist-488-local/manifest.json
```

Requirements:

- never use nested output such as `./dist-local`;
- `code.js` and `ui.html` stay byte-for-byte unchanged;
- only top-level manifest `id` may vary semantically;
- schema-v3 manifest semantic SHA stays registered MATCH;
- preparation itself is not runtime acceptance.

## Runtime closure intake

After **real P12 evidence** exists, final authorization remains current-main closure intake:

```bash
npm run runtime:closure-intake -- <p5|p6|p7> <unpacked-artifact-dir> <evidence-json> [--archive=/path/to/artifact.zip]
```

Closure intake requires final-closure preflight, stable evidence intake, byte-exact evidence hashing, immutable verifier revalidation, verified-byte in-memory verifier execution and verifier exit `0`.

Direct packaged verifier invocation is diagnostic-only and cannot authorize final release acceptance by itself.

## Integration readiness

Latest verified Integration Readiness #90 reports:

- ⚠️ **P5 → current main: `CODE_CONFLICT`**. Historical proof #37 / CI #500 is superseded. After P12 P5 closure PASS, resolve against then-current main and preserve current-main overlap safety + CI/status/tooling/closure hardening.
- ⚠️ P6 → latest P5: `CODE_CONFLICT`; final resolution requires merged P5 and a fresh exact build.
- ⚠️ P7 → latest P5: `CODE_CONFLICT`; final resolution requires merged P5 and a fresh exact build.

## Safety invariants

- approved original design remains the visual source of truth;
- unsupported or ambiguous structures are refused, never guessed;
- unsafe findings should become backlog items rather than guessed mutations;
- mutations occur only on candidate clones before mandatory validation;
- production mutation locks remain active while final validation is deferred;
- runtime proof must remain traceable to exact final artifacts;
- artifact/archive/evidence/verifier reads remain fail-closed at documented trust boundaries;
- current-main source/output overlap protection and hardened CI/status/closure tooling must not be lost during final P5 integration;
- plugin and CLI share one deterministic analysis core;
- raw proprietary `.fig` files are not parsed through undocumented reverse engineering;
- final P6/P7 closure evidence must come from fresh final-line exact builds;
- normal release menus expose only capabilities actually integrated on the release line.

## Current implementation order

1. ✅ **P9 / #81** — implementation complete.
2. ✅ **P10 / #82** — implementation complete.
3. 🔵 **P11 / #83 / PR #94** — CI/review/merge.
4. 🧪 **P12 / #84** — final integrated validation of P5–P7 + P9–P11.

P8 remains optional/deferred.

## Development and release commands

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
npm run integration:readiness
```

> Automated checks are implementation safeguards only. They are not a substitute for P12 final manual/runtime/end-to-end acceptance.

P10 CLI commands:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>" --node-id "<frame-id>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

P11 release-package commands are documented in `docs/P11_RELEASE_DISTRIBUTION.md`. A publishable package must use a real Figma plugin ID and exact source SHA; fixture/placeholder packages are not publishable.

Runtime artifact preflight:

```bash
npm run runtime:preflight -- <p5|p6|p7> <unpacked-artifact-dir> [--archive=/path/to/artifact.zip]
```

Runtime closure intake:

```bash
npm run runtime:closure-intake -- <p5|p6|p7> <unpacked-artifact-dir> <evidence-json> [--archive=/path/to/artifact.zip]
```

Repository-local development import preparation:

```bash
npm run prepare:figma-import -- <your-figma-plugin-id> dist dist-local-sibling
```
