import { buildBuildReadyReport, computeBuildReadyStructuralHash } from '../core/build-ready';
import { analyzeLinearLayoutGeometry } from '../core/linear-layout-analysis';
import {
  P14_VERTICAL_STACK_RECIPE_QUALIFICATION,
} from '../core/p14-vertical-stack-qualification';
import {
  P14_VERTICAL_STACK_VALIDATION_PROFILE_ID,
  assessP14VerticalStackValidationProfileEvidence,
} from '../core/p14-vertical-stack-validation-profile';
import {
  computeP14CloneStableNodeFingerprint,
  resolveP14CandidateTargetAddresses,
} from '../core/p14-target-address';
import { scanSceneNode } from '../core/scanner';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationPlanV1,
  P14RecipeExecutionResult,
  P14RescoreSummary,
  P14RetainedDuplicateAdapter,
  P14RetentionEvidence,
  P14ValidationCheck,
  P14ValidationSummary,
} from '../core/p14-preparation-types';
import type { BuildReadyFinding, BuildReadyReportV2 } from '../core/build-ready-types';
import { applySafeRecipeToCandidate } from './safe-recipe-transform';

const P14_VERTICAL_STACK_RULE_ID = 'BR_SAFE_VERTICAL_STACK_CANDIDATE';
const P14_VERTICAL_STACK_RULE_VERSION = 1;
const P14_VERTICAL_STACK_RECIPE = 'vertical-stack';
const P14_VERTICAL_STACK_MIN_CONFIDENCE = 90;
const GEOMETRY_TOLERANCE = 0.5;

export interface P14FigmaRetainedDuplicateRuntime {
  getNodeByIdAsync(nodeId: string): Promise<BaseNode | null>;
  appendCandidate(candidate: FrameNode): void;
}

export interface FigmaP14VerticalStackAdapterOptions {
  /** Test seam only. Production should omit this and use the real Figma runtime. */
  runtime?: P14FigmaRetainedDuplicateRuntime;
  /** Deterministic test seam for P13 re-score report timestamps. */
  now?: () => string;
}

