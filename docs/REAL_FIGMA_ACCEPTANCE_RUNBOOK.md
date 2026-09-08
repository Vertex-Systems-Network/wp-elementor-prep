# Real Figma Acceptance Runbook

This runbook is the single operator path for closing P5, P6 and P7 runtime acceptance without weakening any safety gate.

## Rules

- Use one exact CI artifact per observation set.
- If the artifact contains placeholder Figma plugin ID `000000000000000000`, prepare a separate local import directory with the packaged helper; never edit compiled `code.js` or `ui.html`.
- Do not treat CI, local manifest rebinding or offline verification as Figma runtime proof.
- Keep the same imported artifact loaded while collecting evidence that must share an exact build identity.
- Do not manually edit exported evidence JSON.

## Step 1 — prepare the artifact

Latest verified acceptance artifacts at this checkpoint:

| Phase | Artifact | CI |
|---|---|---|
| P5 | `figma-plugin-dist-488` | #488 |
| P6 | `figma-plugin-dist-494` | #494 |
| P7 | `figma-plugin-dist-490` | #490 |

If the downloaded artifact uses the placeholder plugin ID, run inside the unpacked artifact directory:

```bash
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Import `dist-local/manifest.json`. Confirm `LOCAL_IMPORT_INFO.txt` reports unchanged compiled targets.

## Step 2 — P5 compiled runtime acceptance

1. Import the verified P5 artifact.
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

Do not unlock production Safe Fix if any item fails.

## Step 3 — P6 closure acceptance

Use the same exact P6 artifact for its prerequisite and both P6 observations.

1. Import the verified P6 artifact.
2. Run its embedded `Developer: P5 Runtime Self-Test`; require exact-build prerequisite PASS.
3. Select a real image-bearing page and run page-flow clone calibration.
4. Require Full P3 PASS, `imageAnchorCountBefore > 0`, unchanged image-anchor count and zero cleanup risk.
5. Select a preservation-sensitive real page and run calibration.
6. Require explicit preservation refusal / `NO_CANDIDATE`, not a guessed mutation.
7. Open `Developer: P6 Runtime Evidence`.
8. Require `P6 Closure acceptance: PASS`.
9. Export schema-v2 `p6-closure.json`.
10. From that same artifact run:

```bash
node verify-p6-closure.mjs < p6-closure.json
```

Exit code must be `0`. The schema-v2 verifier independently evaluates the embedded P5 evidence and both P6 scenarios.

P6 advanced production mutation remains disabled even after closure evidence succeeds.

## Step 4 — P7 closure acceptance

Keep one exact P7 artifact loaded for the prerequisite, stress run and cancellation run.

1. Import the verified P7 artifact.
2. Run its embedded P5 self-test and require the exact-build P5/P7 prerequisite receipt to be valid.
3. Execute a realistic queue containing at least 60 Frames/pages.
4. Require every queued item to reach a terminal state and `maxConcurrentProcessors === 1`.
5. Separately start work that contains a genuinely long active Full P3 operation.
6. Request cancellation while that processor Frame is active.
7. Require cooperative settlement after the in-flight transaction, final batch state `CANCELLED`, and a recorded processor attempt matching the active Frame ID.
8. Open `Developer: P7 Runtime Evidence`.
9. Require final `Closure acceptance: PASS`.
10. Export schema-v2 `p7-closure.json`.
11. From that same artifact run:

```bash
node verify-p7-closure.mjs < p7-closure.json
```

Exit code must be `0`. The verifier independently validates the raw P5 proof, exact-build receipt, stress evidence, cancellation evidence and final closure.

## Issue closure evidence

Only close:

- issue #6 after the P5 runtime + same-artifact offline verification above PASS;
- issue #7 after the P6 positive/refusal runtime observations + same-artifact offline verification PASS;
- issue #8 after the P7 60+ stress + active Full P3 cancellation observations + same-artifact offline verification PASS.

Attach or retain the exported bounded evidence bundle and exact artifact/run identity when closing each issue. Never substitute synthetic CI evidence for the actual imported-Figma observation.
