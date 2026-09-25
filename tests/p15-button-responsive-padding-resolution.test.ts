import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_EVIDENCE,
  P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_MANIFEST_VERSION,
  resolveP15ElementorButtonResponsivePadding,
  serializeP15ElementorButtonResponsivePaddingSummary,
  type P15ElementorButtonResponsivePaddingManifestV1,
  type P15ElementorButtonResponsivePaddingResultV1,
} from '../src/targets/elementor/button-responsive-padding-resolution';
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
    title: 'Button responsive padding private source',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'root',
      direction: 'column',
      children: [{
        kind: 'button',
        sourceNodeId: 'button',
        text: 'PRIVATE BUTTON COPY',
        url: 'https://example.com/private',
        openInNewTab: true,
        nofollow: true,
        align: 'end',
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
  buttons: P15ElementorButtonResponsivePaddingManifestV1['buttons'],
): P15ElementorButtonResponsivePaddingManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    buttons,
    styleInferencePerformed: false,
    responsiveInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    responsiveClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
}

function settingsOf(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('expected element object');
  }
  const settings = (value as Record<string, unknown>).settings;
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

describe('P15 exact source-bound Button responsive padding resolution', () => {
  it('writes explicit desktop/tablet/mobile Elementor 4.2.4 text_padding DIMENSIONS and preserves Button base settings', () => {
    const source = sourceDocument();
    const desktop = { top: 8, right: 16, bottom: 8, left: 16 };
    const tablet = { top: 6, right: 12, bottom: 6, left: 12 };
    const mobile = { top: 10, right: 10, bottom: 10, left: 10 };
    const result = resolveP15ElementorButtonResponsivePadding(source, manifest(source, [{
      sourceNodeId: 'button',
      desktopPaddingPx: desktop,
      tabletPaddingPx: tablet,
      mobilePaddingPx: mobile,
    }]));

    expect(P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
      buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
      dimensionsControlSourcePath: 'includes/controls/dimensions.php',
      dimensionsControlSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
      controlsStackSourcePath: 'includes/base/controls-stack.php',
      controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
      controlName: 'text_padding',
      responsive: true,
      desktopSettingKey: 'text_padding',
      tabletSettingKey: 'text_padding_tablet',
      mobileSettingKey: 'text_padding_mobile',
      unit: 'px',
      minPx: 0,
      maxPx: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
    });
    expect(result.status).toBe('BUTTON_RESPONSIVE_PADDING_RESOLVED');
    expect(result.issues).toEqual([]);
    expect(result.resolvedButtonCount).toBe(1);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const button = result.template?.content[0]?.elements[0];
    const settings = settingsOf(button);
    expect(settings.text).toBe('PRIVATE BUTTON COPY');
    expect(settings.align).toBe('right');
    expect(settings.link).toEqual({
      url: 'https://example.com/private',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(settings.text_padding).toEqual(expectedDimensions(desktop));
    expect(settings.text_padding_tablet).toEqual(expectedDimensions(tablet));
    expect(settings.text_padding_mobile).toEqual(expectedDimensions(mobile));
    expect((settings.text_padding as Record<string, unknown>).isLinked).toBe(false);
    expect((settings.text_padding_mobile as Record<string, unknown>).isLinked).toBe(true);
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
  });

  it('omits unspecified breakpoint padding instead of synthesizing inheritance', () => {
    const source = sourceDocument();
    const mobile = { top: 2, right: 4, bottom: 6, left: 8 };
    const result = resolveP15ElementorButtonResponsivePadding(source, manifest(source, [{
      sourceNodeId: 'button',
      mobilePaddingPx: mobile,
    }]));

    expect(result.status).toBe('BUTTON_RESPONSIVE_PADDING_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings).not.toHaveProperty('text_padding');
    expect(settings).not.toHaveProperty('text_padding_tablet');
    expect(settings.text_padding_mobile).toEqual(expectedDimensions(mobile));
    expect(result.resolvedPaddings).toEqual([{
      sourceNodeId: 'button',
      desktopPaddingPx: null,
      tabletPaddingPx: null,
      mobilePaddingPx: mobile,
    }]);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
  });

  it('accepts zero and the existing neutral spacing ceiling', () => {
    const source = sourceDocument();
    const max = P15_NEUTRAL_EXPORT_MAX_SPACING_PX;
    const result = resolveP15ElementorButtonResponsivePadding(source, manifest(source, [{
      sourceNodeId: 'button',
      desktopPaddingPx: { top: 0, right: 0, bottom: 0, left: 0 },
      tabletPaddingPx: { top: max, right: max, bottom: max, left: max },
    }]));

    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.text_padding).toEqual(expectedDimensions({ top: 0, right: 0, bottom: 0, left: 0 }));
    expect(settings.text_padding_tablet).toEqual(expectedDimensions({ top: max, right: max, bottom: max, left: max }));
  });

  it('returns a deterministic no-op when no Button padding overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorButtonResponsivePadding(source, manifest(source, []));
    const second = resolveP15ElementorButtonResponsivePadding(source, manifest(source, []));

    expect(first.status).toBe('NO_BUTTON_RESPONSIVE_PADDING_OVERRIDES');
    expect(first.resolvedButtonCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source and stale base-candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{
      sourceNodeId: 'button',
      mobilePaddingPx: { top: 1, right: 2, bottom: 3, left: 4 },
    }]);

    const staleSource = resolveP15ElementorButtonResponsivePadding(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_PADDING_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorButtonResponsivePadding(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_PADDING_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicate, non-Button, empty, malformed, out-of-range and unknown-field entries', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorButtonResponsivePadding(source, manifest(source, [
      { sourceNodeId: 'button', mobilePaddingPx: { top: 1, right: 1, bottom: 1, left: 1 } },
      { sourceNodeId: 'button', tabletPaddingPx: { top: 2, right: 2, bottom: 2, left: 2 } },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_PADDING_DUPLICATE_SOURCE_ID');

    const nonButton = resolveP15ElementorButtonResponsivePadding(source, manifest(source, [{
      sourceNodeId: 'root',
      mobilePaddingPx: { top: 1, right: 1, bottom: 1, left: 1 },
    }]));
    expect(nonButton.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_PADDING_SOURCE_NOT_BUTTON');

    const empty = resolveP15ElementorButtonResponsivePadding(source, manifest(source, [{
      sourceNodeId: 'button',
    }]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_PADDING_OVERRIDE_REQUIRED');

    for (const value of [-1, P15_NEUTRAL_EXPORT_MAX_SPACING_PX + 1, Number.POSITIVE_INFINITY, Number.NaN]) {
      const invalid = resolveP15ElementorButtonResponsivePadding(source, {
        ...manifest(source, []),
        buttons: [{
          sourceNodeId: 'button',
          mobilePaddingPx: { top: value, right: 0, bottom: 0, left: 0 },
        }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_RESPONSIVE_PADDING_VALUE_INVALID');
    }

    const malformed = resolveP15ElementorButtonResponsivePadding(source, {
      ...manifest(source, []),
      buttons: [{
        sourceNodeId: 'button',
        mobilePaddingPx: { top: 1, right: 1, bottom: 1 },
      }],
    });
    expect(malformed.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_PADDING_VALUE_INVALID');

    const unknown = resolveP15ElementorButtonResponsivePadding(source, {
      ...manifest(source, []),
      buttons: [{
        sourceNodeId: 'button',
        mobilePaddingPx: { top: 1, right: 1, bottom: 1, left: 1 },
        unit: 'rem',
      }],
    });
    expect(unknown.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_PADDING_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR instead of producing a partial Button padding candidate', () => {
    const source: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked Button padding source',
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

    const result = resolveP15ElementorButtonResponsivePadding(source, {});
    expect(result.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(result.template).toBeNull();
    expect(result.candidate).toBeNull();
  });

  it('rejects authority inflation and serializes only sanitized padding metadata', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{
      sourceNodeId: 'button',
      mobilePaddingPx: { top: 1, right: 2, bottom: 3, left: 4 },
    }]);

    const inflatedManifest = resolveP15ElementorButtonResponsivePadding(source, {
      ...raw,
      productionAcceptance: true,
    });
    expect(inflatedManifest.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_RESPONSIVE_PADDING_AUTHORITY_FLAGS_INVALID');

    const result = resolveP15ElementorButtonResponsivePadding(source, raw);
    const serialized = serializeP15ElementorButtonResponsivePaddingSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('example.com/private');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"text_padding_mobile"');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorButtonResponsivePaddingResultV1;
    expect(() => serializeP15ElementorButtonResponsivePaddingSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
