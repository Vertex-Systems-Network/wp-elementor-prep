import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error('Missing required environment variable: ' + name);
  return value;
}

function numericVersion(value) {
  const match = String(value).match(/(\d+(?:\.\d+){1,3})/);
  if (!match) throw new Error('Unable to extract numeric dotted version from: ' + value);
  return match[1];
}

function browserIdentity(userAgent, browserVersion) {
  if (/Edg\/(\d+(?:\.\d+){0,3})/i.test(userAgent)) {
    return { family: 'EDGE', version: numericVersion(RegExp.$1) };
  }
  if (/OPR\/(\d+(?:\.\d+){0,3})/i.test(userAgent)) {
    return { family: 'OTHER', version: numericVersion(RegExp.$1) };
  }
  if (/Firefox\/(\d+(?:\.\d+){0,3})/i.test(userAgent)) {
    return { family: 'FIREFOX', version: numericVersion(RegExp.$1) };
  }
  if (/Version\/(\d+(?:\.\d+){0,3}).*Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    return { family: 'SAFARI', version: numericVersion(RegExp.$1) };
  }
  if (/Chrome\/(\d+(?:\.\d+){0,3})/i.test(userAgent)) {
    return { family: 'CHROME', version: numericVersion(RegExp.$1) };
  }
  return { family: 'OTHER', version: numericVersion(browserVersion) };
}

async function writeJson(path, value) {
  await writeFile(path, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

async function bodyJson(page) {
  const text = await page.locator('body').innerText();
  return JSON.parse(text);
}

async function handleElementorOnboarding(page) {
  const onboardingRoute = page.url().includes('page=elementor-app')
    && page.url().includes('onboarding');
  const skip = page.getByText('Skip', { exact: true });
  const skipCount = await skip.count();

  if (!onboardingRoute && skipCount === 0) {
    return { result: 'NOT_NEEDED', interceptedUrl: page.url(), finalUrl: page.url() };
  }
  if (skipCount === 0) {
    throw new Error('Elementor onboarding intercepted the editor but the Skip control was unavailable.');
  }

  await skip.first().click({ timeout: 15000 });
  await page.waitForTimeout(1500);
  return { result: 'SKIPPED', interceptedUrl: page.url(), finalUrl: page.url() };
}

async function headingPresentInEditor(page, expectedText, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      try {
        const locator = frame.getByText(expectedText, { exact: true });
        if (await locator.count() > 0) {
          return {
            present: true,
            frameUrl: frame.url(),
          };
        }
      } catch {
        // Frame may detach while Elementor reloads the preview.
      }
    }
    await page.waitForTimeout(1000);
  }
  return { present: false, frameUrl: '' };
}

const baseUrl = required('P15_BASE_URL').replace(/\/$/, '');
const token = required('P15_PROOF_TOKEN');
const vectorDir = required('P15_VECTOR_DIR');
const assetVectorDir = required('P15_ASSET_VECTOR_DIR');
const evidenceReference = required('P15_EVIDENCE_REFERENCE');
const chromePath = required('P15_CHROME_PATH');
const outDir = process.env.P15_PROOF_OUT_DIR || 'dist-p15/p15-real-target-proof';
await mkdir(outDir, { recursive: true });

const manifest = JSON.parse(await readFile(join(vectorDir, 'manifest.json'), 'utf8'));
const profile = JSON.parse(await readFile(join(vectorDir, 'target-profile.json'), 'utf8'));
const expectedTemplateSha = manifest.fileSha256.template;
const assetManifest = JSON.parse(await readFile(join(assetVectorDir, 'manifest.json'), 'utf8'));
const assetProfile = JSON.parse(await readFile(join(assetVectorDir, 'target-profile.json'), 'utf8'));
const assetReferenceIdentity = JSON.parse(
  await readFile(join(assetVectorDir, 'reference-review-identity.json'), 'utf8'),
);

const raw = {
  schema: 'p15-real-target-proof-runtime-bundle-v1',
  evidenceReference,
  browser: null,
  server: null,
  editor: {
    result: 'NOT_RUN',
    onboardingResult: 'NOT_RUN',
    onboardingInterceptedUrl: '',
    onboardingFinalUrl: '',
    finalUrl: '',
    headingPresent: false,
    headingFrameUrl: '',
    error: '',
  },
  render: {
    result: 'NOT_RUN',
    structure: 'NOT_RUN',
    solidBackground: 'NOT_RUN',
    uniformRadius: 'NOT_RUN',
    containerClass: '',
    matchesECon: false,
    computedBackground: '',
    computedRadii: [],
    error: '',
  },
};

