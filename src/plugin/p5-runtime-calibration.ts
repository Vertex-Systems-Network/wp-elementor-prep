import { runCandidateTransaction } from '../core/transaction';
import type { SafeRecipePlan } from '../core/safe-recipe-types';
import type { ValidationReport } from '../core/validation-types';
import { FigmaCandidateTransactionAdapter } from './figma-transaction-adapter';
import { applySafeRecipeToCandidate } from './safe-recipe-transform';
import { runSafeFixTransaction } from './safe-fix-runtime';

const CALIBRATION_PREFIX = '__P5RuntimeCalibration__';

export type RuntimeFullP3Validator = (before: FrameNode, after: FrameNode) => Promise<ValidationReport>;

export interface P5RuntimeCalibrationResult {
  schemaVersion: 1;
  passed: boolean;
  forcedReject: {
    state: string;
    validationRejected: boolean;
    pixelEvidenceReturned: boolean;
    changedPixelPct: number | null;
    candidateDeleted: boolean;
    originalUntouched: boolean;
  };
  passRestore: {
    state: string;
    validationPassed: boolean;
    pixelEvidenceReturned: boolean;
    changedPixelPct: number | null;
    committed: boolean;
    restored: boolean;
    checkpointCleared: boolean;
  };
  leftovers: number;
}

function solid(r: number, g: number, b: number): SolidPaint[] {
  return [{ type: 'SOLID', color: { r, g, b } }];
}

function createRect(name: string, x: number, y: number, width: number, height: number, fill: SolidPaint[]): RectangleNode {
  const rect = figma.createRectangle();
  rect.name = name;
  rect.resize(width, height);
  rect.x = x;
  rect.y = y;
  rect.fills = fill;
  return rect;
}

function createVerticalFixture(suffix: string): { parent: FrameNode; original: FrameNode } {
  const parent = figma.createFrame();
  parent.name = `${CALIBRATION_PREFIX} Parent ${suffix}`;
  parent.resize(420, 300);
  parent.x = 130000;
  parent.y = 0;
  parent.fills = [];
  figma.currentPage.appendChild(parent);

  const original = figma.createFrame();
  original.name = `${CALIBRATION_PREFIX} Vertical ${suffix}`;
  original.resize(320, 220);
  original.x = 40;
  original.y = 40;
  original.fills = [];
  parent.appendChild(original);

  original.appendChild(createRect('Block A', 40, 30, 240, 60, solid(0.16, 0.16, 0.16)));
  original.appendChild(createRect('Block B', 40, 130, 240, 60, solid(0.7, 0.7, 0.7)));
  return { parent, original };
}

function verticalPlan(original: FrameNode): SafeRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'ELIGIBLE',
    recipe: 'vertical-stack',
    reasonCode: 'SUPPORTED_HIGH_CONFIDENCE',
    reason: 'Disposable compiled-runtime calibration fixture.',
    confidence: 100,
    minConfidence: 90,
    pattern: 'vertical-stack',
    targetNodeId: original.id,
    targetNodeName: original.name,
    targetPath: [],
    evidence: { calibration: true },
  };
}

function recoveryAdapter(): FigmaCandidateTransactionAdapter {
  return new FigmaCandidateTransactionAdapter({
    transform: () => undefined,
    validate: async () => {
      throw new Error('Calibration recovery adapter does not validate.');
    },
  });
}

async function removeIfPresent(node: BaseNode | null): Promise<void> {
  if (node?.parent) node.remove();
}

async function calibrationLeftovers(): Promise<number> {
  let count = 0;
  for (const node of figma.currentPage.children) {
    if (node.name.startsWith(CALIBRATION_PREFIX)) count += 1;
  }
  return count;
}

/**
 * Developer-only disposable self-test for the exact compiled P5 -> FullFrameValidator/UI pixel broker -> P4 path.
 * It never operates on the user's selected design. All fixtures are created off-canvas and removed before return.
 */