interface PreservationNode {
  path: string;
  type: string;
  name: string;
  visible: boolean;
  childCount: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PreservationSnapshot {
  structure: Array<Pick<PreservationNode, 'path' | 'type' | 'childCount'>>;
  visibility: Array<Pick<PreservationNode, 'path' | 'visible'>>;
  geometry: Array<Pick<PreservationNode, 'path' | 'x' | 'y' | 'width' | 'height'>>;
  contentSignature: string;
}

interface ExpectedVerticalLayout {
  gap: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

interface AppliedTargetEvidence {
  actionId: string;
  candidateTargetNodeId: string;
  path: number[];
  before: PreservationSnapshot;
  expected: ExpectedVerticalLayout;
}

interface CandidateMetadata {
  transactionId: string;
  sourceNodeId: string;
  candidateNodeId: string;
  sourceFingerprint: string;
  sourceReport: BuildReadyReportV2;
  appliedTargets: AppliedTargetEvidence[];
  retained: boolean;
}

function productionRuntime(): P14FigmaRetainedDuplicateRuntime {
  return {
    getNodeByIdAsync: (nodeId) => figma.getNodeByIdAsync(nodeId),
    appendCandidate: (candidate) => figma.currentPage.appendChild(candidate),
  };
}

function numeric(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function childNodes(node: SceneNode): readonly SceneNode[] {
  if (!('children' in node)) return [];
  return (node as SceneNode & ChildrenMixin).children as readonly SceneNode[];
}

function imageHashes(node: SceneNode): string[] {
  if (!('fills' in node)) return [];
  const fills = (node as SceneNode & { fills: readonly Paint[] | PluginAPI['mixed'] }).fills;
  if (!Array.isArray(fills)) return [];
  return fills
    .filter((paint): paint is ImagePaint => paint.type === 'IMAGE')
    .map((paint) => paint.imageHash ?? '')
    .filter((hash) => hash.length > 0)
    .sort();
}

function preservationSnapshot(root: SceneNode): PreservationSnapshot {
  const nodes: PreservationNode[] = [];
  const content: Array<{ path: string; text?: string; images: string[] }> = [];
  const stack: Array<{ node: SceneNode; path: string }> = [{ node: root, path: '0' }];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const children = childNodes(current.node);
    nodes.push({
      path: current.path,
      type: current.node.type,
      name: current.node.name,
      visible: current.node.visible,
      childCount: children.length,
      x: numeric(current.node.x),
      y: numeric(current.node.y),
      width: numeric(current.node.width),
      height: numeric(current.node.height),
    });
    content.push({
      path: current.path,
      ...(current.node.type === 'TEXT' ? { text: current.node.characters } : {}),
      images: imageHashes(current.node),
    });
    for (let index = children.length - 1; index >= 0; index -= 1) {
      const child = children[index];
      if (!child) continue;
      stack.push({ node: child, path: `${current.path}/${index}` });
    }
  }

  nodes.sort((a, b) => a.path.localeCompare(b.path));
  content.sort((a, b) => a.path.localeCompare(b.path));
  return {
    structure: nodes.map(({ path, type, childCount }) => ({ path, type, childCount })),
    visibility: nodes.map(({ path, visible }) => ({ path, visible })),
    geometry: nodes.map(({ path, x, y, width, height }) => ({ path, x, y, width, height })),
    contentSignature: JSON.stringify(content),
  };
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameGeometry(
  left: PreservationSnapshot['geometry'],
  right: PreservationSnapshot['geometry'],
): boolean {
  if (left.length !== right.length) return false;
  return left.every((item, index) => {
    const next = right[index];
    return Boolean(
      next
      && item.path === next.path
      && Math.abs(item.x - next.x) <= GEOMETRY_TOLERANCE
      && Math.abs(item.y - next.y) <= GEOMETRY_TOLERANCE
      && Math.abs(item.width - next.width) <= GEOMETRY_TOLERANCE
      && Math.abs(item.height - next.height) <= GEOMETRY_TOLERANCE
    );
  });
}

function sameNumber(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.001;
}

function resolveFrameByPath(root: FrameNode, path: readonly number[]): FrameNode | null {
  let current: SceneNode = root;
  for (const index of path) {
    if (!('children' in current)) return null;
    const child: SceneNode | undefined =
      ((current as SceneNode & ChildrenMixin).children as readonly SceneNode[])[index];
    if (!child) return null;
    current = child;
  }
  return current.type === 'FRAME' ? current : null;
}

function exactMutationAllowlist(action: P14PreparationAction): boolean {
  const expected = [...P14_VERTICAL_STACK_RECIPE_QUALIFICATION.mutationAllowlist].sort();
  const actual = [...action.mutationAllowlist].sort();
  return sameJson(actual, expected);
}

function actionContractFailures(action: P14PreparationAction): string[] {
  const failures: string[] = [];
  if (action.decision !== 'ELIGIBLE') failures.push('P14 vertical-stack runtime requires an ELIGIBLE action.');
  if (action.sourceRuleId !== P14_VERTICAL_STACK_RULE_ID
    || action.sourceRuleVersion !== P14_VERTICAL_STACK_RULE_VERSION) {
    failures.push('P14 vertical-stack runtime source rule/version does not match the accepted P13 contract.');
  }
  if (!action.recipeId || !Number.isInteger(action.recipeVersion) || (action.recipeVersion ?? 0) <= 0) {
    failures.push('P14 vertical-stack runtime requires an explicit versioned recipe identity.');
  }
  if (action.confidence < P14_VERTICAL_STACK_MIN_CONFIDENCE) {
    failures.push('P14 vertical-stack runtime confidence is below the accepted P5 mutation gate.');
  }
  if (action.validationProfileId !== P14_VERTICAL_STACK_VALIDATION_PROFILE_ID) {
    failures.push('P14 vertical-stack runtime validation profile does not match the accepted R2 profile.');
  }
  if (!exactMutationAllowlist(action)) {
    failures.push('P14 vertical-stack runtime mutation allowlist differs from the frozen R1 write surface.');
  }
  if (action.targetNodeIds.length !== 1 || action.targetAddresses?.length !== 1) {
    failures.push('P14 R4 vertical-stack runtime requires exactly one source target and one candidate address.');
  } else if (action.targetAddresses[0]?.sourceTargetNodeId !== action.targetNodeIds[0]) {
    failures.push('P14 vertical-stack runtime target address does not match the exact planned source target.');
  }
  return failures;
}

async function frameById(
  runtime: P14FigmaRetainedDuplicateRuntime,
  nodeId: string,
  label: string,
): Promise<FrameNode> {
  const node = await runtime.getNodeByIdAsync(nodeId);
  if (!node || node.type !== 'FRAME') {
    throw new Error(`${label} Frame ${nodeId} is unavailable.`);
  }
  return node;
}

function verticalExpectedLayout(frame: FrameNode): ExpectedVerticalLayout {
  const analysis = analyzeLinearLayoutGeometry({
    width: frame.width,
    height: frame.height,
    children: frame.children.map((child) => ({
      id: child.id,
      x: child.x,
      y: child.y,
      width: child.width,
      height: child.height,
      visible: child.visible,
      absolutePositioned: 'layoutPositioning' in child && child.layoutPositioning === 'ABSOLUTE',
    })),
  }, 'VERTICAL');
  if (!analysis.ok) throw new Error(`P14 vertical-stack geometry analysis refused target: ${analysis.reason}`);
  return {
    gap: analysis.plan.gap,
    paddingTop: analysis.plan.startPadding,
    paddingBottom: analysis.plan.endPadding,
    paddingLeft: analysis.plan.crossStartPadding,
    paddingRight: analysis.plan.crossEndPadding,
  };
}

function highOrBlocker(findings: BuildReadyFinding[]): BuildReadyFinding[] {
  return findings.filter((finding) => finding.severity === 'HIGH' || finding.severity === 'BLOCKER');
}

function findingBucket(findings: BuildReadyFinding[]): Map<string, number> {
  const bucket = new Map<string, number>();
  for (const finding of highOrBlocker(findings)) {
    const key = `${finding.ruleId}@${finding.ruleVersion}:${finding.severity}`;
    bucket.set(key, (bucket.get(key) ?? 0) + 1);
  }
  return bucket;
}

function introducedHighOrBlockerCount(
  before: BuildReadyReportV2,
  after: BuildReadyReportV2,
): number {
  const beforeBucket = findingBucket(before.findings);
  const afterBucket = findingBucket(after.findings);
  let introduced = 0;
  for (const [key, count] of afterBucket) {
    introduced += Math.max(0, count - (beforeBucket.get(key) ?? 0));
  }
  return introduced;
}

function check(id: string, passed: boolean): P14ValidationCheck {
  return { id, passed, required: true };
}

/**
 * First concrete P14 Figma retained-duplicate runtime adapter.
 *
 * It is intentionally narrow: one accepted vertical-stack action, one addressed target and a
 * separate candidate duplicate. The adapter itself grants no production authority; the production
 * safe-recipe registry remains the execution authorization gate.
 */
export class FigmaP14VerticalStackRetainedDuplicateAdapter implements P14RetainedDuplicateAdapter {
  private readonly runtime: P14FigmaRetainedDuplicateRuntime;
  private readonly now: () => string;
  private readonly candidates = new Map<string, CandidateMetadata>();

  constructor(options: FigmaP14VerticalStackAdapterOptions = {}) {
    this.runtime = options.runtime ?? productionRuntime();
    this.now = options.now ?? (() => new Date().toISOString());
  }

  private owned(candidate: P14CandidateHandle): CandidateMetadata {
    const metadata = this.candidates.get(candidate.candidateNodeId);
    if (!metadata
      || metadata.sourceNodeId !== candidate.sourceNodeId
      || metadata.candidateNodeId !== candidate.candidateNodeId
      || candidate.sourceNodeId === candidate.candidateNodeId) {
      throw new Error('P14 vertical-stack adapter refused an unowned or source-aliased candidate handle.');
    }
    return metadata;
  }

  private async assessAction(
    candidate: P14CandidateHandle,
    action: P14PreparationAction,
  ): Promise<{ metadata: CandidateMetadata; candidateRoot: FrameNode; failures: string[] }> {
    const metadata = this.owned(candidate);
    const failures = actionContractFailures(action);
    const candidateRoot = await frameById(this.runtime, candidate.candidateNodeId, 'Candidate');

    if (candidateRoot.id === metadata.sourceNodeId) {
      failures.push('P14 vertical-stack adapter refused the approved source identity as candidate root.');
    }

    const candidateAudit = scanSceneNode(candidateRoot);
    const addresses = action.targetAddresses ?? [];
    if (addresses.length === 1) {
      const resolution = resolveP14CandidateTargetAddresses({
        candidateRoot: candidateAudit,
        expectedSourceRootNodeId: metadata.sourceNodeId,
        expectedSourceRootFingerprint: metadata.sourceFingerprint,
        addresses,
      });
      failures.push(...resolution.failures);
      if (resolution.valid) {
        const resolved = resolution.resolved[0];
        if (!resolved || resolved.candidateNode.id === action.targetNodeIds[0]) {
          failures.push('P14 vertical-stack adapter refused source-tree target identity as candidate mutation authority.');
        }
      }
    }

    return { metadata, candidateRoot, failures };
  }

  async fingerprintSource(sourceNodeId: string): Promise<string> {
    const source = await frameById(this.runtime, sourceNodeId, 'Source');
    return computeBuildReadyStructuralHash(scanSceneNode(source));
  }

  async cloneSource(sourceNodeId: string, transactionId: string): Promise<P14CandidateHandle> {
    if (this.candidates.size > 0) {
      throw new Error('P14 vertical-stack adapter allows only one owned candidate per adapter instance.');
    }
    const source = await frameById(this.runtime, sourceNodeId, 'Source');
    const sourceAudit = scanSceneNode(source);
    const sourceFingerprint = computeBuildReadyStructuralHash(sourceAudit);
    const sourceCloneStableFingerprint = computeP14CloneStableNodeFingerprint(sourceAudit);
    const sourceReport = buildBuildReadyReport(sourceAudit, {}, this.now());

    const candidate = source.clone();
    if (candidate.id === source.id) {
      throw new Error('P14 vertical-stack clone returned the approved source identity.');
    }

    try {
      this.runtime.appendCandidate(candidate);
      const afterCloneSourceFingerprint = computeBuildReadyStructuralHash(scanSceneNode(source));
      if (afterCloneSourceFingerprint !== sourceFingerprint) {
        throw new Error('P14 candidate staging changed the approved source fingerprint.');
      }

      const candidateAudit = scanSceneNode(candidate);
      if (computeP14CloneStableNodeFingerprint(candidateAudit) !== sourceCloneStableFingerprint) {
        throw new Error('P14 candidate clone does not match the source clone-stable structural witness.');
      }

      if ('setPluginData' in candidate) {
        candidate.setPluginData('p14:transactionId', transactionId);
        candidate.setPluginData('p14:sourceNodeId', sourceNodeId);
        candidate.setPluginData('p14:state', 'candidate');
      }

      this.candidates.set(candidate.id, {
        transactionId,
        sourceNodeId,
        candidateNodeId: candidate.id,
        sourceFingerprint,
        sourceReport,
        appliedTargets: [],
        retained: false,
      });

      return { sourceNodeId, candidateNodeId: candidate.id };
    } catch (error) {
      if (candidate.id !== source.id && candidate.parent) candidate.remove();
      throw error;
    }
  }

  async assessActionEligibility(
    candidate: P14CandidateHandle,
    action: P14PreparationAction,
  ): Promise<unknown> {
    const assessed = await this.assessAction(candidate, action);
    return {
      actionId: action.actionId,
      recipeId: action.recipeId ?? 'missing-recipe',
      checkedPrerequisiteRecipeIds: [...action.prerequisiteRecipeIds],
      eligible: assessed.failures.length === 0,
      ...(assessed.failures.length > 0 ? { detail: assessed.failures.join(' | ').slice(0, 2000) } : {}),
    };
  }

  async applyRecipe(
    candidate: P14CandidateHandle,
    action: P14PreparationAction,
  ): Promise<P14RecipeExecutionResult> {
    const assessed = await this.assessAction(candidate, action);
    if (assessed.failures.length > 0) {
      throw new Error(`P14 vertical-stack runtime action refused: ${assessed.failures.join(' | ')}`);
    }
    if (assessed.metadata.appliedTargets.length > 0) {
      throw new Error('P14 R4 vertical-stack adapter refuses a second mutating action on the same candidate.');
    }

    const address = action.targetAddresses?.[0];
    if (!address) throw new Error('P14 vertical-stack target address is missing.');
    const target = resolveFrameByPath(assessed.candidateRoot, address.childIndexPath);
    if (!target) throw new Error('P14 vertical-stack candidate target path no longer resolves to a Frame.');
    if (target.id === action.targetNodeIds[0] || target.id === candidate.sourceNodeId) {
      throw new Error('P14 vertical-stack adapter refused source identity at the candidate target boundary.');
    }

    const before = preservationSnapshot(target);
    const expected = verticalExpectedLayout(target);
    const result = applySafeRecipeToCandidate(assessed.candidateRoot, {
      schemaVersion: 1,
      decision: 'ELIGIBLE',
      recipe: P14_VERTICAL_STACK_RECIPE,
      reasonCode: 'SUPPORTED_HIGH_CONFIDENCE',
      reason: 'P14 R4 reuses the accepted P5 vertical-stack candidate transformer.',
      confidence: action.confidence,
      minConfidence: P14_VERTICAL_STACK_MIN_CONFIDENCE,
      pattern: 'vertical-stack',
      targetNodeId: address.sourceTargetNodeId,
      targetNodeName: target.name,
      targetPath: [...address.childIndexPath],
      evidence: { p14RuntimeAdapter: true },
    });
    if (!result.applied) {
      throw new Error(`P14 vertical-stack P5 transform refused candidate: ${result.reason}`);
    }

    assessed.metadata.appliedTargets.push({
      actionId: action.actionId,
      candidateTargetNodeId: target.id,
      path: [...address.childIndexPath],
      before,
      expected,
    });

    return {
      actionId: action.actionId,
      recipeId: action.recipeId as string,
      applied: true,
      detail: 'Applied accepted P5 vertical-stack semantics to the addressed retained-duplicate candidate.',
    };
  }

  async validateCandidate(
    candidate: P14CandidateHandle,
    plan: P14PreparationPlanV1,
  ): Promise<P14ValidationSummary> {
    const metadata = this.owned(candidate);
    const candidateRoot = await frameById(this.runtime, candidate.candidateNodeId, 'Candidate');
    const eligibleActions = plan.actions.filter((action) => action.decision === 'ELIGIBLE');
    if (eligibleActions.length !== 1 || metadata.appliedTargets.length !== 1) {
      throw new Error('P14 R4 validation requires exactly one applied vertical-stack action.');
    }

    const action = eligibleActions[0];
    const applied = metadata.appliedTargets[0];
    if (!action || !applied || action.actionId !== applied.actionId) {
      throw new Error('P14 R4 validation action binding does not match the applied candidate mutation.');
    }

    const target = resolveFrameByPath(candidateRoot, applied.path);
    if (!target || target.id !== applied.candidateTargetNodeId) {
      throw new Error('P14 R4 validation target moved or no longer resolves to the applied candidate Frame.');
    }

    const after = preservationSnapshot(target);
    const expected = applied.expected;
    const checks: P14ValidationCheck[] = [
      check('vertical-stack-layout-mode', target.layoutMode === 'VERTICAL'),
      check('vertical-stack-primary-axis-sizing', target.primaryAxisSizingMode === 'FIXED'),
      check('vertical-stack-counter-axis-sizing', target.counterAxisSizingMode === 'FIXED'),
      check('vertical-stack-primary-axis-alignment', target.primaryAxisAlignItems === 'MIN'),
      check('vertical-stack-counter-axis-alignment', target.counterAxisAlignItems === 'MIN'),
      check('vertical-stack-item-spacing', sameNumber(target.itemSpacing, expected.gap)),
      check(
        'vertical-stack-padding',
        sameNumber(target.paddingTop, expected.paddingTop)
          && sameNumber(target.paddingRight, expected.paddingRight)
          && sameNumber(target.paddingBottom, expected.paddingBottom)
          && sameNumber(target.paddingLeft, expected.paddingLeft),
      ),
      check('vertical-stack-child-structure-preserved', sameJson(applied.before.structure, after.structure)),
      check('vertical-stack-content-preserved', applied.before.contentSignature === after.contentSignature),
      check('vertical-stack-visibility-preserved', sameJson(applied.before.visibility, after.visibility)),
      check('vertical-stack-geometry-preserved', sameGeometry(applied.before.geometry, after.geometry)),
    ];

    const summary: P14ValidationSummary = {
      passed: checks.every((item) => item.passed),
      profileIdsRun: [P14_VERTICAL_STACK_VALIDATION_PROFILE_ID],
      checks,
    };
    const assessed = assessP14VerticalStackValidationProfileEvidence(summary);
    if (summary.passed && !assessed.valid) {
      throw new Error(`P14 vertical-stack validation profile evidence is internally inconsistent: ${assessed.failures.join(' | ')}`);
    }
    return summary;
  }

  async rescoreCandidate(
    candidate: P14CandidateHandle,
    _plan: P14PreparationPlanV1,
  ): Promise<P14RescoreSummary> {
    const metadata = this.owned(candidate);
    const candidateRoot = await frameById(this.runtime, candidate.candidateNodeId, 'Candidate');
    if (!candidateRoot.visible) {
      throw new Error('P14 candidate Build-Ready re-score returned insufficient evidence because the candidate root is hidden.');
    }
    const report = buildBuildReadyReport(scanSceneNode(candidateRoot), {}, this.now());
    if (report.score.score === null || report.score.status === 'INSUFFICIENT_EVIDENCE') {
      throw new Error('P14 candidate Build-Ready re-score returned insufficient evidence.');
    }

    return {
      runId: report.runId,
      score: report.score.score,
      status: report.score.status,
      blockerCount: report.score.blockerCount,
      highRiskCount: highOrBlocker(report.findings).length,
      introducedBlockerOrHighCount: introducedHighOrBlockerCount(metadata.sourceReport, report),
      reviewRequired: report.score.status !== 'READY',
    };
  }

  async retainCandidate(
    candidate: P14CandidateHandle,
    transactionId: string,
    preparedName: string,
  ): Promise<P14RetentionEvidence> {
    const metadata = this.owned(candidate);
    if (metadata.transactionId !== transactionId) {
      throw new Error('P14 retained candidate belongs to a different transaction.');
    }
    if (metadata.retained) {
      throw new Error('P14 candidate is already retained.');
    }
    const node = await frameById(this.runtime, candidate.candidateNodeId, 'Candidate');
    if (node.id === metadata.sourceNodeId) {
      throw new Error('P14 adapter refused to retain the approved source as candidate output.');
    }

    node.setPluginData('p14:transactionId', transactionId);
    node.setPluginData('p14:sourceNodeId', metadata.sourceNodeId);
    node.setPluginData('p14:preparedName', preparedName);
    node.setPluginData('p14:state', 'retained');
    metadata.retained = true;

    return {
      transactionId,
      sourceNodeId: metadata.sourceNodeId,
      retainedNodeId: metadata.candidateNodeId,
      preparedName,
    };
  }

  async discardCandidate(candidate: P14CandidateHandle): Promise<void> {
    const metadata = this.owned(candidate);
    const node = await this.runtime.getNodeByIdAsync(metadata.candidateNodeId);
    if (!node) {
      this.candidates.delete(metadata.candidateNodeId);
      return;
    }
    if (node.id === metadata.sourceNodeId) {
      throw new Error('P14 adapter refused cleanup because the candidate resolves to the approved source.');
    }
    if (node.type !== 'FRAME') {
      throw new Error('P14 adapter refused cleanup because the owned candidate is no longer a Frame.');
    }
    node.remove();
    this.candidates.delete(metadata.candidateNodeId);
  }
}
