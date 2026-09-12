import {
  requestBatchCancel,
  resumeBatchQueue,
  summarizeBatchQueue,
  type BatchQueueState,
} from '../core/batch-queue';
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
import { buildBuildReadyReport, serializeBuildReadyReportJson } from '../core/build-ready';
import { buildAuditReport } from '../core/scoring';
import {
  generateBacklog,
  serializeBacklogJson,
  serializeBacklogMarkdown,
  type BacklogDocument,
} from '../core/backlog';
import { serializeAuditReportJson, serializeAuditReportMarkdown } from '../core/report-serialization';
import type { PixelDiffMetrics } from '../core/validation-types';
import { P7_BUILD_IDENTITY } from './build-info';
import { FullFrameValidator } from './full-frame-validator';
import {
  createDefaultFigmaP7MetadataStore,
  persistP7DurableSuccesses,
  prepareP7BatchQueue,
  runFigmaP7BatchLifecycle,
} from './p7-batch-lifecycle';
import {
  finalizeP7BatchCheckpointAfterReaudit,
  restoreP7BatchCheckpoint,
} from './p7-checkpoint-resolution';
import {
  clearP7P5BuildProofReceipt,
  readP7P5BuildProofState,
  syncP7P5BuildProofReceipt,
} from './p7-p5-build-proof';
import { inspectLatestP7RuntimeEvidence } from './p7-runtime-evidence-inspector';
import { buildP7RuntimeEvidenceViewerHtml } from './p7-runtime-evidence-viewer';
import { buildP13RuntimeEvidenceBundle } from './p13-runtime-evidence';
import {
  loadLatestP13RuntimeEvidence,
  persistP13RuntimeEvidenceBestEffort,
} from './p13-runtime-evidence-storage';
import { buildP13RuntimeEvidenceViewerHtml } from './p13-runtime-evidence-viewer';
import { buildP14PlanPreview, serializeP14PlanPreviewJson } from './p14-plan-preview';
import { assessP14PreviewContextBinding } from './p14-preview-context';
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

type P5ExclusiveOperation = 'runtime-self-test' | 'safe-fix-apply' | 'safe-fix-restore' | 'safe-fix-finalize' | 'p6-page-flow-calibration' | 'batch-run' | 'batch-checkpoint';
let p5OperationInFlight: P5ExclusiveOperation | null = null;
let p7BatchState: BatchQueueState | null = null;
let p7CancelRequested = false;
const p7Metadata = createDefaultFigmaP7MetadataStore();

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
  type: 'audit-error' | 'validation-error' | 'safe-fix-error' | 'batch-error' = 'audit-error',
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

function beginExclusiveP5Operation(operation: P5ExclusiveOperation, errorType: 'validation-error' | 'safe-fix-error' | 'batch-error'): boolean {
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

function selectedBatchFrames(): FrameNode[] | null {
  const selection = figma.currentPage.selection;
  if (selection.length < 1 || selection.some((node) => node.type !== 'FRAME')) return null;
  return selection as readonly FrameNode[] as FrameNode[];
}

async function runtimeProofState(): Promise<{ valid: boolean; passedAt: string | null; build: P5RuntimeBuildIdentity | null }> {
  const [stored, p7State] = await Promise.all([
    figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY),
    readP7P5BuildProofState(figma.clientStorage, P7_BUILD_IDENTITY),
  ]);
  if (!isValidP5RuntimeProof(stored, RUNTIME_BUILD) || !p7State.valid || p7State.passedAt !== stored.passedAt) {
    return { valid: false, passedAt: null, build: null };
  }
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
    const buildReady = buildBuildReadyReport(root, {}, report.generatedAt);
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

    const p13RuntimeEvidence = buildP13RuntimeEvidenceBundle({
      pluginVersion: PLUGIN_VERSION,
      build: P7_BUILD_IDENTITY,
      context: {
        fileKey,
        pageId,
        pageName,
        frameId: selected.id,
        frameName: selected.name,
      },
      audit: report,
      buildReady,
      capturedAt: report.generatedAt,
    });
    const p13RuntimeEvidencePersistence = await persistP13RuntimeEvidenceBestEffort(
      figma.clientStorage,
      p13RuntimeEvidence,
    );
    if (sequence !== auditSequence) return;

    figma.ui.postMessage({
      type: 'audit-result',
      report,
      backlog,
      buildReady,
      buildReadyJson: serializeBuildReadyReportJson(buildReady),
      auditJson: serializeAuditReportJson(report),
      auditMarkdown: serializeAuditReportMarkdown(report),
      backlogJson: serializeBacklogJson(backlog),
      backlogMarkdown: serializeBacklogMarkdown(backlog),
      p13RuntimeEvidencePersisted: p13RuntimeEvidencePersistence.persisted,
      p13RuntimeEvidencePersistence,
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
      p5OperationInFlight: p5OperationInFlight,
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
    const storedProof = await figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
    const receiptReady = acceptance.accepted
      ? await syncP7P5BuildProofReceipt(figma.clientStorage, storedProof, P7_BUILD_IDENTITY)
      : false;
    if (!receiptReady) await clearP7P5BuildProofReceipt(figma.clientStorage);
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
    await Promise.all([
      figma.clientStorage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY),
      clearP7P5BuildProofReceipt(figma.clientStorage),
    ]);
    const message = error instanceof Error ? error.message : String(error);
    postError(`P5 runtime self-test failed: ${message}`, 'validation-error');
  } finally {
    endExclusiveP5Operation(operation);
  }
}

