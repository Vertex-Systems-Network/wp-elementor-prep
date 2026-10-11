import { describe, expect, it } from 'vitest';
import { matchP15Breakpoint, scoreP15Pair, type P15MatchNode } from '../src/core/breakpoint-matcher';

const text = (id: string, name: string, characters: string, x: number, y: number, width: number, height = 40): P15MatchNode =>
  ({ id, name, type: 'TEXT', characters, x, y, width, height });
const frame = (id: string, name: string, x: number, y: number, width: number, height: number, children: P15MatchNode[] = []): P15MatchNode =>
  ({ id, name, type: 'FRAME', x, y, width, height, children });
const image = (id: string, hash: string, x: number, y: number, width: number, height: number): P15MatchNode =>
  ({ id, name: 'Rectangle', type: 'RECTANGLE', x, y, width, height, fills: [{ type: 'IMAGE', visible: true, imageHash: hash }] });

function desktop(): P15MatchNode {
  return frame('d', 'Landing desktop', 0, 0, 1440, 900, [
    frame('d-hero', 'Hero', 0, 0, 1440, 600, [
      text('d-title', 'Title', 'Build faster', 120, 200, 600),
      text('d-sub', 'Subtitle', 'Ship it today', 120, 280, 600),
      image('d-shot', 'shot', 800, 120, 520, 360),
    ]),
    frame('d-cards', 'Cards', 0, 600, 1440, 300, [
      frame('d-card-1', 'Card', 120, 40, 360, 220, [text('d-c1', 'Card title', 'Fast', 24, 24, 300)]),
      frame('d-card-2', 'Card', 540, 40, 360, 220, [text('d-c2', 'Card title', 'Safe', 24, 24, 300)]),
      frame('d-card-3', 'Card', 960, 40, 360, 220, [text('d-c3', 'Card title', 'Exact', 24, 24, 300)]),
    ]),
  ]);
}

function mobile(): P15MatchNode {
  return frame('m', 'Landing mobile', 0, 0, 390, 1600, [
    frame('m-hero', 'Hero', 0, 0, 390, 700, [
      text('m-title', 'Title', 'Build faster', 24, 40, 342),
      text('m-sub', 'Subtitle', 'Ship it today', 24, 120, 342),
      image('m-shot', 'shot', 24, 200, 342, 240),
    ]),
    frame('m-cards', 'Cards', 0, 700, 390, 900, [
      frame('m-card-1', 'Card', 24, 24, 342, 260, [text('m-c1', 'Card title', 'Fast', 24, 24, 294)]),
      frame('m-card-2', 'Card', 24, 308, 342, 260, [text('m-c2', 'Card title', 'Safe', 24, 24, 294)]),
      frame('m-card-3', 'Card', 24, 592, 342, 260, [text('m-c3', 'Card title', 'Exact', 24, 24, 294)]),
    ]),
  ]);
}

