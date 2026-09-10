import { describe, expect, it } from 'vitest';
import type { AdvancedRecipePlan } from '../src/core/advanced-recipe-types';
import { applyAdvancedRecipeToCalibrationCandidate } from '../src/plugin/advanced-recipe-transform';

function plan(overrides: Partial<AdvancedRecipePlan> = {}): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'CALIBRATE',
    recipe: 'page-vertical-flow',
    reasonCode: 'CANDIDATE_READY_FOR_CALIBRATION',
    reason: 'fixture',
    confidence: 98,
    minConfidence: 94,
    pattern: 'page-vertical-flow',
    targetNodeId: 'page',
    targetNodeName: 'Desktop Page',
    targetPath: [],
    preserveNodeIds: [],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: {},
    ...overrides,
  };
}

function child(id: string, y: number, options: { visible?: boolean; absolute?: boolean } = {}) {
  return {
    id,
    type: 'FRAME',
    x: 100,
    y,
    width: 1000,
    height: 400,
    visible: options.visible ?? true,
    ...(options.absolute ? { layoutPositioning: 'ABSOLUTE' } : {}),
  };
}

function fakeFrame(children = [child('a', 40), child('b', 520), child('c', 1000)]) {
  const frame = {
    id: 'page',
    type: 'FRAME',
    width: 1200,
    height: 1540,
    layoutMode: 'NONE',
    children,
    primaryAxisSizingMode: 'AUTO',
    counterAxisSizingMode: 'AUTO',
    primaryAxisAlignItems: 'CENTER',
    counterAxisAlignItems: 'CENTER',
    itemSpacing: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    resize(width: number, height: number) {
      this.width = width;
      this.height = height;
    },
  };
  return frame as unknown as FrameNode;
}

describe('P6 page-flow clone transformer golden fixture', () => {
  it('maps exact manual geometry to fixed vertical Auto Layout without root/child drift', () => {
    const frame = fakeFrame();
    const before = frame.children.map((item) => ({ id: item.id, x: item.x, y: item.y, width: item.width, height: item.height }));

    const result = applyAdvancedRecipeToCalibrationCandidate(frame, plan());

    expect(result.applied).toBe(true);
    expect(frame.layoutMode).toBe('VERTICAL');
    expect(frame.primaryAxisSizingMode).toBe('FIXED');
    expect(frame.counterAxisSizingMode).toBe('FIXED');
    expect(frame.primaryAxisAlignItems).toBe('MIN');
    expect(frame.counterAxisAlignItems).toBe('MIN');
    expect(frame.itemSpacing).toBe(80);
    expect(frame.paddingTop).toBe(40);
    expect(frame.paddingBottom).toBe(140);
    expect(frame.paddingLeft).toBe(100);
    expect(frame.paddingRight).toBe(100);
    expect(frame.width).toBe(1200);
    expect(frame.height).toBe(1540);
    expect(frame.children.map((item) => ({ id: item.id, x: item.x, y: item.y, width: item.width, height: item.height }))).toEqual(before);
  });

  it('refuses preservation-sensitive plans before changing layout mode', () => {
    const frame = fakeFrame();
    const result = applyAdvancedRecipeToCalibrationCandidate(frame, plan({ preserveNodeIds: ['header', 'hero'] }));
    expect(result.applied).toBe(false);
    expect(result.reason).toContain('preservation relationships');
    expect(frame.layoutMode).toBe('NONE');
  });

  it('refuses hidden direct children before changing layout mode', () => {
    const frame = fakeFrame([child('a', 40), child('b', 520, { visible: false }), child('c', 1000)]);
    const result = applyAdvancedRecipeToCalibrationCandidate(frame, plan());
    expect(result.applied).toBe(false);
    expect(result.reason).toContain('Hidden direct children');
    expect(frame.layoutMode).toBe('NONE');
  });

  it('refuses absolute direct children before changing layout mode', () => {
    const frame = fakeFrame([child('a', 40), child('b', 520, { absolute: true }), child('c', 1000)]);
    const result = applyAdvancedRecipeToCalibrationCandidate(frame, plan());
    expect(result.applied).toBe(false);
    expect(result.reason).toContain('absolute-positioned');
    expect(frame.layoutMode).toBe('NONE');
  });
});
