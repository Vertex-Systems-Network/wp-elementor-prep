import { matchP15Breakpoint, type P15MatchNode } from '../core/breakpoint-matcher';
import { planP15StructureAlignment, type P15StructureAlignmentPlanV1 } from '../core/breakpoint-structure-alignment';

/**
 * Recovery M5.5 runtime: align a tablet/mobile breakpoint frame with the desktop hierarchy on a duplicate. The
 * original breakpoint frame is never touched. The plan (renames, wrappers) is applied to a clone placed beside it,
 * then the clone must render identically to the original at full resolution (tiled, per-section budgets); otherwise
 * the clone is removed. A kept clone is named `<frame> — Aligned`.
 */
export type P15AlignmentPixelValidator = (original: FrameNode, candidate: FrameNode) => Promise<{ passed: boolean; detail: string }>;

let pixelValidator: P15AlignmentPixelValidator | null = null;

/** main.ts wires the shared full-resolution validator (the one the plugin UI answers). */
export function setP15AlignmentPixelValidator(validator: P15AlignmentPixelValidator): void {
  pixelValidator = validator;
}

export const P15_ALIGNED_NAME_SUFFIX = ' — Aligned';
export const P15_ALIGNED_GAP_PX = 100;

export interface P15AlignmentRunResult {
  device: 'tablet' | 'mobile';
  status: 'KEPT' | 'DISCARDED' | 'NOOP';
  duplicateId: string | null;
  renames: number;
  wraps: number;
  reviews: P15StructureAlignmentPlanV1['reviews'];
  detail: string;
}

function byPath(root: SceneNode, path: readonly number[]): SceneNode | null {
  let current: SceneNode = root;
  for (const index of path) {
    if (!('children' in current)) return null;
    const next: SceneNode | undefined = current.children[index];
    if (!next) return null;
    current = next;
  }
  return current;
}

export function applyP15StructureAlignment(clone: FrameNode, plan: P15StructureAlignmentPlanV1): void {
  // Renames first: their paths refer to the tree before any wrapper is inserted.
  for (const rename of plan.renames) {
    const node = byPath(clone, rename.path);
    if (!node) throw new Error(`Rename target ${rename.path.join('/')} no longer resolves.`);
    node.name = rename.to;
  }
  // Wraps are ordered deepest and last-first by the planner, so earlier indices stay valid.
  for (const wrap of plan.wraps) {
    const parent = byPath(clone, wrap.parentPath);
    if (!parent || !('children' in parent) || !('insertChild' in parent)) throw new Error('Wrap parent no longer resolves.');
    const container = parent as SceneNode & ChildrenMixin;
    const children = wrap.childIndices.map((index) => container.children[index]);
    if (children.some((child) => !child)) throw new Error('A child to wrap no longer resolves.');
    const wrapper = figma.createFrame();
    wrapper.name = wrap.name;
    wrapper.fills = [];
    wrapper.clipsContent = false;
    container.insertChild(wrap.childIndices[0]!, wrapper);
    wrapper.x = wrap.x;
    wrapper.y = wrap.y;
    wrapper.resize(Math.max(0.01, wrap.width), Math.max(0.01, wrap.height));
    for (const child of children as SceneNode[]) {
      const x = child.x - wrap.x;
      const y = child.y - wrap.y;
      wrapper.appendChild(child);
      child.x = x;
      child.y = y;
    }
  }
}

export async function alignP15BreakpointDuplicate(desktop: FrameNode, variant: FrameNode, device: 'tablet' | 'mobile'): Promise<P15AlignmentRunResult> {
  const match = matchP15Breakpoint(desktop as unknown as P15MatchNode, variant as unknown as P15MatchNode, device);
  const plan = planP15StructureAlignment(desktop as unknown as P15MatchNode, variant as unknown as P15MatchNode, match);
  const base = { device, renames: plan.renames.length, wraps: plan.wraps.length, reviews: plan.reviews };
  if (plan.renames.length === 0 && plan.wraps.length === 0) {
    return { ...base, status: 'NOOP', duplicateId: null, detail: 'The breakpoint frame already shares the desktop hierarchy (or only reviews remain).' };
  }
  if (!pixelValidator) return { ...base, status: 'DISCARDED', duplicateId: null, detail: 'Full-resolution validation is unavailable; nothing was created.' };
  const clone = variant.clone();
  try {
    clone.x = variant.x + variant.width + P15_ALIGNED_GAP_PX;
    clone.y = variant.y;
    applyP15StructureAlignment(clone, plan);
    const validation = await pixelValidator(variant, clone);
    if (!validation.passed) {
      clone.remove();
      return { ...base, status: 'DISCARDED', duplicateId: null, detail: `The aligned duplicate did not render identically: ${validation.detail}` };
    }
    clone.name = `${variant.name}${P15_ALIGNED_NAME_SUFFIX}`;
    clone.setPluginData('p15:alignedFrom', variant.id);
    return { ...base, status: 'KEPT', duplicateId: clone.id, detail: validation.detail };
  } catch (error) {
    if (!clone.removed) clone.remove();
    return { ...base, status: 'DISCARDED', duplicateId: null, detail: error instanceof Error ? error.message : String(error) };
  }
}
