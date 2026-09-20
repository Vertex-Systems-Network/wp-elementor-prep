import { mkdtempSync, rmSync, symlinkSync, truncateSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CANONICAL_SNAPSHOT_MAX_BYTES,
  CANONICAL_SNAPSHOT_MAX_DEPTH,
  FIGMA_REST_MAX_NODE_DEPTH,
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

  it('fails closed on Figma REST node trees beyond the recursion budget', () => {
    let node: Record<string, unknown> = {
      id: 'leaf',
      name: 'Leaf',
      type: 'FRAME',
      children: [],
    };
    for (let depth = 0; depth <= FIGMA_REST_MAX_NODE_DEPTH; depth += 1) {
      node = {
        id: `node-${depth}`,
        name: `Node ${depth}`,
        type: 'FRAME',
        children: [node],
      };
    }

    expect(() => auditNodeFromFigmaRest(node)).toThrowError(/nesting limit/);
    try {
      auditNodeFromFigmaRest(node);
    } catch (error) {
      expect(error).toMatchObject({ code: 'FIGMA_RESPONSE_RESOURCE_LIMIT' });
    }
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

  it('loads a stable regular canonical snapshot file through the hardened local-file boundary', async () => {
    const dir = mkdtempSync(join(process.cwd(), '.p10-snapshot-stable-'));
    try {
      const path = join(dir, 'snapshot.json');
      const root = auditNodeFromFigmaRest(restFrame());
      writeFileSync(path, JSON.stringify({
        schemaVersion: 1,
        capturedAt: '2026-09-20T00:00:00.000Z',
        source: { kind: 'adapter-export', fileKey: 'stable-file', nodeId: root.id },
        root,
      }));

      const snapshot = await loadCanonicalSnapshot(path);
      expect(snapshot.schemaVersion).toBe(1);
      expect(snapshot.source).toMatchObject({ kind: 'adapter-export', fileKey: 'stable-file' });
      expect(snapshot.root.id).toBe(root.id);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects a symlinked canonical snapshot path instead of following its target', async () => {
    const dir = mkdtempSync(join(process.cwd(), '.p10-snapshot-symlink-'));
    try {
      const target = join(dir, 'target.json');
      const input = join(dir, 'snapshot.json');
      const root = auditNodeFromFigmaRest(restFrame());
      writeFileSync(target, JSON.stringify({
        schemaVersion: 1,
        capturedAt: '2026-09-20T00:00:00.000Z',
        source: { kind: 'adapter-export' },
        root,
      }));
      symlinkSync(target, input, 'file');

      await expect(loadCanonicalSnapshot(input)).rejects.toMatchObject({
        code: 'SNAPSHOT_READ_FAILED',
        exitCode: 2,
      });
      await expect(loadCanonicalSnapshot(input)).rejects.toThrow(/regular non-symlink file/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('fails before reading canonical snapshot files above the raw byte ceiling', async () => {
    const root = mkdtempSync(join(process.cwd(), '.p10-snapshot-limit-'));
    try {
      const path = join(root, 'oversized.json');
      writeFileSync(path, '');
      truncateSync(path, CANONICAL_SNAPSHOT_MAX_BYTES + 1);
      await expect(loadCanonicalSnapshot(path)).rejects.toMatchObject({
        code: 'SNAPSHOT_RESOURCE_LIMIT',
        exitCode: 2,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects deeply nested snapshot structures before recursive node parsing', () => {
    const root = auditNodeFromFigmaRest(restFrame());
    const snapshot: Record<string, unknown> = {
      schemaVersion: 1,
      capturedAt: '2026-09-10T00:00:00.000Z',
      source: { kind: 'adapter-export' },
      root,
    };
    let cursor: Record<string, unknown> = snapshot;
    for (let index = 0; index <= CANONICAL_SNAPSHOT_MAX_DEPTH; index += 1) {
      const next: Record<string, unknown> = {};
      cursor['resourceBomb'] = next;
      cursor = next;
    }

    expect(() => parseCanonicalSnapshot(snapshot)).toThrowError(/nesting limit/);
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

  it('blocks redirects on credentialed Figma REST requests', async () => {
    const token = 'redirect-bound-secret';
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toMatch(/^https:\/\/api\.figma\.com\/v1\/files\//);
      expect(init?.redirect).toBe('error');
      const headers = init?.headers as Record<string, string>;
      expect(headers['X-Figma-Token']).toBe(token);
      return new Response(JSON.stringify({
        name: 'Redirect-safe file',
        lastModified: '2026-09-20T00:00:00.000Z',
        version: 'redirect-safe',
        nodes: {
          '1:2': { document: restFrame() },
        },
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    const snapshot = await new FigmaRestSourceAdapter().load({
      fileKey: 'RedirectSafeKey',
      nodeId: '1:2',
      token,
      authMode: 'personal',
      fetchImpl,
    });

    expect(snapshot.source).toMatchObject({
      kind: 'figma-rest',
      fileKey: 'RedirectSafeKey',
      revision: 'redirect-safe',
    });
    expect(JSON.stringify(snapshot)).not.toContain(token);
  });

  it('rejects Figma REST responses above the configured byte ceiling', async () => {
    const fetchImpl = (async () => new Response(JSON.stringify({
      name: 'x'.repeat(256),
    }), { status: 200, headers: { 'content-type': 'application/json' } })) as typeof fetch;

    await expect(new FigmaRestSourceAdapter().load({
      fileKey: 'file-key',
      token: 'token',
      authMode: 'personal',
      fetchImpl,
      maxResponseBytes: 64,
    })).rejects.toMatchObject({ code: 'FIGMA_RESPONSE_TOO_LARGE' });
  });

  it('times out stalled Figma REST requests without exposing credentials', async () => {
    const fetchImpl = ((_: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      if (!signal) {
        reject(new Error('missing abort signal'));
        return;
      }
      if (signal.aborted) {
        reject(new Error('aborted'));
        return;
      }
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    })) as typeof fetch;

    let error: unknown;
    try {
      await new FigmaRestSourceAdapter().load({
        fileKey: 'file-key',
        token: 'super-secret-token',
        authMode: 'personal',
        fetchImpl,
        requestTimeoutMs: 5,
      });
    } catch (caught) {
      error = caught;
    }

    expect(error).toMatchObject({ code: 'FIGMA_TIMEOUT' });
    expect(String((error as Error)?.message ?? error)).not.toContain('super-secret-token');
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
