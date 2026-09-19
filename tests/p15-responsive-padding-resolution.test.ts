import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_PADDING_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerPadding,
  serializeP15ElementorResponsivePaddingSummary,
  type P15ElementorResponsivePaddingManifestV1,
  type P15ElementorResponsivePaddingResultV1,
} from '../src/targets/elementor/responsive-padding-resolution';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
  type P15NeutralExportDocumentV1,
  type P15NeutralPaddingPx,
} from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function sourceDocument(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Responsive padding private source',
    documentType: 'section',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'row',
        paddingPx: { top: 10, right: 20, bottom: 30, left: 40 },
        children: [
          {
            kind: 'container',
            sourceNodeId: 'nested',
            direction: 'column',
            paddingPx: { top: 8, right: 8, bottom: 8, left: 8 },
            children: [
              {
                kind: 'text',
                sourceNodeId: 'copy',
                text: 'PRIVATE PADDING COPY',
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
  containers: P15ElementorResponsivePaddingManifestV1['containers'],
): P15ElementorResponsivePaddingManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION,
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

function expectedDimensions(value: P15NeutralPaddingPx): Record<string, unknown> {
  return {
    unit: 'px',
    top: String(value.top),
    right: String(value.right),
    bottom: String(value.bottom),
    left: String(value.left),
    isLinked: value.top === value.right
      && value.right === value.bottom
      && value.bottom === value.left,
  };
}

describe('P15 exact source-bound responsive container padding resolution', () => {
  it('writes exact Elementor 4.2.4 tablet/mobile dimension objects while preserving desktop padding', () => {
    const source = sourceDocument();
    const tablet = { top: 5, right: 10, bottom: 15, left: 20 };
    const mobile = { top: 12, right: 12, bottom: 12, left: 12 };
    const result = resolveP15ElementorResponsiveContainerPadding(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletPaddingPx: tablet,
        mobilePaddingPx: mobile,
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_PADDING_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      fixtureSourcePath: 'tests/qunit/mock/library/pages/landing-page-hotel.json',
      fixtureSourceBlobSha: 'd916825ab5483424bd61bb31bc2921bb7a6b0b78',
      controlName: 'padding',
      tabletSettingKey: 'padding_tablet',
      mobileSettingKey: 'padding_mobile',
    });
    expect(result.status).toBe('RESPONSIVE_PADDING_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.padding).toEqual(expectedDimensions({ top: 10, right: 20, bottom: 30, left: 40 }));
    expect(settings.padding_tablet).toEqual(expectedDimensions(tablet));
    expect(settings.padding_mobile).toEqual(expectedDimensions(mobile));
    expect((settings.padding_tablet as Record<string, unknown>).isLinked).toBe(false);
    expect((settings.padding_mobile as Record<string, unknown>).isLinked).toBe(true);
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('binds nested containers and omits unspecified breakpoint padding', () => {
    const source = sourceDocument();
    const mobile = { top: 0, right: 4, bottom: 0, left: 4 };
    const result = resolveP15ElementorResponsiveContainerPadding(source, manifest(source, [
      { sourceNodeId: 'nested', mobilePaddingPx: mobile },
    ]));

    expect(result.status).toBe('RESPONSIVE_PADDING_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings).not.toHaveProperty('padding_tablet');
    expect(rootSettings).not.toHaveProperty('padding_mobile');
    expect(nestedSettings.padding).toEqual(expectedDimensions({ top: 8, right: 8, bottom: 8, left: 8 }));
    expect(nestedSettings).not.toHaveProperty('padding_tablet');
    expect(nestedSettings.padding_mobile).toEqual(expectedDimensions(mobile));
    expect(result.resolvedPaddings).toEqual([
      {
        sourceNodeId: 'nested',
        tabletPaddingPx: null,
        mobilePaddingPx: mobile,
      },
    ]);
  });

  it('accepts zero and the existing neutral spacing boundary', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerPadding(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletPaddingPx: { top: 0, right: 0, bottom: 0, left: 0 },
        mobilePaddingPx: {
          top: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
          right: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
          bottom: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
          left: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
        },
      },
    ]));

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.padding_tablet).toEqual(expectedDimensions({ top: 0, right: 0, bottom: 0, left: 0 }));
    expect(settings.padding_mobile).toEqual(expectedDimensions({
      top: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
      right: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
      bottom: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
      left: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
    }));
  });

  it('returns a deterministic no-op when no padding overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorResponsiveContainerPadding(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerPadding(source, manifest(source, []));

    expect(first.status).toBe('NO_RESPONSIVE_PADDING_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source and stale base-candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [
      { sourceNodeId: 'root', mobilePaddingPx: { top: 1, right: 2, bottom: 3, left: 4 } },
    ]);

    const staleSource = resolveP15ElementorResponsiveContainerPadding(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.template).toBeNull();
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_PADDING_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerPadding(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_PADDING_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicate, non-container, empty, malformed, out-of-range and unknown-field entries', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorResponsiveContainerPadding(source, manifest(source, [
      { sourceNodeId: 'root', mobilePaddingPx: { top: 1, right: 1, bottom: 1, left: 1 } },
      { sourceNodeId: 'root', tabletPaddingPx: { top: 2, right: 2, bottom: 2, left: 2 } },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_PADDING_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerPadding(source, manifest(source, [
      { sourceNodeId: 'copy', mobilePaddingPx: { top: 1, right: 1, bottom: 1, left: 1 } },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_PADDING_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerPadding(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_PADDING_OVERRIDE_REQUIRED');

    const malformed = resolveP15ElementorResponsiveContainerPadding(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobilePaddingPx: { top: 1, right: 1, bottom: 1 },
      }],
    });
    expect(malformed.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_PADDING_VALUE_INVALID');

    const extraSide = resolveP15ElementorResponsiveContainerPadding(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobilePaddingPx: { top: 1, right: 1, bottom: 1, left: 1, inline: 1 },
      }],
    });
    expect(extraSide.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_PADDING_VALUE_INVALID');

    for (const value of [-1, P15_NEUTRAL_EXPORT_MAX_SPACING_PX + 1, Number.POSITIVE_INFINITY, Number.NaN]) {
      const invalid = resolveP15ElementorResponsiveContainerPadding(source, {
        ...manifest(source, []),
        containers: [{
          sourceNodeId: 'root',
          mobilePaddingPx: { top: value, right: 0, bottom: 0, left: 0 },
        }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_PADDING_VALUE_INVALID');
    }

    const unknownEntryField = resolveP15ElementorResponsiveContainerPadding(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobilePaddingPx: { top: 1, right: 1, bottom: 1, left: 1 },
        unit: 'rem',
      }],
    });
    expect(unknownEntryField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_PADDING_ENTRY_INVALID');
  });

  it('snapshots caller padding objects before applying or reporting them', () => {
    const source = sourceDocument();
    const mobile = { top: 1, right: 2, bottom: 3, left: 4 };
    const input = manifest(source, [{ sourceNodeId: 'root', mobilePaddingPx: mobile }]);
    const result = resolveP15ElementorResponsiveContainerPadding(source, input);

    mobile.top = 999;
    expect(result.resolvedPaddings[0]?.mobilePaddingPx).toEqual({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    });
    expect(settingsOf(result.template?.content[0]).padding_mobile)
      .toEqual(expectedDimensions({ top: 1, right: 2, bottom: 3, left: 4 }));
  });

  it('blocks review-bearing upstream IR instead of generating a partial responsive candidate', () => {
    const source: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked padding source',
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

    const result = resolveP15ElementorResponsiveContainerPadding(source, {});
    expect(result.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(result.baseCandidateIdentityDigest).toBeNull();
    expect(result.resolvedCandidateIdentityDigest).toBeNull();
    expect(result.template).toBeNull();
    expect(result.candidate).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_PADDING_UPSTREAM_GENERATION_NOT_READY' }),
    ]);
  });

  it('rejects authority inflation and serializes only sanitized padding metadata', () => {
    const source = sourceDocument();
    const raw = manifest(source, [
      { sourceNodeId: 'root', mobilePaddingPx: { top: 1, right: 2, bottom: 3, left: 4 } },
    ]);

    const inflatedManifest = resolveP15ElementorResponsiveContainerPadding(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflatedManifest.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_PADDING_AUTHORITY_FLAGS_INVALID');

    const result = resolveP15ElementorResponsiveContainerPadding(source, raw);
    const serialized = serializeP15ElementorResponsivePaddingSummary(result);
    expect(serialized).not.toContain('PRIVATE PADDING COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"padding_mobile"');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerPadding(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE PADDING COPY',
    }));
    expect(serializeP15ElementorResponsivePaddingSummary(mutatedIssue))
      .not.toContain('PRIVATE PADDING COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsivePaddingResultV1;
    expect(() => serializeP15ElementorResponsivePaddingSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
