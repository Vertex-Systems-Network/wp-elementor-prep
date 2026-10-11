import { describe, expect, it } from 'vitest';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import { P15_ELEMENTOR_RESPONSIVE_VISIBILITY_MANIFEST_VERSION, resolveP15ElementorResponsiveVisibility } from '../src/targets/elementor/responsive-visibility-resolution';
import { P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_MANIFEST_VERSION, resolveP15ElementorResponsiveElementOrder } from '../src/targets/elementor/responsive-element-order-resolution';

const doc: P15NeutralExportDocumentV1 = { schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'T', documentType: 'section',
  nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [
    { kind: 'heading', sourceNodeId: 'h', text: 'Hi', level: 'h2' },
    { kind: 'container', sourceNodeId: 'box', direction: 'row', children: [{ kind: 'button', sourceNodeId: 'b', text: 'Go' }] },
  ] }] };
const FLAGS = { responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
  targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false };
const manifest = (manifestVersion: string, elements: unknown[]) => ({ schemaVersion: 1, manifestVersion,
  sourceIrFingerprint: fingerprintP15NeutralExportDocument(doc),
  baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generateElementorV3TemplateCandidate(doc).candidate!).digest, ...FLAGS, elements });

const withWidgets = (manifestVersion: string, widgets: unknown[]) => {
  const { elements: _elements, ...rest } = manifest(manifestVersion, []);
  return { ...rest, widgets };
};

describe('recovery M4.3b — visibility and element order families', () => {
  it('writes hide_<device> switchers on widgets and containers', () => {
    const result = resolveP15ElementorResponsiveVisibility(doc, manifest(P15_ELEMENTOR_RESPONSIVE_VISIBILITY_MANIFEST_VERSION, [
      { sourceNodeId: 'h', hideMobile: true }, { sourceNodeId: 'box', hideDesktop: true, hideTablet: true }]));
    expect(result.status).toBe('RESPONSIVE_VISIBILITY_RESOLVED');
    const root = result.template!.content[0]!;
    expect(root.elements[0]!.settings).toMatchObject({ hide_mobile: 'hidden-mobile' });
    expect(root.elements[1]!.settings).toMatchObject({ hide_desktop: 'hidden-desktop', hide_tablet: 'hidden-tablet' });
  });

  it('refuses an empty entry, a non-true value and an unknown node', () => {
    for (const elements of [[{ sourceNodeId: 'h' }], [{ sourceNodeId: 'h', hideMobile: 'yes' }], [{ sourceNodeId: 'nope', hideMobile: true }]]) {
      const result = resolveP15ElementorResponsiveVisibility(doc, manifest(P15_ELEMENTOR_RESPONSIVE_VISIBILITY_MANIFEST_VERSION, elements));
      expect(result.template).toBeNull();
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });

  it('writes custom flex order on widgets and containers, with complete type/value pairs only', () => {
    const result = resolveP15ElementorResponsiveElementOrder(doc, manifest(P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_MANIFEST_VERSION, [
      { sourceNodeId: 'h', mobileOrderCustom: true, mobileOrderValue: 1 }, { sourceNodeId: 'box', mobileOrderCustom: true, mobileOrderValue: 0 }]));
    expect(result.status).toBe('RESPONSIVE_ELEMENT_ORDER_RESOLVED');
    expect(result.template!.content[0]!.elements[0]!.settings).toMatchObject({ _flex_order_mobile: 'custom', _flex_order_custom_mobile: 1 });
    expect(result.template!.content[0]!.elements[1]!.settings).toMatchObject({ _flex_order_mobile: 'custom', _flex_order_custom_mobile: 0 });
    const unpaired = resolveP15ElementorResponsiveElementOrder(doc, manifest(P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_MANIFEST_VERSION, [
      { sourceNodeId: 'h', mobileOrderValue: 1 }]));
    expect(unpaired.template).toBeNull();
  });
});

describe('recovery M4.3c — responsive text typography family', () => {
  it('writes tablet/mobile metrics on headings and buttons and refuses values outside the neutral precision', async () => {
    const { P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_MANIFEST_VERSION: version, resolveP15ElementorResponsiveTextTypography: resolve } =
      await import('../src/targets/elementor/responsive-text-typography-resolution');
    const ok = resolve(doc, withWidgets(version, [
      { sourceNodeId: 'h', tabletFontSizePx: 28, mobileLineHeightPx: 30.25 }, { sourceNodeId: 'b', mobileLetterSpacingPx: -0.5 }]));
    expect(ok.status).toBe('RESPONSIVE_TEXT_TYPOGRAPHY_RESOLVED');
    expect(ok.template!.content[0]!.elements[0]!.settings).toMatchObject({ typography_typography: 'custom',
      typography_font_size_tablet: { unit: 'px', size: 28, sizes: [] }, typography_line_height_mobile: { unit: 'px', size: 30.25, sizes: [] } });
    expect(ok.template!.content[0]!.elements[1]!.elements[0]!.settings).toMatchObject({ typography_letter_spacing_mobile: { unit: 'px', size: -0.5, sizes: [] } });
    for (const widgets of [[{ sourceNodeId: 'h', mobileFontSizePx: 12.345 }], [{ sourceNodeId: 'h', mobileFontSizePx: 0 }], [{ sourceNodeId: 'box', mobileFontSizePx: 12 }]]) {
      const refused = resolve(doc, withWidgets(version, widgets));
      expect(refused.template).toBeNull();
    }
  });
});
