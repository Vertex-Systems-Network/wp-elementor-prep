import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { sha256Hex } from '../core/sha256';
import { validateElementorTargetEnvironmentEvidence } from '../targets/elementor/target-environment-evidence';

const DEFAULT_OUT = 'dist-p15/elementor-target-environment-intake.json';

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P15_ELEMENTOR_TARGET_ENVIRONMENT_INTAKE_FAILED: ${message}\n`);
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
    if (!['evidence', 'out'].includes(key)) fail(`Unsupported option: --${key}.`);
    values.set(key, value);
  }
  return values;
}

function required(values: Map<string, string>, key: string): string {
  const value = values.get(key);
  if (!value) fail(`Missing required --${key}.`);
  return value;
}

async function readJson(path: string): Promise<{ raw: string; value: unknown }> {
  let raw: string;
  try {
    raw = await readFile(resolve(path), 'utf8');
  } catch (error) {
    fail(`Unable to read evidence ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
  try {
    return { raw, value: JSON.parse(raw) as unknown };
  } catch {
    fail(`Evidence ${path} is not valid JSON.`);
  }
}

const args = parseArgs(process.argv.slice(2));
const evidencePath = required(args, 'evidence');
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);
const evidenceFile = await readJson(evidencePath);
const validation = validateElementorTargetEnvironmentEvidence(evidenceFile.value);

const report = {
  schemaVersion: 1,
  gate: 'p15-elementor-target-environment-intake-v1',
  policyVersion: validation.policyVersion,
  classification: validation.classification,
  evidenceValid: validation.valid,
  environment: validation.environment,
  requirementChecks: { ...validation.requirementChecks },
  failures: [...validation.failures],
  reviewCodes: [...validation.reviewCodes],
  issues: validation.issues.map((issue) => ({ ...issue })),
  inputs: {
    evidenceSha256: `sha256:${sha256Hex(evidenceFile.raw)}`,
  },
  acceptanceAuthority: false,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
  internalReviewRequired: true,
  importObserved: false,
  editorObserved: false,
  renderObserved: false,
};

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({
  out: outPath,
  classification: report.classification,
  evidenceValid: report.evidenceValid,
  failures: report.failures,
  reviewCodes: report.reviewCodes,
}, null, 2)}\n`);
process.exitCode = report.classification === 'QUALIFIED_FOR_BOUND_TARGET_PROOF' ? 0 : 2;
