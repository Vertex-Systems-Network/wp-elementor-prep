# P5 Metric Grid + Social Link Strip Live Calibration

Date: 2026-09-08

## Purpose

Calibrate the final two conservative P5 v1 semantic recipes on disposable Figma fixtures before any production Safe Fix exposure.

No approved customer section was modified. Fixtures were created far off-canvas under a temporary calibration prefix and removed in the same run.

## Metric Grid

### Semantic gate

Metric Grid is intentionally name-assisted rather than inferred from generic grid geometry alone.

Required evidence:

- geometric pattern: `grid`,
- 4–8 visible container items,
- explicit metric/stat naming signal in section or target name (`metric`, `stat`, `kpi`, `number`, `counter`, `figure` variants),
- >= 80% simple text-oriented cells,
- no image descendants in simple metric cells,
- target height <= 45% of section height,
- confidence >= 95%,
- non-fragmented grid,
- normal-flow children only.

A generic simple grid without the naming evidence remains `repeated-cards` rather than being guessed as metrics.

### Mutation contract

`metric-grid <- grid` reuses the strict fixed-track GRID transformer:

- complete rectangular occupancy,
- row-major layer order,
- consistent fixed width per column,
- consistent fixed height per row,
- uniform row/column gaps,
- measured padding,
- no hidden/absolute direct children,
- direct-child geometry guard after mutation,
- full P3 still mandatory before P4 commit.

### Disposable Figma result

Text-bearing `KPI Metrics` fixture:

- candidate `layoutMode`: `GRID`,
- root/direct-child geometry exact: `true`,
- exported PNG bytes exact: `true`,
- candidate PNG bytes: `5957`,
- temporary calibration nodes remaining: `0`.

## Social / Link Strip

### Semantic gate

Required evidence:

- geometric pattern: `horizontal-row`,
- 2–8 visible container items,
- explicit `social`, `follow` or `connect` naming signal in section/target context,
- >= 80% compact children,
- each compact child has <= 2 text descendants and <= 6 total descendants,
- target height <= 18% of section height,
- maximum child width <= 40% of target width,
- confidence >= 95%,
- no visible absolute direct children.

Footer-column semantics are evaluated before social-strip semantics, so lower-page contact/footer rows keep their more specific footer interpretation.

### Mutation contract

`social-link-strip <- horizontal-row` reuses the strict Horizontal Auto Layout transformer:

- visual order must already equal layer order,
- cross-axis alignment within 1 px,
- primary gaps uniform within 1 px,
- no overlap,
- in-bounds geometry,
- fixed root size restored after Figma layout-mode transition,
- direct-child geometry guard after mutation,
- full P3 still mandatory before P4 commit.

### Disposable Figma result

Text-bearing `Social Connect` fixture:

- candidate `layoutMode`: `HORIZONTAL`,
- root/direct-child geometry exact: `true`,
- exported PNG bytes exact: `true`,
- candidate PNG bytes: `1637`,
- temporary calibration nodes remaining: `0`.

## Safety conclusion

Metric Grid and Social/Link Strip now have deterministic semantic contracts, confidence gates, candidate mutation paths and exact disposable-Figma render-equivalence evidence.

This does **not** by itself enable production Safe Fix. Remaining P5 production gates are:

1. green current-head CI,
2. actual compiled `runSafeFixTransaction -> FullFrameValidator -> UI Canvas pixel broker -> P4` self-test execution,
3. multi-template real-frame/image-bearing mutation calibration,
4. production UI exposure only after those gates pass.
