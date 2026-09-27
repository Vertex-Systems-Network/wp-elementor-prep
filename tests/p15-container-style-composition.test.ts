import { describe, expect, it } from 'vitest';
import { composeP15ContainerStyles, P15_CONTAINER_STYLE_COMPOSITION_VERSION,
  serializeP15ContainerStyleCompositionSummary, type P15ContainerStyleCompositionManifestV1 } from '../src/targets/elementor/container-style-composition';
import { P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION } from '../src/targets/elementor/container-border-style-resolution';
import { P15_ELEMENTOR_CONTAINER_HOVER_BORDER_STYLE_MANIFEST_VERSION } from '../src/targets/elementor/container-hover-border-style-resolution';
import { P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/container-overlay-color-resolution';
import { P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/container-hover-overlay-color-resolution';
import { P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION } from '../src/targets/elementor/container-box-shadow-resolution';
import { P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/container-hover-background-color-resolution';
import { P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION } from '../src/targets/elementor/responsive-border-radius-resolution';
import { P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION } from '../src/targets/elementor/responsive-hover-border-radius-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function source(): P15NeutralExportDocumentV1 {
  return { schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'PRIVATE SOURCE', documentType: 'section',
    nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', cornerRadiusPx: 12, children: [
      { kind: 'heading', sourceNodeId: 'heading', level: 'h2', text: 'PRIVATE HEADING' },
      { kind: 'container', sourceNodeId: 'nested', direction: 'row', children: [] },
    ] }],
  };
}
const widthPx = { top: 1, right: 2, bottom: 3, left: 4 };
function manifest(document: P15NeutralExportDocumentV1): P15ContainerStyleCompositionManifestV1 {
  const generation = generateElementorV3TemplateCandidate(document);
  if (!generation.candidate) throw new Error('fixture must generate');
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(document);
  const baseCandidateIdentityDigest = buildElementorTemplateCandidateIdentity(generation.candidate).digest;
  const common = { schemaVersion: 1 as const, sourceIrFingerprint, baseCandidateIdentityDigest,
    responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false } as const;
  return { ...common, compositionVersion: P15_CONTAINER_STYLE_COMPOSITION_VERSION,
    families: {
      normalBorder: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION,
        styleInferencePerformed: false, containers: [{ sourceNodeId: 'root', borderType: 'solid', widthPx, color: '#123456',
          tabletWidthPx: { top: 0, right: 0, bottom: 0, left: 0 } }] },
      hoverBorder: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_BORDER_STYLE_MANIFEST_VERSION,
        styleInferencePerformed: false, containers: [{ sourceNodeId: 'root', borderType: 'dashed', widthPx, color: '#abcdef' }] },
      normalOverlay: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION,
        containers: [{ sourceNodeId: 'root', color: '#112233', opacityHundredths: 0,
          tabletOpacityHundredths: 100 }] },
      hoverOverlay: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION,
        containers: [{ sourceNodeId: 'nested', color: '#445566', mobileOpacityHundredths: 25 }] },
      boxShadows: { ...common, manifestVersion: P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION,
        styleInferencePerformed: false, containers: [{ sourceNodeId: 'root', normal: {
          horizontal: -10, vertical: 10, blur: 20, spread: -5, color: '#123456', position: 'outline',
        }, hover: { horizontal: 0, vertical: 8, blur: 0, spread: 5, color: '#abcdef', position: 'inset' } }] },
      hoverBackground: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION,
        containers: [{ sourceNodeId: 'nested', color: '#abcdef' }] },
      responsiveRadius: { ...common, manifestVersion: P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION,
        containers: [{ sourceNodeId: 'root', tabletCornerRadiusPx: 20 }] },
      responsiveHoverRadius: { ...common, manifestVersion: P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION,
        containers: [{ sourceNodeId: 'root', mobileCornerRadiusPx: 6 }] },
    },
  };
}

