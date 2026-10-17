import { describe, expect, it } from 'vitest';
import { OPTION_BANK_REGISTRY } from '../src/core/option-bank';
import { buildP15ElementorV1PreviewFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { buildP15LocalTemplateDownloadResult } from '../src/plugin/p15-local-template-download';
import { generateElementorV4AtomicTemplate } from '../src/targets/elementor/v4-atomic-generator';
import { validateElementorV4AtomicTemplate } from '../src/targets/elementor/v4-atomic-template';

const doc = (nodes: unknown[]) => ({ schemaVersion: 1, irVersion: 'p15-neutral-export-ir-v2', title: 'Hero', documentType: 'section', nodes });
const hero = doc([{
  kind: 'container', sourceNodeId: '1:1', direction: 'column', gapPx: 16, paddingPx: { top: 40, right: 24, bottom: 40, left: 24 },
  alignItems: 'center', justifyContent: 'start', backgroundColorHex: '#112233', cornerRadiusPx: 8,
  children: [
    { kind: 'heading', sourceNodeId: '1:2', text: 'Welcome', level: 'h1', align: 'center', typography: { fontFamily: 'Inter', fontWeight: '700', fontSizePx: 48, colorHex: '#ffffff' } },
    { kind: 'text', sourceNodeId: '1:3', text: 'Body copy', typography: { fontSizePx: 16, lineHeightPx: 24 } },
    { kind: 'button', sourceNodeId: '1:4', text: 'Start', url: 'https://example.com/start', openInNewTab: true, backgroundColorHex: '#FF0000', paddingPx: { top: 12, right: 24, bottom: 12, left: 24 }, cornerRadiusPx: 4 },
    { kind: 'image', sourceNodeId: '1:5', url: 'https://example.com/a.png', heightPx: 200, objectFit: 'cover' },
  ],
}]);

describe('recovery M6.4 — Elementor v4 Atomic adapter', () => {
  it('maps the neutral IR to e-flexbox / e-heading / e-paragraph / e-button / e-image with typed props and local styles', () => {
    const result = generateElementorV4AtomicTemplate(hero);
    expect(result.irValidation.issues).toEqual([]);
    expect(result.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(result.templateValidation?.valid).toBe(true);
    const root = result.template!.content[0]!;
    expect(root.elType).toBe('e-flexbox');
    expect(root.elements.map((e) => (e.elType === 'widget' ? e.widgetType : e.elType))).toEqual(['e-heading', 'e-paragraph', 'e-button', 'e-image']);
    const styleId = `e-${root.id}-local`;
    expect(root.settings.classes).toEqual({ $$type: 'classes', value: [styleId] });
    const props = (root.styles as Record<string, { variants: { meta: unknown; props: Record<string, unknown> }[] }>)[styleId]!.variants[0]!;
    expect(props.meta).toEqual({ breakpoint: 'desktop', state: null });
    expect(props.props['flex-direction']).toEqual({ $$type: 'string', value: 'column' });
    expect(props.props.gap).toEqual({ $$type: 'size', value: { size: 16, unit: 'px' } });
    expect(props.props['align-items']).toEqual({ $$type: 'string', value: 'center' });
    expect(props.props.background).toEqual({ $$type: 'background', value: { color: { $$type: 'color', value: '#112233' } } });
    const headingEl = root.elements[0]!;
    expect(headingEl.settings.tag).toEqual({ $$type: 'string', value: 'h1' });
    expect(headingEl.settings.title).toEqual({ $$type: 'escaped-html', value: 'Welcome' });
    expect(root.elements[2]!.settings.link).toEqual({ $$type: 'link', value: { destination: { $$type: 'url', value: 'https://example.com/start' }, isTargetBlank: { $$type: 'boolean', value: true } } });
    expect(JSON.stringify(result.template)).not.toMatch(/"elType":"container"|"widgetType":"(heading|text-editor|button|image)"/);
  });

  it('is deterministic', () => {
    expect(generateElementorV4AtomicTemplate(hero).templateJson).toBe(generateElementorV4AtomicTemplate(hero).templateJson);
  });

  it('turns unmapped facts into REVIEW and exposes no template (no silent fallback)', () => {
    const withShadow = doc([{ kind: 'container', sourceNodeId: '2:1', direction: 'row', boxShadow: { kind: 'drop', xPx: 0, yPx: 2, blurPx: 4, spreadPx: 0, colorHex: '#000000', alpha: 0.2 }, children: [] }]);
    const shadow = generateElementorV4AtomicTemplate(withShadow);
    if (shadow.status !== 'REJECTED_INVALID_IR') {
      expect(shadow.status).toBe('REVIEW_REQUIRED');
      expect(shadow.template).toBeNull();
    }
    const divider = generateElementorV4AtomicTemplate(doc([{ kind: 'divider', sourceNodeId: '3:1', weightPx: 1, colorHex: '#000000' }]));
    expect(divider.status).toBe('REVIEW_REQUIRED');
    expect(divider.reviews[0]!.reasonCode).toBe('ATOMIC_ELEMENT_UNMAPPED');
    const asset = generateElementorV4AtomicTemplate(doc([{ kind: 'image', sourceNodeId: '4:1', assetPath: 'assets/abc.png' }]));
    expect(asset.status).not.toBe('GENERATED_LOCAL_CANDIDATE');
    expect(generateElementorV4AtomicTemplate({ nope: true }).status).toBe('REJECTED_INVALID_IR');
  });

  it('own validator rejects v3 shapes, untyped props, bad class references and duplicate ids', () => {
    const good = generateElementorV4AtomicTemplate(hero).template!;
    expect(validateElementorV4AtomicTemplate(good).valid).toBe(true);
    const clone = () => JSON.parse(JSON.stringify(good));
    const v3 = clone(); v3.content[0].elType = 'container';
    expect(validateElementorV4AtomicTemplate(v3).issues[0]!.code).toBe('ATOMIC_ELEMENT_TYPE_UNSUPPORTED');
    const untyped = clone(); untyped.content[0].elements[0].settings.tag = 'h1';
    expect(validateElementorV4AtomicTemplate(untyped).issues.map((i) => i.code)).toContain('ATOMIC_PROP_INVALID');
    const badClass = clone(); badClass.content[0].settings.classes.value = ['e-missing-local'];
    expect(validateElementorV4AtomicTemplate(badClass).issues.map((i) => i.code)).toContain('ATOMIC_CLASS_REFERENCE_INVALID');
    const dup = clone(); dup.content[0].elements[1].id = dup.content[0].elements[0].id;
    expect(validateElementorV4AtomicTemplate(dup).issues.map((i) => i.code)).toContain('ATOMIC_ID_DUPLICATE');
    const nested = clone(); nested.content[0].elements[2].settings.link.value.destination = { $$type: 'nope', value: 'x' };
    expect(validateElementorV4AtomicTemplate(nested).valid).toBe(false);
  });

  it('the v4-Atomic profile downloads an atomic artifact with the atomic adapter version in the receipt', () => {
    const frame = {
      id: '1:1', name: 'Simple', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP',
      layoutPositioning: 'AUTO', itemSpacing: 8, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
      primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', fills: [],
      children: [{ id: '1:2', name: 'Copy', type: 'TEXT', visible: true, characters: 'Hello', textAlignHorizontal: 'LEFT', fills: [] }],
    } as unknown as FrameNode;
    const extraction = buildP15ElementorV1PreviewFromFigmaFrame(frame);
    const atomicBank = OPTION_BANK_REGISTRY.elementor.find((e) => e.profile?.structure === 'V4_ATOMIC')!;
    const result = buildP15LocalTemplateDownloadResult({ id: '1:1' }, extraction, atomicBank.id);
    expect(result.blockReasonCodes).toEqual([]);
    expect(result.status).toBe('LOCAL_ARTIFACT_VALIDATED');
    expect(result.receipt).toEqual(expect.objectContaining({ profileId: 'elementor-v4-atomic@4', adapterVersion: 'elementor-v4-atomic-v1', targetCompatibilityClaim: false, importValidationStatus: 'NOT_RUN' }));
    const template = JSON.parse(result.templateJson!);
    expect(validateElementorV4AtomicTemplate(template).valid).toBe(true);
    expect(result.authority.targetCompatibilityClaim).toBe(false);
  });
});
