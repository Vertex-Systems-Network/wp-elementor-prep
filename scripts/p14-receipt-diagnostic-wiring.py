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
    """import {\n  validateP14ValidationEvidence,\n  type P14BoundedValidationEvidence,\n} from './p14-validation-evidence';\nimport { validateP14RescoreEvidence } from './p14-rescore-evidence';\n""",
    """import {\n  validateP14ValidationEvidence,\n  type P14BoundedValidationEvidence,\n} from './p14-validation-evidence';\nimport {\n  boundedP14DiagnosticDetail,\n  boundedP14DiagnosticIdentity,\n  boundedP14RuntimeErrorMessage,\n} from './p14-receipt-evidence';\nimport { validateP14RescoreEvidence } from './p14-rescore-evidence';\n""",
)

replace_exact(
    TX,
    """function messageOf(error: unknown): string {\n  return error instanceof Error ? error.message : String(error);\n}\n""",
    """function messageOf(error: unknown): string {\n  return boundedP14RuntimeErrorMessage(error);\n}\n""",
)

replace_exact(
    TX,
    """function event(now: () => string, state: P14TransactionState, detail?: string): P14TransactionEvent {\n  return { state, at: now(), ...(detail ? { detail } : {}) };\n}\n\nfunction receiptError(code: P14ErrorCode, stage: string, detail: string, recovery?: string): P14ReceiptError {\n  return { code, stage, detail, ...(recovery ? { recovery } : {}) };\n}\n""",
    """function event(now: () => string, state: P14TransactionState, detail?: string): P14TransactionEvent {\n  return {\n    state,\n    at: now(),\n    ...(detail ? { detail: boundedP14DiagnosticDetail(detail) } : {}),\n  };\n}\n\nfunction receiptError(code: P14ErrorCode, stage: string, detail: string, recovery?: string): P14ReceiptError {\n  return {\n    code,\n    stage: boundedP14DiagnosticIdentity(stage, 'unknown-stage'),\n    detail: boundedP14DiagnosticDetail(detail),\n    ...(recovery ? { recovery: boundedP14DiagnosticDetail(recovery) } : {}),\n  };\n}\n""",
)

replace_exact(
    RECEIPT,
    """import { validateP14ValidationEvidence } from './p14-validation-evidence';\nimport {\n  P14_UNKNOWN_SOURCE_FINGERPRINT,\n""",
    """import { validateP14ValidationEvidence } from './p14-validation-evidence';\nimport {\n  hasBoundedP14ReceiptCollectionLength,\n  isP14BoundedDiagnosticDetail,\n  isP14BoundedNonEmptyDiagnosticDetail,\n  isP14BoundedReceiptIdentity,\n  P14_MAX_RECEIPT_COLLECTION_ITEMS,\n} from './p14-receipt-evidence';\nimport {\n  P14_UNKNOWN_SOURCE_FINGERPRINT,\n""",
)

replace_exact(
    RECEIPT,
    """  if (!nonEmptyString(value.transactionId)) failures.push('transactionId is missing.');\n""",
    """  if (!isP14BoundedReceiptIdentity(value.transactionId)) failures.push('transactionId is missing or oversized.');\n""",
)
replace_exact(
    RECEIPT,
    """  if (!nonEmptyString(value.p13RunId)) failures.push('p13RunId is missing.');\n  if (!nonEmptyString(value.planDigest) || !String(value.planDigest).startsWith('p14-plan-')) failures.push('planDigest is missing or malformed.');\n  if (!isRecord(value.source)\n    || !nonEmptyString(value.source.nodeId)\n""",
    """  if (!isP14BoundedReceiptIdentity(value.p13RunId)) failures.push('p13RunId is missing or oversized.');\n  if (!isP14BoundedReceiptIdentity(value.planDigest) || !value.planDigest.startsWith('p14-plan-')) failures.push('planDigest is missing, malformed or oversized.');\n  if (!isRecord(value.source)\n    || !isP14BoundedReceiptIdentity(value.source.nodeId)\n""",
)

