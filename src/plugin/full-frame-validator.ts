import { captureIntegritySnapshot } from './integrity-snapshot';
import { DEFAULT_VALIDATION_THRESHOLDS, mergePixelValidation, mergeTiledPixelValidation, validateIntegrity } from '../core/validator';
import type { PixelSectionBudget, TiledPixelDiffMetrics } from '../core/pixel-diff';
import type { PixelDiffMetrics, ValidationReport } from '../core/validation-types';

const MAX_VALIDATION_RENDER_DIMENSION = 2048;
const MAX_VALIDATION_PIXELS = MAX_VALIDATION_RENDER_DIMENSION * MAX_VALIDATION_RENDER_DIMENSION;
export const DEFAULT_PIXEL_BROKER_TIMEOUT_MS = 30_000;
/** Recovery M5.4: full-resolution limits (scale 1, never downscaled). Larger frames fail closed. */
export const MAX_FULL_RESOLUTION_DIMENSION = 16_384;
export const MAX_FULL_RESOLUTION_PIXELS = 64 * 1024 * 1024;
export const FULL_RESOLUTION_TILE_SIZE = 512;
export const FULL_RESOLUTION_TOO_LARGE_CODE = 'P3_FULL_RESOLUTION_TOO_LARGE' as const;
export const PIXEL_BROKER_UNAVAILABLE_CODE = 'P3_PIXEL_BROKER_UNAVAILABLE' as const;

/** Structured fail-fast error: the plugin UI that decodes pixels is not the active UI surface. */
export class PixelBrokerUnavailableError extends Error {
  readonly code = PIXEL_BROKER_UNAVAILABLE_CODE;

  constructor(detail: string) {
    super(`Pixel comparison is unavailable: ${detail}`);
    this.name = 'PixelBrokerUnavailableError';
  }
}

const BROKER_UNAVAILABLE_DETAIL = 'the main plugin panel (which decodes pixels) is not active because a viewer replaced it. Close the viewer, reopen the plugin and retry; nothing was committed.';

export interface FullFrameValidationResult {
  report: ValidationReport;
  labels: { before: string; after: string };
  renderScale: number;
}

interface PendingValidation {
  /** Full-resolution tiled request (M5.4): the answer must be tiled metrics for these sections. */
  tiled?: { sections: PixelSectionBudget[] };
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
  tiled?: { tileSize: number; sections: PixelSectionBudget[]; maxChangedPct: number };
}

export interface FullResolutionValidationResult extends FullFrameValidationResult {
  tiled: TiledPixelDiffMetrics;
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

function validTiledMetrics(value: unknown, sections: readonly PixelSectionBudget[], channelTolerance: number): value is TiledPixelDiffMetrics {
  if (!isRecord(value) || !isRecord(value.metrics) || typeof value.pass !== 'boolean' || !Array.isArray(value.sections)) return false;
  const metrics = value.metrics;
  const dims = [metrics.widthBefore, metrics.heightBefore, metrics.widthAfter, metrics.heightAfter];
  if (!dims.every((entry) => isIntegerInRange(entry, 0, MAX_FULL_RESOLUTION_DIMENSION))) return false;
  if (!isIntegerInRange(metrics.totalPixels, 0, MAX_FULL_RESOLUTION_PIXELS) || !isIntegerInRange(metrics.changedPixels, 0, MAX_FULL_RESOLUTION_PIXELS)) return false;
  if (metrics.channelTolerance !== channelTolerance || typeof metrics.sameDimensions !== 'boolean') return false;
  if (!isFiniteNumberInRange(metrics.changedPixelPct, 0, 100) || !isFiniteNumberInRange(metrics.meanChannelDelta, 0, 255)) return false;
  if ((metrics.changedPixels as number) > (metrics.totalPixels as number) && metrics.sameDimensions) return false;
  return value.sections.length === sections.length && value.sections.every((entry, index) => isRecord(entry)
    && entry.id === sections[index]!.id && typeof entry.pass === 'boolean' && isFiniteNumberInRange(entry.changedPct, 0, 100)
    && entry.maxChangedPct === sections[index]!.maxChangedPct);
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
    /** Whether the UI surface that answers pixel requests is active; checked before and after export. */
    private readonly isBrokerAvailable: () => boolean = () => true,
  ) {
    if (!Number.isFinite(pixelBrokerTimeoutMs) || pixelBrokerTimeoutMs <= 0) {
      throw new Error('Pixel broker timeout must be a positive finite number.');
    }
  }

