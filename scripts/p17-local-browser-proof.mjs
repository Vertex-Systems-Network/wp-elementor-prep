import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { chromium } from 'playwright-core';

const FIXTURE_PATH = 'fixtures/p17/local-browser-proof-neutral-web.json';
const OUT_DIR = process.env.P17_BROWSER_PROOF_OUT_DIR || 'dist-p17/p17-local-browser-proof';
const VIEWPORT = { width: 1440, height: 900 };
const ALLOWED_REQUESTS = ['GET /index.html', 'GET /styles.css'];

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function sha256(buffer) {
  return 'sha256:' + createHash('sha256').update(buffer).digest('hex');
}

function blankObservation(commitSha, runId, runAttempt) {
  return {
    runtimeFailureCode: null,
    evidence: { commitSha, runId, runAttempt },
    browser: { family: null, version: null },
    viewport: { width: null, height: null },
    requestPolicy: {
      mode: 'EXACT_LOOPBACK_PATH_ALLOWLIST',
      allowedRequests: [...ALLOWED_REQUESTS],
      observedRequests: [],
      blockedRequestCount: 0,
    },
    dom: {
      bodyChildCount: null,
      mainCount: null,
      headingCount: null,
      paragraphCount: null,
      stylesheetCount: null,
      activeSurfaceCount: null,
      inlineEventHandlerCount: null,
    },
    computedStyle: {
      rootDisplay: null,
      rootFlexDirection: null,
      rootGap: null,
      rootPaddingTop: null,
      rootPaddingRight: null,
      rootPaddingBottom: null,
      rootPaddingLeft: null,
      rootBackgroundColor: null,
    },
    consoleErrorCount: 0,
    pageErrorCount: 0,
    screenshotSha256: null,
  };
}

async function closeServer(server) {
  if (!server.listening) return;
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function listenLoopback(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Controlled loopback server did not expose a numeric port.'));
        return;
      }
      resolve(address.port);
    });
  });
}

function responseHeaders(contentType) {
  return {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'self'; img-src 'self'; script-src 'none'; connect-src 'none'; font-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'",
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  };
}

const chromePath = required('P17_CHROME_PATH');
const commitSha = required('P17_PROOF_GIT_SHA');
const runId = required('P17_PROOF_RUN_ID');
const runAttempt = required('P17_PROOF_RUN_ATTEMPT');

await mkdir(OUT_DIR, { recursive: true });
const tempDir = await mkdtemp(join(tmpdir(), 'wpb-p17-browser-proof-'));
const bundlePath = join(tempDir, 'production-proof-bundle.mjs');

