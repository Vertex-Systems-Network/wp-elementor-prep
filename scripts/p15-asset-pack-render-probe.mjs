import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

/**
 * Recovery M3.6b render probe: open the relinked asset-pack template on the disposable target A and assert that every
 * uploaded pack asset is rendered (Image widget <img> or Container background) and returns HTTP 200 as an image.
 * The proof token travels only in a request header to the exact loopback origin.
 */
const baseUrl = process.env.P15_BASE_URL;
const token = process.env.P15_PROOF_TOKEN;
const chromePath = process.env.P15_CHROME_PATH;
const outDir = process.env.P15_ASSET_PACK_OUT_DIR;
const uploadsPath = process.env.P15_ASSET_PACK_UPLOADS;
if (baseUrl !== 'http://127.0.0.1:8080' || !token || !chromePath || !outDir || !uploadsPath) {
  throw new Error('Exact local target, proof token, Chrome, output directory and uploads are required.');
}
const uploads = JSON.parse(await readFile(uploadsPath, 'utf8'));
const expectedUrls = Object.values(uploads).map((upload) => upload.url).sort();
const url = baseUrl + '/?p15_asset_pack_render=1';
const report = {
  schema: 'p15-asset-pack-render-observation-v1',
  target: 'local-wordpress-6.8-elementor-4.2.4',
  sourceValuesAuthoredByHarness: true,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
  expectedUrls,
  observed: [],
  pass: false,
};
let browser;
try {
  browser = await chromium.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route(url, async (route) => {
    await route.continue({ headers: { ...route.request().headers(), 'x-p15-proof-token': token } });
  }, { times: 1 });
  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  if (!response?.ok()) throw new Error('Asset-pack render HTTP status: ' + (response?.status() ?? 'none'));
  const rendered = await page.evaluate(() => {
    const root = document.getElementById('p15-asset-pack-root');
    const found = [];
    for (const image of root ? root.querySelectorAll('img') : []) {
      found.push({ kind: 'img', url: image.currentSrc || image.src, naturalWidth: image.naturalWidth, complete: image.complete });
    }
    for (const element of root ? root.querySelectorAll('*') : []) {
      const match = /url\("?([^")]+)"?\)/.exec(getComputedStyle(element).backgroundImage);
      if (match) found.push({ kind: 'background', url: new URL(match[1], document.baseURI).href });
    }
    return found;
  });
  for (const entry of rendered) {
    const fetched = await page.request.get(entry.url);
    report.observed.push({ ...entry, status: fetched.status(), contentType: fetched.headers()['content-type'] ?? '' });
  }
  const observedUrls = new Set(report.observed.map((entry) => entry.url));
  report.pass = expectedUrls.length > 0
    && expectedUrls.every((expected) => observedUrls.has(expected))
    && report.observed.every((entry) => entry.status === 200 && entry.contentType.startsWith('image/'))
    && report.observed.filter((entry) => entry.kind === 'img').every((entry) => entry.complete && entry.naturalWidth > 0);
} finally {
  await writeFile(join(outDir, 'asset-pack-render-observation.json'), JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
}
if (!report.pass) {
  process.exitCode = 1;
  console.error('Asset-pack render observation failed; see asset-pack-render-observation.json.');
}
