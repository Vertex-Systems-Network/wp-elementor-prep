# Next Actions

Last updated: 2026-09-10

## Current policy

P9–P11 implementation is complete. P12 #84 is active at `20%` after the cross-platform offline acceptance slice.

For every P12 cycle:
1. inspect open Issues;
2. inspect open PR/MR;
3. continue the highest-priority genuine validation/integration obligation;
4. retain machine/runtime evidence only for properties actually observed;
5. synchronize README + memory-bank state during the same cycle;
6. never fabricate Figma evidence or describe pending gates as accepted.

## Current queue

- #6 — P5 Safe Fix: **next critical path**; exact artifact ready, genuine Desktop/rendered-pixel closure + final main integration pending;
- #7 — P6 Advanced structures: waits for P5 final merge, then fresh artifact + real positive/refusal closure;
- #8 — P7 Batch queue: waits for P5 final merge, then fresh artifact + real 60+ stress/cancel closure;
- #84 — P12 final integrated validation, 20% complete.

P8 exporter remains deferred. P9/P10/P11 implementation issues are closed.

## Completed P12 offline slice

PR #95 merged at `cee0d79678e55abac4c3e288d7239eec129603c5`.

Validated on Linux/macOS/Windows:
- built Node >=20 CLI;
- canonical snapshot audit with paths containing spaces;
- audit JSON/Markdown repeatability;
- backlog JSON/Markdown repeatability;
- summary-only repeatability and no-write behavior;
- raw `.fig` exit `2` / `UNSUPPORTED_FIG_LOCAL_FILE` refusal;
- repeated release package byte reproducibility for identical fixture identity;
- release package verifier PASS.

Evidence:
- standard CI #647 PASS;
- Integration Readiness #105 PASS;
- P12 Offline Acceptance run #2 PASS on all three operating systems;
- Linux artifact `10127554503`, digest `eca07e7ca5559b9a74c88e61e23e4d6870a81eabd1aeb091f5c04a4f6c106276`;
- macOS artifact `10127561512`, digest `9ff90da24595c89dc57f67daa0fa12e01a122fd21551745b69cf52c2988ba9cd`;
- Windows artifact `10127564618`, digest `e2a95df86973adacc70f4cd2aa403f72c7ae9c4396ad2eb205aa10165070e9b8`.

Runtime artifact preflight requires a non-symlink artifact root, stable descriptor identity, immutable file hashes, exact build identity and schema-v3 manifest semantics.

## Immediate P5 sequence

Canonical P5:
- branch `feat/p5-safe-recipes`;
- head `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`;
- artifact `figma-plugin-dist-488`;
- ZIP SHA-256 `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`;
- manifest semantic SHA-256 `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`.

Next steps:
1. obtain/use the genuine Figma development-plugin ID for the exact P5 artifact-derived import;
2. prepare only to a sibling/non-nested directory;
3. import the exact derived `manifest.json` in real Figma Desktop;
4. run `Developer: P5 Runtime Self-Test` and require `P5 Compiled Runtime Acceptance: PASS`;
5. collect genuine rendered-pixel forced-reject / restore / finalize evidence;
6. require checkpoint cleanup and zero leftovers;
7. export stable unedited `p5-evidence.json`;
8. run current-main `runtime:closure-intake -- p5 ...`, binding retained ZIP when available;
9. refresh P5 → then-current-main integration readiness;
10. resolve the exact current conflict set preserving current-main P9/P10/P11, overlap safety, CI/status/provenance/closure tooling;
11. require final integration CI PASS;
12. merge P5 and close #6 only then.

## Current integration fact

Integration Readiness #104 against main `f689fd0b703f` reported P5 → main `CODE_CONFLICT` in 11 paths:
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

This list is a pre-closure planning fact only; refresh again before final P5 integration.

## After P5

P6:
- resolve onto merged final line;
- build/register fresh exact artifact;
- real image-bearing positive calibration + preservation refusal;
- closure intake PASS;
- merge/close #7.

P7:
- resolve onto merged final line;
- build/register fresh exact artifact;
- realistic 60+ sequential queue, all terminal, max concurrency 1;
- cancellation during genuinely active long Full P3;
- closure intake PASS;
- merge/close #8.

## Remaining P9/P10/P11 acceptance

- real plugin backlog/report export quality;
- real credentialed Figma REST URL/file-key CLI;
- equivalent plugin/CLI parity;
- final integrated release package with real publisher/plugin identity;
- local development import + normal/private installed plugin flow;
- final release menu matched to integrated capabilities;
- filled Community support/category/target/assets and publishable readiness;
- final release exit review;
- actual Community approval remains external.

## Progress tracking

- historical P0–P7 core progress: `93%`;
- P9 implementation: `100%`;
- P10 implementation: `100%`, partial P12 acceptance;
- P11 implementation: `100%`, partial P12 acceptance;
- P12 final validation: `20%`.