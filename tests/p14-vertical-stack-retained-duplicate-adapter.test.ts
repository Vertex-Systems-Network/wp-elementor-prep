import { describe, expect, it } from 'vitest';
import { computeBuildReadyStructuralHash } from '../src/core/build-ready';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { createP14SafeRecipeRegistry, PRODUCTION_P14_SAFE_RECIPE_REGISTRY } from '../src/core/p14-safe-recipe-registry';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import {
  deriveP14CandidateTargetAddresses,
} from '../src/core/p14-target-address';
import { P14_VERTICAL_STACK_RECIPE_QUALIFICATION } from '../src/core/p14-vertical-stack-qualification';
import { P14_VERTICAL_STACK_VALIDATION_PROFILE_ID } from '../src/core/p14-vertical-stack-validation-profile';
import { scanSceneNode } from '../src/core/scanner';
import type {
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
} from '../src/core/p14-preparation-types';
import {
  FigmaP14VerticalStackRetainedDuplicateAdapter,
  type P14FigmaRetainedDuplicateRuntime,
} from '../src/plugin/p14-vertical-stack-retained-duplicate-adapter';

type FakeParent = FakePage | FakeFrame | null;

class FakeRect {
  readonly type = 'RECTANGLE' as const;
  parent: FakeParent = null;
  visible = true;
  opacity = 1;
  fills: readonly Paint[] = [];
  layoutPositioning = 'AUTO';
  clipsContent = false;

  constructor(
    readonly id: string,
    public name: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  remove(): void {
    if (this.parent) this.parent.removeChild(this);
  }
}

class FakeFrame {
  readonly type = 'FRAME' as const;
  parent: FakeParent = null;
  visible = true;
  opacity = 1;
  fills: readonly Paint[] = [];
  clipsContent = false;
  layoutPositioning = 'AUTO';
  locked = false;
  layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID' = 'NONE';
  primaryAxisSizingMode: 'FIXED' | 'AUTO' = 'FIXED';
  counterAxisSizingMode: 'FIXED' | 'AUTO' = 'FIXED';
  primaryAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN' = 'MIN';
  counterAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE' = 'MIN';
  itemSpacing = 0;
  paddingTop = 0;
  paddingRight = 0;
  paddingBottom = 0;
  paddingLeft = 0;
  readonly pluginData = new Map<string, string>();
  children: Array<FakeFrame | FakeRect> = [];