export async function runP5RuntimeCalibration(validateFullP3: RuntimeFullP3Validator): Promise<P5RuntimeCalibrationResult> {
  const guard = recoveryAdapter();
  if (await guard.hasPendingUndo()) {
    throw new Error('A real P4 undo checkpoint is pending. Restore/finalize it before running the disposable runtime self-test.');
  }

  const forcedFixture = createVerticalFixture('forced-reject');
  let forcedCandidateId: string | undefined;
  let forcedResult: P5RuntimeCalibrationResult['forcedReject'] = {
    state: 'FAILED',
    validationRejected: false,
    pixelEvidenceReturned: false,
    changedPixelPct: null,
    candidateDeleted: false,
    originalUntouched: false,
  };

  try {
    const plan = verticalPlan(forcedFixture.original);
    const adapter = new FigmaCandidateTransactionAdapter({
      transform: (candidate) => {
        const applied = applySafeRecipeToCandidate(candidate, plan);
        if (!applied.applied) throw new Error(applied.reason);
        // Intentional visible drift after a valid recipe. Because the fixture contains only shapes,
        // this rejection depends on the real rendered-pixel broker, not text/image anchor matching.
        candidate.itemSpacing += 8;
      },
      validate: validateFullP3,
    });

    const transaction = await runCandidateTransaction(
      forcedFixture.original.id,
      adapter,
      `p5-runtime-forced-${Date.now().toString(36)}`,
    );
    forcedCandidateId = transaction.candidateNodeId;

    if (transaction.state === 'COMMITTED') {
      await adapter.restoreLastCommit(transaction.commit?.undoToken);
    }

    const candidateNode = forcedCandidateId ? await figma.getNodeByIdAsync(forcedCandidateId) : null;
    const pixel = transaction.validation?.metrics.pixel;
    forcedResult = {
      state: transaction.state,
      validationRejected: transaction.state === 'REJECTED' && transaction.validation?.passed === false,
      pixelEvidenceReturned: Boolean(pixel),
      changedPixelPct: pixel?.changedPixelPct ?? null,
      candidateDeleted: candidateNode === null,
      originalUntouched:
        forcedFixture.original.parent?.id === forcedFixture.parent.id &&
        forcedFixture.parent.children[0]?.id === forcedFixture.original.id,
    };
  } finally {
    if (await guard.hasPendingUndo()) {
      try {
        await guard.restoreLastCommit();
      } catch {
        await guard.finalizeLastCommit();
      }
    }
    await removeIfPresent(forcedFixture.parent);
    if (forcedCandidateId) {
      const candidate = await figma.getNodeByIdAsync(forcedCandidateId);
      await removeIfPresent(candidate);
    }
  }

  const passFixture = createVerticalFixture('pass-restore');
  let passCandidateId: string | undefined;
  let passResult: P5RuntimeCalibrationResult['passRestore'] = {
    state: 'FAILED',
    validationPassed: false,
    pixelEvidenceReturned: false,
    changedPixelPct: null,
    committed: false,
    restored: false,
    checkpointCleared: false,
  };

  try {
    const plan = verticalPlan(passFixture.original);
    const result = await runSafeFixTransaction(passFixture.original, plan, validateFullP3);
    const transaction = result.transaction;
    passCandidateId = transaction?.candidateNodeId;

    let restored = false;
    if (transaction?.state === 'COMMITTED') {
      const recovery = recoveryAdapter();
      const restoreEvidence = await recovery.restoreLastCommit(transaction.commit?.undoToken);
      restored = Boolean(restoreEvidence) && passFixture.original.parent?.id === passFixture.parent.id;
    }

    const pixel = transaction?.validation?.metrics.pixel;
    passResult = {
      state: transaction?.state ?? 'SKIPPED',
      validationPassed: transaction?.validation?.passed === true,
      pixelEvidenceReturned: Boolean(pixel),
      changedPixelPct: pixel?.changedPixelPct ?? null,
      committed: transaction?.state === 'COMMITTED',
      restored,
      checkpointCleared: !(await recoveryAdapter().hasPendingUndo()),
    };
  } finally {
    if (await guard.hasPendingUndo()) {
      try {
        await guard.restoreLastCommit();
      } catch {
        await guard.finalizeLastCommit();
      }
    }
    await removeIfPresent(passFixture.parent);
    if (passCandidateId) {
      const candidate = await figma.getNodeByIdAsync(passCandidateId);
      await removeIfPresent(candidate);
    }
  }

  const leftovers = await calibrationLeftovers();
  const passed =
    forcedResult.validationRejected &&
    forcedResult.pixelEvidenceReturned &&
    forcedResult.candidateDeleted &&
    forcedResult.originalUntouched &&
    passResult.validationPassed &&
    passResult.pixelEvidenceReturned &&
    passResult.committed &&
    passResult.restored &&
    passResult.checkpointCleared &&
    leftovers === 0;

  return {
    schemaVersion: 1,
    passed,
    forcedReject: forcedResult,
    passRestore: passResult,
    leftovers,
  };
}
