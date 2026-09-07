import { captureIntegritySnapshot } from './integrity-snapshot';
import { DEFAULT_VALIDATION_THRESHOLDS, mergePixelValidation, validateIntegrity } from '../core/validator';
import type { PixelDiffMetrics, ValidationReport } from '../core/validation-types';

const MAX_VALIDATION_RENDER_DIMENSION = 2048;
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

  finish(validationId: number, pixelMetrics: PixelDiffMetrics): boolean {
    const pending = this.pending.get(validationId);
    if (!pending) return false;
    this.pending.delete(validationId);
    clearTimeout(pending.timeoutHandle);

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
