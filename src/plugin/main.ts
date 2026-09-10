import { detectPatterns } from '../core/classification';
import {
  isValidP5RuntimeProof,
  P5_RUNTIME_PROOF_STORAGE_KEY,
  type P5RuntimeBuildIdentity,
} from '../core/p5-runtime-gate';
import { detectSpecialRoles } from '../core/roles';
import { planSafeRecipes } from '../core/safe-recipe-planner';
import type { SafeRecipeKind } from '../core/safe-recipe-types';
import { scanSceneNode } from '../core/scanner';
import { buildAuditReport } from '../core/scoring';
import {
  generateBacklog,
  serializeBacklogJson,
  serializeBacklogMarkdown,
  type BacklogDocument,
} from '../core/backlog';
import { serializeAuditReportJson, serializeAuditReportMarkdown } from '../core/report-serialization';
import type { PixelDiffMetrics } from '../core/validation-types';
import { FullFrameValidator } from './full-frame-validator';
import { currentP5RuntimeBuildIdentity } from './p5-runtime-build-identity';
import { runP5RuntimeCalibration } from './p5-runtime-calibration';
import { updateP5RuntimeProofFromCalibration } from './p5-runtime-proof-storage';
import { buildP5RuntimeEvidenceBundle } from './p5-runtime-evidence';
import {
  loadLatestP5RuntimeEvidence,
  persistP5RuntimeEvidenceBestEffort,
} from './p5-runtime-evidence-storage';
import { buildP5RuntimeEvidenceViewerHtml } from './p5-runtime-evidence-viewer';
import { inspectP6ClosureEvidence } from './p6-closure-inspector';
import { persistP6ClosureEvidenceBestEffort } from './p6-closure-evidence-storage';
import { buildP6ClosureViewerHtml } from './p6-closure-viewer';
import { runP6DeveloperPageFlowCalibration } from './p6-developer-calibration';
import { buildP6DeveloperEvidenceView } from './p6-developer-evidence-view';
import {
  finalizeLastSafeFix,
  hasPendingSafeFixCheckpoint,
  restoreLastSafeFix,
  runSafeFixTransaction,
} from './safe-fix-runtime';

declare const __html__: string;
declare const __PLUGIN_VERSION__: string;

const PLUGIN_VERSION = __PLUGIN_VERSION__;
const RUNTIME_BUILD = currentP5RuntimeBuildIdentity();
const BACKLOG_STORAGE_PREFIX = 'p9-backlog-v1';
let auditSequence = 0;

type P5ExclusiveOperation = 'runtime-self-test' | 'safe-fix-apply' | 'safe-fix-restore' | 'safe-fix-finalize' | 'p6-page-flow-calibration';
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

function isBacklogDocument(value: unknown): value is BacklogDocument {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as { schemaVersion?: unknown; items?: unknown; summary?: unknown };
  return candidate.schemaVersion === 1
    && Array.isArray(candidate.items)
    && typeof candidate.summary === 'object'
    && candidate.summary !== null;
}

