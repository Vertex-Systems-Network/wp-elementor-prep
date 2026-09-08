import {
  P7RuntimeEvidenceRecorder,
  type P7RuntimeEvidenceOptions,
  type P7RuntimeMemorySampler,
} from '../core/batch-runtime-evidence';
import { P7_BUILD_IDENTITY } from './build-info';

interface PerformanceMemoryLike {
  usedJSHeapSize?: unknown;
}

interface PerformanceWithOptionalMemory {
  memory?: PerformanceMemoryLike;
}

/**
 * Best-effort Figma plugin heap sampler. Chromium-like runtimes may expose performance.memory;
 * environments that do not expose it return null and evidence remains explicitly unsupported.
 */
export const sampleFigmaUsedJsHeapBytes: P7RuntimeMemorySampler = () => {
  const performanceLike = (globalThis as unknown as { performance?: PerformanceWithOptionalMemory }).performance;
  const value = performanceLike?.memory?.usedJSHeapSize;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
};

export function createFigmaP7RuntimeEvidenceRecorder(
  runKey: string,
  options: Omit<P7RuntimeEvidenceOptions, 'memorySampler'> & { memorySampler?: P7RuntimeMemorySampler } = {},
): P7RuntimeEvidenceRecorder {
  return new P7RuntimeEvidenceRecorder(runKey, {
    ...options,
    buildIdentity: options.buildIdentity ?? P7_BUILD_IDENTITY,
    memorySampler: options.memorySampler ?? sampleFigmaUsedJsHeapBytes,
  });
}
