from pathlib import Path

CONFIRM = Path('src/core/p14-preparation-confirmation.ts')
TEST = Path('tests/p14-confirmation.test.ts')
TX_TEST = Path('tests/p14-confirmation-transaction.test.ts')


def replace_exact(path: Path, old: str, new: str, count: int = 1):
    text = path.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} copies of anchor, found {actual}')
    path.write_text(text.replace(old, new, count))

replace_exact(
    CONFIRM,
    "import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';",
    "import { DEFAULT_P14_INPUT_BOUNDS, assessP14PreparationInputBounds } from './p14-input-bounds';",
)

replace_exact(
    CONFIRM,
    "function validTimestamp(value: unknown): value is string {\n  if (typeof value !== 'string' || value.length === 0 || value.length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength) {\n    return false;\n  }\n  const parsed = Date.parse(value);\n  return Number.isFinite(parsed);\n}",
    "const UTC_ISO_TIMESTAMP = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/;\n\nfunction validTimestamp(value: unknown): value is string {\n  if (typeof value !== 'string'\n    || value.length === 0\n    || value.length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength\n    || !UTC_ISO_TIMESTAMP.test(value)) {\n    return false;\n  }\n  const parsed = Date.parse(value);\n  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;\n}",
)

replace_exact(
    CONFIRM,
    "export function buildP14PreparationConfirmation(\n  plan: P14PreparationPlanV1,\n  confirmedAt: string,\n): P14PreparationConfirmationV1 {\n  const integrity = validateP14PreparationPlan(plan);",
    "export function buildP14PreparationConfirmation(\n  plan: P14PreparationPlanV1,\n  confirmedAt: string,\n): P14PreparationConfirmationV1 {\n  const bounds = assessP14PreparationInputBounds(plan);\n  if (!bounds.allowed) {\n    throw new Error('Cannot confirm a P14 preparation plan that exceeds bounded safety limits.');\n  }\n  const integrity = validateP14PreparationPlan(plan);",
)

OLD_PLAN_BLOCK = """  if (plan) {
    const planIntegrity = validateP14PreparationPlan(plan);
    if (!planIntegrity.valid) {
      failures.push('P14 preparation confirmation cannot bind to an invalid plan.');
    } else if (plan.status !== 'READY' || plan.eligibleActionIds.length === 0) {
      failures.push('P14 preparation confirmation can bind only to a READY mutating plan.');
    } else {
      if (value.planDigest !== plan.planDigest) failures.push('P14 preparation confirmation planDigest does not match the reviewed plan.');
      if (value.p13RunId !== plan.p13RunId) failures.push('P14 preparation confirmation p13RunId does not match the reviewed plan.');
      if (!isRecord(value.source)
        || value.source.nodeId !== plan.source.nodeId
        || value.source.fingerprint !== plan.source.fingerprint) {
        failures.push('P14 preparation confirmation source identity does not match the reviewed plan.');
      }
      if (actionIds && !sameStrings(actionIds, plan.eligibleActionIds)) {
        failures.push('P14 preparation confirmation eligibleActionIds do not match the reviewed plan.');
      }
    }
  }
"""
NEW_PLAN_BLOCK = """  if (plan) {
    const planBounds = assessP14PreparationInputBounds(plan);
    if (!planBounds.allowed) {
      failures.push('P14 preparation confirmation cannot bind to a plan that exceeds bounded safety limits.');
    } else {
      const planIntegrity = validateP14PreparationPlan(plan);
      if (!planIntegrity.valid) {
        failures.push('P14 preparation confirmation cannot bind to an invalid plan.');
      } else if (plan.status !== 'READY' || plan.eligibleActionIds.length === 0) {
        failures.push('P14 preparation confirmation can bind only to a READY mutating plan.');
      } else {
        if (value.planDigest !== plan.planDigest) failures.push('P14 preparation confirmation planDigest does not match the reviewed plan.');
        if (value.p13RunId !== plan.p13RunId) failures.push('P14 preparation confirmation p13RunId does not match the reviewed plan.');
        if (!isRecord(value.source)
          || value.source.nodeId !== plan.source.nodeId
          || value.source.fingerprint !== plan.source.fingerprint) {
          failures.push('P14 preparation confirmation source identity does not match the reviewed plan.');
        }
        if (actionIds && !sameStrings(actionIds, plan.eligibleActionIds)) {
          failures.push('P14 preparation confirmation eligibleActionIds do not match the reviewed plan.');
        }
      }
    }
  }
"""
replace_exact(CONFIRM, OLD_PLAN_BLOCK, NEW_PLAN_BLOCK)

replace_exact(
    TEST,
    "import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';",
    "import { computeP14PlanDigest } from '../src/core/p14-plan-integrity';\nimport { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';",
)

replace_exact(
    TEST,
    "  it('does not create mutation confirmation for a no-op plan or invalid timestamp', () => {\n    expect(() => buildP14PreparationConfirmation(noOpPlan(), CONFIRMED_AT)).toThrow(/only valid for READY plans/);\n    expect(() => buildP14PreparationConfirmation(readyPlan(), 'not-a-time')).toThrow(/valid bounded timestamp/);\n  });",
    "  it('does not create mutation confirmation for a no-op plan or invalid timestamp', () => {\n    expect(() => buildP14PreparationConfirmation(noOpPlan(), CONFIRMED_AT)).toThrow(/only valid for READY plans/);\n    expect(() => buildP14PreparationConfirmation(readyPlan(), 'not-a-time')).toThrow(/valid bounded timestamp/);\n    expect(() => buildP14PreparationConfirmation(readyPlan(), '2026-09-12')).toThrow(/valid bounded timestamp/);\n  });\n\n  it('bounds the reviewed plan before standalone confirmation integrity processing', () => {\n    const oversized = readyPlan();\n    oversized.p13RunId = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);\n    oversized.planDigest = computeP14PlanDigest({\n      p13RunId: oversized.p13RunId,\n      sourceNodeId: oversized.source.nodeId,\n      sourceFingerprint: oversized.source.fingerprint,\n      actions: oversized.actions,\n    });\n    expect(() => buildP14PreparationConfirmation(oversized, CONFIRMED_AT)).toThrow(/bounded safety limits/);\n\n    const otherwiseValid = buildP14PreparationConfirmation(readyPlan(), CONFIRMED_AT);\n    const validation = validateP14PreparationConfirmation(otherwiseValid, oversized);\n    expect(validation.valid).toBe(false);\n    expect(validation.failures.some((failure) => failure.includes('bounded safety limits'))).toBe(true);\n  });",
)

replace_exact(
    TX_TEST,
    "import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';",
    "import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';\nimport { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';",
)

replace_exact(
    TX_TEST,
    "    expect(receipt.source.beforeFingerprint).toBe('UNKNOWN');\n    expect(coordinator.acquireCalls).toBe(0);",
    "    expect(receipt.source.beforeFingerprint).toBe('UNKNOWN');\n    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);\n    expect(coordinator.acquireCalls).toBe(0);",
    count=2,
)