const assetRaw = {
  schema: 'p15-real-asset-target-proof-runtime-bundle-v1',
  evidenceReference,
  server: null,
  render: {
    result: 'NOT_RUN',
    imagePresent: false,
    renderedImageUrlFingerprint: null,
    imageReferenceResult: 'NOT_RUN',
    browserImageLoadResult: 'NOT_RUN',
    naturalWidth: 0,
    naturalHeight: 0,
    error: '',
  },
};

let browser;
let page;
let environmentEvidence;
let proofEvidence;

try {
  browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const browserVersion = browser.version();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  page = await context.newPage();

  await page.goto(baseUrl + '/?p15_proof_observe=' + encodeURIComponent(token), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  const server = await bodyJson(page);
  raw.server = server;

  const userAgent = await page.evaluate(() => navigator.userAgent);
  const browserInfo = browserIdentity(userAgent, browserVersion);
  raw.browser = {
    browserVersion,
    userAgent,
    ...browserInfo,
  };

  if (server.importResult !== 'PASS') {
    throw new Error('Template Library import did not PASS: ' + server.importResult);
  }
  if (server.templateType !== 'page') {
    throw new Error('Imported template type is not page: ' + server.templateType);
  }
  if (server.templateSha256 !== expectedTemplateSha) {
    throw new Error('Imported template SHA-256 does not match canonical vector.');
  }

  const plugins = server.environment.plugins;
  environmentEvidence = {
    schemaVersion: 1,
    evidenceVersion: 'elementor-target-environment-evidence-v1',
    source: 'OBSERVED',
    wordpressVersion: server.environment.wordpressVersion,
    elementorVersion: server.environment.elementorVersion,
    phpVersion: numericVersion(server.environment.phpVersion),
    database: {
      engine: server.environment.database.engine,
      version: server.environment.database.version,
    },
    wordpressMemoryLimitMb: server.environment.wordpressMemoryLimitMb,
    browser: {
      family: browserInfo.family,
      version: browserInfo.version,
    },
    elementorProActive: Boolean(plugins.elementorProActive),
    thirdPartyElementorAddonsActive: Boolean(plugins.thirdPartyElementorAddonsActive),
    observedAt: server.observedAt,
    evidenceReference,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
  await writeJson(join(outDir, 'environment-evidence.json'), environmentEvidence);

  try {
    await page.goto(server.editorLoginUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    const onboarding = await handleElementorOnboarding(page);
    raw.editor.onboardingResult = onboarding.result;
    raw.editor.onboardingInterceptedUrl = onboarding.interceptedUrl;
    raw.editor.onboardingFinalUrl = onboarding.finalUrl;

    if (typeof server.editorUrl !== 'string' || server.editorUrl.length === 0) {
      throw new Error('Observed runtime did not provide an explicit Elementor editor URL.');
    }
    await page.goto(server.editorUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });

    const editorHeading = await headingPresentInEditor(
      page,
      'P15 First Controlled Target Proof',
      45000,
    );
    raw.editor.finalUrl = page.url();
    raw.editor.headingPresent = editorHeading.present;
    raw.editor.headingFrameUrl = editorHeading.frameUrl;
    raw.editor.result = editorHeading.present ? 'PASS' : 'FAIL';
    await page.screenshot({
      path: join(outDir, 'editor.png'),
      fullPage: true,
    });
  } catch (error) {
    raw.editor.result = 'FAIL';
    raw.editor.error = error instanceof Error ? error.message : String(error);
  }

  if (raw.editor.result === 'PASS') {
    try {
      await page.goto(server.renderUrl, {
        waitUntil: 'networkidle',
        timeout: 90000,
      });
      const render = await page.evaluate(() => {
        const expectedHeading = 'P15 First Controlled Target Proof';
        const expectedText = 'Deterministic Container V1 operator vector.';
        const heading = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
          .find((node) => (node.textContent || '').trim() === expectedHeading);
        const container = heading
          ? (heading.closest('.e-con') || heading.closest('.elementor-element'))
          : null;

        if (!heading || !container) {
          return {
            render: 'FAIL',
            structure: 'NOT_RUN',
            solidBackground: 'NOT_RUN',
            uniformRadius: 'NOT_RUN',
            containerClass: '',
            matchesECon: false,
            computedBackground: '',
            computedRadii: [],
          };
        }

        const style = getComputedStyle(container);
        const radii = [
          style.borderTopLeftRadius,
          style.borderTopRightRadius,
          style.borderBottomRightRadius,
          style.borderBottomLeftRadius,
        ];
        const background = style.backgroundColor;
        const structure = (container.textContent || '').includes(expectedText) ? 'PASS' : 'FAIL';
        const solidBackground = (
          background === 'rgb(51, 102, 153)'
          || background === 'rgba(51, 102, 153, 1)'
        ) ? 'PASS' : 'FAIL';
        const uniformRadius = radii.every((value) => value === '12px') ? 'PASS' : 'FAIL';

        return {
          render: 'PASS',
          structure,
          solidBackground,
          uniformRadius,
          containerClass: container.className,
          matchesECon: container.matches('.e-con'),
          computedBackground: background,
          computedRadii: radii,
        };
      });

      raw.render = {
        result: render.render,
        structure: render.structure,
        solidBackground: render.solidBackground,
        uniformRadius: render.uniformRadius,
        containerClass: render.containerClass,
        matchesECon: render.matchesECon,
        computedBackground: render.computedBackground,
        computedRadii: render.computedRadii,
        error: '',
      };
      await page.screenshot({
        path: join(outDir, 'render.png'),
        fullPage: true,
      });
    } catch (error) {
      raw.render.result = 'FAIL';
      raw.render.structure = 'NOT_RUN';
      raw.render.solidBackground = 'NOT_RUN';
      raw.render.uniformRadius = 'NOT_RUN';
      raw.render.error = error instanceof Error ? error.message : String(error);
    }
  }

  const steps = server.importResult === 'PASS'
    ? raw.editor.result === 'PASS'
      ? {
          importResult: 'PASS',
          editorOpenResult: 'PASS',
          renderResult: raw.render.result,
          fidelity: {
            structure: raw.render.result === 'PASS' ? raw.render.structure : 'NOT_RUN',
            solidBackground: raw.render.result === 'PASS' ? raw.render.solidBackground : 'NOT_RUN',
            uniformRadius: raw.render.result === 'PASS' ? raw.render.uniformRadius : 'NOT_RUN',
          },
        }
      : {
          importResult: 'PASS',
          editorOpenResult: 'FAIL',
          renderResult: 'NOT_RUN',
          fidelity: {
            structure: 'NOT_RUN',
            solidBackground: 'NOT_RUN',
            uniformRadius: 'NOT_RUN',
          },
        }
    : {
        importResult: 'FAIL',
        editorOpenResult: 'NOT_RUN',
        renderResult: 'NOT_RUN',
        fidelity: {
          structure: 'NOT_RUN',
          solidBackground: 'NOT_RUN',
          uniformRadius: 'NOT_RUN',
        },
      };

  proofEvidence = {
    schemaVersion: 1,
    evidenceVersion: 'elementor-target-proof-evidence-v1',
    candidateIdentity: manifest.candidateIdentity,
    targetProfileIdentity: {
      profileVersion: profile.profileVersion,
      fingerprint: manifest.targetProfileFingerprint,
    },
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: server.environment.wordpressVersion,
      elementorVersion: server.environment.elementorVersion,
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: new Date().toISOString(),
    evidenceReference,
    steps,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };

  await writeJson(join(outDir, 'proof-evidence.json'), proofEvidence);
  await writeJson(join(outDir, 'raw-runtime-observation.json'), raw);

  const firstProofFullPass = (
    steps.importResult === 'PASS'
    && steps.editorOpenResult === 'PASS'
    && steps.renderResult === 'PASS'
    && steps.fidelity.structure === 'PASS'
    && steps.fidelity.solidBackground === 'PASS'
    && steps.fidelity.uniformRadius === 'PASS'
  );

  let assetProofEvidence = null;
  let assetProofFullPass = false;
  try {
    await page.goto(baseUrl + '/?p15_asset_proof_observe=' + encodeURIComponent(token), {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    const assetServer = await bodyJson(page);
    assetRaw.server = {
      schema: assetServer.schema,
      observedAt: assetServer.observedAt,
      evidenceReference: assetServer.evidenceReference,
      environment: assetServer.environment,
      importResult: assetServer.importResult,
      importObservedAt: assetServer.importObservedAt,
      templateId: assetServer.templateId,
      templateTitle: assetServer.templateTitle,
      templateType: assetServer.templateType,
      templateSha256: assetServer.templateSha256,
      importedMedia: {
        mediaReferenceFound: assetServer.importedMedia?.mediaReferenceFound === true,
        mediaIdPresent: assetServer.importedMedia?.mediaIdPresent === true,
        mediaUrlFingerprint: assetServer.importedMedia?.mediaUrlFingerprint || null,
        sourceUrlFingerprint: assetServer.importedMedia?.sourceUrlFingerprint || null,
        sourceProvenanceMatches: assetServer.importedMedia?.sourceProvenanceMatches === true,
      },
    };

    if (assetServer.importResult !== 'PASS') {
      throw new Error('Asset Template Library import did not PASS: ' + assetServer.importResult);
    }
    if (assetServer.templateType !== 'page') {
      throw new Error('Imported asset template type is not page: ' + assetServer.templateType);
    }
    if (assetServer.templateSha256 !== assetManifest.fileSha256.template) {
      throw new Error('Imported asset template SHA-256 does not match canonical asset vector.');
    }
    if (assetServer.environment.wordpressVersion !== assetProfile.environment.wordpressVersion
      || assetServer.environment.elementorVersion !== assetProfile.environment.elementorVersion) {
      throw new Error('Observed asset target versions do not match the declared asset profile.');
    }

    const importedMedia = assetRaw.server.importedMedia;
    const targetManagedMediaResult = importedMedia.mediaReferenceFound
      && importedMedia.mediaIdPresent
      && /^sha256:[0-9a-f]{64}$/.test(importedMedia.mediaUrlFingerprint || '')
      ? 'PASS'
      : 'FAIL';
    const sourceProvenanceResult = targetManagedMediaResult === 'PASS'
      ? (importedMedia.sourceProvenanceMatches
          && importedMedia.sourceUrlFingerprint === assetManifest.assetUrlFingerprint
        ? 'PASS'
        : 'FAIL')
      : 'NOT_RUN';

    if (targetManagedMediaResult !== 'PASS' || sourceProvenanceResult !== 'PASS') {
      throw new Error('Asset import did not retain exact source provenance into target-managed media.');
    }

    await page.goto(assetServer.renderUrl, {
      waitUntil: 'networkidle',
      timeout: 90000,
    });
    const imageObservation = await page.evaluate(() => {
      const root = document.querySelector('#p15-asset-proof-root');
      const image = root ? root.querySelector('img') : null;
      if (!image) {
        return {
          imagePresent: false,
          renderedUrl: '',
          complete: false,
          naturalWidth: 0,
          naturalHeight: 0,
        };
      }
      return {
        imagePresent: true,
        renderedUrl: image.currentSrc || image.src || image.getAttribute('src') || '',
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      };
    });

    const renderedImageUrlFingerprint = imageObservation.renderedUrl
      ? 'sha256:' + createHash('sha256').update(imageObservation.renderedUrl).digest('hex')
      : null;
    const imageReferenceResult = imageObservation.imagePresent
      && renderedImageUrlFingerprint === importedMedia.mediaUrlFingerprint
      ? 'PASS'
      : 'FAIL';
    const browserImageLoadResult = imageReferenceResult === 'PASS'
      ? (imageObservation.complete
          && imageObservation.naturalWidth > 0
          && imageObservation.naturalHeight > 0
        ? 'PASS'
        : 'FAIL')
      : 'NOT_RUN';

    assetRaw.render = {
      result: imageObservation.imagePresent ? 'PASS' : 'FAIL',
      imagePresent: imageObservation.imagePresent,
      renderedImageUrlFingerprint,
      imageReferenceResult,
      browserImageLoadResult,
      naturalWidth: imageObservation.naturalWidth,
      naturalHeight: imageObservation.naturalHeight,
      error: '',
    };
    await page.screenshot({
      path: join(outDir, 'asset-render.png'),
      fullPage: true,
    });

    const assetSteps = {
      importResult: 'PASS',
      targetManagedMediaResult,
      sourceProvenanceResult,
      sourceAssetUrlFingerprint: importedMedia.sourceUrlFingerprint,
      targetManagedMediaUrlFingerprint: importedMedia.mediaUrlFingerprint,
      renderResult: assetRaw.render.result,
      renderedImageReferenceResult: assetRaw.render.result === 'PASS'
        ? imageReferenceResult
        : 'NOT_RUN',
      browserImageLoadResult: assetRaw.render.result === 'PASS'
        ? browserImageLoadResult
        : 'NOT_RUN',
      renderedImageUrlFingerprint: assetRaw.render.result === 'PASS'
        ? renderedImageUrlFingerprint
        : null,
    };

    assetProofEvidence = {
      schemaVersion: 1,
      evidenceVersion: 'elementor-asset-target-proof-evidence-v1',
      candidateIdentity: assetManifest.candidateIdentity,
      targetProfileIdentity: {
        profileVersion: assetProfile.profileVersion,
        fingerprint: assetManifest.targetProfileFingerprint,
      },
      referenceReviewIdentity: {
        identityVersion: assetReferenceIdentity.identityVersion,
        digest: assetManifest.referenceReviewIdentityDigest,
      },
      observedTarget: {
        source: 'OBSERVED',
        wordpressVersion: assetServer.environment.wordpressVersion,
        elementorVersion: assetServer.environment.elementorVersion,
        importSurface: 'TEMPLATE_LIBRARY_JSON',
      },
      observedAt: new Date().toISOString(),
      evidenceReference,
      steps: assetSteps,
      assetReferenceClosureClaim: false,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      internalReviewRequired: true,
    };
    await writeJson(join(outDir, 'asset-proof-evidence.json'), assetProofEvidence);
    await writeJson(join(outDir, 'asset-raw-runtime-observation.json'), assetRaw);

    assetProofFullPass = (
      assetSteps.importResult === 'PASS'
      && assetSteps.targetManagedMediaResult === 'PASS'
      && assetSteps.sourceProvenanceResult === 'PASS'
      && assetSteps.sourceAssetUrlFingerprint === assetManifest.assetUrlFingerprint
      && assetSteps.renderResult === 'PASS'
      && assetSteps.renderedImageReferenceResult === 'PASS'
      && assetSteps.browserImageLoadResult === 'PASS'
      && assetSteps.renderedImageUrlFingerprint === assetSteps.targetManagedMediaUrlFingerprint
    );
  } catch (error) {
    assetRaw.render.error = error instanceof Error ? error.message : String(error);
    await writeJson(join(outDir, 'asset-raw-runtime-observation.json'), assetRaw);
  }

  const fullPass = firstProofFullPass && assetProofFullPass;

  process.stdout.write(JSON.stringify({
    browser: raw.browser,
    wordpressVersion: server.environment.wordpressVersion,
    elementorVersion: server.environment.elementorVersion,
    importResult: server.importResult,
    editorOpenResult: steps.editorOpenResult,
    renderResult: steps.renderResult,
    fidelity: steps.fidelity,
    firstProofFullPass,
    assetProof: {
      classificationReady: assetProofEvidence !== null,
      importResult: assetProofEvidence?.steps.importResult ?? 'NOT_RUN',
      targetManagedMediaResult: assetProofEvidence?.steps.targetManagedMediaResult ?? 'NOT_RUN',
      sourceProvenanceResult: assetProofEvidence?.steps.sourceProvenanceResult ?? 'NOT_RUN',
      renderResult: assetProofEvidence?.steps.renderResult ?? 'NOT_RUN',
      renderedImageReferenceResult: assetProofEvidence?.steps.renderedImageReferenceResult ?? 'NOT_RUN',
      browserImageLoadResult: assetProofEvidence?.steps.browserImageLoadResult ?? 'NOT_RUN',
      assetUrlFingerprint: assetProofEvidence?.steps.renderedImageUrlFingerprint ?? null,
      fullPass: assetProofFullPass,
    },
    fullPass,
  }, null, 2) + '\n');

  if (!fullPass) process.exitCode = 2;
} catch (error) {
  raw.fatalError = error instanceof Error ? error.message : String(error);
  await writeJson(join(outDir, 'raw-runtime-observation.json'), raw);
  assetRaw.fatalError = raw.fatalError;
  await writeJson(join(outDir, 'asset-raw-runtime-observation.json'), assetRaw);
  process.stderr.write('P15_REAL_TARGET_PROOF_BROWSER_FAILED: ' + raw.fatalError + '\n');
  process.exitCode = 2;
} finally {
  if (browser) await browser.close();
}
