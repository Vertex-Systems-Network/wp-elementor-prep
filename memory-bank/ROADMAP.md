# Roadmap

Last updated: 2026-09-10

| Module / Phase | Scope | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---|---:|---|---|
| AI-native governance/tooling | Memory-bank, issue/PR-first lifecycle, CI/integration/artifact tooling | COMPLETE | 100% | `██████████` | Keep status + artifact registry synchronized |
| P0 | Specification, architecture, repository foundation | COMPLETE | 100% | `██████████` | None |
| P1 | Audit-Only scanner, discovery, scoring, report UI | COMPLETE | 100% | `██████████` | None |
| P2 | Deterministic classifier semantics + evidence | COMPLETE | 100% | `██████████` | None |
| P3 | Geometry/content/image + rendered-pixel validation | COMPLETE | 100% | `██████████` | None |
| P4 | Candidate transaction + rollback | COMPLETE | 100% | `██████████` | None |
| P5 | Conservative Safe Fix recipes + exact-build proof | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Real Desktop + closure-intake + PR #99 merge PASS |
| P6 | Advanced timeline/carousel/milestone/page normalization | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Genuine Figma positive/refusal closure + current-main intake + PR #106 merge PASS |
| P7 | Sequential multi-frame/page batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | Resolve onto merged P6/P5 main → fresh registered artifact → 60+ stress/cancel closure #8 |
| P8 | Optional Elementor schema exporters | DEFERRED | N/A | `──────────` | Re-evaluate later |
| P9 | Actionable backlog generator | IMPLEMENTATION COMPLETE / REAL-PLUGIN VALIDATION PENDING | 100% | `██████████` | Real plugin/export/parity quality in #84 |
| P10 | npm/Node CLI + source adapters | IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | `██████████` | Linux/macOS/Windows offline acceptance PASS; real Figma API/parity pending |
| P11 | Normal Figma plugin distribution | IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | `██████████` | Offline package reproducibility PASS; final integrated install/Community readiness pending |
| P12 | Final integrated validation/release acceptance | IN PROGRESS | 60% | `██████░░░░` | Offline + genuine P5 + genuine P6 slices PASS; next P7 final-line runtime closure |

## Progress interpretation

**Historical core P0–P7 progress:** `██████████ 98%`

This remains the original eight-phase core denominator: P0–P6 are complete and P7 remains at 80% (780/800 phase-points, rounded).

**P12 final validation:** `██████░░░░ 60%`.

The 60% credit consists of retained cross-platform/offline acceptance (20%), genuine P5 Figma Desktop/runtime closure and final integration (20%), and genuine P6 Figma positive/refusal closure + current-main intake + final integration (20%). P7, real API/plugin parity and Community readiness remain pending.

## P12 accepted slice — PR #95

Merged at `cee0d79678e55abac4c3e288d7239eec129603c5`.

Observed PASS on Linux, macOS and Windows:
- Node >=20 CLI bundle execution;
- canonical snapshot path handling with spaces;
- deterministic repeated audit JSON/Markdown;
- deterministic repeated backlog JSON/Markdown;
- deterministic summary-only output without writes;
- raw `.fig` refusal with exit 2 + stable code;
- repeated release build byte reproducibility under identical fixture identity;
- release verifier PASS.

Evidence:
- CI #647 PASS;
- Integration Readiness #105 PASS;
- P12 Offline Acceptance run #2 PASS;
- Linux artifact `10127554503` / SHA-256 `eca07e7ca5559b9a74c88e61e23e4d6870a81eabd1aeb091f5c04a4f6c106276`;
- macOS artifact `10127561512` / SHA-256 `9ff90da24595c89dc57f67daa0fa12e01a122fd21551745b69cf52c2988ba9cd`;
- Windows artifact `10127564618` / SHA-256 `e2a95df86973adacc70f4cd2aa403f72c7ae9c4396ad2eb205aa10165070e9b8`.

## P5 integration rehearsal checkpoint

Before real runtime closure, current main `3c3dc14bc48c3ea8e5df7620e223de0229737d9e` and canonical P5 `810d98d6e09cb4cf3fe4758fcb07e87734254a8e` were exercised through a real three-way merge rehearsal. Latest repeat run `34416999259` resolved the `11` known conflicts to `0` and passed the full integrated repository/release/offline suite, including `195/195` tests. Retained artifact `10129465465` has ZIP SHA-256 `faac0ca60f83c85931ccfd030f70d9672afbd03e55224a48631a2d5b029779b7`.

