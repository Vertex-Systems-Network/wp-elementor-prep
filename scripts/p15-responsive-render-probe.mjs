import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

/**
 * Recovery M4.6 render probe: open the merged three-breakpoint template on the disposable target A at each viewport
 * width of the harness expectation (1440, 1024, 390) and assert the computed styles and positions it lists
 * (hero flex direction, title font size, hide-on-device visibility, reordered children).
 * The proof token travels only in a request header to the exact loopback origin.
 */
const baseUrl = process.env.P15_BASE_URL;
const token = process.env.P15_PROOF_TOKEN;
const chromePath = process.env.P15_CHROME_PATH;
const outDir = process.env.P15_RESPONSIVE_OUT_DIR;
if (baseUrl !== 'http://127.0.0.1:8080' || !token || !chromePath || !outDir) {
  throw new Error('Exact local target, proof token, Chrome and output directory are required.');
}
const expectation = JSON.parse(await readFile(join(outDir, 'responsive-expectation.json'), 'utf8'));
// Elementor's import regenerates element ids; the import probe maps the harness ids to the imported ones.
const idMap = JSON.parse(await readFile(join(outDir, 'responsive-id-map.json'), 'utf8'));
const mapped = (id) => (id === undefined ? undefined : idMap[id] ?? `unmapped-${id}`);
const checks = (Array.isArray(expectation.checks) ? expectation.checks : [])
  .map((check) => ({ ...check, dataId: mapped(check.dataId), first: mapped(check.first), second: mapped(check.second) }));
const url = baseUrl + '/?p15_responsive_render=1';
const report = {
  schema: 'p15-responsive-render-observation-v1',
  target: 'local-wordpress-6.8-elementor-4.2.4',
  sourceValuesAuthoredByHarness: true,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
  observed: [],
  pass: false,
};
let browser;
try {
  browser = await chromium.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await (await browser.newContext()).newPage();
  for (const width of [...new Set(checks.map((check) => check.width))]) {
    await page.setViewportSize({ width, height: 900 });
    await page.route(url, async (route) => {
      await route.continue({ headers: { ...route.request().headers(), 'x-p15-proof-token': token } });
    }, { times: 1 });
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
    if (!response?.ok()) throw new Error('Responsive render HTTP status: ' + (response?.status() ?? 'none'));
    const results = await page.evaluate((list) => {
      const root = document.getElementById('p15-responsive-root');
      const byId = (id) => root?.querySelector(`[data-id="${id}"]`) ?? null;
      const byText = (value) => {
        const walker = document.createTreeWalker(root ?? document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) if (node.textContent.trim() === value) return node.parentElement;
        return null;
      };
      return list.map((check) => {
        if (check.kind === 'before') {
          const a = byId(check.first)?.getBoundingClientRect();
          const b = byId(check.second)?.getBoundingClientRect();
          const actual = a && b ? (check.axis === 'x' ? a.left < b.left : a.top < b.top) : null;
          return { ...check, actual, pass: actual === true };
        }
        const element = check.dataId ? byId(check.dataId) : byText(check.text);
        const actual = element ? getComputedStyle(element)[check.property] : null;
        const pass = actual !== null && (check.negate ? actual !== check.expected : actual === check.expected);
        return { ...check, actual, pass };
      });
    }, checks.filter((check) => check.width === width));
    report.observed.push(...results);
  }
  report.pass = checks.length > 0 && report.observed.length === checks.length && report.observed.every((entry) => entry.pass);
} finally {
  await writeFile(join(outDir, 'responsive-render-observation.json'), JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
}
if (!report.pass) {
  process.exitCode = 1;
  console.error('Responsive render observation failed:\n' + JSON.stringify(report, null, 2));
}
