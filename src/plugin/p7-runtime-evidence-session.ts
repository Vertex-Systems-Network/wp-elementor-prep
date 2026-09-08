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
export const P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY = 'pella-elementor-prep:p7-runtime-evidence-stress-v1';
export const P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY = 'pella-elementor-prep:p7-runtime-evidence-cancellation-v1';

export interface P7EvidenceKeyValueStorage {
  getAsync(key: string): Promise<unknown>;
  setAsync(key: string, value: unknown): Promise<void>;
}

export interface P7StoredRuntimeAcceptanceEvidence {
  stress: P7RuntimeEvidenceSnapshot | null;
  cancellation: P7RuntimeEvidenceSnapshot | null;
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

function isStressAcceptanceScenario(snapshot: P7RuntimeEvidenceSnapshot): boolean {
  return snapshot.finalStatus === 'COMPLETED'
    && typeof snapshot.finalTotalCount === 'number'
    && snapshot.finalTotalCount >= 60
    && snapshot.finalFinishedCount === snapshot.finalTotalCount;
}

function isActiveFrameCancellationScenario(snapshot: P7RuntimeEvidenceSnapshot): boolean {
  return snapshot.finalStatus === 'CANCELLED'
    && snapshot.cancellation?.activeFrameIdAtRequest !== null
    && snapshot.cancellation?.activeFrameIdAtRequest !== undefined;
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
 * Loads the latest captured scenario for each real-runtime P7 acceptance gate. Slots are independent
 * so a cancellation smoke cannot erase a prior 60+ Frame stress run (and vice versa).
 */
export async function loadP7RuntimeAcceptanceEvidence(
  storage: P7EvidenceKeyValueStorage,
): Promise<P7StoredRuntimeAcceptanceEvidence> {
  const [stress, cancellation] = await Promise.all([
    loadLatestP7RuntimeEvidence(storage, P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY),
    loadLatestP7RuntimeEvidence(storage, P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY),
  ]);
  return { stress, cancellation };
}

/**
 * Evidence persistence is observational only. The legacy/latest slot is always written first.
 * When using the canonical key, qualifying acceptance scenarios are also retained in independent
 * bounded slots. Custom-key callers preserve the original single-write behavior.
 *
 * Storage errors must never alter a completed/paused/cancelled batch result, so this helper reports
 * false instead of throwing. A false result may occur after the latest slot was already updated.
 */
export async function persistP7RuntimeEvidenceBestEffort(
  storage: P7EvidenceKeyValueStorage,
  snapshot: P7RuntimeEvidenceSnapshot,
  key = P7_RUNTIME_EVIDENCE_STORAGE_KEY,
): Promise<boolean> {
  try {
    await storage.setAsync(key, snapshot);

    if (key === P7_RUNTIME_EVIDENCE_STORAGE_KEY) {
      if (isStressAcceptanceScenario(snapshot)) {
        await storage.setAsync(P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY, snapshot);
      }
      if (isActiveFrameCancellationScenario(snapshot)) {
        await storage.setAsync(P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY, snapshot);
      }
    }

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
