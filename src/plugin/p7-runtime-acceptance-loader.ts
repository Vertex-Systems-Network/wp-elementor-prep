import {
  assessP7RuntimeAcceptance,
  type P7RuntimeAcceptanceAssessment,
} from './p7-runtime-acceptance';
import {
  loadP7RuntimeAcceptanceEvidence,
  type P7EvidenceKeyValueStorage,
  type P7StoredRuntimeAcceptanceEvidence,
} from './p7-runtime-evidence-session';

export interface P7StoredRuntimeAcceptanceAssessment extends P7RuntimeAcceptanceAssessment {
  evidence: P7StoredRuntimeAcceptanceEvidence;
}

/**
 * Loads both retained real-runtime P7 acceptance scenarios and evaluates them deterministically.
 * Missing scenarios fail closed; storage/read failures are already normalized to null by the loader.
 */
export async function loadAndAssessP7RuntimeAcceptance(
  storage: P7EvidenceKeyValueStorage,
): Promise<P7StoredRuntimeAcceptanceAssessment> {
  const evidence = await loadP7RuntimeAcceptanceEvidence(storage);
  const failures: string[] = [];

  if (!evidence.stress) failures.push('No retained 60+ Frame completed stress-run evidence is available.');
  if (!evidence.cancellation) failures.push('No retained active-frame cancellation evidence is available.');

  if (failures.length > 0 || !evidence.stress || !evidence.cancellation) {
    return { accepted: false, failures, evidence };
  }

  const assessment = assessP7RuntimeAcceptance({
    stress: evidence.stress,
    cancellation: evidence.cancellation,
  });
  return { ...assessment, evidence };
}
