import {
  createP5RuntimeProof,
  P5_RUNTIME_PROOF_STORAGE_KEY,
} from '../core/p5-runtime-gate';
import { P7_BUILD_IDENTITY } from './build-info';
import type { P5RuntimeCalibrationResult } from './p5-runtime-calibration';
import {
  assessP5RuntimeAcceptance,
  type P5RuntimeAcceptanceAssessment,
} from './p5-runtime-acceptance';
import { isTraceableP7BuildIdentity } from './p7-build-identity';
import {
  createP7P5BuildProofReceipt,
  P7_P5_BUILD_PROOF_STORAGE_KEY,
} from './p7-p5-build-proof';

export interface P5RuntimeProofStorage {
  setAsync(key: string, value: unknown): Promise<void>;
  deleteAsync(key: string): Promise<void>;
}

/**
 * P7 branch specialization: deterministic P5 acceptance still owns the core proof, then a second
 * receipt binds that proof to the exact traceable compiled P7 CI build. Local/untraceable builds do
 * not receive a P7 build receipt, so P7 mutation remains locked there.
 */
export async function updateP5RuntimeProofFromCalibration(
  storage: P5RuntimeProofStorage,
  result: P5RuntimeCalibrationResult,
): Promise<P5RuntimeAcceptanceAssessment> {
  const assessment = assessP5RuntimeAcceptance(result);

  if (assessment.accepted) {
    const proof = createP5RuntimeProof();
    await storage.setAsync(P5_RUNTIME_PROOF_STORAGE_KEY, proof);
    if (isTraceableP7BuildIdentity(P7_BUILD_IDENTITY)) {
      await storage.setAsync(
        P7_P5_BUILD_PROOF_STORAGE_KEY,
        createP7P5BuildProofReceipt(proof, P7_BUILD_IDENTITY),
      );
    } else {
      await storage.deleteAsync(P7_P5_BUILD_PROOF_STORAGE_KEY);
    }
  } else {
    await storage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
    await storage.deleteAsync(P7_P5_BUILD_PROOF_STORAGE_KEY);
  }

  return assessment;
}
