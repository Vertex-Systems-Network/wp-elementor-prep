# Next Actions

Last updated: 2026-09-10

## Mandatory order for every work cycle

1. **Issues first** — list open issues, solve actionable code/docs/test work, and identify genuine dependency/manual-runtime blockers.
2. **PR/MR second** — inspect CI, mergeability, conflicts, reviews and threads; merge only eligible work.
3. **Development third** — continue the highest-priority unblocked roadmap work.
4. **End-of-work sync** — run verification and synchronize README + memory-bank state before completion.

Never fabricate real Figma observations or closure evidence.

## Current repository queue

- Latest verified `main` before issue #77 work: `32a8710411ed62d960c5eb4d0170fea1a7300466` from PR #76.
- PR #76 post-merge CI #616 and Integration Readiness #89 passed.
- Open product/runtime dependency chain remains #6 → #7/#8.
- Issue #77 is a repo-side operator-contract fix only: canonical real-Figma runbook was stale because it still allowed a direct packaged verifier to appear as the final closure boundary.
- P5 #6 engineering is complete and its current-main artifact/archive preflight has been exercised against the actual canonical #488 package.
- P6 #7 and P7 #8 remain blocked on P5 merge and require fresh post-P5 integration artifacts before final runtime evidence.
- Canonical P5/P6/P7 feature heads and registered artifact bytes remain unchanged.
- Overall active product progress remains `93%`.

## Runbook closure contract — issue #77

The canonical operator rule is now explicit:

- real Figma runtime observations are collected first from the exact imported artifact;
- exported evidence must be retained as a stable regular non-symlink file;
- final authorization is **current-main `runtime:closure-intake` PASS**, not a direct `node verify-*.mjs` invocation;
- direct packaged-verifier execution may be used only as an optional local diagnostic and cannot authorize merge/issue closure;
- fresh post-P5 P6/P7 artifacts must be registered in current `main` as final-closure eligible with exact source/run/digest, immutable file hashes, schema-v3 manifest semantic SHA and verifier identity before their final runtime observations are accepted;
- current-main closure intake must then PASS for P5, P6 or P7 before the corresponding issue can close.

A dedicated regression test (`tests/real-figma-runbook-contract.test.mjs`) pins this contract and the sibling/non-nested import rule.

## Completed P5 operator verification

Canonical P5 runtime artifact:

- artifact: `figma-plugin-dist-488`
- artifact ID: `10062772456`
- source head: `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`
- run ID / run number: `34242984963` / `488`
- retained ZIP SHA-256: `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`

Verified current-main operator outcomes:

- canonical #488 final-closure preflight: PASS;
- retained ZIP raw SHA-256: MATCH;
- BUILD_INFO exact source/workflow SHA + run ID/number: MATCH;
- immutable registry hashes: `5/5` MATCH;
- schema-v3 manifest semantic SHA-256: MATCH;
- sibling prepared calibration copy: byte-identical `code.js` / `ui.html`, manifest semantic SHA unchanged, preflight PASS;
- exact closure intake with intentionally invalid `{}` evidence reached the exact same-artifact verifier via `verified-bytes-memory-bootstrap` and correctly rejected the missing runtime proof with exit `1`.

This proves operator/provenance plumbing only. It does not satisfy real imported-Figma runtime acceptance.

Runtime artifact preflight requires a non-symlink artifact root, stable required-file descriptor identities, exact build identity, `5/5` immutable file pins and schema-v3 id-excluded manifest semantic SHA-256 equality; a retained original ZIP may additionally be bound with `--archive`.

## P5 — immediate critical path / issue #6

The canonical current-main preflight and retained-ZIP digest checks are complete.

### Next actual step

