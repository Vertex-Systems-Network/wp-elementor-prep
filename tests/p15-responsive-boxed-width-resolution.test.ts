import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MANIFEST_VERSION,
  P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX,
  P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX,
  resolveP15ElementorResponsiveContainerBoxedWidth,
  serializeP15ElementorResponsiveBoxedWidthSummary,
  type P15ElementorResponsiveBoxedWidthManifestV1,
  type P15ElementorResponsiveBoxedWidthResultV1,
} from '../src/targets/elementor/responsive-boxed-width-resolution';
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
    title: 'Responsive boxed width private source',
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
                text: 'PRIVATE BOXED WIDTH COPY',
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
  containers: P15ElementorResponsiveBoxedWidthManifestV1['containers'],
): P15ElementorResponsiveBoxedWidthManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MANIFEST_VERSION,
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
  it('writes exact Elementor 4.2.4 tablet/mobile boxed width controls while leaving desktop boxed width untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerBoxedWidth(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletBoxedWidthPx: 900,
        mobileBoxedWidthPx: 700,
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      controlsStackSourcePath: 'includes/base/controls-stack.php',
      controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
      sliderSourcePath: 'includes/controls/slider.php',
      sliderSourceBlobSha: 'f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f',
      fixtureSourcePath: 'tests/jest/unit/modules/container-converter/assets/js/editor/commands/convert.test.js',
      fixtureSourceBlobSha: '27c8d0eadae77a9c4e33258111829f47ed9e217b',
      conditionControlName: 'content_width',
      conditionDefaultValue: 'boxed',
      conditionRequiredValue: 'boxed',
      controlName: 'boxed_width',
      desktopSettingKey: 'boxed_width',
      tabletSettingKey: 'boxed_width_tablet',
      mobileSettingKey: 'boxed_width_mobile',
      unit: 'px',
      minPx: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX,
      maxPx: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX,
    });
    expect(result.status).toBe('RESPONSIVE_BOXED_WIDTH_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings).not.toHaveProperty('content_width');
    expect(settings).not.toHaveProperty('boxed_width');
    expect(settings.boxed_width_tablet).toEqual(expectedSlider(900));
    expect(settings.boxed_width_mobile).toEqual(expectedSlider(700));
    expect(result.resolvedBoxedWidths).toEqual([{
      sourceNodeId: 'root',
      tabletBoxedWidthPx: 900,
      mobileBoxedWidthPx: 700,
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

  it('supports the minimum boxed width, binds nested containers, and omits unspecified breakpoints', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerBoxedWidth(source, manifest(source, [
      { sourceNodeId: 'nested', mobileBoxedWidthPx: 500 },
    ]));

    expect(result.status).toBe('RESPONSIVE_BOXED_WIDTH_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings).not.toHaveProperty('content_width');
    expect(rootSettings).not.toHaveProperty('boxed_width');
    expect(rootSettings).not.toHaveProperty('boxed_width_tablet');
    expect(rootSettings).not.toHaveProperty('boxed_width_mobile');
    expect(nestedSettings).not.toHaveProperty('content_width');
    expect(nestedSettings).not.toHaveProperty('boxed_width');
    expect(nestedSettings).not.toHaveProperty('boxed_width_tablet');
    expect(nestedSettings.boxed_width_mobile).toEqual(expectedSlider(500));
    expect(result.resolvedBoxedWidths).toEqual([{
      sourceNodeId: 'nested',
      tabletBoxedWidthPx: null,
      mobileBoxedWidthPx: 500,
    }]);
  });

  it('accepts the bounded Elementor px range and returns a deterministic no-op for no overrides', () => {
    const source = sourceDocument();
    const min = resolveP15ElementorResponsiveContainerBoxedWidth(source, manifest(source, [
      { sourceNodeId: 'root', tabletBoxedWidthPx: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX },
    ]));
    expect(settingsOf(min.template?.content[0]).boxed_width_tablet)
      .toEqual(expectedSlider(P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX));

    const max = resolveP15ElementorResponsiveContainerBoxedWidth(source, manifest(source, [
      { sourceNodeId: 'root', mobileBoxedWidthPx: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX },
    ]));
    expect(settingsOf(max.template?.content[0]).boxed_width_mobile)
      .toEqual(expectedSlider(P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX));

    const first = resolveP15ElementorResponsiveContainerBoxedWidth(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerBoxedWidth(source, manifest(source, []));
    expect(first.status).toBe('NO_RESPONSIVE_BOXED_WIDTH_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay and invalid entries', () => {
    const source = sourceDocument();
    const valid = manifest(source, [
      { sourceNodeId: 'root', mobileBoxedWidthPx: 4 },
    ]);

    const staleSource = resolveP15ElementorResponsiveContainerBoxedWidth(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BOXED_WIDTH_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerBoxedWidth(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BOXED_WIDTH_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const duplicate = resolveP15ElementorResponsiveContainerBoxedWidth(source, manifest(source, [
      { sourceNodeId: 'root', mobileBoxedWidthPx: 1 },
      { sourceNodeId: 'root', tabletBoxedWidthPx: 2 },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BOXED_WIDTH_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerBoxedWidth(source, manifest(source, [
      { sourceNodeId: 'copy', mobileBoxedWidthPx: 1 },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BOXED_WIDTH_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerBoxedWidth(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BOXED_WIDTH_OVERRIDE_REQUIRED');

    for (const value of [
      P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX - 1,
      -1,
      1.5,
      P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX + 1,
      Number.POSITIVE_INFINITY,
      Number.NaN,
      '100%',
      '10px',
      'calc(100% - 20px)',
      'var(--unsafe)',
    ]) {
      const invalid = resolveP15ElementorResponsiveContainerBoxedWidth(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', mobileBoxedWidthPx: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_BOXED_WIDTH_VALUE_INVALID');
    }

    const unknownEntryField = resolveP15ElementorResponsiveContainerBoxedWidth(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobileBoxedWidthPx: 4,
        unit: 'vw',
      }],
    });
    expect(unknownEntryField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BOXED_WIDTH_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked boxed width source',
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
    const blocked = resolveP15ElementorResponsiveContainerBoxedWidth(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_BOXED_WIDTH_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileBoxedWidthPx: 4 }]);
    const inflated = resolveP15ElementorResponsiveContainerBoxedWidth(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_BOXED_WIDTH_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized boxed width metadata and refuses authority-inflated results', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileBoxedWidthPx: 4 }]);
    const result = resolveP15ElementorResponsiveContainerBoxedWidth(source, raw);
    const serialized = serializeP15ElementorResponsiveBoxedWidthSummary(result);

    expect(serialized).not.toContain('PRIVATE BOXED WIDTH COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"boxed_width_mobile"');
    expect(serialized).toContain('"mobileBoxedWidthPx": 4');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerBoxedWidth(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE BOXED WIDTH COPY',
    }));
    expect(serializeP15ElementorResponsiveBoxedWidthSummary(mutatedIssue))
      .not.toContain('PRIVATE BOXED WIDTH COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveBoxedWidthResultV1;
    expect(() => serializeP15ElementorResponsiveBoxedWidthSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
