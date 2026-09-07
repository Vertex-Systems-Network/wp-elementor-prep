import { runCandidateTransaction } from '../core/transaction';
import type { CommitEvidence, TransactionResult } from '../core/transaction-types';
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

function checkpointAdapter(): FigmaCandidateTransactionAdapter {
  return new FigmaCandidateTransactionAdapter({
    transform: () => undefined,
    validate: async () => {
      throw new Error('Checkpoint-only adapter does not validate candidates.');
    },
  });
}

/**
 * Run one already-planned P5 recipe through the P4 transaction boundary.
 *
 * The approved original is never handed to the transformer. A successful full-P3 validation is
 * mandatory before P4 can commit the staged candidate.
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

/** Whether a committed Safe Fix is currently retaining its previous original for bounded undo. */
export async function hasPendingSafeFixCheckpoint(): Promise<boolean> {
  return checkpointAdapter().hasPendingUndo();
}

/** Restore the retained approved original and remove the committed candidate. */
export async function restoreLastSafeFix(): Promise<CommitEvidence | null> {
  return checkpointAdapter().restoreLastCommit();
}

/**
 * Irreversibly accept the latest committed candidate and remove the retained previous original.
 * This keeps storage bounded to one checkpoint.
 */
export async function finalizeLastSafeFix(): Promise<boolean> {
  return checkpointAdapter().finalizeLastCommit();
}
