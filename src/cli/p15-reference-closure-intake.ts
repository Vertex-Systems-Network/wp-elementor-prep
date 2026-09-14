import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { sha256Hex } from '../core/sha256';
import { validateElementorReferenceClosureEvidenceReceipt } from '../targets/elementor/reference-closure-evidence';

const DEFAULT_OUT = 'dist-p15/elementor-reference-closure-intake.json';

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P15_REFERENCE_CLOSURE_INTAKE_FAILED: ${message}\n`);
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
    if (!['template', 'profile', 'receipt', 'out'].includes(key)) fail(`Unsupported option: --${key}.`);
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
const templatePath = required(args, 'template');
const profilePath = required(args, 'profile');
const receiptPath = required(args, 'receipt');
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);

const templateFile = await readJson(templatePath, 'template');
const profileFile = await readJson(profilePath, 'profile');
const receiptFile = await readJson(receiptPath, 'receipt');

const validation = validateElementorReferenceClosureEvidenceReceipt(
  receiptFile.value,
  templateFile.value,
  profileFile.value,
);
const status = validation.valid && validation.allRequiredEvidenceReportsPass
  ? 'BOUND_REPORTED_PASS'
  : validation.valid
    ? 'BOUND_REPORTED_FAIL'
    : 'REJECTED';

const report = {
  schemaVersion: 1,
  gate: 'p15-elementor-reference-closure-intake-v1',
  status,
  receiptValid: validation.valid,
  bindingMatches: validation.bindingMatches,
  currentReferenceReviewIdentity: validation.currentIdentity,
  reportedResults: {
    global: validation.globalReportedResult,
    asset: validation.assetReportedResult,
  },
  allRequiredEvidenceReportsPass: validation.allRequiredEvidenceReportsPass,
  inputs: {
    templateSha256: `sha256:${sha256Hex(templateFile.raw)}`,
    profileSha256: `sha256:${sha256Hex(profileFile.raw)}`,
    receiptSha256: `sha256:${sha256Hex(receiptFile.raw)}`,
  },
  issues: validation.issues.map((issue) => ({ ...issue })),
  acceptanceAuthority: false,
  referenceClosureClaim: false,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
  generationEnabled: false,
  downloadEnabled: false,
  internalReviewRequired: true,
};

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({
  out: outPath,
  status,
  receiptValid: report.receiptValid,
  bindingMatches: report.bindingMatches,
  allRequiredEvidenceReportsPass: report.allRequiredEvidenceReportsPass,
}, null, 2)}\n`);
process.exitCode = status === 'BOUND_REPORTED_PASS' ? 0 : 2;
