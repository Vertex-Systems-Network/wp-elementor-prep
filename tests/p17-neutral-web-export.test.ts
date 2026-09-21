import { describe, expect, it } from 'vitest';
import {
  P17_NEUTRAL_WEB_EXPORT_MAX_OUTPUT_BYTES,
  P17_NEUTRAL_WEB_EXPORT_VERSION,
  buildP17NeutralWebExportPackage,
} from '../src/targets/web/neutral-web-export';
import {
  P17_NEUTRAL_WEB_IR_VERSION,
  identifyP17NeutralWebDocument,
  type P17NeutralWebDocumentV1,
} from '../src/targets/web/neutral-web-ir';

function provenance(sourceRef: string) {
  return { source: 'FIGMA' as const, sourceRef };
}

function fixture(): P17NeutralWebDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P17_NEUTRAL_WEB_IR_VERSION,
    title: 'Neutral static export',
    language: 'en',
    direction: 'DESIGN_TO_WEB',
    nodes: [
      {
        kind: 'container',
        nodeId: 'root',
        provenance: provenance('1:1'),
        semanticTag: 'main',
        layout: {
          mode: 'flex',
          direction: 'column',
          gapPx: 24,
          alignItems: 'stretch',
          justifyContent: 'start',
          wrap: false,
        },
        style: {
          paddingPx: { top: 32, right: 24, bottom: 32, left: 24 },
          backgroundColorHex: '#FFFFFF',
          colorHex: '#111111',
          cornerRadiusPx: 16,
        },
        children: [
          {
            kind: 'text',
            nodeId: 'heading',
            provenance: provenance('1:2'),
            semantic: 'heading',
            headingLevel: 1,
            text: 'Hello world',
            style: { textAlign: 'start' },
          },
          {
            kind: 'container',
            nodeId: 'grid',
            provenance: provenance('1:3'),
            semanticTag: 'section',
            layout: { mode: 'grid', columns: 2, gapPx: 12 },
            children: [
              {
                kind: 'text',
                nodeId: 'grid-a',
                provenance: provenance('1:4'),
                semantic: 'paragraph',
                text: 'Alpha',
              },
              {
                kind: 'text',
                nodeId: 'grid-b',
                provenance: provenance('1:5'),
                semantic: 'paragraph',
                text: 'Beta',
              },
            ],
          },
          {
            kind: 'container',
            nodeId: 'flow',
            provenance: provenance('1:6'),
            semanticTag: 'section',
            layout: { mode: 'flow' },
            children: [
              {
                kind: 'link',
                nodeId: 'link',
                provenance: provenance('1:7'),
                role: 'button',
                text: 'Open docs',
                href: 'https://example.com/docs?a=1&b=2',
                openInNewTab: true,
                nofollow: true,
              },
              {
                kind: 'image',
                nodeId: 'image',
                provenance: provenance('1:8'),
                assetPath: 'assets/hero.png',
                alt: 'Hero image',
                widthPx: 1200,
                heightPx: 800,
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('P17 neutral Web IR static export', () => {
  it('generates deterministic semantic HTML/CSS for flow, flex and bounded grid layouts', () => {
    const document = fixture();
    const result = buildP17NeutralWebExportPackage(document);

    expect(result.exportVersion).toBe(P17_NEUTRAL_WEB_EXPORT_VERSION);
    expect(result.status).toBe('READY_FOR_BROWSER_VALIDATION');
    expect(result.validation.valid).toBe(true);
    expect(result.reviewIssues).toEqual([]);
    expect(result.javascript).toBeNull();
    expect(result.javascriptExecution).toBe(false);
    expect(result.networkAccessRequired).toBe(false);
    expect(result.browserValidationStatus).toBe('NOT_RUN');
    expect(result.productionAcceptance).toBe(false);

    expect(result.html).toContain('<main class="wpb-ir-node-1">');
    expect(result.html).toContain('<h1 class="wpb-ir-node-2">Hello world</h1>');
    expect(result.html).toContain('<section class="wpb-ir-node-3">');
    expect(result.html).toContain('href="https://example.com/docs?a=1&amp;b=2"');
    expect(result.html).toContain('target="_blank"');
    expect(result.html).toContain('rel="noopener noreferrer nofollow"');
    expect(result.html).toContain('src="./assets/hero.png"');
    expect(result.html).not.toContain('<script');

    expect(result.css).toContain('.wpb-ir-node-1{display:flex;flex-direction:column;gap:24px;');
    expect(result.css).toContain('padding:32px 24px 32px 24px;');
    expect(result.css).toContain('background-color:#FFFFFF;');
    expect(result.css).toContain('.wpb-ir-node-3{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}');
    expect(result.css).toContain('display:block;');
    expect(result.css).not.toContain('@import');

    const identity = identifyP17NeutralWebDocument(document);
    expect(result.receipt.irVersion).toBe(P17_NEUTRAL_WEB_IR_VERSION);
    expect(result.receipt.irSha256).toBe(identity.sha256);
    expect(result.receipt.htmlSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.receipt.cssSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.receipt.packageSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(Buffer.byteLength(result.html ?? '', 'utf8')).toBeLessThanOrEqual(P17_NEUTRAL_WEB_EXPORT_MAX_OUTPUT_BYTES);
    expect(Buffer.byteLength(result.css ?? '', 'utf8')).toBeLessThanOrEqual(P17_NEUTRAL_WEB_EXPORT_MAX_OUTPUT_BYTES);
  });

  it('is byte-deterministic and binds the package receipt to canonical neutral-IR identity', () => {
    const firstDocument = fixture();
    const secondDocument = {
      direction: 'DESIGN_TO_WEB',
      nodes: fixture().nodes,
      language: 'en',
      title: 'Neutral static export',
      irVersion: P17_NEUTRAL_WEB_IR_VERSION,
      schemaVersion: 1,
    } as P17NeutralWebDocumentV1;

    const first = buildP17NeutralWebExportPackage(firstDocument);
    const second = buildP17NeutralWebExportPackage(secondDocument);

    expect(first.html).toBe(second.html);
    expect(first.css).toBe(second.css);
    expect(first.receipt).toEqual(second.receipt);
    expect(first.receipt.irSha256).toBe(identifyP17NeutralWebDocument(firstDocument).sha256);
  });

  it('keeps explicit REVIEW nodes visible and non-authorizing', () => {
    const document = fixture();
    document.nodes = [{
      kind: 'review',
      nodeId: 'review-1',
      provenance: provenance('9:9'),
      reasonCode: 'UNSUPPORTED_INTERACTION',
      detail: 'Carousel behavior requires a separately accepted recipe.',
    }];

    const result = buildP17NeutralWebExportPackage(document);

    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.reviewIssues).toEqual([{
      nodeId: 'review-1',
      reasonCode: 'UNSUPPORTED_INTERACTION',
      detail: 'Carousel behavior requires a separately accepted recipe.',
    }]);
    expect(result.html).toContain('data-wpb-review="UNSUPPORTED_INTERACTION"');
    expect(result.javascriptExecution).toBe(false);
    expect(result.productionAcceptance).toBe(false);
  });

  it('escapes active HTML text and attributes instead of forwarding markup', () => {
    const document = fixture();
    document.title = '</title><script>alert(1)</script>';
    document.nodes = [
      {
        kind: 'text',
        nodeId: 'escape-text',
        provenance: provenance('2:1'),
        semantic: 'paragraph',
        text: '<img src=x onerror="alert(1)"> & "quoted"',
      },
      {
        kind: 'link',
        nodeId: 'escape-link',
        provenance: provenance('2:2'),
        role: 'link',
        text: '<click>',
        href: 'https://example.com/?a=1&b=2',
      },
    ];

    const result = buildP17NeutralWebExportPackage(document);

    expect(result.status).toBe('READY_FOR_BROWSER_VALIDATION');
    expect(result.html).toContain('&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(result.html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &quot;quoted&quot;');
    expect(result.html).toContain('href="https://example.com/?a=1&amp;b=2"');
    expect(result.html).not.toContain('<script>');
  });

  it('rejects unsafe links, remote assets and unknown executable-style fields before generation', () => {
    const unsafeLink = fixture();
    unsafeLink.nodes = [{
      kind: 'link',
      nodeId: 'bad-link',
      provenance: provenance('3:1'),
      role: 'link',
      text: 'Bad',
      href: 'javascript:alert(1)',
    }];
    const unsafeLinkResult = buildP17NeutralWebExportPackage(unsafeLink);
    expect(unsafeLinkResult.status).toBe('REJECTED_INVALID_IR');
    expect(unsafeLinkResult.validation.issues.map((issue) => issue.code)).toContain('P17_WEB_IR_URL_INVALID');
    expect(unsafeLinkResult.html).toBeNull();

    const remoteAsset = fixture();
    remoteAsset.nodes = [{
      kind: 'image',
      nodeId: 'bad-image',
      provenance: provenance('3:2'),
      assetPath: 'https://cdn.example.com/hero.png',
      alt: '',
    }];
    const remoteAssetResult = buildP17NeutralWebExportPackage(remoteAsset);
    expect(remoteAssetResult.status).toBe('REJECTED_INVALID_IR');
    expect(remoteAssetResult.validation.issues.map((issue) => issue.code)).toContain('P17_WEB_IR_ASSET_PATH_INVALID');
    expect(remoteAssetResult.html).toBeNull();

    const executableField = fixture() as unknown as Record<string, unknown>;
    executableField.nodes = [{
      kind: 'text',
      nodeId: 'bad-field',
      provenance: provenance('3:3'),
      semantic: 'paragraph',
      text: 'Hello',
      onclick: 'alert(1)',
    }];
    const executableFieldResult = buildP17NeutralWebExportPackage(executableField);
    expect(executableFieldResult.status).toBe('REJECTED_INVALID_IR');
    expect(executableFieldResult.validation.issues.map((issue) => issue.code)).toContain('P17_WEB_IR_NODE_KEYS_UNSUPPORTED');
    expect(executableFieldResult.html).toBeNull();
  });

  it('does not mutate the existing first-generation static web export contract', async () => {
    const legacy = await import('../src/targets/web/static-web-export');
    expect(legacy.P17_STATIC_WEB_CONTRACT_VERSION).toBe('p17-static-web-export-v1');
    expect(typeof legacy.buildP17StaticWebPackage).toBe('function');
  });
});
