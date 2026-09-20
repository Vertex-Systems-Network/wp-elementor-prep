import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error('Missing required environment variable: ' + name);
  return value;
}

function controlledLoopbackBaseUrl(name, value, expectedPort) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(name + ' must be a valid controlled loopback URL.');
  }
  if (
    url.protocol !== 'http:'
    || url.hostname !== '127.0.0.1'
    || url.port !== String(expectedPort)
    || (url.pathname !== '/' && url.pathname !== '')
    || url.username !== ''
    || url.password !== ''
    || url.search !== ''
    || url.hash !== ''
  ) {
    throw new Error(name + ' must be exactly http://127.0.0.1:' + expectedPort + '.');
  }
  return 'http://127.0.0.1:' + expectedPort;
}

function proofUrl(baseUrl, key, token) {
  return baseUrl + '/?' + key + '=' + encodeURIComponent(token);
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
  const interceptedUrl = page.url();
  const onboardingRoute = interceptedUrl.includes('page=elementor-app')
    && interceptedUrl.includes('onboarding');
  const skip = page.getByText('Skip', { exact: true });

  if (!onboardingRoute && await skip.count() === 0) {
    return { result: 'NOT_NEEDED', interceptedUrl, finalUrl: interceptedUrl };
  }

  if (await skip.count() === 0) {
    try {
      await skip.first().waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      throw new Error(
        'Elementor onboarding intercepted the editor but the exact Skip control did not become visible within 15000 ms.',
      );
    }
  }

  await skip.first().click({ timeout: 15000 });
  await page.waitForTimeout(1500);
  return { result: 'SKIPPED', interceptedUrl, finalUrl: page.url() };
}

function collectImageUrls(elements, urls = []) {
  if (!Array.isArray(elements)) return urls;
  for (const element of elements) {
    if (!element || typeof element !== 'object' || Array.isArray(element)) continue;
    const image = element.widgetType === 'image' ? element.settings?.image : null;
    if (image && typeof image.url === 'string' && image.url.length > 0) {
      urls.push(image.url);
    }
    collectImageUrls(element.elements, urls);
  }
  return urls;
}