function backlogStorageKey(fileKey: string, pageId: string, frameId: string): string {
  return `${BACKLOG_STORAGE_PREFIX}:${fileKey}:${pageId}:${frameId}`;
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

async function runtimeProofState(): Promise<{ valid: boolean; passedAt: string | null; build: P5RuntimeBuildIdentity | null }> {
  const stored = await figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
  if (!isValidP5RuntimeProof(stored, RUNTIME_BUILD)) return { valid: false, passedAt: null, build: null };
  return { valid: true, passedAt: stored.passedAt, build: { ...stored.build } };
}

async function runAudit(sequence: number): Promise<void> {
  const page = figma.currentPage;
  const selection = page.selection;

  if (selection.length !== 1) {
    if (sequence === auditSequence) postError('Select exactly one desktop frame to audit.');
    return;
  }

  const selected = selection[0];
  if (!selected || selected.type !== 'FRAME') {
    if (sequence === auditSequence) postError('Audit currently supports one selected Figma Frame.');
    return;
  }

  const fileKey = typeof figma.fileKey === 'string' && figma.fileKey ? figma.fileKey : 'local-file';
  const pageId = page.id;
  const pageName = page.name;
  const storageKey = backlogStorageKey(fileKey, pageId, selected.id);

  try {
    const root = scanSceneNode(selected);
    const report = buildAuditReport(root, PLUGIN_VERSION);
    const stored = await figma.clientStorage.getAsync(storageKey) as unknown;

    if (sequence !== auditSequence) return;

    const previous = isBacklogDocument(stored) ? stored : null;
    const backlog = generateBacklog(report, {
      context: {
        ...(fileKey !== 'local-file' ? { fileKey } : {}),
        pageId,
        pageName,
      },
      previous,
    });

    if (sequence !== auditSequence) return;
    await figma.clientStorage.setAsync(storageKey, backlog);
    if (sequence !== auditSequence) return;

    figma.ui.postMessage({
      type: 'audit-result',
      report,
      backlog,
      auditJson: serializeAuditReportJson(report),
      auditMarkdown: serializeAuditReportMarkdown(report),
      backlogJson: serializeBacklogJson(backlog),
      backlogMarkdown: serializeBacklogMarkdown(backlog),
    });
  } catch (error) {
    if (sequence !== auditSequence) return;
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
      runtimeBuild: { ...RUNTIME_BUILD },
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

  figma.ui.postMessage({ type: 'runtime-calibration-started', runtimeBuild: { ...RUNTIME_BUILD } });
  try {
    const result = await runP5RuntimeCalibration(async (before, after) => {
      const validation = await fullFrameValidator.validate(before, after);
      return validation.report;
    });

    const acceptance = await updateP5RuntimeProofFromCalibration(figma.clientStorage, result, RUNTIME_BUILD);
    const proof = await runtimeProofState();
    const evidence = buildP5RuntimeEvidenceBundle({
      pluginVersion: PLUGIN_VERSION,
      build: RUNTIME_BUILD,
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
      runtimeBuild: { ...RUNTIME_BUILD },
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

async function runP6ClosureEvidenceViewer(): Promise<void> {
  const inspection = await inspectP6ClosureEvidence(figma.clientStorage, RUNTIME_BUILD);
  figma.showUI(buildP6ClosureViewerHtml(inspection), {
    width: 520,
    height: 720,
    themeColors: true,
  });
}

async function runP6PageFlowDeveloperCalibration(): Promise<void> {
  const selected = selectedFrame();
  if (!selected) {
    postError('Select exactly one page Frame before running P6 page-flow clone calibration.', 'validation-error');
    return;
  }

  const operation: P5ExclusiveOperation = 'p6-page-flow-calibration';
  if (!beginExclusiveP5Operation(operation, 'validation-error')) return;

  figma.ui.postMessage({
    type: 'p6-page-flow-calibration-started',
    frameId: selected.id,
    frameName: selected.name,
    runtimeBuild: { ...RUNTIME_BUILD },
  });

  try {
    const proof = await runtimeProofState();
    const outcome = await runP6DeveloperPageFlowCalibration(selected, {
      runtimeProofValid: async () => proof.valid,
      hasPendingCheckpoint: hasPendingSafeFixCheckpoint,
      validateFullP3: async (before, after) => {
        const validation = await fullFrameValidator.validate(before, after);
        return validation.report;
      },
    });

    const evidenceView = buildP6DeveloperEvidenceView({
      pluginVersion: PLUGIN_VERSION,
      build: RUNTIME_BUILD,
      p5RuntimeProofPassedAt: proof.passedAt,
      p5RuntimeProofBuild: proof.build,
      frame: selected,
      outcome,
    });
    const closureEvidencePersisted = await persistP6ClosureEvidenceBestEffort(figma.clientStorage, evidenceView);

    figma.ui.postMessage({
      type: 'p6-page-flow-calibration-result',
      outcome,
      evidenceKind: evidenceView.kind,
      evidence: evidenceView.evidence,
      closureEvidencePersisted,
      runtimeBuild: { ...RUNTIME_BUILD },
    });

    figma.showUI(evidenceView.html, { width: 520, height: 700, themeColors: true });

    if (outcome.status === 'BLOCKED') {
      figma.notify(`P6 clone calibration blocked: ${outcome.reason}`);
      return;
    }
    if (outcome.status === 'NO_CANDIDATE') {
      figma.notify(closureEvidencePersisted
        ? 'P6 preservation/refusal acceptance passed and was retained for closure review.'
        : 'P6 clone calibration did not run; preservation/refusal evidence is open for review.');
      return;
    }

    const result = outcome.result;
    if (result.leftoverCandidateRisk) {
      postError(`P6 clone calibration cleanup failed. Inspect candidate ${result.candidateNodeId ?? 'unknown'} before continuing.`, 'validation-error');
      return;
    }
    if (result.status === 'PASSED') {
      figma.notify(closureEvidencePersisted
        ? 'P6 page-flow clone calibration passed Full P3; accepted evidence retained for closure review.'
        : 'P6 page-flow clone calibration passed Full P3; candidate was discarded.');
    } else if (result.status === 'REJECTED') {
      figma.notify('P6 page-flow clone calibration was rejected by Full P3; candidate was discarded.');
    } else {
      figma.notify(`P6 page-flow clone calibration ended ${result.status.toLowerCase()}; no production commit was attempted.`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`P6 page-flow clone calibration failed: ${message}`, 'validation-error');
  } finally {
    endExclusiveP5Operation(operation);
  }
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
      postError('Safe Fix mutation is locked until Developer: P5 Runtime Self-Test passes in this exact CI-built plugin artifact.', 'safe-fix-error');
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

function startAudit(): void {
  const sequence = ++auditSequence;
  void runAudit(sequence);
}

function startValidation(): void {
  auditSequence += 1;
  void runValidation();
}

figma.ui.onmessage = async (message: unknown) => {
  if (typeof message !== 'object' || message === null || !('type' in message)) return;
  const type = (message as { type?: unknown }).type;

  if (type === 'audit-request') {
    const sequence = ++auditSequence;
    await runAudit(sequence);
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
    auditSequence += 1;
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

  if (type === 'p6-runtime-evidence-request') {
    await runP6ClosureEvidenceViewer();
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
  const sequence = ++auditSequence;
  if (figma.currentPage.selection.length === 1) void runAudit(sequence);
});

if (figma.command === 'p5-runtime-self-test') {
  void runRuntimeSelfTest();
} else if (figma.command === 'p5-runtime-evidence') {
  void runRuntimeEvidenceViewer();
} else if (figma.command === 'p6-page-flow-calibration') {
  void runP6PageFlowDeveloperCalibration();
} else if (figma.command === 'p6-runtime-evidence') {
  void runP6ClosureEvidenceViewer();
} else {
  switch (figma.command) {
    case 'audit':
    case 'export-report':
      startAudit();
      break;
    case 'validate':
      startValidation();
      break;
    case 'open':
    default:
      if (figma.currentPage.selection.length === 1) startAudit();
      break;
  }
}
