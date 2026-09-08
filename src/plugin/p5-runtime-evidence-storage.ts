import type { P5RuntimeEvidenceBundle } from './p5-runtime-evidence';

export const P5_RUNTIME_EVIDENCE_STORAGE_KEY = 'pella-elementor-prep:p5-runtime-evidence-v1';

export interface P5EvidenceKeyValueStorage {
  getAsync(key: string): Promise<unknown>;
  setAsync(key: string, value: unknown): Promise<void>;
}

function isEvidenceBundle(value: unknown): value is P5RuntimeEvidenceBundle {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<P5RuntimeEvidenceBundle>;
  return candidate.schemaVersion === 1
    && typeof candidate.capturedAt === 'string'
    && typeof candidate.pluginVersion === 'string'
    && typeof candidate.runtimeGateVersion === 'string'
    && (candidate.runtimeProofPassedAt === null || typeof candidate.runtimeProofPassedAt === 'string')
    && Boolean(candidate.acceptance)
    && typeof candidate.acceptance?.accepted === 'boolean'
    && Array.isArray(candidate.acceptance?.failures)
    && Boolean(candidate.calibration)
    && candidate.calibration?.schemaVersion === 1;
}

/** Unknown/corrupt stored evidence is ignored rather than guessed. */
export async function loadLatestP5RuntimeEvidence(
  storage: P5EvidenceKeyValueStorage,
  key = P5_RUNTIME_EVIDENCE_STORAGE_KEY,
): Promise<P5RuntimeEvidenceBundle | null> {
  try {
    const stored = await storage.getAsync(key);
    return isEvidenceBundle(stored) ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Evidence persistence is observational only. A storage failure must never change proof minting,
 * mutation eligibility or transaction outcome.
 */
export async function persistP5RuntimeEvidenceBestEffort(
  storage: P5EvidenceKeyValueStorage,
  evidence: P5RuntimeEvidenceBundle,
  key = P5_RUNTIME_EVIDENCE_STORAGE_KEY,
): Promise<boolean> {
  try {
    await storage.setAsync(key, evidence);
    return true;
  } catch {
    return false;
  }
}
