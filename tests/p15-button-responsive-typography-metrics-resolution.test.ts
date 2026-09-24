import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_EVIDENCE,
  P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_MANIFEST_VERSION,
  resolveP15ElementorButtonResponsiveTypographyMetrics,
  serializeP15ElementorButtonResponsiveTypographyMetricsSummary,
  type P15ElementorButtonResponsiveTypographyMetricsManifestV1,
  type P15ElementorButtonResponsiveTypographyMetricsResultV1,
} from '../src/targets/elementor/button-responsive-typography-metrics-resolution';
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
    title: 'Responsive Button typography private source',
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
  buttons: P15ElementorButtonResponsiveTypographyMetricsManifestV1['buttons'],
): P15ElementorButtonResponsiveTypographyMetricsManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_MANIFEST_VERSION,
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

describe('P15 Fast Batch responsive Button typography metrics', () => {
  it('writes explicit tablet font size only and leaves desktop/mobile metric keys absent', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonResponsiveTypographyMetrics(source, manifest(source, [{
      sourceNodeId: 'button',
      tabletFontSizePx: 18,
    }]));

    expect(P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_EVIDENCE.typographyGroupSourceBlobSha)
      .toBe('eea951b6331bd84c80e24b7fb6ab249e5c4c41a1');
    expect(P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_EVIDENCE.controlsStackSourceBlobSha)
      .toBe('00b280e518b89925c8f85a059b34136177ff3d4d');
    expect(result.status).toBe('BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_RESOLVED');

    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.typography_typography).toBe('custom');
    expect(settings.typography_font_size_tablet).toEqual(sliderPx(18));
    expect(settings).not.toHaveProperty('typography_font_size');
    expect(settings).not.toHaveProperty('typography_font_size_mobile');
    expect(settings).not.toHaveProperty('typography_line_height_tablet');
    expect(settings).not.toHaveProperty('typography_letter_spacing_tablet');
    expect(settings).not.toHaveProperty('typography_word_spacing_tablet');
  });

  it('applies all four responsive capabilities across tablet/mobile deterministically and preserves Button binding', () => {
    const source = sourceDocument();
    const batch = manifest(source, [{
      sourceNodeId: 'linked-button',
      tabletFontSizePx: 20,
      mobileFontSizePx: 16,
      tabletLineHeightPx: 30,
      mobileLineHeightPx: 24,
      tabletLetterSpacingPx: -0.2,
      mobileLetterSpacingPx: 0.1,
      tabletWordSpacingPx: 4,
      mobileWordSpacingPx: 2,
    }]);

    const first = resolveP15ElementorButtonResponsiveTypographyMetrics(source, batch);
    const second = resolveP15ElementorButtonResponsiveTypographyMetrics(source, batch);
    expect(first).toEqual(second);

    const settings = settingsOf(first.template?.content[0]?.elements[2]?.elements[0]);
    expect(settings.link).toEqual({
      url: 'https://example.com/path',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(settings.align).toBe('right');
    expect(settings.typography_typography).toBe('custom');
    expect(settings.typography_font_size_tablet).toEqual(sliderPx(20));
    expect(settings.typography_font_size_mobile).toEqual(sliderPx(16));
    expect(settings.typography_line_height_tablet).toEqual(sliderPx(30));
    expect(settings.typography_line_height_mobile).toEqual(sliderPx(24));
    expect(settings.typography_letter_spacing_tablet).toEqual(sliderPx(-0.2));
    expect(settings.typography_letter_spacing_mobile).toEqual(sliderPx(0.1));
    expect(settings.typography_word_spacing_tablet).toEqual(sliderPx(4));
    expect(settings.typography_word_spacing_mobile).toEqual(sliderPx(2));
    expect(settings).not.toHaveProperty('typography_font_size');
    expect(settings).not.toHaveProperty('typography_line_height');
    expect(settings).not.toHaveProperty('typography_letter_spacing');
    expect(settings).not.toHaveProperty('typography_word_spacing');
  });

  it('rejects stale replay, non-Button ids, empty entries and unknown fields', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'button', tabletFontSizePx: 16 }]);

    expect(resolveP15ElementorButtonResponsiveTypographyMetrics(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_SOURCE_FINGERPRINT_MISMATCH');

    expect(resolveP15ElementorButtonResponsiveTypographyMetrics(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_BASE_CANDIDATE_IDENTITY_MISMATCH');

    expect(resolveP15ElementorButtonResponsiveTypographyMetrics(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'heading', tabletFontSizePx: 16 }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_SOURCE_NOT_BUTTON');

    expect(resolveP15ElementorButtonResponsiveTypographyMetrics(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_OVERRIDE_REQUIRED');

    expect(resolveP15ElementorButtonResponsiveTypographyMetrics(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button', tabletFontSizePx: 16, tabletFontFamily: 'Inter' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_ENTRY_INVALID');
  });

  it('enforces bounded px values independently for tablet and mobile', () => {
    const source = sourceDocument();

    for (const value of [0, 201, 16.5, '16']) {
      expect(resolveP15ElementorButtonResponsiveTypographyMetrics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', tabletFontSizePx: value }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_FONT_SIZE_INVALID');
    }

    for (const value of [0, 401, 20.5, '20']) {
      expect(resolveP15ElementorButtonResponsiveTypographyMetrics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', mobileLineHeightPx: value }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_LINE_HEIGHT_INVALID');
    }

    for (const value of [-5.1, 10.1, 0.15, '1']) {
      expect(resolveP15ElementorButtonResponsiveTypographyMetrics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', tabletLetterSpacingPx: value }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_LETTER_SPACING_INVALID');
    }

    for (const value of [-1, 51, 1.5, '1']) {
      expect(resolveP15ElementorButtonResponsiveTypographyMetrics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', mobileWordSpacingPx: value }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_WORD_SPACING_INVALID');
    }
  });

  it('accepts exact declared boundaries while omitted responsive keys remain absent', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonResponsiveTypographyMetrics(source, manifest(source, [{
      sourceNodeId: 'button',
      tabletFontSizePx: 200,
      mobileLineHeightPx: 400,
      tabletLetterSpacingPx: -5,
      mobileWordSpacingPx: 50,
    }]));

    expect(result.status).toBe('BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.typography_font_size_tablet).toEqual(sliderPx(200));
    expect(settings.typography_line_height_mobile).toEqual(sliderPx(400));
    expect(settings.typography_letter_spacing_tablet).toEqual(sliderPx(-5));
    expect(settings.typography_word_spacing_mobile).toEqual(sliderPx(50));

    expect(settings).not.toHaveProperty('typography_font_size_mobile');
    expect(settings).not.toHaveProperty('typography_line_height_tablet');
    expect(settings).not.toHaveProperty('typography_letter_spacing_mobile');
    expect(settings).not.toHaveProperty('typography_word_spacing_tablet');
  });

  it('supports empty manifests, rejects authority inflation and serializes sanitized responsive evidence only', () => {
    const source = sourceDocument();
    const empty = resolveP15ElementorButtonResponsiveTypographyMetrics(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);

    const raw = manifest(source, [{
      sourceNodeId: 'button',
      tabletFontSizePx: 18,
      mobileLineHeightPx: 24,
      tabletLetterSpacingPx: 0.2,
      mobileWordSpacingPx: 2,
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
      expect(resolveP15ElementorButtonResponsiveTypographyMetrics(source, { ...raw, ...inflation })
        .issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_AUTHORITY_FLAGS_INVALID');
    }

    const result = resolveP15ElementorButtonResponsiveTypographyMetrics(source, raw);
    const serialized = serializeP15ElementorButtonResponsiveTypographyMetricsSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/path');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"responsiveSuffixRule": "<id>_<device>"');
    expect(serialized).toContain('"fontSizeTabletSettingKey": "typography_font_size_tablet"');
    expect(serialized).toContain('"lineHeightMobileSettingKey": "typography_line_height_mobile"');
    expect(serialized).toContain('"desktopWritesIncluded": false');
    expect(serialized).toContain('"customBreakpointsIncluded": false');

    const inflated = { ...result, networkAccess: true } as unknown as P15ElementorButtonResponsiveTypographyMetricsResultV1;
    expect(() => serializeP15ElementorButtonResponsiveTypographyMetricsSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
