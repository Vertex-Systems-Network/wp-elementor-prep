import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as overlay from '../src/targets/elementor/container-overlay-visual-composition';
import { P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION, resolveP15ElementorContainerOverlayColor } from '../src/targets/elementor/container-overlay-color-resolution';
import { bindP15NeutralSourceToGeneratedContainers, cloneP15ReadyElementorTemplate } from '../src/targets/elementor/responsive-container-binding';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import type { P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { buildCorpus, sourceDocument } from './golden/m1-container-family-corpus';

/**
 * Overlay visual target repair (recovery M1.5f) against the v1 write baseline. The v2 writes must be
 * exactly the v1 writes plus the documented Elementor 4.2.4 encoding: the popover starter
 * `<group>_css_filter: 'custom'` and px sliders, on top of the exact overlay-colour prerequisite.
 * Every case whose acceptance changes is listed with its reason.
 */
const FLAGS = { responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
  targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false };
const source = sourceDocument();
const generation = generateElementorV3TemplateCandidate(source);
const baseDigest = buildElementorTemplateCandidateIdentity(generation.candidate!).digest;
const overlayColorManifest = { schemaVersion: 1, manifestVersion: P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION,
  sourceIrFingerprint: fingerprintP15NeutralExportDocument(source), baseCandidateIdentityDigest: baseDigest,
  containers: [{ sourceNodeId: 'root', color: '#112233' }, { sourceNodeId: 'nested', color: '#445566' }], ...FLAGS };
const prerequisite = resolveP15ElementorContainerOverlayColor(source, overlayColorManifest);

function cases() {
  return buildCorpus({
    manifestVersion: overlay.P15_ELEMENTOR_CONTAINER_OVERLAY_VISUAL_MANIFEST_VERSION, extraFlags: ['styleInferencePerformed'],
    tabletValid: { blendMode: 'multiply', normal: { blur: 2, brightness: 150 } },
    mobileValid: { hover: { hue: 90, saturate: 50 } },
    invalidValues: [{ blendMode: 'difference' }, { normal: { blur: 11 } }, { hover: { contrast: -1 } }, { normal: { opacity: 1 } }, { normal: null }, { normal: {} }],
  }).map((testCase) => {
    if (testCase.manifest === null || typeof testCase.manifest !== 'object' || Array.isArray(testCase.manifest)) return testCase;
    const { baseCandidateIdentityDigest, ...rest } = testCase.manifest as Record<string, unknown>;
    return { ...testCase, manifest: { ...rest,
      overlayColorCandidateIdentityDigest: baseCandidateIdentityDigest === baseDigest ? prerequisite.resolvedCandidateIdentityDigest : baseCandidateIdentityDigest } };
  });
}

const REFUSED_NOW: Readonly<Record<string, string>> = {
  'manifest-extra-key': 'unknown manifest fields are refused', 'manifest-missing-key': 'missing manifest fields are refused',
  'manifest-wrong-schema': 'unsupported schemaVersion is refused', 'fingerprint-malformed': 'the source fingerprint is bound',
  'fingerprint-mismatch': 'the source fingerprint is bound', 'base-digest-malformed': 'the overlay-colour candidate digest is bound',
  'base-digest-mismatch': 'the overlay-colour candidate digest is bound', 'entry-unknown-key': 'unknown entry keys are refused',
  'entry-invalid-value-5': 'an empty filter object is refused',
  ...Object.fromEntries(['responsiveInferencePerformed', 'figmaMutation', 'networkAccess', 'responsiveClosureClaim', 'targetCompatibilityClaim',
    'productionAcceptance', 'downloadEnabled'].map((flag) => [`authority-${flag}`, 'authority inflation is refused'])),
};

/** The documented v1 → v2 change: px sliders, the popover starter, and the overlay-colour prerequisite's own keys. */
function expectedV2(v1: Record<string, Record<string, unknown>>): Record<string, Record<string, unknown>> {
  const withOverlay = Object.fromEntries([...bindP15NeutralSourceToGeneratedContainers(source, prerequisite.template!).containers]
    .map(([id, node]) => [id, node.settings as Record<string, unknown>]));
  return Object.fromEntries(Object.entries(v1).map(([id, settings]) => {
    const out: Record<string, unknown> = { ...withOverlay[id] };
    for (const [key, value] of Object.entries(settings)) {
      const group = /^(css_filters(?:_hover)?)_(blur|brightness|contrast|saturate|hue)$/.exec(key);
      if (group) {
        out[`${group[1]}_css_filter`] = 'custom';
        out[key] = { unit: 'px', size: (value as { size: number }).size, sizes: [] };
      } else out[key] = value;
    }
    return [id, out];
  }));
}

describe('recovery M1.5f — overlay visual target repair against the v1 write baseline', () => {
  it('v2 writes are the v1 writes plus the documented Elementor encoding; every acceptance change is listed', () => {
    const golden = JSON.parse(readFileSync('tests/golden/m1-container-overlay-visual-writes.golden.json', 'utf8')) as Array<{ name: string; accepted: boolean; settings: Record<string, Record<string, unknown>> | null }>;
    // v1 carried no styleInferencePerformed flag; v2 refuses it set to true, and the rest of the corpus lines up with v1.
    const all = cases();
    const inflated = all.find((testCase) => testCase.name === 'authority-styleInferencePerformed')!;
    expect(overlay.resolveP15ElementorContainerOverlayVisuals(inflated.source, overlayColorManifest, inflated.manifest).status).toBe('REJECTED_INVALID_MANIFEST');
    const list = all.filter((testCase) => testCase !== inflated);
    expect(list.map((testCase) => testCase.name)).toEqual(golden.map((record) => record.name));
    let compared = 0;
    list.forEach((testCase, index) => {
      const original = golden[index]!;
      const result = overlay.resolveP15ElementorContainerOverlayVisuals(testCase.source, overlayColorManifest, testCase.manifest);
      const accepted = result.status === 'CONTAINER_OVERLAY_VISUALS_RESOLVED' || result.status === 'NO_CONTAINER_OVERLAY_VISUAL_OVERRIDES';
      if (REFUSED_NOW[testCase.name]) {
        expect(original.accepted, testCase.name).toBe(true);
        expect(accepted, testCase.name).toBe(false);
        return;
      }
      expect(accepted, testCase.name).toBe(original.accepted);
      if (!accepted || result.status === 'NO_CONTAINER_OVERLAY_VISUAL_OVERRIDES') return;
      const settings = Object.fromEntries([...bindP15NeutralSourceToGeneratedContainers(testCase.source as P15NeutralExportDocumentV1, result.template!).containers]
        .map(([id, node]) => [id, node.settings as Record<string, unknown>]));
      expect(settings, testCase.name).toEqual(expectedV2(original.settings!));
      expect(cloneP15ReadyElementorTemplate(result.candidate!)).toEqual(result.template);
      compared += 1;
    });
    expect(compared).toBe(3);
  });
});
