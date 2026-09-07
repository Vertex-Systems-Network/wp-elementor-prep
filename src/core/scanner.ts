import type { AuditNode, AuditStats, LayoutMode } from './types';

const GENERIC_NAME = /^(frame|group|container|rectangle|text|paragraph|heading|section|line)(\b|\s|\d|\s+copy)/i;

function numeric(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readLayoutMode(node: SceneNode): LayoutMode {
  if (!('layoutMode' in node)) return 'UNKNOWN';
  const value = String((node as SceneNode & { layoutMode: unknown }).layoutMode);
  if (value === 'NONE' || value === 'HORIZONTAL' || value === 'VERTICAL' || value === 'GRID') {
    return value;
  }
  return 'UNKNOWN';
}

function hasImageFill(node: SceneNode): boolean {
  if (!('fills' in node)) return false;
  const fills = (node as SceneNode & { fills: readonly Paint[] | PluginAPI['mixed'] }).fills;
  if (!Array.isArray(fills)) return false;
  return fills.some((paint) => paint.type === 'IMAGE');
}

function childNodes(node: SceneNode): readonly SceneNode[] {
  if (!('children' in node)) return [];
  return (node as SceneNode & { children: readonly SceneNode[] }).children;
}

function isAbsolute(node: SceneNode): boolean {
  if (!('layoutPositioning' in node)) return false;
  return String((node as SceneNode & { layoutPositioning: unknown }).layoutPositioning) === 'ABSOLUTE';
}

function textAutoResize(node: SceneNode): string | null {
  if (node.type !== 'TEXT') return null;
  return String(node.textAutoResize);
}

function clipsContent(node: SceneNode): boolean {
  if (!('clipsContent' in node)) return false;
  return Boolean((node as SceneNode & { clipsContent: unknown }).clipsContent);
}

export function scanSceneNode(node: SceneNode): AuditNode {
  const children = childNodes(node).map(scanSceneNode);
  const mode = readLayoutMode(node);
  const isContainer = children.length > 0 || 'children' in node;
  const isText = node.type === 'TEXT';

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    geometry: {
      x: numeric(node.x),
      y: numeric(node.y),
      width: numeric(node.width),
      height: numeric(node.height),
    },
    layoutMode: mode,
    isAutoLayout: mode === 'HORIZONTAL' || mode === 'VERTICAL' || mode === 'GRID',
    isContainer,
    isText,
    isImageLike: hasImageFill(node),
    isGenericName: GENERIC_NAME.test(node.name.trim()),
    textLength: isText ? node.characters.length : 0,
    textAutoResize: textAutoResize(node),
    absolutePositioned: isAbsolute(node),
    clipsContent: clipsContent(node),
    opacity: numeric(node.opacity, 1),
    visible: node.visible,
    childIds: children.map((child) => child.id),
    children,
  };
}

export function flatten(root: AuditNode): AuditNode[] {
  const result: AuditNode[] = [];
  const stack: AuditNode[] = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    result.push(current);
    for (let i = current.children.length - 1; i >= 0; i -= 1) {
      const child = current.children[i];
      if (child) stack.push(child);
    }
  }

  return result;
}

export function computeStats(root: AuditNode): AuditStats {
  const nodes = flatten(root).filter((node) => node.visible);
  const containers = nodes.filter((node) => node.isContainer);
  const autoLayoutContainers = containers.filter((node) => node.isAutoLayout).length;
  const manualContainers = Math.max(0, containers.length - autoLayoutContainers);
  const textNodes = nodes.filter((node) => node.isText);
  const autoHeightTextNodes = textNodes.filter((node) => {
    const value = node.textAutoResize;
    return value === 'HEIGHT' || value === 'WIDTH_AND_HEIGHT';
  }).length;

  return {
    nodes: nodes.length,
    containers: containers.length,
    autoLayoutContainers,
    manualContainers,
    autoLayoutCoveragePct:
      containers.length === 0 ? 100 : Math.round((autoLayoutContainers / containers.length) * 100),
    textNodes: textNodes.length,
    autoHeightTextNodes,
    genericNames: nodes.filter((node) => node.isGenericName).length,
    absolutePositionedNodes: nodes.filter((node) => node.absolutePositioned).length,
    imageLikeNodes: nodes.filter((node) => node.isImageLike).length,
  };
}

function candidateScore(root: AuditNode, candidate: AuditNode): number {
  if (!candidate.isContainer || candidate.children.length < 4) return -1;
  if (candidate.geometry.width < root.geometry.width * 0.65) return -1;
  if (candidate.geometry.height < root.geometry.height * 0.4) return -1;

  const sectionishChildren = candidate.children.filter(
    (child) => child.isContainer && child.geometry.width >= candidate.geometry.width * 0.6,
  );
  const verticalSpread = candidate.children.length > 1
    ? Math.max(...candidate.children.map((child) => child.geometry.y)) - Math.min(...candidate.children.map((child) => child.geometry.y))
    : 0;

  return sectionishChildren.length * 10 + candidate.children.length + Math.min(20, verticalSpread / 200);
}

/**
 * Conservative MVP section discovery. It searches for the strongest large content-wrapper
 * candidate, then treats its direct container children as sections. Names are not required.
 */
export function discoverSections(root: AuditNode): AuditNode[] {
  const candidates = flatten(root)
    .filter((node) => node.id !== root.id)
    .map((node) => ({ node, score: candidateScore(root, node) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score);

  const wrapper = candidates[0]?.node;
  if (!wrapper) {
    return root.children
      .filter((child) => child.isContainer && child.visible)
      .sort((a, b) => a.geometry.y - b.geometry.y);
  }

  return wrapper.children
    .filter((child) => child.isContainer && child.visible)
    .sort((a, b) => a.geometry.y - b.geometry.y);
}
