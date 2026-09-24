import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_EVIDENCE,
  P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_MANIFEST_VERSION,
  resolveP15ElementorButtonTypographyBasics,
  serializeP15ElementorButtonTypographyBasicsSummary,
  type P15ElementorButtonTypographyBasicsManifestV1,
  type P15ElementorButtonTypographyBasicsResultV1,
} from '../src/targets/elementor/button-typography-basics-resolution';
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
    title: 'Button typography private source',
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
  buttons: P15ElementorButtonTypographyBasicsManifestV1['buttons'],
): P15ElementorButtonTypographyBasicsManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_MANIFEST_VERSION,
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

describe('P15 Fast Batch Button typography basics', () => {
  it('writes exact custom typography starter plus bounded font weight only', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonTypographyBasics(source, manifest(source, [{
      sourceNodeId: 'button',
      fontWeight: '700',
    }]));

    expect(P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_EVIDENCE.typographyGroupSourceBlobSha)
      .toBe('eea951b6331bd84c80e24b7fb6ab249e5c4c41a1');
    expect(result.status).toBe('BUTTON_TYPOGRAPHY_BASICS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.typography_typography).toBe('custom');
    expect(settings.typography_font_weight).toBe('700');
    expect(settings).not.toHaveProperty('typography_text_transform');
    expect(settings).not.toHaveProperty('typography_font_style');
    expect(settings).not.toHaveProperty('typography_font_family');
    expect(settings).not.toHaveProperty('typography_font_size');
  });

  it('writes exact text transform and font style without unrelated typography', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonTypographyBasics(source, manifest(source, [{
      sourceNodeId: 'button',
      textTransform: 'uppercase',
      fontStyle: 'italic',
    }]));

    expect(result.status).toBe('BUTTON_TYPOGRAPHY_BASICS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.typography_typography).toBe('custom');
    expect(settings.typography_text_transform).toBe('uppercase');
    expect(settings.typography_font_style).toBe('italic');
    expect(settings).not.toHaveProperty('typography_font_weight');
    expect(settings).not.toHaveProperty('text_padding');
  });

  it('applies all three capabilities deterministically and preserves exact link binding', () => {
    const source = sourceDocument();
    const batch = manifest(source, [{
      sourceNodeId: 'linked-button',
      fontWeight: 'bold',
      textTransform: 'capitalize',
      fontStyle: 'oblique',
    }]);

    const first = resolveP15ElementorButtonTypographyBasics(source, batch);
    const second = resolveP15ElementorButtonTypographyBasics(source, batch);
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
    expect(settings.typography_font_weight).toBe('bold');
    expect(settings.typography_text_transform).toBe('capitalize');
    expect(settings.typography_font_style).toBe('oblique');
  });

  it('rejects stale replay, non-Button ids, empty entries and unknown fields', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'button', fontWeight: '400' }]);

    expect(resolveP15ElementorButtonTypographyBasics(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TYPOGRAPHY_BASICS_SOURCE_FINGERPRINT_MISMATCH');

    expect(resolveP15ElementorButtonTypographyBasics(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TYPOGRAPHY_BASICS_BASE_CANDIDATE_IDENTITY_MISMATCH');

    expect(resolveP15ElementorButtonTypographyBasics(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'heading', fontWeight: '400' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TYPOGRAPHY_BASICS_SOURCE_NOT_BUTTON');

    expect(resolveP15ElementorButtonTypographyBasics(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TYPOGRAPHY_BASICS_OVERRIDE_REQUIRED');

    expect(resolveP15ElementorButtonTypographyBasics(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button', fontWeight: '400', fontFamily: 'Arial' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TYPOGRAPHY_BASICS_ENTRY_INVALID');
  });

  it('rejects values outside exact Elementor select vocabularies', () => {
    const source = sourceDocument();

    for (const fontWeight of ['50', '950', 700, 'semi-bold', '']) {
      expect(resolveP15ElementorButtonTypographyBasics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', fontWeight }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TYPOGRAPHY_BASICS_FONT_WEIGHT_INVALID');
    }

    for (const textTransform of ['UPPERCASE', 'inherit', '', 1]) {
      expect(resolveP15ElementorButtonTypographyBasics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', textTransform }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TYPOGRAPHY_BASICS_TEXT_TRANSFORM_INVALID');
    }

    for (const fontStyle of ['inherit', 'bold', '', 1]) {
      expect(resolveP15ElementorButtonTypographyBasics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', fontStyle }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TYPOGRAPHY_BASICS_FONT_STYLE_INVALID');
    }
  });

  it('supports empty manifests, rejects authority inflation and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const empty = resolveP15ElementorButtonTypographyBasics(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_TYPOGRAPHY_BASICS_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);

    const raw = manifest(source, [{
      sourceNodeId: 'button',
      fontWeight: '600',
      textTransform: 'lowercase',
      fontStyle: 'normal',
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
      expect(resolveP15ElementorButtonTypographyBasics(source, { ...raw, ...inflation })
        .issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TYPOGRAPHY_BASICS_AUTHORITY_FLAGS_INVALID');
    }

    const result = resolveP15ElementorButtonTypographyBasics(source, raw);
    const serialized = serializeP15ElementorButtonTypographyBasicsSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/path');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"starterSettingKey": "typography_typography"');
    expect(serialized).toContain('"fontWeightSettingKey": "typography_font_weight"');
    expect(serialized).toContain('"textTransformSettingKey": "typography_text_transform"');
    expect(serialized).toContain('"fontStyleSettingKey": "typography_font_style"');

    const inflated = { ...result, networkAccess: true } as unknown as P15ElementorButtonTypographyBasicsResultV1;
    expect(() => serializeP15ElementorButtonTypographyBasicsSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
