import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import type { AuditNode, LayoutMode } from '../core/types';
import { isGenericLayerName, normalizeLayoutMode } from '../core/scanner';

export type CanonicalSnapshotSourceKind = 'figma-rest' | 'plugin-export' | 'adapter-export';

export interface CanonicalSnapshotSource {
  kind: CanonicalSnapshotSourceKind;
  fileKey?: string;
  fileName?: string;
  pageId?: string;
  pageName?: string;
  nodeId?: string;
  nodeName?: string;
  revision?: string;
}

export interface CanonicalSnapshot {
  schemaVersion: 1;
  capturedAt: string;
  source: CanonicalSnapshotSource;
  root: AuditNode;
}

export class SourceAdapterError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly exitCode = 3,
  ) {
    super(message);
    this.name = 'SourceAdapterError';
  }
}

export interface FigmaRestOptions {
  fileKey: string;
  token: string;
  authMode: 'personal' | 'oauth';
  nodeId?: string;
  fetchImpl?: typeof fetch;
}

interface FigmaUrlResolution {
  fileKey: string;
  nodeId?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new SourceAdapterError('INVALID_SNAPSHOT', `Expected non-empty string at ${field}.`, 2);
  }
  return value;
}

function asBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new SourceAdapterError('INVALID_SNAPSHOT', `Expected boolean at ${field}.`, 2);
  }
  return value;
}

function asFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new SourceAdapterError('INVALID_SNAPSHOT', `Expected finite number at ${field}.`, 2);
  }
  return value;
}

function asNonNegativeInteger(value: unknown, field: string): number {
  const parsed = asFiniteNumber(value, field);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new SourceAdapterError('INVALID_SNAPSHOT', `Expected non-negative integer at ${field}.`, 2);
  }
  return parsed;
}

function parseSnapshotLayoutMode(value: unknown, field: string): LayoutMode {
  if (value !== 'NONE' && value !== 'HORIZONTAL' && value !== 'VERTICAL' && value !== 'GRID' && value !== 'UNKNOWN') {
    throw new SourceAdapterError('INVALID_SNAPSHOT', `Unsupported layout mode at ${field}.`, 2);
  }
  return value;
}

function parseAuditNode(value: unknown, path: string): AuditNode {
  if (!isRecord(value)) {
    throw new SourceAdapterError('INVALID_SNAPSHOT', `Expected object at ${path}.`, 2);
  }
  const geometry = value['geometry'];
  if (!isRecord(geometry)) {
    throw new SourceAdapterError('INVALID_SNAPSHOT', `Expected geometry object at ${path}.geometry.`, 2);
  }
  const rawChildren = value['children'];
  if (!Array.isArray(rawChildren)) {
    throw new SourceAdapterError('INVALID_SNAPSHOT', `Expected children array at ${path}.children.`, 2);
  }

  const children = rawChildren.map((child, index) => parseAuditNode(child, `${path}.children[${index}]`));
  const childIds = children.map((child) => child.id);
  const suppliedChildIds = value['childIds'];
  if (Array.isArray(suppliedChildIds)) {
    const supplied = suppliedChildIds.map((id, index) => asString(id, `${path}.childIds[${index}]`));
    if (supplied.length !== childIds.length || supplied.some((id, index) => id !== childIds[index])) {
      throw new SourceAdapterError('INVALID_SNAPSHOT', `childIds do not match children at ${path}.`, 2);
    }
  }

  const rawTextAutoResize = value['textAutoResize'];
  const textAutoResize = rawTextAutoResize === null
    ? null
    : asString(rawTextAutoResize, `${path}.textAutoResize`);

  return {
    id: asString(value['id'], `${path}.id`),
    name: asString(value['name'], `${path}.name`),
    type: asString(value['type'], `${path}.type`),
    geometry: {
      x: asFiniteNumber(geometry['x'], `${path}.geometry.x`),
      y: asFiniteNumber(geometry['y'], `${path}.geometry.y`),
      width: asFiniteNumber(geometry['width'], `${path}.geometry.width`),
      height: asFiniteNumber(geometry['height'], `${path}.geometry.height`),
    },
    layoutMode: parseSnapshotLayoutMode(value['layoutMode'], `${path}.layoutMode`),
    isAutoLayout: asBoolean(value['isAutoLayout'], `${path}.isAutoLayout`),
    isContainer: asBoolean(value['isContainer'], `${path}.isContainer`),
    isText: asBoolean(value['isText'], `${path}.isText`),
    isImageLike: asBoolean(value['isImageLike'], `${path}.isImageLike`),
    isGenericName: asBoolean(value['isGenericName'], `${path}.isGenericName`),
    textLength: asNonNegativeInteger(value['textLength'], `${path}.textLength`),
    textAutoResize,
    absolutePositioned: asBoolean(value['absolutePositioned'], `${path}.absolutePositioned`),
    clipsContent: asBoolean(value['clipsContent'], `${path}.clipsContent`),
    opacity: asFiniteNumber(value['opacity'], `${path}.opacity`),
    visible: asBoolean(value['visible'], `${path}.visible`),
    childIds,
    children,
  };
}

