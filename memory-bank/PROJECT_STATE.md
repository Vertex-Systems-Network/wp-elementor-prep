# Project State

Last updated: 2026-09-10

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and safely prepares approved desktop Figma layouts for structures that map cleanly to WordPress Elementor.

Core runtime does not require generative AI, external inference, or network access.

## Mandatory execution order

Every work cycle follows:

1. open Issues first,
2. open PR/MR second,
3. highest-priority unblocked development third,
4. verification + memory-bank + README progress synchronization before completion.

See `docs/AI_NATIVE_PLAN.md`, `AGENTS.md`, and decision D-012.

## Current release state

**P0–P4 are complete. P5/P6/P7 engineering is implemented and verified on canonical feature heads. The active release gate is still the real imported-Figma P5 runtime acceptance for issue #6. Current-main preflight and retained-ZIP verification against canonical #488 are complete. After real P5 evidence + closure-intake PASS, P5 also requires a fresh resolution against the then-current `main` because latest Integration Readiness #90 reports P5 → current main as `CODE_CONFLICT`, not docs-only. P6/P7 final closure can start only after that P5 integration lands.**

Overall active project progress remains `93%`. Tooling, documentation and offline calibration do not advance that percentage unless a real product/runtime gate advances.

## Repository status

- Latest verified base before issue #80 work: `main` `698940369635b6f40972e6404e7e7ff71b57ea14` from PR #79.
- PR #79 post-merge CI #618 and Integration Readiness #90 passed.
- Open product/runtime dependency chain is #6, #7 and #8; issue #80 is a temporary repo-side integration-contract correction.
- Canonical P5/P6/P7 feature heads and registered artifact bytes remain unchanged by main-side tooling/documentation work.
- Current P5 canonical artifact #488 has passed actual-artifact current-main final-closure preflight with its retained ZIP.
- Exact preflight source Git blob used for the canonical calibration: `8d2d459b310ed2426f353ea91687d2a6d1dd6e09`.
- Exact registry Git blob used for that calibration: `de517b340cf951896fa3e312b40d9ddb4e86f944`.
- Exact closure-intake Git blob used for that calibration: `52bb19fead394579e1e89f09141bfbc6900f5cc3`.
- Canonical #488 preflight result: exact BUILD_INFO identity MATCH, raw ZIP digest MATCH, `5/5` immutable file hashes MATCH, schema-v3 manifest semantic hash MATCH.
- A sibling prepared calibration copy kept compiled code/UI byte-identical and passed the same preflight. It used a calibration numeric ID, not the actual Figma development-plugin ID.
- Exact closure intake was exercised with intentionally invalid `{}` evidence on canonical and prepared copies. It reached the exact P5 verifier through `verified-bytes-memory-bootstrap` and correctly failed closed at verifier exit `1` because no real runtime proof was present.
- The connected Figma canvas API does not substitute for importing/running this exact downloaded development-plugin artifact with its own manifest/menu/UI iframe, so no real Figma acceptance was claimed.
- Latest Integration Readiness #90 on current main reports P5 → main `CODE_CONFLICT` across `.github/workflows/ci.yml`, `scripts/prepare-figma-import.mjs`, README and memory-bank files.
- The helper conflict is materially safety-relevant: current main contains the source/output overlap guard while canonical P5 predates it. Therefore historical integration proof #37 / CI #500 is superseded for merge authorization.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep Issues → PR/MR → development lifecycle, status docs and artifact registry synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | RUNTIME ACCEPTANCE | 94% | Actual Figma-ID sibling prep → exact prepared artifact import → runtime/rendered-pixel evidence → real closure intake PASS → fresh current-main integration resolution + full CI → merge #6 |
| P6 advanced structures | INTEGRATION BLOCKED | 80% | P5 merge → resolve conflicts → fresh exact-build artifact/provenance → runtime closure #7 |
| P7 batch queue | INTEGRATION BLOCKED | 80% | P5 merge → resolve conflicts → fresh exact-build artifact/provenance → 60+ stress/cancel closure #8 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate only after normalization line is stable |

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3.

For every registered track it records exact build identity, Actions artifact digest, closure eligibility, immutable file SHA-256 pins, required runtime commands, and an id-excluded manifest semantic SHA-256.

Manifest semantic hashing removes only top-level `manifest.id`, recursively sorts object keys, preserves array order/content, and hashes canonical JSON. This permits the supported local Figma development-plugin ID rebind while rejecting every other manifest semantic drift.

### P5 — final-closure eligible

- Branch: `feat/p5-safe-recipes`
- Head: `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`
- CI: #488 PASS, run ID `34242984963`
- Artifact: `figma-plugin-dist-488`, artifact ID `10062772456`
- ZIP digest: `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`
- Manifest semantic SHA-256: `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`
- Immutable pins: `5/5` verified against the actual downloaded package.
- Current main-side preflight/archive gate: COMPLETE.
- Remaining: actual Figma development-plugin ID prep/import, real runtime acceptance, rendered-pixel evidence, real closure-intake PASS, then fresh P5→current-main integration resolution + CI.

