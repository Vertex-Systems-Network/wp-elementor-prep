# Commercial Expansion Plan

Status: PLANNED / IMPLEMENTATION BLOCKED BY P12 INTERNAL EXIT  
Owner issue: #119  
Date: 2026-09-11

## 1. Product direction

WP Builders Prepare should evolve from a deterministic Figma audit utility into a **Figma -> build-ready website workflow**.

Primary commercial promise:

> Turn approved Figma designs into safer, more structured, developer-ready website builds before implementation begins.

Elementor remains the first reconstruction target, but the analysis engine stays neutral and adapter-based so future Webflow, Shopify or React-oriented outputs do not destabilize the core.

The product must increase value without weakening the existing guarantees:

- deterministic core behavior;
- explainable evidence;
- audit before mutation;
- original visual design remains authoritative;
- low confidence produces REVIEW, not a guessed transformation;
- every mutation is candidate -> validate -> commit/rollback;
- core plugin remains AI-free and network-free;
- no customer/template-specific node IDs or copy in product logic;
- modern Elementor nested-container intent, not legacy section/column hard-coding;
- implementation-complete and production-accepted remain separate states.

## 2. Commercial user outcomes

The expansion should serve three primary customer groups.

### Individual designer/developer

Needs to know whether a design will be painful to build, what will break responsively, and which issues can be safely repaired before handoff.

### Freelancer / small studio

Needs faster estimates, stronger handoff, fewer revision cycles, reusable standards and a visible before/after readiness improvement.

### Agency / team

Needs batch processing, custom rules, white-label reports, repeatable QA standards, project presets and defensible effort estimates.

## 3. Canonical end-user flow

The future product flow should remain progressive and safety-gated:

1. **Select scope** — one Frame first; controlled multi-Frame/project mode only where already proven safe.
2. **Audit** — deterministic scan, normalized model, classifiers and evidence.
3. **Build-Ready Score** — overall and category scores with exact causes.
4. **Responsive Risk** — identify probable breakpoint failures without inventing a tablet/mobile design.
5. **Elementor Readiness** — explain reconstruction risks against modern nested-container intent.
6. **Backlog** — convert unresolved findings into deterministic prioritized work.
7. **Prepare Frame** — offer only already-proven Safe Fix actions; every action remains transactional.
8. **Validate** — geometry, text, image, structure and rendered-pixel checks.
9. **Re-score** — show before/after change and remaining REVIEW items.
10. **Build Plan** — emit deterministic implementation guidance for Elementor.
11. **Handoff / QA report** — export developer/client-ready evidence.
12. **Agency layer** — optionally apply custom presets, pricing rules, branding and batch policies.
13. **Optional AI assistance** — only after deterministic results exist; AI may explain/summarize but never authorizes unsafe mutation or replaces core scoring.

## 4. Post-P12 phase sequence

The sequence below is intentionally ordered around the repository's safety rules. A later phase cannot use a capability that has not first been proven read-only and testable.

### P13 — Build-Ready Score 2.0 + Responsive Risk

**Mode:** read-only first.

Goals:

- evolve readiness from one aggregate score into a clear production-readiness model;
- report desktop structural quality plus probable tablet/mobile reconstruction risk;
- make the score understandable enough to become a product-led acquisition surface.

Proposed score dimensions:

- Structure;
- Responsive Risk;
- Elementor Readiness;
- Consistency;
- Accessibility/QA advisories where deterministically measurable;
- Handoff Readiness.

Responsive risk detectors may inspect:

- fixed widths/heights;
- inflexible horizontal groups;
- text clipping/reflow risk;
- unexpected overflow;
- minimum viable content width;
- dense multi-column layouts;
- image/media wrappers;
- absolute normal-content dependencies;
- breakpoint-sensitive gaps/padding;
- navigation/button clusters.

Non-goal: inventing responsive layouts, reordering content or generating a new mobile design.

Acceptance gate:

- deterministic fixtures and cross-template tests;
- every risk includes evidence and confidence;
- no design mutation in P13;
- score changes are versioned and regression-tested.

### P14 — Advanced Safe Fix + guided `Prepare Frame`

**Mode:** mutation only for patterns already detectable and explainable.

User experience:

- `Prepare Frame` shows proposed changes first;
- user can apply all eligible fixes or inspect individually;
- each fix exposes expected impact, confidence and validation requirements;
- before/after score is shown only after successful validation.

