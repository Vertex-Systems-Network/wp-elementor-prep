import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

/**
 * Recovery M8.5 editor and render probe against the disposable WordPress 6.9 target (loopback only):
 *  - logs in, opens every imported page in the block editor and reads the editor's own block tree: every block must be
 *    a registered core block with `isValid`, and no block-validation warning may be shown;
 *  - opens each page on the front end (HTTP 200) and, for the responsive golden, checks that the columns sit side by
 *    side at 1440 px and stack at 390 px.
 */
const baseUrl = process.env.P16_BASE_URL;
const user = process.env.P16_ADMIN_USER;
const password = process.env.P16_ADMIN_PASSWORD;
const chromePath = process.env.P16_CHROME_PATH;
const outDir = process.env.P16_OUT_DIR;
if (baseUrl !== 'http://127.0.0.1:8090' || !user || !password || !chromePath || !outDir) {
  throw new Error('Exact local target, admin credentials, Chrome and output directory are required.');
}
const imported = JSON.parse(await readFile(join(outDir, 'gutenberg-import-observation.json'), 'utf8'));
const report = { schema: 'p16-gutenberg-editor-observation-v1', targetCompatibilityClaim: false, pages: [], pass: false };
let browser;
try {
  browser = await chromium.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(`${baseUrl}/wp-login.php`, { waitUntil: 'load' });
  await page.fill('#user_login', user);
  await page.fill('#user_pass', password);
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('#wp-submit')]);
  for (const entry of imported.pages) {
    const result = { file: entry.file, editor: null, render: null, pass: false };
    await page.goto(`${baseUrl}/wp-admin/post.php?post=${entry.postId}&action=edit`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => window.wp?.data?.select('core/block-editor')?.getBlocks?.().length > 0, null, { timeout: 90000 });
    result.editor = await page.evaluate(() => {
      const flat = [];
      const walk = (blocks) => blocks.forEach((block) => { flat.push({ name: block.name, isValid: block.isValid }); walk(block.innerBlocks); });
      walk(window.wp.data.select('core/block-editor').getBlocks());
      const canvas = document.querySelector('iframe[name="editor-canvas"]')?.contentDocument ?? document;
      return { blocks: flat.length, invalid: flat.filter((b) => !b.isValid || b.name === 'core/missing' || b.name === 'core/freeform').map((b) => b.name),
        warnings: canvas.querySelectorAll('.block-editor-warning').length };
    });
    const render = { widths: {} };
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(entry.permalink, { waitUntil: 'networkidle', timeout: 90000 });
      render.http = response?.status() ?? null;
      render.widths[width] = await page.evaluate(() => {
        // Only the imported post content counts; the active theme's header/footer patterns use core blocks too.
        const content = document.querySelector('.wp-block-post-content, .entry-content');
        if (!content) return { groups: 0, columns: 0, sideBySide: null, stacked: null, contentFound: false };
        const columns = [...content.querySelectorAll('.wp-block-columns > .wp-block-column')].slice(0, 2).map((el) => el.getBoundingClientRect());
        return {
          contentFound: true,
          groups: content.querySelectorAll('.wp-block-group').length,
          columns: columns.length,
          sideBySide: columns.length === 2 ? Math.abs(columns[0].top - columns[1].top) < 1 && columns[1].left > columns[0].left : null,
          stacked: columns.length === 2 ? columns[1].top >= columns[0].bottom - 1 : null,
        };
      });
    }
    result.render = render;
    const hasColumns = render.widths[1440].columns === 2;
    result.pass = result.editor.blocks > 0 && result.editor.invalid.length === 0 && result.editor.warnings === 0 && render.http === 200
      && render.widths[1440].contentFound === true && render.widths[1440].groups > 0
      && (!hasColumns || (render.widths[1440].sideBySide === true && render.widths[390].stacked === true));
    report.pages.push(result);
  }
  report.pass = report.pages.length === imported.pages.length && report.pages.every((p) => p.pass);
} finally {
  await writeFile(join(outDir, 'gutenberg-editor-observation.json'), JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
}
if (!report.pass) {
  process.exitCode = 1;
  console.error(JSON.stringify(report, null, 2));
}
