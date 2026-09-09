# Project State

Last updated: 2026-09-09

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

**P0–P4 are complete. P5/P6/P7 engineering is implemented and verified on canonical feature heads. The active release gate is real imported-Figma runtime acceptance for P5 issue #6. P6/P7 final closure can start only after P5 merges and their integration conflicts are resolved against the merged P5 line.**

Overall active project progress remains `93%`. Tooling/documentation hardening does not advance that percentage unless a real product/runtime gate advances.

## Repository status

- Latest verified main-side tooling merge: PR #61, squash-merged at `933b2fc2edbd421794713efb55d415aff4091914`.
- PR #61 head `d2dc43d` passed CI #606 with no review/thread blockers.
- Post-merge CI #607 and Integration Readiness #82 passed.
- Issue #60 is completed and closed.
- `status:verify` now reads `config/runtime-artifacts.json.schemaVersion` and requires README, PROJECT_STATE, ROADMAP and NEXT_ACTIONS to reference the active runtime registry schema.
- Regression coverage proves current schema documents pass while a stale schema document fails closed.
- Open product/runtime issues are exactly #6, #7, #8.
- Open PR/MR count returned to `0` after PR #61 merge.
- Canonical P5/P6/P7 feature heads and registered runtime artifact bytes remain unchanged by main-side tooling work.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep Issues → PR/MR → development lifecycle, status docs and artifact registry synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | RUNTIME ACCEPTANCE | 94% | Exact #488 preflight + real imported-Figma proof + closure intake PASS → merge #6 |
| P6 advanced structures | INTEGRATION BLOCKED | 80% | P5 merge → resolve conflicts → fresh exact-build artifact/provenance → runtime closure #7 |
| P7 batch queue | INTEGRATION BLOCKED | 80% | P5 merge → resolve conflicts → fresh exact-build artifact/provenance → stress/cancel closure #8 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate only after normalization line is stable |

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3.

For every registered track it records exact build identity, Actions artifact digest, closure eligibility, immutable file SHA-256 pins, required runtime commands, and an id-excluded manifest semantic SHA-256.

Manifest semantic hashing removes only top-level `manifest.id`, recursively sorts object keys, preserves array order/content, and hashes canonical JSON. This allows the supported local Figma development-plugin ID rebind while rejecting every other manifest semantic drift.

### P5

- Branch: `feat/p5-safe-recipes`
- Head: `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`
- CI: #488 PASS, run ID `34242984963`
- Artifact: `figma-plugin-dist-488`
- ZIP digest: `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`
- Manifest semantic SHA-256: `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`
- Registry status: final-closure eligible for issue #6.
- Remaining: real imported-Figma runtime acceptance followed by one-command closure intake PASS.

### P6

- Branch: `feat/p6-advanced-structures`
- Head: `9a6ae3b29e2f70ebbd987a686856c2957f590b75`
- CI: #494 PASS, run ID `34244113623`
- Reference artifact: `figma-plugin-dist-494`
- ZIP digest: `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3`
- Manifest semantic SHA-256: `b687205564abb72ac7b00447d2bec3e00c266a1d4ddf9ec6980ce15c62c893f9`
- Registry status: reference-only; final closure fails closed on this build.

### P7

- Branch: `feat/p7-batch-queue-core`
- Head: `cbfdb66db531da8613582c84523265e42dad63a2`
- CI: #490 PASS, run ID `34243303097`
- Reference artifact: `figma-plugin-dist-490`
- ZIP digest: `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43`
- Manifest semantic SHA-256: `3cb617c2d47d8b3d887ca94897781998226f9ec6c1b242bc880a2e18d9f6587e`
- Registry status: reference-only; final closure fails closed on this build.

## Runtime provenance / operator tooling complete on main

Main-side tooling now provides:

- non-symlink artifact-root and required-file validation,
- stable pre-open/opened `dev`/`ino`/size/mtime/ctime identity checks,
- descriptor-pinned BUILD_INFO/manifest/file-hash reads,
- `5/5` immutable file SHA-256 verification,
- schema-v3 manifest semantic pin verification excluding only top-level plugin `id`,
- optional retained Actions ZIP raw SHA-256 verification through a stable descriptor,
- safe sibling/non-nested local Figma import preparation,
- bounded regular non-symlink evidence intake,
- descriptor-pinned exact evidence-byte SHA-256 + strict UTF-8/top-level JSON validation,
- post-preflight verifier revalidation,
- verified-byte in-memory verifier execution rather than trusting a mutable artifact path,
- status-document registry schema synchronization enforced by CI.

These gates validate provenance and supplied evidence only. They cannot create real Figma observations.

## Integration readiness

The non-mutating integration checker currently reports:

- P5 → current `main`: integration resolution already proven; final merge waits on real P5 runtime acceptance.
- P6 → latest P5: real shared-code conflicts.
- P7 → latest P5: real shared-code conflicts.

Do not mutate canonical P5/P6/P7 exact-build branches merely for documentation/tooling churn.

## Current blockers and remaining development

### Issue #6 — P5

Requires actual Figma Desktop imported-plugin runtime evidence. Required remaining steps are current-main preflight PASS, real `Developer: P5 Runtime Self-Test`, compiled runtime acceptance PASS, rendered-pixel reject/restore/finalize evidence, zero leftovers, exported `p5-evidence.json`, and `runtime:closure-intake` PASS. Only then merge P5 and close #6.

### Issue #7 — P6

After P5 merges: resolve P6 integration conflicts, run full CI, produce/register a fresh exact-build artifact with schema-v3 provenance pins, establish its exact-build P5 prerequisite, collect positive image-bearing + preservation-refusal real-Figma evidence, pass closure intake, merge and close #7.

### Issue #8 — P7

After P5 merges: resolve P7 integration conflicts, run full CI, produce/register a fresh exact-build artifact with schema-v3 provenance pins, establish exact-build P5 prerequisite, run realistic 60+ Frame stress, prove strictly sequential processing and active Full-P3 cooperative cancellation, pass closure intake, merge and close #8.

### P8 — future / deferred

Optional Elementor schema exporter adapters are not part of the active release blocker set. Issue #9 is closed as not planned; reconsider only after the normalization line is stable.

## Immediate release target

Complete P5 #488 in real Figma Desktop and pass the current schema-v3 one-command closure chain. Until that happens, product progress remains 93% and P6/P7 final integration/closure stay blocked.
