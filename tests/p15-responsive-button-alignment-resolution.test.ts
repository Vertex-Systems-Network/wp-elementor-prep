import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION,
  resolveP15ElementorResponsiveButtonAlignments,
  serializeP15ElementorResponsiveButtonAlignmentSummary,
  type P15ElementorResponsiveButtonAlignmentManifestV1,
  type P15ElementorResponsiveButtonAlignmentResultV1,
} from '../src/targets/elementor/responsive-button-alignment-resolution';
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
    title: 'Responsive Button alignment private source',
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
  widgets: P15ElementorResponsiveButtonAlignmentManifestV1['widgets'],
): P15ElementorResponsiveButtonAlignmentManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION,
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

describe('P15 exact source-bound responsive Button alignment resolution', () => {
  it('writes exact Elementor 4.2.4 Button tablet/mobile alignment keys and preserves normalized desktop alignment', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveButtonAlignments(source, manifest(source, [
      { sourceNodeId: 'button', tabletAlign: 'center', mobileAlign: 'justify' },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
      buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
      controlsStackSourcePath: 'includes/base/controls-stack.php',
      controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
      controlName: 'align',
      desktopSettingKey: 'align',
      tabletSettingKey: 'align_tablet',
      mobileSettingKey: 'align_mobile',
      targetValues: ['left', 'center', 'right', 'justify'],
    });
    expect(result.status).toBe('RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED');
    expect(result.sourceButtonWidgetCount).toBe(1);
    expect(result.resolvedWidgetCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    const button = result.template?.content[0]?.elements[2]?.elements[1];
    const settings = settingsOf(button);
    expect(settings.align).toBe('right');
    expect(settings.align_tablet).toBe('center');
    expect(settings.align_mobile).toBe('justify');
    expect(result.resolvedAlignments).toEqual([
      { sourceNodeId: 'button', tabletAlign: 'center', mobileAlign: 'justify' },
    ]);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('preserves missing desktop Button align and omits unspecified breakpoints', () => {
    const source = sourceDocument();
    const root = source.nodes[0];
    if (!root || root.kind !== 'container') throw new Error('fixture invariant');
    const nested = root.children[2];
    if (!nested || nested.kind !== 'container') throw new Error('fixture invariant');
    const button = nested.children[1];
    if (!button || button.kind !== 'button') throw new Error('fixture invariant');
    delete button.align;

    const result = resolveP15ElementorResponsiveButtonAlignments(source, manifest(source, [
      { sourceNodeId: 'button', mobileAlign: 'left' },
    ]));

    expect(result.status).toBe('RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED');
    const targetButton = result.template?.content[0]?.elements[2]?.elements[1];
    const settings = settingsOf(targetButton);
    expect(settings).not.toHaveProperty('align');
    expect(settings).not.toHaveProperty('align_tablet');
    expect(settings.align_mobile).toBe('left');
    expect(result.resolvedAlignments).toEqual([
      { sourceNodeId: 'button', tabletAlign: null, mobileAlign: 'left' },
    ]);
  });

  it('accepts only the exact Elementor Button target vocabulary', () => {
    const source = sourceDocument();
    for (const value of ['left', 'center', 'right', 'justify'] as const) {
      const result = resolveP15ElementorResponsiveButtonAlignments(source, manifest(source, [
        { sourceNodeId: 'button', mobileAlign: value },
      ]));
      expect(result.status).toBe('RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED');
      expect(settingsOf(result.template?.content[0]?.elements[2]?.elements[1]).align_mobile).toBe(value);
    }

    for (const value of ['start', 'end', 'space-between']) {
      const result = resolveP15ElementorResponsiveButtonAlignments(source, {
        ...manifest(source, []),
        widgets: [{ sourceNodeId: 'button', mobileAlign: value }],
      });
      expect(result.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_BUTTON_ALIGNMENT_VALUE_INVALID');
    }
  });

  it('keeps non-Button widgets explicitly out of this responsive slice', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveButtonAlignments(source, manifest(source, [
      { sourceNodeId: 'text', mobileAlign: 'center' },
    ]));
    expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(result.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_NOT_BUTTON');
  });

  it('returns a deterministic no-op when no responsive text alignment is supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorResponsiveButtonAlignments(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveButtonAlignments(source, manifest(source, []));

    expect(first.status).toBe('NO_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDES');
    expect(first.resolvedWidgetCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/base-candidate bindings, duplicates, non-text nodes and malformed values', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'button', mobileAlign: 'right' }]);

    const staleSource = resolveP15ElementorResponsiveButtonAlignments(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveButtonAlignments(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BUTTON_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const duplicate = resolveP15ElementorResponsiveButtonAlignments(source, manifest(source, [
      { sourceNodeId: 'button', tabletAlign: 'left' },
      { sourceNodeId: 'button', mobileAlign: 'right' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BUTTON_ALIGNMENT_DUPLICATE_SOURCE_ID');

    const container = resolveP15ElementorResponsiveButtonAlignments(source, manifest(source, [
      { sourceNodeId: 'root', mobileAlign: 'center' },
    ]));
    expect(container.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_NOT_BUTTON');

    const empty = resolveP15ElementorResponsiveButtonAlignments(source, manifest(source, [
      { sourceNodeId: 'button' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDE_REQUIRED');

    for (const value of ['', 'start', 'end', 'space-between', 3, null]) {
      const invalid = resolveP15ElementorResponsiveButtonAlignments(source, {
        ...manifest(source, []),
        widgets: [{ sourceNodeId: 'button', mobileAlign: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_BUTTON_ALIGNMENT_VALUE_INVALID');
    }

    const unknownEntryField = resolveP15ElementorResponsiveButtonAlignments(source, {
      ...manifest(source, []),
      widgets: [{
        sourceNodeId: 'button',
        mobileAlign: 'right',
        unit: 'px',
      }],
    });
    expect(unknownEntryField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BUTTON_ALIGNMENT_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked Button alignment source',
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

    const blocked = resolveP15ElementorResponsiveButtonAlignments(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'button', mobileAlign: 'right' }]);
    const inflated = resolveP15ElementorResponsiveButtonAlignments(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BUTTON_ALIGNMENT_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized metadata and refuses authority-inflated result objects', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'button', mobileAlign: 'justify' }]);
    const result = resolveP15ElementorResponsiveButtonAlignments(source, raw);
    const serialized = serializeP15ElementorResponsiveButtonAlignmentSummary(result);

    expect(serialized).not.toContain('PRIVATE HEADING COPY');
    expect(serialized).not.toContain('PRIVATE TEXT COPY');
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"align_mobile"');
    expect(serialized).toContain('"mobileAlign": "justify"');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveButtonAlignments(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE TEXT COPY',
    }));
    expect(serializeP15ElementorResponsiveButtonAlignmentSummary(mutatedIssue))
      .not.toContain('PRIVATE TEXT COPY');

    const inflated = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveButtonAlignmentResultV1;
    expect(() => serializeP15ElementorResponsiveButtonAlignmentSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
