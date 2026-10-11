import type { P15BreakpointMatchV1, P15MatchNode } from './breakpoint-matcher';

/**
 * Cross-breakpoint structure alignment (recovery M5.5). Pure: from the M4 match map, plan how a tablet/mobile
 * duplicate is renamed and wrapped so it shares the desktop hierarchy. Visual geometry is never moved: renames change
 * names only, and a wrapper is a transparent, non-clipping frame placed exactly over children that keep their
 * absolute positions — so a wrap is planned only under a parent without Auto Layout (where adding a child cannot move
 * the others).
 *
 * - rename: every matched variant layer (not the breakpoint frame itself) whose name differs takes the desktop name;
 * - wrap: a desktop container missing on the breakpoint (unmatched, under a matched parent) whose children all exist,
 *   as unmatched direct children of the counterpart parent, in the same order and consecutively, is rebuilt there as
 *   a wrapper with the desktop name. Children are identified by type, name and text content.
 * Anything else stays a review with its reason. Actions address layers by child-index path, so they apply to a clone.
 */
export const P15_STRUCTURE_ALIGNMENT_VERSION = 'p15-structure-alignment-v1' as const;

export interface P15AlignmentRename {
  path: number[];
  variantId: string;
  from: string;
  to: string;
}

export interface P15AlignmentWrap {
  /** Path of the variant parent that receives the wrapper. */
  parentPath: number[];
  /** Indices (in the parent, consecutive) of the children to wrap. */
  childIndices: number[];
  name: string;
  desktopId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface P15StructureAlignmentPlanV1 {
  version: typeof P15_STRUCTURE_ALIGNMENT_VERSION;
  device: P15BreakpointMatchV1['device'];
  renames: P15AlignmentRename[];
  wraps: P15AlignmentWrap[];
  reviews: Array<{ desktopId: string; reason: string }>;
}

interface Indexed { node: P15MatchNode; path: number[]; parent: P15MatchNode | null }

function index(root: P15MatchNode): Map<string, Indexed> {
  const out = new Map<string, Indexed>();
  const visit = (node: P15MatchNode, path: number[], parent: P15MatchNode | null): void => {
    out.set(node.id, { node, path, parent });
    (node.children ?? []).forEach((child, i) => visit(child, [...path, i], node));
  };
  visit(root, [], null);
  return out;
}

const identity = (node: P15MatchNode): string => JSON.stringify([node.type, node.name.trim().toLowerCase(), (node.characters ?? '').trim()]);
const isAutoLayout = (node: P15MatchNode): boolean => {
  const mode = (node as unknown as { layoutMode?: unknown }).layoutMode;
  return mode === 'HORIZONTAL' || mode === 'VERTICAL' || mode === 'GRID';
};

export function planP15StructureAlignment(desktop: P15MatchNode, variant: P15MatchNode, match: P15BreakpointMatchV1): P15StructureAlignmentPlanV1 {
  const d = index(desktop);
  const v = index(variant);
  const counterpart = new Map(match.matches.map((entry) => [entry.desktopId, entry.variantId]));
  const plan: P15StructureAlignmentPlanV1 = { version: P15_STRUCTURE_ALIGNMENT_VERSION, device: match.device, renames: [], wraps: [], reviews: [] };

  for (const [desktopId, variantId] of counterpart) {
    const left = d.get(desktopId)?.node;
    const right = v.get(variantId);
    // The breakpoint frame itself keeps its own name (e.g. "Page mobile"); only its layers align.
    if (left && right && right.path.length > 0 && left.name !== right.node.name) plan.renames.push({ path: right.path, variantId, from: right.node.name, to: left.name });
  }

  const unmatchedVariant = new Set(match.unmatchedVariant);
  for (const desktopId of match.unmatchedDesktop) {
    const entry = d.get(desktopId);
    if (!entry || !entry.parent || (entry.node.children ?? []).length === 0) continue;
    const parentCounterpart = counterpart.get(entry.parent.id);
    if (parentCounterpart === undefined) continue; // Inside another missing container: handled with it (or reviewed).
    const variantParent = v.get(parentCounterpart)!;
    if (isAutoLayout(variantParent.node)) {
      plan.reviews.push({ desktopId, reason: `The ${match.device} parent uses Auto Layout; a wrapper there would move its children.` });
      continue;
    }
    const siblings = variantParent.node.children ?? [];
    const wanted = (entry.node.children ?? []).filter((child) => child.visible !== false).map(identity);
    const indices = wanted.map((key) => siblings.findIndex((child, i) => unmatchedVariant.has(child.id) && identity(child) === key && i >= 0));
    if (indices.some((i) => i < 0)) {
      plan.reviews.push({ desktopId, reason: `Not every child of "${entry.node.name}" exists directly under its ${match.device} counterpart parent.` });
      continue;
    }
    if (new Set(indices).size !== indices.length || indices.some((value, i) => i > 0 && value !== indices[i - 1]! + 1)) {
      plan.reviews.push({ desktopId, reason: `The children of "${entry.node.name}" are not consecutive, in order, on ${match.device}.` });
      continue;
    }
    const boxes = indices.map((i) => siblings[i]!);
    if (boxes.some((box) => ![box.x, box.y, box.width, box.height].every((value) => typeof value === 'number' && Number.isFinite(value)))) {
      plan.reviews.push({ desktopId, reason: 'A child to wrap has no geometry.' });
      continue;
    }
    const x = Math.min(...boxes.map((box) => box.x!));
    const y = Math.min(...boxes.map((box) => box.y!));
    plan.wraps.push({ parentPath: variantParent.path, childIndices: indices, name: entry.node.name, desktopId,
      x, y, width: Math.max(...boxes.map((box) => box.x! + box.width!)) - x, height: Math.max(...boxes.map((box) => box.y! + box.height!)) - y });
  }
  // Wraps are applied deepest and last-first so earlier child indices stay valid.
  plan.wraps.sort((a, b) => b.parentPath.length - a.parentPath.length || b.childIndices[0]! - a.childIndices[0]!);
  plan.renames.sort((a, b) => a.path.join('/').localeCompare(b.path.join('/')));
  return plan;
}
