import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerOrderPreset,
  serializeP15ElementorResponsiveFlexItemOrderPresetSummary,
  type P15ElementorResponsiveFlexItemOrderPresetManifestV1,
  type P15ElementorResponsiveFlexItemOrderPresetResultV1,
} from '../src/targets/elementor/responsive-flex-item-order-preset-resolution';
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
    title: 'Responsive flex-item order preset private source',
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
                text: 'PRIVATE ORDER PRESET COPY',
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
  containers: P15ElementorResponsiveFlexItemOrderPresetManifestV1['containers'],
): P15ElementorResponsiveFlexItemOrderPresetManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION,
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

describe('P15 exact source-bound responsive container flex-item order presets', () => {
  it('maps explicit start/end presets to exact Elementor 4.2.4 numeric sentinels and preserves desktop/unrelated settings', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerOrderPreset(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletOrderPreset: 'start',
        mobileOrderPreset: 'end',
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      flexItemSourcePath: 'includes/controls/groups/flex-item.php',
      flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
      qunitFixturePath: 'tests/qunit/mock/elments/container.json',
      qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
      groupName: '_flex',
      controlName: 'order',
      desktopSettingKey: '_flex_order',
      tabletSettingKey: '_flex_order_tablet',
      mobileSettingKey: '_flex_order_mobile',
      startTargetValue: -99999,
      endTargetValue: 99999,
    });
    expect(result.status).toBe('RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings).not.toHaveProperty('_flex_order');
    expect(settings._flex_order_tablet).toBe(-99999);
    expect(settings._flex_order_mobile).toBe(99999);
    expect(settings).not.toHaveProperty('_flex_grow_tablet');
    expect(settings).not.toHaveProperty('_flex_shrink_mobile');
    expect(settings).not.toHaveProperty('_flex_align_self_tablet');

    expect(result.resolvedOrders).toEqual([{
      sourceNodeId: 'root',
      tabletOrderPreset: 'start',
      mobileOrderPreset: 'end',
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

  it('binds nested containers and omits unspecified breakpoints', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerOrderPreset(source, manifest(source, [
      { sourceNodeId: 'nested', mobileOrderPreset: 'start' },
    ]));

    expect(result.status).toBe('RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings).not.toHaveProperty('_flex_order');
    expect(rootSettings).not.toHaveProperty('_flex_order_tablet');
    expect(rootSettings).not.toHaveProperty('_flex_order_mobile');
    expect(nestedSettings).not.toHaveProperty('_flex_order');
    expect(nestedSettings).not.toHaveProperty('_flex_order_tablet');
    expect(nestedSettings._flex_order_mobile).toBe(-99999);
    expect(result.resolvedOrders).toEqual([{
      sourceNodeId: 'nested',
      tabletOrderPreset: null,
      mobileOrderPreset: 'start',
    }]);
  });

  it('returns a deterministic no-op when no order overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorResponsiveContainerOrderPreset(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerOrderPreset(source, manifest(source, []));

    expect(first.status).toBe('NO_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay and invalid entries', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'root', mobileOrderPreset: 'end' }]);

    const staleSource = resolveP15ElementorResponsiveContainerOrderPreset(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerOrderPreset(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const duplicate = resolveP15ElementorResponsiveContainerOrderPreset(source, manifest(source, [
      { sourceNodeId: 'root', mobileOrderPreset: 'start' },
      { sourceNodeId: 'root', tabletOrderPreset: 'end' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerOrderPreset(source, manifest(source, [
      { sourceNodeId: 'copy', mobileOrderPreset: 'start' },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerOrderPreset(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDE_REQUIRED');

    for (const value of ['custom', 'auto', -99999, 99999, 0, 1, null, {}]) {
      const invalid = resolveP15ElementorResponsiveContainerOrderPreset(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', mobileOrderPreset: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_VALUE_INVALID');
    }

    const unknownEntryField = resolveP15ElementorResponsiveContainerOrderPreset(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobileOrderPreset: 'start',
        customOrder: 5,
      }],
    });
    expect(unknownEntryField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked flex-item order preset source',
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

    const blocked = resolveP15ElementorResponsiveContainerOrderPreset(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileOrderPreset: 'end' }]);
    const inflated = resolveP15ElementorResponsiveContainerOrderPreset(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized order metadata and refuses authority-inflated results', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileOrderPreset: 'end' }]);
    const result = resolveP15ElementorResponsiveContainerOrderPreset(source, raw);
    const serialized = serializeP15ElementorResponsiveFlexItemOrderPresetSummary(result);

    expect(serialized).not.toContain('PRIVATE ORDER PRESET COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"_flex_order_mobile"');
    expect(serialized).toContain('"mobileOrderPreset": "end"');
    expect(serialized).toContain('"endTargetValue": 99999');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerOrderPreset(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE ORDER PRESET COPY',
    }));
    expect(serializeP15ElementorResponsiveFlexItemOrderPresetSummary(mutatedIssue))
      .not.toContain('PRIVATE ORDER PRESET COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveFlexItemOrderPresetResultV1;
    expect(() => serializeP15ElementorResponsiveFlexItemOrderPresetSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