### P6 — reference only

- Branch: `feat/p6-advanced-structures`
- Head: `9a6ae3b29e2f70ebbd987a686856c2957f590b75`
- CI/artifact: #494 / `figma-plugin-dist-494`
- ZIP digest: `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3`
- Manifest semantic SHA-256: `b687205564abb72ac7b00447d2bec3e00c266a1d4ddf9ec6980ce15c62c893f9`
- Final closure requires P5 merge, conflict resolution and a fresh exact-build artifact.

### P7 — reference only

- Branch: `feat/p7-batch-queue-core`
- Head: `cbfdb66db531da8613582c84523265e42dad63a2`
- CI/artifact: #490 / `figma-plugin-dist-490`
- Exact run ID: `34243303097`
- ZIP digest: `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43`
- Manifest semantic SHA-256: `3cb617c2d47d8b3d887ca94897781998226f9ec6c1b242bc880a2e18d9f6587e`
- Final closure requires P5 merge, conflict resolution and a fresh exact-build artifact.

## Main-side operator tooling state

Current main-side tooling provides:

- non-symlink artifact-root / required-file / evidence / optional archive validation,
- stable descriptor identity checks,
- exact BUILD_INFO + immutable file hash verification,
- schema-v3 id-excluded manifest semantic verification,
- optional retained Actions ZIP raw digest verification,
- safe sibling/non-nested local import preparation,
- strict evidence intake,
- post-preflight verifier revalidation,
- verified-byte in-memory verifier execution.

The exact canonical P5 operator path has been exercised through preflight and fail-closed invalid-evidence verification. These gates validate provenance and supplied evidence; they cannot create real Figma observations.

## Integration readiness

Latest verified snapshot: Integration Readiness #90 on `main` `698940369635b6f40972e6404e7e7ff71b57ea14`.

- P5 → current `main`: `CODE_CONFLICT`. Conflicts include `.github/workflows/ci.yml`, `scripts/prepare-figma-import.mjs`, README and memory-bank files. A fresh integration resolution is mandatory after real P5 acceptance; preserve current-main helper overlap safety and CI/status/tooling hardening while integrating P5 runtime code deliberately.
- P6 → latest P5: `CODE_CONFLICT`; resolve only after P5 merge and then rebuild a fresh exact artifact.
- P7 → latest P5: `CODE_CONFLICT`; resolve only after P5 merge and then rebuild a fresh exact artifact.

Do not mutate canonical P5/P6/P7 exact-build branches for docs/tooling churn, and do not use historical integration proof #37 / CI #500 as authorization to merge P5 into a newer main.

## Current blockers and remaining development

### Issue #6 — P5

Completed main-side steps:
- actual canonical #488 current-main preflight PASS,
- retained ZIP raw digest MATCH,
- exact build identity / `5/5` immutable hashes / manifest semantic pin MATCH,
- sibling-copy byte-preservation calibration,
- exact closure-intake fail-closed rejection calibration.

Still required from the actual Figma Desktop development-plugin runtime and final integration:
1. prepare sibling copy using the actual Figma development-plugin ID;
2. import the exact artifact-derived prepared manifest;
3. run `Developer: P5 Runtime Self-Test`;
4. require `P5 Compiled Runtime Acceptance: PASS`;
5. collect rendered-pixel forced reject / restore / finalize evidence;
6. require `0` leftovers;
7. prove stale proof cannot unlock the current build;
8. export real `p5-evidence.json`;
9. run current-main closure intake and require exact verifier exit `0` / final PASS;
10. re-run Integration Readiness against the then-current main;
11. create a fresh P5→main conflict resolution preserving current-main import-helper overlap safety, current CI/status/tooling and closure/runbook contracts while integrating P5 runtime code deliberately;
12. run full PR CI and require PASS;
13. merge P5 and close #6 only after both runtime closure and fresh integration proof are retained.

### Issue #7 — P6

After P5 merges: resolve P6 integration conflicts, run full CI, create/register a fresh exact-build artifact, establish its exact-build P5 prerequisite, collect real image-bearing positive + preservation-refusal evidence, pass closure intake, merge and close #7.

### Issue #8 — P7

After P5 merges: resolve P7 integration conflicts, run full CI, create/register a fresh exact-build artifact, establish exact-build P5 prerequisite, run a realistic 60+ Frame stress test with strict sequential processing, prove active Full-P3 cooperative cancellation, pass closure intake, merge and close #8.

### P8 — future / deferred

Optional Elementor schema exporter adapters are not part of the active blocker set. Reconsider only after the normalization line is stable.

## Immediate release target

**Prepare/import canonical P5 #488 with the actual Figma development-plugin ID and complete the real Desktop runtime/rendered-pixel acceptance. Then pass current-main closure intake and perform a fresh current-main integration resolution with full CI.** Until those steps happen, P5 remains 94%, overall active progress remains 93%, and P6/P7 final integration/closure remain blocked.
