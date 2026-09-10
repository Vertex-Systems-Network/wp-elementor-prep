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

**Open PR/MR:** `0`

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
| P10 npm/Node CLI | ✅ IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | `██████████` | Cross-OS offline CLI acceptance PASS; real Figma API + plugin parity still pending |
| P11 Normal Figma plugin distribution | ✅ IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | `██████████` | Offline release reproducibility PASS; final integrated install/runtime/Community readiness pending |
| P12 Final integrated validation | 🧪 IN PROGRESS | 20% | `██░░░░░░░░` | Offline cross-platform slice PASS → next genuine P5 Desktop/runtime closure + real API/plugin acceptance |

**Overall active project progress:** `█████████░ 93%`

> The 93% figure preserves the historical P0–P7 core-delivery denominator. P12 progress is tracked separately and does not rewrite the verified historical denominator.

### Release-expansion status

- P9 implementation: `██████████ 100%`
- P10 implementation: `██████████ 100%`; cross-platform offline acceptance PASS
- P11 implementation: `██████████ 100%`; offline release-package reproducibility PASS
- P12 final validation: `██░░░░░░░░ 20%`

The P12 `20%` credit is intentionally conservative: only the completed, machine-observed offline/cross-platform matrix is counted. Real Figma Desktop, real credentialed API, P5/P6/P7 closure, plugin parity and final Community readiness remain uncredited.

## Current testing policy

P12 is the sole release-expansion acceptance gate:

- no real Figma evidence may be fabricated;
- implementation-complete is not the same as production-accepted;
- production safety locks and exact-build provenance remain active;
- P5/P6/P7 runtime acceptance must use genuine final-line evidence and current-main closure intake;
- real Figma REST execution and plugin/CLI parity remain pending;
- normal installed/private plugin flow and final Community readiness remain pending;
- Figma Community review/approval is external and must not be claimed until it actually occurs.

## Current repository checkpoint — 2026-09-10

- ✅ P9 implementation merged through PR #89 at `67d6b3df05c8e4550b3df80f95cb5fabeb77de42`.
- ✅ P10 implementation merged through PR #93 at `7e6aa85958060cc927d8fe09dc5cb88a3feba53e`.
- ✅ P11 implementation merged through PR #94 at `7f83a1f82459cd9354882235dd04153bb20e5760`.
- ✅ post-P11 main `f689fd0b703f83ee81953d36aef8d63bc2a56574` passed CI #645 and Integration Readiness #104.
- ✅ Integration Readiness #104 refreshed P5 → main as `CODE_CONFLICT` across 11 paths including workflow, package/build/import scripts, plugin/UI runtime and status/history files.
- ✅ P12 offline acceptance PR #95 merged at `cee0d79678e55abac4c3e288d7239eec129603c5`.
- ✅ PR #95 standard CI #647 PASS and Integration Readiness #105 PASS.
- ✅ P12 Offline Acceptance run #2 passed on Linux, macOS and Windows.
- ✅ retained machine-readable evidence artifacts:
  - Linux artifact `10127554503`, ZIP digest `sha256:eca07e7ca5559b9a74c88e61e23e4d6870a81eabd1aeb091f5c04a4f6c106276`;
  - macOS artifact `10127561512`, ZIP digest `sha256:9ff90da24595c89dc57f67daa0fa12e01a122fd21551745b69cf52c2988ba9cd`;
  - Windows artifact `10127564618`, ZIP digest `sha256:e2a95df86973adacc70f4cd2aa403f72c7ae9c4396ad2eb205aa10165070e9b8`.
- ✅ canonical P5 #488 artifact provenance/preflight/archive plumbing remains hardened and calibrated.
- ✅ P6 #494 and P7 #490 remain engineering/reference artifacts; final production integration requires fresh exact builds after final P5 merge.

### P5 integration rehearsal checkpoint — non-authorizing

- ✅ current-main + canonical P5 three-way integration rehearsal PASS: main `3c3dc14bc48c3ea8e5df7620e223de0229737d9e` + P5 `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`;
- ✅ exact current conflict set resolved in rehearsal: `11 → 0` unresolved paths, with no conflict markers;
- ✅ latest repeat rehearsal run `34416999259` on head `536d4b0f3b07d1675ab5cf87b69a83dbce7d6ebc` passed `195/195` integrated tests plus status/typecheck/plugin build/CLI build/release/Community/P12-offline checks;
- ✅ P9 audit/backlog remained non-mutating while P5 Safe Fix stayed separately runtime-gated;
- ✅ P5 development UI remained available without leaking P5 validation/mutation controls into the normal P11 release UI;
- ✅ P5 source/run provenance globals were resolved in release code and current local-import overlap safety remained enforced;
- ✅ retained rehearsal artifact `10129465465`, ZIP SHA-256 `faac0ca60f83c85931ccfd030f70d9672afbd03e55224a48631a2d5b029779b7`;
- ✅ canonical Actions artifact #488 + retained ZIP re-downloaded and current-contract `runtime:preflight` PASS in run `34416999458`;
- ⚠️ rehearsal evidence is explicitly `acceptanceAuthority: false`: P5 remains 94%, P12 remains 20%, and real Figma Desktop/rendered-pixel/closure evidence is still mandatory.

