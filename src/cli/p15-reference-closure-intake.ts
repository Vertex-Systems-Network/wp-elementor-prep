import { resolve } from 'node:path';
import { validateElementorReferenceClosureEvidenceReceipt } from '../targets/elementor/reference-closure-evidence';
import { outputAliasesAnyInput } from './p15-evidence-path-safety';
import {
  P15_SMALL_JSON_INPUT_MAX_BYTES,
  P15_SMALL_JSON_INPUT_MAX_DEPTH,
  P15_SMALL_JSON_INPUT_MAX_VALUES,
  readP15OperatorJsonInput,
  writeP15OperatorJsonOutput,
} from './p15-operator-json-io';
import { readP15UnboundedTemplateJsonInput } from './p15-unbounded-template-json-input';

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

const smallJsonOptions = {
  maxBytes: P15_SMALL_JSON_INPUT_MAX_BYTES,
  maxDepth: P15_SMALL_JSON_INPUT_MAX_DEPTH,
  maxValues: P15_SMALL_JSON_INPUT_MAX_VALUES,
} as const;

const args = parseArgs(process.argv.slice(2));
const templateFile = await readP15UnboundedTemplateJsonInput(required(args, 'template'), 'template', fail);
const profileFile = await readP15OperatorJsonInput(required(args, 'profile'), 'profile', smallJsonOptions, fail);
const receiptFile = await readP15OperatorJsonInput(required(args, 'receipt'), 'receipt', smallJsonOptions, fail);
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);
const inputPaths = [templateFile.resolvedPath, profileFile.resolvedPath, receiptFile.resolvedPath];

try {
  if (await outputAliasesAnyInput(outPath, inputPaths)) {
    fail('--out must not overwrite or alias a template, profile, or receipt input file.');
  }
} catch (error) {
  fail(`Unable to validate --out path safety: ${error instanceof Error ? error.message : String(error)}`);
}

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
    templateSha256: templateFile.contentSha256,
    profileSha256: profileFile.contentSha256,
    receiptSha256: receiptFile.contentSha256,
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

await writeP15OperatorJsonOutput(
  outPath,
  [templateFile, profileFile, receiptFile],
  `${JSON.stringify(report, null, 2)}\n`,
  fail,
);
process.stdout.write(`${JSON.stringify({
  out: outPath,
  status,
  receiptValid: report.receiptValid,
  bindingMatches: report.bindingMatches,
  allRequiredEvidenceReportsPass: report.allRequiredEvidenceReportsPass,
}, null, 2)}\n`);
process.exitCode = status === 'BOUND_REPORTED_PASS' ? 0 : 2;
