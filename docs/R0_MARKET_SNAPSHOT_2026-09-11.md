# R0 Market / Platform Snapshot — 2026-09-11

Status: RETAINED PLANNING EVIDENCE · NON-AUTHORIZING  
Owner issue: #119  
Implementation dependency: #84 internal P12 exit

## Purpose

This snapshot records a fresh public-market scan for the post-P12 commercial roadmap. It is planning evidence only. It does not authorize P13-P26 implementation, does not prove target compatibility, and does not replace official target-platform documentation during adapter implementation.

The scan is intentionally split into:

- **platform evidence** — first-party platform pages used to understand category direction;
- **competitor signals** — vendor claims/pricing used to understand customer expectations and positioning;
- **product decisions** — bounded roadmap implications that still require R1 contracts and real acceptance evidence.

Competitor marketing is never used as a target schema/API authority.

## 1. Market signals retained

### UiChemy — WordPress-native conversion pressure

Current public pricing advertises:

- Free: `$0/mo`, 1,000 credits;
- Designer: `$9/mo`, 4,000 credits;
- Studio: `$29/mo`, 12,000 credits plus MCP/API access;
- Agency: `$49/mo`, 20,000 credits and larger seat/site capacity.

Source: https://uichemy.com/pricing/

Current Elementor workflow documentation describes:

- a top-level Frame flow with `Copy to Clipboard` or `Live Import` / manual template download;
- selected-section transfer using `Copy to Clipboard`;
- WordPress as the destination workflow rather than generic code-only output.

Source: https://uichemy.com/docs/figma-design-to-elementor-using-uichemy/

Current Atomic Elements documentation describes an Elementor v4 path in addition to v3-oriented workflows and maps Auto Layout/Frames/text to Atomic primitives.

Source: https://docs.uichemy.com/tagging-library/elementor/atomic-elements

Reliability note: UiChemy pages are not perfectly consistent about the timing/state of Gutenberg and Bricks support. Those claims are therefore treated as **market signals only**, not as a reliable external capability contract.

Commercial signal: the market already expects a very short `select -> convert -> copy/import` WordPress path. WP Builders Prepare must match the speed expectation while differentiating on deterministic readiness checks, explicit mapping coverage, failure diagnostics and proof.

### Anima — configurable design-to-code is commodity pressure

Current Figma plugin documentation advertises:

- React, Vue and HTML;
- React JavaScript/TypeScript;
- CSS, Tailwind, Styled Components, CSS Modules, SASS/SCSS;
- UI-library options;
- preview, copy-code and downloadable ZIP flows.

Source: https://support.animaapp.com/en/articles/11721866-anima-figma-plugin-design-to-code-in-figma

Current pricing says the Free plan includes five Figma-plugin code generations.

Source: https://www.animaapp.com/pricing

Anima also exposes API/agent-facing workflows for coding assistants.

Source: https://support.animaapp.com/en/articles/11722262-anima-api-figma-to-code-clone-any-site

Commercial signal: framework/language/styling selectors are expected product UX, not sufficient differentiation by themselves.

### Locofy — framework breadth, CLI and component binding pressure

Current public documentation lists web targets including React, Next.js, HTML/CSS, Gatsby, Vue and Angular, plus multiple mobile targets and UI-library choices.

Sources:

- https://www.locofy.ai/convert/design-to-code
- https://www.locofy.ai/docs/plugin/quickstart/

Locofy also documents:

- a terminal/CLI conversion flow from a Figma URL;
- existing-code component mapping for supported projects.

Sources:

- https://www.locofy.ai/docs/cli/quickstart/
- https://www.dev.locofy.ai/docs/plugin/design-system/overview/

Commercial signal: P18/P23 must eventually support professional codebase integration, not only greenfield ZIP generation.

### Builder.io — Figma + repository + agent workflow packaging

Current Builder Code pricing advertises:

- Free: `$0/user/mo`;
- Pro: `$24/user/mo`;
- Team: `$40/user/mo`;
- Figma plugin, source-control connections, editor/agent workflows and higher-tier team capabilities.

Source: https://www.builder.io/pricing

Commercial signal: agent/Git/API connectivity can be valuable later, but it should not enter the deterministic core before target correctness and offline validation are stable.

### Figma itself — generic design-to-code is no longer a defensible moat

Current Figma first-party pages now market:

- design-to-code directly on the canvas;
- code layers;
- Figma Make/local-code workflows;
- MCP/agent workflows;
- code-to-canvas direction.

Sources:

- https://www.figma.com/solutions/figma-to-code-converter/
- https://www.figma.com/blog/code-on-the-figma-canvas/
- https://www.figma.com/ai/

Commercial signal: WP Builders Prepare should not position itself primarily as another generic `Figma -> code` generator.

## 2. Product positioning confirmed by research

Primary differentiation remains:

`Audit -> Target Compatibility -> Target-Ready Duplicate -> Native/Declared Mapping -> Artifact Validation -> Environment/Import Diagnostics -> Render Verification -> Round-Trip Proof -> Receipt`

The sellable promise is **reliability before and after conversion**, not conversion alone.

Recommended positioning language:

> Validate it. Prepare it safely. Export it natively. Prove it still matches.

This is a planning direction, not final marketing copy.

## 3. Roadmap refinements confirmed

### P15 — Elementor / Elementor Pro

Add an explicit **environment preflight and diagnostics layer** in addition to design compatibility:

- selected Elementor adapter family/version;
- Core vs Pro capability profile;
- import/package family being generated;
- observable WordPress/Elementor environment facts when a future bridge/harness can read them;
- upload/import/PHP-memory/time/security/REST blockers only when actually observed or declared;
- `DECLARED ENVIRONMENT` and `OBSERVED ENVIRONMENT` remain separate.

A locally valid JSON/ZIP is never labeled `IMPORT VERIFIED` without a real target observation.

### P15-P20 — capability matrix becomes user-facing value

Each important node/section mapping should resolve to an explicit status such as:

- `NATIVE`;
- `NATIVE + CSS`;
- `VISUAL ASSET FALLBACK`;
- `MANUAL REVIEW`;
- `UNSUPPORTED`.

Fallback strategy must never change silently. The selected strategy belongs in the export report/receipt and round-trip QA.

### P15/P16/P20 — section transfer must be fast but documented

The market expects `select section -> transfer` speed. WP Builders Prepare should provide it through:

1. documented native target artifact where possible;
2. downloadable section artifact;
3. our own versioned `WP Builders Bridge` payload/receiver;
4. direct authenticated site push only under a separately accepted networked module.

Do not base the product on an undocumented private Elementor clipboard schema.

### P18 — neutral semantic IR remains mandatory

A safely inferred layout/component/token intent should be reusable across targets so a user does not need to re-tag or re-prepare the same design separately for Elementor, Gutenberg, HTML, React, Vue, etc.

Target adapters may still reject or review unsupported intent; shared IR is not permission for lossy silent conversion.

### P23 — component bindings and change-only regeneration stay high priority

Competitive code tools already emphasize existing component libraries. Agency/developer retention improves if the product can map Figma components to codebase-owned components and regenerate only changed sections after accepted target adapters are stable.

### P25 — usage/credit policy

If future commercial packaging uses credits/usage units:

- validation refusal must not consume paid usage;
- failed generation must not consume paid usage;
- cancelled generation before the defined success boundary must not consume paid usage;
- charging/entitlement should occur only after a clearly defined successful artifact-generation boundary;
- correctness validators must run regardless of plan/entitlement.

This is a commercial-policy requirement, not a commitment to use credits.

### P25 — pricing remains a hypothesis

Observed competitor pricing spans low-cost WordPress subscriptions through higher per-seat code/agent products. Therefore:

- do not hard-code final WP Builders Prepare prices in the runtime or roadmap yet;
- retain Free / Pro / Agency packaging as the structural hypothesis;
- test price points only after P15-P20 provide accepted evidence about real user value, compute/support cost and conversion friction;
- do not copy a competitor's price ladder merely because it exists today.

### P23/P26 — API/MCP/agent access later, not first

Market demand exists for CLI/API/MCP/agent integration. It remains a later Pro/Agency surface and must call the same accepted deterministic core/validators. It cannot bypass R1, target profiles, source-staleness checks or receipts.

## 4. Sales/retention implications

The commercial plan should optimize for four measurable user outcomes:

1. **Fewer failed imports/builds** — target/environment blockers are caught early.
2. **Less cleanup after conversion** — target-ready duplicate + native mapping + explicit fallbacks.
3. **Faster repeat work** — reusable semantic IR, component bindings, presets and change-only regeneration.
4. **Higher client trust** — visible readiness states, reports and round-trip proof instead of unsupported `pixel perfect` guarantees.

Future product analytics should measure these outcomes when privacy/network architecture explicitly permits it. The current offline Community core must not add telemetry merely to measure them.

## 5. Reliability conclusions

This market refresh does **not** change the R1 rules. It reinforces them:

- capability-driven UI prevents impossible option combinations;
- target/profile/options changes invalidate stale results;
- output generation is atomic;
- no partial artifact is offered as success;
- no silent fallback;
- package validity and live import/render verification are separate states;
- framework exports build against pinned matrices;
- untrusted code remains static-first / sandbox-gated;
- optional AI cannot authorize mutations or override validators.

## 6. Acceptance / dependency impact

- #84 remains the hard internal gate before P13 runtime implementation.
- P13-P26 remain `0% / PLANNED-BLOCKED` until that internal exit.
- Before P15, P16, P17 and P18 implementation, R0 must be refreshed against then-current official target documentation and market behavior.
- Every adapter still requires its R1 TargetProfile/capability/error/validator/harness freeze before implementation.
- This snapshot grants no production acceptance percentage.
