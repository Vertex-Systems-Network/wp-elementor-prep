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
| P5 | Conservative high-confidence Safe Fix recipes | 🟡 Engineering + exact-build closure evidence + exact-artifact offline verification complete; imported-Figma runtime acceptance pending (#6) |
| P6 | Advanced structures + clone-only calibration | 🟡 Engineering + exact-build single-verdict closure tooling complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ frame batch queue | 🟡 Engineering + exact-build fail-fast/single-verdict closure tooling complete; real-Figma stress/cancellation acceptance pending (#8) |
| P8 | Optional Elementor exporter adapters | ⏸ Deferred / issue #9 closed as not planned for current phase |

## Canonical development branches

| Track | Branch | Latest verified head | CI / artifact |
|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `a100df8` | ✅ #455 · `figma-plugin-dist-455` |
| P6 | `feat/p6-advanced-structures` | `2e25e56` | ✅ #438 · `figma-plugin-dist-438` |
| P7 | `feat/p7-batch-queue-core` | `99394da` | ✅ #436 · `figma-plugin-dist-436` |

### Verified artifact digests

- P5 #455: `sha256:e246e854017e65cb938972f438d623a282e29965cbc3b0d4cb3e2a3c4ad474e7`
- P6 #438: `sha256:7d2dde12f9673f66036855136b19e7091df6df5c79cdf581eec4bee403ad199e`
- P7 #436: `sha256:c5b0c7af271e61946318f1d7728afe10b06f564d79964dcdca7389ff5a4fe5f2`

## Latest development batch — 2026-09-08

- ✅ 0 open PR/MRs; canonical branches remain the direct development source of truth.
- ✅ P5 proof/evidence is bound to the exact compiled CI artifact; stale/local/untraceable proof fails closed.
- ✅ P5 artifact now ships `verify-p5-evidence.mjs` for independent read-only closure-evidence verification outside Figma.
- ✅ the P5 offline verifier is compiled with the same source SHA / Actions run ID / run number as the plugin artifact and rejects otherwise-valid evidence from another artifact build.
- ✅ P5 verifier re-runs the canonical deterministic acceptance assessor and checks schema, gate version, provenance, proof timestamp and stored-vs-recomputed verdict consistency.
- ✅ CI #455 verifies current-artifact PASS, malformed evidence rejection and different-build evidence rejection before artifact upload.
- ✅ P6 requires exact-build P5 prerequisite evidence and retains independent positive + preservation-refusal closure scenarios.
- ✅ P6 positive closure requires a real image-bearing Full P3 path, unchanged image-anchor count and zero candidate cleanup risk.
- ✅ P7 mutation entrypoints fail fast on the exact-build P5/P7 receipt; each frame processor re-checks the same prerequisite independently.
- ✅ P7 durable run metadata is source-SHA-sensitive and cannot silently skip a newer build because of an older finalized result.
- ✅ P7 final viewer computes one exact-build `Closure acceptance: PASS/FAIL` verdict across P5 prerequisite + 60+ stress + active-frame cancellation evidence.
- ✅ P5, P6 and P7 artifacts ship standalone `prepare-figma-import.mjs`; local manifest rebinding is hash-verified and cannot alter compiled code/UI.

## Self-contained Figma artifact import

If the downloaded artifact already contains the correct Figma plugin ID, import its `manifest.json` directly.

If it uses placeholder ID `000000000000000000`, unpack it and run from inside the artifact directory:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json`. `LOCAL_IMPORT_INFO.txt` records source build provenance and hashes proving compiled `code.js` / `ui.html` were unchanged. This preparation is **not** runtime acceptance.

## Independent P5 closure verification

After the real P5 runtime self-test, copy/export the viewer JSON as `p5-evidence.json` and run it with the verifier from the **same unpacked artifact**:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
```

Exit code `0` requires canonical acceptance PASS and an exact match with that artifact's source SHA / Actions run identity. Different-build, stale-gate, malformed or semantically tampered evidence is rejected. Offline verification cannot replace the real imported-Figma observation.

## Remaining real-runtime acceptance

The remaining open issues require the **actual imported compiled Figma development plugin and its UI iframe Canvas pixel broker**.

### P5 — issue #6

- [ ] import `figma-plugin-dist-455` (or newer verified P5 artifact)
- [ ] if needed, prepare a local manifest via the packaged helper
- [ ] run `Developer: P5 Runtime Self-Test`
- [ ] require `P5 Compiled Runtime Acceptance: PASS`
- [ ] verify real rendered-pixel forced reject, commit → restore and commit → finalize paths
- [ ] require checkpoint cleanup and `0` leftovers
- [ ] copy/reopen the persisted provenance-bound P5 acceptance JSON
- [ ] run `node verify-p5-evidence.mjs < p5-evidence.json` from the same artifact and require exit code `0`

Production Safe Fix mutation stays locked until this exact-build proof passes.

### P6 — issue #7

- [ ] import `figma-plugin-dist-438` (or newer verified P6 artifact)
- [ ] run P5 runtime self-test in that exact build and require prerequisite PASS
- [ ] run page-flow clone calibration on a real image-bearing page and require positive Acceptance PASS
- [ ] require unchanged image-anchor count after Full P3 and zero leftovers
- [ ] run a preservation-sensitive real page that yields `NO_CANDIDATE`
- [ ] require preservation-refusal Acceptance PASS
- [ ] open `Developer: P6 Runtime Evidence` and require `P6 Closure acceptance: PASS`
- [ ] copy/export the P6 closure bundle

P6 production advanced mutation remains intentionally disabled.

### P7 — issue #8

- [ ] import `figma-plugin-dist-436` (or newer verified P7 artifact) and keep that exact build loaded for all observations
- [ ] run `Developer: P5 Runtime Self-Test` and require the exact-build prerequisite PASS
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
- Runtime proof/evidence must be traceable to the exact CI-built plugin currently loaded.
- Exported P5 closure evidence must independently recompute to the same canonical verdict and match the verifier artifact build.
- P6 advanced calibration is clone-only and has no production commit seam.
- P7 mutation entrypoints and each individual frame processor independently require the exact-build prerequisite.
- Batch processing is strictly sequential: max one processor at a time.
- Cancellation is cooperative and cannot silently bypass an in-flight transaction/checkpoint.
- Durable batch skip metadata is build-source-sensitive and never trusted by an untraceable production build.
- Local manifest rebinding must never alter compiled plugin code/UI.
- Unsupported or ambiguous constructs are reported/refused, never guessed.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

For a locally built `dist/`:

```bash
npm run prepare:figma-import -- <your-figma-plugin-id>
```
