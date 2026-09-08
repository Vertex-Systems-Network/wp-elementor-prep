import { detectPatterns } from '../core/classification';
import {
  createP5RuntimeProof,
  isValidP5RuntimeProof,
  P5_RUNTIME_PROOF_STORAGE_KEY,
} from '../core/p5-runtime-gate';
import { detectSpecialRoles } from '../core/roles';
import { planSafeRecipes } from '../core/safe-recipe-planner';
import type { SafeRecipeKind } from '../core/safe-recipe-types';
import { scanSceneNode } from '../core/scanner';
import { buildAuditReport } from '../core/scoring';
import type { PixelDiffMetrics } from '../core/validation-types';
import { FullFrameValidator } from './full-frame-validator';
import { runP5RuntimeCalibration } from './p5-runtime-calibration';
import { runP6DeveloperPageFlowCalibration } from './p6-developer-calibration';
import {
  finalizeLastSafeFix,
  hasPendingSafeFixCheckpoint,
  restoreLastSafeFix,
  runSafeFixTransaction,
} from './safe-fix-runtime';

declare const __html__: string;

const PLUGIN_VERSION = '0.1.0-alpha.1';

type ExclusiveOperation =
  | 'runtime-self-test'
  | 'safe-fix-apply'
  | 'safe-fix-restore'
  | 'safe-fix-finalize'
  | 'p6-page-flow-calibration';
let operationInFlight: ExclusiveOperation | null = null;

figma.showUI(__html__, {
  width: 440,
  height: 680,
  themeColors: true,
});

const fullFrameValidator = new FullFrameValidator((message) => {
  figma.ui.postMessage(message);
});

function postError(
  message: string,
  type: 'audit-error' | 'validation-error' | 'safe-fix-error' = 'audit-error',
): void {
  figma.ui.postMessage({ type, message });
}

function beginExclusiveOperation(operation: ExclusiveOperation, errorType: 'validation-error' | 'safe-fix-error'): boolean {
  if (operationInFlight) {
    postError(`Another operation (${operationInFlight}) is still running. Wait for it to finish before starting ${operation}.`, errorType);
    return false;
  }
  operationInFlight = operation;
  return true;
}

function endExclusiveOperation(operation: ExclusiveOperation): void {
  if (operationInFlight === operation) operationInFlight = null;
}

function selectedFrame(): FrameNode | null {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1) return null;
  const selected = selection[0];
  return selected?.type === 'FRAME' ? selected : null;
}

async function runtimeProofState(): Promise<{ valid: boolean; passedAt: string | null }> {
  const stored = await figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
  if (!isValidP5RuntimeProof(stored)) return { valid: false, passedAt: null };
  return { valid: true, passedAt: stored.passedAt };
}

function runAudit(): void {
  const selected = selectedFrame();
  if (!selected) {
    postError('Select exactly one desktop Frame to audit.');
    return;
  }

  try {
    const root = scanSceneNode(selected);
    const report = buildAuditReport(root, PLUGIN_VERSION);
    figma.ui.postMessage({ type: 'audit-result', report });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Audit failed: ${message}`);
  }
}

async function currentSafePlans(selected: FrameNode) {
  const root = scanSceneNode(selected);
  const detections = detectPatterns(root);
  const roles = detectSpecialRoles(root);
  const plans = planSafeRecipes(root, detections, roles);
  return { root, roles, plans };
}

async function runSafePlanPreview(): Promise<void> {
  const selected = selectedFrame();
  if (!selected) {
    postError('Select exactly one Frame to preview Safe Fix eligibility.');
    return;
  }

  try {
    const [{ root, roles, plans }, proof, pendingUndo] = await Promise.all([
      currentSafePlans(selected),
      runtimeProofState(),
      hasPendingSafeFixCheckpoint(),
    ]);
    figma.ui.postMessage({
      type: 'safe-plan-result',
      root: { id: root.id, name: root.name, width: root.geometry.width, height: root.geometry.height },
      plans,
      roles,
      mutationEnabled: proof.valid && !pendingUndo && !operationInFlight,
      runtimeProofValid: proof.valid,
      runtimeProofPassedAt: proof.passedAt,
      pendingUndo,
      operationInFlight,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Safe Fix preview failed: ${message}`);
  }
}