Prepare canonical #488 with the **actual Figma development-plugin ID** using the helper packaged inside #488 and a sibling/non-nested output directory:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-actual-figma-plugin-id> . ../figma-plugin-dist-488-local
```

Then import:

```text
../figma-plugin-dist-488-local/manifest.json
```

Do not use the calibration numeric ID as runtime evidence.

### Real Figma acceptance sequence

1. prepare sibling copy with the actual Figma development-plugin ID;
2. import the exact artifact-derived prepared copy into Figma Desktop;
3. run `Developer: P5 Runtime Self-Test`;
4. require `P5 Compiled Runtime Acceptance: PASS`;
5. collect real rendered-pixel forced-reject evidence;
6. prove restore and finalize behavior;
7. require checkpoint cleanup with `0` leftovers;
8. confirm stale proof from another artifact cannot unlock the current build;
9. export provenance-bound `p5-evidence.json` to a stable regular non-symlink path.

### Final P5 closure sequence

After real evidence exists, from current `main` run:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json --archive=/path/to/figma-plugin-dist-488.zip
```

Require:

- final-closure preflight PASS;
- retained archive digest MATCH when supplied;
- exact raw evidence SHA-256;
- strict UTF-8 + top-level JSON object acceptance;
- exact immutable verifier SHA revalidation;
- `executionMode: verified-bytes-memory-bootstrap`;
- same-artifact verifier exit `0`;
- final `Runtime closure intake: PASS`.

Only then apply the already proven P5 documentation-side integration resolution, merge P5 and close #6.

## Why the connected Figma API is not a substitute

The connected Figma `use_figma` capability executes Plugin API JavaScript in a known design file, but it does not demonstrate importing/running this exact downloaded development-plugin package with its own `manifest.json`, developer menu commands and packaged UI iframe. P5 acceptance is intentionally bound to that exact artifact/runtime condition.

## P6 — after P5 merge / issue #7

Current #494 is reference-only.

1. resolve/rebase P6 against merged P5/main;
2. run full CI;
3. produce a fresh exact-build P6 artifact;
4. register exact source/workflow SHA, run ID/number, digest, schema-v3 manifest semantic pin, immutable file hashes and verifier identity with `finalClosureEligible: true`;
5. require current-main final-closure preflight PASS on that fresh artifact;
6. establish exact-build P5 prerequisite in the imported fresh P6 build;
7. collect real image-bearing positive calibration with Full P3 PASS and unchanged image-anchor count;
8. collect preservation-sensitive refusal / `NO_CANDIDATE` evidence;
9. require combined P6 runtime closure acceptance PASS;
10. export stable `p6-closure.json`;
11. require current-main `runtime:closure-intake -- p6 ...` PASS;
12. merge/close #7.

## P7 — after P5 merge / issue #8

Current #490 is reference-only.

1. resolve/rebase P7 against merged P5/main;
2. run full CI;
3. produce a fresh exact-build P7 artifact;
4. register exact source/workflow SHA, run ID/number, digest, schema-v3 manifest semantic pin, immutable file hashes and verifier identity with `finalClosureEligible: true`;
5. require current-main final-closure preflight PASS on that fresh artifact;
6. establish exact-build P5 prerequisite in the imported fresh P7 build;
7. execute a realistic 60+ Frame batch and require every item terminal with `maxConcurrentProcessors === 1`;
8. request cancellation during a genuinely active long Full P3 operation;
9. require cooperative settlement + matching active processor evidence;
10. require final P7 runtime closure acceptance PASS;
11. export stable `p7-closure.json`;
12. require current-main `runtime:closure-intake -- p7 ...` PASS;
13. merge/close #8.

## Development allowed while P5 runtime is externally blocked

Only perform work that does not invalidate exact-build acceptance artifacts or violate dependency order:

- fail-closed repository/operator tooling when a concrete defect is identified;
- evidence/provenance verification that cannot mint runtime proof;
- non-mutating integration analysis;
- CI/status consistency fixes;
- documentation/runbook consistency work;
- tests for newly discovered repo-side defects.

Do not churn canonical P5/P6/P7 feature branches for documentation-only changes, and do not raise the 93% overall progress until a real product/runtime gate advances.
