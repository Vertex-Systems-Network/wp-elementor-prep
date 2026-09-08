import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectRuntimeArtifact } from './runtime-artifact-preflight.mjs';

export const DEFAULT_MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
export const DEFAULT_VERIFIER_TIMEOUT_MS = 30_000;
export const DEFAULT_VERIFIER_OUTPUT_BYTES = 1024 * 1024;

function sha256Text(text) {
  return createHash('sha256').update(text).digest('hex');
}

function evidenceFailure(track, artifactDir, evidencePath, preflight, errors, warnings, evidence = {}) {
  return {
    ok: false,
    stage: 'evidence',
    track: String(track).toLowerCase(),
    artifactDir: resolve(artifactDir),
    evidencePath: resolve(evidencePath),
    preflight,
    evidence,
    verifier: { executed: false },
    errors,
    warnings
  };
}

export function inspectRuntimeClosureIntake(
  trackName,
  artifactDir,
  evidencePath,
  {
    registry,
    spawnSyncImpl = spawnSync,
    maxEvidenceBytes = DEFAULT_MAX_EVIDENCE_BYTES,
    verifierTimeoutMs = DEFAULT_VERIFIER_TIMEOUT_MS,
    verifierOutputBytes = DEFAULT_VERIFIER_OUTPUT_BYTES
  } = {}
) {
  const normalizedTrack = String(trackName).toLowerCase();
  const resolvedArtifactDir = resolve(artifactDir);
  const resolvedEvidencePath = resolve(evidencePath);
  const preflightOptions = { intent: 'final-closure' };
  if (registry) preflightOptions.registry = registry;

  const preflight = inspectRuntimeArtifact(normalizedTrack, resolvedArtifactDir, preflightOptions);
  const warnings = [...(preflight.warnings || [])];

  if (!preflight.ok) {
    return {
      ok: false,
      stage: 'preflight',
      track: normalizedTrack,
      artifactDir: resolvedArtifactDir,
      evidencePath: resolvedEvidencePath,
      preflight,
      verifier: { executed: false },
      errors: [...(preflight.errors || [])],
      warnings
    };
  }

  const evidenceErrors = [];
  if (!existsSync(resolvedEvidencePath)) {
    evidenceErrors.push(`Evidence file does not exist: ${resolvedEvidencePath}`);
    return evidenceFailure(normalizedTrack, resolvedArtifactDir, resolvedEvidencePath, preflight, evidenceErrors, warnings);
  }

  const evidenceStat = statSync(resolvedEvidencePath);
  if (!evidenceStat.isFile()) {
    evidenceErrors.push(`Evidence path is not a regular file: ${resolvedEvidencePath}`);
    return evidenceFailure(normalizedTrack, resolvedArtifactDir, resolvedEvidencePath, preflight, evidenceErrors, warnings);
  }

  if (evidenceStat.size <= 0) {
    evidenceErrors.push('Evidence file is empty.');
  }
  if (evidenceStat.size > maxEvidenceBytes) {
    evidenceErrors.push(`Evidence file exceeds the ${maxEvidenceBytes}-byte intake limit: ${evidenceStat.size} bytes.`);
  }

  if (evidenceErrors.length > 0) {
    return evidenceFailure(normalizedTrack, resolvedArtifactDir, resolvedEvidencePath, preflight, evidenceErrors, warnings, {
      bytes: evidenceStat.size
    });
  }

  const evidenceText = readFileSync(resolvedEvidencePath, 'utf8');
  let parsedEvidence;
  try {
    parsedEvidence = JSON.parse(evidenceText);
  } catch (error) {
    evidenceErrors.push(`Evidence is not valid JSON: ${error.message}`);
  }

  if (!evidenceErrors.length && (!parsedEvidence || typeof parsedEvidence !== 'object' || Array.isArray(parsedEvidence))) {
    evidenceErrors.push('Evidence JSON must be a top-level object.');
  }

  const evidence = {
    bytes: evidenceStat.size,
    sha256: sha256Text(evidenceText),
    jsonObject: evidenceErrors.length === 0
  };

  if (evidenceErrors.length > 0) {
    return evidenceFailure(normalizedTrack, resolvedArtifactDir, resolvedEvidencePath, preflight, evidenceErrors, warnings, evidence);
  }

  const verifierPath = join(resolvedArtifactDir, preflight.verifier);
  const verifierRun = spawnSyncImpl(process.execPath, [verifierPath], {
    cwd: resolvedArtifactDir,
    input: evidenceText,
    encoding: 'utf8',
    timeout: verifierTimeoutMs,
    maxBuffer: verifierOutputBytes,
    windowsHide: true
  });

  const verifier = {
    executed: true,
    path: verifierPath,
    exitCode: Number.isInteger(verifierRun?.status) ? verifierRun.status : null,
    signal: verifierRun?.signal ?? null,
    stdout: typeof verifierRun?.stdout === 'string' ? verifierRun.stdout.trim() : '',
    stderr: typeof verifierRun?.stderr === 'string' ? verifierRun.stderr.trim() : ''
  };

  const errors = [];
  if (verifierRun?.error) {
    errors.push(`Same-artifact verifier failed to execute: ${verifierRun.error.message}`);
  }
  if (verifier.signal) {
    errors.push(`Same-artifact verifier terminated by signal: ${verifier.signal}`);
  }
  if (verifier.exitCode !== 0) {
    errors.push(`Same-artifact verifier did not accept the evidence (exit ${verifier.exitCode ?? 'unknown'}).`);
  }

  return {
    ok: errors.length === 0,
    stage: errors.length === 0 ? 'complete' : 'verifier',
    track: normalizedTrack,
    artifactDir: resolvedArtifactDir,
    evidencePath: resolvedEvidencePath,
    preflight,
    evidence,
    verifier,
    errors,
    warnings
  };
}

function usage() {
  console.error('Usage: node scripts/runtime-closure-intake.mjs <p5|p6|p7> <artifact-dir> <evidence-json> [--json]');
  process.exit(2);
}

function printHuman(result) {
  console.log(`Runtime closure intake: ${result.ok ? 'PASS' : 'FAIL'}`);
  console.log(`Track: ${result.track}`);
  console.log(`Stage: ${result.stage}`);
  console.log(`Artifact preflight: ${result.preflight?.ok ? 'PASS' : 'FAIL'}`);
  if (result.preflight?.immutableFileIntegrity) {
    console.log(`Immutable files: ${result.preflight.immutableFileIntegrity.matched}/${result.preflight.immutableFileIntegrity.checked} SHA-256 pins matched`);
  }
  if (result.evidence?.sha256) {
    console.log(`Evidence SHA-256: ${result.evidence.sha256}`);
    console.log(`Evidence bytes: ${result.evidence.bytes}`);
  }
  if (result.verifier?.executed) {
    console.log(`Same-artifact verifier: exit ${result.verifier.exitCode ?? 'unknown'}`);
    if (result.verifier.stdout) console.log(result.verifier.stdout);
    if (result.verifier.stderr) console.error(result.verifier.stderr);
  } else {
    console.log('Same-artifact verifier: NOT RUN');
  }
  for (const warning of result.warnings || []) console.log(`WARNING: ${warning}`);
  for (const error of result.errors || []) console.error(`ERROR: ${error}`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const positional = args.filter((arg) => !arg.startsWith('--'));
  if (positional.length !== 3) usage();

  const result = inspectRuntimeClosureIntake(positional[0], positional[1], positional[2]);
  if (json) console.log(JSON.stringify(result, null, 2));
  else printHuman(result);
  process.exit(result.ok ? 0 : 1);
}