function parseSource(value: unknown): CanonicalSnapshotSource {
  if (!isRecord(value)) {
    throw new SourceAdapterError('INVALID_SNAPSHOT', 'Expected source object.', 2);
  }
  const kind = value['kind'];
  if (kind !== 'figma-rest' && kind !== 'plugin-export' && kind !== 'adapter-export') {
    throw new SourceAdapterError('INVALID_SNAPSHOT', 'Unsupported snapshot source kind.', 2);
  }

  const source: CanonicalSnapshotSource = { kind };
  for (const field of ['fileKey', 'fileName', 'pageId', 'pageName', 'nodeId', 'nodeName', 'revision'] as const) {
    const current = value[field];
    if (current !== undefined) source[field] = asString(current, `source.${field}`);
  }
  return source;
}

export function parseCanonicalSnapshot(value: unknown): CanonicalSnapshot {
  if (!isRecord(value) || value['schemaVersion'] !== 1) {
    throw new SourceAdapterError('INVALID_SNAPSHOT', 'Canonical snapshot must be an object with schemaVersion 1.', 2);
  }
  const capturedAt = asString(value['capturedAt'], 'capturedAt');
  if (Number.isNaN(Date.parse(capturedAt))) {
    throw new SourceAdapterError('INVALID_SNAPSHOT', 'capturedAt must be a valid ISO-style timestamp.', 2);
  }
  return {
    schemaVersion: 1,
    capturedAt,
    source: parseSource(value['source']),
    root: parseAuditNode(value['root'], 'root'),
  };
}

export async function loadCanonicalSnapshot(inputPath: string): Promise<CanonicalSnapshot> {
  const absolute = resolve(inputPath);
  if (extname(absolute).toLowerCase() === '.fig') {
    throw new SourceAdapterError(
      'UNSUPPORTED_FIG_LOCAL_FILE',
      'Raw .fig parsing is intentionally unsupported. Use --url/--file-key with the official Figma API or a canonical snapshot JSON file.',
      2,
    );
  }

  let raw: string;
  try {
    raw = await readFile(absolute, 'utf8');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new SourceAdapterError('SNAPSHOT_READ_FAILED', `Unable to read canonical snapshot: ${detail}`, 2);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SourceAdapterError('INVALID_SNAPSHOT_JSON', 'Canonical snapshot is not valid JSON.', 2);
  }
  return parseCanonicalSnapshot(parsed);
}

export function parseFigmaUrl(input: string): FigmaUrlResolution {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new SourceAdapterError('INVALID_FIGMA_URL', 'Expected a valid Figma design/file URL.', 2);
  }
  if (url.protocol !== 'https:' || !/(^|\.)figma\.com$/i.test(url.hostname)) {
    throw new SourceAdapterError('INVALID_FIGMA_URL', 'Only https://*.figma.com design/file URLs are supported.', 2);
  }

  const parts = url.pathname.split('/').filter(Boolean);
  const family = parts[0];
  const fileKey = parts[1];
  if ((family !== 'design' && family !== 'file') || !fileKey) {
    throw new SourceAdapterError('INVALID_FIGMA_URL', 'Supported Figma URLs must contain /design/<file-key>/... or /file/<file-key>/....', 2);
  }

  const rawNodeId = url.searchParams.get('node-id') ?? undefined;
  const nodeId = rawNodeId && !rawNodeId.includes(':') ? rawNodeId.replace('-', ':') : rawNodeId;
  return nodeId ? { fileKey, nodeId } : { fileKey };
}

function restNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function restBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function restString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function restChildren(node: Record<string, unknown>): Record<string, unknown>[] {
  const children = node['children'];
  return Array.isArray(children) ? children.filter(isRecord) : [];
}

function hasImageFill(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.some((paint) => isRecord(paint) && paint['type'] === 'IMAGE');
}

function transformTranslation(value: unknown): { x: number; y: number } | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const row0 = value[0];
  const row1 = value[1];
  if (!Array.isArray(row0) || !Array.isArray(row1)) return null;
  const x = row0[2];
  const y = row1[2];
  if (typeof x !== 'number' || !Number.isFinite(x) || typeof y !== 'number' || !Number.isFinite(y)) return null;
  return { x, y };
}

function localSize(value: unknown): { width: number; height: number } | null {
  if (!isRecord(value)) return null;
  const width = value['x'];
  const height = value['y'];
  if (typeof width !== 'number' || !Number.isFinite(width) || typeof height !== 'number' || !Number.isFinite(height)) return null;
  return { width, height };
}

function geometryFromRest(node: Record<string, unknown>): AuditNode['geometry'] {
  const absoluteBoundingBox = node['absoluteBoundingBox'];
  const absoluteRenderBounds = node['absoluteRenderBounds'];
  const box = isRecord(absoluteBoundingBox)
    ? absoluteBoundingBox
    : isRecord(absoluteRenderBounds)
      ? absoluteRenderBounds
      : {};
  const translation = transformTranslation(node['relativeTransform']);
  const size = localSize(node['size']);

  return {
    x: translation?.x ?? restNumber(box['x']),
    y: translation?.y ?? restNumber(box['y']),
    width: size?.width ?? restNumber(box['width']),
    height: size?.height ?? restNumber(box['height']),
  };
}

export function auditNodeFromFigmaRest(value: unknown): AuditNode {
  if (!isRecord(value)) {
    throw new SourceAdapterError('INVALID_FIGMA_RESPONSE', 'Figma API node is not an object.');
  }

  const id = restString(value['id']);
  const name = restString(value['name']);
  const type = restString(value['type']);
  if (!id || !name || !type) {
    throw new SourceAdapterError('INVALID_FIGMA_RESPONSE', 'Figma API node is missing id, name or type.');
  }

  const children = restChildren(value).map(auditNodeFromFigmaRest);
  const layoutMode = normalizeLayoutMode(value['layoutMode']);
  const isText = type === 'TEXT';
  const text = isText ? restString(value['characters']) : '';
  const style = value['style'];
  const styleTextAutoResize = isRecord(style) ? style['textAutoResize'] : null;
  const textAutoResize = isText
    ? restString(value['textAutoResize'] ?? styleTextAutoResize, 'NONE')
    : null;

  return {
    id,
    name,
    type,
    geometry: geometryFromRest(value),
    layoutMode,
    isAutoLayout: layoutMode === 'HORIZONTAL' || layoutMode === 'VERTICAL' || layoutMode === 'GRID',
    isContainer: Array.isArray(value['children']),
    isText,
    isImageLike: hasImageFill(value['fills']),
    isGenericName: isGenericLayerName(name),
    textLength: text.length,
    textAutoResize,
    absolutePositioned: value['layoutPositioning'] === 'ABSOLUTE',
    clipsContent: restBoolean(value['clipsContent'], false),
    opacity: restNumber(value['opacity'], 1),
    visible: restBoolean(value['visible'], true),
    childIds: children.map((child) => child.id),
    children,
  };
}

function collectTopLevelFrames(document: Record<string, unknown>): Array<{ page: Record<string, unknown>; frame: Record<string, unknown> }> {
  const pages = restChildren(document).filter((page) => page['type'] === 'CANVAS');
  const results: Array<{ page: Record<string, unknown>; frame: Record<string, unknown> }> = [];
  for (const page of pages) {
    for (const child of restChildren(page)) {
      if (child['type'] === 'FRAME') results.push({ page, frame: child });
    }
  }
  return results;
}

function authHeaders(token: string, mode: 'personal' | 'oauth'): Record<string, string> {
  return mode === 'oauth'
    ? { Authorization: `Bearer ${token}` }
    : { 'X-Figma-Token': token };
}

