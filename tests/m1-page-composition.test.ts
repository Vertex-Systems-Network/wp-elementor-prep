import { describe, expect, it } from 'vitest';
import { composeP15ElementorPage, P15_PAGE_COMPOSITION_VERSION, serializeP15ElementorPageCompositionSummary } from '../src/targets/elementor/page-composition';
import { composeP15ContainerStyles, P15_CONTAINER_STYLE_COMPOSITION_VERSION } from '../src/targets/elementor/container-style-composition';
import { composeP15ButtonColors, P15_BUTTON_COLOR_COMPOSITION_VERSION } from '../src/targets/elementor/button-color-composition';
import { P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/container-hover-background-color-resolution';
import { P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION } from '../src/targets/elementor/container-box-shadow-resolution';
import { P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-text-color-resolution';
import { resolveP15ElementorResponsiveContainerDirections, P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION } from '../src/targets/elementor/responsive-direction-resolution';
import { resolveP15ElementorResponsiveContainerWraps, P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION } from '../src/targets/elementor/responsive-wrap-resolution';
import { resolveP15ElementorResponsiveContainerAlignContent, P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION } from '../src/targets/elementor/responsive-align-content-resolution';
import { resolveP15ElementorResponsiveContainerAlignments, P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION } from '../src/targets/elementor/responsive-alignment-resolution';
import { resolveP15ElementorResponsiveContainerGaps, P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION } from '../src/targets/elementor/responsive-gap-resolution';
import { resolveP15ElementorResponsiveContainerPadding, P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION } from '../src/targets/elementor/responsive-padding-resolution';
import { resolveP15ElementorResponsiveContainerMargin, P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION } from '../src/targets/elementor/responsive-margin-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import type { ElementorElementV04, ElementorTemplateV04 } from '../src/targets/elementor/template-v04';

const source = (): P15NeutralExportDocumentV1 => ({
  schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'PRIVATE PAGE', documentType: 'section',
  nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'row', gapPx: 24, cornerRadiusPx: 12,
    paddingPx: { top: 10, right: 20, bottom: 10, left: 20 }, children: [
      { kind: 'container', sourceNodeId: 'nested', direction: 'column', gapPx: 8, children: [
        { kind: 'text', sourceNodeId: 'copy', text: 'PRIVATE COPY' },
        { kind: 'button', sourceNodeId: 'cta', text: 'PRIVATE CTA' },
      ] },
    ] }],
});

const FLAGS = { responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
  targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false };
const box = { top: 1, right: 2, bottom: 3, left: 4 };

function identity(document: P15NeutralExportDocumentV1) {
  const generation = generateElementorV3TemplateCandidate(document);
  if (!generation.candidate) throw new Error('fixture must generate');
  return { schemaVersion: 1, sourceIrFingerprint: fingerprintP15NeutralExportDocument(document),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest, ...FLAGS };
}

function familyManifests(document: P15NeutralExportDocumentV1) {
  const common = identity(document);
  const layout = (manifestVersion: string, containers: unknown[]) => ({ ...common, manifestVersion, containers });
  const wrap = layout(P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION, [{ sourceNodeId: 'root', tabletWrap: 'wrap', mobileWrap: 'wrap' }]);
  const wrapped = resolveP15ElementorResponsiveContainerWraps(document, wrap).resolvedCandidateIdentityDigest;
  const { baseCandidateIdentityDigest: _base, ...unbound } = common;
  return {
    direction: layout(P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION, [{ sourceNodeId: 'root', tabletDirection: 'column' }]),
    wrap,
    alignContent: { ...unbound, manifestVersion: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION, wrappedCandidateIdentityDigest: wrapped,
      containers: [{ sourceNodeId: 'root', tabletAlignContent: 'space-between', mobileAlignContent: 'center' }] },
    alignment: layout(P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION, [{ sourceNodeId: 'nested', tabletAlignItems: 'center' }]),
    gap: layout(P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION, [{ sourceNodeId: 'root', tabletGapPx: 12 }]),
    padding: layout(P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION, [{ sourceNodeId: 'nested', mobilePaddingPx: box }]),
    margin: layout(P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION, [{ sourceNodeId: 'nested', tabletMarginPx: box }]),
    containerStyle: { ...common, compositionVersion: P15_CONTAINER_STYLE_COMPOSITION_VERSION, families: {
      hoverBackground: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION, containers: [{ sourceNodeId: 'nested', color: '#abcdef' }] },
      boxShadows: { ...common, manifestVersion: P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION, styleInferencePerformed: false,
        containers: [{ sourceNodeId: 'root', normal: { horizontal: 0, vertical: 4, blur: 8, spread: 0, color: '#000000', position: 'outline' } }] },
    } },
    buttonColors: { ...common, compositionVersion: P15_BUTTON_COLOR_COMPOSITION_VERSION, families: {
      normalText: { ...common, manifestVersion: P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION, colorInferencePerformed: false, buttons: [{ sourceNodeId: 'cta', color: '#112233' }] },
    } },
  };
}

type Families = ReturnType<typeof familyManifests>;
const page = (document: P15NeutralExportDocumentV1, families: Partial<Families> | Record<string, unknown>) =>
  ({ ...identity(document), compositionVersion: P15_PAGE_COMPOSITION_VERSION, families });

