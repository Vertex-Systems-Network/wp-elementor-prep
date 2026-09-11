from pathlib import Path

TYPES = Path('src/core/p14-preparation-types.ts')
TX = Path('src/core/p14-retained-duplicate-transaction.ts')
TEST = Path('tests/p14-retained-duplicate.test.ts')


def replace_exact(path: Path, old: str, new: str, count: int = 1):
    text = path.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} copies of anchor, found {actual}')
    path.write_text(text.replace(old, new, count))

replace_exact(
    TYPES,
    """export interface P14RetainedDuplicateAdapter {\n  fingerprintSource(sourceNodeId: string): Promise<string>;\n  cloneSource(sourceNodeId: string, transactionId: string): Promise<P14CandidateHandle>;\n  applyRecipe(candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult>;\n""",
    """export interface P14RetainedDuplicateAdapter {\n  fingerprintSource(sourceNodeId: string): Promise<string>;\n  cloneSource(sourceNodeId: string, transactionId: string): Promise<P14CandidateHandle>;\n  /**\n   * Required by the transaction core before every action after the first planned recipe has run.\n   * The return value is untrusted runtime evidence and is validated before the next mutation.\n   */\n  assessActionEligibility?(\n    candidate: P14CandidateHandle,\n    action: P14PreparationAction,\n  ): Promise<unknown>;\n  applyRecipe(candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult>;\n""",
)

replace_exact(
    TX,
    """import { validateP14RescoreEvidence } from './p14-rescore-evidence';\n""",
    """import { validateP14RescoreEvidence } from './p14-rescore-evidence';\nimport { validateP14RuntimeActionEligibilityEvidence } from './p14-runtime-action-eligibility';\n""",
)

APPLY_ANCHOR = """    try {\n      const result = await adapter.applyRecipe(candidate, action);\n"""
RECHECK_BLOCK = """    const completedRecipeIds = new Set(appliedActions.map((result) => result.recipeId));\n    const missingPrerequisiteRecipeIds = action.prerequisiteRecipeIds.filter(\n      (recipeId) => !completedRecipeIds.has(recipeId),\n    );\n    if (missingPrerequisiteRecipeIds.length > 0) {\n      const discardError = await discardCandidate(adapter, candidate);\n      const firstMissing = missingPrerequisiteRecipeIds[0] ?? 'UNKNOWN';\n      return cleanupOutcome({\n        plan,\n        transactionId: input.transactionId,\n        beforeFingerprint,\n        afterFingerprint: unknownFingerprint,\n        candidate,\n        appliedActions,\n        events,\n        now,\n        primaryError: receiptError(\n          'P14_RECIPE_PREREQUISITE_MISSING',\n          'transform-recheck',\n          `Action ${action.actionId} no longer has completed prerequisite execution evidence (${missingPrerequisiteRecipeIds.length} missing; first: ${firstMissing}).`,\n          'Re-run Build Readiness and Safe Preparation to produce a current deterministic plan.',\n        ),\n        discardError,\n      });\n    }\n\n    if (appliedActions.length > 0) {\n      const assessActionEligibility = adapter.assessActionEligibility;\n      if (typeof assessActionEligibility !== 'function') {\n        const discardError = await discardCandidate(adapter, candidate);\n        return cleanupOutcome({\n          plan,\n          transactionId: input.transactionId,\n          beforeFingerprint,\n          afterFingerprint: unknownFingerprint,\n          candidate,\n          appliedActions,\n          events,\n          now,\n          primaryError: receiptError(\n            'P14_TRANSFORM_FAILED',\n            'transform-recheck',\n            `Adapter cannot re-evaluate runtime eligibility for action ${action.actionId} after a prior recipe.`,\n            'Use an adapter that implements bounded runtime action eligibility reassessment, then re-run the current plan.',\n          ),\n          discardError,\n        });\n      }\n\n      let runtimeEligibility;\n      try {\n        const rawEligibility: unknown = await assessActionEligibility.call(adapter, candidate, action);\n        const evidence = validateP14RuntimeActionEligibilityEvidence(rawEligibility, action);\n        if (!evidence.valid || !evidence.value) {\n          throw new Error(`Runtime action eligibility evidence is invalid: ${evidence.failures.join(' | ')}`);\n        }\n        runtimeEligibility = evidence.value;\n      } catch (error) {\n        const discardError = await discardCandidate(adapter, candidate);\n        return cleanupOutcome({\n          plan,\n          transactionId: input.transactionId,\n          beforeFingerprint,\n          afterFingerprint: unknownFingerprint,\n          candidate,\n          appliedActions,\n          events,\n          now,\n          primaryError: receiptError('P14_TRANSFORM_FAILED', 'transform-recheck', messageOf(error)),\n          discardError,\n        });\n      }\n\n      if (!runtimeEligibility.eligible) {\n        const discardError = await discardCandidate(adapter, candidate);\n        const boundedDetail = runtimeEligibility.detail ? ` ${runtimeEligibility.detail.slice(0, 1024)}` : '';\n        return cleanupOutcome({\n          plan,\n          transactionId: input.transactionId,\n          beforeFingerprint,\n          afterFingerprint: unknownFingerprint,\n          candidate,\n          appliedActions,\n          events,\n          now,\n          primaryError: receiptError(\n            'P14_RECIPE_PREREQUISITE_MISSING',\n            'transform-recheck',\n            `Runtime eligibility changed for action ${action.actionId}; continuing would use stale recipe assumptions.${boundedDetail}`,\n            'Re-run Build Readiness and Safe Preparation to replan against the current candidate/source state.',\n          ),\n          discardError,\n        });\n      }\n    }\n\n    try {\n      const result = await adapter.applyRecipe(candidate, action);\n"""
replace_exact(TX, APPLY_ANCHOR, RECHECK_BLOCK)

replace_exact(
    TEST,
    """  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {\n    this.cloneCalls += 1;\n    return { sourceNodeId, candidateNodeId: 'candidate:1' };\n  }\n\n  async applyRecipe(candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {\n""",
    """  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {\n    this.cloneCalls += 1;\n    return { sourceNodeId, candidateNodeId: 'candidate:1' };\n  }\n\n  async assessActionEligibility(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<unknown> {\n    return {\n      actionId: action.actionId,\n      recipeId: action.recipeId,\n      checkedPrerequisiteRecipeIds: [...action.prerequisiteRecipeIds],\n      eligible: true,\n    };\n  }\n\n  async applyRecipe(candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {\n""",
)
