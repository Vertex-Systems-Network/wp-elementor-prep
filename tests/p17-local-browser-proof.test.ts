import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  buildP17LocalBrowserProofReceipt,
  serializeP17LocalBrowserProofReceipt,
  type P17LocalBrowserObservation,
} from '../src/targets/web/local-browser-proof';
import { buildP17NeutralWebExportPackage } from '../src/targets/web/neutral-web-export';
import {
  validateP17NeutralWebExportPackage,
  type P17NeutralWebPackageValidationReceipt,
} from '../src/targets/web/neutral-web-package-validation';
import {
  P17_NEUTRAL_WEB_IR_VERSION,
  type P17NeutralWebDocumentV1,
} from '../src/targets/web/neutral-web-ir';

function source(): P17NeutralWebDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P17_NEUTRAL_WEB_IR_VERSION,
    title: 'Controlled local browser proof',
    language: 'en',
    direction: 'DESIGN_TO_WEB',
    nodes: [
      {
        kind: 'container',
        nodeId: 'root',
        provenance: { source: 'FIGMA', sourceRef: 'fixture:root' },
        semanticTag: 'main',
        layout: { mode: 'flex', direction: 'column', gapPx: 16 },
        style: {
          paddingPx: { top: 24, right: 24, bottom: 24, left: 24 },
          backgroundColorHex: '#f4f4f4',
        },
        children: [
          {
            kind: 'text',
            nodeId: 'heading',
            provenance: { source: 'FIGMA', sourceRef: 'fixture:heading' },
            semantic: 'heading',
            headingLevel: 1,
            text: 'Controlled browser proof',
          },
          {
            kind: 'text',
            nodeId: 'paragraph',
            provenance: { source: 'FIGMA', sourceRef: 'fixture:paragraph' },
            semantic: 'paragraph',
            text: 'Static HTML and CSS only.',
          },
        ],
      },
    ],
  };
}

function packageValidation(): P17NeutralWebPackageValidationReceipt {
  const document = source();
  return validateP17NeutralWebExportPackage({
    source: document,
    package: buildP17NeutralWebExportPackage(document),
  });
}

function observation(): P17LocalBrowserObservation {
  return {
    runtimeFailureCode: null,
    evidence: {
      commitSha: 'a'.repeat(40),
      runId: '123456789',
      runAttempt: '1',
    },
    browser: {
      family: 'CHROME',
      version: '152.0.1234.56',
    },
    viewport: {
      width: 1440,
      height: 900,
    },
    requestPolicy: {
      mode: 'EXACT_LOOPBACK_PATH_ALLOWLIST',
      allowedRequests: ['GET /index.html', 'GET /styles.css'],
      observedRequests: ['GET /index.html', 'GET /styles.css'],
      blockedRequestCount: 0,
    },
    dom: {
      bodyChildCount: 1,
      mainCount: 1,
      headingCount: 1,
      paragraphCount: 1,
      stylesheetCount: 1,
      activeSurfaceCount: 0,
      inlineEventHandlerCount: 0,
    },
    computedStyle: {
      rootDisplay: 'flex',
      rootFlexDirection: 'column',
      rootGap: '16px',
      rootPaddingTop: '24px',
      rootPaddingRight: '24px',
      rootPaddingBottom: '24px',
      rootPaddingLeft: '24px',
      rootBackgroundColor: 'rgb(244, 244, 244)',
    },
    consoleErrorCount: 0,
    pageErrorCount: 0,
    screenshotSha256: `sha256:${'b'.repeat(64)}`,
  };
}

