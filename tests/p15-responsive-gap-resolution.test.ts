import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_GAP_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerGaps,
  serializeP15ElementorResponsiveGapSummary,
  type P15ElementorResponsiveGapManifestV1,
  type P15ElementorResponsiveGapResultV1,
} from '../src/targets/elementor/responsive-gap-resolution';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';

function sourceDocument(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Responsive gap private source',
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
            gapPx: 8,
            children: [
              {
                kind: 'text',
                sourceNodeId: 'copy',
                text: 'PRIVATE GAP COPY',
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
  containers: P15ElementorResponsiveGapManifestV1['containers'],
): P15ElementorResponsiveGapManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION,
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

function expectedGap(value: number): Record<string, unknown> {
  return {
    unit: 'px',
    column: String(value),
    row: String(value),
    isLinked: true,
  };
}

describe('P15 exact source-bound responsive container gap resolution', () => {
  it('writes exact Elementor 4.2.4 tablet/mobile gap objects while preserving desktop gap', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerGaps(source, manifest(source, [
      { sourceNodeId: 'root', tabletGapPx: 18, mobileGapPx: 12 },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_GAP_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
      flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
      upgradeTestSourcePath: 'tests/phpunit/elementor/core/upgrade/test-upgrades.php',
      upgradeTestSourceBlobSha: 'ca26af25b0e35d24303a771eb3a85dc1fee21b89',
      groupName: 'flex',
      controlName: 'gap',
      desktopSettingKey: 'flex_gap',
      tabletSettingKey: 'flex_gap_tablet',
      mobileSettingKey: 'flex_gap_mobile',
    });
    expect(result.status).toBe('RESPONSIVE_GAPS_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.flex_gap).toEqual(expectedGap(24));
    expect(settings.flex_gap_tablet).toEqual(expectedGap(18));
    expect(settings.flex_gap_mobile).toEqual(expectedGap(12));
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
  });

  it('binds nested containers and leaves the unlisted root responsive keys absent', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerGaps(source, manifest(source, [
      { sourceNodeId: 'nested', mobileGapPx: 4 },
    ]));

    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings.flex_gap).toEqual(expectedGap(24));
    expect(rootSettings).not.toHaveProperty('flex_gap_tablet');
    expect(rootSettings).not.toHaveProperty('flex_gap_mobile');
    expect(nestedSettings.flex_gap).toEqual(expectedGap(8));
    expect(nestedSettings).not.toHaveProperty('flex_gap_tablet');
    expect(nestedSettings.flex_gap_mobile).toEqual(expectedGap(4));
    expect(result.resolvedGaps).toEqual([
      { sourceNodeId: 'nested', tabletGapPx: null, mobileGapPx: 4 },
    ]);
  });

  it('supports tablet-only/mobile-only overrides, zero gap, and the accepted spacing boundary', () => {
    const source = sourceDocument();
    const tabletOnly = resolveP15ElementorResponsiveContainerGaps(source, manifest(source, [
      { sourceNodeId: 'root', tabletGapPx: 0 },
    ]));
    const tabletSettings = settingsOf(tabletOnly.template?.content[0]);
    expect(tabletSettings.flex_gap_tablet).toEqual(expectedGap(0));
    expect(tabletSettings).not.toHaveProperty('flex_gap_mobile');

    const mobileOnly = resolveP15ElementorResponsiveContainerGaps(source, manifest(source, [
      { sourceNodeId: 'root', mobileGapPx: P15_NEUTRAL_EXPORT_MAX_SPACING_PX },
    ]));
    const mobileSettings = settingsOf(mobileOnly.template?.content[0]);
    expect(mobileSettings).not.toHaveProperty('flex_gap_tablet');
    expect(mobileSettings.flex_gap_mobile).toEqual(expectedGap(P15_NEUTRAL_EXPORT_MAX_SPACING_PX));
  });

  it('returns a deterministic no-op when no gap overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorResponsiveContainerGaps(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerGaps(source, manifest(source, []));

    expect(first.status).toBe('NO_RESPONSIVE_GAP_OVERRIDES');
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/base candidate bindings', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'root', mobileGapPx: 10 }]);

    const staleSource = resolveP15ElementorResponsiveContainerGaps(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.template).toBeNull();
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_GAP_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerGaps(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_GAP_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicate, non-container, empty, out-of-range, non-finite and unknown-field entries', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorResponsiveContainerGaps(source, manifest(source, [
      { sourceNodeId: 'root', mobileGapPx: 5 },
      { sourceNodeId: 'root', tabletGapPx: 6 },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_GAP_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerGaps(source, manifest(source, [
      { sourceNodeId: 'copy', mobileGapPx: 5 },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_GAP_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerGaps(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_GAP_OVERRIDE_REQUIRED');

    for (const value of [-1, P15_NEUTRAL_EXPORT_MAX_SPACING_PX + 1, Number.POSITIVE_INFINITY, Number.NaN]) {
      const invalid = resolveP15ElementorResponsiveContainerGaps(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', mobileGapPx: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_GAP_VALUE_INVALID');
    }

    const unknown = resolveP15ElementorResponsiveContainerGaps(source, {
      ...manifest(source, []),
      containers: [{ sourceNodeId: 'root', mobileGapPx: 5, unit: 'rem' }],
    });
    expect(unknown.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_GAP_ENTRY_INVALID');
  });

  it('blocks review-bearing source before any partial responsive candidate is produced', () => {
    const source: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked source',
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

    const result = resolveP15ElementorResponsiveContainerGaps(source, {});
    expect(result.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(result.baseCandidateIdentityDigest).toBeNull();
    expect(result.template).toBeNull();
    expect(result.candidate).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_GAP_UPSTREAM_GENERATION_NOT_READY' }),
    ]);
  });

  it('rejects authority inflation and serializes no source/template/candidate content', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileGapPx: 10 }]);
    const inflated = resolveP15ElementorResponsiveContainerGaps(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_GAP_AUTHORITY_FLAGS_INVALID');

    const result = resolveP15ElementorResponsiveContainerGaps(source, raw);
    const serialized = serializeP15ElementorResponsiveGapSummary(result);
    expect(serialized).not.toContain('PRIVATE GAP COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"flex_gap_mobile"');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerGaps(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE GAP COPY',
    }));
    expect(serializeP15ElementorResponsiveGapSummary(mutatedIssue))
      .not.toContain('PRIVATE GAP COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveGapResultV1;
    expect(() => serializeP15ElementorResponsiveGapSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
