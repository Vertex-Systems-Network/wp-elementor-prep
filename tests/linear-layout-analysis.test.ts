import { describe, expect, it } from 'vitest';
import { analyzeLinearLayoutGeometry, type LinearLayoutFrameGeometry } from '../src/core/linear-layout-analysis';

function verticalFixture(): LinearLayoutFrameGeometry {
  return {
    width: 420,
    height: 360,
    children: [
      { id: 'a', x: 40, y: 30, width: 300, height: 60, visible: true, absolutePositioned: false },
      { id: 'b', x: 40, y: 110, width: 300, height: 80, visible: true, absolutePositioned: false },
      { id: 'c', x: 40, y: 210, width: 300, height: 70, visible: true, absolutePositioned: false },
    ],
  };
}

function horizontalFixture(): LinearLayoutFrameGeometry {
  return {
    width: 560,
    height: 220,
    children: [
      { id: 'a', x: 30, y: 40, width: 120, height: 110, visible: true, absolutePositioned: false },
      { id: 'b', x: 170, y: 40, width: 140, height: 110, visible: true, absolutePositioned: false },
      { id: 'c', x: 330, y: 40, width: 100, height: 110, visible: true, absolutePositioned: false },
    ],
  };
}

describe('analyzeLinearLayoutGeometry', () => {
  it('derives exact vertical padding and uniform gap', () => {
    const result = analyzeLinearLayoutGeometry(verticalFixture(), 'VERTICAL');
    expect(result).toEqual({
      ok: true,
      plan: {
        gap: 20,
        startPadding: 30,
        endPadding: 80,
        crossStartPadding: 40,
        crossEndPadding: 80,
      },
    });
  });

  it('derives exact horizontal padding and uniform gap', () => {
    const result = analyzeLinearLayoutGeometry(horizontalFixture(), 'HORIZONTAL');
    expect(result).toEqual({
      ok: true,
      plan: {
        gap: 20,
        startPadding: 30,
        endPadding: 130,
        crossStartPadding: 40,
        crossEndPadding: 70,
      },
    });
  });

  it('allows <=1 px alignment/gap noise but rejects larger ambiguity', () => {
    const within = verticalFixture();
    within.children[1]!.x += 0.75;
    within.children[2]!.y += 0.5;
    expect(analyzeLinearLayoutGeometry(within, 'VERTICAL').ok).toBe(true);

    const beyond = verticalFixture();
    beyond.children[1]!.x += 2;
    const result = analyzeLinearLayoutGeometry(beyond, 'VERTICAL');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/Cross-axis/);
  });

  it('refuses layer order that differs from visual flow', () => {
    const fixture = verticalFixture();
    fixture.children = [fixture.children[1]!, fixture.children[0]!, fixture.children[2]!];
    const result = analyzeLinearLayoutGeometry(fixture, 'VERTICAL');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/Layer order/);
  });

  it('refuses visible absolute children', () => {
    const fixture = horizontalFixture();
    fixture.children[1]!.absolutePositioned = true;
    const result = analyzeLinearLayoutGeometry(fixture, 'HORIZONTAL');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/absolute-positioned/);
  });

  it('refuses overlaps', () => {
    const fixture = horizontalFixture();
    fixture.children[1]!.x = 140;
    const result = analyzeLinearLayoutGeometry(fixture, 'HORIZONTAL');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/overlap/);
  });

  it('refuses non-uniform gaps', () => {
    const fixture = verticalFixture();
    fixture.children[2]!.y = 220;
    const result = analyzeLinearLayoutGeometry(fixture, 'VERTICAL');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/gaps are not uniform/);
  });

  it('ignores hidden direct children for linear flow', () => {
    const fixture = verticalFixture();
    fixture.children.splice(1, 0, {
      id: 'hidden', x: 300, y: 999, width: 10, height: 10, visible: false, absolutePositioned: true,
    });
    expect(analyzeLinearLayoutGeometry(fixture, 'VERTICAL').ok).toBe(true);
  });

  it('refuses invalid or out-of-bounds geometry', () => {
    const badFrame = verticalFixture();
    badFrame.width = Number.NaN;
    expect(analyzeLinearLayoutGeometry(badFrame, 'VERTICAL').ok).toBe(false);

    const out = verticalFixture();
    out.children[2]!.y = 310;
    out.children[2]!.height = 70;
    const result = analyzeLinearLayoutGeometry(out, 'VERTICAL');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/outside/);
  });
});
