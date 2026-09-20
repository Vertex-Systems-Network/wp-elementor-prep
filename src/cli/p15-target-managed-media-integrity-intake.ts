import { resolve } from 'node:path';
import type { ElementorTemplateCandidateArtifactV1 } from '../targets/elementor/candidate-artifact';
import type { ElementorTargetProfileV1 } from '../targets/elementor/target-profile';
import { validateElementorTargetManagedMediaIntegrityEvidence } from '../targets/elementor/target-managed-media-integrity-evidence';
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

const DEFAULT_OUT = 'dist-p15/elementor-target-managed-media-integrity-intake.json';

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P15_TARGET_MANAGED_MEDIA_INTEGRITY_FAILED: ${message}\n`);
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
    if (!['candidate', 'profile', 'asset-proof', 'integrity-evidence', 'out'].includes(key)) {
      fail(`Unsupported option: --${key}.`);
    }
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
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);
const inputPaths = [
  candidateFile.resolvedPath,
  profileFile.resolvedPath,
  proofFile.resolvedPath,
  integrityFile.resolvedPath,
];

try {
  if (await outputAliasesAnyInput(outPath, inputPaths)) {
    fail('--out must not overwrite or alias any input file.');
  }
} catch (error) {
  fail(`Unable to validate --out path safety: ${error instanceof Error ? error.message : String(error)}`);
}

const validation = validateElementorTargetManagedMediaIntegrityEvidence(
  integrityFile.value,
  candidateFile.value as ElementorTemplateCandidateArtifactV1,
  profileFile.value as ElementorTargetProfileV1,
  proofFile.value,
);

const report = {
  schemaVersion: 1,
  gate: 'p15-elementor-target-managed-media-integrity-v1',
  classification: validation.classification,
  evidenceValid: validation.valid,
  assetProofValid: validation.assetProofValid,
  assetProofClassification: validation.assetProofClassification,
  candidateBindingMatches: validation.candidateBindingMatches,
  profileBindingMatches: validation.profileBindingMatches,
  referenceReviewBindingMatches: validation.referenceReviewBindingMatches,
  observedTargetMatches: validation.observedTargetMatches,
  evidenceReferenceMatches: validation.evidenceReferenceMatches,
  sourceFixtureMatchesCanonical: validation.sourceFixtureMatchesCanonical,
  contentDigestMatches: validation.contentDigestMatches,
  attachmentMetadataValid: validation.attachmentMetadataValid,
  sourceFixtureSha256: validation.sourceFixtureSha256,
  targetFileSha256: validation.targetFileSha256,
  mimeType: validation.mimeType,
  width: validation.width,
  height: validation.height,
  issues: validation.issues.map((issue) => ({ ...issue })),
  inputs: {
    candidateSha256: candidateFile.contentSha256,
    profileSha256: profileFile.contentSha256,
    assetProofSha256: proofFile.contentSha256,
    integrityEvidenceSha256: integrityFile.contentSha256,
  },
  referenceClosureClaim: false,
  assetReferenceClosureClaim: false,
  acceptanceAuthority: false,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
  generationEnabled: false,
  downloadEnabled: false,
  internalReviewRequired: true,
};

await writeP15OperatorJsonOutput(
  outPath,
  [candidateFile, profileFile, proofFile, integrityFile],
  `${JSON.stringify(report, null, 2)}\n`,
  fail,
);

process.stdout.write(`${JSON.stringify({
  out: outPath,
  classification: report.classification,
  evidenceValid: report.evidenceValid,
  assetProofClassification: report.assetProofClassification,
  sourceFixtureMatchesCanonical: report.sourceFixtureMatchesCanonical,
  contentDigestMatches: report.contentDigestMatches,
  attachmentMetadataValid: report.attachmentMetadataValid,
}, null, 2)}\n`);

process.exitCode = report.classification === 'TARGET_MANAGED_CONTENT_INTEGRITY_PASS' ? 0 : 2;
