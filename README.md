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
| P6 | Advanced clone-only calibration | 🟡 Engineering + exact-build closure tooling + offline verifier complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟡 Engineering + exact-build closure tooling complete; real-Figma acceptance pending (#8) |
| P8 | Optional exporter adapters | ⏸ Deferred |

## Latest verified artifacts

| Track | Head | CI | Artifact | Digest |
|---|---|---|---|---|
| P5 | `a100df8` | ✅ #455 | `figma-plugin-dist-455` | `sha256:e246e854017e65cb938972f438d623a282e29965cbc3b0d4cb3e2a3c4ad474e7` |
| P6 | `0c54c21` | ✅ #462 | `figma-plugin-dist-462` | `sha256:34e24a5be85b0fb12bd81f0a4272fc0e4b70fb1f17bb7b5be7fafacb0c04928a` |
| P7 | `99394da` | ✅ #436 | `figma-plugin-dist-436` | `sha256:c5b0c7af271e61946318f1d7728afe10b06f564d79964dcdca7389ff5a4fe5f2` |

## Latest development batch — 2026-09-08

- ✅ P6 artifact now ships `verify-p6-closure.mjs`
- ✅ exported P6 closure JSON is independently re-evaluated with the canonical positive + preservation-refusal closure assessor
- ✅ verifier is bound to the exact packaged CI source SHA / run ID / run number
- ✅ otherwise-valid closure evidence from another build is rejected
- ✅ malformed or stored-verdict-tampered bundles fail closed
- ✅ verifier is read-only and cannot mutate Figma or create acceptance evidence
- ✅ CI #462 passed typecheck, tests, build, exact-artifact closure CLI smoke, local-import integrity and artifact upload
- ✅ standalone `prepare-figma-import.mjs` remains packaged
- ✅ 0 open PR/MRs

## Self-contained Figma import

If the artifact uses placeholder plugin ID `000000000000000000`, unpack it and run inside the artifact directory:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json` in Figma. This is import preparation only; it is **not** runtime acceptance.

## Offline P6 closure verification

After collecting both real P6 scenarios and copying the `P6 Closure` viewer JSON, save it as `p6-closure.json` and run from the **same unpacked artifact**:

```bash
node verify-p6-closure.mjs < p6-closure.json
```

Exit code `0` requires canonical P6 closure PASS and exact artifact-build identity. Offline verification reviews evidence only; it does not replace real imported-Figma execution.

## Remaining real-runtime gates

### P5 — #6
- import `figma-plugin-dist-455` or newer verified artifact
- run `Developer: P5 Runtime Self-Test`
- require exact-build `P5 Compiled Runtime Acceptance: PASS`
- verify forced rendered-pixel reject, restore, finalize and zero leftovers
- independently verify exported P5 JSON with the same artifact

### P6 — #7
- import `figma-plugin-dist-462` or newer verified artifact
- establish exact-build P5 prerequisite
- positive image-bearing page-flow clone calibration PASS
- preservation-sensitive `NO_CANDIDATE` refusal PASS
- require `P6 Closure acceptance: PASS`
- export closure JSON and require `node verify-p6-closure.mjs < p6-closure.json` exit code `0`

### P7 — #8
- import `figma-plugin-dist-436` or newer verified artifact
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
- exported P5/P6 evidence must independently recompute to the canonical verdict using the same artifact build
- P6 is clone-only with no production commit seam
- P7 max one processor at a time with cooperative cancellation
- local manifest rebinding must never alter compiled code/UI
- unsupported/ambiguous structures are refused, never guessed
