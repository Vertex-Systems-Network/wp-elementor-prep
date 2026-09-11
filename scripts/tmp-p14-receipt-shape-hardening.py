from pathlib import Path

receipt_path = Path('src/core/p14-preparation-receipt.ts')
transaction_path = Path('src/core/p14-retained-duplicate-transaction.ts')
test_path = Path('tests/p14-integrity.test.ts')

receipt = receipt_path.read_text()

terminal_anchor = '''const TERMINAL_STATES = new Set<P14TransactionState>([\n  'COMPLETE',\n  'CANCELLED',\n  'REJECTED',\n  'BLOCKED',\n  'SOURCE_STALE',\n  'CLEANUP_REQUIRED',\n]);\n'''
if receipt.count(terminal_anchor) != 1:
    raise SystemExit('terminal states anchor drifted')
extra_constants = '''\nconst EVENT_STATES = new Set<P14TransactionState>([\n  'IDLE',\n  'PREFLIGHT',\n  'PLAN_READY',\n  'AWAITING_CONFIRMATION',\n  'CLONING',\n  'TRANSFORMING',\n  'VALIDATING',\n  'RESCORING',\n  'FINALIZING',\n  'COMPLETE',\n  'CANCELLED',\n  'REJECTED',\n  'BLOCKED',\n  'SOURCE_STALE',\n  'CLEANUP_REQUIRED',\n]);\n\nconst ERROR_CODES = new Set([\n  'P14_P13_REPORT_REQUIRED',\n  'P14_P13_REPORT_STALE',\n  'P14_NO_ELIGIBLE_RECIPES',\n  'P14_RECIPE_VERSION_MISMATCH',\n  'P14_RECIPE_PREREQUISITE_MISSING',\n  'P14_RECIPE_CONFLICT',\n  'P14_CLONE_FAILED',\n  'P14_SOURCE_CHANGED_DURING_RUN',\n  'P14_TRANSFORM_FAILED',\n  'P14_VALIDATION_FAILED',\n  'P14_RESCORE_FAILED',\n  'P14_FINALIZE_FAILED',\n  'P14_DISCARD_FAILED',\n  'P14_CANCELLED',\n  'P14_INPUT_TOO_LARGE',\n  'P14_INTERNAL_INVARIANT_FAILED',\n]);\n'''
receipt = receipt.replace(terminal_anchor, terminal_anchor + extra_constants, 1)

array_anchor = '''  if (!Array.isArray(value.appliedActions)) failures.push('appliedActions must be an array.');\n  if (!Array.isArray(value.errors)) failures.push('errors must be an array.');\n  if (!Array.isArray(value.events) || value.events.length === 0) failures.push('events must be a non-empty array.');\n\n  if (Array.isArray(value.events) && value.events.length > 0) {\n    const first = value.events[0];\n    const last = value.events[value.events.length - 1];\n    if (!isRecord(first) || first.state !== 'IDLE') failures.push('Receipt event history must start at IDLE.');\n    if (!isRecord(last) || last.state !== value.terminalState) failures.push('Receipt event history must end at terminalState.');\n  }\n'''
if receipt.count(array_anchor) != 1:
    raise SystemExit('receipt arrays anchor drifted')
array_replacement = '''  if (!Array.isArray(value.appliedActions)) failures.push('appliedActions must be an array.');\n  if (!Array.isArray(value.errors)) failures.push('errors must be an array.');\n  if (!Array.isArray(value.events) || value.events.length === 0) failures.push('events must be a non-empty array.');\n\n  if (Array.isArray(value.errors)) {\n    for (const [index, error] of value.errors.entries()) {\n      if (!isRecord(error)\n        || typeof error.code !== 'string'\n        || !ERROR_CODES.has(error.code)\n        || !nonEmptyString(error.stage)\n        || !nonEmptyString(error.detail)\n        || (error.recovery !== undefined && typeof error.recovery !== 'string')) {\n        failures.push(`errors[${index}] is malformed or uses an unsupported code.`);\n      }\n    }\n  }\n\n  if (Array.isArray(value.events) && value.events.length > 0) {\n    for (const [index, item] of value.events.entries()) {\n      if (!isRecord(item)\n        || typeof item.state !== 'string'\n        || !EVENT_STATES.has(item.state as P14TransactionState)\n        || !nonEmptyString(item.at)\n        || Number.isNaN(Date.parse(item.at))\n        || (item.detail !== undefined && typeof item.detail !== 'string')) {\n        failures.push(`events[${index}] is malformed.`);\n      }\n    }\n    const first = value.events[0];\n    const last = value.events[value.events.length - 1];\n    if (!isRecord(first) || first.state !== 'IDLE') failures.push('Receipt event history must start at IDLE.');\n    if (!isRecord(last) || last.state !== value.terminalState) failures.push('Receipt event history must end at terminalState.');\n  }\n'''
receipt = receipt.replace(array_anchor, array_replacement, 1)

outcome_anchor = '''      if (!action.applied && action.becameNoOp !== true) {\n        failures.push(`appliedActions[${index}] must be applied or an accepted idempotent no-op.`);\n      }\n      ids.push(action.actionId);\n'''
if receipt.count(outcome_anchor) != 1:
    raise SystemExit('receipt action outcome anchor drifted')
outcome_replacement = '''      if (action.becameNoOp !== undefined && typeof action.becameNoOp !== 'boolean') {\n        failures.push(`appliedActions[${index}].becameNoOp must be boolean when present.`);\n      }\n      const outcomeCount = (action.applied ? 1 : 0) + (action.becameNoOp === true ? 1 : 0);\n      if (outcomeCount !== 1) {\n        failures.push(`appliedActions[${index}] must be exactly one of applied or accepted idempotent no-op.`);\n      }\n      ids.push(action.actionId);\n'''
receipt = receipt.replace(outcome_anchor, outcome_replacement, 1)

