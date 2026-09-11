import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport } from '../src/core/build-ready';
import type { BuildReadyFinding, BuildReadyReportV2 } from '../src/core/build-ready-types';
import {
  buildP13P14Handoff,
  buildP14PreparationPlanFromBuildReady,
} from '../src/core/p13-p14-handoff';
import {
  PRODUCTION_P14_SAFE_RECIPE_REGISTRY,
  createP14SafeRecipeRegistry,
  validateP14SafeRecipeRegistry,
  type P14SafeRecipeBinding,
} from '../src/core/p14-safe-recipe-registry';
import type { P14PreparationRecipeDefinition } from '../src/core/p14-preparation-types';
import type { AuditNode } from '../src/core/types';

function node(overrides: Partial<AuditNode> = {}): AuditNode {
  const children = overrides.children ?? [];
  return {
    id: '1:1',
    name: 'Frame',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1200, height: 600 },
    layoutMode: 'VERTICAL',
    isAutoLayout: true,
    isContainer: true,
    isText: false,
    isImageLike: false,
    isGenericName: false,
    textLength: 0,
    textAutoResize: null,
    absolutePositioned: false,
    clipsContent: false,
    opacity: 1,
    visible: true,
    ...overrides,
    children,
    childIds: overrides.childIds ?? children.map((child) => child.id),
  };
}

function productionDebtRoot(): AuditNode {
  const children = Array.from({ length: 6 }, (_, index) => node({
    id: `manual:${index}`,
    name: `Manual ${index}`,
    geometry: { x: 0, y: index * 90, width: 900, height: 80 },
    layoutMode: 'NONE',
    isAutoLayout: false,
    children: [],
  }));
  return node({
    id: 'production-root',
    name: 'Production Root',
    layoutMode: 'NONE',
    isAutoLayout: false,
    geometry: { x: 0, y: 0, width: 1200, height: 900 },
    children,
  });
}

const SAFE_RULE = 'SYNTHETIC_SAFE_STACK';
const SAFE_RECIPE: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_STACK',
  version: 1,
  sourceRuleIds: [SAFE_RULE],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_SYNTHETIC_STACK_VALIDATE',
  conflictsWith: [],
  orderClass: '10-structure',
};

function binding(
  ruleId = SAFE_RULE,
  ruleVersion = 1,
  recipe: P14PreparationRecipeDefinition = SAFE_RECIPE,
): P14SafeRecipeBinding {
  return { sourceRuleId: ruleId, sourceRuleVersion: ruleVersion, recipe };
}

function syntheticFinding(overrides: Partial<BuildReadyFinding> = {}): BuildReadyFinding {
  return {
    id: 'synthetic-safe-finding',
    ruleId: SAFE_RULE,
    ruleVersion: 1,
    category: 'STRUCTURE',
    relatedCategories: [],
    severity: 'MEDIUM',
    confidence: 99,
    title: 'Synthetic safe candidate',
    detail: 'Synthetic test-only finding; never a production rule.',
    nodeIds: ['synthetic:1'],
    evidence: { synthetic: true },
    penalty: 0,
    remediationClass: 'P14_SAFE_CANDIDATE',
    targetAgnostic: true,
    ...overrides,
  };
}

function syntheticReport(findings: BuildReadyFinding[]): BuildReadyReportV2 {
  const base = buildBuildReadyReport(productionDebtRoot(), {}, '2026-09-12T00:00:00.000Z');
  return {
    ...base,
    score: { score: 95, status: 'READY', hasHighRisk: false, blockerCount: 0 },
    findings,
  };
}

describe('P14 production safe-recipe registry', () => {
  it('is valid but intentionally empty/non-authorizing', () => {
    expect(validateP14SafeRecipeRegistry(PRODUCTION_P14_SAFE_RECIPE_REGISTRY)).toEqual({ valid: true, failures: [] });
    expect(PRODUCTION_P14_SAFE_RECIPE_REGISTRY.bindings).toEqual([]);
  });

  it('keeps current production P13 findings read-only and produces no mutating plan', () => {
    const report = buildBuildReadyReport(productionDebtRoot(), {}, '2026-09-12T00:00:00.000Z');
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.findings.every((finding) => finding.remediationClass !== 'P14_SAFE_CANDIDATE')).toBe(true);

    const result = buildP14PreparationPlanFromBuildReady(report);
    expect(result.handoff.valid).toBe(true);
    expect(result.handoff.acceptanceAuthority).toBe(false);
    expect(result.handoff.targetCompatibilityClaim).toBe(false);
    expect(result.handoff.acceptedCandidateCount).toBe(0);
    expect(result.handoff.recipes).toEqual([]);
    expect(result.plan?.status).toBe('BLOCKED');
    expect(result.plan?.eligibleActionIds).toEqual([]);
  });
});

