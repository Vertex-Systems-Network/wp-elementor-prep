# Next Actions

Last updated: 2026-09-16

Runtime artifact preflight requires `config/runtime-artifacts.json` schema-v3 and must fail closed on stale or mismatched registered artifacts.

## Execution mode — focused Elementor V1 release train

Prioritize one coherent Elementor commercial V1. Keep P16 stable unless a concrete shared blocker appears, and keep P17-P26 frozen during this window.

Use focused typecheck/tests/builds while iterating. Before merge, the exact PR head must pass the repository's full CI / P12 Final Release Artifact / P12 Offline Acceptance gates. Canonical docs synchronize once per behavior-changing release train rather than in separate ceremonial docs PRs.

## Authority boundaries that must remain true

- P12 — **IN PROGRESS / 80%**; historical publishing authority remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`.
- P13 — **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**; #159 requires genuine Figma Desktop evidence.
- P14 — **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**; `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty.
- P15 — **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**.
- P16 — **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**.
- P17-P26 — **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**.
- P27 — **GATE DEFINED / EXECUTION DEFERRED** under #182.
- #287 remains repository-admin branch/ruleset enforcement work.

Never promote local artifact validation, deterministic style serialization, declared profile alignment, mapping readiness, caller-supplied evidence or CI success into real target compatibility/import/render/production authority.

## Most recently accepted P15 release train — issue #481 / PR #482

PR #482 merged as `04c3710cab693c232e512e53de21b20f6f496555` and issue #481 is complete.

Final exact PR head `500ce695d2392128dfd53d9d181dcf392ca64a57` passed:

- CI #1281;
- P12 Final Release Artifact #592;
- P12 Offline Acceptance #636 on Ubuntu, macOS and Windows.

Accepted behavior:

- `elementor-target-proof-evidence-v1` binds one externally supplied observation packet to the exact canonical Elementor candidate identity and immutable declared TargetProfile fingerprint;
- the actually observed WordPress/Elementor versions are retained separately from the declared TargetProfile instead of being silently rewritten;
- declared/observed target mismatch remains valid but review-required `BOUND_PARTIAL` evidence;
- observed steps are independently retained for Template JSON import, Elementor editor open and render;
- bounded current fidelity observations cover structure, solid background and uniform radius only;
- prerequisite sequencing fails closed, so downstream PASS cannot follow an unproven/failed prerequisite;
- classifications are evidence states only: `BOUND_FULL_PASS`, `BOUND_PARTIAL`, `BOUND_FAIL`, `REJECTED`;
- the offline operator intake emits sanitized binding/status fields plus SHA-256 input fingerprints and does not emit candidate/template contents;
- repository code and CI never synthesize a target PASS observation.

This accepted train does **not** change:

- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `internalReviewRequired=true`;
- P15 remains `TARGET IMPORT UNVALIDATED` until genuine retained target evidence and separate internal review support a status change;
- no WordPress/Elementor connection/network from the Figma core;
- no automated target import/editor/render execution claim;
- no section/clipboard transfer;
- no Figma mutation.

## Active P15 acceptance dependency — issue #483

#483 owns the first controlled genuine Elementor import/editor/render observation for one exact known generated V1 candidate.

Current state: **EXTERNAL/RUNTIME BLOCKED** until a controlled real WordPress + Elementor environment and operator evidence are available.

The required proof remains explicit and narrow:

- retain the exact generated candidate/artifact fingerprint used for the import;
- retain the immutable declared TargetProfile identity;
- record the actually observed WordPress and Elementor versions separately;
- record whether Elementor accepts the Template JSON import;
- record whether the imported document opens in the Elementor editor;
- record whether the bounded structure and currently supported container fidelity render as expected;
- retain failure/review evidence if any step cannot be proven;
- feed only genuine observations into `p15:elementor-target-proof-intake`;
- preserve the resulting evidence packet for separate internal review before changing any compatibility/import/production authority.

If a genuine operator/environment is not available, stop at the evidence-capture boundary. Do not synthesize a PASS result from CI, local JSON validity, screenshots without binding, or user-declared version strings.

Only evidence actually retained may change import/target/production states.

## Immediate repository-side action

Do not open additional P15 serializer/fidelity implementation merely to keep the queue moving while #483 is unproven. The next fidelity slice should be selected from gaps exposed by the first real controlled target proof.

While #483 is blocked, repository-side work is limited to:

- fixing concrete regressions discovered by CI/review;
- keeping canonical status truth current;
- processing newly opened actionable issues before unrelated roadmap expansion.

## Later fidelity expansion

After the first controlled target proof exposes real gaps, add only the next evidenced high-value mappings. Typography, effects, gradients, opacity, responsive controls, width/min-height and media/reference closure should each remain bounded slices with documented target controls and focused regressions rather than one broad serializer expansion.

## Parallel operator/runtime evidence

When the required real environment/operator is available, these can proceed independently without blocking safe P15 code work:

- #483 — controlled real Elementor import/editor/render evidence + separate internal review;
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
