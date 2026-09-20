import { describe, expect, it } from 'vitest';
import {
  P17_NEUTRAL_WEB_IR_VERSION,
} from '../src/targets/web/neutral-web-ir';
import type {
  P17NeutralWebDocumentV1,
} from '../src/targets/web/neutral-web-ir';
import {
  P17_NEUTRAL_WEB_STATIC_EXPORT_VERSION,
  buildP17NeutralWebStaticPackage,
} from '../src/targets/web/neutral-web-static-export';

function provenance(sourceRef: string) {
  return { source: 'FIGMA' as const, sourceRef };
}

function fixture(): P17NeutralWebDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P17_NEUTRAL_WEB_IR_VERSION,
    title: 'Shared IR export',
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
          paddingPx: { top: 24, right: 24, bottom: 24, left: 24 },
          backgroundColorHex: '#FFFFFF',
        },
        children: [
          {
            kind: 'text',
            nodeId: 'heading',
            provenance: provenance('1:2'),
            semantic: 'heading',
            headingLevel: 1,
            text: 'Hello',
          },
          {
            kind: 'link',
            nodeId: 'link',
            provenance: provenance('1:3'),
            role: 'button',
            text: 'Open docs',
            href: 'https://example.com/docs',
            openInNewTab: true,
          },
          {
            kind: 'image',
            nodeId: 'image',
            provenance: provenance('1:4'),
            assetPath: 'assets/hero.png',
            alt: 'Hero',
            widthPx: 1200,
            heightPx: 800,
          },
        ],
      },
    ],
  };
}

