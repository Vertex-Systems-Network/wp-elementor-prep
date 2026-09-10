# Next Actions

Last updated: 2026-09-10

## Current policy

P9–P11 implementation is complete. P12 #84 is active at `60%` after cross-platform offline acceptance plus genuine P5 and P6 Desktop/runtime closure and final integration.

For every P12 cycle:
1. inspect open Issues;
2. inspect open PR/MR;
3. continue the highest-priority genuine validation/integration obligation;
4. retain machine/runtime evidence only for properties actually observed;
5. synchronize README + memory-bank state during the same cycle;
6. never fabricate Figma evidence or describe pending gates as accepted.

## Current queue

- #6 — P5 Safe Fix: CLOSED COMPLETED; real Desktop acceptance + closure-intake + PR #99 merge PASS;
- #7 — P6 Advanced structures: CLOSED COMPLETED; genuine positive/refusal closure + current-main intake + PR #106 merge PASS;
- #8 — P7 Batch queue: **next critical path**; fresh final-line artifact registered and exact-current-main preflight PASS; genuine 60+ stress + active cancellation closure now remains;
- #84 — P12 final integrated validation, 60% complete.

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

## Completed P5 integration rehearsal — no acceptance credit

Latest repeat run `34416999259` on rehearsal head `536d4b0f3b07d1675ab5cf87b69a83dbce7d6ebc` proved a current-main/P5 resolution path: `11 → 0` conflicts, `195/195` tests PASS, all status/build/release/offline checks PASS, P5 dev UI retained, normal release UI gated, provenance globals resolved and import-overlap safety retained. Evidence artifact: `10129465465` / SHA-256 `faac0ca60f83c85931ccfd030f70d9672afbd03e55224a48631a2d5b029779b7`.

Canonical #488 + retained ZIP current-contract preflight also PASSed in run `34416999458`. Do not merge the rehearsal branch or count this as runtime acceptance. The next action remains genuine exact-artifact Figma Desktop closure, followed by a fresh integration refresh.

## Completed P5 final sequence

- real Figma development plugin ID `1679803102348456572` used;
- canonical #488-derived plugin imported and Runtime Self-Test passed in genuine Figma Desktop;
- accepted true / failures empty / leftovers 0, with rendered-pixel reject/restore/finalize PASS;
- current-main closure run `34463444342` PASS with canonical ZIP SHA MATCH, immutable 5/5, manifest semantic MATCH and verifier exit 0;
- final integration PR #99 CI #661 + P12 Offline #16 PASS;
- merge `91c3feda1e8841f5b07ec189c5289c701ce199f5`; #6 closed;
- post-merge CI #662 + Integration Readiness #118 + P12 Offline #17 PASS.

## Immediate P6 sequence

1. ✅ refresh/resolve canonical P6 against merged P5/current main — complete at `ae691fac3c65dcdaf472392e6895fd402ae8fa3c`;
2. ✅ run full repository/provenance/release checks — complete; 48 files / 259 tests plus typecheck/build/release/Community/P12 offline PASS;
3. ✅ publish and register fresh exact P6 artifact `figma-plugin-dist-p6-final-v2-1` as final-closure eligible — complete via PR #104;
4. ✅ exact current-main final-closure preflight with retained ZIP — PASS on `47b983bd45923f96486964453423de1800e89fd6`;
5. ✅ genuine Figma image-bearing positive calibration + preservation refusal — PASS;
6. ✅ export unedited `p6-closure.json` — accepted, raw SHA-256 `ab5f52fce30637b83d3dcf213a591c66d6bd24535cc27a81d57f7bf6ce9cdcc7`;
7. ✅ current-main `runtime:closure-intake -- p6 ...` — PASS in run `34495685047`;
8. ✅ merge P6 and close #7 — PR #106 → `dfbed556f0a6de564ca5c9afb395b7b2dd62abc8`.

## After P5

