import { captureIntegritySnapshot } from './integrity-snapshot';
import { DEFAULT_VALIDATION_THRESHOLDS, mergePixelValidation, validateIntegrity } from '../core/validator';
import type { PixelDiffMetrics, ValidationReport } from '../core/validation-types';

const MAX_VALIDATION_RENDER_DIMENSION = 2048;
const MAX_VALIDATION_PIXELS = MAX_VALIDATION_RENDER_DIMENSION * MAX_VALIDATION_RENDER_DIMENSION;
export const DEFAULT_PIXEL_BROKER_TIMEOUT_MS = 30_000;

export interface FullFrameValidationResult {
  report: ValidationReport;
  labels: { before: string; after: string };
  renderScale: number;
}

interface PendingValidation {
  report: ValidationReport;
  labels: { before: string; after: string };
  renderScale: number;
  resolve: (result: FullFrameValidationResult) => void;
  reject: (error: Error) => void;
  timeoutHandle: ReturnType<typeof setTimeout>;
}

interface PixelRequestMessage {
  type: 'validation-pixel-request';
  validationId: number;
  beforePng: Uint8Array;
  afterPng: Uint8Array;
  channelTolerance: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumberInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

function round(value: number, digits = 4): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

export function isValidPixelDiffMetrics(
  value: unknown,
  expectedChannelTolerance?: number,
): value is PixelDiffMetrics {
  if (!isRecord(value) || typeof value.sameDimensions !== 'boolean') return false;

  const dimensions = [value.widthBefore, value.heightBefore, value.widthAfter, value.heightAfter];
  if (!dimensions.every((entry) => isIntegerInRange(entry, 1, MAX_VALIDATION_RENDER_DIMENSION))) return false;
  if (!isIntegerInRange(value.totalPixels, 0, MAX_VALIDATION_PIXELS)) return false;
  if (!isIntegerInRange(value.changedPixels, 0, MAX_VALIDATION_PIXELS)) return false;
  if (!isFiniteNumberInRange(value.changedPixelPct, 0, 100)) return false;
  if (!isFiniteNumberInRange(value.meanChannelDelta, 0, 255)) return false;
  if (!isFiniteNumberInRange(value.maxChannelDelta, 0, 255)) return false;
  if (!isIntegerInRange(value.channelTolerance, 0, 255)) return false;
  if (expectedChannelTolerance !== undefined && value.channelTolerance !== expectedChannelTolerance) return false;
  if (value.meanChannelDelta > value.maxChannelDelta) return false;

  const widthBefore = value.widthBefore as number;
  const heightBefore = value.heightBefore as number;
  const widthAfter = value.widthAfter as number;
  const heightAfter = value.heightAfter as number;
  const totalPixels = value.totalPixels as number;
  const changedPixels = value.changedPixels as number;
  const changedPixelPct = value.changedPixelPct as number;

  if (value.sameDimensions) {
    if (widthBefore !== widthAfter || heightBefore !== heightAfter) return false;
    if (totalPixels !== widthBefore * heightBefore) return false;
    if (changedPixels > totalPixels) return false;
    if (changedPixelPct !== round((changedPixels / totalPixels) * 100)) return false;
    return true;
  }

  if (widthBefore === widthAfter && heightBefore === heightAfter) return false;
  return totalPixels === 0
    && changedPixels === 0
    && changedPixelPct === 100
    && value.meanChannelDelta === 255
    && value.maxChannelDelta === 255;
}

/**
 * Reusable P3 bridge between plugin-main Figma exports and plugin-UI Canvas pixel decoding.
 *
 * This is intentionally usable both by the manual "Compare 2 frames" action and by P5/P4
 * candidate transactions. A transaction therefore cannot accidentally use geometry-only P3.
 *
 * The UI broker is fail-closed: if it never returns pixel evidence, validation rejects after a
 * bounded timeout so a staged P4 candidate cannot remain stuck in VALIDATING indefinitely.
 */
export class FullFrameValidator {
  private sequence = 0;
  private readonly pending = new Map<number, PendingValidation>();

  constructor(
    private readonly postMessage: (message: PixelRequestMessage) => void,
    private readonly pixelBrokerTimeoutMs = DEFAULT_PIXEL_BROKER_TIMEOUT_MS,
  ) {
    if (!Number.isFinite(pixelBrokerTimeoutMs) || pixelBrokerTimeoutMs <= 0) {
      throw new Error('Pixel broker timeout must be a positive finite number.');
    }
  }

  async validate(before: FrameNode, after: FrameNode): Promise<FullFrameValidationResult> {
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

    this.sequence += 1;
    const validationId = this.sequence;
    const labels = { before: before.name, after: after.name };

    return new Promise<FullFrameValidationResult>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        const pending = this.pending.get(validationId);
        if (!pending) return;
        this.pending.delete(validationId);
        reject(new Error(`Pixel comparison timed out after ${this.pixelBrokerTimeoutMs} ms.`));
      }, this.pixelBrokerTimeoutMs);

      this.pending.set(validationId, {
        report,
        labels,
        renderScale,
        resolve,
        reject,
        timeoutHandle,
      });

      try {
        this.postMessage({
          type: 'validation-pixel-request',
          validationId,
          beforePng,
          afterPng,
          channelTolerance: DEFAULT_VALIDATION_THRESHOLDS.pixelChannelDelta,
        });
      } catch (error) {
        clearTimeout(timeoutHandle);
        this.pending.delete(validationId);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  finish(validationId: number, pixelMetrics: unknown): boolean {
    const pending = this.pending.get(validationId);
    if (!pending) return false;
    this.pending.delete(validationId);
    clearTimeout(pending.timeoutHandle);

    if (!isValidPixelDiffMetrics(pixelMetrics, pending.report.thresholds.pixelChannelDelta)) {
      pending.reject(new Error('Pixel comparison returned invalid or inconsistent metrics.'));
      return true;
    }

    const report = mergePixelValidation(pending.report, pixelMetrics);
    pending.resolve({ report, labels: pending.labels, renderScale: pending.renderScale });
    return true;
  }

  fail(validationId: number, message: string): boolean {
    const pending = this.pending.get(validationId);
    if (!pending) return false;
    this.pending.delete(validationId);
    clearTimeout(pending.timeoutHandle);
    pending.reject(new Error(`Pixel comparison failed: ${message}`));
    return true;
  }

  get pendingCount(): number {
    return this.pending.size;
  }
}
