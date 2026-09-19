import { resolve } from 'node:path';
import type { ElementorTemplateCandidateArtifactV1 } from '../targets/elementor/candidate-artifact';
import type { ElementorTargetProfileV1 } from '../targets/elementor/target-profile';
import { assessElementorObservedAssetReferenceEvidence } from '../targets/elementor/observed-asset-reference-evidence';
import { outputAliasesAnyInput } from './p15-evidence-path-safety';
import {
  P15_CANDIDATE_JSON_INPUT_MAX_DEPTH,
  P15_SMALL_JSON_INPUT_MAX_BYTES,
  P15_SMALL_JSON_INPUT_MAX_DEPTH,
  P15_SMALL_JSON_INPUT_MAX_VALUES,
  readP15OperatorJsonInput,
  writeP15OperatorJsonOutput,
} from './p15-operator-json-io';
import { validateP15CandidateTemplateJsonDepthLexically } from './p15-template-json-depth-scan';

const DEFAULT_OUT = 'dist-p15/elementor-observed-asset-reference-evidence.json';

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P15_OBSERVED_ASSET_REFERENCE_EVIDENCE_FAILED: ${message}\n`);
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
    if (!['candidate', 'profile', 'proof', 'out'].includes(key)) fail(`Unsupported option: --${key}.`);
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
const candidateFile = await readP15OperatorJsonInput(
  required(args, 'candidate'),
  'candidate',
  { maxDepth: P15_CANDIDATE_JSON_INPUT_MAX_DEPTH },
  fail,
);
validateP15CandidateTemplateJsonDepthLexically(candidateFile.value, fail);
const profileFile = await readP15OperatorJsonInput(required(args, 'profile'), 'profile', smallJsonOptions, fail);
const proofFile = await readP15OperatorJsonInput(required(args, 'proof'), 'proof', smallJsonOptions, fail);
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);
const inputPaths = [candidateFile.resolvedPath, profileFile.resolvedPath, proofFile.resolvedPath];

try {
  if (await outputAliasesAnyInput(outPath, inputPaths)) {
    fail('--out must not overwrite or alias a candidate, profile, or proof input file.');
  }
} catch (error) {
  fail(`Unable to validate --out path safety: ${error instanceof Error ? error.message : String(error)}`);
}

const assessment = assessElementorObservedAssetReferenceEvidence(
  proofFile.value,
  candidateFile.value as ElementorTemplateCandidateArtifactV1,
  profileFile.value as ElementorTargetProfileV1,
);

const report = {
  schemaVersion: 1,
  gate: 'p15-elementor-observed-asset-reference-evidence-v1',
  status: assessment.status,
  proofValid: assessment.proofValid,
  proofClassification: assessment.proofClassification,
  referenceScopeEligible: assessment.referenceScopeEligible,
  referenceBindingMatches: assessment.referenceBindingMatches,
  evidence: assessment.evidence,
  issues: assessment.issues.map((issue) => ({ ...issue })),
  inputs: {
    candidateSha256: candidateFile.contentSha256,
    profileSha256: profileFile.contentSha256,
    proofSha256: proofFile.contentSha256,
  },
  authenticationAuthority: false,
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
  [candidateFile, profileFile, proofFile],
  `${JSON.stringify(report, null, 2)}\n`,
  fail,
);

process.stdout.write(`${JSON.stringify({
  out: outPath,
  status: report.status,
  proofValid: report.proofValid,
  proofClassification: report.proofClassification,
  referenceScopeEligible: report.referenceScopeEligible,
  referenceBindingMatches: report.referenceBindingMatches,
  evidenceAuthenticationStatus: report.evidence?.evidenceAuthenticationStatus ?? 'NOT_RUN',
  internalDecisionStatus: report.evidence?.internalDecisionStatus ?? 'NOT_RUN',
}, null, 2)}\n`);

process.exitCode = report.status === 'OBSERVED_ASSET_EVIDENCE_BOUND' ? 0 : 2;
