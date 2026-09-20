import { describe, expect, it } from 'vitest';
import {
  P17_STATIC_WEB_CONTRACT_VERSION,
  P17_STATIC_WEB_MAX_DEPTH,
  P17_STATIC_WEB_MAX_NODES,
  P17_STATIC_WEB_MAX_OUTPUT_BYTES,
  P17_STATIC_WEB_MAX_TEXT_BYTES,
  buildP17StaticWebPackage,
  validateP17StaticWebDocument,
} from '../src/targets/web/static-web-export';
import type {
  P17StaticWebDocumentV1,
  P17StaticWebNode,
} from '../src/targets/web/static-web-export';

function fixture(): P17StaticWebDocumentV1 {
  return {
    schemaVersion: 1,
    contractVersion: P17_STATIC_WEB_CONTRACT_VERSION,
    title: 'Static export',
    language: 'en',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'frame:1',
        tag: 'main',
        direction: 'column',
        gapPx: 24,
        paddingPx: { top: 32, right: 24, bottom: 32, left: 24 },
        alignItems: 'stretch',
        justifyContent: 'start',
        backgroundColorHex: '#FFFFFF',
        cornerRadiusPx: 16,
        children: [
          {
            kind: 'heading',
            sourceNodeId: 'heading:1',
            level: 1,
            text: 'Hello world',
            align: 'start',
          },
          {
            kind: 'text',
            sourceNodeId: 'text:1',
            tag: 'p',
            text: 'Deterministic static output.',
          },
          {
            kind: 'link',
            sourceNodeId: 'link:1',
            role: 'button',
            text: 'Open docs',
            href: 'https://example.com/docs',
            openInNewTab: true,
            nofollow: true,
            align: 'start',
          },
          {
            kind: 'image',
            sourceNodeId: 'image:1',
            assetPath: 'assets/hero.png',
            alt: 'Hero image',
            width: 1200,
            height: 800,
          },
        ],
      },
    ],
  };
}

function textNode(sourceNodeId: string, text = 'x'): P17StaticWebNode {
  return {
    kind: 'text',
    sourceNodeId,
    tag: 'p',
    text,
  };
}

