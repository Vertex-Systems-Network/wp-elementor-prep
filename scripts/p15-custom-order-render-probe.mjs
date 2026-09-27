import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const baseUrl = process.env.P15_BASE_URL;
const token = process.env.P15_PROOF_TOKEN;
const chromePath = process.env.P15_CHROME_PATH;
const outDir = process.env.P15_PROOF_OUT_DIR;
if (baseUrl !== 'http://127.0.0.1:8080' || !token || !chromePath || !outDir) {
  throw new Error('Exact local target, proof token, Chrome and output directory are required.');
}
await mkdir(outDir, { recursive: true });
const url = baseUrl + '/?p15_custom_order_render=1';
const cases = [
  { name: 'desktop', width: 1280, expected: [0, 0], expectTwoFirst: false },
  { name: 'tablet', width: 768, expected: [2, 1], expectTwoFirst: true },
  { name: 'mobile', width: 375, expected: [-2, 0], expectTwoFirst: false },
];
const report = {
  schema: 'p15-elementor-424-custom-order-render-observation-v1',
  target: 'local-wordpress-6.8-elementor-4.2.4',
  sourceValuesAuthoredByProbe: true,
  editorGeneratedSerializationClaim: false,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
  downloadEnabled: false,
  viewports: [],
};
let browser;
try {
  browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const testCase of cases) {
    await page.setViewportSize({ width: testCase.width, height: 900 });
    await page.route(url, async (route) => {
      await route.continue({
        headers: { ...route.request().headers(), 'x-p15-proof-token': token },
      });
    }, { times: 1 });
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
    if (!response?.ok()) {
      throw new Error(testCase.name + ' render HTTP status: ' + (response?.status() ?? 'none'));
    }
    const observation = await page.evaluate(() => {
      const result = [];
      for (const title of ['Custom Order One', 'Custom Order Two']) {
        const heading = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
          .find((node) => (node.textContent || '').trim() === title);
        const container = heading?.closest('.e-con');
        result.push({
          title,
          found: Boolean(container),
          order: container ? getComputedStyle(container).order : null,
          orderVariable: container ? getComputedStyle(container).getPropertyValue('--order').trim() : null,
          top: container ? container.getBoundingClientRect().top : null,
        });
      }
      return result;
    });
    const orders = observation.map((item) => item.order === null ? null : Number(item.order));
    const layoutTwoFirst = observation[1].top !== null
      && observation[0].top !== null
      && observation[1].top < observation[0].top;
    const pass = orders.every((value, index) => value === testCase.expected[index])
      && layoutTwoFirst === testCase.expectTwoFirst;
    report.viewports.push({
      name: testCase.name,
      width: testCase.width,
      expectedOrders: testCase.expected,
      observed: observation,
      layoutTwoFirst,
      pass,
    });
    await page.screenshot({
      path: join(outDir, 'custom-order-' + testCase.name + '.png'),
      fullPage: true,
    });
  }
  report.fullPass = report.viewports.every((item) => item.pass);
} catch (error) {
  report.fullPass = false;
  report.error = error instanceof Error ? error.message : String(error);
} finally {
  await writeFile(
    join(outDir, 'custom-order-render-observation.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
  if (browser) await browser.close();
}
if (!report.fullPass) {
  throw new Error('Controlled Elementor custom-order render observation failed.');
}
