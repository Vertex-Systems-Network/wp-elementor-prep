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

- ✅ P7 closure export is schema v2 and embeds raw P5 core proof + exact-build P7 proof receipt
- ✅ `verify-p7-closure.mjs` independently validates `isValidP5RuntimeProof` and exact-build receipt binding
- ✅ copied `p5Prerequisite.valid: true` is never trusted by itself
- ✅ canonical 60+ stress + active-frame cancellation acceptance is re-run offline
- ✅ final exact-build closure is recomputed instead of trusting exported PASS text
- ✅ different-build, forged P5 receipt/timestamp, malformed input, stored-verdict edits, concurrency violations and runtime-evidence tampering fail closed
- ✅ CI #477 passed build/provenance, schema-v2 exact-artifact CLI PASS, different-build + forged-prerequisite rejection, local-import integrity and artifact upload
- ✅ P6 schema-v2 closure/offline verifier baseline is green at CI #482
- ✅ 0 open PR/MRs

## Self-contained Figma import

If the artifact uses placeholder plugin ID `000000000000000000`, unpack it and run:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json`. This is import preparation only; it is **not** runtime acceptance.

## Offline P7 closure verification

After the real stress + cancellation observations, copy/export the schema-v2 closure bundle as `p7-closure.json` and run from the **same artifact**:

```bash
node verify-p7-closure.mjs < p7-closure.json
```

Exit code `0` requires exact-build P5 proof/receipt, canonical P7 runtime acceptance and final closure to independently recompute to PASS.

## Remaining real-runtime gates

### P5 — #6
- import `figma-plugin-dist-455` or newer verified artifact
- run `Developer: P5 Runtime Self-Test`
- require exact-build `P5 Compiled Runtime Acceptance: PASS`
- verify rendered-pixel reject / restore / finalize and zero leftovers

### P6 — #7
- import `figma-plugin-dist-482` or newer verified artifact
- establish exact-build P5 prerequisite
- collect image-bearing positive + preservation-refusal observations
- require `P6 Closure acceptance: PASS`
- independently verify the schema-v2 closure bundle

### P7 — #8
- import `figma-plugin-dist-477` or newer verified artifact and keep that exact build loaded
- establish exact-build P5 prerequisite and verify mutation entrypoints recognize it
- execute realistic 60+ Frame batch run with all Frames terminal and `maxConcurrentProcessors === 1`
- request cancellation during a genuinely long active Full P3 operation and retain matching settled processor evidence
- require `Closure acceptance: PASS`
- export schema-v2 bundle and require same-artifact `verify-p7-closure.mjs` exit code `0`

## Safety invariants

- approved original is the visual source of truth
- candidate-only mutation
- Full P3 before P4 commit
- rendered-pixel evidence required
- exact-build runtime proof/evidence only
- offline closure tools re-run canonical assessors instead of trusting exported verdict text
- P6 is clone-only with no production commit seam
- P7 max one processor at a time with cooperative cancellation
- cancellation cannot bypass an in-flight transaction/checkpoint
- local manifest rebinding must never alter compiled code/UI
- unsupported/ambiguous structures are refused, never guessed
