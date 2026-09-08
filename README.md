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
| P5 | Conservative Safe Fix recipes | 🟡 Engineering + exact-build closure evidence + offline verifier complete; imported-Figma acceptance pending (#6) |
| P6 | Advanced clone-only calibration | 🟡 Engineering + exact-build closure tooling complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟡 Engineering + exact-build closure tooling complete; real-Figma acceptance pending (#8) |
| P8 | Optional exporter adapters | ⏸ Deferred |

## Latest verified artifacts

| Track | Head | CI | Artifact | Digest |
|---|---|---|---|---|
| P5 | `5bf03eb` | ✅ #449 | `figma-plugin-dist-449` | `sha256:16657f0506fa2723c1d02c6209862268f370ff784ed879a16d1a26a264a7223d` |
| P6 | `2e25e56` | ✅ #438 | `figma-plugin-dist-438` | `sha256:7d2dde12f9673f66036855136b19e7091df6df5c79cdf581eec4bee403ad199e` |
| P7 | `99394da` | ✅ #436 | `figma-plugin-dist-436` | `sha256:c5b0c7af271e61946318f1d7728afe10b06f564d79964dcdca7389ff5a4fe5f2` |

## Latest development batch — 2026-09-08

- ✅ P5 artifact now ships `verify-p5-evidence.mjs`
- ✅ exported P5 closure JSON can be independently re-verified outside Figma using the same canonical deterministic acceptance assessor
- ✅ offline verifier checks schema, exact runtime-gate version, traceable CI provenance, canonical calibration acceptance, stored-vs-recomputed verdict consistency and proof timestamps
- ✅ malformed, stale-gate and semantically tampered evidence fail closed
- ✅ verifier is read-only and cannot mint proof or mutate Figma/plugin state
- ✅ CI runs positive and malformed-evidence CLI smoke tests before artifact upload
- ✅ P5 CI #449 passed typecheck, 117 tests, build, offline verifier smoke, bundle/provenance checks, local-import integrity and artifact upload
- ✅ all three canonical artifacts continue to ship standalone `prepare-figma-import.mjs`
- ✅ 0 open PR/MRs

## Self-contained Figma import

If the artifact uses placeholder plugin ID `000000000000000000`, unpack it and run inside the artifact directory:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json` in Figma.

`LOCAL_IMPORT_INFO.txt` records the original/prepared IDs, source build provenance and SHA-256 hashes proving compiled plugin code/UI were unchanged. This step is import preparation only; it is **not** runtime acceptance.

## Offline P5 evidence verification

After copying/exporting the P5 closure JSON from the runtime viewer, save it as `p5-evidence.json` and run from the unpacked artifact directory:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
```

Exit code `0` means the exported bundle passes independent deterministic verification. A non-zero exit code means the evidence is malformed, stale, tampered or fails the canonical P5 acceptance contract. Offline verification reviews evidence only; it does not replace the required real Figma runtime observation.

## Remaining real-runtime gates

### P5 — #6
- import `figma-plugin-dist-449`
- run `Developer: P5 Runtime Self-Test`
- require exact-build `P5 Compiled Runtime Acceptance: PASS`
- verify forced rendered-pixel reject, restore, finalize and zero leftovers
- retain/reopen provenance-bound P5 evidence
- independently run `node verify-p5-evidence.mjs < p5-evidence.json` and require exit code `0`

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
- exported P5 closure evidence must independently recompute to the same canonical verdict
- P6 is clone-only with no production commit seam
- P7 max one processor at a time with cooperative cancellation
- local manifest rebinding must never alter compiled code/UI
- unsupported/ambiguous structures are refused, never guessed
