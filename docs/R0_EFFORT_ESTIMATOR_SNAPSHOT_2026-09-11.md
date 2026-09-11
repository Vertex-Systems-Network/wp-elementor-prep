# R0 Complexity / Effort Estimator Snapshot — 2026-09-11

Status: RESEARCH / PLANNING-ONLY  
Owner roadmap issue: #119  
Target phase: P22 — Deterministic Complexity / Effort Estimator + Proposal Inputs  
Dependencies: #84 P12 internal release exit; accepted P13-P21 evidence contracts  
Date: 2026-09-11

## 1. Purpose

P22 should estimate implementation effort from transparent project evidence, not from opaque AI guesses or market-price speculation.

The estimator is intended to help freelancers, agencies and development teams turn audited design/target evidence into defensible scope and effort inputs. It is not a promise of delivery time, a quote, a market-rate oracle, or a substitute for project-specific commercial judgment.

## 2. Frozen estimator principles

1. **Evidence first.** Factors come from accepted P13-P21 source/target/handoff evidence or explicit user/project declarations.
2. **Transparent formula.** Every contributing factor, coefficient and adjustment is visible in the machine receipt.
3. **No hidden AI pricing.** AI cannot invent hours, rates or client value inside the deterministic core.
4. **Complexity and price are separate.** Technical effort is estimated first; monetary conversion is optional and uses user/project-defined commercial rules.
5. **Ranges beat false precision.** Initial output should expose low/reference/high effort or effort units plus confidence rather than one exact hour count.
6. **Calibration required.** Hours cannot become production-authoritative until coefficient sets are calibrated against real completed work.
7. **Unknown work increases uncertainty, not invented certainty.** Missing CMS/data/content/integration details become assumptions/review/risk ranges.
8. **No double counting.** Shared complexity must not be charged once per symptom if one root factor already represents it.
9. **Reusable work is discounted transparently.** Repeated instances do not cost the same as unique first implementations.
10. **Target adapters have versioned effort profiles.** Elementor, Gutenberg, static HTML, Next.js, etc. can differ, but the model must explain why.
11. **QA burden is explicit.** Required import/render/interaction/responsive verification contributes effort separately from generation/build work.
12. **Manual-review burden is explicit.** P21 accessibility/SEO/manual-review items can add review work without pretending they are automatic implementation tasks.
13. **Change-only estimation is future-compatible.** P23 should later estimate deltas from baselines rather than full-project cost every time.
14. **User overrides are auditable.** Teams may configure rates/coefficients/presets, but overrides are versioned and visible in receipts.

## 3. Initial factor families

The estimator should begin with factors whose evidence can be defined clearly:

- page/frame count;
- section count;
- unique vs repeated section count;
- source component count / existing-component binding coverage;
- layout complexity and manual-layout debt;
- responsive-risk burden;
- target adapter/profile complexity;
- forms;
- navigation/menu patterns;
- carousels/tabs/modals/accepted interactions;
- CMS/dynamic-content scope only when explicitly declared;
- custom target fallback/unsupported mappings;
- asset/media burden;
- font/token/design-system burden;
- route count and dynamic route declarations;
- accessibility/SEO manual-review/remediation burden;
- round-trip QA viewport/state matrix;
- import/deployment/target-environment validation steps;
- content/data uncertainty;
- project-specific integration dependencies.

## 4. Non-factors by default

The deterministic estimator must not use these as hidden multipliers:

- client brand size;
- perceived wealth/budget;
- country/nationality/demographic traits;
- protected/sensitive characteristics;
- arbitrary “premium client” classification;
- urgency unless the user explicitly configures a commercial rush rule outside technical effort;
- market demand/competitor pricing guessed by AI;
- revenue/funding/deal value unless the user explicitly uses it in a separate value-pricing workflow outside the default estimator.

## 5. Work-unit boundary

Before calibrated hours exist, P22 should produce neutral `EFFORT_UNITS`.

An effort unit is a normalized relative workload quantity defined by a versioned coefficient model. It has no universal time value.

A project can optionally map effort units to hours using a calibrated team profile such as:

`hours = effortUnits × calibratedHoursPerUnit`

The conversion coefficient must come from retained project/team calibration or an explicit user declaration. Defaulting to an invented universal hours-per-unit value is forbidden.

## 6. Range model

Recommended first model:

- `LOW` — optimistic bounded case assuming declared dependencies and known mappings hold;
- `REFERENCE` — expected case under the selected coefficient/profile set;
- `HIGH` — bounded contingency for known uncertainty/review/fallback factors.

This is a deterministic scenario range, not a probabilistic confidence interval unless a later statistically calibrated model explicitly supports that claim.

## 7. Confidence model

Confidence should depend on evidence completeness, not on whether the estimate number is large or small.

Potential confidence inputs:

- source scan completeness;
- target profile selected;
- responsive evidence completeness;
- route/page mapping completeness;
- CMS/data declarations;
- interaction mapping completeness;
- asset/font closure;
- unsupported mapping count;
- P20 QA coverage;
- manual-review/unknown counts.

Suggested states:

- `HIGH`;
- `MEDIUM`;
- `LOW`;
- `INSUFFICIENT_EVIDENCE`.

## 8. Calibration boundary

Calibration uses completed work where estimated factors and actual effort are known.

A calibration record should retain:

- estimator model version;
- project/template class;
- target adapter/profile;
- factor vector at estimate time;
- predicted effort units/hours;
- actual tracked effort by work category if available;
- exclusions/interruption notes;
- variance;
- whether project is valid for coefficient fitting.

Calibration data must not silently alter production coefficients. New coefficient sets are versioned, reviewed and regression-tested.

## 9. Proposal boundary

P22 may produce structured proposal inputs, such as:

- scope summary;
- pages/sections/components;
- target/platform;
- included capabilities;
- exclusions;
- assumptions;
- estimated effort range;
- confidence;
- risk/unknown factors;
- optional user-defined commercial rates;
- optional line-item price calculation.

The estimator does not generate contractual promises by itself.

## 10. Pricing boundary

Optional pricing is downstream of technical effort.

Accepted user-configured models may later include:

- fixed amount per effort unit;
- hourly rate by work category;
- blended hourly rate;
- minimum project fee;
- explicit risk/contingency markup;
- explicit rush markup;
- explicit tax/discount rules.

Every commercial adjustment must be user/project configured and visible. P22 core does not scrape or guess “market price.”

## 11. R0 refresh triggers

Refresh before implementation if:

- P13-P21 factor schemas materially change;
- project history/calibration data becomes available;
- the estimator begins using statistical/probabilistic forecasting;
- monetary pricing becomes a first-class product surface;
- external market/rate data is introduced;
- AI-assisted estimating is proposed;
- P23 change-only regeneration/baseline logic changes the unit model;
- P24 adds accepted dynamic/CMS factors;
- target adapters change their implementation/QA burden materially.

## 12. Non-authorizing statement

This document is planning evidence only. It does not advance P12, authorize P22 implementation, define universal hours or prices, or make delivery-time guarantees.