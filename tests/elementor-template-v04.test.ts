import { describe, expect, it } from 'vitest';
import {
  ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
  ELEMENTOR_TEMPLATE_DATA_VERSION,
  ELEMENTOR_TEMPLATE_MAX_DEPTH,
  serializeElementorTemplateV04,
  validateElementorTemplateV04,
  type ElementorTemplateV04,
} from '../src/targets/elementor/template-v04';

function validTemplate(): ElementorTemplateV04 {
  return {
    title: 'About Page',
    type: 'page',
    version: ELEMENTOR_TEMPLATE_DATA_VERSION,
    page_settings: [],
    content: [
      {
        id: '6af611eb',
        elType: 'container',
        isInner: false,
        settings: {
          content_width: 'boxed',
          padding_mobile: { unit: 'px', top: '16', right: '16', bottom: '16', left: '16' },
        },
        elements: [
          {
            id: '6a637978',
            elType: 'widget',
            widgetType: 'heading',
            isInner: false,
            settings: { title: 'About us', align: 'center' },
            elements: [],
          },
          {
            id: '687dba89',
            elType: 'widget',
            widgetType: 'image',
            isInner: false,
            settings: [],
            elements: [],
          },
          {
            id: '6f58bb5a',
            elType: 'widget',
            widgetType: 'button',
            isInner: false,
            settings: { text: 'Contact us' },
            elements: [],
          },
        ],
      },
    ],
  };
}

describe('P15 Elementor template v0.4 contract', () => {
  it('accepts documentation-shaped modern container/widget templates deterministically', () => {
    const document = validTemplate();
    const first = validateElementorTemplateV04(document);
    const second = validateElementorTemplateV04(document);

    expect(first).toEqual(second);
    expect(first.valid).toBe(true);
    expect(first.contractVersion).toBe(ELEMENTOR_TEMPLATE_CONTRACT_VERSION);
    expect(first.documentVersion).toBe('0.4');
    expect(first.elementCount).toBe(4);
    expect(first.containerCount).toBe(1);
    expect(first.widgetCount).toBe(3);
    expect(first.widgetTypes).toEqual(['button', 'heading', 'image']);
    expect(first.issues).toEqual([]);
  });

  it('allows documented recursive nesting, including nested widget children', () => {
    const document = validTemplate();
    document.content[0]!.elements[0]!.elements.push({
      id: 'nested001',
      elType: 'widget',
      widgetType: 'button',
      isInner: true,
      settings: [],
      elements: [],
    });
    document.content[0]!.elements.push({
      id: 'nested002',
      elType: 'container',
      isInner: true,
      settings: [],
      elements: [],
    });

    const result = validateElementorTemplateV04(document);
    expect(result.valid).toBe(true);
    expect(result.elementCount).toBe(6);
    expect(result.containerCount).toBe(2);
    expect(result.widgetCount).toBe(4);
  });

  it('rejects unsupported document versions instead of silently migrating them', () => {
    const document = { ...validTemplate(), version: '0.5' };
    const result = validateElementorTemplateV04(document);

    expect(result.valid).toBe(false);
    expect(result.documentVersion).toBe('0.5');
    expect(result.issues).toContainEqual(expect.objectContaining({
      code: 'P15_UNSUPPORTED_DOCUMENT_VERSION',
      path: '$.version',
    }));
  });

  it('rejects legacy, Atomic and unknown element families with explicit codes', () => {
    const base = validTemplate();
    const legacy = validateElementorTemplateV04({ ...base, content: [{ ...base.content[0]!, elType: 'section' }] });
    const atomic = validateElementorTemplateV04({ ...base, content: [{ ...base.content[0]!, elType: 'e-div-block' }] });
    const unknown = validateElementorTemplateV04({ ...base, content: [{ ...base.content[0]!, elType: 'mystery-layout' }] });

    expect(legacy.issues.map((issue) => issue.code)).toContain('P15_LEGACY_ELEMENT_UNSUPPORTED');
    expect(atomic.issues.map((issue) => issue.code)).toContain('P15_ATOMIC_ELEMENT_UNSUPPORTED');
    expect(unknown.issues.map((issue) => issue.code)).toContain('P15_ELEMENT_TYPE_UNSUPPORTED');
  });

  it('rejects duplicate ids, malformed widget types and undocumented populated settings arrays', () => {
    const document = validTemplate() as unknown as Record<string, unknown>;
    const content = document.content as Array<Record<string, unknown>>;
    const children = content[0]!.elements as Array<Record<string, unknown>>;
    children[1]!.id = children[0]!.id;
    children[1]!.widgetType = '';
    children[2]!.settings = ['not-documented-as-populated-array'];

    const result = validateElementorTemplateV04(document);
    const codes = result.issues.map((issue) => issue.code);
    expect(codes).toContain('P15_DUPLICATE_ELEMENT_ID');
    expect(codes).toContain('P15_WIDGET_TYPE_REQUIRED');
    expect(codes).toContain('P15_SETTINGS_INVALID');
  });

  it('fails closed on malformed top-level structure', () => {
    expect(validateElementorTemplateV04(null).issues[0]?.code).toBe('P15_DOCUMENT_NOT_OBJECT');

    const document = validTemplate() as unknown as Record<string, unknown>;
    document.title = '';
    document.type = '';
    document.page_settings = ['bad'];
    document.content = 'bad';
    const result = validateElementorTemplateV04(document);
    const codes = result.issues.map((issue) => issue.code);

    expect(codes).toContain('P15_TITLE_REQUIRED');
    expect(codes).toContain('P15_DOCUMENT_TYPE_REQUIRED');
    expect(codes).toContain('P15_PAGE_SETTINGS_INVALID');
    expect(codes).toContain('P15_CONTENT_INVALID');
  });

  it('bounds recursive validation depth', () => {
    const document = validTemplate() as unknown as Record<string, unknown>;
    const root = (document.content as Array<Record<string, unknown>>)[0]!;
    let current: Record<string, unknown> = root;
    for (let index = 0; index < ELEMENTOR_TEMPLATE_MAX_DEPTH + 2; index += 1) {
      const child: Record<string, unknown> = {
        id: `depth-${index}`,
        elType: 'container',
        isInner: true,
        settings: [],
        elements: [],
      };
      current.elements = [child];
      current = child;
    }

    const result = validateElementorTemplateV04(document);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_DEPTH_LIMIT_EXCEEDED');
  });

  it('serializes valid documents and refuses invalid ones', () => {
    const valid = validTemplate();
    const serialized = serializeElementorTemplateV04(valid);
    expect(serialized).toBe(`${JSON.stringify(valid, null, 2)}\n`);

    const invalid = { ...valid, version: '0.3' } as unknown as ElementorTemplateV04;
    expect(() => serializeElementorTemplateV04(invalid)).toThrow(/P15_UNSUPPORTED_DOCUMENT_VERSION/);
  });
});
