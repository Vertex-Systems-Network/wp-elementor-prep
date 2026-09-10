import { describe, expect, it } from 'vitest';
import { FigmaRestSourceAdapter } from '../src/cli/source-adapters';

function responseBody(frame: Record<string, unknown>) {
  return {
    name: 'Website',
    lastModified: '2026-09-10T00:00:00.000Z',
    version: 'revision-1',
    nodes: {
      '1:2': { document: frame },
    },
  };
}

function geometryFrame() {
  return {
    id: '1:2',
    name: 'Desktop',
    type: 'FRAME',
    relativeTransform: [[1, 0, 13258], [0, 1, 794]],
    size: { x: 1143, y: 18794 },
    absoluteBoundingBox: { x: 13258, y: 794, width: 1143, height: 18794 },
    children: [
      {
        id: '1:3',
        name: 'SocialStrip',
        type: 'FRAME',
        relativeTransform: [[1, 0, 0], [0, 1, 18031.953125]],
        size: { x: 1143, y: 761.875 },
        absoluteBoundingBox: { x: 13258, y: 18825.953125, width: 1143, height: 761.875 },
        children: [],
      },
    ],
  };
}

describe('P10 Figma REST geometry request contract', () => {
  it('requests geometry=paths for explicit node loads so relativeTransform and size are returned', async () => {
    let requestedUrl = '';
    const frame = geometryFrame();
    const fetchImpl = (async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify(responseBody(frame)), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;

    const snapshot = await new FigmaRestSourceAdapter().load({
      fileKey: 'File Key',
      nodeId: '1:2',
      token: 'token',
      authMode: 'personal',
      fetchImpl,
    });

    expect(requestedUrl).toBe('https://api.figma.com/v1/files/File%20Key/nodes?ids=1%3A2&geometry=paths');
    expect(snapshot.root.geometry).toEqual({ x: 13258, y: 794, width: 1143, height: 18794 });
    expect(snapshot.root.children[0]?.geometry).toEqual({
      x: 0,
      y: 18031.953125,
      width: 1143,
      height: 761.875,
    });
  });

  it('requests geometry=paths for full-file loads too', async () => {
    let requestedUrl = '';
    const frame = geometryFrame();
    const fetchImpl = (async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({
        name: 'Website',
        lastModified: '2026-09-10T00:00:00.000Z',
        version: 'revision-1',
        document: {
          id: '0:0',
          name: 'Document',
          type: 'DOCUMENT',
          children: [{
            id: '0:1',
            name: 'Page 1',
            type: 'CANVAS',
            children: [frame],
          }],
        },
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;

    const snapshot = await new FigmaRestSourceAdapter().load({
      fileKey: 'File Key',
      token: 'token',
      authMode: 'personal',
      fetchImpl,
    });

    expect(requestedUrl).toBe('https://api.figma.com/v1/files/File%20Key?geometry=paths');
    expect(snapshot.root.children[0]?.geometry.x).toBe(0);
  });
});
