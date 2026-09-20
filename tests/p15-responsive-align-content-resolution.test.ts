import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerAlignContent,
  serializeP15ElementorResponsiveAlignContentSummary,
  type P15ElementorResponsiveAlignContentManifestV1,
  type P15ElementorResponsiveAlignContentResultV1,
} from '../src/targets/elementor/responsive-align-content-resolution';
import {
  P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerWraps,
  type P15ElementorResponsiveWrapManifestV1,
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
    title: 'Responsive align-content secret source',
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
                text: 'PRIVATE ALIGN CONTENT COPY',
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

function wrapManifest(
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

function alignManifest(
  source: P15NeutralExportDocumentV1,
  wraps: P15ElementorResponsiveWrapManifestV1,
  containers: P15ElementorResponsiveAlignContentManifestV1['containers'],
): P15ElementorResponsiveAlignContentManifestV1 {
  const wrapResult = resolveP15ElementorResponsiveContainerWraps(source, wraps);
  if (!wrapResult.resolvedCandidateIdentityDigest) {
    throw new Error('fixture wrap prerequisite must expose a candidate identity');
  }
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    wrappedCandidateIdentityDigest: wrapResult.resolvedCandidateIdentityDigest,
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

describe('P15 wrap-conditioned responsive container align-content resolution', () => {
  it('locks exact Elementor 4.2.4 evidence and applies align-content only after explicit same-breakpoint wrap', () => {
    const source = sourceDocument();
    const wraps = wrapManifest(source, [{
      sourceNodeId: 'root',
      tabletWrap: 'wrap',
      mobileWrap: 'wrap',
    }]);
    const result = resolveP15ElementorResponsiveContainerAlignContent(
      source,
      wraps,
      alignManifest(source, wraps, [{
        sourceNodeId: 'root',
        tabletAlignContent: 'center',
        mobileAlignContent: 'space-between',
      }]),
    );

    expect(P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
      flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
      qunitFixturePath: 'tests/qunit/mock/elments/container.json',
      qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
      groupName: 'flex',
      controlName: 'align_content',
      prerequisiteControlName: 'wrap',
      prerequisiteValue: 'wrap',
      desktopSettingKey: 'container_align_content',
      tabletSettingKey: 'container_align_content_tablet',
      mobileSettingKey: 'container_align_content_mobile',
      supportedValues: [
        'flex-start',
        'center',
        'flex-end',
        'space-between',
        'space-around',
        'space-evenly',
      ],
    });
    expect(result.status).toBe('RESPONSIVE_ALIGN_CONTENT_RESOLVED');
    expect(result.wrapPrerequisiteStatus).toBe('RESPONSIVE_WRAPS_RESOLVED');
    expect(result.issues).toEqual([]);
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.flex_wrap_tablet).toBe('wrap');
    expect(settings.flex_wrap_mobile).toBe('wrap');
    expect(settings.container_align_content_tablet).toBe('center');
    expect(settings.container_align_content_mobile).toBe('space-between');
    expect(settings).not.toHaveProperty('container_align_content');
    expect(result.wrappedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.wrappedCandidateIdentityDigest);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('rejects missing or nowrap same-breakpoint wrap instead of inferring eligibility', () => {
    const source = sourceDocument();

    const missingWraps = wrapManifest(source, [{ sourceNodeId: 'root', tabletWrap: 'wrap' }]);
    const missing = resolveP15ElementorResponsiveContainerAlignContent(
      source,
      missingWraps,
      alignManifest(source, missingWraps, [{
        sourceNodeId: 'root',
        mobileAlignContent: 'center',
      }]),
    );
    expect(missing.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(missing.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_WRAP_REQUIRED');

    const nowrapWraps = wrapManifest(source, [{ sourceNodeId: 'root', mobileWrap: 'nowrap' }]);
    const nowrap = resolveP15ElementorResponsiveContainerAlignContent(
      source,
      nowrapWraps,
      alignManifest(source, nowrapWraps, [{
        sourceNodeId: 'root',
        mobileAlignContent: 'space-around',
      }]),
    );
    expect(nowrap.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(nowrap.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_WRAP_REQUIRED');
    expect(nowrap.template).toBeNull();
  });

  it('binds nested containers exactly and leaves unlisted containers untouched', () => {
    const source = sourceDocument();
    const wraps = wrapManifest(source, [{ sourceNodeId: 'nested', mobileWrap: 'wrap' }]);
    const result = resolveP15ElementorResponsiveContainerAlignContent(
      source,
      wraps,
      alignManifest(source, wraps, [{
        sourceNodeId: 'nested',
        mobileAlignContent: 'flex-end',
      }]),
    );

    expect(result.status).toBe('RESPONSIVE_ALIGN_CONTENT_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);
    expect(rootSettings).not.toHaveProperty('container_align_content_mobile');
    expect(nestedSettings.flex_wrap_mobile).toBe('wrap');
    expect(nestedSettings.container_align_content_mobile).toBe('flex-end');
    expect(result.resolvedAlignContents).toEqual([{
      sourceNodeId: 'nested',
      tabletAlignContent: null,
      mobileAlignContent: 'flex-end',
    }]);
  });

  it('supports tablet-only and mobile-only align-content without inventing omitted breakpoint values', () => {
    const source = sourceDocument();

    const tabletWraps = wrapManifest(source, [{ sourceNodeId: 'root', tabletWrap: 'wrap' }]);
    const tablet = resolveP15ElementorResponsiveContainerAlignContent(
      source,
      tabletWraps,
      alignManifest(source, tabletWraps, [{
        sourceNodeId: 'root',
        tabletAlignContent: 'space-evenly',
      }]),
    );
    const tabletSettings = settingsOf(tablet.template?.content[0]);
    expect(tabletSettings.container_align_content_tablet).toBe('space-evenly');
    expect(tabletSettings).not.toHaveProperty('container_align_content_mobile');

    const mobileWraps = wrapManifest(source, [{ sourceNodeId: 'root', mobileWrap: 'wrap' }]);
    const mobile = resolveP15ElementorResponsiveContainerAlignContent(
      source,
      mobileWraps,
      alignManifest(source, mobileWraps, [{
        sourceNodeId: 'root',
        mobileAlignContent: 'flex-start',
      }]),
    );
    const mobileSettings = settingsOf(mobile.template?.content[0]);
    expect(mobileSettings).not.toHaveProperty('container_align_content_tablet');
    expect(mobileSettings.container_align_content_mobile).toBe('flex-start');
  });

  it('treats an empty align-content manifest as a deterministic no-op over the exact wrapped candidate', () => {
    const source = sourceDocument();
    const wraps = wrapManifest(source, [{ sourceNodeId: 'root', mobileWrap: 'wrap' }]);
    const manifest = alignManifest(source, wraps, []);

    const first = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, manifest);
    const second = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, manifest);
    expect(first.status).toBe('NO_RESPONSIVE_ALIGN_CONTENT_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.wrappedCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale wrapped-candidate/source bindings and invalid wrap prerequisite', () => {
    const source = sourceDocument();
    const wraps = wrapManifest(source, [{ sourceNodeId: 'root', mobileWrap: 'wrap' }]);
    const valid = alignManifest(source, wraps, [{
      sourceNodeId: 'root',
      mobileAlignContent: 'center',
    }]);

    const staleCandidate = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, {
      ...valid,
      wrappedCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_WRAPPED_CANDIDATE_IDENTITY_MISMATCH');

    const staleSource = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_FINGERPRINT_MISMATCH');

    const invalidWrap = resolveP15ElementorResponsiveContainerAlignContent(source, {
      ...wraps,
      baseCandidateIdentityDigest: 'sha256:' + '3'.repeat(64),
    }, valid);
    expect(invalidWrap.status).toBe('BLOCKED_WRAP_PREREQUISITE');
    expect(invalidWrap.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_WRAP_PREREQUISITE_INVALID');
  });

  it('rejects duplicate, non-container, empty, unsupported and unknown-field entries', () => {
    const source = sourceDocument();
    const wraps = wrapManifest(source, [
      { sourceNodeId: 'root', tabletWrap: 'wrap', mobileWrap: 'wrap' },
      { sourceNodeId: 'nested', mobileWrap: 'wrap' },
    ]);

    const duplicate = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, {
      ...alignManifest(source, wraps, []),
      containers: [
        { sourceNodeId: 'root', tabletAlignContent: 'center' },
        { sourceNodeId: 'root', mobileAlignContent: 'flex-start' },
      ],
    });
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, {
      ...alignManifest(source, wraps, []),
      containers: [{ sourceNodeId: 'copy', mobileAlignContent: 'center' }],
    });
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, {
      ...alignManifest(source, wraps, []),
      containers: [{ sourceNodeId: 'root' }],
    });
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_OVERRIDE_REQUIRED');

    const unsupported = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, {
      ...alignManifest(source, wraps, []),
      containers: [{ sourceNodeId: 'root', mobileAlignContent: 'stretch' }],
    });
    expect(unsupported.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_VALUE_INVALID');

    const unknown = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, {
      ...alignManifest(source, wraps, []),
      containers: [{
        sourceNodeId: 'root',
        mobileAlignContent: 'center',
        viewportWidth: 375,
      }],
    });
    expect(unknown.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_ENTRY_INVALID');
  });

  it('rejects authority inflation and serializes sanitized dependency/evidence metadata only', () => {
    const source = sourceDocument();
    const wraps = wrapManifest(source, [{ sourceNodeId: 'root', mobileWrap: 'wrap' }]);
    const raw = alignManifest(source, wraps, [{
      sourceNodeId: 'root',
      mobileAlignContent: 'center',
    }]);

    const inflatedManifest = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflatedManifest.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(inflatedManifest.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_ALIGN_CONTENT_AUTHORITY_FLAGS_INVALID');

    const result = resolveP15ElementorResponsiveContainerAlignContent(source, wraps, raw);
    const serialized = serializeP15ElementorResponsiveAlignContentSummary(result);
    expect(serialized).not.toContain('PRIVATE ALIGN CONTENT COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"container_align_content_mobile"');
    expect(serialized).toContain('"prerequisiteControlName": "wrap"');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerAlignContent(source, wraps, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '4'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE ALIGN CONTENT COPY',
    }));
    expect(serializeP15ElementorResponsiveAlignContentSummary(mutatedIssue))
      .not.toContain('PRIVATE ALIGN CONTENT COPY');

    const inflatedResult = {
      ...result,
      productionAcceptance: true,
    } as unknown as P15ElementorResponsiveAlignContentResultV1;
    expect(() => serializeP15ElementorResponsiveAlignContentSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
