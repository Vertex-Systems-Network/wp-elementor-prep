import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLACEHOLDER_PLUGIN_ID = '000000000000000000';
const registryPath = fileURLToPath(new URL('../config/runtime-artifacts.json', import.meta.url));

function loadRegistry() {
  return JSON.parse(readFileSync(registryPath, 'utf8'));
}

export function parseBuildInfo(text) {
  const values = {};
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index <= 0) continue;
    values[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return values;
}

export function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function readJson(path, errors, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    errors.push(`${label} is missing or invalid JSON: ${error.message}`);
    return null;
  }
}

function requireFile(dir, name, errors) {
  const path = join(dir, name);
  if (!existsSync(path)) {
    errors.push(`Missing required artifact file: ${name}`);
    return null;
  }

  const metadata = lstatSync(path);
  if (metadata.isSymbolicLink()) {
    errors.push(`Required artifact file must not be a symbolic link: ${name}`);
    return null;
  }
  if (!metadata.isFile()) {
    errors.push(`Missing required artifact file: ${name}`);
    return null;
  }
  return path;
}

function normalizeExpectedSha256(value) {
  return String(value || '').toLowerCase().replace(/^sha256:/, '');
}

export function inspectRuntimeArtifact(trackName, artifactDir, { intent = 'final-closure', registry = loadRegistry() } = {}) {
  const normalizedTrack = String(trackName).toLowerCase();
  const track = registry.tracks?.[normalizedTrack];
  const errors = [];
  const warnings = [];

  if (!track) {
    return {
      ok: false,
      track: normalizedTrack,
      intent,
      errors: [`Unknown runtime track: ${trackName}. Expected one of: ${Object.keys(registry.tracks || {}).join(', ')}`],
      warnings
    };
  }

  const dir = resolve(artifactDir);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    return { ok: false, track: normalizedTrack, intent, artifactDir: dir, errors: [`Artifact directory does not exist: ${dir}`], warnings };
  }

  const requiredFiles = ['BUILD_INFO.txt', 'manifest.json', 'code.js', 'ui.html', 'prepare-figma-import.mjs', track.verifier];
  const paths = {};
  for (const name of requiredFiles) paths[name] = requireFile(dir, name, errors);

  let buildInfo = {};
  if (paths['BUILD_INFO.txt']) {
    buildInfo = parseBuildInfo(readFileSync(paths['BUILD_INFO.txt'], 'utf8'));
    const expectedIdentity = {
      source_sha: track.sourceSha,
      workflow_sha: track.sourceSha,
      run_id: track.runId,
      run_number: track.runNumber
    };
    for (const [key, expected] of Object.entries(expectedIdentity)) {
      if (buildInfo[key] !== expected) {
        errors.push(`BUILD_INFO mismatch for ${key}: expected ${expected}, got ${buildInfo[key] ?? '<missing>'}`);
      }
    }
  }

  const immutableHashes = track.immutableFileSha256;
  const observedImmutableFileSha256 = {};
  let immutableFilesChecked = 0;
  let immutableFilesMatched = 0;

  if (!immutableHashes || typeof immutableHashes !== 'object' || Object.keys(immutableHashes).length === 0) {
    errors.push(`Registry track ${normalizedTrack} is missing immutable SHA-256 file pins.`);
  } else {
    for (const [name, configuredHash] of Object.entries(immutableHashes)) {
      const expectedHash = normalizeExpectedSha256(configuredHash);
      if (!/^[a-f0-9]{64}$/.test(expectedHash)) {
        errors.push(`Registry SHA-256 for ${name} is invalid: ${configuredHash}`);
        continue;
      }

      const path = paths[name] || requireFile(dir, name, errors);
      if (!path) continue;

      immutableFilesChecked += 1;
      const actualHash = sha256File(path);
      observedImmutableFileSha256[name] = actualHash;
      if (actualHash !== expectedHash) {
        errors.push(`SHA-256 mismatch for ${name}: expected ${expectedHash}, got ${actualHash}`);
      } else {
        immutableFilesMatched += 1;
      }
    }
  }

  const manifest = paths['manifest.json'] ? readJson(paths['manifest.json'], errors, 'manifest.json') : null;
  let needsManifestRebind = null;
  if (manifest) {
    if (manifest.main !== 'code.js') errors.push(`manifest.main must be code.js, got ${manifest.main ?? '<missing>'}`);
    if (manifest.ui !== 'ui.html') errors.push(`manifest.ui must be ui.html, got ${manifest.ui ?? '<missing>'}`);

    const pluginId = String(manifest.id ?? '');
    needsManifestRebind = pluginId === PLACEHOLDER_PLUGIN_ID;
    if (!needsManifestRebind && !/^\d{10,}$/.test(pluginId)) {
      errors.push(`manifest.id must be the placeholder or a numeric Figma plugin id, got ${pluginId || '<missing>'}`);
    }

    const commands = new Set(Array.isArray(manifest.menu) ? manifest.menu.map((item) => item?.command).filter(Boolean) : []);
    for (const command of track.requiredMenuCommands) {
      if (!commands.has(command)) errors.push(`manifest.menu missing required command: ${command}`);
    }

    const allowedDomains = manifest.networkAccess?.allowedDomains;
    if (!Array.isArray(allowedDomains) || allowedDomains.length !== 1 || allowedDomains[0] !== 'none') {
      errors.push('manifest networkAccess must remain offline-only with allowedDomains=["none"]');
    }
  }

  if (intent === 'final-closure' && !track.finalClosureEligible) {
    errors.push(`Track ${normalizedTrack} is not eligible for final closure on this registered artifact. ${track.closureNote}`);
  } else if (!track.finalClosureEligible) {
    warnings.push(track.closureNote);
  }

  if (needsManifestRebind) {
    warnings.push('Artifact still uses the placeholder Figma plugin id; run its packaged prepare-figma-import.mjs before importing into Figma.');
  }

  return {
    ok: errors.length === 0,
    track: normalizedTrack,
    intent,
    artifactDir: dir,
    registeredArtifact: {
      name: track.artifactName,
      issue: track.issue,
      branch: track.branch,
      sourceSha: track.sourceSha,
      runId: track.runId,
      runNumber: track.runNumber,
      digest: track.digest,
      finalClosureEligible: track.finalClosureEligible
    },
    observedBuild: {
      sourceSha: buildInfo.source_sha ?? null,
      workflowSha: buildInfo.workflow_sha ?? null,
      runId: buildInfo.run_id ?? null,
      runNumber: buildInfo.run_number ?? null
    },
    immutableFileIntegrity: {
      checked: immutableFilesChecked,
      matched: immutableFilesMatched,
      observedSha256: observedImmutableFileSha256,
      manifestIntentionallyExcluded: true
    },
    verifier: track.verifier,
    needsManifestRebind,
    errors,
    warnings
  };
}

