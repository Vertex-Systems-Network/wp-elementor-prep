import type { P5RuntimeBuildIdentity } from '../core/p5-runtime-gate';
import {
  assessP6ClosureAcceptance,
  type P6ClosureAcceptanceAssessment,
  type P6ClosureEvidencePair,
} from './p6-closure-acceptance';
import {
  loadP6StoredClosureEvidence,
  type P6ClosureEvidenceStorage,
} from './p6-closure-evidence-storage';

export interface P6ClosureExportBundle {
  schemaVersion: 1;
  currentBuild: P5RuntimeBuildIdentity;
  acceptance: P6ClosureAcceptanceAssessment;
  evidence: P6ClosureEvidencePair;
}

export interface P6ClosureInspection {
  currentBuild: P5RuntimeBuildIdentity;
  acceptance: P6ClosureAcceptanceAssessment;
  evidence: P6ClosureEvidencePair;
  json: string;
}

export function buildP6ClosureExportBundle(
  currentBuild: P5RuntimeBuildIdentity,
  evidence: P6ClosureEvidencePair,
): P6ClosureExportBundle {
  return {
    schemaVersion: 1,
    currentBuild: { ...currentBuild },
    acceptance: assessP6ClosureAcceptance(currentBuild, evidence),
    evidence,
  };
}

export async function inspectP6ClosureEvidence(
  storage: P6ClosureEvidenceStorage,
  currentBuild: P5RuntimeBuildIdentity,
): Promise<P6ClosureInspection> {
  const evidence = await loadP6StoredClosureEvidence(storage);
  const bundle = buildP6ClosureExportBundle(currentBuild, evidence);
  return {
    currentBuild: { ...currentBuild },
    acceptance: bundle.acceptance,
    evidence,
    json: JSON.stringify(bundle, null, 2),
  };
}
