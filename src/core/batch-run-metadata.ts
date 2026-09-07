import type { BatchQueueInput, BatchQueueState } from './batch-queue';

export interface BatchRunMetadataEntry {
  runKey: string;
  completedAt: string;
}

export interface BatchRunMetadata {
  schemaVersion: 1;
  entries: Record<string, BatchRunMetadataEntry>;
}

export function emptyBatchRunMetadata(): BatchRunMetadata {
  return { schemaVersion: 1, entries: {} };
}

function validEntry(value: unknown): value is BatchRunMetadataEntry {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<BatchRunMetadataEntry>;
  return typeof candidate.runKey === 'string'
    && candidate.runKey.length > 0
    && typeof candidate.completedAt === 'string'
    && Number.isFinite(Date.parse(candidate.completedAt));
}

/**
 * Fail-closed parser for clientStorage/library persistence. Unknown schema versions and malformed
 * payloads return an empty metadata set; malformed individual entries are ignored.
 */
export function parseBatchRunMetadata(value: unknown): BatchRunMetadata {
  if (!value || typeof value !== 'object') return emptyBatchRunMetadata();
  const candidate = value as { schemaVersion?: unknown; entries?: unknown };
  if (candidate.schemaVersion !== 1 || !candidate.entries || typeof candidate.entries !== 'object') {
    return emptyBatchRunMetadata();
  }

  const entries: Record<string, BatchRunMetadataEntry> = {};
  for (const [frameId, entry] of Object.entries(candidate.entries as Record<string, unknown>)) {
    if (!frameId || !validEntry(entry)) continue;
    entries[frameId] = { runKey: entry.runKey, completedAt: entry.completedAt };
  }
  return { schemaVersion: 1, entries };
}

export function previousRunKeyForFrame(metadata: BatchRunMetadata, frameId: string): string | null {
  return metadata.entries[frameId]?.runKey ?? null;
}

/** Adds persisted run keys to queue inputs without changing caller ordering or frame identity. */
export function applyBatchRunMetadata(
  inputs: Array<Omit<BatchQueueInput, 'previousRunKey'> & { previousRunKey?: string | null }>,
  metadata: BatchRunMetadata,
): BatchQueueInput[] {
  return inputs.map((input) => ({
    ...input,
    previousRunKey: input.previousRunKey ?? previousRunKeyForFrame(metadata, input.frameId),
  }));
}

/**
 * Records only successfully processed frames. Failed/cancelled/pending frames must be retried and
 * therefore never receive the current run key. Storage is bounded by pruning the oldest records.
 */
export function recordSuccessfulBatchRun(
  metadata: BatchRunMetadata,
  state: BatchQueueState,
  completedAt = new Date().toISOString(),
  maxEntries = 2000,
): BatchRunMetadata {
  if (!Number.isFinite(Date.parse(completedAt))) {
    throw new Error('completedAt must be a valid ISO-compatible date string.');
  }
  if (!Number.isInteger(maxEntries) || maxEntries < 1) {
    throw new Error('maxEntries must be a positive integer.');
  }

  const entries: Record<string, BatchRunMetadataEntry> = { ...metadata.entries };
  for (const item of state.items) {
    if (item.status !== 'SUCCEEDED') continue;
    entries[item.frameId] = { runKey: state.runKey, completedAt };
  }

  const ordered = Object.entries(entries)
    .sort((a, b) => Date.parse(b[1].completedAt) - Date.parse(a[1].completedAt));
  const bounded = Object.fromEntries(ordered.slice(0, maxEntries));
  return { schemaVersion: 1, entries: bounded };
}
