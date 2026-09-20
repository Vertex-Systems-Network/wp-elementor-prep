import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerMargin,
  serializeP15ElementorResponsiveMarginSummary,
  type P15ElementorResponsiveMarginManifestV1,
  type P15ElementorResponsiveMarginPx,
  type P15ElementorResponsiveMarginResultV1,
} from '../src/targets/elementor/responsive-margin-resolution';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function sourceDocument(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Responsive margin private source',
    documentType: 'section',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'row',
        children: [
          {
            kind: 'container',
            sourceNodeId: 'nested',
            direction: 'column',
            children: [
              {
                kind: 'text',
                sourceNodeId: 'copy',
                text: 'PRIVATE MARGIN COPY',
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
  containers: P15ElementorResponsiveMarginManifestV1['containers'],
): P15ElementorResponsiveMarginManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION,
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

function expectedDimensions(value: P15ElementorResponsiveMarginPx): Record<string, unknown> {
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

describe('P15 exact source-bound responsive container margin resolution', () => {
  it('writes exact Elementor 4.2.4 tablet/mobile dimension objects while leaving desktop margin untouched', () => {
    const source = sourceDocument();
    const tablet = { top: 5, right: 10, bottom: 15, left: 20 };
    const mobile = { top: 12, right: 12, bottom: 12, left: 12 };
    const result = resolveP15ElementorResponsiveContainerMargin(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletMarginPx: tablet,
        mobileMarginPx: mobile,
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      controlsStackSourcePath: 'includes/base/controls-stack.php',
      controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
      dimensionsSourcePath: 'includes/controls/dimensions.php',
      dimensionsSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
      controlName: 'margin',
      tabletSettingKey: 'margin_tablet',
      mobileSettingKey: 'margin_mobile',
      unit: 'px',
    });
    expect(result.status).toBe('RESPONSIVE_MARGIN_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings).not.toHaveProperty('margin');
    expect(settings.margin_tablet).toEqual(expectedDimensions(tablet));
    expect(settings.margin_mobile).toEqual(expectedDimensions(mobile));
    expect((settings.margin_tablet as Record<string, unknown>).isLinked).toBe(false);
    expect((settings.margin_mobile as Record<string, unknown>).isLinked).toBe(true);
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('binds nested containers and omits unspecified breakpoint margin', () => {
    const source = sourceDocument();
    const mobile = { top: 0, right: 4, bottom: 0, left: 4 };
    const result = resolveP15ElementorResponsiveContainerMargin(source, manifest(source, [
      { sourceNodeId: 'nested', mobileMarginPx: mobile },
    ]));

    expect(result.status).toBe('RESPONSIVE_MARGIN_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings).not.toHaveProperty('margin_tablet');
    expect(rootSettings).not.toHaveProperty('margin_mobile');
    expect(nestedSettings).not.toHaveProperty('margin');
    expect(nestedSettings).not.toHaveProperty('margin_tablet');
    expect(nestedSettings.margin_mobile).toEqual(expectedDimensions(mobile));
    expect(result.resolvedMargins).toEqual([
      {
        sourceNodeId: 'nested',
        tabletMarginPx: null,
        mobileMarginPx: mobile,
      },
    ]);
  });

  it('accepts zero and the existing neutral spacing boundary', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerMargin(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletMarginPx: { top: 0, right: 0, bottom: 0, left: 0 },
        mobileMarginPx: {
          top: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
          right: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
          bottom: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
          left: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
        },
      },
    ]));

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.margin_tablet).toEqual(expectedDimensions({ top: 0, right: 0, bottom: 0, left: 0 }));
    expect(settings.margin_mobile).toEqual(expectedDimensions({
      top: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
      right: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
      bottom: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
      left: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
    }));
  });

  it('returns a deterministic no-op when no margin overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorResponsiveContainerMargin(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerMargin(source, manifest(source, []));

    expect(first.status).toBe('NO_RESPONSIVE_MARGIN_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source and stale base-candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [
      { sourceNodeId: 'root', mobileMarginPx: { top: 1, right: 2, bottom: 3, left: 4 } },
    ]);

    const staleSource = resolveP15ElementorResponsiveContainerMargin(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.template).toBeNull();
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MARGIN_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerMargin(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MARGIN_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('fails closed for duplicate, non-container, empty, malformed, negative, non-finite, out-of-range and unknown-field entries', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorResponsiveContainerMargin(source, manifest(source, [
      { sourceNodeId: 'root', mobileMarginPx: { top: 1, right: 1, bottom: 1, left: 1 } },
      { sourceNodeId: 'root', tabletMarginPx: { top: 2, right: 2, bottom: 2, left: 2 } },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MARGIN_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerMargin(source, manifest(source, [
      { sourceNodeId: 'copy', mobileMarginPx: { top: 1, right: 1, bottom: 1, left: 1 } },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MARGIN_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerMargin(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MARGIN_OVERRIDE_REQUIRED');

    const malformed = resolveP15ElementorResponsiveContainerMargin(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobileMarginPx: { top: 1, right: 1, bottom: 1 },
      }],
    });
    expect(malformed.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MARGIN_VALUE_INVALID');

    const extraSide = resolveP15ElementorResponsiveContainerMargin(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobileMarginPx: { top: 1, right: 1, bottom: 1, left: 1, inline: 1 },
      }],
    });
    expect(extraSide.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MARGIN_VALUE_INVALID');

    for (const value of [
      -1,
      P15_NEUTRAL_EXPORT_MAX_SPACING_PX + 1,
      Number.POSITIVE_INFINITY,
      Number.NaN,
      '10px',
      'calc(100% - 1px)',
      'var(--unsafe)',
    ]) {
      const invalid = resolveP15ElementorResponsiveContainerMargin(source, {
        ...manifest(source, []),
        containers: [{
          sourceNodeId: 'root',
          mobileMarginPx: { top: value, right: 0, bottom: 0, left: 0 },
        }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_MARGIN_VALUE_INVALID');
    }

    const unknownEntryField = resolveP15ElementorResponsiveContainerMargin(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobileMarginPx: { top: 1, right: 1, bottom: 1, left: 1 },
        unit: 'rem',
      }],
    });
    expect(unknownEntryField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MARGIN_ENTRY_INVALID');
  });

  it('snapshots caller margin objects before applying or reporting them', () => {
    const source = sourceDocument();
    const mobile = { top: 1, right: 2, bottom: 3, left: 4 };
    const input = manifest(source, [{ sourceNodeId: 'root', mobileMarginPx: mobile }]);
    const result = resolveP15ElementorResponsiveContainerMargin(source, input);

    mobile.top = 999;
    expect(result.resolvedMargins[0]?.mobileMarginPx).toEqual({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    });
    expect(settingsOf(result.template?.content[0]).margin_mobile)
      .toEqual(expectedDimensions({ top: 1, right: 2, bottom: 3, left: 4 }));
  });

  it('blocks review-bearing upstream IR instead of generating a partial responsive candidate', () => {
    const source: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked margin source',
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

    const result = resolveP15ElementorResponsiveContainerMargin(source, {});
    expect(result.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(result.baseCandidateIdentityDigest).toBeNull();
    expect(result.resolvedCandidateIdentityDigest).toBeNull();
    expect(result.template).toBeNull();
    expect(result.candidate).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_MARGIN_UPSTREAM_GENERATION_NOT_READY' }),
    ]);
  });

  it('rejects authority inflation and serializes only sanitized margin metadata', () => {
    const source = sourceDocument();
    const raw = manifest(source, [
      { sourceNodeId: 'root', mobileMarginPx: { top: 1, right: 2, bottom: 3, left: 4 } },
    ]);

    const inflatedManifest = resolveP15ElementorResponsiveContainerMargin(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflatedManifest.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MARGIN_AUTHORITY_FLAGS_INVALID');

    const result = resolveP15ElementorResponsiveContainerMargin(source, raw);
    const serialized = serializeP15ElementorResponsiveMarginSummary(result);
    expect(serialized).not.toContain('PRIVATE MARGIN COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"margin_mobile"');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerMargin(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE MARGIN COPY',
    }));
    expect(serializeP15ElementorResponsiveMarginSummary(mutatedIssue))
      .not.toContain('PRIVATE MARGIN COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveMarginResultV1;
    expect(() => serializeP15ElementorResponsiveMarginSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
