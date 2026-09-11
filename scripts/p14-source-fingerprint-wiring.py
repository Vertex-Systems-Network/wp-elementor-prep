from pathlib import Path

TX = Path('src/core/p14-retained-duplicate-transaction.ts')
RECEIPT = Path('src/core/p14-preparation-receipt.ts')
TX_TEST = Path('tests/p14-source-fingerprint-transaction.test.ts')


def replace_exact(path: Path, old: str, new: str, count: int = 1):
    text = path.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} copies of anchor, found {actual}')
    path.write_text(text.replace(old, new, count))

replace_exact(
    TX,
    "import { validateP14RescoreEvidence } from './p14-rescore-evidence';",
    "import { validateP14RescoreEvidence } from './p14-rescore-evidence';\nimport {\n  P14_UNKNOWN_SOURCE_FINGERPRINT,\n  validateP14SourceFingerprintEvidence,\n} from './p14-source-fingerprint-evidence';",
)

VALIDATION_HELPER = """function isP14ValidationSummary(value: unknown): value is P14ValidationSummary {
  if (!isRecord(value)
    || typeof value.passed !== 'boolean'
    || !Array.isArray(value.profileIdsRun)
    || !Array.isArray(value.checks)) {
    return false;
  }
  return value.checks.every((check) => isRecord(check)
    && typeof check.id === 'string'
    && check.id.length > 0
    && typeof check.passed === 'boolean'
    && typeof check.required === 'boolean'
    && (check.detail === undefined || typeof check.detail === 'string'));
}
"""
VALIDATION_AND_FP_HELPER = VALIDATION_HELPER + """

async function readP14SourceFingerprint(
  adapter: P14RetainedDuplicateAdapter,
  sourceNodeId: string,
): Promise<string> {
  const rawFingerprint: unknown = await adapter.fingerprintSource(sourceNodeId);
  const evidence = validateP14SourceFingerprintEvidence(rawFingerprint);
  if (!evidence.valid || !evidence.value) {
    throw new Error(`Source fingerprint adapter returned invalid evidence: ${evidence.failures.join(' | ')}`);
  }
  return evidence.value;
}
"""
replace_exact(TX, VALIDATION_HELPER, VALIDATION_AND_FP_HELPER)

replace_exact(
    TX,
    "  const unknownFingerprint = 'UNKNOWN';",
    "  const unknownFingerprint = P14_UNKNOWN_SOURCE_FINGERPRINT;",
)

replace_exact(
    TX,
    "await adapter.fingerprintSource(plan.source.nodeId)",
    "await readP14SourceFingerprint(adapter, plan.source.nodeId)",
    count=4,
)

replace_exact(
    RECEIPT,
    "import { validateP14RescoreEvidence } from './p14-rescore-evidence';",
    "import { validateP14RescoreEvidence } from './p14-rescore-evidence';\nimport {\n  P14_UNKNOWN_SOURCE_FINGERPRINT,\n  isP14ReceiptSourceFingerprintEvidence,\n} from './p14-source-fingerprint-evidence';",
)

OLD_SOURCE = """  if (!isRecord(value.source)
    || !nonEmptyString(value.source.nodeId)
    || !nonEmptyString(value.source.beforeFingerprint)
    || !nonEmptyString(value.source.afterFingerprint)) {
    failures.push('Receipt source fingerprint evidence is missing.');
  }
"""
NEW_SOURCE = """  if (!isRecord(value.source)
    || !nonEmptyString(value.source.nodeId)
    || !isP14ReceiptSourceFingerprintEvidence(value.source.beforeFingerprint)
    || !isP14ReceiptSourceFingerprintEvidence(value.source.afterFingerprint)) {
    failures.push('Receipt source fingerprint evidence is missing, malformed or oversized.');
  }
"""
replace_exact(RECEIPT, OLD_SOURCE, NEW_SOURCE)

replace_exact(
    RECEIPT,
    "    && source.beforeFingerprint !== 'UNKNOWN'\n    && source.afterFingerprint !== 'UNKNOWN'",
    "    && source.beforeFingerprint !== P14_UNKNOWN_SOURCE_FINGERPRINT\n    && source.afterFingerprint !== P14_UNKNOWN_SOURCE_FINGERPRINT",
)

replace_exact(
    TX_TEST,
    """  async fingerprintSource(): Promise<string> {
    this.calls.fingerprint += 1;
    return (this.fingerprints.shift() ?? SOURCE_FP) as string;
  }
""",
    """  async fingerprintSource(): Promise<string> {
    this.calls.fingerprint += 1;
    if (this.fingerprints.length === 0) return SOURCE_FP;
    return this.fingerprints.shift() as string;
  }
""",
)
