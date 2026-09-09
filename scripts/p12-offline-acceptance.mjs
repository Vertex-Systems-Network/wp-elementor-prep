import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

function fail(message) {
  throw new Error(`P12 offline acceptance failed: ${message}`);
}

function parseArgs(argv) {
  const values = new Map();
  for (const token of argv) {
    if (!token.startsWith('--') || !token.includes('=')) fail(`unexpected argument ${token}`);
    const index = token.indexOf('=');
    values.set(token.slice(2, index), token.slice(index + 1));
  }
  return values;
}

function runNode(args, expectedExit = 0) {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: process.env,
    windowsHide: true,
  });
  if (result.error) fail(`unable to execute ${args.join(' ')}: ${result.error.message}`);
  if (result.status !== expectedExit) {
    fail(
      `${args.join(' ')} exited ${result.status}, expected ${expectedExit}. stdout=${JSON.stringify(result.stdout)} stderr=${JSON.stringify(result.stderr)}`,
    );
  }
  return { stdout: result.stdout, stderr: result.stderr };
}

async function assertSameFile(left, right, label) {
  const [a, b] = await Promise.all([readFile(left), readFile(right)]);
  if (!a.equals(b)) fail(`${label} is not byte-identical across repeated runs.`);
}

async function assertMissing(path, label) {
  try {
    await stat(path);
    fail(`${label} should not exist.`);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return;
    throw error;
  }
}

function nodeFixture({ id, name, type = 'FRAME', x = 0, y = 0, width = 100, height = 100, children = [], text = null, image = false, generic = false, layoutMode = 'NONE' }) {
  return {
    id,
    name,
    type,
    geometry: { x, y, width, height },
    layoutMode,
    isAutoLayout: layoutMode === 'HORIZONTAL' || layoutMode === 'VERTICAL' || layoutMode === 'GRID',
    isContainer: children.length > 0,
    isText: type === 'TEXT',
    isImageLike: image,
    isGenericName: generic,
    textLength: typeof text === 'string' ? text.length : 0,
    textAutoResize: type === 'TEXT' ? 'HEIGHT' : null,
    absolutePositioned: false,
    clipsContent: type === 'FRAME',
    opacity: 1,
    visible: true,
    childIds: children.map((child) => child.id),
    children,
  };
}

function canonicalSnapshot() {
  const heading = nodeFixture({
    id: '2:1',
    name: 'Hero Heading',
    type: 'TEXT',
    x: 80,
    y: 90,
    width: 520,
    height: 72,
    text: 'Deterministic Elementor preparation',
  });
  const image = nodeFixture({
    id: '2:2',
    name: 'Hero Image',
    type: 'RECTANGLE',
    x: 760,
    y: 80,
    width: 560,
    height: 420,
    image: true,
  });
  const hero = nodeFixture({
    id: '1:1',
    name: 'Hero Section',
    x: 0,
    y: 0,
    width: 1440,
    height: 600,
    layoutMode: 'NONE',
    children: [heading, image],
  });
  const genericText = nodeFixture({
    id: '3:1',
    name: 'Text 1',
    type: 'TEXT',
    x: 80,
    y: 700,
    width: 720,
    height: 48,
    text: 'This intentionally generic layer exercises backlog output.',
    generic: true,
  });
  const content = nodeFixture({
    id: '1:2',
    name: 'Frame 2',
    x: 0,
    y: 600,
    width: 1440,
    height: 500,
    layoutMode: 'VERTICAL',
    generic: true,
    children: [genericText],
  });
  const root = nodeFixture({
    id: '1:0',
    name: 'Desktop Acceptance Fixture',
    x: 0,
    y: 0,
    width: 1440,
    height: 1100,
    layoutMode: 'VERTICAL',
    children: [hero, content],
  });

  return {
    schemaVersion: 1,
    capturedAt: '2026-09-10T00:00:00.000Z',
    source: {
      kind: 'adapter-export',
      fileKey: 'p12-offline-fixture',
      fileName: 'P12 Offline Fixture',
      pageId: '0:1',
      pageName: 'Acceptance',
      nodeId: root.id,
      nodeName: root.name,
      revision: 'fixture-v1',
    },
    root,
  };
}

const args = parseArgs(process.argv.slice(2));
const reportPath = resolve(args.get('report') ?? 'dist-p12/p12-offline-acceptance.json');
const sourceSha = process.env.GITHUB_SHA && /^[0-9a-f]{40}$/i.test(process.env.GITHUB_SHA)
  ? process.env.GITHUB_SHA.toLowerCase()
  : null;
const root = await mkdtemp(join(tmpdir(), 'wp elementor prep p12 '));

const checks = {
  cliBundleBuild: 'PENDING',
  canonicalSnapshotAuditRepeatability: 'PENDING',
  backlogGenerationRepeatability: 'PENDING',
  summaryOnlyRepeatability: 'PENDING',
  rawFigFailClosed: 'PENDING',
  releasePackageRepeatability: 'PENDING',
  releasePackageVerification: 'PENDING',
  pathWithSpaces: 'PENDING',
};

