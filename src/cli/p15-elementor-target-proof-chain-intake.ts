import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { sha256Hex } from '../core/sha256';
import type { ElementorTemplateCandidateArtifactV1 } from '../targets/elementor/candidate-artifact';
import type { ElementorTargetProfileV1 } from '../targets/elementor/target-profile';
import { validateElementorTargetProofChain } from '../targets/elementor/target-proof-chain';

const DEFAULT_OUT = 'dist-p15/elementor-target-proof-chain-intake.json';

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P15_ELEMENTOR_TARGET_PROOF_CHAIN_INTAKE_FAILED: ${message}\n`);
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
    if (!['candidate', 'profile', 'environment', 'proof', 'out'].includes(key)) {
      fail(`Unsupported option: --${key}.`);
    }
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
const candidateFile = await readJson(required(args, 'candidate'), 'candidate');
const profileFile = await readJson(required(args, 'profile'), 'profile');
const environmentFile = await readJson(required(args, 'environment'), 'environment');
const proofFile = await readJson(required(args, 'proof'), 'proof');
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);

const validation = validateElementorTargetProofChain({
  candidate: candidateFile.value as ElementorTemplateCandidateArtifactV1,
  profile: profileFile.value as ElementorTargetProfileV1,
  environment: environmentFile.value,
  proof: proofFile.value,
});

const report = {
  schemaVersion: 1,
  gate: 'p15-elementor-target-proof-chain-intake-v1',
  chainVersion: validation.chainVersion,
  classification: validation.classification,
  chainValid: validation.valid,
  environmentClassification: validation.environmentClassification,
  proofClassification: validation.proofClassification,
  environmentQualified: validation.environmentQualified,
  runtimeBindingMatches: validation.runtimeBindingMatches,
  evidenceReferenceMatches: validation.evidenceReferenceMatches,
  chronologyValid: validation.chronologyValid,
  candidateBindingMatches: validation.candidateBindingMatches,
  profileBindingMatches: validation.profileBindingMatches,
  candidateIdentity: validation.candidateIdentity,
  targetProfileFingerprint: validation.targetProfileFingerprint,
  observedTarget: validation.observedTarget,
  steps: validation.steps,
  environmentFailures: validation.environmentFailures,
  environmentReviewCodes: validation.environmentReviewCodes,
  proofReviewCodes: validation.proofReviewCodes,
  chainIssues: validation.chainIssues,
  proofIssues: validation.proofIssues,
  inputs: {
    candidateSha256: `sha256:${sha256Hex(candidateFile.raw)}`,
    profileSha256: `sha256:${sha256Hex(profileFile.raw)}`,
    environmentSha256: `sha256:${sha256Hex(environmentFile.raw)}`,
    proofSha256: `sha256:${sha256Hex(proofFile.raw)}`,
  },
  acceptanceAuthority: false,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
  internalReviewRequired: true,
};

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({
  out: outPath,
  classification: report.classification,
  chainValid: report.chainValid,
  environmentClassification: report.environmentClassification,
  proofClassification: report.proofClassification,
}, null, 2)}\n`);
process.exitCode = report.classification === 'CHAIN_FULL_PASS' ? 0 : 2;
