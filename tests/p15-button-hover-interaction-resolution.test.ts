import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS,
  P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE,
  P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION,
  resolveP15ElementorButtonHoverInteractions,
  serializeP15ElementorButtonHoverInteractionSummary,
  type P15ElementorButtonHoverInteractionManifestV1,
  type P15ElementorButtonHoverInteractionResultV1,
} from '../src/targets/elementor/button-hover-interaction-resolution';
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
    title: 'Button hover interaction private source',
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
  buttons: P15ElementorButtonHoverInteractionManifestV1['buttons'],
): P15ElementorButtonHoverInteractionManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION,
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

describe('P15 Fast Batch Button hover interaction resolution', () => {
  it('resolves bounded box shadow with exact group-prefixed keys only', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonHoverInteractions(source, manifest(source, [{
      sourceNodeId: 'button',
      boxShadow: { horizontal: 4, vertical: 6, blur: 12, spread: 0, color: '#1a2b3c', position: 'outline' },
    }]));
    expect(P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.boxShadowGroupSourceBlobSha)
      .toBe('1c068c900db0ff2593089028d67fb6d897dbaa33');
    expect(P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.boxShadowControlSourceBlobSha)
      .toBe('e55cf9af34db5cc3e73dc295cd9f35b437da6fa7');
    expect(P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.groupBaseSourceBlobSha)
      .toBe('6117c06b286dbec336eefe63475c747e2fda0234');
    expect(result.status).toBe('BUTTON_HOVER_INTERACTIONS_RESOLVED');
    const settings = settingsOf(result.template?.content[0]?.elements[0]);
    expect(settings.text).toBe('PRIVATE BUTTON COPY');
    expect(settings.align).toBe('left');
    expect(settings.button_hover_box_shadow_box_shadow_type).toBe('yes');
    expect(settings.button_hover_box_shadow_box_shadow).toEqual({
      horizontal: 4, vertical: 6, blur: 12, spread: 0, color: '#1a2b3c',
    });
    expect(settings.button_hover_box_shadow_box_shadow_position).toBe(' ');
    expect(settings).not.toHaveProperty('hover_color');
    expect(settings).not.toHaveProperty('button_background_hover_color');
    expect(settings).not.toHaveProperty('button_hover_border_color');
    expect(settings).not.toHaveProperty('button_hover_transition_duration');
    expect(settings).not.toHaveProperty('hover_animation');
  });

  it('resolves transition seconds into canonical Elementor slider and preserves exact link binding', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorButtonHoverInteractions(source, manifest(source, [{
      sourceNodeId: 'linked-button', transitionSeconds: 0.35,
    }]));
    expect(result.status).toBe('BUTTON_HOVER_INTERACTIONS_RESOLVED');
    const root = result.template?.content[0];
    expect(settingsOf(root?.elements[0])).not.toHaveProperty('button_hover_transition_duration');
    const linked = settingsOf(root?.elements[2]?.elements[0]);
    expect(linked.link).toEqual({
      url: 'https://example.com/path', is_external: 'on', nofollow: 'on', custom_attributes: '',
    });
    expect(linked.button_hover_transition_duration).toEqual({ unit: 's', size: 0.35, sizes: [] });
  });

  it('supports only Elementor 4.2.4 core hover animations and writes the exact setting', () => {
    const source = sourceDocument();
    expect(P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS).toContain('grow');
    expect(P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS).toContain('buzz-out');
    const result = resolveP15ElementorButtonHoverInteractions(source, manifest(source, [{
      sourceNodeId: 'button', animation: 'grow',
    }]));
    expect(result.status).toBe('BUTTON_HOVER_INTERACTIONS_RESOLVED');
    expect(settingsOf(result.template?.content[0]?.elements[0]).hover_animation).toBe('grow');
    const filteredExtension = resolveP15ElementorButtonHoverInteractions(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button', animation: 'vendor-custom-hover' }],
    });
    expect(filteredExtension.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_INTERACTION_ANIMATION_INVALID');
  });

  it('can apply all three batch capabilities together and remains deterministic', () => {
    const source = sourceDocument();
    const batch = manifest(source, [
      { sourceNodeId: 'linked-button', animation: 'buzz-out', transitionSeconds: 0.2 },
      {
        sourceNodeId: 'button',
        boxShadow: { horizontal: -5, vertical: 8, blur: 20, spread: -2, color: '#abcdef', position: 'inset' },
        transitionSeconds: 1,
        animation: 'pulse-grow',
      },
    ]);
    const first = resolveP15ElementorButtonHoverInteractions(source, batch);
    const second = resolveP15ElementorButtonHoverInteractions(source, batch);
    expect(first).toEqual(second);
    expect(first.resolvedInteractions.map((entry) => entry.sourceNodeId))
      .toEqual(['button', 'linked-button']);
    const settings = settingsOf(first.template?.content[0]?.elements[0]);
    expect(settings.button_hover_box_shadow_box_shadow_position).toBe('inset');
    expect(settings.button_hover_transition_duration).toEqual({ unit: 's', size: 1, sizes: [] });
    expect(settings.hover_animation).toBe('pulse-grow');
    const empty = resolveP15ElementorButtonHoverInteractions(source, manifest(source, []));
    expect(empty.status).toBe('NO_BUTTON_HOVER_INTERACTION_OVERRIDES');
    expect(empty.baseCandidateIdentityDigest).toBe(empty.resolvedCandidateIdentityDigest);
  });

  it('fails closed for stale replay, non-Button ids, unknown fields and invalid bounded values', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'button', animation: 'grow' }]);
    const staleSource = resolveP15ElementorButtonHoverInteractions(source, {
      ...valid, sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_INTERACTION_SOURCE_FINGERPRINT_MISMATCH');
    const staleCandidate = resolveP15ElementorButtonHoverInteractions(source, {
      ...valid, baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_INTERACTION_BASE_CANDIDATE_IDENTITY_MISMATCH');
    const nonButton = resolveP15ElementorButtonHoverInteractions(source, manifest(source, [{
      sourceNodeId: 'heading', animation: 'grow',
    }]));
    expect(nonButton.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_INTERACTION_SOURCE_NOT_BUTTON');
    const unknown = resolveP15ElementorButtonHoverInteractions(source, {
      ...manifest(source, []),
      buttons: [{ sourceNodeId: 'button', animation: 'grow', hoverColor: '#123456' }],
    });
    expect(unknown.issues.map((issue) => issue.code))
      .toContain('P15_BUTTON_HOVER_INTERACTION_ENTRY_INVALID');

    for (const boxShadow of [
      { horizontal: -101, vertical: 0, blur: 10, spread: 0, color: '#123456', position: 'outline' },
      { horizontal: 0, vertical: 101, blur: 10, spread: 0, color: '#123456', position: 'outline' },
      { horizontal: 0, vertical: 0, blur: -1, spread: 0, color: '#123456', position: 'outline' },
      { horizontal: 0, vertical: 0, blur: 10, spread: 101, color: '#123456', position: 'outline' },
      { horizontal: 0, vertical: 0, blur: 10, spread: 0, color: '#ABCDEF', position: 'outline' },
      { horizontal: 0, vertical: 0, blur: 10, spread: 0, color: 'rgba(0,0,0,.5)', position: 'outline' },
      { horizontal: 0, vertical: 0, blur: 10, spread: 0, color: '#123456', position: 'outside' },
    ]) {
      const invalid = resolveP15ElementorButtonHoverInteractions(source, {
        ...manifest(source, []), buttons: [{ sourceNodeId: 'button', boxShadow }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_HOVER_INTERACTION_BOX_SHADOW_INVALID');
    }

    for (const transitionSeconds of [-0.01, 10.01, Number.NaN, Number.POSITIVE_INFINITY, '0.2']) {
      const invalid = resolveP15ElementorButtonHoverInteractions(source, {
        ...manifest(source, []), buttons: [{ sourceNodeId: 'button', transitionSeconds }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_HOVER_INTERACTION_TRANSITION_INVALID');
    }
  });

  it('rejects authority inflation and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{
      sourceNodeId: 'button',
      boxShadow: { horizontal: 0, vertical: 2, blur: 8, spread: 0, color: '#123456', position: 'outline' },
      transitionSeconds: 0.25,
      animation: 'float',
    }]);
    for (const inflation of [
      { styleInferencePerformed: true },
      { responsiveInferencePerformed: true },
      { networkAccess: true },
      { targetCompatibilityClaim: true },
      { productionAcceptance: true },
      { downloadEnabled: true },
    ]) {
      const invalid = resolveP15ElementorButtonHoverInteractions(source, { ...raw, ...inflation });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_BUTTON_HOVER_INTERACTION_AUTHORITY_FLAGS_INVALID');
    }
    const result = resolveP15ElementorButtonHoverInteractions(source, raw);
    const serialized = serializeP15ElementorButtonHoverInteractionSummary(result);
    expect(serialized).not.toContain('PRIVATE BUTTON COPY');
    expect(serialized).not.toContain('https://example.com/path');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"boxShadowSettingKey": "button_hover_box_shadow_box_shadow"');
    expect(serialized).toContain('"transitionSettingKey": "button_hover_transition_duration"');
    expect(serialized).toContain('"animationSettingKey": "hover_animation"');
    const inflatedResult = { ...result, networkAccess: true } as unknown as P15ElementorButtonHoverInteractionResultV1;
    expect(() => serializeP15ElementorButtonHoverInteractionSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
