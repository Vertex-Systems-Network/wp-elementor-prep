# Next Actions

Last updated: 2026-09-10

## Mandatory order for every work cycle

1. **Issues first** — list open issues, solve actionable code/docs/test work, and identify genuine dependency/manual-runtime blockers.
2. **PR/MR second** — inspect CI, mergeability, conflicts, reviews and threads; merge only eligible work.
3. **Development third** — continue the highest-priority unblocked roadmap work.
4. **End-of-work sync** — run verification and synchronize README + memory-bank state before completion.

Never fabricate real Figma observations or closure evidence.

## Current repository queue

- Open product/runtime dependency chain: #6, #7, #8.
- P5 #6 engineering is complete and its current-main artifact/archive preflight has now been exercised against the actual canonical #488 package.
- P6 #7 and P7 #8 remain blocked on P5 merge and require fresh post-P5 integration artifacts before final runtime evidence.
- Canonical P5/P6/P7 feature heads and registered artifact bytes remain unchanged.
- Verified base before issue #75 documentation sync: `main` `c3c1c7475395785e3db5ed753513a645e7dd42c7` from PR #74; post-merge CI #614 + Integration Readiness #87 PASS.
- Overall active product progress remains `93%`.

## Newly completed P5 operator verification

The actual canonical GitHub Actions P5 artifact was downloaded again:

- artifact: `figma-plugin-dist-488`
- artifact ID: `10062772456`
- source head: `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`
- run ID / run number: `34242984963` / `488`
- retained ZIP SHA-256: `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`

Before execution, exact current-main source bytes were reconstructed from GitHub and Git-blob verified:

- `scripts/runtime-artifact-preflight.mjs`: `8d2d459b310ed2426f353ea91687d2a6d1dd6e09`
- `config/runtime-artifacts.json`: `de517b340cf951896fa3e312b40d9ddb4e86f944`
- `scripts/runtime-closure-intake.mjs`: `52bb19fead394579e1e89f09141bfbc6900f5cc3`

Verified outcomes:

- canonical #488 final-closure preflight: PASS;
- retained ZIP raw SHA-256: MATCH;
- BUILD_INFO exact source/workflow SHA + run ID/number: MATCH;
- immutable registry hashes: `5/5` MATCH;
- schema-v3 manifest semantic SHA-256: MATCH;
- sibling prepared calibration copy: byte-identical `code.js` / `ui.html`, manifest semantic SHA unchanged, current-main preflight PASS;
- exact closure intake with intentionally invalid `{}` evidence: artifact/archive/evidence plumbing reached the exact same-artifact verifier via `verified-bytes-memory-bootstrap`, and the verifier correctly rejected the missing runtime proof with exit `1`.

This is an operator/provenance calibration only. It does not satisfy real imported-Figma runtime acceptance.

Runtime artifact preflight requires a non-symlink artifact root, stable required-file descriptor identities, exact build identity, `5/5` immutable file pins and schema-v3 id-excluded manifest semantic SHA-256 equality; a retained original ZIP may additionally be bound with `--archive`.

## P5 — immediate critical path / issue #6

The first two operator checklist items are complete: canonical current-main preflight PASS and retained-ZIP digest MATCH.

### Next actual step

Prepare the canonical artifact with the **actual Figma development-plugin ID** using the helper inside #488 and a sibling/non-nested output directory:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-actual-figma-plugin-id> . ../figma-plugin-dist-488-local
```

Then import:

```text
../figma-plugin-dist-488-local/manifest.json
```

Do not use the calibration numeric ID as runtime evidence. The actual Figma development-plugin import is still required.

### Real Figma acceptance sequence

1. prepare sibling copy with the actual Figma development-plugin ID;
2. import the exact artifact-derived prepared copy into Figma Desktop;
3. run `Developer: P5 Runtime Self-Test`;
4. require `P5 Compiled Runtime Acceptance: PASS`;
5. collect real rendered-pixel forced-reject evidence;
6. prove restore and finalize behavior;
7. require checkpoint cleanup with `0` leftovers;
8. confirm stale proof from another artifact cannot unlock the current build;
9. export the provenance-bound closure JSON as `p5-evidence.json` to a stable regular non-symlink path.

### Final closure sequence

After real evidence exists:

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

The connected Figma `use_figma` capability executes Plugin API JavaScript in a known design file, but it does not demonstrate importing/running this exact downloaded development-plugin package with its own `manifest.json`, developer menu commands and packaged UI iframe. P5 acceptance is intentionally bound to that exact artifact/runtime condition, so no substitute proof should be minted from the connector.

## P6 — after P5 merge / issue #7

Current #494 is reference-only.

1. resolve/rebase P6 against merged P5/main;
2. run full CI;
3. produce a fresh exact-build P6 artifact;
4. register new source/run/digest, schema-v3 manifest semantic pin and immutable file hashes;
5. establish exact-build P5 prerequisite;
6. prepare a real Figma-ID sibling copy if required;
7. collect real image-bearing positive calibration with Full P3 PASS and unchanged image-anchor count;
8. collect preservation-sensitive refusal / `NO_CANDIDATE` evidence;
9. require combined P6 closure PASS;
10. run closure intake against the fresh exact artifact and merge/close #7.

## P7 — after P5 merge / issue #8

Current #490 is reference-only.

1. resolve/rebase P7 against merged P5/main;
2. run full CI;
3. produce a fresh exact-build P7 artifact;
4. register new source/run/digest, schema-v3 manifest semantic pin and immutable file hashes;
5. establish exact-build P5 prerequisite;
6. prepare a real Figma-ID sibling copy if required;
7. execute a realistic 60+ Frame batch and require every item terminal with `maxConcurrentProcessors === 1`;
8. request cancellation during a genuinely active long Full P3 operation;
9. require cooperative settlement + matching active processor evidence;
10. require final P7 closure PASS;
11. run closure intake against the fresh exact artifact and merge/close #8.

## Development allowed while P5 runtime is externally blocked

Only perform work that does not invalidate exact-build acceptance artifacts or violate dependency order:

- fail-closed repository/operator tooling when a concrete defect is identified;
- evidence/provenance verification that cannot mint runtime proof;
- non-mutating integration analysis;
- CI/status consistency fixes;
- documentation/runbook consistency work;
- tests for newly discovered repo-side defects.

Do not churn canonical P5/P6/P7 feature branches for documentation-only changes, and do not raise the 93% overall progress until a real product/runtime gate advances.
