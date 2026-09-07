import { scanSceneNode } from '../core/scanner';
import { buildAuditReport } from '../core/scoring';
import { captureIntegritySnapshot } from './integrity-snapshot';
import { DEFAULT_VALIDATION_THRESHOLDS, mergePixelValidation, validateIntegrity } from '../core/validator';
import type { PixelDiffMetrics, ValidationReport } from '../core/validation-types';

declare const __html__: string;

const PLUGIN_VERSION = '0.1.0-alpha.1';
const MAX_VALIDATION_RENDER_DIMENSION = 2048;
let validationSequence = 0;

interface PendingValidation {
  report: ValidationReport;
  labels: { before: string; after: string };
  renderScale: number;
}

const pendingValidations = new Map<number, PendingValidation>();

figma.showUI(__html__, {
  width: 440,
  height: 680,
  themeColors: true,
});

function postError(message: string, type: 'audit-error' | 'validation-error' = 'audit-error'): void {
  figma.ui.postMessage({ type, message });
}

function runAudit(): void {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1) {
    postError('Select exactly one desktop frame to audit.');
    return;
  }

  const selected = selection[0];
  if (!selected || selected.type !== 'FRAME') {
    postError('Audit currently supports one selected Figma Frame.');
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
    const beforeSnapshot = captureIntegritySnapshot(before);
    const afterSnapshot = captureIntegritySnapshot(after);
    const report = validateIntegrity(beforeSnapshot, afterSnapshot, DEFAULT_VALIDATION_THRESHOLDS);

    const largestDimension = Math.max(before.width, before.height, after.width, after.height, 1);
    const renderScale = Math.min(1, MAX_VALIDATION_RENDER_DIMENSION / largestDimension);
    const exportSettings: ExportSettingsImage = {
      format: 'PNG',
      constraint: { type: 'SCALE', value: renderScale },
    };

    const [beforePng, afterPng] = await Promise.all([
      before.exportAsync(exportSettings),
      after.exportAsync(exportSettings),
    ]);

    validationSequence += 1;
    const validationId = validationSequence;
    pendingValidations.set(validationId, {
      report,
      labels: { before: before.name, after: after.name },
      renderScale,
    });

    figma.ui.postMessage({
      type: 'validation-pixel-request',
      validationId,
      beforePng,
      afterPng,
      channelTolerance: DEFAULT_VALIDATION_THRESHOLDS.pixelChannelDelta,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Validation failed: ${message}`, 'validation-error');
  }
}

function finishPixelValidation(validationId: number, pixelMetrics: PixelDiffMetrics): void {
  const pending = pendingValidations.get(validationId);
  if (!pending) {
    postError('Validation result expired or is no longer pending.', 'validation-error');
    return;
  }

  pendingValidations.delete(validationId);
  const report = mergePixelValidation(pending.report, pixelMetrics);
  figma.ui.postMessage({
    type: 'validation-result',
    report,
    labels: pending.labels,
    renderScale: pending.renderScale,
  });
}

figma.ui.onmessage = async (message: unknown) => {
  if (typeof message !== 'object' || message === null || !('type' in message)) return;
  const type = (message as { type?: unknown }).type;

  if (type === 'audit-request') {
    runAudit();
    return;
  }

  if (type === 'validation-request') {
    await runValidation();
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
    finishPixelValidation(payload.validationId, payload.pixelMetrics as PixelDiffMetrics);
  }
};

figma.on('selectionchange', () => {
  if (figma.currentPage.selection.length === 1) runAudit();
});

if (figma.currentPage.selection.length === 1) runAudit();
