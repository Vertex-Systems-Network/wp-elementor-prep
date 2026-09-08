import {
  isTraceableP5RuntimeBuildIdentity,
  P5_RUNTIME_GATE_VERSION,
  type P5RuntimeBuildIdentity,
} from '../core/p5-runtime-gate';
import type { P5RuntimeCalibrationResult } from './p5-runtime-calibration';
import {
  assessP5RuntimeAcceptance,
  type P5RuntimeAcceptanceAssessment,
} from './p5-runtime-acceptance';

export const P5_RUNTIME_EVIDENCE_SCHEMA_VERSION = 2 as const;

export interface P5RuntimeEvidenceBundle {
  schemaVersion: typeof P5_RUNTIME_EVIDENCE_SCHEMA_VERSION;
  capturedAt: string;
  pluginVersion: string;
  runtimeGateVersion: string;
  build: P5RuntimeBuildIdentity;
  runtimeProofPassedAt: string | null;
  acceptance: P5RuntimeAcceptanceAssessment;
  calibration: P5RuntimeCalibrationResult;
}

export function buildP5RuntimeEvidenceBundle(input: {
  pluginVersion: string;
  build: P5RuntimeBuildIdentity;
  result: P5RuntimeCalibrationResult;
  runtimeProofPassedAt: string | null;
  capturedAt?: string;
}): P5RuntimeEvidenceBundle {
  const calibrationAcceptance = assessP5RuntimeAcceptance(input.result);
  const failures = [...calibrationAcceptance.failures];
  if (!isTraceableP5RuntimeBuildIdentity(input.build)) {
    failures.push('P5 runtime evidence is not bound to a traceable CI artifact.');
  }
  const acceptance: P5RuntimeAcceptanceAssessment = {
    accepted: failures.length === 0,
    failures,
  };

  return {
    schemaVersion: P5_RUNTIME_EVIDENCE_SCHEMA_VERSION,
    capturedAt: input.capturedAt ?? new Date().toISOString(),
    pluginVersion: input.pluginVersion,
    runtimeGateVersion: P5_RUNTIME_GATE_VERSION,
    build: { ...input.build },
    runtimeProofPassedAt: acceptance.accepted ? input.runtimeProofPassedAt : null,
    acceptance: { accepted: acceptance.accepted, failures: [...acceptance.failures] },
    calibration: {
      ...input.result,
      forcedReject: { ...input.result.forcedReject },
      passRestore: { ...input.result.passRestore },
      passFinalize: { ...input.result.passFinalize },
    },
  };
}
