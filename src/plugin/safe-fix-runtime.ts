import { runCandidateTransaction } from '../core/transaction';
import type { TransactionResult } from '../core/transaction-types';
import type { ValidationReport } from '../core/validation-types';
import type { SafeRecipePlan } from '../core/safe-recipe-types';
import { FigmaCandidateTransactionAdapter } from './figma-transaction-adapter';
import { applySafeRecipeToCandidate } from './safe-recipe-transform';

export type FullP3Validator = (original: FrameNode, candidate: FrameNode) => Promise<ValidationReport>;

export interface SafeFixRuntimeResult {
  plan: SafeRecipePlan;
  transaction: TransactionResult | null;
  skippedReason?: string;
}

/**
 * Run one already-planned P5 recipe through the P4 transaction boundary.
 *
 * This function does not expose a production UI action yet. It is the integration seam used for
 * calibration and, later, an explicit user-triggered Safe Fix action.
 */
export async function runSafeFixTransaction(
  original: FrameNode,
  plan: SafeRecipePlan,
  validateFullP3: FullP3Validator,
): Promise<SafeFixRuntimeResult> {
  if (plan.decision !== 'ELIGIBLE' || !plan.recipe) {
    return {
      plan,
      transaction: null,
      skippedReason: `Plan decision is ${plan.decision}; no candidate transaction was started.`,
    };
  }

  const adapter = new FigmaCandidateTransactionAdapter({
    transform: (candidate) => {
      const result = applySafeRecipeToCandidate(candidate, plan);
      if (!result.applied) {
        throw new Error(`Safe recipe refused candidate transform: ${result.reason}`);
      }
    },
    validate: validateFullP3,
  });

  const transaction = await runCandidateTransaction(original.id, adapter, `p5-${plan.recipe}-${Date.now().toString(36)}`);
  return { plan, transaction };
}
