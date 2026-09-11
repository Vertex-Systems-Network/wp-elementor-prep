# WP Builders Prepare

Deterministic Figma audit, safe-prep and build-readiness tooling for WordPress Elementor.

The core product prepares approved Figma designs for development **without visually redesigning them**, without requiring generative AI for correctness, and without network access in the current core plugin.

Current product surfaces:

- normal Figma plugin;
- npm/Node CLI for supported Figma inputs;
- deterministic ERROR / WARNING / INFO / IMPROVEMENT backlog;
- exact-build release/provenance tooling.

Current core flow:

`Figma/plugin-or-CLI input -> Audit -> classify -> score -> backlog -> plan -> candidate clone -> safe transform -> validate -> commit/rollback -> report`

Post-P12 product direction:

`Audit -> Build-Ready Score -> Responsive Risk -> Elementor Readiness -> Safe Prepare -> Re-score -> Build Plan -> Handoff/QA -> Agency workflow`

See `docs/COMMERCIAL_EXPANSION_PLAN.md` for the P13-P21 commercial expansion contract.

## Live development status

> **Progress policy:** implementation progress, runtime acceptance and external Community review are tracked separately. New future scope does not retroactively reduce already-completed historical core progress.

**Open PR/MR:** `0`

Open issue classification:

- `#84` — P12 final validation: active; manual/publisher/runtime exit gates remain.
- `#119` — P13+ commercial expansion: planned; implementation dependency-blocked by #84 internal exit.

PR #120 merged the P13-P21 planning baseline as `03b7ca6cf03229b606325a6719958afae1d4d564`. It changed planning/status documentation only; it did not add P13 runtime behavior or grant P12/P13 acceptance credit.

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | COMPLETE | 100% | `██████████` | Keep Issues -> PR/MR -> development lifecycle and status/provenance synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | `██████████` | None |
| P5 Conservative Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained real Figma Desktop/runtime closure |
| P6 Advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained real positive/refusal closure |
| P7 60+ Frame batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained 64-Frame stress + active cancellation closure |
| P8 Elementor exporter adapters | DEFERRED | N/A | `──────────` | Re-evaluate behind neutral/versioned adapters |
| P9 Actionable backlog generator | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real plugin export quality retained |
| P10 npm/Node CLI | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real REST/auth/plugin parity retained |
| P11 Normal Figma plugin distribution | IMPLEMENTATION COMPLETE | 100% | `██████████` | Current publish-ID live install/publisher evidence remains in P12 |
| P12 Final integrated validation | IN PROGRESS | 80% | `████████░░` | Current publish-ID package/account/2FA/exit review; Community approval external |
| P13 Build-Ready Score 2.0 + Responsive Risk | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Do not implement before #84 internal exit |
| P14 Advanced Safe Fix + Prepare Frame | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Requires proven read-only detectors |
| P15 Elementor Readiness + Build Plan | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Keep neutral model + versioned adapter boundary |
| P16 Design-system detector + token advisory | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Read-only first |
| P17 Developer handoff + client/QA readiness | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Build from accepted structured outputs |
| P18 Complexity / effort estimator | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Transparent/configurable factors only |
| P19 Agency presets + white label + project workflows | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Requires stable report/estimator contracts |
| P20 Free / Pro / Agency packaging + entitlements | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Commercial shell must not alter deterministic correctness |
| P21 Optional AI assistance | PLANNED / BLOCKED | 0% | `░░░░░░░░░░` | Isolated opt-in explainer/drafting layer only |

**Overall active project progress:** `██████████ 100%`

> Historical P0-P7 core progress remains 100%. P12 is a separately tracked final validation gate. P13-P21 are approved future scope at 0% and are not implementation-authorized yet.

## Current P12 publishing line

The retained publishing-ID package currently under manual P12 evaluation was produced from source:

`5f12b1d28146d5c2af815cc9f83eb30431dce4b5`

Figma-assigned publishing ID:

`1680034649341961379`

Verification on that publishing candidate passed:

- CI #709;
- Integration Readiness #145;
- P12 Offline Acceptance #64 on Linux/macOS/Windows;
- P12 Final Release Artifact #20;
- artifact `wp-builders-prepare-final-release-20`, ID `10179286885`;
- artifact digest `sha256:698d6620dac85af4bd1dba9c402bccc74192072da9af2a1031060903eeeb606f`.

Subsequent PR #120 changed planning/status documentation only. P12 final acceptance still requires explicit live evidence for whichever exact publishing package is designated at exit review; a later docs-only build is not treated as runtime acceptance merely because CI produced it.

These are real static/offline/reproducibility observations. They do **not** substitute for pending live publisher/account/runtime evidence.

## P12 current truth

Retained accepted slices include:

- cross-platform offline CLI/release behavior;
- real P5 Safe Fix/Desktop closure;
- real P6 positive/refusal closure;
- real P7 64-Frame sequential stress + active cancellation;
- real P9 plugin backlog/report export quality;
- real P10 credentialed REST execution, auth/error behavior and plugin/CLI parity;
- previous exact installed/private package runtime observation.

