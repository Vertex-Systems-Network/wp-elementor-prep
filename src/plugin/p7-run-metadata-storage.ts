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

  async load(): Promise<BatchRunMetadata> {
    try {
      return parseBatchRunMetadata(await this.storage.getAsync(this.key));
    } catch {
      return emptyBatchRunMetadata();
    }
  }

  async hydrateInputs(inputs: BatchQueueInput[]): Promise<BatchQueueInput[]> {
    const metadata = await this.load();
    return applyBatchRunMetadata(inputs, metadata);
  }

  async recordSuccessfulState(
    state: BatchQueueState,
    completedAt = new Date().toISOString(),
  ): Promise<BatchRunMetadata> {
    const current = await this.load();
    const next = recordSuccessfulBatchRun(current, state, completedAt, this.maxEntries);
    await this.storage.setAsync(this.key, next);
    return next;
  }
}

/** Production factory. Merely constructing the adapter performs no reads/writes. */
export function createFigmaP7RunMetadataStorage(maxEntries = 2000): P7RunMetadataStorage {
  return new P7RunMetadataStorage(figma.clientStorage, P7_BATCH_RUN_METADATA_STORAGE_KEY, maxEntries);
}
