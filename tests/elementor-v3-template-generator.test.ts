import { describe, expect, it } from 'vitest';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  validateP15NeutralExportDocument,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';
import {
  P15_ELEMENTOR_BUTTON_ALIGNMENT_EVIDENCE,
  P15_ELEMENTOR_V3_GENERATOR_VERSION,
  generateElementorV3TemplateCandidate,
  serializeP15ElementorV3GenerationResult,
} from '../src/targets/elementor/v3-template-generator';

function fixture(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Generated Landing Page',
    documentType: 'page',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'hero',
        direction: 'row',
        gapPx: 24,
        paddingPx: { top: 80, right: 32, bottom: 80, left: 32 },
        alignItems: 'center',
        justifyContent: 'space-between',
        children: [
          {
            kind: 'container',
            sourceNodeId: 'hero-copy',
            direction: 'column',
            gapPx: 16,
            children: [
              {
                kind: 'heading',
                sourceNodeId: 'hero-title',
                text: 'Build once. Import safely.',
                level: 'h1',
                align: 'start',
              },
              {
                kind: 'button',
                sourceNodeId: 'hero-cta',
                text: 'Start now',
                url: '/start',
                openInNewTab: false,
                nofollow: false,
                align: 'start',
              },
            ],
          },
          {
            kind: 'image',
            sourceNodeId: 'hero-image',
            url: 'https://example.com/hero.webp',
            attachmentId: 42,
          },
        ],
      },
    ],
  };
}