describe('P17 deterministic static web export', () => {
  it('builds semantic HTML/CSS without JavaScript, network requirements or authority', () => {
    const result = buildP17StaticWebPackage(fixture());

    expect(result.status).toBe('READY_FOR_BROWSER_VALIDATION');
    expect(result.validation.valid).toBe(true);
    expect(result.reviewIssues).toEqual([]);
    expect(result.javascript).toBeNull();
    expect(result.javascriptExecution).toBe(false);
    expect(result.networkAccessRequired).toBe(false);
    expect(result.browserValidationStatus).toBe('NOT_RUN');
    expect(result.reconstructionStatus).toBe('NOT_RUN');
    expect(result.productionAcceptance).toBe(false);

    expect(result.html).toContain('<main class="wpb-node-1">');
    expect(result.html).toContain('<h1 class="wpb-node-2">Hello world</h1>');
    expect(result.html).toContain('href="https://example.com/docs"');
    expect(result.html).toContain('target="_blank"');
    expect(result.html).toContain('rel="noopener noreferrer nofollow"');
    expect(result.html).toContain('src="./assets/hero.png"');
    expect(result.html).toContain('<link rel="stylesheet" href="./styles.css">');
    expect(result.html).not.toContain('<script');
    expect(result.html).not.toContain('javascript:');
    expect(result.css).toContain('.wpb-node-1{display:flex;flex-direction:column;');
    expect(result.css).toContain('background-color:#FFFFFF;');
    expect(result.css).not.toContain('@import');
    expect(result.receipt.sourceSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.receipt.htmlSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.receipt.cssSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(result.receipt.packageSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(Buffer.byteLength(result.html ?? '', 'utf8')).toBeLessThanOrEqual(P17_STATIC_WEB_MAX_OUTPUT_BYTES);
    expect(Buffer.byteLength(result.css ?? '', 'utf8')).toBeLessThanOrEqual(P17_STATIC_WEB_MAX_OUTPUT_BYTES);
  });

  it('is byte-deterministic and canonicalizes source identity across object key order', () => {
    const first = buildP17StaticWebPackage(fixture());

    const reordered = {
      nodes: fixture().nodes,
      language: 'en',
      title: 'Static export',
      contractVersion: P17_STATIC_WEB_CONTRACT_VERSION,
      schemaVersion: 1,
    } as P17StaticWebDocumentV1;
    const second = buildP17StaticWebPackage(reordered);

    expect(first.html).toBe(second.html);
    expect(first.css).toBe(second.css);
    expect(first.receipt).toEqual(second.receipt);
  });

  it('escapes title, text, review diagnostics and link attributes as inert HTML', () => {
    const value = fixture();
    value.title = '</title><script>alert(1)</script>';
    value.nodes = [
      {
        kind: 'text',
        sourceNodeId: 'text:escape',
        tag: 'p',
        text: '<img src=x onerror="alert(1)"> & "quoted"',
      },
      {
        kind: 'link',
        sourceNodeId: 'link:escape',
        role: 'link',
        text: '<click>',
        href: 'https://example.com/?a=1&b=2',
      },
      {
        kind: 'review',
        sourceNodeId: 'review:escape',
        reasonCode: 'UNSUPPORTED_WIDGET',
        detail: '<script>not active</script>',
      },
    ];

    const result = buildP17StaticWebPackage(value);

    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.html).toContain('&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(result.html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &quot;quoted&quot;');
    expect(result.html).toContain('href="https://example.com/?a=1&amp;b=2"');
    expect(result.html).toContain('&lt;script&gt;not active&lt;/script&gt;');
    expect(result.html).not.toContain('<script>');
    expect(result.reviewIssues).toEqual([
      {
        sourceNodeId: 'review:escape',
        reasonCode: 'UNSUPPORTED_WIDGET',
        detail: '<script>not active</script>',
      },
    ]);
  });

  it('rejects executable, protocol-relative and control-character link targets', () => {
    for (const href of [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      '//evil.example/x',
      'https://example.com/\nInjected',
    ]) {
      const value = fixture();
      value.nodes = [{
        kind: 'link',
        sourceNodeId: 'bad-link',
        role: 'link',
        text: 'Unsafe',
        href,
      }];

      const result = buildP17StaticWebPackage(value);
      expect(result.status, href).toBe('REJECTED_INVALID_INPUT');
      expect(result.validation.issues.map((issue) => issue.code), href).toContain('P17_URL_INVALID');
      expect(result.html, href).toBeNull();
      expect(result.css, href).toBeNull();
    }
  });

  it('allows bounded root-relative, fragment, mailto and tel links without executing them', () => {
    const value = fixture();
    value.nodes = [
      { kind: 'link', sourceNodeId: 'r', role: 'link', text: 'Root', href: '/about' },
      { kind: 'link', sourceNodeId: 'f', role: 'link', text: 'Fragment', href: '#top' },
      { kind: 'link', sourceNodeId: 'm', role: 'link', text: 'Mail', href: 'mailto:hello@example.com' },
      { kind: 'link', sourceNodeId: 't', role: 'link', text: 'Phone', href: 'tel:+1234567890' },
    ];

    const result = buildP17StaticWebPackage(value);
    expect(result.status).toBe('READY_FOR_BROWSER_VALIDATION');
    expect(result.validation.valid).toBe(true);
    expect(result.javascriptExecution).toBe(false);
  });

  it('requires images to use local packaged assets and rejects traversal or URL syntax', () => {
    for (const assetPath of [
      '../secret.png',
      'assets/../secret.png',
      'assets/%2e%2e/secret.png',
      'https://cdn.example.com/hero.png',
      '/absolute/hero.png',
      'assets\\hero.png',
      'assets/hero.png?x=1',
    ]) {
      const value = fixture();
      value.nodes = [{
        kind: 'image',
        sourceNodeId: 'bad-image',
        assetPath,
        alt: 'Unsafe',
      }];

      const result = buildP17StaticWebPackage(value);
      expect(result.status, assetPath).toBe('REJECTED_INVALID_INPUT');
      expect(result.validation.issues.map((issue) => issue.code), assetPath).toContain('P17_ASSET_PATH_INVALID');
      expect(result.html).toBeNull();
    }
  });

  it('rejects unknown executable-style node keys instead of forwarding them into output', () => {
    const value = fixture() as unknown as Record<string, unknown>;
    value.nodes = [{
      kind: 'text',
      sourceNodeId: 'unknown-key',
      tag: 'p',
      text: 'Hello',
      onclick: 'alert(1)',
    }];

    const result = buildP17StaticWebPackage(value);
    expect(result.status).toBe('REJECTED_INVALID_INPUT');
    expect(result.validation.issues.map((issue) => issue.code)).toContain('P17_NODE_KEYS_UNSUPPORTED');
    expect(result.html).toBeNull();
  });

  it('rejects duplicate source identities before generation', () => {
    const value = fixture();
    value.nodes = [
      textNode('duplicate', 'First'),
      textNode('duplicate', 'Second'),
    ];

    const validation = validateP17StaticWebDocument(value);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_DUPLICATE_SOURCE_ID');
  });

  it('fails closed beyond the bounded nesting depth', () => {
    let node: P17StaticWebNode = textNode('leaf');
    for (let index = 0; index < P17_STATIC_WEB_MAX_DEPTH; index += 1) {
      node = {
        kind: 'container',
        sourceNodeId: `container:${index}`,
        tag: 'div',
        direction: 'column',
        children: [node],
      };
    }

    const value = fixture();
    value.nodes = [node];

    const validation = validateP17StaticWebDocument(value);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_DEPTH_LIMIT_EXCEEDED');
  });

  it('fails closed beyond the bounded node count', () => {
    const value = fixture();
    value.nodes = Array.from(
      { length: P17_STATIC_WEB_MAX_NODES + 1 },
      (_, index) => textNode(`node:${index}`),
    );

    const validation = validateP17StaticWebDocument(value);
    expect(validation.valid).toBe(false);
    expect(validation.nodeCount).toBe(P17_STATIC_WEB_MAX_NODES);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_NODE_LIMIT_EXCEEDED');
  });

  it('fails closed when aggregate UTF-8 text exceeds the bounded budget', () => {
    const chunk = 'a'.repeat(20_000);
    const count = Math.ceil(P17_STATIC_WEB_MAX_TEXT_BYTES / chunk.length) + 1;
    const value = fixture();
    value.nodes = Array.from({ length: count }, (_, index) => textNode(`text:${index}`, chunk));

    const validation = validateP17StaticWebDocument(value);
    expect(validation.valid).toBe(false);
    expect(validation.textBytes).toBeGreaterThan(P17_STATIC_WEB_MAX_TEXT_BYTES);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_TEXT_BUDGET_EXCEEDED');
  });

  it('keeps explicit unsupported content visible as REVIEW instead of silently dropping it', () => {
    const value = fixture();
    value.nodes = [
      {
        kind: 'review',
        sourceNodeId: 'unsupported:1',
        reasonCode: 'INTERACTION_REQUIRES_SCRIPT',
        detail: 'Carousel interaction is not represented by the static-only adapter.',
      },
    ];

    const result = buildP17StaticWebPackage(value);
    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.validation.valid).toBe(true);
    expect(result.reviewIssues).toHaveLength(1);
    expect(result.html).toContain('data-wpb-review="INTERACTION_REQUIRES_SCRIPT"');
    expect(result.javascript).toBeNull();
    expect(result.javascriptExecution).toBe(false);
    expect(result.productionAcceptance).toBe(false);
  });
});
