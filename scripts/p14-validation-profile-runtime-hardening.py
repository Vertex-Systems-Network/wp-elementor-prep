from pathlib import Path

TX = Path('src/core/p14-retained-duplicate-transaction.ts')
TEST = Path('tests/p14-validation-profile-coverage.test.ts')


def replace_exact(path: Path, old: str, new: str, count: int = 1):
    text = path.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} copies of anchor, found {actual}')
    path.write_text(text.replace(old, new, count))

replace_exact(
    TX,
    "  type P14TransactionEvent,\n  type P14TransactionState,",
    "  type P14TransactionEvent,\n  type P14TransactionState,\n  type P14ValidationSummary,",
)

replace_exact(
    TX,
    "function messageOf(error: unknown): string {\n  return error instanceof Error ? error.message : String(error);\n}\n",
    "function messageOf(error: unknown): string {\n  return error instanceof Error ? error.message : String(error);\n}\n\nfunction isRecord(value: unknown): value is Record<string, unknown> {\n  return typeof value === 'object' && value !== null && !Array.isArray(value);\n}\n\nfunction isP14ValidationSummary(value: unknown): value is P14ValidationSummary {\n  if (!isRecord(value)\n    || typeof value.passed !== 'boolean'\n    || !Array.isArray(value.profileIdsRun)\n    || !Array.isArray(value.checks)) {\n    return false;\n  }\n  return value.checks.every((check) => isRecord(check)\n    && typeof check.id === 'string'\n    && check.id.length > 0\n    && typeof check.passed === 'boolean'\n    && typeof check.required === 'boolean'\n    && (check.detail === undefined || typeof check.detail === 'string'));\n}\n",
)

replace_exact(
    TX,
    "  let validation;\n  try {\n    validation = await adapter.validateCandidate(candidate, plan);\n  } catch (error) {",
    "  let validation: P14ValidationSummary;\n  try {\n    const rawValidation: unknown = await adapter.validateCandidate(candidate, plan);\n    if (!isP14ValidationSummary(rawValidation)) {\n      throw new Error('Validation adapter returned malformed evidence.');\n    }\n    validation = rawValidation;\n  } catch (error) {",
)

text = TEST.read_text()
anchor = "\n});\n"
if not text.endswith(anchor):
    raise SystemExit(f'{TEST}: final describe anchor missing')
new_test = """

  it('rejects malformed runtime validation evidence through cleanup instead of throwing', async () => {
    const adapter = new Adapter();
    (adapter as unknown as { validateCandidate: () => Promise<unknown> }).validateCandidate = async () => {
      adapter.calls.validate += 1;
      return null;
    };
    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_VALIDATION_FAILED');
    expect(receipt.errors[0]?.detail).toContain('malformed evidence');
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.rescore).toBe(0);
    expect(adapter.calls.retain).toBe(0);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });
"""
TEST.write_text(text[:-len(anchor)] + new_test + anchor)
