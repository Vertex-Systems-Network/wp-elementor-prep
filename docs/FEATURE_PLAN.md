# Feature Plan

Date: 2026-09-07  
Post-P12 expansion added: 2026-09-11

> The P0-P8 headings below are the original foundation feature plan. The live phase numbering and completion truth are maintained in `memory-bank/ROADMAP.md`. Post-P12 commercial expansion uses the current live numbering P13-P21.

## P0 — Core audit foundation

### Selection + scanner
- Accept exactly one selected top-level desktop frame for MVP.
- Traverse only the selected subtree.
- Normalize frame/text/image/vector metadata into a lightweight internal tree.
- Collect layout mode, sizing, geometry, clipping, fills, effects, text bounds, child count, parent relation and semantic-name quality.

### Section discovery
- Detect likely page/content wrapper.
- Detect direct section candidates from vertical ordering, full-width behavior and known semantic names when available.
- Never require names like `sec/about`; names are hints only.

### Readiness scoring
- Global score and per-section score.
- Explain each score with explicit findings.
- Penalize manual normal-content layout, fixed text heights, unnecessary spacer nodes, excessive generic wrappers, fragmented repeated content and unsafe absolute positioning.
- Reward Auto Layout, logical nesting, consistent gaps/padding, editable content and clean repeated patterns.

### Audit UI
- Selected frame summary.
- Overall score.
- Section list with PASS / REVIEW / FAIL-like states.
- Expandable reasons and recommended recipe.
- No mutations in P0.

## P1 — Layout classifier

- Horizontal row detector.
- Vertical stack detector.
- Two-column detector.
- Grid detector with X/Y clustering.
- Repeated-card detector.
- Split-header detector.
- Facts/list detector.
- Footer-column detector.
- Carousel/track detector.
- Timeline/chapter detector.
- Background/decorative classifier.
- Confidence score with evidence payload.

## P2 — Integrity + visual validation

- Geometry snapshot before/after.
- Text-content fingerprint.
- Image-fill fingerprint.
- Node-count sanity checks.
- Section-level PNG export.
- Canvas-based pixel diff in plugin UI.
- Configurable/calibrated thresholds.
- Validation report with exact failure reason.

## P3 — Transaction engine

- Clone selected section/candidate.
- Run transform only on candidate.
- Validate candidate.
- Commit by swap on pass.
- Delete candidate on fail.
- One logical undo checkpoint per successful section where practical.
- Restore command for last plugin-produced transformation.

## P4 — Safe recipes

- Vertical Stack.
- Horizontal Row.
- Two Column.
- Split Header.
- Facts List.
- Button Group.
- Footer Columns.
- Simple Card Grid.
- Metric Grid.
- Social/Link Strip.

Only high-confidence patterns auto-fix by default.

## P5 — Advanced recipes

- Timeline chapter.
- Alternating timeline.
- Carousel viewport + track.
- Fragmented card synthesis.
- Milestone/timeline grid.
- Intentional overlay/media composition.
- Page/App vertical normalizer.

## P6 — Batch productivity

- Queue multiple selected frames.
- Later: controlled page-by-page queue.
- Progress, cancel, resume.
- Per-frame report artifact.
- Skip already-processed nodes based on plugin-private metadata + version.

## P7 — Design-system advisory

Read-only advisory first:
- repeated colors,
- repeated typography,
- repeated button/card patterns,
- likely global styles/variables candidates.

Do not create a design system automatically until a separate safety specification exists.

## P8 — Optional Elementor exporter

Not part of initial MVP.

Potential adapters:
- classic modern Container JSON adapter,
- atomic-element adapter when stable/required,
- widget mapping for heading/text/image/button/icon/navigation/counter,
- responsive settings adapter,
- asset export manifest.

Exporter must be version-aware and isolated from the Figma audit core.

## Explicit non-goals for early versions

