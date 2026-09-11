from pathlib import Path

TX = Path('src/core/p14-retained-duplicate-transaction.ts')
RECEIPT = Path('src/core/p14-preparation-receipt.ts')


def replace_exact(path: Path, old: str, new: str, count: int = 1):
    text = path.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} copies of anchor, found {actual}')
    path.write_text(text.replace(old, new, count))

replace_exact(
    TX,
    """import {\n  DEFAULT_P14_INPUT_BOUNDS,\n  assessP14PreparationInputBounds,\n  type P14InputBoundsLimits,\n} from './p14-input-bounds';\n""",
    """import {\n  DEFAULT_P14_INPUT_BOUNDS,\n  assessP14PreparationInputBounds,\n  type P14InputBoundsLimits,\n} from './p14-input-bounds';\nimport {\n  validateP14CandidateHandleEvidence,\n  validateP14RecipeExecutionResultEvidence,\n  validateP14RetentionEvidence,\n} from './p14-adapter-evidence';\n""",
)

replace_exact(
    TX,
    """  let candidate: P14CandidateHandle;\n  events.push(event(now, 'CLONING'));\n  try {\n    candidate = await adapter.cloneSource(plan.source.nodeId, input.transactionId);\n    if (candidate.sourceNodeId !== plan.source.nodeId || !candidate.candidateNodeId || candidate.candidateNodeId === plan.source.nodeId) {\n      throw new Error('Candidate adapter returned an invalid source/candidate identity binding.');\n    }\n  } catch (error) {\n""",
    """  let candidate: P14CandidateHandle;\n  events.push(event(now, 'CLONING'));\n  try {\n    const rawCandidate: unknown = await adapter.cloneSource(plan.source.nodeId, input.transactionId);\n    const candidateEvidence = validateP14CandidateHandleEvidence(rawCandidate, plan.source.nodeId);\n    if (!candidateEvidence.valid || !candidateEvidence.value) {\n      throw new Error(`Candidate adapter returned invalid evidence: ${candidateEvidence.failures.join(' | ')}`);\n    }\n    candidate = candidateEvidence.value;\n  } catch (error) {\n""",
)

replace_exact(
    TX,
    """    try {\n      const result = await adapter.applyRecipe(candidate, action);\n      if (result.actionId !== action.actionId || result.recipeId !== action.recipeId) {\n        throw new Error('Recipe execution result does not match the planned action identity.');\n      }\n      const outcomeCount = (result.applied ? 1 : 0) + (result.becameNoOp === true ? 1 : 0);\n      if (outcomeCount !== 1) {\n        throw new Error(result.detail ?? 'Recipe result must be exactly one of applied or accepted idempotent no-op.');\n      }\n      appliedActions.push(result);\n    } catch (error) {\n""",
    """    try {\n      const rawResult: unknown = await adapter.applyRecipe(candidate, action);\n      const executionEvidence = validateP14RecipeExecutionResultEvidence(rawResult, action);\n      if (!executionEvidence.valid || !executionEvidence.value) {\n        throw new Error(`Recipe execution evidence is invalid: ${executionEvidence.failures.join(' | ')}`);\n      }\n      appliedActions.push(executionEvidence.value);\n    } catch (error) {\n""",
)

replace_exact(
    TX,
    """  events.push(event(now, 'FINALIZING'));\n  let retention;\n  try {\n    retention = await adapter.retainCandidate(\n      candidate,\n      input.transactionId,\n      input.preparedName?.trim() || 'Prepared Duplicate',\n    );\n    if (retention.transactionId !== input.transactionId\n      || retention.sourceNodeId !== plan.source.nodeId\n      || retention.retainedNodeId !== candidate.candidateNodeId) {\n      throw new Error('Retention evidence does not match the transaction/source/candidate identity.');\n    }\n  } catch (error) {\n""",
    """  events.push(event(now, 'FINALIZING'));\n  const preparedName = input.preparedName?.trim() || 'Prepared Duplicate';\n  let retention;\n  try {\n    const rawRetention: unknown = await adapter.retainCandidate(\n      candidate,\n      input.transactionId,\n      preparedName,\n    );\n    const retentionEvidence = validateP14RetentionEvidence(rawRetention, {\n      transactionId: input.transactionId,\n      sourceNodeId: plan.source.nodeId,\n      retainedNodeId: candidate.candidateNodeId,\n      preparedName,\n    });\n    if (!retentionEvidence.valid || !retentionEvidence.value) {\n      throw new Error(`Retention adapter returned invalid evidence: ${retentionEvidence.failures.join(' | ')}`);\n    }\n    retention = retentionEvidence.value;\n  } catch (error) {\n""",
)

