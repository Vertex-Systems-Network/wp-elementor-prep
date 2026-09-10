import {
  isTraceableP5RuntimeBuildIdentity,
  P5_RUNTIME_GATE_VERSION,
  sameP5RuntimeBuildIdentity,
} from '../core/p5-runtime-gate';
import type { P6RuntimeEvidenceBundle } from './p6-runtime-evidence';

export interface P6RuntimeAcceptanceAssessment {
  accepted: boolean;
  failures: string[];
}

function requireCondition(failures: string[], condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

function finiteNonNegative(value: number | null): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validIsoTimestamp(value: string | null): boolean {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

export function assessP6PositiveCalibrationAcceptance(
  evidence: P6RuntimeEvidenceBundle,
): P6RuntimeAcceptanceAssessment {
  const failures: string[] = [];
  const plan = evidence.plan;
  const calibration = evidence.calibration;
  const validation = calibration?.validation ?? null;

  requireCondition(failures, evidence.schemaVersion === 2, 'Unsupported P6 runtime evidence schema.');
  requireCondition(failures, validIsoTimestamp(evidence.capturedAt), 'P6 evidence has no valid capture timestamp.');
  requireCondition(failures, evidence.pluginVersion.length > 0, 'P6 evidence has no plugin version.');
  requireCondition(failures, isTraceableP5RuntimeBuildIdentity(evidence.build), 'P6 evidence is not bound to a traceable CI artifact.');
  requireCondition(failures, evidence.p5RuntimeGateVersion === P5_RUNTIME_GATE_VERSION, 'P6 evidence was captured against a different P5 runtime-gate version.');
  requireCondition(failures, validIsoTimestamp(evidence.p5RuntimeProofPassedAt), 'P6 evidence was captured without a valid imported P5 runtime proof.');
  requireCondition(failures, isTraceableP5RuntimeBuildIdentity(evidence.p5RuntimeProofBuild), 'P6 evidence has no traceable P5 prerequisite proof build.');
  if (isTraceableP5RuntimeBuildIdentity(evidence.build) && isTraceableP5RuntimeBuildIdentity(evidence.p5RuntimeProofBuild)) {
    requireCondition(failures, sameP5RuntimeBuildIdentity(evidence.build, evidence.p5RuntimeProofBuild), 'P6 evidence and P5 prerequisite proof were captured by different CI artifacts.');
  }
  requireCondition(failures, evidence.outcomeStatus === 'COMPLETED', `P6 developer calibration outcome is ${evidence.outcomeStatus}, not COMPLETED.`);
  requireCondition(failures, evidence.reason === null, 'Completed P6 evidence unexpectedly contains a blocking reason.');

  requireCondition(failures, plan !== null, 'P6 evidence has no calibration plan.');
  if (plan) {
    requireCondition(failures, plan.decision === 'CALIBRATE', `P6 plan decision is ${plan.decision}, not CALIBRATE.`);
    requireCondition(failures, plan.recipe === 'page-vertical-flow', `P6 recipe is ${plan.recipe ?? 'null'}, not page-vertical-flow.`);
    requireCondition(failures, plan.pattern === 'page-vertical-flow', `P6 pattern is ${plan.pattern}, not page-vertical-flow.`);
    requireCondition(failures, plan.preserveNodeIds.length === 0, 'P6 positive page-flow calibration contains preservation-sensitive node ids.');
    requireCondition(failures, plan.targetNodeId === evidence.frame.id, 'P6 plan target does not match the captured Frame id.');
  }

  requireCondition(failures, calibration !== null, 'P6 evidence has no calibration result.');
  if (calibration) {
    requireCondition(failures, calibration.status === 'PASSED', `P6 calibration status is ${calibration.status}, not PASSED.`);
    requireCondition(failures, calibration.originalNodeId === evidence.frame.id, 'P6 calibration original id does not match the captured Frame id.');
    requireCondition(failures, calibration.candidateNodeId !== null, 'P6 calibration never staged a candidate.');
    requireCondition(failures, calibration.failureStage === null, 'P6 calibration reports a failure stage.');
    requireCondition(failures, calibration.error === null, 'P6 calibration reports an error.');
    requireCondition(failures, calibration.leftoverCandidateRisk === false, 'P6 calibration reports leftover candidate risk.');
    requireCondition(failures, calibration.productionCommitAttempted === false, 'P6 calibration attempted a production commit.');
    requireCondition(failures, calibration.events.some((event) => event.stage === 'DISCARD'), 'P6 calibration has no candidate-discard event.');
    requireCondition(failures, calibration.events.some((event) => event.stage === 'DONE'), 'P6 calibration has no completion event.');
  }

  requireCondition(failures, validation !== null, 'P6 calibration returned no Full P3 validation summary.');
  if (validation) {
    requireCondition(failures, validation.passed, 'P6 Full P3 validation did not pass.');
    requireCondition(failures, validation.thresholdVersion.length > 0, 'P6 Full P3 threshold version is missing.');
    requireCondition(failures, finiteNonNegative(validation.changedPixelPct), 'P6 Full P3 changed-pixel evidence is missing/invalid.');
    requireCondition(failures, finiteNonNegative(validation.meanChannelDelta), 'P6 Full P3 mean-channel evidence is missing/invalid.');
    requireCondition(failures, finiteNonNegative(validation.maxChannelDelta), 'P6 Full P3 max-channel evidence is missing/invalid.');
    requireCondition(failures, Number.isFinite(validation.maxTextPositionDriftPx) && validation.maxTextPositionDriftPx >= 0, 'P6 text-drift evidence is invalid.');
    requireCondition(failures, Number.isFinite(validation.maxImagePositionDriftPx) && validation.maxImagePositionDriftPx >= 0, 'P6 image-drift evidence is invalid.');
  }

  return { accepted: failures.length === 0, failures };
}
