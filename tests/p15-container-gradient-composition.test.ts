import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_MANIFEST_VERSION,
  resolveP15ElementorContainerLinearGradients,
  serializeP15ElementorContainerLinearGradientSummary,
} from '../src/targets/elementor/container-linear-gradient-composition';
import {
  P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_MANIFEST_VERSION,
  resolveP15ElementorContainerRadialGradients,
  serializeP15ElementorContainerRadialGradientSummary,
} from '../src/targets/elementor/container-radial-gradient-composition';
import { cloneP15ReadyElementorTemplate } from '../src/targets/elementor/responsive-container-binding';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const source = (): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'PRIVATE',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [
    { kind: 'container', sourceNodeId: 'nested', direction: 'row', children: [] }] }] });
function manifest(document: P15NeutralExportDocumentV1, manifestVersion: string, containers: unknown[]) {
  const generation = generateElementorV3TemplateCandidate(document);
  if (!generation.candidate) throw new Error('fixture must generate');
  return { schemaVersion: 1, manifestVersion, sourceIrFingerprint: fingerprintP15NeutralExportDocument(document),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest, containers,
    gradientInferencePerformed: false, responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false };
}
const slider = (unit: string, size: number) => ({ unit, size, sizes: [] });
const linear = { colorA: '#112233', colorB: '#aabbcc', stopA: 0, stopB: 100, angleDeg: 45, tabletStopA: 10, tabletStopB: 90, mobileAngleDeg: 360 };
const radial = { colorA: '#112233', colorB: '#aabbcc', stopA: 20, stopB: 80, position: 'top left', mobilePosition: 'bottom right' };
const STALE = `sha256:${'0'.repeat(64)}`;

describe('P15 Container gradients v2 (recovery M1.5e)', () => {
  it('linear: writes Elementor slider stops and angles for normal and hover', () => {
    const document = source();
    const result = resolveP15ElementorContainerLinearGradients(document,
      manifest(document, P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_MANIFEST_VERSION, [{ sourceNodeId: 'root', normal: linear }, { sourceNodeId: 'nested', hover: { ...linear, angleDeg: undefined } }]));
    expect(result.status).toBe('CONTAINER_LINEAR_GRADIENTS_RESOLVED');
    expect(result.template?.content[0]?.settings).toMatchObject({ background_background: 'gradient', background_color: '#112233',
      background_color_stop: slider('%', 0), background_color_b: '#aabbcc', background_color_b_stop: slider('%', 100),
      background_gradient_type: 'linear', background_gradient_angle: slider('deg', 45),
      background_color_stop_tablet: slider('%', 10), background_color_b_stop_tablet: slider('%', 90), background_gradient_angle_mobile: slider('deg', 360) });
    expect(result.template?.content[0]?.settings).not.toHaveProperty('background_hover_background');
    expect(result.template?.content[0]?.elements[0]?.settings).toMatchObject({ background_hover_background: 'gradient', background_hover_color_stop: slider('%', 0) });
    expect(serializeP15ElementorContainerLinearGradientSummary(result)).not.toContain('PRIVATE');
  });

  it('radial: the candidate is rebuilt from the exact radial writes', () => {
    const document = source();
    const result = resolveP15ElementorContainerRadialGradients(document,
      manifest(document, P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_MANIFEST_VERSION, [{ sourceNodeId: 'root', normal: radial, hover: { ...radial, position: 'center center' } }]));
    expect(result.status).toBe('CONTAINER_RADIAL_GRADIENTS_RESOLVED');
    const settings = result.template?.content[0]?.settings;
    expect(settings).toMatchObject({ background_gradient_type: 'radial', background_gradient_position: 'top left',
      background_gradient_position_mobile: 'bottom right', background_color_stop: slider('%', 20),
      background_hover_gradient_type: 'radial', background_hover_gradient_position: 'center center' });
    expect(settings).not.toHaveProperty('background_gradient_angle');
    expect(cloneP15ReadyElementorTemplate(result.candidate!)).toEqual(result.template);
    expect(result.resolvedCandidateIdentityDigest).toBe(buildElementorTemplateCandidateIdentity(result.candidate!).digest);
    expect(serializeP15ElementorContainerRadialGradientSummary(result)).not.toContain('PRIVATE');
  });

  it('refuses fractional, unordered or unpaired stops, bad angles/positions, stale bindings, duplicates and inflation', () => {
    const document = source();
    const linearBad: unknown[][] = [
      [{ sourceNodeId: 'root', normal: { ...linear, stopA: 0.5 } }],
      [{ sourceNodeId: 'root', normal: { ...linear, stopA: 60, stopB: 40 } }],
      [{ sourceNodeId: 'root', normal: { ...linear, tabletStopB: undefined } }],
      [{ sourceNodeId: 'root', normal: { ...linear, angleDeg: 361 } }],
      [{ sourceNodeId: 'root', normal: { ...linear, colorA: '#FF0000' } }],
      [{ sourceNodeId: 'root', normal: linear }, { sourceNodeId: 'root', hover: linear }],
      [{ sourceNodeId: 'root', normal: linear, extra: 'PRIVATE' }],
      [{ sourceNodeId: 'root' }],
    ];
    for (const containers of linearBad) {
      expect(resolveP15ElementorContainerLinearGradients(document, manifest(document, P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_MANIFEST_VERSION, containers)).status)
        .toBe('REJECTED_INVALID_MANIFEST');
    }
    for (const normal of [{ ...radial, position: 'middle' }, { ...radial, angleDeg: 10 }, { ...radial, mobilePosition: 'custom' }]) {
      expect(resolveP15ElementorContainerRadialGradients(document, manifest(document, P15_ELEMENTOR_CONTAINER_RADIAL_GRADIENT_MANIFEST_VERSION, [{ sourceNodeId: 'root', normal }])).status)
        .toBe('REJECTED_INVALID_MANIFEST');
    }
    const valid = manifest(document, P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_MANIFEST_VERSION, [{ sourceNodeId: 'root', normal: linear }]);
    for (const bad of [{ ...valid, baseCandidateIdentityDigest: STALE }, { ...valid, sourceIrFingerprint: STALE }, { ...valid, productionAcceptance: true },
      { ...valid, manifestVersion: 'p15-elementor-container-linear-gradient-manifest-v1' }]) {
      expect(resolveP15ElementorContainerLinearGradients(document, bad).status).toBe('REJECTED_INVALID_MANIFEST');
    }
    const colored: P15NeutralExportDocumentV1 = { ...document, nodes: [{ ...document.nodes[0]!, backgroundColorHex: '#123456' } as never] };
    const conflict = resolveP15ElementorContainerLinearGradients(colored,
      manifest(colored, P15_ELEMENTOR_CONTAINER_LINEAR_GRADIENT_MANIFEST_VERSION, [{ sourceNodeId: 'root', normal: linear }]));
    expect(conflict.issues.map((issue) => issue.code)).toEqual(['P15_CONTAINER_LINEAR_GRADIENT_EXISTING_OVERRIDE_CONFLICT']);
    const first = resolveP15ElementorContainerLinearGradients(document, valid);
    expect(() => serializeP15ElementorContainerLinearGradientSummary({ ...first, downloadEnabled: true } as never)).toThrow();
  });
});
