from pathlib import Path

# Keep injected limits strictly at-or-below defaults and hard ceilings.
path = Path('src/core/p14-input-bounds.ts')
text = path.read_text()
anchor = "    const requested = overrides[key];\n    const base = positiveInteger(requested) ? requested : DEFAULT_P14_INPUT_BOUNDS[key];\n    result[key] = Math.min(base, HARD_P14_INPUT_BOUNDS[key]);\n"
if text.count(anchor) != 1:
    raise SystemExit('input bounds resolution anchor drifted')
text = text.replace(
    anchor,
    "    const requested = overrides[key];\n    const requestedLimit = positiveInteger(requested) ? requested : DEFAULT_P14_INPUT_BOUNDS[key];\n    result[key] = Math.min(requestedLimit, DEFAULT_P14_INPUT_BOUNDS[key], HARD_P14_INPUT_BOUNDS[key]);\n",
    1,
)
path.write_text(text)

# Wire bounded preflight as the first transaction gate.
path = Path('src/core/p14-retained-duplicate-transaction.ts')
text = path.read_text()
import_anchor = "import { validateP14PreparationPlan } from './p14-plan-integrity';\n"
if text.count(import_anchor) != 1:
    raise SystemExit('transaction bounds import anchor drifted')
text = text.replace(
    import_anchor,
    "import {\n  assessP14PreparationInputBounds,\n  type P14InputBoundsLimits,\n} from './p14-input-bounds';\n" + import_anchor,
    1,
)

input_anchor = "  coordinator?: P14SourceTransactionCoordinator;\n  transactionId: string;\n"
if text.count(input_anchor) != 1:
    raise SystemExit('transaction input bounds anchor drifted')
text = text.replace(
    input_anchor,
    "  coordinator?: P14SourceTransactionCoordinator;\n  inputBounds?: Partial<P14InputBoundsLimits>;\n  transactionId: string;\n",
    1,
)

signature_anchor = "function invalidPlanReceipt(\n  value: unknown,\n  transactionId: string,\n  now: () => string,\n  failures: string[],\n): P14PreparationReceiptV1 {\n"
if text.count(signature_anchor) != 1:
    raise SystemExit('invalidPlanReceipt signature anchor drifted')
text = text.replace(
    signature_anchor,
    "function invalidPlanReceipt(\n  value: unknown,\n  transactionId: string,\n  now: () => string,\n  failures: string[],\n  options: {\n    code?: P14ErrorCode;\n    stage?: string;\n    detailPrefix?: string;\n    eventDetail?: string;\n  } = {},\n): P14PreparationReceiptV1 {\n",
    1,
)

detail_anchor = "  const detail = `Invalid P14 preparation plan: ${failures.join(' | ')}`;\n"
if text.count(detail_anchor) != 1:
    raise SystemExit('invalidPlanReceipt detail anchor drifted')
text = text.replace(
    detail_anchor,
    "  const detail = `${options.detailPrefix ?? 'Invalid P14 preparation plan'}: ${failures.join(' | ')}`;\n",
    1,
)
error_anchor = "    errors: [receiptError('P14_INTERNAL_INVARIANT_FAILED', 'preflight', detail)],\n"
if text.count(error_anchor) != 1:
    raise SystemExit('invalidPlanReceipt error anchor drifted')
text = text.replace(
    error_anchor,
    "    errors: [receiptError(options.code ?? 'P14_INTERNAL_INVARIANT_FAILED', options.stage ?? 'preflight', detail)],\n",
    1,
)
event_anchor = "      event(now, 'BLOCKED', 'plan integrity validation failed'),\n"
if text.count(event_anchor) != 1:
    raise SystemExit('invalidPlanReceipt event anchor drifted')
text = text.replace(
    event_anchor,
    "      event(now, 'BLOCKED', options.eventDetail ?? 'plan integrity validation failed'),\n",
    1,
)

start_anchor = "  const events: P14TransactionEvent[] = [event(now, 'IDLE'), event(now, 'PREFLIGHT')];\n  const planIntegrity = validateP14PreparationPlan(input.plan);\n"
if text.count(start_anchor) != 1:
    raise SystemExit('transaction first gate anchor drifted')
preflight = """  const events: P14TransactionEvent[] = [event(now, 'IDLE'), event(now, 'PREFLIGHT')];\n  const inputBounds = assessP14PreparationInputBounds(input.plan, input.inputBounds);\n  if (!inputBounds.allowed) {\n    const failures = inputBounds.failures.map(\n      (failure) => `${failure.code} at ${failure.path}: ${failure.actual} > ${failure.limit}`,\n    );\n    return invalidPlanReceipt(input.plan, input.transactionId, now, failures, {\n      code: 'P14_INPUT_TOO_LARGE',\n      stage: 'bounds',\n      detailPrefix: 'P14 input exceeds bounded safety limits',\n      eventDetail: 'bounded input preflight failed',\n    });\n  }\n  const planIntegrity = validateP14PreparationPlan(input.plan);\n"""
text = text.replace(start_anchor, preflight, 1)
path.write_text(text)