Current-contract canonical #488 + retained-ZIP preflight also passed in run `34416999458`. This lowers final integration risk but has no acceptance authority; the conflict map must still be refreshed after genuine P5 closure and no progress percentage changes from this rehearsal.

## P5 final acceptance — COMPLETE

The artifact is registered in `config/runtime-artifacts.json` schema v3 as the current final-closure-eligible P5 build. Canonical P5 #488 remains the accepted runtime reference. Real Figma Desktop acceptance passed using plugin ID `1679803102348456572`; closure run `34463444342` passed archive/artifact/evidence/verifier gates. PR #99 merged at `91c3feda1e8841f5b07ec189c5289c701ce199f5` after CI #661; issue #6 is closed.

## P6 — COMPLETE / PRODUCTION ACCEPTED

Fresh final-line build `ae691fac3c65dcdaf472392e6895fd402ae8fa3c` passed genuine image-bearing positive calibration and preservation refusal, exact-current-main closure intake run `34495685047`, PR #106 CI/P12 Offline, and merged as `dfbed556f0a6de564ca5c9afb395b7b2dd62abc8`; issue #7 is closed.

## P7 — next critical path

Resolve canonical P7 onto merged P6/P5/main, publish/register a fresh exact artifact, then run genuine 60+ sequential stress and active cancellation closure.

## P6/P7

P6 #494 and P7 #490 remain reference-only. P6 final-line artifact `figma-plugin-dist-p6-final-v2-1` at `ae691fac3c65dcdaf472392e6895fd402ae8fa3c` is now runtime-accepted and merged through PR #106. P7 still needs its fresh post-P6 final-line artifact and genuine stress/cancel closure.

## Remaining P12 acceptance

- real credentialed Figma REST CLI;
- equivalent real plugin audit + parity;
- P7 fresh real 60+ stress/cancellation closure;
- real plugin backlog/report export quality;
- real-ID final integrated release package and normal/private install flow;
- final release menu matched to integrated capabilities;
- filled Community metadata/support/category/assets and publishable readiness;
- final closure/release exit review;
- Community review/approval remains external.

## Dependency security checkpoint — 2026-09-10

P12 maintenance issue #96 / PR #97 cleared Vitest advisory `GHSA-82fw-gwwq-j7x9` by moving the dev dependency from `^3.2.0` to `^4.1.11`. Pre-fix audit run `34422011818` had 2 moderate dev-only findings and zero production findings; compatibility run `34423555371` passed the complete repository/release/offline/import matrix with full audit = 0 and production audit = 0. PR #97 merged at `01f959ebc792823ee67aa386a65335aab564d667`; post-merge CI #658, Integration Readiness #115 and P12 Offline #13 all passed.

This maintenance did not itself consume acceptance credit; subsequent genuine P5 completion moved P5 to 100%, P12 to 40%, and historical core to 95%.

## Execution policy

For every P12 cycle:
1. Issues first;
2. PR/MR second;
3. highest-priority genuine validation/integration next;
4. README + memory-bank same-cycle sync;
5. no synthetic runtime evidence;
6. no production acceptance until observed gates pass.

## P6/P7 downstream integration rehearsal checkpoint — 2026-09-10

- Current-main basis: `84ea74f7550edb1a4857e40fe4addb14369abb6f`, after the proven P5 rehearsal resolution.
- P6 `9a6ae3b29e2f70ebbd987a686856c2957f590b75`: 10 real post-P5 conflicts → 0 unresolved; latest run `34421353122` PASS; artifact `10131008051`; SHA-256 `96a175e83970a168c5ea2f0af0df2f057e50937330200632e468c86b7be6c650`.
- P7 `cbfdb66db531da8613582c84523265e42dad63a2`: 15 real post-P5 conflicts → 0 unresolved; run `34421353146` PASS; 66 test files / 323 tests PASS; artifact `10131008310`; SHA-256 `22a9473bead40053fb07e80aa0b00e1dd117c9bd0bbd94e395dd8afd57567982`.
- P7 compatibility was migrated to the stronger current build-bound P5 proof contract plus exact-build P7 receipt; the older unbound P5 proof model was not restored.
- Development-only P6/P7 controls remain excluded from the normal release surface.
- These rehearsals are `acceptanceAuthority: false`; they do not change P6/P7/P12 percentages or remove real-Figma/fresh-artifact closure requirements.