- Generating or rewriting content.
- Inventing mobile/tablet designs.
- Altering typography/colors to make layout easier.
- AI-based layout interpretation.
- One-click destructive conversion without validation.
- Hard-coding one customer/template’s node IDs or copy.

# Post-P12 commercial expansion

Detailed contracts live in `docs/COMMERCIAL_EXPANSION_PLAN.md`. The order below is dependency-sensitive and must not be collapsed into one large implementation batch.

## P13 — Build-Ready Score 2.0 + Responsive Risk

Read-only first.

- category-based Build-Ready Score;
- deterministic responsive-risk detection;
- probable breakpoint failure evidence;
- text reflow/clipping risk;
- inflexible row/column risk;
- overflow and minimum-width risk;
- section-level and frame-level summaries;
- no invented responsive design and no mutation.

## P14 — Advanced Safe Fix + `Prepare Frame`

Only for conditions already detectable read-only.

- guided proposed-change list;
- proven Auto Layout conversions;
- measured gap/padding normalization;
- validated Hug/Fill corrections;
- safe text auto-height fixes;
- repeated-structure normalization where recipe confidence is high;
- candidate -> full validation -> commit/rollback;
- before/after score only after a successful validated commit.

## P15 — Elementor Readiness + Build Plan

- deterministic Elementor Readiness score;
- neutral nested-container build-plan model;
- row/column/flex intent;
- gap/padding/sizing guidance;
- overlay/carousel preservation notes;
- reusable repeated-structure guidance;
- warnings for avoidable custom CSS/JS burden;
- versioned Elementor adapters remain isolated from the core.

## P16 — Design-System Detector + Token Advisory

Read-only advisory first.

- colors;
- typography;
- spacing;
- radius;
- shadows/effects;
- buttons/cards/forms where recognizable;
- duplicate/near-duplicate style candidates;
- token export advisory with evidence/frequency.

No automatic token merge/rewrite without a later safety specification.

## P17 — Developer Handoff + Client/QA Readiness

- developer-ready structured report;
- Build-Ready / Elementor / responsive / design-system summaries;
- unresolved backlog;
- Safe Fix validation history;
- handoff JSON/Markdown first;
- client/QA mode for deterministic completeness/consistency checks;
- final states such as READY FOR HANDOFF / REVIEW / NOT READY with reasons.

## P18 — Complexity / Effort Estimator

Transparent and configurable.

- page/frame count;
- unique vs reusable sections;
- forms/carousels/navigation/component burden;
- responsive-risk burden;
- manual-layout debt;
- design-system inconsistency;
- asset/media burden;
- complexity band + configurable effort units/hours;
- user-defined monetary rules only.

No opaque AI market-price guessing.

## P19 — Agency Presets + Custom Rules + White Label

- reusable audit presets;
- bounded custom rule primitives;
- client/project standards;
- configurable effort rules;
- white-label reports;
- sequential batch/project workflows;
- project baseline and re-audit comparison.

Arbitrary executable user code is out of scope.

## P20 — Commercial Packaging / Entitlements

Suggested tiers:

- **Free:** selected-frame audit, basic Build-Ready Score, limited backlog/report.
- **Pro:** full scoring, responsive risk, proven Safe Fix, Elementor Build Plan, full handoff, design-system advisory, estimator.
- **Agency:** batch/project workflows, presets/custom rules, configurable estimator, white label, baselines/comparison.

Entitlements gate surfaces, not deterministic correctness. Any future networked licensing/account layer must remain isolated from the neutral core and must not send design content merely to verify a license.

## P21 — Optional AI Assistance

Opt-in, isolated, non-authoritative.

May:
- explain deterministic findings;
- summarize backlog;
- draft developer notes from structured results;
- explain Elementor mapping;
- draft proposal narrative from deterministic effort factors.

May not:
- authorize mutation;
- override confidence;
- replace validators;
- invent and silently apply responsive design;
- alter score evidence;
- exfiltrate design content without a separately accepted privacy/consent specification.
