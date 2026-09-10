# Elementor Readiness Rules

These rules define the target architecture the Figma plugin audits for. They are intentionally implementation-oriented rather than aesthetic.

## Target mapping

| Figma structure | Elementor intent |
|---|---|
| Vertical Auto Layout | Column/flex container |
| Horizontal Auto Layout | Row/flex container |
| Nested frame with logical children | Nested Elementor container |
| Gap | Container gap |
| Padding | Container padding |
| Fill | Flexible/grow width |
| Hug | Content-sized width/height |
| Max/min size | Max/min sizing controls |
| Absolute child | Absolute positioning only for genuine overlay/decorative use |

## P5 v1 recipe mapping

The Safe Fix engine targets Elementor-native structure, not one hard-coded Elementor JSON schema.

| P5 recipe | Required Figma contract | Elementor reconstruction intent |
|---|---|---|
| Vertical Stack | `vertical-stack` -> `VERTICAL` Auto Layout | one column container; measured sibling spacing becomes container gap; measured edge spacing becomes padding |
| Horizontal Row | `horizontal-row` -> `HORIZONTAL` Auto Layout | one row container; direct children remain in existing visual/layer order |
| Two Column | `two-column` -> `HORIZONTAL` Auto Layout | parent row container with two direct child containers/blocks; no spacer columns |
| Facts List | `facts-list <- vertical-stack` -> `VERTICAL` | stacked fact/list wrapper; individual facts remain ordinary-flow children |
| Footer Columns | `footer-columns <- horizontal-row` -> `HORIZONTAL` | footer inner row containing logical column wrappers; responsive stacking can later be handled by Elementor breakpoints |
| Simple Card Grid | `repeated-cards <- grid` -> fixed Figma `GRID` | repeated-card grid container with explicit tracks/gaps rather than manual X/Y card placement |
| Metric Grid | `metric-grid <- grid` -> fixed Figma `GRID` | KPI/stat grid container; metric cells remain live text/content wrappers |
| Social/Link Strip | `social-link-strip <- horizontal-row` -> `HORIZONTAL` | compact row container for link/icon items with normal gap and alignment controls |

P5 preserves current desktop geometry. Responsive behavior is a later reconstruction concern; the Safe Fix layer does not invent tablet/mobile layouts or reorder content to make a desktop screenshot easier to match.

## Positive signals

- Normal content participates in Auto Layout.
- Primary columns/rows are explicit parent-child relationships.
- Sibling spacing uses gap.
- Edge spacing uses padding.
- Text remains editable and uses sensible auto-height behavior.
- Buttons/labels use content-sized behavior where appropriate.
- Images are contained in logical media wrappers.
- Repeated cards/stats/facts share consistent structure.
- Page sections participate in a vertical page flow when appropriate.
- Decorative overlays are isolated from normal content flow.

## Negative signals

### High severity

- Normal heading/paragraph/button/card/column relies on absolute/manual X/Y layout when a normal row/stack is clearly intended.
- Content is rasterized or outlined unnecessarily.
- A page section would require excessive custom JS/CSS merely to reproduce its base layout.
- Visual structure depends on unrelated spacer rectangles/empty frames.

### Medium severity

- Repeated items are fragmented/inconsistent.
- Primary two-column/grid layout is manual.
- Fixed text heights create clipping/reflow risk.
- Deep generic wrappers obscure layout relationships.
- Child width exceeds parent unexpectedly and is not recognized as a carousel/overflow pattern.

### Low severity / advisory

- Generic frame naming.
- Missing reusable components/styles/variables.
- Minor inconsistent gaps that do not affect Elementor reconstruction.

## Legitimate absolute positioning

Do not penalize or auto-remove absolute behavior when the element is genuinely:

- background decoration,
- low-opacity oversized type,
- image overlay,
- badge,
- corner mark,
- timeline connector,
- intentionally floating accent,
- overlaid identity/caption block.

A difficult overlay is not a reason to keep the whole section manual. Normal content should still be structured around it where feasible.

## Carousels and overflow

A child track wider than its viewport is not automatically an error. Likely carousel indicators include:

- repeated similarly sized cards,
- mostly horizontal progression,
- parent clipping/viewport behavior,
- predictable gaps,
- partial next/previous card visibility.

Such patterns should be classified separately and preserved.

## Page wrapper

A main page/App wrapper can be recommended for vertical Auto Layout when:

- children are full/near-full width sections,
- vertical order is unambiguous,
- sections do not materially overlap,
- header/hero overlays can be excluded or handled separately.

The page wrapper must be normalized only after child sections are safe.

## Export compatibility

Future Elementor JSON export must use versioned adapters. Current developer documentation describes nested `container` elements and also newer atomic layout elements. The audit engine therefore targets semantic layout behavior rather than one hard-coded Elementor JSON schema.
