import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION,
  P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX,
  P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX,
  resolveP15ElementorResponsiveContainerFullWidth,
  serializeP15ElementorResponsiveFullWidthSummary,
  type P15ElementorResponsiveFullWidthManifestV1,
  type P15ElementorResponsiveFullWidthResultV1,
} from '../src/targets/elementor/responsive-full-width-resolution';
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
    title: 'Responsive full width private source',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'root',
      direction: 'row',
      children: [{
        kind: 'container',
        sourceNodeId: 'nested',
        direction: 'column',
        children: [{
          kind: 'text',
          sourceNodeId: 'copy',
          text: 'PRIVATE FULL WIDTH COPY',
          align: 'start',
        }],
      }],
    }],
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
  containers: P15ElementorResponsiveFullWidthManifestV1['containers'],
): P15ElementorResponsiveFullWidthManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION,
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
  return { unit: 'px', size: value, sizes: [] };
}

describe('P15 exact source-bound responsive full-width Container resolution', () => {
  it('writes explicit content_width=full plus exact tablet/mobile width controls while leaving desktop width untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerFullWidth(source, manifest(source, [{
      sourceNodeId: 'root',
      contentWidthMode: 'full',
      tabletWidthPx: 900,
      mobileWidthPx: 700,
    }]));

    expect(P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE).toEqual({
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
      conditionRequiredValue: 'full',
      controlName: 'width',
      desktopSettingKey: 'width',
      tabletSettingKey: 'width_tablet',
      mobileSettingKey: 'width_mobile',
      unit: 'px',
      minPx: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX,
      maxPx: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX,
    });

    expect(result.status).toBe('RESPONSIVE_FULL_WIDTH_RESOLVED');
    expect(result.issues).toEqual([]);
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.content_width).toBe('full');
    expect(settings).not.toHaveProperty('width');
    expect(settings.width_tablet).toEqual(expectedSlider(900));
    expect(settings.width_mobile).toEqual(expectedSlider(700));
    expect(result.resolvedWidths).toEqual([{
      sourceNodeId: 'root',
      contentWidthMode: 'full',
      tabletWidthPx: 900,
      mobileWidthPx: 700,
    }]);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('binds nested containers, omits unspecified breakpoints and keeps the empty manifest deterministic', () => {
    const source = sourceDocument();
    const resolved = resolveP15ElementorResponsiveContainerFullWidth(source, manifest(source, [{
      sourceNodeId: 'nested',
      contentWidthMode: 'full',
      mobileWidthPx: 500,
    }]));

    expect(resolved.status).toBe('RESPONSIVE_FULL_WIDTH_RESOLVED');
    const root = resolved.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings).not.toHaveProperty('content_width');
    expect(rootSettings).not.toHaveProperty('width_tablet');
    expect(rootSettings).not.toHaveProperty('width_mobile');
    expect(nestedSettings.content_width).toBe('full');
    expect(nestedSettings).not.toHaveProperty('width');
    expect(nestedSettings).not.toHaveProperty('width_tablet');
    expect(nestedSettings.width_mobile).toEqual(expectedSlider(500));

    const first = resolveP15ElementorResponsiveContainerFullWidth(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerFullWidth(source, manifest(source, []));
    expect(first.status).toBe('NO_RESPONSIVE_FULL_WIDTH_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('accepts exact px boundaries and rejects wrong mode, malformed units, duplicates and non-Container IDs', () => {
    const source = sourceDocument();

    const min = resolveP15ElementorResponsiveContainerFullWidth(source, manifest(source, [{
      sourceNodeId: 'root',
      contentWidthMode: 'full',
      tabletWidthPx: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX,
    }]));
    expect(settingsOf(min.template?.content[0]).width_tablet)
      .toEqual(expectedSlider(P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX));

    const max = resolveP15ElementorResponsiveContainerFullWidth(source, manifest(source, [{
      sourceNodeId: 'root',
      contentWidthMode: 'full',
      mobileWidthPx: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX,
    }]));
    expect(settingsOf(max.template?.content[0]).width_mobile)
      .toEqual(expectedSlider(P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX));

    const wrongMode = resolveP15ElementorResponsiveContainerFullWidth(source, {
      ...manifest(source, []),
      containers: [{ sourceNodeId: 'root', contentWidthMode: 'boxed', mobileWidthPx: 700 }],
    });
    expect(wrongMode.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FULL_WIDTH_CONDITION_MISMATCH');

    for (const value of [
      499,
      1601,
      -1,
      1.5,
      Number.POSITIVE_INFINITY,
      Number.NaN,
      '100%',
      '10px',
      'calc(100% - 20px)',
      'var(--unsafe)',
    ]) {
      const invalid = resolveP15ElementorResponsiveContainerFullWidth(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', contentWidthMode: 'full', mobileWidthPx: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_FULL_WIDTH_VALUE_INVALID');
    }

    const duplicate = resolveP15ElementorResponsiveContainerFullWidth(source, manifest(source, [
      { sourceNodeId: 'root', contentWidthMode: 'full', mobileWidthPx: 700 },
      { sourceNodeId: 'root', contentWidthMode: 'full', tabletWidthPx: 800 },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FULL_WIDTH_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerFullWidth(source, manifest(source, [{
      sourceNodeId: 'copy',
      contentWidthMode: 'full',
      mobileWidthPx: 700,
    }]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FULL_WIDTH_SOURCE_NOT_CONTAINER');

    const unknownField = resolveP15ElementorResponsiveContainerFullWidth(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        contentWidthMode: 'full',
        mobileWidthPx: 700,
        unit: 'px',
      }],
    });
    expect(unknownField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FULL_WIDTH_ENTRY_INVALID');
  });

  it('fails closed for stale source/candidate replay and authority inflation', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{
      sourceNodeId: 'root',
      contentWidthMode: 'full',
      mobileWidthPx: 700,
    }]);

    const staleSource = resolveP15ElementorResponsiveContainerFullWidth(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FULL_WIDTH_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerFullWidth(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FULL_WIDTH_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const inflated = resolveP15ElementorResponsiveContainerFullWidth(source, {
      ...valid,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FULL_WIDTH_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized full-width metadata and rejects authority-inflated results', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerFullWidth(source, manifest(source, [{
      sourceNodeId: 'root',
      contentWidthMode: 'full',
      mobileWidthPx: 700,
    }]));
    const serialized = serializeP15ElementorResponsiveFullWidthSummary(result);

    expect(serialized).not.toContain('PRIVATE FULL WIDTH COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"contentWidthMode": "full"');
    expect(serialized).toContain('"mobileWidthPx": 700');
    expect(serialized).toContain('"mobileSettingKey": "width_mobile"');

    const inflated = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveFullWidthResultV1;
    expect(() => serializeP15ElementorResponsiveFullWidthSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
