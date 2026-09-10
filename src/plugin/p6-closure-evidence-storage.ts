import { isP6ImageBearingPositiveEvidence } from './p6-closure-acceptance';
import { assessP6PreservationRefusalAcceptance } from './p6-refusal-acceptance';
import type { P6PreservationRefusalEvidenceBundle } from './p6-refusal-evidence';
import { assessP6PositiveCalibrationAcceptance } from './p6-runtime-acceptance';
import type { P6RuntimeEvidenceBundle } from './p6-runtime-evidence';
import type { P6DeveloperEvidenceView } from './p6-developer-evidence-view';

export const P6_POSITIVE_CLOSURE_EVIDENCE_STORAGE_KEY = 'pella-elementor-prep:p6-positive-closure-evidence-v1';
export const P6_REFUSAL_CLOSURE_EVIDENCE_STORAGE_KEY = 'pella-elementor-prep:p6-refusal-closure-evidence-v1';

export interface P6ClosureEvidenceStorage {
  getAsync(key: string): Promise<unknown>;
  setAsync(key: string, value: unknown): Promise<void>;
}

export interface P6StoredClosureEvidence {
  positive: P6RuntimeEvidenceBundle | null;
  refusal: P6PreservationRefusalEvidenceBundle | null;
}

function acceptedPositive(value: unknown): P6RuntimeEvidenceBundle | null {
  if (!value || typeof value !== 'object') return null;
  try {
    const evidence = value as P6RuntimeEvidenceBundle;
    return assessP6PositiveCalibrationAcceptance(evidence).accepted
      && isP6ImageBearingPositiveEvidence(evidence)
      ? evidence
      : null;
  } catch {
    return null;
  }
}

function acceptedRefusal(value: unknown): P6PreservationRefusalEvidenceBundle | null {
  if (!value || typeof value !== 'object') return null;
  try {
    const evidence = value as P6PreservationRefusalEvidenceBundle;
    return assessP6PreservationRefusalAcceptance(evidence).accepted ? evidence : null;
  } catch {
    return null;
  }
}

export async function loadP6StoredClosureEvidence(
  storage: P6ClosureEvidenceStorage,
): Promise<P6StoredClosureEvidence> {
  try {
    const [positive, refusal] = await Promise.all([
      storage.getAsync(P6_POSITIVE_CLOSURE_EVIDENCE_STORAGE_KEY),
      storage.getAsync(P6_REFUSAL_CLOSURE_EVIDENCE_STORAGE_KEY),
    ]);
    return {
      positive: acceptedPositive(positive),
      refusal: acceptedRefusal(refusal),
    };
  } catch {
    return { positive: null, refusal: null };
  }
}

/**
 * Retains only closure-qualifying evidence. Positive closure evidence must independently pass Full P3
 * acceptance and prove at least one stable image anchor. A rejected/non-image-bearing later run never
 * erases a previously accepted scenario. Storage is observational only.
 */
export async function persistP6ClosureEvidenceBestEffort(
  storage: P6ClosureEvidenceStorage,
  view: P6DeveloperEvidenceView,
): Promise<boolean> {
  try {
    if (view.kind === 'CALIBRATION') {
      if (!assessP6PositiveCalibrationAcceptance(view.evidence).accepted) return false;
      if (!isP6ImageBearingPositiveEvidence(view.evidence)) return false;
      await storage.setAsync(P6_POSITIVE_CLOSURE_EVIDENCE_STORAGE_KEY, view.evidence);
      return true;
    }

    if (!assessP6PreservationRefusalAcceptance(view.evidence).accepted) return false;
    await storage.setAsync(P6_REFUSAL_CLOSURE_EVIDENCE_STORAGE_KEY, view.evidence);
    return true;
  } catch {
    return false;
  }
}
