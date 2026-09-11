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

function byteLength(bundle: P13RuntimeEvidenceBundle): number {
  return utf8ByteLength(serializeP13RuntimeEvidenceJson(bundle));
}

export async function persistP13RuntimeEvidenceBestEffort(
  storage: P13RuntimeEvidenceClientStorage,
  bundle: P13RuntimeEvidenceBundle,
): Promise<P13RuntimeEvidencePersistenceResult> {
  const validation = validateP13RuntimeEvidence(bundle);
  const bytes = byteLength(bundle);
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
    return { persisted: true, reason: null, byteLength: bytes };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { persisted: false, reason: `clientStorage write failed: ${detail}`, byteLength: bytes };
  }
}

export async function loadLatestP13RuntimeEvidence(
  storage: P13RuntimeEvidenceClientStorage,
): Promise<P13RuntimeEvidenceBundle | null> {
  let stored: unknown;
  try {
    stored = await storage.getAsync(P13_RUNTIME_EVIDENCE_STORAGE_KEY);
  } catch {
    return null;
  }
  const validation = validateP13RuntimeEvidence(stored);
  return validation.valid ? stored as P13RuntimeEvidenceBundle : null;
}
