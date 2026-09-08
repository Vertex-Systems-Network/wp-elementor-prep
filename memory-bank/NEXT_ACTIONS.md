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
- #6 is blocked only on real imported-Figma runtime evidence.
- #7/#8 require P5 merge before integration/fresh runtime artifacts.
- Open PR/MR: `0` after PR #43 merge.
- PR #43 final head `2ea96d2`: CI #540 PASS + Integration Readiness #30 PASS.
- PR #43 merged to `main` at `7d9f22b`.
- Post-merge CI #541 PASS + Integration Readiness #31 PASS.
- Canonical P5/P6/P7 feature heads remain unchanged.

## P5 — first release gate / issue #6

1. Unpack canonical `figma-plugin-dist-488` from P5 head `810d98d` / CI #488.
2. Run the hash-pinned preflight:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

3. Require:
   - preflight PASS,
   - exact source SHA / run ID / run number,
   - `5/5` immutable SHA-256 pins matched.
4. If the artifact still has placeholder plugin ID, use the helper packaged **inside that same artifact**:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

5. Import `dist-local/manifest.json` (or original manifest if already rebound) in Figma Desktop.
6. Run `Developer: P5 Runtime Self-Test`.
7. Require `P5 Compiled Runtime Acceptance: PASS`.
8. Verify real rendered-pixel forced reject, restore and finalize flows.
9. Require checkpoint cleanup with `0` leftovers.
10. Export real closure JSON as `p5-evidence.json`.
11. From current `main`, run one-command closure intake:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json
```

12. Require:
   - artifact preflight PASS,
   - evidence JSON accepted for intake,
   - evidence SHA-256 emitted,
   - exact same-artifact verifier executed,
   - verifier exit `0`,
   - final `Runtime closure intake: PASS`.
13. Apply the proven documentation integration resolution, merge P5 and close #6.

Preflight/closure intake/CI cannot create runtime proof. The evidence must still come from the actual imported Figma Desktop runtime.

## P6 — after P5 merge / issue #7

Current #494 is reference-only. Both `runtime:preflight` final-closure mode and `runtime:closure-intake` must reject it before verifier execution.

1. Resolve/rebase P6 against merged P5.
2. Run full CI.
3. Produce a fresh exact-build P6 artifact.
4. Update `config/runtime-artifacts.json` with fresh identity, ZIP digest and immutable SHA-256 file pins; mark that fresh build final-closure eligible only when dependency conditions are satisfied.
5. Run preflight and require exact identity + immutable pins PASS.
6. Establish exact-build P5 prerequisite in that fresh build.
7. Run real image-bearing positive calibration and require Full P3 PASS with unchanged image-anchor count.
8. Run preservation-sensitive refusal and require `NO_CANDIDATE` / refusal PASS.
9. Require final P6 closure PASS in the plugin.
10. Export `p6-closure.json`.
11. Run `runtime:closure-intake` against the fresh P6 artifact and require PASS.
12. Merge and close #7.

## P7 — after P5 merge / issue #8

Current #490 is reference-only. Both `runtime:preflight` final-closure mode and `runtime:closure-intake` must reject it before verifier execution.

1. Resolve/rebase P7 against merged P5.
2. Run full CI.
3. Produce a fresh exact-build P7 artifact.
4. Update `config/runtime-artifacts.json` with fresh identity, ZIP digest and immutable SHA-256 file pins; mark that fresh build final-closure eligible only when dependency conditions are satisfied.
5. Run preflight and require exact identity + immutable pins PASS.
6. Establish exact-build P5 prerequisite.
7. Run realistic 60+ Frame stress and require `maxConcurrentProcessors === 1`.
8. Request cancellation during genuinely active long Full P3.
9. Require cooperative settlement, final batch `CANCELLED`, and matching processor evidence.
10. Require final P7 closure PASS in the plugin.
11. Export `p7-closure.json`.
12. Run `runtime:closure-intake` against the fresh P7 artifact and require PASS.
13. Merge and close #8.

## Development that may proceed while runtime is externally blocked

Only perform work that does **not** invalidate exact-build acceptance artifacts or violate dependency order, such as:

- repository/process hardening on `main`,
- fail-closed operator tooling around immutable artifacts,
- evidence intake/verification orchestration that does not mint evidence,
- non-mutating integration analysis,
- documentation/runbook consistency fixes,
- CI/tooling improvements,
- stale memory-bank synchronization,
- tests for newly discovered code-side defects on isolated branches.

Do not churn the canonical P5/P6/P7 feature branches for docs-only changes.
