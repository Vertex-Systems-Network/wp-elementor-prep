import {
  applyBatchRunMetadata,
  emptyBatchRunMetadata,
  parseBatchRunMetadata,
  recordSuccessfulBatchRun,
  type BatchRunMetadata,
} from '../core/batch-run-metadata';
import type { BatchQueueInput, BatchQueueState } from '../core/batch-queue';

export const P7_BATCH_RUN_METADATA_STORAGE_KEY = 'pella-elementor-prep:p7-batch-run-metadata-v1';

export interface AsyncKeyValueStorage {
  getAsync(key: string): Promise<unknown>;
  setAsync(key: string, value: unknown): Promise<void>;
}

function sameMetadata(left: BatchRunMetadata, right: BatchRunMetadata): boolean {
  const leftKeys = Object.keys(left.entries);
  const rightKeys = Object.keys(right.entries);
  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((frameId) => {
    const a = left.entries[frameId];
    const b = right.entries[frameId];
    return Boolean(a && b && a.runKey === b.runKey && a.completedAt === b.completedAt);
  });
}

function parseWritableMetadata(value: unknown): BatchRunMetadata {
  // figma.clientStorage returns undefined for an absent key. That is the only implicit empty state
  // that the write path may create from. Any present unknown/malformed envelope is preserved.
  if (value === undefined) return emptyBatchRunMetadata();
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('P7 run metadata is malformed; refusing to overwrite an unknown stored payload.');
  }

  const candidate = value as { schemaVersion?: unknown; entries?: unknown };
  if (
    candidate.schemaVersion !== 1
    || !candidate.entries
    || typeof candidate.entries !== 'object'
    || Array.isArray(candidate.entries)
  ) {
    throw new Error('P7 run metadata schema is unsupported or malformed; refusing to overwrite it.');
  }

  return parseBatchRunMetadata(value);
}

/**
 * Storage adapter kept separate from the queue core. It persists only compact successful-run
 * metadata and never stores AuditNode trees, candidate nodes, PNG bytes or validation reports.
 */
export class P7RunMetadataStorage {
  constructor(
    private readonly storage: AsyncKeyValueStorage,
    private readonly key = P7_BATCH_RUN_METADATA_STORAGE_KEY,
    private readonly maxEntries = 2000,
  ) {}

  private async loadStrict(): Promise<BatchRunMetadata> {
    return parseWritableMetadata(await this.storage.getAsync(this.key));
  }

  /**
   * Read-side hydration fails closed to an empty view. This can cause a safe re-audit, but never a
   * skipped frame based on unknown/corrupt metadata.
   */
  async load(): Promise<BatchRunMetadata> {
    try {
      return await this.loadStrict();
    } catch {
      return emptyBatchRunMetadata();
    }
  }

  async hydrateInputs(inputs: BatchQueueInput[]): Promise<BatchQueueInput[]> {
    const metadata = await this.load();
    return applyBatchRunMetadata(inputs, metadata);
  }

  /**
   * Write-side persistence is stricter than hydration. Storage I/O failure, unknown schema or a
   * malformed stored envelope is propagated and no write is attempted. Replacing unknown existing
   * metadata with an empty-derived snapshot could erase prior or forward-version success records.
   */
  async recordSuccessfulState(
    state: BatchQueueState,
    completedAt = new Date().toISOString(),
  ): Promise<BatchRunMetadata> {
    const current = await this.loadStrict();
    const next = recordSuccessfulBatchRun(current, state, completedAt, this.maxEntries);
    if (!sameMetadata(current, next)) {
      await this.storage.setAsync(this.key, next);
    }
    return next;
  }
}

/** Production factory. Merely constructing the adapter performs no reads/writes. */
export function createFigmaP7RunMetadataStorage(maxEntries = 2000): P7RunMetadataStorage {
  return new P7RunMetadataStorage(figma.clientStorage, P7_BATCH_RUN_METADATA_STORAGE_KEY, maxEntries);
}
