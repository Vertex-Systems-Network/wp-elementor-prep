import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_EVIDENCE,
  P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION,
  resolveP15ElementorTextEditorTextColors,
  serializeP15ElementorTextEditorTextColorSummary,
  type P15ElementorTextEditorTextColorManifestV1,
  type P15ElementorTextEditorTextColorResultV1,
} from '../src/targets/elementor/text-editor-text-color-resolution';
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
    title: 'Text Editor color private source',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'root',
      direction: 'column',
      children: [
        {
          kind: 'text',
          sourceNodeId: 'text',
          text: 'PRIVATE TEXT COPY',
          align: 'center',
        },
        {
          kind: 'heading',
          sourceNodeId: 'heading',
          text: 'PRIVATE HEADING COPY',
          level: 'h2',
          align: 'start',
        },
        {
          kind: 'container',
          sourceNodeId: 'nested',
          direction: 'row',
          children: [
            {
              kind: 'text',
              sourceNodeId: 'nested-text',
              text: 'PRIVATE <NESTED>\nCOPY',
            },
            {
              kind: 'button',
              sourceNodeId: 'button',
              text: 'PRIVATE BUTTON COPY',
              align: 'end',
            },
          ],
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
  texts: P15ElementorTextEditorTextColorManifestV1['texts'],
): P15ElementorTextEditorTextColorManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    texts,
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

describe('P15 exact source-bound Text Editor normal text color resolution', () => {
  it('writes only exact Elementor 4.2.4 text_color and preserves generated editor/alignment', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorTextEditorTextColors(source, manifest(source, [
      { sourceNodeId: 'text', color: '#1a2b3c' },
    ]));

    expect(P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      textEditorSourcePath: 'includes/widgets/text-editor.php',
      textEditorSourceBlobSha: '72ff868493a3c0f27c6305794ffcff9cf217c9ea',
      controlName: 'text_color',
      settingKey: 'text_color',
      linkControlName: 'link_color',
      selector: '{{WRAPPER}}',
      acceptedColorPattern: '^#[0-9a-f]{6}$',
    });

    expect(result.status).toBe('TEXT_EDITOR_TEXT_COLORS_RESOLVED');
    expect(result.sourceTextCount).toBe(2);
    expect(result.resolvedTextCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.editor).toBe('<p>PRIVATE TEXT COPY</p>');
    expect(settings.align).toBe('center');
    expect(settings.text_color).toBe('#1a2b3c');
    expect(settings).not.toHaveProperty('link_color');
    expect(settings).not.toHaveProperty('text_color_tablet');
    expect(settings).not.toHaveProperty('text_color_mobile');

    expect(result.resolvedColors).toEqual([
      { sourceNodeId: 'text', color: '#1a2b3c' },
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

  it('binds nested Text Editor content exactly and leaves unrelated widgets untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorTextEditorTextColors(source, manifest(source, [
      { sourceNodeId: 'nested-text', color: '#abcdef' },
    ]));

    expect(result.status).toBe('TEXT_EDITOR_TEXT_COLORS_RESOLVED');
    const root = result.template?.content[0];
    const firstText = root?.elements[0];
    const heading = root?.elements[1];
    const nested = root?.elements[2];
    const nestedText = nested?.elements[0];
    const button = nested?.elements[1];

    expect(settingsOf(firstText)).not.toHaveProperty('text_color');
    expect(settingsOf(heading)).not.toHaveProperty('text_color');
    expect(settingsOf(button)).not.toHaveProperty('text_color');
    expect(settingsOf(nestedText).editor).toBe('<p>PRIVATE &lt;NESTED&gt;<br>COPY</p>');
    expect(settingsOf(nestedText)).not.toHaveProperty('align');
    expect(settingsOf(nestedText).text_color).toBe('#abcdef');
    expect(settingsOf(nestedText)).not.toHaveProperty('link_color');
  });

  it('sorts multiple resolved color summaries deterministically', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorTextEditorTextColors(source, manifest(source, [
      { sourceNodeId: 'text', color: '#445566' },
      { sourceNodeId: 'nested-text', color: '#112233' },
    ]));

    expect(result.status).toBe('TEXT_EDITOR_TEXT_COLORS_RESOLVED');
    expect(result.resolvedColors).toEqual([
      { sourceNodeId: 'nested-text', color: '#112233' },
      { sourceNodeId: 'text', color: '#445566' },
    ]);
  });

  it('returns a deterministic no-op when no Text Editor color overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorTextEditorTextColors(source, manifest(source, []));
    const second = resolveP15ElementorTextEditorTextColors(source, manifest(source, []));

    expect(first.status).toBe('NO_TEXT_EDITOR_TEXT_COLOR_OVERRIDES');
    expect(first.resolvedTextCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'text', color: '#123456' }]);

    const staleSource = resolveP15ElementorTextEditorTextColors(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorTextEditorTextColors(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_TEXT_EDITOR_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicates, non-Text IDs, unsafe color formats and link-color fields', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorTextEditorTextColors(source, manifest(source, [
      { sourceNodeId: 'text', color: '#112233' },
      { sourceNodeId: 'text', color: '#445566' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_TEXT_EDITOR_TEXT_COLOR_DUPLICATE_SOURCE_ID');

    for (const sourceNodeId of ['root', 'heading', 'button']) {
      const nonText = resolveP15ElementorTextEditorTextColors(source, manifest(source, [
        { sourceNodeId, color: '#112233' },
      ]));
      expect(nonText.issues.map((issue) => issue.code))
        .toContain('P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_NOT_TEXT');
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
      'var(--e-global-color-text)',
      'global:text',
      'transparent',
      123456,
      null,
      {},
    ]) {
      const invalid = resolveP15ElementorTextEditorTextColors(source, {
        ...manifest(source, []),
        texts: [{ sourceNodeId: 'text', color }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_TEXT_EDITOR_TEXT_COLOR_VALUE_INVALID');
    }

    const unknownField = resolveP15ElementorTextEditorTextColors(source, {
      ...manifest(source, []),
      texts: [{
        sourceNodeId: 'text',
        color: '#123456',
        linkColor: '#654321',
      }],
    });
    expect(unknownField.issues.map((issue) => issue.code))
      .toContain('P15_TEXT_EDITOR_TEXT_COLOR_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked Text Editor color source',
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

    const blocked = resolveP15ElementorTextEditorTextColors(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_TEXT_EDITOR_TEXT_COLOR_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'text', color: '#123456' }]);

    const inflatedColor = resolveP15ElementorTextEditorTextColors(source, {
      ...raw,
      colorInferencePerformed: true,
    });
    expect(inflatedColor.issues.map((issue) => issue.code))
      .toContain('P15_TEXT_EDITOR_TEXT_COLOR_AUTHORITY_FLAGS_INVALID');

    const inflatedProduction = resolveP15ElementorTextEditorTextColors(source, {
      ...raw,
      productionAcceptance: true,
    });
    expect(inflatedProduction.issues.map((issue) => issue.code))
      .toContain('P15_TEXT_EDITOR_TEXT_COLOR_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized color metadata and refuses authority-inflated result objects', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'text', color: '#123456' }]);
    const result = resolveP15ElementorTextEditorTextColors(source, raw);
    const serialized = serializeP15ElementorTextEditorTextColorSummary(result);

    expect(serialized).not.toContain('PRIVATE TEXT COPY');
    expect(serialized).not.toContain('PRIVATE HEADING COPY');
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"settingKey": "text_color"');
    expect(serialized).toContain('"color": "#123456"');
    expect(serialized).toContain('"linkControlName": "link_color"');

    const mutatedIssue = {
      ...resolveP15ElementorTextEditorTextColors(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE TEXT COPY',
    }));
    expect(serializeP15ElementorTextEditorTextColorSummary(mutatedIssue))
      .not.toContain('PRIVATE TEXT COPY');

    const inflatedResult = {
      ...result,
      networkAccess: true,
    } as unknown as P15ElementorTextEditorTextColorResultV1;
    expect(() => serializeP15ElementorTextEditorTextColorSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
