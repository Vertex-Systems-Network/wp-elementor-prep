# P3 Validator Design

Date: 2026-09-08

## Goal

P3 decides whether a future candidate refactor is visually/content-equivalent enough to be eligible for commit. It is a safety gate, not a transformer.

## Core constraint: candidate node IDs and wrapper trees may change

A cloned/refactored Figma candidate receives different node IDs and may intentionally add/remove/reparent wrapper frames. Therefore P3 must **not** require node-ID equality or identical container trees.

Validation is layered around rendered/content invariants instead:

1. root section bounds,
2. text-content multiset integrity,
3. image-fill multiset integrity,
4. absolute-to-section text/image anchor geometry,
5. structural sanity metrics,
6. section-level rendered PNG pixel diff.

Wrapper/node-count changes are reportable metrics but are not failures by themselves.

## Snapshot model

`IntegritySnapshot` contains:

- root width/height,
- visible node count,
- node-type counts,
- text anchors,
- image anchors.

Each text/image anchor contains:

- stable content fingerprint,
- geometry normalized to the selected section root,
- structural path for debug evidence only.

Text fingerprints use deterministic local hashing so validation reports do not need to expose raw copy. Image anchors use Figma image hashes.

## Duplicate content

Repeated text or images are matched by content fingerprint and paired in stable visual order (`y`, `x`, size, debug path), not by Figma node ID.

## Threshold policy v1

Current `p3-v1` deterministic thresholds:

- root width/height drift: <= 2 px,
- text/image anchor position drift: <= 2 px,
- text/image anchor size drift: <= 2 px,
- text-content multiset: exact,
- image-hash multiset: exact,
- pixel per-channel tolerance: 8 / 255,
- maximum changed pixels: 0.5%,
- maximum mean channel delta: 0.5.

Thresholds are versioned/configurable and remain eligible for recalibration before P5 Safe Fix.

## Failure reasons

- `INVALID_SNAPSHOT_GEOMETRY`
- `ROOT_GEOMETRY_DRIFT`
- `TEXT_CONTENT_DRIFT`
- `IMAGE_CONTENT_DRIFT`
- `TEXT_GEOMETRY_DRIFT`
- `IMAGE_GEOMETRY_DRIFT`
- `PIXEL_DIMENSION_MISMATCH`
- `PIXEL_DIFF_EXCEEDED`

## Rendered pixel layer

The pixel layer is implemented as a section-level validation stage:

1. original and candidate Frames are exported through Figma `exportAsync()` as PNG,
2. longest render edge is capped at 2048 px for bounded memory usage,
3. PNG bytes are transferred to plugin UI,
4. UI decodes both renders into Canvas/ImageData,
5. deterministic RGBA metrics are calculated,
6. metrics are merged into the same `ValidationReport`,
7. explainable pixel findings are emitted when thresholds are exceeded.

The comparison is section-level, not descendant-by-descendant.

## Why content/geometry validation remains separate from pixel diff

Pixel similarity alone can hide semantic damage, such as text replacement with visually similar glyphs or an image swap with a similar crop. Conversely, strict tree equality would reject safe wrapper refactors. P3 therefore requires both invariant integrity and rendered-section evidence.

## Live no-op calibration

Representative Marcus sections were exported twice with the production render-scale rule. About, Journey and Contact produced byte-identical repeated PNG exports, including the tall Journey section rendered at a capped scale. See `docs/P3_PIXEL_CALIBRATION.md`.

## Safety boundary

P3 runtime remains read-only with respect to approved design structure. It can inspect and export selected Frames, but it does not create, transform, swap or delete design nodes. Candidate clone/swap orchestration belongs to P4.
