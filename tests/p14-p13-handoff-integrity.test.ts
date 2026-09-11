import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport } from '../src/core/build-ready';
import type { BuildReadyFinding } from '../src/core/build-ready-types';
import { buildP13P14Handoff, buildP14PreparationPlanFromBuildReady } from '../src/core/p13-p14-handoff';
import {
  createP14SafeRecipeRegistry,
  validateP14SafeRecipeRegistry,
} from '../src/core/p14-safe-recipe-registry';
import type { P14PreparationRecipeDefinition } from '../src/core/p14-preparation-types';
import type { AuditNode } from '../src/core/types';

function node(overrides: Partial<AuditNode> = {}): AuditNode {
  const children = overrides.children ?? [];
  return {
    id: 'integrity:root',
    name: 'Integrity Root',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1200, height: 800 },
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

const RULE_ID = 'SYNTHETIC_INTEGRITY_RULE';
const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_INTEGRITY_RECIPE',
  version: 1,
  sourceRuleIds: [RULE_ID],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_SYNTHETIC_INTEGRITY_VALIDATE',
  conflictsWith: [],
  orderClass: '10-structure',
};

function candidateFinding(overrides: Partial<BuildReadyFinding> = {}): BuildReadyFinding {
  return {
    id: 'integrity-finding',
    ruleId: RULE_ID,
    ruleVersion: 1,
    category: 'STRUCTURE',
    relatedCategories: [],
    severity: 'MEDIUM',
    confidence: 99,
    title: 'Synthetic integrity finding',
    detail: 'Synthetic test-only evidence.',
    nodeIds: ['integrity:target'],
    evidence: { synthetic: true },
    penalty: 0,
    remediationClass: 'P14_SAFE_CANDIDATE',
    targetAgnostic: true,
    ...overrides,
  };
}

function report() {
  const base = buildBuildReadyReport(node(), {}, '2026-09-12T00:00:00.000Z');
  return {
    ...base,
    score: { score: 95, status: 'READY' as const, hasHighRisk: false, blockerCount: 0 },
    findings: [candidateFinding()],
  };
}

function registry() {
  return createP14SafeRecipeRegistry([{ sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe }]);
}

describe('P13 → P14 handoff integrity hardening', () => {
  it('returns structured invalid-registry evidence instead of throwing on malformed recipe arrays', () => {
    const malformed = {
      schemaVersion: 1,
      bindings: [{
        sourceRuleId: RULE_ID,
        sourceRuleVersion: 1,
        recipe: {
          id: 'BROKEN',
          version: 1,
          sourceRuleIds: null,
          minConfidence: 90,
          prerequisites: null,
          mutationAllowlist: null,
          validationProfileId: 'VALIDATE',
          conflictsWith: null,
          orderClass: '10',
        },
      }],
    };

    expect(() => validateP14SafeRecipeRegistry(malformed)).not.toThrow();
    const validation = validateP14SafeRecipeRegistry(malformed);
    expect(validation.valid).toBe(false);
    expect(validation.failures.length).toBeGreaterThan(0);
  });

  it('preserves duplicate recipe defects so validation can reject them', () => {
    const duplicate = createP14SafeRecipeRegistry([{
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      recipe: {
        ...recipe,
        sourceRuleIds: [RULE_ID, RULE_ID],
        mutationAllowlist: ['layoutMode', 'layoutMode'],
      },
    }]);
    const validation = validateP14SafeRecipeRegistry(duplicate);

    expect(validation.valid).toBe(false);
    expect(validation.failures.some((failure) => failure.includes('sourceRuleIds must not contain duplicates'))).toBe(true);
    expect(validation.failures.some((failure) => failure.includes('mutationAllowlist must not contain duplicates'))).toBe(true);
  });

  it('rejects a forged P13 runId that no longer binds exact structural/config hashes', () => {
    const forged = { ...report(), runId: 'p13-forged-run-id' };
    const result = buildP14PreparationPlanFromBuildReady(forged, registry());

    expect(result.handoff.valid).toBe(false);
    expect(result.handoff.failures.some((failure) => failure.includes('exact source/config fingerprint binding'))).toBe(true);
    expect(result.plan).toBeNull();
  });

  it('rejects unsupported score status and missing exact target context', () => {
    const invalidStatus = report() as any;
    invalidStatus.score = { ...invalidStatus.score, status: 'UNKNOWN_STATUS' };
    expect(buildP13P14Handoff(invalidStatus, registry()).valid).toBe(false);

    const emptyTarget = report();
    emptyTarget.findings = [candidateFinding({ nodeIds: [] })];
    const emptyResult = buildP13P14Handoff(emptyTarget, registry());
    expect(emptyResult.valid).toBe(false);
    expect(emptyResult.failures.some((failure) => failure.includes('non-empty array'))).toBe(true);

    const duplicateTarget = report();
    duplicateTarget.findings = [candidateFinding({ nodeIds: ['integrity:target', 'integrity:target'] })];
    const duplicateResult = buildP13P14Handoff(duplicateTarget, registry());
    expect(duplicateResult.valid).toBe(false);
    expect(duplicateResult.failures.some((failure) => failure.includes('nodeIds must not contain duplicates'))).toBe(true);
  });
});
