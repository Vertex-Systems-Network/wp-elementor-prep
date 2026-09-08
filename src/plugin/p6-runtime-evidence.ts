import {
  P5_RUNTIME_GATE_VERSION,
  type P5RuntimeBuildIdentity,
} from '../core/p5-runtime-gate';
import type { AdvancedCalibrationResult } from '../core/advanced-calibration';
import type { AdvancedRecipePlan } from '../core/advanced-recipe-types';
import type { P6DeveloperCalibrationOutcome } from './p6-developer-calibration';

export const P6_RUNTIME_EVIDENCE_SCHEMA_VERSION = 2 as const;

export interface P6RuntimeEvidencePlanSummary {
  decision: AdvancedRecipePlan['decision'];
  recipe: AdvancedRecipePlan['recipe'];
  pattern: AdvancedRecipePlan['pattern'];
  confidence: number;
  targetNodeId: string;
  targetNodeName: string;
  targetPath: number[];
  preserveNodeIds: string[];
}

export interface P6RuntimeEvidenceValidationSummary {
  passed: boolean;
  thresholdVersion: string;
  changedPixelPct: number | null;
  meanChannelDelta: number | null;
  maxChannelDelta: number | null;
  maxTextPositionDriftPx: number;
  maxImagePositionDriftPx: number;
}

export interface P6RuntimeEvidenceCalibrationSummary {
  calibrationId: string;
  status: AdvancedCalibrationResult['status'];
  originalNodeId: string;
  candidateNodeId: string | null;
  failureStage: AdvancedCalibrationResult['failureStage'] | null;
  error: string | null;
  leftoverCandidateRisk: boolean;
  productionCommitAttempted: false;
  validation: P6RuntimeEvidenceValidationSummary | null;
  events: AdvancedCalibrationResult['events'];
}

export interface P6RuntimeEvidenceBundle {
  schemaVersion: typeof P6_RUNTIME_EVIDENCE_SCHEMA_VERSION;
  capturedAt: string;
  pluginVersion: string;
  build: P5RuntimeBuildIdentity;
  p5RuntimeGateVersion: string;
  p5RuntimeProofPassedAt: string | null;
  p5RuntimeProofBuild: P5RuntimeBuildIdentity | null;
  frame: { id: string; name: string };
  outcomeStatus: P6DeveloperCalibrationOutcome['status'];
  reason: string | null;
  plan: P6RuntimeEvidencePlanSummary | null;
  calibration: P6RuntimeEvidenceCalibrationSummary | null;
}

function summarizePlan(plan: AdvancedRecipePlan): P6RuntimeEvidencePlanSummary {
  return {
    decision: plan.decision,
    recipe: plan.recipe,
    pattern: plan.pattern,
    confidence: plan.confidence,
    targetNodeId: plan.targetNodeId,
    targetNodeName: plan.targetNodeName,
    targetPath: [...plan.targetPath],
    preserveNodeIds: [...plan.preserveNodeIds],
  };
}

function summarizeCalibration(result: AdvancedCalibrationResult): P6RuntimeEvidenceCalibrationSummary {
  const validation = result.validation;
  const pixel = validation?.metrics.pixel ?? null;
  return {
    calibrationId: result.calibrationId,
    status: result.status,
    originalNodeId: result.originalNodeId,
    candidateNodeId: result.candidateNodeId ?? null,
    failureStage: result.failureStage ?? null,
    error: result.error ?? null,
    leftoverCandidateRisk: result.leftoverCandidateRisk,
    productionCommitAttempted: false,
    validation: validation ? {
      passed: validation.passed,
      thresholdVersion: validation.thresholdVersion,
      changedPixelPct: pixel?.changedPixelPct ?? null,
      meanChannelDelta: pixel?.meanChannelDelta ?? null,
      maxChannelDelta: pixel?.maxChannelDelta ?? null,
      maxTextPositionDriftPx: validation.metrics.maxTextPositionDriftPx,
      maxImagePositionDriftPx: validation.metrics.maxImagePositionDriftPx,
    } : null,
    events: result.events.map((event) => ({ ...event })),
  };
}

export function buildP6RuntimeEvidenceBundle(input: {
  pluginVersion: string;
  build: P5RuntimeBuildIdentity;
  p5RuntimeProofPassedAt: string | null;
  p5RuntimeProofBuild: P5RuntimeBuildIdentity | null;
  frame: Pick<FrameNode, 'id' | 'name'>;
  outcome: P6DeveloperCalibrationOutcome;
  capturedAt?: string;
}): P6RuntimeEvidenceBundle {
  const { outcome } = input;
  const completed = outcome.status === 'COMPLETED' ? outcome : null;
  const reason = outcome.status === 'COMPLETED' ? null : outcome.reason;

  return {
    schemaVersion: P6_RUNTIME_EVIDENCE_SCHEMA_VERSION,
    capturedAt: input.capturedAt ?? new Date().toISOString(),
    pluginVersion: input.pluginVersion,
    build: { ...input.build },
    p5RuntimeGateVersion: P5_RUNTIME_GATE_VERSION,
    p5RuntimeProofPassedAt: input.p5RuntimeProofPassedAt,
    p5RuntimeProofBuild: input.p5RuntimeProofBuild ? { ...input.p5RuntimeProofBuild } : null,
    frame: { id: input.frame.id, name: input.frame.name },
    outcomeStatus: outcome.status,
    reason,
    plan: completed ? summarizePlan(completed.plan) : null,
    calibration: completed ? summarizeCalibration(completed.result) : null,
  };
}
