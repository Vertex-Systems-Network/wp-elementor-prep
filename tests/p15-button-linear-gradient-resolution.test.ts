import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_EVIDENCE,
  P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_MANIFEST_VERSION,
  resolveP15ElementorButtonLinearGradients,
  serializeP15ElementorButtonLinearGradientSummary,
  type P15ElementorButtonLinearGradientManifestV1,
  type P15ElementorButtonLinearGradientResultV1,
} from '../src/targets/elementor/button-linear-gradient-resolution';
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
  buttons: P15ElementorButtonLinearGradientManifestV1['buttons'],
): P15ElementorButtonLinearGradientManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_MANIFEST_VERSION,
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

describe('P15 Fast Batch Button linear gradient backgrounds + responsive angles/stops v1', () => {
  it('writes exact normal linear gradient keys with bounded explicit angle', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonLinearGradients(source, manifest(source, [{
      sourceNodeId: 'button',
      normal: { colorA: '#112233', colorB: '#aabbcc', stopA: 10, stopB: 90, angleDeg: 135 },
    }]));

    expect(P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_EVIDENCE.backgroundGroupControlSourceBlobSha)
      .toBe('ac8e1a510ec663f3f428c9f564dc2c5b727435e1');
    expect(result.status).toBe('BUTTON_LINEAR_GRADIENTS_RESOLVED');

    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.background_background).toBe('gradient');
    expect(settings.background_color).toBe('#112233');
    expect(settings.background_color_stop).toEqual({ unit: '%', size: 10, sizes: [] });
    expect(settings.background_color_b).toBe('#aabbcc');
    expect(settings.background_color_b_stop).toEqual({ unit: '%', size: 90, sizes: [] });
    expect(settings.background_gradient_type).toBe('linear');
    expect(settings.background_gradient_angle).toEqual({ unit: 'deg', size: 135, sizes: [] });
    expect(settings).not.toHaveProperty('button_background_hover_background');
    expect(settings.text).toBe('PRIVATE BUTTON COPY');
    expect(settings.align).toBe('left');
  });

  it('writes explicit normal tablet/mobile gradient angles without inference', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonLinearGradients(source, manifest(source, [{
      sourceNodeId: 'button',
      normal: {
        colorA: '#112233',
        colorB: '#aabbcc',
        stopA: 10,
        stopB: 90,
        angleDeg: 180,
        tabletAngleDeg: 135,
        mobileAngleDeg: 90,
      },
    }]));
    const settings = settingsOf(result.template?.content[0]?.elements[0]);

    expect(settings.background_gradient_angle).toEqual({ unit: 'deg', size: 180, sizes: [] });
    expect(settings.background_gradient_angle_tablet).toEqual({ unit: 'deg', size: 135, sizes: [] });
    expect(settings.background_gradient_angle_mobile).toEqual({ unit: 'deg', size: 90, sizes: [] });
    expect(settings).not.toHaveProperty('button_background_hover_gradient_angle_tablet');
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
  });

  it('writes explicit normal tablet/mobile stop pairs without inference', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonLinearGradients(source, manifest(source, [{
      sourceNodeId: 'button',
      normal: {
        colorA: '#112233',
        colorB: '#aabbcc',
        stopA: 10,
        stopB: 90,
        tabletStopA: 20,
        tabletStopB: 80,
        mobileStopA: 30,
        mobileStopB: 70,
      },
    }]));
    const settings = settingsOf(result.template?.content[0]?.elements[0]);

    expect(settings.background_color_stop_tablet).toEqual({ unit: '%', size: 20, sizes: [] });
    expect(settings.background_color_b_stop_tablet).toEqual({ unit: '%', size: 80, sizes: [] });
    expect(settings.background_color_stop_mobile).toEqual({ unit: '%', size: 30, sizes: [] });
    expect(settings.background_color_b_stop_mobile).toEqual({ unit: '%', size: 70, sizes: [] });
    expect(settings).not.toHaveProperty('button_background_hover_color_stop_tablet');
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
  });

  it('writes exact hover/focus linear gradient keys without inventing an angle', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonLinearGradients(source, manifest(source, [{
      sourceNodeId: 'button',
      hover: { colorA: '#001122', colorB: '#334455', stopA: 0, stopB: 100 },
    }]));
    const settings = settingsOf(result.template?.content[0]?.elements[0]);

    expect(settings.button_background_hover_background).toBe('gradient');
    expect(settings.button_background_hover_color).toBe('#001122');
    expect(settings.button_background_hover_color_stop).toEqual({ unit: '%', size: 0, sizes: [] });
    expect(settings.button_background_hover_color_b).toBe('#334455');
    expect(settings.button_background_hover_color_b_stop).toEqual({ unit: '%', size: 100, sizes: [] });
    expect(settings.button_background_hover_gradient_type).toBe('linear');
    expect(settings).not.toHaveProperty('button_background_hover_gradient_angle');
    expect(settings).not.toHaveProperty('background_background');
  });

  it('writes explicit hover tablet angle and leaves omitted mobile angle absent', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonLinearGradients(source, manifest(source, [{
      sourceNodeId: 'button',
      hover: {
        colorA: '#001122',
        colorB: '#334455',
        stopA: 0,
        stopB: 100,
        tabletAngleDeg: 270,
      },
    }]));
    const settings = settingsOf(result.template?.content[0]?.elements[0]);

    expect(settings.button_background_hover_gradient_angle_tablet)
      .toEqual({ unit: 'deg', size: 270, sizes: [] });
    expect(settings).not.toHaveProperty('button_background_hover_gradient_angle_mobile');
    expect(settings).not.toHaveProperty('button_background_hover_gradient_angle');
    expect(settings).not.toHaveProperty('background_gradient_angle_tablet');
  });

  it('writes explicit hover tablet stop pair and leaves omitted mobile pair absent', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonLinearGradients(source, manifest(source, [{
      sourceNodeId: 'button',
      hover: {
        colorA: '#001122',
        colorB: '#334455',
        stopA: 0,
        stopB: 100,
        tabletStopA: 15,
        tabletStopB: 85,
      },
    }]));
    const settings = settingsOf(result.template?.content[0]?.elements[0]);

    expect(settings.button_background_hover_color_stop_tablet)
      .toEqual({ unit: '%', size: 15, sizes: [] });
    expect(settings.button_background_hover_color_b_stop_tablet)
      .toEqual({ unit: '%', size: 85, sizes: [] });
    expect(settings).not.toHaveProperty('button_background_hover_color_stop_mobile');
    expect(settings).not.toHaveProperty('button_background_hover_color_b_stop_mobile');
    expect(settings).not.toHaveProperty('background_color_stop_tablet');
  });

  it('applies normal and hover gradients together and preserves exact linked Button binding', () => {
    const source = sourceDocument();
    const batch = manifest(source, [{
      sourceNodeId: 'linked-button',
      normal: { colorA: '#123456', colorB: '#654321', stopA: 20, stopB: 80, angleDeg: 45 },
      hover: { colorA: '#abcdef', colorB: '#fedcba', stopA: 5, stopB: 95, angleDeg: 225 },
    }]);

    const first = resolveP15ElementorButtonLinearGradients(source, batch);
    const second = resolveP15ElementorButtonLinearGradients(source, batch);
    expect(first).toEqual(second);

    const linked = settingsOf(first.template?.content[0]?.elements[2]?.elements[0]);
    expect(linked.link).toEqual({
      url: 'https://example.com/private',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(linked.align).toBe('right');
    expect(linked.background_gradient_angle).toEqual({ unit: 'deg', size: 45, sizes: [] });
    expect(linked.button_background_hover_gradient_angle).toEqual({ unit: 'deg', size: 225, sizes: [] });
  });

  it('rejects invalid colors, stops, angles, extra fields and non-Button ids', () => {
    const source = sourceDocument();

    for (const normal of [
      { colorA: '#ABCDEF', colorB: '#112233', stopA: 0, stopB: 100 },
      { colorA: '#112233', colorB: '#445566', stopA: -1, stopB: 100 },
      { colorA: '#112233', colorB: '#445566', stopA: 80, stopB: 20 },
      { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, angleDeg: 361 },
      { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, tabletAngleDeg: -1 },
      { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, mobileAngleDeg: 360.5 },
      { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, tabletStopA: 10 },
      { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, tabletStopA: 90, tabletStopB: 10 },
      { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, mobileStopA: -1, mobileStopB: 90 },
      { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, mobileStopA: 10, mobileStopB: 100.5 },
      { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100, radial: true },
    ]) {
      const result = resolveP15ElementorButtonLinearGradients(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', normal }],
      });
      expect(result.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_LINEAR_GRADIENT_VALUE_INVALID');
    }

    const nonButton = resolveP15ElementorButtonLinearGradients(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'heading', normal: { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100 } }],
    });
    expect(nonButton.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_LINEAR_GRADIENT_SOURCE_NOT_BUTTON');
  });

  it('rejects stale replay, duplicate ids and authority inflation', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{
      sourceNodeId: 'button',
      normal: { colorA: '#112233', colorB: '#445566', stopA: 0, stopB: 100 },
    }]);

    expect(resolveP15ElementorButtonLinearGradients(source, {
      ...raw,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_LINEAR_GRADIENT_SOURCE_FINGERPRINT_MISMATCH');

    expect(resolveP15ElementorButtonLinearGradients(source, {
      ...raw,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_LINEAR_GRADIENT_BASE_CANDIDATE_IDENTITY_MISMATCH');

    expect(resolveP15ElementorButtonLinearGradients(source, manifest(source, [
      raw.buttons[0]!,
      raw.buttons[0]!,
    ])).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_LINEAR_GRADIENT_DUPLICATE_SOURCE_ID');

    expect(resolveP15ElementorButtonLinearGradients(source, {
      ...raw,
      targetCompatibilityClaim: true,
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_LINEAR_GRADIENT_AUTHORITY_FLAGS_INVALID');
  });

  it('supports empty manifests and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const empty = resolveP15ElementorButtonLinearGradients(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_LINEAR_GRADIENT_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);

    const result = resolveP15ElementorButtonLinearGradients(source, manifest(source, [{
      sourceNodeId: 'button',
      hover: {
        colorA: '#102030',
        colorB: '#405060',
        stopA: 15,
        stopB: 85,
        angleDeg: 180,
        tabletAngleDeg: 120,
        mobileAngleDeg: 60,
        tabletStopA: 20,
        tabletStopB: 80,
        mobileStopA: 25,
        mobileStopB: 75,
      },
    }]));
    const serialized = serializeP15ElementorButtonLinearGradientSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/private');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"acceptedBackgroundType": "gradient"');
    expect(serialized).toContain('"acceptedGradientType": "linear"');
    expect(serialized).toContain('"gradientAngleTabletSuffix": "gradient_angle_tablet"');
    expect(serialized).toContain('"gradientAngleMobileSuffix": "gradient_angle_mobile"');
    expect(serialized).toContain('"tabletAngleDeg": 120');
    expect(serialized).toContain('"mobileAngleDeg": 60');
    expect(serialized).toContain('"colorAStopTabletSuffix": "color_stop_tablet"');
    expect(serialized).toContain('"colorBStopMobileSuffix": "color_b_stop_mobile"');
    expect(serialized).toContain('"tabletStopA": 20');
    expect(serialized).toContain('"tabletStopB": 80');
    expect(serialized).toContain('"mobileStopA": 25');
    expect(serialized).toContain('"mobileStopB": 75');

    const inflated = { ...result, networkAccess: true } as unknown as P15ElementorButtonLinearGradientResultV1;
    expect(() => serializeP15ElementorButtonLinearGradientSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
