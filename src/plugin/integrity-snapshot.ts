import type { IntegrityAnchor, IntegritySnapshot } from '../core/validation-types';
import { stableFingerprint } from '../core/validator';

function numeric(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function childNodes(node: SceneNode): readonly SceneNode[] {
  if (!('children' in node)) return [];
  return (node as SceneNode & { children: readonly SceneNode[] }).children;
}

function imageHashes(node: SceneNode): string[] {
  if (!('fills' in node)) return [];
  const fills = (node as SceneNode & { fills: readonly Paint[] | PluginAPI['mixed'] }).fills;
  if (!Array.isArray(fills)) return [];

  return fills
    .filter((paint): paint is ImagePaint => paint.type === 'IMAGE')
    .map((paint) => paint.imageHash)
    .filter((hash): hash is string => typeof hash === 'string' && hash.length > 0);
}

interface WalkState {
  offsetX: number;
  offsetY: number;
  path: string;
}

/**
 * Capture visible text/image anchors for later before/after comparison.
 * Geometry is normalized to the selected section root so cloned candidates can be compared even
 * when every Figma node id changes. Wrapper paths are retained only as debug evidence.
 */
export function captureIntegritySnapshot(root: SceneNode): IntegritySnapshot {
  const textAnchors: IntegrityAnchor[] = [];
  const imageAnchors: IntegrityAnchor[] = [];
  const nodeTypeCounts: Record<string, number> = {};
  let visibleNodeCount = 0;

  const walk = (node: SceneNode, state: WalkState): void => {
    if (!node.visible) return;
    visibleNodeCount += 1;
    nodeTypeCounts[node.type] = (nodeTypeCounts[node.type] ?? 0) + 1;

    const geometry = {
      x: state.offsetX,
      y: state.offsetY,
      width: numeric(node.width),
      height: numeric(node.height),
    };

    if (node.type === 'TEXT') {
      textAnchors.push({
        kind: 'text',
        fingerprint: `text:${stableFingerprint(node.characters)}`,
        geometry,
        path: state.path,
      });
    }

    const hashes = imageHashes(node);
    hashes.forEach((hash, fillIndex) => {
      imageAnchors.push({
        kind: 'image',
        fingerprint: `image:${hash}`,
        geometry,
        path: `${state.path}#fill-${fillIndex}`,
      });
    });

    childNodes(node).forEach((child, index) => {
      walk(child, {
        offsetX: state.offsetX + numeric(child.x),
        offsetY: state.offsetY + numeric(child.y),
        path: `${state.path}/${index}`,
      });
    });
  };

  // Root geometry is the local coordinate origin for section validation.
  visibleNodeCount += 1;
  nodeTypeCounts[root.type] = 1;
  if (root.type === 'TEXT') {
    textAnchors.push({
      kind: 'text',
      fingerprint: `text:${stableFingerprint(root.characters)}`,
      geometry: { x: 0, y: 0, width: numeric(root.width), height: numeric(root.height) },
      path: '0',
    });
  }
  imageHashes(root).forEach((hash, fillIndex) => {
    imageAnchors.push({
      kind: 'image',
      fingerprint: `image:${hash}`,
      geometry: { x: 0, y: 0, width: numeric(root.width), height: numeric(root.height) },
      path: `0#fill-${fillIndex}`,
    });
  });

  childNodes(root).forEach((child, index) => {
    walk(child, {
      offsetX: numeric(child.x),
      offsetY: numeric(child.y),
      path: `0/${index}`,
    });
  });

  return {
    schemaVersion: 1,
    root: { width: numeric(root.width), height: numeric(root.height) },
    textAnchors,
    imageAnchors,
    visibleNodeCount,
    nodeTypeCounts,
  };
}
