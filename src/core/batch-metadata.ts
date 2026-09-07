export interface BatchProcessingRecord {
  schemaVersion: 1;
  frameId: string;
  runKey: string;
  finalizedAt: string;
}

export interface BatchProcessingMetadata {
  schemaVersion: 1;
  records: Record<string, BatchProcessingRecord>;
}

export interface BatchMetadataStorage {
  get(): Promise<unknown>;
  set(value: BatchProcessingMetadata): Promise<void>;
}

export const EMPTY_BATCH_PROCESSING_METADATA: BatchProcessingMetadata = {
  schemaVersion: 1,
  records: {},
};

function isRecord(value: unknown): value is BatchProcessingRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Partial<BatchProcessingRecord>;
  return record.schemaVersion === 1
    && typeof record.frameId === 'string'
    && record.frameId.length > 0
    && typeof record.runKey === 'string'
    && record.runKey.length > 0
    && typeof record.finalizedAt === 'string'
    && record.finalizedAt.length > 0;
}

/**
 * Fail-closed parser for persisted batch metadata. Unknown schema versions or malformed entries are
 * ignored rather than being trusted to skip processing in a newer plugin build.
 */
export function parseBatchProcessingMetadata(value: unknown): BatchProcessingMetadata {
  if (typeof value !== 'object' || value === null) return { ...EMPTY_BATCH_PROCESSING_METADATA, records: {} };
  const metadata = value as { schemaVersion?: unknown; records?: unknown };
  if (metadata.schemaVersion !== 1 || typeof metadata.records !== 'object' || metadata.records === null) {
    return { ...EMPTY_BATCH_PROCESSING_METADATA, records: {} };
  }

  const records: Record<string, BatchProcessingRecord> = {};
  for (const [frameId, candidate] of Object.entries(metadata.records)) {
    if (!isRecord(candidate) || candidate.frameId !== frameId) continue;
    records[frameId] = { ...candidate };
  }
  return { schemaVersion: 1, records };
}

export function previousRunKeyForFrame(metadata: BatchProcessingMetadata, frameId: string): string | null {
  return metadata.records[frameId]?.runKey ?? null;
}

/**
 * Records only finalized successful processing. Callers must never invoke this for a merely committed
 * checkpoint or a restored checkpoint, otherwise a future queue could incorrectly skip the frame.
 */
export function markBatchFrameFinalized(
  metadata: BatchProcessingMetadata,
  frameId: string,
  runKey: string,
  finalizedAt = new Date().toISOString(),
): BatchProcessingMetadata {
  if (!frameId || !runKey) return parseBatchProcessingMetadata(metadata);
  return {
    schemaVersion: 1,
    records: {
      ...metadata.records,
      [frameId]: {
        schemaVersion: 1,
        frameId,
        runKey,
        finalizedAt,
      },
    },
  };
}

export function removeBatchFrameMetadata(
  metadata: BatchProcessingMetadata,
  frameId: string,
): BatchProcessingMetadata {
  const records = { ...metadata.records };
  delete records[frameId];
  return { schemaVersion: 1, records };
}

/**
 * Small persistence facade with schema validation on every read. Storage implementations can be
 * Figma clientStorage, tests, or a future project-level metadata adapter.
 */
export class BatchMetadataRepository {
  constructor(private readonly storage: BatchMetadataStorage) {}

  async read(): Promise<BatchProcessingMetadata> {
    return parseBatchProcessingMetadata(await this.storage.get());
  }

  async finalized(frameId: string, runKey: string, finalizedAt?: string): Promise<BatchProcessingMetadata> {
    const current = await this.read();
    const next = markBatchFrameFinalized(current, frameId, runKey, finalizedAt);
    await this.storage.set(next);
    return next;
  }

  async clearFrame(frameId: string): Promise<BatchProcessingMetadata> {
    const current = await this.read();
    const next = removeBatchFrameMetadata(current, frameId);
    await this.storage.set(next);
    return next;
  }
}
