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

| Track | Branch | Latest verified head | CI / artifact |
|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `fe2ebb0` | ✅ #437 · `figma-plugin-dist-437` |
| P6 | `feat/p6-advanced-structures` | `2e25e56` | ✅ #438 · `figma-plugin-dist-438` |
| P7 | `feat/p7-batch-queue-core` | `99394da` | ✅ #436 · `figma-plugin-dist-436` |

### Verified artifact digests

- P5 #437: `sha256:1a2e966a6c85a4c90ec11cefeaaf27b537685ac48a94facbef61437c41870fe0`
- P6 #438: `sha256:7d2dde12f9673f66036855136b19e7091df6df5c79cdf581eec4bee403ad199e`
- P7 #436: `sha256:c5b0c7af271e61946318f1d7728afe10b06f564d79964dcdca7389ff5a4fe5f2`

## Latest development batch — 2026-09-08

- ✅ 0 open PR/MRs; canonical branches remain the direct development source of truth.
- ✅ P5 proof/evidence is bound to the exact compiled CI artifact; stale/local/untraceable proof fails closed.
- ✅ P6 requires exact-build P5 prerequisite evidence and retains independent positive + preservation-refusal closure scenarios.
- ✅ P6 positive closure requires a real image-bearing Full P3 path, unchanged image-anchor count and zero candidate cleanup risk.
- ✅ P7 mutation entrypoints fail fast on the exact-build P5/P7 receipt; each frame processor re-checks the same prerequisite independently.
- ✅ P7 durable run metadata is source-SHA-sensitive and cannot silently skip a newer build because of an older finalized result.
- ✅ P7 final viewer computes one exact-build `Closure acceptance: PASS/FAIL` verdict across P5 prerequisite + 60+ stress + active-frame cancellation evidence.
- ✅ **P5, P6 and P7 artifacts now ship a standalone `prepare-figma-import.mjs` helper.**
- ✅ helper creates a separate local import directory and changes only the manifest plugin ID; compiled `code.js` and `ui.html` remain byte-for-byte unchanged.
- ✅ CI on all three branches independently runs the helper and verifies SHA-256 equality of compiled targets before artifact upload.
- ✅ artifact `IMPORT_NOTES.txt` now gives the deterministic local-import command instead of requiring manual manifest editing.
- ✅ latest full pipelines: P5 #437, P6 #438, P7 #436 — install, typecheck, tests, build, bundle/provenance checks, local-import integrity check, helper packaging and artifact upload all passed.

## Self-contained Figma artifact import

If the downloaded CI artifact already contains the correct Figma plugin ID, import its `manifest.json` directly.

If the artifact was built with placeholder ID `000000000000000000`, unpack it and run from inside the artifact directory:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import:

```text
dist-local/manifest.json
```

The helper:
- refuses the placeholder/blank plugin ID,
- preserves the original artifact directory,
- copies the artifact into `dist-local/`,
- changes only `manifest.json` → `id`,
- verifies SHA-256 equality of compiled `code.js` / `ui.html`,
- writes `LOCAL_IMPORT_INFO.txt` with the unchanged-target hashes and source build provenance.

This preparation step does **not** count as imported-Figma runtime acceptance.

## Remaining real-runtime acceptance

The remaining open issues are intentionally limited to evidence GitHub CI cannot manufacture because it must run through the **actual imported compiled Figma development plugin and its UI iframe Canvas pixel broker**.

### P5 — issue #6

- [ ] import `figma-plugin-dist-437` (or a newer verified P5 artifact)
- [ ] if needed, use the packaged import helper and confirm `LOCAL_IMPORT_INFO.txt` reports `compiled_targets_unchanged=true`
- [ ] run `Developer: P5 Runtime Self-Test`
- [ ] require `P5 Compiled Runtime Acceptance: PASS`
- [ ] verify real rendered-pixel forced reject, commit → restore and commit → finalize paths
- [ ] require checkpoint cleanup and `0` leftovers
- [ ] confirm stale proof from another artifact cannot unlock the current build
- [ ] copy/reopen the persisted provenance-bound P5 acceptance JSON

Production Safe Fix mutation stays locked until this exact-build proof passes.

### P6 — issue #7

- [ ] import `figma-plugin-dist-438` (or a newer verified P6 artifact)
- [ ] run P5 runtime self-test in that exact build and require prerequisite PASS
- [ ] run page-flow clone calibration on a real image-bearing page and require positive Acceptance PASS
- [ ] require `imageAnchorCountBefore > 0` and unchanged image-anchor count after Full P3
- [ ] verify pass/reject/failure cleanup with `0` leftovers
- [ ] run a preservation-sensitive real page that yields `NO_CANDIDATE`
- [ ] require preservation-refusal Acceptance PASS
- [ ] open `Developer: P6 Runtime Evidence` and require `P6 Closure acceptance: PASS`
- [ ] copy/export the P6 closure bundle

P6 production advanced mutation remains intentionally disabled.

### P7 — issue #8

- [ ] import `figma-plugin-dist-436` (or a newer verified P7 artifact) and keep that exact build loaded for all observations
- [ ] run `Developer: P5 Runtime Self-Test` and require the exact-build prerequisite PASS
- [ ] verify Safe Fix preview/apply and batch start recognize the exact-build prerequisite before mutation
- [ ] execute a realistic 60+ Frame batch run
- [ ] retain completed stress evidence with all Frames terminal and max processor concurrency `1`
- [ ] request cancellation during a genuinely long active Full P3 operation
- [ ] retain settled active-frame cancellation evidence with a matching processor attempt
- [ ] open `Developer: P7 Runtime Evidence` and require `Closure acceptance: PASS`
- [ ] copy/export the closure bundle

## Safety invariants

- Approved original design is the visual source of truth.
- Never mutate on low confidence or ambiguous structure.
- Candidate-only mutation; transformer never receives the approved original.
- Full P3 validation is mandatory before P4 commit.
- Rendered-pixel evidence is part of production validation.
- Only one unresolved restore/finalize checkpoint may exist.
- Runtime proof/evidence must be traceable to the exact CI-built plugin currently loaded.
- P6 advanced calibration is clone-only and has no production commit seam.
- P7 mutation entrypoints and each individual frame processor independently require the exact-build prerequisite.
- Batch processing is strictly sequential: max one processor at a time.
- Cancellation is cooperative and cannot silently bypass an in-flight transaction/checkpoint.
- Durable batch skip metadata is build-source-sensitive and never trusted by an untraceable production build.
- Local manifest rebinding must never alter compiled plugin code/UI.
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

For a locally built `dist/`, you can also run:

```bash
npm run prepare:figma-import -- <your-figma-plugin-id>
```

Canonical engineering detail also lives in `memory-bank/PROJECT_STATE.md`, `memory-bank/ROADMAP.md`, `memory-bank/NEXT_ACTIONS.md`, and phase-specific files under `docs/`.
