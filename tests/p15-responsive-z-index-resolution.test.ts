import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_Z_INDEX_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MANIFEST_VERSION,
  P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX,
  resolveP15ElementorResponsiveContainerZIndex,
  serializeP15ElementorResponsiveZIndexSummary,
  type P15ElementorResponsiveZIndexManifestV1,
  type P15ElementorResponsiveZIndexResultV1,
} from '../src/targets/elementor/responsive-z-index-resolution';
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
    title: 'Responsive z-index private source',
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
                text: 'PRIVATE Z INDEX COPY',
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
  containers: P15ElementorResponsiveZIndexManifestV1['containers'],
): P15ElementorResponsiveZIndexManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MANIFEST_VERSION,
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

describe('P15 exact source-bound responsive container min-height resolution', () => {
  it('writes exact Elementor 4.2.4 tablet/mobile z-index controls while leaving desktop z-index untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerZIndex(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletZIndex: 50,
        mobileZIndex: 7,
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_Z_INDEX_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      controlsStackSourcePath: 'includes/base/controls-stack.php',
      controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
      containerPlaywrightSourcePath: 'tests/playwright/sanity/modules/container/container-1.test.ts',
      containerPlaywrightSourceBlobSha: '1cdbc387887abea49d4e8477b1b3a684c5149c9e',
      responsiveNumberFixtureSourcePath: 'tests/qunit/mock/elments/video.json',
      responsiveNumberFixtureSourceBlobSha: '20f71a3e127ac3806446c95b313abff01e4b97c2',
      controlName: 'z_index',
      desktopSettingKey: 'z_index',
      tabletSettingKey: 'z_index_tablet',
      mobileSettingKey: 'z_index_mobile',
      minValue: 0,
      maxValue: P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX,
    });
    expect(result.status).toBe('RESPONSIVE_Z_INDEX_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings).not.toHaveProperty('z_index');
    expect(settings.z_index_tablet).toEqual(50);
    expect(settings.z_index_mobile).toEqual(7);
    expect(result.resolvedZIndexs).toEqual([{
      sourceNodeId: 'root',
      tabletZIndex: 50,
      mobileZIndex: 7,
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

  it('supports zero z-index, binds nested containers, and omits unspecified breakpoints', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerZIndex(source, manifest(source, [
      { sourceNodeId: 'nested', mobileZIndex: 0 },
    ]));

    expect(result.status).toBe('RESPONSIVE_Z_INDEX_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings).not.toHaveProperty('z_index');
    expect(rootSettings).not.toHaveProperty('z_index_tablet');
    expect(rootSettings).not.toHaveProperty('z_index_mobile');
    expect(nestedSettings).not.toHaveProperty('z_index');
    expect(nestedSettings).not.toHaveProperty('z_index_tablet');
    expect(nestedSettings.z_index_mobile).toEqual(0);
    expect(result.resolvedZIndexs).toEqual([{
      sourceNodeId: 'nested',
      tabletZIndex: null,
      mobileZIndex: 0,
    }]);
  });

  it('accepts the repo safety max and returns a deterministic no-op for no overrides', () => {
    const source = sourceDocument();
    const max = resolveP15ElementorResponsiveContainerZIndex(source, manifest(source, [
      { sourceNodeId: 'root', tabletZIndex: P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX },
    ]));
    expect(settingsOf(max.template?.content[0]).z_index_tablet)
      .toEqual(P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX);

    const first = resolveP15ElementorResponsiveContainerZIndex(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerZIndex(source, manifest(source, []));
    expect(first.status).toBe('NO_RESPONSIVE_Z_INDEX_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay and invalid entries', () => {
    const source = sourceDocument();
    const valid = manifest(source, [
      { sourceNodeId: 'root', mobileZIndex: 25 },
    ]);

    const staleSource = resolveP15ElementorResponsiveContainerZIndex(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_Z_INDEX_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerZIndex(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_Z_INDEX_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const duplicate = resolveP15ElementorResponsiveContainerZIndex(source, manifest(source, [
      { sourceNodeId: 'root', mobileZIndex: 1 },
      { sourceNodeId: 'root', tabletZIndex: 2 },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_Z_INDEX_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerZIndex(source, manifest(source, [
      { sourceNodeId: 'copy', mobileZIndex: 1 },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_Z_INDEX_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerZIndex(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_Z_INDEX_OVERRIDE_REQUIRED');

    for (const value of [
      -1,
      1.5,
      P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX + 1,
      Number.POSITIVE_INFINITY,
      Number.NaN,
      '50',
      '10px',
      'calc(1 + 1)',
      'var(--unsafe)',
    ]) {
      const invalid = resolveP15ElementorResponsiveContainerZIndex(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', mobileZIndex: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_Z_INDEX_VALUE_INVALID');
    }

    const unknownEntryField = resolveP15ElementorResponsiveContainerZIndex(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobileZIndex: 25,
        unit: 'px',
      }],
    });
    expect(unknownEntryField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_Z_INDEX_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked z-index source',
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
    const blocked = resolveP15ElementorResponsiveContainerZIndex(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_Z_INDEX_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileZIndex: 25 }]);
    const inflated = resolveP15ElementorResponsiveContainerZIndex(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_Z_INDEX_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized z-index metadata and refuses authority-inflated results', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileZIndex: 25 }]);
    const result = resolveP15ElementorResponsiveContainerZIndex(source, raw);
    const serialized = serializeP15ElementorResponsiveZIndexSummary(result);

    expect(serialized).not.toContain('PRIVATE Z INDEX COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"z_index_mobile"');
    expect(serialized).toContain('"mobileZIndex": 4');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerZIndex(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE Z INDEX COPY',
    }));
    expect(serializeP15ElementorResponsiveZIndexSummary(mutatedIssue))
      .not.toContain('PRIVATE Z INDEX COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveZIndexResultV1;
    expect(() => serializeP15ElementorResponsiveZIndexSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
