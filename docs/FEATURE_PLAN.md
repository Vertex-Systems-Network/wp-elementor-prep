# Feature Plan

Date: 2026-09-07

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
