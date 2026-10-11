import { afterEach, describe, expect, it, vi } from 'vitest';
import { scanSceneNode } from '../src/core/scanner';
import { stackRecipeV2SafePlans } from '../src/core/stack-recipe-v2-safe';

/** A minimal Figma node mock: no Auto Layout engine (children keep x/y), absolute boxes follow the parent chain. */
class MockNode {
  parent: MockNode | null = null;
  children: MockNode[] = [];
  visible = true;
  fills: unknown[] = [];
  strokes: unknown[] = [];
  effects: unknown[] = [];
  opacity = 1;
  blendMode = 'PASS_THROUGH';
  rotation = 0;
  clipsContent = false;
  layoutMode = 'NONE';
  layoutPositioning = 'AUTO';
  layoutAlign = 'INHERIT';
  layoutSizingVertical = 'FIXED';
  layoutSizingHorizontal = 'FIXED';
  textAutoResize?: string;
  characters?: string;
  [key: string]: unknown;
  constructor(public id: string, public type: string, public name: string, public x: number, public y: number,
    public width: number, public height: number) {
    if (type === 'TEXT') { this.characters = name; this.textAutoResize = 'HEIGHT'; }
  }
  get absoluteBoundingBox() {
    let x = this.x;
    let y = this.y;
    for (let node = this.parent; node; node = node.parent) { x += node.x; y += node.y; }
    return { x, y, width: this.width, height: this.height };
  }
  resize(width: number, height: number) { this.width = width; this.height = height; }
  appendChild(child: MockNode) { this.insertChild(this.children.length, child); }
  insertChild(index: number, child: MockNode) {
    if (child.parent) child.parent.children = child.parent.children.filter((node) => node !== child);
    child.parent = this;
    this.children.splice(index, 0, child);
  }
}
const frame = (id: string, x: number, y: number, w: number, h: number, children: MockNode[]) => {
  const node = new MockNode(id, 'FRAME', id, x, y, w, h);
  for (const child of children) node.appendChild(child);
  return node;
};
const text = (id: string, x: number, y: number, w: number, h: number) => new MockNode(id, 'TEXT', id, x, y, w, h);
let created = 0;

afterEach(() => vi.unstubAllGlobals());

async function apply(root: MockNode) {
  vi.stubGlobal('figma', { createFrame: () => new MockNode(`wrapper-${++created}`, 'FRAME', 'Frame', 0, 0, 100, 100), mixed: Symbol('mixed') });
  const { applySafeRecipeToCandidate } = await import('../src/plugin/safe-recipe-transform');
  const audit = scanSceneNode(root as unknown as SceneNode);
  const [plan] = stackRecipeV2SafePlans(audit, []);
  if (!plan) throw new Error('no v2 plan');
  return { plan, result: applySafeRecipeToCandidate(root as unknown as FrameNode, plan) };
}

describe('recovery M5.2 — recipes v2 transform on a staged candidate', () => {
  it('sets the planned Auto Layout on a 2-text stack and keeps every child in place', async () => {
    const root = frame('root', 100, 50, 600, 200, [text('h', 40, 40, 300, 48), text('p', 40, 104, 420, 56)]);
    const { plan, result } = await apply(root);
    expect(plan).toMatchObject({ recipe: 'stack-v2', targetPath: [], evidence: { direction: 'VERTICAL', crossAlign: 'MIN', wrappers: 0 } });
    expect(result).toMatchObject({ applied: true });
    expect(root).toMatchObject({ layoutMode: 'VERTICAL', itemSpacing: 16, paddingTop: 40, paddingLeft: 40, primaryAxisAlignItems: 'MIN',
      counterAxisAlignItems: 'MIN', primaryAxisSizingMode: 'FIXED', width: 600, height: 200 });
    expect(root.children[0]!.layoutSizingVertical).toBe('HUG');
  });

  it('wraps nested runs exactly over their children (absolute positions unchanged)', async () => {
    const root = frame('hero', 0, 0, 800, 400, [text('e', 64, 64, 200, 20), text('t', 64, 92, 560, 64), text('c', 64, 164, 480, 48),
      frame('b1', 64, 260, 160, 48, []), frame('b2', 64, 316, 160, 48, [])]);
    const before = ['e', 't', 'c', 'b1', 'b2'].map((id) => JSON.stringify(findDeep(root, id)!.absoluteBoundingBox));
    const { result } = await apply(root);
    expect(result).toMatchObject({ applied: true });
    expect(root.children.map((child) => child.children.map((grand) => grand.id))).toEqual([['e', 't', 'c'], ['b1', 'b2']]);
    expect(root.children[0]).toMatchObject({ layoutMode: 'VERTICAL', itemSpacing: 8, fills: [], clipsContent: false, x: 64, y: 64 });
    expect(root).toMatchObject({ layoutMode: 'VERTICAL', itemSpacing: 48 });
    expect(['e', 't', 'c', 'b1', 'b2'].map((id) => JSON.stringify(findDeep(root, id)!.absoluteBoundingBox))).toEqual(before);
  });

  it('refuses when the candidate re-plans to a different layout than approved', async () => {
    const root = frame('root', 0, 0, 600, 200, [text('h', 40, 40, 300, 48), text('p', 40, 104, 420, 56)]);
    vi.stubGlobal('figma', { createFrame: () => new MockNode('w', 'FRAME', 'Frame', 0, 0, 1, 1), mixed: Symbol('mixed') });
    const { applySafeRecipeToCandidate } = await import('../src/plugin/safe-recipe-transform');
    const [plan] = stackRecipeV2SafePlans(scanSceneNode(root as unknown as SceneNode), []);
    root.children[1]!.y = 120; // the candidate drifted after planning
    expect(applySafeRecipeToCandidate(root as unknown as FrameNode, plan!)).toMatchObject({ applied: false });
    expect(root.layoutMode).toBe('NONE');
  });
});

function findDeep(node: MockNode, id: string): MockNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findDeep(child, id);
    if (found) return found;
  }
  return null;
}