function sha256(value) {
  return 'sha256:' + createHash('sha256').update(value).digest('hex');
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

const baseUrl = controlledLoopbackBaseUrl('P15_BASE_URL', required('P15_BASE_URL'), 8080);
const secondBaseUrl = controlledLoopbackBaseUrl('P15_SECOND_BASE_URL', required('P15_SECOND_BASE_URL'), 8082);
const crossTargetExportPath = required('P15_CROSS_TARGET_EXPORT_PATH');
const assetFixtureSha256 = required('P15_ASSET_FIXTURE_SHA256');
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

const crossTargetRaw = {
  schema: 'p15-cross-target-media-runtime-bundle-v1',
  evidenceReference,
  exportedTemplateSha256: null,
  sourceTarget: null,
  destinationTarget: null,
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
  fatalError: '',
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

  await page.goto(proofUrl(baseUrl, 'p15_proof_observe', token), {
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
    await page.goto(proofUrl(baseUrl, 'p15_proof_login', token), {
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
      await page.goto(proofUrl(baseUrl, 'p15_proof_render', token), {
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
  let assetServer = null;
  try {
    await page.goto(proofUrl(baseUrl, 'p15_asset_proof_observe', token), {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    assetServer = await bodyJson(page);
    assetRaw.server = {
      schema: assetServer.schema,
      observedAt: assetServer.observedAt,
      evidenceReference: assetServer.evidenceReference,
      environment: assetServer.environment,
      siteIdentity: assetServer.siteIdentity,
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
        targetManagedMediaTargetLocal: assetServer.importedMedia?.targetManagedMediaTargetLocal === true,
        contentIntegrity: {
          attachmentPostType: assetServer.importedMedia?.contentIntegrity?.attachmentPostType || '',
          fileExists: assetServer.importedMedia?.contentIntegrity?.fileExists === true,
          sourceFixtureSha256: assetServer.importedMedia?.contentIntegrity?.sourceFixtureSha256 || '',
          targetFileSha256: assetServer.importedMedia?.contentIntegrity?.targetFileSha256 || '',
          contentSha256Matches: assetServer.importedMedia?.contentIntegrity?.contentSha256Matches === true,
          mimeType: assetServer.importedMedia?.contentIntegrity?.mimeType || '',
          width: Number(assetServer.importedMedia?.contentIntegrity?.width || 0),
          height: Number(assetServer.importedMedia?.contentIntegrity?.height || 0),
          imageDimensionsObserved: assetServer.importedMedia?.contentIntegrity?.imageDimensionsObserved === true,
        },
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

    await page.goto(proofUrl(baseUrl, 'p15_asset_proof_render', token), {
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

    const contentIntegrity = importedMedia.contentIntegrity;
    const assetContentIntegrityEvidence = {
      schemaVersion: 1,
      evidenceVersion: 'elementor-target-managed-media-integrity-evidence-v1',
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
      attachment: {
        postType: contentIntegrity.attachmentPostType,
        sourceFixtureSha256: contentIntegrity.sourceFixtureSha256,
        targetFileSha256: contentIntegrity.targetFileSha256,
        mimeType: contentIntegrity.mimeType,
        width: contentIntegrity.width,
        height: contentIntegrity.height,
      },
      referenceClosureClaim: false,
      assetReferenceClosureClaim: false,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      generationEnabled: false,
      downloadEnabled: false,
      internalReviewRequired: true,
    };
    await writeJson(
      join(outDir, 'asset-content-integrity-evidence.json'),
      assetContentIntegrityEvidence,
    );
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

  let crossTargetFullPass = false;
  let portabilityEvidence = null;
  if (assetProofFullPass && assetProofEvidence) {
    try {
      const exportResponse = await context.request.get(
        proofUrl(baseUrl, 'p15_asset_proof_export', token),
        { timeout: 60000 },
      );
      if (!exportResponse.ok()) {
        throw new Error('Target-A Elementor export failed with HTTP ' + exportResponse.status());
      }
      const exportedBytes = await exportResponse.body();
      const exportedRaw = exportedBytes.toString('utf8');
      let exportedTemplate;
      try {
        exportedTemplate = JSON.parse(exportedRaw);
      } catch {
        throw new Error('Target-A Elementor export was not valid JSON.');
      }
      const exportedUrls = collectImageUrls(exportedTemplate?.content);
      if (exportedUrls.length !== 1) {
        throw new Error('Target-A export must contain exactly one Image MEDIA URL.');
      }
      const exportedSourceUrl = exportedUrls[0];
      const exportedSourceUrlFingerprint = sha256(exportedSourceUrl);
      const exportedTemplateSha256 = sha256(exportedBytes);
      if (exportedSourceUrlFingerprint !== assetProofEvidence.steps.targetManagedMediaUrlFingerprint) {
        throw new Error('Target-A export MEDIA URL is not the observed target-managed media reference.');
      }
      await writeFile(crossTargetExportPath, exportedBytes);

      crossTargetRaw.exportedTemplateSha256 = exportedTemplateSha256;
      crossTargetRaw.sourceTarget = {
        environment: assetRaw.server?.environment ?? null,
        siteIdentity: assetRaw.server?.siteIdentity ?? null,
        targetManagedMediaUrlFingerprint: assetProofEvidence.steps.targetManagedMediaUrlFingerprint,
      };

      await page.goto(proofUrl(secondBaseUrl, 'p15_cross_target_observe', token), {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      const destinationServer = await bodyJson(page);
      crossTargetRaw.destinationTarget = {
        schema: destinationServer.schema,
        observedAt: destinationServer.observedAt,
        evidenceReference: destinationServer.evidenceReference,
        environment: destinationServer.environment,
        siteIdentity: destinationServer.siteIdentity,
        importResult: destinationServer.importResult,
        importObservedAt: destinationServer.importObservedAt,
        templateTitle: destinationServer.templateTitle,
        templateType: destinationServer.templateType,
        exportedTemplateSha256: destinationServer.exportedTemplateSha256,
        importedMedia: destinationServer.importedMedia,
      };

      if (destinationServer.importResult !== 'PASS') {
        throw new Error('Target-B local Template JSON import did not PASS: ' + destinationServer.importResult);
      }
      if (destinationServer.templateType !== 'page') {
        throw new Error('Target-B imported template type is not page: ' + destinationServer.templateType);
      }
      if (destinationServer.exportedTemplateSha256 !== exportedTemplateSha256) {
        throw new Error('Target-B did not consume the exact Target-A exported JSON bytes.');
      }
      if (destinationServer.environment.wordpressVersion !== assetProfile.environment.wordpressVersion
        || destinationServer.environment.elementorVersion !== assetProfile.environment.elementorVersion) {
        throw new Error('Target-B versions do not match the exact declared asset TargetProfile.');
      }

      const sourceSite = assetRaw.server?.siteIdentity;
      const destinationSite = destinationServer.siteIdentity;
      if (!sourceSite?.homeUrlFingerprint || !sourceSite?.databaseNameFingerprint
        || !destinationSite?.homeUrlFingerprint || !destinationSite?.databaseNameFingerprint
        || sourceSite.homeUrlFingerprint === destinationSite.homeUrlFingerprint
        || sourceSite.databaseNameFingerprint === destinationSite.databaseNameFingerprint) {
        throw new Error('Cross-target proof requires distinct disposable site and database identities.');
      }

      const destinationMedia = destinationServer.importedMedia;
      const destinationTargetManagedMediaResult = destinationMedia?.mediaReferenceFound === true
        && destinationMedia?.mediaIdPresent === true
        && /^sha256:[0-9a-f]{64}$/.test(destinationMedia?.mediaUrlFingerprint || '')
        && destinationMedia?.targetManagedMediaTargetLocal === true
        && destinationMedia?.mediaUrlFingerprint !== assetProofEvidence.steps.targetManagedMediaUrlFingerprint
        ? 'PASS'
        : 'FAIL';
      const destinationSourceProvenanceResult = destinationTargetManagedMediaResult === 'PASS'
        && destinationMedia?.sourceProvenanceMatches === true
        && destinationMedia?.sourceUrlFingerprint === exportedSourceUrlFingerprint
        ? 'PASS'
        : 'FAIL';

      if (destinationTargetManagedMediaResult !== 'PASS' || destinationSourceProvenanceResult !== 'PASS') {
        throw new Error('Target-B did not rewrite the exact Target-A managed-media source into its own managed media.');
      }

      const destinationIntegrity = destinationMedia?.contentIntegrity;
      if (destinationIntegrity?.sourceFixtureSha256 !== assetFixtureSha256
        || destinationIntegrity?.targetFileSha256 !== assetFixtureSha256
        || destinationIntegrity?.contentSha256Matches !== true
        || destinationIntegrity?.mimeType !== 'image/png'
        || Number(destinationIntegrity?.width || 0) <= 0
        || Number(destinationIntegrity?.height || 0) <= 0) {
        throw new Error('Target-B attachment content integrity does not match the canonical controlled PNG.');
      }

      await page.goto(proofUrl(secondBaseUrl, 'p15_cross_target_render', token), {
        waitUntil: 'networkidle',
        timeout: 90000,
      });
      const destinationImage = await page.evaluate(() => {
        const root = document.querySelector('#p15-cross-target-root');
        const image = root ? root.querySelector('img') : null;
        if (!image) {
          return { imagePresent: false, renderedUrl: '', complete: false, naturalWidth: 0, naturalHeight: 0 };
        }
        return {
          imagePresent: true,
          renderedUrl: image.currentSrc || image.src || image.getAttribute('src') || '',
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
        };
      });
      const destinationRenderedFingerprint = destinationImage.renderedUrl
        ? sha256(destinationImage.renderedUrl)
        : null;
      const destinationImageReferenceResult = destinationImage.imagePresent
        && destinationRenderedFingerprint === destinationMedia.mediaUrlFingerprint
        ? 'PASS'
        : 'FAIL';
      const destinationBrowserImageLoadResult = destinationImageReferenceResult === 'PASS'
        ? (destinationImage.complete && destinationImage.naturalWidth > 0 && destinationImage.naturalHeight > 0
          ? 'PASS'
          : 'FAIL')
        : 'NOT_RUN';

      crossTargetRaw.render = {
        result: destinationImage.imagePresent ? 'PASS' : 'FAIL',
        imagePresent: destinationImage.imagePresent,
        renderedImageUrlFingerprint: destinationRenderedFingerprint,
        imageReferenceResult: destinationImageReferenceResult,
        browserImageLoadResult: destinationBrowserImageLoadResult,
        naturalWidth: destinationImage.naturalWidth,
        naturalHeight: destinationImage.naturalHeight,
        error: '',
      };
      await page.screenshot({
        path: join(outDir, 'cross-target-media-render.png'),
        fullPage: true,
      });

      portabilityEvidence = {
        schemaVersion: 1,
        evidenceVersion: 'elementor-target-managed-media-portability-evidence-v1',
        exportedTemplateSha256,
        sourceTarget: {
          source: 'OBSERVED',
          wordpressVersion: assetServer.environment.wordpressVersion,
          elementorVersion: assetServer.environment.elementorVersion,
          importSurface: 'TEMPLATE_LIBRARY_JSON',
        },
        destinationTarget: {
          source: 'OBSERVED',
          wordpressVersion: destinationServer.environment.wordpressVersion,
          elementorVersion: destinationServer.environment.elementorVersion,
          importSurface: 'TEMPLATE_LIBRARY_JSON',
        },
        observedAt: new Date().toISOString(),
        evidenceReference,
        steps: {
          importResult: 'PASS',
          sourceProvenanceResult: destinationSourceProvenanceResult,
          sourceManagedMediaUrlFingerprint: assetProofEvidence.steps.targetManagedMediaUrlFingerprint,
          destinationSourceUrlFingerprint: destinationMedia.sourceUrlFingerprint,
          destinationManagedMediaUrlFingerprint: destinationMedia.mediaUrlFingerprint,
          destinationManagedMediaTargetLocal: destinationMedia.targetManagedMediaTargetLocal === true,
          renderResult: crossTargetRaw.render.result,
          renderedImageReferenceResult: crossTargetRaw.render.result === 'PASS'
            ? destinationImageReferenceResult
            : 'NOT_RUN',
          browserImageLoadResult: crossTargetRaw.render.result === 'PASS'
            ? destinationBrowserImageLoadResult
            : 'NOT_RUN',
          renderedImageUrlFingerprint: crossTargetRaw.render.result === 'PASS'
            ? destinationRenderedFingerprint
            : null,
        },
        attachment: {
          sourceFixtureSha256: destinationIntegrity.sourceFixtureSha256,
          targetFileSha256: destinationIntegrity.targetFileSha256,
          mimeType: destinationIntegrity.mimeType,
          width: Number(destinationIntegrity.width),
          height: Number(destinationIntegrity.height),
        },
        internalDecisionStatus: 'NOT_RUN',
        authenticationAuthority: false,
        acceptanceAuthority: false,
        referenceClosureClaim: false,
        assetReferenceClosureClaim: false,
        targetCompatibilityClaim: false,
        productionAcceptance: false,
        generationEnabled: false,
        downloadEnabled: false,
        internalReviewRequired: true,
      };
      await writeJson(join(outDir, 'cross-target-media-portability-evidence.json'), portabilityEvidence);
      await writeJson(join(outDir, 'cross-target-raw-runtime-observation.json'), crossTargetRaw);

      crossTargetFullPass = (
        destinationSourceProvenanceResult === 'PASS'
        && destinationTargetManagedMediaResult === 'PASS'
        && crossTargetRaw.render.result === 'PASS'
        && destinationImageReferenceResult === 'PASS'
        && destinationBrowserImageLoadResult === 'PASS'
        && destinationIntegrity.targetFileSha256 === assetFixtureSha256
      );
    } catch (error) {
      crossTargetRaw.fatalError = error instanceof Error ? error.message : String(error);
      crossTargetRaw.render.error = crossTargetRaw.fatalError;
      await writeJson(join(outDir, 'cross-target-raw-runtime-observation.json'), crossTargetRaw);
    }
  }

  const fullPass = firstProofFullPass && assetProofFullPass && crossTargetFullPass;

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
      contentIntegrity: assetRaw.server?.importedMedia?.contentIntegrity ?? null,
      fullPass: assetProofFullPass,
    },
    crossTargetPortability: {
      classificationReady: portabilityEvidence !== null,
      exportedTemplateSha256: portabilityEvidence?.exportedTemplateSha256 ?? null,
      sourceProvenanceResult: portabilityEvidence?.steps.sourceProvenanceResult ?? 'NOT_RUN',
      destinationManagedMediaTargetLocal: portabilityEvidence?.steps.destinationManagedMediaTargetLocal ?? false,
      renderResult: portabilityEvidence?.steps.renderResult ?? 'NOT_RUN',
      browserImageLoadResult: portabilityEvidence?.steps.browserImageLoadResult ?? 'NOT_RUN',
      fullPass: crossTargetFullPass,
    },
    fullPass,
  }, null, 2) + '\n');

  if (!fullPass) process.exitCode = 2;
} catch (error) {
  raw.fatalError = error instanceof Error ? error.message : String(error);
  await writeJson(join(outDir, 'raw-runtime-observation.json'), raw);
  assetRaw.fatalError = raw.fatalError;
  await writeJson(join(outDir, 'asset-raw-runtime-observation.json'), assetRaw);
  crossTargetRaw.fatalError = raw.fatalError;
  await writeJson(join(outDir, 'cross-target-raw-runtime-observation.json'), crossTargetRaw);
  process.stderr.write('P15_REAL_TARGET_PROOF_BROWSER_FAILED: ' + raw.fatalError + '\n');
  process.exitCode = 2;
} finally {
  if (browser) await browser.close();
}
