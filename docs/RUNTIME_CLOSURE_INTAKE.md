# Runtime Closure Intake

Use this command **after** real Figma runtime evidence has been exported. It combines the repository-side final-closure artifact preflight with the verifier shipped inside that exact artifact.

It does **not** create evidence, run Figma, or replace real imported-Figma observations.

## Command

For P5 issue #6:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json
```

Machine-readable result:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json --json
```

A successful intake exits `0` only when all stages pass.

## Gate order

The intake is intentionally fail-closed and runs in this order:

1. **Final-closure artifact preflight**
   - registered source SHA / Actions run identity must match;
   - required artifact files must exist;
   - all immutable SHA-256 pins must match;
   - manifest targets, required developer commands and offline network policy must pass;
   - the registered artifact must be eligible for `final-closure`.
2. **Evidence file intake**
   - path must be a regular non-empty file;
   - default maximum size is 5 MiB;
   - content must be valid JSON with a top-level object;
   - SHA-256 of the evidence bytes is recorded in the result.
3. **Same-artifact verifier**
   - only after stages 1 and 2 pass, Node executes the verifier named by the registered artifact;
   - verifier execution uses the exact hash-pinned verifier file inside that unpacked artifact;
   - evidence JSON is sent through stdin without shell interpolation;
   - default verifier timeout is 30 seconds;
   - exit code must be exactly `0`.

If preflight or evidence intake fails, the verifier is not executed.

## Current track behavior

- P5 #488 is currently registered as final-closure eligible, so it can reach the verifier stage when its artifact integrity passes.
- P6 #494 and P7 #490 are reference-only builds. `runtime:closure-intake` must fail at preflight for them until fresh post-P5 final-closure artifacts are registered.

## P5 closure sequence

1. unpack `figma-plugin-dist-488`;
2. optionally run `runtime:preflight` before import;
3. if needed, rebind only the manifest plugin ID with the helper packaged in the artifact;
4. import the artifact into Figma Desktop;
5. run `Developer: P5 Runtime Self-Test` and require `P5 Compiled Runtime Acceptance: PASS`;
6. collect real rendered-pixel forced-reject, restore, finalize and cleanup evidence;
7. export `p5-evidence.json`;
8. run `runtime:closure-intake` with the exact artifact directory and exported evidence;
9. require `Runtime closure intake: PASS` / exit `0`;
10. only then proceed to P5 integration/merge and issue #6 closure.

## Safety properties

- No verifier process is started when artifact integrity/final-closure eligibility fails.
- No verifier process is started for malformed, empty, non-file or oversized evidence input.
- The verifier path comes from the registered exact artifact and its bytes are already SHA-256 pinned by preflight.
- The verifier is launched directly with `process.execPath`; no shell command is constructed from user paths or evidence.
- Evidence SHA-256 is included in the intake result for operator traceability.
- A PASS means only that the supplied evidence was accepted by the exact registered artifact/verifier chain. It does not prove that evidence was collected from Figma unless the artifact verifier's own evidence semantics establish that requirement.

The canonical real-runtime acceptance procedure remains `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md`.
