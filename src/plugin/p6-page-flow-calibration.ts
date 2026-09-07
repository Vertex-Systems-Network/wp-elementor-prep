import {
  runAdvancedCloneCalibration,
  type AdvancedCalibrationResult,
} from '../core/advanced-calibration';
import type { AdvancedRecipePlan } from '../core/advanced-recipe-types';
import {
  FigmaAdvancedCalibrationAdapter,
  type AdvancedFullP3Validator,
} from './figma-advanced-calibration-adapter';
import { transformAdvancedCalibrationCandidate } from './advanced-recipe-transform';

/**
 * Runs the first concrete P6 advanced transformer through the commitless calibration lifecycle.
 *
 * This function is not wired to production Safe Fix UI and cannot commit. A passing candidate is
 * still discarded after full P3 validation by `runAdvancedCloneCalibration`.
 */
export async function runP6PageFlowCloneCalibration(
  original: FrameNode,
  plan: AdvancedRecipePlan,
  validateFullP3: AdvancedFullP3Validator,
): Promise<AdvancedCalibrationResult> {
  if (
    plan.decision !== 'CALIBRATE'
    || plan.recipe !== 'page-vertical-flow'
    || plan.pattern !== 'page-vertical-flow'
  ) {
    throw new Error('P6 page-flow calibration requires a CALIBRATE page-vertical-flow plan.');
  }

  const adapter = new FigmaAdvancedCalibrationAdapter(plan, {
    transform: transformAdvancedCalibrationCandidate,
    validate: validateFullP3,
  });

  return runAdvancedCloneCalibration(original.id, plan, adapter);
}