P6:
- COMPLETE / PRODUCTION ACCEPTED;
- real image-bearing positive calibration + preservation refusal: PASS;
- current-main closure intake: PASS;
- PR #106 merged / #7 closed.

P7:
- ✅ final two-parent source `d6bf2e12e3d877be125d336e423001baef92831b` built and verified;
- ✅ fresh artifact `figma-plugin-dist-p7-final-v2-1` / ID `10160543369` registered final-closure eligible;
- ✅ exact-current-main archive-bound preflight `34499068236` PASS;
- next: genuine realistic 64-Frame sequential queue, all terminal, max concurrency 1;
- next: cancellation during genuinely active long Full P3;
- then untouched P7 closure export → current-main closure intake PASS → merge/close #8.

## P7 final-line repo-side preparation — COMPLETE

- exact source: `d6bf2e12e3d877be125d336e423001baef92831b`;
- final integration run `34497801237`: 81 files / 387 tests plus all build/release/offline gates PASS;
- retained artifact: `figma-plugin-dist-p7-final-v2-1`, ID `10160543369`, SHA-256 `b0f16004d35f70aca7bb9edc65f162afe731db4c7d02044b4518e4b31ef685fc`;
- registration preflight `34498730566` PASS; PR #108 merged as `b5c973ffd3b2c8fa99aacd6e7bc10c4aa709e34e`;
- exact merged-main preflight `34499068236` PASS;
- percentages unchanged: P7 80%, historical core 98%, P12 60%.

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

- historical P0–P7 core progress: `98%`;
- P9 implementation: `100%`;
- P10 implementation: `100%`, partial P12 acceptance;
- P11 implementation: `100%`, partial P12 acceptance;
- P12 final validation: `60%`.

## P6/P7 downstream integration rehearsal checkpoint — 2026-09-10

- Current-main basis: `84ea74f7550edb1a4857e40fe4addb14369abb6f`, after the proven P5 rehearsal resolution.
- P6 `9a6ae3b29e2f70ebbd987a686856c2957f590b75`: 10 real post-P5 conflicts → 0 unresolved; latest run `34421353122` PASS; artifact `10131008051`; SHA-256 `96a175e83970a168c5ea2f0af0df2f057e50937330200632e468c86b7be6c650`.
- P7 `cbfdb66db531da8613582c84523265e42dad63a2`: 15 real post-P5 conflicts → 0 unresolved; run `34421353146` PASS; 66 test files / 323 tests PASS; artifact `10131008310`; SHA-256 `22a9473bead40053fb07e80aa0b00e1dd117c9bd0bbd94e395dd8afd57567982`.
- P7 compatibility was migrated to the stronger current build-bound P5 proof contract plus exact-build P7 receipt; the older unbound P5 proof model was not restored.
- Development-only P6/P7 controls remain excluded from the normal release surface.
- These rehearsals are `acceptanceAuthority: false`; they do not change P6/P7/P12 percentages or remove real-Figma/fresh-artifact closure requirements.

## Completed dependency-security maintenance — 2026-09-10

- #96 / PR #97 updated dev-only Vitest `^3.2.0 → ^4.1.11` for `GHSA-82fw-gwwq-j7x9`; no force audit fix was used.
- Pre-fix run `34422011818`: 2 moderate dev-only findings, production audit 0; artifact `10131236873` / SHA-256 `4d7c7b7f7d0e4bc5798e5d56465071e0bcf6fc28e04878ab96a292f9ed0ed8c9`.
- Compatibility run `34423555371`: full suite PASS, full audit 0, production audit 0; artifact `10131793673` / SHA-256 `c64dd7a76bc61c9980f3a254e50fa90deeb16fc7e19ba06de4c7fccb4e21aa91`.
- PR #97 CI #657 + P12 Offline #12 PASS; merge `01f959ebc792823ee67aa386a65335aab564d667`; post-merge CI #658 + Integration Readiness #115 + P12 Offline #13 PASS.
- This maintenance did not itself consume P12 credit. Genuine P5 completion subsequently moved the immediate product action to P6 final-line closure.
