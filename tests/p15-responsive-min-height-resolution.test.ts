import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION,
  P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX,
  resolveP15ElementorResponsiveContainerMinHeight,
  serializeP15ElementorResponsiveMinHeightSummary,
  type P15ElementorResponsiveMinHeightManifestV1,
  type P15ElementorResponsiveMinHeightResultV1,
} from '../src/targets/elementor/responsive-min-height-resolution';
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
    title: 'Responsive min height private source',
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
                text: 'PRIVATE MIN HEIGHT COPY',
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
  containers: P15ElementorResponsiveMinHeightManifestV1['containers'],
): P15ElementorResponsiveMinHeightManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION,
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

function expectedSlider(value: number): Record<string, unknown> {
  return {
    unit: 'px',
    size: value,
    sizes: [],
  };
}

describe('P15 exact source-bound responsive container min-height resolution', () => {
  it('writes exact Elementor 4.2.4 tablet/mobile min height controls while leaving desktop min height untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerMinHeight(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletMinHeightPx: 20,
        mobileMinHeightPx: 6,
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      controlsStackSourcePath: 'includes/base/controls-stack.php',
      controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
      sliderSourcePath: 'includes/controls/slider.php',
      sliderSourceBlobSha: 'f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f',
      fixtureSourcePath: 'tests/jest/unit/modules/container-converter/assets/js/editor/commands/convert.test.js',
      fixtureSourceBlobSha: '27c8d0eadae77a9c4e33258111829f47ed9e217b',
      controlName: 'min_height',
      desktopSettingKey: 'min_height',
      tabletSettingKey: 'min_height_tablet',
      mobileSettingKey: 'min_height_mobile',
      unit: 'px',
      maxPx: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX,
    });
    expect(result.status).toBe('RESPONSIVE_MIN_HEIGHT_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings).not.toHaveProperty('min_height');
    expect(settings.min_height_tablet).toEqual(expectedSlider(20));
    expect(settings.min_height_mobile).toEqual(expectedSlider(6));
    expect(result.resolvedMinHeights).toEqual([{
      sourceNodeId: 'root',
      tabletMinHeightPx: 20,
      mobileMinHeightPx: 6,
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

  it('supports zero min height, binds nested containers, and omits unspecified breakpoints', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerMinHeight(source, manifest(source, [
      { sourceNodeId: 'nested', mobileMinHeightPx: 0 },
    ]));

    expect(result.status).toBe('RESPONSIVE_MIN_HEIGHT_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings).not.toHaveProperty('min_height');
    expect(rootSettings).not.toHaveProperty('min_height_tablet');
    expect(rootSettings).not.toHaveProperty('min_height_mobile');
    expect(nestedSettings).not.toHaveProperty('min_height');
    expect(nestedSettings).not.toHaveProperty('min_height_tablet');
    expect(nestedSettings.min_height_mobile).toEqual(expectedSlider(0));
    expect(result.resolvedMinHeights).toEqual([{
      sourceNodeId: 'nested',
      tabletMinHeightPx: null,
      mobileMinHeightPx: 0,
    }]);
  });

  it('accepts the Elementor px max and returns a deterministic no-op for no overrides', () => {
    const source = sourceDocument();
    const max = resolveP15ElementorResponsiveContainerMinHeight(source, manifest(source, [
      { sourceNodeId: 'root', tabletMinHeightPx: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX },
    ]));
    expect(settingsOf(max.template?.content[0]).min_height_tablet)
      .toEqual(expectedSlider(P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX));

    const first = resolveP15ElementorResponsiveContainerMinHeight(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerMinHeight(source, manifest(source, []));
    expect(first.status).toBe('NO_RESPONSIVE_MIN_HEIGHT_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay and invalid entries', () => {
    const source = sourceDocument();
    const valid = manifest(source, [
      { sourceNodeId: 'root', mobileMinHeightPx: 4 },
    ]);

    const staleSource = resolveP15ElementorResponsiveContainerMinHeight(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MIN_HEIGHT_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerMinHeight(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MIN_HEIGHT_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const duplicate = resolveP15ElementorResponsiveContainerMinHeight(source, manifest(source, [
      { sourceNodeId: 'root', mobileMinHeightPx: 1 },
      { sourceNodeId: 'root', tabletMinHeightPx: 2 },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MIN_HEIGHT_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerMinHeight(source, manifest(source, [
      { sourceNodeId: 'copy', mobileMinHeightPx: 1 },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MIN_HEIGHT_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerMinHeight(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MIN_HEIGHT_OVERRIDE_REQUIRED');

    for (const value of [
      -1,
      1.5,
      P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX + 1,
      Number.POSITIVE_INFINITY,
      Number.NaN,
      '100vh',
      '10px',
      'calc(100vh - 20px)',
      'var(--unsafe)',
    ]) {
      const invalid = resolveP15ElementorResponsiveContainerMinHeight(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', mobileMinHeightPx: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_MIN_HEIGHT_VALUE_INVALID');
    }

    const unknownEntryField = resolveP15ElementorResponsiveContainerMinHeight(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobileMinHeightPx: 4,
        unit: 'vh',
      }],
    });
    expect(unknownEntryField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MIN_HEIGHT_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked min height source',
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
    const blocked = resolveP15ElementorResponsiveContainerMinHeight(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_MIN_HEIGHT_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileMinHeightPx: 4 }]);
    const inflated = resolveP15ElementorResponsiveContainerMinHeight(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_MIN_HEIGHT_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized min height metadata and refuses authority-inflated results', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileMinHeightPx: 4 }]);
    const result = resolveP15ElementorResponsiveContainerMinHeight(source, raw);
    const serialized = serializeP15ElementorResponsiveMinHeightSummary(result);

    expect(serialized).not.toContain('PRIVATE MIN HEIGHT COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"min_height_mobile"');
    expect(serialized).toContain('"mobileMinHeightPx": 4');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerMinHeight(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE MIN HEIGHT COPY',
    }));
    expect(serializeP15ElementorResponsiveMinHeightSummary(mutatedIssue))
      .not.toContain('PRIVATE MIN HEIGHT COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveMinHeightResultV1;
    expect(() => serializeP15ElementorResponsiveMinHeightSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
