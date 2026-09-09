import { scanSceneNode } from '../core/scanner';
import { buildAuditReport } from '../core/scoring';
import {
  generateBacklog,
  serializeBacklogJson,
  serializeBacklogMarkdown,
  type BacklogDocument,
} from '../core/backlog';
import { serializeAuditReportJson, serializeAuditReportMarkdown } from '../core/report-serialization';
import { captureIntegritySnapshot } from './integrity-snapshot';
import { DEFAULT_VALIDATION_THRESHOLDS, mergePixelValidation, validateIntegrity } from '../core/validator';
import type { PixelDiffMetrics, ValidationReport } from '../core/validation-types';

declare const __html__: string;
declare const __PLUGIN_VERSION__: string;

const PLUGIN_VERSION = __PLUGIN_VERSION__;
const MAX_VALIDATION_RENDER_DIMENSION = 2048;
const BACKLOG_STORAGE_PREFIX = 'p9-backlog-v1';
let auditSequence = 0;
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

  if (type === 'validation-request') {
    auditSequence += 1;
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
  const sequence = ++auditSequence;
  if (figma.currentPage.selection.length === 1) void runAudit(sequence);
});

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
