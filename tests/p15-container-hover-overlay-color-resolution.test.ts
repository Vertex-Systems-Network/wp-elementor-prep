import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_EVIDENCE,
  P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION,
  resolveP15ElementorContainerHoverOverlayColor,
  serializeP15ElementorContainerHoverOverlayColorSummary,
  type P15ElementorContainerHoverOverlayColorManifestV1,
} from '../src/targets/elementor/container-hover-overlay-color-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function source(): P15NeutralExportDocumentV1 {
  return { schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'PRIVATE TITLE', documentType: 'section', nodes: [{
      kind: 'container', sourceNodeId: 'root', direction: 'column', backgroundColorHex: '#ABCDEF', children: [
        { kind: 'heading', sourceNodeId: 'heading', text: 'PRIVATE COPY', level: 'h2' },
        { kind: 'container', sourceNodeId: 'nested', direction: 'row', children: [] },
      ],
    }],
  };
}
function manifest(document: P15NeutralExportDocumentV1, containers: P15ElementorContainerHoverOverlayColorManifestV1['containers']): P15ElementorContainerHoverOverlayColorManifestV1 {
  const generation = generateElementorV3TemplateCandidate(document);
  if (!generation.candidate) throw new Error('fixture must generate');
  return { schemaVersion: 1, manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(document),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest,
    containers, responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false,
  };
}
const entry = { sourceNodeId: 'root', color: '#123456' };

function settings(result: ReturnType<typeof resolveP15ElementorContainerHoverOverlayColor>, nested = false): Record<string, unknown> {
  const target = nested ? result.template?.content[0]?.elements[1] : result.template?.content[0];
  if (!target || Array.isArray(target.settings)) throw new Error('expected settings');
  return target.settings;
}

