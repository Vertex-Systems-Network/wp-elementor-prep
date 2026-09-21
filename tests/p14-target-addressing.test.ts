import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport, computeBuildReadyStructuralHash } from '../src/core/build-ready';
import { snapshotP14AdapterAction } from '../src/core/p14-adapter-input-snapshot';
import {
  buildP14PreparationPlanFromBuildReady,
} from '../src/core/p13-p14-handoff';
import { validateP14PreparationConfirmation, buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { validateP14PreparationPlan } from '../src/core/p14-plan-integrity';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import {
  deriveP14CandidateTargetAddresses,
  resolveP14CandidateTargetAddresses,
} from '../src/core/p14-target-address';
import type {
  P14PreparationRecipeDefinition,
} from '../src/core/p14-preparation-types';
import type { AuditNode, LayoutMode } from '../src/core/types';

function node(input: {
  id: string;
  name?: string;
  type?: string;
  layoutMode?: LayoutMode;
  children?: AuditNode[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}): AuditNode {
  const children = input.children ?? [];
  return {
    id: input.id,
    name: input.name ?? 'Frame',
    type: input.type ?? 'FRAME',
    geometry: {
      x: input.x ?? 0,
      y: input.y ?? 0,
      width: input.width ?? 100,
      height: input.height ?? 100,
    },
    layoutMode: input.layoutMode ?? 'NONE',
    isAutoLayout: (input.layoutMode ?? 'NONE') !== 'NONE',
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
    childIds: children.map((child) => child.id),
    children,
  };
}

function sourceTree(): AuditNode {
  const target = node({
    id: 'source:target',
    name: 'Vertical Stack',
    width: 700,
    height: 400,
    children: [
      node({ id: 'source:item-a', name: 'A', width: 700, height: 180 }),
      node({ id: 'source:item-b', name: 'B', y: 220, width: 700, height: 180 }),
    ],
  });
  return node({
    id: 'source:root',
    name: 'Page',
    width: 1200,
    height: 900,
    children: [
      node({ id: 'source:header', name: 'Header', width: 1200, height: 100 }),
      target,
    ],
  });
}

function candidateTree(): AuditNode {
  const target = node({
    id: 'candidate:target',
    name: 'Vertical Stack',
    width: 700,
    height: 400,
    children: [
      node({ id: 'candidate:item-a', name: 'A', width: 700, height: 180 }),
      node({ id: 'candidate:item-b', name: 'B', y: 220, width: 700, height: 180 }),
    ],
  });
  return node({
    id: 'candidate:root',
    name: 'Page',
    width: 1200,
    height: 900,
    children: [
      node({ id: 'candidate:header', name: 'Header', width: 1200, height: 100 }),
      target,
    ],
  });
}

const VERTICAL_RULE = 'BR_SAFE_VERTICAL_STACK_CANDIDATE';
const VERTICAL_RECIPE: P14PreparationRecipeDefinition = {
  id: 'P14_VERTICAL_STACK_V1',
  version: 1,
  sourceRuleIds: [VERTICAL_RULE],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: [
    'layoutMode',
    'primaryAxisSizingMode',
    'counterAxisSizingMode',
    'primaryAxisAlignItems',
    'counterAxisAlignItems',
    'itemSpacing',
    'padding',
  ],
  validationProfileId: 'P14_VALIDATE_VERTICAL_STACK_V1',
  conflictsWith: [],
  orderClass: '10-structure',
};

function addressing(source = sourceTree()) {
  return deriveP14CandidateTargetAddresses({
    sourceRoot: source,
    expectedSourceRootNodeId: source.id,
    expectedSourceRootFingerprint: computeBuildReadyStructuralHash(source),
    sourceTargetNodeIds: ['source:target'],
  });
}

describe('P14 candidate target addressing', () => {
  it('derives a deterministic source-root-bound child-index path and resolves clone-divergent IDs', () => {
    const derived = addressing();
    expect(derived).toMatchObject({
      valid: true,
      failures: [],
      addresses: [{
        schemaVersion: 1,
        sourceRootNodeId: 'source:root',
        sourceTargetNodeId: 'source:target',
        childIndexPath: [1],
      }],
    });

    const resolved = resolveP14CandidateTargetAddresses({
      candidateRoot: candidateTree(),
      expectedSourceRootNodeId: 'source:root',
      expectedSourceRootFingerprint: computeBuildReadyStructuralHash(sourceTree()),
      addresses: derived.addresses,
    });
    expect(resolved.valid).toBe(true);
    expect(resolved.failures).toEqual([]);
    expect(resolved.resolved[0]?.candidateNode.id).toBe('candidate:target');
  });

  it('fails closed when candidate structure is reordered or the address is bound to the wrong root', () => {
    const derived = addressing();
    const reordered = candidateTree();
    reordered.children = [reordered.children[1]!, reordered.children[0]!];
    reordered.childIds = reordered.children.map((child) => child.id);

    const stale = resolveP14CandidateTargetAddresses({
      candidateRoot: reordered,
      expectedSourceRootNodeId: 'source:root',
      expectedSourceRootFingerprint: computeBuildReadyStructuralHash(sourceTree()),
      addresses: derived.addresses,
    });
    expect(stale.valid).toBe(false);
    expect(stale.failures.some((failure) => failure.includes('structure drifted'))).toBe(true);

    const wrongRoot = derived.addresses.map((address) => ({
      ...address,
      sourceRootNodeId: 'other:root',
    }));
    const wrong = resolveP14CandidateTargetAddresses({
      candidateRoot: candidateTree(),
      expectedSourceRootNodeId: 'source:root',
      expectedSourceRootFingerprint: computeBuildReadyStructuralHash(sourceTree()),
      addresses: wrongRoot,
    });
    expect(wrong.valid).toBe(false);
    expect(wrong.failures.some((failure) => failure.includes('different reviewed source root'))).toBe(true);
  });

  it('rejects duplicate addresses, duplicate paths and out-of-bounds paths', () => {
    const derived = addressing();
    const address = derived.addresses[0];
    if (!address) throw new Error('Expected target address fixture.');

    const duplicate = resolveP14CandidateTargetAddresses({
      candidateRoot: candidateTree(),
      expectedSourceRootNodeId: 'source:root',
      expectedSourceRootFingerprint: computeBuildReadyStructuralHash(sourceTree()),
      addresses: [address, { ...address, childIndexPath: [...address.childIndexPath] }],
    });
    expect(duplicate.valid).toBe(false);
    expect(duplicate.failures.some((failure) =>
      failure.includes('duplicates source target') || failure.includes('duplicate child-index path'))).toBe(true);

    const outOfBounds = resolveP14CandidateTargetAddresses({
      candidateRoot: candidateTree(),
      expectedSourceRootNodeId: 'source:root',
      expectedSourceRootFingerprint: computeBuildReadyStructuralHash(sourceTree()),
      addresses: [{ ...address, childIndexPath: [99] }],
    });
    expect(outOfBounds.valid).toBe(false);
    expect(outOfBounds.failures.some((failure) => failure.includes('no longer resolves'))).toBe(true);
  });

  it('rejects ambiguous source IDs and refuses source identities as candidate mutation authority', () => {
    const source = sourceTree();
    source.children.push(node({ id: 'source:target', name: 'Duplicate Target' }));
    source.childIds = source.children.map((child) => child.id);
    const ambiguous = deriveP14CandidateTargetAddresses({
      sourceRoot: source,
      expectedSourceRootNodeId: source.id,
      expectedSourceRootFingerprint: computeBuildReadyStructuralHash(source),
      sourceTargetNodeIds: ['source:target'],
    });
    expect(ambiguous.valid).toBe(false);
    expect(ambiguous.failures.some((failure) => failure.includes('ambiguous'))).toBe(true);

    const derived = addressing();
    const unsafeCandidate = candidateTree();
    unsafeCandidate.children[1]!.id = 'source:target';
    const unsafe = resolveP14CandidateTargetAddresses({
      candidateRoot: unsafeCandidate,
      expectedSourceRootNodeId: 'source:root',
      expectedSourceRootFingerprint: computeBuildReadyStructuralHash(sourceTree()),
      addresses: derived.addresses,
    });
    expect(unsafe.valid).toBe(false);
    expect(unsafe.failures.some((failure) => failure.includes('source-tree identity'))).toBe(true);
  });

  it('requires exact address evidence before the vertical-stack rule can become ELIGIBLE and binds it into confirmation integrity', () => {
    const source = sourceTree();
    const derived = addressing(source);
    expect(derived.valid).toBe(true);
    const fingerprint = computeBuildReadyStructuralHash(source);

    const missing = buildP14PreparationPlan({
      p13RunId: 'p13-addressing-missing',
      sourceNodeId: source.id,
      sourceFingerprint: fingerprint,
      findings: [{
        findingId: 'vertical-missing-address',
        sourceRuleId: VERTICAL_RULE,
        sourceRuleVersion: 1,
        targetNodeIds: ['source:target'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE',
        acceptedRecipeId: VERTICAL_RECIPE.id,
        acceptedRecipeVersion: VERTICAL_RECIPE.version,
      }],
      recipes: [VERTICAL_RECIPE],
    });
    expect(missing.status).toBe('BLOCKED');
    expect(missing.actions[0]?.decision).toBe('REFUSED');
    expect(missing.actions[0]?.refusalCode).toBe('P14_TARGET_ADDRESS_REQUIRED');

    const plan = buildP14PreparationPlan({
      p13RunId: 'p13-addressing-valid',
      sourceNodeId: source.id,
      sourceFingerprint: fingerprint,
      findings: [{
        findingId: 'vertical-addressed',
        sourceRuleId: VERTICAL_RULE,
        sourceRuleVersion: 1,
        targetNodeIds: ['source:target'],
        targetAddresses: derived.addresses,
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE',
        acceptedRecipeId: VERTICAL_RECIPE.id,
        acceptedRecipeVersion: VERTICAL_RECIPE.version,
      }],
      recipes: [VERTICAL_RECIPE],
    });
    expect(plan.status).toBe('READY');
    expect(validateP14PreparationPlan(plan)).toEqual({ valid: true, failures: [] });

    const adapterCopy = snapshotP14AdapterAction(plan.actions[0]!);
    adapterCopy.targetAddresses![0]!.childIndexPath[0] = 77;
    expect(plan.actions[0]?.targetAddresses?.[0]?.childIndexPath).toEqual([1]);

    const confirmation = buildP14PreparationConfirmation(plan, '2026-09-21T18:30:00.000Z');
    const tampered = structuredClone(plan);
    tampered.actions[0]!.targetAddresses![0]!.childIndexPath = [0];
    expect(validateP14PreparationPlan(tampered).valid).toBe(false);
    expect(validateP14PreparationConfirmation(confirmation, tampered).valid).toBe(false);
  });

  it('keeps the P13→P14 vertical-stack handoff in REVIEW without exact source tree evidence and accepts it with matching evidence', () => {
    const source = sourceTree();
    const base = buildBuildReadyReport(source, {}, '2026-09-21T18:30:00.000Z');
    const report = {
      ...base,
      score: { score: 95, status: 'READY' as const, hasHighRisk: false, blockerCount: 0 },
      findings: [{
        id: 'vertical-stack-r3',
        ruleId: VERTICAL_RULE,
        ruleVersion: 1,
        category: 'STRUCTURE' as const,
        relatedCategories: [],
        severity: 'MEDIUM' as const,
        confidence: 99,
        title: 'Vertical-stack candidate',
        detail: 'Test-only exact R3 handoff fixture.',
        nodeIds: ['source:target'],
        evidence: { recipe: 'vertical-stack' },
        penalty: 0,
        remediationClass: 'P14_SAFE_CANDIDATE' as const,
        targetAgnostic: true as const,
      }],
    };
    const registry = createP14SafeRecipeRegistry([{
      sourceRuleId: VERTICAL_RULE,
      sourceRuleVersion: 1,
      recipe: VERTICAL_RECIPE,
    }]);

    const withoutSource = buildP14PreparationPlanFromBuildReady(report, registry);
    expect(withoutSource.handoff.acceptedCandidateCount).toBe(0);
    expect(withoutSource.handoff.findings[0]?.refusalCode).toBe('P14_TARGET_ADDRESS_REQUIRED');
    expect(withoutSource.plan?.status).toBe('BLOCKED');

    const withSource = buildP14PreparationPlanFromBuildReady(report, registry, source);
    expect(withSource.handoff.acceptedCandidateCount).toBe(1);
    expect(withSource.handoff.findings[0]?.targetAddresses?.[0]?.childIndexPath).toEqual([1]);
    expect(withSource.plan?.status).toBe('READY');
    expect(withSource.plan?.actions[0]?.targetAddresses?.[0]?.sourceTargetNodeId).toBe('source:target');

    const staleSource = sourceTree();
    staleSource.name = 'Changed after review';
    const stale = buildP14PreparationPlanFromBuildReady(report, registry, staleSource);
    expect(stale.handoff.acceptedCandidateCount).toBe(0);
    expect(stale.handoff.findings[0]?.refusalCode).toBe('P14_TARGET_ADDRESS_INVALID');
  });
});
