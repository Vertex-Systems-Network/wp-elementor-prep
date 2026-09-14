import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { sha256Hex } from '../core/sha256';
import type { ElementorTemplateCandidateArtifactV1 } from '../targets/elementor/candidate-artifact';
import {
  validateElementorImportValidationReceipt,
  type ElementorImportValidationReceiptResult,
} from '../targets/elementor/import-validation-contract';

const DEFAULT_OUT = 'dist-p15/elementor-import-validation-intake.json';

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P15_ELEMENTOR_IMPORT_INTAKE_FAILED: ${message}\n`);
  process.exit(exitCode);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
    if (!['candidate', 'receipt', 'out'].includes(key)) fail(`Unsupported option: --${key}.`);
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

function targetSnapshot(receipt: unknown, validation: ElementorImportValidationReceiptResult): {
  wordpressVersion: string;
  elementorVersion: string;
  importSurface: 'TEMPLATE_LIBRARY_JSON';
} | null {
  if (!validation.valid || !isRecord(receipt) || !isRecord(receipt.target)) return null;
  const target = receipt.target;
  if (typeof target.wordpressVersion !== 'string'
    || typeof target.elementorVersion !== 'string'
    || target.importSurface !== 'TEMPLATE_LIBRARY_JSON') {
    return null;
  }
  return {
    wordpressVersion: target.wordpressVersion,
    elementorVersion: target.elementorVersion,
    importSurface: 'TEMPLATE_LIBRARY_JSON',
  };
}

const args = parseArgs(process.argv.slice(2));
const candidatePath = required(args, 'candidate');
const receiptPath = required(args, 'receipt');
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);

const candidateFile = await readJson(candidatePath, 'candidate');
const receiptFile = await readJson(receiptPath, 'receipt');
if (!isRecord(candidateFile.value)) fail('Candidate artifact must be a JSON object.');

const validation = validateElementorImportValidationReceipt(
  receiptFile.value,
  candidateFile.value as unknown as ElementorTemplateCandidateArtifactV1,
);
const status = validation.valid && validation.observedResult === 'PASS'
  ? 'BOUND_OBSERVED_PASS'
  : validation.valid && validation.observedResult === 'FAIL'
    ? 'BOUND_OBSERVED_FAIL'
    : 'REJECTED';

const report = {
  schemaVersion: 1,
  gate: 'p15-elementor-import-validation-intake-v1',
  status,
  candidateIdentity: validation.candidateIdentity,
  receiptValid: validation.valid,
  bindingMatches: validation.bindingMatches,
  observedResult: validation.observedResult,
  target: targetSnapshot(receiptFile.value, validation),
  inputs: {
    candidateSha256: `sha256:${sha256Hex(candidateFile.raw)}`,
    receiptSha256: `sha256:${sha256Hex(receiptFile.raw)}`,
  },
  issues: validation.issues.map((issue) => ({ ...issue })),
  acceptanceAuthority: false,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
  downloadEnabled: false,
  internalReviewRequired: true,
};

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ out: outPath, status, receiptValid: report.receiptValid, bindingMatches: report.bindingMatches }, null, 2)}\n`);
process.exitCode = status === 'BOUND_OBSERVED_PASS' ? 0 : 2;