describe('P15 V1 neutral export IR and Elementor v3 generator', () => {
  it('generates a deterministic modern v0.4 container/widget candidate while authority remains locked', () => {
    const result = generateElementorV3TemplateCandidate(fixture());

    expect(result.generatorVersion).toBe(P15_ELEMENTOR_V3_GENERATOR_VERSION);
    expect(result.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(result.validation.valid).toBe(true);
    expect(result.reviewEntries).toEqual([]);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.importValidationStatus).toBe('NOT_RUN');
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    expect(result.candidate?.validation.widgetTypes).toEqual(['button', 'heading', 'image']);
    expect(result.candidate?.targetCompatibilityClaim).toBe(false);
    expect(result.candidate?.productionAcceptance).toBe(false);
    expect(result.candidate?.downloadEnabled).toBe(false);

    const root = result.template?.content[0];
    expect(root).toEqual(expect.objectContaining({
      elType: 'container',
      isInner: false,
      settings: expect.objectContaining({
        flex_direction: 'row',
        flex_gap: { column: '24', row: '24', isLinked: true, unit: 'px' },
        flex_align_items: 'center',
        flex_justify_content: 'space-between',
      }),
    }));
    expect(root && root.elType === 'container' ? root.settings : null).toEqual(expect.objectContaining({
      padding: { unit: 'px', top: '80', right: '32', bottom: '80', left: '32', isLinked: false },
    }));

    const nested = root?.elements[0];
    expect(nested).toEqual(expect.objectContaining({ elType: 'container', isInner: true }));
    const heading = nested?.elements[0];
    const button = nested?.elements[1];
    const image = root?.elements[1];
    expect(heading).toEqual(expect.objectContaining({
      elType: 'widget',
      widgetType: 'heading',
      settings: { title: 'Build once. Import safely.', header_size: 'h1', align: 'start' },
    }));
    expect(button).toEqual(expect.objectContaining({
      elType: 'widget',
      widgetType: 'button',
      settings: {
        text: 'Start now',
        align: 'left',
        link: { url: '/start', is_external: '', nofollow: '', custom_attributes: '' },
      },
    }));
    expect(image).toEqual(expect.objectContaining({
      elType: 'widget',
      widgetType: 'image',
      settings: { image: { id: 42, url: 'https://example.com/hero.webp' } },
    }));
  });

  it('maps neutral Button alignment into the exact Elementor 4.2.4 target vocabulary', () => {
    expect(P15_ELEMENTOR_BUTTON_ALIGNMENT_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      sourcePath: 'includes/widgets/traits/button-trait.php',
      sourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
      controlName: 'align',
      targetValues: ['left', 'center', 'right', 'justify'],
    });

    const input = fixture();
    const root = input.nodes[0];
    if (!root || root.kind !== 'container') throw new Error('fixture invariant');
    const copy = root.children[0];
    if (!copy || copy.kind !== 'container') throw new Error('fixture invariant');
    const button = copy.children[1];
    if (!button || button.kind !== 'button') throw new Error('fixture invariant');

    const start = generateElementorV3TemplateCandidate(input);
    const startButton = start.template?.content[0]?.elements[0]?.elements[1];
    expect(startButton && startButton.elType === 'widget' ? startButton.settings : null)
      .toEqual(expect.objectContaining({ align: 'left' }));

    button.align = 'center';
    const center = generateElementorV3TemplateCandidate(input);
    const centerButton = center.template?.content[0]?.elements[0]?.elements[1];
    expect(centerButton && centerButton.elType === 'widget' ? centerButton.settings : null)
      .toEqual(expect.objectContaining({ align: 'center' }));

    button.align = 'end';
    const end = generateElementorV3TemplateCandidate(input);
    const endButton = end.template?.content[0]?.elements[0]?.elements[1];
    expect(endButton && endButton.elType === 'widget' ? endButton.settings : null)
      .toEqual(expect.objectContaining({ align: 'right' }));

    const endSettings = endButton && endButton.elType === 'widget' ? endButton.settings : null;
    expect(endSettings).not.toEqual(expect.objectContaining({ align: 'start' }));
    expect(endSettings).not.toEqual(expect.objectContaining({ align: 'end' }));
  });

  it('derives stable unique ids and byte-identical output for the same neutral input', () => {
    const first = generateElementorV3TemplateCandidate(fixture());
    const second = generateElementorV3TemplateCandidate(fixture());

    expect(first.template).toEqual(second.template);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(serializeP15ElementorV3GenerationResult(first)).toBe(serializeP15ElementorV3GenerationResult(second));

    const ids: string[] = [];
    const stack = [...(first.template?.content ?? [])];
    while (stack.length > 0) {
      const element = stack.pop();
      if (!element) continue;
      ids.push(element.id);
      expect(element.id).toMatch(/^[0-9a-f]{8}$/);
      stack.push(...element.elements);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('fails closed on an explicit review node and emits no partial Elementor template', () => {
    const input = fixture();
    const root = input.nodes[0];
    if (!root || root.kind !== 'container') throw new Error('fixture invariant');
    root.children.push({
      kind: 'review',
      sourceNodeId: 'ambiguous-overlay',
      reasonCode: 'AMBIGUOUS_OVERLAY',
      detail: 'Manual composition needs target-specific review before mapping.',
    });

    const result = generateElementorV3TemplateCandidate(input);
    expect(result.validation.valid).toBe(true);
    expect(result.validation.reviewNodeCount).toBe(1);
    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.reviewEntries).toEqual([
      {
        sourceNodeId: 'ambiguous-overlay',
        reasonCode: 'AMBIGUOUS_OVERLAY',
        detail: 'Manual composition needs target-specific review before mapping.',
      },
    ]);
    expect(result.template).toBeNull();
    expect(result.candidate).toBeNull();
    expect(result.downloadEnabled).toBe(false);
  });

  it('rejects duplicate source identities before deterministic element-id generation', () => {
    const input = fixture();
    const root = input.nodes[0];
    if (!root || root.kind !== 'container') throw new Error('fixture invariant');
    root.children.push({ kind: 'heading', sourceNodeId: 'hero-title', text: 'Duplicate', level: 'h2' });

    const result = generateElementorV3TemplateCandidate(input);
    expect(result.status).toBe('REJECTED_INVALID_IR');
    expect(result.template).toBeNull();
    expect(result.candidate).toBeNull();
    expect(result.validation.issues.map((issue) => issue.code)).toContain('P15_IR_DUPLICATE_SOURCE_ID');
  });

  it('rejects unsafe URLs, out-of-bounds spacing and target-specific control leakage', () => {
    const input = fixture() as unknown as Record<string, unknown>;
    const nodes = input.nodes as Array<Record<string, unknown>>;
    const root = nodes[0]!;
    root.gapPx = 5_000;
    const children = root.children as Array<Record<string, unknown>>;
    const copy = children[0]!;
    const copyChildren = copy.children as Array<Record<string, unknown>>;
    const button = copyChildren[1]!;
    button.url = 'javascript:alert(1)';
    button.settings = { text: 'leaked Elementor control' };

    const validation = validateP15NeutralExportDocument(input);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'P15_IR_SPACING_INVALID',
      'P15_IR_URL_INVALID',
      'P15_IR_NODE_KEYS_UNSUPPORTED',
    ]));

    const result = generateElementorV3TemplateCandidate(input);
    expect(result.status).toBe('REJECTED_INVALID_IR');
    expect(result.template).toBeNull();
  });
});