/** Each family resolved alone, through its own public resolver. */
const ALONE: Record<keyof Families, (document: P15NeutralExportDocumentV1, families: Families) => { template: ElementorTemplateV04 | null }> = {
  direction: (d, f) => resolveP15ElementorResponsiveContainerDirections(d, f.direction),
  wrap: (d, f) => resolveP15ElementorResponsiveContainerWraps(d, f.wrap),
  alignContent: (d, f) => resolveP15ElementorResponsiveContainerAlignContent(d, f.wrap, f.alignContent),
  alignment: (d, f) => resolveP15ElementorResponsiveContainerAlignments(d, f.alignment),
  gap: (d, f) => resolveP15ElementorResponsiveContainerGaps(d, f.gap),
  padding: (d, f) => resolveP15ElementorResponsiveContainerPadding(d, f.padding),
  margin: (d, f) => resolveP15ElementorResponsiveContainerMargin(d, f.margin),
  containerStyle: (d, f) => composeP15ContainerStyles(d, f.containerStyle),
  buttonColors: (d, f) => composeP15ButtonColors(d, f.buttonColors),
};

function nodes(template: ElementorTemplateV04 | null): Map<string, Record<string, unknown>> {
  const out = new Map<string, Record<string, unknown>>();
  const walk = (list: ElementorElementV04[]) => list.forEach((node) => { out.set(node.id, node.settings as Record<string, unknown>); walk(node.elements); });
  if (template) walk(template.content);
  return out;
}

describe('recovery M1.5d — page composition', () => {
  it('a single-family page equals that family resolved alone', () => {
    const document = source(); const families = familyManifests(document);
    for (const id of Object.keys(ALONE) as Array<keyof Families>) {
      const selected = id === 'alignContent' ? { wrap: families.wrap, alignContent: families.alignContent } : { [id]: families[id] };
      const result = composeP15ElementorPage(document, page(document, selected));
      expect(result.status, id).toBe('RESOLVED');
      expect(result.template, id).toEqual(ALONE[id](document, families).template);
    }
  });

  it('the full page is exactly the base plus every family\'s own additions', () => {
    const document = source(); const families = familyManifests(document);
    const result = composeP15ElementorPage(document, page(document, families));
    expect(result.status).toBe('RESOLVED');
    expect(result.appliedFamilies).toEqual(['direction', 'wrap', 'alignContent', 'alignment', 'gap', 'padding', 'margin', 'containerStyle', 'buttonColors']);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    const generation = generateElementorV3TemplateCandidate(document);
    const expected = nodes(generation.template);
    for (const id of Object.keys(ALONE) as Array<keyof Families>) {
      const prior = id === 'alignContent' ? nodes(ALONE.wrap(document, families).template) : nodes(generation.template);
      for (const [nodeId, settings] of nodes(ALONE[id](document, families).template)) {
        for (const [key, value] of Object.entries(settings)) {
          if (Object.prototype.hasOwnProperty.call(prior.get(nodeId), key)) continue;
          expected.get(nodeId)![key] = value;
        }
      }
    }
    const actual = nodes(result.template);
    expect([...actual.keys()]).toEqual([...expected.keys()]);
    for (const [nodeId, settings] of actual) expect(settings, nodeId).toEqual(expected.get(nodeId));
    const root = actual.get(result.template!.content[0]!.id)!;
    expect(root).toMatchObject({ flex_wrap_tablet: 'wrap', container_align_content_tablet: 'space-between', flex_direction_tablet: 'column' });
  });

  it('applies families in fixed order whatever the manifest key order', () => {
    const document = source(); const families = familyManifests(document);
    const reversed = Object.fromEntries(Object.entries(families).reverse());
    expect(composeP15ElementorPage(document, page(document, reversed))).toEqual(composeP15ElementorPage(document, page(document, families)));
  });

  it('refuses align-content without its wrap prerequisite, stale nested bindings and authority inflation', () => {
    const document = source(); const families = familyManifests(document);
    expect(composeP15ElementorPage(document, page(document, { alignContent: families.alignContent })).issues)
      .toEqual([{ code: 'P15_PAGE_COMPOSITION_FAMILY_REJECTED', family: 'alignContent' }]);
    const stale = { ...families, gap: { ...families.gap, baseCandidateIdentityDigest: `sha256:${'0'.repeat(64)}` } };
    expect(composeP15ElementorPage(document, page(document, stale)).issues).toEqual([{ code: 'P15_PAGE_COMPOSITION_FAMILY_REJECTED', family: 'gap' }]);
    const wrongWrap = { ...families, alignContent: { ...families.alignContent, wrappedCandidateIdentityDigest: `sha256:${'0'.repeat(64)}` } };
    expect(composeP15ElementorPage(document, page(document, wrongWrap)).issues).toEqual([{ code: 'P15_PAGE_COMPOSITION_FAMILY_REJECTED', family: 'alignContent' }]);
    for (const bad of [{ ...page(document, families), downloadEnabled: true }, page(document, { ...families, unknown: {} }), page(document, {})]) {
      const result = composeP15ElementorPage(document, bad);
      expect(result.status).toBe('REJECTED');
      expect(result.template).toBeNull();
    }
  });

  it('serializes sanitized identities only and refuses inflated results', () => {
    const document = source(); const result = composeP15ElementorPage(document, page(document, familyManifests(document)));
    const summary = serializeP15ElementorPageCompositionSummary(result);
    expect(summary).not.toContain('PRIVATE');
    expect(summary).not.toContain('templateJson');
    expect(() => serializeP15ElementorPageCompositionSummary({ ...result, targetCompatibilityClaim: true } as never)).toThrow();
  });
});
