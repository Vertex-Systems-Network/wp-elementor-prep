import { resolve } from 'node:path';
import { sha256Hex } from '../core/sha256';
import { buildElementorReferenceClosureReviewPacket } from '../targets/elementor/reference-closure-review-packet';
import { outputAliasesAnyInput } from './p15-evidence-path-safety';
import {
  P15_SMALL_JSON_INPUT_MAX_BYTES,
  P15_SMALL_JSON_INPUT_MAX_DEPTH,
  P15_SMALL_JSON_INPUT_MAX_VALUES,
  readP15OperatorJsonInput,
  writeP15OperatorJsonOutput,
} from './p15-operator-json-io';
import { readP15UnboundedTemplateJsonInput } from './p15-unbounded-template-json-input';

const DEFAULT_OUT = 'dist-p15/elementor-reference-closure-review-packet.json';

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P15_REFERENCE_CLOSURE_REVIEW_PACKET_FAILED: ${message}\n`);
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

const packet = buildElementorReferenceClosureReviewPacket(
  templateFile.value,
  profileFile.value,
  receiptFile.value,
);

const report = {
  schemaVersion: 1,
  gate: 'p15-elementor-reference-closure-review-packet-cli-v1',
  packet,
  inputs: {
    templateSha256: `sha256:${sha256Hex(templateFile.raw)}`,
    profileSha256: `sha256:${sha256Hex(profileFile.raw)}`,
    receiptSha256: `sha256:${sha256Hex(receiptFile.raw)}`,
  },
};

await writeP15OperatorJsonOutput(
  outPath,
  [templateFile, profileFile, receiptFile],
  `${JSON.stringify(report, null, 2)}\n`,
  fail,
);
process.stdout.write(`${JSON.stringify({
  out: outPath,
  status: packet.status,
  receiptValid: packet.receiptValid,
  bindingMatches: packet.bindingMatches,
  evidenceAuthenticationStatus: packet.evidenceAuthenticationStatus,
  internalDecisionStatus: packet.internalDecisionStatus,
}, null, 2)}\n`);
process.exitCode = packet.status === 'REJECTED_INVALID_RECEIPT' ? 2 : 0;
