import {
  readP16OperatorJsonInput,
  resolveP16OperatorOutputPath,
  writeP16OperatorJsonOutput,
} from './p16-operator-json-io';
import {
  serializeGutenbergNativeSerializationEvidenceRetentionRequirementsValidation,
  validateGutenbergNativeSerializationEvidenceRetentionRequirements,
} from '../targets/gutenberg/native-serialization-evidence-retention-requirements-validation';

const DEFAULT_OUT =
  'dist-p16/gutenberg-native-serialization-evidence-retention-requirements-validation.json';
const ALLOWED_OPTIONS = new Set([
  'document',
  'profile',
  'receipt',
  'authentication-report',
  'manifest',
  'out',
]);

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P16_EVIDENCE_RETENTION_REQUIREMENTS_VALIDATE_FAILED: ${message}\n`);
  process.exit(exitCode);
}

function parseArgs(argv: string[]): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith('--')) fail(`Unexpected argument: ${token ?? ''}`);
    const equals = token.indexOf('=');
    const key = equals >= 0 ? token.slice(2, equals) : token.slice(2);
    const value = equals >= 0 ? token.slice(equals + 1) : argv[++index];
    if (!key || !value || value.startsWith('--')) fail(`--${key} requires a value.`);
    if (!ALLOWED_OPTIONS.has(key)) fail(`Unsupported option: --${key}.`);
    if (values.has(key)) fail(`Duplicate option: --${key}.`);
    values.set(key, value);
  }
  return values;
}

function required(values: Map<string, string>, key: string): string {
  const value = values.get(key);
  if (!value) fail(`Missing required --${key}.`);
  return value;
}

const args = parseArgs(process.argv.slice(2));
const documentPath = required(args, 'document');
const profilePath = required(args, 'profile');
const receiptPath = required(args, 'receipt');
const authenticationReportPath = required(args, 'authentication-report');
const manifestPath = required(args, 'manifest');
const inputPaths = [
  documentPath,
  profilePath,
  receiptPath,
  authenticationReportPath,
  manifestPath,
];
const outPath = resolveP16OperatorOutputPath(args.get('out') ?? DEFAULT_OUT, inputPaths, fail);

const documentInput = await readP16OperatorJsonInput(documentPath, 'document', fail);
const profileInput = await readP16OperatorJsonInput(profilePath, 'profile', fail);
const receiptInput = await readP16OperatorJsonInput(receiptPath, 'receipt', fail);
const authenticationReportInput = await readP16OperatorJsonInput(
  authenticationReportPath,
  'authentication report',
  fail,
);
const manifestInput = await readP16OperatorJsonInput(
  manifestPath,
  'requirements manifest',
  fail,
);
const inputSnapshots = [
  documentInput,
  profileInput,
  receiptInput,
  authenticationReportInput,
  manifestInput,
];

const validation = validateGutenbergNativeSerializationEvidenceRetentionRequirements(
  manifestInput.value,
  documentInput.value,
  profileInput.value,
  receiptInput.value,
  authenticationReportInput.value,
);
const serializedValidation = serializeGutenbergNativeSerializationEvidenceRetentionRequirementsValidation(
  manifestInput.value,
  documentInput.value,
  profileInput.value,
  receiptInput.value,
  authenticationReportInput.value,
);

await writeP16OperatorJsonOutput(outPath, inputSnapshots, serializedValidation, fail);

process.stdout.write(`${JSON.stringify({
  out: outPath,
  status: validation.status,
  currentRequirementsStatus: validation.currentRequirementsStatus,
  exactSemanticMatch: validation.exactSemanticMatch,
  canonicalExpectedManifestSha256: validation.canonicalExpectedManifestSha256,
  canonicalProvidedManifestSha256: validation.canonicalProvidedManifestSha256,
}, null, 2)}\n`);

process.exitCode = validation.status === 'CURRENT_REQUIREMENTS_MANIFEST_VALID' ? 0 : 2;
