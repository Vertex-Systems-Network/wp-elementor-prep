import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_EVIDENCE,
  P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION,
  P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_POSITIONS,
  resolveP15ElementorButtonRadialGradients,
  serializeP15ElementorButtonRadialGradientSummary,
  type P15ElementorButtonRadialGradientManifestV1,
  type P15ElementorButtonRadialGradientResultV1,
} from '../src/targets/elementor/button-radial-gradient-resolution';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function sourceDocument(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Button gradient private source',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'root',
      direction: 'column',
      children: [
        { kind: 'button', sourceNodeId: 'button', text: 'PRIVATE BUTTON COPY', align: 'start' },
        { kind: 'heading', sourceNodeId: 'heading', text: 'PRIVATE HEADING COPY', level: 'h2' },
        {
          kind: 'container',
          sourceNodeId: 'nested',
          direction: 'row',
          children: [{
            kind: 'button',
            sourceNodeId: 'linked-button',
            text: 'PRIVATE LINKED BUTTON',
            align: 'end',
            url: 'https://example.com/private',
            openInNewTab: true,
            nofollow: true,
          }],
        },
      ],
    }],
  };
}

function baseIdentityDigest(source: P15NeutralExportDocumentV1): string {
  const generation = generateElementorV3TemplateCandidate(source);
  if (generation.status !== 'GENERATED_LOCAL_CANDIDATE' || !generation.candidate) {
    throw new Error('fixture must generate a ready base candidate');
  }
  return buildElementorTemplateCandidateIdentity(generation.candidate).digest;
}

function manifest(
  source: P15NeutralExportDocumentV1,
  buttons: P15ElementorButtonRadialGradientManifestV1['buttons'],
): P15ElementorButtonRadialGradientManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    buttons,
    gradientInferencePerformed: false,
    responsiveInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    responsiveClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
}

function settingsOf(element: unknown): Record<string, unknown> {
  if (typeof element !== 'object' || element === null || Array.isArray(element)) throw new Error('expected element object');
  const settings = (element as Record<string, unknown>).settings;
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) throw new Error('expected settings object');
  return settings as Record<string, unknown>;
}

