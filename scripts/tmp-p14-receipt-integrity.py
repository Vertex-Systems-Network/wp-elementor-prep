from pathlib import Path

transaction_path = Path('src/core/p14-retained-duplicate-transaction.ts')
test_path = Path('tests/p14-retained-duplicate.test.ts')

text = transaction_path.read_text()

clone_anchor = "errors: [receiptError('P14_CLONE_FAILED', 'clone', messageOf(error))],"
clone_pos = text.index(clone_anchor)
clone_prefix = text[:clone_pos]
last_before = clone_prefix.rfind('afterFingerprint: beforeFingerprint,')
if last_before < 0:
    raise SystemExit('clone failure fingerprint anchor not found')
clone_prefix = clone_prefix[:last_before] + 'afterFingerprint: unknownFingerprint,' + clone_prefix[last_before + len('afterFingerprint: beforeFingerprint,'):]
text = clone_prefix + text[clone_pos:]

start = text.index('  const appliedActions: P14RecipeExecutionResult[] = [];')
end = text.index('  let preRetainFingerprint: string;')
segment = text[start:end]
needle = 'afterFingerprint: beforeFingerprint,'
count = segment.count(needle)
if count != 10:
    raise SystemExit(f'expected 10 unverified candidate failure fingerprints, found {count}')
segment = segment.replace(needle, 'afterFingerprint: unknownFingerprint,')
text = text[:start] + segment + text[end:]
transaction_path.write_text(text)

test = test_path.read_text()
test_anchor = "    expect(transform.errors[0]?.code).toBe('P14_TRANSFORM_FAILED');\n"
if test_anchor not in test:
    raise SystemExit('transform receipt test anchor not found')
test = test.replace(
    test_anchor,
    test_anchor + "    expect(transform.source.afterFingerprint).toBe('UNKNOWN');\n",
    1,
)
test_path.write_text(test)
