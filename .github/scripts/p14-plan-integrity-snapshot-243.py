from pathlib import Path
import subprocess

BASE = 'a2246d564c63912d1f74014a87d9181796eb2386'
SOURCE = Path('src/core/p14-plan-integrity.ts')
TEST = Path('tests/p14-plan-integrity-semantic-snapshot.test.ts')

text = SOURCE.read_text(encoding='utf-8')
imports = "import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';\nimport { snapshotP14SemanticInputEvidence } from './p14-semantic-input-snapshot';\n"
if imports.strip() in text:
    raise SystemExit('snapshot imports already present')
text = imports + text

old_signature = 'export function validateP14PreparationPlan(value: unknown): P14PlanIntegrityResult {'
new_signature = 'function validateP14PreparationPlanSnapshot(value: unknown): P14PlanIntegrityResult {'
if text.count(old_signature) != 1:
    raise SystemExit(f'expected one public validator signature, found {text.count(old_signature)}')
text = text.replace(old_signature, new_signature, 1)

wrapper = '''\n\n/**\n * Treats standalone plan-integrity input as untrusted runtime evidence. The known plan schema is\n * captured once into bounded plain values before any integrity semantics are evaluated.\n */\nexport function validateP14PreparationPlan(value: unknown): P14PlanIntegrityResult {\n  const snapshot = snapshotP14SemanticInputEvidence(\n    value,\n    undefined,\n    DEFAULT_P14_INPUT_BOUNDS,\n  );\n  if (!snapshot.valid) {\n    return {\n      valid: false,\n      failures: snapshot.failures.length > 0\n        ? snapshot.failures\n        : ['P14 plan semantic evidence could not be captured safely.'],\n    };\n  }\n  return validateP14PreparationPlanSnapshot(snapshot.plan);\n}\n'''
if wrapper.strip() in text:
    raise SystemExit('validator wrapper already present')
text = text.rstrip() + wrapper
SOURCE.write_text(text, encoding='utf-8')

TEST.write_text(r'''import { describe, expect, it } from 'vitest';
import { validateP14PreparationPlan } from '../src/core/p14-plan-integrity';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import type {
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
} from '../src/core/p14-preparation-types';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_PLAN_SNAPSHOT',
  version: 1,
  sourceRuleIds: ['RULE_PLAN_SNAPSHOT'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_VALIDATE_PLAN_SNAPSHOT',
  conflictsWith: [],
  orderClass: '01-plan-snapshot',
};

function validPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-plan-snapshot',
    sourceNodeId: '1:1',
    sourceFingerprint: 'source-plan-snapshot',
    findings: [{
      findingId: 'finding-plan-snapshot',
      sourceRuleId: 'RULE_PLAN_SNAPSHOT',
      sourceRuleVersion: 1,
      targetNodeIds: ['2:1'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

describe('P14 standalone plan-integrity semantic snapshot', () => {
  it('fails closed when the top-level plan proxy is revoked', () => {
    const revoked = Proxy.revocable(validPlan() as unknown as object, {});
    revoked.revoke();

    let result;
    expect(() => {
      result = validateP14PreparationPlan(revoked.proxy);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.failures.some((failure: string) => failure.includes('plan could not be classified safely'))).toBe(true);
  });

  it('captures a stateful top-level semantic field exactly once', () => {
    const plan = validPlan() as any;
    let statusReads = 0;
    Object.defineProperty(plan, 'status', {
      enumerable: true,
      configurable: true,
      get() {
        statusReads += 1;
        return statusReads === 1 ? 'READY' : 'BLOCKED';
      },
    });

    expect(validateP14PreparationPlan(plan)).toEqual({ valid: true, failures: [] });
    expect(statusReads).toBe(1);
  });

  it('captures source and action semantic getters exactly once', () => {
    const plan = validPlan() as any;
    const expectedActionId = plan.actions[0].actionId;
    let sourceReads = 0;
    let actionReads = 0;

    Object.defineProperty(plan.source, 'nodeId', {
      enumerable: true,
      configurable: true,
      get() {
        sourceReads += 1;
        return sourceReads === 1 ? '1:1' : 'forged-source';
      },
    });
    Object.defineProperty(plan.actions[0], 'actionId', {
      enumerable: true,
      configurable: true,
      get() {
        actionReads += 1;
        return actionReads === 1 ? expectedActionId : 'forged-action';
      },
    });

    expect(validateP14PreparationPlan(plan)).toEqual({ valid: true, failures: [] });
    expect(sourceReads).toBe(1);
    expect(actionReads).toBe(1);
  });

  it('copies action-array indices once before integrity semantics', () => {
    const plan = validPlan() as any;
    const sourceActions = plan.actions;
    let indexReads = 0;
    plan.actions = new Proxy(sourceActions, {
      get(target, property, receiver) {
        if (typeof property === 'string' && /^\\d+$/.test(property)) {
          indexReads += 1;
          if (indexReads > target.length) throw new Error('actions were re-read after semantic capture');
        }
        return Reflect.get(target, property, receiver);
      },
    });

    expect(validateP14PreparationPlan(plan)).toEqual({ valid: true, failures: [] });
    expect(indexReads).toBe(sourceActions.length);
  });

  it('fails closed for revoked action collection evidence', () => {
    const plan = validPlan() as any;
    const revoked = Proxy.revocable([...plan.actions], {});
    revoked.revoke();
    plan.actions = revoked.proxy;

    let result;
    expect(() => {
      result = validateP14PreparationPlan(plan);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.failures.some((failure: string) => failure.includes('plan.actions could not be classified safely'))).toBe(true);
  });

  it('fails closed for revoked nested action evidence', () => {
    const plan = validPlan() as any;
    const revoked = Proxy.revocable(plan.actions[0] as object, {});
    revoked.revoke();
    plan.actions[0] = revoked.proxy;

    let result;
    expect(() => {
      result = validateP14PreparationPlan(plan);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.failures.some((failure: string) => failure.includes('plan.actions[0] could not be classified safely'))).toBe(true);
  });

  it('preserves canonical planner output integrity', () => {
    expect(validateP14PreparationPlan(validPlan())).toEqual({ valid: true, failures: [] });
  });
});
''', encoding='utf-8')

# The helper files must net to zero against main.
subprocess.run([
    'git', 'rm', '-f',
    '.github/workflows/p14-plan-integrity-snapshot-243.yml',
    '.github/scripts/p14-plan-integrity-snapshot-243.py',
], check=True)

expected = sorted([
    'src/core/p14-plan-integrity.ts',
    'tests/p14-plan-integrity-semantic-snapshot.test.ts',
])
subprocess.run(['git', 'add', *expected], check=True)
changed = subprocess.check_output(['git', 'diff', '--cached', '--name-only', BASE], text=True).splitlines()
if sorted(changed) != expected:
    raise SystemExit(f'Unexpected staged net changed-file set: {changed!r}; expected {expected!r}')

subprocess.run(['git', 'config', 'user.name', 'github-actions[bot]'], check=True)
subprocess.run(['git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], check=True)
subprocess.run(['git', 'commit', '-m', 'P14: snapshot standalone plan integrity evidence'], check=True)
subprocess.run(['git', 'push', 'origin', 'HEAD:fix/p14-plan-integrity-snapshot-243'], check=True)
