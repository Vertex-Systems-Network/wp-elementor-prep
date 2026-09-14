import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
  readP16OperatorJsonInput,
  resolveP16OperatorOutputPath,
} from './p16-operator-json-io';
import {
  buildGutenbergNativeSerializationEvidenceRetentionRequirements,
  serializeGutenbergNativeSerializationEvidenceRetentionRequirements,
} from '../targets/gutenberg/native-serialization-evidence-retention-requirements';

const DEFAULT_OUT = 'dist-p16/gutenberg-native-serialization-evidence-retention-requirements.json';
const ALLOWED_OPTIONS = new Set([
  'document',
  'profile',
  'receipt',
  'authentication-report',
  'out',
]);

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P16_EVIDENCE_RETENTION_REQUIREMENTS_FAILED: ${message}\n`);
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
const inputPaths = [documentPath, profilePath, receiptPath, authenticationReportPath];
const outPath = resolveP16OperatorOutputPath(args.get('out') ?? DEFAULT_OUT, inputPaths, fail);

const documentValue = await readP16OperatorJsonInput(documentPath, 'document', fail);
const profileValue = await readP16OperatorJsonInput(profilePath, 'profile', fail);
const receiptValue = await readP16OperatorJsonInput(receiptPath, 'receipt', fail);
const authenticationReportValue = await readP16OperatorJsonInput(
  authenticationReportPath,
  'authentication report',
  fail,
);

const manifest = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
  documentValue,
  profileValue,
  receiptValue,
  authenticationReportValue,
);

await mkdir(dirname(outPath), { recursive: true });
await writeFile(
  outPath,
  serializeGutenbergNativeSerializationEvidenceRetentionRequirements(
    documentValue,
    profileValue,
    receiptValue,
    authenticationReportValue,
  ),
  'utf8',
);

process.stdout.write(`${JSON.stringify({
  out: outPath,
  status: manifest.status,
  prerequisiteStatus: manifest.prerequisiteStatus,
  declaredWordpressVersion: manifest.declaredWordpressVersion,
  requirementsProfileSha256: manifest.requirementsProfileSha256,
}, null, 2)}\n`);

process.exitCode = manifest.status === 'EVIDENCE_RETENTION_REQUIREMENTS_READY' ? 0 : 2;
