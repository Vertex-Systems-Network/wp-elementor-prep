import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerAlignSelf,
  serializeP15ElementorResponsiveFlexItemAlignSelfSummary,
  type P15ElementorResponsiveFlexItemAlignSelfManifestV1,
  type P15ElementorResponsiveFlexItemAlignSelfResultV1,
} from '../src/targets/elementor/responsive-flex-item-align-self-resolution';
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
    title: 'Responsive flex-item align-self private source',
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
                text: 'PRIVATE ALIGN SELF COPY',
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
  containers: P15ElementorResponsiveFlexItemAlignSelfManifestV1['containers'],
): P15ElementorResponsiveFlexItemAlignSelfManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION,
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

describe('P15 exact source-bound responsive container flex-item align-self resolution', () => {
  it('writes exact Elementor 4.2.4 tablet/mobile flex-item align-self controls while leaving desktop and parent alignment untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerAlignSelf(source, manifest(source, [
      {
        sourceNodeId: 'root',
        tabletAlignSelf: 'start',
        mobileAlignSelf: 'stretch',
      },
    ]));

    expect(P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      flexItemSourcePath: 'includes/controls/groups/flex-item.php',
      flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
      qunitFixturePath: 'tests/qunit/mock/elments/container.json',
      qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
      groupName: '_flex',
      controlName: 'align_self',
      desktopSettingKey: '_flex_align_self',
      tabletSettingKey: '_flex_align_self_tablet',
      mobileSettingKey: '_flex_align_self_mobile',
      targetValues: ['flex-start', 'center', 'flex-end', 'stretch'],
    });
    expect(result.status).toBe('RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings).not.toHaveProperty('_flex_align_self');
    expect(settings).not.toHaveProperty('flex_align_items_tablet');
    expect(settings).not.toHaveProperty('flex_align_items_mobile');
    expect(settings._flex_align_self_tablet).toEqual('flex-start');
    expect(settings._flex_align_self_mobile).toEqual('stretch');
    expect(result.resolvedAlignments).toEqual([{
      sourceNodeId: 'root',
      tabletAlignSelf: 'start',
      mobileAlignSelf: 'stretch',
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

  it('binds nested containers, maps end, and omits unspecified breakpoints', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerAlignSelf(source, manifest(source, [
      { sourceNodeId: 'nested', mobileAlignSelf: 'end' },
    ]));

    expect(result.status).toBe('RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    const rootSettings = settingsOf(root);
    const nestedSettings = settingsOf(nested);

    expect(rootSettings).not.toHaveProperty('_flex_align_self');
    expect(rootSettings).not.toHaveProperty('_flex_align_self_tablet');
    expect(rootSettings).not.toHaveProperty('_flex_align_self_mobile');
    expect(nestedSettings).not.toHaveProperty('_flex_align_self');
    expect(nestedSettings).not.toHaveProperty('_flex_align_self_tablet');
    expect(nestedSettings._flex_align_self_mobile).toEqual('flex-end');
    expect(result.resolvedAlignments).toEqual([{
      sourceNodeId: 'nested',
      tabletAlignSelf: null,
      mobileAlignSelf: 'end',
    }]);
  });

  it('maps center/end deterministically and returns a deterministic no-op for no overrides', () => {
    const source = sourceDocument();
    const mapped = resolveP15ElementorResponsiveContainerAlignSelf(source, manifest(source, [
      { sourceNodeId: 'root', tabletAlignSelf: 'center', mobileAlignSelf: 'end' },
    ]));
    expect(settingsOf(mapped.template?.content[0])._flex_align_self_tablet).toEqual('center');
    expect(settingsOf(mapped.template?.content[0])._flex_align_self_mobile).toEqual('flex-end');

    const first = resolveP15ElementorResponsiveContainerAlignSelf(source, manifest(source, []));
    const second = resolveP15ElementorResponsiveContainerAlignSelf(source, manifest(source, []));
    expect(first.status).toBe('NO_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay and invalid entries', () => {
    const source = sourceDocument();
    const valid = manifest(source, [
      { sourceNodeId: 'root', mobileAlignSelf: 'center' },
    ]);

    const staleSource = resolveP15ElementorResponsiveContainerAlignSelf(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorResponsiveContainerAlignSelf(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_BASE_CANDIDATE_IDENTITY_MISMATCH');

    const duplicate = resolveP15ElementorResponsiveContainerAlignSelf(source, manifest(source, [
      { sourceNodeId: 'root', mobileAlignSelf: 'start' },
      { sourceNodeId: 'root', tabletAlignSelf: 'end' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorResponsiveContainerAlignSelf(source, manifest(source, [
      { sourceNodeId: 'copy', mobileAlignSelf: 'start' },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_NOT_CONTAINER');

    const empty = resolveP15ElementorResponsiveContainerAlignSelf(source, manifest(source, [
      { sourceNodeId: 'root' },
    ]));
    expect(empty.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDE_REQUIRED');

    for (const value of [
      'baseline',
      'auto',
      'flex-start',
      'flex-end',
      1,
      null,
      {},
    ]) {
      const invalid = resolveP15ElementorResponsiveContainerAlignSelf(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', mobileAlignSelf: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_VALUE_INVALID');
    }

    const unknownEntryField = resolveP15ElementorResponsiveContainerAlignSelf(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        mobileAlignSelf: 'center',
        unit: 'px',
      }],
    });
    expect(unknownEntryField.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked flex-item align-self source',
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
    const blocked = resolveP15ElementorResponsiveContainerAlignSelf(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileAlignSelf: 'center' }]);
    const inflated = resolveP15ElementorResponsiveContainerAlignSelf(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized flex-item align-self metadata and refuses authority-inflated results', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', mobileAlignSelf: 'center' }]);
    const result = resolveP15ElementorResponsiveContainerAlignSelf(source, raw);
    const serialized = serializeP15ElementorResponsiveFlexItemAlignSelfSummary(result);

    expect(serialized).not.toContain('PRIVATE ALIGN SELF COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"_flex_align_self_mobile"');
    expect(serialized).toContain('"mobileAlignSelf": "center"');

    const mutatedIssue = {
      ...resolveP15ElementorResponsiveContainerAlignSelf(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE ALIGN SELF COPY',
    }));
    expect(serializeP15ElementorResponsiveFlexItemAlignSelfSummary(mutatedIssue))
      .not.toContain('PRIVATE ALIGN SELF COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorResponsiveFlexItemAlignSelfResultV1;
    expect(() => serializeP15ElementorResponsiveFlexItemAlignSelfSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
