import type { P5RuntimeBuildIdentity } from '../core/p5-runtime-gate';
import type { P5RuntimeEvidenceBundle } from './p5-runtime-evidence';
import { loadLatestP5RuntimeEvidence } from './p5-runtime-evidence-storage';
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
  schemaVersion: 2;
  currentBuild: P5RuntimeBuildIdentity;
  p5Evidence: P5RuntimeEvidenceBundle | null;
  acceptance: P6ClosureAcceptanceAssessment;
  evidence: P6ClosureEvidencePair;
}

export interface P6ClosureInspection {
  currentBuild: P5RuntimeBuildIdentity;
  p5Evidence: P5RuntimeEvidenceBundle | null;
  acceptance: P6ClosureAcceptanceAssessment;
  evidence: P6ClosureEvidencePair;
  json: string;
}

export function buildP6ClosureExportBundle(
  currentBuild: P5RuntimeBuildIdentity,
  evidence: P6ClosureEvidencePair,
  p5Evidence: P5RuntimeEvidenceBundle | null = null,
): P6ClosureExportBundle {
  return {
    schemaVersion: 2,
    currentBuild: { ...currentBuild },
    p5Evidence,
    acceptance: assessP6ClosureAcceptance(currentBuild, evidence),
    evidence,
  };
}

export async function inspectP6ClosureEvidence(
  storage: P6ClosureEvidenceStorage,
  currentBuild: P5RuntimeBuildIdentity,
): Promise<P6ClosureInspection> {
  const [evidence, p5Evidence] = await Promise.all([
    loadP6StoredClosureEvidence(storage),
    loadLatestP5RuntimeEvidence(storage),
  ]);
  const bundle = buildP6ClosureExportBundle(currentBuild, evidence, p5Evidence);
  return {
    currentBuild: { ...currentBuild },
    p5Evidence,
    acceptance: bundle.acceptance,
    evidence,
    json: JSON.stringify(bundle, null, 2),
  };
}
