# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

`Figma selection -> Audit -> classify -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** this README must be updated at the end of every meaningful development batch with the latest verified CI, canonical branch state, blockers and next actions.

**Open PR/MR:** `0`

| Phase | Scope | Current status |
|---|---|---|
| P0–P4 | Core audit, validation, transaction/rollback | ✅ Complete |
| P5 | Conservative Safe Fix recipes | 🟡 Engineering + exact-build closure evidence + exact-artifact offline verifier complete; imported-Figma acceptance pending (#6) |
| P6 | Advanced clone-only calibration | 🟡 Engineering + exact-build closure tooling complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟡 Engineering + exact-build closure tooling complete; real-Figma acceptance pending (#8) |
| P8 | Optional exporter adapters | ⏸ Deferred |

## Latest verified artifacts

| Track | Head | CI | Artifact | Digest |
|---|---|---|---|---|
| P5 | `a100df8` | ✅ #455 | `figma-plugin-dist-455` | `sha256:e246e854017e65cb938972f438d623a282e29965cbc3b0d4cb3e2a3c4ad474e7` |
| P6 | `2e25e56` | ✅ #438 | `figma-plugin-dist-438` | `sha256:7d2dde12f9673f66036855136b19e7091df6df5c79cdf581eec4bee403ad199e` |
| P7 | `99394da` | ✅ #436 | `figma-plugin-dist-436` | `sha256:c5b0c7af271e61946318f1d7728afe10b06f564d79964dcdca7389ff5a4fe5f2` |

## Latest development batch — 2026-09-08

- ✅ P5 artifact ships `verify-p5-evidence.mjs`
- ✅ verifier is compiled with the exact same source SHA / Actions run ID / run number as the packaged plugin
- ✅ otherwise-valid evidence captured by another artifact build is rejected
- ✅ exported P5 closure JSON is independently recomputed with the same canonical deterministic acceptance assessor
- ✅ verifier checks schema, runtime-gate version, exact artifact provenance, canonical calibration acceptance, stored-vs-recomputed verdict consistency and proof timestamps
- ✅ malformed, stale-gate, different-build and semantically tampered evidence fail closed
- ✅ verifier is read-only and cannot mint proof or mutate Figma/plugin state
- ✅ CI #455 verifies current-build PASS, malformed rejection and different-build rejection before artifact upload
- ✅ all canonical artifacts continue to ship standalone `prepare-figma-import.mjs`
- ✅ 0 open PR/MRs

## Self-contained Figma import

If the artifact uses placeholder plugin ID `000000000000000000`, unpack it and run inside the artifact directory:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json` in Figma.

`LOCAL_IMPORT_INFO.txt` records the original/prepared IDs, source build provenance and SHA-256 hashes proving compiled plugin code/UI were unchanged. This step is import preparation only; it is **not** runtime acceptance.

## Offline P5 evidence verification

After copying/exporting P5 closure JSON from the runtime viewer, save it as `p5-evidence.json` and run from the **same unpacked artifact**:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
```

Exit code `0` requires canonical P5 acceptance **and** exact match with this verifier artifact's source SHA / Actions run identity. A non-zero exit code means evidence is malformed, stale, tampered, acceptance-failing or belongs to another artifact. Offline verification does not replace the real Figma runtime observation.

## Remaining real-runtime gates

### P5 — #6
- import `figma-plugin-dist-455`
- run `Developer: P5 Runtime Self-Test`
- require exact-build `P5 Compiled Runtime Acceptance: PASS`
- verify forced rendered-pixel reject, restore, finalize and zero leftovers
- retain/reopen provenance-bound P5 evidence
- run `node verify-p5-evidence.mjs < p5-evidence.json` from artifact #455 and require exit code `0`

### P6 — #7
- import `figma-plugin-dist-438`
- establish exact-build P5 prerequisite
- positive image-bearing page-flow clone calibration PASS
- preservation-sensitive `NO_CANDIDATE` refusal PASS
- require `P6 Closure acceptance: PASS`

### P7 — #8
- import `figma-plugin-dist-436`
- establish exact-build P5 prerequisite
- realistic 60+ Frame stress run
- genuinely long active Full P3 cancellation run
- require `Closure acceptance: PASS`

## Safety invariants

- approved original is the visual source of truth
- candidate-only mutation
- Full P3 before P4 commit
- rendered-pixel evidence required
- exact-build runtime proof/evidence only
- exported P5 closure evidence must independently recompute to the same canonical verdict and match the verifier artifact build
- P6 is clone-only with no production commit seam
- P7 max one processor at a time with cooperative cancellation
- local manifest rebinding must never alter compiled code/UI
- unsupported/ambiguous structures are refused, never guessed
