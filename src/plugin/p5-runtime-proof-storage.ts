import {
  createP5RuntimeProof,
  P5_RUNTIME_PROOF_STORAGE_KEY,
} from '../core/p5-runtime-gate';
import type { P5RuntimeCalibrationResult } from './p5-runtime-calibration';
import {
  assessP5RuntimeAcceptance,
  type P5RuntimeAcceptanceAssessment,
} from './p5-runtime-acceptance';

export interface P5RuntimeProofStorage {
  setAsync(key: string, value: unknown): Promise<void>;
  deleteAsync(key: string): Promise<void>;
}

/**
 * The compiled self-test may report an overall boolean, but production proof is minted only after
 * the stricter deterministic assessor verifies every required reject/restore/finalize/pixel/cleanup
 * invariant independently. Any inconsistency deletes the local proof and keeps mutation locked.
 */
export async function updateP5RuntimeProofFromCalibration(
  storage: P5RuntimeProofStorage,
  result: P5RuntimeCalibrationResult,
): Promise<P5RuntimeAcceptanceAssessment> {
  const assessment = assessP5RuntimeAcceptance(result);

  if (assessment.accepted) {
    await storage.setAsync(P5_RUNTIME_PROOF_STORAGE_KEY, createP5RuntimeProof());
  } else {
    await storage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
  }

  return assessment;
}
