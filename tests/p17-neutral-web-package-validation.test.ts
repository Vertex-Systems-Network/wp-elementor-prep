import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';
import {
  P17_NEUTRAL_WEB_EXPORT_VERSION,
  buildP17NeutralWebExportPackage,
  type P17NeutralWebExportPackage,
} from '../src/targets/web/neutral-web-export';
import {
  P17_NEUTRAL_WEB_IR_VERSION,
  identifyP17NeutralWebDocument,
  type P17NeutralWebDocumentV1,
} from '../src/targets/web/neutral-web-ir';
import {
  P17_NEUTRAL_WEB_PACKAGE_VALIDATION_VERSION,
  serializeP17NeutralWebPackageValidationReceipt,
  validateP17NeutralWebExportPackage,
} from '../src/targets/web/neutral-web-package-validation';

function provenance(sourceRef: string) {
  return { source: 'FIGMA' as const, sourceRef };
}

function fixture(): P17NeutralWebDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P17_NEUTRAL_WEB_IR_VERSION,
    title: 'Package validation',
    language: 'en',
    direction: 'DESIGN_TO_WEB',
    nodes: [
      {
        kind: 'container',
        nodeId: 'root',
        provenance: provenance('1:1'),
        semanticTag: 'main',
        layout: { mode: 'flex', direction: 'column', gapPx: 16 },
        children: [
          {
            kind: 'text',
            nodeId: 'heading',
            provenance: provenance('1:2'),
            semantic: 'heading',
            headingLevel: 1,
            text: 'Safe package',
          },
          {
            kind: 'link',
            nodeId: 'link',
            provenance: provenance('1:3'),
            role: 'link',
            text: 'Docs',
            href: 'https://example.com/docs',
          },
          {
            kind: 'image',
            nodeId: 'image',
            provenance: provenance('1:4'),
            assetPath: 'assets/hero.png',
            alt: 'Hero',
          },
        ],
      },
    ],
  };
}

function generated(source = fixture()): P17NeutralWebExportPackage {
  return buildP17NeutralWebExportPackage(source);
}

function clonePackage(value: P17NeutralWebExportPackage): P17NeutralWebExportPackage {
  return JSON.parse(JSON.stringify(value)) as P17NeutralWebExportPackage;
}

function rehash(
  source: P17NeutralWebDocumentV1,
  value: P17NeutralWebExportPackage,
): void {
  if (typeof value.html !== 'string' || typeof value.css !== 'string') throw new Error('Expected generated package.');
  const identity = identifyP17NeutralWebDocument(source);
  const htmlSha256 = sha256Hex(value.html);
  const cssSha256 = sha256Hex(value.css);
  value.receipt.irVersion = identity.irVersion;
  value.receipt.irSha256 = identity.sha256;
  value.receipt.htmlSha256 = htmlSha256;
  value.receipt.cssSha256 = cssSha256;
  value.receipt.packageSha256 = sha256Hex([
    P17_NEUTRAL_WEB_EXPORT_VERSION,
    identity.irVersion,
    identity.sha256,
    htmlSha256,
    cssSha256,
  ].join('\n'));
}

