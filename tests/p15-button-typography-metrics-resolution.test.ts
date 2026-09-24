import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE,
  P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION,
  resolveP15ElementorButtonTypographyMetrics,
  serializeP15ElementorButtonTypographyMetricsSummary,
  type P15ElementorButtonTypographyMetricsManifestV1,
  type P15ElementorButtonTypographyMetricsResultV1,
} from '../src/targets/elementor/button-typography-metrics-resolution';
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
    title: 'Button typography metrics private source',
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
            url: 'https://example.com/path',
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
  buttons: P15ElementorButtonTypographyMetricsManifestV1['buttons'],
): P15ElementorButtonTypographyMetricsManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    buttons,
    styleInferencePerformed: false,
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
  if (typeof element !== 'object' || element === null || Array.isArray(element)) {
    throw new Error('expected element object');
  }
  const settings = (element as Record<string, unknown>).settings;
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    throw new Error('expected settings object');
  }
  return settings as Record<string, unknown>;
}

function sliderPx(size: number): Record<string, unknown> {
  return { unit: 'px', size, sizes: [] };
}

describe('P15 Fast Batch Button typography metrics', () => {
  it('writes exact custom starter plus literal font family only', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonTypographyMetrics(source, manifest(source, [{
      sourceNodeId: 'button',
      fontFamily: 'IBM Plex Sans',
    }]));

    expect(P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE.typographyGroupSourceBlobSha)
      .toBe('eea951b6331bd84c80e24b7fb6ab249e5c4c41a1');
    expect(result.status).toBe('BUTTON_TYPOGRAPHY_METRICS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.typography_typography).toBe('custom');
    expect(settings.typography_font_family).toBe('IBM Plex Sans');
    expect(settings).not.toHaveProperty('typography_font_size');
    expect(settings).not.toHaveProperty('typography_line_height');
    expect(settings).not.toHaveProperty('typography_letter_spacing');
    expect(settings).not.toHaveProperty('typography_word_spacing');
  });

  it('applies all five desktop metrics deterministically and preserves Button link/alignment binding', () => {
    const source = sourceDocument();
    const batch = manifest(source, [{
      sourceNodeId: 'linked-button',
      fontFamily: 'Inter',
      fontSizePx: 18,
      lineHeightPx: 28,
      letterSpacingPx: -0.2,
      wordSpacingPx: 4,
    }]);

    const first = resolveP15ElementorButtonTypographyMetrics(source, batch);
    const second = resolveP15ElementorButtonTypographyMetrics(source, batch);
    expect(first).toEqual(second);
    expect(first.status).toBe('BUTTON_TYPOGRAPHY_METRICS_RESOLVED');

    const settings = settingsOf(first.template?.content[0]?.elements[2]?.elements[0]);
    expect(settings.link).toEqual({
      url: 'https://example.com/path',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(settings.align).toBe('right');
    expect(settings.typography_typography).toBe('custom');
    expect(settings.typography_font_family).toBe('Inter');
    expect(settings.typography_font_size).toEqual(sliderPx(18));
    expect(settings.typography_line_height).toEqual(sliderPx(28));
    expect(settings.typography_letter_spacing).toEqual(sliderPx(-0.2));
    expect(settings.typography_word_spacing).toEqual(sliderPx(4));
    for (const key of Object.keys(settings)) {
      expect(key.endsWith('_tablet')).toBe(false);
      expect(key.endsWith('_mobile')).toBe(false);
    }
  });

  it('rejects stale replay, non-Button ids, empty entries and unknown fields', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'button', fontSizePx: 16 }]);

    expect(resolveP15ElementorButtonTypographyMetrics(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_FINGERPRINT_MISMATCH');

    expect(resolveP15ElementorButtonTypographyMetrics(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_BASE_CANDIDATE_IDENTITY_MISMATCH');

    expect(resolveP15ElementorButtonTypographyMetrics(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'heading', fontSizePx: 16 }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_NOT_BUTTON');

    expect(resolveP15ElementorButtonTypographyMetrics(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_OVERRIDE_REQUIRED');

    expect(resolveP15ElementorButtonTypographyMetrics(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button', fontSizePx: 16, fontWeight: '700' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_ENTRY_INVALID');
  });

  it('enforces literal font family and bounded desktop px metric values', () => {
    const source = sourceDocument();

    for (const fontFamily of ['', ' Inter', 'Inter, sans-serif', '"Inter"', 'var(--font)', 'A'.repeat(129), 12]) {
      expect(resolveP15ElementorButtonTypographyMetrics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', fontFamily }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_FONT_FAMILY_INVALID');
    }

    for (const fontSizePx of [0, 201, 16.5, '16']) {
      expect(resolveP15ElementorButtonTypographyMetrics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', fontSizePx }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_FONT_SIZE_INVALID');
    }

    for (const lineHeightPx of [0, 401, 20.5, '20']) {
      expect(resolveP15ElementorButtonTypographyMetrics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', lineHeightPx }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_LINE_HEIGHT_INVALID');
    }

    for (const letterSpacingPx of [-5.1, 10.1, 0.15, '1']) {
      expect(resolveP15ElementorButtonTypographyMetrics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', letterSpacingPx }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_LETTER_SPACING_INVALID');
    }

    for (const wordSpacingPx of [-1, 51, 1.5, '1']) {
      expect(resolveP15ElementorButtonTypographyMetrics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', wordSpacingPx }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_WORD_SPACING_INVALID');
    }
  });

  it('accepts exact declared boundaries without responsive inference', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonTypographyMetrics(source, manifest(source, [{
      sourceNodeId: 'button',
      fontSizePx: 200,
      lineHeightPx: 400,
      letterSpacingPx: -5,
      wordSpacingPx: 50,
    }]));

    expect(result.status).toBe('BUTTON_TYPOGRAPHY_METRICS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.typography_font_size).toEqual(sliderPx(200));
    expect(settings.typography_line_height).toEqual(sliderPx(400));
    expect(settings.typography_letter_spacing).toEqual(sliderPx(-5));
    expect(settings.typography_word_spacing).toEqual(sliderPx(50));
    expect(settings).not.toHaveProperty('typography_font_size_tablet');
    expect(settings).not.toHaveProperty('typography_font_size_mobile');
    expect(settings).not.toHaveProperty('typography_line_height_tablet');
    expect(settings).not.toHaveProperty('typography_letter_spacing_mobile');
  });

  it('supports empty manifests, rejects authority inflation and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const empty = resolveP15ElementorButtonTypographyMetrics(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_TYPOGRAPHY_METRICS_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);

    const raw = manifest(source, [{
      sourceNodeId: 'button',
      fontFamily: 'Inter',
      fontSizePx: 16,
      lineHeightPx: 24,
      letterSpacingPx: 0.1,
      wordSpacingPx: 2,
    }]);

    for (const inflation of [
      { styleInferencePerformed: true },
      { responsiveInferencePerformed: true },
      { figmaMutation: true },
      { networkAccess: true },
      { responsiveClosureClaim: true },
      { targetCompatibilityClaim: true },
      { productionAcceptance: true },
      { downloadEnabled: true },
    ]) {
      expect(resolveP15ElementorButtonTypographyMetrics(source, { ...raw, ...inflation })
        .issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TYPOGRAPHY_METRICS_AUTHORITY_FLAGS_INVALID');
    }

    const result = resolveP15ElementorButtonTypographyMetrics(source, raw);
    const serialized = serializeP15ElementorButtonTypographyMetricsSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/path');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"fontFamilySettingKey": "typography_font_family"');
    expect(serialized).toContain('"fontSizeSettingKey": "typography_font_size"');
    expect(serialized).toContain('"lineHeightSettingKey": "typography_line_height"');
    expect(serialized).toContain('"letterSpacingSettingKey": "typography_letter_spacing"');
    expect(serialized).toContain('"wordSpacingSettingKey": "typography_word_spacing"');
    expect(serialized).toContain('"responsiveWritesIncluded": false');

    const inflated = { ...result, networkAccess: true } as unknown as P15ElementorButtonTypographyMetricsResultV1;
    expect(() => serializeP15ElementorButtonTypographyMetricsSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