The live Community publish flow later proved that the previous development manifest ID was not valid as the publishing identity. The release was rebound to Figma-assigned ID `1680034649341961379` through PR #118 and Final Release Artifact #20.

P12 remains at `80%` until retained live evidence closes the current publish-ID package/account path and final internal exit review, including intended publisher identity/eligibility and 2FA where required by Figma.

Actual Figma Community submission/review/approval is external and must not be reported complete unless Figma actually confirms it.

## Safety invariants

- approved original design remains the visual source of truth;
- unsupported or ambiguous structures are refused, never guessed;
- unsafe findings become backlog items rather than guessed mutations;
- mutations occur only on candidate clones before mandatory validation;
- low confidence produces REVIEW, not mutation;
- plugin and CLI share one deterministic analysis core;
- raw proprietary `.fig` files are not parsed through undocumented reverse engineering;
- Elementor compatibility targets modern nested-container intent rather than legacy section/column assumptions;
- responsive analysis may report risk but may not invent mobile/tablet composition;
- commercial entitlements may gate surfaces, not correctness;
- optional AI may explain/summarize deterministic outputs but cannot authorize mutation, override confidence or replace validators.

## P13-P21 commercial expansion

Owner issue: `#119`.

Implementation is blocked until the internal P12 exit in `#84` closes.

### P13 — Build-Ready Score 2.0 + Responsive Risk

Read-only first:

- category-based readiness scoring;
- fixed-size/text-reflow/overflow/inflexible-layout risk;
- probable breakpoint failure evidence;
- section/frame summaries;
- no invented responsive design.

### P14 — Advanced Safe Fix + guided Prepare Frame

Only conditions already detectable read-only may become mutation candidates.

- proposed-change review;
- proven Auto Layout conversions;
- measured gap/padding and sizing fixes;
- text auto-height where validated;
- candidate -> full validation -> commit/rollback;
- before/after score after successful validation only.

### P15 — Elementor Readiness + deterministic Build Plan

- nested-container reconstruction guidance;
- row/column/flex intent;
- gap/padding/sizing guidance;
- overlay/carousel preservation notes;
- reusable repeated-structure guidance;
- warnings for avoidable custom CSS/JS burden;
- neutral build-plan model + versioned Elementor adapters.

### P16 — Design-system detector + token advisory

Read-only advisory first for repeated colors, typography, spacing, radii, effects, buttons/cards/forms and near-duplicate style candidates.

No automatic token/style merge until a separate safety specification exists.

### P17 — Developer handoff + client/QA readiness

- deterministic developer handoff report;
- Build-Ready / responsive / Elementor / design-system summaries;
- unresolved backlog;
- Safe Fix validation history;
- client/QA readiness state with exact reasons.

### P18 — Complexity / effort estimator

Transparent/configurable factors only:

- page/frame count;
- reusable vs unique sections;
- forms/carousels/navigation/component burden;
- responsive-risk burden;
- manual-layout debt;
- asset/media burden;
- complexity band + user-configurable effort units/hours.

No opaque AI market-price guessing. Monetary pricing rules remain user-defined.

### P19 — Agency layer

- saved presets;
- bounded custom audit rules;
- per-client/project standards;
- configurable estimator rules;
- white-label reports;
- sequential batch/project workflows;
- project baseline + re-audit comparison.

### P20 — Commercial packaging

Suggested value boundaries:

- **Free:** selected-frame audit, basic Build-Ready Score, limited backlog/report.
- **Pro:** full scoring, responsive risk, proven Safe Fix, Elementor Build Plan, handoff, design-system advisory, estimator.
- **Agency:** batch/project workflows, custom presets/rules, configurable estimator, white label, baseline comparison.

Any future licensing/account network layer must stay outside the neutral analysis core. No design content may leave Figma merely to verify a license.

### P21 — Optional AI assistance

Optional and non-authoritative.

Allowed uses include explaining deterministic findings, summarizing backlog, drafting developer notes, explaining mappings and turning deterministic effort factors into proposal narrative.

AI may not override confidence, change score evidence, replace validators, authorize unsafe mutation or silently invent responsive design.

## Current execution order

1. Finish genuine P12 current publish-ID install/publisher/2FA/final-exit evidence in #84.
2. Close P12 internal exit only when retained evidence supports it.
3. Open a focused P13 implementation issue from #119.
4. Prove P13 read-only score/risk behavior before any new P14 mutation.
5. Continue P14-P21 in dependency order; one focused issue/branch/PR per phase.

## Development and validation commands

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

Automated checks are evidence only for the properties they exercise. They are not substitutes for real Figma/runtime/account/Community observations.

## Runtime artifact registry

Machine-readable operational registry: `config/runtime-artifacts.json` schema v3.

The registry preserves exact-build identity and artifact provenance for runtime acceptance workflows.
