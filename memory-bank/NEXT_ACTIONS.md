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

## Current P15 release train — issue #479 / PR #480

PR #480 implements the first deliberately small deterministic visual-fidelity pack on top of the accepted fresh local Elementor Template JSON path.

Implementation head `bd0da362a2e73ab856e6068d65b4d581978ee155` passed:

- CI #1272;
- P12 Final Release Artifact #583;
- P12 Offline Acceptance #627.

The canonical docs commit moves the PR head, so these are implementation-feedback proofs only. Final exact-head gates must pass again before merge.

Accepted behavior for this train:

- neutral IR v2 adds only optional canonical `backgroundColorHex` and bounded `cornerRadiusPx` container facts;
- exactly one visible opaque Figma `SOLID` fill maps deterministically to uppercase `#RRGGBB`;
- only uniform bounded pixel corner radii map deterministically;
- absent or zero style facts remain absent;
- multiple visible fills, gradients/unsupported paints, translucent solids and malformed RGB states become REVIEW;
- partial, nonuniform or out-of-range corner radii become REVIEW;
- image-backed fills retain `IMAGE_ASSET_EXPORT_REQUIRED` and cannot be silently treated as a solid background;
- generator v2 maps accepted background facts only to `background_background='classic'` plus `background_color` and uniform radius only to linked pixel `border_radius` dimensions;
- deterministic candidate/local-download validation remains fail closed if any REVIEW state is present;
- typography, opacity mapping, effects, gradients, nonuniform-radius conversion and responsive behavior remain out of scope.

This train does **not** change:

- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `importValidationStatus=NOT_RUN`;
- `targetEnvironmentValidationStatus=NOT_RUN`;
- `environmentObserved=false`;
- no WordPress/Elementor connection/network;
- no target import/editor/render execution;
- no section/clipboard transfer;
- no Figma mutation.

### Immediate action

Run final diff audit and full exact-head CI / Final / Offline gates on PR #480 after this canonical docs sync. Merge only if all required checks pass on the same head.

## Next P15 slice — one controlled real Elementor import proof

After #480 merges, move from local structural validity to genuine target evidence for one known generated V1 fixture.

The proof must be explicit and narrow:

- use a controlled real WordPress + Elementor target environment;
- retain the exact generated candidate/artifact fingerprint used for the import;
- retain declared and actually observed target/version identity separately;
- record whether Elementor accepts the Template JSON import;
- record whether the imported document opens in the Elementor editor;
- record whether the bounded structure and currently supported container fidelity render as expected;
- retain failure/review evidence if any step cannot be proven;
- bind evidence to the exact candidate/profile/observation rather than a generic environment claim.

If a genuine operator/environment is not available, code-side work may prepare a bounded evidence-capture/verification surface, but must not synthesize an import result.

Only evidence actually retained may change import/target/production states. Local JSON validity, CI success and a user-declared version string are never enough.

## Later fidelity expansion

After the first controlled target proof exposes real gaps, add only the next evidenced high-value mappings. Typography, effects, gradients, opacity, responsive controls, width/min-height and media/reference closure should each remain bounded slices with documented target controls and focused regressions rather than one broad serializer expansion.

## Parallel operator/runtime evidence

When the required real environment/operator is available, these can proceed independently without blocking safe P15 code work:

- #159 — genuine Figma Desktop P13 runtime/parity evidence + separate internal review;
- #84/#182 — remaining P12 package/publisher/account/2FA/final-exit evidence.

Do not fabricate either from CI/repository metadata.

## AI-native speed rules

- one acceptance objective -> one focused release train;
- parallelize only across non-overlapping ownership;
- isolate new controllers/adapters where practical instead of repeatedly editing shared hotspots;
- focused verification during iteration;
- full exact-head gates at merge;
- one canonical status sync per behavior-changing train;
- no synthetic overall percentage;
- no synthetic runtime/target/external evidence.
