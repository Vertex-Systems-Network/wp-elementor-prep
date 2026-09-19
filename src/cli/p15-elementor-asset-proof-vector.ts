import { lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import {
  P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES,
  P15_ELEMENTOR_ASSET_PROOF_VECTOR_VERSION,
  buildP15ElementorAssetProofVector,
} from '../targets/elementor/asset-proof-vector';

const DEFAULT_OUT_DIR = `dist-p15/${P15_ELEMENTOR_ASSET_PROOF_VECTOR_VERSION}`;

function fail(message: string): never {
  process.stderr.write(`P15_ELEMENTOR_ASSET_PROOF_VECTOR_FAILED: ${message}\n`);
  process.exit(2);
}

function parseArgs(argv: string[]): { outDir: string } {
  let outDir = DEFAULT_OUT_DIR;
  let seenOutDir = false;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith('--')) fail(`Unexpected argument: ${token ?? ''}`);
    const equals = token.indexOf('=');
    const key = equals >= 0 ? token.slice(2, equals) : token.slice(2);
    const value = equals >= 0 ? token.slice(equals + 1) : argv[++index];
    if (key !== 'out-dir') fail(`Unsupported option: --${key}.`);
    if (seenOutDir) fail('Duplicate option: --out-dir.');
    if (!value || value.startsWith('--')) fail('--out-dir requires a value.');
    outDir = value;
    seenOutDir = true;
  }
  return { outDir };
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: unknown }).code === 'ENOENT';
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (isMissingPathError(error)) return false;
    throw error;
  }
}

async function verifyExistingVector(
  outDir: string,
  expected: Readonly<Record<string, string>>,
): Promise<void> {
  const info = await lstat(outDir).catch((error: unknown) => {
    if (isMissingPathError(error)) return null;
    throw error;
  });
  if (!info || !info.isDirectory() || info.isSymbolicLink()) {
    fail('Existing --out-dir must be a real directory, not a file or symlink.');
  }

  const actualNames = (await readdir(outDir)).sort();
  const expectedNames = [...P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES].sort();
  if (actualNames.length !== expectedNames.length
    || actualNames.some((name, index) => name !== expectedNames[index])) {
    fail('Existing vector directory contains missing or unexpected files; refusing to overwrite it.');
  }

  for (const filename of P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES) {
    const actual = await readFile(join(outDir, filename));
    const expectedBytes = Buffer.from(expected[filename] ?? '', 'utf8');
    if (!actual.equals(expectedBytes)) {
      fail(`Existing vector drift detected in ${filename}; refusing to overwrite it.`);
    }
  }
}

async function writeNewVector(
  outDir: string,
  files: Readonly<Record<string, string>>,
): Promise<void> {
  const parent = dirname(outDir);
  await mkdir(parent, { recursive: true });
  const temp = await mkdtemp(join(parent, `.${basename(outDir)}-`));
  let committed = false;
  try {
    for (const filename of P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES) {
      await writeFile(join(temp, filename), files[filename] ?? '', {
        encoding: 'utf8',
        mode: 0o600,
        flag: 'wx',
      });
    }
    if (await pathExists(outDir)) {
      throw new Error('Vector output appeared during generation; refusing to overwrite it.');
    }
    await rename(temp, outDir);
    committed = true;
  } finally {
    if (!committed) await rm(temp, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const outDir = resolve(args.outDir);
  const vector = buildP15ElementorAssetProofVector();
  let status: 'GENERATED' | 'VERIFIED_EXISTING';

  if (await pathExists(outDir)) {
    await verifyExistingVector(outDir, vector.files);
    status = 'VERIFIED_EXISTING';
  } else {
    await writeNewVector(outDir, vector.files);
    status = 'GENERATED';
  }

  process.stdout.write(`${JSON.stringify({
    outDir,
    status,
    vectorVersion: vector.manifest.vectorVersion,
    candidateStatus: vector.manifest.candidateStatus,
    importValidationStatus: vector.manifest.importValidationStatus,
    candidateIdentity: vector.candidateIdentity.digest,
    targetProfileFingerprint: vector.targetProfileFingerprint,
    referenceReviewIdentityDigest: vector.referenceReviewIdentity.digest,
    assetUrlFingerprint: vector.assetUrlFingerprint,
    targetEnvironmentObserved: false,
    importObserved: false,
    renderObserved: false,
    imageReferenceObserved: false,
    browserImageLoadObserved: false,
    assetReferenceClosureClaim: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  }, null, 2)}\n`);
}

try {
  await main();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