await build({
  stdin: {
    contents: `
      import { buildP17NeutralWebExportPackage } from './src/targets/web/neutral-web-export.ts';
      import { validateP17NeutralWebExportPackage } from './src/targets/web/neutral-web-package-validation.ts';
      import {
        buildP17LocalBrowserProofReceipt,
        serializeP17LocalBrowserProofReceipt,
      } from './src/targets/web/local-browser-proof.ts';

      export function prepareP17LocalBrowserFixture(value) {
        const packageValue = buildP17NeutralWebExportPackage(value);
        const packageValidation = validateP17NeutralWebExportPackage({
          source: value,
          package: packageValue,
        });
        return { packageValue, packageValidation };
      }

      export {
        buildP17LocalBrowserProofReceipt,
        serializeP17LocalBrowserProofReceipt,
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: 'p17-local-browser-proof-production-entry.ts',
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: bundlePath,
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'silent',
});

const proofApi = await import(pathToFileURL(bundlePath).href);
const fixture = JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
const prepared = proofApi.prepareP17LocalBrowserFixture(fixture);
const packageValidation = prepared.packageValidation;
const observation = blankObservation(commitSha, runId, runAttempt);

let browser;
let server;
let runtimeFailureCode = null;

try {
  if (
    packageValidation.valid !== true
    || packageValidation.status !== 'PACKAGE_VALIDATED'
    || packageValidation.browserValidationStatus !== 'NOT_RUN'
    || packageValidation.acceptanceAuthority !== false
    || packageValidation.productionAcceptance !== false
  ) {
    runtimeFailureCode = 'R4_PACKAGE_GATE_FAILED';
    throw new Error('R4 package validation gate did not pass.');
  }

  if (typeof prepared.packageValue.html !== 'string' || typeof prepared.packageValue.css !== 'string') {
    runtimeFailureCode = 'GENERATED_PACKAGE_MISSING';
    throw new Error('Validated package did not contain HTML/CSS.');
  }

  const html = prepared.packageValue.html;
  const css = prepared.packageValue.css;

  server = createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/index.html') {
      response.writeHead(200, responseHeaders('text/html; charset=utf-8'));
      response.end(html);
      return;
    }
    if (request.method === 'GET' && request.url === '/styles.css') {
      response.writeHead(200, responseHeaders('text/css; charset=utf-8'));
      response.end(css);
      return;
    }
    response.writeHead(404, responseHeaders('text/plain; charset=utf-8'));
    response.end('Not found');
  });

  const port = await listenLoopback(server);
  const origin = `http://127.0.0.1:${port}`;
  const allowedUrls = new Set([
    `${origin}/index.html`,
    `${origin}/styles.css`,
  ]);
  const observedRequests = new Set();

  browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  page.on('console', (message) => {
    if (message.type() === 'error') observation.consoleErrorCount += 1;
  });
  page.on('pageerror', () => {
    observation.pageErrorCount += 1;
  });

  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const key = `${request.method()} ${url.pathname}`;
    const exactAllowed = request.method() === 'GET'
      && allowedUrls.has(request.url())
      && url.origin === origin
      && url.search === ''
      && url.hash === ''
      && ALLOWED_REQUESTS.includes(key);

    if (!exactAllowed) {
      observation.requestPolicy.blockedRequestCount += 1;
      await route.abort('blockedbyclient');
      return;
    }

    observedRequests.add(key);
    await route.continue();
  });

  const response = await page.goto(`${origin}/index.html`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  if (!response || !response.ok()) {
    runtimeFailureCode = 'DOCUMENT_LOAD_FAILED';
    throw new Error('Controlled document did not load successfully.');
  }

  const browserVersion = browser.version();
  const userAgent = await page.evaluate(() => navigator.userAgent);
  const chromeMatch = userAgent.match(/Chrome\/(\d+(?:\.\d+){1,3})/i);
  observation.browser = {
    family: chromeMatch ? 'CHROME' : null,
    version: chromeMatch?.[1] ?? browserVersion,
  };
  observation.viewport = { ...VIEWPORT };
  observation.requestPolicy.observedRequests = [...observedRequests].sort();

  const domObservation = await page.evaluate((stylesheetUrl) => {
    const root = document.querySelector('.wpb-ir-node-1');
    const style = root ? getComputedStyle(root) : null;
    let inlineEventHandlerCount = 0;
    for (const element of document.querySelectorAll('*')) {
      for (const attribute of element.getAttributeNames()) {
        if (/^on/i.test(attribute)) inlineEventHandlerCount += 1;
      }
    }

    const stylesheetCount = [...document.styleSheets]
      .filter((sheet) => sheet.href === stylesheetUrl)
      .length;

    return {
      dom: {
        bodyChildCount: document.body.children.length,
        mainCount: document.querySelectorAll('main').length,
        headingCount: document.querySelectorAll('h1').length,
        paragraphCount: document.querySelectorAll('p').length,
        stylesheetCount,
        activeSurfaceCount: document.querySelectorAll('script,iframe,form,object,embed').length,
        inlineEventHandlerCount,
      },
      computedStyle: {
        rootDisplay: style?.display ?? null,
        rootFlexDirection: style?.flexDirection ?? null,
        rootGap: style?.gap ?? null,
        rootPaddingTop: style?.paddingTop ?? null,
        rootPaddingRight: style?.paddingRight ?? null,
        rootPaddingBottom: style?.paddingBottom ?? null,
        rootPaddingLeft: style?.paddingLeft ?? null,
        rootBackgroundColor: style?.backgroundColor ?? null,
      },
    };
  }, `${origin}/styles.css`);

  observation.dom = domObservation.dom;
  observation.computedStyle = domObservation.computedStyle;

  const screenshot = await page.screenshot({
    fullPage: true,
    animations: 'disabled',
  });
  observation.screenshotSha256 = sha256(screenshot);
} catch {
  observation.runtimeFailureCode = runtimeFailureCode ?? 'CONTROLLED_BROWSER_EXECUTION_FAILED';
} finally {
  if (browser) await browser.close();
  if (server) await closeServer(server);
  await rm(tempDir, { recursive: true, force: true });
}

const receipt = proofApi.buildP17LocalBrowserProofReceipt({
  packageValidation,
  observation,
});
await writeFile(
  join(OUT_DIR, 'receipt.json'),
  proofApi.serializeP17LocalBrowserProofReceipt(receipt),
  'utf8',
);

process.stdout.write(JSON.stringify({
  status: receipt.status,
  valid: receipt.valid,
  browserValidationStatus: receipt.browserValidationStatus,
  visualFidelityStatus: receipt.visualFidelityStatus,
  reconstructionStatus: receipt.reconstructionStatus,
  productionAcceptance: receipt.productionAcceptance,
  sourceIrSha256: receipt.sourceIrSha256,
  packageSha256: receipt.packageSha256,
  screenshotSha256: receipt.screenshotSha256,
  evidence: receipt.evidence,
}, null, 2) + '\n');

if (!receipt.valid) {
  process.stderr.write('P17_LOCAL_BROWSER_PROOF_FAILED: controlled local-only browser proof did not pass.\n');
  process.exitCode = 2;
}
