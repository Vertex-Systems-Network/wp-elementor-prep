import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE,
  P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION,
  resolveP15ElementorButtonStretchContentAlignments,
  serializeP15ElementorButtonStretchContentAlignmentSummary,
  type P15ElementorButtonStretchContentAlignmentManifestV1,
  type P15ElementorButtonStretchContentAlignmentResultV1,
} from '../src/targets/elementor/button-stretch-content-alignment-resolution';
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
    title: 'Button stretch private source',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'root',
      direction: 'column',
      children: [
        { kind: 'button', sourceNodeId: 'button', text: 'PRIVATE BUTTON COPY' },
        { kind: 'heading', sourceNodeId: 'heading', text: 'PRIVATE HEADING COPY', level: 'h2' },
        {
          kind: 'container',
          sourceNodeId: 'nested',
          direction: 'row',
          children: [{
            kind: 'button',
            sourceNodeId: 'linked-button',
            text: 'PRIVATE LINKED BUTTON',
            url: 'https://example.com/private',
            openInNewTab: true,
            nofollow: true,
          }],
        },
      ],
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
  buttons: P15ElementorButtonStretchContentAlignmentManifestV1['buttons'],
): P15ElementorButtonStretchContentAlignmentManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION,
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

describe('P15 Fast Batch Button stretch content alignment', () => {
  it('writes explicit stretch only without inventing content alignment', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonStretchContentAlignments(source, manifest(source, [{
      sourceNodeId: 'button',
      stretch: true,
    }]));

    expect(P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
      buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
      controlsStackSourcePath: 'includes/base/controls-stack.php',
      controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
      positionControlName: 'align',
      stretchSettingKey: 'align',
      stretchValue: 'justify',
      contentAlignmentControlName: 'content_align',
      desktopContentAlignmentSettingKey: 'content_align',
      tabletContentAlignmentSettingKey: 'content_align_tablet',
      mobileContentAlignmentSettingKey: 'content_align_mobile',
      acceptedContentAlignments: ['start', 'center', 'end', 'space-between'],
    });
    expect(result.status).toBe('BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.align).toBe('justify');
    expect(settings).not.toHaveProperty('content_align');
    expect(settings).not.toHaveProperty('content_align_tablet');
    expect(settings).not.toHaveProperty('content_align_mobile');
  });

  it('writes all three content alignment breakpoints and preserves exact link binding', () => {
    const source = sourceDocument();
    const batch = manifest(source, [{
      sourceNodeId: 'linked-button',
      stretch: true,
      desktopContentAlign: 'start',
      tabletContentAlign: 'center',
      mobileContentAlign: 'space-between',
    }]);

    const first = resolveP15ElementorButtonStretchContentAlignments(source, batch);
    const second = resolveP15ElementorButtonStretchContentAlignments(source, batch);
    expect(first).toEqual(second);

    const settings = settingsOf(first.template?.content[0]?.elements[2]?.elements[0]);
    expect(settings.align).toBe('justify');
    expect(settings.content_align).toBe('start');
    expect(settings.content_align_tablet).toBe('center');
    expect(settings.content_align_mobile).toBe('space-between');
    expect(settings.link).toEqual({
      url: 'https://example.com/private',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
  });

  it('keeps omitted responsive content-alignment breakpoints omitted', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonStretchContentAlignments(source, manifest(source, [{
      sourceNodeId: 'button',
      stretch: true,
      mobileContentAlign: 'end',
    }]));

    expect(result.status).toBe('BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.align).toBe('justify');
    expect(settings).not.toHaveProperty('content_align');
    expect(settings).not.toHaveProperty('content_align_tablet');
    expect(settings.content_align_mobile).toBe('end');
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
  });

  it('rejects stretch when source Button already declares explicit alignment', () => {
    const source = sourceDocument();
    const root = source.nodes[0];
    if (!root || root.kind !== 'container') throw new Error('fixture invariant');
    const button = root.children[0];
    if (!button || button.kind !== 'button') throw new Error('fixture invariant');
    button.align = 'center';

    const result = resolveP15ElementorButtonStretchContentAlignments(source, manifest(source, [{
      sourceNodeId: 'button',
      stretch: true,
      desktopContentAlign: 'center',
    }]));

    expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(result.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_ALIGNMENT_CONFLICT');
  });

  it('accepts only exact content alignment vocabulary and explicit stretch=true', () => {
    const source = sourceDocument();

    for (const value of ['start', 'center', 'end', 'space-between'] as const) {
      const result = resolveP15ElementorButtonStretchContentAlignments(source, manifest(source, [{
        sourceNodeId: 'button',
        stretch: true,
        desktopContentAlign: value,
      }]));
      expect(result.status).toBe('BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED');
      expect(settingsOf(result.template?.content[0]?.elements[0]).content_align).toBe(value);
    }

    for (const value of ['', 'left', 'right', 'justify', 'space-around', 1, null]) {
      const result = resolveP15ElementorButtonStretchContentAlignments(source, {
        ...manifest(source, []),
        buttons: [{
          sourceNodeId: 'button',
          stretch: true,
          desktopContentAlign: value,
        }],
      });
      expect(result.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_VALUE_INVALID');
    }

    expect(resolveP15ElementorButtonStretchContentAlignments(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button', stretch: false }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_STRETCH_REQUIRED');
  });

  it('rejects stale replay, non-Button ids, duplicates and unknown fields', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'button', stretch: true }]);

    expect(resolveP15ElementorButtonStretchContentAlignments(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH');

    expect(resolveP15ElementorButtonStretchContentAlignments(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH');

    expect(resolveP15ElementorButtonStretchContentAlignments(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'heading', stretch: true }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_NOT_BUTTON');

    expect(resolveP15ElementorButtonStretchContentAlignments(source, manifest(source, [
      { sourceNodeId: 'button', stretch: true },
      { sourceNodeId: 'button', stretch: true, mobileContentAlign: 'center' },
    ])).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_DUPLICATE_SOURCE_ID');

    expect(resolveP15ElementorButtonStretchContentAlignments(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button', stretch: true, customClass: 'x' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_ENTRY_INVALID');
  });

  it('supports empty manifests, rejects authority inflation and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const empty = resolveP15ElementorButtonStretchContentAlignments(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_STRETCH_CONTENT_ALIGNMENT_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);

    const raw = manifest(source, [{
      sourceNodeId: 'button',
      stretch: true,
      desktopContentAlign: 'center',
      mobileContentAlign: 'end',
    }]);

    for (const inflation of [
      { styleInferencePerformed: true },
      { responsiveInferencePerformed: true },
      { figmaMutation: true },
      { networkAccess: true },
      { responsiveClosureClaim: true },
      { targetCompatibilityClaim: true },
      { productionAcceptance: true },
      { downloadEnabled: true },
    ]) {
      expect(resolveP15ElementorButtonStretchContentAlignments(source, { ...raw, ...inflation })
        .issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_AUTHORITY_FLAGS_INVALID');
    }

    const result = resolveP15ElementorButtonStretchContentAlignments(source, raw);
    const serialized = serializeP15ElementorButtonStretchContentAlignmentSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/private');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"stretchSettingKey": "align"');
    expect(serialized).toContain('"desktopContentAlignmentSettingKey": "content_align"');
    expect(serialized).toContain('"mobileContentAlignmentSettingKey": "content_align_mobile"');

    const inflated = {
      ...result,
      downloadEnabled: true,
    } as unknown as P15ElementorButtonStretchContentAlignmentResultV1;
    expect(() => serializeP15ElementorButtonStretchContentAlignmentSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
