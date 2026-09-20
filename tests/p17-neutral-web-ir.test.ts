import { describe, expect, it } from 'vitest';
import {
  P17_NEUTRAL_WEB_IR_VERSION,
  P17_NEUTRAL_WEB_MAX_DEPTH,
  P17_NEUTRAL_WEB_MAX_NODES,
  P17_NEUTRAL_WEB_MAX_TEXT_BYTES,
  identifyP17NeutralWebDocument,
  serializeP17NeutralWebDocument,
  validateP17NeutralWebDocument,
} from '../src/targets/web/neutral-web-ir';
import type {
  P17NeutralWebDocumentV1,
  P17NeutralWebNode,
} from '../src/targets/web/neutral-web-ir';

function provenance(sourceRef: string) {
  return {
    source: 'FIGMA' as const,
    sourceRef,
  };
}

function fixture(): P17NeutralWebDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P17_NEUTRAL_WEB_IR_VERSION,
    title: 'Neutral page',
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
        },
        style: {
          paddingPx: { top: 32, right: 24, bottom: 32, left: 24 },
          backgroundColorHex: '#FFFFFF',
          cornerRadiusPx: 16,
        },
        children: [
          {
            kind: 'text',
            nodeId: 'heading',
            provenance: provenance('1:2'),
            semantic: 'heading',
            headingLevel: 1,
            text: 'Hello',
            style: { colorHex: '#111111', textAlign: 'start' },
          },
          {
            kind: 'link',
            nodeId: 'link',
            provenance: provenance('1:3'),
            role: 'button',
            text: 'Open',
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

function textNode(nodeId: string, text = 'x'): P17NeutralWebNode {
  return {
    kind: 'text',
    nodeId,
    provenance: provenance(nodeId),
    semantic: 'paragraph',
    text,
  };
}

describe('P17 neutral Web IR', () => {
  it('validates the bounded target-neutral model and returns deterministic identity', () => {
    const document = fixture();
    const validation = validateP17NeutralWebDocument(document);
    const identity = identifyP17NeutralWebDocument(document);

    expect(validation.valid).toBe(true);
    expect(validation.nodeCount).toBe(4);
    expect(validation.reviewNodeCount).toBe(0);
    expect(identity.irVersion).toBe(P17_NEUTRAL_WEB_IR_VERSION);
    expect(identity.nodeCount).toBe(4);
    expect(identity.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('serializes byte-identically independent of input object key insertion order', () => {
    const first = fixture();
    const second = {
      direction: 'DESIGN_TO_WEB',
      nodes: fixture().nodes,
      title: 'Neutral page',
      schemaVersion: 1,
      language: 'en',
      irVersion: P17_NEUTRAL_WEB_IR_VERSION,
    } as P17NeutralWebDocumentV1;

    expect(serializeP17NeutralWebDocument(first)).toBe(serializeP17NeutralWebDocument(second));
    expect(identifyP17NeutralWebDocument(first)).toEqual(identifyP17NeutralWebDocument(second));
  });

  it('supports DOM provenance for future static import without granting runtime authority', () => {
    const value = fixture();
    value.direction = 'WEB_TO_DESIGN';
    value.nodes = [{
      kind: 'text',
      nodeId: 'dom-text',
      provenance: { source: 'DOM', sourceRef: 'main > p:nth-child(1)' },
      semantic: 'paragraph',
      text: 'Imported static text',
    }];

    const validation = validateP17NeutralWebDocument(value);
    expect(validation.valid).toBe(true);
    expect(serializeP17NeutralWebDocument(value)).not.toContain('productionAcceptance');
    expect(serializeP17NeutralWebDocument(value)).not.toContain('javascript');
  });

  it('keeps unsupported/lossy content explicit as review nodes', () => {
    const value = fixture();
    value.nodes = [{
      kind: 'review',
      nodeId: 'review-1',
      provenance: provenance('9:9'),
      reasonCode: 'UNSUPPORTED_INTERACTION',
      detail: 'Interaction is outside the static profile.',
    }];

    const validation = validateP17NeutralWebDocument(value);
    expect(validation.valid).toBe(true);
    expect(validation.reviewNodeCount).toBe(1);
    expect(identifyP17NeutralWebDocument(value).reviewNodeCount).toBe(1);
  });

  it('rejects target-specific or executable fields through exact-key validation', () => {
    const value = fixture() as unknown as Record<string, unknown>;
    value.nodes = [{
      kind: 'text',
      nodeId: 'unsafe',
      provenance: provenance('1:9'),
      semantic: 'paragraph',
      text: 'Hello',
      onclick: 'not-allowed',
      elementorWidgetType: 'heading',
    }];

    const validation = validateP17NeutralWebDocument(value);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_WEB_IR_NODE_KEYS_UNSUPPORTED');
  });

  it('rejects unsafe link schemes and protocol-relative targets', () => {
    for (const href of ['javascript:noop()', 'data:text/html,x', '//remote.example/x']) {
      const value = fixture();
      value.nodes = [{
        kind: 'link',
        nodeId: 'bad-link',
        provenance: provenance('2:1'),
        role: 'link',
        text: 'Bad',
        href,
      }];

      const validation = validateP17NeutralWebDocument(value);
      expect(validation.valid, href).toBe(false);
      expect(validation.issues.map((issue) => issue.code), href).toContain('P17_WEB_IR_URL_INVALID');
    }
  });

  it('allows safe absolute, root-relative and fragment links', () => {
    for (const href of ['https://example.com/x', 'mailto:hello@example.com', 'tel:+1234', '/about', '#top']) {
      const value = fixture();
      value.nodes = [{
        kind: 'link',
        nodeId: 'safe-link',
        provenance: provenance('2:2'),
        role: 'link',
        text: 'Safe',
        href,
      }];

      expect(validateP17NeutralWebDocument(value).valid, href).toBe(true);
    }
  });

  it('rejects asset traversal, remote asset URLs and encoded path ambiguity', () => {
    for (const assetPath of ['../hero.png', 'assets/../hero.png', 'https://example.com/hero.png', 'assets/%2e%2e/hero.png']) {
      const value = fixture();
      value.nodes = [{
        kind: 'image',
        nodeId: 'bad-image',
        provenance: provenance('3:1'),
        assetPath,
        alt: '',
      }];

      const validation = validateP17NeutralWebDocument(value);
      expect(validation.valid, assetPath).toBe(false);
      expect(validation.issues.map((issue) => issue.code), assetPath).toContain('P17_WEB_IR_ASSET_PATH_INVALID');
    }
  });

  it('rejects duplicate node identity', () => {
    const value = fixture();
    value.nodes = [textNode('same'), textNode('same')];

    const validation = validateP17NeutralWebDocument(value);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_WEB_IR_DUPLICATE_NODE_ID');
  });

  it('fails closed beyond the bounded nesting depth', () => {
    let node: P17NeutralWebNode = textNode('leaf');
    for (let index = 0; index < P17_NEUTRAL_WEB_MAX_DEPTH; index += 1) {
      node = {
        kind: 'container',
        nodeId: `container-${index}`,
        provenance: provenance(`frame-${index}`),
        semanticTag: 'div',
        layout: { mode: 'flow' },
        children: [node],
      };
    }

    const value = fixture();
    value.nodes = [node];
    const validation = validateP17NeutralWebDocument(value);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_WEB_IR_DEPTH_LIMIT_EXCEEDED');
  });

  it('fails closed beyond the bounded node count', () => {
    const value = fixture();
    value.nodes = Array.from(
      { length: P17_NEUTRAL_WEB_MAX_NODES + 1 },
      (_, index) => textNode(`node-${index}`),
    );

    const validation = validateP17NeutralWebDocument(value);
    expect(validation.valid).toBe(false);
    expect(validation.nodeCount).toBe(P17_NEUTRAL_WEB_MAX_NODES);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_WEB_IR_NODE_LIMIT_EXCEEDED');
  });

  it('fails closed when aggregate text exceeds the bounded UTF-8 budget', () => {
    const chunk = 'a'.repeat(20_000);
    const count = Math.ceil(P17_NEUTRAL_WEB_MAX_TEXT_BYTES / chunk.length) + 1;
    const value = fixture();
    value.nodes = Array.from(
      { length: count },
      (_, index) => textNode(`text-${index}`, chunk),
    );

    const validation = validateP17NeutralWebDocument(value);
    expect(validation.valid).toBe(false);
    expect(validation.textBytes).toBeGreaterThan(P17_NEUTRAL_WEB_MAX_TEXT_BYTES);
    expect(validation.issues.map((issue) => issue.code)).toContain('P17_WEB_IR_TEXT_BUDGET_EXCEEDED');
  });
});