validation_anchor = '''  if (value.validation !== undefined) {\n    if (!isRecord(value.validation) || typeof value.validation.passed !== 'boolean' || !Array.isArray(value.validation.checks)) {\n      failures.push('validation is malformed.');\n    } else if (value.validation.passed) {\n      const failedRequired = value.validation.checks.some((check) => isRecord(check) && check.required === true && check.passed !== true);\n      if (failedRequired) failures.push('validation.passed contradicts a failed required check.');\n    }\n  }\n'''
if receipt.count(validation_anchor) != 1:
    raise SystemExit('validation summary anchor drifted')
validation_replacement = '''  if (value.validation !== undefined) {\n    if (!isRecord(value.validation) || typeof value.validation.passed !== 'boolean' || !Array.isArray(value.validation.checks)) {\n      failures.push('validation is malformed.');\n    } else {\n      for (const [index, check] of value.validation.checks.entries()) {\n        if (!isRecord(check)\n          || !nonEmptyString(check.id)\n          || typeof check.passed !== 'boolean'\n          || typeof check.required !== 'boolean'\n          || (check.detail !== undefined && typeof check.detail !== 'string')) {\n          failures.push(`validation.checks[${index}] is malformed.`);\n        }\n      }\n      if (value.validation.passed) {\n        const failedRequired = value.validation.checks.some((check) => isRecord(check) && check.required === true && check.passed !== true);\n        if (failedRequired) failures.push('validation.passed contradicts a failed required check.');\n      }\n    }\n  }\n'''
receipt = receipt.replace(validation_anchor, validation_replacement, 1)
receipt_path.write_text(receipt)

transaction = transaction_path.read_text()
transaction_anchor = '''      if (!result.applied && !result.becameNoOp) {\n        throw new Error(result.detail ?? 'Recipe did not apply and did not resolve to an accepted no-op.');\n      }\n      appliedActions.push(result);\n'''
if transaction.count(transaction_anchor) != 1:
    raise SystemExit('transaction recipe outcome anchor drifted')
transaction_replacement = '''      const outcomeCount = (result.applied ? 1 : 0) + (result.becameNoOp === true ? 1 : 0);\n      if (outcomeCount !== 1) {\n        throw new Error(result.detail ?? 'Recipe result must be exactly one of applied or accepted idempotent no-op.');\n      }\n      appliedActions.push(result);\n'''
transaction = transaction.replace(transaction_anchor, transaction_replacement, 1)
transaction_path.write_text(transaction)

test = test_path.read_text()
mode_anchor = '  becomeNoOp = false;\n'
if test.count(mode_anchor) != 1:
    raise SystemExit('adapter mode anchor drifted')
test = test.replace(mode_anchor, "  becomeNoOp = false;\n  bothOutcomes = false;\n", 1)

apply_anchor = '''      applied: !this.becomeNoOp,\n      ...(this.becomeNoOp ? { becameNoOp: true } : {}),\n'''
if test.count(apply_anchor) != 1:
    raise SystemExit('adapter apply outcome anchor drifted')
test = test.replace(
    apply_anchor,
    "      applied: this.bothOutcomes || !this.becomeNoOp,\n      ...((this.becomeNoOp || this.bothOutcomes) ? { becameNoOp: true } : {}),\n",
    1,
)

idempotent_anchor = '''  it('fails closed on forged authority, target compatibility and retention identity', async () => {\n'''
if test.count(idempotent_anchor) != 1:
    raise SystemExit('receipt forgery test anchor drifted')
extra_test = '''  it('rejects contradictory dual recipe outcomes and discards the candidate', async () => {\n    const adapter = new CountingAdapter();\n    adapter.bothOutcomes = true;\n    const receipt = await runP14RetainedDuplicateTransaction({\n      plan: plan(),\n      transactionId: 'p14-dual-outcome',\n      now: fixedNow,\n    }, adapter);\n\n    expect(receipt.status).toBe('REJECTED');\n    expect(receipt.errors[0]?.code).toBe('P14_TRANSFORM_FAILED');\n    expect(adapter.calls.discard).toBe(1);\n    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);\n  });\n\n  it('rejects malformed error, event and validation-check evidence', async () => {\n    const receipt = await runP14RetainedDuplicateTransaction({\n      plan: plan(),\n      transactionId: 'p14-shape-source',\n      now: fixedNow,\n    }, new CountingAdapter());\n\n    const badError = JSON.parse(JSON.stringify(receipt)) as any;\n    badError.status = 'REJECTED';\n    badError.terminalState = 'REJECTED';\n    badError.candidate.retained = false;\n    delete badError.retention;\n    badError.errors = ['not-an-error-object'];\n    badError.events[badError.events.length - 1] = { state: 'REJECTED', at: fixedNow() };\n    expect(validateP14PreparationReceipt(badError).failures.some((failure) => failure.includes('errors[0]'))).toBe(true);\n\n    const badEvent = JSON.parse(JSON.stringify(receipt)) as any;\n    badEvent.events[1].at = 'not-a-timestamp';\n    expect(validateP14PreparationReceipt(badEvent).failures.some((failure) => failure.includes('events[1]'))).toBe(true);\n\n    const badCheck = JSON.parse(JSON.stringify(receipt)) as any;\n    badCheck.validation.checks[0] = { id: 'required', passed: true };\n    expect(validateP14PreparationReceipt(badCheck).failures.some((failure) => failure.includes('validation.checks[0]'))).toBe(true);\n  });\n\n'''
test = test.replace(idempotent_anchor, extra_test + idempotent_anchor, 1)
test_path.write_text(test)
