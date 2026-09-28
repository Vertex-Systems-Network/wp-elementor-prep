import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, writeFile, mkdir, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { build } from 'esbuild';
import { chromium } from 'playwright-core';

const root = resolve(new URL('.', import.meta.url).pathname, '..');
const fixtureRoot = join(root, 'fixtures', 'p18-react-runtime');
const proofDir = join(root, 'dist-p18', 'react-runtime-proof');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const env = process.env;
const chromePath = env.P18_REACT_CHROME_PATH || env.P17_CHROME_PATH;
const commitSha = env.P18_REACT_PROOF_GIT_SHA || 'local-unpinned';
const runId = env.P18_REACT_PROOF_RUN_ID || 'local';
const runAttempt = env.P18_REACT_PROOF_RUN_ATTEMPT || '1';
if (!chromePath) throw new Error('P18_REACT_CHROME_PATH or P17_CHROME_PATH is required.');

const run = (command, args, options) => new Promise((resolveRun, reject) => {
  const child = spawn(command, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error(command + ' timed out')); }, 180000);
  child.on('error', (error) => { clearTimeout(timer); reject(error); });
  child.on('close', (code) => { clearTimeout(timer); if (code === 0) resolveRun({ stdout, stderr }); else reject(new Error(command + ' exited ' + code + '\n' + stderr)); });
});
const waitForHttp = async (url) => {
  for (let i = 0; i < 40; i += 1) {
    try { const response = await fetch(url); if (response.ok) return; } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error('Preview did not become ready: ' + url);
};
const writeReceipt = async (receipt) => { await mkdir(proofDir, { recursive: true }); await writeFile(join(proofDir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n'); };

let preview;
let browser;
try {
  const temp = await mkdtemp(join(tmpdir(), 'wpb-p18-react-'));
  const bundlePath = join(temp, 'adapter.mjs');
  await build({ entryPoints: [join(root, 'src', 'targets', 'react', 'static-adapter.ts')], outfile: bundlePath, bundle: true, format: 'esm', platform: 'node', sourcemap: false, logLevel: 'silent' });
  const adapter = await import(bundlePath + '?sha=' + Date.now());
  const ir = {
    schemaVersion: 1,
    irVersion: 'p17-neutral-web-ir-v1',
    title: 'P18 runtime proof',
    language: 'en',
    direction: 'DESIGN_TO_WEB',
    nodes: [{
      nodeId: 'root',
      kind: 'container',
      semanticTag: 'main',
      layout: { mode: 'flex', direction: 'column', gapPx: 16, alignItems: 'start' },
      provenance: { source: 'FIGMA', sourceRef: 'p18/root' },
      children: [
        { nodeId: 'heading', kind: 'text', semantic: 'heading', headingLevel: 1, text: 'P18 React runtime proof', provenance: { source: 'FIGMA', sourceRef: 'p18/heading' } },
        { nodeId: 'copy', kind: 'text', semantic: 'paragraph', text: 'Generated from the neutral web IR.', provenance: { source: 'FIGMA', sourceRef: 'p18/copy' } },
        { nodeId: 'docs', kind: 'link', text: 'Read the docs', href: 'https://example.com/docs', role: 'link', openInNewTab: false, nofollow: false, provenance: { source: 'FIGMA', sourceRef: 'p18/docs' } }
      ]
    }]
  };
  const artifact = adapter.generateReactWebArtifact(ir, { language: 'typescript', styling: 'plain-css', scope: 'COMPONENT', componentName: 'ReactFixture', availableAssetPaths: [] });
  const validation = adapter.validateReactWebArtifact(artifact);
  if (artifact.status !== 'READY' || !validation.valid) throw new Error('Adapter fixture was not READY: ' + JSON.stringify({ status: artifact.status, validation }));
  const project = join(temp, 'project');
  await mkdir(join(project, 'src'), { recursive: true });
  for (const name of ['package.json', 'package-lock.json', 'index.html', 'vite.config.ts']) await cp(join(fixtureRoot, name), join(project, name));
  await cp(join(fixtureRoot, 'src', 'main.tsx'), join(project, 'src', 'main.tsx'));
  for (const file of artifact.files) await writeFile(join(project, 'src', file.path), file.content);
  const install = await run('npm', ['ci', '--ignore-scripts'], { cwd: project, env });
  const buildResult = await run('npm', ['run', 'build'], { cwd: project, env });
  preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4178'], { cwd: project, env: { ...env, BROWSER: 'none' }, stdio: ['ignore', 'pipe', 'pipe'] });
  await waitForHttp('http://127.0.0.1:4178/');
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  await page.goto('http://127.0.0.1:4178/', { waitUntil: 'networkidle' });
  const dom = await page.evaluate(() => ({
    sourceRefs: Array.from(document.querySelectorAll('[data-wpb-source]')).map((element) => element.getAttribute('data-wpb-source')),
    headingText: document.querySelector('h1')?.textContent || null,
    linkHref: document.querySelector('a')?.getAttribute('href') || null,
    rootChildCount: document.querySelector('main')?.children.length || 0,
    stylesheetCount: document.querySelectorAll('link[rel="stylesheet"]').length,
    inlineEventHandlerCount: Array.from(document.querySelectorAll('*')).filter((element) => Array.from(element.attributes).some((attribute) => attribute.name.startsWith('on'))).length
  }));
  const screenshot = await page.screenshot({ type: 'png', fullPage: true });
  const hostnames = requests.map((url) => new URL(url).hostname);
  const externalRequests = hostnames.filter((hostname) => hostname !== '127.0.0.1' && hostname !== 'localhost');
  if (externalRequests.length || consoleErrors.length || pageErrors.length) throw new Error('Runtime safety checks failed: ' + JSON.stringify({ externalRequests, consoleErrors, pageErrors }));
  if (dom.headingText !== 'P18 React runtime proof' || dom.linkHref !== 'https://example.com/docs' || dom.sourceRefs.length !== 4) throw new Error('Unexpected DOM observations: ' + JSON.stringify(dom));
  const browserVersion = await browser.version();
  const receipt = {
    status: 'RUNTIME_BUILD_AND_PREVIEW_PASS',
    adapterId: 'react-web',
    adapterVersion: 1,
    irSha256: artifact.analysis.irSha256,
    files: artifact.files.map((file) => ({ path: file.path, sha256: file.sha256 })),
    toolchain: { node: process.version, react: '19.3.0', reactDom: '19.3.0', vite: '8.3.1', npmCi: 'PASS', build: 'PASS', npmCiStdoutSha256: sha256(install.stdout), buildStdoutSha256: sha256(buildResult.stdout) },
    browser: { family: 'Chrome', version: browserVersion, executablePath: chromePath, viewport: { width: 1440, height: 900 }, dom, consoleErrorCount: consoleErrors.length, pageErrorCount: pageErrors.length, requestCount: requests.length, externalRequestCount: externalRequests.length, screenshotSha256: sha256(screenshot) },
    visualComparison: 'NOT_RUN',
    productionAcceptance: false,
    targetAcceptance: 'NOT_RUN',
    evidence: { commitSha, runId, runAttempt, generatedAt: new Date().toISOString(), scope: 'local React runtime preview only; Elementor target and visual parity are separate gates' }
  };
  await writeReceipt(receipt);
  await browser.close();
  await rm(temp, { recursive: true, force: true });
} catch (error) {
  const failure = { status: 'RUNTIME_BUILD_AND_PREVIEW_FAIL', error: String(error), evidence: { commitSha, runId, runAttempt, generatedAt: new Date().toISOString() } };
  await writeReceipt(failure);
  throw error;
} finally {
  if (browser) await browser.close().catch(() => {});
  if (preview) preview.kill('SIGTERM');
}
