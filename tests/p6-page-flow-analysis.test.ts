import { describe, expect, it } from 'vitest';
import { analyzeAdvancedPageFlowCalibration } from '../src/core/advanced-page-flow-analysis';
import type { AdvancedRecipePlan } from '../src/core/advanced-recipe-types';
import type { LinearLayoutFrameGeometry } from '../src/core/linear-layout-analysis';

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

function frame(overrides: Partial<LinearLayoutFrameGeometry> = {}): LinearLayoutFrameGeometry {
  return {
    width: 1200,
    height: 1540,
    children: [
      { id: 'a', x: 100, y: 40, width: 1000, height: 400, visible: true, absolutePositioned: false },
      { id: 'b', x: 100, y: 520, width: 1000, height: 400, visible: true, absolutePositioned: false },
      { id: 'c', x: 100, y: 1000, width: 1000, height: 400, visible: true, absolutePositioned: false },
    ],
    ...overrides,
  };
}

describe('P6 page-flow calibration preflight', () => {
  it('accepts only geometry exactly reproducible by strict vertical Auto Layout', () => {
    const result = analyzeAdvancedPageFlowCalibration(plan(), frame());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan).toMatchObject({
      gap: 80,
      startPadding: 40,
      endPadding: 140,
      crossStartPadding: 100,
      crossEndPadding: 100,
    });
  });

  it('refuses any page-flow plan carrying preservation relationships', () => {
    const result = analyzeAdvancedPageFlowCalibration(plan({ preserveNodeIds: ['header', 'hero'] }), frame());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain('preservation relationships');
  });

  it('refuses non-uniform section gaps even when the classifier could call the page sequential', () => {
    const geometry = frame();
    geometry.children[2] = { ...geometry.children[2]!, y: 1040 };
    const result = analyzeAdvancedPageFlowCalibration(plan(), geometry);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain('gaps are not uniform');
  });

  it('refuses visible absolute-positioned direct children', () => {
    const geometry = frame();
    geometry.children[0] = { ...geometry.children[0]!, absolutePositioned: true };
    const result = analyzeAdvancedPageFlowCalibration(plan(), geometry);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain('absolute-positioned');
  });

  it('refuses a plan that is not explicitly CALIBRATE page-vertical-flow', () => {
    const result = analyzeAdvancedPageFlowCalibration(plan({ decision: 'REVIEW' }), frame());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain('not a CALIBRATE');
  });
});
