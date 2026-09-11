from pathlib import Path

TYPES = Path('src/core/p14-preparation-types.ts')
RECEIPT = Path('src/core/p14-preparation-receipt.ts')
BOUNDS = Path('src/core/p14-input-bounds.ts')
TX = Path('src/core/p14-retained-duplicate-transaction.ts')
RETAINED_TEST = Path('tests/p14-retained-duplicate.test.ts')
INTEGRITY_TEST = Path('tests/p14-integrity.test.ts')
COORD_TEST = Path('tests/p14-transaction-coordinator.test.ts')


def replace_exact(path: Path, old: str, new: str, count: int = 1):
    text = path.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} copies of anchor, found {actual}')
    path.write_text(text.replace(old, new, count))

replace_exact(
    TYPES,
    "  | 'P14_RECIPE_UNAUTHORIZED'\n  | 'P14_TRANSACTION_CONFLICT'",
    "  | 'P14_RECIPE_UNAUTHORIZED'\n  | 'P14_CONFIRMATION_REQUIRED'\n  | 'P14_CONFIRMATION_MISMATCH'\n  | 'P14_TRANSACTION_CONFLICT'",
)

replace_exact(
    RECEIPT,
    "  'P14_RECIPE_CONFLICT',\n  'P14_CLONE_FAILED',",
    "  'P14_RECIPE_CONFLICT',\n  'P14_RECIPE_UNAUTHORIZED',\n  'P14_CONFIRMATION_REQUIRED',\n  'P14_CONFIRMATION_MISMATCH',\n  'P14_TRANSACTION_CONFLICT',\n  'P14_CLONE_FAILED',",
)

replace_exact(
    BOUNDS,
    "export interface P14InputBoundsContext {\n  transactionId?: unknown;\n  preparedName?: unknown;\n}",
    "export interface P14InputBoundsContext {\n  transactionId?: unknown;\n  preparedName?: unknown;\n  confirmation?: unknown;\n}",
)

replace_exact(
    BOUNDS,
    "  checkString(context.transactionId, 'transactionId', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n  checkString(context.preparedName, 'preparedName', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n\n  if (!isRecord(value)) {",
    "  checkString(context.transactionId, 'transactionId', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n  checkString(context.preparedName, 'preparedName', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n  if (isRecord(context.confirmation)) {\n    checkString(context.confirmation.confirmedAt, 'confirmation.confirmedAt', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n    checkString(context.confirmation.planDigest, 'confirmation.planDigest', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n    checkString(context.confirmation.p13RunId, 'confirmation.p13RunId', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n    if (isRecord(context.confirmation.source)) {\n      checkString(context.confirmation.source.nodeId, 'confirmation.source.nodeId', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n      checkString(context.confirmation.source.fingerprint, 'confirmation.source.fingerprint', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);\n    }\n    const confirmationActionIds = context.confirmation.eligibleActionIds;\n    if (checkArrayLength(confirmationActionIds, 'confirmation.eligibleActionIds', limits.maxBucketActionIds, 'P14_BOUND_MAX_BUCKET_ACTION_IDS', failures)) {\n      checkIdentityArrayItems(confirmationActionIds, 'confirmation.eligibleActionIds', limits.maxIdentityLength, failures);\n    }\n  }\n\n  if (!isRecord(value)) {",
)

replace_exact(
    TX,
    "import { validateP14PreparationPlan } from './p14-plan-integrity';\nimport { authorizeP14PreparationPlan } from './p14-plan-authorization';",
    "import { validateP14PreparationPlan } from './p14-plan-integrity';\nimport { authorizeP14PreparationPlan } from './p14-plan-authorization';\nimport { validateP14PreparationConfirmation } from './p14-preparation-confirmation';",
)

replace_exact(
    TX,
    "  inputBounds?: Partial<P14InputBoundsLimits>;\n  transactionId: string;",
    "  inputBounds?: Partial<P14InputBoundsLimits>;\n  confirmation?: unknown;\n  transactionId: string;",
)

replace_exact(
    TX,
    "  const inputBounds = assessP14PreparationInputBounds(input.plan, input.inputBounds, {\n    transactionId: input.transactionId,\n    preparedName: input.preparedName,\n  });",
    "  const inputBounds = assessP14PreparationInputBounds(input.plan, input.inputBounds, {\n    transactionId: input.transactionId,\n    preparedName: input.preparedName,\n    confirmation: input.confirmation,\n  });",
)

