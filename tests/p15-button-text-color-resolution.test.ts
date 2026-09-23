import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_TEXT_COLOR_EVIDENCE,
  P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION,
  resolveP15ElementorButtonTextColors,
  serializeP15ElementorButtonTextColorSummary,
  type P15ElementorButtonTextColorManifestV1,
  type P15ElementorButtonTextColorResultV1,
} from '../src/targets/elementor/button-text-color-resolution';
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
    title: 'Button color private source',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'root',
      direction: 'column',
      children: [
        {
          kind: 'button',
          sourceNodeId: 'button',
          text: 'PRIVATE BUTTON COPY',
          align: 'start',
        },
        {
          kind: 'heading',
          sourceNodeId: 'heading',
          text: 'PRIVATE HEADING COPY',
          level: 'h2',
        },
        {
          kind: 'text',
          sourceNodeId: 'text',
          text: 'PRIVATE TEXT COPY',
        },
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
  buttons: P15ElementorButtonTextColorManifestV1['buttons'],
): P15ElementorButtonTextColorManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION,
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

describe('P15 exact source-bound Button normal text color resolution', () => {
  it('writes only button_text_color and preserves exact text/alignment/no-link binding', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonTextColors(source, manifest(source, [
      { sourceNodeId: 'button', color: '#1a2b3c' },
    ]));

    expect(P15_ELEMENTOR_BUTTON_TEXT_COLOR_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
      buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
      controlName: 'button_text_color',
      settingKey: 'button_text_color',
      hoverControlName: 'hover_color',
      backgroundGroupName: 'background',
      selector: '{{WRAPPER}} .elementor-button',
      acceptedColorPattern: '^#[0-9a-f]{6}$',
    });

    expect(result.status).toBe('BUTTON_TEXT_COLORS_RESOLVED');
    expect(result.sourceButtonCount).toBe(2);
    expect(result.resolvedButtonCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.text).toBe('PRIVATE BUTTON COPY');
    expect(settings.align).toBe('left');
    expect(settings).not.toHaveProperty('link');
    expect(settings.button_text_color).toBe('#1a2b3c');
    expect(settings).not.toHaveProperty('hover_color');
    expect(settings).not.toHaveProperty('background_color');
    expect(settings).not.toHaveProperty('button_background_color');
    expect(settings).not.toHaveProperty('button_text_color_tablet');
    expect(settings).not.toHaveProperty('button_text_color_mobile');

    expect(result.resolvedColors).toEqual([
      { sourceNodeId: 'button', color: '#1a2b3c' },
    ]);
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.colorInferencePerformed).toBe(false);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('preserves exact generated Button link object while coloring a nested Button', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonTextColors(source, manifest(source, [
      { sourceNodeId: 'linked-button', color: '#abcdef' },
    ]));

    expect(result.status).toBe('BUTTON_TEXT_COLORS_RESOLVED');
    const root = result.template?.content[0];
    const firstButton = root?.elements[0];
    const heading = root?.elements[1];
    const text = root?.elements[2];
    const nested = root?.elements[3];
    const linkedButton = nested?.elements[0];

    expect(settingsOf(firstButton)).not.toHaveProperty('button_text_color');
    expect(settingsOf(heading)).not.toHaveProperty('button_text_color');
    expect(settingsOf(text)).not.toHaveProperty('button_text_color');

    const settings = settingsOf(linkedButton);
    expect(settings.text).toBe('PRIVATE LINKED BUTTON');
    expect(settings.align).toBe('right');
    expect(settings.link).toEqual({
      url: 'https://example.com/path',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(settings.button_text_color).toBe('#abcdef');
    expect(settings).not.toHaveProperty('hover_color');
  });

  it('sorts multiple resolved color summaries deterministically', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonTextColors(source, manifest(source, [
      { sourceNodeId: 'linked-button', color: '#445566' },
      { sourceNodeId: 'button', color: '#112233' },
    ]));

    expect(result.status).toBe('BUTTON_TEXT_COLORS_RESOLVED');
    expect(result.resolvedColors).toEqual([
      { sourceNodeId: 'button', color: '#112233' },
      { sourceNodeId: 'linked-button', color: '#445566' },
    ]);
  });

  it('returns a deterministic no-op when no Button color overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorButtonTextColors(source, manifest(source, []));
    const second = resolveP15ElementorButtonTextColors(source, manifest(source, []));

    expect(first.status).toBe('NO_BUTTON_TEXT_COLOR_OVERRIDES');
    expect(first.resolvedButtonCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'button', color: '#123456' }]);

    const staleSource = resolveP15ElementorButtonTextColors(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TEXT_COLOR_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorButtonTextColors(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicate/non-Button IDs, unsafe colors and hover/background fields', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorButtonTextColors(source, manifest(source, [
      { sourceNodeId: 'button', color: '#112233' },
      { sourceNodeId: 'button', color: '#445566' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TEXT_COLOR_DUPLICATE_SOURCE_ID');

    for (const sourceNodeId of ['root', 'heading', 'text']) {
      const nonButton = resolveP15ElementorButtonTextColors(source, manifest(source, [
        { sourceNodeId, color: '#112233' },
      ]));
      expect(nonButton.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TEXT_COLOR_SOURCE_NOT_BUTTON');
    }

    for (const color of [
      '',
      '#fff',
      '#ABCDEF',
      '#abcdEF',
      '#11223344',
      'red',
      'rgba(1,2,3,0.5)',
      'hsl(1 2% 3%)',
      'var(--global-color)',
      'var(--e-global-color-accent)',
      'global:accent',
      'transparent',
      123456,
      null,
      {},
    ]) {
      const invalid = resolveP15ElementorButtonTextColors(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', color }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TEXT_COLOR_VALUE_INVALID');
    }

    for (const extra of [
      { hoverColor: '#654321' },
      { backgroundColor: '#654321' },
    ]) {
      const invalid = resolveP15ElementorButtonTextColors(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', color: '#123456', ...extra }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_TEXT_COLOR_ENTRY_INVALID');
    }
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked Button color source',
      documentType: 'section',
      nodes: [{
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'column',
        children: [{
          kind: 'review',
          sourceNodeId: 'manual',
          reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW',
          detail: 'must remain blocked',
        }],
      }],
    };

    const blocked = resolveP15ElementorButtonTextColors(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'button', color: '#123456' }]);

    const inflatedColor = resolveP15ElementorButtonTextColors(source, {
      ...raw,
      colorInferencePerformed: true,
    });
    expect(inflatedColor.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TEXT_COLOR_AUTHORITY_FLAGS_INVALID');

    const inflatedProduction = resolveP15ElementorButtonTextColors(source, {
      ...raw,
      productionAcceptance: true,
    });
    expect(inflatedProduction.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_TEXT_COLOR_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes sanitized color metadata and rejects authority-inflated result objects', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'button', color: '#123456' }]);
    const result = resolveP15ElementorButtonTextColors(source, raw);
    const serialized = serializeP15ElementorButtonTextColorSummary(result);

    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('PRIVATE LINKED BUTTON');
    expect(serialized).not.toContain('https://example.com/path');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"settingKey": "button_text_color"');
    expect(serialized).toContain('"color": "#123456"');
    expect(serialized).toContain('"hoverControlName": "hover_color"');

    const inflated = {
      ...result,
      networkAccess: true,
    } as unknown as P15ElementorButtonTextColorResultV1;
    expect(() => serializeP15ElementorButtonTextColorSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
