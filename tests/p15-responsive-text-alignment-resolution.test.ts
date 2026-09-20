import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION,
  resolveP15ElementorResponsiveTextAlignments,
  serializeP15ElementorResponsiveTextAlignmentSummary,
  type P15ElementorResponsiveTextAlignmentManifestV1,
  type P15ElementorResponsiveTextAlignmentResultV1,
} from '../src/targets/elementor/responsive-text-alignment-resolution';
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
    title: 'Responsive text alignment private source',
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
                kind: 'text',
                sourceNodeId: 'nested-text',
                text: 'PRIVATE NESTED COPY',
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
  widgets: P15ElementorResponsiveTextAlignmentManifestV1['widgets'],
): P15ElementorResponsiveTextAlignmentManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    widgets,
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

describe('P15 exact source-bound responsive Heading/Text alignment resolution', () => {
  it('writes exact Elementor 4.2.4 tablet/mobile alignment keys and preserves desktop values', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveTextAlignments(source, manifest(source, [
      { sourceNodeId: 'heading', tabletAlign: 'center', mobileAlign: 'end' },
      { sourceNodeId: 'text', tabletAlign: 'justify', mobileAlign: 'start' },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      headingSourcePath: 'includes/widgets/heading.php',
      headingSourceBlobSha: '5b193f958ba34d8d4a24d165a9114f9bc3ef2561',
      textEditorSourcePath: 'includes/widgets/text-editor.php',
      textEditorSourceBlobSha: '72ff868493a3c0f27c6305794ffcff9cf217c9ea',
      controlsStackSourcePath: 'includes/base/controls-stack.php',
      controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
      controlName: 'align',
      desktopSettingKey: 'align',
      tabletSettingKey: 'align_tablet',
      mobileSettingKey: 'align_mobile',
      headingValues: ['start', 'center', 'end'],
      textValues: ['start', 'center', 'end', 'justify'],
    });

    expect(result.status).toBe('RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED');
    expect(result.sourceTextWidgetCount).toBe(3);
    expect(result.resolvedWidgetCount).toBe(2);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const root = result.template?.content[0];
    const heading = root?.elements[0];
    const text = root?.elements[1];
    const headingSettings = settingsOf(heading);
    const textSettings = settingsOf(text);

    expect(headingSettings.align).toBe('start');
    expect(headingSettings.align_tablet).toBe('center');
    expect(headingSettings.align_mobile).toBe('end');

    expect(textSettings.align).toBe('center');
    expect(textSettings.align_tablet).toBe('justify');
    expect(textSettings.align_mobile).toBe('start');

    expect(result.resolvedAlignments).toEqual([
      {
        sourceNodeId: 'heading',
        nodeKind: 'heading',
        tabletAlign: 'center',
        mobileAlign: 'end',
      },
      {
        sourceNodeId: 'text',
        nodeKind: 'text',
        tabletAlign: 'justify',
        mobileAlign: 'start',
      },
    ]);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('binds nested text, preserves missing desktop align, and omits unspecified breakpoints', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveTextAlignments(source, manifest(source, [
      { sourceNodeId: 'nested-text', mobileAlign: 'justify' },
    ]));

    expect(result.status).toBe('RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[2];
    const nestedText = nested?.elements[0];
    const settings = settingsOf(nestedText);

    expect(settings).not.toHaveProperty('align');
    expect(settings).not.toHaveProperty('align_tablet');
    expect(settings.align_mobile).toBe('justify');
    expect(result.resolvedAlignments).toEqual([
      {
        sourceNodeId: 'nested-text',
        nodeKind: 'text',
        tabletAlign: null,
        mobileAlign: 'justify',
      },
    ]);
  });

  it('rejects justify for Heading but accepts it for Text Editor', () => {
    const source = sourceDocument();

    const heading = resolveP15ElementorResponsiveTextAlignments(source, manifest(source, [
      { sourceNodeId: 'heading', mobileAlign: 'justify' },
    ]));
    expect(heading.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(heading.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_TEXT_ALIGNMENT_VALUE_INVALID');

    const text = resolveP15ElementorResponsiveTextAlignments(source, manifest(source, [
      { sourceNodeId: 'text', mobileAlign: 'justify' },
    ]));
    expect(text.status).toBe('RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED');
    expect(settingsOf(text.template?.content[0]?.elements[1]).align_mobile).toBe('justify');
  });

  it('keeps Button explicitly out of this responsive slice', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveTextAlignments(source, manifest(source, [
      { sourceNodeId: 'button', mobileAlign: 'center' },
    ]));

    expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(result.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_NOT_TEXT_WIDGET');
  });

  it('returns a deterministic no-op when no responsive text alignment is supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorResponsiveTextAlignments(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveTextAlignments(source, manifest(source, []));

    expect(first.status).toBe('NO_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDES');
    expect(first.resolvedWidgetCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/base-candidate bindings, duplicates, non-text nodes and malformed values', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'text', mobileAlign: 'end' }]);

    const staleSource = resolveP15ElementorResponsiveTextAlignments(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveTextAlignments(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_TEXT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const duplicate = resolveP15ElementorResponsiveTextAlignments(source, manifest(source, [
      { sourceNodeId: 'text', tabletAlign: 'start' },
      { sourceNodeId: 'text', mobileAlign: 'end' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_TEXT_ALIGNMENT_DUPLICATE_SOURCE_ID');

    const container = resolveP15ElementorResponsiveTextAlignments(source, manifest(source, [
      { sourceNodeId: 'root', mobileAlign: 'center' },
    ]));
    expect(container.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_NOT_TEXT_WIDGET');

    const empty = resolveP15ElementorResponsiveTextAlignments(source, manifest(source, [
      { sourceNodeId: 'text' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDE_REQUIRED');

    for (const value of ['', 'left', 'right', 'space-between', 3, null]) {
      const invalid = resolveP15ElementorResponsiveTextAlignments(source, {
        ...manifest(source, []),
        widgets: [{ sourceNodeId: 'text', mobileAlign: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_TEXT_ALIGNMENT_VALUE_INVALID');
    }

    const unknownEntryField = resolveP15ElementorResponsiveTextAlignments(source, {
      ...manifest(source, []),
      widgets: [{
        sourceNodeId: 'text',
        mobileAlign: 'end',
        unit: 'px',
      }],
    });
    expect(unknownEntryField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_TEXT_ALIGNMENT_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked text alignment source',
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

    const blocked = resolveP15ElementorResponsiveTextAlignments(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'text', mobileAlign: 'end' }]);
    const inflated = resolveP15ElementorResponsiveTextAlignments(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_TEXT_ALIGNMENT_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized metadata and refuses authority-inflated result objects', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'text', mobileAlign: 'justify' }]);
    const result = resolveP15ElementorResponsiveTextAlignments(source, raw);
    const serialized = serializeP15ElementorResponsiveTextAlignmentSummary(result);

    expect(serialized).not.toContain('PRIVATE HEADING COPY');
    expect(serialized).not.toContain('PRIVATE TEXT COPY');
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"align_mobile"');
    expect(serialized).toContain('"mobileAlign": "justify"');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveTextAlignments(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE TEXT COPY',
    }));
    expect(serializeP15ElementorResponsiveTextAlignmentSummary(mutatedIssue))
      .not.toContain('PRIVATE TEXT COPY');

    const inflated = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveTextAlignmentResultV1;
    expect(() => serializeP15ElementorResponsiveTextAlignmentSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
