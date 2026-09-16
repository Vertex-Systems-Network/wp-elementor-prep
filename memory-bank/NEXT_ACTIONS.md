# Next Actions

Last updated: 2026-09-16

Runtime artifact preflight requires `config/runtime-artifacts.json` schema-v3 and must fail closed on stale or mismatched registered artifacts.

## Execution mode — focused Elementor V1 release train

Prioritize one coherent Elementor commercial V1. Keep P16 stable unless a concrete shared blocker appears, and keep P17-P26 frozen during this window.

Use focused typecheck/tests/builds while iterating. The exact integration head must pass the repository's full CI / P12 Final Release Artifact / P12 Offline Acceptance gates before merge. Canonical docs synchronize once per behavior-changing release train rather than in separate ceremonial docs PRs.

## Authority boundaries that must remain true

- P12 — **IN PROGRESS / 80%**; historical publishing authority remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`.
- P13 — **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**; #159 requires genuine Figma Desktop evidence.
- P14 — **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**; `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty.
- P15 — **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**.
- P16 — **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**.
- P17-P26 — **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**.
- P27 — **GATE DEFINED / EXECUTION DEFERRED** under #182.
- #287 remains repository-admin branch/ruleset enforcement work.

Never promote local artifact validation, environment qualification, evidence-chain validation, deterministic style serialization, declared profile alignment, mapping readiness, caller-supplied evidence or CI success into real target compatibility/import/render/production authority.

## Most recently accepted P15 release train — issue #486 / PR #487

PR #487 merged as `dd281b8bea7670e252629e931129a5276d08bef3` and issue #486 is complete.

Final exact PR head `d74b948401dbf4e4f15116cc9a57c8d8cabf7c18` passed:

- CI #1294;
- P12 Final Release Artifact #605;
- P12 Offline Acceptance #649 on Ubuntu, Windows and macOS.

Accepted behavior:

- `elementor-target-environment-evidence-v1` retains externally observed WordPress, Elementor Core, PHP, database, WordPress-memory, browser and clean-Core dependency facts;
- policy `elementor-target-environment-policy-2026-09-16-v1` uses conservative R0-qualified minimums;
- classifications are `QUALIFIED_FOR_BOUND_TARGET_PROOF`, `REVIEW_REQUIRED`, `NOT_QUALIFIED`, `REJECTED`;
- SQLite/unsupported DBs, stale/unsupported browsers and below-minimum required runtime facts cannot qualify;
- Elementor Pro or third-party Elementor addons require review for the clean-Core first-proof policy;
- `p15:elementor-target-environment-intake` emits a sanitized report plus SHA-256 input fingerprint and explicitly keeps import/editor/render observations false.

This accepted train does **not** change `acceptanceAuthority=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false`, `internalReviewRequired=true`, or P15's `TARGET IMPORT UNVALIDATED` state.

## Active P15 code-side release train — issue #488 / PR #489

#488 closes the remaining evidence-substitution gap between qualified environment evidence and the exact-bound target proof packet.

Implementation feedback head `c8e7e90150f629804ca4c2a158f0d81c526ad7ee` passed:

- CI #1296 including typecheck, full tests, builds and release/community checks;
- P12 Final Release Artifact #607;
- P12 Offline Acceptance #651.

The canonical docs sync moves the PR head, so the final exact head must pass the full required gate set again before merge.

Bounded behavior in #489:

- new `elementor-target-proof-chain-v1` validates candidate + declared TargetProfile + observed environment + observed proof together;
- existing candidate and TargetProfile replay protection remains authoritative;
- environment must be structurally valid and the clean-Core acceptance path requires `QUALIFIED_FOR_BOUND_TARGET_PROOF`;
- proof-observed WordPress and Elementor versions must exactly match the qualified environment evidence;
- environment and proof must retain the same durable operator evidence/run reference;
- proof observation time cannot precede environment observation time;
- combined classifications are `CHAIN_FULL_PASS`, `CHAIN_PARTIAL`, `CHAIN_FAIL`, `CHAIN_BLOCKED`, `REJECTED`;
- sanitized `p15:elementor-target-proof-chain-intake` fingerprints candidate/profile/environment/proof inputs without emitting template contents;
- no environment/import/editor/render observation is synthesized by repository code or CI.

`CHAIN_FULL_PASS` is evidence-chain consistency only. It never grants compatibility, production acceptance or target authority.

## Next P15 acceptance action — issue #483 real controlled target proof

After #489 merges, the first genuine target proof must use one exact known generated V1 candidate and one exact externally observed runtime.

Required order:

1. capture the real runtime facts for the exact environment intended for the proof;
2. run `p15:elementor-target-environment-intake` and retain the environment report/fingerprint;
3. proceed only with the clean-Core `QUALIFIED_FOR_BOUND_TARGET_PROOF` path unless a separate review explicitly allows a review-required environment;
4. import the exact candidate through Elementor Template Library JSON;
5. if import passes, open it in the Elementor editor;
6. if editor-open passes, render/preview and observe only the currently supported bounded fidelity slice;
7. build the exact-bound `elementor-target-proof-evidence-v1` packet from those genuine observations;
8. run the standalone target-proof intake for its bounded proof diagnostics;
9. run `p15:elementor-target-proof-chain-intake` over the exact candidate/profile/environment/proof set;
10. retain every input/report fingerprint plus the durable evidence reference together;
11. perform separate internal review before changing any P15 authority/status.

If a genuine qualified operator/environment is not available, stop at the evidence-capture boundary. CI, local JSON validity, Playground/SQLite-only observations, unbound screenshots and user-declared versions cannot substitute for #483.

## Repository-side boundary while #483 is blocked

Do not open additional P15 serializer/fidelity implementation merely to keep the queue moving while #483 is unproven. The next fidelity slice must be selected from a concrete gap exposed by the first real controlled target proof.

Repository-side work is limited to concrete CI/review regressions, evidence-harness integrity, platform-evidence refreshes, canonical status truth and newly opened actionable issues.

## Parallel operator/runtime evidence

When the required real environment/operator is available, these can proceed independently:

- #483 — qualified and chain-bound real Elementor import/editor/render evidence + separate internal review;
- #159 — genuine Figma Desktop P13 runtime/parity evidence + separate internal review;
- #84/#182 — remaining P12 package/publisher/account/2FA/final-exit evidence.

Do not fabricate any of these from CI/repository metadata.

## AI-native speed rules

- one acceptance objective -> one focused release train;
- parallelize only across non-overlapping ownership;
- isolate new controllers/adapters where practical instead of repeatedly editing shared hotspots;
- focused verification during iteration;
- full exact-head gates at merge;
- one canonical status sync per behavior-changing train;
- no synthetic overall percentage;
- no synthetic runtime/target/external evidence.
