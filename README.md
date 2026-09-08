# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

`Figma selection -> Audit -> classify -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** this README must be updated at the end of every meaningful development batch with the latest verified CI, canonical branch state, blockers and next actions.

**Open PR/MR:** `0`

| Phase | Scope | Current status |
|---|---|---|
| P0 | Specification + architecture | ✅ Complete |
| P1 | Scanner, discovery, scoring | ✅ Complete |
| P2 | Deterministic classification + semantic roles | ✅ Complete |
| P3 | Geometry/content/image/rendered-pixel validator | ✅ Complete |
| P4 | Candidate transaction + rollback/checkpoint | ✅ Complete |
| P5 | Conservative high-confidence Safe Fix recipes | 🟡 Engineering + exact-build closure evidence complete; imported-Figma runtime acceptance pending (#6) |
| P6 | Advanced structures + clone-only calibration | 🟡 Engineering + exact-build single-verdict closure tooling complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ frame batch queue | 🟡 Engineering + exact-build fail-fast/single-verdict closure tooling complete; real-Figma stress/cancellation acceptance pending (#8) |
| P8 | Optional Elementor exporter adapters | ⏸ Deferred / issue #9 closed as not planned for current phase |

## Canonical development branches

| Track | Branch | Last verified functional head | CI |
|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `85c4783` | ✅ #353 |
| P6 | `feat/p6-advanced-structures` | `fcba813` | ✅ #421 |
| P7 | `feat/p7-batch-queue-core` | `e8f9200` | ✅ #424 |

README/docs-only synchronization commits may be newer than the functional heads above. The listed head is the latest code/test head whose full install -> typecheck -> test -> build -> Figma bundle-integrity/provenance pipeline was explicitly verified.

## Latest development batch — 2026-09-08

- ✅ 0 open PR/MRs; canonical branches remain the direct development source of truth
- ✅ direct-push CI verifies canonical branch development without PR churn
- ✅ P5 runtime proof/evidence is bound to the exact compiled CI artifact; stale/local/untraceable proof fails closed
- ✅ P5 latest verified artifact: `figma-plugin-dist-353`
- ✅ P6 embeds the same exact-build P5 prerequisite proof/evidence contract in one imported P6 artifact
- ✅ P6 positive clone-calibration + preservation-refusal closure requires current-build evidence, zero cleanup risk and a real image-bearing Full P3 path
- ✅ P6 latest verified artifact: `figma-plugin-dist-421`
- ✅ P7 retains qualifying 60+ completed stress and active-frame cancellation evidence in separate bounded slots
- ✅ P7 stress/cancellation acceptance requires the same traceable CI-built plugin bundle
- ✅ compiled P7 evidence is stamped with source SHA, GitHub Actions run ID and run number
- ✅ deterministic P5 proof is paired with an exact-build P7 receipt bound to source SHA/run identity
- ✅ **all P5/P7 mutation entrypoints now fail fast on the exact-build receipt**: Safe Fix preview/apply and P7 batch start refuse before mutation when the receipt is missing, stale, from another artifact or untraceable
- ✅ every P7 frame processor still re-checks the exact-build prerequisite independently before planning/mutation, preserving defense-in-depth
- ✅ P7 production queue preparation defaults to the compiled `P7_BUILD_IDENTITY`; durable run keys include source SHA and newer builds automatically re-audit older finalized results
- ✅ local/untraceable production builds cannot unlock P7 mutation and do not trust durable skip metadata
- ✅ `Developer: P7 Runtime Evidence` computes one final **`Closure acceptance: PASS/FAIL`** verdict
- ✅ closure PASS requires current build traceability + exact-build P5 prerequisite + qualifying stress/cancellation evidence from the current exact build
- ✅ old-build retained evidence remains inspectable but cannot satisfy current-build closure
- ✅ viewer exports one closure bundle while retaining backward-compatible runtime/raw JSON inspection
- ✅ P7 CI #424 passed install, typecheck, all tests, build, compiled-bundle integrity/provenance verification and artifact upload
- ✅ verified P7 artifact: `figma-plugin-dist-424`
- ✅ P7 artifact digest: `sha256:65d4d794e6a002e7f87cba9bf2f1f4c5270d460b0f21b435ef56e62db18ae9c5`
- ✅ latest verified functional CI green: P5 #353, P6 #421, P7 #424

## Remaining real-runtime acceptance

The remaining open issues are intentionally limited to evidence that GitHub CI cannot manufacture because it must run through the **actual imported compiled Figma development plugin and its UI iframe Canvas pixel broker**.

### P5 — issue #6

- [ ] import `figma-plugin-dist-353` (or newer verified P5 artifact) in Figma desktop
- [ ] confirm viewer build SHA/run identity matches the imported artifact
- [ ] run `Developer: P5 Runtime Self-Test`
- [ ] require `P5 Compiled Runtime Acceptance: PASS`
- [ ] verify real rendered-pixel forced reject, commit -> restore and commit -> finalize paths
- [ ] require checkpoint cleanup and `0` leftovers
- [ ] confirm stale proof from another artifact cannot unlock this build
- [ ] copy/reopen the persisted provenance-bound P5 acceptance JSON

Production Safe Fix mutation stays locked until this exact-build proof passes.

### P6 — issue #7

- [ ] import `figma-plugin-dist-421` (or newer verified P6 artifact)
- [ ] in that same build run P5 runtime self-test and require exact-build P5 Acceptance PASS
- [ ] run P6 page-flow calibration on a real image-bearing page and require positive Acceptance PASS
- [ ] require retained positive evidence to show `imageAnchorCountBefore > 0` and unchanged image-anchor count after Full P3
- [ ] verify pass/reject/failure cleanup with `0` leftovers
- [ ] run the same developer command on a preservation-sensitive real page that yields `NO_CANDIDATE`
- [ ] require preservation-refusal Acceptance PASS
- [ ] open `Developer: P6 Runtime Evidence` and require **`P6 Closure acceptance: PASS`**
- [ ] copy/export the combined P6 closure bundle for review/issue closure

P6 production advanced mutation remains intentionally disabled.

### P7 — issue #8

- [ ] import `figma-plugin-dist-424` (or newer verified canonical P7 artifact) and keep that exact build loaded for all P7 acceptance observations
- [ ] in that build run `Developer: P5 Runtime Self-Test` and require exact-build P5 prerequisite PASS
- [ ] verify Safe Fix preview/apply and batch start show the exact-build prerequisite as valid before any mutation starts
- [ ] execute realistic 60+ frame imported-Figma batch run
- [ ] retain completed stress evidence with `finalTotalCount >= 60`, all frames terminal and max processor concurrency `1`
- [ ] request cancellation during a genuinely long active Full P3 operation
- [ ] retain settled active-frame cancellation evidence with a matching processor attempt
- [ ] open `Developer: P7 Runtime Evidence` and require **`Closure acceptance: PASS`**
- [ ] copy/export the closure bundle for review/closure evidence

## Safety invariants

- Approved original design is the visual source of truth.
- Never mutate on low confidence or ambiguous structure.
- Candidate-only mutation; transformer never receives the approved original.
- Full P3 validation is mandatory before P4 commit.
- Rendered-pixel evidence is part of production validation.
- Only one unresolved restore/finalize checkpoint may exist.
- Runtime proof/evidence must be traceable to the exact CI-built plugin currently loaded.
- P6 advanced calibration is clone-only and has no production commit seam.
- Final P6 closure requires exact-build positive + preservation-refusal evidence, with the positive scenario proving a stable image-bearing validation path.
- P7 mutation entrypoints and each individual frame processor independently require the exact-build P5/P7 prerequisite receipt.
- Batch processing is strictly sequential: max one processor at a time.
- Cancellation is cooperative and cannot silently bypass an in-flight transaction/checkpoint.
- Durable batch skip metadata is build-source-sensitive and never trusted by an untraceable production build.
- Final P7 closure requires current-build P5 prerequisite + stress + cancellation evidence.
- Unsupported or ambiguous constructs are reported/refused, never guessed.
- No external AI/network dependency in the deterministic core runtime.

## Current P5 recipe gates

- Vertical Stack >= 90%
- Horizontal Row >= 90%
- Two Column >= 92%
- Facts List >= 92%
- Footer Columns >= 92%
- non-fragmented Repeated Card Grid >= 94%
- Metric Grid >= 95%
- Social/Link Strip >= 95%

Advanced timeline/carousel/fragmented synthesis remains P6-preservation/calibration territory and is not silently enabled as a P5 mutation.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

Import the generated development plugin from `dist/manifest.json` after configuring a valid Figma plugin ID.

Canonical engineering detail also lives in `memory-bank/PROJECT_STATE.md`, `memory-bank/ROADMAP.md`, `memory-bank/NEXT_ACTIONS.md`, and the phase-specific files under `docs/`.

## Golden fixture

The Marcus Vane desktop page is the first broad calibration fixture and includes hero, two-column, cards, metrics, timeline/journey, carousel/media, milestones and footer patterns. It is a fixture only; production logic must remain generic and deterministic.
