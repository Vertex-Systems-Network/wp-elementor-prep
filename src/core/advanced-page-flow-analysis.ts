import type { AdvancedRecipePlan } from './advanced-recipe-types';
import {
  analyzeLinearLayoutGeometry,
  type LinearLayoutFrameGeometry,
  type LinearLayoutGeometryPlan,
} from './linear-layout-analysis';

export type AdvancedPageFlowAnalysis =
  | { ok: true; plan: LinearLayoutGeometryPlan }
  | { ok: false; reason: string };

/**
 * Strict preflight for the first P6 clone-only transformer candidate.
 *
 * Page vertical-flow calibration is deliberately narrower than the classifier. It refuses any plan
 * with preservation relationships and then reuses the proven P5 linear geometry analysis. This
 * means broad/sequential page evidence alone is never enough to authorize even clone mutation.
 */
export function analyzeAdvancedPageFlowCalibration(
  recipePlan: AdvancedRecipePlan,
  frame: LinearLayoutFrameGeometry,
): AdvancedPageFlowAnalysis {
  if (
    recipePlan.decision !== 'CALIBRATE'
    || recipePlan.recipe !== 'page-vertical-flow'
    || recipePlan.pattern !== 'page-vertical-flow'
  ) {
    return { ok: false, reason: 'Plan is not a CALIBRATE page-vertical-flow recipe.' };
  }

  if (recipePlan.preserveNodeIds.length > 0) {
    return {
      ok: false,
      reason: 'Page flow has preservation relationships; calibration-only vertical normalization is refused.',
    };
  }

  if (!recipePlan.futureMutationRequiresFullP3 || !recipePlan.futureMutationRequiresP4Rollback) {
    return { ok: false, reason: 'Advanced plan is missing mandatory future P3/P4 safety requirements.' };
  }

  const analysis = analyzeLinearLayoutGeometry(frame, 'VERTICAL');
  if (!analysis.ok) return analysis;
  return { ok: true, plan: analysis.plan };
}
