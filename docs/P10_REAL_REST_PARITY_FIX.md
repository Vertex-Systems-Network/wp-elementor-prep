# P10 real REST/plugin parity correction

A real P12 run against Figma file `01SIsqGVDm32KsaZnxHPR9`, frame `3434:8258` exposed a geometry normalization mismatch between the Figma plugin scanner and the REST source adapter.

The plugin scanner consumes `SceneNode.x`, `SceneNode.y`, `SceneNode.width`, and `SceneNode.height`, which are parent-local node geometry. The REST adapter previously serialized `absoluteBoundingBox` coordinates for every descendant. On a frame positioned far from the page origin, descendant x/y values therefore carried the page offset into pattern analysis and produced false overflow/carousel detections.

The corrected adapter now prefers:

- `relativeTransform[0][2]` / `relativeTransform[1][2]` for parent-local x/y;
- `size.x` / `size.y` for local width/height;
- absolute bounding/render bounds only as a compatibility fallback when those local REST fields are unavailable.

Regression coverage retains fallback behavior for older fixtures and verifies that rotated nodes use local `size` rather than transformed absolute bounding-box dimensions.

This repository correction does not by itself close P12 parity acceptance. The corrected CLI must be rerun against the same real Figma file/frame and compared with the retained real-plugin report/backlog before the parity gate is accepted.