AUTH_ANCHOR = """  if (!authorization.authorized) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'BLOCKED',
      terminalState: 'BLOCKED',
      beforeFingerprint: unknownFingerprint,
      afterFingerprint: unknownFingerprint,
      errors: [receiptError(
        'P14_RECIPE_UNAUTHORIZED',
        'authorization',
        `Preparation plan is not authorized by the current safe-recipe registry: ${authorization.failures.join(' | ')}`,
        'Re-run Build Readiness and Safe Preparation with the current accepted recipe registry.',
      )],
      events: [...events, event(now, 'BLOCKED', 'safe-recipe authorization failed')],
    });
  }

  const coordinator = input.coordinator ?? DEFAULT_P14_SOURCE_TRANSACTION_COORDINATOR;
"""
AUTH_REPLACEMENT = """  if (!authorization.authorized) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'BLOCKED',
      terminalState: 'BLOCKED',
      beforeFingerprint: unknownFingerprint,
      afterFingerprint: unknownFingerprint,
      errors: [receiptError(
        'P14_RECIPE_UNAUTHORIZED',
        'authorization',
        `Preparation plan is not authorized by the current safe-recipe registry: ${authorization.failures.join(' | ')}`,
        'Re-run Build Readiness and Safe Preparation with the current accepted recipe registry.',
      )],
      events: [...events, event(now, 'BLOCKED', 'safe-recipe authorization failed')],
    });
  }

  if (plan.status === 'READY') {
    events.push(event(now, 'PLAN_READY', 'plan integrity and safe-recipe authorization passed'));
    events.push(event(now, 'AWAITING_CONFIRMATION', 'explicit plan-bound confirmation required'));
    if (input.confirmation === undefined || input.confirmation === null) {
      return baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'BLOCKED',
        beforeFingerprint: unknownFingerprint,
        afterFingerprint: unknownFingerprint,
        errors: [receiptError(
          'P14_CONFIRMATION_REQUIRED',
          'confirmation',
          'Mutating P14 preparation requires explicit confirmation bound to the exact reviewed plan.',
          'Review the proposed changes and create a confirmation for the current plan before retrying.',
        )],
        events: [...events, event(now, 'BLOCKED', 'explicit preparation confirmation missing')],
      });
    }
    const confirmation = validateP14PreparationConfirmation(input.confirmation, plan);
    if (!confirmation.valid) {
      return baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'BLOCKED',
        beforeFingerprint: unknownFingerprint,
        afterFingerprint: unknownFingerprint,
        errors: [receiptError(
          'P14_CONFIRMATION_MISMATCH',
          'confirmation',
          `Preparation confirmation does not match the current reviewed plan: ${confirmation.failures.join(' | ')}`,
          'Review and confirm the current preparation plan again before retrying.',
        )],
        events: [...events, event(now, 'BLOCKED', 'preparation confirmation validation failed')],
      });
    }
  }

  const coordinator = input.coordinator ?? DEFAULT_P14_SOURCE_TRANSACTION_COORDINATOR;
"""
replace_exact(TX, AUTH_ANCHOR, AUTH_REPLACEMENT)

replace_exact(
    TX,
    "  events.push(event(now, 'PLAN_READY'));\n  events.push(event(now, 'AWAITING_CONFIRMATION', 'execution call represents explicit confirmation'));\n\n  if (plan.status === 'NO_CHANGES_NEEDED') {",
    "  if (plan.status === 'NO_CHANGES_NEEDED') {\n    events.push(event(now, 'PLAN_READY', 'non-mutating no-op plan ready'));",
)

replace_exact(
    RETAINED_TEST,
    "import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';",
    "import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';\nimport { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';",
)

replace_exact(
    RETAINED_TEST,
    "    plan,\n    registry: testRegistry,\n    transactionId: 'p14-tx-test',",
    "    plan,\n    registry: testRegistry,\n    confirmation: plan.status === 'READY' ? buildP14PreparationConfirmation(plan, fixedNow()) : undefined,\n    transactionId: 'p14-tx-test',",
)

replace_exact(
    COORD_TEST,
    "import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';",
    "import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';\nimport { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';",
)

COORD_OLD = """  return runP14RetainedDuplicateTransaction({
    plan: readyPlan(sourceNodeId, sourceFingerprint),
    registry,
    coordinator,
    transactionId,
    preparedName: 'Prepared',
    now: () => '2026-09-12T00:00:00.000Z',
  }, adapter);
"""
COORD_NEW = """  const preparedPlan = readyPlan(sourceNodeId, sourceFingerprint);
  return runP14RetainedDuplicateTransaction({
    plan: preparedPlan,
    registry,
    confirmation: buildP14PreparationConfirmation(preparedPlan, '2026-09-12T00:00:00.000Z'),
    coordinator,
    transactionId,
    preparedName: 'Prepared',
    now: () => '2026-09-12T00:00:00.000Z',
  }, adapter);
"""
replace_exact(COORD_TEST, COORD_OLD, COORD_NEW)

replace_exact(
    INTEGRITY_TEST,
    "import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';",
    "import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';\nimport { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';",
)

replace_exact(
    INTEGRITY_TEST,
    "      plan: plan(),\n      registry: testRegistry,",
    "      plan: plan(),\n      confirmation: buildP14PreparationConfirmation(plan(), fixedNow()),\n      registry: testRegistry,",
    count=5,
)
