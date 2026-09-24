import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE,
  P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION,
  resolveP15ElementorButtonVisualDepthRadius,
  serializeP15ElementorButtonVisualDepthRadiusSummary,
  type P15ElementorButtonVisualDepthRadiusManifestV1,
  type P15ElementorButtonVisualDepthRadiusResultV1,
} from '../src/targets/elementor/button-visual-depth-radius-resolution';
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
    title: 'Button visual depth private source',
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
            url: 'https://example.com/path',
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
  buttons: P15ElementorButtonVisualDepthRadiusManifestV1['buttons'],
): P15ElementorButtonVisualDepthRadiusManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION,
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
  if (typeof element !== 'object' || element === null || Array.isArray(element)) throw new Error('expected element object');
  const settings = (element as Record<string, unknown>).settings;
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) throw new Error('expected settings object');
  return settings as Record<string, unknown>;
}

describe('P15 Fast Batch Button visual depth and radius', () => {
  it('writes exact normal text-shadow group keys only', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonVisualDepthRadius(source, manifest(source, [{
      sourceNodeId: 'button',
      textShadow: { horizontal: 2, vertical: -3, blur: 8, color: '#1a2b3c' },
    }]));

    expect(P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.textShadowGroupSourceBlobSha)
      .toBe('d587b60ada0e4303e8168b334354c8c04fcccd84');
    expect(P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.textShadowControlSourceBlobSha)
      .toBe('c6d9615d280e20de8356a90351f95d8a36c18d2f');

    expect(result.status).toBe('BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.text_shadow_text_shadow_type).toBe('yes');
    expect(settings.text_shadow_text_shadow).toEqual({
      horizontal: 2,
      vertical: -3,
      blur: 8,
      color: '#1a2b3c',
    });
    expect(settings).not.toHaveProperty('button_box_shadow_box_shadow');
    expect(settings).not.toHaveProperty('border_radius');
    expect(settings).not.toHaveProperty('text_padding');
  });

  it('writes exact normal box-shadow group keys with bounded position', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonVisualDepthRadius(source, manifest(source, [{
      sourceNodeId: 'button',
      boxShadow: {
        horizontal: 5,
        vertical: 7,
        blur: 16,
        spread: -2,
        color: '#abcdef',
        position: 'inset',
      },
    }]));

    expect(result.status).toBe('BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.button_box_shadow_box_shadow_type).toBe('yes');
    expect(settings.button_box_shadow_box_shadow).toEqual({
      horizontal: 5,
      vertical: 7,
      blur: 16,
      spread: -2,
      color: '#abcdef',
    });
    expect(settings.button_box_shadow_box_shadow_position).toBe('inset');
    expect(settings).not.toHaveProperty('button_hover_box_shadow_box_shadow');
  });

  it('writes explicit desktop tablet mobile radius without responsive inference', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonVisualDepthRadius(source, manifest(source, [{
      sourceNodeId: 'button',
      borderRadiusPx: { desktop: 12, tablet: 10, mobile: 8 },
    }]));

    expect(result.status).toBe('BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.border_radius).toEqual({
      unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true,
    });
    expect(settings.border_radius_tablet).toEqual({
      unit: 'px', top: '10', right: '10', bottom: '10', left: '10', isLinked: true,
    });
    expect(settings.border_radius_mobile).toEqual({
      unit: 'px', top: '8', right: '8', bottom: '8', left: '8', isLinked: true,
    });
    expect(result.responsiveInferencePerformed).toBe(false);
  });

  it('applies all three capabilities together deterministically and preserves link binding', () => {
    const source = sourceDocument();
    const batch = manifest(source, [{
      sourceNodeId: 'linked-button',
      textShadow: { horizontal: 1, vertical: 1, blur: 4, color: '#112233' },
      boxShadow: { horizontal: 0, vertical: 4, blur: 12, spread: 0, color: '#445566', position: 'outline' },
      borderRadiusPx: { desktop: 20, tablet: 16, mobile: 12 },
    }]);

    const first = resolveP15ElementorButtonVisualDepthRadius(source, batch);
    const second = resolveP15ElementorButtonVisualDepthRadius(source, batch);
    expect(first).toEqual(second);
    const linked = settingsOf(first.template?.content[0]?.elements[2]?.elements[0]);
    expect(linked.link).toEqual({
      url: 'https://example.com/path',
      is_external: 'on',
      nofollow: 'on',
      custom_attributes: '',
    });
    expect(linked.align).toBe('right');
    expect(linked.text_shadow_text_shadow_type).toBe('yes');
    expect(linked.button_box_shadow_box_shadow_type).toBe('yes');
    expect(linked.border_radius_mobile).toEqual({
      unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true,
    });
  });

  it('rejects stale replay, non-Button ids, unknown fields and invalid bounded shadow/radius values', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{
      sourceNodeId: 'button',
      borderRadiusPx: { desktop: 12, tablet: 10, mobile: 8 },
    }]);

    expect(resolveP15ElementorButtonVisualDepthRadius(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_FINGERPRINT_MISMATCH');

    expect(resolveP15ElementorButtonVisualDepthRadius(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_VISUAL_DEPTH_RADIUS_BASE_CANDIDATE_IDENTITY_MISMATCH');

    expect(resolveP15ElementorButtonVisualDepthRadius(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'heading', borderRadiusPx: { desktop: 1, tablet: 1, mobile: 1 } }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_NOT_BUTTON');

    expect(resolveP15ElementorButtonVisualDepthRadius(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button', borderRadiusPx: { desktop: 1, tablet: 1, mobile: 1 }, paddingPx: 4 }],
    }).issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_VISUAL_DEPTH_RADIUS_ENTRY_INVALID');

    for (const textShadow of [
      { horizontal: -101, vertical: 0, blur: 1, color: '#123456' },
      { horizontal: 0, vertical: 101, blur: 1, color: '#123456' },
      { horizontal: 0, vertical: 0, blur: -1, color: '#123456' },
      { horizontal: 0, vertical: 0, blur: 1, color: '#ABCDEF' },
    ]) {
      expect(resolveP15ElementorButtonVisualDepthRadius(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', textShadow }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_VISUAL_DEPTH_RADIUS_TEXT_SHADOW_INVALID');
    }

    for (const boxShadow of [
      { horizontal: 0, vertical: 0, blur: 1, spread: 101, color: '#123456', position: 'outline' },
      { horizontal: 0, vertical: 0, blur: 1, spread: 0, color: '#123456', position: 'outside' },
    ]) {
      expect(resolveP15ElementorButtonVisualDepthRadius(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', boxShadow }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_VISUAL_DEPTH_RADIUS_BOX_SHADOW_INVALID');
    }

    for (const borderRadiusPx of [
      { desktop: -1, tablet: 0, mobile: 0 },
      { desktop: 4097, tablet: 0, mobile: 0 },
      { desktop: 1, tablet: 1.5, mobile: 1 },
      { desktop: 1, tablet: 1 },
    ]) {
      expect(resolveP15ElementorButtonVisualDepthRadius(source, {
        ...manifest(source, []),
        buttons: [{ sourceNodeId: 'button', borderRadiusPx }],
      }).issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_VISUAL_DEPTH_RADIUS_RADIUS_INVALID');
    }
  });

  it('supports empty manifests, rejects authority inflation and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const empty = resolveP15ElementorButtonVisualDepthRadius(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_VISUAL_DEPTH_RADIUS_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);

    const raw = manifest(source, [{
      sourceNodeId: 'button',
      textShadow: { horizontal: 0, vertical: 1, blur: 4, color: '#123456' },
      borderRadiusPx: { desktop: 10, tablet: 8, mobile: 6 },
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
      expect(resolveP15ElementorButtonVisualDepthRadius(source, { ...raw, ...inflation })
        .issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_VISUAL_DEPTH_RADIUS_AUTHORITY_FLAGS_INVALID');
    }

    const result = resolveP15ElementorButtonVisualDepthRadius(source, raw);
    const serialized = serializeP15ElementorButtonVisualDepthRadiusSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/path');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"textShadowSettingKey": "text_shadow_text_shadow"');
    expect(serialized).toContain('"boxShadowSettingKey": "button_box_shadow_box_shadow"');
    expect(serialized).toContain('"borderRadiusTabletSettingKey": "border_radius_tablet"');

    const inflated = { ...result, networkAccess: true } as unknown as P15ElementorButtonVisualDepthRadiusResultV1;
    expect(() => serializeP15ElementorButtonVisualDepthRadiusSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
