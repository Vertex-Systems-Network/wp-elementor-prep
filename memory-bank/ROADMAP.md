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
| P5 | Conservative Safe Fix recipes + exact-build proof | IMPLEMENTED / VALIDATION DEFERRED | 94% | `█████████░` | P12 genuine Desktop closure → current-main integration → merge #6 |
| P6 | Advanced timeline/carousel/milestone/page normalization | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P12 after P5 → fresh registered artifact → positive/refusal closure #7 |
| P7 | Sequential multi-frame/page batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P12 after P5 → fresh registered artifact → 60+ stress/cancel closure #8 |
| P8 | Optional Elementor schema exporters | DEFERRED | N/A | `──────────` | Re-evaluate later |
| P9 | Actionable backlog generator | IMPLEMENTATION COMPLETE / REAL-PLUGIN VALIDATION PENDING | 100% | `██████████` | Real plugin/export/parity quality in #84 |
| P10 | npm/Node CLI + source adapters | IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | `██████████` | Linux/macOS/Windows offline acceptance PASS; real Figma API/parity pending |
| P11 | Normal Figma plugin distribution | IMPLEMENTATION COMPLETE / PARTIAL P12 ACCEPTANCE | 100% | `██████████` | Offline package reproducibility PASS; final integrated install/Community readiness pending |
| P12 | Final integrated validation/release acceptance | IN PROGRESS | 20% | `██░░░░░░░░` | Cross-platform offline slice PASS; next genuine P5 Desktop/runtime closure |

## Progress interpretation

**Historical core P0–P7 progress:** `█████████░ 93%`

This remains the original core denominator.

**P12 final validation:** `██░░░░░░░░ 20%`.

The 20% credit is limited to retained cross-platform/offline evidence. No credit is assigned for pending real Figma Desktop/API/runtime/Community gates.

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

## P5 — next critical path

Canonical exact artifact remains P5 #488 on `810d98d` with ZIP digest `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` and schema-v3 id-excluded manifest semantic SHA `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`.

The artifact is registered in `config/runtime-artifacts.json` schema v3 as final-closure eligible.

P12 must next:
1. import an exact artifact-derived prepared copy into genuine Figma Desktop using the real development-plugin ID;
2. run P5 Runtime Self-Test and require compiled acceptance PASS;
3. collect real rendered-pixel reject/restore/finalize + zero-leftover evidence;
4. export unedited stable `p5-evidence.json`;
5. pass current-main closure intake;
6. refresh and resolve P5 → current-main conflicts preserving P9/P10/P11 and current safety/tooling;
7. require final CI and merge #6.

Integration Readiness #104 refreshed the pre-closure conflict set to 11 paths. This map must be refreshed again after genuine closure because main may move.

## P6/P7

P6 #494 and P7 #490 remain reference-only. After P5 merges they need fresh exact final-line artifacts and genuine P12 runtime closure.

## Remaining P12 acceptance

- real credentialed Figma REST CLI;
- equivalent real plugin audit + parity;
- P5 real Desktop/rendered-pixel closure + final integration;
- P6 fresh real positive/refusal closure;
- P7 fresh real 60+ stress/cancellation closure;
- real plugin backlog/report export quality;
- real-ID final integrated release package and normal/private install flow;
- final release menu matched to integrated capabilities;
- filled Community metadata/support/category/assets and publishable readiness;
- final closure/release exit review;
- Community review/approval remains external.

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

