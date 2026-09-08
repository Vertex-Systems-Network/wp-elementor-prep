# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

`Figma selection -> Audit -> classify -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** this README is updated after meaningful verified development batches with canonical CI/artifact state, blockers and next actions.

**Open PR/MR:** `0`

| Phase | Scope | Current status |
|---|---|---|
| P0–P4 | Core audit, validation, transaction/rollback | ✅ Complete |
| P5 | Conservative Safe Fix recipes | 🟡 Engineering + exact-build evidence + exact-artifact offline verification complete; imported-Figma acceptance pending (#6) |
| P6 | Advanced clone-only calibration | 🟡 Engineering + exact-build closure + exact-artifact offline verification complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟡 Engineering + closure-v2 prerequisite proof + exact-artifact offline verification complete; real-Figma stress/cancellation acceptance pending (#8) |
| P8 | Optional exporter adapters | ⏸ Deferred / #9 closed as not planned |

## Canonical verified artifacts

| Track | Branch | Verified head | CI / artifact | Digest |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `a100df8` | ✅ #455 · `figma-plugin-dist-455` | `sha256:e246e854017e65cb938972f438d623a282e29965cbc3b0d4cb3e2a3c4ad474e7` |
| P6 | `feat/p6-advanced-structures` | `0c54c21` | ✅ #462 · `figma-plugin-dist-462` | `sha256:34e24a5be85b0fb12bd81f0a4272fc0e4b70fb1f17bb7b5be7fafacb0c04928a` |
| P7 | `feat/p7-batch-queue-core` | `99584ab` | ✅ #477 · `figma-plugin-dist-477` | `sha256:b6f2f352b19ff3e48f296ac988e9046709cb7e029b2f59737c2a70c60f81f831` |

## Latest verified development batch — 2026-09-08

- ✅ P5 artifact ships `verify-p5-evidence.mjs`; canonical P5 acceptance is recomputed outside Figma and bound to the same artifact source SHA / Actions run identity.
- ✅ P6 artifact ships `verify-p6-closure.mjs`; canonical positive calibration + preservation refusal + combined closure acceptance are recomputed outside Figma and exact-artifact-bound.
- ✅ P7 artifact ships `verify-p7-closure.mjs` and closure export is now **schema v2**.
- ✅ P7 schema-v2 closure includes the raw P5 core proof + exact-build P7 proof receipt, not only a copied prerequisite boolean.
- ✅ P7 verifier independently re-runs P5 proof validation, exact-build receipt validation, 60+ stress acceptance, active-frame cancellation acceptance and final closure acceptance.
- ✅ forged `p5Prerequisite.valid: true`, receipt timestamp tampering, different-build evidence, concurrency violations, malformed input and stored-verdict edits all fail closed.
- ✅ P7 CI #477 passed install, typecheck, tests, build, plugin/verifier provenance checks, schema-v2 same-build PASS, different-build rejection, forged-P5-prerequisite rejection, malformed rejection, local-import integrity and artifact upload.
- ✅ all three canonical tracks provide same-artifact offline closure verification plus deterministic `prepare-figma-import.mjs` manifest rebinding.
- ✅ 0 open PR/MRs; real imported-Figma observations remain the only blockers for #6/#7/#8.

## Self-contained Figma artifact import

If an artifact uses placeholder plugin ID `000000000000000000`, unpack it and run:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json`. `LOCAL_IMPORT_INFO.txt` records provenance and hashes proving compiled `code.js` / `ui.html` were unchanged. Import preparation is **not** runtime acceptance.

## Independent closure verification

Run each verifier from the **same unpacked artifact** that produced the Figma runtime evidence:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
node verify-p6-closure.mjs < p6-closure.json
node verify-p7-closure.mjs < p7-closure.json
```

Exit code `0` requires canonical acceptance and an exact artifact-build match. For P7 schema v2, the verifier also independently validates the embedded P5 core proof + exact-build receipt. Offline verification is read-only and cannot replace the required imported-Figma runtime observation.

## Remaining real-runtime acceptance

### P5 — issue #6

- [ ] import `figma-plugin-dist-455` or newer verified artifact
- [ ] run `Developer: P5 Runtime Self-Test`
- [ ] require `P5 Compiled Runtime Acceptance: PASS`
- [ ] verify rendered-pixel forced reject, restore, finalize and `0` leftovers
- [ ] export closure JSON and require same-artifact `verify-p5-evidence.mjs` exit code `0`

Production Safe Fix mutation remains locked until this exact-build runtime proof passes.

### P6 — issue #7

- [ ] import `figma-plugin-dist-462` or newer verified artifact
- [ ] establish exact-build P5 prerequisite in that same plugin build
- [ ] run positive image-bearing page-flow clone calibration and require Full P3 PASS with unchanged image-anchor count
- [ ] run preservation-sensitive page and require `NO_CANDIDATE` refusal PASS
- [ ] open `Developer: P6 Runtime Evidence` and require `P6 Closure acceptance: PASS`
- [ ] export `p6-closure.json` and require same-artifact `verify-p6-closure.mjs` exit code `0`

P6 production advanced mutation remains intentionally disabled.

### P7 — issue #8

- [ ] import `figma-plugin-dist-477` or newer verified artifact and keep that exact build loaded for all observations
- [ ] establish its exact-build P5 prerequisite
- [ ] execute a realistic 60+ Frame batch run with `maxConcurrentProcessors === 1`
- [ ] request cancellation during a genuinely long active Full P3 operation
- [ ] retain settled active-frame cancellation evidence with matching processor attempt
- [ ] open `Developer: P7 Runtime Evidence` and require `Closure acceptance: PASS`
- [ ] export schema-v2 `p7-closure.json` containing P5 core proof + exact-build receipt
- [ ] require same-artifact `verify-p7-closure.mjs` exit code `0`

## Safety invariants

- approved original design is the visual source of truth
- unsupported/ambiguous structures are refused, never guessed
- candidate-only mutation; Full P3 before P4 commit
- rendered-pixel evidence is mandatory for production validation
- runtime proof/evidence must be traceable to the exact CI-built artifact currently loaded
- offline closure verifiers must recompute canonical acceptance and match the verifier artifact build
- P7 prerequisite acceptance must be recomputed from raw P5 proof + exact-build P7 receipt, never from a copied boolean alone
- P6 advanced calibration remains clone-only with no production commit seam
- P7 processing is strictly sequential with cooperative cancellation
- local manifest rebinding must never alter compiled plugin code/UI

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

For a repository-local artifact:

```bash
npm run prepare:figma-import -- <your-figma-plugin-id>
```
