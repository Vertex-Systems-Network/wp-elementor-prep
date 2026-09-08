import type {
  BatchCheckpointResolution,
  BatchQueueState,
} from '../core/batch-queue';
import type {
  P7RuntimeEvidenceRecorder,
  P7RuntimeEvidenceSnapshot,
} from '../core/batch-runtime-evidence';
import { createFigmaP7RuntimeEvidenceRecorder } from './p7-runtime-evidence';

export const P7_RUNTIME_EVIDENCE_STORAGE_KEY = 'pella-elementor-prep:p7-runtime-evidence-v1';

export interface P7EvidenceKeyValueStorage {
  getAsync(key: string): Promise<unknown>;
  setAsync(key: string, value: unknown): Promise<void>;
}

let activeFigmaRecorder: P7RuntimeEvidenceRecorder | null = null;

function looksLikeFreshQueue(state: BatchQueueState): boolean {
  return state.items.every((item) => item.attempts === 0)
    && !state.cancelRequested
    && !state.items.some((item) => item.status === 'RUNNING' || item.status === 'AWAITING_CHECKPOINT');
}

/**
 * Returns one recorder for the logical batch across pause/checkpoint/resume segments. A freshly
 * prepared queue starts a new evidence session even when its compatibility runKey matches a prior run.
 */
export function getOrCreateFigmaP7RuntimeEvidenceRecorder(state: BatchQueueState): P7RuntimeEvidenceRecorder {
  if (
    !activeFigmaRecorder
    || activeFigmaRecorder.runKey !== state.runKey
    || looksLikeFreshQueue(state)
  ) {
    activeFigmaRecorder = createFigmaP7RuntimeEvidenceRecorder(state.runKey);
  }
  return activeFigmaRecorder;
}

export function currentFigmaP7RuntimeEvidence(
  state?: BatchQueueState | null,
): P7RuntimeEvidenceSnapshot | null {
  if (!activeFigmaRecorder) return null;
  return activeFigmaRecorder.snapshot(state ?? null);
}

function isEvidenceSnapshot(value: unknown): value is P7RuntimeEvidenceSnapshot {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<P7RuntimeEvidenceSnapshot>;
  return candidate.schemaVersion === 1
    && typeof candidate.runKey === 'string'
    && typeof candidate.startedAt === 'string'
    && typeof candidate.elapsedMs === 'number'
    && Array.isArray(candidate.attempts)
    && Array.isArray(candidate.checkpointResolutions);
}

/** Read helper for a later UI/export surface. Unknown/corrupt evidence is ignored, never trusted. */
export async function loadLatestP7RuntimeEvidence(
  storage: P7EvidenceKeyValueStorage,
  key = P7_RUNTIME_EVIDENCE_STORAGE_KEY,
): Promise<P7RuntimeEvidenceSnapshot | null> {
  try {
    const stored = await storage.getAsync(key);
    return isEvidenceSnapshot(stored) ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Evidence persistence is observational only. Storage errors must never alter a completed/paused/
 * cancelled batch result, so this helper reports false instead of throwing.
 */
export async function persistP7RuntimeEvidenceBestEffort(
  storage: P7EvidenceKeyValueStorage,
  snapshot: P7RuntimeEvidenceSnapshot,
  key = P7_RUNTIME_EVIDENCE_STORAGE_KEY,
): Promise<boolean> {
  try {
    await storage.setAsync(key, snapshot);
    return true;
  } catch {
    return false;
  }
}

export function persistCurrentFigmaP7RuntimeEvidenceBestEffort(
  state: BatchQueueState,
): Promise<boolean> {
  const snapshot = currentFigmaP7RuntimeEvidence(state);
  if (!snapshot) return Promise.resolve(false);
  try {
    return persistP7RuntimeEvidenceBestEffort(figma.clientStorage, snapshot);
  } catch {
    // Keeps Node/unit contexts and unusual runtime failures observational rather than fatal.
    return Promise.resolve(false);
  }
}

/**
 * Records real restore/finalize decisions made outside the sequential runner. If no Figma evidence
 * session is active this is a no-op, which keeps generic/unit checkpoint composition side-effect free.
 */
export async function recordCurrentFigmaP7CheckpointResolutionBestEffort(
  resolution: BatchCheckpointResolution,
  before: BatchQueueState,
  after: BatchQueueState,
): Promise<void> {
  if (!activeFigmaRecorder) return;
  activeFigmaRecorder.markCheckpointResolution(resolution, before, after);
  await persistCurrentFigmaP7RuntimeEvidenceBestEffort(after);
}
