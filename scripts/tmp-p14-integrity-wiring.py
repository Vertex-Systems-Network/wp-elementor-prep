from pathlib import Path

path = Path('src/core/p14-retained-duplicate-transaction.ts')
text = path.read_text()

import_anchor = "import {\n  P14_PREPARATION_ENGINE_VERSION,"
if text.count(import_anchor) != 1:
    raise SystemExit('transaction import anchor drifted')
text = text.replace(
    import_anchor,
    "import { validateP14PreparationPlan } from './p14-plan-integrity';\nimport {\n  P14_PREPARATION_ENGINE_VERSION,",
    1,
)

plan_type_anchor = "export interface P14RetainedDuplicateRunInput {\n  plan: P14PreparationPlanV1;\n"
if text.count(plan_type_anchor) != 1:
    raise SystemExit('run input plan type anchor drifted')
text = text.replace(
    plan_type_anchor,
    "export interface P14RetainedDuplicateRunInput {\n  plan: unknown;\n",
    1,
)

authority_anchor = "    schemaVersion: 1,\n    engineVersion: P14_PREPARATION_ENGINE_VERSION,\n    transactionId: input.transactionId,"
if text.count(authority_anchor) != 1:
    raise SystemExit('base receipt authority anchor drifted')
text = text.replace(
    authority_anchor,
    "    schemaVersion: 1,\n    engineVersion: P14_PREPARATION_ENGINE_VERSION,\n    acceptanceAuthority: false,\n    targetCompatibilityClaim: false,\n    transactionId: input.transactionId,",
    1,
)

eligible_anchor = "function eligibleActions(plan: P14PreparationPlanV1): P14PreparationAction[] {\n  return plan.actions.filter((action) => action.decision === 'ELIGIBLE');\n}\n\n"
if text.count(eligible_anchor) != 1:
    raise SystemExit('eligible action helper anchor drifted')
invalid_helper = '''function invalidPlanReceipt(\n  value: unknown,\n  transactionId: string,\n  now: () => string,\n  failures: string[],\n): P14PreparationReceiptV1 {\n  const record = typeof value === 'object' && value !== null && !Array.isArray(value)\n    ? value as Record<string, unknown>\n    : {};\n  const source = typeof record.source === 'object' && record.source !== null && !Array.isArray(record.source)\n    ? record.source as Record<string, unknown>\n    : {};\n  const nodeId = typeof source.nodeId === 'string' && source.nodeId ? source.nodeId : 'UNKNOWN';\n  const p13RunId = typeof record.p13RunId === 'string' && record.p13RunId ? record.p13RunId : 'UNKNOWN';\n  const planDigest = typeof record.planDigest === 'string' && record.planDigest.startsWith('p14-plan-')\n    ? record.planDigest\n    : 'p14-plan-invalid';\n  const detail = `Invalid P14 preparation plan: ${failures.join(' | ')}`;\n  return {\n    schemaVersion: 1,\n    engineVersion: P14_PREPARATION_ENGINE_VERSION,\n    acceptanceAuthority: false,\n    targetCompatibilityClaim: false,\n    transactionId,\n    status: 'BLOCKED',\n    terminalState: 'BLOCKED',\n    source: {\n      nodeId,\n      beforeFingerprint: 'UNKNOWN',\n      afterFingerprint: 'UNKNOWN',\n    },\n    p13RunId,\n    planDigest,\n    appliedActions: [],\n    errors: [receiptError('P14_INTERNAL_INVARIANT_FAILED', 'preflight', detail)],\n    events: [\n      event(now, 'IDLE'),\n      event(now, 'PREFLIGHT'),\n      event(now, 'BLOCKED', 'plan integrity validation failed'),\n    ],\n  };\n}\n\n'''
text = text.replace(eligible_anchor, eligible_anchor + invalid_helper, 1)

start_anchor = "  const events: P14TransactionEvent[] = [event(now, 'IDLE'), event(now, 'PREFLIGHT')];\n  const plan = input.plan;\n  const unknownFingerprint = 'UNKNOWN';"
if text.count(start_anchor) != 1:
    raise SystemExit('transaction preflight anchor drifted')
text = text.replace(
    start_anchor,
    "  const events: P14TransactionEvent[] = [event(now, 'IDLE'), event(now, 'PREFLIGHT')];\n  const planIntegrity = validateP14PreparationPlan(input.plan);\n  if (!planIntegrity.valid) {\n    return invalidPlanReceipt(input.plan, input.transactionId, now, planIntegrity.failures);\n  }\n  const plan = input.plan as P14PreparationPlanV1;\n  const unknownFingerprint = 'UNKNOWN';",
    1,
)

path.write_text(text)
