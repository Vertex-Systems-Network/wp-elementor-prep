import { describe, expect, it } from 'vitest';
import { analyzeGridLayoutGeometry } from '../src/core/grid-layout-analysis';
import type { GridLayoutFrameGeometry } from '../src/core/grid-layout-analysis';

function gridFixture(): GridLayoutFrameGeometry {
  return {
    width: 540,
    height: 360,
    children: [
      { id: 'a', x: 40, y: 30, width: 210, height: 130, visible: true, absolutePositioned: false },
      { id: 'b', x: 290, y: 30, width: 210, height: 130, visible: true, absolutePositioned: false },
      { id: 'c', x: 40, y: 190, width: 210, height: 130, visible: true, absolutePositioned: false },
      { id: 'd', x: 290, y: 190, width: 210, height: 130, visible: true, absolutePositioned: false },
    ],
  };
}

describe('analyzeGridLayoutGeometry', () => {
  it('derives a complete 2x2 fixed-track grid exactly', () => {
    const result = analyzeGridLayoutGeometry(gridFixture());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan).toEqual({
      columns: 2,
      rows: 2,
      columnWidths: [210, 210],
      rowHeights: [130, 130],
      columnGap: 40,
      rowGap: 30,
      paddingLeft: 40,
      paddingRight: 40,
      paddingTop: 30,
      paddingBottom: 40,
    });
  });

  it('supports different fixed track widths/heights when each track is internally consistent', () => {
    const fixture = gridFixture();
    fixture.width = 590;
    fixture.height = 400;
    fixture.children[1]!.width = 260;
    fixture.children[3]!.width = 260;
    fixture.children[2]!.height = 170;
    fixture.children[3]!.height = 170;
    const result = analyzeGridLayoutGeometry(fixture);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.columnWidths).toEqual([210, 260]);
    expect(result.plan.rowHeights).toEqual([130, 170]);
    expect(result.plan.paddingRight).toBe(40);
    expect(result.plan.paddingBottom).toBe(40);
  });

  it('refuses incomplete/fragmented occupancy', () => {
    const fixture = gridFixture();
    fixture.children.pop();
    const result = analyzeGridLayoutGeometry(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/incomplete|fragmented/);
  });

  it('refuses hidden or absolute direct children', () => {
    const hidden = gridFixture();
    hidden.children[1]!.visible = false;
    const hiddenResult = analyzeGridLayoutGeometry(hidden);
    expect(hiddenResult.ok).toBe(false);
    if (!hiddenResult.ok) expect(hiddenResult.reason).toMatch(/Hidden/);

    const absolute = gridFixture();
    absolute.children[1]!.absolutePositioned = true;
    const absoluteResult = analyzeGridLayoutGeometry(absolute);
    expect(absoluteResult.ok).toBe(false);
    if (!absoluteResult.ok) expect(absoluteResult.reason).toMatch(/absolute/);
  });

  it('refuses layer order that is not already row-major', () => {
    const fixture = gridFixture();
    fixture.children = [fixture.children[0]!, fixture.children[2]!, fixture.children[1]!, fixture.children[3]!];
    const result = analyzeGridLayoutGeometry(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/row-major/);
  });

  it('refuses inconsistent widths inside one column', () => {
    const fixture = gridFixture();
    fixture.children[2]!.width = 190;
    const result = analyzeGridLayoutGeometry(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/Column 1 widths/);
  });

  it('refuses non-uniform column or row gaps', () => {
    const fixture: GridLayoutFrameGeometry = {
      width: 760,
      height: 530,
      children: [],
    };
    let id = 0;
    for (const y of [30, 190, 350]) {
      for (const x of [40, 280, 530]) {
        fixture.children.push({ id: String(id++), x, y, width: 200, height: 130, visible: true, absolutePositioned: false });
      }
    }
    const result = analyzeGridLayoutGeometry(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/Column gaps/);
  });

  it('refuses out-of-bounds grid geometry', () => {
    const fixture = gridFixture();
    fixture.height = 300;
    const result = analyzeGridLayoutGeometry(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/outside/);
  });
});
