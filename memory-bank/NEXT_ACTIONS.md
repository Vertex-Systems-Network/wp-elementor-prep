# Next Actions

Last updated: 2026-09-08

## Mandatory order for every work cycle

Execute in this order before starting unrelated new implementation:

1. **Issues first**
   - list all open issues,
   - solve actionable code/docs/test issues,
   - identify dependency/manual-runtime blockers,
   - update/close only after real acceptance criteria pass.
2. **PR/MR second**
   - list all open PR/MR,
   - inspect CI, mergeability, conflicts and reviews,
   - fix safely actionable problems,
   - merge eligible work.
3. **Development third**
   - continue the highest-priority unblocked roadmap task.
4. **End-of-work sync**
   - run verification,
   - update memory-bank,
   - update README issue/PR status,
   - update module-wise progress percentages/bars and overall progress.

## Current repository queue

At the latest sweep:

- Open issues: #6, #7, #8.
- Open PR/MR: 0 before the AI-native policy-sync branch was created.
- No additional actionable code-defect issue was found.

## P5 — first release gate / issue #6

1. Use canonical `figma-plugin-dist-488` from P5 head `810d98d`.
2. If needed, prepare the local manifest without changing compiled code/UI.
3. Import the exact build in Figma Desktop.
4. Run `Developer: P5 Runtime Self-Test`.
5. Require `P5 Compiled Runtime Acceptance: PASS`.
6. Verify real rendered-pixel forced reject, restore and finalize flows.
7. Require checkpoint cleanup with `0` leftovers.
8. Export `p5-evidence.json`.
9. From the same unpacked artifact run:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
```

10. Require exit code `0`.
11. Apply the already proven documentation integration resolution, merge P5, and close #6.

Do not replace real Figma observations with CI/synthetic evidence.

## P6 — after P5 merge / issue #7

1. Resolve/rebase P6 against merged P5.
2. Run full CI.
3. Produce a fresh exact-build P6 artifact.
4. Establish exact-build P5 prerequisite in that fresh build.
5. Run a real image-bearing positive calibration and require Full P3 PASS with unchanged image-anchor count.
6. Run a preservation-sensitive refusal case and require `NO_CANDIDATE` / refusal PASS.
7. Require final P6 closure PASS.
8. Export schema-v2 closure and pass `verify-p6-closure.mjs` from the same artifact.
9. Merge and close #7.

## P7 — after P5 merge / issue #8

1. Resolve/rebase P7 against merged P5.
2. Run full CI.
3. Produce a fresh exact-build P7 artifact.
4. Establish exact-build P5 prerequisite.
5. Run a realistic 60+ Frame stress batch and require `maxConcurrentProcessors === 1`.
6. Request cancellation during a genuinely active long Full P3 operation.
7. Require cooperative settlement, final batch `CANCELLED`, and matching processor evidence.
8. Require final P7 closure PASS.
9. Export schema-v2 closure and pass `verify-p7-closure.mjs` from the same artifact.
10. Merge and close #8.

## Development that may proceed while runtime is externally blocked

Only perform work that does **not** invalidate exact-build acceptance artifacts or violate dependency order, such as:

- repository/process hardening on `main`,
- non-mutating integration analysis,
- documentation/runbook consistency fixes,
- CI/tooling improvements,
- stale memory-bank synchronization,
- tests for newly discovered code-side defects on isolated branches.

Do not churn the canonical P5/P6/P7 feature branches for docs-only changes.