Potential safe-fix families:

- proven Auto Layout conversions;
- gap/padding normalization where measured geometry is unambiguous;
- Hug/Fill sizing corrections where desktop geometry is preserved;
- text auto-height fixes with pixel/content validation;
- repeated-structure normalization where a proven recipe already exists;
- generic naming cleanup only when it does not alter semantic meaning;
- normal-flow cleanup around legitimate overlays without removing the overlay.

Hard rule: no new auto-fix ships until the same condition is already reported read-only.

Acceptance gate:

- candidate clone only;
- full validator stack;
- commit or rollback;
- one logical undo/restore path;
- rejection tests for ambiguous and image-sensitive examples;
- real Figma runtime evidence before production acceptance.

### P15 — Elementor Readiness + Elementor Build Plan

**Mode:** read-only deterministic mapping; exporter remains adapter-isolated.

Outputs:

- Elementor Readiness score;
- section/container reconstruction map;
- nested-container hierarchy;
- row/column/flex direction intent;
- gap/padding intent;
- Hug/Fill -> content/flexible sizing guidance;
- legitimate absolute overlays called out explicitly;
- repeated cards/stats/facts identified as reusable structures;
- carousel/viewport intent preserved;
- warnings for layouts likely to require unnecessary custom CSS/JS;
- heading/text/image/button/icon/navigation mapping suggestions where confidence is high.

`Elementor Build Plan` should be structured data first, with human-readable export as a presentation layer.

It must not hard-code one Elementor JSON version. Versioned adapters remain the compatibility boundary.

### P16 — Design-System Detector + Token Advisory

**Mode:** read-only advisory first.

Detect and summarize:

- repeated colors;
- typography families/sizes/weights/line heights;
- spacing patterns;
- radii;
- shadows/effects;
- button patterns;
- card patterns;
- form-control patterns where recognizable;
- likely duplicate near-equivalent styles;
- likely variables/styles/component candidates.

Output:

- candidate tokens;
- frequency/evidence;
- duplicate/near-duplicate warnings;
- consistency score contribution;
- exportable token advisory.

Non-goal: automatically merging styles or replacing design tokens until a separate mutation-safety specification is accepted.

### P17 — Developer Handoff + Client/QA Readiness

Add deterministic reports for two audiences.

**Developer Handoff**

- Build-Ready Score and category breakdown;
- unresolved findings;
- Elementor Build Plan;
- typography/color/spacing summary;
- repeated structures;
- image/media notes;
- responsive-risk notes;
- Safe Fix changes applied and validation result;
- export to JSON/Markdown first, then presentation formats where appropriate.

**Client / QA Mode**

Read-only checks may include:

- placeholder copy markers;
- missing/empty CTA labels;
- inconsistent button patterns;
- heading hierarchy advisories;
- incomplete mobile/tablet variants when the file explicitly contains variant Frames;
- duplicated/inconsistent visual tokens;
- missing states/components where deterministically observable;
- unresolved high/medium severity backlog items.

Output state should be something like `READY FOR HANDOFF`, `REVIEW`, or `NOT READY`, with exact reasons.

### P18 — Deterministic Complexity / Effort Estimator

Purpose: turn audit data into a defensible scoping assistant for freelancers and agencies.

Inputs may include:

- unique pages/Frames;
- unique vs reusable sections;
- forms;
- carousels/sliders;
- complex navigation;
- repeated cards/grids;
- overlays/animation placeholders where explicitly represented;
- responsive-risk burden;
- design-system consistency;
- unresolved manual-layout debt;
- asset/media burden;
- custom-component count.

Outputs:

- complexity band: Low / Medium / High / Custom;
- estimated effort units or hours based on user-configurable rules;
- confidence and contributing factors;
- reusable vs one-off work split.

Rules:

- no opaque AI guessing in the base estimator;
- default estimator ships as transparent configurable weights;
- monetary pricing is user-configurable and never presented as a universal market price;
- estimator changes require deterministic test fixtures.

### P19 — Agency Presets + Custom Rules + White Label

Commercial agency layer:

- saved audit presets;
- custom required checks;
- per-client/project standards;
- reusable Elementor reconstruction policies;
- configurable complexity/effort rules;
- batch processing using the already-proven sequential queue model;
- white-label handoff/QA reports;
- company name/logo/report footer fields;
- reusable report templates;
- project-level baseline and re-audit comparison.