async function fetchJson(url: string, options: FigmaRestOptions): Promise<Record<string, unknown>> {
  const fetcher = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetcher(url, { headers: authHeaders(options.token, options.authMode) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new SourceAdapterError('FIGMA_NETWORK_ERROR', `Figma API request failed: ${detail}`);
  }

  if (!response.ok) {
    const code = response.status === 401 || response.status === 403 ? 'FIGMA_AUTH_FAILED' : 'FIGMA_HTTP_ERROR';
    throw new SourceAdapterError(code, `Figma API returned HTTP ${response.status}.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new SourceAdapterError('INVALID_FIGMA_RESPONSE', 'Figma API response was not valid JSON.');
  }
  if (!isRecord(payload)) {
    throw new SourceAdapterError('INVALID_FIGMA_RESPONSE', 'Figma API response root was not an object.');
  }
  return payload;
}

export class FigmaRestSourceAdapter {
  async load(options: FigmaRestOptions): Promise<CanonicalSnapshot> {
    const encodedKey = encodeURIComponent(options.fileKey);
    const endpoint = options.nodeId
      ? `https://api.figma.com/v1/files/${encodedKey}/nodes?ids=${encodeURIComponent(options.nodeId)}&geometry=paths`
      : `https://api.figma.com/v1/files/${encodedKey}?geometry=paths`;
    const payload = await fetchJson(endpoint, options);

    let selectedNode: Record<string, unknown>;
    let selectedPage: Record<string, unknown> | undefined;

    if (options.nodeId) {
      const rawNodes = payload['nodes'];
      const nodes = isRecord(rawNodes) ? rawNodes : null;
      const rawEntry = nodes?.[options.nodeId];
      const entry = isRecord(rawEntry) ? rawEntry : null;
      const rawDocument = entry?.['document'];
      const document = isRecord(rawDocument) ? rawDocument : null;
      if (!document) {
        throw new SourceAdapterError('FIGMA_NODE_NOT_FOUND', `Node ${options.nodeId} was not returned by Figma.`);
      }
      if (document['type'] !== 'FRAME') {
        throw new SourceAdapterError('FIGMA_NODE_NOT_FRAME', `Node ${options.nodeId} is ${String(document['type'] ?? 'unknown')}; P10 audit input requires a FRAME.`);
      }
      selectedNode = document;
    } else {
      const rawDocument = payload['document'];
      const document = isRecord(rawDocument) ? rawDocument : null;
      if (!document) {
        throw new SourceAdapterError('INVALID_FIGMA_RESPONSE', 'Figma file response is missing document.');
      }
      const frames = collectTopLevelFrames(document);
      if (frames.length === 0) {
        throw new SourceAdapterError('FIGMA_FRAME_NOT_FOUND', 'No top-level Figma Frame was found. Supply an explicit --node-id.');
      }
      if (frames.length > 1) {
        const preview = frames
          .slice(0, 8)
          .map(({ frame }) => `${restString(frame['id'])} (${restString(frame['name'])})`)
          .join(', ');
        throw new SourceAdapterError('AMBIGUOUS_FIGMA_FRAME', `Found ${frames.length} top-level Frames. Supply --node-id. Candidates: ${preview}`);
      }
      selectedNode = frames[0]!.frame;
      selectedPage = frames[0]!.page;
    }

    const capturedAtCandidate = restString(payload['lastModified']);
    const capturedAt = !Number.isNaN(Date.parse(capturedAtCandidate))
      ? capturedAtCandidate
      : '1970-01-01T00:00:00.000Z';

    const root = auditNodeFromFigmaRest(selectedNode);
    const fileName = restString(payload['name']);
    const revision = restString(payload['version']);
    const source: CanonicalSnapshotSource = {
      kind: 'figma-rest',
      fileKey: options.fileKey,
      ...(fileName ? { fileName } : {}),
      ...(selectedPage ? {
        pageId: restString(selectedPage['id']),
        pageName: restString(selectedPage['name']),
      } : {}),
      nodeId: root.id,
      nodeName: root.name,
      ...(revision ? { revision } : {}),
    };

    return {
      schemaVersion: 1,
      capturedAt,
      source,
      root,
    };
  }
}

export class CanonicalSnapshotSourceAdapter {
  async load(inputPath: string): Promise<CanonicalSnapshot> {
    return loadCanonicalSnapshot(inputPath);
  }
}