describe('recovery M4.2 — deterministic node matcher', () => {
  it('matches a reflowed landing page top-down, including repeated cards, with no unmatched nodes', () => {
    const result = matchP15Breakpoint(desktop(), mobile(), 'mobile');
    expect(result.matches.map((match) => [match.desktopId, match.variantId])).toEqual([
      ['d', 'm'], ['d-c1', 'm-c1'], ['d-c2', 'm-c2'], ['d-c3', 'm-c3'], ['d-card-1', 'm-card-1'], ['d-card-2', 'm-card-2'],
      ['d-card-3', 'm-card-3'], ['d-cards', 'm-cards'], ['d-hero', 'm-hero'], ['d-shot', 'm-shot'], ['d-sub', 'm-sub'], ['d-title', 'm-title'],
    ]);
    expect(result).toMatchObject({ version: 'p15-breakpoint-match-v1', device: 'mobile', unmatchedDesktop: [], unmatchedVariant: [], ambiguous: [] });
    for (const match of result.matches) expect(match.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it('is deterministic and independent of the variant child order in the input', () => {
    const shuffled = mobile();
    const hero = shuffled.children![0]!;
    (hero as unknown as { children: P15MatchNode[] }).children = [...hero.children!].reverse();
    const a = matchP15Breakpoint(desktop(), mobile(), 'mobile');
    const b = matchP15Breakpoint(desktop(), shuffled, 'mobile');
    expect(b.matches.map((match) => [match.desktopId, match.variantId])).toEqual(a.matches.map((match) => [match.desktopId, match.variantId]));
    expect(matchP15Breakpoint(desktop(), mobile(), 'mobile')).toEqual(a);
  });

  it('reports nodes present on one breakpoint only as unmatched (with their subtree)', () => {
    const m = mobile();
    (m.children![0] as unknown as { children: P15MatchNode[] }).children = m.children![0]!.children!.filter((child) => child.id !== 'm-shot');
    (m.children as P15MatchNode[]).push(frame('m-menu', 'Mobile menu', 0, 0, 390, 60, [text('m-menu-t', 'Menu', 'Menu', 0, 0, 100)]));
    const result = matchP15Breakpoint(desktop(), m, 'mobile');
    expect(result.unmatchedDesktop).toEqual(['d-shot']);
    expect(result.unmatchedVariant).toEqual(['m-menu', 'm-menu-t']);
  });

  it('never guesses between indistinguishable candidates', () => {
    // The desktop label sits in the middle (order 0.5); the two tablet labels sit at order 0 and 1, same box.
    const d = frame('d', 'D', 0, 0, 1000, 100, [image('d-x', 'x', 0, 0, 10, 10), text('d-a', 'Label', 'Same', 0, 0, 100), image('d-y', 'y', 0, 0, 10, 10)]);
    const v = frame('v', 'V', 0, 0, 1000, 100, [text('v-a', 'Label', 'Same', 0, 0, 100), text('v-b', 'Label', 'Same', 0, 0, 100)]);
    const result = matchP15Breakpoint(d, v, 'tablet');
    expect(result.matches).toEqual([{ desktopId: 'd', variantId: 'v', confidence: 1 }]);
    expect(result.ambiguous).toEqual([{ desktopId: 'd-a', variantIds: ['v-a', 'v-b'], detail: expect.stringContaining('not matched') }]);
    expect(result.unmatchedDesktop).toEqual(['d-a', 'd-x', 'd-y']);
    expect(result.unmatchedVariant).toEqual(['v-a', 'v-b']);
  });

  it('never pairs different node types, and explains its score terms', () => {
    const parent = frame('p', 'P', 0, 0, 100, 100);
    expect(scoreP15Pair(text('a', 'X', 'x', 0, 0, 10), 0, 1, parent, image('b', 'h', 0, 0, 10, 10), 0, 1, parent)).toBeNull();
    // Same name, same text, same order, same centre → 1. Different text only → 0.7.
    expect(scoreP15Pair(text('a', 'X', 'x', 0, 0, 10), 0, 1, parent, text('b', 'X', 'x', 0, 0, 10), 0, 1, parent)).toBe(1);
    expect(scoreP15Pair(text('a', 'X', 'x', 0, 0, 10), 0, 1, parent, text('b', 'X', 'y', 0, 0, 10), 0, 1, parent)).toBe(0.7);
    // A GROUP and a FRAME are both containers.
    expect(scoreP15Pair({ ...frame('a', 'C', 0, 0, 10, 10), type: 'GROUP' }, 0, 1, parent, frame('b', 'C', 0, 0, 10, 10), 0, 1, parent)).toBe(1);
  });

  it('ignores hidden layers', () => {
    const d = desktop();
    (d.children![0]!.children![2] as { visible: boolean }).visible = false;
    const result = matchP15Breakpoint(d, mobile(), 'mobile');
    expect(result.unmatchedDesktop).toEqual([]);
    expect(result.unmatchedVariant).toEqual(['m-shot']);
  });
});
