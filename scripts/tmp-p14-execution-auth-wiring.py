from pathlib import Path

# Transaction wiring
path = Path('src/core/p14-retained-duplicate-transaction.ts')
text = path.read_text()

anchor = "import { validateP14PreparationPlan } from './p14-plan-integrity';\n"
if text.count(anchor) != 1:
    raise SystemExit('transaction plan-integrity import anchor drifted')
text = text.replace(anchor, anchor + "import { authorizeP14PreparationPlan } from './p14-plan-authorization';\nimport {\n  PRODUCTION_P14_SAFE_RECIPE_REGISTRY,\n  type P14SafeRecipeRegistryV1,\n} from './p14-safe-recipe-registry';\n", 1)

anchor = "export interface P14RetainedDuplicateRunInput {\n  plan: unknown;\n  transactionId: string;\n"
if text.count(anchor) != 1:
    raise SystemExit('transaction input anchor drifted')
text = text.replace(anchor, "export interface P14RetainedDuplicateRunInput {\n  plan: unknown;\n  registry?: P14SafeRecipeRegistryV1;\n  transactionId: string;\n", 1)

anchor = "  let beforeFingerprint: string;\n  try {\n    beforeFingerprint = await adapter.fingerprintSource(plan.source.nodeId);\n"
if text.count(anchor) != 1:
    raise SystemExit('transaction authorization insertion anchor drifted')
auth = """  const authorization = authorizeP14PreparationPlan(\n    plan,\n    input.registry ?? PRODUCTION_P14_SAFE_RECIPE_REGISTRY,\n  );\n  if (!authorization.authorized) {\n    return baseReceipt({\n      plan,\n      transactionId: input.transactionId,\n      status: 'BLOCKED',\n      terminalState: 'BLOCKED',\n      beforeFingerprint: unknownFingerprint,\n      afterFingerprint: unknownFingerprint,\n      errors: [receiptError(\n        'P14_RECIPE_UNAUTHORIZED',\n        'authorization',\n        `Preparation plan is not authorized by the current safe-recipe registry: ${authorization.failures.join(' | ')}`,\n        'Re-run Build Readiness and Safe Preparation with the current accepted recipe registry.',\n      )],\n      events: [...events, event(now, 'BLOCKED', 'safe-recipe authorization failed')],\n    });\n  }\n\n"""
text = text.replace(anchor, auth + anchor, 1)
path.write_text(text)

# Existing retained-duplicate test registry injection
path = Path('tests/p14-retained-duplicate.test.ts')
text = path.read_text()
anchor = "import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';\n"
if text.count(anchor) != 1:
    raise SystemExit('retained test import anchor drifted')
text = text.replace(anchor, anchor + "import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';\n", 1)
anchor = "function readyPlan(findingsOrder: 'normal' | 'reverse' = 'normal'): P14PreparationPlanV1 {\n"
if text.count(anchor) != 1:
    raise SystemExit('retained test readyPlan anchor drifted')
registry = """const testRegistry = createP14SafeRecipeRegistry([\n  { sourceRuleId: 'BR_ROW_MANUAL_FLOW', sourceRuleVersion: 1, recipe: rowRecipe },\n  { sourceRuleId: 'BR_TEXT_FIXED_HEIGHT', sourceRuleVersion: 1, recipe: textRecipe },\n]);\n\n"""
text = text.replace(anchor, registry + anchor, 1)
anchor = "  return runP14RetainedDuplicateTransaction({\n    plan,\n    transactionId: 'p14-tx-test',\n"
if text.count(anchor) != 1:
    raise SystemExit('retained test helper anchor drifted')
text = text.replace(anchor, "  return runP14RetainedDuplicateTransaction({\n    plan,\n    registry: testRegistry,\n    transactionId: 'p14-tx-test',\n", 1)
path.write_text(text)

# Existing integrity test registry injection
path = Path('tests/p14-integrity.test.ts')
text = path.read_text()
anchor = "import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';\n"
if text.count(anchor) != 1:
    raise SystemExit('integrity test import anchor drifted')
text = text.replace(anchor, anchor + "import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';\n", 1)
anchor = "function plan(): P14PreparationPlanV1 {\n"
if text.count(anchor) != 1:
    raise SystemExit('integrity test plan anchor drifted')
registry = """const testRegistry = createP14SafeRecipeRegistry([\n  { sourceRuleId: 'RULE_PARENT', sourceRuleVersion: 1, recipe: parentRecipe },\n  { sourceRuleId: 'RULE_CHILD', sourceRuleVersion: 1, recipe: childRecipe },\n]);\n\n"""
text = text.replace(anchor, registry + anchor, 1)
needle = "      plan: plan(),\n"
count = text.count(needle)
if count < 5:
    raise SystemExit(f'integrity test plan call anchors drifted: {count}')
text = text.replace(needle, "      plan: plan(),\n      registry: testRegistry,\n")
path.write_text(text)
