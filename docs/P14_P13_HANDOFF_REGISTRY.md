# P14 P13 → P14 Handoff and Safe-Recipe Registry

Status: IMPLEMENTATION FOUNDATION ONLY — PRODUCTION REGISTRY EMPTY / RUNTIME UNWIRED  
Issues: #167, #169, #641, #649  
Roadmap: #119  
Dependencies still open: P13 real-Figma acceptance (#159) and final production release gate (#84)

## Purpose

This foundation creates the deterministic authority boundary between Build-Ready Score 2.0 findings and the P14 retained-duplicate preparation engine.

A P13 finding does **not** gain mutation authority merely because it sounds fixable. P14 may attach and execute a mutating recipe only when all required authority gates pass.

## Current production truth

P13 now emits one narrowly bounded target-neutral candidate, `BR_SAFE_VERTICAL_STACK_CANDIDATE@1`, only when the already accepted P5 vertical-stack planner returns `ELIGIBLE / SUPPORTED_HIGH_CONFIDENCE` at its 90% gate. Candidate classification is not mutation authority.

Issue #641 freezes the complete P5 vertical-stack write surface for P14 qualification, including primary/counter axis alignment fields that the previous P14 mutation vocabulary did not model.

Issue #649 adds the target-neutral `P14_VALIDATE_VERTICAL_STACK_V1` validation-profile contract. It requires exact evidence for the qualified layout-mode, primary/counter sizing, primary/counter alignment, spacing and padding surface plus candidate child-structure, content, visibility and geometry preservation. Missing, duplicate, unknown, optionalized or failed required evidence fails closed. Qualification version 2 references this profile, but runtime mutation and production-registry activation remain separately blocked.

Therefore `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains intentionally empty.

An empty registry is **valid but non-authorizing**. This differs from an invalid registry:

- empty valid registry → handoff/no-op inspection may proceed, but no mutating recipe is authorized;
- malformed/ambiguous registry → handoff or execution authorization fails closed.

## Registry contract

Each mutating binding contains:

- exact source P13 rule ID and version;
- accepted P14 recipe ID/version;
- recipe source-rule allowlist;
- minimum confidence;
- prerequisite/conflict declarations;
- exact mutation-property allowlist;
- required validation profile;
- deterministic order class.

Registry validation rejects duplicate or contradictory bindings, invalid versions/confidence, missing validation profiles/order classes, unauthorized source-rule bindings, unsupported/duplicate mutation fields, self-dependencies and self-conflicts.

## P13 → P14 handoff contract

`buildP13P14Handoff(...)` validates the Build-Ready version/source identity and registry before deriving P14 inputs.

For an exact accepted candidate:

- P13 run ID becomes the P14 plan run binding;
- P13 root ID becomes the P14 source node ID;
- P13 structural hash becomes the P14 source fingerprint;
- P13 run ID is re-checked against the exact `structuralHash + configHash` binding;
- exact finding node IDs become the P14 target context;
- exact accepted recipe ID/version is attached.

Fail-closed behavior:

- `MANUAL_REVIEW` and `ADVISORY` never escalate merely because a recipe exists;
- `P14_SAFE_CANDIDATE` without an exact rule/version binding becomes review-only;
- below-confidence candidates remain review-only;
- invalid registry, insufficient evidence, forged run/source/config binding, invalid score status or invalid target context blocks handoff.

The handoff always carries `acceptanceAuthority: false` and `targetCompatibilityClaim: false`.

## Execution-boundary authorization

Plan integrity and recipe authorization are separate gates.

`validateP14PreparationPlan(...)` proves a plan is internally coherent. It does **not** prove that the plan's recipes are currently authorized.

Before the retained-duplicate transaction touches any adapter operation, `authorizeP14PreparationPlan(...)` re-checks every `ELIGIBLE` action against the current safe-recipe registry. For each action it requires an exact match for:

- source rule ID/version;
- recipe ID/version;
- validation profile;
- mutation allowlist;
- prerequisite recipe IDs;
- conflict recipe IDs;
- order class;
- minimum confidence;
- recipe source-rule authorization.

If any check fails, the transaction returns `BLOCKED` with `P14_RECIPE_UNAUTHORIZED` and leaves source fingerprints as `UNKNOWN` because no runtime fingerprint/clone/mutation/validation/re-score/retain/discard adapter operation was allowed to run.

The transaction defaults to `PRODUCTION_P14_SAFE_RECIPE_REGISTRY`. Because that registry is intentionally empty today, a self-consistent mutating READY plan is still non-executable by default. Synthetic tests must provide an explicit synthetic registry; that test registry is not production authority.

`NO_CHANGES_NEEDED` plans contain no eligible mutating actions and remain valid with the empty production registry; they still perform source-fingerprint proof before reporting completion.

## Determinism

Registry bindings are normalized into stable rule/version order. P13 findings are processed in stable rule/version/finding order. Matched recipes and authorization failures are emitted deterministically.

Equivalent report, plan and registry content must produce stable handoff/authorization semantics regardless of insertion order.

## Synthetic positive tests are not production authorization

The test suite injects synthetic `P14_SAFE_CANDIDATE` findings and synthetic safe recipes to prove positive contract paths. These mappings are not exported in the production registry and do not authorize live Figma mutation.

A future production recipe requires its own accepted rule/recipe/validator/runtime-evidence issue before a binding may be added to `PRODUCTION_P14_SAFE_RECIPE_REGISTRY`.

## Still deliberately unwired

This foundation adds no Figma plugin menu item, no UI action, no real Figma mutation adapter, no target profile and no Elementor/Gutenberg/framework readiness claim.

P14 remains implementation-foundation only. P13 #159 real runtime acceptance and P12 #84 final release-exit gates remain separate and open.