# Next Actions

Last updated: 2026-09-13

## Mandatory cycle

1. Issues first.
2. Focused branch/PR second.
3. R0 research refresh when work depends on an evolving external target.
4. R1 reliability/compatibility contract before accepting a major target adapter.
5. Highest-priority unblocked roadmap work.
6. Exact-head tests/verification before acceptance claims.
7. README + canonical docs + memory-bank synchronization after coherent implementation batches.
8. Never fabricate runtime, account, publisher or marketplace evidence.

Runtime artifact preflight requires `config/runtime-artifacts.json` schema-v3 before artifact-dependent operations.

## Immediate action — #282 P13 provenance/diagnostics status synchronization

Classification: **ACTIVE / DOCS ONLY**.

Branch:

`docs/p13-v2-evidence-diagnostics-282`

Base main:

`801075561f22a1738219e58e9f39096705dc80ac`

Required surfaces only:

- `README.md`;
- `docs/P14_FOUNDATION_IMPLEMENTATION.md`;
- `memory-bank/PROJECT_STATE.md`;
- `memory-bank/NEXT_ACTIONS.md`.

Record the completed sequence:

- #275 / PR #279 — P13 analyzer semantic version `p13-core-v2`, analyzer-bound Build-Ready run identity, stale-v1 rejection in persisted evidence/P13→P14 handoff and analyzer-aware plugin/CLI parity;
- #280 / PR #281 — persisted evidence inspection states `VALID`, `EMPTY`, `INVALID`, `READ_FAILED`, `QUARANTINED`, bounded rejection reasons, exact diagnostics in the development P13 viewer and P14 Guided Prepare fresh-Audit guidance;
- valid-evidence behavior remains unchanged;
- production P14 registry remains empty and all P14 authority flags remain false.

Before merge, exact docs head must pass:

- CI;
- Integration Readiness;
- P12 Final Release Artifact;
- P12 Offline Acceptance on Windows/macOS/Ubuntu;
- clean review-thread state;
- current/mergeable branch state.

## After #282 — next P13/P14 implementation slice

Run a fresh focused gap audit before adding any new authority.

Preserve these current boundaries:

- P13 current analyzer identity is `p13-core-v2`;
- Build-Ready `runId` binds exact structural/config/analyzer semantics;
- stale/unsupported analyzer evidence fails closed and requires fresh Audit;
- Guided Prepare preview is development-only and read-only;
- proposed-change review manifest is evidence, not approval/confirmation;
- real P13 vertical-stack candidate is an opportunity signal only;
- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `mutationEnabled=false`;
- `confirmationEnabled=false`;
- production safe-recipe registry remains empty;
- no real retained-duplicate Figma mutation command/adapter is exposed;
- generated publishable release UI remains free of development-only P14 preview/review-binding controls;
- exact file/page/frame binding, current analyzer identity and fresh current-build/Frame evidence cannot be weakened.

Any future confirmation or mutation surface must be a separate explicit issue and must preserve plan integrity, registry authorization, reviewed-confirmation correlation, candidate-only mutation, runtime eligibility, validation/re-score, source-immutability and cleanup contracts.

## #159 — P13 real-plugin runtime/parity acceptance

Classification: **OPEN / required before real P14 mutation exposure**.

P13 implementation is complete, including analyzer-bound v2 provenance and the target-neutral vertical-stack opportunity signal, but genuine real-plugin runtime acceptance remains pending.

When genuine Figma evidence is available:

1. capture a traceable current plugin Build-Ready evidence bundle on the accepted real file/frame;
2. require current `p13-core-v2` analyzer identity and exact analyzer-bound run ID;
3. retain exact build/source identity and real file/page/frame context;
4. verify current P13 semantics, including safe-preparation opportunity evidence when actually present;
5. compare semantic plugin evidence with accepted CLI output through deterministic parity intake, including analyzer version in `sameRunIdentity`;
6. review mismatches explicitly rather than normalizing them away;
7. retain the final internal runtime-acceptance result.

#159 does not block target-neutral P14 core/read-only development. It remains a prerequisite before real P14 Figma mutation exposure.

## #84 — P12 retained release-exit truth

Classification: **ACTIVE / 80% / live evidence deferred to P27**.

Current retained publishing candidate remains:

- plugin ID `1680034649341961379`;
- source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`;
- Final Release Artifact #20;
- artifact `wp-builders-prepare-final-release-20`, ID `10179286885`;
- artifact digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`;
- exact three-file publish ZIP digest `sha256:1ccfa457d4ae4145cf36b748f7758187ef3092503c270a46f28e03675878a066`.

Do not treat later P13/P14 CI artifacts as replacement publisher evidence.

Deferred P27 evidence still requires genuine live proof for exact release package runtime rebind, valid Publish final-details state, publisher/account identity, required 2FA/security state and final internal release-exit review. Community review/approval remains external.

## #119 — commercial roadmap

Classification: **ACTIVE P13-P27 roadmap**.

Current state:

- P13 — implementation complete / real-plugin runtime acceptance pending (#159), with `p13-core-v2` analyzer-bound provenance and one real target-neutral safe-preparation candidate signal;
- P14 — deterministic core + fresh read-only Guided Prepare + review manifest/binding + persisted-evidence rejection diagnostics active in development; confirmation/mutation still unwired;
- P15-P26 — preflight frozen / implementation not started;
- P27 — final production-release gate defined, execution deferred (#182).

Future dependency order remains P14 -> R0/R1 as needed -> P15 Elementor -> P16 Gutenberg -> P17 code/static-first import -> P18 frameworks -> P19 assets/design-system -> P20 round-trip QA -> P21 handoff/QA -> P22 effort -> P23 agency/bindings -> P24 CMS/forms/interactions -> P25 entitlements -> P26 optional non-authoritative AI -> P27 final production release/evidence closure.

## Latest retained proof

### PR #279 — analyzer-bound P13 identity

- exact corrected head `b590d0c1652d153525f6fd1a6c8db95dba7e9d54`;
- CI #1026 — PASS;
- P12 Final Release Artifact #337 — PASS;
- P12 Offline Acceptance #381 — PASS Windows/macOS/Ubuntu;
- Integration Readiness did not trigger for the code-only diff;
- guarded squash merge `31c2ddcee932592a9f7357b1bba07c4009cac684`.

### PR #281 — persisted-evidence diagnostics

- exact head `e201f43a7b11355daa2b73c957f82ce397bb6003`;
- CI #1028 — PASS;
- P12 Final Release Artifact #339 — PASS;
- P12 Offline Acceptance #383 — PASS Windows/macOS/Ubuntu;
- Integration Readiness did not trigger for the code-only diff;
- guarded squash merge `801075561f22a1738219e58e9f39096705dc80ac`.

## Definition of done for #282

#282 is complete only when:

1. the four canonical docs/status files match post-#281 repository truth;
2. old #273 current-action references are removed;
3. no runtime/test/config files appear in the diff;
4. README status/schema contracts remain valid;
5. no roadmap percentage or production-authority claim is inflated;
6. CI + Integration Readiness + Final Release + cross-platform Offline Acceptance pass on the exact docs head;
7. review state is clean and guarded merge succeeds.

After that, continue P13/P14 from current repository truth rather than the pre-analyzer-v2 checkpoint.