describe('P15 Fast Batch Button radial gradient backgrounds v1', () => {
  it('writes exact normal radial gradient keys with explicit exact position', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonRadialGradients(source, manifest(source, [{
      sourceNodeId: 'button',
      normal: { colorA: '#112233', colorB: '#aabbcc', stopA: 10, stopB: 90, position: 'top right' },
    }]));

    expect(P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_EVIDENCE.backgroundGroupControlSourceBlobSha)
      .toBe('ac8e1a510ec663f3f428c9f564dc2c5b727435e1');
    expect(result.status).toBe('BUTTON_RADIAL_GRADIENTS_RESOLVED');

    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.background_background).toBe('gradient');
    expect(settings.background_color).toBe('#112233');
    expect(settings.background_color_stop).toEqual({ unit: '%', size: 10, sizes: [] });
    expect(settings.background_color_b).toBe('#aabbcc');
    expect(settings.background_color_b_stop).toEqual({ unit: '%', size: 90, sizes: [] });
    expect(settings.background_gradient_type).toBe('radial');
    expect(settings.background_gradient_position).toBe('top right');
    expect(settings).not.toHaveProperty('button_background_hover_background');
    expect(settings.text).toBe('PRIVATE BUTTON COPY');
    expect(settings.align).toBe('left');
  });

  it('writes exact hover/focus radial gradient keys with explicit position', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonRadialGradients(source, manifest(source, [{
      sourceNodeId: 'button',
      hover: { colorA: '#001122', colorB: '#334455', stopA: 0, stopB: 100, position: 'center left' },
    }]));
    const settings = settingsOf(result.template?.content[0]?.elements[0]);

    expect(settings.button_background_hover_background).toBe('gradient');
    expect(settings.button_background_hover_color).toBe('#001122');
    expect(settings.button_background_hover_color_stop).toEqual({ unit: '%', size: 0, sizes: [] });
    expect(settings.button_background_hover_color_b).toBe('#334455');
    expect(settings.button_background_hover_color_b_stop).toEqual({ unit: '%', size: 100, sizes: [] });
    expect(settings.button_background_hover_gradient_type).toBe('radial');
    expect(settings.button_background_hover_gradient_position).toBe('center left');
    expect(settings).not.toHaveProperty('background_background');
  });

  it('applies normal and hover gradients together and preserves exact linked Button binding', () => {
    const source = sourceDocument();
    const batch = manifest(source, [{
      sourceNodeId: 'linked-button',
      normal: { colorA: '#123456', colorB: '#654321', stopA: 20, stopB: 80, position: 'bottom center' },
      hover: { colorA: '#abcdef', colorB: '#fedcba', stopA: 5, stopB: 95, position: 'top left' },
    }]);

    const first = resolveP15ElementorButtonRadialGradients(source, batch);
    const second = resolveP15ElementorButtonRadialGradients(source, batch);
    expect(first).toEqual(second);

    const linked = settingsOf(first.template?.content[0]?.elements[2]?.elements[0]);
    expect(linked.link).toEqual({
      url: 'https://example.com/private',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(linked.align).toBe('right');
    expect(linked.background_gradient_position).toBe('bottom center');
    expect(linked.button_background_hover_gradient_position).toBe('top left');
  });

  it('rejects invalid colors, stops, positions, extra fields and non-Button ids', () => {
    const source = sourceDocument();

    for (const normal of [
      { colorA: '#ABCDEF', colorB: '#112233', stopA: 0, stopB: 100, position: 'center center' },
      { colorA: '#112233', colorB: '#445566', stopA: -1, stopB: 100, position: 'center center' },
      { colorA: '#112233', colorB: '#445566', stopA: 80, stopB: 20, position: 'center center' },
      { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, position: 'middle center' },
      { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, position: 'center center', angleDeg: 90 },
    ]) {
      const result = resolveP15ElementorButtonRadialGradients(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', normal }],
      });
      expect(result.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_RADIAL_GRADIENT_VALUE_INVALID');
    }

    const nonButton = resolveP15ElementorButtonRadialGradients(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'heading', normal: { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100 } }],
    });
    expect(nonButton.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RADIAL_GRADIENT_SOURCE_NOT_BUTTON');
  });

  it('rejects stale replay, duplicate ids and authority inflation', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{
      sourceNodeId: 'button',
      normal: { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, position: 'center center' },
    }]);

    expect(resolveP15ElementorButtonRadialGradients(source, {
      ...raw,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RADIAL_GRADIENT_SOURCE_FINGERPRINT_MISMATCH');

    expect(resolveP15ElementorButtonRadialGradients(source, {
      ...raw,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RADIAL_GRADIENT_BASE_CANDIDATE_IDENTITY_MISMATCH');

    expect(resolveP15ElementorButtonRadialGradients(source, manifest(source, [
      raw.buttons[0]!,
      raw.buttons[0]!,
    ])).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RADIAL_GRADIENT_DUPLICATE_SOURCE_ID');

    expect(resolveP15ElementorButtonRadialGradients(source, {
      ...raw,
      targetCompatibilityClaim: true,
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RADIAL_GRADIENT_AUTHORITY_FLAGS_INVALID');
  });

  it('supports empty manifests and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const empty = resolveP15ElementorButtonRadialGradients(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_RADIAL_GRADIENT_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);

    const result = resolveP15ElementorButtonRadialGradients(source, manifest(source, [{
      sourceNodeId: 'button',
      hover: { colorA: '#102030', colorB: '#405060', stopA: 15, stopB: 85, position: 'bottom right' },
    }]));
    const serialized = serializeP15ElementorButtonRadialGradientSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/private');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"acceptedBackgroundType": "gradient"');
    expect(serialized).toContain('"acceptedGradientType": "radial"');
    expect(P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_POSITIONS).toEqual([
      'center center', 'center left', 'center right',
      'top center', 'top left', 'top right',
      'bottom center', 'bottom left', 'bottom right',
    ]);

    const inflated = { ...result, networkAccess: true } as unknown as P15ElementorButtonRadialGradientResultV1;
    expect(() => serializeP15ElementorButtonRadialGradientSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
