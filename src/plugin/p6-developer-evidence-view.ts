import type { P6DeveloperCalibrationOutcome } from './p6-developer-calibration';
import {
  buildP6PreservationRefusalEvidenceBundle,
  type P6PreservationRefusalEvidenceBundle,
} from './p6-refusal-evidence';
import { buildP6PreservationRefusalEvidenceViewerHtml } from './p6-refusal-evidence-viewer';
import {
  buildP6RuntimeEvidenceBundle,
  type P6RuntimeEvidenceBundle,
} from './p6-runtime-evidence';
import { buildP6RuntimeEvidenceViewerHtml } from './p6-runtime-evidence-viewer';

export type P6DeveloperEvidenceView =
  | {
    kind: 'PRESERVATION_REFUSAL';
    evidence: P6PreservationRefusalEvidenceBundle;
    html: string;
  }
  | {
    kind: 'CALIBRATION';
    evidence: P6RuntimeEvidenceBundle;
    html: string;
  };

/**
 * Produces the correct read-only evidence surface for a real P6 developer run.
 * NO_CANDIDATE keeps the full bounded decision set so preservation refusal can be reviewed;
 * COMPLETED/BLOCKED use the existing calibration evidence surface.
 */
export function buildP6DeveloperEvidenceView(input: {
  pluginVersion: string;
  p5RuntimeProofPassedAt: string | null;
  frame: Pick<FrameNode, 'id' | 'name'>;
  outcome: P6DeveloperCalibrationOutcome;
  capturedAt?: string;
}): P6DeveloperEvidenceView {
  if (input.outcome.status === 'NO_CANDIDATE') {
    const evidence = buildP6PreservationRefusalEvidenceBundle(input);
    return {
      kind: 'PRESERVATION_REFUSAL',
      evidence,
      html: buildP6PreservationRefusalEvidenceViewerHtml(evidence),
    };
  }

  const evidence = buildP6RuntimeEvidenceBundle(input);
  return {
    kind: 'CALIBRATION',
    evidence,
    html: buildP6RuntimeEvidenceViewerHtml(evidence),
  };
}
