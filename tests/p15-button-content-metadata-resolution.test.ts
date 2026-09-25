import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_CONTENT_METADATA_EVIDENCE,
  P15_ELEMENTOR_BUTTON_CONTENT_METADATA_MANIFEST_VERSION,
  resolveP15ElementorButtonContentMetadata,
  serializeP15ElementorButtonContentMetadataSummary,
  type P15ElementorButtonContentMetadataManifestV1,
  type P15ElementorButtonContentMetadataResultV1,
} from '../src/targets/elementor/button-content-metadata-resolution';
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
    title: 'Button metadata private source',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'root',
      direction: 'column',
      children: [
        { kind: 'button', sourceNodeId: 'button', text: 'PRIVATE BUTTON COPY', align: 'start' },
        { kind: 'heading', sourceNodeId: 'heading', text: 'PRIVATE HEADING COPY', level: 'h2' },
        {
          kind: 'container',
          sourceNodeId: 'nested',
          direction: 'row',
          children: [{
            kind: 'button',
            sourceNodeId: 'linked-button',
            text: 'PRIVATE LINKED BUTTON',
            align: 'end',
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
  buttons: P15ElementorButtonContentMetadataManifestV1['buttons'],
): P15ElementorButtonContentMetadataManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_CONTENT_METADATA_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    buttons,
    styleInferencePerformed: false,
    responsiveInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
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

describe('P15 Fast Batch Button content metadata basics', () => {
  it('writes exact Elementor Button type only and preserves base text/alignment', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonContentMetadata(source, manifest(source, [{
      sourceNodeId: 'button',
      buttonType: 'success',
    }]));

    expect(P15_ELEMENTOR_BUTTON_CONTENT_METADATA_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
      buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
      buttonTypeControlName: 'button_type',
      buttonTypeSettingKey: 'button_type',
      acceptedButtonTypes: ['info', 'success', 'warning', 'danger'],
      sizeControlName: 'size',
      sizeSettingKey: 'size',
      acceptedSizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      cssIdControlName: 'button_css_id',
      cssIdSettingKey: 'button_css_id',
      cssIdPattern: '^[A-Za-z0-9_]{1,128}$',
      cssIdMaxLength: 128,
    });
    expect(result.status).toBe('BUTTON_CONTENT_METADATA_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.text).toBe('PRIVATE BUTTON COPY');
    expect(settings.align).toBe('left');
    expect(settings.button_type).toBe('success');
    expect(settings).not.toHaveProperty('size');
    expect(settings).not.toHaveProperty('button_css_id');
  });

  it('writes exact size only without inventing type or id', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonContentMetadata(source, manifest(source, [{
      sourceNodeId: 'button',
      buttonSize: 'xl',
    }]));

    expect(result.status).toBe('BUTTON_CONTENT_METADATA_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.size).toBe('xl');
    expect(settings).not.toHaveProperty('button_type');
    expect(settings).not.toHaveProperty('button_css_id');
  });

  it('writes a bounded safe Button CSS id only', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonContentMetadata(source, manifest(source, [{
      sourceNodeId: 'button',
      buttonCssId: 'cta_primary_01',
    }]));

    expect(result.status).toBe('BUTTON_CONTENT_METADATA_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.button_css_id).toBe('cta_primary_01');
    expect(settings).not.toHaveProperty('button_type');
    expect(settings).not.toHaveProperty('size');
  });

  it('applies all three capabilities deterministically and preserves exact link binding', () => {
    const source = sourceDocument();
    const batch = manifest(source, [{
      sourceNodeId: 'linked-button',
      buttonType: 'warning',
      buttonSize: 'lg',
      buttonCssId: 'linked_cta_2',
    }]);

    const first = resolveP15ElementorButtonContentMetadata(source, batch);
    const second = resolveP15ElementorButtonContentMetadata(source, batch);
    expect(first).toEqual(second);

    const settings = settingsOf(first.template?.content[0]?.elements[2]?.elements[0]);
    expect(settings.link).toEqual({
      url: 'https://example.com/private',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(settings.align).toBe('right');
    expect(settings.button_type).toBe('warning');
    expect(settings.size).toBe('lg');
    expect(settings.button_css_id).toBe('linked_cta_2');
  });

  it('rejects stale replay, non-Button ids, duplicates, empty entries and unknown fields', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'button', buttonType: 'info' }]);

    expect(resolveP15ElementorButtonContentMetadata(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_CONTENT_METADATA_SOURCE_FINGERPRINT_MISMATCH');

    expect(resolveP15ElementorButtonContentMetadata(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_CONTENT_METADATA_BASE_CANDIDATE_IDENTITY_MISMATCH');

    expect(resolveP15ElementorButtonContentMetadata(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'heading', buttonType: 'info' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_CONTENT_METADATA_SOURCE_NOT_BUTTON');

    expect(resolveP15ElementorButtonContentMetadata(source, manifest(source, [
      { sourceNodeId: 'button', buttonType: 'info' },
      { sourceNodeId: 'button', buttonSize: 'md' },
    ])).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_CONTENT_METADATA_DUPLICATE_SOURCE_ID');

    expect(resolveP15ElementorButtonContentMetadata(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_CONTENT_METADATA_OVERRIDE_REQUIRED');

    expect(resolveP15ElementorButtonContentMetadata(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button', buttonType: 'info', className: 'x' }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_CONTENT_METADATA_ENTRY_INVALID');
  });

  it('rejects values outside exact Button type and size vocabularies', () => {
    const source = sourceDocument();

    for (const buttonType of ['', 'default', 'primary', 'INFO', 1]) {
      expect(resolveP15ElementorButtonContentMetadata(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', buttonType }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_CONTENT_METADATA_BUTTON_TYPE_INVALID');
    }

    for (const buttonSize of ['', 'xxl', 'medium', 'LG', 1]) {
      expect(resolveP15ElementorButtonContentMetadata(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', buttonSize }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_CONTENT_METADATA_BUTTON_SIZE_INVALID');
    }
  });

  it('rejects unsafe or overlong Button CSS ids', () => {
    const source = sourceDocument();
    for (const buttonCssId of [
      '',
      'has space',
      'has-dash',
      '#cta',
      'cta.primary',
      '<script>',
      'a'.repeat(129),
      123,
    ]) {
      expect(resolveP15ElementorButtonContentMetadata(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', buttonCssId }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_CONTENT_METADATA_CSS_ID_INVALID');
    }
  });

  it('supports empty manifests, rejects authority inflation and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const empty = resolveP15ElementorButtonContentMetadata(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_CONTENT_METADATA_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);

    const raw = manifest(source, [{
      sourceNodeId: 'button',
      buttonType: 'danger',
      buttonSize: 'xs',
      buttonCssId: 'safe_id',
    }]);

    for (const inflation of [
      { styleInferencePerformed: true },
      { responsiveInferencePerformed: true },
      { figmaMutation: true },
      { networkAccess: true },
      { targetCompatibilityClaim: true },
      { productionAcceptance: true },
      { downloadEnabled: true },
    ]) {
      expect(resolveP15ElementorButtonContentMetadata(source, { ...raw, ...inflation })
        .issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_CONTENT_METADATA_AUTHORITY_FLAGS_INVALID');
    }

    const result = resolveP15ElementorButtonContentMetadata(source, raw);
    const serialized = serializeP15ElementorButtonContentMetadataSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/private');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"buttonTypeSettingKey": "button_type"');
    expect(serialized).toContain('"sizeSettingKey": "size"');
    expect(serialized).toContain('"cssIdSettingKey": "button_css_id"');

    const inflated = {
      ...result,
      productionAcceptance: true,
    } as unknown as P15ElementorButtonContentMetadataResultV1;
    expect(() => serializeP15ElementorButtonContentMetadataSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