function usage() {
  console.error('Usage: node scripts/runtime-artifact-preflight.mjs <p5|p6|p7> <artifact-dir> [--intent=final-closure|reference] [--json]');
  process.exit(2);
}

function printHuman(result) {
  console.log(`Runtime artifact preflight: ${result.ok ? 'PASS' : 'FAIL'}`);
  console.log(`Track: ${result.track}`);
  console.log(`Intent: ${result.intent}`);
  if (result.registeredArtifact) {
    console.log(`Registered artifact: ${result.registeredArtifact.name}`);
    console.log(`Source SHA: ${result.registeredArtifact.sourceSha}`);
    console.log(`CI run: #${result.registeredArtifact.runNumber} (${result.registeredArtifact.runId})`);
    console.log(`Final closure eligible: ${result.registeredArtifact.finalClosureEligible ? 'yes' : 'no'}`);
  }
  if (result.immutableFileIntegrity) {
    console.log(`Immutable files: ${result.immutableFileIntegrity.matched}/${result.immutableFileIntegrity.checked} SHA-256 pins matched`);
    console.log('Manifest hash: intentionally not pinned because plugin-id rebinding is an allowed manifest-only change');
  }
  if (result.needsManifestRebind === true) console.log('Manifest: placeholder id; local rebinding required before Figma import');
  if (result.needsManifestRebind === false) console.log('Manifest: plugin id already rebound');
  for (const warning of result.warnings || []) console.log(`WARNING: ${warning}`);
  for (const error of result.errors || []) console.error(`ERROR: ${error}`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const intentArg = args.find((arg) => arg.startsWith('--intent='));
  const positional = args.filter((arg) => !arg.startsWith('--'));
  if (positional.length !== 2) usage();
  const intent = intentArg ? intentArg.slice('--intent='.length) : 'final-closure';
  if (!['final-closure', 'reference'].includes(intent)) usage();
  const result = inspectRuntimeArtifact(positional[0], positional[1], { intent });
  if (json) console.log(JSON.stringify(result, null, 2));
  else printHuman(result);
  process.exit(result.ok ? 0 : 1);
}
