# WP Builders Prepear

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
| P5 Conservative Safe Fix | ✅ COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Real Figma Desktop acceptance + hardened closure-intake + PR #99 merge PASS |
| P6 Advanced structures | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P5 merged; refresh onto current main → fresh final artifact → real positive/refusal closure #7 |
| P7 60+ Frame batch queue | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | After final P6/P5 line → fresh artifact → 60+ stress + active cancellation closure #8 |
| P8 Elementor exporter adapters | ⏸ DEFERRED | N/A | `──────────` | Re-evaluate after normalization line is stable |
| P9 Actionable backlog generator | ✅ IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | `██████████` | Merged via PR #89; real plugin/export/parity behavior remains in #84 |
| P10 npm/Node CLI | ✅ IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | `██████████` | Cross-OS offline CLI acceptance PASS; real Figma API + plugin parity still pending |
| P11 Normal Figma plugin distribution | ✅ IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | `██████████` | Offline release reproducibility PASS; final integrated install/runtime/Community readiness pending |
| P12 Final integrated validation | 🧪 IN PROGRESS | 40% | `████░░░░░░` | Offline cross-platform slice + genuine P5 Desktop/closure/integration slice PASS → next P6 final-line runtime closure |

**Overall active project progress:** `██████████ 95%`

> Historical P0–P7 core progress is now 95%: P0–P5 are 100%, P6/P7 remain 80% (760 / 800 phase-points). P12 validation is tracked separately.

### Release-expansion status

- P9 implementation: `██████████ 100%`
- P10 implementation: `██████████ 100%`; cross-platform offline acceptance PASS
- P11 implementation: `██████████ 100%`; offline release-package reproducibility PASS
- P12 final validation: `████░░░░░░ 40%`

The P12 `40%` credit is two retained major validation slices: 20% cross-platform/offline acceptance + 20% genuine P5 Figma Desktop/runtime closure and final integration. P6/P7 real closure, credentialed API/plugin parity and final Community readiness remain uncredited.

## Current testing policy

P12 is the sole release-expansion acceptance gate:

- no real Figma evidence may be fabricated;
- implementation-complete is not the same as production-accepted;
- production safety locks and exact-build provenance remain active;
- P5 runtime acceptance is complete and merged; P6/P7 runtime acceptance must still use genuine final-line evidence and current-main closure intake;
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

### P6/P7 downstream integration rehearsal checkpoint — non-authorizing

- ✅ both rehearsals are based on current main `84ea74f7550edb1a4857e40fe4addb14369abb6f` after applying the proven canonical P5 resolution;
- ✅ P6 canonical `9a6ae3b29e2f70ebbd987a686856c2957f590b75`: exact post-P5 conflict set `10 → 0`; latest same-head rehearsal run `34421353122` PASS; retained artifact `10131008051`, ZIP SHA-256 `96a175e83970a168c5ea2f0af0df2f057e50937330200632e468c86b7be6c650`;
- ✅ P7 canonical `cbfdb66db531da8613582c84523265e42dad63a2`: exact post-P5 conflict set `15 → 0`; latest rehearsal run `34421353146` PASS with 66 test files / 323 tests plus status/typecheck/build/CLI/release/Community/P12-offline checks;
- ✅ P7 rehearsal preserves the current stronger build-bound P5 proof contract plus exact-build P7 receipt rather than adopting the older unbound P5 proof model from the P7 branch;
- ✅ P7 development batch/runtime controls remain present in the development artifact while the normal release manifest/UI stays gated; prepared-import code/UI bytes remain unchanged;
- ✅ retained P7 artifact `10131008310`, ZIP SHA-256 `22a9473bead40053fb07e80aa0b00e1dd117c9bd0bbd94e395dd8afd57567982`;
- ⚠️ both evidence bundles are explicitly `acceptanceAuthority: false`. P6 stays 80%, P7 stays 80%, P12 stays 20%; real Figma closure and fresh final-line artifacts remain mandatory.

### P12 dependency security checkpoint — complete

- ✅ pre-fix dependency audit run `34422011818` found exactly 2 moderate **dev-only** findings in Vitest / `@vitest/mocker` under `GHSA-82fw-gwwq-j7x9`; production-only `npm audit --omit=dev` was already 0;
- ✅ retained pre-fix audit artifact `10131236873`, ZIP SHA-256 `4d7c7b7f7d0e4bc5798e5d56465071e0bcf6fc28e04878ab96a292f9ed0ed8c9`;
- ✅ issue #96 / PR #97 updated only dev dependency `vitest` from `^3.2.0` to `^4.1.11`, without `npm audit fix --force`;
- ✅ one-shot compatibility run `34423555371` installed Vitest 4.1.11 and passed status/typecheck/tests/plugin build/CLI build/release/Community/P12-offline/import-integrity checks; full audit = 0 and production-only audit = 0;
- ✅ retained clean-audit artifact `10131793673`, ZIP SHA-256 `c64dd7a76bc61c9980f3a254e50fa90deeb16fc7e19ba06de4c7fccb4e21aa91`;
- ✅ PR #97 CI #657 PASS and P12 Offline #12 PASS on Linux/macOS/Windows; squash merge `01f959ebc792823ee67aa386a65335aab564d667`;
- ✅ post-merge CI #658 PASS, Integration Readiness #115 PASS and P12 Offline #13 PASS on Linux/macOS/Windows; issue #96 closed completed;
- ⚠️ this is dependency-security maintenance only: P5 stays 94%, P6/P7 stay 80%, P12 stays 20%, historical core stays 93%, and all genuine Figma/runtime gates remain unchanged.

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

### P5 final acceptance checkpoint — COMPLETE

- ✅ real Figma development plugin ID `1679803102348456572` used for canonical #488-derived import;
- ✅ real Figma Desktop `P5 Compiled Runtime Acceptance: PASS`: accepted true, failures empty, leftovers 0;
- ✅ rendered-pixel forced reject, restore and finalize calibration PASS;
- ✅ current-main hardened closure run `34463444342`: canonical ZIP SHA MATCH, immutable 5/5 MATCH, manifest semantic MATCH, verifier exit 0;
- ✅ retained closure artifact `10146495702`, SHA-256 `e17f0f25821fb52d8cf6427f2bda99e154eb188a62d278bbea299f6402a533d8`;
- ✅ final integration PR #99: CI #661 + P12 Offline #16 PASS, mergeable, reviews 0, threads 0;
- ✅ merge `91c3feda1e8841f5b07ec189c5289c701ce199f5`; issue #6 closed completed;
- ✅ post-merge CI #662, Integration Readiness #118 and P12 Offline #17 PASS.

Evidence provenance: the repository-retained JSON was reconstructed exactly from the JSON text supplied by the user because conversation inventory did not expose a separately mounted JSON attachment. The real Desktop screenshot/result and hardened verifier agree on acceptance.

### Next critical path — P6

Freshly resolve/rebuild P6 on merged P5/current main, register a fresh final-closure-eligible artifact, collect genuine image-bearing positive + preservation-refusal evidence, pass current-main closure intake, then merge/close #7.

## Current P5 integration map — historical pre-merge

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
