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

export async function collectPublisherEvidence({
  candidate,
  packageDir,
  packageZipPath,
  evidencePaths,
  attestations,
  generatedAt = new Date().toISOString(),
}) {
  if (!candidate || candidate.schemaVersion !== 1) fail('candidate contract schemaVersion must equal 1.');
  if (!/^\d{10,30}$/.test(candidate.pluginId ?? '')) fail('candidate pluginId must be a numeric Figma plugin ID.');
  if (!/^[0-9a-f]{40}$/.test(candidate.sourceSha ?? '')) fail('candidate sourceSha must be a 40-character Git SHA.');

  if (!packageZipPath) fail('missing exact publish ZIP path.');
  const packageZip = await readRegularFile(resolve(packageZipPath), 'exact publish ZIP', MAX_PACKAGE_BYTES);
  if (packageZip.sha256 !== candidate.importPackage?.sha256) {
    fail(`publish ZIP hash mismatch: expected ${candidate.importPackage?.sha256}, got ${packageZip.sha256}`);
  }

  const packageEvidence = await validatePackageDirectory(packageDir, candidate);
  const evidence = {};
  for (const key of candidate.requiredEvidence ?? []) {
    const path = evidencePaths?.[key];
    if (!path) fail(`missing required evidence path: ${key}`);
    const file = await readRegularFile(resolve(path), key);
    evidence[key] = {
      filename: basename(path),
      sha256: file.sha256,
      size: file.size,
    };
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
    evidenceBundleComplete: true,
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
    evidence,
    operatorAttestations: normalizedAttestations,
    semantics: {
      screenshotsAreHashedNotInterpreted: true,
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
