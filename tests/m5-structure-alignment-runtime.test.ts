import { afterEach, describe, expect, it, vi } from 'vitest';

class Node {
  parent: Node | null = null;
  children: Node[] = [];
  visible = true;
  removed = false;
  fills: unknown[] = [];
  clipsContent = false;
  layoutMode = 'NONE';
  plugin: Record<string, string> = {};
  constructor(public id: string, public type: string, public name: string, public x: number, public y: number,
    public width: number, public height: number, public characters?: string) {}
  resize(width: number, height: number) { this.width = width; this.height = height; }
  appendChild(child: Node) { this.insertChild(this.children.length, child); }
  insertChild(index: number, child: Node) {
    if (child.parent) child.parent.children = child.parent.children.filter((node) => node !== child);
    child.parent = this;
    this.children.splice(index, 0, child);
  }
  remove() { this.removed = true; if (this.parent) this.parent.children = this.parent.children.filter((node) => node !== this); }
  setPluginData(key: string, value: string) { this.plugin[key] = value; }
  clone(): Node {
    const copy = new Node(`${this.id}~c`, this.type, this.name, this.x, this.y, this.width, this.height, this.characters);
    copy.layoutMode = this.layoutMode;
    for (const child of this.children) copy.appendChild(child.clone());
    this.parent?.appendChild(copy);
    return copy;
  }
  absolute(): [number, number] {
    let x = this.x; let y = this.y;
    for (let node = this.parent; node && node.type !== 'PAGE'; node = node.parent) { x += node.x; y += node.y; }
    return [x, y];
  }
}
const frame = (id: string, name: string, x: number, y: number, w: number, h: number, children: Node[] = []) => {
  const node = new Node(id, 'FRAME', name, x, y, w, h);
  children.forEach((child) => node.appendChild(child));
  return node;
};
const text = (id: string, name: string, characters: string, x: number, y: number) => new Node(id, 'TEXT', name, x, y, 300, 40, characters);

function scene() {
  const page = new Node('page', 'PAGE', 'Page', 0, 0, 0, 0);
  const desktop = frame('d', 'Page', 0, 0, 1440, 900, [frame('d-hero', 'Hero', 0, 0, 1440, 600, [
    frame('d-text', 'Hero text', 80, 80, 600, 200, [text('d-t', 'Title', 'Build faster', 0, 0), text('d-c', 'Copy', 'Ship today', 0, 80)]),
    frame('d-cta', 'CTA', 80, 320, 200, 56)])]);
  const mobile = frame('m', 'Page mobile', 2000, 0, 390, 1200, [frame('m-hero', 'Hero', 0, 0, 390, 700, [
    text('m-t', 'Title', 'Build faster', 24, 40), text('m-c', 'Copy', 'Ship today', 24, 120), frame('m-cta', 'Button', 24, 200, 200, 56)])]);
  page.appendChild(desktop);
  page.appendChild(mobile);
  return { page, desktop, mobile };
}

afterEach(() => vi.unstubAllGlobals());

async function load(passed: boolean) {
  vi.stubGlobal('figma', { createFrame: () => new Node(`w${Math.random()}`, 'FRAME', 'Frame', 0, 0, 100, 100) });
  const module = await import('../src/plugin/p15-structure-alignment');
  const seen: Array<[string, string]> = [];
  module.setP15AlignmentPixelValidator(async (original, candidate) => { seen.push([original.id, candidate.id]); return { passed, detail: passed ? 'identical' : 'PIXEL_DIFF_EXCEEDED' }; });
  return { ...module, seen };
}

describe('recovery M5.5 — aligned breakpoint duplicate', () => {
  it('keeps a validated duplicate beside the original with desktop names and the rebuilt group; the original is untouched', async () => {
    const { desktop, mobile, page } = scene();
    const { alignP15BreakpointDuplicate, seen } = await load(true);
    const titleBefore = (mobile.children[0]!.children[0]!).absolute();
    const result = await alignP15BreakpointDuplicate(desktop as unknown as FrameNode, mobile as unknown as FrameNode, 'mobile');
    expect(result).toMatchObject({ status: 'KEPT', renames: 1, wraps: 1, duplicateId: 'm~c' });
    const duplicate = page.children.find((node) => node.id === 'm~c')!;
    expect(duplicate).toMatchObject({ name: 'Page mobile — Aligned', x: 2490, y: 0, plugin: { 'p15:alignedFrom': 'm' } });
    const hero = duplicate.children[0]!;
    expect(hero.children.map((child) => child.name)).toEqual(['Hero text', 'CTA']);
    expect(hero.children[0]!.children.map((child) => child.name)).toEqual(['Title', 'Copy']);
    // Same position relative to the duplicate as the original title relative to the original frame.
    const titleAfter = hero.children[0]!.children[0]!.absolute();
    expect([titleAfter[0] - duplicate.x, titleAfter[1] - duplicate.y]).toEqual([titleBefore[0] - mobile.x, titleBefore[1] - mobile.y]);
    expect(mobile.children[0]!.children.map((child) => child.name)).toEqual(['Title', 'Copy', 'Button']);
    expect(seen).toEqual([['m', 'm~c']]);
  });

  it('removes the duplicate when it does not render identically', async () => {
    const { desktop, mobile, page } = scene();
    const { alignP15BreakpointDuplicate } = await load(false);
    const result = await alignP15BreakpointDuplicate(desktop as unknown as FrameNode, mobile as unknown as FrameNode, 'mobile');
    expect(result).toMatchObject({ status: 'DISCARDED', duplicateId: null });
    expect(page.children.map((node) => node.id)).toEqual(['d', 'm']);
  });
});
