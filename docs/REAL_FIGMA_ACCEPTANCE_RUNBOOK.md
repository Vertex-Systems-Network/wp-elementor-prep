# Real Figma Acceptance Runbook

This runbook is the single operator path for closing P5, P6 and P7 runtime acceptance without weakening exact-build safety gates.

## Rules

- Use one exact CI artifact per observation set.
- If an artifact contains placeholder Figma plugin ID `000000000000000000`, prepare a separate local import directory with the packaged helper; never edit compiled `code.js` or `ui.html`.
- The local import output must be **separate and non-nested** relative to the unpacked source artifact. Never place the prepared output inside the source artifact directory.
- Do not treat CI, local manifest rebinding, direct packaged-verifier execution, or offline verification as Figma runtime proof.
- Keep the same imported artifact loaded while collecting evidence that must share an exact build identity.
- Do not manually edit exported evidence JSON.
- Final issue closure requires **current-main `runtime:closure-intake` PASS**, not only a direct `node verify-*.mjs` invocation from the artifact.
- Do not collect final P6/P7 closure evidence before their post-P5 integration build exists. Integration probes #35/#36 proved both branches require conflict resolution against the latest P5 line.
- Do not reuse historical P5→main merge proof after `main` has moved. Latest Integration Readiness #90 reports P5 → current `main` as `CODE_CONFLICT`.

## Dependency order

1. Close P5 runtime acceptance first on canonical P5 artifact #488 and require current-main closure intake PASS.
2. Resolve canonical P5 into the then-current `main` with a **fresh integration resolution**; do not reuse the historical docs-only proof.
3. Preserve current-main safety/tooling during that resolution, especially `.github/workflows/ci.yml`, `scripts/prepare-figma-import.mjs`, status verification, non-nested import preparation, and current operator/runbook contracts; integrate P5 runtime code deliberately rather than blindly preferring either side.
4. Run full PR CI on the resolved P5→main integration and require PASS before merging/closing #6.
5. Rebase/resolve P6 and P7 against merged P5 and produce fresh verified exact-build artifacts.
6. Register each fresh P6/P7 artifact in current `main` as final-closure eligible with exact source/run/digest, immutable file hashes, manifest semantic SHA and verifier identity.
7. Collect P6/P7 real-Figma closure only from those resulting artifacts and finish each with current-main `runtime:closure-intake` PASS.

Current verified reference artifacts:

| Phase | Artifact | CI | Runtime role |
|---|---|---|---|
| P5 | `figma-plugin-dist-488` | #488 | Final #6 acceptance build |
| P6 | `figma-plugin-dist-494` | #494 | Engineering/reference build; final #7 closure requires fresh post-P5 build |
| P7 | `figma-plugin-dist-490` | #490 | Engineering/reference build; final #8 closure requires fresh post-P5 build |

## Artifact preparation

If the selected artifact uses the placeholder plugin ID, use the helper packaged inside that exact artifact and write to a **sibling/non-nested** output directory. For canonical P5 #488, from inside the unpacked artifact directory:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . ../figma-plugin-dist-488-local
```

Then import:

```text
../figma-plugin-dist-488-local/manifest.json
```

Confirm `../figma-plugin-dist-488-local/LOCAL_IMPORT_INFO.txt` reports unchanged compiled targets. The source artifact directory and prepared output directory must not overlap. The previously documented `. dist-local` nested-output form is invalid for canonical #488 and is rejected by the current helper safety contract.

## Final closure boundary

The packaged verifier remains part of the exact artifact, but **directly invoking it is not the normative final closure boundary**. Current `main` must perform closure intake so artifact eligibility/provenance, optional retained-ZIP digest, stable evidence bytes, post-preflight verifier identity, and verified-byte execution are checked together.

For every track, the final operator command must be the current-main form:

```bash
npm run runtime:closure-intake -- <p5|p6|p7> <unpacked-final-artifact-dir> <evidence-json> [--archive=/path/to/original-artifact.zip]
```

A direct packaged-verifier run may be used only as an optional local diagnostic. It cannot authorize merge or issue closure by itself.

## Step 1 — P5 compiled runtime acceptance + final closure

Use `figma-plugin-dist-488` / CI #488.

1. Import the verified P5 artifact using the sibling prepared directory above when plugin-ID rebinding is required.
2. Run `Developer: P5 Runtime Self-Test`.
3. Require `P5 Compiled Runtime Acceptance: PASS`.
4. Confirm real rendered-pixel evidence exists for:
   - forced rejection;
   - commit → restore;
   - commit → finalize.
5. Require checkpoint cleanup and `0` leftovers.
6. Confirm stale proof from another artifact cannot unlock the current build.
7. Export the provenance-bound real evidence as `p5-evidence.json` to a stable regular non-symlink path; do not edit it manually.
8. From current `main`, run final closure intake against the **original unpacked canonical #488 artifact directory** and exported evidence:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json --archive=/path/to/figma-plugin-dist-488.zip
```

