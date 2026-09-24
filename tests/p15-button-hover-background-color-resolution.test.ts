import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_EVIDENCE,
  P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION,
  resolveP15ElementorButtonHoverBackgroundColors,
  serializeP15ElementorButtonHoverBackgroundColorSummary,
  type P15ElementorButtonHoverBackgroundColorManifestV1,
  type P15ElementorButtonHoverBackgroundColorResultV1,
} from '../src/targets/elementor/button-hover-background-color-resolution';
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
    title: 'Button hover background private source',
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
  buttons: P15ElementorButtonHoverBackgroundColorManifestV1['buttons'],
): P15ElementorButtonHoverBackgroundColorManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    buttons,
    colorInferencePerformed: false,
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

describe('P15 Button hover classic background color', () => {
  it('writes only background_background=classic plus background_color', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, [
      { sourceNodeId: 'button', color: '#1a2b3c' },
    ]));

    expect(P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
      buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
      backgroundGroupControlSourcePath: 'includes/controls/groups/background.php',
      backgroundGroupControlSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
      groupName: 'button_background_hover',
      backgroundTypeSettingKey: 'button_background_hover_background',
      backgroundColorSettingKey: 'button_background_hover_color',
      hoverTextColorControlName: 'hover_color',
      normalTextColorControlName: 'button_text_color',
      normalBackgroundGroupName: 'background',
      selector: '{{WRAPPER}} .elementor-button:hover, {{WRAPPER}} .elementor-button:focus',
      acceptedBackgroundType: 'classic',
      acceptedColorPattern: '^#[0-9a-f]{6}

    expect(result.status).toBe('BUTTON_HOVER_BACKGROUND_COLORS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.text).toBe('PRIVATE BUTTON COPY');
    expect(settings.align).toBe('left');
    expect(settings.button_background_hover_background).toBe('classic');
    expect(settings.button_background_hover_color).toBe('#1a2b3c');
    expect(settings).not.toHaveProperty('button_text_color');
    expect(settings).not.toHaveProperty('hover_color');
    expect(settings).not.toHaveProperty('background_background');
    expect(settings).not.toHaveProperty('background_color');
    expect(settings).not.toHaveProperty('button_background_hover_color_b');
    expect(settings).not.toHaveProperty('button_background_hover_gradient_type');
    expect(result.resolvedHoverBackgrounds).toEqual([{ sourceNodeId: 'button', color: '#1a2b3c' }]);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('preserves exact linked Button binding and targets only requested source id', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, [
      { sourceNodeId: 'linked-button', color: '#abcdef' },
    ]));
    const root = result.template?.content[0];
    expect(settingsOf(root?.elements[0])).not.toHaveProperty('button_background_hover_color');
    const linked = settingsOf(root?.elements[2]?.elements[0]);
    expect(linked.link).toEqual({
      url: 'https://example.com/path',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(linked.button_background_hover_background).toBe('classic');
    expect(linked.button_background_hover_color).toBe('#abcdef');
  });

  it('is deterministic and fails closed for stale replay', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, []));
    const second = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, []));
    expect(first.status).toBe('NO_BUTTON_HOVER_BACKGROUND_COLOR_OVERRIDES');
    expect(first).toEqual(second);

    const valid = manifest(source, [{ sourceNodeId: 'button', color: '#123456' }]);
    const staleSource = resolveP15ElementorButtonHoverBackgroundColors(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorButtonHoverBackgroundColors(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects invalid ids/colors and gradient/hover/type expansion fields', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, [
      { sourceNodeId: 'button', color: '#112233' },
      { sourceNodeId: 'button', color: '#445566' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_DUPLICATE_SOURCE_ID');

    const nonButton = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, [
      { sourceNodeId: 'heading', color: '#112233' },
    ]));
    expect(nonButton.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_SOURCE_NOT_BUTTON');

    for (const color of ['', '#fff', '#ABCDEF', '#11223344', 'red', 'transparent', 'var(--e-global-color-accent)']) {
      const invalid = resolveP15ElementorButtonHoverBackgroundColors(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', color }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_VALUE_INVALID');
    }

    for (const extra of [
      { backgroundType: 'gradient' },
      { gradientColor: '#654321' },
      { hoverTextColor: '#654321' },
      { normalBackgroundColor: '#654321' },
    ]) {
      const invalid = resolveP15ElementorButtonHoverBackgroundColors(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', color: '#123456', ...extra }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_ENTRY_INVALID');
    }
  });

  it('rejects authority inflation and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'button', color: '#123456' }]);

    const inflatedManifest = resolveP15ElementorButtonHoverBackgroundColors(source, {
      ...raw,
      productionAcceptance: true,
    });
    expect(inflatedManifest.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_AUTHORITY_FLAGS_INVALID');

    const result = resolveP15ElementorButtonHoverBackgroundColors(source, raw);
    const serialized = serializeP15ElementorButtonHoverBackgroundColorSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/path');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).toContain('"backgroundTypeSettingKey": "button_background_hover_background"');
    expect(serialized).toContain('"backgroundColorSettingKey": "button_background_hover_color"');
    expect(serialized).toContain('"acceptedBackgroundType": "classic"');

    const inflatedResult = { ...result, networkAccess: true } as unknown as P15ElementorButtonHoverBackgroundColorResultV1;
    expect(() => serializeP15ElementorButtonHoverBackgroundColorSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
,
    });

    expect(result.status).toBe('BUTTON_HOVER_BACKGROUND_COLORS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.text).toBe('PRIVATE BUTTON COPY');
    expect(settings.align).toBe('left');
    expect(settings.background_background).toBe('classic');
    expect(settings.background_color).toBe('#1a2b3c');
    expect(settings).not.toHaveProperty('button_text_color');
    expect(settings).not.toHaveProperty('hover_color');
    expect(settings).not.toHaveProperty('button_background_hover_background');
    expect(settings).not.toHaveProperty('button_background_hover_color');
    expect(settings).not.toHaveProperty('background_color_b');
    expect(result.resolvedHoverBackgrounds).toEqual([{ sourceNodeId: 'button', color: '#1a2b3c' }]);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('preserves exact linked Button binding and targets only requested source id', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, [
      { sourceNodeId: 'linked-button', color: '#abcdef' },
    ]));
    const root = result.template?.content[0];
    expect(settingsOf(root?.elements[0])).not.toHaveProperty('background_color');
    const linked = settingsOf(root?.elements[2]?.elements[0]);
    expect(linked.link).toEqual({
      url: 'https://example.com/path',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(linked.background_background).toBe('classic');
    expect(linked.background_color).toBe('#abcdef');
  });

  it('is deterministic and fails closed for stale replay', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, []));
    const second = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, []));
    expect(first.status).toBe('NO_BUTTON_HOVER_BACKGROUND_COLOR_OVERRIDES');
    expect(first).toEqual(second);

    const valid = manifest(source, [{ sourceNodeId: 'button', color: '#123456' }]);
    const staleSource = resolveP15ElementorButtonHoverBackgroundColors(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorButtonHoverBackgroundColors(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects invalid ids/colors and gradient/hover/type expansion fields', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, [
      { sourceNodeId: 'button', color: '#112233' },
      { sourceNodeId: 'button', color: '#445566' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_DUPLICATE_SOURCE_ID');

    const nonButton = resolveP15ElementorButtonHoverBackgroundColors(source, manifest(source, [
      { sourceNodeId: 'heading', color: '#112233' },
    ]));
    expect(nonButton.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_SOURCE_NOT_BUTTON');

    for (const color of ['', '#fff', '#ABCDEF', '#11223344', 'red', 'transparent', 'var(--e-global-color-accent)']) {
      const invalid = resolveP15ElementorButtonHoverBackgroundColors(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', color }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_VALUE_INVALID');
    }

    for (const extra of [
      { backgroundType: 'gradient' },
      { gradientColor: '#654321' },
      { hoverColor: '#654321' },
    ]) {
      const invalid = resolveP15ElementorButtonHoverBackgroundColors(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', color: '#123456', ...extra }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_ENTRY_INVALID');
    }
  });

  it('rejects authority inflation and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'button', color: '#123456' }]);

    const inflatedManifest = resolveP15ElementorButtonHoverBackgroundColors(source, {
      ...raw,
      productionAcceptance: true,
    });
    expect(inflatedManifest.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_BACKGROUND_COLOR_AUTHORITY_FLAGS_INVALID');

    const result = resolveP15ElementorButtonHoverBackgroundColors(source, raw);
    const serialized = serializeP15ElementorButtonHoverBackgroundColorSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/path');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).toContain('"backgroundTypeSettingKey": "background_background"');
    expect(serialized).toContain('"backgroundColorSettingKey": "background_color"');
    expect(serialized).toContain('"acceptedBackgroundType": "classic"');

    const inflatedResult = { ...result, networkAccess: true } as unknown as P15ElementorButtonHoverBackgroundColorResultV1;
    expect(() => serializeP15ElementorButtonHoverBackgroundColorSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
