import { describe, expect, it } from 'vitest';
import { auditNodeFromFigmaRest } from '../src/cli/source-adapters';

describe('P10 REST geometry parity', () => {
  it('uses relativeTransform translation and size so descendants match plugin-local SceneNode geometry', () => {
    const root = auditNodeFromFigmaRest({
      id: '3434:8258',
      name: 'Desktop — Original',
      type: 'FRAME',
      relativeTransform: [[1, 0, 13258], [0, 1, 794]],
      size: { x: 1143, y: 18794 },
      absoluteBoundingBox: { x: 13258, y: 794, width: 1143, height: 18794 },
      children: [
        {
          id: '3434:8261',
          name: 'SocialStrip',
          type: 'FRAME',
          relativeTransform: [[1, 0, 0], [0, 1, 18031.953125]],
          size: { x: 1143, y: 761.875 },
          absoluteBoundingBox: { x: 13258, y: 18825.953125, width: 1143, height: 761.875 },
          children: [
            {
              id: '3434:8262',
              name: 'Container',
              type: 'FRAME',
              relativeTransform: [[1, 0, 45.71875], [0, 1, 92.4375]],
              size: { x: 1051.5625, y: 223.5 },
              absoluteBoundingBox: { x: 13303.71875, y: 18918.390625, width: 1051.5625, height: 223.5 },
              children: [],
            },
          ],
        },
      ],
    });

    expect(root.geometry).toEqual({ x: 13258, y: 794, width: 1143, height: 18794 });
    expect(root.children[0]?.geometry).toEqual({
      x: 0,
      y: 18031.953125,
      width: 1143,
      height: 761.875,
    });
    expect(root.children[0]?.children[0]?.geometry).toEqual({
      x: 45.71875,
      y: 92.4375,
      width: 1051.5625,
      height: 223.5,
    });
  });

  it('falls back to absolute bounds when REST local transform/size fields are unavailable', () => {
    const node = auditNodeFromFigmaRest({
      id: '1:2',
      name: 'Legacy fixture',
      type: 'FRAME',
      absoluteBoundingBox: { x: 10, y: 20, width: 300, height: 200 },
      children: [],
    });

    expect(node.geometry).toEqual({ x: 10, y: 20, width: 300, height: 200 });
  });

  it('prefers local size over transformed absolute dimensions', () => {
    const node = auditNodeFromFigmaRest({
      id: '1:3',
      name: 'Rotated fixture',
      type: 'FRAME',
      relativeTransform: [[0, -1, 120], [1, 0, 40]],
      size: { x: 320, y: 180 },
      absoluteBoundingBox: { x: -60, y: 40, width: 180, height: 320 },
      children: [],
    });

    expect(node.geometry).toEqual({ x: 120, y: 40, width: 320, height: 180 });
  });
});
