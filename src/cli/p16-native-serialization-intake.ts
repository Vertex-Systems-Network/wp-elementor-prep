import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  buildGutenbergNativeSerializationIntakeReport,
  serializeGutenbergNativeSerializationIntakeReport,
} from '../targets/gutenberg/native-serialization-intake';

const DEFAULT_OUT = 'dist-p16/gutenberg-native-serialization-intake.json';

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P16_NATIVE_SERIALIZATION_INTAKE_FAILED: ${message}\n`);
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
    if (!['document', 'profile', 'receipt', 'out'].includes(key)) fail(`Unsupported option: --${key}.`);
    values.set(key, value);
  }
  return values;
}

function required(values: Map<string, string>, key: string): string {
  const value = values.get(key);
  if (!value) fail(`Missing required --${key}.`);
  return value;
}

async function readJson(path: string, label: string): Promise<{ raw: string; value: unknown }> {
  let raw: string;
  try {
    raw = await readFile(resolve(path), 'utf8');
  } catch (error) {
    fail(`Unable to read ${label} ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    return { raw, value: JSON.parse(raw) as unknown };
  } catch {
    fail(`${label} ${path} is not valid JSON.`);
  }
}

const args = parseArgs(process.argv.slice(2));
const documentPath = required(args, 'document');
const profilePath = required(args, 'profile');
const receiptPath = required(args, 'receipt');
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);

const documentFile = await readJson(documentPath, 'document');
const profileFile = await readJson(profilePath, 'profile');
const receiptFile = await readJson(receiptPath, 'receipt');

const report = buildGutenbergNativeSerializationIntakeReport({
  documentRaw: documentFile.raw,
  documentValue: documentFile.value,
  profileRaw: profileFile.raw,
  profileValue: profileFile.value,
  receiptRaw: receiptFile.raw,
  receiptValue: receiptFile.value,
});

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, serializeGutenbergNativeSerializationIntakeReport(report), 'utf8');
process.stdout.write(`${JSON.stringify({
  out: outPath,
  status: report.status,
  candidateStatus: report.candidateStatus,
  receiptValid: report.receiptValid,
  bindingMatches: report.bindingMatches,
  reportedResult: report.reportedResult,
}, null, 2)}\n`);

process.exitCode = report.status === 'BOUND_REPORTED_PASS' ? 0 : 2;
