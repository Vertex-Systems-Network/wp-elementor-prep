import { createBatchQueue, type BatchQueueInput, type BatchQueueState } from '../core/batch-queue';
import { createBatchRunKey } from '../core/batch-run-key';
import type { P7RuntimeBuildIdentity } from '../core/batch-runtime-evidence';
import type { BatchFrameProcessor } from '../core/batch-runner';
import { P5_RUNTIME_GATE_VERSION } from '../core/p5-runtime-gate';
import { P7_BUILD_IDENTITY } from './build-info';
import { isTraceableP7BuildIdentity } from './p7-build-identity';
import { runP7BatchRuntime, type P7BatchRuntimeOptions } from './p7-batch-runtime';
import {
  createFigmaP7SingleFrameProcessor,
} from './p7-single-frame-processor';
import {
  createFigmaP7RunMetadataStorage,
  type P7RunMetadataStorage,
} from './p7-run-metadata-storage';
import {
  getOrCreateFigmaP7RuntimeEvidenceRecorder,
  persistCurrentFigmaP7RuntimeEvidenceBestEffort,
} from './p7-runtime-evidence-session';
import type { FullP3Validator } from './safe-fix-runtime';

export const P7_SAFE_RECIPE_SCHEMA_VERSION = 1;
export const P7_BATCH_SCHEMA_VERSION = 1;

export interface P7BatchMetadataStore {
  hydrateInputs(inputs: BatchQueueInput[]): Promise<BatchQueueInput[]>;
  recordSuccessfulState(state: BatchQueueState, completedAt?: string): Promise<unknown>;
}

export interface P7BatchPreparationOptions {
  /**
   * Production defaults to the compiled identity. `null` is an explicit generic/test mode that
   * preserves legacy metadata hydration without claiming build traceability.
   */
  buildIdentity?: P7RuntimeBuildIdentity | null;
}

export function createP7RunKey(pluginVersion: string, buildSourceSha?: string | null): string {
  return createBatchRunKey({
    pluginVersion,
    safeRecipeSchemaVersion: P7_SAFE_RECIPE_SCHEMA_VERSION,
    batchSchemaVersion: P7_BATCH_SCHEMA_VERSION,
    runtimeProofVersion: P5_RUNTIME_GATE_VERSION,
    ...(buildSourceSha ? { buildSourceSha } : {}),
  });
}

/**
 * Hydrates finalized-frame run keys before queue construction. Production traceable builds include
 * source SHA in the run key so a new artifact always re-audits prior successes. Local/untraceable
 * production builds deliberately ignore durable skip metadata rather than trusting a stale result.
 */
export async function prepareP7BatchQueue(
  inputs: BatchQueueInput[],
  pluginVersion: string,
  metadata: P7BatchMetadataStore,
  options: P7BatchPreparationOptions = {},
): Promise<BatchQueueState> {
  const build = options.buildIdentity === undefined ? P7_BUILD_IDENTITY : options.buildIdentity;
  const traceableBuild = isTraceableP7BuildIdentity(build);
  const runKey = createP7RunKey(pluginVersion, traceableBuild ? build.sourceSha : null);

  if (build && !traceableBuild) {
    const freshInputs = inputs.map(({ frameId, frameName }) => ({ frameId, frameName }));
    return createBatchQueue(freshInputs, runKey);
  }

  const hydrated = await metadata.hydrateInputs(inputs);
  return createBatchQueue(hydrated, runKey);
}

/** Writes only when at least one frame is durably SUCCEEDED; unresolved checkpoints never persist. */
export async function persistP7DurableSuccesses(
  state: BatchQueueState,
  metadata: P7BatchMetadataStore,
  completedAt?: string,
): Promise<void> {
  if (!state.items.some((item) => item.status === 'SUCCEEDED')) return;
  await metadata.recordSuccessfulState(state, completedAt);
}

/**
 * Generic lifecycle wrapper: run the sequential runtime, then persist any durable successes reached
 * before completion/pause/cancel. This remains testable without Figma globals.
 */
export async function runP7BatchLifecycle(
  initialState: BatchQueueState,
  processFrame: BatchFrameProcessor,
  metadata: P7BatchMetadataStore,
  options: P7BatchRuntimeOptions = {},
): Promise<BatchQueueState> {
  const state = await runP7BatchRuntime(initialState, processFrame, options);
  await persistP7DurableSuccesses(state, metadata);
  return state;
}

/**
 * Production lifecycle using the canonical P5-backed Figma single-frame processor.
 *
 * Real Figma runs are automatically observed by a bounded evidence recorder unless a caller injects
 * one explicitly. The latest snapshot is stored best-effort after each segment; evidence persistence
 * can never turn an otherwise valid batch result into a failure.
 */
export async function runFigmaP7BatchLifecycle(
  initialState: BatchQueueState,
  validateFullP3: FullP3Validator,
  metadata: P7BatchMetadataStore = createFigmaP7RunMetadataStorage(),
  options: P7BatchRuntimeOptions = {},
): Promise<BatchQueueState> {
  const evidenceRecorder = options.evidenceRecorder
    ?? getOrCreateFigmaP7RuntimeEvidenceRecorder(initialState);
  const state = await runP7BatchLifecycle(
    initialState,
    createFigmaP7SingleFrameProcessor(validateFullP3),
    metadata,
    { ...options, evidenceRecorder },
  );

  // Deliberately ignore evidence-storage failure. Runtime evidence is observational only.
  await persistCurrentFigmaP7RuntimeEvidenceBestEffort(state);
  return state;
}

export function createDefaultFigmaP7MetadataStore(maxEntries = 2000): P7RunMetadataStorage {
  return createFigmaP7RunMetadataStorage(maxEntries);
}