describe('P15 bounded Container style composition', () => {
  it('combines eight independently validated normal/hover families on one candidate', () => {
    const document = source(); const result = composeP15ContainerStyles(document, manifest(document));
    expect(result.status).toBe('RESOLVED');
    expect(result.appliedFamilies).toEqual(['normalBorder', 'hoverBorder', 'normalOverlay', 'hoverOverlay', 'boxShadows', 'hoverBackground',
      'responsiveRadius', 'responsiveHoverRadius']);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    const root = result.template?.content[0];
    if (!root || Array.isArray(root.settings)) throw new Error('expected root settings');
    expect(root.settings).toMatchObject({ border_border: 'solid', border_hover_border: 'dashed',
      border_color: '#123456', border_hover_color: '#abcdef',
      border_width_tablet: { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true },
      background_overlay_background: 'classic', background_overlay_color: '#112233',
      background_overlay_opacity: { unit: 'px', size: 0, sizes: [] },
      background_overlay_opacity_tablet: { unit: 'px', size: 1, sizes: [] },
      box_shadow_box_shadow_type: 'yes', box_shadow_box_shadow_position: ' ',
      box_shadow_hover_box_shadow_type: 'yes', box_shadow_hover_box_shadow_position: 'inset',
      border_radius_tablet: { unit: 'px', top: '20', right: '20', bottom: '20', left: '20', isLinked: true },
      border_radius_hover_mobile: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true } });
    expect(root.settings).not.toHaveProperty('border_width_mobile');
    expect(root.settings).not.toHaveProperty('background_overlay_opacity_mobile');
    expect(root.settings).not.toHaveProperty('background_overlay_hover_color');
    const nested = root.elements[1];
    if (!nested || Array.isArray(nested.settings)) throw new Error('expected nested settings');
    expect(nested.settings).toMatchObject({ background_overlay_hover_background: 'classic', background_overlay_hover_color: '#445566',
      background_overlay_hover_opacity_mobile: { unit: 'px', size: .25, sizes: [] },
      background_hover_background: 'classic', background_hover_color: '#abcdef' });
    expect(nested.settings).not.toHaveProperty('background_overlay_color');
    expect(nested.settings).not.toHaveProperty('background_overlay_hover_opacity_tablet');
    expect(nested.settings).not.toHaveProperty('box_shadow_box_shadow');
    expect(root.settings).not.toHaveProperty('background_hover_color');
    expect(root.settings).toHaveProperty('border_radius');
    expect(root.settings).not.toHaveProperty('border_radius_mobile');
    expect(root.settings).not.toHaveProperty('border_radius_hover_tablet');
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('rejects stale top-level and nested bindings, unknown fields and authority inflation', () => {
    const document = source(); const valid = manifest(document);
    const cases = [
      { ...valid, sourceIrFingerprint: 'sha256:' + '0'.repeat(64) },
      { ...valid, baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64) },
      { ...valid, productionAcceptance: true },
      { ...valid, families: { ...valid.families, unknown: {} } },
      { ...valid, extra: 'PRIVATE' },
    ];
    for (const bad of cases) {
      const result = composeP15ContainerStyles(document, bad);
      expect(result.status).toBe('REJECTED');
      expect(result.template).toBeNull();
    }
    const nested = { ...valid, families: { ...valid.families,
      normalBorder: { ...(valid.families.normalBorder as object), sourceIrFingerprint: 'sha256:' + '0'.repeat(64) } } };
    expect(composeP15ContainerStyles(document, nested).issues.map(x => x.code))
      .toContain('P15_CONTAINER_COMPOSITION_FAMILY_REJECTED');
  });

  it('rejects duplicate source IDs and wrong source types in a family', () => {
    const document = source(); const valid = manifest(document);
    for (const containers of [
      [{ sourceNodeId: 'root', color: '#112233' }, { sourceNodeId: 'root', color: '#112233' }],
      [{ sourceNodeId: 'heading', color: '#112233' }],
    ]) {
      const changed = { ...valid, families: { ...valid.families,
        normalOverlay: { ...(valid.families.normalOverlay as object), containers } } };
      expect(composeP15ContainerStyles(document, changed).status).toBe('REJECTED');
    }
  });

  it('rejects invalid overlay ranges, non-finite values, extra nested fields and family authority inflation', () => {
    const document = source(); const valid = manifest(document);
    const overlay = valid.families.normalOverlay as { containers: Array<Record<string, unknown>> };
    for (const change of [
      { opacityHundredths: -1 }, { opacityHundredths: 101 }, { opacityHundredths: .5 },
      { opacityHundredths: NaN }, { opacityHundredths: Infinity }, { privateCss: 'PRIVATE' },
    ]) {
      const changed = { ...valid, families: { ...valid.families, normalOverlay: {
        ...(valid.families.normalOverlay as object), containers: [{ ...overlay.containers[0], ...change }],
      } } };
      expect(composeP15ContainerStyles(document, changed).status).toBe('REJECTED');
    }
    expect(composeP15ContainerStyles(document, { ...valid, families: {
      ...valid.families, hoverOverlay: { ...(valid.families.hoverOverlay as object), downloadEnabled: true },
    } }).status).toBe('REJECTED');
  });

  it('rejects partial shadow objects, conflicting hover background keys and stale family candidate binding', () => {
    const document = source(); const valid = manifest(document);
    const shadow = valid.families.boxShadows as { containers: Array<Record<string, unknown>> };
    const partial = { ...valid, families: { ...valid.families, boxShadows: {
      ...(valid.families.boxShadows as object), containers: [{ ...shadow.containers[0], normal: { horizontal: 1 } }],
    } } };
    expect(composeP15ContainerStyles(document, partial).status).toBe('REJECTED');
    const stale = { ...valid, families: { ...valid.families, hoverBackground: {
      ...(valid.families.hoverBackground as object), baseCandidateIdentityDigest: 'sha256:' + '0'.repeat(64),
    } } };
    expect(composeP15ContainerStyles(document, stale).status).toBe('REJECTED');
    const conflicting = { ...valid, families: { ...valid.families, hoverBackground: {
      ...(valid.families.hoverBackground as object), productionAcceptance: true,
    } } };
    expect(composeP15ContainerStyles(document, conflicting).status).toBe('REJECTED');
  });

  it('rejects invalid responsive radius values, duplicate IDs and wrong source types', () => {
    const document = source(); const valid = manifest(document);
    for (const containers of [
      [{ sourceNodeId: 'root', tabletCornerRadiusPx: -1 }],
      [{ sourceNodeId: 'root', tabletCornerRadiusPx: 1.5 }],
      [{ sourceNodeId: 'root', tabletCornerRadiusPx: NaN }],
      [{ sourceNodeId: 'root', tabletCornerRadiusPx: 2, css: 'PRIVATE' }],
      [{ sourceNodeId: 'heading', tabletCornerRadiusPx: 2 }],
      [{ sourceNodeId: 'root', tabletCornerRadiusPx: 2 }, { sourceNodeId: 'root', mobileCornerRadiusPx: 3 }],
    ]) {
      const changed = { ...valid, families: { ...valid.families, responsiveRadius: {
        ...(valid.families.responsiveRadius as object), containers,
      } } };
      expect(composeP15ContainerStyles(document, changed).status).toBe('REJECTED');
    }
    expect(composeP15ContainerStyles(document, { ...valid, families: { ...valid.families,
      responsiveHoverRadius: { ...(valid.families.responsiveHoverRadius as object), responsiveClosureClaim: true },
    } }).status).toBe('REJECTED');
  });

  it('serializes deterministic sanitized evidence and rejects inflated results', () => {
    const document = source(); const valid = manifest(document);
    const first = composeP15ContainerStyles(document, valid);
    expect(first).toEqual(composeP15ContainerStyles(document, valid));
    const summary = serializeP15ContainerStyleCompositionSummary(first);
    expect(summary).not.toContain('PRIVATE');
    expect(summary).not.toContain('templateJson');
    expect(() => serializeP15ContainerStyleCompositionSummary({ ...first, productionAcceptance: true } as never)).toThrow();
    expect(() => serializeP15ContainerStyleCompositionSummary({ ...first, sourceIrFingerprint: 'PRIVATE' } as never)).toThrow();
    expect(() => serializeP15ContainerStyleCompositionSummary({ ...first, status: 'REJECTED' } as never)).toThrow();
    expect(() => serializeP15ContainerStyleCompositionSummary({ ...first,
      issues: [{ code: 'P15_CONTAINER_COMPOSITION_MANIFEST_INVALID', family: null, privateText: 'PRIVATE' }],
    } as never)).toThrow();
  });
});