Custom rules must use bounded supported rule primitives. Arbitrary executable user code is out of scope for the plugin runtime.

### P20 — Commercial Packaging / Entitlements

Define product tiers without coupling correctness to payment availability.

Suggested commercial packaging:

**Free**

- selected-frame audit;
- basic Build-Ready Score;
- core findings/backlog preview;
- limited report/export surface.

**Pro**

- full category scoring;
- responsive-risk analysis;
- proven Safe Fix / Prepare Frame;
- Elementor Readiness + Build Plan;
- full handoff exports;
- design-system advisory;
- complexity/effort estimator.

**Agency**

- batch/project workflows;
- custom presets/rules;
- configurable estimator policies;
- white-label reports;
- project baselines/comparisons;
- higher-volume workflow controls.

Architecture rules:

- entitlements gate surfaces, not deterministic correctness;
- audit engine behavior for an enabled feature cannot depend on a remote LLM;
- payment/account integration must remain outside the neutral analysis core;
- if network access is ever required for licensing/account functionality, it must be explicitly documented, narrowly scoped and separately accepted before the current `allowedDomains: ["none"]` contract is changed;
- no design content leaves Figma merely to verify a license.

### P21 — Optional AI Assistance

AI is an optional assistant layer, never the correctness engine.

Allowed candidate capabilities:

- explain a deterministic finding in simpler language;
- summarize a long backlog into prioritized actions;
- generate developer notes from already-computed structured results;
- explain why an Elementor mapping is recommended;
- help turn deterministic effort factors into a human-readable proposal narrative.

Forbidden roles:

- deciding whether an unsafe mutation is acceptable;
- overriding confidence thresholds;
- replacing geometry/content/image/pixel validation;
- inventing responsive designs and silently applying them;
- changing the readiness score without deterministic evidence;
- sending design screenshots/content externally without an explicit future privacy specification and user consent.

Any AI module must be separately enabled, separately documented and fail without affecting the deterministic core workflow.

## 5. Product-led growth surfaces

Commercial growth should come from useful outputs, not intrusive telemetry.

Planned growth mechanics:

- visible before/after Build-Ready Score;
- shareable handoff/QA summary;
- `Production Ready` / `Review Required` status with evidence;
- agency-branded reports;
- reusable presets that increase retention;
- project re-audit comparison that shows progress over time;
- clear free -> Pro -> Agency value boundaries;
- Elementor-specific positioning as the first strong niche differentiator.

Suggested product message:

> **Turn Figma designs into build-ready websites.** Audit structure, catch responsive problems, safely fix proven issues, and generate a developer-ready Elementor handoff before development begins.

## 6. Architecture boundaries

The future stack should remain layered:

```text
Figma / CLI source adapters
        |
        v
Normalized neutral model
        |
        +--> deterministic audit/classifier/scoring
        +--> responsive-risk engine
        +--> design-system advisory
        +--> complexity estimator
        |
        +--> recipe planner -> transaction/validation -> safe commit/rollback
        |
        +--> neutral build-plan model
                 |
                 +--> Elementor adapter
                 +--> future adapters

Presentation / commercial shell
        +--> reports / white label / presets
        +--> entitlements
        +--> optional AI explainer (isolated)
```

No commercial or AI layer may be imported into the pure core in a way that changes deterministic results for the same enabled feature/input/version.

## 7. Acceptance and release model for P13+

Every phase must have:

1. a focused issue with explicit acceptance criteria;
2. issue-first / PR-second queue processing before implementation;
3. deterministic fixtures and tests for every classifier/score/recipe/estimator change;
4. focused branch + PR;
5. status/typecheck/test/build/release checks as applicable;
6. memory-bank + README synchronization in the same work cycle;
7. real Figma Desktop/runtime evidence for behavior that cannot be proven offline;
8. implementation-complete and production-accepted tracked separately;
9. no fabricated evidence for external/payment/Community/AI-provider behavior.

## 8. Current gate

Planning is approved under issue #119, but **P13 implementation must not begin until the internal P12 release-exit gate in #84 is closed**.

Actual Figma Community review/approval remains an external action and must never be reported as complete without Figma's real confirmation.
