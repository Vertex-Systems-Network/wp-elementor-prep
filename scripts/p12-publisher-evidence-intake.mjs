import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_CONFIG = 'config/p12-publisher-candidate.json';
const MAX_EVIDENCE_BYTES = 25 * 1024 * 1024;
const MAX_PACKAGE_BYTES = 100 * 1024 * 1024;

function fail(message) {
  throw new Error(`P12 publisher evidence intake failed: ${message}`);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function parseArgs(argv) {
  const values = new Map();
  for (const token of argv) {
    if (!token.startsWith('--') || !token.includes('=')) fail(`unexpected argument: ${token}`);
    const separator = token.indexOf('=');
    values.set(token.slice(2, separator), token.slice(separator + 1));
  }
  return values;
}

function readYes(value) {
  return String(value ?? '').trim().toLowerCase() === 'yes';
}

function validateCandidate(candidate) {
  if (!candidate || candidate.schemaVersion !== 1) fail('candidate contract schemaVersion must equal 1.');
  if (!/^\d{10,30}$/.test(candidate.pluginId ?? '')) fail('candidate pluginId must be a numeric Figma plugin ID.');
  if (!/^[0-9a-f]{40}$/.test(candidate.sourceSha ?? '')) fail('candidate sourceSha must be a 40-character Git SHA.');
}

function detectImageFormat(bytes) {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png';
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpeg';
  }

  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

async function readRegularFile(path, label, maxBytes = MAX_EVIDENCE_BYTES) {
  let stat;
  try {
    stat = await lstat(path);
  } catch {
    fail(`${label} does not exist: ${path}`);
  }
  if (stat.isSymbolicLink()) fail(`${label} must not be a symbolic link: ${path}`);
  if (!stat.isFile()) fail(`${label} must be a regular file: ${path}`);
  if (stat.size <= 0) fail(`${label} must not be empty: ${path}`);
  if (stat.size > maxBytes) fail(`${label} exceeds ${maxBytes} bytes: ${path}`);
  const bytes = await readFile(path);
  return { bytes, size: stat.size, sha256: sha256(bytes) };
}

async function readScreenshotFile(path, label) {
  const file = await readRegularFile(path, label);
  const imageFormat = detectImageFormat(file.bytes);
  if (!imageFormat) {
    fail(`${label} must contain PNG, JPEG, or WebP image bytes: ${path}`);
  }
  return { ...file, imageFormat };
}

async function validatePackageDirectory(packageDir, candidate) {
  const root = resolve(packageDir);
  let rootStat;
  try {
    rootStat = await lstat(root);
  } catch {
    fail(`package directory does not exist: ${root}`);
  }
  if (rootStat.isSymbolicLink()) fail(`package directory must not be a symbolic link: ${root}`);
  if (!rootStat.isDirectory()) fail(`package path must be a directory: ${root}`);

  const expectedFiles = Object.keys(candidate.importPackage?.files ?? {}).sort();
  if (expectedFiles.length === 0) fail('candidate contract has no importPackage.files entries.');

  const entries = (await readdir(root, { withFileTypes: true }))
    .filter((entry) => !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort();
  const unexpected = entries.filter((entry) => !expectedFiles.includes(entry));
  const missing = expectedFiles.filter((entry) => !entries.includes(entry));
  if (missing.length > 0) fail(`package directory is missing required files: ${missing.join(', ')}`);
  if (unexpected.length > 0) fail(`package directory contains unexpected files: ${unexpected.join(', ')}`);

  const files = {};
  for (const name of expectedFiles) {
    const evidence = await readRegularFile(resolve(root, name), `package file ${name}`, MAX_PACKAGE_BYTES);
    const expectedSha = candidate.importPackage.files[name];
    if (evidence.sha256 !== expectedSha) {
      fail(`package file hash mismatch for ${name}: expected ${expectedSha}, got ${evidence.sha256}`);
    }
    files[name] = { sha256: evidence.sha256, size: evidence.size };
  }

  let manifest;
  try {
    manifest = JSON.parse((await readFile(resolve(root, 'manifest.json'))).toString('utf8'));
  } catch (error) {
    fail(`manifest.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  const expectedManifest = candidate.expectedManifest ?? {};
  if (manifest.name !== expectedManifest.name) fail(`manifest name mismatch: ${manifest.name}`);
  if (manifest.id !== expectedManifest.id) fail(`manifest id mismatch: ${manifest.id}`);
  if (manifest.api !== expectedManifest.api) fail(`manifest api mismatch: ${manifest.api}`);
  if (manifest.documentAccess !== expectedManifest.documentAccess) {
    fail(`manifest documentAccess mismatch: ${manifest.documentAccess}`);
  }
  if (JSON.stringify(manifest.editorType ?? []) !== JSON.stringify(expectedManifest.editorType ?? [])) {
    fail('manifest editorType mismatch.');
  }
  const allowedDomains = manifest.networkAccess?.allowedDomains ?? [];
  if (JSON.stringify(allowedDomains) !== JSON.stringify(expectedManifest.allowedDomains ?? [])) {
    fail(`manifest allowedDomains mismatch: ${JSON.stringify(allowedDomains)}`);
  }

  return { root, files, manifest };
}

export async function collectPublisherPackagePreflight({
  candidate,
  packageDir,
  packageZipPath,
  generatedAt = new Date().toISOString(),
}) {
  validateCandidate(candidate);
  if (!packageZipPath) fail('missing exact publish ZIP path.');
  const packageZip = await readRegularFile(resolve(packageZipPath), 'exact publish ZIP', MAX_PACKAGE_BYTES);
  if (packageZip.sha256 !== candidate.importPackage?.sha256) {
    fail(`publish ZIP hash mismatch: expected ${candidate.importPackage?.sha256}, got ${packageZip.sha256}`);
  }

  const packageEvidence = await validatePackageDirectory(packageDir, candidate);
  return {
    schemaVersion: 1,
    generatedAt,
    gate: 'p12-publisher-package-preflight',
    acceptanceAuthority: false,
    packagePreflightComplete: true,
    evidenceBundleComplete: false,
    runtimeEvidenceCollected: false,
    candidate: {
      releaseLabel: candidate.releaseLabel,
      pluginName: candidate.pluginName,
      packageVersion: candidate.packageVersion,
      pluginId: candidate.pluginId,
      sourceSha: candidate.sourceSha,
      artifact: candidate.artifact,
      importPackageSha256: candidate.importPackage?.sha256,
      supportContact: candidate.community?.supportContact,
      publishTarget: candidate.community?.publishTarget,
    },
    package: {
      zip: {
        filename: basename(packageZipPath),
        sha256: packageZip.sha256,
        size: packageZip.size,
      },
      files: packageEvidence.files,
      manifest: {
        name: packageEvidence.manifest.name,
        id: packageEvidence.manifest.id,
        api: packageEvidence.manifest.api,
        editorType: packageEvidence.manifest.editorType,
        documentAccess: packageEvidence.manifest.documentAccess,
        allowedDomains: packageEvidence.manifest.networkAccess?.allowedDomains ?? [],
      },
    },
    semantics: {
      packageBytesAndManifestValidatedOnly: true,
      noRuntimeObservationClaimed: true,
      noPublisherIdentityClaimed: true,
      noTwoFactorStateClaimed: true,
      noCommunitySubmissionOrApprovalClaimed: true,
      finalEvidenceIntakeStillRequired: true,
    },
  };
}

export async function collectPublisherEvidence({
  candidate,
  packageDir,
  packageZipPath,
  evidencePaths,
  attestations,
  generatedAt = new Date().toISOString(),
}) {
  const packagePreflight = await collectPublisherPackagePreflight({
    candidate,
    packageDir,
    packageZipPath,
    generatedAt,
  });

  const evidence = {};
  const hashesToEvidenceKeys = new Map();
  for (const key of candidate.requiredEvidence ?? []) {
    const path = evidencePaths?.[key];
    if (!path) fail(`missing required evidence path: ${key}`);
    const file = await readScreenshotFile(resolve(path), key);
    const existingKeys = hashesToEvidenceKeys.get(file.sha256) ?? [];
    existingKeys.push(key);
    hashesToEvidenceKeys.set(file.sha256, existingKeys);
    evidence[key] = {
      filename: basename(path),
      sha256: file.sha256,
      size: file.size,
      imageFormat: file.imageFormat,
    };
  }

  const duplicateEvidenceGroups = [...hashesToEvidenceKeys.values()].filter((keys) => keys.length > 1);
  if (duplicateEvidenceGroups.length > 0) {
    fail(
      `required evidence screenshots must be distinct; duplicate image bytes detected for: ${duplicateEvidenceGroups
        .map((keys) => keys.join(' / '))
        .join(', ')}`,
    );
  }

  const normalizedAttestations = {};
  const missingAttestations = [];
  for (const key of candidate.requiredAttestations ?? []) {
    const value = attestations?.[key] === true;
    normalizedAttestations[key] = value;
    if (!value) missingAttestations.push(key);
  }
  if (missingAttestations.length > 0) {
    fail(`missing required operator attestations: ${missingAttestations.join(', ')}`);
  }

  return {
    schemaVersion: 1,
    generatedAt,
    gate: 'p12-publisher-evidence-intake',
    acceptanceAuthority: false,
    packagePreflightComplete: true,
    evidenceBundleComplete: true,
    candidate: packagePreflight.candidate,
    package: packagePreflight.package,
    evidence,
    operatorAttestations: normalizedAttestations,
    semantics: {
      screenshotsAreFormatValidatedAndHashedNotInterpreted: true,
      screenshotsMustBeDistinct: true,
      operatorAttestationsAreManualClaims: true,
      finalInternalAcceptanceRequiresSeparateReview: true,
      communityApprovalIsExternal: true,
    },
  };
}

export async function runPublisherEvidenceIntake(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const configPath = resolve(args.get('config') ?? DEFAULT_CONFIG);
  let candidate;
  try {
    candidate = JSON.parse(await readFile(configPath, 'utf8'));
  } catch (error) {
    fail(`unable to read candidate config: ${error instanceof Error ? error.message : String(error)}`);
  }

  const packageDir = args.get('package-dir');
  if (!packageDir) fail('missing --package-dir=...');
  const packageZipPath = args.get('package-zip');
  if (!packageZipPath) fail('missing --package-zip=...');
  const preflightOnly = readYes(args.get('preflight-only'));

  if (preflightOnly) {
    const authorityBearingKeys = [
      'runtime-screenshot',
      'publish-screenshot',
      'twofa-screenshot',
      'confirm-exact-package-opened',
      'confirm-valid-manifest-id',
      'confirm-publisher-identity',
      'confirm-community-target',
      'confirm-support-contact',
      'confirm-no-network-access',
      'confirm-twofa-enabled',
    ];
    const suppliedAuthorityArgs = authorityBearingKeys.filter((key) => args.has(key));
    if (suppliedAuthorityArgs.length > 0) {
      fail(`preflight-only mode does not accept runtime/publisher evidence arguments: ${suppliedAuthorityArgs.join(', ')}`);
    }

    const outPath = resolve(args.get('out') ?? 'dist-p12/p12-publisher-package-preflight.json');
    const receipt = await collectPublisherPackagePreflight({ candidate, packageDir, packageZipPath });
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
    console.log(`P12 publisher package preflight PASS: ${candidate.pluginName} ${candidate.packageVersion}`);
    console.log(`Plugin ID: ${candidate.pluginId}`);
    console.log(`Source SHA: ${candidate.sourceSha}`);
    console.log(`Receipt: ${outPath}`);
    console.log('Acceptance authority: false (live Figma evidence has not been collected)');
    return receipt;
  }

  const outPath = resolve(args.get('out') ?? 'dist-p12/p12-publisher-evidence-receipt.json');
  const evidencePaths = {
    runtimeScreenshot: args.get('runtime-screenshot'),
    publishDetailsScreenshot: args.get('publish-screenshot'),
    twoFactorScreenshot: args.get('twofa-screenshot'),
  };
  const attestations = {
    exactPackageOpened: readYes(args.get('confirm-exact-package-opened')),
    validManifestIdObserved: readYes(args.get('confirm-valid-manifest-id')),
    publisherIdentityObserved: readYes(args.get('confirm-publisher-identity')),
    communityTargetObserved: readYes(args.get('confirm-community-target')),
    supportContactObserved: readYes(args.get('confirm-support-contact')),
    noNetworkAccessObserved: readYes(args.get('confirm-no-network-access')),
    twoFactorEnabledObserved: readYes(args.get('confirm-twofa-enabled')),
  };

  const receipt = await collectPublisherEvidence({
    candidate,
    packageDir,
    packageZipPath,
    evidencePaths,
    attestations,
  });
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  console.log(`P12 publisher evidence intake PASS: ${candidate.pluginName} ${candidate.packageVersion}`);
  console.log(`Plugin ID: ${candidate.pluginId}`);
  console.log(`Source SHA: ${candidate.sourceSha}`);
  console.log(`Receipt: ${outPath}`);
  console.log('Acceptance authority: false (final internal review is still required)');
  return receipt;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  runPublisherEvidenceIntake().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
