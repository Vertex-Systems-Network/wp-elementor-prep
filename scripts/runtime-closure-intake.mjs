import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { closeSync, existsSync, fstatSync, lstatSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectRuntimeArtifact } from './runtime-artifact-preflight.mjs';

export const DEFAULT_MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
export const DEFAULT_VERIFIER_TIMEOUT_MS = 30_000;
export const DEFAULT_VERIFIER_OUTPUT_BYTES = 1024 * 1024;

const VERIFIED_VERIFIER_BOOTSTRAP = [
  "import { createHash } from 'node:crypto';",
  "import { readFileSync } from 'node:fs';",
  'const [verifierPath, expectedSha256] = process.argv.slice(1);',
  'try {',
  '  const verifierBytes = readFileSync(verifierPath);',
  "  const actualSha256 = createHash('sha256').update(verifierBytes).digest('hex');",
  '  if (actualSha256 !== expectedSha256) {',
  '    process.stderr.write(`Verified verifier bootstrap SHA-256 mismatch: expected ${expectedSha256}, got ${actualSha256}\\n`);',
  '    process.exitCode = 3;',
  '  } else {',
  "    await import(`data:text/javascript;base64,${verifierBytes.toString('base64')}`);",
  '  }',
  '} catch (error) {',
  "  const message = error instanceof Error ? error.message : String(error);",
  '  process.stderr.write(`Verified verifier bootstrap failed: ${message}\\n`);',
  '  process.exitCode = 3;',
  '}'
].join('\n');

