import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerHoverBorderRadius,
  serializeP15ElementorResponsiveHoverBorderRadiusSummary,
  type P15ElementorResponsiveHoverBorderRadiusManifestV1,
  type P15ElementorResponsiveHoverBorderRadiusResultV1,
} from '../src/targets/elementor/responsive-hover-border-radius-resolution';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  P15_NEUTRAL_EXPORT_MAX_RADIUS_PX,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function sourceDocument(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Responsive radius private source',
    documentType: 'section',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'row',
        cornerRadiusPx: 12,
        children: [
          {
            kind: 'container',
            sourceNodeId: 'nested',
            direction: 'column',
            cornerRadiusPx: 8,
            children: [
              {
                kind: 'text',
                sourceNodeId: 'copy',
                text: 'PRIVATE RADIUS COPY',
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
  containers: P15ElementorResponsiveHoverBorderRadiusManifestV1['containers'],
): P15ElementorResponsiveHoverBorderRadiusManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION,
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

function expectedDimensions(value: number): Record<string, unknown> {
  return {
    unit: 'px',
    top: String(value),
    right: String(value),
    bottom: String(value),
    left: String(value),
    isLinked: true,
  };
}

describe('P15 exact source-bound responsive container border-radius resolution', () => {
  it('writes exact Elementor 4.2.4 tablet/mobile radius controls while preserving desktop radius', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletCornerRadiusPx: 20,
        mobileCornerRadiusPx: 6,
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      controlsStackSourcePath: 'includes/base/controls-stack.php',
      controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
      dimensionsSourcePath: 'includes/controls/dimensions.php',
      dimensionsSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
      controlName: 'border_radius_hover',
      desktopSettingKey: 'border_radius_hover',
      tabletSettingKey: 'border_radius_hover_tablet',
      mobileSettingKey: 'border_radius_hover_mobile',
    });
    expect(result.status).toBe('RESPONSIVE_HOVER_BORDER_RADIUS_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.border_radius).toEqual(expectedDimensions(12));
    expect(settings).not.toHaveProperty('border_radius_hover');
    expect(settings.border_radius_hover_tablet).toEqual(expectedDimensions(20));
    expect(settings.border_radius_hover_mobile).toEqual(expectedDimensions(6));
    expect(result.resolvedHoverBorderRadii).toEqual([{
      sourceNodeId: 'root',
      tabletCornerRadiusPx: 20,
      mobileCornerRadiusPx: 6,
    }]);
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('supports zero radius, binds nested containers, and omits unspecified breakpoints', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, manifest(source, [
      { sourceNodeId: 'nested', mobileCornerRadiusPx: 0 },
    ]));

    expect(result.status).toBe('RESPONSIVE_HOVER_BORDER_RADIUS_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings.border_radius).toEqual(expectedDimensions(12));
    expect(rootSettings).not.toHaveProperty('border_radius_hover');
    expect(rootSettings).not.toHaveProperty('border_radius_hover_tablet');
    expect(rootSettings).not.toHaveProperty('border_radius_hover_mobile');
    expect(nestedSettings.border_radius).toEqual(expectedDimensions(8));
    expect(nestedSettings).not.toHaveProperty('border_radius_hover');
    expect(nestedSettings).not.toHaveProperty('border_radius_hover_tablet');
    expect(nestedSettings.border_radius_hover_mobile).toEqual(expectedDimensions(0));
    expect(result.resolvedHoverBorderRadii).toEqual([{
      sourceNodeId: 'nested',
      tabletCornerRadiusPx: null,
      mobileCornerRadiusPx: 0,
    }]);
  });

  it('accepts the existing neutral radius ceiling and returns a deterministic no-op for no overrides', () => {
    const source = sourceDocument();
    const max = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, manifest(source, [
      { sourceNodeId: 'root', tabletCornerRadiusPx: P15_NEUTRAL_EXPORT_MAX_RADIUS_PX },
    ]));
    expect(settingsOf(max.template?.content[0]).border_radius_hover_tablet)
      .toEqual(expectedDimensions(P15_NEUTRAL_EXPORT_MAX_RADIUS_PX));

    const first = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, manifest(source, []));
    expect(first.status).toBe('NO_RESPONSIVE_HOVER_BORDER_RADIUS_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay and invalid entries', () => {
    const source = sourceDocument();
    const valid = manifest(source, [
      { sourceNodeId: 'root', mobileCornerRadiusPx: 4 },
    ]);

    const staleSource = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_HOVER_BORDER_RADIUS_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_HOVER_BORDER_RADIUS_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const duplicate = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, manifest(source, [
      { sourceNodeId: 'root', mobileCornerRadiusPx: 1 },
      { sourceNodeId: 'root', tabletCornerRadiusPx: 2 },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_HOVER_BORDER_RADIUS_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, manifest(source, [
      { sourceNodeId: 'copy', mobileCornerRadiusPx: 1 },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_HOVER_BORDER_RADIUS_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_HOVER_BORDER_RADIUS_OVERRIDE_REQUIRED');

    for (const value of [
      -1,
      1.5,
      P15_NEUTRAL_EXPORT_MAX_RADIUS_PX + 1,
      Number.POSITIVE_INFINITY,
      Number.NaN,
    ]) {
      const invalid = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', mobileCornerRadiusPx: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_HOVER_BORDER_RADIUS_VALUE_INVALID');
    }

    const unknownEntryField = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobileCornerRadiusPx: 4,
        unit: 'rem',
      }],
    });
    expect(unknownEntryField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_HOVER_BORDER_RADIUS_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked radius source',
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
    const blocked = resolveP15ElementorResponsiveContainerHoverBorderRadius(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileCornerRadiusPx: 4 }]);
    const inflated = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_HOVER_BORDER_RADIUS_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized radius metadata and refuses authority-inflated results', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileCornerRadiusPx: 4 }]);
    const result = resolveP15ElementorResponsiveContainerHoverBorderRadius(source, raw);
    const serialized = serializeP15ElementorResponsiveHoverBorderRadiusSummary(result);

    expect(serialized).not.toContain('PRIVATE RADIUS COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"border_radius_hover_mobile"');
    expect(serialized).toContain('"mobileCornerRadiusPx": 4');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerHoverBorderRadius(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE RADIUS COPY',
    }));
    expect(serializeP15ElementorResponsiveHoverBorderRadiusSummary(mutatedIssue))
      .not.toContain('PRIVATE RADIUS COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveHoverBorderRadiusResultV1;
    expect(() => serializeP15ElementorResponsiveHoverBorderRadiusSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
