import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerWraps,
  serializeP15ElementorResponsiveWrapSummary,
  type P15ElementorResponsiveWrapManifestV1,
  type P15ElementorResponsiveWrapResultV1,
} from '../src/targets/elementor/responsive-wrap-resolution';
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
    title: 'Responsive wrap secret source',
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
                text: 'PRIVATE RESPONSIVE WRAP COPY',
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
  containers: P15ElementorResponsiveWrapManifestV1['containers'],
): P15ElementorResponsiveWrapManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION,
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

describe('P15 exact source-bound responsive container wrap resolution', () => {
  it('locks exact Elementor 4.2.4 wrap source/fixture evidence and writes only tablet/mobile keys', () => {
    const source = sourceDocument();
    const base = generateElementorV3TemplateCandidate(source);
    expect(base.status).toBe('GENERATED_LOCAL_CANDIDATE');
    const baseSettings = settingsOf(base.template?.content[0]);
    const desktopWrapBefore = Object.prototype.hasOwnProperty.call(baseSettings, 'flex_wrap')
      ? baseSettings.flex_wrap
      : undefined;

    const result = resolveP15ElementorResponsiveContainerWraps(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletWrap: 'wrap',
        mobileWrap: 'nowrap',
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
      flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
      qunitFixturePath: 'tests/qunit/mock/elments/container.json',
      qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
      groupName: 'flex',
      controlName: 'wrap',
      desktopSettingKey: 'flex_wrap',
      tabletSettingKey: 'flex_wrap_tablet',
      mobileSettingKey: 'flex_wrap_mobile',
    });
    expect(result.status).toBe('RESPONSIVE_WRAPS_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.template).not.toBeNull();
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.flex_wrap_tablet).toBe('wrap');
    expect(settings.flex_wrap_mobile).toBe('nowrap');
    if (desktopWrapBefore === undefined) {
      expect(settings).not.toHaveProperty('flex_wrap');
    } else {
      expect(settings.flex_wrap).toBe(desktopWrapBefore);
    }
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('binds the exact nested container and leaves unlisted containers and omitted breakpoints untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerWraps(source, manifest(source, [
      {
        sourceNodeId: 'nested',
        mobileWrap: 'wrap',
      },
    ]));

    expect(result.status).toBe('RESPONSIVE_WRAPS_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings).not.toHaveProperty('flex_wrap_tablet');
    expect(rootSettings).not.toHaveProperty('flex_wrap_mobile');
    expect(nestedSettings).not.toHaveProperty('flex_wrap_tablet');
    expect(nestedSettings.flex_wrap_mobile).toBe('wrap');
    expect(result.resolvedWraps).toEqual([
      {
        sourceNodeId: 'nested',
        tabletWrap: null,
        mobileWrap: 'wrap',
      },
    ]);
  });

  it('supports tablet-only and mobile-only explicit values without synthesizing inheritance', () => {
    const source = sourceDocument();
    const tabletOnly = resolveP15ElementorResponsiveContainerWraps(source, manifest(source, [
      { sourceNodeId: 'root', tabletWrap: 'nowrap' },
    ]));
    const mobileOnly = resolveP15ElementorResponsiveContainerWraps(source, manifest(source, [
      { sourceNodeId: 'root', mobileWrap: 'wrap' },
    ]));

    const tabletSettings = settingsOf(tabletOnly.template?.content[0]);
    expect(tabletSettings.flex_wrap_tablet).toBe('nowrap');
    expect(tabletSettings).not.toHaveProperty('flex_wrap_mobile');

    const mobileSettings = settingsOf(mobileOnly.template?.content[0]);
    expect(mobileSettings).not.toHaveProperty('flex_wrap_tablet');
    expect(mobileSettings.flex_wrap_mobile).toBe('wrap');
  });

  it('treats an empty manifest as a deterministic no-op with base candidate identity preserved', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorResponsiveContainerWraps(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerWraps(source, manifest(source, []));

    expect(first.status).toBe('NO_RESPONSIVE_WRAP_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source and stale base candidate bindings', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'root', mobileWrap: 'wrap' }]);

    const staleSource = resolveP15ElementorResponsiveContainerWraps(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.template).toBeNull();
    expect(staleSource.candidate).toBeNull();
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_WRAP_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerWraps(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_WRAP_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicate, non-container, empty, unsupported wrap-reverse and unknown-field entries', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorResponsiveContainerWraps(source, manifest(source, [
      { sourceNodeId: 'root', mobileWrap: 'wrap' },
      { sourceNodeId: 'root', tabletWrap: 'nowrap' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_WRAP_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerWraps(source, manifest(source, [
      { sourceNodeId: 'copy', mobileWrap: 'wrap' },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_WRAP_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerWraps(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_WRAP_OVERRIDE_REQUIRED');

    const invalidValue = resolveP15ElementorResponsiveContainerWraps(source, {
      ...manifest(source, []),
      containers: [{ sourceNodeId: 'root', mobileWrap: 'wrap-reverse' }],
    });
    expect(invalidValue.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_WRAP_VALUE_INVALID');

    const unknownField = resolveP15ElementorResponsiveContainerWraps(source, {
      ...manifest(source, []),
      containers: [{ sourceNodeId: 'root', mobileWrap: 'wrap', viewportWidth: 375 }],
    });
    expect(unknownField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_WRAP_ENTRY_INVALID');
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

    const result = resolveP15ElementorResponsiveContainerWraps(source, {});
    expect(result.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(result.baseCandidateIdentityDigest).toBeNull();
    expect(result.resolvedCandidateIdentityDigest).toBeNull();
    expect(result.template).toBeNull();
    expect(result.candidate).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_WRAP_UPSTREAM_GENERATION_NOT_READY' }),
    ]);
  });

  it('rejects authority inflation and serializes only sanitized responsive metadata', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileWrap: 'wrap' }]);
    const inflatedManifest = resolveP15ElementorResponsiveContainerWraps(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflatedManifest.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(inflatedManifest.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_WRAP_AUTHORITY_FLAGS_INVALID');

    const result = resolveP15ElementorResponsiveContainerWraps(source, raw);
    const serialized = serializeP15ElementorResponsiveWrapSummary(result);
    expect(serialized).not.toContain('PRIVATE RESPONSIVE WRAP COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"flex_wrap_mobile"');
    expect(serialized).toContain('"qunitFixtureBlobSha"');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerWraps(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE RESPONSIVE WRAP COPY',
    }));
    expect(serializeP15ElementorResponsiveWrapSummary(mutatedIssue))
      .not.toContain('PRIVATE RESPONSIVE WRAP COPY');

    const inflatedResult = {
      ...result,
      productionAcceptance: true,
    } as unknown as P15ElementorResponsiveWrapResultV1;
    expect(() => serializeP15ElementorResponsiveWrapSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
