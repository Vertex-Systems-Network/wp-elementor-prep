# Next Actions

Last updated: 2026-09-11

## Current policy

Every work cycle keeps the same mandatory order:

1. Issues first;
2. PR/MR second;
3. highest-priority unblocked roadmap work third;
4. tests/verification before acceptance claims;
5. README + memory-bank sync in the same cycle;
6. no fabricated runtime/external evidence.

## Current queue classification

### #84 — P12 final integrated validation/release acceptance

Classification: **external/manual runtime + publisher gate; active**.

Retained at `80%` until the current publishing-ID package/account flow and final exit review are genuinely retained.

Current publish identity:

- Figma-assigned plugin ID `1680034649341961379`;
- current main `5f12b1d28146d5c2af815cc9f83eb30431dce4b5`;
- P12 Final Release Artifact #20;
- artifact `wp-builders-prepare-final-release-20`, ID `10179286885`;
- artifact digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`.

Required next retained evidence:

1. exact current publish-ID package used in Figma Desktop;
2. live final-details flow with the new ID accepted and no invalid-ID error;
3. intended `Publish as` identity/eligibility visible;
4. 2FA enabled where required by Figma;
5. network disclosure remains consistent with the release contract unless a separately accepted change occurs;
6. final internal release-exit review.

Actual Figma Community submission/review/approval remains external. Submission is not approval.

### #119 — P13+ commercial expansion roadmap

Classification: **dependency-blocked by #84 internal exit**.

Planning/docs are allowed. Implementation is not.

Approved phase order:

1. P13 — Build-Ready Score 2.0 + Responsive Risk;
2. P14 — Advanced Safe Fix + guided Prepare Frame;
3. P15 — Elementor Readiness + deterministic Build Plan;
4. P16 — design-system detector + token advisory;
5. P17 — developer handoff + client/QA readiness;
6. P18 — deterministic complexity/effort estimator;
7. P19 — agency presets/custom rules/white label/project workflows;
8. P20 — Free / Pro / Agency packaging + entitlement boundaries;
9. P21 — optional AI assistance, isolated and non-authoritative.

Detailed contracts: `docs/COMMERCIAL_EXPANSION_PLAN.md`.

## Immediate executable order

### While #84 is still open

- do not start P13 implementation;
- complete only genuine P12 publisher/install/exit evidence work or safe documentation/planning maintenance;
- keep the new commercial roadmap synchronized without granting implementation progress;
- if the user changes Community/payment strategy, record the choice as a new explicit decision before changing runtime/network contracts.

### After #84 internal exit closes

Open a focused P13 implementation issue from #119 and execute this sequence:

1. freeze Build-Ready Score v2 dimensions and versioning contract;
2. define responsive-risk evidence schema;
3. add fixtures for fixed-width, overflow, dense-row, text-reflow and legitimate-overlay cases;
4. implement read-only detectors only;
5. add deterministic tests and plugin/CLI parity tests;
6. expose section/frame score breakdown in UI/report;
7. collect real Figma calibration where offline fixtures cannot prove behavior;
8. only after P13 acceptance may P14 add new mutation behavior.

## Guardrails for later phases

- P14 cannot auto-fix a condition P13/earlier classifiers cannot already explain read-only.
- P15 emits a neutral Build Plan first; Elementor-specific serialization remains adapter-isolated.
- P16 is advisory before any design-token mutation.
- P18 estimator factors/weights are transparent, configurable and tested.
- P20 entitlements gate surfaces, not correctness; no design content leaves Figma merely to verify a license.
- P21 AI cannot override confidence, validation, score evidence or transaction safety.

## Verification baseline

For any future implementation batch, run the relevant subset of:

```bash
npm install
npm run status:verify
npm run typecheck
npm test
npm run build
npm run build:cli
npm run verify:release-contract
npm run test:release-package
npm run community:verify
npm run p12:offline
npm run integration:readiness
```

Runtime artifact preflight requires exact-build provenance, immutable file/manifest checks and the active schema-v3 registry contract.

## Progress tracking

- historical P0-P7 core: `100%`;
- P9: `100%`, accepted real plugin export quality;
- P10: `100%`, accepted real REST/auth/plugin parity;
- P11 implementation: `100%`;
- P12 final validation: `80%`;
- P13-P21: `0%`, planned/dependency-blocked.
