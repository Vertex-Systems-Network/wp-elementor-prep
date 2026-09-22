import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_HEADING_TEXT_COLOR_EVIDENCE,
  P15_ELEMENTOR_HEADING_TEXT_COLOR_MANIFEST_VERSION,
  resolveP15ElementorHeadingTextColors,
  serializeP15ElementorHeadingTextColorSummary,
  type P15ElementorHeadingTextColorManifestV1,
  type P15ElementorHeadingTextColorResultV1,
} from '../src/targets/elementor/heading-text-color-resolution';
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
    title: 'Heading color private source',
    documentType: 'section',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'column',
        children: [
          {
            kind: 'heading',
            sourceNodeId: 'heading',
            text: 'PRIVATE HEADING COPY',
            level: 'h2',
            align: 'start',
          },
          {
            kind: 'text',
            sourceNodeId: 'text',
            text: 'PRIVATE TEXT COPY',
            align: 'center',
          },
          {
            kind: 'container',
            sourceNodeId: 'nested',
            direction: 'row',
            children: [
              {
                kind: 'heading',
                sourceNodeId: 'nested-heading',
                text: 'PRIVATE NESTED HEADING COPY',
                level: 'h3',
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
      },
    ],
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
  headings: P15ElementorHeadingTextColorManifestV1['headings'],
): P15ElementorHeadingTextColorManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_HEADING_TEXT_COLOR_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    headings,
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

describe('P15 exact source-bound Heading normal text color resolution', () => {
  it('writes only exact Elementor 4.2.4 title_color and preserves Heading base settings', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorHeadingTextColors(source, manifest(source, [
      { sourceNodeId: 'heading', color: '#1a2b3c' },
    ]));

    expect(P15_ELEMENTOR_HEADING_TEXT_COLOR_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      headingSourcePath: 'includes/widgets/heading.php',
      headingSourceBlobSha: '5b193f958ba34d8d4a24d165a9114f9bc3ef2561',
      controlName: 'title_color',
      settingKey: 'title_color',
      hoverControlName: 'title_hover_color',
      selector: '{{WRAPPER}} .elementor-heading-title',
      acceptedColorPattern: '^#[0-9a-f]{6}$',
    });

    expect(result.status).toBe('HEADING_TEXT_COLORS_RESOLVED');
    expect(result.sourceHeadingCount).toBe(2);
    expect(result.resolvedHeadingCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const heading = result.template?.content[0]?.elements[0];
    const settings = settingsOf(heading);
    expect(settings.title).toBe('PRIVATE HEADING COPY');
    expect(settings.header_size).toBe('h2');
    expect(settings.align).toBe('start');
    expect(settings.title_color).toBe('#1a2b3c');
    expect(settings).not.toHaveProperty('title_hover_color');
    expect(settings).not.toHaveProperty('title_hover_color_transition_duration');
    expect(settings).not.toHaveProperty('title_color_tablet');
    expect(settings).not.toHaveProperty('title_color_mobile');

    expect(result.resolvedColors).toEqual([
      { sourceNodeId: 'heading', color: '#1a2b3c' },
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

  it('binds nested Heading nodes and leaves unrelated widgets untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorHeadingTextColors(source, manifest(source, [
      { sourceNodeId: 'nested-heading', color: '#abcdef' },
    ]));

    expect(result.status).toBe('HEADING_TEXT_COLORS_RESOLVED');
    const root = result.template?.content[0];
    const firstHeading = root?.elements[0];
    const text = root?.elements[1];
    const nested = root?.elements[2];
    const nestedHeading = nested?.elements[0];
    const button = nested?.elements[1];

    expect(settingsOf(firstHeading)).not.toHaveProperty('title_color');
    expect(settingsOf(text)).not.toHaveProperty('title_color');
    expect(settingsOf(button)).not.toHaveProperty('title_color');
    expect(settingsOf(nestedHeading).title).toBe('PRIVATE NESTED HEADING COPY');
    expect(settingsOf(nestedHeading).header_size).toBe('h3');
    expect(settingsOf(nestedHeading)).not.toHaveProperty('align');
    expect(settingsOf(nestedHeading).title_color).toBe('#abcdef');
  });

  it('sorts multiple resolved color summaries deterministically', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorHeadingTextColors(source, manifest(source, [
      { sourceNodeId: 'nested-heading', color: '#445566' },
      { sourceNodeId: 'heading', color: '#112233' },
    ]));

    expect(result.status).toBe('HEADING_TEXT_COLORS_RESOLVED');
    expect(result.resolvedColors).toEqual([
      { sourceNodeId: 'heading', color: '#112233' },
      { sourceNodeId: 'nested-heading', color: '#445566' },
    ]);
  });

  it('returns a deterministic no-op when no Heading color overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorHeadingTextColors(source, manifest(source, []));
    const second = resolveP15ElementorHeadingTextColors(source, manifest(source, []));

    expect(first.status).toBe('NO_HEADING_TEXT_COLOR_OVERRIDES');
    expect(first.resolvedHeadingCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'heading', color: '#123456' }]);

    const staleSource = resolveP15ElementorHeadingTextColors(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_HEADING_TEXT_COLOR_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorHeadingTextColors(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_HEADING_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicates, non-Heading IDs, unsafe color formats and unknown fields', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorHeadingTextColors(source, manifest(source, [
      { sourceNodeId: 'heading', color: '#112233' },
      { sourceNodeId: 'heading', color: '#445566' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_HEADING_TEXT_COLOR_DUPLICATE_SOURCE_ID');

    for (const sourceNodeId of ['root', 'text', 'button']) {
      const nonHeading = resolveP15ElementorHeadingTextColors(source, manifest(source, [
        { sourceNodeId, color: '#112233' },
      ]));
      expect(nonHeading.issues.map((issue) => issue.code))
        .toContain('P15_HEADING_TEXT_COLOR_SOURCE_NOT_HEADING');
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
      'var(--e-global-color-primary)',
      'global:primary',
      'transparent',
      123456,
      null,
      {},
    ]) {
      const invalid = resolveP15ElementorHeadingTextColors(source, {
        ...manifest(source, []),
        headings: [{ sourceNodeId: 'heading', color }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_HEADING_TEXT_COLOR_VALUE_INVALID');
    }

    const unknownField = resolveP15ElementorHeadingTextColors(source, {
      ...manifest(source, []),
      headings: [{
        sourceNodeId: 'heading',
        color: '#123456',
        hoverColor: '#654321',
      }],
    });
    expect(unknownField.issues.map((issue) => issue.code))
      .toContain('P15_HEADING_TEXT_COLOR_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked Heading color source',
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

    const blocked = resolveP15ElementorHeadingTextColors(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_HEADING_TEXT_COLOR_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'heading', color: '#123456' }]);

    const inflatedColor = resolveP15ElementorHeadingTextColors(source, {
      ...raw,
      colorInferencePerformed: true,
    });
    expect(inflatedColor.issues.map((issue) => issue.code))
      .toContain('P15_HEADING_TEXT_COLOR_AUTHORITY_FLAGS_INVALID');

    const inflatedProduction = resolveP15ElementorHeadingTextColors(source, {
      ...raw,
      productionAcceptance: true,
    });
    expect(inflatedProduction.issues.map((issue) => issue.code))
      .toContain('P15_HEADING_TEXT_COLOR_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized color metadata and refuses authority-inflated result objects', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'heading', color: '#123456' }]);
    const result = resolveP15ElementorHeadingTextColors(source, raw);
    const serialized = serializeP15ElementorHeadingTextColorSummary(result);

    expect(serialized).not.toContain('PRIVATE HEADING COPY');
    expect(serialized).not.toContain('PRIVATE TEXT COPY');
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"settingKey": "title_color"');
    expect(serialized).toContain('"color": "#123456"');
    expect(serialized).toContain('"hoverControlName": "title_hover_color"');

    const mutatedIssue = {
      ...resolveP15ElementorHeadingTextColors(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE HEADING COPY',
    }));
    expect(serializeP15ElementorHeadingTextColorSummary(mutatedIssue))
      .not.toContain('PRIVATE HEADING COPY');

    const inflatedResult = {
      ...result,
      networkAccess: true,
    } as unknown as P15ElementorHeadingTextColorResultV1;
    expect(() => serializeP15ElementorHeadingTextColorSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
