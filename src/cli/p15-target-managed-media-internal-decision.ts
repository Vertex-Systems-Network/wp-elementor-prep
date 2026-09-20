import { resolve } from 'node:path';
import type { ElementorTemplateCandidateArtifactV1 } from '../targets/elementor/candidate-artifact';
import type { ElementorTargetProfileV1 } from '../targets/elementor/target-profile';
import { validateElementorTargetManagedMediaInternalDecision } from '../targets/elementor/target-managed-media-internal-decision';
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
import { readP15UnboundedTemplateJsonInput } from './p15-unbounded-template-json-input';

const DEFAULT_OUT = 'dist-p15/elementor-target-managed-media-internal-decision-intake.json';

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P15_TARGET_MANAGED_MEDIA_INTERNAL_DECISION_FAILED: ${message}\n`);
  process.exit(exitCode);
}

function parseArgs(argv: string[]): Map<string, string> {
  const values = new Map<string, string>();
  const supported = new Set([
    'candidate',
    'profile',
    'asset-proof',
    'integrity-evidence',
    'exported-template',
    'portability-evidence',
    'decision',
    'out',
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith('--')) fail(`Unexpected argument: ${token ?? ''}`);
    const equals = token.indexOf('=');
    const key = equals >= 0 ? token.slice(2, equals) : token.slice(2);
    const value = equals >= 0 ? token.slice(equals + 1) : argv[++index];
    if (!key || !value || value.startsWith('--')) fail(`--${key} requires a value.`);
    if (!supported.has(key)) fail(`Unsupported option: --${key}.`);
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
const proofFile = await readP15OperatorJsonInput(required(args, 'asset-proof'), 'asset-proof', smallJsonOptions, fail);
const integrityFile = await readP15OperatorJsonInput(
  required(args, 'integrity-evidence'),
  'integrity-evidence',
  smallJsonOptions,
  fail,
);
const exportedTemplateFile = await readP15UnboundedTemplateJsonInput(
  required(args, 'exported-template'),
  'exported-template',
  fail,
);
const portabilityFile = await readP15OperatorJsonInput(
  required(args, 'portability-evidence'),
  'portability-evidence',
  smallJsonOptions,
  fail,
);
const decisionFile = await readP15OperatorJsonInput(
  required(args, 'decision'),
  'decision',
  smallJsonOptions,
  fail,
);

const inputs = [
  candidateFile,
  profileFile,
  proofFile,
  integrityFile,
  exportedTemplateFile,
  portabilityFile,
  decisionFile,
];
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);

try {
  if (await outputAliasesAnyInput(outPath, inputs.map((input) => input.resolvedPath))) {
    fail('--out must not overwrite or alias any input file.');
  }
} catch (error) {
  fail(`Unable to validate --out path safety: ${error instanceof Error ? error.message : String(error)}`);
}

const result = validateElementorTargetManagedMediaInternalDecision(
  candidateFile.value as ElementorTemplateCandidateArtifactV1,
  profileFile.value as ElementorTargetProfileV1,
  proofFile.value,
  integrityFile.value,
  exportedTemplateFile.value,
  exportedTemplateFile.contentSha256,
  portabilityFile.value,
  portabilityFile.contentSha256,
  decisionFile.value,
);

const report = {
  schemaVersion: 1,
  gate: 'p15-elementor-target-managed-media-internal-decision-v1',
  valid: result.valid,
  classification: result.classification,
  reviewPrerequisiteReady: result.reviewPrerequisiteReady,
  portabilityPass: result.portabilityPass,
  decisionBindingMatches: result.decisionBindingMatches,
  candidateIdentityDigest: result.candidateIdentityDigest,
  targetProfileFingerprint: result.targetProfileFingerprint,
  reviewPrerequisiteSha256: result.reviewPrerequisiteSha256,
  portabilityEvidenceSha256: result.portabilityEvidenceSha256,
  exportedTemplateSha256: result.exportedTemplateSha256,
  sourceEvidenceReferenceSha256: result.sourceEvidenceReferenceSha256,
  decisionReferenceSha256: result.decisionReferenceSha256,
  decidedAt: result.decidedAt,
  portabilityObservedAt: result.portabilityObservedAt,
  outcome: result.outcome,
  internalDecisionStatus: result.internalDecisionStatus,
  boundedAssetReferenceClosureAuthority: result.boundedAssetReferenceClosureAuthority,
  authenticationAuthority: result.authenticationAuthority,
  acceptanceAuthority: result.acceptanceAuthority,
  referenceClosureClaim: result.referenceClosureClaim,
  assetReferenceClosureClaim: result.assetReferenceClosureClaim,
  targetCompatibilityClaim: result.targetCompatibilityClaim,
  productionAcceptance: result.productionAcceptance,
  generationEnabled: result.generationEnabled,
  downloadEnabled: result.downloadEnabled,
  internalReviewRequired: result.internalReviewRequired,
  issues: result.issues.map((issue) => ({ ...issue })),
  inputs: {
    candidateSha256: candidateFile.contentSha256,
    profileSha256: profileFile.contentSha256,
    assetProofSha256: proofFile.contentSha256,
    integrityEvidenceSha256: integrityFile.contentSha256,
    exportedTemplateSha256: exportedTemplateFile.contentSha256,
    portabilityEvidenceSha256: portabilityFile.contentSha256,
    decisionSha256: decisionFile.contentSha256,
  },
};

await writeP15OperatorJsonOutput(
  outPath,
  inputs,
  `${JSON.stringify(report, null, 2)}\n`,
  fail,
);

process.stdout.write(`${JSON.stringify({
  out: outPath,
  valid: report.valid,
  classification: report.classification,
  internalDecisionStatus: report.internalDecisionStatus,
  boundedAssetReferenceClosureAuthority: report.boundedAssetReferenceClosureAuthority,
  assetReferenceClosureClaim: report.assetReferenceClosureClaim,
  targetCompatibilityClaim: report.targetCompatibilityClaim,
  productionAcceptance: report.productionAcceptance,
}, null, 2)}\n`);

process.exitCode = report.valid ? 0 : 2;
