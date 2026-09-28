import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const outDir = process.env.P18_REACT_BUILD_OUT_DIR || 'dist-p18/react-static-build';
const commitSha = process.env.P18_REACT_PROOF_GIT_SHA || 'LOCAL_UNCOMMITTED';
const source = {
  schemaVersion: 1,
  irVersion: 'p17-neutral-web-ir-v1',
  title: 'P18 React static build fixture',
  language: 'en',
  direction: 'DESIGN_TO_WEB',
  nodes: [{
    kind: 'container', nodeId: 'root', provenance: { source: 'FIGMA', sourceRef: 'p18:root' },
    semanticTag: 'main', layout: { mode: 'flex', direction: 'column', gapPx: 16 },
    children: [
      { kind: 'text', nodeId: 'heading', provenance: { source: 'FIGMA', sourceRef: 'p18:heading' }, semantic: 'heading', headingLevel: 1, text: 'React fixture' },
      { kind: 'link', nodeId: 'docs', provenance: { source: 'FIGMA', sourceRef: 'p18:docs' }, role: 'link', text: 'Docs', href: 'https://example.com/docs' },
    ],
  }],
};

function hash(value) { return 'sha256:' + createHash('sha256').update(value).digest('hex'); }
await mkdir(outDir, { recursive: true });
const tempDir = await mkdtemp(join(tmpdir(), 'wpb-p18-react-'));
const adapterBundle = join(tempDir, 'adapter.mjs');
try {
  await build({ entryPoints: ['src/targets/react/static-adapter.ts'], bundle: true, format: 'esm', platform: 'node', outfile: adapterBundle, logLevel: 'silent' });
  const adapter = await import(pathToFileURL(adapterBundle).href);
  const artifact = adapter.generateReactWebArtifact(source, {
    language: 'typescript', styling: 'plain-css', scope: 'COMPONENT', componentName: 'ReactFixture', availableAssetPaths: [],
  });
  if (artifact.status !== 'READY') throw new Error('React fixture did not reach READY: ' + JSON.stringify(artifact.analysis.diagnostics));
  const component = artifact.files.find((file) => file.path.endsWith('.tsx'));
  const stylesheet = artifact.files.find((file) => file.path.endsWith('.css'));
  if (!component || !stylesheet) throw new Error('React adapter did not emit TSX and CSS files.');
  const componentPath = join(tempDir, component.path);
  const stylesheetPath = join(tempDir, stylesheet.path);
  await writeFile(componentPath, component.content, 'utf8');
  await writeFile(stylesheetPath, stylesheet.content, 'utf8');
  await build({
    entryPoints: [componentPath],
    bundle: true,
    write: false,
    platform: 'browser',
    format: 'esm',
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    external: ['react'],
    logLevel: 'silent',
  });
  const receipt = {
    status: 'STATIC_TSX_COMPILE_PASS',
    adapterId: artifact.receipt.adapterId,
    adapterVersion: artifact.receipt.adapterVersion,
    irSha256: artifact.receipt.irSha256,
    files: artifact.files.map((file) => ({ path: file.path, sha256: file.sha256 })),
    build: { tool: 'esbuild', mode: 'tsx-syntax-and-bundle', packageInstall: 'NOT_RUN', targetReactRuntime: 'NOT_RUN' },
    previewRender: 'NOT_RUN',
    visualComparison: 'NOT_RUN',
    productionAcceptance: false,
    sourceCommitSha: commitSha,
  };
  await writeFile(join(outDir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n', 'utf8');
  await writeFile(join(outDir, 'ReactFixture.tsx'), component.content, 'utf8');
  await writeFile(join(outDir, 'ReactFixture.css'), stylesheet.content, 'utf8');
  process.stdout.write(JSON.stringify(receipt) + '\n');
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
