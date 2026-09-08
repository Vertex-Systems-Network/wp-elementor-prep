import type { P5RuntimeEvidenceBundle } from './p5-runtime-evidence';

export const P5_RUNTIME_EVIDENCE_STORAGE_KEY = 'pella-elementor-prep:p5-runtime-evidence-v1';

export interface P5EvidenceKeyValueStorage {
  getAsync(key: string): Promise<unknown>;
  setAsync(key: string, value: unknown): Promise<void>;
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function pixelValue(value: unknown): boolean {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
}

function booleanFields(value: Record<string, unknown>, names: string[]): boolean {
  return names.every((name) => typeof value[name] === 'boolean');
}

function isCalibrationResult(value: unknown): boolean {
  const calibration = objectValue(value);
  if (!calibration) return false;
  const forcedReject = objectValue(calibration.forcedReject);
  const passRestore = objectValue(calibration.passRestore);
  const passFinalize = objectValue(calibration.passFinalize);
  if (!forcedReject || !passRestore || !passFinalize) return false;

  return calibration.schemaVersion === 1
    && typeof calibration.passed === 'boolean'
    && typeof calibration.leftovers === 'number'
    && Number.isInteger(calibration.leftovers)
    && calibration.leftovers >= 0
    && typeof forcedReject.state === 'string'
    && booleanFields(forcedReject, [
      'validationRejected',
      'pixelEvidenceReturned',
      'candidateDeleted',
      'originalUntouched',
    ])
    && pixelValue(forcedReject.changedPixelPct)
    && typeof passRestore.state === 'string'
    && booleanFields(passRestore, [
      'validationPassed',
      'pixelEvidenceReturned',
      'committed',
      'restored',
      'checkpointCleared',
    ])
    && pixelValue(passRestore.changedPixelPct)
    && typeof passFinalize.state === 'string'
    && booleanFields(passFinalize, [
      'validationPassed',
      'pixelEvidenceReturned',
      'committed',
      'finalized',
      'candidateRetained',
      'originalDiscarded',
      'checkpointCleared',
    ])
    && pixelValue(passFinalize.changedPixelPct);
}

function isEvidenceBundle(value: unknown): value is P5RuntimeEvidenceBundle {
  const candidate = objectValue(value);
  if (!candidate) return false;
  const acceptance = objectValue(candidate.acceptance);
  if (!acceptance || typeof acceptance.accepted !== 'boolean' || !Array.isArray(acceptance.failures)) return false;
  if (!acceptance.failures.every((failure) => typeof failure === 'string')) return false;

  const proofTimestampValid = acceptance.accepted
    ? typeof candidate.runtimeProofPassedAt === 'string'
    : candidate.runtimeProofPassedAt === null;

  return candidate.schemaVersion === 1
    && typeof candidate.capturedAt === 'string'
    && typeof candidate.pluginVersion === 'string'
    && typeof candidate.runtimeGateVersion === 'string'
    && proofTimestampValid
    && isCalibrationResult(candidate.calibration);
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
