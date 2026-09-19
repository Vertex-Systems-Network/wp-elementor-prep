import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerAlignments,
  serializeP15ElementorResponsiveAlignmentSummary,
  type P15ElementorResponsiveAlignmentManifestV1,
  type P15ElementorResponsiveAlignmentResultV1,
} from '../src/targets/elementor/responsive-alignment-resolution';
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
    title: 'Responsive alignment private source',
    documentType: 'section',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'row',
        alignItems: 'start',
        justifyContent: 'end',
        children: [
          {
            kind: 'container',
            sourceNodeId: 'nested',
            direction: 'column',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            children: [
              {
                kind: 'text',
                sourceNodeId: 'copy',
                text: 'PRIVATE ALIGNMENT COPY',
                align: 'start',
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
  containers: P15ElementorResponsiveAlignmentManifestV1['containers'],
): P15ElementorResponsiveAlignmentManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    containers,
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

describe('P15 exact source-bound responsive container alignment resolution', () => {
  it('writes exact Elementor 4.2.4 tablet/mobile align/justify keys while preserving desktop settings', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerAlignments(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletAlignItems: 'end',
        mobileAlignItems: 'stretch',
        tabletJustifyContent: 'start',
        mobileJustifyContent: 'space-evenly',
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
      flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
      containerMockSourcePath: 'tests/qunit/mock/elments/container.json',
      containerMockSourceBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
      groupName: 'flex',
      justifyControlName: 'justify_content',
      alignControlName: 'align_items',
      tabletJustifySettingKey: 'flex_justify_content_tablet',
      mobileJustifySettingKey: 'flex_justify_content_mobile',
      tabletAlignSettingKey: 'flex_align_items_tablet',
      mobileAlignSettingKey: 'flex_align_items_mobile',
    });
    expect(result.status).toBe('RESPONSIVE_ALIGNMENTS_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.flex_align_items).toBe('flex-start');
    expect(settings.flex_justify_content).toBe('flex-end');
    expect(settings.flex_align_items_tablet).toBe('flex-end');
    expect(settings.flex_align_items_mobile).toBe('stretch');
    expect(settings.flex_justify_content_tablet).toBe('flex-start');
    expect(settings.flex_justify_content_mobile).toBe('space-evenly');
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('binds nested containers and does not invent omitted control/breakpoint values', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerAlignments(source, manifest(source, [
      {
        sourceNodeId: 'nested',
        mobileJustifyContent: 'space-around',
      },
    ]));

    expect(result.status).toBe('RESPONSIVE_ALIGNMENTS_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings).not.toHaveProperty('flex_align_items_tablet');
    expect(rootSettings).not.toHaveProperty('flex_align_items_mobile');
    expect(rootSettings).not.toHaveProperty('flex_justify_content_tablet');
    expect(rootSettings).not.toHaveProperty('flex_justify_content_mobile');

    expect(nestedSettings.flex_align_items).toBe('stretch');
    expect(nestedSettings.flex_justify_content).toBe('space-between');
    expect(nestedSettings).not.toHaveProperty('flex_align_items_tablet');
    expect(nestedSettings).not.toHaveProperty('flex_align_items_mobile');
    expect(nestedSettings).not.toHaveProperty('flex_justify_content_tablet');
    expect(nestedSettings.flex_justify_content_mobile).toBe('space-around');
    expect(result.resolvedAlignments).toEqual([
      {
        sourceNodeId: 'nested',
        tabletAlignItems: null,
        mobileAlignItems: null,
        tabletJustifyContent: null,
        mobileJustifyContent: 'space-around',
      },
    ]);
  });

  it('maps the bounded neutral start/end vocabulary and preserves already-Elementor-compatible values', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerAlignments(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletAlignItems: 'start',
        mobileAlignItems: 'center',
        tabletJustifyContent: 'end',
        mobileJustifyContent: 'space-between',
      },
      {
        sourceNodeId: 'nested',
        tabletAlignItems: 'stretch',
        mobileJustifyContent: 'center',
      },
    ]));

    const rootSettings = settingsOf(result.template?.content[0]);
    const nestedSettings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(rootSettings.flex_align_items_tablet).toBe('flex-start');
    expect(rootSettings.flex_align_items_mobile).toBe('center');
    expect(rootSettings.flex_justify_content_tablet).toBe('flex-end');
    expect(rootSettings.flex_justify_content_mobile).toBe('space-between');
    expect(nestedSettings.flex_align_items_tablet).toBe('stretch');
    expect(nestedSettings.flex_justify_content_mobile).toBe('center');
  });

  it('returns a deterministic no-op when no alignment overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorResponsiveContainerAlignments(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerAlignments(source, manifest(source, []));

    expect(first.status).toBe('NO_RESPONSIVE_ALIGNMENT_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source and stale base-candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [
      { sourceNodeId: 'root', mobileAlignItems: 'center' },
    ]);

    const staleSource = resolveP15ElementorResponsiveContainerAlignments(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.template).toBeNull();
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerAlignments(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicate, non-container, empty, invalid and unknown-field entries', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorResponsiveContainerAlignments(source, manifest(source, [
      { sourceNodeId: 'root', mobileAlignItems: 'center' },
      { sourceNodeId: 'root', tabletJustifyContent: 'start' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGNMENT_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerAlignments(source, manifest(source, [
      { sourceNodeId: 'copy', mobileAlignItems: 'center' },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGNMENT_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerAlignments(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGNMENT_OVERRIDE_REQUIRED');

    const invalidAlign = resolveP15ElementorResponsiveContainerAlignments(source, {
      ...manifest(source, []),
      containers: [{ sourceNodeId: 'root', mobileAlignItems: 'baseline' }],
    });
    expect(invalidAlign.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGNMENT_VALUE_INVALID');

    const invalidJustify = resolveP15ElementorResponsiveContainerAlignments(source, {
      ...manifest(source, []),
      containers: [{ sourceNodeId: 'root', tabletJustifyContent: 'stretch' }],
    });
    expect(invalidJustify.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGNMENT_VALUE_INVALID');

    const unknownField = resolveP15ElementorResponsiveContainerAlignments(source, {
      ...manifest(source, []),
      containers: [{ sourceNodeId: 'root', mobileAlignItems: 'center', alignContent: 'center' }],
    });
    expect(unknownField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGNMENT_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR instead of generating a partial responsive candidate', () => {
    const source: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked alignment source',
      documentType: 'section',
      nodes: [{
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'row',
        children: [{
          kind: 'review',
          sourceNodeId: 'manual',
          reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW',
          detail: 'must remain blocked',
        }],
      }],
    };

    const result = resolveP15ElementorResponsiveContainerAlignments(source, {});
    expect(result.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(result.baseCandidateIdentityDigest).toBeNull();
    expect(result.resolvedCandidateIdentityDigest).toBeNull();
    expect(result.template).toBeNull();
    expect(result.candidate).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY' }),
    ]);
  });

  it('rejects authority inflation and serializes only sanitized alignment metadata', () => {
    const source = sourceDocument();
    const raw = manifest(source, [
      { sourceNodeId: 'root', mobileAlignItems: 'center' },
    ]);

    const inflatedManifest = resolveP15ElementorResponsiveContainerAlignments(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflatedManifest.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGNMENT_AUTHORITY_FLAGS_INVALID');

    const result = resolveP15ElementorResponsiveContainerAlignments(source, raw);
    const serialized = serializeP15ElementorResponsiveAlignmentSummary(result);
    expect(serialized).not.toContain('PRIVATE ALIGNMENT COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"flex_align_items_mobile"');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerAlignments(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE ALIGNMENT COPY',
    }));
    expect(serializeP15ElementorResponsiveAlignmentSummary(mutatedIssue))
      .not.toContain('PRIVATE ALIGNMENT COPY');

    const inflatedResult = {
      ...result,
      productionAcceptance: true,
    } as unknown as P15ElementorResponsiveAlignmentResultV1;
    expect(() => serializeP15ElementorResponsiveAlignmentSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
