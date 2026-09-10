import type { AdvancedCalibrationAdapter } from '../core/advanced-calibration';
import type { AdvancedRecipePlan } from '../core/advanced-recipe-types';
import type { CandidateHandle } from '../core/transaction-types';
import type { ValidationReport } from '../core/validation-types';
import { FigmaCandidateTransactionAdapter } from './figma-transaction-adapter';

export type AdvancedCandidateTransformer = (
  candidate: FrameNode,
  plan: AdvancedRecipePlan,
) => Promise<void> | void;

export type AdvancedFullP3Validator = (
  original: FrameNode,
  candidate: FrameNode,
) => Promise<ValidationReport>;

type CalibrationLifecycleAdapter = Pick<
  FigmaCandidateTransactionAdapter,
  'cloneOriginal' | 'transformCandidate' | 'validateCandidate' | 'discardCandidate'
>;

export interface FigmaAdvancedCalibrationOptions {
  transform: AdvancedCandidateTransformer;
  validate: AdvancedFullP3Validator;
  /** Test seam only. Production should omit this and use the concrete Figma candidate adapter. */
  lifecycleAdapter?: CalibrationLifecycleAdapter;
}

function samePlan(expected: AdvancedRecipePlan, actual: AdvancedRecipePlan): boolean {
  return expected.schemaVersion === actual.schemaVersion
    && expected.decision === actual.decision
    && expected.recipe === actual.recipe
    && expected.pattern === actual.pattern
    && expected.targetNodeId === actual.targetNodeId
    && expected.targetPath.length === actual.targetPath.length
    && expected.targetPath.every((index, pathIndex) => index === actual.targetPath[pathIndex]);
}

/**
 * Figma implementation of the P6 clone-only calibration lifecycle.
 *
 * This class deliberately exposes only clone/transform/validate/discard. Although the concrete P4
 * adapter also knows how to commit, that method is not part of this wrapper's public calibration
 * interface and is never called here.
 */
export class FigmaAdvancedCalibrationAdapter implements AdvancedCalibrationAdapter {
  private readonly lifecycle: CalibrationLifecycleAdapter;

  constructor(
    private readonly plan: AdvancedRecipePlan,
    options: FigmaAdvancedCalibrationOptions,
  ) {
    if (plan.decision !== 'CALIBRATE' || !plan.recipe) {
      throw new Error('Figma advanced calibration adapter requires a CALIBRATE recipe plan.');
    }

    this.lifecycle = options.lifecycleAdapter ?? new FigmaCandidateTransactionAdapter({
      transform: (candidate) => options.transform(candidate, this.plan),
      validate: options.validate,
    });
  }

  cloneOriginal(originalNodeId: string, calibrationId: string): Promise<CandidateHandle> {
    return this.lifecycle.cloneOriginal(originalNodeId, calibrationId);
  }

  async transformCandidate(candidate: CandidateHandle, plan: AdvancedRecipePlan): Promise<void> {
    if (!samePlan(this.plan, plan)) {
      throw new Error('Calibration plan changed after the Figma adapter was created; refusing stale transform.');
    }
    await this.lifecycle.transformCandidate(candidate);
  }

  validateCandidate(candidate: CandidateHandle): Promise<ValidationReport> {
    return this.lifecycle.validateCandidate(candidate);
  }

  discardCandidate(candidate: CandidateHandle): Promise<void> {
    return this.lifecycle.discardCandidate(candidate);
  }
}
