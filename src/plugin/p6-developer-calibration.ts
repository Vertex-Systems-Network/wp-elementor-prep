import { detectAdvancedPatterns } from '../core/advanced-patterns';
import { planAdvancedRecipes } from '../core/advanced-recipe-planner';
import type { AdvancedRecipePlan } from '../core/advanced-recipe-types';
import type { AdvancedCalibrationResult } from '../core/advanced-calibration';
import { scanSceneNode } from '../core/scanner';
import {
  runP6PageFlowCloneCalibration,
} from './p6-page-flow-calibration';
import type { AdvancedFullP3Validator } from './figma-advanced-calibration-adapter';

export interface P6DeveloperCalibrationDependencies {
  runtimeProofValid(): Promise<boolean>;
  hasPendingCheckpoint(): Promise<boolean>;
  plan(frame: FrameNode): Promise<AdvancedRecipePlan[]>;
  calibrate(frame: FrameNode, plan: AdvancedRecipePlan): Promise<AdvancedCalibrationResult>;
}

export type P6DeveloperCalibrationOutcome =
  | { status: 'BLOCKED'; reason: string }
  | { status: 'NO_CANDIDATE'; reason: string; plans: AdvancedRecipePlan[] }
  | { status: 'COMPLETED'; plan: AdvancedRecipePlan; result: AdvancedCalibrationResult };

export interface P6DeveloperCalibrationOptions {
  runtimeProofValid: () => Promise<boolean>;
  hasPendingCheckpoint: () => Promise<boolean>;
  validateFullP3: AdvancedFullP3Validator;
  overrides?: Partial<Pick<P6DeveloperCalibrationDependencies, 'plan' | 'calibrate'>>;
}

async function defaultPlan(frame: FrameNode): Promise<AdvancedRecipePlan[]> {
  const root = scanSceneNode(frame);
  const detections = detectAdvancedPatterns(root);
  return planAdvancedRecipes(root, detections);
}

/**
 * Developer-only entrypoint for collecting real imported-plugin P6 evidence.
 *
 * It never exposes a commit path. P5 compiled-runtime proof is required first so the same imported
 * build has already demonstrated its Full P3 broker/transaction boundary before P6 calibration.
 * A pending P5 restore/finalize checkpoint also blocks calibration to keep evidence isolated.
 */
export async function runP6DeveloperPageFlowCalibration(
  frame: FrameNode,
  options: P6DeveloperCalibrationOptions,
): Promise<P6DeveloperCalibrationOutcome> {
  if (!await options.runtimeProofValid()) {
    return {
      status: 'BLOCKED',
      reason: 'P5 imported-plugin runtime proof is not valid for this build.',
    };
  }

  if (await options.hasPendingCheckpoint()) {
    return {
      status: 'BLOCKED',
      reason: 'A P5 restore/finalize checkpoint is pending; resolve it before P6 clone calibration.',
    };
  }

  const planFn = options.overrides?.plan ?? defaultPlan;
  const plans = await planFn(frame);
  const eligible = plans.filter((plan) => (
    plan.decision === 'CALIBRATE'
    && plan.recipe === 'page-vertical-flow'
    && plan.pattern === 'page-vertical-flow'
  ));

  if (eligible.length === 0) {
    return {
      status: 'NO_CANDIDATE',
      reason: 'Fresh P6 analysis found no CALIBRATE page-vertical-flow plan for the selected Frame.',
      plans,
    };
  }

  if (eligible.length > 1) {
    return {
      status: 'NO_CANDIDATE',
      reason: 'Fresh P6 analysis produced multiple page-flow calibration plans; refusing ambiguous runtime evidence.',
      plans,
    };
  }

  const plan = eligible[0];
  if (!plan) {
    return { status: 'NO_CANDIDATE', reason: 'P6 calibration plan is unavailable.', plans };
  }

  const calibrate = options.overrides?.calibrate
    ?? ((target: FrameNode, targetPlan: AdvancedRecipePlan) => runP6PageFlowCloneCalibration(
      target,
      targetPlan,
      options.validateFullP3,
    ));

  const result = await calibrate(frame, plan);
  return { status: 'COMPLETED', plan, result };
}
