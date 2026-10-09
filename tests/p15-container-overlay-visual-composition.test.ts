import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_MANIFEST_VERSION,
  resolveP15ElementorContainerOverlayVisuals,
  serializeP15ElementorContainerOverlayVisualSummary,
} from '../src/targets/elementor/container-overlay-visual-composition';
import { P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION, resolveP15ElementorContainerOverlayColor } from '../src/targets/elementor/container-overlay-color-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const FLAGS = { responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
  targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false };
const document: P15NeutralExportDocumentV1 = { schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'PRIVATE', documentType: 'section',
  nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [{ kind: 'container', sourceNodeId: 'plain', direction: 'row', children: [] }] }] };
const fingerprint = fingerprintP15NeutralExportDocument(document);
const base = buildElementorTemplateCandidateIdentity(generateElementorV3TemplateCandidate(document).candidate!).digest;
const colors = { schemaVersion: 1, manifestVersion: P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION, sourceIrFingerprint: fingerprint,
  baseCandidateIdentityDigest: base, containers: [{ sourceNodeId: 'root', color: '#112233' }], ...FLAGS };
const overlayDigest = resolveP15ElementorContainerOverlayColor(document, colors).resolvedCandidateIdentityDigest;
const manifest = (containers: unknown[], overrides: Record<string, unknown> = {}) => ({ schemaVersion: 1,
  manifestVersion: P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_MANIFEST_VERSION, sourceIrFingerprint: fingerprint,
  overlayColorCandidateIdentityDigest: overlayDigest, containers, styleInferencePerformed: false, ...FLAGS, ...overrides });
const px = (size: number) => ({ unit: 'px', size, sizes: [] });

describe('P15 Container overlay visuals v2 (recovery M1.5f)', () => {
  it('writes the popover starter and px sliders on top of the exact overlay colour', () => {
    const result = resolveP15ElementorContainerOverlayVisuals(document, colors, manifest([
      { sourceNodeId: 'root', blendMode: 'multiply', normal: { blur: 2, brightness: 150 }, hover: { hue: 90 } },
      { sourceNodeId: 'plain', hover: { contrast: 120 } },
    ]));
    expect(result.status).toBe('CONTAINER_OVERLAY_VISUALS_RESOLVED');
    expect(result.template?.content[0]?.settings).toMatchObject({ background_overlay_color: '#112233', overlay_blend_mode: 'multiply',
      css_filters_css_filter: 'custom', css_filters_blur: px(2), css_filters_brightness: px(150),
      css_filters_hover_css_filter: 'custom', css_filters_hover_hue: px(90) });
    expect(result.template?.content[0]?.elements[0]?.settings).toMatchObject({ css_filters_hover_css_filter: 'custom', css_filters_hover_contrast: px(120) });
    expect(serializeP15ElementorContainerOverlayVisualSummary(result)).not.toContain('PRIVATE');
  });

  it('refuses normal filters or a blend mode without an overlay colour, but allows hover filters', () => {
    const result = resolveP15ElementorContainerOverlayVisuals(document, colors, manifest([{ sourceNodeId: 'plain', blendMode: 'screen', normal: { blur: 1 } }]));
    expect(result.issues.map((issue) => [issue.code, issue.path])).toEqual([
      ['P15_CONTAINER_OVERLAY_VISUAL_OVERLAY_COLOR_REQUIRED', '$manifest.containers[0].normal'],
      ['P15_CONTAINER_OVERLAY_VISUAL_OVERLAY_COLOR_REQUIRED', '$manifest.containers[0].blendMode'],
    ]);
  });

  it('blocks on an invalid overlay colour prerequisite and refuses stale bindings and authority inflation', () => {
    expect(resolveP15ElementorContainerOverlayVisuals(document, { ...colors, productionAcceptance: true }, manifest([{ sourceNodeId: 'root', hover: { hue: 1 } }])).status)
      .toBe('BLOCKED_OVERLAY_COLOR_PREREQUISITE');
    for (const bad of [manifest([{ sourceNodeId: 'root', hover: { hue: 1 } }], { overlayColorCandidateIdentityDigest: base }),
      manifest([{ sourceNodeId: 'root', hover: { hue: 1 } }], { downloadEnabled: true }),
      manifest([{ sourceNodeId: 'root', hover: { hue: 1 }, css: 'PRIVATE' }]), manifest([{ sourceNodeId: 'root', hover: {} }])]) {
      expect(resolveP15ElementorContainerOverlayVisuals(document, colors, bad).status).toBe('REJECTED_INVALID_MANIFEST');
    }
  });
});
