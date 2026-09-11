from pathlib import Path

# Add stable conflict error code.
path = Path('src/core/p14-preparation-types.ts')
text = path.read_text()
anchor = "  | 'P14_RECIPE_UNAUTHORIZED'\n  | 'P14_CLONE_FAILED'\n"
if text.count(anchor) != 1:
    raise SystemExit('P14 error code anchor drifted')
text = text.replace(anchor, "  | 'P14_RECIPE_UNAUTHORIZED'\n  | 'P14_TRANSACTION_CONFLICT'\n  | 'P14_CLONE_FAILED'\n", 1)
path.write_text(text)

# Wire source-scope lease into retained-duplicate transaction.
path = Path('src/core/p14-retained-duplicate-transaction.ts')
text = path.read_text()
import_anchor = "import { authorizeP14PreparationPlan } from './p14-plan-authorization';\n"
if text.count(import_anchor) != 1:
    raise SystemExit('coordinator import anchor drifted')
text = text.replace(
    import_anchor,
    import_anchor + "import {\n  DEFAULT_P14_SOURCE_TRANSACTION_COORDINATOR,\n  type P14SourceTransactionCoordinator,\n  type P14TransactionLease,\n} from './p14-transaction-coordinator';\n",
    1,
)

input_anchor = "  registry?: P14SafeRecipeRegistryV1;\n  transactionId: string;\n"
if text.count(input_anchor) != 1:
    raise SystemExit('coordinator input anchor drifted')
text = text.replace(
    input_anchor,
    "  registry?: P14SafeRecipeRegistryV1;\n  coordinator?: P14SourceTransactionCoordinator;\n  transactionId: string;\n",
    1,
)

auth_anchor = "  let beforeFingerprint: string;\n  try {\n    beforeFingerprint = await adapter.fingerprintSource(plan.source.nodeId);\n"
if text.count(auth_anchor) != 1:
    raise SystemExit('lease insertion anchor drifted')
lease_block = """  const coordinator = input.coordinator ?? DEFAULT_P14_SOURCE_TRANSACTION_COORDINATOR;\n  let lease: P14TransactionLease | null = null;\n  if (plan.status === 'READY') {\n    const leaseResult = coordinator.tryAcquire(plan.source.nodeId, input.transactionId);\n    if (!leaseResult.acquired) {\n      const isConflict = leaseResult.reason === 'SOURCE_BUSY' || leaseResult.reason === 'TRANSACTION_ID_BUSY';\n      const owner = leaseResult.ownerTransactionId\n        ? ` Active transaction: ${leaseResult.ownerTransactionId}.`\n        : '';\n      return baseReceipt({\n        plan,\n        transactionId: input.transactionId,\n        status: 'BLOCKED',\n        terminalState: 'BLOCKED',\n        beforeFingerprint: unknownFingerprint,\n        afterFingerprint: unknownFingerprint,\n        errors: [receiptError(\n          isConflict ? 'P14_TRANSACTION_CONFLICT' : 'P14_INTERNAL_INVARIANT_FAILED',\n          'coordination',\n          `Unable to acquire P14 source transaction lease (${leaseResult.reason}).${owner}`,\n          isConflict ? 'Wait for the active preparation transaction to finish, then retry.' : 'Use a non-empty unique transaction ID and valid source scope.',\n        )],\n        events: [...events, event(now, 'BLOCKED', 'source transaction lease unavailable')],\n      });\n    }\n    lease = leaseResult.lease;\n  }\n\n  try {\n"""
text = text.replace(auth_anchor, lease_block + auth_anchor, 1)

stripped = text.rstrip()
if not stripped.endswith('}'):
    raise SystemExit('transaction file final brace drifted')
body = stripped[:-1]
text = body + "  } finally {\n    if (lease) coordinator.release(lease);\n  }\n}\n"
path.write_text(text)
