import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

/**
 * Recovery M7.2 round-trip probe. For each breakpoint of `round-trip-sections.json` it renders, at that viewport width:
 *  - the Elementor-independent IR→CSS reference page written by the responsive harness (IR_CSS_REFERENCE), and
 *  - the imported responsive template on the disposable target A,
 * then saves both crops (the reference root's size, from each root's top-left) and every section's box relative to its
 * root. `p15:responsive-harness round-trip-report` turns these files into the per-section report. The proof token
 * travels only in a request header to the exact loopback origin.
 */
const baseUrl = process.env.P15_BASE_URL;
const token = process.env.P15_PROOF_TOKEN;
const chromePath = process.env.P15_CHROME_PATH;
const outDir = process.env.P15_RESPONSIVE_OUT_DIR;
if (baseUrl !== 'http://127.0.0.1:8080' || !token || !chromePath || !outDir) {
  throw new Error('Exact local target, proof token, Chrome and output directory are required.');
}
const sections = JSON.parse(await readFile(join(outDir, 'round-trip-sections.json'), 'utf8'));
const idMap = JSON.parse(await readFile(join(outDir, 'responsive-id-map.json'), 'utf8'));
const url = baseUrl + '/?p15_responsive_render=1';
const observation = { schema: 'p15-round-trip-observation-v1', referenceSource: sections.referenceSource, breakpoints: {}, complete: false };

async function capture(page, rootSelector, selectorFor, ids, size) {
  const boxes = await page.evaluate(({ rootSelector, list }) => {
    const root = document.querySelector(rootSelector);
    if (!root) return null;
    const origin = root.getBoundingClientRect();
    const result = { root: { x: origin.left + scrollX, y: origin.top + scrollY, width: origin.width, height: origin.height }, sections: {} };
    for (const { id, selector } of list) {
      const element = selector ? document.querySelector(selector) : null;
      const box = element?.getBoundingClientRect();
      result.sections[id] = element && box && box.width > 0 && box.height > 0 && getComputedStyle(element).display !== 'none'
        ? { x: box.left - origin.left, y: box.top - origin.top, width: box.width, height: box.height }
        : null;
    }
    return result;
  }, { rootSelector, list: ids.map((id) => ({ id, selector: selectorFor(id) })) });
  if (!boxes) throw new Error(`Root ${rootSelector} not found.`);
  const clip = { x: boxes.root.x, y: boxes.root.y, width: size?.width ?? Math.round(boxes.root.width), height: size?.height ?? Math.round(boxes.root.height) };
  const png = await page.screenshot({ clip, fullPage: true });
  return { boxes, png, size: { width: clip.width, height: clip.height } };
}

let browser;
try {
  browser = await chromium.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await (await browser.newContext({ deviceScaleFactor: 1 })).newPage();
  for (const [device, entry] of Object.entries(sections.breakpoints)) {
    await page.setViewportSize({ width: entry.widthPx, height: 900 });
    const ids = entry.sections.map((section) => section.id);
    await page.setContent(await readFile(join(outDir, `round-trip-reference-${device}.html`), 'utf8'), { waitUntil: 'load' });
    const reference = await capture(page, '#p15-reference-root', (id) => `[data-source="${id}"]`, ids, null);
    await page.route(url, async (route) => {
      await route.continue({ headers: { ...route.request().headers(), 'x-p15-proof-token': token } });
    }, { times: 1 });
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
    if (!response?.ok()) throw new Error('Round-trip render HTTP status: ' + (response?.status() ?? 'none'));
    const targetIdFor = new Map(entry.sections.map((section) => [section.id, section.targetDataId ? idMap[section.targetDataId] ?? null : null]));
    const render = await capture(page, '#p15-responsive-root', (id) => (targetIdFor.get(id) ? `[data-id="${targetIdFor.get(id)}"]` : null), ids, reference.size);
    await writeFile(join(outDir, `round-trip-${device}-reference.png`), reference.png);
    await writeFile(join(outDir, `round-trip-${device}-render.png`), render.png);
    observation.breakpoints[device] = { widthPx: entry.widthPx, size: reference.size, reference: reference.boxes.sections, render: render.boxes.sections };
  }
  observation.complete = Object.keys(observation.breakpoints).length === Object.keys(sections.breakpoints).length;
} finally {
  await writeFile(join(outDir, 'round-trip-observation.json'), JSON.stringify(observation, null, 2) + '\n');
  await browser?.close();
}
if (!observation.complete) process.exitCode = 1;