describe('P17 neutral Web IR static export', () => {
  it('generates semantic HTML/CSS from the shared IR with no JavaScript authority', () => {
    const result = buildP17NeutralWebStaticPackage(fixture());

    expect(result.exportVersion).toBe(P17_NEUTRAL_WEB_STATIC_EXPORT_VERSION);
    expect(result.status).toBe('READY_FOR_BROWSER_VALIDATION');
    expect(result.irValidation.valid).toBe(true);
    expect(result.irIdentity?.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.javascript).toBeNull();
    expect(result.javascriptExecution).toBe(false);
    expect(result.networkAccessRequired).toBe(false);
    expect(result.browserValidationStatus).toBe('NOT_RUN');
    expect(result.productionAcceptance).toBe(false);

    expect(result.html).toContain('<main class="p17-node-1">');
    expect(result.html).toContain('<h1 class="p17-node-2">Hello</h1>');
    expect(result.html).toContain('src="./assets/hero.png"');
    expect(result.html).toContain('target="_blank"');
    expect(result.html).toContain('rel="noopener noreferrer"');
    expect(result.html).not.toContain('<script');
    expect(result.css).toContain('.p17-node-1{display:flex;flex-direction:column;');
    expect(result.css).toContain('gap:24px;');
    expect(result.css).toContain('flex-wrap:nowrap;');
  });

  it('supports neutral flow layout without inventing flex or grid behavior', () => {
    const value = fixture();
    value.nodes = [{
      kind: 'container',
      nodeId: 'flow',
      provenance: provenance('2:1'),
      semanticTag: 'section',
      layout: { mode: 'flow' },
      style: { backgroundColorHex: '#FFFFFF' },
      children: [{
        kind: 'text',
        nodeId: 'paragraph',
        provenance: provenance('2:2'),
        semantic: 'paragraph',
        text: 'Flow text',
      }],
    }];

    const result = buildP17NeutralWebStaticPackage(value);
    expect(result.status).toBe('READY_FOR_BROWSER_VALIDATION');
    expect(result.html).toContain('<section class="p17-node-1">');
    expect(result.css).toContain('.p17-node-1{background-color:#FFFFFF;}');
    expect(result.css).not.toContain('.p17-node-1{display:flex;');
    expect(result.css).not.toContain('.p17-node-1{display:grid;');
  });

  it('supports bounded neutral grid layout directly from IR facts', () => {
    const value = fixture();
    value.nodes = [{
      kind: 'container',
      nodeId: 'grid',
      provenance: provenance('3:1'),
      semanticTag: 'section',
      layout: { mode: 'grid', columns: 3, gapPx: 16 },
      children: [
        {
          kind: 'text',
          nodeId: 'a',
          provenance: provenance('3:2'),
          semantic: 'span',
          text: 'A',
        },
        {
          kind: 'text',
          nodeId: 'b',
          provenance: provenance('3:3'),
          semantic: 'span',
          text: 'B',
        },
      ],
    }];

    const result = buildP17NeutralWebStaticPackage(value);
    expect(result.status).toBe('READY_FOR_BROWSER_VALIDATION');
    expect(result.css).toContain('display:grid;');
    expect(result.css).toContain('grid-template-columns:repeat(3,minmax(0,1fr));');
    expect(result.css).toContain('gap:16px;');
  });

  it('escapes all active title, text, link and review output', () => {
    const value = fixture();
    value.title = '</title><x>';
    value.nodes = [
      {
        kind: 'text',
        nodeId: 'text',
        provenance: provenance('4:1'),
        semantic: 'paragraph',
        text: '<b>"quoted" & text</b>',
      },
      {
        kind: 'link',
        nodeId: 'link-escape',
        provenance: provenance('4:2'),
        role: 'link',
        text: '<open>',
        href: 'https://example.com/?a=1&b=2',
      },
      {
        kind: 'review',
        nodeId: 'review',
        provenance: provenance('4:3'),
        reasonCode: 'NEEDS_REVIEW',
        detail: '<unsafe-looking text>',
      },
    ];

    const result = buildP17NeutralWebStaticPackage(value);
    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.html).toContain('&lt;/title&gt;&lt;x&gt;');
    expect(result.html).toContain('&lt;b&gt;&quot;quoted&quot; &amp; text&lt;/b&gt;');
    expect(result.html).toContain('href="https://example.com/?a=1&amp;b=2"');
    expect(result.html).toContain('&lt;unsafe-looking text&gt;');
  });

  it('keeps explicit REVIEW nodes visible and non-authorizing', () => {
    const value = fixture();
    value.nodes = [{
      kind: 'review',
      nodeId: 'unsupported',
      provenance: provenance('5:1'),
      reasonCode: 'UNSUPPORTED_INTERACTION',
      detail: 'Interaction requires a later accepted recipe.',
    }];

    const result = buildP17NeutralWebStaticPackage(value);
    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.reviewIssues).toEqual([{
      nodeId: 'unsupported',
      reasonCode: 'UNSUPPORTED_INTERACTION',
      detail: 'Interaction requires a later accepted recipe.',
    }]);
    expect(result.html).toContain('data-p17-review="UNSUPPORTED_INTERACTION"');
    expect(result.javascriptExecution).toBe(false);
    expect(result.productionAcceptance).toBe(false);
  });

  it('rejects invalid neutral IR before generating active files', () => {
    const value = fixture() as unknown as Record<string, unknown>;
    value.nodes = [{
      kind: 'link',
      nodeId: 'bad',
      provenance: provenance('6:1'),
      role: 'link',
      text: 'Bad',
      href: 'javascript:noop()',
    }];

    const result = buildP17NeutralWebStaticPackage(value);
    expect(result.status).toBe('REJECTED_INVALID_IR');
    expect(result.irValidation.valid).toBe(false);
    expect(result.html).toBeNull();
    expect(result.css).toBeNull();
    expect(result.irIdentity).toBeNull();
    expect(result.receipt.packageSha256).toBeNull();
  });

  it('is byte-deterministic for the same neutral IR identity', () => {
    const first = buildP17NeutralWebStaticPackage(fixture());
    const second = buildP17NeutralWebStaticPackage(fixture());

    expect(first.html).toBe(second.html);
    expect(first.css).toBe(second.css);
    expect(first.irIdentity).toEqual(second.irIdentity);
    expect(first.receipt).toEqual(second.receipt);
  });

  it('binds package receipt to the neutral IR identity', () => {
    const firstInput = fixture();
    const secondInput = fixture();
    const text = secondInput.nodes[0];
    if (text?.kind === 'container') {
      const heading = text.children[0];
      if (heading?.kind === 'text') heading.text = 'Changed';
    }

    const first = buildP17NeutralWebStaticPackage(firstInput);
    const second = buildP17NeutralWebStaticPackage(secondInput);

    expect(first.receipt.irSha256).not.toBe(second.receipt.irSha256);
    expect(first.receipt.htmlSha256).not.toBe(second.receipt.htmlSha256);
    expect(first.receipt.packageSha256).not.toBe(second.receipt.packageSha256);
  });

  it('uses deterministic traversal class names rather than source identifiers', () => {
    const value = fixture();
    const result = buildP17NeutralWebStaticPackage(value);

    expect(result.html).toContain('p17-node-1');
    expect(result.html).toContain('p17-node-2');
    expect(result.html).not.toContain('1:1');
    expect(result.html).not.toContain('1:2');
    expect(result.css).not.toContain('1:1');
  });

  it('does not embed source provenance or Figma identifiers into generated files', () => {
    const value = fixture();
    value.nodes[0]!.provenance.sourceRef = 'private-source-reference';

    const result = buildP17NeutralWebStaticPackage(value);
    expect(result.html).not.toContain('private-source-reference');
    expect(result.css).not.toContain('private-source-reference');
    expect(JSON.stringify(result.reviewIssues)).not.toContain('private-source-reference');
  });
});
