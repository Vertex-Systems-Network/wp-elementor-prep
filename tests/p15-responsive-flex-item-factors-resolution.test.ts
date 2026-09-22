import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerFlexItemFactors,
  serializeP15ElementorResponsiveFlexItemFactorsSummary,
  type P15ElementorResponsiveFlexItemFactorsManifestV1,
  type P15ElementorResponsiveFlexItemFactorsResultV1,
} from '../src/targets/elementor/responsive-flex-item-factors-resolution';
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
    title: 'Responsive flex-item factors private source',
    documentType: 'section',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'row',
        alignItems: 'start',
        children: [
          {
            kind: 'container',
            sourceNodeId: 'nested',
            direction: 'column',
            alignItems: 'stretch',
            children: [
              {
                kind: 'text',
                sourceNodeId: 'copy',
                text: 'PRIVATE FLEX FACTOR COPY',
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
  containers: P15ElementorResponsiveFlexItemFactorsManifestV1['containers'],
): P15ElementorResponsiveFlexItemFactorsManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION,
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

describe('P15 exact source-bound responsive container flex-item factors', () => {
  it('writes only exact Elementor 4.2.4 tablet/mobile grow/shrink keys and preserves desktop/unrelated settings', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerFlexItemFactors(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletGrow: 1,
        mobileGrow: 0,
        tabletShrink: 0,
        mobileShrink: 1,
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      flexItemSourcePath: 'includes/controls/groups/flex-item.php',
      flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
      qunitFixturePath: 'tests/qunit/mock/elments/container.json',
      qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
      groupName: '_flex',
      growControlName: 'grow',
      shrinkControlName: 'shrink',
      desktopGrowSettingKey: '_flex_grow',
      tabletGrowSettingKey: '_flex_grow_tablet',
      mobileGrowSettingKey: '_flex_grow_mobile',
      desktopShrinkSettingKey: '_flex_shrink',
      tabletShrinkSettingKey: '_flex_shrink_tablet',
      mobileShrinkSettingKey: '_flex_shrink_mobile',
      acceptedFactors: [0, 1],
    });
    expect(result.status).toBe('RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings).not.toHaveProperty('_flex_grow');
    expect(settings).not.toHaveProperty('_flex_shrink');
    expect(settings).not.toHaveProperty('_flex_order');
    expect(settings).not.toHaveProperty('_flex_order_tablet');
    expect(settings).not.toHaveProperty('_flex_align_self_tablet');
    expect(settings._flex_grow_tablet).toBe(1);
    expect(settings._flex_grow_mobile).toBe(0);
    expect(settings._flex_shrink_tablet).toBe(0);
    expect(settings._flex_shrink_mobile).toBe(1);
    expect(settings.flex_align_items).toBe('flex-start');

    expect(result.resolvedFactors).toEqual([{
      sourceNodeId: 'root',
      tabletGrow: 1,
      mobileGrow: 0,
      tabletShrink: 0,
      mobileShrink: 1,
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

  it('binds nested containers and omits unspecified control/breakpoint values', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerFlexItemFactors(source, manifest(source, [
      { sourceNodeId: 'nested', mobileShrink: 0 },
    ]));

    expect(result.status).toBe('RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    for (const key of [
      '_flex_grow_tablet',
      '_flex_grow_mobile',
      '_flex_shrink_tablet',
      '_flex_shrink_mobile',
    ]) {
      expect(rootSettings).not.toHaveProperty(key);
    }
    expect(nestedSettings).not.toHaveProperty('_flex_grow_tablet');
    expect(nestedSettings).not.toHaveProperty('_flex_grow_mobile');
    expect(nestedSettings).not.toHaveProperty('_flex_shrink_tablet');
    expect(nestedSettings._flex_shrink_mobile).toBe(0);
    expect(result.resolvedFactors).toEqual([{
      sourceNodeId: 'nested',
      tabletGrow: null,
      mobileGrow: null,
      tabletShrink: null,
      mobileShrink: 0,
    }]);
  });

  it('returns a deterministic no-op when no factor overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorResponsiveContainerFlexItemFactors(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerFlexItemFactors(source, manifest(source, []));

    expect(first.status).toBe('NO_RESPONSIVE_FLEX_ITEM_FACTOR_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'root', mobileGrow: 1 }]);

    const staleSource = resolveP15ElementorResponsiveContainerFlexItemFactors(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerFlexItemFactors(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_FACTORS_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicate, non-container, empty, invalid and unknown-field entries', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorResponsiveContainerFlexItemFactors(source, manifest(source, [
      { sourceNodeId: 'root', mobileGrow: 1 },
      { sourceNodeId: 'root', tabletShrink: 0 },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_FACTORS_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerFlexItemFactors(source, manifest(source, [
      { sourceNodeId: 'copy', mobileGrow: 1 },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerFlexItemFactors(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_FACTORS_OVERRIDE_REQUIRED');

    for (const value of [-1, 2, 0.5, Number.NaN, Number.POSITIVE_INFINITY, '1', null, {}]) {
      const invalid = resolveP15ElementorResponsiveContainerFlexItemFactors(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', mobileGrow: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_FLEX_ITEM_FACTORS_VALUE_INVALID');
    }

    const unknownField = resolveP15ElementorResponsiveContainerFlexItemFactors(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobileGrow: 1,
        order: 2,
      }],
    });
    expect(unknownField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_FACTORS_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked flex factor source',
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

    const blocked = resolveP15ElementorResponsiveContainerFlexItemFactors(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileShrink: 1 }]);
    const inflated = resolveP15ElementorResponsiveContainerFlexItemFactors(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_FACTORS_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized factor metadata and refuses authority-inflated results', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileGrow: 1, tabletShrink: 0 }]);
    const result = resolveP15ElementorResponsiveContainerFlexItemFactors(source, raw);
    const serialized = serializeP15ElementorResponsiveFlexItemFactorsSummary(result);

    expect(serialized).not.toContain('PRIVATE FLEX FACTOR COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"_flex_grow_mobile"');
    expect(serialized).toContain('"_flex_shrink_tablet"');
    expect(serialized).toContain('"mobileGrow": 1');
    expect(serialized).toContain('"tabletShrink": 0');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerFlexItemFactors(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE FLEX FACTOR COPY',
    }));
    expect(serializeP15ElementorResponsiveFlexItemFactorsSummary(mutatedIssue))
      .not.toContain('PRIVATE FLEX FACTOR COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveFlexItemFactorsResultV1;
    expect(() => serializeP15ElementorResponsiveFlexItemFactorsSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