async function runP7RuntimeEvidenceInspector(): Promise<void> {
  const inspection = await inspectLatestP7RuntimeEvidence(figma.clientStorage);
  figma.showUI(buildP7RuntimeEvidenceViewerHtml(inspection), {
    width: 520,
    height: 700,
    themeColors: true,
  });

  if (inspection.status === 'EMPTY') {
    figma.notify('No valid persisted P7 runtime evidence is available yet.');
    return;
  }

  const finished = inspection.summary.finalFinishedCount ?? '—';
  const total = inspection.summary.finalTotalCount ?? '—';
  figma.notify(
    `P7 runtime evidence loaded: ${finished}/${total} finished · max concurrency ${inspection.summary.maxConcurrentProcessors}.`,
  );
}


async function runP13RuntimeEvidenceViewer(): Promise<void> {
  const evidence = await loadLatestP13RuntimeEvidence(figma.clientStorage);
  figma.showUI(buildP13RuntimeEvidenceViewerHtml(evidence), {
    width: 540,
    height: 720,
    themeColors: true,
  });

  if (!evidence) {
    figma.notify('No valid persisted P13 runtime evidence is available yet. Run Audit on one Frame first.');
    return;
  }
  const eligibility = evidence.traceableBuild && evidence.realFigmaContext
    ? 'parity candidate ready'
    : 'inspection only';
  figma.notify(`P13 runtime evidence loaded: ${evidence.buildReady.score.score ?? '—'} / ${evidence.buildReady.score.status} · ${eligibility}.`);
}