describe('P15 Container classic hover overlay color', () => {
  it('writes only overlay classic/color while retaining normal source color', () => {
    const document = source();
    const result = resolveP15ElementorContainerHoverOverlayColor(document, manifest(document, [entry]));
    expect(P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_EVIDENCE).toMatchObject({
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      backgroundGroupSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
      groupName: 'background_overlay_hover',
      typeSettingKey: 'background_overlay_hover_background', colorSettingKey: 'background_overlay_hover_color',
    });
    expect(P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_EVIDENCE.selector).toContain('{{WRAPPER}}:hover::before');
    expect(result.status).toBe('CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED');
    expect(settings(result)).toMatchObject({ background_background: 'classic', background_color: '#ABCDEF',
      background_overlay_hover_background: 'classic', background_overlay_hover_color: '#123456' });
    expect(settings(result)).not.toHaveProperty('background_overlay_hover_color_tablet');
    expect(settings(result)).not.toHaveProperty('background_overlay_hover_color_mobile');
    expect(settings(result, true)).not.toHaveProperty('background_overlay_hover_color');
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
  });

  it('binds nested Container and leaves omitted breakpoint/normal values alone', () => {
    const document = source();
    const result = resolveP15ElementorContainerHoverOverlayColor(document, manifest(document, [{ sourceNodeId: 'nested', color: '#abcdef' }]));
    expect(result.status).toBe('CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED');
    expect(settings(result)).not.toHaveProperty('background_overlay_hover_color');
    expect(settings(result, true)).toMatchObject({ background_overlay_hover_background: 'classic', background_overlay_hover_color: '#abcdef' });
    expect(settings(result, true)).not.toHaveProperty('background_color');
  });

  it('rejects invalid values, missing/extra fields and wrong source type', () => {
    const document = source(); const valid = manifest(document, [entry]);
    for (const changed of [
      { ...entry, color: '#ABCDEF' }, { ...entry, color: 'red' }, { ...entry, color: '#12345g' },
      { ...entry, color: '#123456', css: 'private' }, { sourceNodeId: 'root' },
      { ...entry, sourceNodeId: 'heading' },
    ]) {
      const result = resolveP15ElementorContainerHoverOverlayColor(document, { ...valid, containers: [changed] });
      expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
      expect(result.template).toBeNull();
    }
  });

  it('rejects replay, duplicate IDs and authority inflation', () => {
    const document = source(); const valid = manifest(document, [entry]);
    const cases = [
      [{ ...valid, sourceIrFingerprint: 'sha256:' + '0'.repeat(64) }, 'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_FINGERPRINT_MISMATCH'],
      [{ ...valid, baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64) }, 'P15_CONTAINER_HOVER_OVERLAY_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH'],
      [{ ...valid, containers: [entry, entry] }, 'P15_CONTAINER_HOVER_OVERLAY_COLOR_DUPLICATE_SOURCE_ID'],
      [{ ...valid, productionAcceptance: true }, 'P15_CONTAINER_HOVER_OVERLAY_COLOR_AUTHORITY_FLAGS_INVALID'],
    ] as const;
    for (const [bad, code] of cases) {
      expect(resolveP15ElementorContainerHoverOverlayColor(document, bad).issues.map(x => x.code)).toContain(code);
    }
  });

  it('is deterministic and sanitizes serialized evidence', () => {
    const document = source(); const valid = manifest(document, [entry]);
    const first = resolveP15ElementorContainerHoverOverlayColor(document, valid);
    expect(first).toEqual(resolveP15ElementorContainerHoverOverlayColor(document, valid));
    const summary = serializeP15ElementorContainerHoverOverlayColorSummary(first);
    expect(summary).not.toContain('PRIVATE');
    expect(summary).not.toContain('templateJson');
    expect(() => serializeP15ElementorContainerHoverOverlayColorSummary({ ...first, productionAcceptance: true } as never)).toThrow();
  });
  it('writes explicit desktop/tablet/mobile opacity hundredths with no cross-state inference', () => {
    const document = source();
    const result = resolveP15ElementorContainerHoverOverlayColor(document, manifest(document, [{
      ...entry, opacityHundredths: 50, tabletOpacityHundredths: 0, mobileOpacityHundredths: 100,
    }]));
    expect(result.status).toBe('CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED');
    expect(P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_EVIDENCE).toMatchObject({
      opacityDesktopSettingKey: 'background_overlay_hover_opacity',
      opacityTabletSettingKey: 'background_overlay_hover_opacity_tablet',
      opacityMobileSettingKey: 'background_overlay_hover_opacity_mobile',
      sliderSourceBlobSha: 'f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f',
    });
    expect(settings(result)).toMatchObject({
      background_overlay_hover_opacity: { unit: 'px', size: 0.5, sizes: [] },
      background_overlay_hover_opacity_tablet: { unit: 'px', size: 0, sizes: [] },
      background_overlay_hover_opacity_mobile: { unit: 'px', size: 1, sizes: [] },
    });
    expect(settings(result)).not.toHaveProperty('background_overlay_opacity');
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
  });

  it('omits unrequested breakpoints and rejects invalid opacity ranges and shapes', () => {
    const document = source(); const valid = manifest(document, [entry]);
    const tabletOnly = resolveP15ElementorContainerHoverOverlayColor(document, manifest(document, [{ ...entry, tabletOpacityHundredths: 25 }]));
    expect(tabletOnly.status).toBe('CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED');
    expect(settings(tabletOnly)).not.toHaveProperty('background_overlay_hover_opacity');
    expect(settings(tabletOnly)).not.toHaveProperty('background_overlay_hover_opacity_mobile');
    expect(settings(tabletOnly)['background_overlay_hover_opacity_tablet']).toEqual({ unit: 'px', size: 0.25, sizes: [] });
    for (const bad of [-1, 101, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '50', { size: 50 }]) {
      const result = resolveP15ElementorContainerHoverOverlayColor(document, { ...valid, containers: [{ ...entry, mobileOpacityHundredths: bad }] });
      expect(result.issues.map(x => x.code)).toContain('P15_CONTAINER_HOVER_OVERLAY_COLOR_OPACITY_INVALID');
      expect(result.template).toBeNull();
    }
    const summary = serializeP15ElementorContainerHoverOverlayColorSummary(tabletOnly);
    expect(summary).not.toContain('PRIVATE');
    expect(summary).not.toContain('templateJson');
  });

});
