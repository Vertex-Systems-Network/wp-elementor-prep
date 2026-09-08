import { P5_RUNTIME_GATE_VERSION } from '../core/p5-runtime-gate';
import type { P6PreservationRefusalEvidenceBundle } from './p6-refusal-evidence';

export interface P6PreservationRefusalAcceptanceAssessment {
  accepted: boolean;
  failures: string[];
}

function requireCondition(failures: string[], condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

function validIsoTimestamp(value: string | null): boolean {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

/**
 * Deterministically verifies that a real imported-plugin P6 run refused a preservation-sensitive
 * page without entering clone calibration or exposing any production mutation authorization.
 */
export function assessP6PreservationRefusalAcceptance(
  evidence: P6PreservationRefusalEvidenceBundle,
): P6PreservationRefusalAcceptanceAssessment {
  const failures: string[] = [];

  requireCondition(failures, evidence.schemaVersion === 1, 'Unsupported P6 refusal evidence schema.');
  requireCondition(failures, validIsoTimestamp(evidence.capturedAt), 'P6 refusal evidence has no valid capture timestamp.');
  requireCondition(failures, evidence.pluginVersion.length > 0, 'P6 refusal evidence has no plugin version.');
  requireCondition(failures, evidence.p5RuntimeGateVersion === P5_RUNTIME_GATE_VERSION, 'P6 refusal evidence was captured against a different P5 runtime-gate version.');
  requireCondition(failures, validIsoTimestamp(evidence.p5RuntimeProofPassedAt), 'P6 refusal evidence was captured without a valid imported P5 runtime proof.');
  requireCondition(failures, evidence.outcomeStatus === 'NO_CANDIDATE', `P6 refusal outcome is ${evidence.outcomeStatus}, not NO_CANDIDATE.`);
  requireCondition(failures, typeof evidence.reason === 'string' && evidence.reason.length > 0, 'P6 refusal evidence has no refusal reason.');
  requireCondition(failures, evidence.totalPlanCount > 0, 'P6 refusal evidence contains no analyzed plans.');
  requireCondition(failures, evidence.plansTruncated === false, 'P6 refusal plan evidence was truncated; the complete decision set is required.');
  requireCondition(failures, evidence.plans.length === evidence.totalPlanCount, 'P6 refusal plan count does not match the complete captured plan set.');

  const preservationPlans = evidence.plans.filter((plan) => (
    plan.decision === 'PRESERVE'
    && plan.reasonCode === 'PRESERVATION_RELATIONSHIP_REQUIRED'
    && plan.preserveNodeIds.length > 0
  ));
  requireCondition(failures, preservationPlans.length > 0, 'P6 refusal evidence contains no explicit preservation-sensitive PRESERVE plan.');

  const unsafePageFlowCalibration = evidence.plans.some((plan) => (
    plan.decision === 'CALIBRATE'
    && plan.recipe === 'page-vertical-flow'
    && plan.pattern === 'page-vertical-flow'
  ));
  requireCondition(failures, !unsafePageFlowCalibration, 'P6 refusal evidence still contains a page-vertical-flow CALIBRATE plan.');

  for (const plan of evidence.plans) {
    requireCondition(failures, plan.mutationEnabled === false, `P6 refusal plan ${plan.targetNodeId} unexpectedly enables mutation.`);
    requireCondition(failures, plan.futureMutationRequiresFullP3 === true, `P6 refusal plan ${plan.targetNodeId} does not require Full P3.`);
    requireCondition(failures, plan.futureMutationRequiresP4Rollback === true, `P6 refusal plan ${plan.targetNodeId} does not require P4 rollback semantics.`);
  }

  return { accepted: failures.length === 0, failures };
}
