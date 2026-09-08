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
| P6 | Advanced clone-only calibration | 🟡 Engineering + schema-v2 exact-build closure + offline verifier complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟡 Engineering + schema-v2 exact-build closure + offline verifier complete; real-Figma acceptance pending (#8) |
| P8 | Optional exporter adapters | ⏸ Deferred |

## Latest verified artifacts

| Track | Head | CI | Artifact | Digest |
|---|---|---|---|---|
| P5 | `a100df8` | ✅ #455 | `figma-plugin-dist-455` | `sha256:e246e854017e65cb938972f438d623a282e29965cbc3b0d4cb3e2a3c4ad474e7` |
| P6 | `8d5f743` | ✅ #482 | `figma-plugin-dist-482` | `sha256:265ddd9507fbaa5cfea5c474cbd07ff9dc67a00877b340c0d39024c3c16bda41` |
| P7 | `99584ab` | ✅ #477 | `figma-plugin-dist-477` | `sha256:b6f2f352b19ff3e48f296ac988e9046709cb7e029b2f59737c2a70c60f81f831` |

## Latest development batch — 2026-09-08

- ✅ P6 closure export is schema v2 and embeds the persisted P5 runtime evidence bundle
- ✅ `verify-p6-closure.mjs` independently re-runs canonical P5 calibration acceptance and exact-build binding
- ✅ P6 positive/refusal scenario proof timestamps, gate and proof-build claims are cross-checked against embedded P5 evidence
- ✅ canonical P6 positive/refusal + combined closure assessors are re-run offline; copied PASS text is not trusted
- ✅ different-build, missing-P5-evidence, forged proof timestamp, tampered P5 calibration, malformed and stored-verdict-tampered bundles fail closed
- ✅ CI #482 passed build/provenance, schema-v2 CLI PASS, forged-prerequisite rejection, local-import integrity and artifact upload
- ✅ P7 schema-v2 closure/offline verifier baseline is also green at CI #477
- ✅ 0 open PR/MRs

## Self-contained Figma import

If the artifact uses placeholder plugin ID `000000000000000000`, unpack it and run:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json`. This is import preparation only; it is **not** runtime acceptance.

## Offline P6 closure verification

After collecting the real positive + preservation-refusal scenarios, copy/export the schema-v2 P6 closure JSON as `p6-closure.json` and run from the **same artifact**:

```bash
node verify-p6-closure.mjs < p6-closure.json
```

Exit code `0` requires embedded P5 evidence, both P6 scenarios and final closure to independently recompute to PASS for that exact artifact build.

## Remaining real-runtime gates

### P5 — #6
- import `figma-plugin-dist-455` or newer verified artifact
- run `Developer: P5 Runtime Self-Test`
- require exact-build `P5 Compiled Runtime Acceptance: PASS`
- verify rendered-pixel reject / restore / finalize and zero leftovers

### P6 — #7
- import `figma-plugin-dist-482` or newer verified artifact
- establish exact-build P5 prerequisite in that same build
- run image-bearing page-flow clone calibration and require positive acceptance PASS
- run preservation-sensitive page and require `NO_CANDIDATE` + refusal acceptance PASS
- require `P6 Closure acceptance: PASS`
- export schema-v2 bundle and require same-artifact `verify-p6-closure.mjs` exit code `0`

### P7 — #8
- import `figma-plugin-dist-477` or newer verified artifact
- establish exact-build P5 prerequisite
- execute realistic 60+ Frame stress + genuinely long active Full P3 cancellation observations
- require `Closure acceptance: PASS`
- independently verify schema-v2 closure with the same artifact

## Safety invariants

- approved original is the visual source of truth
- candidate-only mutation
- Full P3 before P4 commit
- rendered-pixel evidence required
- exact-build runtime proof/evidence only
- offline closure tools re-run canonical assessors instead of trusting exported verdict text
- P6 is clone-only with no production commit seam
- P7 max one processor at a time with cooperative cancellation
- local manifest rebinding must never alter compiled code/UI
- unsupported/ambiguous structures are refused, never guessed