async function runValidation(): Promise<void> {
  const selection = figma.currentPage.selection;
  if (selection.length !== 2) {
    postError('Select exactly two section Frames: original first, candidate second.', 'validation-error');
    return;
  }

  const before = selection[0];
  const after = selection[1];
  if (!before || !after || before.type !== 'FRAME' || after.type !== 'FRAME') {
    postError('Validation currently requires exactly two selected Figma Frames.', 'validation-error');
    return;
  }

  try {
    const result = await fullFrameValidator.validate(before, after);
    figma.ui.postMessage({
      type: 'validation-result',
      report: result.report,
      labels: result.labels,
      renderScale: result.renderScale,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Validation failed: ${message}`, 'validation-error');
  }
}

async function runRuntimeSelfTest(): Promise<void> {
  const operation: ExclusiveOperation = 'runtime-self-test';
  if (!beginExclusiveOperation(operation, 'validation-error')) return;

  figma.ui.postMessage({ type: 'runtime-calibration-started' });
  try {
    const result = await runP5RuntimeCalibration(async (before, after) => {
      const validation = await fullFrameValidator.validate(before, after);
      return validation.report;
    });

    if (result.passed) {
      await figma.clientStorage.setAsync(P5_RUNTIME_PROOF_STORAGE_KEY, createP5RuntimeProof());
    } else {
      await figma.clientStorage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
    }

    const proof = await runtimeProofState();
    figma.ui.postMessage({
      type: 'runtime-calibration-result',
      result,
      mutationGateUnlocked: proof.valid,
      runtimeProofPassedAt: proof.passedAt,
    });
    figma.notify(result.passed ? 'P5 compiled runtime self-test passed. Safe Fix gate unlocked.' : 'P5 compiled runtime self-test failed.');
  } catch (error) {
    await figma.clientStorage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
    const message = error instanceof Error ? error.message : String(error);
    postError(`P5 runtime self-test failed: ${message}`, 'validation-error');
  } finally {
    endExclusiveOperation(operation);
  }
}

async function runP6PageFlowDeveloperCalibration(): Promise<void> {
  const selected = selectedFrame();
  if (!selected) {
    postError('Select exactly one page Frame before running P6 page-flow clone calibration.', 'validation-error');
    return;
  }

  const operation: ExclusiveOperation = 'p6-page-flow-calibration';
  if (!beginExclusiveOperation(operation, 'validation-error')) return;

  figma.ui.postMessage({
    type: 'p6-page-flow-calibration-started',
    frameId: selected.id,
    frameName: selected.name,
  });

  try {
    const outcome = await runP6DeveloperPageFlowCalibration(selected, {
      runtimeProofValid: async () => (await runtimeProofState()).valid,
      hasPendingCheckpoint: hasPendingSafeFixCheckpoint,
      validateFullP3: async (before, after) => {
        const validation = await fullFrameValidator.validate(before, after);
        return validation.report;
      },
    });

    figma.ui.postMessage({
      type: 'p6-page-flow-calibration-result',
      outcome,
    });

    if (outcome.status === 'BLOCKED') {
      figma.notify(`P6 clone calibration blocked: ${outcome.reason}`);
      return;
    }
    if (outcome.status === 'NO_CANDIDATE') {
      figma.notify('P6 clone calibration did not run: no unambiguous page-flow calibration candidate.');
      return;
    }

    const result = outcome.result;
    if (result.leftoverCandidateRisk) {
      postError(
        `P6 clone calibration cleanup failed. Inspect candidate ${result.candidateNodeId ?? 'unknown'} before continuing.`,
        'validation-error',
      );
      figma.notify('P6 calibration left a candidate-risk marker; inspect the page before continuing.');
      return;
    }

    if (result.status === 'PASSED') {
      figma.notify('P6 page-flow clone calibration passed Full P3; candidate was discarded.');
    } else if (result.status === 'REJECTED') {
      figma.notify('P6 page-flow clone calibration was rejected by Full P3; candidate was discarded.');
    } else {
      figma.notify(`P6 page-flow clone calibration ended ${result.status.toLowerCase()}; no production commit was attempted.`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`P6 page-flow clone calibration failed: ${message}`, 'validation-error');
  } finally {
    endExclusiveOperation(operation);
  }
}

async function runSafeFixApply(message: { targetNodeId: string; recipe: SafeRecipeKind }): Promise<void> {
  const selected = selectedFrame();
  if (!selected) {
    postError('Select exactly one Frame before applying a Safe Fix.', 'safe-fix-error');
    return;
  }

  const operation: ExclusiveOperation = 'safe-fix-apply';
  if (!beginExclusiveOperation(operation, 'safe-fix-error')) return;

  try {
    const [proof, pendingUndo] = await Promise.all([
      runtimeProofState(),
      hasPendingSafeFixCheckpoint(),
    ]);
    if (!proof.valid) {
      postError('Safe Fix mutation is locked until Developer: P5 Runtime Self-Test passes in this plugin build.', 'safe-fix-error');
      return;
    }
    if (pendingUndo) {
      postError('A previous Safe Fix checkpoint is pending. Restore or finalize it before applying another fix.', 'safe-fix-error');
      return;
    }

    const { plans } = await currentSafePlans(selected);
    const plan = plans.find((candidate) => (
      candidate.decision === 'ELIGIBLE'
      && candidate.recipe === message.recipe
      && candidate.targetNodeId === message.targetNodeId
    ));
    if (!plan) {
      postError('The requested Safe Fix is no longer eligible after re-auditing the current selection.', 'safe-fix-error');
      return;
    }

    figma.ui.postMessage({
      type: 'safe-fix-started',
      recipe: plan.recipe,
      targetNodeName: plan.targetNodeName,
    });

    const result = await runSafeFixTransaction(selected, plan, async (before, after) => {
      const validation = await fullFrameValidator.validate(before, after);
      return validation.report;
    });
    const checkpointPending = await hasPendingSafeFixCheckpoint();

    figma.ui.postMessage({
      type: 'safe-fix-result',
      plan: result.plan,
      transaction: result.transaction,
      skippedReason: result.skippedReason ?? null,
      pendingUndo: checkpointPending,
    });

    if (result.transaction?.state === 'COMMITTED') {
      figma.notify('Safe Fix passed full P3 validation and was committed. Restore or finalize the checkpoint.');
    } else if (result.transaction?.state === 'REJECTED') {
      figma.notify('Safe Fix candidate was rejected by validation; the original was kept unchanged.');
    } else if (result.transaction?.state === 'FAILED') {
      figma.notify('Safe Fix failed safely; the approved original was kept unchanged.');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    postError(`Safe Fix failed: ${errorMessage}`, 'safe-fix-error');
  } finally {
    endExclusiveOperation(operation);
  }
}

async function runSafeFixRestore(): Promise<void> {
  const operation: ExclusiveOperation = 'safe-fix-restore';
  if (!beginExclusiveOperation(operation, 'safe-fix-error')) return;

  try {
    const evidence = await restoreLastSafeFix();
    figma.ui.postMessage({ type: 'safe-fix-restore-result', restored: Boolean(evidence), evidence });
    figma.notify(evidence ? 'Previous approved original restored.' : 'No Safe Fix checkpoint is pending.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Safe Fix restore failed: ${message}`, 'safe-fix-error');
  } finally {
    endExclusiveOperation(operation);
  }
}

async function runSafeFixFinalize(): Promise<void> {
  const operation: ExclusiveOperation = 'safe-fix-finalize';
  if (!beginExclusiveOperation(operation, 'safe-fix-error')) return;

  try {
    const finalized = await finalizeLastSafeFix();
    figma.ui.postMessage({ type: 'safe-fix-finalize-result', finalized });
    figma.notify(finalized ? 'Safe Fix finalized; previous original backup removed.' : 'No Safe Fix checkpoint is pending.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Safe Fix finalize failed: ${message}`, 'safe-fix-error');
  } finally {
    endExclusiveOperation(operation);
  }
}

figma.ui.onmessage = async (message: unknown) => {
  if (typeof message !== 'object' || message === null || !('type' in message)) return;
  const type = (message as { type?: unknown }).type;

  if (type === 'audit-request') {
    runAudit();
    return;
  }

  if (type === 'safe-plan-request') {
    await runSafePlanPreview();
    return;
  }

  if (type === 'safe-fix-apply-request') {
    const payload = message as { targetNodeId?: unknown; recipe?: unknown };
    if (typeof payload.targetNodeId !== 'string' || typeof payload.recipe !== 'string') {
      postError('Safe Fix request payload is invalid.', 'safe-fix-error');
      return;
    }
    await runSafeFixApply({
      targetNodeId: payload.targetNodeId,
      recipe: payload.recipe as SafeRecipeKind,
    });
    return;
  }

  if (type === 'safe-fix-restore-request') {
    await runSafeFixRestore();
    return;
  }

  if (type === 'safe-fix-finalize-request') {
    await runSafeFixFinalize();
    return;
  }

  if (type === 'validation-request') {
    await runValidation();
    return;
  }

  if (type === 'runtime-calibration-request') {
    await runRuntimeSelfTest();
    return;
  }

  if (type === 'p6-page-flow-calibration-request') {
    await runP6PageFlowDeveloperCalibration();
    return;
  }

  if (type === 'validation-pixel-result') {
    const payload = message as {
      validationId?: unknown;
      pixelMetrics?: unknown;
    };
    if (typeof payload.validationId !== 'number' || typeof payload.pixelMetrics !== 'object' || payload.pixelMetrics === null) {
      postError('Pixel validator returned an invalid payload.', 'validation-error');
      return;
    }
    if (!fullFrameValidator.finish(payload.validationId, payload.pixelMetrics as PixelDiffMetrics)) {
      postError('Validation result expired or is no longer pending.', 'validation-error');
    }
    return;
  }

  if (type === 'validation-pixel-error') {
    const payload = message as { validationId?: unknown; message?: unknown };
    if (typeof payload.validationId !== 'number' || typeof payload.message !== 'string') {
      postError('Pixel validator returned an invalid error payload.', 'validation-error');
      return;
    }
    if (!fullFrameValidator.fail(payload.validationId, payload.message)) {
      postError('Validation result expired or is no longer pending.', 'validation-error');
    }
  }
};

figma.on('selectionchange', () => {
  if (figma.currentPage.selection.length === 1) runAudit();
});

if (figma.command === 'p5-runtime-self-test') {
  void runRuntimeSelfTest();
} else if (figma.command === 'p6-page-flow-calibration') {
  void runP6PageFlowDeveloperCalibration();
} else if (figma.currentPage.selection.length === 1) {
  runAudit();
}