describe('P13 → P14 exact binding handoff', () => {
  it('accepts only an explicit P14_SAFE_CANDIDATE with exact rule/version binding', () => {
    const registry = createP14SafeRecipeRegistry([binding()]);
    const report = syntheticReport([syntheticFinding()]);
    const result = buildP14PreparationPlanFromBuildReady(report, registry);

    expect(result.handoff.valid).toBe(true);
    expect(result.handoff.acceptedCandidateCount).toBe(1);
    expect(result.handoff.recipes.map((recipe) => `${recipe.id}@${recipe.version}`)).toEqual(['P14_SYNTHETIC_STACK@1']);
    expect(result.handoff.findings[0]).toMatchObject({
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: 'P14_SYNTHETIC_STACK',
      acceptedRecipeVersion: 1,
    });
    expect(result.plan?.status).toBe('READY');
    expect(result.plan?.eligibleActionIds).toHaveLength(1);
    expect(result.plan?.source).toEqual({
      nodeId: report.source.rootId,
      fingerprint: report.source.structuralHash,
    });
    expect(result.plan?.p13RunId).toBe(report.runId);
  });

  it('fails closed to manual review on exact rule-version mismatch', () => {
    const registry = createP14SafeRecipeRegistry([binding(SAFE_RULE, 1)]);
    const report = syntheticReport([syntheticFinding({ ruleVersion: 2 })]);
    const result = buildP14PreparationPlanFromBuildReady(report, registry);

    expect(result.handoff.acceptedCandidateCount).toBe(0);
    expect(result.handoff.findings[0]).toMatchObject({
      remediationClass: 'MANUAL_REVIEW',
      refusalCode: 'P14_SAFE_BINDING_REQUIRED',
    });
    expect(result.plan?.status).toBe('BLOCKED');
  });

  it('does not escalate MANUAL_REVIEW to mutation even when an exact binding exists', () => {
    const registry = createP14SafeRecipeRegistry([binding()]);
    const report = syntheticReport([syntheticFinding({ remediationClass: 'MANUAL_REVIEW' })]);
    const handoff = buildP13P14Handoff(report, registry);

    expect(handoff.acceptedCandidateCount).toBe(0);
    expect(handoff.recipes).toEqual([]);
    expect(handoff.findings[0]?.remediationClass).toBe('MANUAL_REVIEW');
  });

  it('keeps below-threshold candidates read-only even with an exact binding', () => {
    const registry = createP14SafeRecipeRegistry([binding()]);
    const report = syntheticReport([syntheticFinding({ confidence: 94 })]);
    const handoff = buildP13P14Handoff(report, registry);

    expect(handoff.acceptedCandidateCount).toBe(0);
    expect(handoff.findings[0]).toMatchObject({
      remediationClass: 'MANUAL_REVIEW',
      refusalCode: 'P14_BELOW_CONFIDENCE_GATE',
    });
  });

  it('blocks the entire handoff when the registry is invalid or ambiguous', () => {
    const invalidRegistry = {
      schemaVersion: 1 as const,
      bindings: [binding(), binding()],
    };
    const result = buildP14PreparationPlanFromBuildReady(
      syntheticReport([syntheticFinding()]),
      invalidRegistry,
    );

    expect(result.handoff.valid).toBe(false);
    expect(result.handoff.registryValid).toBe(false);
    expect(result.handoff.failures.some((failure) => failure.includes('Duplicate safe-recipe binding'))).toBe(true);
    expect(result.plan).toBeNull();
  });

  it('is deterministic across finding and registry insertion order', () => {
    const otherRule = 'SYNTHETIC_SAFE_ROW';
    const otherRecipe: P14PreparationRecipeDefinition = {
      ...SAFE_RECIPE,
      id: 'P14_SYNTHETIC_ROW',
      sourceRuleIds: [otherRule],
      orderClass: '20-structure',
    };
    const a = syntheticFinding();
    const b = syntheticFinding({
      id: 'synthetic-row-finding',
      ruleId: otherRule,
      nodeIds: ['synthetic:2'],
    });
    const registryOne = createP14SafeRecipeRegistry([
      binding(otherRule, 1, otherRecipe),
      binding(),
    ]);
    const registryTwo = createP14SafeRecipeRegistry([
      binding(),
      binding(otherRule, 1, otherRecipe),
    ]);

    const first = buildP13P14Handoff(syntheticReport([b, a]), registryOne);
    const second = buildP13P14Handoff(syntheticReport([a, b]), registryTwo);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('rejects unsupported mutation fields and contradictory recipe contracts', () => {
    const unsupported = createP14SafeRecipeRegistry([binding(SAFE_RULE, 1, {
      ...SAFE_RECIPE,
      mutationAllowlist: ['layoutMode', 'notAField' as any],
    })]);
    expect(validateP14SafeRecipeRegistry(unsupported).failures.some((failure) => failure.includes('unsupported field'))).toBe(true);

    const contradictory = {
      schemaVersion: 1 as const,
      bindings: [
        binding('RULE_A', 1, { ...SAFE_RECIPE, sourceRuleIds: ['RULE_A', 'RULE_B'] }),
        binding('RULE_B', 1, {
          ...SAFE_RECIPE,
          sourceRuleIds: ['RULE_A', 'RULE_B'],
          mutationAllowlist: ['padding'],
        }),
      ],
    };
    expect(validateP14SafeRecipeRegistry(contradictory).failures.some((failure) => failure.includes('contradictory contracts'))).toBe(true);
  });
});