Detailed engineering history is retained in `memory-bank/CHANGELOG.md`.

## P9 — Actionable backlog generator

P9 implementation is complete and merged. It provides deterministic ERROR/WARNING/INFO/IMPROVEMENT categories, semantic fingerprints/IDs, lifecycle and run-to-run delta, summaries, JSON/Markdown exports, plugin UI/history and stale async invalidation.

Real plugin/export/parity quality remains part of P12.

## P10 — npm/Node CLI

P10 implementation is complete and merged through PR #93.

Commands:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>" --node-id "<frame-id>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

P12 PR #95 accepted these offline properties on Linux/macOS/Windows:

- built Node >=20 CLI execution;
- canonical snapshot paths containing spaces;
- byte-identical audit JSON/Markdown on repeated identical runs;
- byte-identical regenerated backlog JSON/Markdown;
- deterministic summary-only output with zero output files;
- raw `.fig` refusal with exit `2` and `UNSUPPORTED_FIG_LOCAL_FILE`;
- cross-platform path handling for this acceptance fixture.

Still pending:
- real credentialed Figma REST URL/file-key execution;
- parity against an equivalent real plugin audit;
- real API error/auth behavior under P12 acceptance conditions.

## P11 — Normal Figma plugin distribution

P11 implementation is complete and merged through PR #94.

P12 PR #95 additionally accepted offline release-package reproducibility on Linux/macOS/Windows:

- repeated builds using identical fixture plugin/source identity produced byte-identical `code.js`, `manifest.json`, `ui.html`, `RELEASE_INFO.json` and `SHA256SUMS.txt`;
- release package verifier passed on both repeated packages;
- path-with-spaces execution succeeded across all three operating systems.

Still pending:
- exact final integrated release package using real publisher/plugin identity;
- local development-plugin import and normal installed/private plugin flow;
- final P5/P6/P7 release menu exposure after those runtime lines integrate;
- filled Community metadata/support/category/assets and final publishable readiness;
- actual Community submission/review.

## P12 — Final integrated validation / issue #84

### Completed slice — PR #95

P12 offline acceptance is now complete for the properties above. The workflow explicitly retains these limitations as PENDING:

- real credentialed Figma REST execution;
- real Figma Desktop development-plugin import;
- P5 rendered-pixel closure;
- P6 real-Figma closure;
- P7 real-Figma stress/cancellation closure;
- Community submission/review.

### Next critical path — P5

Canonical P5 remains:
- branch `feat/p5-safe-recipes`;
- head `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`;
- CI/artifact #488 / `figma-plugin-dist-488`;
- ZIP SHA-256 `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`;
- manifest semantic SHA-256 `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`.

P5 cannot be production-accepted from CI alone. Required next sequence:
1. prepare/import the exact artifact-derived plugin with the genuine Figma development-plugin ID using sibling/non-nested output;
2. run `Developer: P5 Runtime Self-Test` in real Figma Desktop;
3. require compiled runtime acceptance PASS;
4. collect genuine rendered-pixel forced-reject / restore / finalize evidence and zero leftovers;
5. export stable `p5-evidence.json` without manual edits;
6. pass current-main `runtime:closure-intake`, binding the retained ZIP when available;
7. refresh P5 → then-current-main integration readiness;
8. resolve the exact code conflicts while preserving current-main safety, CLI, backlog and release-packaging work;
9. require final integration CI PASS, merge P5 and only then close #6.

After P5, P6 and P7 require fresh exact final-line artifacts and real runtime closure.

## Current P5 integration map

Integration Readiness #104 against `main` `f689fd0b703f` reported P5 `810d98d6e09c` → main `CODE_CONFLICT` in:

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

Final integration must refresh this map again after genuine P5 closure because main may move.

## Canonical runtime artifact registry

| Track | Branch / head | CI / artifact | Digest | Closure eligibility |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` · `810d98d` | ✅ #488 · `figma-plugin-dist-488` | `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` | ✅ Final #6 runtime acceptance build |
| P6 | `feat/p6-advanced-structures` · `9a6ae3b` | ✅ #494 · `figma-plugin-dist-494` | `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3` | ⚠️ Reference only; final line requires fresh build |
| P7 | `feat/p7-batch-queue-core` · `cbfdb66` | ✅ #490 · `figma-plugin-dist-490` | `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43` | ⚠️ Reference only; final line requires fresh build |

Machine-readable operational registry: `config/runtime-artifacts.json` schema v3. It records exact build identity, ZIP digest, closure eligibility, immutable per-file SHA-256 pins and an id-excluded manifest semantic SHA-256 for each registered artifact.

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
2. ✅ P10 / #82 — implementation complete; offline cross-platform P12 slice PASS.
3. ✅ P11 / #83 — implementation complete; offline release reproducibility P12 slice PASS.
4. 🧪 P12 / #84 — 20%; next critical path is genuine P5 Figma Desktop/runtime closure.

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

> Automated/offline checks are real evidence only for the specific properties they exercise. They are not substitutes for pending real Figma/runtime observations.
