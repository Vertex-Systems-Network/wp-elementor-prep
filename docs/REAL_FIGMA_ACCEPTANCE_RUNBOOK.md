# Real Figma Acceptance Runbook

This runbook is the single operator path for closing P5, P6 and P7 runtime acceptance without weakening exact-build safety gates.

## Rules

- Use one exact CI artifact per observation set.
- If an artifact contains placeholder Figma plugin ID `000000000000000000`, prepare a separate local import directory with the packaged helper; never edit compiled `code.js` or `ui.html`.
- The local import output must be **separate and non-nested** relative to the unpacked source artifact. Never place the prepared output inside the source artifact directory.
- Do not treat CI, local manifest rebinding or offline verification as Figma runtime proof.
- Keep the same imported artifact loaded while collecting evidence that must share an exact build identity.
- Do not manually edit exported evidence JSON.
- Do not collect final P6/P7 closure evidence before their post-P5 integration build exists. Integration probes #35/#36 proved both branches require conflict resolution against the latest P5 line.

## Dependency order

1. Close P5 runtime acceptance first on canonical P5 artifact #488.
2. Merge P5 into `main` using the already validated documentation-only integration resolution.
3. Rebase/resolve P6 and P7 against merged P5 and produce fresh verified exact-build artifacts.
4. Collect P6/P7 real-Figma closure only from those resulting artifacts.

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

## Step 1 — P5 compiled runtime acceptance

Use `figma-plugin-dist-488` / CI #488.

1. Import the verified P5 artifact using the sibling prepared directory above when plugin-ID rebinding is required.
2. Run `Developer: P5 Runtime Self-Test`.
3. Require `P5 Compiled Runtime Acceptance: PASS`.
4. Confirm real rendered-pixel evidence exists for:
   - forced rejection;
   - commit → restore;
   - commit → finalize.
5. Require checkpoint cleanup and `0` leftovers.
6. Copy/export the P5 evidence JSON.
7. From the same unpacked artifact run:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
```

Exit code must be `0`. The verifier recomputes canonical acceptance, exact-artifact build identity and proof chronology.

Do not unlock or merge P5 if any item fails.

## Step 2 — land P5 before P6/P7 closure

After Step 1 passes:

1. Integrate canonical P5 into the current `main` line.
2. Preserve the current main README/runbook documentation when resolving the known docs-only P5/main conflict.
3. Run full PR CI and require PASS before merge.
4. Merge P5 and close issue #6 only after the exact-build evidence from Step 1 is retained.

Integration proof #37 already demonstrated that the current documentation resolution is mergeable and passes CI (#500) without changing P5 runtime code. That proof does not replace Step 1 runtime acceptance.

## Step 3 — rebuild P6 on merged P5, then collect closure

Do not use current artifact #494 as the final closure artifact after P5 lands.

1. Rebase/resolve `feat/p6-advanced-structures` against merged P5/main.
2. Resolve shared P5 runtime/provenance conflicts deliberately; do not blindly prefer either side.
3. Run install, typecheck, tests, build, provenance checks, offline-verifier checks and artifact packaging.
4. Record the fresh P6 source SHA, CI run, artifact name and digest.
5. Keep that exact fresh P6 artifact loaded for its prerequisite and both P6 observations.
6. If local plugin-ID rebinding is needed, use that fresh artifact's helper with a separate non-nested sibling output directory.
7. Run its embedded `Developer: P5 Runtime Self-Test`; require exact-build prerequisite PASS.
8. Select a real image-bearing page and run page-flow clone calibration.
9. Require Full P3 PASS, `imageAnchorCountBefore > 0`, unchanged image-anchor count and zero cleanup risk.
10. Select a preservation-sensitive real page and run calibration.
11. Require explicit preservation refusal / `NO_CANDIDATE`, not a guessed mutation.
12. Open `Developer: P6 Runtime Evidence` and require `P6 Closure acceptance: PASS`.
13. Export schema-v2 `p6-closure.json`.
14. From that same fresh artifact run:

```bash
node verify-p6-closure.mjs < p6-closure.json
```

Exit code must be `0`. Only then review/merge P6 and close issue #7.

P6 advanced production mutation remains disabled unless separately authorized by future safety work.

## Step 4 — rebuild P7 on merged P5, then collect closure

Do not use current artifact #490 as the final closure artifact after P5 lands.

1. Rebase/resolve `feat/p7-batch-queue-core` against merged P5/main.
2. Resolve shared P5 runtime/provenance conflicts deliberately.
3. Run the complete CI/provenance/offline-verifier/artifact pipeline.
4. Record the fresh P7 source SHA, CI run, artifact name and digest.
5. Keep that exact fresh P7 artifact loaded for prerequisite, stress and cancellation observations.
6. If local plugin-ID rebinding is needed, use that fresh artifact's helper with a separate non-nested sibling output directory.
7. Run its embedded P5 self-test and require the exact-build P5/P7 prerequisite receipt to be valid.
8. Execute a realistic queue containing at least 60 Frames/pages.
9. Require every queued item to reach a terminal state and `maxConcurrentProcessors === 1`.
10. Separately start work containing a genuinely long active Full P3 operation.
11. Request cancellation while that processor Frame is active.
12. Require cooperative settlement after the in-flight transaction, final batch state `CANCELLED`, and a recorded processor attempt matching the active Frame ID.
13. Open `Developer: P7 Runtime Evidence` and require final `Closure acceptance: PASS`.
14. Export schema-v2 `p7-closure.json`.
15. From that same fresh artifact run:

```bash
node verify-p7-closure.mjs < p7-closure.json
```

Exit code must be `0`. Only then review/merge P7 and close issue #8.

## Issue closure evidence

Only close:

- issue #6 after P5 artifact #488 real runtime + same-artifact offline verification PASS;
- issue #7 after P5 is merged, P6 is rebuilt on that line, and fresh-build P6 positive/refusal runtime + same-artifact verification PASS;
- issue #8 after P5 is merged, P7 is rebuilt on that line, and fresh-build P7 60+ stress + active Full P3 cancellation + same-artifact verification PASS.

Attach or retain each bounded evidence bundle and exact artifact/run identity when closing its issue. Never substitute synthetic CI evidence for the actual imported-Figma observation.