async function runP14GuidedPreparePreview(): Promise<void> {
  const requestedFrame = selectedFrame();
  if (!requestedFrame) {
    figma.ui.postMessage({
      type: 'p14-plan-preview-unavailable',
      message: 'Select exactly one Frame, then run Audit on that Frame before previewing Guided Prepare.',
    });
    return;
  }
  const requestedFileKey = typeof figma.fileKey === 'string' && figma.fileKey ? figma.fileKey : 'local-file';
  const requestedPageId = figma.currentPage.id;

  try {
    const evidence = await loadLatestP13RuntimeEvidence(figma.clientStorage);
    if (!evidence) {
      figma.ui.postMessage({
        type: 'p14-plan-preview-unavailable',
        message: 'No valid persisted P13 Build-Ready evidence is available yet. Run Audit on exactly one Frame first.',
      });
      return;
    }

    const currentFrame = selectedFrame();
    const currentFileKey = typeof figma.fileKey === 'string' && figma.fileKey ? figma.fileKey : 'local-file';
    const currentPageId = figma.currentPage.id;
    if (!currentFrame
      || currentFrame.id !== requestedFrame.id
      || currentFileKey !== requestedFileKey
      || currentPageId !== requestedPageId) {
      figma.ui.postMessage({
        type: 'p14-plan-preview-unavailable',
        message: 'The Figma selection changed while Guided Prepare evidence was loading. Run Audit on the currently selected Frame and retry.',
      });
      return;
    }

    const contextBinding = assessP14PreviewContextBinding(evidence.context, {
      fileKey: currentFileKey,
      pageId: currentPageId,
      frameId: currentFrame.id,
    });
    if (!contextBinding.valid) {
      figma.ui.postMessage({
        type: 'p14-plan-preview-unavailable',
        message: `${contextBinding.failures.join(' ')} Run Audit on this selected Frame first.`,
      });
      return;
    }

    const preview = buildP14PlanPreview(evidence.buildReady);
    figma.ui.postMessage({
      type: 'p14-plan-preview-result',
      preview,
      previewJson: serializeP14PlanPreviewJson(preview),
      context: {
        fileKey: evidence.context.fileKey,
        pageName: evidence.context.pageName,
        frameName: evidence.context.frameName,
      },
      capturedAt: evidence.capturedAt,
    });
    figma.notify(`P14 Guided Prepare preview loaded: ${preview.summary.status} · read-only.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({
      type: 'p14-plan-preview-unavailable',
      message: `P14 Guided Prepare preview could not be loaded safely: ${message}`,
    });
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

function postBatchState(state: BatchQueueState, note: string | null = null): void {
  figma.ui.postMessage({
    type: 'batch-state',
    state,
    summary: summarizeBatchQueue(state),
    note,
    cancelRequested: p7CancelRequested,
  });
}


async function validateFullP3(before: FrameNode, after: FrameNode) {
  const validation = await fullFrameValidator.validate(before, after);
  return validation.report;
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
      postError('Safe Fix mutation is locked until the current build-bound P5 proof and exact-build P7 receipt both pass.', 'safe-fix-error');
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

async function runCurrentP7Batch(): Promise<void> {
  if (!p7BatchState) {
    postError('No P7 batch is available to run or resume.', 'batch-error');
    return;
  }
  if (p7BatchState.status === 'COMPLETED') {
    postBatchState(p7BatchState, 'Batch is already complete.');
    return;
  }

  const operation: P5ExclusiveOperation = 'batch-run';
  if (!beginExclusiveP5Operation(operation, 'batch-error')) return;

  try {
    const state = await runFigmaP7BatchLifecycle(
      p7BatchState,
      validateFullP3,
      p7Metadata,
      {
        shouldCancel: () => p7CancelRequested,
        onState: (nextState) => {
          p7BatchState = nextState;
          postBatchState(nextState);
        },
      },
    );
    p7BatchState = state;
    postBatchState(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`P7 batch run failed safely: ${message}`, 'batch-error');
  } finally {
    endExclusiveP5Operation(operation);
  }
}

async function runP7BatchStart(): Promise<void> {
  if (p5OperationInFlight) {
    postError(`Another operation (${p5OperationInFlight}) is still running.`, 'batch-error');
    return;
  }

  const frames = selectedBatchFrames();
  if (!frames) {
    postError('Select one or more Frames only before starting a P7 batch.', 'batch-error');
    return;
  }

  const [proof, pendingCheckpoint] = await Promise.all([
    runtimeProofState(),
    hasPendingSafeFixCheckpoint(),
  ]);
  if (!proof.valid) {
    postError('P7 batch mutation is locked until the deterministic P5 proof and exact-build P7 receipt match this CI artifact.', 'batch-error');
    return;
  }
  if (pendingCheckpoint) {
    postError('Resolve the existing Safe Fix checkpoint before starting a new P7 batch.', 'batch-error');
    return;
  }

  p7CancelRequested = false;
  p7BatchState = await prepareP7BatchQueue(
    frames.map((frame) => ({ frameId: frame.id, frameName: frame.name })),
    PLUGIN_VERSION,
    p7Metadata,
  );
  postBatchState(p7BatchState, `Prepared ${p7BatchState.items.length} selected Frame(s).`);
  if (p7BatchState.status !== 'COMPLETED') await runCurrentP7Batch();
}

function runP7BatchCancel(): void {
  if (!p7BatchState) {
    postError('No P7 batch is active.', 'batch-error');
    return;
  }

  p7CancelRequested = true;
  if (p5OperationInFlight !== 'batch-run') {
    p7BatchState = requestBatchCancel(p7BatchState);
  }
  postBatchState(
    p7BatchState,
    p5OperationInFlight === 'batch-run'
      ? 'Cancellation requested. The active frame transaction will settle safely before the queue stops.'
      : 'Batch cancelled.',
  );
}

async function runP7BatchResume(): Promise<void> {
  if (!p7BatchState) {
    postError('No P7 batch is available to resume.', 'batch-error');
    return;
  }
  if (p5OperationInFlight) {
    postError(`Another operation (${p5OperationInFlight}) is still running.`, 'batch-error');
    return;
  }
  if (p7BatchState.items.some((item) => item.status === 'AWAITING_CHECKPOINT')) {
    postError('Resolve the pending batch checkpoint before resuming.', 'batch-error');
    return;
  }

  p7CancelRequested = false;
  p7BatchState = resumeBatchQueue(p7BatchState, { retryFailed: true });
  postBatchState(p7BatchState, 'Batch resumed; failed/cancelled frames are eligible for retry.');
  if (p7BatchState.status !== 'COMPLETED') await runCurrentP7Batch();
}

async function continueP7BatchIfPending(): Promise<void> {
  if (!p7BatchState || p7CancelRequested) return;
  if (p7BatchState.status === 'IDLE') await runCurrentP7Batch();
}

async function runP7BatchCheckpointFinalize(): Promise<void> {
  if (!p7BatchState?.items.some((item) => item.status === 'AWAITING_CHECKPOINT')) {
    postError('No P7 batch checkpoint is awaiting finalization.', 'batch-error');
    return;
  }
  const operation: P5ExclusiveOperation = 'batch-checkpoint';
  if (!beginExclusiveP5Operation(operation, 'batch-error')) return;

  try {
    const result = await finalizeP7BatchCheckpointAfterReaudit(p7BatchState);
    p7BatchState = result.state;
    await persistP7DurableSuccesses(p7BatchState, p7Metadata);
    postBatchState(
      p7BatchState,
      result.resolution === 'FINALIZED_CONTINUE'
        ? 'Checkpoint finalized. Fresh re-audit found another eligible Safe Fix on this Frame; it will run again.'
        : 'Checkpoint finalized. Frame is durably complete.',
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`P7 checkpoint finalize failed safely: ${message}`, 'batch-error');
    return;
  } finally {
    endExclusiveP5Operation(operation);
  }

  await continueP7BatchIfPending();
}

async function runP7BatchCheckpointRestore(): Promise<void> {
  if (!p7BatchState?.items.some((item) => item.status === 'AWAITING_CHECKPOINT')) {
    postError('No P7 batch checkpoint is awaiting restore.', 'batch-error');
    return;
  }
  const operation: P5ExclusiveOperation = 'batch-checkpoint';
  if (!beginExclusiveP5Operation(operation, 'batch-error')) return;

  try {
    const result = await restoreP7BatchCheckpoint(p7BatchState);
    p7BatchState = result.state;
    postBatchState(p7BatchState, 'Committed candidate restored to the previous approved original.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`P7 checkpoint restore failed safely: ${message}`, 'batch-error');
    return;
  } finally {
    endExclusiveP5Operation(operation);
  }

  await continueP7BatchIfPending();
}


figma.ui.onmessage = async (message: unknown) => {
  if (typeof message !== 'object' || message === null || !('type' in message)) return;
  const type = (message as { type?: unknown }).type;

  if (type === 'audit-request') {
    const sequence = ++auditSequence;
    await runAudit(sequence);
    return;
  }

  if (type === 'p14-plan-preview-request') {
    await runP14GuidedPreparePreview();
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

  if (type === 'batch-start-request') {
    await runP7BatchStart();
    return;
  }

  if (type === 'batch-cancel-request') {
    runP7BatchCancel();
    return;
  }

  if (type === 'batch-resume-request') {
    await runP7BatchResume();
    return;
  }

  if (type === 'batch-checkpoint-finalize-request') {
    await runP7BatchCheckpointFinalize();
    return;
  }

  if (type === 'batch-checkpoint-restore-request') {
    await runP7BatchCheckpointRestore();
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
  if (p5OperationInFlight === 'batch-run' || p7BatchState?.status === 'PAUSED') return;
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
} else if (figma.command === 'p7-runtime-evidence') {
  void runP7RuntimeEvidenceInspector();
} else if (figma.command === 'p13-runtime-evidence') {
  void runP13RuntimeEvidenceViewer();
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