describe('P17 neutral Web static package validation gate', () => {
  it('validates the exact deterministic package without granting browser or production authority', () => {
    const source = fixture();
    const packageValue = generated(source);
    const receipt = validateP17NeutralWebExportPackage({ source, package: packageValue });

    expect(receipt.validationVersion).toBe(P17_NEUTRAL_WEB_PACKAGE_VALIDATION_VERSION);
    expect(receipt.status).toBe('PACKAGE_VALIDATED');
    expect(receipt.valid).toBe(true);
    expect(receipt.issues).toEqual([]);
    expect(receipt.sourceIrSha256).toBe(identifyP17NeutralWebDocument(source).sha256);
    expect(receipt.htmlSha256).toBe(packageValue.receipt.htmlSha256);
    expect(receipt.cssSha256).toBe(packageValue.receipt.cssSha256);
    expect(receipt.packageSha256).toBe(packageValue.receipt.packageSha256);
    expect(receipt.acceptanceAuthority).toBe(false);
    expect(receipt.javascriptExecution).toBe(false);
    expect(receipt.networkAccessRequired).toBe(false);
    expect(receipt.browserValidationStatus).toBe('NOT_RUN');
    expect(receipt.reconstructionStatus).toBe('NOT_RUN');
    expect(receipt.productionAcceptance).toBe(false);
  });

  it('retains exact REVIEW evidence while keeping package validation non-authorizing', () => {
    const source = fixture();
    source.nodes.push({
      kind: 'review',
      nodeId: 'review-1',
      provenance: provenance('9:9'),
      reasonCode: 'UNSUPPORTED_INTERACTION',
      detail: 'Interactive carousel remains outside the static profile.',
    });
    const packageValue = generated(source);
    const receipt = validateP17NeutralWebExportPackage({ source, package: packageValue });

    expect(receipt.valid).toBe(true);
    expect(receipt.status).toBe('REVIEW_REQUIRED');
    expect(receipt.reviewIssueCount).toBe(1);
    expect(receipt.browserValidationStatus).toBe('NOT_RUN');
    expect(receipt.productionAcceptance).toBe(false);
  });

  it('rejects HTML tampering even when an attacker recomputes all visible hashes', () => {
    const source = fixture();
    const packageValue = clonePackage(generated(source));
    packageValue.html = packageValue.html?.replace(
      '</body>',
      '<script>alert(1)</script></body>',
    ) ?? null;
    rehash(source, packageValue);

    const receipt = validateP17NeutralWebExportPackage({ source, package: packageValue });
    const codes = receipt.issues.map((issue) => issue.code);

    expect(receipt.valid).toBe(false);
    expect(receipt.status).toBe('REJECTED');
    expect(codes).toContain('P17_PACKAGE_HTML_BYTES_MISMATCH');
    expect(codes).toContain('P17_PACKAGE_ACTIVE_HTML_SURFACE');
  });

  it('rejects inline handlers and executable resource URLs independently of receipt hashes', () => {
    const source = fixture();
    const packageValue = clonePackage(generated(source));
    packageValue.html = packageValue.html?.replace(
      '<main class="wpb-ir-node-1">',
      '<main class="wpb-ir-node-1" onclick="alert(1)"><img src="javascript:alert(1)" alt="">',
    ) ?? null;
    rehash(source, packageValue);

    const receipt = validateP17NeutralWebExportPackage({ source, package: packageValue });
    const codes = receipt.issues.map((issue) => issue.code);

    expect(codes).toContain('P17_PACKAGE_INLINE_EVENT_HANDLER');
    expect(codes).toContain('P17_PACKAGE_EXECUTABLE_URL');
    expect(codes).toContain('P17_PACKAGE_REMOTE_RESOURCE');
    expect(receipt.productionAcceptance).toBe(false);
  });

  it('rejects CSS import/url/legacy active surfaces even with internally consistent hashes', () => {
    const source = fixture();
    const packageValue = clonePackage(generated(source));
    packageValue.css = `${packageValue.css ?? ''}\n@import "https://evil.example/x.css";\n.x{background:url(https://evil.example/x);behavior:url(x.htc);}`;
    rehash(source, packageValue);

    const receipt = validateP17NeutralWebExportPackage({ source, package: packageValue });
    const codes = receipt.issues.map((issue) => issue.code);

    expect(codes).toContain('P17_PACKAGE_CSS_BYTES_MISMATCH');
    expect(codes).toContain('P17_PACKAGE_CSS_IMPORT');
    expect(codes).toContain('P17_PACKAGE_CSS_URL');
    expect(codes).toContain('P17_PACKAGE_CSS_EXECUTABLE_SURFACE');
  });

  it('rejects authority escalation and receipt/source identity drift', () => {
    const source = fixture();
    const packageValue = clonePackage(generated(source));
    (packageValue as unknown as Record<string, unknown>).javascriptExecution = true;
    packageValue.receipt.irSha256 = '0'.repeat(64);

    const receipt = validateP17NeutralWebExportPackage({ source, package: packageValue });
    const codes = receipt.issues.map((issue) => issue.code);

    expect(codes).toContain('P17_PACKAGE_AUTHORITY_INVALID');
    expect(codes).toContain('P17_PACKAGE_IR_IDENTITY_MISMATCH');
    expect(receipt.valid).toBe(false);
  });

  it('fails closed on invalid source/package shapes and serializes sanitized receipts deterministically', () => {
    const invalidSource = validateP17NeutralWebExportPackage({
      source: { schemaVersion: 1 },
      package: {},
    });
    expect(invalidSource.status).toBe('REJECTED');
    expect(invalidSource.issues.map((issue) => issue.code)).toContain('P17_PACKAGE_SOURCE_INVALID');

    const source = fixture();
    const invalidPackage = validateP17NeutralWebExportPackage({ source, package: null });
    expect(invalidPackage.status).toBe('REJECTED');
    expect(invalidPackage.issues.map((issue) => issue.code)).toContain('P17_PACKAGE_NOT_OBJECT');

    const valid = validateP17NeutralWebExportPackage({ source, package: generated(source) });
    const first = serializeP17NeutralWebPackageValidationReceipt(valid);
    const second = serializeP17NeutralWebPackageValidationReceipt(valid);
    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    expect(first).not.toContain('Safe package');
    expect(first).not.toContain('https://example.com/docs');
  });
});
