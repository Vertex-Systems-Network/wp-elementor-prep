import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { P15MatchNode } from '../src/core/breakpoint-matcher';
import { responsiveReportFor } from '../src/core/breakpoint-report';
import { buildP15BreakpointSet } from '../src/core/breakpoint-set';

const text = (id: string, name: string, characters: string, y: number): P15MatchNode => ({ id, name, type: 'TEXT', characters, x: 24, y, width: 300, height: 40 });
const frame = (prefix: string, width: number, withFooter: boolean): P15MatchNode => ({ id: prefix, name: `Page ${prefix}`, type: 'FRAME', x: 0, y: 0, width, height: 1200, children: [
  { id: `${prefix}-hero`, name: 'Hero', type: 'FRAME', x: 0, y: 0, width, height: 600, children: [text(`${prefix}-t`, 'Title', 'Build', 40), text(`${prefix}-c`, 'Copy', 'Ship', 120)] },
  ...(withFooter ? [{ id: `${prefix}-foot`, name: 'Footer', type: 'FRAME', x: 0, y: 600, width, height: 200, children: [] } as P15MatchNode] : []),
] });

describe('recovery M4.5 — responsive report', () => {
  it('reports per desktop section the match status and confidence on each breakpoint', () => {
    const frames = new Map([['d', frame('d', 1440, true)], ['t', frame('t', 834, true)], ['m', frame('m', 390, false)]]);
    const set = buildP15BreakpointSet([...frames.values()].map((node) => ({ id: node.id, name: node.name, width: node.width! })));
    const report = responsiveReportFor(set, frames)!;
    expect(report.sections.map((section) => [section.name, section.devices.map((entry) => [entry.device, entry.status, entry.unmatchedInside])])).toEqual([
      ['Hero', [['tablet', 'MATCHED', 0], ['mobile', 'MATCHED', 0]]],
      ['Footer', [['tablet', 'MATCHED', 0], ['mobile', 'UNMATCHED', 0]]],
    ]);
    expect(report.sections[0]!.devices[0]!.confidence).toBeGreaterThanOrEqual(0.6);
    expect(report.variantOnly).toEqual([{ device: 'tablet', count: 0 }, { device: 'mobile', count: 0 }]);
  });

  it('returns null without the desktop frame', () => {
    const set = buildP15BreakpointSet([{ id: 'd', name: 'd', width: 1440 }, { id: 'm', name: 'm', width: 390 }]);
    expect(responsiveReportFor(set, new Map([['m', frame('m', 390, false)]]))).toBeNull();
  });

});
