# Next Actions

Last updated: 2026-09-09

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

- Open issues: #6, #7, #8.
- #6 tracker includes the mandatory main-side hash-pinned preflight before real Figma acceptance.
- #7/#8 tracker bodies explicitly require fresh post-P5 builds for final closure.
- Open PR/MR: `0` before final status-doc sync commits.
- PR #42 immutable artifact hash hardening merged at `92a4440`.
- Post-merge CI #530: PASS.
- Post-merge Integration Readiness #22: PASS.

## P5 — first release gate / issue #6

1. Unpack canonical `figma-plugin-dist-488` from P5 head `810d98d` / CI #488.
2. From current `main`, run the fail-closed registry check:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

3. Require:
   - preflight PASS,
   - exact source SHA / run ID / run number,
   - `5/5` immutable SHA-256 pins matched for `BUILD_INFO.txt`, `code.js`, `ui.html`, packaged import helper and `verify-p5-evidence.mjs`.
4. If the artifact still has placeholder plugin ID, use the **packaged artifact helper**:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

5. Import `dist-local/manifest.json` (or the original manifest if already rebound) in Figma Desktop.
6. Run `Developer: P5 Runtime Self-Test`.
7. Require `P5 Compiled Runtime Acceptance: PASS`.
8. Verify real rendered-pixel forced reject, restore and finalize flows.
9. Require checkpoint cleanup with `0` leftovers.
10. Export `p5-evidence.json`.
11. From the **same unpacked artifact** run:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
```

12. Require exit code `0`.
13. Apply the already proven documentation integration resolution, merge P5, and close #6.

Hash-pinned preflight, CI and synthetic evidence do not replace real Figma observations.

## P6 — after P5 merge / issue #7

Current #494 is reference-only. `runtime:preflight` must reject it for `final-closure` intent.

1. Resolve/rebase P6 against merged P5.
2. Run full CI.
3. Produce a fresh exact-build P6 artifact.
4. Update `config/runtime-artifacts.json` with the fresh exact build, ZIP digest and immutable SHA-256 file pins; mark only that resulting build final-closure eligible when dependency conditions are satisfied.
5. Run preflight on the fresh artifact and require exact identity + immutable pins PASS.
6. Establish exact-build P5 prerequisite in that fresh build.
7. Run a real image-bearing positive calibration and require Full P3 PASS with unchanged image-anchor count.
8. Run a preservation-sensitive refusal case and require `NO_CANDIDATE` / refusal PASS.
9. Require final P6 closure PASS.
10. Export schema-v2 closure and pass `verify-p6-closure.mjs` from the same artifact.
11. Merge and close #7.

## P7 — after P5 merge / issue #8

Current #490 is reference-only. `runtime:preflight` must reject it for `final-closure` intent.

1. Resolve/rebase P7 against merged P5.
2. Run full CI.
3. Produce a fresh exact-build P7 artifact.
4. Update `config/runtime-artifacts.json` with the fresh exact build, ZIP digest and immutable SHA-256 file pins; mark only that resulting build final-closure eligible when dependency conditions are satisfied.
5. Run preflight on the fresh artifact and require exact identity + immutable pins PASS.
6. Establish exact-build P5 prerequisite.
7. Run a realistic 60+ Frame stress batch and require `maxConcurrentProcessors === 1`.
8. Request cancellation during a genuinely active long Full P3 operation.
9. Require cooperative settlement, final batch `CANCELLED`, and matching processor evidence.
10. Require final P7 closure PASS.
11. Export schema-v2 closure and pass `verify-p7-closure.mjs` from the same artifact.
12. Merge and close #8.

## Development that may proceed while runtime is externally blocked

Only perform work that does **not** invalidate exact-build acceptance artifacts or violate dependency order, such as:

- repository/process hardening on `main`,
- fail-closed operator tooling around immutable artifacts,
- non-mutating integration analysis,
- documentation/runbook consistency fixes,
- CI/tooling improvements,
- stale memory-bank synchronization,
- tests for newly discovered code-side defects on isolated branches.

Do not churn the canonical P5/P6/P7 feature branches for docs-only changes.
