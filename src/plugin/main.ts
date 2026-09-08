import { detectPatterns } from '../core/classification';
import {
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
import { updateP5RuntimeProofFromCalibration } from './p5-runtime-proof-storage';
import { buildP5RuntimeEvidenceBundle } from './p5-runtime-evidence';
import {
  loadLatestP5RuntimeEvidence,
  persistP5RuntimeEvidenceBestEffort,
} from './p5-runtime-evidence-storage';
import { buildP5RuntimeEvidenceViewerHtml } from './p5-runtime-evidence-viewer';
import {
  finalizeLastSafeFix,
  hasPendingSafeFixCheckpoint,
  restoreLastSafeFix,
  runSafeFixTransaction,
} from './safe-fix-runtime';

declare const __html__: string;

const PLUGIN_VERSION = '0.1.0-alpha.1';

type P5ExclusiveOperation = 'runtime-self-test' | 'safe-fix-apply' | 'safe-fix-restore' | 'safe-fix-finalize';
let p5OperationInFlight: P5ExclusiveOperation | null = null;

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

function beginExclusiveP5Operation(operation: P5ExclusiveOperation, errorType: 'validation-error' | 'safe-fix-error'): boolean {
  if (p5OperationInFlight) {
    postError(`Another P5 operation (${p5OperationInFlight}) is still running. Wait for it to finish before starting ${operation}.`, errorType);
    return false;
  }
  p5OperationInFlight = operation;
  return true;
}

function endExclusiveP5Operation(operation: P5ExclusiveOperation): void {
  if (p5OperationInFlight === operation) p5OperationInFlight = null;
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
      mutationEnabled: proof.valid && !pendingUndo && !p5OperationInFlight,
      runtimeProofValid: proof.valid,
      runtimeProofPassedAt: proof.passedAt,
      pendingUndo,
      operationInFlight: p5OperationInFlight,
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
  const operation: P5ExclusiveOperation = 'runtime-self-test';
  if (!beginExclusiveP5Operation(operation, 'validation-error')) return;

  figma.ui.postMessage({ type: 'runtime-calibration-started' });
  try {
    const result = await runP5RuntimeCalibration(async (before, after) => {
      const validation = await fullFrameValidator.validate(before, after);
      return validation.report;
    });

    const acceptance = await updateP5RuntimeProofFromCalibration(figma.clientStorage, result);
    const proof = await runtimeProofState();
    const evidence = buildP5RuntimeEvidenceBundle({
      pluginVersion: PLUGIN_VERSION,
      result,
      runtimeProofPassedAt: proof.passedAt,
    });
    const evidencePersisted = await persistP5RuntimeEvidenceBestEffort(figma.clientStorage, evidence);

    figma.ui.postMessage({
      type: 'runtime-calibration-result',
      result,
      acceptance,
      evidence,
      evidencePersisted,
      mutationGateUnlocked: proof.valid,
      runtimeProofPassedAt: proof.passedAt,
    });

    figma.showUI(buildP5RuntimeEvidenceViewerHtml(evidence), {
      width: 520,
      height: 700,
      themeColors: true,
    });

    if (acceptance.accepted && proof.valid) {
      figma.notify(evidencePersisted
        ? 'P5 compiled runtime acceptance passed. Evidence saved; Safe Fix gate unlocked.'
        : 'P5 compiled runtime acceptance passed. Evidence storage failed, but Safe Fix gate is unlocked.');
    } else {
      const detail = acceptance.failures[0] ? ` ${acceptance.failures[0]}` : '';
      figma.notify(`P5 compiled runtime acceptance failed; Safe Fix remains locked.${detail}`);
    }
  } catch (error) {
    await figma.clientStorage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
    const message = error instanceof Error ? error.message : String(error);
    postError(`P5 runtime self-test failed: ${message}`, 'validation-error');
  } finally {
    endExclusiveP5Operation(operation);
  }
}

async function runRuntimeEvidenceViewer(): Promise<void> {
  const evidence = await loadLatestP5RuntimeEvidence(figma.clientStorage);
  if (!evidence) {
    figma.notify('No valid persisted P5 runtime acceptance evidence is available.');
    return;
  }
  figma.showUI(buildP5RuntimeEvidenceViewerHtml(evidence), {
    width: 520,
    height: 700,
    themeColors: true,
  });
}

async function runSafeFixApply(message: { targetNodeId: string; recipe: SafeRecipeKind }): Promise<void> {
  const selected = selectedFrame();
  if (!selected) {
    postError('Select exactly one Frame before applying a Safe Fix.', 'safe-fix-error');
    return;
  }

  const operation: P5ExclusiveOperation = 'safe-fix-apply';
  if (!beginExclusiveP5Operation(operation, 'safe-fix-error')) return;

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
    endExclusiveP5Operation(operation);
  }
}

async function runSafeFixRestore(): Promise<void> {
  const operation: P5ExclusiveOperation = 'safe-fix-restore';
  if (!beginExclusiveP5Operation(operation, 'safe-fix-error')) return;

  try {
    const evidence = await restoreLastSafeFix();
    figma.ui.postMessage({ type: 'safe-fix-restore-result', restored: Boolean(evidence), evidence });
    figma.notify(evidence ? 'Previous approved original restored.' : 'No Safe Fix checkpoint is pending.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Safe Fix restore failed: ${message}`, 'safe-fix-error');
  } finally {
    endExclusiveP5Operation(operation);
  }
}

async function runSafeFixFinalize(): Promise<void> {
  const operation: P5ExclusiveOperation = 'safe-fix-finalize';
  if (!beginExclusiveP5Operation(operation, 'safe-fix-error')) return;

  try {
    const finalized = await finalizeLastSafeFix();
    figma.ui.postMessage({ type: 'safe-fix-finalize-result', finalized });
    figma.notify(finalized ? 'Safe Fix finalized; previous original backup removed.' : 'No Safe Fix checkpoint is pending.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Safe Fix finalize failed: ${message}`, 'safe-fix-error');
  } finally {
    endExclusiveP5Operation(operation);
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
} else if (figma.command === 'p5-runtime-evidence') {
  void runRuntimeEvidenceViewer();
} else if (figma.currentPage.selection.length === 1) {
  runAudit();
}
