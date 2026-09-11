import {
  P13_RUNTIME_EVIDENCE_MAX_BYTES,
  P13_RUNTIME_EVIDENCE_STORAGE_KEY,
  serializeP13RuntimeEvidenceJson,
  utf8ByteLength,
  validateP13RuntimeEvidence,
  type P13RuntimeEvidenceBundle,
} from './p13-runtime-evidence';

export interface P13RuntimeEvidenceClientStorage {
  getAsync(key: string): Promise<unknown>;
  setAsync(key: string, value: unknown): Promise<void>;
  deleteAsync?(key: string): Promise<void>;
}

export interface P13RuntimeEvidencePersistenceResult {
  persisted: boolean;
  reason: string | null;
  byteLength: number;
}

const quarantinedEvidenceStores = new WeakSet<P13RuntimeEvidenceClientStorage>();

function byteLength(bundle: P13RuntimeEvidenceBundle): number {
  return utf8ByteLength(serializeP13RuntimeEvidenceJson(bundle));
}

function errorDetail(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * A new Audit must never leave an older valid evidence bundle looking current.
 * Quarantine is set before touching clientStorage, so even an invalidation failure
 * makes the current runtime session refuse the stale slot. Writing `null` first
 * also durably invalidates the previous slot before the fresh bundle is validated
 * and persisted.
 */
async function invalidatePriorP13RuntimeEvidence(
  storage: P13RuntimeEvidenceClientStorage,
): Promise<string | null> {
  quarantinedEvidenceStores.add(storage);
  try {
    await storage.setAsync(P13_RUNTIME_EVIDENCE_STORAGE_KEY, null);
    return null;
  } catch (error) {
    return `clientStorage stale-evidence invalidation failed: ${errorDetail(error)}`;
  }
}

export async function persistP13RuntimeEvidenceBestEffort(
  storage: P13RuntimeEvidenceClientStorage,
  bundle: P13RuntimeEvidenceBundle,
): Promise<P13RuntimeEvidencePersistenceResult> {
  const bytes = byteLength(bundle);
  const invalidationFailure = await invalidatePriorP13RuntimeEvidence(storage);
  if (invalidationFailure) {
    return { persisted: false, reason: invalidationFailure, byteLength: bytes };
  }

  const validation = validateP13RuntimeEvidence(bundle);
  if (!validation.valid) {
    return { persisted: false, reason: validation.reason, byteLength: bytes };
  }
  if (bytes > P13_RUNTIME_EVIDENCE_MAX_BYTES) {
    return {
      persisted: false,
      reason: `Evidence exceeds the ${P13_RUNTIME_EVIDENCE_MAX_BYTES}-byte bound.`,
      byteLength: bytes,
    };
  }
  try {
    await storage.setAsync(P13_RUNTIME_EVIDENCE_STORAGE_KEY, bundle);
    quarantinedEvidenceStores.delete(storage);
    return { persisted: true, reason: null, byteLength: bytes };
  } catch (error) {
    return {
      persisted: false,
      reason: `clientStorage write failed after stale evidence was invalidated: ${errorDetail(error)}`,
      byteLength: bytes,
    };
  }
}

export async function loadLatestP13RuntimeEvidence(
  storage: P13RuntimeEvidenceClientStorage,
): Promise<P13RuntimeEvidenceBundle | null> {
  if (quarantinedEvidenceStores.has(storage)) return null;

  let stored: unknown;
  try {
    stored = await storage.getAsync(P13_RUNTIME_EVIDENCE_STORAGE_KEY);
  } catch {
    return null;
  }
  const validation = validateP13RuntimeEvidence(stored);
  return validation.valid ? stored as P13RuntimeEvidenceBundle : null;
}
