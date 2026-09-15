# Next Actions

Last updated: 2026-09-16

Runtime artifact preflight requires `config/runtime-artifacts.json` schema-v3 and must fail closed on stale or mismatched registered artifacts.

## Execution mode — focused Elementor V1 release train

For the current fast-development window, prioritize one coherent Elementor commercial V1 instead of opening additional roadmap phases.

Use one bounded release train per acceptance objective. During implementation, use focused typecheck/tests/builds for rapid feedback; before merge, the exact PR head must still pass the repository's full required CI / Final Release / Offline Acceptance gates. Synchronize canonical docs once per accepted train when project truth changes rather than creating a reflexive docs PR after every micro-commit.

Keep P16 stable unless a P15 blocker requires shared infrastructure. Keep P17-P26 frozen during this focused window.

## Priority 1 — preserve existing authority boundaries

- P12 remains **IN PROGRESS / 80%**; historical publishing authority remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`, plugin ID `1680034649341961379`.
- P13 remains **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**; #159 still requires genuine Figma Desktop evidence.
- P14 remains **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**; `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty and no real P14 mutation authority exists.
- P15 remains **CORE FOUNDATION IN PROGRESS / TARGET IMPORT UNVALIDATED**.
- P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED**.
- P17-P26 remain **PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED**.
- P27 remains **GATE DEFINED / EXECUTION DEFERRED** under #182.
- #287 remains the repository-admin branch/ruleset enforcement residual.

Never convert local candidate validity, declared metadata alignment, mapping readiness, caller-supplied evidence or CI success into target compatibility / production acceptance unless the required real evidence is retained.

## Priority 2 — P15 Elementor V1 current foundation

Accepted main now includes:

- bounded target-neutral export IR;
- deterministic local Elementor v0.4 Container/Widget Template JSON generator;
- read-only selected-Figma-Frame extraction for bounded HORIZONTAL/VERTICAL Auto Layout, padding/gap/alignment and visible plain text;
- documented-core `text-editor` mapping with HTML escaping/line-break retention;
- fail-closed REVIEW for manual/grid/wrap/absolute/image-asset/depth/node/unsupported states;
- sanitized normal + publishable `Preview Elementor` UI;
- bounded user-declared WordPress/Elementor TargetProfile alignment preview;
- deterministic categorical mapping readiness from PR #474 / issue #473:
  - `NATIVE`
  - `NATIVE_WITH_REVIEW`
  - `CONVERTIBLE`
  - `FALLBACK`
  - `UNSUPPORTED`
  - `UNKNOWN`
- readiness states `READY`, `READY_WITH_REVIEW`, `NOT_READY`, `INSUFFICIENT_EVIDENCE`, with unknown/unsupported nodes retained in the coverage denominator.

PR #474 exact head `438bab50e3683580b15bc9cd25a48eb66a37ede3` passed CI #1262, P12 Final Release Artifact #573 and P12 Offline Acceptance #617 before merge `d09f5430831394c21033585354fe7daceaba78d4`.

Current P15 authority remains locked:

- `targetCompatibilityClaim=false`;
- `productionAcceptance=false`;
- `downloadEnabled=false`;
- `importValidationStatus=NOT_RUN`;
- `targetEnvironmentValidationStatus=NOT_RUN`;
- no target observation/network/import/editor/render execution;
- no Figma mutation;
- no candidate/template JSON sent through the normal preview payload.

## Priority 3 — next P15 commercial slices

Execute in this order and keep each slice bounded.

### A. Fresh locally validated Template JSON download contract

Goal: turn the current local candidate into a usable artifact without overstating target compatibility.

Required design:

- explicit user action, separate from the sanitized preview payload;
- on click, re-read exactly one current selected Frame and regenerate from scratch; do not reuse stale preview bytes;
- require extraction/generation state compatible with the accepted download contract;
- revalidate the generated candidate immediately before artifact exposure;
- bind artifact to source/candidate identity and declared profile identity when applicable;
- expose only the accepted JSON artifact plus sanitized receipt/report;
- label it **LOCAL ARTIFACT VALIDATED / TARGET IMPORT NOT YET VERIFIED** until real import evidence exists;
- fail closed on REVIEW/UNSUPPORTED/UNKNOWN/stale/invalid state unless an explicit reviewed export policy is separately accepted;
- no WordPress connection, direct push, clipboard transfer or target compatibility claim in this slice.

### B. Minimum visual-fidelity mapping pack

After A is stable, add only deterministic mappings with clear Figma facts and documented Elementor controls. Prefer a small high-value set first, such as simple solid background, bounded radius, basic text size/weight/color/line-height and basic width/min-height where representation is unambiguous.

Complex/mixed styles, unresolved variables, effects, responsive invention or unsupported target controls must remain REVIEW rather than guessed output.

### C. One real Elementor import proof

Use a controlled real Elementor environment to import a known generated V1 fixture, retain editor/render/import observations and feed them through the existing P15 import/reference evidence chain. Do not infer target acceptance from local JSON validation alone.

Only the evidence actually retained may change `importValidationStatus`, target compatibility or production acceptance.

## Priority 4 — parallel operator/runtime evidence

These are independent of ordinary code progress and can run in parallel when the required environment/operator is available:

- #159: capture genuine real-Figma P13 runtime/parity evidence and perform the separate internal review;
- #84/#182: retain the remaining exact P12 package/publisher/account/2FA/final-exit evidence when the intended publishing flow is available.

Do not block safe P15 code-side work on these external/manual steps, and do not manufacture them from repository evidence.

## P16 hold line

P16's existing deterministic evidence/retention/operator foundation remains retained. During the Elementor V1 focus window, do not spend release-train capacity on additional P16 hardening unless it fixes a concrete shared blocker. Genuine authenticated evidence and real Gutenberg target/editor/import/render validation remain required before stronger authority.

## AI-native speed rules

- one acceptance objective -> one focused release train;
- parallelize only across non-overlapping file ownership;
- one integrator owns shared hotspots such as `src/plugin/main.ts` and `src/ui/ui.html`;
- focused tests/typecheck/build during iteration;
- full exact-head gates at the merge checkpoint;
- canonical docs sync once when truth changes;
- no synthetic overall project percentage;
- no synthetic runtime/target/external evidence.

## Next executable action

Open the bounded P15 **fresh locally validated Template JSON download contract** issue/branch from current main. Keep `targetCompatibilityClaim=false`, `productionAcceptance=false` and real import/editor/render validation `NOT_RUN` throughout that implementation slice.
