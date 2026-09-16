import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { sha256Hex } from '../core/sha256';
import type { ElementorTemplateCandidateArtifactV1 } from '../targets/elementor/candidate-artifact';
import type { ElementorTargetProfileV1 } from '../targets/elementor/target-profile';
import { validateElementorTargetProofEvidence } from '../targets/elementor/target-proof-evidence';

const DEFAULT_OUT = 'dist-p15/elementor-target-proof-intake.json';

function fail(message: string, exitCode = 2): never {
  process.stderr.write(`P15_ELEMENTOR_TARGET_PROOF_INTAKE_FAILED: ${message}\n`);
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

async function readJson(path: string, label: string): Promise<{ raw: string; value: unknown }> {
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
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
const candidatePath = resolve(required(args, 'candidate'));
const profilePath = resolve(required(args, 'profile'));
const proofPath = resolve(required(args, 'proof'));
const outPath = resolve(args.get('out') ?? DEFAULT_OUT);

const inputPaths = [candidatePath, profilePath, proofPath];
if (inputPaths.includes(outPath)) {
  fail('--out must not overwrite a candidate, profile, or proof input file.');
}

const candidateFile = await readJson(candidatePath, 'candidate');
const profileFile = await readJson(profilePath, 'profile');
const proofFile = await readJson(proofPath, 'proof');

const validation = validateElementorTargetProofEvidence(
  proofFile.value,
  candidateFile.value as ElementorTemplateCandidateArtifactV1,
  profileFile.value as ElementorTargetProfileV1,
);

const report = {
  schemaVersion: 1,
  gate: 'p15-elementor-target-proof-intake-v1',
  classification: validation.classification,
  proofValid: validation.valid,
  candidateBindingMatches: validation.candidateBindingMatches,
  profileBindingMatches: validation.profileBindingMatches,
  declaredObservedEnvironmentMatches: validation.declaredObservedEnvironmentMatches,
  candidateIdentity: validation.candidateIdentity,
  targetProfileFingerprint: validation.targetProfileFingerprint,
  observedTarget: validation.observedTarget,
  steps: validation.steps,
  reviewCodes: [...validation.reviewCodes],
  issues: validation.issues.map((issue) => ({ ...issue })),
  inputs: {
    candidateSha256: `sha256:${sha256Hex(candidateFile.raw)}`,
    profileSha256: `sha256:${sha256Hex(profileFile.raw)}`,
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
  proofValid: report.proofValid,
  candidateBindingMatches: report.candidateBindingMatches,
  profileBindingMatches: report.profileBindingMatches,
  declaredObservedEnvironmentMatches: report.declaredObservedEnvironmentMatches,
}, null, 2)}\n`);
process.exitCode = report.classification === 'BOUND_FULL_PASS' ? 0 : 2;
