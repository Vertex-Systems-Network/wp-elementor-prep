from pathlib import Path

BOUNDS = Path('src/core/p14-input-bounds.ts')
TX = Path('src/core/p14-retained-duplicate-transaction.ts')
TEST = Path('tests/p14-input-bounds.test.ts')


def replace_exact(path: Path, old: str, new: str, count: int = 1):
    text = path.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} copies of anchor, found {actual}')
    path.write_text(text.replace(old, new, count))

replace_exact(
    BOUNDS,
    "export interface P14InputBoundsLimits {\n  maxActions: number;\n  maxBlockers: number;\n  maxTargetsPerAction: number;\n  maxTotalTargetReferences: number;\n  maxPrerequisitesPerAction: number;\n  maxConflictsPerAction: number;\n  maxMutationFieldsPerAction: number;\n  maxBucketActionIds: number;\n  maxBlockerActionIds: number;\n  maxIdentityLength: number;\n  maxDetailLength: number;\n}\n",
    "export interface P14InputBoundsLimits {\n  maxActions: number;\n  maxBlockers: number;\n  maxTargetsPerAction: number;\n  maxTotalTargetReferences: number;\n  maxPrerequisitesPerAction: number;\n  maxConflictsPerAction: number;\n  maxMutationFieldsPerAction: number;\n  maxBucketActionIds: number;\n  maxBlockerActionIds: number;\n  maxIdentityLength: number;\n  maxDetailLength: number;\n}\n\nexport interface P14InputBoundsContext {\n  transactionId?: unknown;\n  preparedName?: unknown;\n}\n",
)

replace_exact(
    BOUNDS,
    "export function assessP14PreparationInputBounds(\n  value: unknown,\n  overrides: Partial<P14InputBoundsLimits> = {},\n): P14InputBoundsResult {",
    "export function assessP14PreparationInputBounds(\n  value: unknown,\n  overrides: Partial<P14InputBoundsLimits> = {},\n  context: P14InputBoundsContext = {},\n): P14InputBoundsResult {",
)

replace_exact(
    BOUNDS,
    "  let blockerCount = 0;\n  let totalTargetReferences = 0;\n\n  if (!isRecord(value)) {",
    "  let blockerCount = 0;\n  let totalTargetReferences = 0;\n\n  checkString(context.transactionId, 'transactionId', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n  checkString(context.preparedName, 'preparedName', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n\n  if (!isRecord(value)) {",
)

replace_exact(
    TX,
    "  const inputBounds = assessP14PreparationInputBounds(input.plan, input.inputBounds);",
    "  const inputBounds = assessP14PreparationInputBounds(input.plan, input.inputBounds, {\n    transactionId: input.transactionId,\n    preparedName: input.preparedName,\n  });",
)

replace_exact(
    TX,
    "  const nodeId = boundedIdentity(source.nodeId, 'UNKNOWN');\n  const p13RunId = boundedIdentity(record.p13RunId, 'UNKNOWN');",
    "  const safeTransactionId = boundedIdentity(transactionId, 'p14-transaction-invalid');\n  const nodeId = boundedIdentity(source.nodeId, 'UNKNOWN');\n  const p13RunId = boundedIdentity(record.p13RunId, 'UNKNOWN');",
)

replace_exact(
    TX,
    "    transactionId,\n    status: 'BLOCKED',\n    terminalState: 'BLOCKED',",
    "    transactionId: safeTransactionId,\n    status: 'BLOCKED',\n    terminalState: 'BLOCKED',",
)

text = TEST.read_text()
anchor = "  it('blocks oversized input before coordinator or adapter access', async () => {"
if text.count(anchor) != 1:
    raise SystemExit('test insertion anchor mismatch')
insert = """  it('bounds run-level transaction and prepared-name identities', () => {\n    const oversizedTransaction = assessP14PreparationInputBounds(\n      plan(),\n      {},\n      { transactionId: 't'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1) },\n    );\n    expect(oversizedTransaction.allowed).toBe(false);\n    expect(oversizedTransaction.failures).toContainEqual(expect.objectContaining({\n      code: 'P14_BOUND_MAX_IDENTITY_LENGTH',\n      path: 'transactionId',\n    }));\n\n    const oversizedName = assessP14PreparationInputBounds(\n      plan(),\n      {},\n      { preparedName: 'p'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1) },\n    );\n    expect(oversizedName.allowed).toBe(false);\n    expect(oversizedName.failures).toContainEqual(expect.objectContaining({\n      code: 'P14_BOUND_MAX_IDENTITY_LENGTH',\n      path: 'preparedName',\n    }));\n  });\n\n  it('sanitizes an oversized transaction id before coordinator or adapter access', async () => {\n    const adapter = new CountingAdapter();\n    const coordinator = new SpyCoordinator();\n    const receipt = await runP14RetainedDuplicateTransaction({\n      plan: plan(),\n      registry,\n      coordinator,\n      transactionId: 't'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1),\n      now: () => '2026-09-12T00:00:00.000Z',\n    }, adapter);\n\n    expect(receipt.status).toBe('BLOCKED');\n    expect(receipt.errors[0]?.code).toBe('P14_INPUT_TOO_LARGE');\n    expect(receipt.transactionId).toBe('p14-transaction-invalid');\n    expect(coordinator.acquireCalls).toBe(0);\n    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);\n  });\n\n"""
TEST.write_text(text.replace(anchor, insert + anchor, 1))
