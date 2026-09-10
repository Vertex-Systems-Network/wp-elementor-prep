import type { CandidateHandle } from './transaction-types';
import type { ValidationReport } from './validation-types';
import type { AdvancedRecipePlan } from './advanced-recipe-types';

export type AdvancedCalibrationStatus = 'SKIPPED' | 'PASSED' | 'REJECTED' | 'FAILED';
export type AdvancedCalibrationFailureStage = 'clone' | 'transform' | 'validate' | 'discard';

export interface AdvancedCalibrationAdapter {
  cloneOriginal(originalNodeId: string, calibrationId: string): Promise<CandidateHandle>;
  transformCandidate(candidate: CandidateHandle, plan: AdvancedRecipePlan): Promise<void>;
  validateCandidate(candidate: CandidateHandle): Promise<ValidationReport>;
  discardCandidate(candidate: CandidateHandle): Promise<void>;
}

export interface AdvancedCalibrationEvent {
  stage: 'SKIP' | 'CLONE' | 'TRANSFORM' | 'VALIDATE' | 'DISCARD' | 'DONE' | 'FAIL';
  detail?: string;
}

export interface AdvancedCalibrationResult {
  schemaVersion: 1;
  calibrationId: string;
  status: AdvancedCalibrationStatus;
  originalNodeId: string;
  candidateNodeId?: string;
  plan: AdvancedRecipePlan;
  validation?: ValidationReport;
  failureStage?: AdvancedCalibrationFailureStage;
  error?: string;
  /** True only when candidate cleanup failed and manual inspection is required. */
  leftoverCandidateRisk: boolean;
  /** Clone-only P6 calibration can never authorize or perform a production commit. */
  productionCommitAttempted: false;
  events: AdvancedCalibrationEvent[];
}

let sequence = 0;
function nextCalibrationId(recipe: string | null): string {
  sequence += 1;
  return `p6-cal-${recipe ?? 'review'}-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function failed(
  base: Omit<AdvancedCalibrationResult, 'status' | 'leftoverCandidateRisk' | 'productionCommitAttempted' | 'events'>,
  stage: AdvancedCalibrationFailureStage,
  error: string,
  events: AdvancedCalibrationEvent[],
  leftoverCandidateRisk = false,
): AdvancedCalibrationResult {
  return {
    ...base,
    status: 'FAILED',
    failureStage: stage,
    error,
    leftoverCandidateRisk,
    productionCommitAttempted: false,
    events: [...events, { stage: 'FAIL', detail: `${stage} failed` }],
  };
}

async function discard(
  adapter: AdvancedCalibrationAdapter,
  candidate: CandidateHandle,
  events: AdvancedCalibrationEvent[],
): Promise<string | null> {
  events.push({ stage: 'DISCARD' });
  try {
    await adapter.discardCandidate(candidate);
    return null;
  } catch (error) {
    return messageOf(error);
  }
}

/**
 * Executes one P6 plan as clone-only calibration evidence.
 *
 * This deliberately does not expose a commit callback. A candidate is always discarded after
 * validation, regardless of whether validation passes or rejects the transform. Only CALIBRATE
 * plans can enter this path; REVIEW/PRESERVE/NOOP fail closed as SKIPPED.
 */
export async function runAdvancedCloneCalibration(
  originalNodeId: string,
  plan: AdvancedRecipePlan,
  adapter: AdvancedCalibrationAdapter,
  calibrationId = nextCalibrationId(plan.recipe),
): Promise<AdvancedCalibrationResult> {
  const events: AdvancedCalibrationEvent[] = [];
  const base = {
    schemaVersion: 1 as const,
    calibrationId,
    originalNodeId,
    plan,
  };

  if (plan.decision !== 'CALIBRATE' || !plan.recipe) {
    return {
      ...base,
      status: 'SKIPPED',
      leftoverCandidateRisk: false,
      productionCommitAttempted: false,
      events: [{ stage: 'SKIP', detail: `Plan decision is ${plan.decision}; clone calibration was not started.` }],
    };
  }

  let candidate: CandidateHandle;
  events.push({ stage: 'CLONE' });
  try {
    candidate = await adapter.cloneOriginal(originalNodeId, calibrationId);
    if (candidate.originalNodeId !== originalNodeId) {
      throw new Error('Calibration adapter returned a candidate for a different original node.');
    }
  } catch (error) {
    return failed(base, 'clone', messageOf(error), events);
  }

  const candidateBase = { ...base, candidateNodeId: candidate.candidateNodeId };

  events.push({ stage: 'TRANSFORM' });
  try {
    await adapter.transformCandidate(candidate, plan);
  } catch (error) {
    const transformError = messageOf(error);
    const discardError = await discard(adapter, candidate, events);
    if (discardError) {
      return failed(
        candidateBase,
        'discard',
        `Transform failed (${transformError}); candidate cleanup also failed (${discardError}).`,
        events,
        true,
      );
    }
    return failed(candidateBase, 'transform', transformError, events);
  }

  let validation: ValidationReport;
  events.push({ stage: 'VALIDATE' });
  try {
    validation = await adapter.validateCandidate(candidate);
  } catch (error) {
    const validationError = messageOf(error);
    const discardError = await discard(adapter, candidate, events);
    if (discardError) {
      return failed(
        candidateBase,
        'discard',
        `Validation crashed (${validationError}); candidate cleanup also failed (${discardError}).`,
        events,
        true,
      );
    }
    return failed(candidateBase, 'validate', validationError, events);
  }

  const discardError = await discard(adapter, candidate, events);
  if (discardError) {
    return failed(
      { ...candidateBase, validation },
      'discard',
      `Clone-only calibration completed validation but candidate cleanup failed: ${discardError}`,
      events,
      true,
    );
  }

  return {
    ...candidateBase,
    status: validation.passed ? 'PASSED' : 'REJECTED',
    validation,
    leftoverCandidateRisk: false,
    productionCommitAttempted: false,
    events: [...events, { stage: 'DONE', detail: validation.passed ? 'validation passed; candidate discarded' : 'validation rejected; candidate discarded' }],
  };
}
