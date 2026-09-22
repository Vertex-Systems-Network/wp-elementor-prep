import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_CONTAINER_OVERFLOW_EVIDENCE,
  P15_ELEMENTOR_CONTAINER_OVERFLOW_MANIFEST_VERSION,
  resolveP15ElementorContainerOverflow,
  serializeP15ElementorContainerOverflowSummary,
  type P15ElementorContainerOverflowManifestV1,
  type P15ElementorContainerOverflowResultV1,
} from '../src/targets/elementor/container-overflow-resolution';
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
    title: 'Container overflow private source',
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
                text: 'PRIVATE OVERFLOW COPY',
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
  containers: P15ElementorContainerOverflowManifestV1['containers'],
): P15ElementorContainerOverflowManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_CONTAINER_OVERFLOW_MANIFEST_VERSION,
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

describe('P15 exact source-bound Container overflow resolution', () => {
  it('writes only exact Elementor 4.2.4 overflow setting for hidden', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorContainerOverflow(source, manifest(source, [
      { sourceNodeId: 'root', overflow: 'hidden' },
    ]));

    expect(P15_ELEMENTOR_CONTAINER_OVERFLOW_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      frontendContainerStylesSourcePath: 'assets/dev/scss/frontend/_container.scss',
      frontendContainerStylesSourceBlobSha: 'd6c65cb86810634c55c8b9e65aef8e9b9ef439e8',
      controlName: 'overflow',
      settingKey: 'overflow',
      defaultCssVariableValue: 'visible',
      acceptedValues: ['hidden', 'auto'],
    });

    expect(result.status).toBe('CONTAINER_OVERFLOW_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.overflow).toBe('hidden');
    expect(settings).not.toHaveProperty('overflow_tablet');
    expect(settings).not.toHaveProperty('overflow_mobile');
    expect(settings).not.toHaveProperty('z_index');
    expect(settings).not.toHaveProperty('_flex_order');
    expect(settings).not.toHaveProperty('_flex_order_tablet');

    expect(result.resolvedOverflows).toEqual([
      { sourceNodeId: 'root', overflow: 'hidden' },
    ]);
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('supports auto, binds nested containers and leaves root untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorContainerOverflow(source, manifest(source, [
      { sourceNodeId: 'nested', overflow: 'auto' },
    ]));

    expect(result.status).toBe('CONTAINER_OVERFLOW_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    expect(settingsOf(root)).not.toHaveProperty('overflow');
    expect(settingsOf(nested).overflow).toBe('auto');
    expect(result.resolvedOverflows).toEqual([
      { sourceNodeId: 'nested', overflow: 'auto' },
    ]);
  });

  it('returns a deterministic no-op when no overflow overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorContainerOverflow(source, manifest(source, []));
    const second = resolveP15ElementorContainerOverflow(source, manifest(source, []));

    expect(first.status).toBe('NO_CONTAINER_OVERFLOW_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'root', overflow: 'hidden' }]);

    const staleSource = resolveP15ElementorContainerOverflow(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_OVERFLOW_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorContainerOverflow(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_OVERFLOW_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicate, non-container, invalid and unknown-field entries', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorContainerOverflow(source, manifest(source, [
      { sourceNodeId: 'root', overflow: 'hidden' },
      { sourceNodeId: 'root', overflow: 'auto' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_OVERFLOW_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorContainerOverflow(source, manifest(source, [
      { sourceNodeId: 'copy', overflow: 'hidden' },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_OVERFLOW_SOURCE_NOT_CONTAINER');

    for (const value of ['', 'visible', 'scroll', 'clip', 'inherit', 'hidden auto', 1, null, {}]) {
      const invalid = resolveP15ElementorContainerOverflow(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', overflow: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_CONTAINER_OVERFLOW_VALUE_INVALID');
    }

    const unknownField = resolveP15ElementorContainerOverflow(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        overflow: 'hidden',
        responsive: true,
      }],
    });
    expect(unknownField.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_OVERFLOW_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked Container overflow source',
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

    const blocked = resolveP15ElementorContainerOverflow(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_CONTAINER_OVERFLOW_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', overflow: 'auto' }]);
    const inflated = resolveP15ElementorContainerOverflow(source, {
      ...raw,
      responsiveClosureClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_OVERFLOW_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized overflow metadata and refuses authority-inflated results', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', overflow: 'hidden' }]);
    const result = resolveP15ElementorContainerOverflow(source, raw);
    const serialized = serializeP15ElementorContainerOverflowSummary(result);

    expect(serialized).not.toContain('PRIVATE OVERFLOW COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"settingKey": "overflow"');
    expect(serialized).toContain('"overflow": "hidden"');

    const mutatedIssue = {
      ...resolveP15ElementorContainerOverflow(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE OVERFLOW COPY',
    }));
    expect(serializeP15ElementorContainerOverflowSummary(mutatedIssue))
      .not.toContain('PRIVATE OVERFLOW COPY');

    const inflatedResult = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorContainerOverflowResultV1;
    expect(() => serializeP15ElementorContainerOverflowSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
