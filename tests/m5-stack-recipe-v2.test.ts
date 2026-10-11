import { describe, expect, it } from 'vitest';
import { detectPatterns } from '../src/core/classifier';
import { planStackRecipeV2, simulateStackLayout, surveyStackRecipesV2 } from '../src/core/stack-recipe-v2';
import { auditNode, frameOf, goldenStackSections } from './fixtures/m5-stack-sections';

const byName = (name: string) => goldenStackSections().find((entry) => entry.name === name)!.section;
const eligible = (name: string) => {
  const decision = planStackRecipeV2(byName(name));
  if (decision.decision !== 'ELIGIBLE') throw new Error(`${name}: ${decision.decision} ${'reason' in decision ? decision.reason : ''}`);
  return decision.plan;
};

describe('recovery M5.1 — classifier v2', () => {
  it('counts text/image/vector children and decouples confidence from the child count', () => {
    const plan = eligible('text-pair');
    expect(plan.children.map((child) => child.kind)).toEqual(['text', 'text']);
    expect(plan.confidence).toBe(100);
    // v1 only counts container children: a 2-text section has no detectable stack at the P5 gate.
    expect(detectPatterns(byName('text-pair')).filter((detection) => detection.confidence >= 90)).toEqual([]);
    expect(eligible('card-row').confidence).toBe(100);
  });

  it('detects MIN, CENTER and MAX cross alignment and SPACE_BETWEEN distribution', () => {
    expect(eligible('text-pair').layout).toMatchObject({ direction: 'VERTICAL', crossAlign: 'MIN', primaryAlign: 'MIN', gap: 16, paddingTop: 40, paddingLeft: 40 });
    expect(eligible('feature-centred').layout).toMatchObject({ direction: 'VERTICAL', crossAlign: 'CENTER', gap: 24 });
    expect(eligible('price-right').layout).toMatchObject({ direction: 'VERTICAL', crossAlign: 'MAX', paddingRight: 20 });
    expect(eligible('nav').layout).toMatchObject({ direction: 'HORIZONTAL', crossAlign: 'CENTER', primaryAlign: 'SPACE_BETWEEN', paddingLeft: 80, paddingRight: 80 });
    expect(eligible('card-row').layout).toMatchObject({ direction: 'HORIZONTAL', crossAlign: 'MIN', primaryAlign: 'MIN', gap: 32 });
  });

  it('a slightly imprecise layout keeps a lower but explicit confidence', () => {
    const section = frameOf('near', 0, 0, 400, 200, [auditNode('a', 'text', 20, 20, 100, 20), auditNode('b', 'text', 20.4, 56, 100, 20)]);
    const decision = planStackRecipeV2(section);
    expect(decision.decision === 'ELIGIBLE' && decision.plan.confidence).toBe(96);
  });
});

describe('recovery M5.2 — recipes v2', () => {
  it('infers FILL for a child spanning the padded cross axis and HUG only for auto-resizing text', () => {
    const plan = eligible('list-with-divider');
    expect(plan.children.map((child) => [child.id, child.cross, child.primary])).toEqual([
      ['l-1', 'FIXED', 'HUG'], ['l-2', 'FIXED', 'HUG'], ['l-div', 'FILL', 'FIXED'], ['l-3', 'FIXED', 'HUG'], ['l-4', 'FIXED', 'HUG']]);
  });

  it('synthesises nested sub-stacks for runs of uniform gaps separated by one outer gap', () => {
    const plan = eligible('hero-runs');
    expect(plan.wrappers.map((wrapper) => [wrapper.childIds, wrapper.layout.gap])).toEqual([
      [['h-eyebrow', 'h-title', 'h-copy'], 8], [['h-btn-1', 'h-btn-2'], 8]]);
    expect(plan.layout).toMatchObject({ direction: 'VERTICAL', gap: 48, paddingTop: 64 });
    expect(plan.confidence).toBe(95);
  });

  it('proves every plan by simulation: no child moves', () => {
    for (const entry of goldenStackSections().filter((item) => item.convertible)) {
      const decision = planStackRecipeV2(entry.section);
      expect(decision.decision, entry.name).toBe('ELIGIBLE');
      expect(decision.decision === 'ELIGIBLE' && decision.plan.maxDisplacementPx, entry.name).toBeLessThanOrEqual(0.5);
    }
  });

  it('keeps overlaps, irregular gaps, mixed alignment, absolute children and Auto Layout frames out', () => {
    for (const name of ['overlap', 'irregular', 'mixed-align']) expect(planStackRecipeV2(byName(name)).decision, name).toBe('REVIEW');
    const absolute = frameOf('abs', 0, 0, 300, 200, [auditNode('a', 'text', 10, 10, 100, 20), auditNode('b', 'text', 10, 50, 100, 20, { absolutePositioned: true })]);
    expect(planStackRecipeV2(absolute).decision).toBe('REVIEW');
    expect(planStackRecipeV2({ ...byName('text-pair'), isAutoLayout: true, layoutMode: 'VERTICAL' }).decision).toBe('NOOP');
  });

  it('simulates SPACE_BETWEEN and CENTER exactly', () => {
    const boxes = simulateStackLayout({ direction: 'HORIZONTAL', primaryAlign: 'SPACE_BETWEEN', crossAlign: 'CENTER', gap: 0,
      paddingLeft: 10, paddingRight: 10, paddingTop: 0, paddingBottom: 0 }, 210, 50,
    [{ id: 'a', width: 50, height: 20, fill: false }, { id: 'b', width: 50, height: 40, fill: false }]);
    expect(boxes).toEqual([{ id: 'a', x: 10, y: 15, width: 50, height: 20 }, { id: 'b', x: 150, y: 5, width: 50, height: 40 }]);
  });
});

describe('recovery M5.6 — golden acceptance (recipes v2 survey)', () => {
  it('converts at least 60% of the eligible containers on the golden fixtures with zero simulated violations', () => {
    let candidates = 0;
    let converted = 0;
    for (const entry of goldenStackSections()) {
      const survey = surveyStackRecipesV2(entry.section);
      candidates += survey.candidates;
      converted += survey.eligible.length;
      for (const plan of survey.eligible) expect(plan.maxDisplacementPx).toBeLessThanOrEqual(0.5);
      expect(survey.eligible.length > 0, entry.name).toBe(entry.convertible);
    }
    expect(candidates).toBe(10);
    expect(converted / candidates).toBeGreaterThanOrEqual(0.6);
    expect(converted).toBe(7);
  });
});
