import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE,
  P15_ELEMENTOR_BUTTON_ICON_BASICS_MANIFEST_VERSION,
  resolveP15ElementorButtonIconBasics,
  serializeP15ElementorButtonIconBasicsSummary,
  type P15ElementorButtonIconBasicsManifestV1,
  type P15ElementorButtonIconBasicsResultV1,
} from '../src/targets/elementor/button-icon-basics-resolution';
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
    title: 'Button icon private source',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'root',
      direction: 'column',
      children: [
        { kind: 'button', sourceNodeId: 'button', text: 'PRIVATE BUTTON COPY', align: 'center' },
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
  buttons: P15ElementorButtonIconBasicsManifestV1['buttons'],
): P15ElementorButtonIconBasicsManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_ICON_BASICS_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    buttons,
    styleInferencePerformed: false,
    responsiveInferencePerformed: false,
    iconInferencePerformed: false,
    svgImportPerformed: false,
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

describe('P15 Fast Batch Button icon basics', () => {
  it('writes one exact Font Awesome selected_icon payload only', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonIconBasics(source, manifest(source, [{
      sourceNodeId: 'button',
      selectedIcon: { value: 'far fa-bell', library: 'fa-regular' },
    }]));

    expect(P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
      buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
      iconsControlSourcePath: 'includes/controls/icons.php',
      iconsControlSourceBlobSha: 'd7d9445cb94c852bbb4731e076667fd97dec0554',
      buttonIconFixturePath: 'tests/playwright/sanity/templates/button-icon-styling.json',
      buttonIconFixtureBlobSha: 'ba4b5b444ab41fa69f982dc74af655aa03417783',
      selectedIconControlName: 'selected_icon',
      selectedIconSettingKey: 'selected_icon',
      iconAlignControlName: 'icon_align',
      iconAlignSettingKey: 'icon_align',
      iconIndentControlName: 'icon_indent',
      iconIndentSettingKey: 'icon_indent',
      acceptedIconLibraries: ['fa-solid', 'fa-regular', 'fa-brands'],
      acceptedIconAlignments: ['row', 'row-reverse'],
      iconIndentUnit: 'px',
      iconIndentMinPx: 0,
      iconIndentMaxPx: 50,
      svgImportAllowed: false,
    });
    expect(result.status).toBe('BUTTON_ICON_BASICS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.selected_icon).toEqual({ value: 'far fa-bell', library: 'fa-regular' });
    expect(settings.align).toBe('center');
    expect(settings).not.toHaveProperty('icon_align');
    expect(settings).not.toHaveProperty('icon_indent');
  });

  it('writes icon position and exact px slider spacing with the selected icon', () => {
    const source = sourceDocument();
    const batch = manifest(source, [{
      sourceNodeId: 'linked-button',
      selectedIcon: { value: 'fas fa-arrow-right', library: 'fa-solid' },
      iconAlign: 'row-reverse',
      iconIndentPx: 17,
    }]);

    const first = resolveP15ElementorButtonIconBasics(source, batch);
    const second = resolveP15ElementorButtonIconBasics(source, batch);
    expect(first).toEqual(second);

    const settings = settingsOf(first.template?.content[0]?.elements[2]?.elements[0]);
    expect(settings.selected_icon).toEqual({
      value: 'fas fa-arrow-right',
      library: 'fa-solid',
    });
    expect(settings.icon_align).toBe('row-reverse');
    expect(settings.icon_indent).toEqual({ unit: 'px', size: 17, sizes: [] });
    expect(settings.align).toBe('right');
    expect(settings.link).toEqual({
      url: 'https://example.com/private',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
  });

  it('accepts exact Font Awesome family-prefix pairs and both icon positions', () => {
    const source = sourceDocument();
    const icons = [
      { value: 'fas fa-check', library: 'fa-solid' },
      { value: 'far fa-bell', library: 'fa-regular' },
      { value: 'fab fa-github', library: 'fa-brands' },
    ] as const;
    for (const selectedIcon of icons) {
      const result = resolveP15ElementorButtonIconBasics(source, manifest(source, [{
        sourceNodeId: 'button',
        selectedIcon,
      }]));
      expect(result.status).toBe('BUTTON_ICON_BASICS_RESOLVED');
    }

    for (const iconAlign of ['row', 'row-reverse'] as const) {
      const result = resolveP15ElementorButtonIconBasics(source, manifest(source, [{
        sourceNodeId: 'button',
        selectedIcon: { value: 'fas fa-check', library: 'fa-solid' },
        iconAlign,
      }]));
      expect(settingsOf(result.template?.content[0]?.elements[0]).icon_align).toBe(iconAlign);
    }
  });

  it('rejects SVG/URL/custom-library payloads, mismatched prefixes and class injection', () => {
    const source = sourceDocument();
    const invalidIcons = [
      { value: { url: 'https://example.com/icon.svg' }, library: 'svg' },
      { value: 'far fa-bell', library: 'fa-solid' },
      { value: 'fas fa-check extra-class', library: 'fa-solid' },
      { value: 'fas <script>', library: 'fa-solid' },
      { value: 'eicon-check', library: 'eicons' },
      { value: '', library: 'fa-solid' },
    ];

    for (const selectedIcon of invalidIcons) {
      const result = resolveP15ElementorButtonIconBasics(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', selectedIcon }],
      });
      expect(result.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_ICON_BASICS_ICON_INVALID');
    }
  });

  it('rejects invalid alignment and spacing outside bounded px contract', () => {
    const source = sourceDocument();

    for (const iconAlign of ['', 'left', 'right', 'start', 'end', 1]) {
      const result = resolveP15ElementorButtonIconBasics(source, {
        ...manifest(source, []),
        buttons: [{
          sourceNodeId: 'button',
          selectedIcon: { value: 'fas fa-check', library: 'fa-solid' },
          iconAlign,
        }],
      });
      expect(result.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_ICON_BASICS_ICON_ALIGNMENT_INVALID');
    }

    for (const iconIndentPx of [-1, 50.1, Number.POSITIVE_INFINITY, '17']) {
      const result = resolveP15ElementorButtonIconBasics(source, {
        ...manifest(source, []),
        buttons: [{
          sourceNodeId: 'button',
          selectedIcon: { value: 'fas fa-check', library: 'fa-solid' },
          iconIndentPx,
        }],
      });
      expect(result.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_ICON_BASICS_ICON_INDENT_INVALID');
    }
  });

  it('rejects stale replay, duplicates, non-Button ids and unknown fields', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{
      sourceNodeId: 'button',
      selectedIcon: { value: 'fas fa-check', library: 'fa-solid' },
    }]);

    expect(resolveP15ElementorButtonIconBasics(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_ICON_BASICS_SOURCE_FINGERPRINT_MISMATCH');

    expect(resolveP15ElementorButtonIconBasics(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_ICON_BASICS_BASE_CANDIDATE_IDENTITY_MISMATCH');

    expect(resolveP15ElementorButtonIconBasics(source, {
      ...manifest(source, []),
      buttons: [{
        sourceNodeId: 'heading',
        selectedIcon: { value: 'fas fa-check', library: 'fa-solid' },
      }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_ICON_BASICS_SOURCE_NOT_BUTTON');

    expect(resolveP15ElementorButtonIconBasics(source, manifest(source, [
      {
        sourceNodeId: 'button',
        selectedIcon: { value: 'fas fa-check', library: 'fa-solid' },
      },
      {
        sourceNodeId: 'button',
        selectedIcon: { value: 'fas fa-star', library: 'fa-solid' },
      },
    ])).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_ICON_BASICS_DUPLICATE_SOURCE_ID');

    expect(resolveP15ElementorButtonIconBasics(source, {
      ...manifest(source, []),
      buttons: [{
        sourceNodeId: 'button',
        selectedIcon: { value: 'fas fa-check', library: 'fa-solid' },
        svgUrl: 'https://example.com/x.svg',
      }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_ICON_BASICS_ENTRY_INVALID');
  });

  it('supports empty manifests, rejects authority inflation and serializes sanitized metadata', () => {
    const source = sourceDocument();
    const empty = resolveP15ElementorButtonIconBasics(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_ICON_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);

    const raw = manifest(source, [{
      sourceNodeId: 'button',
      selectedIcon: { value: 'fab fa-github', library: 'fa-brands' },
      iconAlign: 'row',
      iconIndentPx: 12.5,
    }]);

    for (const inflation of [
      { styleInferencePerformed: true },
      { responsiveInferencePerformed: true },
      { iconInferencePerformed: true },
      { svgImportPerformed: true },
      { figmaMutation: true },
      { networkAccess: true },
      { targetCompatibilityClaim: true },
      { productionAcceptance: true },
      { downloadEnabled: true },
    ]) {
      expect(resolveP15ElementorButtonIconBasics(source, { ...raw, ...inflation })
        .issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_ICON_BASICS_AUTHORITY_FLAGS_INVALID');
    }

    const result = resolveP15ElementorButtonIconBasics(source, raw);
    const serialized = serializeP15ElementorButtonIconBasicsSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/private');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"selectedIconSettingKey": "selected_icon"');
    expect(serialized).toContain('"iconAlignSettingKey": "icon_align"');
    expect(serialized).toContain('"iconIndentSettingKey": "icon_indent"');

    const inflated = {
      ...result,
      svgImportPerformed: true,
    } as unknown as P15ElementorButtonIconBasicsResultV1;
    expect(() => serializeP15ElementorButtonIconBasicsSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
