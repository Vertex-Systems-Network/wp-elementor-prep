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

Never promote local artifact validation, environment qualification, deterministic style serialization, declared profile alignment, mapping readiness, caller-supplied evidence or CI success into real target compatibility/import/render/production authority.

## P15 environment-qualification release train — issue #486 / PR #487

This release train adds a deterministic, non-authorizing qualification gate for the externally observed WordPress + Elementor runtime used by the future #483 proof.

Implementation feedback head `1872be59bcee3443d75ba7024e12714fdf7e4102` passed CI #1287, P12 Final Release Artifact #598 and P12 Offline Acceptance #642. The synchronized release candidate must still satisfy the exact-head gates at integration.

Bounded behavior:

- `elementor-target-environment-evidence-v1` accepts only externally observed bounded runtime facts;
- policy `elementor-target-environment-policy-2026-09-16-v1` uses conservative R0-qualified floors for WordPress, PHP, MySQL/MariaDB, memory and browser;
- exact classifications are `QUALIFIED_FOR_BOUND_TARGET_PROOF`, `REVIEW_REQUIRED`, `NOT_QUALIFIED`, `REJECTED`;
- SQLite/other DBs and below-minimum required runtime facts cannot qualify;
- active Elementor Pro or third-party Elementor addons require review for the clean-Core first-proof policy;
- malformed versions, unknown fields and elevated authority flags reject fail-closed;
- `p15:elementor-target-environment-intake` emits a sanitized report and SHA-256 input fingerprint;
- the report explicitly keeps `importObserved=false`, `editorObserved=false`, `renderObserved=false`.

This release train does **not** change:

- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `internalReviewRequired=true`;
- P15 remains `TARGET IMPORT UNVALIDATED`;
- no WordPress/Elementor network connection from the Figma core;
- no automated target import/editor/render claim;
- no Atomic-v4 acceptance;
- no section/clipboard transfer;
- no Figma mutation.

## Next P15 acceptance action — issue #483 real controlled target proof

The first genuine target proof must use one exact known generated V1 candidate and one externally observed runtime.

Required order:

1. capture the real runtime facts from the exact environment intended for the proof;
2. run `p15:elementor-target-environment-intake` and retain the evidence/report fingerprint;
3. proceed only when the environment is `QUALIFIED_FOR_BOUND_TARGET_PROOF`; a review-required environment needs explicit review before it can substitute for the clean-Core first-proof matrix;
4. import the exact candidate through Elementor Template Library JSON;
5. if import passes, open it in the Elementor editor;
6. if editor-open passes, render/preview and observe only the currently supported bounded fidelity slice;
7. build the exact-bound proof packet from those genuine observations;
8. run `p15:elementor-target-proof-intake`;
9. retain candidate/profile/environment/proof/report identities and durable evidence together;
10. perform separate internal review before changing any P15 authority/status.

If a genuine qualified operator/environment is not available, stop at the evidence-capture boundary. CI, local JSON validity, Playground/SQLite-only observations, unbound screenshots and user-declared versions cannot substitute for #483.

## Repository-side boundary while #483 is blocked

Do not open additional P15 serializer/fidelity implementation merely to keep the queue moving while #483 is unproven. The next fidelity slice must be selected from a concrete gap exposed by the first real controlled target proof.

Repository-side work is limited to:

- fixing concrete regressions discovered by CI/review;
- maintaining the target-proof/environment qualification harness when platform evidence changes;
- keeping canonical status truth current;
- processing newly opened actionable issues before unrelated roadmap expansion.

## Later fidelity expansion

After the first controlled target proof exposes real gaps, add only the next evidenced high-value mappings. Typography, effects, gradients, opacity, responsive controls, width/min-height and media/reference closure each remain bounded slices with documented target controls and focused regressions rather than one broad serializer expansion.

## Parallel operator/runtime evidence

When the required real environment/operator is available, these can proceed independently:

- #483 — qualified controlled real Elementor import/editor/render evidence + separate internal review;
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
