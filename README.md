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
| P7 | Sequential 60+ Frame batch queue | 🟡 Engineering + exact-build closure tooling complete; real-Figma stress/cancellation acceptance pending (#8) |
| P8 | Optional exporter adapters | ⏸ Deferred / #9 closed as not planned |

## Canonical verified artifacts

| Track | Branch | Verified head | CI / artifact | Digest |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `a100df8` | ✅ #455 · `figma-plugin-dist-455` | `sha256:e246e854017e65cb938972f438d623a282e29965cbc3b0d4cb3e2a3c4ad474e7` |
| P6 | `feat/p6-advanced-structures` | `0c54c21` | ✅ #462 · `figma-plugin-dist-462` | `sha256:34e24a5be85b0fb12bd81f0a4272fc0e4b70fb1f17bb7b5be7fafacb0c04928a` |
| P7 | `feat/p7-batch-queue-core` | `99394da` | ✅ #436 · `figma-plugin-dist-436` | `sha256:c5b0c7af271e61946318f1d7728afe10b06f564d79964dcdca7389ff5a4fe5f2` |

## Latest verified development batch — 2026-09-08

- ✅ P5 artifact ships `verify-p5-evidence.mjs`; canonical P5 acceptance is recomputed outside Figma and bound to the same artifact source SHA / Actions run identity.
- ✅ P5 CI #455 verifies same-build PASS plus malformed/different-build rejection.
- ✅ P6 artifact now ships `verify-p6-closure.mjs`.
- ✅ P6 offline verifier re-runs canonical positive-calibration, preservation-refusal and combined closure acceptance instead of trusting copied PASS text.
- ✅ P6 verifier is compiled with the same source SHA / Actions run ID / run number as the plugin artifact and rejects closure evidence from another artifact.
- ✅ P6 CI #462 passed install, typecheck, tests, build, provenance/integrity checks, exact-artifact closure CLI PASS/rejection smoke, local-import integrity and artifact upload.
- ✅ all canonical artifacts continue to ship deterministic `prepare-figma-import.mjs` manifest rebinding with byte-for-byte compiled code/UI verification.
- ✅ 0 open PR/MRs; real Figma observations remain the only blockers for #6/#7/#8.

## Self-contained Figma artifact import

If an artifact uses placeholder plugin ID `000000000000000000`, unpack it and run:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json`. `LOCAL_IMPORT_INFO.txt` records provenance and hashes proving compiled `code.js` / `ui.html` were unchanged. Import preparation is **not** runtime acceptance.

## Independent closure verification

P5, from the same unpacked artifact that was imported:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
```

P6, from the same unpacked artifact that was imported:

```bash
node verify-p6-closure.mjs < p6-closure.json
```

Exit code `0` requires canonical acceptance and an exact artifact-build match. Offline verification is read-only and cannot replace the required imported-Figma runtime observation.

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

- [ ] import the latest verified P7 artifact and establish its exact-build P5 prerequisite
- [ ] execute a realistic 60+ Frame batch run with max processor concurrency `1`
- [ ] request cancellation during a genuinely long active Full P3 operation
- [ ] retain settled active-frame cancellation evidence with matching processor attempt
- [ ] open `Developer: P7 Runtime Evidence` and require `Closure acceptance: PASS`
- [ ] export the combined closure bundle

## Safety invariants

- approved original design is the visual source of truth
- unsupported/ambiguous structures are refused, never guessed
- candidate-only mutation; Full P3 before P4 commit
- rendered-pixel evidence is mandatory for production validation
- runtime proof/evidence must be traceable to the exact CI-built artifact currently loaded
- offline closure verifiers must recompute canonical acceptance and match the verifier artifact build
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