try {
  runNode(['scripts/build-cli.mjs']);
  checks.cliBundleBuild = 'PASS';
  const cli = resolve('dist-cli/elementor-prep.mjs');
  await stat(cli);

  const snapshotPath = join(root, 'input with spaces', 'canonical snapshot.json');
  await mkdir(dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, `${JSON.stringify(canonicalSnapshot(), null, 2)}\n`, 'utf8');

  const auditA = join(root, 'audit output A');
  const auditB = join(root, 'audit output B');
  runNode([cli, 'audit:snapshot', `--input=${snapshotPath}`, `--out=${auditA}`]);
  runNode([cli, 'audit:snapshot', `--input=${snapshotPath}`, `--out=${auditB}`]);

  for (const filename of ['audit-report.json', 'audit-report.md', 'backlog.json', 'backlog.md']) {
    await assertSameFile(join(auditA, filename), join(auditB, filename), filename);
  }
  checks.canonicalSnapshotAuditRepeatability = 'PASS';
  checks.pathWithSpaces = 'PASS';

  const backlogA = join(root, 'backlog regenerate A');
  const backlogB = join(root, 'backlog regenerate B');
  runNode([cli, 'backlog:generate', `--input=${join(auditA, 'audit-report.json')}`, `--out=${backlogA}`]);
  runNode([cli, 'backlog:generate', `--input=${join(auditA, 'audit-report.json')}`, `--out=${backlogB}`]);
  for (const filename of ['backlog.json', 'backlog.md']) {
    await assertSameFile(join(backlogA, filename), join(backlogB, filename), `regenerated ${filename}`);
  }
  checks.backlogGenerationRepeatability = 'PASS';

  const summaryOut = join(root, 'summary should not write files');
  const summaryA = runNode([cli, 'audit:snapshot', `--input=${snapshotPath}`, `--out=${summaryOut}`, '--summary-only']);
  const summaryB = runNode([cli, 'audit:snapshot', `--input=${snapshotPath}`, `--out=${summaryOut}`, '--summary-only']);
  if (summaryA.stdout !== summaryB.stdout) fail('summary-only stdout changed across identical runs.');
  JSON.parse(summaryA.stdout);
  await assertMissing(summaryOut, 'summary-only output directory');
  checks.summaryOnlyRepeatability = 'PASS';

  const figPath = join(root, 'raw design with spaces.fig');
  await writeFile(figPath, 'not a real fig payload', 'utf8');
  const rawFig = runNode([cli, 'audit:snapshot', `--input=${figPath}`], 2);
  if (!rawFig.stderr.startsWith('UNSUPPORTED_FIG_LOCAL_FILE:')) {
    fail(`raw .fig refusal did not expose the stable error code: ${JSON.stringify(rawFig.stderr)}`);
  }
  checks.rawFigFailClosed = 'PASS';

  const releaseA = join(root, 'release package A');
  const releaseB = join(root, 'release package B');
  const releaseArgs = [
    '--fixture',
    '--plugin-id=123456789012345678',
    '--source-sha=0123456789abcdef0123456789abcdef01234567',
  ];
  runNode(['scripts/build-release.mjs', ...releaseArgs, `--out=${releaseA}`]);
  runNode(['scripts/build-release.mjs', ...releaseArgs, `--out=${releaseB}`]);

  for (const filename of [
    'plugin/code.js',
    'plugin/manifest.json',
    'plugin/ui.html',
    'RELEASE_INFO.json',
    'SHA256SUMS.txt',
  ]) {
    await assertSameFile(join(releaseA, filename), join(releaseB, filename), `release ${filename}`);
  }
  checks.releasePackageRepeatability = 'PASS';

  runNode(['scripts/verify-release-package.mjs', releaseA, '--allow-fixture']);
  runNode(['scripts/verify-release-package.mjs', releaseB, '--allow-fixture']);
  checks.releasePackageVerification = 'PASS';

  const failed = Object.entries(checks).filter(([, value]) => value !== 'PASS');
  if (failed.length > 0) fail(`incomplete checks: ${failed.map(([name]) => name).join(', ')}`);

  const report = {
    schemaVersion: 1,
    acceptance: 'PASS',
    sourceSha,
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    checks,
    limitations: {
      realFigmaRestCredentialedExecution: 'PENDING',
      realFigmaDesktopPluginImport: 'PENDING',
      p5RenderedPixelClosure: 'PENDING',
      p6RealFigmaClosure: 'PENDING',
      p7RealFigmaStressCancellationClosure: 'PENDING',
      communitySubmissionAndReview: 'PENDING',
    },
  };

  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`P12 offline acceptance PASS on ${process.platform}/${process.arch}\n`);
  process.stdout.write(`Evidence: ${reportPath}\n`);
} finally {
  await rm(root, { recursive: true, force: true });
}
