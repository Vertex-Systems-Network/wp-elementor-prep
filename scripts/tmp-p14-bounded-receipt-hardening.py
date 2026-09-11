from pathlib import Path

path = Path('src/core/p14-retained-duplicate-transaction.ts')
text = path.read_text()

import_anchor = "import {\n  assessP14PreparationInputBounds,\n  type P14InputBoundsLimits,\n} from './p14-input-bounds';\n"
if text.count(import_anchor) != 1:
    raise SystemExit('input bounds import anchor drifted')
text = text.replace(
    import_anchor,
    "import {\n  DEFAULT_P14_INPUT_BOUNDS,\n  assessP14PreparationInputBounds,\n  type P14InputBoundsLimits,\n} from './p14-input-bounds';\n",
    1,
)

identity_anchor = """  const nodeId = typeof source.nodeId === 'string' && source.nodeId ? source.nodeId : 'UNKNOWN';\n  const p13RunId = typeof record.p13RunId === 'string' && record.p13RunId ? record.p13RunId : 'UNKNOWN';\n  const planDigest = typeof record.planDigest === 'string' && record.planDigest.startsWith('p14-plan-')\n    ? record.planDigest\n    : 'p14-plan-invalid';\n"""
if text.count(identity_anchor) != 1:
    raise SystemExit('invalid receipt identity anchor drifted')
replacement = """  const boundedIdentity = (value: unknown, fallback: string): string =>\n    typeof value === 'string'\n      && value.length > 0\n      && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength\n      ? value\n      : fallback;\n  const nodeId = boundedIdentity(source.nodeId, 'UNKNOWN');\n  const p13RunId = boundedIdentity(record.p13RunId, 'UNKNOWN');\n  const rawPlanDigest = boundedIdentity(record.planDigest, 'p14-plan-invalid');\n  const planDigest = rawPlanDigest.startsWith('p14-plan-') ? rawPlanDigest : 'p14-plan-invalid';\n"""
text = text.replace(identity_anchor, replacement, 1)
path.write_text(text)

path = Path('tests/p14-input-bounds.test.ts')
text = path.read_text()
anchor = "  it('blocks oversized input before coordinator or adapter access', async () => {\n"
if text.count(anchor) != 1:
    raise SystemExit('bounds test insertion anchor drifted')
new_test = """  it('does not echo oversized identities into the rejection receipt', async () => {\n    const value = plan() as any;\n    value.source.nodeId = 'n'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 100);\n    value.p13RunId = 'r'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 100);\n    value.planDigest = `p14-plan-${'d'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 100)}`;\n    const receipt = await runP14RetainedDuplicateTransaction({\n      plan: value,\n      registry,\n      transactionId: 'p14-bounded-receipt',\n      now: () => '2026-09-12T00:00:00.000Z',\n    }, new CountingAdapter());\n\n    expect(receipt.status).toBe('BLOCKED');\n    expect(receipt.errors[0]?.code).toBe('P14_INPUT_TOO_LARGE');\n    expect(receipt.source.nodeId).toBe('UNKNOWN');\n    expect(receipt.p13RunId).toBe('UNKNOWN');\n    expect(receipt.planDigest).toBe('p14-plan-invalid');\n    expect(JSON.stringify(receipt).length).toBeLessThan(10000);\n  });\n\n"""
text = text.replace(anchor, new_test + anchor, 1)
path.write_text(text)
