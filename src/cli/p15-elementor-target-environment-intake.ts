import { resolve } from 'node:path';
import { validateElementorTargetEnvironmentEvidence } from '../targets/elementor/target-environment-evidence';
import { outputAliasesAnyInput } from './p15-evidence-path-safety';
import {
  P15_SMALL_JSON_INPUT_MAX_BYTES,
  P15_SMALL_JSON_INPUT_MAX_DEPTH,
  P15_SMALL_JSON_INPUT_MAX_VALUES,
  readP15OperatorJsonInput,
  writeP15OperatorJsonOutput,
} from './p15-operator-json-io';

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
const evidenceFile = await readP15OperatorJsonInput(
  required(args, 'evidence'),
  'evidence',
  {
    maxBytes: P15_SMALL_JSON_INPUT_MAX_BYTES,
    maxDepth: P15_SMALL_JSON_INPUT_MAX_DEPTH,
    maxValues: P15_SMALL_JSON_INPUT_MAX_VALUES,
  },
  fail,
);
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);

try {
  if (await outputAliasesAnyInput(outPath, [evidenceFile.resolvedPath])) {
    fail('--out must not overwrite or alias the evidence input file.');
  }
} catch (error) {
  fail(`Unable to validate --out path safety: ${error instanceof Error ? error.message : String(error)}`);
}

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
    evidenceSha256: evidenceFile.contentSha256,
  },
  acceptanceAuthority: false,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
  internalReviewRequired: true,
  importObserved: false,
  editorObserved: false,
  renderObserved: false,
};

await writeP15OperatorJsonOutput(
  outPath,
  [evidenceFile],
  `${JSON.stringify(report, null, 2)}\n`,
  fail,
);
process.stdout.write(`${JSON.stringify({
  out: outPath,
  classification: report.classification,
  evidenceValid: report.evidenceValid,
  failures: report.failures,
  reviewCodes: report.reviewCodes,
}, null, 2)}\n`);
process.exitCode = report.classification === 'QUALIFIED_FOR_BOUND_TARGET_PROOF' ? 0 : 2;
