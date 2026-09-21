# Last Durable Checkpoint

Status: VERIFYING  
Repository: `Vertex-Systems-Network/wp-elementor-prep`  
Observed main: `d4cbf53d4e07c05df91f01bdec967262100452df`  
Active Issue: `#653`  
Active PR: `#654`  
Active branch: `p14/vertical-stack-runtime-adapter`

## P14 R4 implementation

- Added `FigmaP14VerticalStackRetainedDuplicateAdapter`, the first concrete P14 retained-duplicate Figma adapter for the exact `BR_SAFE_VERTICAL_STACK_CANDIDATE@1` path.
- Source fingerprinting uses the exact P13 Build-Ready structural hash over the current Figma source tree.
- Cloning creates and owns a separate candidate; source fingerprint is rechecked after staging and clone-stable structure must match.
- Every runtime action is bound to the exact R1 rule/version, confidence gate, R2 validation profile, frozen mutation allowlist and one canonical R3 target address.
- Candidate target resolution uses #651 source-root/fingerprint-bound child-index addresses and refuses source IDs or unowned candidate handles.
- Mutation reuses the accepted P5 strict vertical-stack transformer; no second layout algorithm was introduced.
- Design-property writes remain exactly `layoutMode`, primary/counter sizing, primary/counter alignment, `itemSpacing` and padding.
- Prepared labeling is metadata-only (`p14:preparedName`); node names are not mutated outside the frozen write allowlist.
- Validation emits the exact 11 required `P14_VALIDATE_VERTICAL_STACK_V1` checks for layout writes plus structure/content/visibility/geometry preservation.
- Candidate re-score uses deterministic P13 Build-Ready analysis and reports introduced HIGH/BLOCKER evidence relative to the source report.
- Retain/discard enforce adapter ownership, transaction identity and source/candidate separation. P4 source-swap/replace semantics are not reused.
- Added deterministic fake-Figma regressions for full transaction success/source immutability, unowned/source-ID refusal, path drift, geometry drift, insufficient re-score, candidate cleanup and wrong-transaction retention.
- Qualification is now version 3 with `runtimeAdapterImplemented: true`. The runtime-adapter blocker is removed; only `P14_PRODUCTION_REGISTRY_BINDING_NOT_ACCEPTED` remains.
- No local/CI PASS is claimed in this implementation milestone. Exact-head repository verification is still required.

## Authority boundary

- `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty.
- `runtimeMutationEnabled` remains false.
- Production confirmation/UI/menu activation remains disabled.
- No target compatibility, real-Figma acceptance or production acceptance is inferred.
- #287 remains admin-blocked; #159 remains external-runtime-evidence blocked; #84 remains manual-release-evidence blocked; #182 remains the deferred P27 gate.

## Focused PR

- PR #654 opened from `p14/vertical-stack-runtime-adapter` against exact main `d4cbf53d4e07c05df91f01bdec967262100452df`.
- PR creation head was `00259f5bc868c3e76167ffb77f60f11df468caef`.
- This checkpoint and Runner metadata are committed on the same PR branch, so the final exact PR head is the post-binding head rather than the creation head.
- No workflow/status polling is performed in this PR-opening milestone.

## Failed exact-head diagnosis and repair

- PR #654 exact head `0647342257919a99c3d7a0276ef29366b4a805ac` produced CI run `35651454191` / job `106504648874` failure and P12 Final Release Artifact run `35651454099` / job `106504605073` failure.
- Both workflows failed on the same TypeScript compiler error: `src/plugin/p14-vertical-stack-retained-duplicate-adapter.ts(191,11) TS7022`.
- Root cause was recursive/inferred Figma `SceneNode` child lookup typing in `resolveFrameByPath`, not runtime authorization, validation, source-immutability or security behavior.
- Repair commit `e20e9f98787c128527df6488bee7918f1f9cb667` adds the explicit `SceneNode | undefined` annotation to the candidate-only child lookup.
- No mutation allowlist, validation profile, source protection, registry authority, confirmation gate or security check was weakened.
- The repaired PR head is not certified in this milestone and no workflow polling is performed after the repair.

## Repaired-head test diagnosis and second repair

- Repaired exact head `96f51eb41b1bae0d5a3b8985366e4ffd9e11eb1c` passed TypeScript typecheck, proving the TS7022 repair.
- CI run `35652020867` / job `106506553178` and P12 Final Release Artifact run `35652020856` / job `106506431436` then failed at the same Vitest suite: `tests/p14-vertical-stack-retained-duplicate-adapter.test.ts`.
- Repository-wide result reached 1597 PASS / 2 FAIL; failures were isolated to the new R4 adapter regressions.
- Failure 1 was an assertion wording mismatch: the adapter correctly refused a source-tree identity as mutation authority, but the regex omitted that exact secure wording.
- Failure 2 exposed a real fail-closed gap: a hidden candidate root could still receive a deterministic P13 Build-Ready READY score, so the adapter did not classify that candidate as insufficient evidence.
- Repair commit `d9ce31565d82b5196e4f6ebca0f952d83e1d45fb` makes `rescoreCandidate` reject a hidden candidate root as insufficient evidence before Build-Ready scoring.
- Repair commit `fca1180cb646c7e8ae56649574ba17be94fccc11` aligns the source-identity refusal regression with the actual fail-closed error text.
- These changes strengthen candidate acceptance; no source protection, mutation allowlist, validation profile, registry authority, confirmation gate or security check was weakened.
- The second repaired PR head is not certified in this milestone; no workflow/status polling occurs after the repair.

## Exact next safe action

On the next user `continue`, resolve the final second-repaired PR #654 head and perform exactly one consolidated exact-head status refresh. Merge only after the full required gate set is green.
