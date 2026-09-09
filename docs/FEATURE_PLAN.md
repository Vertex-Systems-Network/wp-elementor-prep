# Feature Plan

Date: 2026-09-07  
Extended release scope: 2026-09-10

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

## P9 — Actionable backlog generator

Issue: #81.

Every audit/prep run should be able to generate a persistent improvement queue.

### Categories
- `ERROR`: blocking failures and violated invariants.
- `WARNING`: risky or ambiguous structures requiring attention.
- `INFO`: non-blocking observations/context.
- `IMPROVEMENT`: concrete opportunities to improve Elementor-readiness, consistency, performance or maintainability.

### Backlog item contract
- deterministic fingerprint/id;
- category, severity and priority;
- rule/finding code;
- file/page/frame/section/node context;
- title and explanation;
- evidence and confidence;
- proposed action/recipe candidate;
- auto-fix eligibility;
- first-seen/last-seen/occurrence count;
- state: OPEN / RESOLVED / REGRESSED / ACCEPTED_RISK.

### Outputs
- `backlog.json`;
- `backlog.md`;
- category/severity counts;
- deterministic dedupe;
- run-to-run delta;
- plugin UI view/export;
- CLI export.

Backlog generation is non-mutating.

## P10 — npm/Node CLI

Issue: #82.

Expose the deterministic audit/backlog core outside the plugin UI.

### Supported input plan
1. Figma cloud URL via official API.
2. Figma file key via official API.
3. Canonical versioned snapshot/package path exported by our own adapter/plugin.
4. Future local Figma bridge only if a documented supported mechanism exists.

### Target commands

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

### Local `.fig` path behavior
Do not parse proprietary raw `.fig` files with an undocumented parser. Until a supported bridge exists, `/path/file.fig` must fail clearly with `UNSUPPORTED_FIG_LOCAL_FILE` and direct the user to a URL/file key or canonical snapshot path.

### CLI outputs
- audit JSON/Markdown;
- backlog JSON/Markdown;
- deterministic exit codes;
- summary-only mode;
- configurable output directory;
- no credentials/tokens in generated artifacts.

Plugin and CLI must share the same analysis modules so equivalent snapshots produce equivalent findings.

## P11 — Normal Figma plugin distribution

Issue: #83.

Package the same deterministic core as a normal user-facing Figma plugin.

### Distribution work
- production manifest with real plugin ID;
- development and release manifest/menu variants;
- reproducible release package;
- stable user commands: Audit, Backlog, Safe Fix/Prep, Batch, Export Report;
- developer-only evidence/self-test commands hidden from normal release UI where appropriate;
- local development import instructions;
- private/team/organization distribution guidance;
- Figma Community submission checklist/assets;
- icon, cover/thumbnail, screenshots, description, category/tags and support contact;
- versioning/changelog/update process;
- privacy/network declaration;
- release provenance metadata.

Community publication is a final release action and remains subject to Figma review.

## P12 — Final integrated validation

Issue: #84.

Manual/runtime/end-to-end product testing is intentionally batched here after planned implementation scope is complete.

Final matrix includes:
- local development-plugin import;
- normal release/plugin install and run flow;
- P5 reject/restore/finalize rendered-pixel acceptance;
- P6 positive + preservation-refusal acceptance;
- P7 realistic 60+ queue + active cancellation;
- P9 backlog categories/dedupe/delta/export;
- P10 official Figma URL/file-key CLI;
- P10 canonical snapshot path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity;
- deterministic outputs;
- release provenance and closure intake;
- P11 distribution package and Community submission readiness;
- Windows/macOS CLI path handling where applicable.

Do not mark the expanded release production-accepted until P12 is complete.

## Explicit non-goals for early versions

- Generating or rewriting content.
- Inventing mobile/tablet designs.
- Altering typography/colors to make layout easier.
- AI-based layout interpretation.
- One-click destructive conversion without validation.
- Hard-coding one customer/template’s node IDs or copy.
- Undocumented reverse-engineering/parsing of proprietary `.fig` files.