describe('P17 local browser proof receipt', () => {
  it('accepts the exact controlled observation without granting visual/reconstruction/production authority', () => {
    const receipt = buildP17LocalBrowserProofReceipt({
      packageValidation: packageValidation(),
      observation: observation(),
    });

    expect(receipt.valid).toBe(true);
    expect(receipt.status).toBe('BROWSER_RENDER_OBSERVED');
    expect(receipt.browserValidationStatus).toBe('OBSERVED_PASS');
    expect(receipt.visualFidelityStatus).toBe('NOT_RUN');
    expect(receipt.reconstructionStatus).toBe('NOT_RUN');
    expect(receipt.productionAcceptance).toBe(false);
    expect(receipt.acceptanceAuthority).toBe(false);
    expect(receipt.javascriptExecution).toBe(false);
    expect(receipt.networkAccessRequired).toBe(false);
    expect(receipt.issues).toEqual([]);
  });

  it('rejects a browser attempt when the R4 package gate is not an exact PACKAGE_VALIDATED result', () => {
    const validation = {
      ...packageValidation(),
      status: 'REVIEW_REQUIRED' as const,
    };
    const receipt = buildP17LocalBrowserProofReceipt({
      packageValidation: validation,
      observation: observation(),
    });

    expect(receipt.valid).toBe(false);
    expect(receipt.issues.map((issue) => issue.code)).toContain('P17_BROWSER_PACKAGE_GATE_NOT_PASS');
  });

  it('fails closed on blocked requests, browser errors and active DOM surfaces', () => {
    const observed = observation();
    observed.requestPolicy.blockedRequestCount = 1;
    observed.consoleErrorCount = 1;
    observed.pageErrorCount = 1;
    observed.dom.activeSurfaceCount = 1;
    observed.dom.inlineEventHandlerCount = 1;

    const receipt = buildP17LocalBrowserProofReceipt({
      packageValidation: packageValidation(),
      observation: observed,
    });
    const codes = receipt.issues.map((issue) => issue.code);

    expect(codes).toContain('P17_BROWSER_EXTERNAL_REQUEST_BLOCKED');
    expect(codes).toContain('P17_BROWSER_CONSOLE_ERROR');
    expect(codes).toContain('P17_BROWSER_PAGE_ERROR');
    expect(codes).toContain('P17_BROWSER_ACTIVE_SURFACE');
    expect(receipt.browserValidationStatus).toBe('OBSERVED_FAIL');
  });

  it('fails closed on render-structure, computed-style and screenshot evidence drift', () => {
    const observed = observation();
    observed.dom.headingCount = 2;
    observed.computedStyle.rootGap = '15px';
    observed.screenshotSha256 = null;

    const receipt = buildP17LocalBrowserProofReceipt({
      packageValidation: packageValidation(),
      observation: observed,
    });
    const codes = receipt.issues.map((issue) => issue.code);

    expect(codes).toContain('P17_BROWSER_STRUCTURE_MISMATCH');
    expect(codes).toContain('P17_BROWSER_COMPUTED_STYLE_MISMATCH');
    expect(codes).toContain('P17_BROWSER_SCREENSHOT_HASH_INVALID');
  });

  it('serializes only bounded proof metadata and retains no generated page content or loopback origin', () => {
    const receipt = buildP17LocalBrowserProofReceipt({
      packageValidation: packageValidation(),
      observation: observation(),
    });
    const serialized = serializeP17LocalBrowserProofReceipt(receipt);

    expect(serialized.endsWith('\n')).toBe(true);
    expect(serialized).not.toContain('Controlled browser proof');
    expect(serialized).not.toContain('Static HTML and CSS only.');
    expect(serialized).not.toContain('http://127.0.0.1');
    expect(serialized).not.toContain('<main');
  });
});

describe('P17 local browser harness security contract', () => {
  it('checks R4 before launching Chrome and keeps loopback/CSP/request denial explicit', () => {
    const script = readFileSync('scripts/p17-local-browser-proof.mjs', 'utf8');
    const gateIndex = script.indexOf("packageValidation.status !== 'PACKAGE_VALIDATED'");
    const launchIndex = script.indexOf('chromium.launch');

    expect(gateIndex).toBeGreaterThanOrEqual(0);
    expect(launchIndex).toBeGreaterThan(gateIndex);
    expect(script).toContain("server.listen(0, '127.0.0.1'");
    expect(script).toContain("default-src 'none'");
    expect(script).toContain("connect-src 'none'");
    expect(script).toContain("script-src 'none'");
    expect(script).toContain("route.abort('blockedbyclient')");
    expect(script).toContain("allowedUrls.has(request.url())");
    expect(script).not.toContain('page.goto("http');
    expect(script).not.toContain("page.goto('http");
  });
});