  async validate(before: FrameNode, after: FrameNode): Promise<FullFrameValidationResult> {
    if (!this.isBrokerAvailable()) throw new PixelBrokerUnavailableError(BROKER_UNAVAILABLE_DETAIL);
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

    if (!this.isBrokerAvailable()) throw new PixelBrokerUnavailableError(BROKER_UNAVAILABLE_DETAIL);

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

  /**
   * Recovery M5.4: full-resolution validation — both frames rendered at scale 1 (never downscaled) and compared in
   * 512 px tiles with a budget per section (e.g. each top-level child). A frame beyond the full-resolution limits
   * fails closed instead of being downscaled.
   */
  async validateFullResolution(before: FrameNode, after: FrameNode, sections: PixelSectionBudget[]): Promise<FullResolutionValidationResult> {
    if (!this.isBrokerAvailable()) throw new PixelBrokerUnavailableError(BROKER_UNAVAILABLE_DETAIL);
    const largest = Math.max(before.width, before.height, after.width, after.height);
    const area = Math.max(before.width * before.height, after.width * after.height);
    if (largest > MAX_FULL_RESOLUTION_DIMENSION || area > MAX_FULL_RESOLUTION_PIXELS) {
      throw new Error(`${FULL_RESOLUTION_TOO_LARGE_CODE}: ${Math.ceil(before.width)}x${Math.ceil(before.height)} exceeds the full-resolution validation limit; nothing was committed.`);
    }
    const report = validateIntegrity(captureIntegritySnapshot(before), captureIntegritySnapshot(after), DEFAULT_VALIDATION_THRESHOLDS);
    const exportSettings: ExportSettingsImage = { format: 'PNG', constraint: { type: 'SCALE', value: 1 } };
    const [beforePng, afterPng] = await Promise.all([before.exportAsync(exportSettings), after.exportAsync(exportSettings)]);
    if (!this.isBrokerAvailable()) throw new PixelBrokerUnavailableError(BROKER_UNAVAILABLE_DETAIL);
    this.sequence += 1;
    const validationId = this.sequence;
    const labels = { before: before.name, after: after.name };
    return new Promise<FullResolutionValidationResult>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        if (!this.pending.delete(validationId)) return;
        reject(new Error(`Pixel comparison timed out after ${this.pixelBrokerTimeoutMs} ms.`));
      }, this.pixelBrokerTimeoutMs);
      this.pending.set(validationId, { tiled: { sections }, report, labels, renderScale: 1,
        resolve: resolve as (result: FullFrameValidationResult) => void, reject, timeoutHandle });
      try {
        this.postMessage({ type: 'validation-pixel-request', validationId, beforePng, afterPng,
          channelTolerance: DEFAULT_VALIDATION_THRESHOLDS.pixelChannelDelta,
          tiled: { tileSize: FULL_RESOLUTION_TILE_SIZE, sections, maxChangedPct: DEFAULT_VALIDATION_THRESHOLDS.maxChangedPixelPct } });
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

    if (pending.tiled) {
      if (!validTiledMetrics(pixelMetrics, pending.tiled.sections, pending.report.thresholds.pixelChannelDelta)) {
        pending.reject(new Error('Full-resolution tiled comparison returned invalid or inconsistent metrics.'));
        return true;
      }
      const report = mergeTiledPixelValidation(pending.report, pixelMetrics);
      (pending.resolve as (result: FullResolutionValidationResult) => void)({ report, labels: pending.labels, renderScale: 1, tiled: pixelMetrics });
      return true;
    }

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

  /**
   * Reject every in-flight validation immediately, e.g. when the broker UI is replaced by a viewer.
   * Without this, each pending candidate would wait for the full broker timeout before failing.
   */
  failAllPending(detail = BROKER_UNAVAILABLE_DETAIL): number {
    const entries = [...this.pending.entries()];
    this.pending.clear();
    for (const [, pending] of entries) {
      clearTimeout(pending.timeoutHandle);
      pending.reject(new PixelBrokerUnavailableError(detail));
    }
    return entries.length;
  }

  get pendingCount(): number {
    return this.pending.size;
  }
}
