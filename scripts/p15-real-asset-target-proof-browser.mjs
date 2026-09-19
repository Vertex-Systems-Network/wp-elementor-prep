import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error('Missing required environment variable: ' + name);
  return value;
}

function sha256(value) {
  return 'sha256:' + createHash('sha256').update(value, 'utf8').digest('hex');
}

async function writeJson(path, value) {
  await writeFile(path, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

async function bodyJson(page) {
  return JSON.parse(await page.locator('body').innerText());
}

function findUrlOnlyImage(elements) {
  for (const element of elements ?? []) {
    if (element?.elType === 'widget' && element.widgetType === 'image') {
      const image = element.settings?.image;
      if (image && Number(image.id ?? 0) === 0 && typeof image.url === 'string' && image.url.length > 0) {
        return image.url;
      }
    }
    const nested = findUrlOnlyImage(element?.elements);
    if (nested) return nested;
  }
  return '';
}

const baseUrl = required('P15_BASE_URL').replace(/\/$/, '');
const token = required('P15_PROOF_TOKEN');
const vectorDir = required('P15_ASSET_VECTOR_DIR');
const evidenceReference = required('P15_EVIDENCE_REFERENCE');
const chromePath = required('P15_CHROME_PATH');
const outDir = process.env.P15_PROOF_OUT_DIR || 'dist-p15/p15-real-target-proof';
await mkdir(outDir, { recursive: true });

const manifest = JSON.parse(await readFile(join(vectorDir, 'manifest.json'), 'utf8'));
const profile = JSON.parse(await readFile(join(vectorDir, 'target-profile.json'), 'utf8'));
const template = JSON.parse(await readFile(join(vectorDir, 'template.json'), 'utf8'));
const expectedTemplateSha = manifest.fileSha256.template;
const expectedRawUrl = findUrlOnlyImage(template.content);
if (!expectedRawUrl) throw new Error('Asset proof vector does not contain one URL_ONLY Image reference.');
const expectedUrlFingerprint = sha256(expectedRawUrl);
if (expectedUrlFingerprint !== manifest.assetReference.urlFingerprint) {
  throw new Error('Asset proof vector URL fingerprint does not match its exact template Image URL.');
}

const raw = {
  schema: 'p15-real-asset-target-proof-runtime-bundle-v1',
  evidenceReference,
  importResult: 'NOT_RUN',
  renderResult: 'NOT_RUN',
  renderedReferenceResult: 'NOT_RUN',
  browserLoadResult: 'NOT_RUN',
  expectedUrlFingerprint,
  renderedUrlFingerprint: null,
  imageComplete: false,
  naturalWidth: 0,
  naturalHeight: 0,
  templateSha256Matches: false,
  error: '',
};

let browser;
try {
  browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();

  await page.goto(baseUrl + '/?p15_proof_observe=' + encodeURIComponent(token), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  const server = await bodyJson(page);

  raw.importResult = server.assetImportResult === 'PASS' ? 'PASS' : 'FAIL';
  raw.templateSha256Matches = server.assetTemplateSha256 === expectedTemplateSha;
  if (server.assetTemplateType !== 'page' || !raw.templateSha256Matches) {
    raw.importResult = 'FAIL';
  }

  if (raw.importResult === 'PASS') {
    await page.goto(server.assetRenderUrl, {
      waitUntil: 'networkidle',
      timeout: 90000,
    });

    const observation = await page.evaluate(() => {
      const root = document.querySelector('#p15-asset-proof-root');
      const image = root ? root.querySelector('img') : null;
      if (!image) {
        return {
          present: false,
          renderedSrc: '',
          complete: false,
          naturalWidth: 0,
          naturalHeight: 0,
        };
      }
      return {
        present: true,
        renderedSrc: image.currentSrc || image.src || image.getAttribute('src') || '',
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      };
    });

    raw.renderResult = observation.present ? 'PASS' : 'FAIL';
    if (observation.present) {
      raw.renderedUrlFingerprint = observation.renderedSrc ? sha256(observation.renderedSrc) : null;
      raw.renderedReferenceResult =
        raw.renderedUrlFingerprint === expectedUrlFingerprint ? 'PASS' : 'FAIL';
      raw.imageComplete = Boolean(observation.complete);
      raw.naturalWidth = Number(observation.naturalWidth) || 0;
      raw.naturalHeight = Number(observation.naturalHeight) || 0;
      raw.browserLoadResult =
        raw.imageComplete && raw.naturalWidth > 0 && raw.naturalHeight > 0 ? 'PASS' : 'FAIL';
    }

    await page.screenshot({
      path: join(outDir, 'asset-render.png'),
      fullPage: true,
    });
  }

  const evidence = {
    schemaVersion: 1,
    evidenceVersion: 'elementor-asset-target-proof-evidence-v1',
    candidateIdentity: manifest.candidateIdentity,
    targetProfileIdentity: {
      profileVersion: profile.profileVersion,
      fingerprint: manifest.targetProfileFingerprint,
    },
    referenceReviewIdentityDigest: manifest.referenceReviewIdentityDigest,
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: server.environment.wordpressVersion,
      elementorVersion: server.environment.elementorVersion,
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: new Date().toISOString(),
    evidenceReference,
    assetReference: {
      path: manifest.assetReference.path,
      widgetId: manifest.assetReference.widgetId,
      referenceMode: 'URL_ONLY',
      expectedUrlFingerprint,
      renderedUrlFingerprint: raw.renderedUrlFingerprint,
    },
    steps: {
      importResult: raw.importResult,
      renderResult: raw.importResult === 'PASS' ? raw.renderResult : 'NOT_RUN',
      renderedReferenceResult:
        raw.importResult === 'PASS' && raw.renderResult === 'PASS'
          ? raw.renderedReferenceResult
          : 'NOT_RUN',
      browserLoadResult:
        raw.importResult === 'PASS' && raw.renderResult === 'PASS'
          ? raw.browserLoadResult
          : 'NOT_RUN',
    },
    acceptanceAuthority: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };

  await writeJson(join(outDir, 'asset-proof-evidence.json'), evidence);
  await writeJson(join(outDir, 'raw-asset-runtime-observation.json'), raw);

  const fullPass = (
    evidence.steps.importResult === 'PASS'
    && evidence.steps.renderResult === 'PASS'
    && evidence.steps.renderedReferenceResult === 'PASS'
    && evidence.steps.browserLoadResult === 'PASS'
  );

  process.stdout.write(JSON.stringify({
    importResult: evidence.steps.importResult,
    renderResult: evidence.steps.renderResult,
    renderedReferenceResult: evidence.steps.renderedReferenceResult,
    browserLoadResult: evidence.steps.browserLoadResult,
    expectedUrlFingerprint,
    renderedUrlFingerprint: raw.renderedUrlFingerprint,
    imageComplete: raw.imageComplete,
    naturalWidth: raw.naturalWidth,
    naturalHeight: raw.naturalHeight,
    assetReferenceClosureClaim: false,
    fullPass,
  }, null, 2) + '\n');

  if (!fullPass) process.exitCode = 2;
} catch (error) {
  raw.error = error instanceof Error ? error.message : String(error);
  await writeJson(join(outDir, 'raw-asset-runtime-observation.json'), raw);
  process.stderr.write('P15_REAL_ASSET_TARGET_PROOF_BROWSER_FAILED: ' + raw.error + '\n');
  process.exitCode = 2;
} finally {
  if (browser) await browser.close();
}
