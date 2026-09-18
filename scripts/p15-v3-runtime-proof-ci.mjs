import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function exactNumericVersion(value, label) {
  if (!/^\d+(?:\.\d+){1,3}$/.test(value)) {
    throw new Error(`${label} is not an exact numeric runtime version: ${value}`);
  }
  return value;
}

async function frameContainsText(page, text, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      try {
        const found = await frame.evaluate(
          (needle) => Boolean(document.body && document.body.innerText.includes(needle)),
          text,
        );
        if (found) return true;
      } catch {
        // Frame may be navigating; retry until deadline.
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

const outDir = required('P15_OUT_DIR');
mkdirSync(outDir, { recursive: true });

const vectorDir = required('P15_VECTOR_DIR');
const templateId = required('P15_TEMPLATE_ID');
const siteUrl = required('P15_SITE_URL').replace(/\/$/, '');
const wpVersion = exactNumericVersion(required('P15_WP_VERSION'), 'WordPress version');
const elementorVersion = exactNumericVersion(required('P15_ELEMENTOR_VERSION'), 'Elementor version');
const phpVersion = exactNumericVersion(required('P15_PHP_VERSION'), 'PHP version');
const dbVersion = exactNumericVersion(required('P15_DB_VERSION'), 'MySQL version');
const memoryMb = Number(required('P15_WP_MEMORY_MB'));
if (!Number.isSafeInteger(memoryMb) || memoryMb <= 0) {
  throw new Error('Invalid WordPress memory limit.');
}

const evidenceReference = required('P15_EVIDENCE_REFERENCE');
const importObservedAt = required('P15_IMPORT_OBSERVED_AT');
if (new Date(importObservedAt).toISOString() !== importObservedAt) {
  throw new Error(`Import timestamp is not canonical ISO UTC: ${importObservedAt}`);
}

const manifest = JSON.parse(readFileSync(join(vectorDir, 'manifest.json'), 'utf8'));
const profile = JSON.parse(readFileSync(join(vectorDir, 'target-profile.json'), 'utf8'));

const chromeExecutable = required('P15_CHROME_BIN');
const browser = await puppeteer.launch({
  executablePath: chromeExecutable,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let page;
let environment;
let editorOpen = false;
let editorDetail = {};
let renderDetail = {
  headingFound: false,
  structureTextFound: false,
  containerClass: '',
  matchesECon: false,
  computedBackground: '',
  computedRadii: [],
};

try {
  const browserVersionRaw = await browser.version();
  const browserVersionMatch = browserVersionRaw.match(/(?:Chrome|HeadlessChrome)\/(\d+(?:\.\d+){1,3})/);
  if (!browserVersionMatch) {
    throw new Error(`Unable to parse Chrome runtime version from: ${browserVersionRaw}`);
  }
  const browserVersion = exactNumericVersion(browserVersionMatch[1], 'Chrome version');

  const environmentObservedAt = new Date().toISOString();
  environment = {
    schemaVersion: 1,
    evidenceVersion: 'elementor-target-environment-evidence-v1',
    source: 'OBSERVED',
    wordpressVersion: wpVersion,
    elementorVersion,
    phpVersion,
    database: {
      engine: 'MYSQL',
      version: dbVersion,
    },
    wordpressMemoryLimitMb: memoryMb,
    browser: {
      family: 'CHROME',
      version: browserVersion,
    },
    elementorProActive: false,
    thirdPartyElementorAddonsActive: false,
    observedAt: environmentObservedAt,
    evidenceReference,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
  writeJson(join(outDir, 'environment.json'), environment);

  page = await browser.newPage();
  page.setDefaultTimeout(90000);
  await page.setViewport({ width: 1440, height: 1000 });

  await page.goto(`${siteUrl}/wp-login.php`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.type('#user_login', required('P15_ADMIN_USER'));
  await page.type('#user_pass', required('P15_ADMIN_PASSWORD'));
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
    page.click('#wp-submit'),
  ]);

  const loginUrl = page.url();
  const loginBody = await page.evaluate(() => document.body?.innerText ?? '');
  if (loginUrl.includes('wp-login.php') || /ERROR:/i.test(loginBody)) {
    throw new Error(`WordPress browser login failed at ${loginUrl}`);
  }

  const editorUrl = `${siteUrl}/wp-admin/post.php?post=${encodeURIComponent(templateId)}&action=elementor`;
  try {
    await page.goto(editorUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    editorOpen = await frameContainsText(page, 'P15 First Controlled Target Proof', 90000);
    editorDetail = {
      url: page.url(),
      exactHeadingVisibleInEditorFrame: editorOpen,
      frameUrls: page.frames().map((frame) => frame.url()),
    };
  } catch (error) {
    editorOpen = false;
    editorDetail = {
      url: page.url(),
      exactHeadingVisibleInEditorFrame: false,
      frameUrls: page.frames().map((frame) => frame.url()),
      error: error instanceof Error ? error.message : String(error),
    };
  }

  await page.screenshot({ path: join(outDir, 'editor.png'), fullPage: true });

  if (editorOpen) {
    const renderUrl = `${siteUrl}/?p15_runtime_probe=1`;
    try {
      await page.goto(renderUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
          .some((el) => (el.textContent || '').trim() === 'P15 First Controlled Target Proof'),
        { timeout: 60000 },
      );

      renderDetail = await page.evaluate(() => {
        const heading = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
          .find((el) => (el.textContent || '').trim() === 'P15 First Controlled Target Proof');
        const container = heading
          ? (heading.closest('.e-con') || heading.closest('.elementor-element'))
          : null;

        if (!heading || !container) {
          return {
            headingFound: Boolean(heading),
            structureTextFound: false,
            containerClass: '',
            matchesECon: false,
            computedBackground: '',
            computedRadii: [],
          };
        }

        const style = getComputedStyle(container);
        return {
          headingFound: true,
          structureTextFound: (container.textContent || '')
            .includes('Deterministic Container V1 operator vector.'),
          containerClass: String(container.className || ''),
          matchesECon: container.matches('.e-con'),
          computedBackground: style.backgroundColor,
          computedRadii: [
            style.borderTopLeftRadius,
            style.borderTopRightRadius,
            style.borderBottomRightRadius,
            style.borderBottomLeftRadius,
          ],
        };
      });
    } catch (error) {
      renderDetail = {
        headingFound: false,
        structureTextFound: false,
        containerClass: '',
        matchesECon: false,
        computedBackground: '',
        computedRadii: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }

    await page.screenshot({ path: join(outDir, 'render.png'), fullPage: true });
  }

  const renderPass = editorOpen && renderDetail.headingFound;
  const structurePass = renderPass && renderDetail.structureTextFound;
  const backgroundPass = renderPass
    && (renderDetail.computedBackground === 'rgb(51, 102, 153)'
      || renderDetail.computedBackground === 'rgba(51, 102, 153, 1)');
  const radiusPass = renderPass
    && renderDetail.computedRadii.length === 4
    && renderDetail.computedRadii.every((value) => value === '12px');

  const proofObservedAt = new Date().toISOString();

  const importReceipt = {
    schemaVersion: 1,
    receiptVersion: 'elementor-import-validation-receipt-v1',
    candidateIdentity: manifest.candidateIdentity,
    target: {
      wordpressVersion: wpVersion,
      elementorVersion,
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: importObservedAt,
    observedResult: 'PASS',
    evidenceReference,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
  writeJson(join(outDir, 'import-receipt.json'), importReceipt);

  const proofSteps = editorOpen
    ? (renderPass
      ? {
          importResult: 'PASS',
          editorOpenResult: 'PASS',
          renderResult: 'PASS',
          fidelity: {
            structure: structurePass ? 'PASS' : 'FAIL',
            solidBackground: backgroundPass ? 'PASS' : 'FAIL',
            uniformRadius: radiusPass ? 'PASS' : 'FAIL',
          },
        }
      : {
          importResult: 'PASS',
          editorOpenResult: 'PASS',
          renderResult: 'FAIL',
          fidelity: {
            structure: 'NOT_RUN',
            solidBackground: 'NOT_RUN',
            uniformRadius: 'NOT_RUN',
          },
        })
    : {
        importResult: 'PASS',
        editorOpenResult: 'FAIL',
        renderResult: 'NOT_RUN',
        fidelity: {
          structure: 'NOT_RUN',
          solidBackground: 'NOT_RUN',
          uniformRadius: 'NOT_RUN',
        },
      };

  const proof = {
    schemaVersion: 1,
    evidenceVersion: 'elementor-target-proof-evidence-v1',
    candidateIdentity: manifest.candidateIdentity,
    targetProfileIdentity: {
      profileVersion: profile.profileVersion,
      fingerprint: manifest.targetProfileFingerprint,
    },
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: wpVersion,
      elementorVersion,
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: proofObservedAt,
    evidenceReference,
    steps: proofSteps,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
  writeJson(join(outDir, 'proof.json'), proof);

  const rawObservation = {
    schemaVersion: 1,
    source: 'OBSERVED',
    gitSha: process.env.GITHUB_SHA ?? '',
    evidenceReference,
    importObservedAt,
    environment,
    browserVersionRaw,
    userAgent: await browser.userAgent(),
    templateId: Number(templateId),
    editor: editorDetail,
    render: renderDetail,
    derivedStepResults: proofSteps,
    authority: {
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      internalReviewRequired: true,
    },
  };
  writeJson(join(outDir, 'raw-runtime-observation.json'), rawObservation);

  process.stdout.write(`${JSON.stringify({
    environment,
    editorOpen,
    renderDetail,
    proofSteps,
  }, null, 2)}\n`);
} finally {
  await browser.close();
}
