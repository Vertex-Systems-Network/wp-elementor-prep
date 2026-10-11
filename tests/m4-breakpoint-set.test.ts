import { describe, expect, it } from 'vitest';
import { ELEMENTOR_DEFAULT_BREAKPOINTS, buildP15BreakpointSet, classifyP15Device } from '../src/core/breakpoint-set';
import { breakpointFramesFromSelection } from '../src/plugin/p15-breakpoint-selection';

const frame = (id: string, width: number) => ({ id, name: id, width });

describe('recovery M4.1 — breakpoint set', () => {
  it('classifies by Elementor 4.2.4 default thresholds (mobile ≤767, tablet ≤1024)', () => {
    expect(ELEMENTOR_DEFAULT_BREAKPOINTS).toEqual({ tabletMaxPx: 1024, mobileMaxPx: 767 });
    expect([1440, 1025, 1024, 768, 767, 390].map((width) => classifyP15Device(width)))
      .toEqual(['desktop', 'desktop', 'tablet', 'tablet', 'mobile', 'mobile']);
  });

  it('a desktop/tablet/mobile selection is a confirmable set, widest first, with a stable fingerprint', () => {
    const set = buildP15BreakpointSet([frame('m', 390), frame('d', 1440), frame('t', 834)]);
    expect(set.status).toBe('BREAKPOINT_SET');
    expect(set.members.map((member) => [member.frameId, member.device])).toEqual([['d', 'desktop'], ['t', 'tablet'], ['m', 'mobile']]);
    expect(set.issues).toEqual([]);
    expect(set.fingerprint).toBe('t1024|m767|d@1440|t@834|m@390');
    expect(buildP15BreakpointSet([frame('d', 1440), frame('t', 834), frame('m', 390)]).fingerprint).toBe(set.fingerprint);
    expect(buildP15BreakpointSet([frame('d', 1440), frame('m', 375)]).status).toBe('BREAKPOINT_SET');
  });

  it('never guesses: two frames on one device or no desktop base is REVIEW', () => {
    const twoMobiles = buildP15BreakpointSet([frame('d', 1440), frame('m1', 390), frame('m2', 360)]);
    expect(twoMobiles.status).toBe('REVIEW');
    expect(twoMobiles.issues.map((issue) => issue.code)).toEqual(['BREAKPOINT_DUPLICATE_DEVICE']);
    const noDesktop = buildP15BreakpointSet([frame('t', 1024), frame('m', 390)]);
    expect(noDesktop.issues.map((issue) => issue.code)).toEqual(['BREAKPOINT_DESKTOP_MISSING']);
  });

  it('blocks a wrong frame count, invalid widths, duplicate frames and invalid thresholds', () => {
    expect(buildP15BreakpointSet([frame('d', 1440)]).issues[0]!.code).toBe('BREAKPOINT_FRAME_COUNT');
    expect(buildP15BreakpointSet([frame('a', 1440), frame('b', 900), frame('c', 400), frame('e', 300)]).issues[0]!.code).toBe('BREAKPOINT_FRAME_COUNT');
    expect(buildP15BreakpointSet([frame('d', 1440), frame('m', Number.NaN)]).issues[0]!.code).toBe('BREAKPOINT_INVALID_WIDTH');
    expect(buildP15BreakpointSet([frame('d', 1440), frame('d', 390)]).issues[0]!.code).toBe('BREAKPOINT_DUPLICATE_FRAME');
    const bad = buildP15BreakpointSet([frame('d', 1440), frame('m', 390)], { tabletMaxPx: 700, mobileMaxPx: 767 });
    expect(bad).toMatchObject({ status: 'BLOCKED', members: [], fingerprint: null });
    expect(bad.issues[0]!.code).toBe('BREAKPOINT_INVALID_THRESHOLDS');
  });

  it('a profile can pass its own thresholds, and they are part of the fingerprint', () => {
    const set = buildP15BreakpointSet([frame('d', 1280), frame('t', 1100)], { tabletMaxPx: 1200, mobileMaxPx: 880 });
    expect(set.members.map((member) => member.device)).toEqual(['desktop', 'tablet']);
    expect(set.fingerprint).toBe('t1200|m880|d@1280|t@1100');
  });

  it('reads frames from the selection or from one Section', () => {
    const f = (id: string, width: number, extra: Record<string, unknown> = {}) => ({ id, name: id, type: 'FRAME', width, ...extra });
    expect(breakpointFramesFromSelection([f('d', 1440), f('m', 390)])).toEqual({ ok: true, source: 'frames', frames: [frame('d', 1440), frame('m', 390)] });
    const section = { id: 's', name: 's', type: 'SECTION', children: [f('d', 1440), f('hidden', 834, { visible: false }), { id: 'x', name: 'x', type: 'TEXT' }, f('m', 390)] };
    expect(breakpointFramesFromSelection([section])).toEqual({ ok: true, source: 'section', frames: [frame('d', 1440), frame('m', 390)] });
    expect(breakpointFramesFromSelection([f('d', 1440), { id: 'g', name: 'g', type: 'GROUP' }]).ok).toBe(false);
    expect(breakpointFramesFromSelection([]).ok).toBe(false);
  });
});
