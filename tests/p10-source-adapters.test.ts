import { describe, expect, it } from 'vitest';
import {
  FigmaRestSourceAdapter,
  SourceAdapterError,
  auditNodeFromFigmaRest,
  loadCanonicalSnapshot,
  parseCanonicalSnapshot,
  parseFigmaUrl,
} from '../src/cli/source-adapters';

function restFrame(id = '1:2', name = 'Desktop') {
  return {
    id,
    name,
    type: 'FRAME',
    absoluteBoundingBox: { x: 10, y: 20, width: 1440, height: 1200 },
    layoutMode: 'VERTICAL',
    clipsContent: true,
    opacity: 0.9,
    visible: true,
    children: [
      {
        id: '1:3',
        name: 'Heading',
        type: 'TEXT',
        absoluteBoundingBox: { x: 30, y: 40, width: 400, height: 80 },
        characters: 'Hello',
        textAutoResize: 'HEIGHT',
        visible: true,
      },
      {
        id: '1:4',
        name: 'Hero image',
        type: 'RECTANGLE',
        absoluteBoundingBox: { x: 30, y: 140, width: 600, height: 400 },
        fills: [{ type: 'IMAGE', imageRef: 'abc' }],
        layoutPositioning: 'ABSOLUTE',
        visible: true,
      },
    ],
  };
}

describe('P10 source adapters', () => {
  it('parses supported Figma URLs and normalizes node-id query values', () => {
    expect(parseFigmaUrl('https://www.figma.com/design/AbCdEf/My-File?node-id=12-34')).toEqual({
      fileKey: 'AbCdEf',
      nodeId: '12:34',
    });
    expect(parseFigmaUrl('https://figma.com/file/XYZ123/Legacy')).toEqual({ fileKey: 'XYZ123' });
  });

  it('rejects non-Figma and unsupported URL shapes', () => {
    expect(() => parseFigmaUrl('https://example.com/design/key/name')).toThrowError(SourceAdapterError);
    expect(() => parseFigmaUrl('https://www.figma.com/board/key/name')).toThrowError(SourceAdapterError);
  });

  it('normalizes official REST nodes into the shared AuditNode shape', () => {
    const node = auditNodeFromFigmaRest(restFrame());
    expect(node).toMatchObject({
      id: '1:2',
      name: 'Desktop',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      isAutoLayout: true,
      isContainer: true,
      clipsContent: true,
      opacity: 0.9,
      visible: true,
    });
    expect(node.geometry).toEqual({ x: 10, y: 20, width: 1440, height: 1200 });
    expect(node.childIds).toEqual(['1:3', '1:4']);
    expect(node.children[0]).toMatchObject({ isText: true, textLength: 5, textAutoResize: 'HEIGHT' });
    expect(node.children[1]).toMatchObject({ isImageLike: true, absolutePositioned: true });
  });

  it('accepts owned canonical schema-v1 snapshots and recomputes childIds from children', () => {
    const root = auditNodeFromFigmaRest(restFrame());
    const parsed = parseCanonicalSnapshot({
      schemaVersion: 1,
      capturedAt: '2026-09-10T00:00:00.000Z',
      source: { kind: 'adapter-export', fileKey: 'file-key', nodeId: root.id },
      root,
    });
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.root.childIds).toEqual(['1:3', '1:4']);
    expect(parsed.source.fileKey).toBe('file-key');
  });

  it('fails closed on mismatched canonical childIds', () => {
    const root = auditNodeFromFigmaRest(restFrame());
    expect(() => parseCanonicalSnapshot({
      schemaVersion: 1,
      capturedAt: '2026-09-10T00:00:00.000Z',
      source: { kind: 'adapter-export' },
      root: { ...root, childIds: ['wrong'] },
    })).toThrowError(/childIds do not match/);
  });

  it('rejects raw .fig paths explicitly before attempting proprietary parsing', async () => {
    await expect(loadCanonicalSnapshot('/tmp/design.fig')).rejects.toMatchObject({
      code: 'UNSUPPORTED_FIG_LOCAL_FILE',
      exitCode: 2,
    });
  });

  it('loads a single requested Figma frame without serializing credentials into the snapshot', async () => {
    const fetchImpl = (async () => new Response(JSON.stringify({
      name: 'Website',
      lastModified: '2026-09-09T12:00:00.000Z',
      version: '12345',
      nodes: {
        '1:2': { document: restFrame() },
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } })) as typeof fetch;

    const snapshot = await new FigmaRestSourceAdapter().load({
      fileKey: 'SecretFileKey',
      nodeId: '1:2',
      token: 'super-secret-token',
      authMode: 'personal',
      fetchImpl,
    });

    expect(snapshot).toMatchObject({
      schemaVersion: 1,
      capturedAt: '2026-09-09T12:00:00.000Z',
      source: {
        kind: 'figma-rest',
        fileKey: 'SecretFileKey',
        fileName: 'Website',
        nodeId: '1:2',
        revision: '12345',
      },
    });
    expect(JSON.stringify(snapshot)).not.toContain('super-secret-token');
  });

  it('refuses ambiguous full-file selection instead of guessing a frame', async () => {
    const fetchImpl = (async () => new Response(JSON.stringify({
      name: 'Website',
      lastModified: '2026-09-09T12:00:00.000Z',
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [{
          id: '0:1',
          name: 'Page 1',
          type: 'CANVAS',
          children: [restFrame('1:2', 'Desktop A'), restFrame('2:2', 'Desktop B')],
        }],
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } })) as typeof fetch;

    await expect(new FigmaRestSourceAdapter().load({
      fileKey: 'file-key',
      token: 'token',
      authMode: 'personal',
      fetchImpl,
    })).rejects.toMatchObject({ code: 'AMBIGUOUS_FIGMA_FRAME' });
  });
});