If the original ZIP was not retained, omit `--archive`; all other final-closure gates remain mandatory.

9. Require artifact preflight PASS, manifest semantic SHA MATCH, immutable file hashes MATCH, exact raw evidence SHA reporting, verified-byte same-artifact verifier execution, verifier exit `0`, and final `Runtime closure intake: PASS`.
10. Retain the bounded evidence + exact artifact/run identity used by closure intake.

Do not unlock or merge P5 if any item fails. A direct artifact verifier invocation alone is insufficient.

## Step 2 — land P5 before P6/P7 closure

After Step 1 and current-main closure intake both pass:

1. Re-run `npm run integration:readiness` against the then-current `main` and canonical P5 head.
2. Treat the merge result as authoritative for that moment. **Do not reuse integration proof #37 or any earlier docs-only resolution claim.**
3. Latest verified snapshot, Integration Readiness #90 on `main` `698940369635b6f40972e6404e7e7ff71b57ea14`, reports P5 → current `main` as `CODE_CONFLICT`, including `.github/workflows/ci.yml` and `scripts/prepare-figma-import.mjs` plus documentation/status files.
4. Create a fresh integration resolution that preserves current-main import-helper overlap safety, status verification, current CI/tooling hardening, closure-intake/runbook contracts, and deliberately integrates P5 runtime code.
5. Never resolve `.github/workflows/ci.yml` or `scripts/prepare-figma-import.mjs` by blindly taking the older P5 side: canonical P5 predates the current source/output overlap guard and current-main CI safety checks.
6. Run full PR CI on the resolved integration and require status verification, typecheck, tests, build and import-preparation safety checks to PASS.
7. Re-run Integration Readiness on the resolved line as appropriate and review the exact diff before merge.
8. Merge P5 and close issue #6 only after both the canonical #488 real evidence/closure-intake result **and** the fresh current-main integration proof are retained.

Historical integration proof #37 / CI #500 is superseded for merge authorization because `main` has materially changed since that proof. It remains history only and does not authorize the current P5 merge.

## Step 3 — rebuild P6 on merged P5, then collect closure

Do not use current artifact #494 as the final closure artifact after P5 lands.

1. Rebase/resolve `feat/p6-advanced-structures` against merged P5/main.
2. Resolve shared P5 runtime/provenance conflicts deliberately; do not blindly prefer either side.
3. Run install, typecheck, tests, build, provenance checks, offline-verifier checks and artifact packaging.
4. Record the fresh P6 source SHA, CI run, artifact name and digest.
5. Register that fresh P6 artifact in current `main` with its exact source/workflow SHA, run ID/number, artifact digest, immutable file SHA-256 pins, schema-v3 id-excluded manifest semantic SHA-256, verifier filename/identity and `finalClosureEligible: true`.
6. Confirm current-main final-closure preflight accepts the fresh P6 artifact before using it for acceptance observations.
7. Keep that exact fresh P6 artifact loaded for its prerequisite and both P6 observations.
8. If local plugin-ID rebinding is needed, use that fresh artifact's helper with a separate non-nested sibling output directory.
9. Run its embedded `Developer: P5 Runtime Self-Test`; require exact-build prerequisite PASS.
10. Select a real image-bearing page and run page-flow clone calibration.
11. Require Full P3 PASS, `imageAnchorCountBefore > 0`, unchanged image-anchor count and zero cleanup risk.
12. Select a preservation-sensitive real page and run calibration.
13. Require explicit preservation refusal / `NO_CANDIDATE`, not a guessed mutation.
14. Open `Developer: P6 Runtime Evidence` and require `P6 Closure acceptance: PASS`.
15. Export schema-v2 `p6-closure.json` to a stable regular non-symlink path.
16. From current `main`, run:

```bash
npm run runtime:closure-intake -- p6 /path/to/unpacked/<fresh-p6-artifact> /path/to/p6-closure.json --archive=/path/to/<fresh-p6-artifact>.zip
```

Omit `--archive` only when the original ZIP was not retained.

17. Require final-closure preflight PASS, exact evidence-byte intake, verified-byte same-artifact verifier exit `0`, and final `Runtime closure intake: PASS`.
18. Only then review/merge P6 and close issue #7.

P6 advanced production mutation remains disabled unless separately authorized by future safety work.

## Step 4 — rebuild P7 on merged P5, then collect closure

Do not use current artifact #490 as the final closure artifact after P5 lands.

1. Rebase/resolve `feat/p7-batch-queue-core` against merged P5/main.
2. Resolve shared P5 runtime/provenance conflicts deliberately.
3. Run the complete CI/provenance/offline-verifier/artifact pipeline.
4. Record the fresh P7 source SHA, CI run, artifact name and digest.
5. Register that fresh P7 artifact in current `main` with its exact source/workflow SHA, run ID/number, artifact digest, immutable file SHA-256 pins, schema-v3 id-excluded manifest semantic SHA-256, verifier filename/identity and `finalClosureEligible: true`.
6. Confirm current-main final-closure preflight accepts the fresh P7 artifact before using it for acceptance observations.
7. Keep that exact fresh P7 artifact loaded for prerequisite, stress and cancellation observations.
8. If local plugin-ID rebinding is needed, use that fresh artifact's helper with a separate non-nested sibling output directory.
9. Run its embedded P5 self-test and require the exact-build P5/P7 prerequisite receipt to be valid.
10. Execute a realistic queue containing at least 60 Frames/pages.
11. Require every queued item to reach a terminal state and `maxConcurrentProcessors === 1`.
12. Separately start work containing a genuinely long active Full P3 operation.
13. Request cancellation while that processor Frame is active.
14. Require cooperative settlement after the in-flight transaction, final batch state `CANCELLED`, and a recorded processor attempt matching the active Frame ID.
15. Open `Developer: P7 Runtime Evidence` and require final `Closure acceptance: PASS`.
16. Export schema-v2 `p7-closure.json` to a stable regular non-symlink path.
17. From current `main`, run:

```bash
npm run runtime:closure-intake -- p7 /path/to/unpacked/<fresh-p7-artifact> /path/to/p7-closure.json --archive=/path/to/<fresh-p7-artifact>.zip
```

Omit `--archive` only when the original ZIP was not retained.

18. Require final-closure preflight PASS, exact evidence-byte intake, verified-byte same-artifact verifier exit `0`, and final `Runtime closure intake: PASS`.
19. Only then review/merge P7 and close issue #8.

## Issue closure evidence

Only close:

- issue #6 after P5 artifact #488 real runtime, current-main `runtime:closure-intake` PASS, **and a fresh P5→current-main integration resolution with full CI PASS**;
- issue #7 after P5 is merged, P6 is rebuilt/registered on that line, fresh-build positive/refusal runtime evidence is retained, **and current-main P6 closure intake PASSes**;
- issue #8 after P5 is merged, P7 is rebuilt/registered on that line, fresh-build 60+ stress + active Full P3 cancellation evidence is retained, **and current-main P7 closure intake PASSes**.

Attach or retain each bounded evidence bundle, exact artifact/run identity, final closure-intake result, and applicable fresh integration proof when closing its issue. Never substitute synthetic CI evidence, a direct packaged-verifier run, stale integration proof, or another Plugin API runtime for the actual imported-Figma observation and hardened current-main boundaries.
