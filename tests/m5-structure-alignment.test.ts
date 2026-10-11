import { describe, expect, it } from 'vitest';
import { matchP15Breakpoint, type P15MatchNode } from '../src/core/breakpoint-matcher';
import { planP15StructureAlignment } from '../src/core/breakpoint-structure-alignment';

const text = (id: string, name: string, characters: string, x: number, y: number, width = 300, height = 40): P15MatchNode =>
  ({ id, name, type: 'TEXT', characters, x, y, width, height });
const frame = (id: string, name: string, x: number, y: number, width: number, height: number, children: P15MatchNode[], extra: Record<string, unknown> = {}): P15MatchNode =>
  ({ id, name, type: 'FRAME', x, y, width, height, children, ...extra });

// Desktop groups the title and copy in "Hero text"; mobile has them loose under the hero, and calls the CTA "Button".
const desktop = () => frame('d', 'Page', 0, 0, 1440, 900, [
  frame('d-hero', 'Hero', 0, 0, 1440, 600, [
    frame('d-text', 'Hero text', 80, 80, 600, 200, [text('d-t', 'Title', 'Build faster', 0, 0), text('d-c', 'Copy', 'Ship today', 0, 80)]),
    frame('d-cta', 'CTA', 80, 320, 200, 56, []),
  ]),
]);
const mobile = (heroExtra: Record<string, unknown> = {}) => frame('m', 'Page', 0, 0, 390, 1200, [
  frame('m-hero', 'Hero', 0, 0, 390, 700, [
    text('m-t', 'Title', 'Build faster', 24, 40), text('m-c', 'Copy', 'Ship today', 24, 120), frame('m-cta', 'Button', 24, 200, 200, 56, []),
  ], heroExtra),
]);

describe('recovery M5.5 — cross-breakpoint structure alignment planner', () => {
  it('renames matched layers to the desktop names and rebuilds a missing desktop group over the same children', () => {
    const match = matchP15Breakpoint(desktop(), mobile(), 'mobile');
    const plan = planP15StructureAlignment(desktop(), mobile(), match);
    expect(plan.renames).toEqual([{ path: [0, 2], variantId: 'm-cta', from: 'Button', to: 'CTA' }]);
    expect(plan.wraps).toEqual([{ parentPath: [0], childIndices: [0, 1], name: 'Hero text', desktopId: 'd-text', x: 24, y: 40, width: 300, height: 120 }]);
    expect(plan.reviews).toEqual([]);
  });

  it('never wraps under an Auto Layout parent (it would move the children)', () => {
    const variant = mobile({ layoutMode: 'VERTICAL' });
    const plan = planP15StructureAlignment(desktop(), variant, matchP15Breakpoint(desktop(), variant, 'mobile'));
    expect(plan.wraps).toEqual([]);
    expect(plan.reviews).toEqual([{ desktopId: 'd-text', reason: 'The mobile parent uses Auto Layout; a wrapper there would move its children.' }]);
  });

  it('reviews a group whose children are not consecutive or missing on the breakpoint', () => {
    const scattered = frame('m', 'Page', 0, 0, 390, 1200, [frame('m-hero', 'Hero', 0, 0, 390, 700, [
      text('m-t', 'Title', 'Build faster', 24, 40), frame('m-cta', 'CTA', 24, 120, 200, 56, []), text('m-c', 'Copy', 'Ship today', 24, 200)])]);
    const plan = planP15StructureAlignment(desktop(), scattered, matchP15Breakpoint(desktop(), scattered, 'mobile'));
    expect(plan.wraps).toEqual([]);
    expect(plan.reviews[0]!.reason).toContain('not consecutive');
    const missing = frame('m', 'Page', 0, 0, 390, 1200, [frame('m-hero', 'Hero', 0, 0, 390, 700, [text('m-t', 'Title', 'Build faster', 24, 40), frame('m-cta', 'CTA', 24, 200, 200, 56, [])])]);
    expect(planP15StructureAlignment(desktop(), missing, matchP15Breakpoint(desktop(), missing, 'mobile')).reviews[0]!.reason).toContain('Not every child');
  });
});
