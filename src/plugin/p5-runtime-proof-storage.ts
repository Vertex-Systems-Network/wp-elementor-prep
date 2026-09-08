import {
  createP5RuntimeProof,
  isTraceableP5RuntimeBuildIdentity,
  P5_RUNTIME_PROOF_STORAGE_KEY,
  type P5RuntimeBuildIdentity,
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
 * Production proof is minted only after every reject/restore/finalize/pixel/cleanup invariant
 * independently passes and the running plugin is bound to a traceable CI artifact.
 */
export async function updateP5RuntimeProofFromCalibration(
  storage: P5RuntimeProofStorage,
  result: P5RuntimeCalibrationResult,
  build: P5RuntimeBuildIdentity,
): Promise<P5RuntimeAcceptanceAssessment> {
  const calibrationAssessment = assessP5RuntimeAcceptance(result);
  const failures = [...calibrationAssessment.failures];
  if (!isTraceableP5RuntimeBuildIdentity(build)) {
    failures.push('P5 runtime self-test build is not bound to a traceable CI artifact.');
  }

  const assessment: P5RuntimeAcceptanceAssessment = {
    accepted: failures.length === 0,
    failures,
  };

  if (assessment.accepted) {
    await storage.setAsync(P5_RUNTIME_PROOF_STORAGE_KEY, createP5RuntimeProof(build));
  } else {
    await storage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
  }

  return assessment;
}