replace_exact(
    RECEIPT,
    """  if (!Array.isArray(value.appliedActions)) failures.push('appliedActions must be an array.');\n  if (!Array.isArray(value.errors)) failures.push('errors must be an array.');\n  if (!Array.isArray(value.events) || value.events.length === 0) failures.push('events must be a non-empty array.');\n\n  if (Array.isArray(value.errors)) {\n    for (const [index, error] of value.errors.entries()) {\n      if (!isRecord(error)\n        || typeof error.code !== 'string'\n        || !ERROR_CODES.has(error.code)\n        || !nonEmptyString(error.stage)\n        || !nonEmptyString(error.detail)\n        || (error.recovery !== undefined && typeof error.recovery !== 'string')) {\n        failures.push(`errors[${index}] is malformed or uses an unsupported code.`);\n      }\n    }\n  }\n\n  if (Array.isArray(value.events) && value.events.length > 0) {\n    for (const [index, item] of value.events.entries()) {\n      if (!isRecord(item)\n        || typeof item.state !== 'string'\n        || !EVENT_STATES.has(item.state as P14TransactionState)\n        || !nonEmptyString(item.at)\n        || Number.isNaN(Date.parse(item.at))\n        || (item.detail !== undefined && typeof item.detail !== 'string')) {\n        failures.push(`events[${index}] is malformed.`);\n      }\n    }\n    const first = value.events[0];\n    const last = value.events[value.events.length - 1];\n    if (!isRecord(first) || first.state !== 'IDLE') failures.push('Receipt event history must start at IDLE.');\n    if (!isRecord(last) || last.state !== value.terminalState) failures.push('Receipt event history must end at terminalState.');\n  }\n\n  if (Array.isArray(value.appliedActions)) {\n    const ids: string[] = [];\n    for (const [index, action] of value.appliedActions.entries()) {\n      const evidence = validateP14RecipeExecutionResultEvidence(action);\n      if (!evidence.valid || !evidence.value) {\n        failures.push(`appliedActions[${index}] is malformed or oversized.`);\n        continue;\n      }\n      ids.push(evidence.value.actionId);\n    }\n    if (new Set(ids).size !== ids.length) failures.push('appliedActions contains duplicate action IDs.');\n  }\n""",
    """  const appliedActions = hasBoundedP14ReceiptCollectionLength(value.appliedActions)\n    ? value.appliedActions\n    : [];\n  const errors = hasBoundedP14ReceiptCollectionLength(value.errors)\n    ? value.errors\n    : [];\n  const events = hasBoundedP14ReceiptCollectionLength(value.events)\n    ? value.events\n    : [];\n\n  if (!Array.isArray(value.appliedActions)) failures.push('appliedActions must be an array.');\n  else if (value.appliedActions.length > P14_MAX_RECEIPT_COLLECTION_ITEMS) failures.push('appliedActions exceeds the bounded receipt item count.');\n  if (!Array.isArray(value.errors)) failures.push('errors must be an array.');\n  else if (value.errors.length > P14_MAX_RECEIPT_COLLECTION_ITEMS) failures.push('errors exceeds the bounded receipt item count.');\n  if (!Array.isArray(value.events)) failures.push('events must be an array.');\n  else if (value.events.length > P14_MAX_RECEIPT_COLLECTION_ITEMS) failures.push('events exceeds the bounded receipt item count.');\n  else if (value.events.length === 0) failures.push('events must be a non-empty array.');\n\n  for (const [index, error] of errors.entries()) {\n    if (!isRecord(error)\n      || typeof error.code !== 'string'\n      || !ERROR_CODES.has(error.code)\n      || !isP14BoundedReceiptIdentity(error.stage)\n      || !isP14BoundedNonEmptyDiagnosticDetail(error.detail)\n      || (error.recovery !== undefined && !isP14BoundedDiagnosticDetail(error.recovery))) {\n      failures.push(`errors[${index}] is malformed, oversized or uses an unsupported code.`);\n    }\n  }\n\n  if (events.length > 0) {\n    for (const [index, item] of events.entries()) {\n      if (!isRecord(item)\n        || typeof item.state !== 'string'\n        || !EVENT_STATES.has(item.state as P14TransactionState)\n        || !isP14BoundedReceiptIdentity(item.at)\n        || Number.isNaN(Date.parse(item.at))\n        || (item.detail !== undefined && !isP14BoundedDiagnosticDetail(item.detail))) {\n        failures.push(`events[${index}] is malformed or oversized.`);\n      }\n    }\n    const first = events[0];\n    const last = events[events.length - 1];\n    if (!isRecord(first) || first.state !== 'IDLE') failures.push('Receipt event history must start at IDLE.');\n    if (!isRecord(last) || last.state !== value.terminalState) failures.push('Receipt event history must end at terminalState.');\n  }\n\n  const ids: string[] = [];\n  for (const [index, action] of appliedActions.entries()) {\n    const evidence = validateP14RecipeExecutionResultEvidence(action);\n    if (!evidence.valid || !evidence.value) {\n      failures.push(`appliedActions[${index}] is malformed or oversized.`);\n      continue;\n    }\n    ids.push(evidence.value.actionId);\n  }\n  if (new Set(ids).size !== ids.length) failures.push('appliedActions contains duplicate action IDs.');\n""",
)

replace_exact(
    RECEIPT,
    """  const errors = Array.isArray(value.errors) ? value.errors : [];\n\n""",
    """\n""",
)
replace_exact(
    RECEIPT,
    """    if (Array.isArray(value.appliedActions) && value.appliedActions.length > 0) failures.push('NO_CHANGES_NEEDED cannot carry applied actions.');\n""",
    """    if (appliedActions.length > 0) failures.push('NO_CHANGES_NEEDED cannot carry applied actions.');\n""",
)
