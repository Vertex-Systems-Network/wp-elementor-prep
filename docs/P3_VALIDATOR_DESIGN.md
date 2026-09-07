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
5. structural sanity signals,
6. later section-level pixel diff.

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

Repeated text or repeated images can appear more than once. Matching therefore groups by content fingerprint and then pairs duplicates in stable visual order (`y`, `x`, size, debug path) rather than node ID.

## Threshold policy v1

Initial `p3-v1` deterministic thresholds:

- root width/height drift: <= 2 px,
- text/image anchor position drift: <= 2 px,
- text/image anchor size drift: <= 2 px,
- text-content multiset: exact,
- image-hash multiset: exact.

Thresholds are versioned/configurable and will be calibrated before P5 Safe Fix.

## Failure reasons

- `INVALID_SNAPSHOT_GEOMETRY`
- `ROOT_GEOMETRY_DRIFT`
- `TEXT_CONTENT_DRIFT`
- `IMAGE_CONTENT_DRIFT`
- `TEXT_GEOMETRY_DRIFT`
- `IMAGE_GEOMETRY_DRIFT`

Pixel-diff failure is intentionally deferred until the export/canvas layer is implemented.

## Why geometry/content validation comes before pixel diff

Pixel similarity alone can hide semantic damage, for example text replacement that renders similarly or an image asset swap with a visually close crop. Conversely, strict tree equality would reject safe wrapper refactors. P3 therefore combines deterministic content/geometry invariants with a later rendered-section pixel comparison.

## Planned pixel layer

Later P3 work will:

1. export original and candidate sections through Figma `exportAsync()` as PNG,
2. transfer the bytes to plugin UI,
3. decode both images into Canvas/ImageData,
4. compute deterministic pixel-difference metrics at section level,
5. apply versioned thresholds,
6. append explainable pixel metrics/failure reasons to the same `ValidationReport`.

The comparison is section-level, not descendant-by-descendant.

## Safety boundary

P3 runtime remains read-only with respect to approved design structure. Candidate mutation/clone/swap orchestration belongs to P4. P3 only captures, compares and reports.
