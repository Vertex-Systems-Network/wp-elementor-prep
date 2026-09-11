# P14 P13 → P14 Handoff and Safe-Recipe Registry

Status: IMPLEMENTATION FOUNDATION ONLY — PRODUCTION REGISTRY EMPTY / RUNTIME UNWIRED  
Issue: #167  
Roadmap: #119  
Dependencies still open: P13 real-Figma acceptance (#159) and final production release gate (#84)

## Purpose

This slice creates the deterministic authority boundary between Build-Ready Score 2.0 findings and the P14 retained-duplicate preparation engine.

A P13 finding does **not** gain mutation authority merely because it sounds fixable. P14 may attach a mutating recipe only when both conditions are true:

1. the finding itself explicitly declares `P14_SAFE_CANDIDATE`; and
2. the versioned safe-recipe registry contains an exact `ruleId + ruleVersion` binding to an accepted versioned recipe contract.

Anything else remains read-only.

## Current production truth

At main source `7812071ff8f5afeca7d64a07707375b8a748d7ec`, current P13 core and responsive-risk production rule definitions emit only `MANUAL_REVIEW` or `ADVISORY` remediation classes.

Therefore `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` is intentionally empty in this slice.

An empty registry is **valid but non-authorizing**. This is different from an invalid registry:

- empty valid registry → handoff can be inspected, but no mutating recipe can be attached;
- malformed/ambiguous registry → handoff itself fails closed and no P14 plan is produced.

## Registry contract

Each mutating binding contains:

- exact source P13 rule ID;
- exact source P13 rule version;
- accepted P14 recipe ID/version;
- recipe source-rule allowlist;
- minimum confidence;
- prerequisite/conflict declarations;
- exact mutation-property allowlist;
- required validation profile;
- deterministic order class.

Registry validation rejects at least:

- duplicate rule/version bindings;
- contradictory contracts under one recipe ID/version;
- invalid rule/recipe versions;
- missing validation profile/order class;
- recipe bindings not authorized by the recipe source-rule allowlist;
- unsupported or duplicate mutation fields;
- self-dependency or self-conflict;
- invalid confidence gates.

## Handoff contract

`buildP13P14Handoff(...)` validates the Build-Ready version/source identity and the safe-recipe registry before deriving P14 inputs.

For an exact accepted candidate:

- P13 run ID becomes the P14 plan run binding;
- P13 root ID becomes the P14 source node ID;
- P13 structural hash becomes the P14 source fingerprint;
- exact finding node IDs become the P14 target context;
- exact accepted recipe ID/version is attached.

Fail-closed behavior:

- `MANUAL_REVIEW` never escalates because a matching recipe exists;
- `ADVISORY` never escalates because a matching recipe exists;
- a `P14_SAFE_CANDIDATE` with no exact rule/version binding becomes `MANUAL_REVIEW` with `P14_SAFE_BINDING_REQUIRED`;
- a below-confidence candidate becomes `MANUAL_REVIEW` with `P14_BELOW_CONFIDENCE_GATE`;
- an invalid registry blocks the handoff completely;
- insufficient/unsupported P13 report evidence blocks the handoff completely.

The handoff always carries `acceptanceAuthority: false` and `targetCompatibilityClaim: false`.

## Determinism

Registry bindings are normalized into stable rule/version order. P13 findings are processed in stable rule/version/finding order. Matched recipes are de-duplicated and emitted in stable recipe/version order.

Equivalent report and registry content must produce byte-equivalent JSON handoff output regardless of insertion order.

## Synthetic positive tests are not production authorization

The test suite injects synthetic `P14_SAFE_CANDIDATE` findings and synthetic safe recipes to prove the positive contract path. These test-only mappings are not exported in the production registry and do not authorize any live Figma mutation.

A future production recipe requires its own accepted rule/recipe/validator/runtime-evidence issue before a binding may be added to `PRODUCTION_P14_SAFE_RECIPE_REGISTRY`.

## Still deliberately unwired

This slice adds no Figma plugin menu item, no UI action, no real Figma mutation adapter, no target profile and no Elementor/Gutenberg/framework readiness claim.

P14 remains implementation-foundation only. P13 #159 real runtime acceptance and P12 #84 final release-exit gates remain separate and open.