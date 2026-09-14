# Next Actions

Last updated: 2026-09-14

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

## Immediate action — #297 current security/parity status synchronization

Classification: **ACTIVE / DOCS ONLY**.

Branch:

`docs/post-security-p13-parity-297`

Base main:

`9955be0561807550a7ad1444d8d013d783820188`

Required surfaces only:

- `README.md`;
- `docs/P14_FOUNDATION_IMPLEMENTATION.md`;
- `memory-bank/PROJECT_STATE.md`;
- `memory-bank/NEXT_ACTIONS.md`.

Record the completed sequence through security hardening, analyzer-v2 offline parity and the current non-publishable P13 runtime artifact while preserving every P14 authority lock and the historical P12 publishing candidate.

Before merge, exact docs head must pass CI, Integration Readiness, P12 Final Release Artifact, P12 Offline Acceptance on Windows/macOS/Ubuntu, clean review-thread state and current/mergeable branch state.

## After #297 — genuine #159 Figma Desktop evidence

The current traceable operator artifact is `p13-runtime-evidence-9955be056180-analyzer-v2`, artifact ID `10343017256`, source `9955be0561807550a7ad1444d8d013d783820188`, digest `sha256:b3e5a07a5a012f9c1f4deec32389ad83a0e8550580f60de408db14644de5f1fe`.

Use it only for the real Figma Desktop evidence step. Repository CI cannot substitute for that runtime evidence. Preserve these boundaries:

- current analyzer `p13-core-v2`;
- exact analyzer-bound run identity;
- stale/forged evidence fails closed;
- Guided Prepare remains development-only/read-only;
- `acceptanceAuthority=false`;
- `targetCompatibilityClaim=false`;
- `mutationEnabled=false`;
- `confirmationEnabled=false`;
- production safe-recipe registry remains empty;
- no real retained-duplicate Figma mutation command/adapter is exposed;
- publishable release UI remains free of development-only P14 controls;
- #159 evidence is required before real P14 Figma mutation exposure.

## #159 — P13 real-plugin runtime/parity acceptance

Classification: **OPEN / required before real P14 mutation exposure**.

Current implementation and operator tooling are ready, but genuine real-plugin runtime acceptance remains pending. Use the current #295 artifact, not the superseded pre-analyzer-bound pack.

Required genuine sequence:

1. import the current development artifact in Figma Desktop;
2. open the intended accepted real file/frame and run Audit on exactly one current Frame;
3. open the P13 runtime evidence developer viewer and copy the exact evidence JSON unchanged;
4. require `p13-core-v2`, exact analyzer-bound run ID, traceable build identity and real file/page/frame context;
5. generate/use the matching current CLI Build-Ready report for that exact deterministic identity;
6. run the current `p13:runtime-parity` intake;
7. review any mismatches explicitly rather than normalizing them away;
8. retain a separate internal runtime-acceptance decision.

#159 does not block target-neutral P14 core/read-only development. It remains a prerequisite before real P14 Figma mutation exposure.

## #287 — repository-admin security enforcement

Classification: **OPEN / ADMIN-LEVEL RESIDUAL**.

Code-side supply-chain and pixel-broker security hardening is merged, but `main` branch protection/ruleset enforcement requires GitHub administration access unavailable to the current connector. Required admin controls remain PR enforcement, conversation resolution, blocking force-push/deletion and required exact-head CI/release/offline checks. Do not describe this repository setting as fixed until it is actually enabled.

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

### PR #286 — supply-chain hardening

- guarded squash merge `245a045fcbc30bd2ec81edb06dba65119e358a50`;
- CI #1048, Integration Readiness #362, Final Release #359 and Offline #403 — PASS;
- locked npm advisory scan — 0 vulnerabilities.

### PR #293 — P3 pixel-broker hardening

- guarded squash merge `47dbc078b0a41cbbe5301d6e0d95d5ca33cc8721`;
- CI #1054, Final Release #365 and Offline #409 — PASS;
- Integration Readiness did not trigger for the code-only diff.

### PR #294 — offline analyzer-v2 parity

- guarded squash merge `9955be0561807550a7ad1444d8d013d783820188`;
- exact head `68189da1fba9b42610cc932e1193851c8c7e9636`;
- CI #1056, Final Release #367 and Offline #411 — PASS;
- Integration Readiness did not trigger for the code-only diff.

### Issue #295 — current P13 runtime evidence artifact

- run `34833881774`;
- artifact ID `10343017256`;
- digest `sha256:b3e5a07a5a012f9c1f4deec32389ad83a0e8550580f60de408db14644de5f1fe`;
- artifact branch returned to zero content diff;
- artifact remains non-authorizing/do-not-publish.

## Definition of done for #297

#297 is complete only when:

1. the four canonical docs/status files match current main/security/parity/artifact truth;
2. stale #282 current-action references and old current-main SHA are removed from active status text;
3. no runtime/test/config/workflow files appear in the final diff;
4. README status/schema contracts remain valid, including the exact P14 status token and empty production registry wording;
5. no runtime, compatibility or production-authority claim is inflated;
6. CI + Integration Readiness + Final Release + cross-platform Offline Acceptance pass on the exact docs head;
7. review state is clean and guarded merge succeeds.

After that, proceed from the genuine #159 operator evidence step or another explicitly non-authorizing P14 slice; do not simulate real-Figma acceptance.