function sha256Bytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function decodeUtf8Strict(bytes) {
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
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

function sameFileIdentity(before, opened) {
  return before.dev === opened.dev
    && before.ino === opened.ino
    && before.size === opened.size
    && before.mtimeMs === opened.mtimeMs
    && before.ctimeMs === opened.ctimeMs;
}

function readStableVerifierBytes(
  verifierPath,
  verifierName,
  preflight,
  { openSyncImpl, fstatSyncImpl, readFileSyncImpl, closeSyncImpl }
) {
  const errors = [];
  if (!existsSync(verifierPath)) {
    errors.push(`Same-artifact verifier no longer exists after preflight: ${verifierName}`);
    return { bytes: null, sha256: null, errors };
  }

  const verifierStat = lstatSync(verifierPath);
  if (verifierStat.isSymbolicLink()) {
    errors.push(`Same-artifact verifier became a symbolic link after preflight: ${verifierName}`);
    return { bytes: null, sha256: null, errors };
  }
  if (!verifierStat.isFile()) {
    errors.push(`Same-artifact verifier is no longer a regular file after preflight: ${verifierName}`);
    return { bytes: null, sha256: null, errors };
  }

  let verifierFd = null;
  let verifierBytes = null;
  try {
    verifierFd = openSyncImpl(verifierPath, 'r');
    const openedStat = fstatSyncImpl(verifierFd);
    if (!openedStat.isFile()) {
      errors.push(`Same-artifact verifier did not open as a regular file: ${verifierName}`);
    } else if (!sameFileIdentity(verifierStat, openedStat)) {
      errors.push(`Same-artifact verifier changed between validation and open: ${verifierName}`);
    } else {
      verifierBytes = readFileSyncImpl(verifierFd);
    }
  } catch (error) {
    errors.push(`Same-artifact verifier could not be opened safely: ${verifierName}: ${error.message}`);
  } finally {
    if (verifierFd !== null) {
      try {
        closeSyncImpl(verifierFd);
      } catch (error) {
        errors.push(`Same-artifact verifier descriptor could not be closed cleanly: ${verifierName}: ${error.message}`);
      }
    }
  }

  if (!verifierBytes || errors.length > 0) return { bytes: null, sha256: null, errors };

  const verifierSha256 = sha256Bytes(verifierBytes);
  const preflightSha256 = preflight.immutableFileIntegrity?.observedSha256?.[verifierName] ?? null;
  if (!preflightSha256) {
    errors.push(`Preflight did not report an immutable SHA-256 for the same-artifact verifier: ${verifierName}`);
  } else if (verifierSha256 !== preflightSha256) {
    errors.push(`Same-artifact verifier bytes changed after preflight: expected ${preflightSha256}, got ${verifierSha256}`);
  }

  return {
    bytes: errors.length === 0 ? verifierBytes : null,
    sha256: verifierSha256,
    errors
  };
}

export function inspectRuntimeClosureIntake(
  trackName,
  artifactDir,
  evidencePath,
  {
    registry,
    archivePath = null,
    spawnSyncImpl = spawnSync,
    openSyncImpl = openSync,
    fstatSyncImpl = fstatSync,
    readFileSyncImpl = readFileSync,
    closeSyncImpl = closeSync,
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
  if (archivePath) preflightOptions.archivePath = archivePath;

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

  const evidenceStat = lstatSync(resolvedEvidencePath);
  if (evidenceStat.isSymbolicLink()) {
    evidenceErrors.push(`Evidence path must not be a symbolic link: ${resolvedEvidencePath}`);
    return evidenceFailure(normalizedTrack, resolvedArtifactDir, resolvedEvidencePath, preflight, evidenceErrors, warnings);
  }
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

  let evidenceBytes;
  let evidenceFd = null;
  try {
    evidenceFd = openSyncImpl(resolvedEvidencePath, 'r');
    const openedStat = fstatSyncImpl(evidenceFd);
    if (!openedStat.isFile()) {
      evidenceErrors.push(`Evidence path did not open as a regular file: ${resolvedEvidencePath}`);
    } else if (!sameFileIdentity(evidenceStat, openedStat)) {
      evidenceErrors.push(`Evidence file changed between validation and open: ${resolvedEvidencePath}`);
    } else {
      evidenceBytes = readFileSyncImpl(evidenceFd);
    }
  } catch (error) {
    evidenceErrors.push(`Evidence file could not be opened safely: ${error.message}`);
  } finally {
    if (evidenceFd !== null) {
      try {
        closeSyncImpl(evidenceFd);
      } catch (error) {
        evidenceErrors.push(`Evidence file descriptor could not be closed cleanly: ${error.message}`);
      }
    }
  }

  if (evidenceErrors.length > 0 || !evidenceBytes) {
    return evidenceFailure(normalizedTrack, resolvedArtifactDir, resolvedEvidencePath, preflight, evidenceErrors, warnings, {
      bytes: evidenceStat.size
    });
  }

  const evidence = {
    bytes: evidenceBytes.length,
    sha256: sha256Bytes(evidenceBytes),
    hashScope: 'raw-file-bytes',
    utf8Valid: false,
    jsonObject: false
  };

  let evidenceText = '';
  try {
    evidenceText = decodeUtf8Strict(evidenceBytes);
    evidence.utf8Valid = true;
  } catch (error) {
    evidenceErrors.push(`Evidence is not valid UTF-8: ${error.message}`);
  }

  let parsedEvidence;
  if (evidenceErrors.length === 0) {
    try {
      parsedEvidence = JSON.parse(evidenceText);
    } catch (error) {
      evidenceErrors.push(`Evidence is not valid JSON: ${error.message}`);
    }
  }

  if (!evidenceErrors.length && (!parsedEvidence || typeof parsedEvidence !== 'object' || Array.isArray(parsedEvidence))) {
    evidenceErrors.push('Evidence JSON must be a top-level object.');
  }
  evidence.jsonObject = evidenceErrors.length === 0;

  if (evidenceErrors.length > 0) {
    return evidenceFailure(normalizedTrack, resolvedArtifactDir, resolvedEvidencePath, preflight, evidenceErrors, warnings, evidence);
  }

  const verifierPath = join(resolvedArtifactDir, preflight.verifier);
  const stableVerifier = readStableVerifierBytes(verifierPath, preflight.verifier, preflight, {
    openSyncImpl,
    fstatSyncImpl,
    readFileSyncImpl,
    closeSyncImpl
  });

  if (stableVerifier.errors.length > 0 || !stableVerifier.bytes || !stableVerifier.sha256) {
    return {
      ok: false,
      stage: 'verifier',
      track: normalizedTrack,
      artifactDir: resolvedArtifactDir,
      evidencePath: resolvedEvidencePath,
      preflight,
      evidence,
      verifier: {
        executed: false,
        path: verifierPath,
        sha256: stableVerifier.sha256,
        executionMode: 'verified-bytes-memory-bootstrap'
      },
      errors: stableVerifier.errors,
      warnings
    };
  }

  let verifierTempDir = null;
  let verifierRun = null;
  const verifierErrors = [];
  try {
    verifierTempDir = mkdtempSync(join(tmpdir(), 'wp-elementor-prep-verifier-'));
    const verifierExecutionPath = join(verifierTempDir, 'verified-verifier.mjs');
    writeFileSync(verifierExecutionPath, stableVerifier.bytes, { flag: 'wx', mode: 0o600 });
    verifierRun = spawnSyncImpl(process.execPath, [
      '--input-type=module',
      '--eval',
      VERIFIED_VERIFIER_BOOTSTRAP,
      verifierExecutionPath,
      stableVerifier.sha256
    ], {
      cwd: resolvedArtifactDir,
      input: evidenceText,
      encoding: 'utf8',
      timeout: verifierTimeoutMs,
      maxBuffer: verifierOutputBytes,
      windowsHide: true
    });
  } catch (error) {
    verifierErrors.push(`Same-artifact verifier failed to prepare or execute: ${error.message}`);
  } finally {
    if (verifierTempDir !== null) {
      try {
        rmSync(verifierTempDir, { recursive: true, force: true });
      } catch (error) {
        warnings.push(`Verified verifier temporary directory could not be removed cleanly: ${error.message}`);
      }
    }
  }

  const verifier = {
    executed: verifierRun !== null,
    path: verifierPath,
    sha256: stableVerifier.sha256,
    executionMode: 'verified-bytes-memory-bootstrap',
    exitCode: Number.isInteger(verifierRun?.status) ? verifierRun.status : null,
    signal: verifierRun?.signal ?? null,
    stdout: typeof verifierRun?.stdout === 'string' ? verifierRun.stdout.trim() : '',
    stderr: typeof verifierRun?.stderr === 'string' ? verifierRun.stderr.trim() : ''
  };

  if (verifierRun?.error) {
    verifierErrors.push(`Same-artifact verifier failed to execute: ${verifierRun.error.message}`);
  }
  if (verifier.signal) {
    verifierErrors.push(`Same-artifact verifier terminated by signal: ${verifier.signal}`);
  }
  if (verifier.executed && verifier.exitCode !== 0) {
    verifierErrors.push(`Same-artifact verifier did not accept the evidence (exit ${verifier.exitCode ?? 'unknown'}).`);
  }

  return {
    ok: verifierErrors.length === 0 && verifier.executed,
    stage: verifierErrors.length === 0 && verifier.executed ? 'complete' : 'verifier',
    track: normalizedTrack,
    artifactDir: resolvedArtifactDir,
    evidencePath: resolvedEvidencePath,
    preflight,
    evidence,
    verifier,
    errors: verifierErrors,
    warnings
  };
}

function usage() {
  console.error('Usage: node scripts/runtime-closure-intake.mjs <p5|p6|p7> <artifact-dir> <evidence-json> [--archive=/path/to/artifact.zip] [--json]');
  process.exit(2);
}

function printHuman(result) {
  console.log(`Runtime closure intake: ${result.ok ? 'PASS' : 'FAIL'}`);
  console.log(`Track: ${result.track}`);
  console.log(`Stage: ${result.stage}`);
  console.log(`Artifact preflight: ${result.preflight?.ok ? 'PASS' : 'FAIL'}`);
  if (result.preflight?.archiveIntegrity?.supplied) {
    console.log(`Artifact archive SHA-256: ${result.preflight.archiveIntegrity.matched ? 'MATCH' : 'MISMATCH'}`);
    if (result.preflight.archiveIntegrity.observedSha256) {
      console.log(`Observed archive SHA-256: ${result.preflight.archiveIntegrity.observedSha256}`);
    }
  }
  if (result.preflight?.immutableFileIntegrity) {
    console.log(`Immutable files: ${result.preflight.immutableFileIntegrity.matched}/${result.preflight.immutableFileIntegrity.checked} SHA-256 pins matched`);
  }
  if (result.evidence?.sha256) {
    console.log(`Evidence SHA-256 (raw bytes): ${result.evidence.sha256}`);
    console.log(`Evidence bytes: ${result.evidence.bytes}`);
  }
  if (result.verifier?.sha256) {
    console.log(`Same-artifact verifier SHA-256: ${result.verifier.sha256}`);
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
  const archiveArg = args.find((arg) => arg.startsWith('--archive='));
  const positional = args.filter((arg) => !arg.startsWith('--'));
  if (positional.length !== 3) usage();
  const archivePath = archiveArg ? archiveArg.slice('--archive='.length) : null;
  if (archiveArg && !archivePath) usage();

  const result = inspectRuntimeClosureIntake(positional[0], positional[1], positional[2], { archivePath });
  if (json) console.log(JSON.stringify(result, null, 2));
  else printHuman(result);
  process.exit(result.ok ? 0 : 1);
}
