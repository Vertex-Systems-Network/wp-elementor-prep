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
| P6 | Advanced structures + clone-only calibration | 🟡 Engineering + exact-build prerequisite/evidence tooling complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ frame batch queue | 🟡 Engineering + exact-build single-verdict closure tooling complete; real-Figma stress/cancellation acceptance pending (#8) |
| P8 | Optional Elementor exporter adapters | ⏸ Deferred / issue #9 closed as not planned for current phase |

## Canonical development branches

| Track | Branch | Last verified functional head | CI |
|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `85c4783` | ✅ #353 |
| P6 | `feat/p6-advanced-structures` | `d7610b2` | ✅ #407 |
| P7 | `feat/p7-batch-queue-core` | `d005356` | ✅ #398 |

README/docs-only synchronization commits may be newer than the functional heads above. The listed head is the latest code/test head whose full install -> typecheck -> test -> build -> Figma bundle-integrity/provenance pipeline was explicitly verified.

## Latest development batch — 2026-09-08

- ✅ 0 open PR/MRs; canonical branches remain the direct development source of truth
- ✅ direct-push CI verifies canonical branch development without PR churn
- ✅ P5 runtime proof is bound to the exact compiled CI artifact: source SHA, Actions run ID and run number
- ✅ P5 stored proof is validated against the currently running compiled build; stale/local/untraceable proof fails closed
- ✅ P5 bounded closure evidence schema v2 includes the same provenance and can be persisted/reopened/copy-exported
- ✅ P5 latest verified artifact remains `figma-plugin-dist-353`
- ✅ P6 embeds the same exact-build P5 proof + closure evidence contract in the P6 artifact
- ✅ P6 calibration/refusal evidence schema v2 records current build identity and the exact P5 prerequisite proof build
- ✅ P6 developer calibration preflight uses only a P5 proof valid for the currently running P6 artifact
- ✅ repaired stale P6 test fixtures that still used schema v1 / provenance-free inputs; production safety contract was not relaxed
- ✅ P6 #407 passed install, typecheck, all tests, build, bundle integrity/provenance verification and artifact upload
- ✅ verified P6 artifact: `figma-plugin-dist-407`
- ✅ P6 artifact digest: `sha256:009eb6ddbd5798acad0d0bbfd1ffcf16f6073c77986f1d7585d72dd07dd5c5f1`
- ✅ P7 retains same-build 60+ stress and active-frame cancellation evidence and computes a single exact-build `Closure acceptance: PASS/FAIL`
- ✅ P7 exact-build P5 receipt, source-aware durable metadata and closure viewer remain verified at CI #398
- ✅ latest verified functional CI green: P5 #353, P6 #407, P7 #398

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

- [ ] import `figma-plugin-dist-407` (or newer verified P6 artifact)
- [ ] in that same build run P5 runtime self-test and require exact-build P5 Acceptance PASS
- [ ] optionally reopen prerequisite evidence with `Developer: P5 Runtime Evidence`
- [ ] run disposable page-flow clone calibration and require positive Acceptance PASS
- [ ] collect image-bearing real-template calibration evidence
- [ ] verify pass/reject/failure cleanup with `0` leftovers
- [ ] run the same developer command on a preservation-sensitive real page that yields `NO_CANDIDATE`
- [ ] require `Preservation refusal acceptance: PASS`
- [ ] export refusal evidence containing the explicit `PRESERVE` plan and preserve-node IDs

P6 production advanced mutation remains intentionally disabled.

### P7 — issue #8

- [ ] import `figma-plugin-dist-398` (or newer verified canonical P7 artifact) and keep that exact build loaded for all P7 acceptance observations
- [ ] in that build run `Developer: P5 Runtime Self-Test` and require exact-build P5 prerequisite PASS
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
- Batch processing is strictly sequential: max one processor at a time.
- Cancellation is cooperative and cannot silently bypass an in-flight transaction/checkpoint.
- Durable batch skip metadata is build-source-sensitive and never trusted by an untraceable production build.
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
