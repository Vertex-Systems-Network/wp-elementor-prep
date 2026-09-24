import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_EVIDENCE,
  P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MANIFEST_VERSION,
  resolveP15ElementorButtonHoverTextColors,
  serializeP15ElementorButtonHoverTextColorSummary,
  type P15ElementorButtonHoverTextColorManifestV1,
  type P15ElementorButtonHoverTextColorResultV1,
} from '../src/targets/elementor/button-hover-text-color-resolution';
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
    title: 'Button hover text private source',
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
  buttons: P15ElementorButtonHoverTextColorManifestV1['buttons'],
): P15ElementorButtonHoverTextColorManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MANIFEST_VERSION,
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
  if (typeof element !== 'object' || element === null || Array.isArray(element)) {
    throw new Error('expected element object');
  }
  const settings = (element as Record<string, unknown>).settings;
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    throw new Error('expected settings object');
  }
  return settings as Record<string, unknown>;
}

describe('P15 exact source-bound Button hover text color resolution', () => {
  it('writes only hover_color and preserves normal text/background settings', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonHoverTextColors(source, manifest(source, [
      { sourceNodeId: 'button', color: '#1a2b3c' },
    ]));

    expect(P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
      buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
      hoverTabName: 'tab_button_hover',
      controlName: 'hover_color',
      settingKey: 'hover_color',
      normalTextControlName: 'button_text_color',
      normalBackgroundGroupName: 'background',
      hoverBackgroundGroupName: 'button_background_hover',
      buttonSelector: '{{WRAPPER}} .elementor-button:hover, {{WRAPPER}} .elementor-button:focus',
      svgSelector: '{{WRAPPER}} .elementor-button:hover svg, {{WRAPPER}} .elementor-button:focus svg',
      acceptedColorPattern: '^#[0-9a-f]{6}$',
    });

    expect(result.status).toBe('BUTTON_HOVER_TEXT_COLORS_RESOLVED');
    expect(result.sourceButtonCount).toBe(2);
    expect(result.resolvedButtonCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.text).toBe('PRIVATE BUTTON COPY');
    expect(settings.align).toBe('left');
    expect(settings.hover_color).toBe('#1a2b3c');
    expect(settings).not.toHaveProperty('button_text_color');
    expect(settings).not.toHaveProperty('background_background');
    expect(settings).not.toHaveProperty('background_color');
    expect(settings).not.toHaveProperty('button_background_hover_background');
    expect(settings).not.toHaveProperty('button_background_hover_color');

    expect(result.resolvedHoverColors).toEqual([{ sourceNodeId: 'button', color: '#1a2b3c' }]);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.colorInferencePerformed).toBe(false);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('preserves exact generated link object and targets only the requested nested Button', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonHoverTextColors(source, manifest(source, [
      { sourceNodeId: 'linked-button', color: '#abcdef' },
    ]));

    expect(result.status).toBe('BUTTON_HOVER_TEXT_COLORS_RESOLVED');
    const root = result.template?.content[0];
    expect(settingsOf(root?.elements[0])).not.toHaveProperty('hover_color');

    const linked = settingsOf(root?.elements[2]?.elements[0]);
    expect(linked.text).toBe('PRIVATE LINKED BUTTON');
    expect(linked.align).toBe('right');
    expect(linked.link).toEqual({
      url: 'https://example.com/path',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(linked.hover_color).toBe('#abcdef');
  });

  it('is deterministic for multiple hover colors and an empty manifest', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonHoverTextColors(source, manifest(source, [
      { sourceNodeId: 'linked-button', color: '#445566' },
      { sourceNodeId: 'button', color: '#112233' },
    ]));
    expect(result.resolvedHoverColors).toEqual([
      { sourceNodeId: 'button', color: '#112233' },
      { sourceNodeId: 'linked-button', color: '#445566' },
    ]);

    const first = resolveP15ElementorButtonHoverTextColors(source, manifest(source, []));
    const second = resolveP15ElementorButtonHoverTextColors(source, manifest(source, []));
    expect(first.status).toBe('NO_BUTTON_HOVER_TEXT_COLOR_OVERRIDES');
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first).toEqual(second);
  });

  it('fails closed for stale replay and invalid ids/colors', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'button', color: '#123456' }]);

    const staleSource = resolveP15ElementorButtonHoverTextColors(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_TEXT_COLOR_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorButtonHoverTextColors(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const nonButton = resolveP15ElementorButtonHoverTextColors(source, manifest(source, [
      { sourceNodeId: 'heading', color: '#112233' },
    ]));
    expect(nonButton.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_TEXT_COLOR_SOURCE_NOT_BUTTON');

    for (const color of [
      '', '#fff', '#ABCDEF', '#11223344', 'red', 'transparent',
      'rgba(1,2,3,0.5)', 'var(--e-global-color-accent)', 'global:accent',
    ]) {
      const invalid = resolveP15ElementorButtonHoverTextColors(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', color }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_HOVER_TEXT_COLOR_VALUE_INVALID');
    }
  });

  it('rejects attempts to broaden into normal/background fields or authority', () => {
    const source = sourceDocument();

    for (const extra of [
      { normalTextColor: '#654321' },
      { normalBackgroundColor: '#654321' },
      { hoverBackgroundColor: '#654321' },
    ]) {
      const invalid = resolveP15ElementorButtonHoverTextColors(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', color: '#123456', ...extra }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_HOVER_TEXT_COLOR_ENTRY_INVALID');
    }

    const raw = manifest(source, [{ sourceNodeId: 'button', color: '#123456' }]);
    for (const inflation of [
      { colorInferencePerformed: true },
      { responsiveInferencePerformed: true },
      { networkAccess: true },
      { targetCompatibilityClaim: true },
      { productionAcceptance: true },
      { downloadEnabled: true },
    ]) {
      const invalid = resolveP15ElementorButtonHoverTextColors(source, { ...raw, ...inflation });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_HOVER_TEXT_COLOR_AUTHORITY_FLAGS_INVALID');
    }
  });

  it('serializes sanitized hover metadata only', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonHoverTextColors(
      source,
      manifest(source, [{ sourceNodeId: 'button', color: '#123456' }]),
    );
    const serialized = serializeP15ElementorButtonHoverTextColorSummary(result);

    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/path');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"settingKey": "hover_color"');
    expect(serialized).toContain('"hoverBackgroundGroupName": "button_background_hover"');
    expect(serialized).toContain('"color": "#123456"');

    const inflated = { ...result, networkAccess: true } as unknown as P15ElementorButtonHoverTextColorResultV1;
    expect(() => serializeP15ElementorButtonHoverTextColorSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
