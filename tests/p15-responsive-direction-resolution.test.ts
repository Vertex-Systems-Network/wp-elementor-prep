import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerDirections,
  serializeP15ElementorResponsiveDirectionSummary,
  type P15ElementorResponsiveDirectionManifestV1,
  type P15ElementorResponsiveDirectionResultV1,
} from '../src/targets/elementor/responsive-direction-resolution';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';

function sourceDocument(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Responsive secret source',
    documentType: 'section',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'row',
        gapPx: 24,
        children: [
          {
            kind: 'container',
            sourceNodeId: 'nested',
            direction: 'column',
            children: [
              {
                kind: 'text',
                sourceNodeId: 'copy',
                text: 'PRIVATE RESPONSIVE COPY',
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
  containers: P15ElementorResponsiveDirectionManifestV1['containers'],
): P15ElementorResponsiveDirectionManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION,
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

describe('P15 exact source-bound responsive container direction resolution', () => {
  it('writes exact Elementor 4.2.4 tablet/mobile direction keys without changing desktop direction', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerDirections(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletDirection: 'row-reverse',
        mobileDirection: 'column',
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
      flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
      groupName: 'flex',
      controlName: 'direction',
      tabletSettingKey: 'flex_direction_tablet',
      mobileSettingKey: 'flex_direction_mobile',
    });
    expect(result.status).toBe('RESPONSIVE_DIRECTIONS_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.template).not.toBeNull();
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const root = result.template?.content[0];
    const settings = settingsOf(root);
    expect(settings.flex_direction).toBe('row');
    expect(settings.flex_direction_tablet).toBe('row-reverse');
    expect(settings.flex_direction_mobile).toBe('column');
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('binds nested source containers to the matching generated container and leaves unlisted containers untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerDirections(source, manifest(source, [
      {
        sourceNodeId: 'nested',
        mobileDirection: 'row-reverse',
      },
    ]));

    expect(result.status).toBe('RESPONSIVE_DIRECTIONS_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings.flex_direction).toBe('row');
    expect(rootSettings).not.toHaveProperty('flex_direction_tablet');
    expect(rootSettings).not.toHaveProperty('flex_direction_mobile');
    expect(nestedSettings.flex_direction).toBe('column');
    expect(nestedSettings).not.toHaveProperty('flex_direction_tablet');
    expect(nestedSettings.flex_direction_mobile).toBe('row-reverse');
    expect(result.resolvedDirections).toEqual([
      {
        sourceNodeId: 'nested',
        tabletDirection: null,
        mobileDirection: 'row-reverse',
      },
    ]);
  });

  it('supports tablet-only and mobile-only overrides without inventing missing breakpoint values', () => {
    const source = sourceDocument();
    const tabletOnly = resolveP15ElementorResponsiveContainerDirections(source, manifest(source, [
      { sourceNodeId: 'root', tabletDirection: 'column-reverse' },
    ]));
    const mobileOnly = resolveP15ElementorResponsiveContainerDirections(source, manifest(source, [
      { sourceNodeId: 'root', mobileDirection: 'column' },
    ]));

    const tabletSettings = settingsOf(tabletOnly.template?.content[0]);
    expect(tabletSettings.flex_direction_tablet).toBe('column-reverse');
    expect(tabletSettings).not.toHaveProperty('flex_direction_mobile');

    const mobileSettings = settingsOf(mobileOnly.template?.content[0]);
    expect(mobileSettings).not.toHaveProperty('flex_direction_tablet');
    expect(mobileSettings.flex_direction_mobile).toBe('column');
  });

  it('treats an empty manifest as a deterministic no-op with the base candidate identity preserved', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorResponsiveContainerDirections(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerDirections(source, manifest(source, []));

    expect(first.status).toBe('NO_RESPONSIVE_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source and stale base-candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'root', mobileDirection: 'column' }]);

    const staleSource = resolveP15ElementorResponsiveContainerDirections(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.template).toBeNull();
    expect(staleSource.candidate).toBeNull();
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerDirections(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicate, non-container, empty, invalid and unknown-field entries', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorResponsiveContainerDirections(source, manifest(source, [
      { sourceNodeId: 'root', mobileDirection: 'column' },
      { sourceNodeId: 'root', tabletDirection: 'row' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerDirections(source, manifest(source, [
      { sourceNodeId: 'copy', mobileDirection: 'column' },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerDirections(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_OVERRIDE_REQUIRED');

    const invalidDirection = resolveP15ElementorResponsiveContainerDirections(source, {
      ...manifest(source, []),
      containers: [{ sourceNodeId: 'root', mobileDirection: 'diagonal' }],
    });
    expect(invalidDirection.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_DIRECTION_INVALID');

    const unknownField = resolveP15ElementorResponsiveContainerDirections(source, {
      ...manifest(source, []),
      containers: [{ sourceNodeId: 'root', mobileDirection: 'column', viewportWidth: 375 }],
    });
    expect(unknownField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR instead of generating a partial responsive candidate', () => {
    const source: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Review-bearing source',
      documentType: 'section',
      nodes: [
        {
          kind: 'container',
          sourceNodeId: 'root',
          direction: 'row',
          children: [
            {
              kind: 'review',
              sourceNodeId: 'manual',
              reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW',
              detail: 'Must remain blocked.',
            },
          ],
        },
      ],
    };

    const result = resolveP15ElementorResponsiveContainerDirections(source, {});
    expect(result.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(result.baseCandidateIdentityDigest).toBeNull();
    expect(result.resolvedCandidateIdentityDigest).toBeNull();
    expect(result.template).toBeNull();
    expect(result.candidate).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_UPSTREAM_GENERATION_NOT_READY' }),
    ]);
  });

  it('rejects authority inflation and serializes only sanitized responsive metadata', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileDirection: 'column' }]);
    const inflatedManifest = resolveP15ElementorResponsiveContainerDirections(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflatedManifest.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(inflatedManifest.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_AUTHORITY_FLAGS_INVALID');

    const result = resolveP15ElementorResponsiveContainerDirections(source, raw);
    const serialized = serializeP15ElementorResponsiveDirectionSummary(result);
    expect(serialized).not.toContain('PRIVATE RESPONSIVE COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"flex_direction_mobile"');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerDirections(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE RESPONSIVE COPY',
    }));
    expect(serializeP15ElementorResponsiveDirectionSummary(mutatedIssue))
      .not.toContain('PRIVATE RESPONSIVE COPY');

    const inflatedResult = {
      ...result,
      productionAcceptance: true,
    } as unknown as P15ElementorResponsiveDirectionResultV1;
    expect(() => serializeP15ElementorResponsiveDirectionSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