  constructor(
    readonly runtime: FakeRuntime,
    readonly id: string,
    public name: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  appendChild(child: FakeFrame | FakeRect): void {
    if (child.parent) child.parent.removeChild(child);
    child.parent = this;
    this.children.push(child);
    this.runtime.registerTree(child);
  }

  removeChild(child: FakeFrame | FakeRect): void {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    child.parent = null;
  }

  clone(): FrameNode {
    return this.runtime.cloneFrame(this) as unknown as FrameNode;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  setPluginData(key: string, value: string): void {
    this.pluginData.set(key, value);
  }

  getPluginData(key: string): string {
    return this.pluginData.get(key) ?? '';
  }

  remove(): void {
    if (this.parent) this.parent.removeChild(this);
    this.runtime.unregisterTree(this);
  }
}

class FakePage {
  readonly children: FakeFrame[] = [];

  constructor(private readonly runtime: FakeRuntime) {}

  appendChild(child: FakeFrame): void {
    if (child.parent) child.parent.removeChild(child);
    child.parent = this;
    this.children.push(child);
    this.runtime.registerTree(child);
  }

  removeChild(child: FakeFrame | FakeRect): void {
    if (!(child instanceof FakeFrame)) return;
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    child.parent = null;
  }
}

class FakeRuntime implements P14FigmaRetainedDuplicateRuntime {
  readonly nodes = new Map<string, FakeFrame | FakeRect>();
  readonly page = new FakePage(this);
  private nextId = 100;

  getNodeByIdAsync(nodeId: string): Promise<BaseNode | null> {
    return Promise.resolve((this.nodes.get(nodeId) ?? null) as unknown as BaseNode | null);
  }

  appendCandidate(candidate: FrameNode): void {
    this.page.appendChild(candidate as unknown as FakeFrame);
  }

  registerTree(node: FakeFrame | FakeRect): void {
    this.nodes.set(node.id, node);
    if (node instanceof FakeFrame) {
      for (const child of node.children) {
        child.parent = node;
        this.registerTree(child);
      }
    }
  }

  unregisterTree(node: FakeFrame | FakeRect): void {
    this.nodes.delete(node.id);
    if (node instanceof FakeFrame) {
      for (const child of node.children) this.unregisterTree(child);
    }
  }

  cloneFrame(source: FakeFrame): FakeFrame {
    const cloned = new FakeFrame(
      this,
      `clone:${this.nextId++}`,
      source.name,
      source.x,
      source.y,
      source.width,
      source.height,
    );
    cloned.visible = source.visible;
    cloned.opacity = source.opacity;
    cloned.clipsContent = source.clipsContent;
    cloned.layoutPositioning = source.layoutPositioning;
    cloned.locked = source.locked;
    cloned.layoutMode = source.layoutMode;
    cloned.primaryAxisSizingMode = source.primaryAxisSizingMode;
    cloned.counterAxisSizingMode = source.counterAxisSizingMode;
    cloned.primaryAxisAlignItems = source.primaryAxisAlignItems;
    cloned.counterAxisAlignItems = source.counterAxisAlignItems;
    cloned.itemSpacing = source.itemSpacing;
    cloned.paddingTop = source.paddingTop;
    cloned.paddingRight = source.paddingRight;
    cloned.paddingBottom = source.paddingBottom;
    cloned.paddingLeft = source.paddingLeft;

    for (const child of source.children) {
      if (child instanceof FakeFrame) {
        cloned.appendChild(this.cloneFrame(child));
      } else {
        cloned.appendChild(new FakeRect(
          `clone:${this.nextId++}`,
          child.name,
          child.x,
          child.y,
          child.width,
          child.height,
        ));
      }
    }
    return cloned;
  }
}

function fixture() {
  const runtime = new FakeRuntime();
  const source = new FakeFrame(runtime, 'source:root', 'Approved Desktop', 0, 0, 1200, 900);
  const target = new FakeFrame(runtime, 'source:target', 'Hero Stack', 40, 80, 600, 220);
  target.layoutMode = 'NONE';
  target.appendChild(new FakeRect('source:a', 'Heading Block', 0, 0, 600, 90));
  target.appendChild(new FakeRect('source:b', 'CTA Block', 0, 130, 600, 90));
  source.appendChild(target);
  runtime.page.appendChild(source);
  return { runtime, source, target };
}

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_VERTICAL_STACK_RUNTIME_V1',
  version: 1,
  sourceRuleIds: ['BR_SAFE_VERTICAL_STACK_CANDIDATE'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: [...P14_VERTICAL_STACK_RECIPE_QUALIFICATION.mutationAllowlist],
  validationProfileId: P14_VERTICAL_STACK_VALIDATION_PROFILE_ID,
  conflictsWith: [],
  orderClass: '10-structure',
};

const registry = createP14SafeRecipeRegistry([{
  sourceRuleId: 'BR_SAFE_VERTICAL_STACK_CANDIDATE',
  sourceRuleVersion: 1,
  recipe,
}]);

function planFor(source: FakeFrame): P14PreparationPlanV1 {
  const audit = scanSceneNode(source as unknown as SceneNode);
  const fingerprint = computeBuildReadyStructuralHash(audit);
  const addresses = deriveP14CandidateTargetAddresses({
    sourceRoot: audit,
    expectedSourceRootNodeId: source.id,
    expectedSourceRootFingerprint: fingerprint,
    sourceTargetNodeIds: ['source:target'],
  });
  if (!addresses.valid) throw new Error(addresses.failures.join(' | '));

  return buildP14PreparationPlan({
    p13RunId: 'p13-r4-fixture',
    sourceNodeId: source.id,
    sourceFingerprint: fingerprint,
    findings: [{
      findingId: 'r4-vertical-stack',
      sourceRuleId: 'BR_SAFE_VERTICAL_STACK_CANDIDATE',
      sourceRuleVersion: 1,
      targetNodeIds: ['source:target'],
      targetAddresses: addresses.addresses,
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

const fixedNow = () => '2026-09-22T00:00:00.000Z';

describe('P14 R4 vertical-stack retained-duplicate Figma adapter', () => {
  it('runs the full retained-duplicate transaction without mutating the approved source', async () => {
    const { runtime, source } = fixture();
    const sourceBefore = computeBuildReadyStructuralHash(scanSceneNode(source as unknown as SceneNode));
    const plan = planFor(source);
    const adapter = new FigmaP14VerticalStackRetainedDuplicateAdapter({ runtime, now: fixedNow });

    const result = await runP14RetainedDuplicateTransaction({
      plan,
      registry,
      confirmation: buildP14PreparationConfirmation(plan, fixedNow()),
      transactionId: 'p14-r4-success',
      preparedName: 'Approved Desktop — Prepared',
      allowPreparedWithReview: true,
      now: fixedNow,
    }, adapter);

    expect(result.terminalState).toBe('COMPLETE');
    expect(['PREPARED', 'PREPARED_WITH_REVIEW']).toContain(result.status);
    expect(result.source.beforeFingerprint).toBe(sourceBefore);
    expect(result.source.afterFingerprint).toBe(sourceBefore);
    expect(computeBuildReadyStructuralHash(scanSceneNode(source as unknown as SceneNode))).toBe(sourceBefore);
    expect(result.candidate?.nodeId).not.toBe(source.id);
    expect(result.candidate?.retained).toBe(true);
    expect(result.validation?.passed).toBe(true);
    expect(result.validation?.profileIdsRun).toEqual([P14_VERTICAL_STACK_VALIDATION_PROFILE_ID]);
    expect(result.appliedActions).toHaveLength(1);

    const candidate = runtime.nodes.get(result.candidate?.nodeId ?? '');
    expect(candidate).toBeInstanceOf(FakeFrame);
    expect((candidate as FakeFrame).name).toBe('Approved Desktop — Prepared');
    const candidateTarget = (candidate as FakeFrame).children[0];
    expect(candidateTarget).toBeInstanceOf(FakeFrame);
    expect((candidateTarget as FakeFrame).layoutMode).toBe('VERTICAL');
    expect((candidateTarget as FakeFrame).itemSpacing).toBe(40);
    expect(source.children[0]).toBeInstanceOf(FakeFrame);
    expect((source.children[0] as FakeFrame).layoutMode).toBe('NONE');
  });

  it('refuses an unowned candidate and source-id injection before mutation', async () => {
    const { runtime, source } = fixture();
    const plan = planFor(source);
    const action = plan.actions[0];
    if (!action) throw new Error('Expected one R4 action.');
    const adapter = new FigmaP14VerticalStackRetainedDuplicateAdapter({ runtime, now: fixedNow });
    const handle = await adapter.cloneSource(source.id, 'p14-r4-owner');

    await expect(adapter.applyRecipe(
      { sourceNodeId: source.id, candidateNodeId: 'unknown:candidate' },
      action,
    )).rejects.toThrow('unowned');

    const candidate = runtime.nodes.get(handle.candidateNodeId);
    if (!(candidate instanceof FakeFrame)) throw new Error('Expected candidate Frame.');
    const target = candidate.children[0];
    if (!(target instanceof FakeFrame)) throw new Error('Expected candidate target Frame.');
    runtime.nodes.delete(target.id);
    Object.defineProperty(target, 'id', { value: 'source:target' });
    runtime.nodes.set(target.id, target);

    await expect(adapter.applyRecipe(handle, action)).rejects.toThrow(/source-tree target identity|source identity/);
    expect((source.children[0] as FakeFrame).layoutMode).toBe('NONE');
  });

  it('fails closed when the addressed candidate path drifts before mutation', async () => {
    const { runtime, source } = fixture();
    const plan = planFor(source);
    const action = plan.actions[0];
    if (!action) throw new Error('Expected one R4 action.');
    const adapter = new FigmaP14VerticalStackRetainedDuplicateAdapter({ runtime, now: fixedNow });
    const handle = await adapter.cloneSource(source.id, 'p14-r4-path-drift');
    const candidate = runtime.nodes.get(handle.candidateNodeId);
    if (!(candidate instanceof FakeFrame)) throw new Error('Expected candidate Frame.');

    candidate.children.unshift(new FakeRect('candidate:inserted', 'Inserted', 0, 0, 10, 10));
    candidate.children[0]!.parent = candidate;

    await expect(adapter.applyRecipe(handle, action)).rejects.toThrow(/structure drifted|stale evidence|no longer resolves/);
    expect((source.children[0] as FakeFrame).layoutMode).toBe('NONE');
  });

  it('emits failed R2 validation evidence when candidate geometry drifts after the accepted transform', async () => {
    const { runtime, source } = fixture();
    const plan = planFor(source);
    const action = plan.actions[0];
    if (!action) throw new Error('Expected one R4 action.');
    const adapter = new FigmaP14VerticalStackRetainedDuplicateAdapter({ runtime, now: fixedNow });
    const handle = await adapter.cloneSource(source.id, 'p14-r4-validation');
    await adapter.applyRecipe(handle, action);

    const candidate = runtime.nodes.get(handle.candidateNodeId);
    if (!(candidate instanceof FakeFrame)) throw new Error('Expected candidate Frame.');
    const target = candidate.children[0];
    if (!(target instanceof FakeFrame)) throw new Error('Expected target Frame.');
    const firstChild = target.children[0];
    if (!firstChild) throw new Error('Expected target child.');
    firstChild.x += 4;

    const validation = await adapter.validateCandidate(handle, plan);
    expect(validation.passed).toBe(false);
    expect(validation.checks.find((item) => item.id === 'vertical-stack-geometry-preserved')?.passed).toBe(false);
  });

  it('fails re-score on insufficient evidence and cleans up only the owned candidate', async () => {
    const { runtime, source } = fixture();
    const plan = planFor(source);
    const action = plan.actions[0];
    if (!action) throw new Error('Expected one R4 action.');
    const adapter = new FigmaP14VerticalStackRetainedDuplicateAdapter({ runtime, now: fixedNow });
    const handle = await adapter.cloneSource(source.id, 'p14-r4-rescore');
    await adapter.applyRecipe(handle, action);

    const candidate = runtime.nodes.get(handle.candidateNodeId);
    if (!(candidate instanceof FakeFrame)) throw new Error('Expected candidate Frame.');
    candidate.visible = false;

    await expect(adapter.rescoreCandidate(handle, plan)).rejects.toThrow('insufficient evidence');
    await adapter.discardCandidate(handle);
    expect(runtime.nodes.has(handle.candidateNodeId)).toBe(false);
    expect(runtime.nodes.has(source.id)).toBe(true);

    await expect(adapter.discardCandidate(handle)).rejects.toThrow('unowned');
  });

  it('refuses retention for the wrong transaction and leaves production registry empty', async () => {
    const { runtime, source } = fixture();
    const adapter = new FigmaP14VerticalStackRetainedDuplicateAdapter({ runtime, now: fixedNow });
    const handle = await adapter.cloneSource(source.id, 'p14-r4-retain');

    await expect(adapter.retainCandidate(handle, 'wrong-transaction', 'Prepared'))
      .rejects.toThrow('different transaction');
    expect(PRODUCTION_P14_SAFE_RECIPE_REGISTRY.bindings).toEqual([]);
    expect(runtime.nodes.has(source.id)).toBe(true);
    expect(runtime.nodes.has(handle.candidateNodeId)).toBe(true);
  });
});
