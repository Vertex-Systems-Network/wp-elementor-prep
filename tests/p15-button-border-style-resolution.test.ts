import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_BORDER_STYLE_EVIDENCE,
  P15_ELEMENTOR_BUTTON_BORDER_STYLE_MANIFEST_VERSION,
  P15_ELEMENTOR_BUTTON_BORDER_TYPES,
  resolveP15ElementorButtonBorderStyles,
  serializeP15ElementorButtonBorderStyleSummary,
  type P15ElementorButtonBorderStyleManifestV1,
  type P15ElementorButtonBorderStyleResultV1,
} from '../src/targets/elementor/button-border-style-resolution';
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
    title: 'Button normal border private source',
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
  buttons: P15ElementorButtonBorderStyleManifestV1['buttons'],
): P15ElementorButtonBorderStyleManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_BORDER_STYLE_MANIFEST_VERSION,
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
  if (typeof element !== 'object' || element === null || Array.isArray(element)) throw new Error('expected element object');
  const settings = (element as Record<string, unknown>).settings;
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) throw new Error('expected settings object');
  return settings as Record<string, unknown>;
}

describe('P15 Fast Batch Button normal border styling', () => {
  it('writes exact border type, desktop px width and color keys as one explicit profile', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonBorderStyles(source, manifest(source, [{
      sourceNodeId: 'button',
      borderType: 'solid',
      widthPx: { top: 2, right: 3, bottom: 4, left: 5 },
      color: '#1a2b3c',
    }]));

    expect(P15_ELEMENTOR_BUTTON_BORDER_STYLE_EVIDENCE.borderGroupSourceBlobSha)
      .toBe('eac53e6b1014a985d1d17f90a4044cfb0c6c33c5');
    expect(P15_ELEMENTOR_BUTTON_BORDER_STYLE_EVIDENCE.groupBaseSourceBlobSha)
      .toBe('6117c06b286dbec336eefe63475c747e2fda0234');
    expect(P15_ELEMENTOR_BUTTON_BORDER_STYLE_EVIDENCE.dimensionsControlSourceBlobSha)
      .toBe('7de34809d407e5fa208935b77a6b6648c72d3c5d');
    expect(P15_ELEMENTOR_BUTTON_BORDER_STYLE_EVIDENCE.controlsStackSourceBlobSha)
      .toBe('00b280e518b89925c8f85a059b34136177ff3d4d');

    expect(result.status).toBe('BUTTON_BORDER_STYLES_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.text).toBe('PRIVATE BUTTON COPY');
    expect(settings.align).toBe('left');
    expect(settings.border_border).toBe('solid');
    expect(settings.border_width).toEqual({
      unit: 'px',
      top: '2',
      right: '3',
      bottom: '4',
      left: '5',
      isLinked: false,
    });
    expect(settings.border_color).toBe('#1a2b3c');
    expect(settings).not.toHaveProperty('border_width_tablet');
    expect(settings).not.toHaveProperty('border_width_mobile');
    expect(settings).not.toHaveProperty('border_radius');
    expect(settings).not.toHaveProperty('text_padding');
    expect(settings).not.toHaveProperty('button_hover_border_color');
  });

  it('supports all retained visible border styles and derives linked width truthfully', () => {
    const source = sourceDocument();
    expect(P15_ELEMENTOR_BUTTON_BORDER_TYPES)
      .toEqual(['solid', 'double', 'dotted', 'dashed', 'groove']);

    for (const borderType of P15_ELEMENTOR_BUTTON_BORDER_TYPES) {
      const result = resolveP15ElementorButtonBorderStyles(source, manifest(source, [{
        sourceNodeId: 'button',
        borderType,
        widthPx: { top: 4, right: 4, bottom: 4, left: 4 },
        color: '#abcdef',
      }]));
      expect(result.status).toBe('BUTTON_BORDER_STYLES_RESOLVED');
      const settings = settingsOf(result.template?.content[0]?.elements[0]);
      expect(settings.border_border).toBe(borderType);
      expect(settings.border_width).toEqual({
        unit: 'px',
        top: '4',
        right: '4',
        bottom: '4',
        left: '4',
        isLinked: true,
      });
    }
  });

  it('preserves exact linked Button binding and unrelated settings', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonBorderStyles(source, manifest(source, [{
      sourceNodeId: 'linked-button',
      borderType: 'dashed',
      widthPx: { top: 1, right: 2, bottom: 1, left: 2 },
      color: '#334455',
    }]));

    expect(result.status).toBe('BUTTON_BORDER_STYLES_RESOLVED');
    const root = result.template?.content[0];
    expect(settingsOf(root?.elements[0])).not.toHaveProperty('border_border');

    const linked = settingsOf(root?.elements[2]?.elements[0]);
    expect(linked.link).toEqual({
      url: 'https://example.com/path',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(linked.align).toBe('right');
    expect(linked.border_border).toBe('dashed');
    expect(linked.border_color).toBe('#334455');
  });

  it('rejects stale replay, non-Button ids, unknown fields and unsupported border types', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{
      sourceNodeId: 'button',
      borderType: 'solid',
      widthPx: { top: 1, right: 1, bottom: 1, left: 1 },
      color: '#123456',
    }]);

    const staleSource = resolveP15ElementorButtonBorderStyles(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_BORDER_STYLE_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorButtonBorderStyles(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const nonButton = resolveP15ElementorButtonBorderStyles(source, {
      ...manifest(source, []),
      buttons: [{
        sourceNodeId: 'heading',
        borderType: 'solid',
        widthPx: { top: 1, right: 1, bottom: 1, left: 1 },
        color: '#123456',
      }],
    });
    expect(nonButton.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_BORDER_STYLE_SOURCE_NOT_BUTTON');

    for (const borderType of ['', 'none', 'ridge', 'SOLID']) {
      const invalid = resolveP15ElementorButtonBorderStyles(source, {
        ...manifest(source, []),
        buttons: [{
          sourceNodeId: 'button',
          borderType,
          widthPx: { top: 1, right: 1, bottom: 1, left: 1 },
          color: '#123456',
        }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_BORDER_STYLE_TYPE_INVALID');
    }

    const unknown = resolveP15ElementorButtonBorderStyles(source, {
      ...valid,
      buttons: [{ ...valid.buttons[0], borderRadius: 4 }],
    });
    expect(unknown.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_BORDER_STYLE_ENTRY_INVALID');
  });

  it('rejects out-of-bound/non-integer widths and non-canonical colors', () => {
    const source = sourceDocument();

    for (const widthPx of [
      { top: -1, right: 1, bottom: 1, left: 1 },
      { top: 101, right: 1, bottom: 1, left: 1 },
      { top: 1.5, right: 1, bottom: 1, left: 1 },
      { top: '1', right: 1, bottom: 1, left: 1 },
      { top: 1, right: 1, bottom: 1, left: 1, unit: 'em' },
    ]) {
      const invalid = resolveP15ElementorButtonBorderStyles(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', borderType: 'solid', widthPx, color: '#123456' }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_BORDER_STYLE_WIDTH_INVALID');
    }

    for (const color of ['#ABCDEF', '#123', 'rgba(0,0,0,.5)', 'red']) {
      const invalid = resolveP15ElementorButtonBorderStyles(source, {
        ...manifest(source, []),
        buttons: [{
          sourceNodeId: 'button',
          borderType: 'solid',
          widthPx: { top: 1, right: 1, bottom: 1, left: 1 },
          color,
        }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_BORDER_STYLE_COLOR_INVALID');
    }
  });

  it('is deterministic, supports empty manifests and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{
      sourceNodeId: 'button',
      borderType: 'double',
      widthPx: { top: 3, right: 3, bottom: 3, left: 3 },
      color: '#445566',
    }]);

    const first = resolveP15ElementorButtonBorderStyles(source, raw);
    const second = resolveP15ElementorButtonBorderStyles(source, raw);
    expect(first).toEqual(second);

    const empty = resolveP15ElementorButtonBorderStyles(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_BORDER_STYLE_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);

    const serialized = serializeP15ElementorButtonBorderStyleSummary(first);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/path');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"borderTypeSettingKey": "border_border"');
    expect(serialized).toContain('"borderWidthSettingKey": "border_width"');
    expect(serialized).toContain('"borderColorSettingKey": "border_color"');

    const inflated = { ...first, targetCompatibilityClaim: true } as unknown as P15ElementorButtonBorderStyleResultV1;
    expect(() => serializeP15ElementorButtonBorderStyleSummary(inflated))
      .toThrow(/authority-inflated/);
  });

  it('rejects authority inflation', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{
      sourceNodeId: 'button',
      borderType: 'groove',
      widthPx: { top: 2, right: 2, bottom: 2, left: 2 },
      color: '#abcdef',
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
      const invalid = resolveP15ElementorButtonBorderStyles(source, { ...raw, ...inflation });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_BORDER_STYLE_AUTHORITY_FLAGS_INVALID');
    }
  });
});