replace_exact(
    RECEIPT,
    """import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';\n""",
    """import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';\nimport {\n  isP14BoundedIdentity,\n  validateP14RecipeExecutionResultEvidence,\n  validateP14RetentionEvidence,\n} from './p14-adapter-evidence';\n""",
)

replace_exact(
    RECEIPT,
    """  if (Array.isArray(value.appliedActions)) {\n    const ids: string[] = [];\n    for (const [index, action] of value.appliedActions.entries()) {\n      if (!isRecord(action)\n        || !nonEmptyString(action.actionId)\n        || !nonEmptyString(action.recipeId)\n        || typeof action.applied !== 'boolean') {\n        failures.push(`appliedActions[${index}] is malformed.`);\n        continue;\n      }\n      if (action.becameNoOp !== undefined && typeof action.becameNoOp !== 'boolean') {\n        failures.push(`appliedActions[${index}].becameNoOp must be boolean when present.`);\n      }\n      const outcomeCount = (action.applied ? 1 : 0) + (action.becameNoOp === true ? 1 : 0);\n      if (outcomeCount !== 1) {\n        failures.push(`appliedActions[${index}] must be exactly one of applied or accepted idempotent no-op.`);\n      }\n      ids.push(action.actionId);\n    }\n    if (new Set(ids).size !== ids.length) failures.push('appliedActions contains duplicate action IDs.');\n  }\n""",
    """  if (Array.isArray(value.appliedActions)) {\n    const ids: string[] = [];\n    for (const [index, action] of value.appliedActions.entries()) {\n      const evidence = validateP14RecipeExecutionResultEvidence(action);\n      if (!evidence.valid || !evidence.value) {\n        failures.push(`appliedActions[${index}] is malformed or oversized.`);\n        continue;\n      }\n      ids.push(evidence.value.actionId);\n    }\n    if (new Set(ids).size !== ids.length) failures.push('appliedActions contains duplicate action IDs.');\n  }\n""",
)

replace_exact(
    RECEIPT,
    """  const candidate = isRecord(value.candidate) ? value.candidate : null;\n  if (value.candidate !== undefined && (!candidate || !nonEmptyString(candidate.nodeId) || typeof candidate.retained !== 'boolean')) {\n    failures.push('candidate is malformed.');\n  }\n  const retention = isRecord(value.retention) ? value.retention : null;\n  if (value.retention !== undefined) {\n    if (!retention\n      || !nonEmptyString(retention.transactionId)\n      || !nonEmptyString(retention.sourceNodeId)\n      || !nonEmptyString(retention.retainedNodeId)\n      || !nonEmptyString(retention.preparedName)) {\n      failures.push('retention is malformed.');\n    } else {\n      if (retention.transactionId !== value.transactionId) failures.push('Retention transactionId contradicts the receipt.');\n      if (isRecord(value.source) && retention.sourceNodeId !== value.source.nodeId) failures.push('Retention sourceNodeId contradicts the receipt source.');\n      if (candidate && retention.retainedNodeId !== candidate.nodeId) failures.push('Retention retainedNodeId contradicts the receipt candidate.');\n    }\n  }\n""",
    """  const candidate = isRecord(value.candidate) ? value.candidate : null;\n  if (value.candidate !== undefined\n    && (!candidate || !isP14BoundedIdentity(candidate.nodeId) || typeof candidate.retained !== 'boolean')) {\n    failures.push('candidate is malformed or oversized.');\n  }\n  const retentionValidation = value.retention === undefined\n    ? null\n    : validateP14RetentionEvidence(value.retention);\n  const retention = retentionValidation?.valid && retentionValidation.value\n    ? retentionValidation.value\n    : null;\n  if (value.retention !== undefined) {\n    if (!retention) {\n      failures.push('retention is malformed or oversized.');\n    } else {\n      if (retention.transactionId !== value.transactionId) failures.push('Retention transactionId contradicts the receipt.');\n      if (isRecord(value.source) && retention.sourceNodeId !== value.source.nodeId) failures.push('Retention sourceNodeId contradicts the receipt source.');\n      if (candidate && retention.retainedNodeId !== candidate.nodeId) failures.push('Retention retainedNodeId contradicts the receipt candidate.');\n    }\n  }\n""",
)
