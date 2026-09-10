import { detectPatterns } from '../core/classification';
import { detectSpecialRoles } from '../core/roles';
import { planSafeRecipes } from '../core/safe-recipe-planner';
import type { SafeRecipePlan } from '../core/safe-recipe-types';
import { scanSceneNode } from '../core/scanner';
import type { ValidationReport } from '../core/validation-types';
import type { BatchFrameProcessor } from '../core/batch-runner';
import type { BatchQueueItem } from '../core/batch-queue';
import { P7_BUILD_IDENTITY } from './build-info';
import { p5SafeFixResultToBatchOutcome } from './p7-p5-outcome';
import { readP7P5BuildProofState } from './p7-p5-build-proof';
import {
  hasPendingSafeFixCheckpoint,
  runSafeFixTransaction,
  type FullP3Validator,
  type SafeFixRuntimeResult,
} from './safe-fix-runtime';

export interface P7SingleFrameProcessorDeps {
  runtimeProofValid(): Promise<boolean>;
  hasPendingCheckpoint(): Promise<boolean>;
  resolveFrame(frameId: string): Promise<FrameNode | null>;
  planFrame(frame: FrameNode): Promise<SafeRecipePlan[]> | SafeRecipePlan[];
  runPlan(frame: FrameNode, plan: SafeRecipePlan): Promise<SafeFixRuntimeResult>;
}

export interface P7PlanSelection {
  plan: SafeRecipePlan | null;
  error: string | null;
}

function comparePaths(a: number[], b: number[]): number {
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const av = a[index];
    const bv = b[index];
    if (av === undefined) return -1;
    if (bv === undefined) return 1;
    if (av !== bv) return av - bv;
  }
  return 0;
}

/**
 * Selects one deterministic P5 mutation for this pass. Distinct targets are processed one at a time
 * in document-path order. Multiple eligible recipes for the same target fail closed rather than
 * arbitrarily choosing a mutation.
 */
export function selectNextP7EligiblePlan(plans: SafeRecipePlan[]): P7PlanSelection {
  const eligible = plans
    .filter((plan) => plan.decision === 'ELIGIBLE' && plan.recipe !== null)
    .slice()
    .sort((a, b) => comparePaths(a.targetPath, b.targetPath)
      || a.targetNodeId.localeCompare(b.targetNodeId)
      || String(a.recipe).localeCompare(String(b.recipe)));

  if (eligible.length === 0) return { plan: null, error: null };

  const first = eligible[0]!;
  const ambiguous = eligible.filter((candidate) => (
    candidate.targetNodeId === first.targetNodeId
    && comparePaths(candidate.targetPath, first.targetPath) === 0
  ));
  if (ambiguous.length > 1) {
    const recipes = ambiguous.map((candidate) => candidate.recipe).join(', ');
    return {
      plan: null,
      error: `Multiple eligible Safe Fix recipes target the same node (${first.targetNodeName}: ${recipes}); refusing ambiguous batch mutation.`,
    };
  }

  return { plan: first, error: null };
}

export function planP7SafeFixesForFrame(frame: FrameNode): SafeRecipePlan[] {
  const root = scanSceneNode(frame);
  const detections = detectPatterns(root);
  const roles = detectSpecialRoles(root);
  return planSafeRecipes(root, detections, roles);
}

/** Read-only completion check used before finalizing a bounded checkpoint. */
export async function p7FrameHasMoreEligibleWork(
  frameId: string,
  planFrame: (frame: FrameNode) => Promise<SafeRecipePlan[]> | SafeRecipePlan[] = planP7SafeFixesForFrame,
): Promise<boolean> {
  const node = await figma.getNodeByIdAsync(frameId);
  if (!node || node.type !== 'FRAME') {
    throw new Error(`P7 cannot re-audit Frame ${frameId}; the current committed Frame is unavailable.`);
  }
  const selection = selectNextP7EligiblePlan(await planFrame(node));
  if (selection.error) throw new Error(selection.error);
  return selection.plan !== null;
}

/**
 * Builds the scheduler-facing processor around the canonical P5 lifecycle. The batch layer does not
 * duplicate transforms or commit logic: each selected plan is handed to runSafeFixTransaction().
 */
export function createP7SingleFrameProcessor(deps: P7SingleFrameProcessorDeps): BatchFrameProcessor {
  return async (item: BatchQueueItem) => {
    if (!await deps.runtimeProofValid()) {
      return {
        status: 'FAILED',
        error: 'P7 mutation is locked until the deterministic P5 proof is bound to this exact compiled CI build.',
      };
    }

    if (await deps.hasPendingCheckpoint()) {
      return {
        status: 'FAILED',
        error: 'A P5 checkpoint became pending before this batch frame started; refusing concurrent mutation.',
      };
    }

    const frame = await deps.resolveFrame(item.frameId);
    if (!frame) {
      return { status: 'FAILED', error: `Queued Frame ${item.frameId} is unavailable or is no longer a Frame.` };
    }

    const selection = selectNextP7EligiblePlan(await deps.planFrame(frame));
    if (selection.error) return { status: 'FAILED', error: selection.error };

    // No eligible mutation means this frame was fully re-audited for the current version and is done.
    if (!selection.plan) return { status: 'SUCCEEDED' };

    const result = await deps.runPlan(frame, selection.plan);
    return p5SafeFixResultToBatchOutcome(result);
  };
}

/** Production factory: same P5 planner/transaction/Full P3 path, plus exact-build proof binding. */
export function createFigmaP7SingleFrameProcessor(validateFullP3: FullP3Validator): BatchFrameProcessor {
  return createP7SingleFrameProcessor({
    runtimeProofValid: async () => (
      await readP7P5BuildProofState(figma.clientStorage, P7_BUILD_IDENTITY)
    ).valid,
    hasPendingCheckpoint: hasPendingSafeFixCheckpoint,
    resolveFrame: async (frameId) => {
      const node = await figma.getNodeByIdAsync(frameId);
      return node?.type === 'FRAME' ? node : null;
    },
    planFrame: planP7SafeFixesForFrame,
    runPlan: (frame, plan) => runSafeFixTransaction(frame, plan, validateFullP3),
  });
}

export type P7FullP3Validator = (original: FrameNode, candidate: FrameNode) => Promise<ValidationReport>;
